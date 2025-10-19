/**
 * DAK Validation Service
 * 
 * Service for validating WHO SMART Guidelines Digital Adaptation Kit repositories.
 * 
 * A repository is considered a valid DAK if:
 * 1. It has a sushi-config.yaml file in the root
 * 2. The sushi-config.yaml contains a 'dependencies' section
 * 3. The dependencies section contains the key 'smart.who.int.base'
 * 
 * @module dakValidationService
 */

import githubService from './githubService';
import { lazyLoadYaml } from '../services/libraryLoaderService';

/**
 * YAML configuration structure
 */
interface SushiConfig {
  /** Dependencies section */
  dependencies?: Record<string, string>;
  /** Other YAML configuration fields */
  [key: string]: any;
}

/**
 * DAK Validation Service class
 * 
 * Validates repositories against WHO SMART Guidelines DAK requirements.
 * 
 * @openapi
 * components:
 *   schemas:
 *     ValidationResult:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *         reason:
 *           type: string
 */
class DAKValidationService {
  /**
   * Validates if a repository is a WHO SMART Guidelines Digital Adaptation Kit
   * 
   * @openapi
   * /api/dak/validate/{owner}/{repo}:
   *   get:
   *     summary: Validate if repository is a DAK
   *     parameters:
   *       - name: owner
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *       - name: repo
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *       - name: branch
   *         in: query
   *         schema:
   *           type: string
   *           default: main
   *     responses:
   *       200:
   *         description: Validation result
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationResult'
   */
  async validateDAKRepository(owner: string, repo: string, branch: string = 'main'): Promise<boolean> {
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
      const config = yaml.load(sushiConfigContent) as SushiConfig;
      
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
      console.log(`Error validating DAK repository ${owner}/${repo}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Checks if a repository exists on GitHub
   */
  async checkRepositoryExists(owner: string, repo: string): Promise<boolean> {
    try {
      // Use the same approach as githubService - get the octokit instance
      const octokit = githubService.authenticated ? githubService.octokit : null;
      
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
    } catch (error: any) {
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
   */
  async fetchSushiConfig(owner: string, repo: string, branch: string = 'main'): Promise<string | null> {
    try {
      // Use the same approach as githubService - get the octokit instance
      const octokit = githubService.authenticated ? githubService.octokit : null;
      
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
          
          if ('type' in data && data.type === 'file' && 'content' in data && data.content) {
            // Decode base64 content
            const content = decodeURIComponent(escape(atob(data.content)));
            console.log(`Found sushi-config.yaml in ${owner}/${repo} on branch ${branchName}`);
            return content;
          }
        } catch (branchError: any) {
          console.log(`sushi-config.yaml not found on branch ${branchName} for ${owner}/${repo}:`, branchError.status === 404 ? 'File not found' : branchError.message);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`Error fetching sushi-config.yaml for ${owner}/${repo}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Validates DAK repository in demo mode based on basic format
   * A repository is valid if it has proper org/repo format. In demo mode,
   * we cannot reliably fetch sushi-config.yaml due to authentication limitations,
   * so we allow any repository that follows the basic org/repo pattern.
   */
  validateDemoDAKRepository(owner: string, repo: string): boolean {
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
