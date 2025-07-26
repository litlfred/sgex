import oauthService from './oauthService';

// Access levels and their capabilities
export const ACCESS_LEVELS = {
  UNAUTHENTICATED: {
    id: 'UNAUTHENTICATED',
    name: 'Demo Mode',
    description: 'Access public repositories and resources without authentication',
    color: '#6c757d',
    icon: '🎭',
    capabilities: [
      'View public repositories',
      'Read public DAK content',
      'Use demo features',
    ],
  },
  READ_ONLY: {
    id: 'READ_ONLY', 
    name: 'Read Access',
    description: 'Read access to authorized repositories and resources',
    color: '#17a2b8',
    icon: '👁️',
    capabilities: [
      'Read private repositories (if authorized)',
      'View all DAK components',
      'Access detailed repository information',
      'View user profile information',
    ],
  },
  WRITE_ACCESS: {
    id: 'WRITE_ACCESS',
    name: 'Write Access', 
    description: 'Full read and write access to authorized repositories',
    color: '#28a745',
    icon: '✏️',
    capabilities: [
      'All read access capabilities',
      'Edit DAK components',
      'Create and modify files',
      'Create pull requests',
      'Manage repository content',
    ],
  },
};

// DAK component types and their permission requirements
export const DAK_COMPONENTS = {
  'business-processes': {
    id: 'business-processes',
    name: 'Business Processes',
    description: 'BPMN workflows and business process definitions',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['input/bpmn/**/*.bpmn', 'fsh/ig-data/input/pagecontent/business-processes/**/*'],
    fileExtensions: ['.bpmn', '.bpmn2'],
  },
  'decision-support': {
    id: 'decision-support',
    name: 'Decision Support Logic',
    description: 'DMN decision tables and clinical decision support',
    readPermission: 'READ_ONLY', 
    writePermission: 'WRITE_ACCESS',
    paths: ['input/cql/**/*.cql', 'input/vocabulary/**/*', 'fsh/ig-data/input/pagecontent/decision-support/**/*'],
    fileExtensions: ['.cql', '.dmn'],
  },
  'indicators': {
    id: 'indicators',
    name: 'Indicators & Measures',
    description: 'Performance indicators and measurement definitions',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS', 
    paths: ['input/measures/**/*', 'fsh/ig-data/input/pagecontent/indicators/**/*'],
    fileExtensions: ['.json', '.xml'],
  },
  'forms': {
    id: 'forms',
    name: 'Data Entry Forms',
    description: 'Structured data collection forms and questionnaires',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['input/questionnaires/**/*', 'fsh/ig-data/input/pagecontent/forms/**/*'],
    fileExtensions: ['.json', '.xml'],
  },
  'terminology': {
    id: 'terminology',
    name: 'Terminology',
    description: 'Code systems, value sets, and concept maps',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['input/vocabulary/**/*', 'fsh/**/*.fsh'],
    fileExtensions: ['.fsh', '.json', '.xml'],
  },
  'profiles': {
    id: 'profiles',
    name: 'FHIR Profiles',
    description: 'FHIR resource profiles and structure definitions',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['fsh/**/*.fsh', 'input/profiles/**/*'],
    fileExtensions: ['.fsh', '.json', '.xml'],
  },
  'extensions': {
    id: 'extensions',
    name: 'FHIR Extensions', 
    description: 'Custom FHIR extensions and data elements',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['fsh/**/*.fsh', 'input/extensions/**/*'],
    fileExtensions: ['.fsh', '.json', '.xml'],
  },
  'test-data': {
    id: 'test-data',
    name: 'Test Data & Examples',
    description: 'Sample data and test cases for validation',
    readPermission: 'READ_ONLY',
    writePermission: 'WRITE_ACCESS',
    paths: ['input/tests/**/*', 'input/examples/**/*'],
    fileExtensions: ['.json', '.xml', '.fhir'],
  },
};

class TokenManagerService {
  constructor() {
    this.permissionChecks = new Map(); // Cache permission checks
  }

  // Check if user has required access for a DAK component
  async checkComponentAccess(componentId, repoOwner, repoName, requiredLevel = 'READ_ONLY') {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      throw new Error(`Unknown DAK component: ${componentId}`);
    }

    // Check if user has the required access level for this repo
    const hasAccess = oauthService.hasAccess(requiredLevel, repoOwner, repoName);
    
    if (!hasAccess) {
      return {
        hasAccess: false,
        requiredLevel,
        component,
        reason: `${ACCESS_LEVELS[requiredLevel].name} required for ${component.name}`,
      };
    }

    return {
      hasAccess: true,
      requiredLevel,
      component,
    };
  }

  // Check read access for a DAK component
  async checkComponentReadAccess(componentId, repoOwner, repoName) {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      throw new Error(`Unknown DAK component: ${componentId}`);
    }

    return this.checkComponentAccess(componentId, repoOwner, repoName, component.readPermission);
  }

  // Check write access for a DAK component
  async checkComponentWriteAccess(componentId, repoOwner, repoName) {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      throw new Error(`Unknown DAK component: ${componentId}`);
    }

    return this.checkComponentAccess(componentId, repoOwner, repoName, component.writePermission);
  }

  // Get appropriate Octokit instance for a DAK component operation
  getOctokitForComponent(componentId, repoOwner, repoName, operation = 'read') {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      throw new Error(`Unknown DAK component: ${componentId}`);
    }

    const requiredLevel = operation === 'write' ? component.writePermission : component.readPermission;
    return oauthService.createOctokit(requiredLevel, repoOwner, repoName);
  }

  // Request authorization for a specific DAK component and repo
  async requestComponentAuthorization(componentId, repoOwner, repoName, operation = 'read') {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      throw new Error(`Unknown DAK component: ${componentId}`);
    }

    const requiredLevel = operation === 'write' ? component.writePermission : component.readPermission;
    
    // Check if we already have the required access
    if (oauthService.hasAccess(requiredLevel, repoOwner, repoName)) {
      return {
        alreadyAuthorized: true,
        accessLevel: requiredLevel,
        component,
      };
    }

    // Start OAuth flow for required access level
    return oauthService.startDeviceFlow(requiredLevel, repoOwner, repoName);
  }

  // Get all available DAK components
  getAvailableComponents() {
    return Object.values(DAK_COMPONENTS);
  }

  // Get access level information
  getAccessLevels() {
    return Object.values(ACCESS_LEVELS);
  }

  // Get current access summary for a repository
  async getRepositoryAccessSummary(repoOwner, repoName) {
    const summary = {
      repository: `${repoOwner}/${repoName}`,
      accessLevels: {},
      components: {},
      overallAccess: 'UNAUTHENTICATED',
    };

    // Check access levels
    for (const [levelId, levelInfo] of Object.entries(ACCESS_LEVELS)) {
      summary.accessLevels[levelId] = {
        ...levelInfo,
        hasAccess: oauthService.hasAccess(levelId, repoOwner, repoName),
      };
      
      if (summary.accessLevels[levelId].hasAccess) {
        summary.overallAccess = levelId;
      }
    }

    // Check component access
    for (const [componentId, component] of Object.entries(DAK_COMPONENTS)) {
      const readAccess = await this.checkComponentReadAccess(componentId, repoOwner, repoName);
      const writeAccess = await this.checkComponentWriteAccess(componentId, repoOwner, repoName);
      
      summary.components[componentId] = {
        ...component,
        canRead: readAccess.hasAccess,
        canWrite: writeAccess.hasAccess,
      };
    }

    return summary;
  }

  // Generate authorization help content for a component
  generateAuthorizationHelp(componentId, operation = 'read') {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      return null;
    }

    const requiredLevel = operation === 'write' ? component.writePermission : component.readPermission;
    const accessLevel = ACCESS_LEVELS[requiredLevel];

    return {
      component,
      operation,
      requiredLevel,
      accessLevel,
      steps: [
        {
          title: 'Click Authorize',
          description: `Click the "Authorize ${accessLevel.name}" button to start the OAuth flow.`,
          icon: '🔐',
        },
        {
          title: 'Visit GitHub',
          description: 'You\'ll be given a code to enter on GitHub\'s device authorization page.',
          icon: '🌐',
        },
        {
          title: 'Enter Code',
          description: 'Enter the provided code on GitHub to authorize the application.',
          icon: '🔢',
        },
        {
          title: 'Grant Permissions',
          description: `Grant ${accessLevel.name} permissions for the requested repositories.`,
          icon: '✅',
        },
        {
          title: 'Start Working',
          description: `Once authorized, you can ${operation} ${component.name} components.`,
          icon: '🎉',
        },
      ],
    };
  }

  // Validate component file paths against permissions
  validateComponentFilePath(componentId, filePath) {
    const component = DAK_COMPONENTS[componentId];
    if (!component) {
      return false;
    }

    // Check if file path matches component patterns
    return component.paths.some(pattern => {
      // Simple glob pattern matching
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(filePath);
    }) || component.fileExtensions.some(ext => filePath.endsWith(ext));
  }

  // Get component ID from file path
  getComponentFromFilePath(filePath) {
    for (const [componentId, component] of Object.entries(DAK_COMPONENTS)) {
      if (this.validateComponentFilePath(componentId, filePath)) {
        return componentId;
      }
    }
    return null;
  }

  // Clear permission cache
  clearPermissionCache() {
    this.permissionChecks.clear();
  }
}

// Create singleton instance
const tokenManagerService = new TokenManagerService();

export default tokenManagerService;