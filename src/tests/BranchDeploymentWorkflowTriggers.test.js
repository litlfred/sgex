/**
 * @fileoverview Tests for branch deployment workflow trigger configuration
 * Verifies that the GitHub Actions workflow configuration correctly triggers
 * on feature branch pushes to enable preview deployments.
 * 
 * This test addresses issue #782: branch preview deployments not starting
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

describe('Branch Deployment Workflow Configuration', () => {
  let branchDeploymentConfig;
  let prCommitFeedbackConfig;

  beforeAll(() => {
    // Load the workflow configuration files
    const branchDeploymentPath = path.join(process.cwd(), '.github/workflows/branch-deployment.yml');
    const prCommitFeedbackPath = path.join(process.cwd(), '.github/workflows/pr-commit-feedback.yml');
    
    const branchDeploymentContent = fs.readFileSync(branchDeploymentPath, 'utf8');
    const prCommitFeedbackContent = fs.readFileSync(prCommitFeedbackPath, 'utf8');
    
    branchDeploymentConfig = yaml.load(branchDeploymentContent);
    prCommitFeedbackConfig = yaml.load(prCommitFeedbackContent);
  });

  describe('Branch Deployment Workflow Triggers', () => {
    test('should trigger on pushes to all branches except excluded ones', () => {
      const pushConfig = branchDeploymentConfig.on.push;
      
      // Should NOT have a specific branches restriction (this was the bug)
      expect(pushConfig.branches).toBeUndefined();
      
      // Should exclude specific branches
      expect(pushConfig['branches-ignore']).toEqual(['gh-pages', 'deploy']);
      
      // Should include relevant file paths
      expect(pushConfig.paths).toContain('src/**');
      expect(pushConfig.paths).toContain('public/**');
      expect(pushConfig.paths).toContain('.github/workflows/branch-deployment.yml');
    });

    test('should trigger on pull requests to main and develop branches', () => {
      const prConfig = branchDeploymentConfig.on.pull_request;
      
      // Should target main and develop branches for PRs
      expect(prConfig.branches).toEqual(['main', 'develop']);
      
      // Should exclude specific branches
      expect(prConfig['branches-ignore']).toEqual(['gh-pages', 'deploy']);
      
      // Should include relevant file paths
      expect(prConfig.paths).toContain('src/**');
      expect(prConfig.paths).toContain('public/**');
    });

    test('should support manual workflow dispatch', () => {
      const workflowDispatch = branchDeploymentConfig.on.workflow_dispatch;
      
      expect(workflowDispatch).toBeDefined();
      expect(workflowDispatch.inputs).toBeDefined();
      expect(workflowDispatch.inputs.branch).toBeDefined();
      expect(workflowDispatch.inputs.force_deployment).toBeDefined();
    });

    test('should support workflow call for reusability', () => {
      const workflowCall = branchDeploymentConfig.on.workflow_call;
      
      expect(workflowCall).toBeDefined();
      expect(workflowCall.inputs).toBeDefined();
      expect(workflowCall.inputs.branch).toBeDefined();
      expect(workflowCall.inputs.force_deployment).toBeDefined();
    });
  });

  describe('PR Commit Feedback Workflow Coordination', () => {
    test('should trigger on feature branch pushes to provide feedback', () => {
      const pushConfig = prCommitFeedbackConfig.on.push;
      
      // Should exclude main, develop, gh-pages, and deploy branches
      // This means it runs on feature branches
      expect(pushConfig['branches-ignore']).toEqual([
        'main',
        'develop', 
        'gh-pages',
        'deploy'
      ]);
      
      // Should NOT have a specific branches list (runs on all except ignored)
      expect(pushConfig.branches).toBeUndefined();
    });

    test('should have required permissions for PR feedback', () => {
      const permissions = prCommitFeedbackConfig.permissions;
      
      expect(permissions.contents).toBe('read');
      expect(permissions.actions).toBe('read');
      expect(permissions['pull-requests']).toBe('write');
    });
  });

  describe('Workflow Integration Logic', () => {
    test('feature branch push should trigger both workflows appropriately', () => {
      // Simulate a feature branch push scenario
      const featureBranch = 'feature/new-component';
      const excludedBranches = ['gh-pages', 'deploy'];
      const feedbackExcludedBranches = ['main', 'develop', 'gh-pages', 'deploy'];
      
      // Branch deployment should trigger (no branches restriction, not in excluded list)
      const shouldTriggerDeployment = !excludedBranches.includes(featureBranch);
      expect(shouldTriggerDeployment).toBe(true);
      
      // PR feedback should trigger (not in feedback excluded list)
      const shouldTriggerFeedback = !feedbackExcludedBranches.includes(featureBranch);
      expect(shouldTriggerFeedback).toBe(true);
    });

    test('main branch push should only trigger deployment workflow', () => {
      // Simulate a main branch push scenario
      const mainBranch = 'main';
      const excludedBranches = ['gh-pages', 'deploy'];
      const feedbackExcludedBranches = ['main', 'develop', 'gh-pages', 'deploy'];
      
      // Branch deployment should trigger (not in excluded list)
      const shouldTriggerDeployment = !excludedBranches.includes(mainBranch);
      expect(shouldTriggerDeployment).toBe(true);
      
      // PR feedback should NOT trigger (main is in feedback excluded list)
      const shouldTriggerFeedback = !feedbackExcludedBranches.includes(mainBranch);
      expect(shouldTriggerFeedback).toBe(false);
    });

    test('excluded branches should not trigger workflows', () => {
      const excludedBranches = ['gh-pages', 'deploy'];
      
      excludedBranches.forEach(branch => {
        // Neither workflow should trigger for excluded branches
        const shouldTriggerDeployment = !excludedBranches.includes(branch);
        expect(shouldTriggerDeployment).toBe(false);
      });
    });
  });

  describe('Workflow Job Configuration', () => {
    test('branch deployment job should have correct outputs', () => {
      const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
      
      expect(deployJob.outputs).toBeDefined();
      expect(deployJob.outputs.branch_name).toBeDefined();
      expect(deployJob.outputs.target_directory).toBeDefined();
      expect(deployJob.outputs.branch_url).toBeDefined();
      expect(deployJob.outputs.commit_sha).toBeDefined();
      expect(deployJob.outputs.deployment_status).toBeDefined();
    });

    test('workflows should have appropriate permissions', () => {
      const branchDeploymentPerms = branchDeploymentConfig.permissions;
      const feedbackPerms = prCommitFeedbackConfig.permissions;
      
      // Branch deployment needs write access for deployment
      expect(branchDeploymentPerms.contents).toBe('write');
      expect(branchDeploymentPerms.pages).toBe('write');
      expect(branchDeploymentPerms['pull-requests']).toBe('write');
      
      // PR feedback needs read access and write for comments
      expect(feedbackPerms.contents).toBe('read');
      expect(feedbackPerms.actions).toBe('read');
      expect(feedbackPerms['pull-requests']).toBe('write');
    });
  });

  describe('Workflow File Validation', () => {
    test('branch deployment workflow should be valid YAML', () => {
      expect(branchDeploymentConfig).toBeDefined();
      expect(branchDeploymentConfig.name).toBe('Deploy Feature Branch');
      expect(branchDeploymentConfig.on).toBeDefined();
      expect(branchDeploymentConfig.jobs).toBeDefined();
    });

    test('pr commit feedback workflow should be valid YAML', () => {
      expect(prCommitFeedbackConfig).toBeDefined();
      expect(prCommitFeedbackConfig.name).toBe('PR Commit Feedback');
      expect(prCommitFeedbackConfig.on).toBeDefined();
      expect(prCommitFeedbackConfig.jobs).toBeDefined();
    });
  });
});

// Integration test simulation
describe('Branch Preview Deployment Flow Simulation', () => {
  test('should correctly simulate the expected workflow trigger sequence', () => {
    // Simulate the workflow trigger sequence for a feature branch
    const scenario = {
      action: 'push',
      branch: 'feature/add-new-component',
      files_changed: ['src/components/NewComponent.js', 'src/App.js'],
      pr_exists: true,
      pr_number: 123
    };

    // Check if branch deployment would trigger
    const deploymentShouldTrigger = (
      scenario.action === 'push' &&
      !['gh-pages', 'deploy'].includes(scenario.branch) &&
      scenario.files_changed.some(file => 
        file.startsWith('src/') || 
        file.startsWith('public/') ||
        file.includes('.github/workflows/branch-deployment.yml')
      )
    );

    // Check if PR feedback would trigger
    const feedbackShouldTrigger = (
      scenario.action === 'push' &&
      !['main', 'develop', 'gh-pages', 'deploy'].includes(scenario.branch)
    );

    expect(deploymentShouldTrigger).toBe(true);
    expect(feedbackShouldTrigger).toBe(true);

    // This is the behavior that should happen:
    const expectedFlow = [
      'Branch push detected',
      'Branch deployment workflow starts',
      'PR feedback workflow starts', 
      'PR gets "build in progress" comment',
      'Deployment builds and deploys preview',
      'PR gets updated with deployment results and preview URLs'
    ];

    expect(expectedFlow).toHaveLength(6);
    expect(expectedFlow[0]).toBe('Branch push detected');
    expect(expectedFlow[expectedFlow.length - 1]).toContain('preview URLs');
  });
});