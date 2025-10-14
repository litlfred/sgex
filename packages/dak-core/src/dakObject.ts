/**
 * DAK Object
 * Represents a repository instance of a DAK
 * Provides access to all 9 component objects
 */

import {
  DAK,
  DAKMetadata,
  DAKRepository,
  DAKComponentType,
  DAKComponentSource
} from './types';
import { SourceResolutionService } from './sourceResolution';
import { BaseDAKComponentObject } from './dakComponentObject';
import { 
  GenericPersonaComponent,
  CoreDataElementComponent,
  BusinessProcessWorkflowComponent
} from './components';

/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all component objects (currently 3, will be 9)
 */
export class DAKObject {
  private dak: DAK;
  private componentObjects: Map<DAKComponentType, BaseDAKComponentObject<any, any>>;
  
  constructor(
    private repository: DAKRepository,
    private sourceResolver: SourceResolutionService,
    private stagingGroundService: any,
    dak?: DAK
  ) {
    this.dak = dak || this.createEmptyDAK();
    this.componentObjects = new Map();
    this.initializeComponents();
  }

  /**
   * Get component object for a specific component type
   */
  getComponent<TData, TSource extends DAKComponentSource<TData>>(
    componentType: DAKComponentType
  ): BaseDAKComponentObject<TData, TSource> {
    const component = this.componentObjects.get(componentType);
    if (!component) {
      throw new Error(`Component not found: ${componentType}`);
    }
    return component;
  }

  /**
   * Convenience getter for personas component
   */
  get personas(): GenericPersonaComponent {
    return this.getComponent(DAKComponentType.PERSONAS) as GenericPersonaComponent;
  }

  /**
   * Convenience getter for data elements component
   */
  get dataElements(): CoreDataElementComponent {
    return this.getComponent(DAKComponentType.DATA_ELEMENTS) as CoreDataElementComponent;
  }

  /**
   * Convenience getter for business processes component
   */
  get businessProcesses(): BusinessProcessWorkflowComponent {
    return this.getComponent(DAKComponentType.BUSINESS_PROCESSES) as BusinessProcessWorkflowComponent;
  }

  /**
   * Get DAK metadata
   */
  getMetadata(): DAKMetadata {
    return {
      id: this.dak.id,
      name: this.dak.name,
      title: this.dak.title,
      description: this.dak.description,
      version: this.dak.version,
      status: this.dak.status,
      publicationUrl: this.dak.publicationUrl,
      license: this.dak.license,
      copyrightYear: this.dak.copyrightYear,
      publisher: this.dak.publisher
    };
  }

  /**
   * Update DAK metadata
   */
  async updateMetadata(metadata: Partial<DAKMetadata>): Promise<void> {
    this.dak = { ...this.dak, ...metadata } as DAK;
    await this.saveDakJson();
  }

  /**
   * Export to dak.json format
   */
  toJSON(): DAK {
    // Collect sources from all components
    const dakJson: DAK = {
      ...this.dak,
      resourceType: 'DAK'
    };
    
    // Add sources from each component
    for (const [componentType, component] of this.componentObjects) {
      const sources = component.getSources();
      if (sources.length > 0) {
        // Map component type to DAK property name
        const propertyName = this.getDAKPropertyName(componentType);
        (dakJson as any)[propertyName] = sources;
      }
    }
    
    return dakJson;
  }

  /**
   * Save dak.json to staging ground
   */
  async saveDakJson(): Promise<void> {
    const dakJson = this.toJSON();
    await this.stagingGroundService.updateFile(
      'dak.json',
      JSON.stringify(dakJson, null, 2),
      {
        message: 'Update DAK metadata',
        componentType: 'metadata'
      }
    );
  }

  /**
   * Internal method to update component sources (called by components)
   */
  async updateComponentSources(
    componentType: DAKComponentType,
    sources: DAKComponentSource<any>[]
  ): Promise<void> {
    // Update internal DAK structure
    const propertyName = this.getDAKPropertyName(componentType);
    (this.dak as any)[propertyName] = sources;
    
    // Save to staging ground
    await this.saveDakJson();
  }

  private initializeComponents(): void {
    // Create component objects - currently 3 implemented, will be 9
    this.componentObjects.set(
      DAKComponentType.PERSONAS,
      new GenericPersonaComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundService,
        (sources) => this.updateComponentSources(DAKComponentType.PERSONAS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.DATA_ELEMENTS,
      new CoreDataElementComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundService,
        (sources) => this.updateComponentSources(DAKComponentType.DATA_ELEMENTS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.BUSINESS_PROCESSES,
      new BusinessProcessWorkflowComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundService,
        (sources) => this.updateComponentSources(DAKComponentType.BUSINESS_PROCESSES, sources)
      )
    );
    
    // Load existing sources into components
    this.loadSourcesIntoComponents();
  }

  private loadSourcesIntoComponents(): void {
    // Load sources from dak into component objects
    if (this.dak.personas) {
      const component = this.componentObjects.get(DAKComponentType.PERSONAS);
      if (component) {
        (component as any).initializeSources(this.dak.personas);
      }
    }

    if (this.dak.dataElements) {
      const component = this.componentObjects.get(DAKComponentType.DATA_ELEMENTS);
      if (component) {
        (component as any).initializeSources(this.dak.dataElements);
      }
    }

    if (this.dak.businessProcesses) {
      const component = this.componentObjects.get(DAKComponentType.BUSINESS_PROCESSES);
      if (component) {
        (component as any).initializeSources(this.dak.businessProcesses);
      }
    }
  }

  private createEmptyDAK(): DAK {
    return {
      resourceType: 'DAK',
      id: this.repository.owner + '.' + this.repository.repo,
      name: this.repository.repo,
      title: this.repository.repo,
      description: '',
      version: '0.1.0',
      status: 'draft',
      publicationUrl: '',
      license: 'CC-BY-4.0',
      copyrightYear: new Date().getFullYear().toString(),
      publisher: { name: this.repository.owner, url: '' }
    };
  }

  private getDAKPropertyName(componentType: DAKComponentType): string {
    const map: Record<DAKComponentType, string> = {
      [DAKComponentType.HEALTH_INTERVENTIONS]: 'healthInterventions',
      [DAKComponentType.PERSONAS]: 'personas',
      [DAKComponentType.USER_SCENARIOS]: 'userScenarios',
      [DAKComponentType.BUSINESS_PROCESSES]: 'businessProcesses',
      [DAKComponentType.DATA_ELEMENTS]: 'dataElements',
      [DAKComponentType.DECISION_LOGIC]: 'decisionLogic',
      [DAKComponentType.INDICATORS]: 'indicators',
      [DAKComponentType.REQUIREMENTS]: 'requirements',
      [DAKComponentType.TEST_SCENARIOS]: 'testScenarios'
    };
    return map[componentType];
  }
}
