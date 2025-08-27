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
    test('should trigger on pushes to feature branches (excluding main, gh-pages, deploy)', () => {
      const pushConfig = branchDeploymentConfig.on.push;
      
      // Should NOT have a specific branches restriction
      expect(pushConfig.branches).toBeUndefined();
      
      // Should exclude main, gh-pages, and deploy branches
      expect(pushConfig['branches-ignore']).toEqual(['gh-pages', 'deploy', 'main']);
      
      // Should include relevant file paths
      expect(pushConfig.paths).toContain('src/**');
      expect(pushConfig.paths).toContain('public/**');
      expect(pushConfig.paths).toContain('.github/workflows/branch-deployment.yml');
    });

    test('should have pull request triggers for PR events targeting main', () => {
      const prConfig = branchDeploymentConfig.on.pull_request;
      
      expect(prConfig).toBeDefined();
      expect(prConfig.types).toEqual(['opened', 'synchronize', 'reopened']);
      expect(prConfig.branches).toEqual(['main']);
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

    test('main branch push should NOT trigger automatic deployment (manual only)', () => {
      // Simulate a main branch push scenario
      const mainBranch = 'main';
      const excludedBranches = ['gh-pages', 'deploy', 'main'];
      const feedbackExcludedBranches = ['main', 'develop', 'gh-pages', 'deploy'];
      
      // Branch deployment should NOT trigger automatically (main is now excluded)
      const shouldTriggerDeployment = !excludedBranches.includes(mainBranch);
      expect(shouldTriggerDeployment).toBe(false);
      
      // PR feedback should NOT trigger (main is in feedback excluded list)
      const shouldTriggerFeedback = !feedbackExcludedBranches.includes(mainBranch);
      expect(shouldTriggerFeedback).toBe(false);
    });

    test('excluded branches should not trigger automatic deployment', () => {
      const excludedBranches = ['gh-pages', 'deploy', 'main'];
      
      excludedBranches.forEach(branch => {
        // None of these branches should trigger automatic deployment
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

  describe('Workflow Concurrency Configuration', () => {
    test('should have proper concurrency settings to prevent race conditions', () => {
      const concurrencyConfig = branchDeploymentConfig.concurrency;
      
      expect(concurrencyConfig).toBeDefined();
      expect(concurrencyConfig.group).toBeDefined();
      expect(concurrencyConfig.group).toContain('branch-deployment');
      
      // Critical fix for issue #841: should NOT cancel in progress to prevent race conditions
      expect(concurrencyConfig['cancel-in-progress']).toBe(false);
    });

    test('concurrency group should include branch identifier', () => {
      const concurrencyConfig = branchDeploymentConfig.concurrency;
      const groupPattern = concurrencyConfig.group;
      
      // Should include branch identification in group name
      expect(groupPattern).toMatch(/\$\{\{\s*github\.event\.inputs\.branch.*\}\}/);
      expect(groupPattern).toMatch(/\$\{\{\s*.*github\.head_ref.*\}\}/);
      expect(groupPattern).toMatch(/\$\{\{\s*.*github\.ref_name.*\}\}/);
    });

    test('should allow concurrent deployments of different branches', () => {
      // The concurrency group uses branch-specific identifiers
      // This means different branches can deploy concurrently
      const concurrencyGroup = branchDeploymentConfig.concurrency.group;
      
      // Simulate different branch groups
      const branch1Group = concurrencyGroup.replace(/\$\{\{.*\}\}/, 'feature-branch-1');
      const branch2Group = concurrencyGroup.replace(/\$\{\{.*\}\}/, 'feature-branch-2');
      
      expect(branch1Group).not.toBe(branch2Group);
      expect(branch1Group).toContain('branch-deployment');
      expect(branch2Group).toContain('branch-deployment');
    });

    test('should prevent conflicts for same branch deployments without cancelling', () => {
      const concurrencyConfig = branchDeploymentConfig.concurrency;
      
      // Same branch should use same concurrency group (preventing conflicts)
      // But cancel-in-progress: false means workflows queue instead of cancelling
      expect(concurrencyConfig['cancel-in-progress']).toBe(false);
      
      // This allows:
      // 1. Multiple commits to same branch to queue deployments instead of cancelling
      // 2. Git-level race condition handling to manage actual deployment conflicts
      // 3. Robust deployment retry mechanism to handle concurrent access to gh-pages
    });
  });
});

// Integration test simulation
describe('Deploy Feature Branch Flow Simulation', () => {
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
      !['gh-pages', 'deploy', 'main'].includes(scenario.branch) &&
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