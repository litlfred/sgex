/**
 * Staging Ground Integration Service
 * Bridges DAK Component Objects with the existing StagingGroundService
 * Handles dak.json management and file storage/retrieval
 */

import { 
  DAKComponentSource,
  DAKComponentType,
  DAKRepository,
  DAK,
  SaveOptions
} from './types';

/**
 * Interface for staging ground service
 * This matches the existing stagingGroundService.js interface
 */
export interface IStagingGroundService {
  initialize(repository: any, branch: string): void;
  getStagingGround(): any;
  updateFile(path: string, content: string, metadata?: any): boolean;
  removeFile(path: string): boolean;
  hasChanges(): boolean;
  getChangedFilesCount(): number;
  contributeFiles(files: any[], metadata?: any): { success: boolean; results: any[] };
  getStatus(): any;
}

/**
 * Staging Ground Integration Service
 * Provides integration between DAK Component Objects and staging ground
 */
export class StagingGroundIntegrationService {
  private dakJsonPath = 'dak.json';
  
  constructor(
    private stagingGroundService: IStagingGroundService,
    private repository: DAKRepository,
    private branch: string
  ) {
    // Initialize staging ground for this repository/branch
    this.stagingGroundService.initialize(repository, branch);
  }
  
  /**
   * Load dak.json from staging ground or repository
   * Returns null if not found
   */
  async loadDakJson(): Promise<Partial<DAK> | null> {
    try {
      // First try staging ground
      const stagingGround = this.stagingGroundService.getStagingGround();
      const dakJsonFile = stagingGround.files.find((f: any) => f.path === this.dakJsonPath);
      
      if (dakJsonFile && dakJsonFile.content) {
        try {
          return JSON.parse(dakJsonFile.content);
        } catch (error) {
          console.warn('Failed to parse dak.json from staging ground:', error);
        }
      }
      
      // If not in staging ground, try to load from repository
      // This would require GitHub API access - placeholder for now
      // In real implementation, would use githubService to fetch file
      console.log('dak.json not found in staging ground, would fetch from repository');
      return null;
      
    } catch (error) {
      console.error('Error loading dak.json:', error);
      return null;
    }
  }
  
  /**
   * Save dak.json to staging ground
   */
  async saveDakJson(dak: Partial<DAK>): Promise<boolean> {
    try {
      const dakJsonContent = JSON.stringify(dak, null, 2);
      const result = this.stagingGroundService.updateFile(
        this.dakJsonPath,
        dakJsonContent,
        {
          source: 'dak-core',
          componentType: 'dak-metadata',
          updatedAt: Date.now()
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error saving dak.json to staging ground:', error);
      return false;
    }
  }
  
  /**
   * Update component sources in dak.json
   * Loads current dak.json, updates the specified component sources, and saves
   */
  async updateComponentSources<T>(
    componentType: DAKComponentType,
    sources: DAKComponentSource<T>[]
  ): Promise<boolean> {
    try {
      // Load current dak.json
      let dak: Partial<DAK> = await this.loadDakJson() || {};
      
      // Map component type to dak.json property name
      const componentKey = this.getComponentKey(componentType);
      
      // Update the component sources
      (dak as any)[componentKey] = sources;
      
      // Save updated dak.json
      return await this.saveDakJson(dak);
      
    } catch (error) {
      console.error(`Error updating component sources for ${componentType}:`, error);
      return false;
    }
  }
  
  /**
   * Save component artifact to staging ground
   * This handles saving the actual content files (BPMN, FSH, Markdown, etc.)
   */
  async saveComponentArtifact(
    componentType: DAKComponentType,
    relativePath: string,
    content: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Ensure path is relative to input/ directory
      const fullPath = relativePath.startsWith('input/') 
        ? relativePath 
        : `input/${relativePath}`;
      
      const result = this.stagingGroundService.updateFile(
        fullPath,
        content,
        {
          source: 'dak-component-object',
          componentType,
          ...metadata,
          savedAt: Date.now()
        }
      );
      
      return result;
      
    } catch (error) {
      console.error(`Error saving component artifact for ${componentType}:`, error);
      return false;
    }
  }
  
  /**
   * Load component artifact from staging ground or repository
   */
  async loadComponentArtifact(relativePath: string): Promise<string | null> {
    try {
      // Ensure path is relative to input/ directory
      const fullPath = relativePath.startsWith('input/') 
        ? relativePath 
        : `input/${relativePath}`;
      
      // First try staging ground
      const stagingGround = this.stagingGroundService.getStagingGround();
      const file = stagingGround.files.find((f: any) => f.path === fullPath);
      
      if (file && file.content) {
        return file.content;
      }
      
      // If not in staging ground, try to load from repository
      // This would require GitHub API access - placeholder for now
      console.log(`Artifact ${fullPath} not found in staging ground, would fetch from repository`);
      return null;
      
    } catch (error) {
      console.error(`Error loading component artifact ${relativePath}:`, error);
      return null;
    }
  }
  
  /**
   * Remove component artifact from staging ground
   */
  async removeComponentArtifact(relativePath: string): Promise<boolean> {
    try {
      const fullPath = relativePath.startsWith('input/') 
        ? relativePath 
        : `input/${relativePath}`;
      
      return this.stagingGroundService.removeFile(fullPath);
      
    } catch (error) {
      console.error(`Error removing component artifact ${relativePath}:`, error);
      return false;
    }
  }
  
  /**
   * Get staging ground status
   */
  getStatus() {
    return this.stagingGroundService.getStatus();
  }
  
  /**
   * Check if there are staged changes
   */
  hasChanges(): boolean {
    return this.stagingGroundService.hasChanges();
  }
  
  /**
   * Map component type to dak.json property name
   */
  private getComponentKey(componentType: DAKComponentType): string {
    const mapping: Record<string, string> = {
      'health-interventions': 'healthInterventions',
      'personas': 'personas',
      'user-scenarios': 'userScenarios',
      'business-processes': 'businessProcesses',
      'core-data-elements': 'dataElements',
      'decision-logic': 'decisionLogic',
      'indicators': 'indicators',
      'requirements': 'requirements',
      'test-scenarios': 'testScenarios'
    };
    
    return mapping[componentType] || componentType;
  }
  
  /**
   * Create a relative URL source for a file saved to staging ground
   */
  createRelativeUrlSource<T>(
    relativePath: string,
    metadata?: any
  ): DAKComponentSource<T> {
    // Ensure path is relative to input/ directory
    const cleanPath = relativePath.startsWith('input/') 
      ? relativePath.substring(6) // Remove 'input/' prefix
      : relativePath;
    
    return {
      url: cleanPath,
      metadata: {
        ...metadata,
        type: 'relative-file',
        createdAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Create an inline source for data embedded in dak.json
   */
  createInlineSource<T>(
    data: T,
    metadata?: any
  ): DAKComponentSource<T> {
    return {
      instance: data,
      metadata: {
        ...metadata,
        type: 'inline',
        createdAt: new Date().toISOString()
      }
    };
  }
}
