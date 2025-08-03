/**
 * Integration test for BranchListing caching functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BranchListing from '../components/BranchListing';
import branchListingCacheService from '../services/branchListingCacheService';

// Mock GitHub API responses
const mockPRData = [
  {
    id: 1,
    number: 123,
    title: 'Test PR',
    state: 'open',
    user: { login: 'testuser' },
    head: { ref: 'test-branch' },
    html_url: 'https://github.com/litlfred/sgex/pull/123',
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const mockBranchData = [
  {
    name: 'main',
    commit: {
      sha: 'abc123',
      commit: {
        committer: {
          date: new Date().toISOString()
        }
      }
    }
  }
];

// Mock fetch
global.fetch = jest.fn();

// Mock GitHub Actions service
jest.mock('../services/githubActionsService', () => ({
  setToken: jest.fn(),
  getWorkflowStatusForBranches: jest.fn(() => Promise.resolve({})),
  triggerWorkflow: jest.fn(() => Promise.resolve(true))
}));

// Mock hooks
jest.mock('../hooks/useThemeImage', () => ({
  __esModule: true,
  default: () => '/mock-mascot.png'
}));

describe('BranchListing Caching Integration', () => {
  beforeEach(() => {
    // Clear cache before each test
    branchListingCacheService.clearAllCaches();
    jest.clearAllMocks();
    
    // Reset fetch mock
    fetch.mockClear();
  });

  test('should cache PR data after initial fetch', async () => {
    // Setup fetch mocks
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranchData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRData)
      });

    // Render component
    render(
      <MemoryRouter>
        <BranchListing />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('#123: Test PR')).toBeInTheDocument();
    });

    // Verify cache contains data
    const cachedData = branchListingCacheService.getCachedData('litlfred', 'sgex');
    expect(cachedData).not.toBeNull();
    expect(cachedData.pullRequests).toHaveLength(1);
    expect(cachedData.pullRequests[0].title).toBe('Test PR');
  });

  test('should use cached data on subsequent renders', async () => {
    // Pre-populate cache
    const testPRs = [{
      name: 'main',
      safeName: 'main',
      commit: { sha: 'cached123' },
      url: './main/index.html',
      lastModified: new Date().toLocaleDateString()
    }];
    
    const testBranches = [{
      id: 1,
      number: 124,
      title: 'Cached PR',
      state: 'open',
      author: 'cacheduser',
      branchName: 'cached-branch',
      safeBranchName: 'cached-branch',
      url: './cached-branch/index.html',
      prUrl: 'https://github.com/litlfred/sgex/pull/124',
      updatedAt: new Date().toLocaleDateString(),
      createdAt: new Date(Date.now() - 86400000).toLocaleDateString()
    }];

    branchListingCacheService.setCachedData('litlfred', 'sgex', testPRs, testBranches);

    // Render component
    render(
      <MemoryRouter>
        <BranchListing />
      </MemoryRouter>
    );

    // Wait for cached data to load
    await waitFor(() => {
      expect(screen.getByText('#124: Cached PR')).toBeInTheDocument();
    });

    // Verify fetch was not called (using cache)
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should show cache status information', async () => {
    // Pre-populate cache with recent data
    const testPRs = [];
    const testBranches = [{
      id: 1,
      number: 125,
      title: 'Cache Status Test PR',
      state: 'open',
      author: 'testuser',
      branchName: 'test-cache-status',
      safeBranchName: 'test-cache-status',
      url: './test-cache-status/index.html',
      prUrl: 'https://github.com/litlfred/sgex/pull/125',
      updatedAt: new Date().toLocaleDateString(),
      createdAt: new Date().toLocaleDateString()
    }];

    branchListingCacheService.setCachedData('litlfred', 'sgex', testPRs, testBranches);

    // Render component
    render(
      <MemoryRouter>
        <BranchListing />
      </MemoryRouter>
    );

    // Wait for cache status to appear
    await waitFor(() => {
      expect(screen.getByText(/📊 Data cached/)).toBeInTheDocument();
      expect(screen.getByText(/Refresh/)).toBeInTheDocument();
    });
  });

  test('should expire stale cache after 5 minutes', () => {
    // Create stale cache data (6 minutes old)
    const staleTimestamp = Date.now() - (6 * 60 * 1000);
    const staleData = {
      branches: [],
      pullRequests: [],
      timestamp: staleTimestamp,
      owner: 'litlfred',
      repo: 'sgex'
    };

    // Manually set stale data in localStorage
    localStorage.setItem('sgex_branch_listing_cache_litlfred_sgex', JSON.stringify(staleData));

    // Try to get cached data
    const cachedData = branchListingCacheService.getCachedData('litlfred', 'sgex');

    // Should return null for stale data
    expect(cachedData).toBeNull();
    
    // Should remove stale data from localStorage
    expect(localStorage.getItem('sgex_branch_listing_cache_litlfred_sgex')).toBeNull();
  });

  test('should provide cache info correctly', () => {
    // Cache some test data
    const testPRs = [];
    const testBranches = [{
      id: 1,
      number: 126,
      title: 'Cache Info Test',
      state: 'open'
    }];

    branchListingCacheService.setCachedData('litlfred', 'sgex', testPRs, testBranches);

    // Get cache info
    const cacheInfo = branchListingCacheService.getCacheInfo('litlfred', 'sgex');

    expect(cacheInfo.exists).toBe(true);
    expect(cacheInfo.stale).toBe(false);
    expect(cacheInfo.prCount).toBe(1);
    expect(cacheInfo.ageMinutes).toBe(0);
  });

  test('should clear cache on force refresh', () => {
    // Cache some test data
    branchListingCacheService.setCachedData('litlfred', 'sgex', [], []);
    
    // Verify data is cached
    expect(branchListingCacheService.getCachedData('litlfred', 'sgex')).not.toBeNull();
    
    // Force refresh
    branchListingCacheService.forceRefresh('litlfred', 'sgex');
    
    // Verify cache is cleared
    expect(branchListingCacheService.getCachedData('litlfred', 'sgex')).toBeNull();
  });
});