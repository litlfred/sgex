/**
 * Service for interacting with GitHub Actions API
 * Provides functionality to fetch workflow runs and trigger workflows
 */

class GitHubActionsService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.owner = 'litlfred';
    this.repo = 'sgex';
    this.workflowFileName = 'pages.yml'; // The build-and-deploy workflow
  }

  /**
   * Set the GitHub token for authenticated requests
   * @param {string} token - GitHub Personal Access Token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Get headers for GitHub API requests
   * @returns {Object} Headers object
   */
  getHeaders() {
    const headers = {
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
   * @returns {Promise<number|null>} Workflow ID or null if not found
   */
  async getWorkflowId() {
    try {
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }

      const data = await response.json();
      console.debug('Available workflows:', data.workflows.map(w => ({ name: w.name, path: w.path })));
      
      // Look for the actual deployment workflows used in this repository
      const workflow = data.workflows.find(w => 
        w.path.includes('branch-deployment.yml') || 
        w.name.includes('Deploy Feature Branch') ||
        w.path.includes('landing-page-deployment.yml') ||
        w.name.includes('Deploy Landing Page') ||
        w.path.includes(this.workflowFileName) || 
        w.name.includes('Multi-Branch GitHub Pages Deployment')
      );

      console.debug('Selected workflow:', workflow ? { name: workflow.name, path: workflow.path, id: workflow.id } : 'None found');
      return workflow ? workflow.id : null;
    } catch (error) {
      console.error('Error fetching workflow ID:', error);
      return null;
    }
  }

  /**
   * Get the latest workflow run for a specific branch
   * @param {string} branch - Branch name
   * @returns {Promise<Object|null>} Workflow run data or null
   */
  async getLatestWorkflowRun(branch) {
    try {
      console.debug(`Looking for workflow runs for branch: ${branch}`);
      
      // For main branch, look for landing page deployment workflow
      // For other branches, look for branch deployment workflow
      const isMainBranch = branch === 'main';
      const workflowName = isMainBranch ? 'Deploy Landing Page' : 'Deploy Feature Branch';
      
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }

      const data = await response.json();
      console.debug('Available workflows:', data.workflows.map(w => ({ name: w.name, path: w.path })));
      
      // Find the appropriate workflow for this branch
      let workflow;
      if (isMainBranch) {
        workflow = data.workflows.find(w => 
          w.name.includes('Deploy Landing Page') ||
          w.path.includes('landing-page-deployment.yml')
        );
      } else {
        workflow = data.workflows.find(w => 
          w.name.includes('Deploy Feature Branch') ||
          w.path.includes('branch-deployment.yml')
        );
      }

      if (!workflow) {
        console.debug(`No ${workflowName} workflow found for branch ${branch}`);
        return null;
      }

      console.debug(`Using workflow: ${workflow.name} (ID: ${workflow.id}) for branch ${branch}`);

      // Get the latest run for this workflow and branch
      const runsResponse = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflow.id}/runs?branch=${encodeURIComponent(branch)}&per_page=5`,
        {
          headers: this.getHeaders()
        }
      );

      if (!runsResponse.ok) {
        throw new Error(`Failed to fetch workflow runs: ${runsResponse.status}`);
      }

      const runsData = await runsResponse.json();
      console.debug(`Found ${runsData.workflow_runs.length} workflow runs for branch ${branch}`);
      
      if (runsData.workflow_runs.length > 0) {
        const latestRun = runsData.workflow_runs[0];
        console.debug(`Latest run: ${latestRun.status}/${latestRun.conclusion} at ${latestRun.created_at}`);
        return latestRun;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching latest workflow run for branch ${branch}:`, error);
      return null;
    }
  }

  /**
   * Get all workflows and their latest runs for a specific branch
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Array of workflow status objects
   */
  async getAllWorkflowsForBranch(branch) {
    try {
      console.debug(`Getting all workflows for branch: ${branch}`);
      
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }

      const data = await response.json();
      console.debug('All available workflows:', data.workflows.map(w => ({ name: w.name, path: w.path, state: w.state })));
      
      // Filter to active workflows that are relevant for this branch
      const relevantWorkflows = data.workflows.filter(w => 
        w.state === 'active' && (
          // Branch-specific workflows
          w.path.includes('branch-deployment.yml') ||
          w.path.includes('landing-page-deployment.yml') ||
          w.name.includes('Deploy Feature Branch') ||
          w.name.includes('Deploy Landing Page') ||
          // Code quality and review workflows
          w.path.includes('code-quality.yml') ||
          w.path.includes('review.yml') ||
          w.path.includes('pr-commit-feedback.yml') ||
          w.path.includes('pr-workflow-failure-notifier.yml') ||
          w.name.includes('Code Quality') ||
          w.name.includes('PR Review') ||
          w.name.includes('PR Commit Feedback') ||
          w.name.includes('PR Workflow Failure') ||
          // General CI/CD workflows that might run on all branches
          w.path.includes('ci.yml') ||
          w.path.includes('test.yml') ||
          w.path.includes('build.yml') ||
          w.name.includes('CI') ||
          w.name.includes('Test') ||
          w.name.includes('Build')
        )
      );

      console.debug(`Found ${relevantWorkflows.length} relevant workflows for branch ${branch}`);

      // Get latest runs for each workflow
      const workflowStatuses = await Promise.all(
        relevantWorkflows.map(async (workflow) => {
          try {
            const runsResponse = await fetch(
              `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflow.id}/runs?branch=${encodeURIComponent(branch)}&per_page=1`,
              {
                headers: this.getHeaders()
              }
            );

            let latestRun = null;
            if (runsResponse.ok) {
              const runsData = await runsResponse.json();
              if (runsData.workflow_runs.length > 0) {
                latestRun = runsData.workflow_runs[0];
              }
            }

            const parsedStatus = this.parseWorkflowStatus(latestRun);
            
            return {
              workflow: {
                id: workflow.id,
                name: workflow.name,
                path: workflow.path,
                url: `https://github.com/${this.owner}/${this.repo}/actions/workflows/${workflow.id}`
              },
              ...parsedStatus,
              lastRunId: latestRun?.id || null,
              workflowUrl: `https://github.com/${this.owner}/${this.repo}/actions/workflows/${workflow.id}`
            };
          } catch (error) {
            console.error(`Error fetching runs for workflow ${workflow.name}:`, error);
            return {
              workflow: {
                id: workflow.id,
                name: workflow.name,
                path: workflow.path,
                url: `https://github.com/${this.owner}/${this.repo}/actions/workflows/${workflow.id}`
              },
              status: 'error',
              conclusion: null,
              url: null,
              runId: null,
              createdAt: null,
              displayStatus: 'Error',
              badgeClass: 'error',
              icon: '❌',
              workflowUrl: `https://github.com/${this.owner}/${this.repo}/actions/workflows/${workflow.id}`
            };
          }
        })
      );

      return workflowStatuses;
    } catch (error) {
      console.error(`Error getting all workflows for branch ${branch}:`, error);
      return [];
    }
  }

  /**
   * Get workflow status for multiple branches
   * @param {Array<string>} branches - Array of branch names
   * @returns {Promise<Object>} Object mapping branch names to workflow status
   */
  async getWorkflowStatusForBranches(branches) {
    const statusMap = {};
    
    for (const branch of branches) {
      try {
        const workflowRun = await this.getLatestWorkflowRun(branch);
        statusMap[branch] = this.parseWorkflowStatus(workflowRun);
      } catch (error) {
        console.error(`Error getting workflow status for branch ${branch}:`, error);
        statusMap[branch] = {
          status: 'unknown',
          conclusion: null,
          url: null,
          runId: null,
          createdAt: null
        };
      }
    }
    
    return statusMap;
  }

  /**
   * Parse workflow run data into a normalized status object
   * @param {Object|null} workflowRun - Workflow run data from GitHub API
   * @returns {Object} Normalized status object
   */
  parseWorkflowStatus(workflowRun) {
    if (!workflowRun) {
      return {
        status: 'not_started',
        conclusion: null,
        url: null,
        runId: null,
        createdAt: null,
        displayStatus: 'Not Started',
        badgeClass: 'not-started',
        icon: '⚪'
      };
    }

    const status = workflowRun.status;
    const conclusion = workflowRun.conclusion;
    
    let displayStatus, badgeClass, icon;

    if (status === 'in_progress' || status === 'queued' || status === 'pending') {
      displayStatus = 'In Progress';
      badgeClass = 'in-progress';
      icon = '🟡';
    } else if (status === 'waiting') {
      // Handle workflows waiting for approval or manual intervention
      displayStatus = 'Awaiting Approval';
      badgeClass = 'waiting';
      icon = '🟠';
    } else if (status === 'requested') {
      // Handle workflows that are requested but haven't started yet
      displayStatus = 'Requested';
      badgeClass = 'requested';
      icon = '🔵';
    } else if (status === 'completed') {
      if (conclusion === 'success') {
        displayStatus = 'Succeeded';
        badgeClass = 'succeeded';
        icon = '🟢';
      } else if (conclusion === 'failure' || conclusion === 'cancelled' || conclusion === 'timed_out') {
        displayStatus = 'Failed';
        badgeClass = 'failed';
        icon = '🔴';
      } else if (conclusion === 'action_required') {
        displayStatus = 'Action Required';
        badgeClass = 'action-required';
        icon = '🟠';
      } else {
        displayStatus = 'Completed';
        badgeClass = 'completed';
        icon = '🟦';
      }
    } else {
      displayStatus = 'Unknown';
      badgeClass = 'unknown';
      icon = '⚫';
    }

    return {
      status,
      conclusion,
      url: workflowRun.html_url,
      runId: workflowRun.id,
      createdAt: new Date(workflowRun.created_at),
      displayStatus,
      badgeClass,
      icon
    };
  }

  /**
   * Trigger a specific workflow by workflow ID for a given branch
   * @param {number} workflowId - The specific workflow ID to trigger
   * @param {string} branch - Branch name to trigger workflow for
   * @returns {Promise<boolean>} Success status
   */
  async triggerSpecificWorkflow(workflowId, branch) {
    try {
      if (!this.token) {
        throw new Error('Authentication required to trigger workflows');
      }

      console.debug(`Triggering specific workflow ID: ${workflowId} for branch: ${branch}`);

      const triggerResponse = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflowId}/dispatches`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            ref: branch,
            inputs: {
              branch: branch
            }
          })
        }
      );

      if (!triggerResponse.ok) {
        const errorText = await triggerResponse.text();
        console.error(`Specific workflow trigger failed:`, {
          status: triggerResponse.status,
          statusText: triggerResponse.statusText,
          error: errorText,
          branch,
          workflowId
        });
        throw new Error(`Failed to trigger workflow: ${triggerResponse.status} ${triggerResponse.statusText} - ${errorText}`);
      }

      console.debug(`Successfully triggered specific workflow ${workflowId} for branch ${branch}`);
      return true;
    } catch (error) {
      console.error(`Error triggering specific workflow ${workflowId} for branch ${branch}:`, error);
      return false;
    }
  }

  /**
   * Trigger a workflow run for a specific branch (legacy method - now calls specific deployment workflows)
   * @param {string} branch - Branch name to trigger workflow for
   * @returns {Promise<boolean>} Success status
   */
  async triggerWorkflow(branch) {
    try {
      if (!this.token) {
        throw new Error('Authentication required to trigger workflows');
      }

      console.debug(`Triggering workflow for branch: ${branch}`);
      
      // For main branch, trigger landing page deployment workflow
      // For other branches, trigger branch deployment workflow
      const isMainBranch = branch === 'main';
      
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`);
      }

      const data = await response.json();
      
      // Find the appropriate workflow for this branch
      let workflow;
      if (isMainBranch) {
        workflow = data.workflows.find(w => 
          w.name.includes('Deploy Landing Page') ||
          w.path.includes('landing-page-deployment.yml')
        );
      } else {
        workflow = data.workflows.find(w => 
          w.name.includes('Deploy Feature Branch') ||
          w.path.includes('branch-deployment.yml')
        );
      }

      if (!workflow) {
        throw new Error(`No deployment workflow found for branch ${branch}`);
      }

      console.debug(`Triggering workflow: ${workflow.name} (ID: ${workflow.id}) for branch ${branch}`);

      const triggerResponse = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows/${workflow.id}/dispatches`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            ref: branch,
            inputs: {
              branch: branch
            }
          })
        }
      );

      if (!triggerResponse.ok) {
        const errorText = await triggerResponse.text();
        console.error(`Workflow trigger failed:`, {
          status: triggerResponse.status,
          statusText: triggerResponse.statusText,
          error: errorText,
          branch,
          workflowId: workflow.id
        });
        throw new Error(`Failed to trigger workflow: ${triggerResponse.status} ${triggerResponse.statusText} - ${errorText}`);
      }

      console.debug(`Successfully triggered workflow for branch ${branch}`);
      return true;
    } catch (error) {
      console.error(`Error triggering workflow for branch ${branch}:`, error);
      return false;
    }
  }

  /**
   * Get the Actions tab URL for the repository
   * @returns {string} GitHub Actions URL
   */
  getActionsURL() {
    return `https://github.com/${this.owner}/${this.repo}/actions`;
  }

  /**
   * Get the workflow URL for a specific workflow
   * @returns {Promise<string|null>} Workflow URL or null
   */
  async getWorkflowURL() {
    try {
      const workflowId = await this.getWorkflowId();
      if (!workflowId) {
        return this.getActionsURL();
      }
      return `https://github.com/${this.owner}/${this.repo}/actions/workflows/${workflowId}`;
    } catch (error) {
      console.error('Error getting workflow URL:', error);
      return this.getActionsURL();
    }
  }

  /**
   * Check if the current token has permission to trigger workflows
   * @returns {Promise<boolean>} Whether user can trigger workflows
   */
  async checkWorkflowTriggerPermissions() {
    try {
      if (!this.token) {
        return false;
      }

      // Try to get the list of workflows - this requires actions read permission at minimum
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/workflows`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        return false;
      }

      // If we can read workflows, we likely can trigger them if we have write access
      // But the actual permission check happens when we try to trigger
      return true;
    } catch (error) {
      console.debug('Cannot check workflow trigger permissions:', error);
      return false;
    }
  }

  /**
   * Check if the current token has permission to approve workflow runs
   * @returns {Promise<boolean>} Whether user can approve workflow runs
   */
  async checkWorkflowApprovalPermissions() {
    try {
      if (!this.token) {
        return false;
      }

      // Check if we can access pending workflow runs that require approval
      // This is a heuristic - actual approval permissions are checked when attempting to approve
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs?status=waiting`,
        {
          headers: this.getHeaders()
        }
      );

      return response.ok;
    } catch (error) {
      console.debug('Cannot check workflow approval permissions:', error);
      return false;
    }
  }

  /**
   * Get jobs for a specific workflow run
   * @param {number} runId - The workflow run ID
   * @returns {Promise<Array|null>} Array of job objects or null if error
   */
  async getWorkflowRunJobs(runId) {
    try {
      if (!runId) {
        return null;
      }

      console.debug(`Getting jobs for workflow run: ${runId}`);
      
      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/jobs`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs for run ${runId}: ${response.status}`);
      }

      const data = await response.json();
      console.debug(`Found ${data.jobs.length} jobs for run ${runId}`);
      
      // Parse job data into normalized objects
      return data.jobs.map(job => this.parseJobStatus(job));
    } catch (error) {
      console.error(`Error fetching jobs for run ${runId}:`, error);
      return null;
    }
  }

  /**
   * Parse job data into a normalized status object
   * @param {Object} job - Job data from GitHub API
   * @returns {Object} Normalized job status object
   */
  parseJobStatus(job) {
    const status = job.status;
    const conclusion = job.conclusion;
    
    let displayStatus, badgeClass, icon;

    if (status === 'in_progress' || status === 'queued' || status === 'pending') {
      displayStatus = 'In Progress';
      badgeClass = 'in-progress';
      icon = '🟡';
    } else if (status === 'waiting') {
      displayStatus = 'Waiting';
      badgeClass = 'waiting';
      icon = '🟠';
    } else if (status === 'completed') {
      if (conclusion === 'success') {
        displayStatus = 'Succeeded';
        badgeClass = 'succeeded';
        icon = '🟢';
      } else if (conclusion === 'failure') {
        displayStatus = 'Failed';
        badgeClass = 'failed';
        icon = '🔴';
      } else if (conclusion === 'cancelled') {
        displayStatus = 'Cancelled';
        badgeClass = 'cancelled';
        icon = '🟡';
      } else if (conclusion === 'timed_out') {
        displayStatus = 'Timed Out';
        badgeClass = 'failed';
        icon = '🔴';
      } else if (conclusion === 'action_required') {
        displayStatus = 'Action Required';
        badgeClass = 'action-required';
        icon = '🟠';
      } else if (conclusion === 'skipped') {
        displayStatus = 'Skipped';
        badgeClass = 'skipped';
        icon = '⚪';
      } else {
        displayStatus = 'Completed';
        badgeClass = 'completed';
        icon = '🟦';
      }
    } else {
      displayStatus = 'Unknown';
      badgeClass = 'unknown';
      icon = '⚫';
    }

    return {
      id: job.id,
      name: job.name,
      status,
      conclusion,
      startedAt: job.started_at ? new Date(job.started_at) : null,
      completedAt: job.completed_at ? new Date(job.completed_at) : null,
      duration: job.started_at && job.completed_at ? 
        Math.round((new Date(job.completed_at) - new Date(job.started_at)) / 1000) : null,
      url: job.html_url,
      runnerName: job.runner_name,
      runnerGroupName: job.runner_group_name,
      displayStatus,
      badgeClass,
      icon,
      steps: job.steps ? job.steps.map(step => this.parseStepStatus(step)) : []
    };
  }

  /**
   * Parse step data into a normalized status object
   * @param {Object} step - Step data from GitHub API
   * @returns {Object} Normalized step status object
   */
  parseStepStatus(step) {
    const status = step.status;
    const conclusion = step.conclusion;
    
    let displayStatus, badgeClass, icon;

    if (status === 'in_progress' || status === 'queued' || status === 'pending') {
      displayStatus = 'In Progress';
      badgeClass = 'in-progress';
      icon = '🟡';
    } else if (status === 'completed') {
      if (conclusion === 'success') {
        displayStatus = 'Succeeded';
        badgeClass = 'succeeded';
        icon = '🟢';
      } else if (conclusion === 'failure') {
        displayStatus = 'Failed';
        badgeClass = 'failed';
        icon = '🔴';
      } else if (conclusion === 'cancelled') {
        displayStatus = 'Cancelled';
        badgeClass = 'cancelled';
        icon = '🟡';
      } else if (conclusion === 'skipped') {
        displayStatus = 'Skipped';
        badgeClass = 'skipped';
        icon = '⚪';
      } else {
        displayStatus = 'Completed';
        badgeClass = 'completed';
        icon = '🟦';
      }
    } else {
      displayStatus = 'Unknown';
      badgeClass = 'unknown';
      icon = '⚫';
    }

    return {
      name: step.name,
      status,
      conclusion,
      number: step.number,
      startedAt: step.started_at ? new Date(step.started_at) : null,
      completedAt: step.completed_at ? new Date(step.completed_at) : null,
      duration: step.started_at && step.completed_at ? 
        Math.round((new Date(step.completed_at) - new Date(step.started_at)) / 1000) : null,
      displayStatus,
      badgeClass,
      icon
    };
  }

  /**
   * Approve a workflow run that requires approval
   * @param {number} runId - The workflow run ID to approve
   * @returns {Promise<boolean>} Success status
   */
  async approveWorkflowRun(runId) {
    try {
      if (!this.token) {
        throw new Error('Authentication required to approve workflow runs');
      }

      console.debug(`Approving workflow run: ${runId}`);

      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/approve`,
        {
          method: 'POST',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Workflow approval failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          runId
        });
        throw new Error(`Failed to approve workflow run: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.debug(`Successfully approved workflow run ${runId}`);
      return true;
    } catch (error) {
      console.error(`Error approving workflow run ${runId}:`, error);
      return false;
    }
  }

  /**
   * Rerun failed jobs in a workflow run
   * @param {number} runId - The workflow run ID to rerun
   * @returns {Promise<boolean>} Success status
   */
  async rerunFailedWorkflow(runId) {
    try {
      if (!this.token) {
        throw new Error('Authentication required to rerun workflow');
      }

      console.debug(`Rerunning failed jobs for workflow run: ${runId}`);

      const response = await fetch(
        `${this.baseURL}/repos/${this.owner}/${this.repo}/actions/runs/${runId}/rerun-failed-jobs`,
        {
          method: 'POST',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Workflow rerun failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          runId
        });
        throw new Error(`Failed to rerun workflow: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.debug(`Successfully reran failed jobs for workflow run ${runId}`);
      return true;
    } catch (error) {
      console.error(`Error rerunning workflow run ${runId}:`, error);
      return false;
    }
  }

  /**
   * Check if the service is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.token;
  }
}

// Create a singleton instance
const githubActionsService = new GitHubActionsService();

export default githubActionsService;