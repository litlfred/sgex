/**
 * DAK Service
 * Core service for working with WHO SMART Guidelines Digital Adaptation Kits (DAKs)
 * Can point to local or remote GitHub repositories
 */

import * as path from 'path';
import * as fs from 'fs';
import { 
  DAK, 
  DAKRepository, 
  DAKMetadata, 
  DAKValidationResult,
  DAKComponentType,
  DAKAssetType 
} from './types';
import { DAKValidationService } from './validation';

export class DAKService {
  private validationService: DAKValidationService;

  constructor() {
    this.validationService = new DAKValidationService();
  }

  /**
   * Create a DAK instance from a local repository path
   */
  fromLocalRepository(repositoryPath: string): Promise<DAKRepository> {
    return this.loadDAKFromPath(repositoryPath);
  }

  /**
   * Create a DAK instance from GitHub repository coordinates
   */
  fromGitHubRepository(owner: string, repo: string, branch: string = 'main'): DAKRepository {
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
  async validateRepository(dakRepo: DAKRepository): Promise<DAKValidationResult> {
    if (this.isLocalRepository(dakRepo)) {
      const repositoryPath = this.getLocalRepositoryPath(dakRepo);
      return await this.validationService.validateDAKRepository(repositoryPath);
    } else {
      throw new Error('Remote repository validation not yet implemented');
    }
  }

  /**
   * Load DAK metadata from repository
   */
  async loadMetadata(dakRepo: DAKRepository): Promise<DAKMetadata | null> {
    if (this.isLocalRepository(dakRepo)) {
      const repositoryPath = this.getLocalRepositoryPath(dakRepo);
      return this.validationService.extractDAKMetadata(repositoryPath);
    } else {
      throw new Error('Remote metadata loading not yet implemented');
    }
  }

  /**
   * Get DAK components present in repository
   */
  async getComponents(dakRepo: DAKRepository): Promise<DAKComponentType[]> {
    const components: DAKComponentType[] = [];
    
    if (this.isLocalRepository(dakRepo)) {
      const repositoryPath = this.getLocalRepositoryPath(dakRepo);
      
      for (const componentType of Object.values(DAKComponentType)) {
        if (await this.hasComponent(repositoryPath, componentType)) {
          components.push(componentType);
        }
      }
    } else {
      throw new Error('Remote component detection not yet implemented');
    }

    return components;
  }

  /**
   * Get assets of a specific type in the DAK
   */
  async getAssets(dakRepo: DAKRepository, assetType: DAKAssetType): Promise<string[]> {
    if (this.isLocalRepository(dakRepo)) {
      const repositoryPath = this.getLocalRepositoryPath(dakRepo);
      return this.findAssetFiles(repositoryPath, assetType);
    } else {
      throw new Error('Remote asset discovery not yet implemented');
    }
  }

  /**
   * Validate a specific DAK component file
   */
  async validateComponentFile(
    dakRepo: DAKRepository, 
    filePath: string, 
    componentType: DAKComponentType
  ): Promise<DAKValidationResult> {
    if (this.isLocalRepository(dakRepo)) {
      const repositoryPath = this.getLocalRepositoryPath(dakRepo);
      const fullPath = path.join(repositoryPath, filePath);
      return this.validationService.validateComponentFile(fullPath, componentType);
    } else {
      throw new Error('Remote file validation not yet implemented');
    }
  }

  /**
   * Get DAK summary information
   */
  async getSummary(dakRepo: DAKRepository): Promise<{
    metadata: DAKMetadata | null;
    isValid: boolean;
    components: DAKComponentType[];
    assetCounts: Record<DAKAssetType, number>;
    lastValidated?: Date;
  }> {
    const [metadata, validationResult, components] = await Promise.all([
      this.loadMetadata(dakRepo),
      this.validateRepository(dakRepo),
      this.getComponents(dakRepo)
    ]);

    // Count assets by type
    const assetCounts: Record<DAKAssetType, number> = {} as Record<DAKAssetType, number>;
    for (const assetType of Object.values(DAKAssetType)) {
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
  
  private async loadDAKFromPath(repositoryPath: string): Promise<DAKRepository> {
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

  private isLocalRepository(dakRepo: DAKRepository): boolean {
    return dakRepo.owner === 'local' && dakRepo.branch === 'local';
  }

  private getLocalRepositoryPath(dakRepo: DAKRepository): string {
    // For local repositories, the repo name should be the full path
    return dakRepo.repo;
  }

  private async hasComponent(repositoryPath: string, componentType: DAKComponentType): Promise<boolean> {
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

  private getComponentDirectories(componentType: DAKComponentType): string[] {
    const dirMap: Record<DAKComponentType, string[]> = {
      [DAKComponentType.HEALTH_INTERVENTIONS]: ['input/pagecontent', 'input/pages'],
      [DAKComponentType.PERSONAS]: ['input/actors', 'input/personas'],
      [DAKComponentType.USER_SCENARIOS]: ['input/scenarios', 'input/use-cases'],
      [DAKComponentType.BUSINESS_PROCESSES]: ['input/business-processes', 'input/workflows'],
      [DAKComponentType.DATA_ELEMENTS]: ['input/profiles', 'input/extensions'],
      [DAKComponentType.DECISION_LOGIC]: ['input/decision-tables', 'input/logic'],
      [DAKComponentType.INDICATORS]: ['input/measures', 'input/indicators'],
      [DAKComponentType.REQUIREMENTS]: ['input/requirements'],
      [DAKComponentType.TEST_SCENARIOS]: ['input/tests', 'input/examples']
    };
    
    return dirMap[componentType] || [];
  }

  private findAssetFiles(repositoryPath: string, assetType: DAKAssetType): string[] {
    const assets: string[] = [];
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

  private getAssetExtensions(assetType: DAKAssetType): string[] {
    const extensionMap: Record<DAKAssetType, string[]> = {
      [DAKAssetType.BPMN]: ['.bpmn'],
      [DAKAssetType.DMN]: ['.dmn'],
      [DAKAssetType.FHIR_PROFILE]: ['.json', '.fsh'],
      [DAKAssetType.FHIR_EXTENSION]: ['.json', '.fsh'],
      [DAKAssetType.VALUE_SET]: ['.json', '.fsh'],
      [DAKAssetType.CODE_SYSTEM]: ['.json', '.fsh'],
      [DAKAssetType.QUESTIONNAIRE]: ['.json', '.fsh'],
      [DAKAssetType.MEASURE]: ['.json', '.fsh'],
      [DAKAssetType.ACTOR_DEFINITION]: ['.json', '.fsh']
    };
    
    return extensionMap[assetType] || [];
  }

  private getAssetSearchDirectories(assetType: DAKAssetType): string[] {
    const searchDirMap: Record<DAKAssetType, string[]> = {
      [DAKAssetType.BPMN]: ['input/business-processes', 'input/workflows'],
      [DAKAssetType.DMN]: ['input/decision-tables', 'input/logic'],
      [DAKAssetType.FHIR_PROFILE]: ['input/profiles'],
      [DAKAssetType.FHIR_EXTENSION]: ['input/extensions'],
      [DAKAssetType.VALUE_SET]: ['input/vocabulary'],
      [DAKAssetType.CODE_SYSTEM]: ['input/vocabulary'],
      [DAKAssetType.QUESTIONNAIRE]: ['input/questionnaires'],
      [DAKAssetType.MEASURE]: ['input/measures'],
      [DAKAssetType.ACTOR_DEFINITION]: ['input/actors']
    };
    
    return searchDirMap[assetType] || ['input'];
  }

  private findFilesRecursively(
    dir: string, 
    extensions: string[], 
    results: string[], 
    basePath: string
  ): void {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findFilesRecursively(fullPath, extensions, results, basePath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(path.relative(basePath, fullPath));
        }
      }
    }
  }
}

// Export singleton instance
export const dakService = new DAKService();