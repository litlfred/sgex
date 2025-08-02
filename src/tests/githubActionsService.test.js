import githubActionsService from '../services/githubActionsService';

// Mock fetch
global.fetch = jest.fn();

describe('GitHubActionsService', () => {
  beforeEach(() => {
    fetch.mockClear();
    githubActionsService.setToken('test-token');
  });

  describe('getWorkflowId', () => {
    test('returns workflow ID when found by filename', async () => {
      const mockResponse = {
        workflows: [
          {
            id: 123,
            name: 'Some Other Workflow',
            path: '.github/workflows/other.yml'
          },
          {
            id: 456,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/pages.yml'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const workflowId = await githubActionsService.getWorkflowId();
      expect(workflowId).toBe(456);
    });

    test('returns workflow ID when found by name', async () => {
      const mockResponse = {
        workflows: [
          {
            id: 123,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/deploy.yml'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const workflowId = await githubActionsService.getWorkflowId();
      expect(workflowId).toBe(123);
    });

    test('returns null when workflow not found', async () => {
      const mockResponse = {
        workflows: [
          {
            id: 123,
            name: 'Other Workflow',
            path: '.github/workflows/other.yml'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const workflowId = await githubActionsService.getWorkflowId();
      expect(workflowId).toBe(null);
    });
  });

  describe('parseWorkflowStatus', () => {
    test('returns not_started for null workflow run', () => {
      const status = githubActionsService.parseWorkflowStatus(null);
      expect(status).toEqual({
        status: 'not_started',
        conclusion: null,
        url: null,
        runId: null,
        createdAt: null,
        displayStatus: 'Not Started',
        badgeClass: 'not-started',
        icon: '⚪'
      });
    });

    test('returns in_progress for running workflow', () => {
      const workflowRun = {
        status: 'in_progress',
        conclusion: null,
        html_url: 'https://github.com/litlfred/sgex/actions/runs/123',
        id: 123,
        created_at: '2023-01-01T10:00:00Z'
      };

      const status = githubActionsService.parseWorkflowStatus(workflowRun);
      expect(status).toEqual({
        status: 'in_progress',
        conclusion: null,
        url: 'https://github.com/litlfred/sgex/actions/runs/123',
        runId: 123,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        displayStatus: 'In Progress',
        badgeClass: 'in-progress',
        icon: '🟡'
      });
    });

    test('returns succeeded for successful workflow', () => {
      const workflowRun = {
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/litlfred/sgex/actions/runs/456',
        id: 456,
        created_at: '2023-01-01T10:00:00Z'
      };

      const status = githubActionsService.parseWorkflowStatus(workflowRun);
      expect(status).toEqual({
        status: 'completed',
        conclusion: 'success',
        url: 'https://github.com/litlfred/sgex/actions/runs/456',
        runId: 456,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        displayStatus: 'Succeeded',
        badgeClass: 'succeeded',
        icon: '🟢'
      });
    });

    test('returns failed for failed workflow', () => {
      const workflowRun = {
        status: 'completed',
        conclusion: 'failure',
        html_url: 'https://github.com/litlfred/sgex/actions/runs/789',
        id: 789,
        created_at: '2023-01-01T10:00:00Z'
      };

      const status = githubActionsService.parseWorkflowStatus(workflowRun);
      expect(status).toEqual({
        status: 'completed',
        conclusion: 'failure',
        url: 'https://github.com/litlfred/sgex/actions/runs/789',
        runId: 789,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        displayStatus: 'Failed',
        badgeClass: 'failed',
        icon: '🔴'
      });
    });

    test('returns failed for cancelled workflow', () => {
      const workflowRun = {
        status: 'completed',
        conclusion: 'cancelled',
        html_url: 'https://github.com/litlfred/sgex/actions/runs/999',
        id: 999,
        created_at: '2023-01-01T10:00:00Z'
      };

      const status = githubActionsService.parseWorkflowStatus(workflowRun);
      expect(status.displayStatus).toBe('Failed');
      expect(status.badgeClass).toBe('failed');
      expect(status.icon).toBe('🔴');
    });

    test('returns in_progress for queued workflow', () => {
      const workflowRun = {
        status: 'queued',
        conclusion: null,
        html_url: 'https://github.com/litlfred/sgex/actions/runs/111',
        id: 111,
        created_at: '2023-01-01T10:00:00Z'
      };

      const status = githubActionsService.parseWorkflowStatus(workflowRun);
      expect(status.displayStatus).toBe('In Progress');
      expect(status.badgeClass).toBe('in-progress');
      expect(status.icon).toBe('🟡');
    });
  });

  describe('triggerWorkflow', () => {
    test('successfully triggers workflow', async () => {
      // Mock getWorkflowId
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflows: [{
            id: 456,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/pages.yml'
          }]
        })
      });

      // Mock trigger workflow
      fetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await githubActionsService.triggerWorkflow('test-branch');
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/litlfred/sgex/actions/workflows/456/dispatches',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Authorization': 'token test-token'
          },
          body: JSON.stringify({
            ref: 'test-branch'
          })
        }
      );
    });

    test('fails when no token provided', async () => {
      githubActionsService.setToken(null);
      
      const result = await githubActionsService.triggerWorkflow('test-branch');
      expect(result).toBe(false);
    });

    test('fails when workflow not found', async () => {
      // Mock getWorkflowId returning null
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflows: []
        })
      });

      const result = await githubActionsService.triggerWorkflow('test-branch');
      expect(result).toBe(false);
    });
  });

  describe('getLatestWorkflowRun', () => {
    test('returns latest workflow run for branch', async () => {
      const mockWorkflowRun = {
        id: 123,
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/litlfred/sgex/actions/runs/123',
        created_at: '2023-01-01T10:00:00Z'
      };

      // Mock getWorkflowId
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflows: [{
            id: 456,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/pages.yml'
          }]
        })
      });

      // Mock workflow runs
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflow_runs: [mockWorkflowRun]
        })
      });

      const result = await githubActionsService.getLatestWorkflowRun('test-branch');
      expect(result).toEqual(mockWorkflowRun);
    });

    test('returns null when no workflow runs found', async () => {
      // Mock getWorkflowId
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflows: [{
            id: 456,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/pages.yml'
          }]
        })
      });

      // Mock empty workflow runs
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflow_runs: []
        })
      });

      const result = await githubActionsService.getLatestWorkflowRun('test-branch');
      expect(result).toBe(null);
    });
  });

  describe('getWorkflowStatusForBranches', () => {
    test('returns status for multiple branches', async () => {
      const branches = ['main', 'feature-branch'];
      
      // Mock getWorkflowId (called once per branch)
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            workflows: [{
              id: 456,
              name: 'Safe Multi-Branch GitHub Pages Deployment',
              path: '.github/workflows/pages.yml'
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            workflow_runs: [{
              id: 123,
              status: 'completed',
              conclusion: 'success',
              html_url: 'https://github.com/litlfred/sgex/actions/runs/123',
              created_at: '2023-01-01T10:00:00Z'
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            workflows: [{
              id: 456,
              name: 'Safe Multi-Branch GitHub Pages Deployment',
              path: '.github/workflows/pages.yml'
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            workflow_runs: []
          })
        });

      const result = await githubActionsService.getWorkflowStatusForBranches(branches);
      
      expect(result).toHaveProperty('main');
      expect(result).toHaveProperty('feature-branch');
      expect(result.main.displayStatus).toBe('Succeeded');
      expect(result['feature-branch'].displayStatus).toBe('Not Started');
    });
  });

  describe('authentication', () => {
    test('isAuthenticated returns true when token is set', () => {
      githubActionsService.setToken('test-token');
      expect(githubActionsService.isAuthenticated()).toBe(true);
    });

    test('isAuthenticated returns false when token is null', () => {
      githubActionsService.setToken(null);
      expect(githubActionsService.isAuthenticated()).toBe(false);
    });
  });

  describe('URLs', () => {
    test('getActionsURL returns correct URL', () => {
      const url = githubActionsService.getActionsURL();
      expect(url).toBe('https://github.com/litlfred/sgex/actions');
    });

    test('getWorkflowURL returns workflow-specific URL', async () => {
      // Mock getWorkflowId
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workflows: [{
            id: 456,
            name: 'Safe Multi-Branch GitHub Pages Deployment',
            path: '.github/workflows/pages.yml'
          }]
        })
      });

      const url = await githubActionsService.getWorkflowURL();
      expect(url).toBe('https://github.com/litlfred/sgex/actions/workflows/456');
    });
  });
});