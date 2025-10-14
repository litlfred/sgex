/**
 * DAK Factory Service
 * Factory for creating DAK objects from repositories
 */
import { DAK, DAKMetadata, DAKRepository } from './types';
import { DAKObject } from './dakObject';
import { SourceResolutionService } from './sourceResolution';
export declare class DAKFactory {
    private sourceResolver;
    private stagingGroundService;
    constructor(sourceResolver: SourceResolutionService, stagingGroundService: any);
    /**
     * Create DAK object from repository
     */
    createFromRepository(owner: string, repo: string, branch?: string): Promise<DAKObject>;
    /**
     * Create DAK object from existing dak.json
     */
    createFromDakJson(dakJson: DAK, repository: DAKRepository): Promise<DAKObject>;
    /**
     * Initialize empty DAK object for new repository
     */
    createEmpty(repository: DAKRepository, metadata?: Partial<DAKMetadata>): DAKObject;
    private loadDakJson;
}
