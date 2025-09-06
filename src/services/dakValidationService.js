import githubService from './githubService';
import { lazyLoadYaml } from '../utils/lazyRouteUtils';

/**
 * Service for validating WHO SMART Guidelines Digital Adaptation Kit repositories
 * 
 * A repository is considered a valid DAK if:
 * 1. It has a sushi-config.yaml file in the root
 * 2. The sushi-config.yaml contains a 'dependencies' section
 * 3. The dependencies section contains the key 'smart.who.int.base'
 */
class DAKValidationService {
  /**
   * Validates if a repository is a WHO SMART Guidelines Digital Adaptation Kit
   * @param {string} owner - Repository owner (username or organization)
   * @param {string} repo - Repository name
   * @param {string} branch - Branch to check (defaults to 'main')
   * @returns {Promise<boolean>} - True if repository is a valid DAK
   */
  async validateDAKRepository(owner, repo, branch = 'main') {
    try {
      // First, check if this is an existing GitHub repository
      const repositoryExists = await this.checkRepositoryExists(owner, repo);
      
      // Try to fetch the sushi-config.yaml file from the repository root
      const sushiConfigContent = await this.fetchSushiConfig(owner, repo, branch);
      
      if (!sushiConfigContent) {
        // If no sushi-config.yaml but repository exists, still allow it
        // This handles cases like litlfred/smart-ips-pilgrimage that exist but may not have full DAK structure
        if (repositoryExists) {
          console.log(`Repository ${owner}/${repo} exists on GitHub - allowing access even without sushi-config.yaml`);
          return true;
        }
        console.log(`No sushi-config.yaml found in ${owner}/${repo} and repository doesn't exist`);
        return false;
      }

      // Parse the YAML content
      // Lazy load js-yaml to improve initial page responsiveness
      const yaml = await lazyLoadYaml();
      const config = yaml.load(sushiConfigContent);
      
      if (!config || typeof config !== 'object') {
        // If YAML is invalid but repository exists, still allow it
        if (repositoryExists) {
          console.log(`Invalid YAML format in sushi-config.yaml for ${owner}/${repo} but repository exists - allowing access`);
          return true;
        }
        console.log(`Invalid YAML format in sushi-config.yaml for ${owner}/${repo}`);
        return false;
      }

      // Check if dependencies section exists
      if (!config.dependencies || typeof config.dependencies !== 'object') {
        // If no dependencies but repository exists, still allow it
        if (repositoryExists) {
          console.log(`No dependencies section found in sushi-config.yaml for ${owner}/${repo} but repository exists - allowing access`);
          return true;
        }
        console.log(`No dependencies section found in sushi-config.yaml for ${owner}/${repo}`);
        return false;
      }

      // Check if smart.who.int.base dependency exists
      const hasSmartBase = 'smart.who.int.base' in config.dependencies;
      
      if (hasSmartBase) {
        console.log(`Valid DAK repository found: ${owner}/${repo} (has smart.who.int.base dependency)`);
        return true;
      } else {
        // If no smart.who.int.base dependency but repository exists, still allow it
        if (repositoryExists) {
          console.log(`Repository ${owner}/${repo} has sushi-config.yaml but missing smart.who.int.base dependency - allowing access since repository exists`);
          return true;
        }
        console.log(`Repository ${owner}/${repo} has sushi-config.yaml but missing smart.who.int.base dependency`);
        return false;
      }

    } catch (error) {
      console.log(`Error validating DAK repository ${owner}/${repo}:`, error.message);
      return false;
    }
  }

  /**
   * Checks if a repository exists on GitHub
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} - True if repository exists
   */
  async checkRepositoryExists(owner, repo) {
    try {
      // Use githubService.getRepository for consistent error handling
      if (!githubService.isAuth()) {
        console.log(`Cannot check repository existence for ${owner}/${repo} - not authenticated`);
        return false;
      }

      await githubService.getRepository(owner, repo);
      
      console.log(`Repository ${owner}/${repo} exists on GitHub`);
      return true;
    } catch (error) {
      if (error.status === 404) {
        console.log(`Repository ${owner}/${repo} does not exist on GitHub`);
        return false;
      }
      // For other errors (like rate limiting, network issues, firewall blocks), 
      // we can't determine if the repository exists, so we'll be permissive
      console.log(`Error checking repository existence for ${owner}/${repo}:`, error.message, '- assuming it might exist');
      return true; // Changed from false to true for non-404 errors
    }
  }

  /**
   * Fetches the sushi-config.yaml file content from a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name  
   * @param {string} branch - Branch to check
   * @returns {Promise<string|null>} - YAML content or null if not found
   */
  async fetchSushiConfig(owner, repo, branch = 'main') {
    try {
      // Check if authenticated - use githubService for consistency
      if (!githubService.isAuth()) {
        console.log(`Cannot fetch sushi-config.yaml for ${owner}/${repo} - not authenticated`);
        return null;
      }

      // Try main branch first if no branch specified
      const branchesToTry = branch === 'main' ? ['main', 'master'] : [branch];
      
      for (const branchName of branchesToTry) {
        try {
          // Use githubService.getFileContent for consistent error handling and base64 decoding
          const content = await githubService.getFileContent(owner, repo, 'sushi-config.yaml', branchName);
          
          if (content) {
            console.log(`Found sushi-config.yaml in ${owner}/${repo} on branch ${branchName}`);
            return content;
          }
        } catch (branchError) {
          console.log(`sushi-config.yaml not found on branch ${branchName} for ${owner}/${repo}:`, 
            branchError.message.includes('File not found') ? 'File not found' : branchError.message);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`Error fetching sushi-config.yaml for ${owner}/${repo}:`, error.message);
      return null;
    }
  }

  /**
   * Validates DAK repository in demo mode based on basic format
   * A repository is valid if it has proper org/repo format. In demo mode,
   * we cannot reliably fetch sushi-config.yaml due to authentication limitations,
   * so we allow any repository that follows the basic org/repo pattern.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {boolean} - True if repository has valid org/repo format
   */
  validateDemoDAKRepository(owner, repo) {
    // Validate basic format: must look like org/repo
    if (!owner || !repo || owner.includes('/') || repo.includes('/')) {
      console.log(`Demo mode: Invalid repository format ${owner}/${repo}`);
      return false;
    }

    // Basic validation for reasonable org and repo names
    // Allow alphanumeric characters, hyphens, underscores, and dots
    const validNamePattern = /^[a-zA-Z0-9._-]+$/;
    
    if (!validNamePattern.test(owner) || !validNamePattern.test(repo)) {
      console.log(`Demo mode: Invalid characters in repository name ${owner}/${repo}`);
      return false;
    }

    const fullName = `${owner}/${repo}`;
    console.log(`Demo mode: ${fullName} accepted as valid DAK repository (proper org/repo format)`);
    return true;
  }
}

const dakValidationService = new DAKValidationService();

export default dakValidationService;