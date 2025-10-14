"use strict";
/**
 * DAK Factory Service
 * Factory for creating DAK objects from repositories
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKFactory = void 0;
const dakObject_1 = require("./dakObject");
const stagingGroundIntegration_1 = require("./stagingGroundIntegration");
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
        // Create staging ground integration
        const stagingGroundIntegration = new stagingGroundIntegration_1.StagingGroundIntegrationService(this.stagingGroundService, repository, branch);
        // Try to load existing dak.json from staging ground or repository
        const dakJson = await stagingGroundIntegration.loadDakJson();
        return new dakObject_1.DAKObject(repository, this.sourceResolver, stagingGroundIntegration, dakJson || undefined);
    }
    /**
     * Create DAK object from existing dak.json
     */
    async createFromDakJson(dakJson, repository) {
        // Create staging ground integration
        const stagingGroundIntegration = new stagingGroundIntegration_1.StagingGroundIntegrationService(this.stagingGroundService, repository, repository.branch || 'main');
        return new dakObject_1.DAKObject(repository, this.sourceResolver, stagingGroundIntegration, dakJson);
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
        // Create staging ground integration
        const stagingGroundIntegration = new stagingGroundIntegration_1.StagingGroundIntegrationService(this.stagingGroundService, repository, repository.branch || 'main');
        return new dakObject_1.DAKObject(repository, this.sourceResolver, stagingGroundIntegration, emptyDak);
    }
}
exports.DAKFactory = DAKFactory;
//# sourceMappingURL=dakFactory.js.map