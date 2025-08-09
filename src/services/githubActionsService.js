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
   * Trigger a workflow run for a specific branch
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