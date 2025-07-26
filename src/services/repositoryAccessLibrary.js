import githubService from '../services/githubService';
import patManagementService from '../services/patManagementService';

/**
 * Repository Access Library for DAK Components
 * Provides unified access control for the 8 WHO SMART Guidelines DAK components
 */
class RepositoryAccessLibrary {
  constructor() {
    // DAK component definitions based on WHO SMART Guidelines framework
    this.dakComponents = {
      'business-processes': {
        id: 'business-processes',
        name: 'Business Processes',
        description: 'BPMN workflows and business process definitions',
        level: 2,
        paths: ['input/images/bpmn/', 'input/cql/', 'input/business-process/'],
        fileTypes: ['.bpmn', '.cql'],
        requiredAccess: 'write', // Typically requires write access for editing
        icon: '🔄'
      },
      'decision-support': {
        id: 'decision-support',
        name: 'Decision Support Logic',
        description: 'DMN decision tables and clinical decision support',
        level: 2,
        paths: ['input/cql/', 'input/decision-tables/'],
        fileTypes: ['.cql', '.dmn'],
        requiredAccess: 'write',
        icon: '🧠'
      },
      'indicators': {
        id: 'indicators',
        name: 'Indicators & Measures',
        description: 'Performance indicators and measurement definitions',
        level: 2,
        paths: ['input/measures/', 'input/indicators/'],
        fileTypes: ['.json', '.cql'],
        requiredAccess: 'write',
        icon: '📊'
      },
      'data-entry-forms': {
        id: 'data-entry-forms',
        name: 'Data Entry Forms',
        description: 'Structured data collection forms and questionnaires',
        level: 2,
        paths: ['input/questionnaires/', 'input/forms/'],
        fileTypes: ['.json', '.xml'],
        requiredAccess: 'write',
        icon: '📝'
      },
      'terminology': {
        id: 'terminology',
        name: 'Terminology',
        description: 'Code systems, value sets, and concept maps',
        level: 3,
        paths: ['input/vocabulary/', 'input/codesystems/'],
        fileTypes: ['.json', '.xml'],
        requiredAccess: 'write',
        icon: '📚'
      },
      'fhir-profiles': {
        id: 'fhir-profiles',
        name: 'FHIR Profiles',
        description: 'FHIR resource profiles and structure definitions',
        level: 3,
        paths: ['input/profiles/', 'input/resources/'],
        fileTypes: ['.json', '.xml'],
        requiredAccess: 'write',
        icon: '🏗️'
      },
      'fhir-extensions': {
        id: 'fhir-extensions',
        name: 'FHIR Extensions',
        description: 'Custom FHIR extensions and data elements',
        level: 3,
        paths: ['input/extensions/', 'input/resources/'],
        fileTypes: ['.json', '.xml'],
        requiredAccess: 'write',
        icon: '🔧'
      },
      'test-data': {
        id: 'test-data',
        name: 'Test Data & Examples',
        description: 'Sample data and test cases for validation',
        level: 3,
        paths: ['input/examples/', 'input/tests/'],
        fileTypes: ['.json', '.xml'],
        requiredAccess: 'read', // Often read-only for testing
        icon: '🧪'
      }
    };
  }

  /**
   * Get all DAK components
   * @returns {Array} Array of DAK component definitions
   */
  getAllComponents() {
    return Object.values(this.dakComponents);
  }

  /**
   * Get DAK component by ID
   * @param {string} componentId - Component identifier
   * @returns {Object|null} Component definition or null if not found
   */
  getComponent(componentId) {
    return this.dakComponents[componentId] || null;
  }

  /**
   * Get DAK components by level
   * @param {number} level - Level (2 for business logic, 3 for technical)
   * @returns {Array} Array of components at the specified level
   */
  getComponentsByLevel(level) {
    return Object.values(this.dakComponents).filter(component => component.level === level);
  }

  /**
   * Check if user has access to a specific DAK component in a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} componentId - DAK component ID
   * @returns {Promise<Object>} Access information
   */
  async checkComponentAccess(owner, repo, componentId) {
    const component = this.getComponent(componentId);
    if (!component) {
      return {
        hasAccess: false,
        reason: 'Component not found',
        component: null
      };
    }

    try {
      // Initialize PAT management service
      patManagementService.initialize();
      
      // Check if we have the required access level for this component
      const hasRequiredAccess = component.requiredAccess === 'read' 
        ? await patManagementService.hasReadAccess(owner, repo)
        : await patManagementService.hasWriteAccess(owner, repo);

      // Get the best PAT for this repository and operation
      const pat = await patManagementService.getBestPATForRepository(
        owner, 
        repo, 
        component.requiredAccess
      );

      return {
        hasAccess: hasRequiredAccess,
        component,
        requiredAccess: component.requiredAccess,
        pat: pat ? {
          id: pat.id,
          user: pat.user,
          permissions: pat.permissions
        } : null,
        reason: hasRequiredAccess ? null : `Requires ${component.requiredAccess} access to ${owner}/${repo}`
      };
    } catch (error) {
      console.error(`Failed to check component access for ${componentId}:`, error);
      return {
        hasAccess: false,
        reason: `Error checking access: ${error.message}`,
        component,
        error
      };
    }
  }

  /**
   * Check access for all DAK components in a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Access information for all components
   */
  async checkAllComponentsAccess(owner, repo) {
    const results = {};
    const components = this.getAllComponents();

    // Check access for each component
    for (const component of components) {
      try {
        results[component.id] = await this.checkComponentAccess(owner, repo, component.id);
      } catch (error) {
        results[component.id] = {
          hasAccess: false,
          reason: `Error: ${error.message}`,
          component,
          error
        };
      }
    }

    // Summarize overall access
    const accessibleComponents = Object.values(results).filter(r => r.hasAccess);
    const writeableComponents = accessibleComponents.filter(r => r.component.requiredAccess === 'write');
    
    return {
      repository: { owner, repo },
      components: results,
      summary: {
        total: components.length,
        accessible: accessibleComponents.length,
        writeable: writeableComponents.length,
        hasAnyAccess: accessibleComponents.length > 0,
        hasWriteAccess: writeableComponents.length > 0
      }
    };
  }

  /**
   * Get available actions for a repository based on access levels
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} Available actions
   */
  async getAvailableActions(owner, repo) {
    const accessInfo = await this.checkAllComponentsAccess(owner, repo);
    const actions = [];

    // View/browse action (always available for public repos)
    actions.push({
      id: 'view',
      name: 'View Repository',
      description: 'Browse repository contents and DAK components',
      icon: '👁️',
      available: true,
      requiredAccess: 'none'
    });

    // Read-only analysis (requires read access)
    if (accessInfo.summary.hasAnyAccess) {
      actions.push({
        id: 'analyze',
        name: 'Analyze DAK',
        description: 'Analyze DAK structure and components',
        icon: '🔍',
        available: true,
        requiredAccess: 'read'
      });
    }

    // Edit components (requires write access)
    if (accessInfo.summary.hasWriteAccess) {
      actions.push({
        id: 'edit',
        name: 'Edit Components',
        description: 'Modify DAK components and content',
        icon: '✏️',
        available: true,
        requiredAccess: 'write'
      });

      actions.push({
        id: 'create-pr',
        name: 'Create Pull Request',
        description: 'Create pull requests with changes',
        icon: '🔀',
        available: true,
        requiredAccess: 'write'
      });
    }

    // Fork repository (available if no write access)
    if (!accessInfo.summary.hasWriteAccess) {
      actions.push({
        id: 'fork',
        name: 'Fork Repository',
        description: 'Create a fork to make your own changes',
        icon: '🍴',
        available: true,
        requiredAccess: 'none'
      });
    }

    return {
      repository: { owner, repo },
      actions,
      accessInfo
    };
  }

  /**
   * Suggest PAT configuration for a repository and intended actions
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Array} intendedActions - Array of action IDs
   * @returns {Object} PAT configuration suggestion
   */
  suggestPATConfiguration(owner, repo, intendedActions = []) {
    const requiresWrite = intendedActions.some(action => 
      ['edit', 'create-pr'].includes(action)
    );
    
    const requiresRead = intendedActions.some(action => 
      ['analyze', 'view'].includes(action)
    ) || requiresWrite;

    return {
      repository: { owner, repo },
      intendedActions,
      recommendation: {
        accessLevel: requiresWrite ? 'write' : requiresRead ? 'read' : 'none',
        tokenType: 'fine-grained', // Recommend fine-grained for better security
        permissions: {
          'Contents': requiresWrite ? 'Read and Write' : 'Read',
          'Metadata': 'Read',
          'Pull requests': requiresWrite ? 'Read and Write' : undefined
        },
        scopes: requiresWrite ? ['repo'] : ['public_repo'], // For classic tokens
        reasoning: `Based on intended actions (${intendedActions.join(', ')}), you need ${requiresWrite ? 'write' : 'read'} access to effectively work with this repository.`
      }
    };
  }

  /**
   * Get current security level
   * @returns {string} Current security level
   */
  getCurrentSecurityLevel() {
    return githubService.getSecurityLevel();
  }

  /**
   * Check if authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return githubService.isAuth();
  }
}

// Export singleton instance
const repositoryAccessLibrary = new RepositoryAccessLibrary();
export default repositoryAccessLibrary;