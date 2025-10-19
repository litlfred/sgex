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
 * @example
 * // In your App.tsx
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
 * @example
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
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import secureTokenStorage from '../services/secureTokenStorage';
import crossTabSyncService, { CrossTabEventTypes } from '../services/crossTabSyncService';
import logger from '../utils/logger';

/**
 * Token information structure
 * @example { "type": "pat", "created": Date, "expires": Date, "timeRemaining": 3600000, "isExpired": false, "isValid": true }
 */
export interface TokenInfo {
  /** Token type */
  type: string;
  /** Creation timestamp */
  created: Date;
  /** Expiration timestamp */
  expires: Date;
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Whether token is expired */
  isExpired: boolean;
  /** Whether token is valid */
  isValid: boolean;
}

/**
 * Authentication state structure
 * @example { "isAuthenticated": true, "token": "ghp_...", "tokenInfo": { "isValid": true }, "isLoading": false, "error": null }
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Stored token string */
  token: string | null;
  /** Token validation info */
  tokenInfo: TokenInfo | null;
  /** Loading state during initialization */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Authentication context value
 * @example { "isAuthenticated": true, "token": {...}, "login": (token) => {...}, "logout": () => {...} }
 */
export interface AuthContextValue extends AuthState {
  /** Login with a PAT token */
  login: (token: string) => boolean;
  /** Logout and clear authentication */
  logout: () => void;
  /** Refresh token info */
  refreshTokenInfo: () => TokenInfo | null;
  /** Check token validity */
  checkTokenValidity: () => boolean;
  /** Re-initialize authentication */
  initializeAuth: () => void;
}

/**
 * Props for AuthProvider component
 * @example { "children": <App /> }
 */
export interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
}

// Create the authentication context
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication Provider Component
 * Wraps the application and provides authentication state to all children
 * 
 * @param props - Component props
 * @returns AuthProvider component
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
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
          type: tokenInfo?.type,
          expires: tokenInfo?.expires
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Error initializing authentication', { error: errorMessage });
      
      setAuthState({
        isAuthenticated: false,
        token: null,
        tokenInfo: null,
        isLoading: false,
        error: errorMessage
      });
    }
  }, [log]);

  /**
   * Login with a PAT token
   * @param token - GitHub Personal Access Token
   * @returns Success status
   * 
   * @example
   * const success = login('ghp_xxxxxxxxxxxxxxxxxxxx');
   * if (success) {
   *   console.log('Login successful');
   * }
   */
  const login = useCallback((token: string): boolean => {
    log.debug('Login initiated');
    
    const success = secureTokenStorage.storeToken(token);
    
    if (success) {
      const tokenData = secureTokenStorage.retrieveToken();
      const tokenInfo = secureTokenStorage.getTokenInfo();
      
      if (tokenData) {
        setAuthState({
          isAuthenticated: true,
          token: tokenData,
          tokenInfo: tokenInfo,
          isLoading: false,
          error: null
        });
        
        log.debug('Login successful', { type: tokenInfo?.type });
        return true;
      }
    }
    
    log.warn('Login failed - token validation error');
    
    setAuthState((prev: AuthState) => ({
      ...prev,
      error: 'Invalid token format'
    }));
    
    return false;
  }, [log]);

  /**
   * Logout and clear authentication state
   * 
   * @example
   * logout();
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
   * @returns Updated token info or null
   * 
   * @example
   * const tokenInfo = refreshTokenInfo();
   * if (tokenInfo && !tokenInfo.isValid) {
   *   console.log('Token expired');
   * }
   */
  const refreshTokenInfo = useCallback((): TokenInfo | null => {
    const tokenInfo = secureTokenStorage.getTokenInfo();
    
    if (tokenInfo) {
      setAuthState((prev: AuthState) => ({
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
   * @returns True if token is valid
   * 
   * @example
   * if (!checkTokenValidity()) {
   *   console.log('Token is invalid');
   * }
   */
  const checkTokenValidity = useCallback((): boolean => {
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
    const handlePATAuth = () => {
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
  const value: AuthContextValue = {
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
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * const { isAuthenticated, login, logout } = useAuth();
 * 
 * if (!isAuthenticated) {
 *   return <LoginForm onLogin={login} />;
 * }
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
