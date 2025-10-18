/**
 * Tests for AuthContext
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import secureTokenStorage from '../../services/secureTokenStorage';
import crossTabSyncService, { CrossTabEventTypes } from '../../services/crossTabSyncService';

// Mock the services
jest.mock('../../services/secureTokenStorage');
jest.mock('../../services/crossTabSyncService');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    secureTokenStorage.retrieveToken.mockReturnValue(null);
    secureTokenStorage.getTokenInfo.mockReturnValue(null);
    secureTokenStorage.hasValidToken.mockReturnValue(false);
    crossTabSyncService.isAvailable.mockReturnValue(true);
    crossTabSyncService.on.mockReturnValue(jest.fn()); // Return unsubscribe function
  });

  describe('AuthProvider', () => {
    it('should provide authentication context', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
    });

    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });

  describe('Authentication Initialization', () => {
    it('should initialize with no authentication when no token exists', async () => {
      secureTokenStorage.retrieveToken.mockReturnValue(null);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBe(null);
    });

    it('should initialize with authentication when valid token exists', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic',
        created: Date.now(),
        expires: Date.now() + 24 * 60 * 60 * 1000
      };

      const mockTokenInfo = {
        type: 'classic',
        expires: new Date(mockToken.expires),
        isValid: true
      };

      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue(mockTokenInfo);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toEqual(mockToken);
      expect(result.current.tokenInfo).toEqual(mockTokenInfo);
    });

    it('should set error state when initialization fails', async () => {
      secureTokenStorage.retrieveToken.mockImplementation(() => {
        throw new Error('Token retrieval failed');
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Token retrieval failed');
    });
  });

  describe('Login', () => {
    it('should successfully login with valid token', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic',
        created: Date.now(),
        expires: Date.now() + 24 * 60 * 60 * 1000
      };

      const mockTokenInfo = {
        type: 'classic',
        expires: new Date(mockToken.expires),
        isValid: true
      };

      secureTokenStorage.storeToken.mockReturnValue(true);
      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue(mockTokenInfo);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      act(() => {
        loginResult = result.current.login('ghp_test123456789012345678901234567890');
      });

      expect(loginResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toEqual(mockToken);
    });

    it('should fail login with invalid token', async () => {
      secureTokenStorage.storeToken.mockReturnValue(false);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      act(() => {
        loginResult = result.current.login('invalid_token');
      });

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid token format');
    });
  });

  describe('Logout', () => {
    it('should successfully logout', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic',
        created: Date.now(),
        expires: Date.now() + 24 * 60 * 60 * 1000
      };

      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue({ isValid: true });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(secureTokenStorage.clearToken).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBe(null);
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should set up cross-tab event listeners', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      renderHook(() => useAuth(), { wrapper });

      expect(crossTabSyncService.on).toHaveBeenCalledWith(
        CrossTabEventTypes.PAT_AUTHENTICATED,
        expect.any(Function)
      );
      expect(crossTabSyncService.on).toHaveBeenCalledWith(
        CrossTabEventTypes.LOGOUT,
        expect.any(Function)
      );
    });

    it('should handle PAT authentication event from another tab', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic',
        created: Date.now(),
        expires: Date.now() + 24 * 60 * 60 * 1000
      };

      let patAuthHandler;
      crossTabSyncService.on.mockImplementation((eventType, handler) => {
        if (eventType === CrossTabEventTypes.PAT_AUTHENTICATED) {
          patAuthHandler = handler;
        }
        return jest.fn();
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate PAT auth event from another tab
      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue({ isValid: true });

      act(() => {
        patAuthHandler({ encryptedData: 'encrypted_token_data' });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should handle logout event from another tab', async () => {
      let logoutHandler;
      crossTabSyncService.on.mockImplementation((eventType, handler) => {
        if (eventType === CrossTabEventTypes.LOGOUT) {
          logoutHandler = handler;
        }
        return jest.fn();
      });

      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic'
      };

      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue({ isValid: true });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simulate logout event from another tab
      act(() => {
        logoutHandler();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBe(null);
    });
  });

  describe('Token Validity Checking', () => {
    it('should check token validity', async () => {
      secureTokenStorage.hasValidToken.mockReturnValue(true);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let isValid;
      act(() => {
        isValid = result.current.checkTokenValidity();
      });

      expect(isValid).toBe(true);
      expect(secureTokenStorage.hasValidToken).toHaveBeenCalled();
    });

    it('should logout when token becomes invalid', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic'
      };

      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo.mockReturnValue({ isValid: true });
      secureTokenStorage.hasValidToken.mockReturnValueOnce(true).mockReturnValue(false);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.checkTokenValidity();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Token Info Refresh', () => {
    it('should refresh token info', async () => {
      const mockTokenInfo = {
        type: 'classic',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isValid: true
      };

      secureTokenStorage.getTokenInfo.mockReturnValue(mockTokenInfo);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshedInfo;
      act(() => {
        refreshedInfo = result.current.refreshTokenInfo();
      });

      expect(refreshedInfo).toEqual(mockTokenInfo);
      expect(result.current.tokenInfo).toEqual(mockTokenInfo);
    });

    it('should logout when token info becomes invalid', async () => {
      const mockToken = {
        token: 'ghp_test123456789012345678901234567890',
        type: 'classic'
      };

      secureTokenStorage.retrieveToken.mockReturnValue(mockToken);
      secureTokenStorage.getTokenInfo
        .mockReturnValueOnce({ isValid: true })
        .mockReturnValue({ isValid: false });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.refreshTokenInfo();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
