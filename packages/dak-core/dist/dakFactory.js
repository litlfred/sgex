"use strict";
/**
 * DAK Factory Service
 * Factory for creating DAK objects from repositories
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKFactory = void 0;
const dakObject_1 = require("./dakObject");
class DAKFactory {
    constructor(sourceResolver, stagingGroundService) {
        this.sourceResolver = sourceResolver;
        this.stagingGroundService = stagingGroundService;
    }
    /**
     * Create DAK object from repository
     */
    async createFromRepository(owner, repo, branch = 'main') {
        const repository = { owner, repo, branch };
        // Try to load existing dak.json from staging ground or repository
        const dakJson = await this.loadDakJson(repository);
        return new dakObject_1.DAKObject(repository, this.sourceResolver, this.stagingGroundService, dakJson);
    }
    /**
     * Create DAK object from existing dak.json
     */
    async createFromDakJson(dakJson, repository) {
        return new dakObject_1.DAKObject(repository, this.sourceResolver, this.stagingGroundService, dakJson);
    }
    /**
     * Initialize empty DAK object for new repository
     */
    createEmpty(repository, metadata) {
        const emptyDak = {
            resourceType: 'DAK',
            id: metadata?.id || `${repository.owner}.${repository.repo}`,
            name: metadata?.name || repository.repo,
            title: metadata?.title || repository.repo,
            description: metadata?.description || '',
            version: metadata?.version || '0.1.0',
            status: metadata?.status || 'draft',
            publicationUrl: metadata?.publicationUrl || '',
            license: metadata?.license || 'CC-BY-4.0',
            copyrightYear: metadata?.copyrightYear || new Date().getFullYear().toString(),
            publisher: metadata?.publisher || { name: repository.owner, url: '' }
        };
        return new dakObject_1.DAKObject(repository, this.sourceResolver, this.stagingGroundService, emptyDak);
    }
    async loadDakJson(repository) {
        // Try staging ground first
        try {
            const staged = await this.stagingGroundService.getFile('dak.json');
            if (staged && staged.content) {
                return JSON.parse(staged.content);
            }
        }
        catch (error) {
            // Staging ground file not found, continue
        }
        // Try remote repository - would need GitHub service integration
        // For now, return undefined
        return undefined;
    }
}
exports.DAKFactory = DAKFactory;
//# sourceMappingURL=dakFactory.js.map