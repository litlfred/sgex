import yaml from 'js-yaml';
import githubService from './githubService';

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
      // Use the same approach as githubService - get the octokit instance
      const octokit = githubService.isAuth() ? githubService.octokit : null;
      
      if (!octokit) {
        // In unauthenticated mode, we can't reliably check repository existence
        console.log(`Cannot check repository existence for ${owner}/${repo} - not authenticated`);
        return false;
      }

      await octokit.rest.repos.get({
        owner,
        repo
      });
      
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
      // Use the same approach as githubService - get the octokit instance
      const octokit = githubService.isAuth() ? githubService.octokit : null;
      
      if (!octokit) {
        // In unauthenticated mode, we can't fetch file contents reliably
        console.log(`Cannot fetch sushi-config.yaml for ${owner}/${repo} - not authenticated`);
        return null;
      }

      // Try main branch first if no branch specified
      const branchesToTry = branch === 'main' ? ['main', 'master'] : [branch];
      
      for (const branchName of branchesToTry) {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'sushi-config.yaml',
            ref: branchName
          });
          
          if (data.type === 'file' && data.content) {
            // Decode base64 content
            const content = decodeURIComponent(escape(atob(data.content)));
            console.log(`Found sushi-config.yaml in ${owner}/${repo} on branch ${branchName}`);
            return content;
          }
        } catch (branchError) {
          console.log(`sushi-config.yaml not found on branch ${branchName} for ${owner}/${repo}:`, branchError.status === 404 ? 'File not found' : branchError.message);
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
   * Creates a mock validation for demo mode
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {boolean} - True for known demo DAK repositories
   */
  validateDemoDAKRepository(owner, repo) {
    // List of known valid demo DAK repositories for demo mode
    const knownDAKRepos = [
      // Actual WHO DAK repositories
      'WorldHealthOrganization/smart-immunizations',
      'WorldHealthOrganization/smart-anc-toolkit', 
      'WorldHealthOrganization/smart-hiv',
      'WorldHealthOrganization/smart-tb',
      'WorldHealthOrganization/smart-base',
      
      // Demo repositories for testing
      'litlfred/smart-guidelines-demo',
      'litlfred/sgex-demo',
      'litlfred/smart-pcmt-vaxprequal',
      'who/smart-guidelines',
      'who/smart-anc-toolkit',
      'who/smart-immunizations',
      
      // Demo variations
      'demo-user/smart-guidelines-demo',
      'demo-user/who-smart-guidelines'
    ];

    const fullName = `${owner}/${repo}`;
    
    // Check against known repositories first
    const isKnown = knownDAKRepos.some(knownRepo => 
      knownRepo.toLowerCase() === fullName.toLowerCase()
    );

    if (isKnown) {
      console.log(`Demo mode: ${fullName} recognized as valid DAK repository`);
      return true;
    }
    
    // Check for dynamically generated demo DAK repositories
    // These follow specific patterns matching the mock repositories in DAKSelection.js
    const demoDakPatterns = [
      /^[^/]+\/anc-dak$/i,                    // */anc-dak
      /^[^/]+\/immunization-dak$/i,           // */immunization-dak  
      /^[^/]+\/maternal-health-dak$/i,        // */maternal-health-dak
      /^[^/]+\/(.*-)?health.*-dak$/i,         // */health-related-dak (health-dak, maternal-health-dak, etc.)
      /^[^/]+\/.*care.*-dak$/i,               // */care-related-dak (anc-dak, care-dak, etc.)
      /^[^/]+\/.*immunization.*-dak$/i,       // */immunization-related-dak
      /^[^/]+\/smart-anc-toolkit$/i,          // */smart-anc-toolkit
      /^[^/]+\/smart-immunizations$/i,        // */smart-immunizations  
      /^[^/]+\/smart-guidelines$/i,           // */smart-guidelines
      /^[^/]+\/smart-guidelines-demo$/i,      // */smart-guidelines-demo
      /^[^/]+\/smart-ips-.*$/i,               // */smart-ips-* (covers smart-ips-pilgrimage, etc.)
      /^[^/]+\/smart-trust-.*$/i              // */smart-trust-* (covers smart-trust-phw, etc.)
    ];
    
    const matchesPattern = demoDakPatterns.some(pattern => pattern.test(fullName));
    
    if (matchesPattern) {
      console.log(`Demo mode: ${fullName} recognized as valid DAK repository (pattern match)`);
      return true;
    }

    console.log(`Demo mode: ${fullName} not recognized as valid DAK repository`);
    return false;
  }
}

const dakValidationService = new DAKValidationService();

export default dakValidationService;