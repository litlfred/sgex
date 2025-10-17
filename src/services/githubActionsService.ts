/**
 * Service for interacting with GitHub Actions API
 * Provides functionality to fetch workflow runs and trigger workflows
 * 
 * @module githubActionsService
 */

import repositoryConfig from '../config/repositoryConfig';

/**
 * Workflow run
 * @example { "id": 123456, "status": "completed", "conclusion": "success" }
 */
export interface WorkflowRun {
  /** Run ID */
  id: number;
  /** Run name */
  name: string;
  /** Head branch */
  head_branch: string;
  /** Head SHA */
  head_sha: string;
  /** Run status */
  status: 'queued' | 'in_progress' | 'completed';
  /** Run conclusion */
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped' | 'neutral';
  /** Workflow ID */
  workflow_id: number;
  /** Created at */
  created_at: string;
  /** Updated at */
  updated_at: string;
  /** HTML URL */
  html_url: string;
  /** Logs URL */
  logs_url: string;
}

/**
 * Workflow
 */
export interface Workflow {
  /** Workflow ID */
  id: number;
  /** Workflow name */
  name: string;
  /** Workflow path */
  path: string;
  /** Workflow state */
  state: 'active' | 'disabled' | 'deleted';
  /** Created at */
  created_at: string;
  /** Updated at */
  updated_at: string;
}

/**
 * Workflow job
 */
export interface WorkflowJob {
  /** Job ID */
  id: number;
  /** Run ID */
  run_id: number;
  /** Job name */
  name: string;
  /** Job status */
  status: 'queued' | 'in_progress' | 'completed';
  /** Job conclusion */
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped';
  /** Started at */
  started_at: string;
  /** Completed at */
  completed_at?: string;
  /** HTML URL */
  html_url: string;
}

/**
 * Workflow dispatch input
 */
export interface WorkflowDispatchInput {
  /** Branch to run workflow on */
  ref: string;
  /** Input parameters */
  inputs?: Record<string, string>;
}

/**
 * GitHub Actions Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     WorkflowRun:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [queued, in_progress, completed]
 */
class GitHubActionsService {
  private baseURL: string;
  private workflowFileName: string;
  private token?: string;

  constructor() {
    this.baseURL = 'https://api.github.com';
    this.workflowFileName = 'pages.yml'; // The build-and-deploy workflow
  }

  /**
   * Get the repository owner
   */
  get owner(): string {
    return repositoryConfig.getOwner();
  }

  /**
   * Get the repository name
   */
  get repo(): string {
    return repositoryConfig.getName();
  }

  /**
   * Set the GitHub token for authenticated requests
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get headers for GitHub API requests
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Get the workflow ID for the build-and-deploy workflow
   */
  async getWorkflowId(): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.statusText}`);
      }

      const data = await response.json();
      const workflow = data.workflows?.find((w: Workflow) => 
        w.path.includes(this.workflowFileName)
      );

      return workflow ? workflow.id : null;
    } catch (error) {
      console.error('Error fetching workflow ID:', error);
      return null;
    }
  }

  /**
   * Get workflow runs for a specific workflow
   */
  async getWorkflowRuns(workflowId: number, branch?: string, perPage: number = 10): Promise<WorkflowRun[]> {
    try {
      let url = `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflowId}/runs?per_page=${perPage}`;
      
      if (branch) {
        url += `&branch=${encodeURIComponent(branch)}`;
      }

      const response = await fetch(url, { headers: this.getHeaders() });

      if (!response.ok) {
        throw new Error(`Failed to fetch workflow runs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.workflow_runs || [];
    } catch (error) {
      console.error('Error fetching workflow runs:', error);
      return [];
    }
  }

  /**
   * Get latest workflow run for a branch
   */
  async getLatestWorkflowRun(branch: string): Promise<WorkflowRun | null> {
    try {
      const workflowId = await this.getWorkflowId();
      if (!workflowId) {
        return null;
      }

      const runs = await this.getWorkflowRuns(workflowId, branch, 1);
      return runs.length > 0 ? runs[0] : null;
    } catch (error) {
      console.error('Error fetching latest workflow run:', error);
      return null;
    }
  }

  /**
   * Get jobs for a workflow run
   */
  async getWorkflowJobs(runId: number): Promise<WorkflowJob[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/jobs`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflow jobs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error fetching workflow jobs:', error);
      return [];
    }
  }

  /**
   * Trigger a workflow
   */
  async triggerWorkflow(workflowId: number, input: WorkflowDispatchInput): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflowId}/dispatches`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(input)
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return false;
    }
  }

  /**
   * Cancel a workflow run
   */
  async cancelWorkflowRun(runId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/cancel`,
        {
          method: 'POST',
          headers: this.getHeaders()
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error cancelling workflow run:', error);
      return false;
    }
  }

  /**
   * Get workflow run logs
   */
  async getWorkflowRunLogs(runId: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/logs`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error fetching workflow logs:', error);
      return null;
    }
  }

  /**
   * Check if workflow is running
   */
  isWorkflowRunning(run: WorkflowRun): boolean {
    return run.status === 'queued' || run.status === 'in_progress';
  }

  /**
   * Check if workflow succeeded
   */
  isWorkflowSuccessful(run: WorkflowRun): boolean {
    return run.status === 'completed' && run.conclusion === 'success';
  }

  /**
   * Check if workflow failed
   */
  isWorkflowFailed(run: WorkflowRun): boolean {
    return run.status === 'completed' && (run.conclusion === 'failure' || run.conclusion === 'cancelled');
  }
}

// Export singleton instance
const githubActionsService = new GitHubActionsService();
export default githubActionsService;
