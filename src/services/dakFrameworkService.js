/**
 * DAK Framework Service
 * 
 * Provides centralized services for DAK component pages including:
 * - Actor/Persona loading from multiple sources (staging ground, GitHub, etc.)
 * - Common data access patterns
 * - Integration with staging ground
 * 
 * This service abstracts away the complexity of loading DAK assets and provides
 * a consistent interface for all DAK component pages.
 */

import githubService from './githubService';
import stagingGroundService from './stagingGroundService';

class DAKFrameworkService {
  constructor() {
    this.actorCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get actors/personas from multiple sources with priority:
   * 1. Staging ground (highest priority - draft changes)
   * 2. GitHub repository (committed content)
   * 
   * This method provides a unified interface for loading actors that can be used
   * by any DAK component page (User Scenarios, BPMN Editor, etc.)
   * 
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @param {Object} options - Additional options
   * @param {boolean} options.useCache - Whether to use cached results (default: true)
   * @param {boolean} options.includeStaging - Whether to include staging ground actors (default: true)
   * @returns {Promise<Array>} Array of actor/persona objects
   */
  async getActors(owner, repo, branch, options = {}) {
    const { useCache = true, includeStaging = true } = options;

    // Check cache first
    const cacheKey = `${owner}/${repo}/${branch}`;
    if (useCache && this.actorCache.has(cacheKey)) {
      const cached = this.actorCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.actors;
      }
    }

    try {
      const actors = [];

      // 1. Load from staging ground first (if enabled)
      if (includeStaging) {
        const stagedActors = await this.loadActorsFromStagingGround();
        actors.push(...stagedActors);
      }

      // 2. Load from GitHub repository
      const githubActors = await this.loadActorsFromGitHub(owner, repo, branch);
      
      // Merge actors, preferring staging ground versions
      githubActors.forEach(githubActor => {
        const stagedIndex = actors.findIndex(a => a.id === githubActor.id);
        if (stagedIndex === -1) {
          // Not in staging ground, add from GitHub
          actors.push(githubActor);
        }
        // If in staging ground, keep the staged version (already in array)
      });

      // Cache the results
      this.actorCache.set(cacheKey, {
        actors,
        timestamp: Date.now()
      });

      return actors;
    } catch (error) {
      console.error('Error loading actors:', error);
      return [];
    }
  }

  /**
   * Load actors from staging ground
   * @returns {Promise<Array>} Array of actor objects from staging ground
   */
  async loadActorsFromStagingGround() {
    try {
      const stagingGround = stagingGroundService.getStagingGround();
      const actors = [];

      // Find all actor files in staging ground
      const actorFiles = stagingGround.files.filter(file => 
        (file.path.startsWith('input/fsh/actors/') && file.path.endsWith('.fsh')) ||
        (file.path.startsWith('input/actors/') && file.path.endsWith('.json'))
      );

      for (const file of actorFiles) {
        try {
          if (file.path.endsWith('.fsh')) {
            // Parse FSH actor
            const actor = await this.parseFSHActor(file.content);
            if (actor) {
              actors.push({
                ...actor,
                source: 'staging-fsh',
                staged: true
              });
            }
          } else if (file.path.endsWith('.json')) {
            // Parse FHIR JSON actor
            const actor = this.parseFHIRActor(file.content);
            if (actor) {
              actors.push({
                ...actor,
                source: 'staging-fhir',
                staged: true
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to parse staged actor from ${file.path}:`, error);
        }
      }

      return actors;
    } catch (error) {
      console.warn('Error loading actors from staging ground:', error);
      return [];
    }
  }

  /**
   * Load actors from GitHub repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Array of actor objects from GitHub
   */
  async loadActorsFromGitHub(owner, repo, branch) {
    const actors = [];

    // Try loading from input/fsh/actors
    try {
      const response = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'input/fsh/actors',
        ref: branch
      });

      const files = Array.isArray(response.data) ? response.data : [response.data];
      const fshFiles = files.filter(file => file.name.endsWith('.fsh'));

      for (const file of fshFiles) {
        try {
          const contentResponse = await githubService.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branch
          });

          const content = atob(contentResponse.data.content);
          const actor = await this.parseFSHActor(content);
          
          if (actor) {
            actors.push({
              ...actor,
              source: 'github-fsh',
              staged: false
            });
          }
        } catch (error) {
          console.warn(`Failed to load actor from ${file.name}:`, error);
        }
      }
    } catch (error) {
      // FSH directory doesn't exist, continue
    }

    // Try loading from input/actors (FHIR JSON)
    try {
      const response = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'input/actors',
        ref: branch
      });

      const files = Array.isArray(response.data) ? response.data : [response.data];
      const jsonFiles = files.filter(file => file.name.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const contentResponse = await githubService.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branch
          });

          const content = atob(contentResponse.data.content);
          const actor = this.parseFHIRActor(content);
          
          if (actor) {
            actors.push({
              ...actor,
              source: 'github-fhir',
              staged: false
            });
          }
        } catch (error) {
          console.warn(`Failed to load actor from ${file.name}:`, error);
        }
      }
    } catch (error) {
      // FHIR directory doesn't exist, continue
    }

    return actors;
  }

  /**
   * Parse FSH actor definition
   * @param {string} content - FSH file content
   * @returns {Promise<Object|null>} Parsed actor object or null
   */
  async parseFSHActor(content) {
    try {
      const profileMatch = content.match(/Profile:\s+([A-Za-z0-9-]+)/);
      if (!profileMatch) return null;

      const id = profileMatch[1];
      const titleMatch = content.match(/Title:\s*"([^"]+)"/i);
      const descMatch = content.match(/Description:\s*"([^"]+)"/i);

      return {
        id,
        title: titleMatch ? titleMatch[1] : id,
        description: descMatch ? descMatch[1] : '',
        type: 'actor'
      };
    } catch (error) {
      console.warn('Error parsing FSH actor:', error);
      return null;
    }
  }

  /**
   * Parse FHIR JSON actor
   * @param {string} content - JSON content (string)
   * @returns {Object|null} Parsed actor object or null
   */
  parseFHIRActor(content) {
    try {
      const json = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (json.resourceType === 'Person' || json.resourceType === 'Practitioner') {
        return {
          id: json.id || 'unknown',
          title: json.name?.[0]?.text || json.id || 'Unknown',
          description: json.text?.div || '',
          type: json.resourceType
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Error parsing FHIR actor:', error);
      return null;
    }
  }

  /**
   * Clear the actor cache
   * Call this when actors are updated in staging ground
   */
  clearCache() {
    this.actorCache.clear();
  }

  /**
   * Clear cache for a specific repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   */
  clearCacheForRepo(owner, repo, branch) {
    const cacheKey = `${owner}/${repo}/${branch}`;
    this.actorCache.delete(cacheKey);
  }

  /**
   * Subscribe to staging ground changes to automatically clear cache
   */
  subscribeToStagingGroundChanges() {
    // Listen for staging ground changes
    stagingGroundService.addListener(() => {
      this.clearCache();
    });
  }
}

// Create singleton instance
const dakFrameworkService = new DAKFrameworkService();

// Subscribe to staging ground changes
dakFrameworkService.subscribeToStagingGroundChanges();

export default dakFrameworkService;
