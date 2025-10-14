"use strict";
/**
 * DAK Component Object
 * Object-oriented interface for managing DAK component instances
 * Handles retrieval (staging ground, remote), saving, and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDAKComponentObject = void 0;
/**
 * Base implementation for DAK Component Objects
 * Provides common functionality for all 9 components
 */
class BaseDAKComponentObject {
    constructor(componentType, repository, sourceResolver, stagingGroundService, // Will be typed properly
    onSourcesChanged) {
        this.componentType = componentType;
        this.repository = repository;
        this.sourceResolver = sourceResolver;
        this.stagingGroundService = stagingGroundService;
        this.sources = [];
        this.cache = new Map();
        this.onSourcesChanged = onSourcesChanged;
    }
    /** Get all sources for this component */
    getSources() {
        return [...this.sources];
    }
    /** Add a source to this component */
    async addSource(source) {
        // Validate source first
        const validation = this.sourceResolver.validateSource(source);
        if (!validation.isValid) {
            throw new Error(`Invalid source: ${validation.errors.join(', ')}`);
        }
        this.sources.push(source);
        await this.syncSources();
    }
    /** Update a source at index */
    async updateSource(index, updates) {
        if (index < 0 || index >= this.sources.length) {
            throw new Error(`Invalid source index: ${index}`);
        }
        this.sources[index] = { ...this.sources[index], ...updates };
        await this.syncSources();
    }
    /** Remove a source at index */
    async removeSource(index) {
        if (index < 0 || index >= this.sources.length) {
            throw new Error(`Invalid source index: ${index}`);
        }
        this.sources.splice(index, 1);
        await this.syncSources();
    }
    /** Retrieve and resolve all instance data from all sources */
    async retrieveAll() {
        const allData = [];
        for (let i = 0; i < this.sources.length; i++) {
            const source = this.sources[i];
            try {
                const resolved = await this.sourceResolver.resolveSource(source, this.repository);
                allData.push(resolved.data);
                // Cache the data if it has an ID
                const data = resolved.data;
                if (data && data.id) {
                    this.cache.set(data.id, resolved.data);
                }
            }
            catch (error) {
                console.error(`Failed to resolve source ${i} for ${this.componentType}:`, error);
                // Continue with other sources
            }
        }
        return allData;
    }
    /** Retrieve single instance by ID */
    async retrieveById(id) {
        // Check cache first
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        // Retrieve all and find by ID
        const allData = await this.retrieveAll();
        const found = allData.find((data) => data.id === id);
        if (found) {
            this.cache.set(id, found);
        }
        return found || null;
    }
    /** Save instance data */
    async save(data, options = {}) {
        const { path, inline = false, message = `Update ${this.componentType}`, updateExisting = true } = options;
        // Determine how to save
        if (inline) {
            // Save as inline data in dak.json
            await this.saveInline(data, updateExisting);
        }
        else if (path) {
            // Save to file in repository
            await this.saveToFile(data, path, message);
        }
        else {
            // Auto-determine path and save
            const autoPath = await this.determineFilePath(data);
            await this.saveToFile(data, autoPath, message);
        }
    }
    /** Validate instance data */
    async validate(data) {
        // Default validation - subclasses can override
        const errors = [];
        const warnings = [];
        // Check for required ID
        const dataWithId = data;
        if (!dataWithId.id) {
            warnings.push({
                code: 'MISSING_ID',
                message: 'Instance data should have an id property'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    /** Validate all instances */
    async validateAll() {
        const allData = await this.retrieveAll();
        const results = [];
        for (const data of allData) {
            results.push(await this.validate(data));
        }
        return results;
    }
    // ============================================================================
    // Private helper methods
    // ============================================================================
    /**
     * Save as inline instance data in source
     */
    async saveInline(data, updateExisting) {
        if (updateExisting) {
            // Find existing inline source and update
            const inlineIndex = this.sources.findIndex(s => s.instance !== undefined);
            if (inlineIndex >= 0) {
                await this.updateSource(inlineIndex, { instance: data });
                return;
            }
        }
        // Add new inline source
        await this.addSource({
            instance: data,
            metadata: {
                addedAt: new Date().toISOString(),
                addedBy: 'sgex-workbench',
                sourceType: 'inline'
            }
        });
    }
    /**
     * Save to file in repository
     */
    async saveToFile(data, path, message) {
        // Serialize data to file format
        const content = this.serializeToFile(data);
        // Save to staging ground
        await this.stagingGroundService.updateFile(path, content, {
            message,
            componentType: this.componentType
        });
        // Update or add source with relative URL
        const existingIndex = this.sources.findIndex(s => s.url === path);
        if (existingIndex >= 0) {
            await this.updateSource(existingIndex, {
                url: path,
                metadata: {
                    ...this.sources[existingIndex].metadata,
                    lastValidated: new Date().toISOString()
                }
            });
        }
        else {
            await this.addSource({
                url: path,
                metadata: {
                    addedAt: new Date().toISOString(),
                    addedBy: 'sgex-workbench',
                    sourceType: 'url-relative'
                }
            });
        }
        // Update cache
        const dataWithId = data;
        if (dataWithId.id) {
            this.cache.set(dataWithId.id, data);
        }
    }
    /**
     * Sync sources to parent DAK object
     */
    async syncSources() {
        if (this.onSourcesChanged) {
            await this.onSourcesChanged(this.sources);
        }
    }
    /**
     * Initialize sources (called by DAK Object when loading)
     */
    initializeSources(sources) {
        this.sources = sources;
    }
}
exports.BaseDAKComponentObject = BaseDAKComponentObject;
//# sourceMappingURL=dakComponentObject.js.map