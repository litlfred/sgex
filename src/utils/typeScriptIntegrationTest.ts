/**
 * Simple test to verify that TypeScript files can import and be imported by JavaScript files
 */

// Import from TypeScript files
import { getThemeImagePath } from '../utils/themeUtils';
import localStorageService from '../services/localStorageService';
import type { GitHubUser, LoadingState } from '../types/common';

// Import from JavaScript files (existing)
import logger from '../utils/logger';

// Test TypeScript functionality
const testTypeScriptIntegration = (): void => {
  console.log('Testing TypeScript integration...');
  
  // Test utility function with TypeScript
  const imagePath: string = getThemeImagePath('test-image.png');
  console.log('Theme image path:', imagePath);
  
  // Test service with TypeScript
  const hasLocalChanges: boolean = localStorageService.hasLocalChanges();
  console.log('Has local changes:', hasLocalChanges);
  
  // Test type definitions
  const mockUser: GitHubUser = {
    login: 'testuser',
    id: 123,
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
    type: 'User'
  };
  
  const currentState: LoadingState = 'idle';
  
  console.log('Mock user:', mockUser);
  console.log('Current state:', currentState);
  
  // Test importing from JavaScript (existing logger)
  const testLogger = logger.getLogger('TypeScriptTest');
  testLogger.info('TypeScript integration test completed successfully');
};

export default testTypeScriptIntegration;