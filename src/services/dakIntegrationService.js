/**
 * DAK Integration Service
 * 
 * Integrates the new @sgex/dak-core DAK logical model with the existing
 * SGEX Workbench components. Provides a bridge between React components
 * and the DAK Component Objects.
 * 
 * This service follows the patterns established in PR #1111 for DAK framework integration.
 */

import { DAKFactory, SourceResolutionService } from '@sgex/dak-core';
import stagingGroundService from './stagingGroundService';
import githubService from './githubService';

class DAKIntegrationService {
  constructor() {
    this.dakFactory = null;
    this.currentDAKObject = null;
    this.sourceResolver = null;
  }

  /**
   * Initialize DAK object for the current repository
   * 
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<DAKObject>} Initialized DAK object
   */
  async initialize(owner, repo, branch = 'main') {
    try {
      // Create source resolver with GitHub service
      this.sourceResolver = new SourceResolutionService(githubService.octokit);

      // Create DAK factory
      this.dakFactory = new DAKFactory(this.sourceResolver, stagingGroundService);

      // Create DAK object from repository
      this.currentDAKObject = await this.dakFactory.createFromRepository(owner, repo, branch);

      return this.currentDAKObject;
    } catch (error) {
      console.error('Failed to initialize DAK object:', error);
      throw error;
    }
  }

  /**
   * Get the current DAK object
   * Throws error if not initialized
   */
  getDAKObject() {
    if (!this.currentDAKObject) {
      throw new Error('DAK object not initialized. Call initialize() first.');
    }
    return this.currentDAKObject;
  }

  /**
   * Check if DAK object is initialized
   */
  isInitialized() {
    return this.currentDAKObject !== null;
  }

  /**
   * Get user scenarios component
   */
  getUserScenariosComponent() {
    return this.getDAKObject().userScenarios;
  }

  /**
   * Get personas/actors component
   */
  getPersonasComponent() {
    return this.getDAKObject().personas;
  }

  /**
   * Load all user scenarios
   * 
   * @returns {Promise<Array>} Array of user scenarios
   */
  async loadUserScenarios() {
    try {
      const component = this.getUserScenariosComponent();
      const sources = component.getSources();
      
      // Resolve all sources to get actual data
      const scenarios = [];
      for (const source of sources) {
        try {
          const resolved = await component.resolveSource(source);
          if (resolved && resolved.data) {
            scenarios.push({
              id: resolved.data.id,
              title: resolved.data.title || resolved.data.name,
              description: resolved.data.description,
              markdown: resolved.data.markdown,
              actors: resolved.data.actors || [],
              steps: resolved.data.steps || [],
              source: source,
              resolvedData: resolved.data
            });
          }
        } catch (error) {
          console.warn('Failed to resolve scenario source:', error);
        }
      }

      return scenarios;
    } catch (error) {
      console.error('Error loading user scenarios:', error);
      throw error;
    }
  }

  /**
   * Load all personas/actors
   * Includes both committed and staged personas
   * 
   * @returns {Promise<Array>} Array of personas
   */
  async loadPersonas() {
    try {
      const component = this.getPersonasComponent();
      const sources = component.getSources();

      // Resolve all sources to get actual data
      const personas = [];
      for (const source of sources) {
        try {
          const resolved = await component.resolveSource(source);
          if (resolved && resolved.data) {
            personas.push({
              id: resolved.data.id,
              title: resolved.data.title || resolved.data.name,
              name: resolved.data.name,
              description: resolved.data.description,
              type: 'actor',
              source: source,
              staged: source.metadata?.sourceType === 'url-relative' && 
                      stagingGroundService.getStagingGround().files.some(
                        f => source.url && f.path.includes(source.url)
                      ),
              resolvedData: resolved.data
            });
          }
        } catch (error) {
          console.warn('Failed to resolve persona source:', error);
        }
      }

      return personas;
    } catch (error) {
      console.error('Error loading personas:', error);
      throw error;
    }
  }

  /**
   * Save a user scenario
   * 
   * @param {Object} scenarioData - Scenario data
   * @param {string} scenarioData.id - Scenario ID
   * @param {string} scenarioData.markdown - Markdown content
   * @param {string} scenarioData.title - Scenario title
   * @param {Array} scenarioData.actors - Referenced actors
   * @returns {Promise<Object>} Save result
   */
  async saveUserScenario(scenarioData) {
    try {
      const component = this.getUserScenariosComponent();

      // Prepare data for save
      const dataToSave = {
        id: scenarioData.id,
        title: scenarioData.title || scenarioData.id,
        name: scenarioData.title || scenarioData.id,
        description: scenarioData.description || '',
        markdown: scenarioData.markdown,
        actors: scenarioData.actors || [],
        steps: scenarioData.steps || [],
        scenarios: [] // Required by interface
      };

      // Save through component object
      // This will:
      // 1. Save the markdown file to staging ground
      // 2. Create/update the source in dak.json
      // 3. Save dak.json to staging ground
      const result = await component.save(dataToSave, {
        filename: `userscenario-${scenarioData.id}.md`,
        format: 'markdown',
        validate: true
      });

      return result;
    } catch (error) {
      console.error('Error saving user scenario:', error);
      throw error;
    }
  }

  /**
   * Validate a user scenario
   * 
   * @param {Object} scenarioData - Scenario data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateUserScenario(scenarioData) {
    try {
      const component = this.getUserScenariosComponent();
      return await component.validate(scenarioData);
    } catch (error) {
      console.error('Error validating user scenario:', error);
      throw error;
    }
  }

  /**
   * Get DAK metadata
   */
  getMetadata() {
    return this.getDAKObject().getMetadata();
  }

  /**
   * Clear current DAK object (for switching repositories)
   */
  clear() {
    this.currentDAKObject = null;
    this.dakFactory = null;
    this.sourceResolver = null;
  }
}

// Export singleton instance
const dakIntegrationService = new DAKIntegrationService();
export default dakIntegrationService;
