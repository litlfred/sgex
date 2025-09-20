"use strict";
/**
 * DAK Service
 * Core service for working with WHO SMART Guidelines Digital Adaptation Kits (DAKs)
 * Can point to local or remote GitHub repositories
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dakService = exports.DAKService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const types_1 = require("./types");
const validation_1 = require("./validation");
class DAKService {
    constructor() {
        this.validationService = new validation_1.DAKValidationService();
    }
    /**
     * Create a DAK instance from a local repository path
     */
    fromLocalRepository(repositoryPath) {
        return this.loadDAKFromPath(repositoryPath);
    }
    /**
     * Create a DAK instance from GitHub repository coordinates
     */
    fromGitHubRepository(owner, repo, branch = 'main') {
        return {
            owner,
            repo,
            branch,
            isValidDAK: undefined, // Will be validated asynchronously
            lastValidated: undefined
        };
    }
    /**
     * Validate a DAK repository
     */
    async validateRepository(dakRepo) {
        if (this.isLocalRepository(dakRepo)) {
            const repositoryPath = this.getLocalRepositoryPath(dakRepo);
            return await this.validationService.validateDAKRepository(repositoryPath);
        }
        else {
            throw new Error('Remote repository validation not yet implemented');
        }
    }
    /**
     * Load DAK metadata from repository
     */
    async loadMetadata(dakRepo) {
        if (this.isLocalRepository(dakRepo)) {
            const repositoryPath = this.getLocalRepositoryPath(dakRepo);
            return this.validationService.extractDAKMetadata(repositoryPath);
        }
        else {
            throw new Error('Remote metadata loading not yet implemented');
        }
    }
    /**
     * Get DAK components present in repository
     */
    async getComponents(dakRepo) {
        const components = [];
        if (this.isLocalRepository(dakRepo)) {
            const repositoryPath = this.getLocalRepositoryPath(dakRepo);
            for (const componentType of Object.values(types_1.DAKComponentType)) {
                if (await this.hasComponent(repositoryPath, componentType)) {
                    components.push(componentType);
                }
            }
        }
        else {
            throw new Error('Remote component detection not yet implemented');
        }
        return components;
    }
    /**
     * Get assets of a specific type in the DAK
     */
    async getAssets(dakRepo, assetType) {
        if (this.isLocalRepository(dakRepo)) {
            const repositoryPath = this.getLocalRepositoryPath(dakRepo);
            return this.findAssetFiles(repositoryPath, assetType);
        }
        else {
            throw new Error('Remote asset discovery not yet implemented');
        }
    }
    /**
     * Validate a specific DAK component file
     */
    async validateComponentFile(dakRepo, filePath, componentType) {
        if (this.isLocalRepository(dakRepo)) {
            const repositoryPath = this.getLocalRepositoryPath(dakRepo);
            const fullPath = path.join(repositoryPath, filePath);
            return this.validationService.validateComponentFile(fullPath, componentType);
        }
        else {
            throw new Error('Remote file validation not yet implemented');
        }
    }
    /**
     * Get DAK summary information
     */
    async getSummary(dakRepo) {
        const [metadata, validationResult, components] = await Promise.all([
            this.loadMetadata(dakRepo),
            this.validateRepository(dakRepo),
            this.getComponents(dakRepo)
        ]);
        // Count assets by type
        const assetCounts = {};
        for (const assetType of Object.values(types_1.DAKAssetType)) {
            const assets = await this.getAssets(dakRepo, assetType);
            assetCounts[assetType] = assets.length;
        }
        return {
            metadata,
            isValid: validationResult.isValid,
            components,
            assetCounts,
            lastValidated: validationResult.timestamp
        };
    }
    /**
     * Private helper methods
     */
    async loadDAKFromPath(repositoryPath) {
        const metadata = this.validationService.extractDAKMetadata(repositoryPath);
        const validationResult = await this.validationService.validateDAKRepository(repositoryPath);
        return {
            owner: 'local',
            repo: path.basename(repositoryPath),
            branch: 'local',
            dakMetadata: metadata,
            isValidDAK: validationResult.isValid,
            lastValidated: validationResult.timestamp
        };
    }
    isLocalRepository(dakRepo) {
        return dakRepo.owner === 'local' && dakRepo.branch === 'local';
    }
    getLocalRepositoryPath(dakRepo) {
        // For local repositories, the repo name should be the full path
        return dakRepo.repo;
    }
    async hasComponent(repositoryPath, componentType) {
        const expectedDirs = this.getComponentDirectories(componentType);
        for (const dir of expectedDirs) {
            const fullPath = path.join(repositoryPath, dir);
            if (fs.existsSync(fullPath)) {
                // Check if directory has any files
                const files = fs.readdirSync(fullPath);
                if (files.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    getComponentDirectories(componentType) {
        const dirMap = {
            [types_1.DAKComponentType.HEALTH_INTERVENTIONS]: ['input/pagecontent', 'input/pages'],
            [types_1.DAKComponentType.PERSONAS]: ['input/actors', 'input/personas'],
            [types_1.DAKComponentType.USER_SCENARIOS]: ['input/scenarios', 'input/use-cases'],
            [types_1.DAKComponentType.BUSINESS_PROCESSES]: ['input/business-processes', 'input/workflows'],
            [types_1.DAKComponentType.DATA_ELEMENTS]: ['input/profiles', 'input/extensions'],
            [types_1.DAKComponentType.DECISION_LOGIC]: ['input/decision-tables', 'input/logic'],
            [types_1.DAKComponentType.INDICATORS]: ['input/measures', 'input/indicators'],
            [types_1.DAKComponentType.REQUIREMENTS]: ['input/requirements'],
            [types_1.DAKComponentType.TEST_SCENARIOS]: ['input/tests', 'input/examples']
        };
        return dirMap[componentType] || [];
    }
    findAssetFiles(repositoryPath, assetType) {
        const assets = [];
        const extensions = this.getAssetExtensions(assetType);
        const searchDirs = this.getAssetSearchDirectories(assetType);
        for (const searchDir of searchDirs) {
            const fullPath = path.join(repositoryPath, searchDir);
            if (fs.existsSync(fullPath)) {
                this.findFilesRecursively(fullPath, extensions, assets, repositoryPath);
            }
        }
        return assets;
    }
    getAssetExtensions(assetType) {
        const extensionMap = {
            [types_1.DAKAssetType.BPMN]: ['.bpmn'],
            [types_1.DAKAssetType.DMN]: ['.dmn'],
            [types_1.DAKAssetType.FHIR_PROFILE]: ['.json', '.fsh'],
            [types_1.DAKAssetType.FHIR_EXTENSION]: ['.json', '.fsh'],
            [types_1.DAKAssetType.VALUE_SET]: ['.json', '.fsh'],
            [types_1.DAKAssetType.CODE_SYSTEM]: ['.json', '.fsh'],
            [types_1.DAKAssetType.QUESTIONNAIRE]: ['.json', '.fsh'],
            [types_1.DAKAssetType.MEASURE]: ['.json', '.fsh'],
            [types_1.DAKAssetType.ACTOR_DEFINITION]: ['.json', '.fsh']
        };
        return extensionMap[assetType] || [];
    }
    getAssetSearchDirectories(assetType) {
        const searchDirMap = {
            [types_1.DAKAssetType.BPMN]: ['input/business-processes', 'input/workflows'],
            [types_1.DAKAssetType.DMN]: ['input/decision-tables', 'input/logic'],
            [types_1.DAKAssetType.FHIR_PROFILE]: ['input/profiles'],
            [types_1.DAKAssetType.FHIR_EXTENSION]: ['input/extensions'],
            [types_1.DAKAssetType.VALUE_SET]: ['input/vocabulary'],
            [types_1.DAKAssetType.CODE_SYSTEM]: ['input/vocabulary'],
            [types_1.DAKAssetType.QUESTIONNAIRE]: ['input/questionnaires'],
            [types_1.DAKAssetType.MEASURE]: ['input/measures'],
            [types_1.DAKAssetType.ACTOR_DEFINITION]: ['input/actors']
        };
        return searchDirMap[assetType] || ['input'];
    }
    findFilesRecursively(dir, extensions, results, basePath) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.findFilesRecursively(fullPath, extensions, results, basePath);
            }
            else {
                const ext = path.extname(item).toLowerCase();
                if (extensions.includes(ext)) {
                    results.push(path.relative(basePath, fullPath));
                }
            }
        }
    }
}
exports.DAKService = DAKService;
// Export singleton instance
exports.dakService = new DAKService();
//# sourceMappingURL=dak-service.js.map