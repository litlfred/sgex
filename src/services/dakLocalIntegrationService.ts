/**
 * DAK Local Integration Service
 * 
 * Provides integration between local repository service and existing DAK components
 * Allows DAK components to seamlessly work with local repositories
 */

import logger from '../utils/logger';
import repoServiceFactory from './repoServiceFactory';
import type { IRepoService, ILocalRepoService } from './IRepoService';

interface DAKComponentIntegration {
  componentName: string;
  supportedServiceTypes: Array<'github' | 'local'>;
  localFallbacks?: string[];
  requiredPermissions?: string[];
}

class DAKLocalIntegrationService {
  private readonly logger: any;
  private integrations: Map<string, DAKComponentIntegration> = new Map();

  constructor() {
    this.logger = logger.getLogger('DAKLocalIntegrationService');
    this.initializeIntegrations();
  }

  private initializeIntegrations(): void {
    // Define which DAK components can work with local repositories
    const dakComponents: DAKComponentIntegration[] = [
      {
        componentName: 'DAKDashboard',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['dashboard', 'overview'],
        requiredPermissions: ['read']
      },
      {
        componentName: 'CoreDataDictionaryViewer',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/core-data-elements.json', 'core-data.json'],
        requiredPermissions: ['read']
      },
      {
        componentName: 'BPMNViewer',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/business-processes.bpmn', 'processes.bpmn'],
        requiredPermissions: ['read']
      },
      {
        componentName: 'BPMNEditor',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/business-processes.bpmn', 'processes.bpmn'],
        requiredPermissions: ['read', 'write']
      },
      {
        componentName: 'QuestionnaireEditor',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/questionnaires', 'forms'],
        requiredPermissions: ['read', 'write']
      },
      {
        componentName: 'DecisionSupportLogicView',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/decision-logic', 'decision-tables'],
        requiredPermissions: ['read']
      },
      {
        componentName: 'TestingViewer',
        supportedServiceTypes: ['github', 'local'],
        localFallbacks: ['input/tests', 'tests'],
        requiredPermissions: ['read']
      }
    ];

    dakComponents.forEach(integration => {
      this.integrations.set(integration.componentName, integration);
    });

    this.logger.debug('DAK integrations initialized', { 
      componentCount: this.integrations.size 
    });
  }

  /**
   * Check if a DAK component supports the current repository service
   */
  isComponentCompatible(componentName: string, serviceType: 'github' | 'local'): boolean {
    const integration = this.integrations.get(componentName);
    if (!integration) {
      this.logger.warn('Unknown component', { componentName });
      return false; // Default to false for unknown components
    }

    return integration.supportedServiceTypes.includes(serviceType);
  }

  /**
   * Get the current repository service with integration context
   */
  getCurrentRepositoryService(): IRepoService {
    return repoServiceFactory.getCurrentService();
  }

  /**
   * Switch to a specific repository service type
   */
  switchRepositoryService(serviceType: 'github' | 'local'): IRepoService {
    this.logger.debug('Switching repository service for DAK integration', { serviceType });
    return repoServiceFactory.switchToService(serviceType);
  }

  /**
   * Get local fallback paths for a DAK component
   */
  getLocalFallbackPaths(componentName: string): string[] {
    const integration = this.integrations.get(componentName);
    return integration?.localFallbacks || [];
  }

  /**
   * Create a repository context for DAK components
   */
  createRepositoryContext(user: string, repo: string, branch?: string) {
    const currentService = this.getCurrentRepositoryService();
    
    return {
      service: currentService,
      serviceType: currentService.serviceType,
      user,
      repo,
      branch: branch || 'main',
      isLocal: currentService.serviceType === 'local',
      isGitHub: currentService.serviceType === 'github'
    };
  }

  /**
   * Validate that a local repository contains the necessary files for a DAK component
   */
  async validateLocalRepositoryForComponent(
    componentName: string, 
    owner: string, 
    repo: string
  ): Promise<{ 
    isValid: boolean; 
    missingFiles?: string[]; 
    foundFiles?: string[];
    recommendations?: string[] 
  }> {
    this.logger.debug('Validating local repository for component', { componentName, owner, repo });

    const currentService = this.getCurrentRepositoryService();
    if (currentService.serviceType !== 'local') {
      return { isValid: true }; // GitHub repositories are assumed valid
    }

    const integration = this.integrations.get(componentName);
    if (!integration) {
      return { isValid: false, recommendations: ['Unknown component type'] };
    }

    const fallbackPaths = integration.localFallbacks || [];
    const foundFiles: string[] = [];
    const missingFiles: string[] = [];

    // Check for each fallback file
    for (const filePath of fallbackPaths) {
      try {
        await currentService.getFileContent(owner, repo, filePath);
        foundFiles.push(filePath);
      } catch (error) {
        missingFiles.push(filePath);
      }
    }

    // Also check for DAK compliance
    try {
      const dakValidation = await currentService.validateDAKRepository(owner, repo);
      if (!dakValidation.isDak) {
        missingFiles.push('sushi-config.yaml');
      }
    } catch (error) {
      missingFiles.push('sushi-config.yaml');
    }

    const isValid = foundFiles.length > 0 || fallbackPaths.length === 0;
    const recommendations: string[] = [];

    if (missingFiles.includes('sushi-config.yaml')) {
      recommendations.push('Add sushi-config.yaml with smart.who.int.base dependency for DAK compliance');
    }

    if (foundFiles.length === 0 && fallbackPaths.length > 0) {
      recommendations.push(`Consider adding one of: ${fallbackPaths.join(', ')}`);
    }

    return {
      isValid,
      missingFiles: missingFiles.length > 0 ? missingFiles : undefined,
      foundFiles: foundFiles.length > 0 ? foundFiles : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  /**
   * Get integration status for all DAK components
   */
  getIntegrationStatus(): {
    currentServiceType: 'github' | 'local';
    supportedComponents: string[];
    unsupportedComponents: string[];
    recommendations: string[];
  } {
    const currentServiceType = repoServiceFactory.getServiceType();
    const supportedComponents: string[] = [];
    const unsupportedComponents: string[] = [];
    const recommendations: string[] = [];

    this.integrations.forEach((integration, componentName) => {
      if (integration.supportedServiceTypes.includes(currentServiceType)) {
        supportedComponents.push(componentName);
      } else {
        unsupportedComponents.push(componentName);
      }
    });

    if (currentServiceType === 'local') {
      recommendations.push('Ensure local repositories contain necessary DAK files');
      recommendations.push('Use File System Access API compatible browser');
    } else {
      recommendations.push('Ensure GitHub token has appropriate permissions');
    }

    return {
      currentServiceType,
      supportedComponents,
      unsupportedComponents,
      recommendations
    };
  }

  /**
   * Create a universal file reader that works with both service types
   */
  async readFileWithFallback(
    owner: string, 
    repo: string, 
    primaryPath: string, 
    fallbackPaths: string[] = []
  ): Promise<{ content: string; actualPath: string } | null> {
    const currentService = this.getCurrentRepositoryService();
    
    // Try primary path first
    try {
      const content = await currentService.getFileContent(owner, repo, primaryPath);
      return { content, actualPath: primaryPath };
    } catch (error) {
      this.logger.debug('Primary path failed, trying fallbacks', { primaryPath, error });
    }

    // Try fallback paths
    for (const fallbackPath of fallbackPaths) {
      try {
        const content = await currentService.getFileContent(owner, repo, fallbackPath);
        this.logger.debug('Found content at fallback path', { fallbackPath });
        return { content, actualPath: fallbackPath };
      } catch (error) {
        this.logger.debug('Fallback path failed', { fallbackPath, error });
      }
    }

    this.logger.warn('No files found at any path', { primaryPath, fallbackPaths });
    return null;
  }

  /**
   * Get supported operations for current service
   */
  getSupportedOperations(): {
    canRead: boolean;
    canWrite: boolean;
    canCommit: boolean;
    canBranch: boolean;
    canCollaborate: boolean;
    hasHistory: boolean;
  } {
    const currentService = this.getCurrentRepositoryService();
    const serviceType = currentService.serviceType;

    if (serviceType === 'local') {
      return {
        canRead: true,
        canWrite: true,
        canCommit: false, // Not fully implemented yet
        canBranch: false, // Not fully implemented yet
        canCollaborate: false,
        hasHistory: false
      };
    } else {
      return {
        canRead: true,
        canWrite: true,
        canCommit: true,
        canBranch: true,
        canCollaborate: true,
        hasHistory: true
      };
    }
  }
}

// Create singleton instance
const dakLocalIntegrationService = new DAKLocalIntegrationService();

export default dakLocalIntegrationService;
export { DAKLocalIntegrationService };
export type { DAKComponentIntegration };