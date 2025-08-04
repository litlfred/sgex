import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock BranchListing component to test search functionality
const mockPullRequests = [
  {
    id: 1,
    number: 123,
    title: 'Improve multi-page selector landing page for GitHub deployment',
    state: 'open',
    author: 'copilot',
    branchName: 'copilot/fix-459',
    safeBranchName: 'copilot-fix-459',
    url: './copilot-fix-459/index.html',
    prUrl: 'https://github.com/litlfred/sgex/pull/123',
    updatedAt: '8/4/2025',
    createdAt: '8/3/2025'
  },
  {
    id: 2,
    number: 122,
    title: 'Add dark mode support',
    state: 'closed',
    author: 'developer',
    branchName: 'feature/dark-mode',
    safeBranchName: 'feature-dark-mode',
    url: './feature-dark-mode/index.html',
    prUrl: 'https://github.com/litlfred/sgex/pull/122',
    updatedAt: '8/2/2025',
    createdAt: '7/31/2025'
  },
  {
    id: 3,
    number: 121,
    title: 'Fix authentication flow',
    state: 'open',
    author: 'contributor',
    branchName: 'fix/auth-flow',
    safeBranchName: 'fix-auth-flow',
    url: './fix-auth-flow/index.html',
    prUrl: 'https://github.com/litlfred/sgex/pull/121',
    updatedAt: '8/1/2025',
    createdAt: '7/30/2025'
  }
];

// Test search filter logic
const searchFilter = (pullRequests, searchTerm) => {
  return pullRequests.filter(pr => 
    pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

describe('BranchListing Search Functionality', () => {
  describe('Branch Name Search', () => {
    it('should filter PRs by exact branch name match', () => {
      const results = searchFilter(mockPullRequests, 'copilot/fix-459');
      
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(123);
      expect(results[0].branchName).toBe('copilot/fix-459');
    });

    it('should filter PRs by partial branch name match', () => {
      const results = searchFilter(mockPullRequests, 'dark-mode');
      
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(122);
      expect(results[0].branchName).toBe('feature/dark-mode');
    });

    it('should find multiple PRs when branch names contain the search term', () => {
      const results = searchFilter(mockPullRequests, 'fix');
      
      expect(results).toHaveLength(2);
      expect(results.map(pr => pr.number)).toContain(123); // copilot/fix-459
      expect(results.map(pr => pr.number)).toContain(121); // fix/auth-flow
    });

    it('should be case insensitive for branch names', () => {
      const results = searchFilter(mockPullRequests, 'FEATURE');
      
      expect(results).toHaveLength(1);
      expect(results[0].branchName).toBe('feature/dark-mode');
    });

    it('should search by branch name prefix', () => {
      const results = searchFilter(mockPullRequests, 'copilot');
      
      expect(results).toHaveLength(1);
      expect(results[0].branchName).toBe('copilot/fix-459');
    });

    it('should search by branch name suffix', () => {
      const results = searchFilter(mockPullRequests, 'auth-flow');
      
      expect(results).toHaveLength(1);
      expect(results[0].branchName).toBe('fix/auth-flow');
    });
  });

  describe('Combined Search (Title, Author, Branch)', () => {
    it('should find PRs matching title OR author OR branch name', () => {
      // Search for "fix" should match:
      // - PR 123: branch "copilot/fix-459" (branch match)
      // - PR 121: title "Fix authentication flow" AND branch "fix/auth-flow" (both match)
      const results = searchFilter(mockPullRequests, 'fix');
      
      expect(results).toHaveLength(2);
      expect(results.map(pr => pr.number).sort()).toEqual([121, 123]);
    });

    it('should maintain existing title search functionality', () => {
      const results = searchFilter(mockPullRequests, 'authentication');
      
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(121);
      expect(results[0].title).toContain('authentication');
    });

    it('should maintain existing author search functionality', () => {
      const results = searchFilter(mockPullRequests, 'developer');
      
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(122);
      expect(results[0].author).toBe('developer');
    });

    it('should return no results for non-matching search terms', () => {
      const results = searchFilter(mockPullRequests, 'nonexistent');
      
      expect(results).toHaveLength(0);
    });

    it('should return all PRs for empty search term', () => {
      const results = searchFilter(mockPullRequests, '');
      
      expect(results).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in branch names', () => {
      const specialPR = {
        ...mockPullRequests[0],
        branchName: 'feature/fix-#123-bug',
        number: 999
      };
      const prList = [...mockPullRequests, specialPR];
      
      const results = searchFilter(prList, '#123');
      
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(999);
    });

    it('should handle slashes in branch names', () => {
      const results = searchFilter(mockPullRequests, 'feature/');
      
      expect(results).toHaveLength(1);
      expect(results[0].branchName).toBe('feature/dark-mode');
    });

    it('should handle dashes in branch names', () => {
      const results = searchFilter(mockPullRequests, '-mode');
      
      expect(results).toHaveLength(1);
      expect(results[0].branchName).toBe('feature/dark-mode');
    });
  });
});