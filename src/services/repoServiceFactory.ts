/**
 * Repository Service Factory
 * 
 * Manages creation and switching between different repository service implementations
 * (GitHub remote and Local git repositories)
 */

import type { IRepoService, ILocalRepoService, IRepoServiceFactory } from './IRepoService';
import githubService from './githubService';
import GitLocalService from './GitLocalService';
import logger from '../utils/logger';

class RepoServiceFactory implements IRepoServiceFactory {
  private githubService: IRepoService | null = null;
  private localService: ILocalRepoService | null = null;
  private currentService: IRepoService | null = null;
  private currentServiceType: 'github' | 'local' = 'github';
  private readonly logger: any;

  constructor() {
    this.logger = logger.getLogger('RepoServiceFactory');
    this.logger.debug('RepoServiceFactory instance created');
  }

  createGitHubService(): IRepoService {
    if (!this.githubService) {
      this.githubService = githubService as unknown as IRepoService;
      this.logger.debug('GitHub service created');
    }
    return this.githubService;
  }

  createLocalService(): ILocalRepoService {
    if (!this.localService) {
      this.localService = new GitLocalService();
      this.logger.debug('Local service created');
    }
    return this.localService;
  }

  getCurrentService(): IRepoService {
    if (!this.currentService) {
      // Default to GitHub service
      this.currentService = this.createGitHubService();
      this.currentServiceType = 'github';
    }
    return this.currentService;
  }

  switchToService(serviceType: 'github' | 'local'): IRepoService {
    this.logger.debug('Switching to service', { serviceType, current: this.currentServiceType });

    if (serviceType === this.currentServiceType && this.currentService) {
      this.logger.debug('Already using requested service type');
      return this.currentService;
    }

    switch (serviceType) {
      case 'github':
        this.currentService = this.createGitHubService();
        break;
      case 'local':
        this.currentService = this.createLocalService();
        break;
      default:
        this.logger.error('Unknown service type', { serviceType });
        throw new Error(`Unknown service type: ${serviceType}`);
    }

    this.currentServiceType = serviceType;
    this.logger.debug('Switched to service', { 
      serviceType, 
      serviceName: this.currentService.serviceName 
    });

    return this.currentService;
  }

  getServiceType(): 'github' | 'local' {
    return this.currentServiceType;
  }

  /**
   * Get service capabilities based on type
   */
  getServiceCapabilities(serviceType?: 'github' | 'local') {
    const type = serviceType || this.currentServiceType;
    
    switch (type) {
      case 'github':
        return {
          hasAuthentication: true,
          hasOrganizations: true,
          hasCollaboration: true,
          hasRemoteOperations: true,
          hasIssues: true,
          hasPullRequests: true,
          hasActions: true,
          hasWebInterface: true,
          requiresToken: true,
          supportsPrivateRepos: true
        };
      case 'local':
        return {
          hasAuthentication: false, // Directory selection instead
          hasOrganizations: false,
          hasCollaboration: false,
          hasRemoteOperations: false,
          hasIssues: false,
          hasPullRequests: false,
          hasActions: false,
          hasWebInterface: false,
          requiresToken: false,
          supportsPrivateRepos: true,
          hasFileSystemAccess: true,
          hasLocalBranching: true,
          hasLocalCommits: true
        };
      default:
        return {};
    }
  }

  /**
   * Check if the current environment supports a service type
   */
  isServiceTypeSupported(serviceType: 'github' | 'local'): boolean {
    switch (serviceType) {
      case 'github':
        // GitHub service always supported in browser
        return true;
      case 'local':
        // Local service requires File System Access API
        return 'showDirectoryPicker' in window;
      default:
        return false;
    }
  }

  /**
   * Get available service types for current environment
   */
  getAvailableServiceTypes(): Array<'github' | 'local'> {
    const available: Array<'github' | 'local'> = [];
    
    if (this.isServiceTypeSupported('github')) {
      available.push('github');
    }
    
    if (this.isServiceTypeSupported('local')) {
      available.push('local');
    }

    return available;
  }

  /**
   * Reset all services (useful for testing or sign out)
   */
  reset(): void {
    this.logger.debug('Resetting all services');
    
    if (this.githubService) {
      this.githubService.signOut();
    }
    
    if (this.localService) {
      this.localService.signOut();
    }

    this.githubService = null;
    this.localService = null;
    this.currentService = null;
    this.currentServiceType = 'github';
  }
}

// Create singleton instance
const repoServiceFactory = new RepoServiceFactory();

export default repoServiceFactory;
export { RepoServiceFactory };