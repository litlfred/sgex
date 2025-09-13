/**
 * Tests for GitHub Actions Service job fetching functionality
 */

import githubActionsService from './githubActionsService';

// Mock fetch globally
global.fetch = jest.fn();

describe('GitHubActionsService Job Details', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockClear();
    githubActionsService.setToken('test-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getWorkflowRunJobs', () => {
    it('should fetch and parse job details for a workflow run', async () => {
      const mockJobsResponse = {
        jobs: [
          {
            id: 12345,
            name: 'build',
            status: 'completed',
            conclusion: 'success',
            started_at: '2023-12-01T10:00:00Z',
            completed_at: '2023-12-01T10:05:00Z',
            html_url: 'https://github.com/owner/repo/actions/runs/123/jobs/12345',
            runner_name: 'GitHub Actions 2',
            runner_group_name: 'GitHub Actions',
            steps: [
              {
                name: 'Set up job',
                status: 'completed',
                conclusion: 'success',
                number: 1,
                started_at: '2023-12-01T10:00:00Z',
                completed_at: '2023-12-01T10:01:00Z'
              },
              {
                name: 'Build',
                status: 'completed',
                conclusion: 'success',
                number: 2,
                started_at: '2023-12-01T10:01:00Z',
                completed_at: '2023-12-01T10:04:00Z'
              }
            ]
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobsResponse
      });

      const result = await githubActionsService.getWorkflowRunJobs(123);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/litlfred/sgex/actions/runs/123/jobs',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token',
            'Accept': 'application/vnd.github.v3+json'
          })
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 12345,
        name: 'build',
        status: 'completed',
        conclusion: 'success',
        displayStatus: 'Succeeded',
        badgeClass: 'succeeded',
        icon: '🟢',
        duration: 300, // 5 minutes in seconds
        runnerName: 'GitHub Actions 2',
        steps: expect.arrayContaining([
          expect.objectContaining({
            name: 'Set up job',
            displayStatus: 'Succeeded',
            duration: 60
          }),
          expect.objectContaining({
            name: 'Build',
            displayStatus: 'Succeeded',
            duration: 180
          })
        ])
      });
    });

    it('should return null when run ID is not provided', async () => {
      const result = await githubActionsService.getWorkflowRunJobs(null);
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return null and log error when API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await githubActionsService.getWorkflowRunJobs(123);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching jobs for run 123:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await githubActionsService.getWorkflowRunJobs(123);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching jobs for run 123:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('parseJobStatus', () => {
    it('should correctly parse job status for different states', () => {
      const testCases = [
        {
          input: { status: 'in_progress', conclusion: null },
          expected: { displayStatus: 'In Progress', badgeClass: 'in-progress', icon: '🟡' }
        },
        {
          input: { status: 'completed', conclusion: 'success' },
          expected: { displayStatus: 'Succeeded', badgeClass: 'succeeded', icon: '🟢' }
        },
        {
          input: { status: 'completed', conclusion: 'failure' },
          expected: { displayStatus: 'Failed', badgeClass: 'failed', icon: '🔴' }
        },
        {
          input: { status: 'waiting', conclusion: null },
          expected: { displayStatus: 'Waiting', badgeClass: 'waiting', icon: '🟠' }
        },
        {
          input: { status: 'completed', conclusion: 'cancelled' },
          expected: { displayStatus: 'Cancelled', badgeClass: 'cancelled', icon: '🟡' }
        },
        {
          input: { status: 'completed', conclusion: 'skipped' },
          expected: { displayStatus: 'Skipped', badgeClass: 'skipped', icon: '⚪' }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const mockJob = {
          id: 1,
          name: 'test-job',
          status: input.status,
          conclusion: input.conclusion,
          html_url: 'https://example.com',
          steps: []
        };

        const result = githubActionsService.parseJobStatus(mockJob);

        expect(result.displayStatus).toBe(expected.displayStatus);
        expect(result.badgeClass).toBe(expected.badgeClass);
        expect(result.icon).toBe(expected.icon);
      });
    });

    it('should calculate duration correctly when both start and end times are provided', () => {
      const mockJob = {
        id: 1,
        name: 'test-job',
        status: 'completed',
        conclusion: 'success',
        started_at: '2023-12-01T10:00:00Z',
        completed_at: '2023-12-01T10:05:30Z', // 5 minutes 30 seconds later
        html_url: 'https://example.com',
        steps: []
      };

      const result = githubActionsService.parseJobStatus(mockJob);

      expect(result.duration).toBe(330); // 5 minutes 30 seconds = 330 seconds
    });

    it('should handle missing start or end times gracefully', () => {
      const mockJob = {
        id: 1,
        name: 'test-job',
        status: 'in_progress',
        conclusion: null,
        started_at: '2023-12-01T10:00:00Z',
        completed_at: null,
        html_url: 'https://example.com',
        steps: []
      };

      const result = githubActionsService.parseJobStatus(mockJob);

      expect(result.duration).toBeNull();
    });
  });

  describe('parseStepStatus', () => {
    it('should correctly parse step status', () => {
      const mockStep = {
        name: 'Test Step',
        status: 'completed',
        conclusion: 'success',
        number: 1,
        started_at: '2023-12-01T10:00:00Z',
        completed_at: '2023-12-01T10:02:00Z'
      };

      const result = githubActionsService.parseStepStatus(mockStep);

      expect(result).toMatchObject({
        name: 'Test Step',
        status: 'completed',
        conclusion: 'success',
        number: 1,
        displayStatus: 'Succeeded',
        badgeClass: 'succeeded',
        icon: '🟢',
        duration: 120 // 2 minutes
      });
    });
  });
});