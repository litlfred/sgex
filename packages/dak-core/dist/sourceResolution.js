"use strict";
/**
 * Source Resolution Service
 * Handles resolution of different DAK component source types:
 * - Canonical IRI references
 * - Absolute URLs
 * - Relative URLs (relative to input/ directory)
 * - Inline data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceResolutionService = void 0;
class SourceResolutionService {
    constructor(cacheTTL) {
        this.cache = new Map();
        this.cacheTTL = 300000; // 5 minutes default
        if (cacheTTL) {
            this.cacheTTL = cacheTTL;
        }
    }
    /**
     * Resolve a component source to its data
     */
    async resolveSource(source, repositoryContext) {
        const sourceType = this.determineSourceType(source);
        const cacheKey = this.getCacheKey(source, repositoryContext);
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return {
                data: cached,
                source,
                resolutionMethod: 'cache',
                resolvedAt: new Date()
            };
        }
        let data;
        let resolutionMethod;
        try {
            switch (sourceType) {
                case 'canonical':
                    data = await this.resolveCanonical(source.canonical);
                    resolutionMethod = 'canonical';
                    break;
                case 'url-absolute':
                    data = await this.resolveAbsoluteUrl(source.url);
                    resolutionMethod = 'url-absolute';
                    break;
                case 'url-relative':
                    data = await this.resolveRelativeUrl(source.url, repositoryContext);
                    resolutionMethod = 'url-relative';
                    break;
                case 'inline':
                    data = this.resolveInline(source.data);
                    resolutionMethod = 'inline';
                    break;
                default:
                    throw new Error(`Unable to determine source type for source: ${JSON.stringify(source)}`);
            }
            // Cache the result
            this.addToCache(cacheKey, data);
            return {
                data,
                source,
                resolutionMethod,
                resolvedAt: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to resolve source (type: ${sourceType}): ${error}`);
        }
    }
    /**
     * Determine source type from source object
     */
    determineSourceType(source) {
        // Priority order: inline > relative URL > absolute URL > canonical
        if (source.data !== undefined) {
            return 'inline';
        }
        if (source.url) {
            // Check if URL is absolute
            try {
                new URL(source.url);
                return 'url-absolute';
            }
            catch {
                // Relative URL
                return 'url-relative';
            }
        }
        if (source.canonical) {
            return 'canonical';
        }
        throw new Error('Source must have at least one of: canonical, url, or data');
    }
    /**
     * Validate a source
     */
    validateSource(source) {
        const errors = [];
        const warnings = [];
        let sourceType;
        try {
            sourceType = this.determineSourceType(source);
        }
        catch (error) {
            errors.push(`${error}`);
            return {
                isValid: false,
                sourceType: 'inline', // Default
                errors,
                warnings
            };
        }
        // Type-specific validation
        switch (sourceType) {
            case 'canonical':
                if (!this.isValidUrl(source.canonical)) {
                    errors.push(`Invalid canonical IRI: ${source.canonical}`);
                }
                break;
            case 'url-absolute':
                if (!this.isValidUrl(source.url)) {
                    errors.push(`Invalid absolute URL: ${source.url}`);
                }
                break;
            case 'url-relative':
                if (!this.isValidRelativePath(source.url)) {
                    errors.push(`Invalid relative URL: ${source.url}`);
                }
                break;
            case 'inline':
                if (source.data === null || source.data === undefined) {
                    errors.push('Inline data cannot be null or undefined');
                }
                break;
        }
        return {
            isValid: errors.length === 0,
            sourceType,
            errors,
            warnings
        };
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Clear cache for specific source
     */
    clearCacheForSource(source, repositoryContext) {
        const key = this.getCacheKey(source, repositoryContext);
        this.cache.delete(key);
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    /**
     * Resolve canonical IRI reference
     */
    async resolveCanonical(canonical) {
        // For now, fetch from the canonical URL
        // TODO: Add specific handling for IRIS publications
        const response = await fetch(canonical);
        if (!response.ok) {
            throw new Error(`Failed to fetch canonical resource: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json();
        }
        else {
            // Return as text if not JSON
            const text = await response.text();
            return text;
        }
    }
    /**
     * Resolve absolute URL
     */
    async resolveAbsoluteUrl(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json();
        }
        else {
            // Return as text if not JSON
            const text = await response.text();
            return text;
        }
    }
    /**
     * Resolve relative URL (relative to input/ directory)
     * This will need to be implemented differently for browser vs Node.js
     */
    async resolveRelativeUrl(url, repositoryContext) {
        // Construct full path: owner/repo/input/url
        const fullPath = `input/${url}`;
        // This needs GitHub API access or staging ground access
        // For now, throw error indicating this needs implementation
        throw new Error(`Relative URL resolution not yet implemented. ` +
            `Path: ${fullPath} in ${repositoryContext.owner}/${repositoryContext.repo}/${repositoryContext.branch || 'main'}`);
    }
    /**
     * Return inline data directly
     */
    resolveInline(data) {
        return data;
    }
    /**
     * Generate cache key
     */
    getCacheKey(source, repositoryContext) {
        const type = this.determineSourceType(source);
        const sourceKey = source.canonical || source.url || JSON.stringify(source.data);
        const repoKey = `${repositoryContext.owner}/${repositoryContext.repo}/${repositoryContext.branch || 'main'}`;
        return `${type}:${repoKey}:${sourceKey}`;
    }
    /**
     * Get from cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }
        // Check if expired
        if (Date.now() - cached.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    /**
     * Add to cache
     */
    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    /**
     * Validate URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate relative path
     */
    isValidRelativePath(path) {
        // Basic validation - no absolute paths, no ".."
        if (path.startsWith('/') || path.startsWith('\\')) {
            return false;
        }
        if (path.includes('..')) {
            return false;
        }
        return true;
    }
}
exports.SourceResolutionService = SourceResolutionService;
//# sourceMappingURL=sourceResolution.js.map