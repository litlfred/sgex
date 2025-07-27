import { Octokit } from '@octokit/rest';

/**
 * Service for managing multiple GitHub Personal Access Tokens (PATs)
 * Supports three access levels:
 * 1. Unauthenticated (no PAT) - demo mode
 * 2. Read-only authenticated - PAT with read access
 * 3. Write access - PAT with write access to specific repos
 */
class PATManagementService {
  constructor() {
    this.pats = new Map(); // Map<tokenId, {token, octokit, permissions, repositories}>
    this.unauthenticatedOctokit = new Octokit(); // For demo mode
    this.isInitialized = false;
  }

  /**
   * Initialize service and load PATs from storage
   */
  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load PATs from localStorage (persistent) and sessionStorage (session-only)
      const persistentPATs = JSON.parse(localStorage.getItem('github_pats') || '[]');
      const sessionPATs = JSON.parse(sessionStorage.getItem('github_pats') || '[]');
      
      // Combine and deduplicate PATs
      const allPATs = [...persistentPATs, ...sessionPATs];
      const uniquePATs = allPATs.filter((pat, index, arr) => 
        arr.findIndex(p => p.id === pat.id) === index
      );
      
      // Initialize each PAT
      uniquePATs.forEach(patData => {
        this.addPAT(patData.token, patData.id, false); // Don't save again
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PAT management service:', error);
      this.isInitialized = true; // Continue without saved PATs
    }
  }

  /**
   * Add a new PAT to the service
   * @param {string} token - The GitHub PAT
   * @param {string} id - Unique identifier for this PAT
   * @param {boolean} persistent - Whether to store in localStorage (true) or sessionStorage (false)
   * @returns {Promise<Object>} PAT information with permissions
   */
  async addPAT(token, id = null, persistent = false) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }

    // Generate ID if not provided
    if (!id) {
      id = `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    try {
      // Create Octokit instance
      const octokit = new Octokit({ auth: token.trim() });
      
      // Test token and get user info
      const userResponse = await octokit.rest.users.getAuthenticated();
      const user = userResponse?.data || userResponse; // Handle both mocked and real responses
      
      // Check token permissions
      const permissions = await this.analyzeTokenPermissions(octokit);
      
      // Store PAT information
      const patInfo = {
        id,
        token: token.trim(),
        octokit,
        user,
        permissions,
        repositories: new Map(), // Will be populated as repositories are accessed
        createdAt: new Date().toISOString(),
        persistent
      };
      
      this.pats.set(id, patInfo);
      
      // Save to appropriate storage
      this.savePATs();
      
      return {
        id,
        user,
        permissions,
        createdAt: patInfo.createdAt
      };
    } catch (error) {
      console.error('Failed to add PAT:', error);
      throw new Error(`Failed to add PAT: ${error.message}`);
    }
  }

  /**
   * Remove a PAT from the service
   * @param {string} id - PAT ID to remove
   */
  removePAT(id) {
    if (this.pats.has(id)) {
      this.pats.delete(id);
      this.savePATs();
      return true;
    }
    return false;
  }

  /**
   * Get all PATs (without token values for security)
   * @returns {Array} Array of PAT information
   */
  getAllPATs() {
    return Array.from(this.pats.values()).map(pat => ({
      id: pat.id,
      user: pat.user,
      permissions: pat.permissions,
      createdAt: pat.createdAt,
      persistent: pat.persistent
    }));
  }

  /**
   * Get the best PAT for a specific repository and operation
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name  
   * @param {string} operation - 'read' or 'write'
   * @returns {Object|null} Best PAT for the operation or null if none suitable
   */
  async getBestPATForRepository(owner, repo, operation = 'read') {
    if (!this.isInitialized) {
      this.initialize();
    }

    // For unauthenticated operations (demo mode)
    if (operation === 'read' && this.pats.size === 0) {
      return {
        id: 'unauthenticated',
        octokit: this.unauthenticatedOctokit,
        permissions: { level: 'unauthenticated' },
        user: null
      };
    }

    const candidates = [];
    
    // Check each PAT for access to this repository
    for (const [id, pat] of this.pats) {
      try {
        const access = await this.checkRepositoryAccess(pat, owner, repo);
        if (access.canRead && (operation === 'read' || access.canWrite)) {
          candidates.push({
            id,
            pat,
            access,
            priority: this.calculateAccessPriority(access, operation)
          });
        }
      } catch (error) {
        console.warn(`Failed to check repository access for PAT ${id}:`, error);
      }
    }
    
    // Sort by priority (highest first) and return the best match
    candidates.sort((a, b) => b.priority - a.priority);
    
    return candidates.length > 0 ? {
      id: candidates[0].id,
      octokit: candidates[0].pat.octokit,
      permissions: candidates[0].pat.permissions,
      user: candidates[0].pat.user,
      access: candidates[0].access
    } : null;
  }

  /**
   * Check if any PAT has write access to a specific repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} True if write access is available
   */
  async hasWriteAccess(owner, repo) {
    const pat = await this.getBestPATForRepository(owner, repo, 'write');
    return pat && pat.access && pat.access.canWrite;
  }

  /**
   * Check if any PAT has read access to a specific repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} True if read access is available (including unauthenticated)
   */
  async hasReadAccess(owner, repo) {
    const pat = await this.getBestPATForRepository(owner, repo, 'read');
    return pat !== null;
  }

  /**
   * Get security level for current PATs
   * @returns {string} 'unauthenticated', 'read-only', or 'write'
   */
  getSecurityLevel() {
    if (this.pats.size === 0) {
      return 'unauthenticated';
    }
    
    // Check if any PAT has write permissions
    for (const pat of this.pats.values()) {
      if (pat.permissions.level === 'write' || pat.permissions.scopes.includes('repo')) {
        return 'write';
      }
    }
    
    return 'read-only';
  }

  /**
   * Analyze a token before adding it to the service
   * @param {string} token - The GitHub PAT to analyze
   * @returns {Promise<Object>} Token analysis including user info and permissions
   */
  async analyzeToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }

    try {
      // Create temporary Octokit instance
      const octokit = new Octokit({ auth: token.trim() });
      
      // Get user info and permissions
      const userResponse = await octokit.rest.users.getAuthenticated();
      const user = userResponse?.data || userResponse; // Handle both mocked and real responses
      const permissions = await this.analyzeTokenPermissions(octokit);
      
      return {
        user,
        permissions,
        tokenName: user.name || user.login // Use full name or fallback to username
      };
    } catch (error) {
      console.error('Failed to analyze token:', error);
      throw new Error(`Failed to analyze token: ${error.message}`);
    }
  }

  /**
   * Analyze token permissions
   * @param {Octokit} octokit - Octokit instance with the token
   * @returns {Promise<Object>} Permission analysis
   */
  async analyzeTokenPermissions(octokit) {
    try {
      // Try to determine token type and permissions
      const userRequest = await octokit.request('GET /user');
      const headers = userRequest?.headers || {};
      
      // Check rate limit to understand token type
      const rateLimitResponse = await octokit.rest.rateLimit.get();
      const rateLimit = rateLimitResponse?.data || rateLimitResponse;
      const isClassicToken = rateLimit?.resources && rateLimit.resources.core;
      
      // For classic tokens, check scopes in headers
      let scopes = [];
      if (headers['x-oauth-scopes']) {
        scopes = headers['x-oauth-scopes'].split(', ').map(s => s.trim());
      }
      
      // Determine permission level
      let level = 'read-only';
      if (isClassicToken) {
        if (scopes.includes('repo') || scopes.includes('public_repo')) {
          level = 'write';
        }
      } else {
        // For fine-grained tokens, we'll need to test permissions per repository
        level = 'fine-grained';
      }
      
      return {
        type: isClassicToken ? 'classic' : 'fine-grained',
        level,
        scopes,
        rateLimit
      };
    } catch (error) {
      console.error('Failed to analyze token permissions:', error);
      return {
        type: 'unknown',
        level: 'read-only',
        scopes: [],
        error: error.message
      };
    }
  }

  /**
   * Check repository access for a specific PAT
   * @param {Object} pat - PAT information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Access information
   */
  async checkRepositoryAccess(pat, owner, repo) {
    const cacheKey = `${owner}/${repo}`;
    
    // Check cache first
    if (pat.repositories.has(cacheKey)) {
      const cached = pat.repositories.get(cacheKey);
      // Use cache if less than 5 minutes old
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.access;
      }
    }
    
    try {
      // Try to get repository info (tests read access)
      let canRead = false;
      let canWrite = false;
      
      try {
        await pat.octokit.rest.repos.get({ owner, repo });
        canRead = true;
      } catch (error) {
        // If 404, might be private and we don't have access
        // If 403, we might have some access but limited
        if (error.status === 403) {
          canRead = true; // Partial access
        }
      }
      
      // Test write access by checking collaborator permissions
      if (canRead) {
        try {
          const { data } = await pat.octokit.rest.repos.getCollaboratorPermissionLevel({
            owner,
            repo,
            username: pat.user.login
          });
          canWrite = ['write', 'admin'].includes(data.permission);
        } catch (error) {
          // If we can't check permissions, assume no write access
          canWrite = false;
        }
      }
      
      const access = { canRead, canWrite };
      
      // Cache the result
      pat.repositories.set(cacheKey, {
        access,
        timestamp: Date.now()
      });
      
      return access;
    } catch (error) {
      console.error(`Failed to check repository access for ${owner}/${repo}:`, error);
      return { canRead: false, canWrite: false };
    }
  }

  /**
   * Calculate access priority for PAT selection
   * @param {Object} access - Access information
   * @param {string} operation - Requested operation
   * @returns {number} Priority score (higher is better)
   */
  calculateAccessPriority(access, operation) {
    let priority = 0;
    
    if (access.canRead) priority += 1;
    if (access.canWrite) priority += 2;
    
    // Prefer write access when available, even for read operations
    if (operation === 'write' && access.canWrite) priority += 10;
    if (operation === 'read' && access.canRead) priority += 5;
    
    return priority;
  }

  /**
   * Save PATs to storage
   */
  savePATs() {
    try {
      const persistentPATs = [];
      const sessionPATs = [];
      
      for (const pat of this.pats.values()) {
        const patData = {
          id: pat.id,
          token: pat.token,
          createdAt: pat.createdAt
        };
        
        if (pat.persistent) {
          persistentPATs.push(patData);
        } else {
          sessionPATs.push(patData);
        }
      }
      
      localStorage.setItem('github_pats', JSON.stringify(persistentPATs));
      sessionStorage.setItem('github_pats', JSON.stringify(sessionPATs));
    } catch (error) {
      console.error('Failed to save PATs:', error);
    }
  }

  /**
   * Find the best PAT for a specific repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object|null>} Best PAT for the repository or null
   */
  async findBestPATForRepository(owner, repo) {
    this.initialize();
    
    let bestPAT = null;
    let bestScore = 0; // Higher score = better PAT
    
    for (const [tokenId, patData] of this.pats) {
      try {
        // Check if this PAT has access to the repository
        const hasAccess = await this.checkPATRepositoryAccess(tokenId, owner, repo);
        
        if (hasAccess) {
          let score = 1; // Base score for having access
          
          // Prefer PATs with write access
          if (patData.permissions.repoWrite) {
            score += 10;
          }
          
          // Prefer fine-grained tokens over classic tokens
          if (patData.tokenType === 'fine-grained') {
            score += 5;
          }
          
          // Prefer tokens with more recent activity
          if (patData.lastUsed) {
            const daysSinceLastUse = (Date.now() - patData.lastUsed) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 10 - daysSinceLastUse); // Bonus for recent use
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestPAT = {
              tokenId,
              username: patData.username,
              permissions: patData.permissions,
              tokenType: patData.tokenType,
              hasWriteAccess: patData.permissions.repoWrite
            };
          }
        }
      } catch (error) {
        console.warn(`Error checking PAT ${tokenId} for ${owner}/${repo}:`, error);
      }
    }
    
    return bestPAT;
  }

  /**
   * Check if a specific PAT has access to a repository
   * @param {string} tokenId - PAT token ID
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} Whether the PAT has access
   */
  async checkPATRepositoryAccess(tokenId, owner, repo) {
    const patData = this.pats.get(tokenId);
    if (!patData) return false;
    
    try {
      // Try to get repository information
      await patData.octokit.rest.repos.get({
        owner,
        repo
      });
      return true;
    } catch (error) {
      if (error.status === 404 || error.status === 403) {
        return false; // No access or repository doesn't exist
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Check if we have write access to a specific repository using any available PAT
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} Whether we have write access
   */
  async checkRepositoryWriteAccess(owner, repo) {
    const bestPAT = await this.findBestPATForRepository(owner, repo);
    return bestPAT ? bestPAT.hasWriteAccess : false;
  }

  /**
   * Get the Octokit instance for the best PAT for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Octokit|null>} Octokit instance or null if no suitable PAT
   */
  async getOctokitForRepository(owner, repo) {
    const bestPAT = await this.findBestPATForRepository(owner, repo);
    if (bestPAT) {
      const patData = this.pats.get(bestPAT.tokenId);
      return patData ? patData.octokit : null;
    }
    return null;
  }

  /**
   * Clear all PATs and storage
   */
  clearAll() {
    this.pats.clear();
    localStorage.removeItem('github_pats');
    sessionStorage.removeItem('github_pats');
  }

  /**
   * Get unauthenticated Octokit instance for demo mode
   * @returns {Octokit} Unauthenticated Octokit instance
   */
  getUnauthenticatedOctokit() {
    return this.unauthenticatedOctokit;
  }
}

// Create and export singleton instance
const patManagementService = new PATManagementService();
export default patManagementService;