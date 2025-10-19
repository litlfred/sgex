/**
 * Source Resolution Service
 * Handles resolution of different DAK component source types:
 * - Canonical IRI references
 * - Absolute URLs
 * - Relative URLs (relative to input/ directory)
 * - Inline data
 */
import { DAKComponentSource, ResolvedSource, SourceValidationResult, DAKRepository } from './types';
export declare class SourceResolutionService {
    private cache;
    private cacheTTL;
    constructor(cacheTTL?: number);
    /**
     * Resolve a component source to its data
     */
    resolveSource<T>(source: DAKComponentSource<T>, repositoryContext: DAKRepository): Promise<ResolvedSource<T>>;
    /**
     * Determine source type from source object
     */
    determineSourceType(source: DAKComponentSource<any>): 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
    /**
     * Validate a source
     */
    validateSource(source: DAKComponentSource<any>): SourceValidationResult;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Clear cache for specific source
     */
    clearCacheForSource(source: DAKComponentSource<any>, repositoryContext: DAKRepository): void;
    /**
     * Resolve canonical IRI reference
     */
    private resolveCanonical;
    /**
     * Resolve absolute URL
     */
    private resolveAbsoluteUrl;
    /**
     * Resolve relative URL (relative to input/ directory)
     * This will need to be implemented differently for browser vs Node.js
     */
    private resolveRelativeUrl;
    /**
     * Return inline instance data directly
     */
    private resolveInline;
    /**
     * Generate cache key
     */
    private getCacheKey;
    /**
     * Get from cache
     */
    private getFromCache;
    /**
     * Add to cache
     */
    private addToCache;
    /**
     * Validate URL
     */
    private isValidUrl;
    /**
     * Validate relative path
     */
    private isValidRelativePath;
}
