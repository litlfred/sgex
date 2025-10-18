/**
 * Authentication Context
 * 
 * Global authentication state management to prevent race conditions and provide
 * centralized auth state across the entire application.
 * 
 * This context solves the race condition problem where multiple components
 * independently initialize authentication after page reload, causing token clearing.
 * 
 * Features:
 * - Single authentication initialization point
 * - Centralized auth state management
 * - Prevents race conditions during page reload
 * - Cross-tab synchronization support
 * - React hooks for easy consumption
 * 
 * Usage:
 * ```javascript
 * // In your App.js
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourComponents />
 *     </AuthProvider>
 *   );
 * }
 * 
 * // In any component
 * import { useAuth } from './contexts/AuthContext';
 * 
 * function MyComponent() {
 *   const { isAuthenticated, token, login, logout, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please log in</div>;
 *   return <div>Welcome! Token: {token.type}</div>;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import secureTokenStorage from '../services/secureTokenStorage';
import crossTabSyncService, { CrossTabEventTypes } from '../services/crossTabSyncService';
import logger from '../utils/logger';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the application and provides authentication state to all children
 */
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    tokenInfo: null,
    isLoading: true,
    error: null
  });

  const log = logger.getLogger('AuthContext');

  /**
   * Initialize authentication from stored token
   * This is the SINGLE initialization point to prevent race conditions
   */
  const initializeAuth = useCallback(() => {
    log.debug('Initializing authentication...');
    
    try {
      const tokenData = secureTokenStorage.retrieveToken();
      
      if (tokenData) {
        const tokenInfo = secureTokenStorage.getTokenInfo();
        
        setAuthState({
          isAuthenticated: true,
          token: tokenData,
          tokenInfo: tokenInfo,
          isLoading: false,
          error: null
        });
        
        log.debug('Authentication initialized successfully', {
          type: tokenData.type,
          expires: tokenData.expires
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          token: null,
          tokenInfo: null,
          isLoading: false,
          error: null
        });
        
        log.debug('No valid token found during initialization');
      }
    } catch (error) {
      log.error('Error initializing authentication', { error: error.message });
      
      setAuthState({
        isAuthenticated: false,
        token: null,
        tokenInfo: null,
        isLoading: false,
        error: error.message
      });
    }
  }, [log]);

  /**
   * Login with a PAT token
   * @param {string} token - GitHub Personal Access Token
   * @returns {boolean} Success status
   */
  const login = useCallback((token) => {
    log.debug('Login initiated');
    
    const success = secureTokenStorage.storeToken(token);
    
    if (success) {
      const tokenData = secureTokenStorage.retrieveToken();
      const tokenInfo = secureTokenStorage.getTokenInfo();
      
      setAuthState({
        isAuthenticated: true,
        token: tokenData,
        tokenInfo: tokenInfo,
        isLoading: false,
        error: null
      });
      
      log.debug('Login successful', { type: tokenData.type });
      return true;
    } else {
      log.warn('Login failed - token validation error');
      
      setAuthState(prev => ({
        ...prev,
        error: 'Invalid token format'
      }));
      
      return false;
    }
  }, [log]);

  /**
   * Logout and clear authentication state
   */
  const logout = useCallback(() => {
    log.debug('Logout initiated');
    
    secureTokenStorage.clearToken();
    
    setAuthState({
      isAuthenticated: false,
      token: null,
      tokenInfo: null,
      isLoading: false,
      error: null
    });
    
    log.debug('Logout successful');
  }, [log]);

  /**
   * Refresh token info (check expiration, etc.)
   * @returns {object|null} Updated token info or null
   */
  const refreshTokenInfo = useCallback(() => {
    const tokenInfo = secureTokenStorage.getTokenInfo();
    
    if (tokenInfo) {
      setAuthState(prev => ({
        ...prev,
        tokenInfo: tokenInfo,
        isAuthenticated: tokenInfo.isValid
      }));
      
      // If token is no longer valid, logout
      if (!tokenInfo.isValid) {
        log.warn('Token is no longer valid, logging out');
        logout();
        return null;
      }
      
      return tokenInfo;
    } else {
      // No token info means no token
      if (authState.isAuthenticated) {
        log.warn('Token info not found, logging out');
        logout();
      }
      return null;
    }
  }, [authState.isAuthenticated, log, logout]);

  /**
   * Check if token is still valid
   * @returns {boolean} True if token is valid
   */
  const checkTokenValidity = useCallback(() => {
    const isValid = secureTokenStorage.hasValidToken();
    
    if (!isValid && authState.isAuthenticated) {
      log.warn('Token validity check failed, logging out');
      logout();
    }
    
    return isValid;
  }, [authState.isAuthenticated, log, logout]);

  // Initialize authentication on mount (SINGLE initialization point)
  useEffect(() => {
    log.debug('AuthContext mounted, initializing authentication');
    initializeAuth();
  }, [initializeAuth, log]);

  // Set up cross-tab synchronization
  useEffect(() => {
    if (!crossTabSyncService.isAvailable()) {
      log.warn('Cross-tab sync not available');
      return;
    }

    log.debug('Setting up cross-tab synchronization');

    // Handle PAT authentication events from other tabs
    const handlePATAuth = (data) => {
      log.debug('PAT authentication event received from another tab');
      
      // Reinitialize auth to pick up the synced token
      initializeAuth();
    };

    // Handle logout events from other tabs
    const handleLogout = () => {
      log.debug('Logout event received from another tab');
      
      // Update state to reflect logout
      setAuthState({
        isAuthenticated: false,
        token: null,
        tokenInfo: null,
        isLoading: false,
        error: null
      });
    };

    // Register event handlers
    const unsubPATAuth = crossTabSyncService.on(CrossTabEventTypes.PAT_AUTHENTICATED, handlePATAuth);
    const unsubLogout = crossTabSyncService.on(CrossTabEventTypes.LOGOUT, handleLogout);

    // Cleanup on unmount
    return () => {
      log.debug('Cleaning up cross-tab synchronization');
      unsubPATAuth();
      unsubLogout();
    };
  }, [initializeAuth, log]);

  // Set up token expiration checker
  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }

    // Check token validity every minute
    const intervalId = setInterval(() => {
      log.debug('Periodic token validity check');
      checkTokenValidity();
    }, 60000); // 1 minute

    return () => {
      clearInterval(intervalId);
    };
  }, [authState.isAuthenticated, checkTokenValidity, log]);

  // Context value
  const value = {
    // State
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    tokenInfo: authState.tokenInfo,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    login,
    logout,
    refreshTokenInfo,
    checkTokenValidity,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * @returns {object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
