/**
 * DAK Factory Service
 * Factory for creating DAK objects from repositories
 */

import { DAK, DAKMetadata, DAKRepository } from './types';
import { DAKObject } from './dakObject';
import { SourceResolutionService } from './sourceResolution';

export class DAKFactory {
  constructor(
    private sourceResolver: SourceResolutionService,
    private stagingGroundService: any
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
    
    // Try to load existing dak.json from staging ground or repository
    const dakJson = await this.loadDakJson(repository);
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
      dakJson
    );
  }
  
  /**
   * Create DAK object from existing dak.json
   */
  async createFromDakJson(
    dakJson: DAK,
    repository: DAKRepository
  ): Promise<DAKObject> {
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
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
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
      emptyDak
    );
  }
  
  private async loadDakJson(repository: DAKRepository): Promise<DAK | undefined> {
    // Try staging ground first
    try {
      const staged = await this.stagingGroundService.getFile('dak.json');
      if (staged && staged.content) {
        return JSON.parse(staged.content);
      }
    } catch (error) {
      // Staging ground file not found, continue
    }
    
    // Try remote repository - would need GitHub service integration
    // For now, return undefined
    return undefined;
  }
}
