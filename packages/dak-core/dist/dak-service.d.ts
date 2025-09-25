/**
 * DAK Service
 * Core service for working with WHO SMART Guidelines Digital Adaptation Kits (DAKs)
 * Can point to local or remote GitHub repositories
 */
import { DAKRepository, DAKMetadata, DAKValidationResult, DAKComponentType, DAKAssetType } from './types';
export declare class DAKService {
    private validationService;
    constructor();
    /**
     * Create a DAK instance from a local repository path
     */
    fromLocalRepository(repositoryPath: string): Promise<DAKRepository>;
    /**
     * Create a DAK instance from GitHub repository coordinates
     */
    fromGitHubRepository(owner: string, repo: string, branch?: string): DAKRepository;
    /**
     * Validate a DAK repository
     */
    validateRepository(dakRepo: DAKRepository): Promise<DAKValidationResult>;
    /**
     * Load DAK metadata from repository
     */
    loadMetadata(dakRepo: DAKRepository): Promise<DAKMetadata | null>;
    /**
     * Get DAK components present in repository
     */
    getComponents(dakRepo: DAKRepository): Promise<DAKComponentType[]>;
    /**
     * Get assets of a specific type in the DAK
     */
    getAssets(dakRepo: DAKRepository, assetType: DAKAssetType): Promise<string[]>;
    /**
     * Validate a specific DAK component file
     */
    validateComponentFile(dakRepo: DAKRepository, filePath: string, componentType: DAKComponentType): Promise<DAKValidationResult>;
    /**
     * Get DAK summary information
     */
    getSummary(dakRepo: DAKRepository): Promise<{
        metadata: DAKMetadata | null;
        isValid: boolean;
        components: DAKComponentType[];
        assetCounts: Record<DAKAssetType, number>;
        lastValidated?: Date;
    }>;
    /**
     * Private helper methods
     */
    private loadDAKFromPath;
    private isLocalRepository;
    private getLocalRepositoryPath;
    private hasComponent;
    private getComponentDirectories;
    private findAssetFiles;
    private getAssetExtensions;
    private getAssetSearchDirectories;
    private findFilesRecursively;
}
export declare const dakService: DAKService;
//# sourceMappingURL=dak-service.d.ts.map