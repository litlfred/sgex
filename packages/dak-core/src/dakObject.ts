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
import { StagingGroundIntegrationService } from './stagingGroundIntegration';
import { BaseDAKComponentObject } from './dakComponentObject';
import { 
  GenericPersonaComponent,
  CoreDataElementComponent,
  BusinessProcessWorkflowComponent,
  DecisionSupportLogicComponent,
  HealthInterventionsComponent,
  UserScenarioComponent,
  ProgramIndicatorComponent,
  RequirementsComponent,
  TestScenarioComponent
} from './components';

/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all component objects (all 9 components)
 */
export class DAKObject {
  private dak: DAK;
  private componentObjects: Map<DAKComponentType, BaseDAKComponentObject<any, any>>;
  
  constructor(
    private repository: DAKRepository,
    private sourceResolver: SourceResolutionService,
    private stagingGroundIntegration: StagingGroundIntegrationService,
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
   * Convenience getter for health interventions component
   */
  get healthInterventions(): HealthInterventionsComponent {
    return this.getComponent(DAKComponentType.HEALTH_INTERVENTIONS) as HealthInterventionsComponent;
  }

  /**
   * Convenience getter for user scenarios component
   */
  get userScenarios(): UserScenarioComponent {
    return this.getComponent(DAKComponentType.USER_SCENARIOS) as UserScenarioComponent;
  }

  /**
   * Convenience getter for decision logic component
   */
  get decisionLogic(): DecisionSupportLogicComponent {
    return this.getComponent(DAKComponentType.DECISION_LOGIC) as DecisionSupportLogicComponent;
  }

  /**
   * Convenience getter for indicators component
   */
  get indicators(): ProgramIndicatorComponent {
    return this.getComponent(DAKComponentType.INDICATORS) as ProgramIndicatorComponent;
  }

  /**
   * Convenience getter for requirements component
   */
  get requirements(): RequirementsComponent {
    return this.getComponent(DAKComponentType.REQUIREMENTS) as RequirementsComponent;
  }

  /**
   * Convenience getter for test scenarios component
   */
  get testScenarios(): TestScenarioComponent {
    return this.getComponent(DAKComponentType.TEST_SCENARIOS) as TestScenarioComponent;
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
    await this.stagingGroundIntegration.saveDakJson(dakJson);
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
    // Create all 9 component objects
    this.componentObjects.set(
      DAKComponentType.HEALTH_INTERVENTIONS,
      new HealthInterventionsComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.HEALTH_INTERVENTIONS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.PERSONAS,
      new GenericPersonaComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.PERSONAS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.USER_SCENARIOS,
      new UserScenarioComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.USER_SCENARIOS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.BUSINESS_PROCESSES,
      new BusinessProcessWorkflowComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.BUSINESS_PROCESSES, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.DATA_ELEMENTS,
      new CoreDataElementComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.DATA_ELEMENTS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.DECISION_LOGIC,
      new DecisionSupportLogicComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.DECISION_LOGIC, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.INDICATORS,
      new ProgramIndicatorComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.INDICATORS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.REQUIREMENTS,
      new RequirementsComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.REQUIREMENTS, sources)
      )
    );

    this.componentObjects.set(
      DAKComponentType.TEST_SCENARIOS,
      new TestScenarioComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundIntegration,
        (sources) => this.updateComponentSources(DAKComponentType.TEST_SCENARIOS, sources)
      )
    );
    
    // Load existing sources into components
    this.loadSourcesIntoComponents();
  }

  private loadSourcesIntoComponents(): void {
    // Load sources from dak into component objects for all 9 components
    if (this.dak.healthInterventions) {
      const component = this.componentObjects.get(DAKComponentType.HEALTH_INTERVENTIONS);
      if (component) {
        (component as any).initializeSources(this.dak.healthInterventions);
      }
    }

    if (this.dak.personas) {
      const component = this.componentObjects.get(DAKComponentType.PERSONAS);
      if (component) {
        (component as any).initializeSources(this.dak.personas);
      }
    }

    if (this.dak.userScenarios) {
      const component = this.componentObjects.get(DAKComponentType.USER_SCENARIOS);
      if (component) {
        (component as any).initializeSources(this.dak.userScenarios);
      }
    }

    if (this.dak.businessProcesses) {
      const component = this.componentObjects.get(DAKComponentType.BUSINESS_PROCESSES);
      if (component) {
        (component as any).initializeSources(this.dak.businessProcesses);
      }
    }

    if (this.dak.dataElements) {
      const component = this.componentObjects.get(DAKComponentType.DATA_ELEMENTS);
      if (component) {
        (component as any).initializeSources(this.dak.dataElements);
      }
    }

    if (this.dak.decisionLogic) {
      const component = this.componentObjects.get(DAKComponentType.DECISION_LOGIC);
      if (component) {
        (component as any).initializeSources(this.dak.decisionLogic);
      }
    }

    if (this.dak.indicators) {
      const component = this.componentObjects.get(DAKComponentType.INDICATORS);
      if (component) {
        (component as any).initializeSources(this.dak.indicators);
      }
    }

    if (this.dak.requirements) {
      const component = this.componentObjects.get(DAKComponentType.REQUIREMENTS);
      if (component) {
        (component as any).initializeSources(this.dak.requirements);
      }
    }

    if (this.dak.testScenarios) {
      const component = this.componentObjects.get(DAKComponentType.TEST_SCENARIOS);
      if (component) {
        (component as any).initializeSources(this.dak.testScenarios);
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
