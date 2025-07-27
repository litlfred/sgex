import { Octokit } from '@octokit/rest';

// OAuth configuration - in production, these would be environment variables
const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || 'sgex-workbench-dev';
const GITHUB_SCOPES = {
  UNAUTHENTICATED: [], // No scopes - public API only
  READ_ONLY: ['read:user', 'public_repo'], // Read access to public repos and user info
  WRITE_ACCESS: ['read:user', 'public_repo', 'repo'] // Full repo access including private repos
};

// OAuth endpoints - direct GitHub endpoints (no proxy needed for OAuth Device Flow)
const OAUTH_ENDPOINTS = {
  DEVICE_CODE: 'https://github.com/login/device/code',
  ACCESS_TOKEN: 'https://github.com/login/oauth/access_token'
};

class OAuthService {
  constructor() {
    this.tokens = new Map(); // Store multiple tokens keyed by repo/component
    this.loadTokensFromStorage();
  }

  // Load tokens from IndexedDB (fallback to localStorage)
  async loadTokensFromStorage() {
    try {
      if ('indexedDB' in window) {
        // Try IndexedDB first for better security
        const tokens = await this.getFromIndexedDB('oauth_tokens');
        if (tokens) {
          this.tokens = new Map(Object.entries(tokens));
        }
      } else {
        // Fallback to localStorage
        const tokensData = localStorage.getItem('sgex_oauth_tokens');
        if (tokensData) {
          const tokens = JSON.parse(tokensData);
          this.tokens = new Map(Object.entries(tokens));
        }
      }
    } catch (error) {
      console.warn('Failed to load tokens from storage:', error);
    }
  }

  // Save tokens to IndexedDB (fallback to localStorage)
  async saveTokensToStorage() {
    try {
      const tokensData = Object.fromEntries(this.tokens);
      
      if ('indexedDB' in window) {
        await this.saveToIndexedDB('oauth_tokens', tokensData);
      } else {
        localStorage.setItem('sgex_oauth_tokens', JSON.stringify(tokensData));
      }
    } catch (error) {
      console.warn('Failed to save tokens to storage:', error);
    }
  }

  // IndexedDB helpers for secure token storage
  async getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SGEXTokens', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['tokens'], 'readonly');
        const store = transaction.objectStore('tokens');
        const getRequest = store.get(key);
        
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => resolve(getRequest.result?.value);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'key' });
        }
      };
    });
  }

  async saveToIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SGEXTokens', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['tokens'], 'readwrite');
        const store = transaction.objectStore('tokens');
        const putRequest = store.put({ key, value });
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'key' });
        }
      };
    });
  }

  // Start GitHub OAuth device flow
  async startDeviceFlow(accessLevel = 'READ_ONLY', repoOwner = null, repoName = null) {
    try {
      const scopes = GITHUB_SCOPES[accessLevel] || GITHUB_SCOPES.READ_ONLY;
      const scopeString = scopes.join(' ');

      // Initialize device flow
      const response = await fetch(OAUTH_ENDPOINTS.DEVICE_CODE, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          scope: scopeString,
        }),
      });

      if (!response.ok) {
        throw new Error(`Device flow initiation failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        device_code: data.device_code,
        user_code: data.user_code,
        verification_uri: data.verification_uri,
        verification_uri_complete: data.verification_uri_complete,
        expires_in: data.expires_in,
        interval: data.interval,
        accessLevel,
        repoOwner,
        repoName,
      };
    } catch (error) {
      console.error('Failed to start device flow:', error);
      throw error;
    }
  }

  // Poll for device flow completion
  async pollDeviceFlow(deviceCode, interval = 5) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await fetch(OAUTH_ENDPOINTS.ACCESS_TOKEN, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: GITHUB_CLIENT_ID,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
          });

          const data = await response.json();

          if (data.access_token) {
            resolve(data);
          } else if (data.error === 'authorization_pending') {
            // Continue polling
            setTimeout(poll, interval * 1000);
          } else if (data.error === 'slow_down') {
            // Increase polling interval
            setTimeout(poll, (interval + 5) * 1000);
          } else {
            reject(new Error(data.error_description || data.error));
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // Store token for specific repo/component access
  async storeToken(tokenData, accessLevel, repoOwner = null, repoName = null) {
    const tokenKey = this.generateTokenKey(accessLevel, repoOwner, repoName);
    
    const tokenInfo = {
      token: tokenData.access_token,
      accessLevel,
      repoOwner,
      repoName,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      createdAt: new Date().toISOString(),
      expiresAt: tokenData.expires_in ? 
        new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
    };

    this.tokens.set(tokenKey, tokenInfo);
    await this.saveTokensToStorage();

    return tokenInfo;
  }

  // Generate token key for storage
  generateTokenKey(accessLevel, repoOwner = null, repoName = null) {
    if (repoOwner && repoName) {
      return `${accessLevel}:${repoOwner}/${repoName}`;
    } else if (repoOwner) {
      return `${accessLevel}:${repoOwner}/*`;
    } else {
      return `${accessLevel}:global`;
    }
  }

  // Get appropriate token for access level and repo
  getToken(accessLevel, repoOwner = null, repoName = null) {
    // Try specific repo token first
    if (repoOwner && repoName) {
      const specificKey = this.generateTokenKey(accessLevel, repoOwner, repoName);
      const specificToken = this.tokens.get(specificKey);
      if (specificToken && this.isTokenValid(specificToken)) {
        return specificToken;
      }
    }

    // Try owner-wide token
    if (repoOwner) {
      const ownerKey = this.generateTokenKey(accessLevel, repoOwner);
      const ownerToken = this.tokens.get(ownerKey);
      if (ownerToken && this.isTokenValid(ownerToken)) {
        return ownerToken;
      }
    }

    // Try global token
    const globalKey = this.generateTokenKey(accessLevel);
    const globalToken = this.tokens.get(globalKey);
    if (globalToken && this.isTokenValid(globalToken)) {
      return globalToken;
    }

    return null;
  }

  // Check if token is still valid
  isTokenValid(tokenInfo) {
    if (!tokenInfo.expiresAt) {
      return true; // No expiration
    }
    
    return new Date(tokenInfo.expiresAt) > new Date();
  }

  // Create Octokit instance with appropriate token
  createOctokit(accessLevel, repoOwner = null, repoName = null) {
    const tokenInfo = this.getToken(accessLevel, repoOwner, repoName);
    
    if (!tokenInfo) {
      // Return unauthenticated Octokit for public API access
      return new Octokit();
    }

    return new Octokit({
      auth: tokenInfo.token,
    });
  }

  // Check if user has required access level for repo
  hasAccess(accessLevel, repoOwner = null, repoName = null) {
    return this.getToken(accessLevel, repoOwner, repoName) !== null;
  }

  // Get all stored tokens
  getAllTokens() {
    return Array.from(this.tokens.entries()).map(([key, tokenInfo]) => ({
      key,
      ...tokenInfo,
      token: '***', // Mask actual token for security
    }));
  }

  // Remove token
  async removeToken(tokenKey) {
    this.tokens.delete(tokenKey);
    await this.saveTokensToStorage();
  }

  // Clear all tokens
  async clearAllTokens() {
    this.tokens.clear();
    await this.saveTokensToStorage();
    
    // Also clear from localStorage as fallback
    localStorage.removeItem('sgex_oauth_tokens');
  }

  // Get user info using best available token
  async getCurrentUser() {
    // Try to get user info with any available token, preferring higher access levels
    const accessLevels = ['WRITE_ACCESS', 'READ_ONLY'];
    
    for (const level of accessLevels) {
      const tokenInfo = this.getToken(level);
      if (tokenInfo) {
        try {
          const octokit = new Octokit({ auth: tokenInfo.token });
          const { data } = await octokit.rest.users.getAuthenticated();
          return data;
        } catch (error) {
          console.warn(`Failed to get user info with ${level} token:`, error);
          // Token might be invalid, continue to next level
        }
      }
    }

    throw new Error('No valid authentication token available');
  }

  // Check what permissions are available for a specific repo
  async checkRepositoryPermissions(repoOwner, repoName) {
    const permissions = {
      read: false,
      write: false,
      admin: false,
    };

    // Check write access first
    const writeToken = this.getToken('WRITE_ACCESS', repoOwner, repoName);
    if (writeToken) {
      try {
        const octokit = new Octokit({ auth: writeToken.token });
        const { data } = await octokit.rest.repos.get({ owner: repoOwner, repo: repoName });
        
        permissions.read = true;
        permissions.write = data.permissions?.push || data.permissions?.admin || false;
        permissions.admin = data.permissions?.admin || false;
        
        return permissions;
      } catch (error) {
        console.warn('Failed to check write permissions:', error);
      }
    }

    // Check read access
    const readToken = this.getToken('READ_ONLY', repoOwner, repoName);
    if (readToken) {
      try {
        const octokit = new Octokit({ auth: readToken.token });
        await octokit.rest.repos.get({ owner: repoOwner, repo: repoName });
        permissions.read = true;
        return permissions;
      } catch (error) {
        console.warn('Failed to check read permissions:', error);
      }
    }

    // Try unauthenticated access for public repos
    try {
      const octokit = new Octokit();
      const { data } = await octokit.rest.repos.get({ owner: repoOwner, repo: repoName });
      if (!data.private) {
        permissions.read = true;
      }
    } catch (error) {
      // Repository might be private or not exist
    }

    return permissions;
  }
}

// Create singleton instance
const oauthService = new OAuthService();

export default oauthService;