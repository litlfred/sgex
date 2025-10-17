/**
 * Editor Integration Service
 * 
 * Bridges existing editor services with new DAK Component Objects.
 * Provides backwards compatibility while enabling gradual migration.
 * 
 * This service acts as an adapter layer between React components and
 * the TypeScript-based @sgex/dak-core package.
 */

import stagingGroundService from './stagingGroundService';

class EditorIntegrationService {
  constructor() {
    this.dakFactory = null;
    this.currentDakObject = null;
    this.initialized = false;
  }

  /**
   * Initialize DAK object for current repository
   * 
   * @param {object} repository - Repository object with owner/name
   * @param {string} branch - Branch name (default: 'main')
   * @returns {Promise<object>} DAK object instance
   */
  async initializeForRepository(repository, branch = 'main') {
    try {
      // Dynamically import DAKFactory from @sgex/dak-core
      // This allows the service to work even if the package isn't fully built
      const { DAKFactory } = await import('@sgex/dak-core');
      
      this.dakFactory = new DAKFactory(stagingGroundService);
      
      // Create DAK object from repository
      this.currentDakObject = await this.dakFactory.createFromRepository(
        repository.owner?.login || repository.full_name.split('/')[0],
        repository.name,
        branch
      );
      
      this.initialized = true;
      return this.currentDakObject;
    } catch (error) {
      console.error('Failed to initialize DAK object:', error);
      
      // If @sgex/dak-core isn't available, create a mock DAK object
      // This allows editors to continue working during development
      console.warn('Using mock DAK object (dak-core not available)');
      this.currentDakObject = this.createMockDakObject(repository, branch);
      this.initialized = true;
      return this.currentDakObject;
    }
  }

  /**
   * Create a mock DAK object for development/fallback
   * This allows editors to continue working even if dak-core isn't built
   */
  createMockDakObject(repository, branch) {
    const createMockComponent = (componentType) => ({
      componentType,
      getSources: () => [],
      addSource: (source) => console.log(`Mock: Add source to ${componentType}`, source),
      retrieveAll: async () => {
        console.log(`Mock: Retrieve all from ${componentType}`);
        return [];
      },
      retrieveById: async (id) => {
        console.log(`Mock: Retrieve ${id} from ${componentType}`);
        return null;
      },
      save: async (data, options) => {
        console.log(`Mock: Save to ${componentType}`, data, options);
        // Fallback to staging ground service for backwards compatibility
        if (componentType === 'businessProcesses' && data.xml) {
          const filename = options?.filename || `${data.id}.bpmn`;
          stagingGroundService.updateFile(`input/process/${filename}`, data.xml);
        } else if (componentType === 'personas' && data.fsh) {
          const filename = options?.filename || `${data.id}.fsh`;
          stagingGroundService.updateFile(`input/fsh/actors/${filename}`, data.fsh);
        }
        return { success: true, id: data.id };
      },
      validate: async (data) => {
        console.log(`Mock: Validate in ${componentType}`, data);
        return { isValid: true, errors: [], warnings: [] };
      }
    });

    return {
      repository: { owner: repository.owner?.login, name: repository.name },
      branch,
      metadata: {
        id: repository.name,
        name: repository.name,
        title: repository.description || repository.name,
        description: repository.description || '',
        version: '0.0.1',
        status: 'draft'
      },
      healthInterventions: createMockComponent('healthInterventions'),
      personas: createMockComponent('personas'),
      userScenarios: createMockComponent('userScenarios'),
      businessProcesses: createMockComponent('businessProcesses'),
      dataElements: createMockComponent('dataElements'),
      decisionLogic: createMockComponent('decisionLogic'),
      indicators: createMockComponent('indicators'),
      requirements: createMockComponent('requirements'),
      testScenarios: createMockComponent('testScenarios'),
      getMetadata: () => this.metadata,
      updateMetadata: (metadata) => { this.metadata = { ...this.metadata, ...metadata }; },
      toJSON: () => ({ metadata: this.metadata, components: {} }),
      saveDakJson: async () => console.log('Mock: Save dak.json')
    };
  }

  /**
   * Get current DAK object (initialize if needed)
   */
  getDakObject() {
    return this.currentDakObject;
  }

  /**
   * Check if DAK object is initialized
   */
  isInitialized() {
    return this.initialized && this.currentDakObject !== null;
  }

  /**
   * Save BPMN workflow through BusinessProcessWorkflowComponent
   * 
   * @param {string} filename - BPMN filename
   * @param {string} xmlContent - BPMN XML content
   * @param {object} metadata - Additional metadata (name, description, etc.)
   * @returns {Promise<object>} Save result
   */
  async saveBpmnWorkflow(filename, xmlContent, metadata = {}) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.businessProcesses;
    const result = await component.save({
      id: filename.replace('.bpmn', ''),
      name: metadata.name || filename,
      description: metadata.description || '',
      xml: xmlContent
    }, {
      filename,
      format: 'bpmn',
      validate: true
    });

    return result;
  }

  /**
   * Load BPMN workflows through BusinessProcessWorkflowComponent
   * 
   * @returns {Promise<Array>} Array of workflow objects
   */
  async loadBpmnWorkflows() {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.businessProcesses;
    const workflows = await component.retrieveAll();
    return workflows;
  }

  /**
   * Load single BPMN workflow by ID
   * 
   * @param {string} workflowId - Workflow identifier
   * @returns {Promise<object>} Workflow object
   */
  async loadBpmnWorkflow(workflowId) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.businessProcesses;
    const workflow = await component.retrieveById(workflowId);
    return workflow;
  }

  /**
   * Save actor/persona through GenericPersonaComponent
   * 
   * @param {object} actorDefinition - Actor definition object
   * @param {object} options - Save options (format, validate, etc.)
   * @returns {Promise<object>} Save result
   */
  async saveActor(actorDefinition, options = {}) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.personas;
    const result = await component.save({
      id: actorDefinition.id,
      name: actorDefinition.name,
      description: actorDefinition.description,
      type: actorDefinition.type,
      roles: actorDefinition.roles,
      qualifications: actorDefinition.qualifications,
      metadata: actorDefinition.metadata
    }, {
      format: options.format || 'fsh',
      validate: options.validate !== false
    });

    return result;
  }

  /**
   * Load actors/personas through GenericPersonaComponent
   * 
   * @returns {Promise<Array>} Array of actor objects
   */
  async loadActors() {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.personas;
    const actors = await component.retrieveAll();
    return actors;
  }

  /**
   * Load single actor by ID
   * 
   * @param {string} actorId - Actor identifier
   * @returns {Promise<object>} Actor object
   */
  async loadActor(actorId) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.personas;
    const actor = await component.retrieveById(actorId);
    return actor;
  }

  /**
   * Generic save method for any component type
   * 
   * @param {string} componentType - Component type (e.g., 'businessProcesses', 'personas')
   * @param {object} data - Data to save
   * @param {object} options - Save options
   * @returns {Promise<object>} Save result
   */
  async saveComponent(componentType, data, options) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject[componentType];
    if (!component) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return await component.save(data, options);
  }

  /**
   * Generic retrieve method for any component type
   * 
   * @param {string} componentType - Component type
   * @returns {Promise<Array>} Array of component items
   */
  async retrieveComponent(componentType) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject[componentType];
    if (!component) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return await component.retrieveAll();
  }

  /**
   * Get component sources
   * 
   * @param {string} componentType - Component type
   * @returns {Array} Array of source objects
   */
  getComponentSources(componentType) {
    if (!this.currentDakObject) {
      return [];
    }

    const component = this.currentDakObject[componentType];
    if (!component) {
      return [];
    }

    return component.getSources();
  }

  /**
   * Save dak.json with current component sources
   * 
   * @returns {Promise<void>}
   */
  async saveDakJson() {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    await this.currentDakObject.saveDakJson();
  }
}

// Singleton instance
const editorIntegrationService = new EditorIntegrationService();
export default editorIntegrationService;
