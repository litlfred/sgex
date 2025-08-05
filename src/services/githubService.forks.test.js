import githubService from './githubService';

describe('GitHubService - Fork and PR Methods', () => {
  beforeEach(() => {
    // Reset the service state before each test
    githubService.logout();
  });

  describe('getForks', () => {
    it('should fetch repository forks without authentication', async () => {
      // Test with a public repository
      try {
        const forks = await githubService.getForks('octocat', 'Hello-World');
        
        expect(Array.isArray(forks)).toBe(true);
        
        if (forks.length > 0) {
          const fork = forks[0];
          expect(fork).toHaveProperty('id');
          expect(fork).toHaveProperty('name');
          expect(fork).toHaveProperty('full_name');
          expect(fork).toHaveProperty('owner');
          expect(fork.owner).toHaveProperty('login');
          expect(fork.owner).toHaveProperty('avatar_url');
          expect(fork).toHaveProperty('html_url');
          expect(fork).toHaveProperty('fork', true);
        }
      } catch (error) {
        // If it fails due to rate limiting, that's expected in CI
        if (error.message.includes('rate limit') || error.message.includes('403')) {
          console.warn('Fork test skipped due to API rate limiting');
          return;
        }
        throw error;
      }
    });

    it('should handle repository with no forks', async () => {
      try {
        const forks = await githubService.getForks('nonexistent', 'repo');
        expect(Array.isArray(forks)).toBe(true);
        expect(forks.length).toBe(0);
      } catch (error) {
        // 404 is expected for non-existent repos
        expect(error.message).toContain('Failed to fetch repository forks');
      }
    });
  });

  describe('getPullRequests', () => {
    it('should fetch pull requests without authentication', async () => {
      try {
        const prs = await githubService.getPullRequests('microsoft', 'vscode', { 
          state: 'open', 
          per_page: 5 
        });
        
        expect(Array.isArray(prs)).toBe(true);
        
        if (prs.length > 0) {
          const pr = prs[0];
          expect(pr).toHaveProperty('id');
          expect(pr).toHaveProperty('number');
          expect(pr).toHaveProperty('title');
          expect(pr).toHaveProperty('state');
          expect(pr).toHaveProperty('user');
          expect(pr.user).toHaveProperty('login');
          expect(pr).toHaveProperty('head');
          expect(pr.head).toHaveProperty('ref');
          expect(pr).toHaveProperty('base');
          expect(pr).toHaveProperty('html_url');
        }
      } catch (error) {
        // If it fails due to rate limiting, that's expected in CI
        if (error.message.includes('rate limit') || error.message.includes('403')) {
          console.warn('PR test skipped due to API rate limiting');
          return;
        }
        throw error;
      }
    });

    it('should handle repository with no pull requests', async () => {
      try {
        const prs = await githubService.getPullRequests('nonexistent', 'repo');
        expect(Array.isArray(prs)).toBe(true);
        expect(prs.length).toBe(0);
      } catch (error) {
        // 404 is expected for non-existent repos
        expect(error.message).toContain('Failed to fetch pull requests');
      }
    });

    it('should respect options parameters', async () => {
      const options = {
        state: 'closed',
        sort: 'created',
        direction: 'asc',
        per_page: 10,
        page: 1
      };

      try {
        const prs = await githubService.getPullRequests('microsoft', 'vscode', options);
        expect(Array.isArray(prs)).toBe(true);
        // Should return at most 10 PRs based on per_page
        expect(prs.length).toBeLessThanOrEqual(10);
      } catch (error) {
        if (error.message.includes('rate limit') || error.message.includes('403')) {
          console.warn('PR options test skipped due to API rate limiting');
          return;
        }
        throw error;
      }
    });
  });

  describe('integration scenarios', () => {
    it('should handle the litlfred/sgex repository scenario', async () => {
      try {
        // Test the actual repository we're working with
        const forks = await githubService.getForks('litlfred', 'sgex');
        expect(Array.isArray(forks)).toBe(true);

        const prs = await githubService.getPullRequests('litlfred', 'sgex', { 
          state: 'open',
          per_page: 10 
        });
        expect(Array.isArray(prs)).toBe(true);

        // Test that each PR has the expected structure for our UI
        prs.forEach(pr => {
          expect(pr).toHaveProperty('number');
          expect(pr).toHaveProperty('title');
          expect(pr).toHaveProperty('state');
          expect(pr).toHaveProperty('user.login');
          expect(pr).toHaveProperty('head.ref');
          expect(pr).toHaveProperty('html_url');
          expect(pr).toHaveProperty('created_at');
          expect(pr).toHaveProperty('updated_at');
        });

      } catch (error) {
        if (error.message.includes('rate limit') || error.message.includes('403')) {
          console.warn('Integration test skipped due to API rate limiting');
          return;
        }
        throw error;
      }
    });
  });
});