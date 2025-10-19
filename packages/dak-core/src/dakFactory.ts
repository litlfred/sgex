/**
 * DAK Factory Service
 * Factory for creating DAK objects from repositories
 */

import { DAK, DAKMetadata, DAKRepository } from './types';
import { DAKObject } from './dakObject';
import { SourceResolutionService } from './sourceResolution';
import { StagingGroundIntegrationService, IStagingGroundService } from './stagingGroundIntegration';

export class DAKFactory {
  constructor(
    private sourceResolver: SourceResolutionService,
    private stagingGroundService: IStagingGroundService
  ) {}
  
  /**
   * Create DAK object from repository
   */
  async createFromRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<DAKObject> {
    const repository: DAKRepository = { owner, repo, branch };
    
    // Create staging ground integration
    const stagingGroundIntegration = new StagingGroundIntegrationService(
      this.stagingGroundService,
      repository,
      branch
    );
    
    // Try to load existing dak.json from staging ground or repository
    const dakJson = await stagingGroundIntegration.loadDakJson();
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      stagingGroundIntegration,
      (dakJson as DAK) || undefined
    );
  }
  
  /**
   * Create DAK object from existing dak.json
   */
  async createFromDakJson(
    dakJson: DAK,
    repository: DAKRepository
  ): Promise<DAKObject> {
    // Create staging ground integration
    const stagingGroundIntegration = new StagingGroundIntegrationService(
      this.stagingGroundService,
      repository,
      repository.branch || 'main'
    );
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      stagingGroundIntegration,
      dakJson
    );
  }
  
  /**
   * Initialize empty DAK object for new repository
   */
  createEmpty(repository: DAKRepository, metadata?: Partial<DAKMetadata>): DAKObject {
    const emptyDak: DAK = {
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
    const stagingGroundIntegration = new StagingGroundIntegrationService(
      this.stagingGroundService,
      repository,
      repository.branch || 'main'
    );
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      stagingGroundIntegration,
      emptyDak
    );
  }
}
