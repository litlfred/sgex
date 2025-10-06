/**
 * @fileoverview Test to verify the PR comment management requirements
 * Tests that the Deploy Feature Branch workflow uses Python script for PR comments
 * and updates a single comment throughout the deployment process
 * 
 * This test addresses:
 * - Move PR build start notification to earliest possible point
 * - Use Python script for comment management with content injection protection
 * - Update single comment throughout workflow stages
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

describe('PR Comment Management Requirements', () => {
  let branchDeploymentConfig;
  let pythonScriptExists;

  beforeAll(() => {
    // Load the branch deployment workflow configuration
    const branchDeploymentPath = path.join(process.cwd(), '.github/workflows/branch-deployment.yml');
    const branchDeploymentContent = fs.readFileSync(branchDeploymentPath, 'utf8');
    branchDeploymentConfig = yaml.load(branchDeploymentContent);
    
    // Check if Python script exists
    const scriptPath = path.join(process.cwd(), 'scripts/manage-pr-comment.py');
    pythonScriptExists = fs.existsSync(scriptPath);
  });

  test('Python script for PR comment management should exist', () => {
    expect(pythonScriptExists).toBe(true);
  });

  test('workflow should find associated PR early', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    expect(deployJob).toBeDefined();
    expect(deployJob.steps).toBeDefined();
    
    // Find the PR lookup step
    const prLookupStep = deployJob.steps.find(step => 
      step.name && step.name.includes('Find associated PR')
    );
    
    expect(prLookupStep).toBeDefined();
    expect(prLookupStep.id).toBe('find_pr');
  });

  test('workflow should update PR comment at build start', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    // Find the build start notification step
    const notificationStep = steps.find(step => 
      step.name && step.name.includes('Build Started')
    );
    
    expect(notificationStep).toBeDefined();
    expect(notificationStep.run).toBeDefined();
    expect(notificationStep.run).toContain('manage-pr-comment.py');
    expect(notificationStep.run).toContain('--stage "started"');
  });

  test('PR comment steps should be positioned correctly in workflow', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    // Find indices of key steps
    const checkoutIndex = steps.findIndex(step => 
      step.name && step.name.includes('Checkout repository')
    );
    const findPrIndex = steps.findIndex(step => 
      step.name && step.name.includes('Find associated PR')
    );
    const startedIndex = steps.findIndex(step => 
      step.name && step.name.includes('Build Started')
    );
    const setupIndex = steps.findIndex(step => 
      step.name && step.name.includes('Environment Setup')
    );
    
    expect(checkoutIndex).toBeGreaterThanOrEqual(0);
    expect(findPrIndex).toBeGreaterThanOrEqual(0);
    expect(startedIndex).toBeGreaterThanOrEqual(0);
    
    // Find PR should be right after checkout
    expect(findPrIndex).toBe(checkoutIndex + 1);
    
    // Build started should be after PR lookup
    expect(startedIndex).toBeGreaterThan(findPrIndex);
  });

  test('workflow should update PR comment at multiple stages', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    const stages = ['started', 'setup', 'building', 'deploying', 'verifying', 'success', 'failure'];
    
    // Count how many stages are covered
    const stageUpdates = steps.filter(step => 
      step.run && step.run.includes('manage-pr-comment.py')
    );
    
    // Should have updates for multiple stages
    expect(stageUpdates.length).toBeGreaterThan(4);
    
    // Check that different stages are used
    const stagesFound = stages.filter(stage => 
      stageUpdates.some(step => step.run.includes(`--stage "${stage}"`))
    );
    
    expect(stagesFound).toContain('started');
    expect(stagesFound).toContain('success');
  });

  test('PR comment steps should use Python script', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    // Find all PR comment update steps
    const commentSteps = steps.filter(step => 
      step.name && (
        step.name.includes('Update PR comment') ||
        step.name.includes('Comment on associated PR')
      )
    );
    
    expect(commentSteps.length).toBeGreaterThan(0);
    
    // All should use the Python script
    commentSteps.forEach(step => {
      expect(step.run).toBeDefined();
      expect(step.run).toContain('python3 scripts/manage-pr-comment.py');
    });
  });

  test('PR comment steps should pass required parameters', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    const commentSteps = steps.filter(step => 
      step.run && step.run.includes('manage-pr-comment.py')
    );
    
    // Check that all steps have required parameters
    commentSteps.forEach(step => {
      expect(step.run).toContain('--token');
      expect(step.run).toContain('--repo');
      expect(step.run).toContain('--pr');
      expect(step.run).toContain('--stage');
      expect(step.run).toContain('--data');
    });
  });

  test('PR comment steps should handle errors gracefully', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    const commentSteps = steps.filter(step => 
      step.run && step.run.includes('manage-pr-comment.py')
    );
    
    // All comment steps should have continue-on-error: true
    commentSteps.forEach(step => {
      expect(step['continue-on-error']).toBe(true);
    });
  });

  test('PR comment steps should be conditional on PR existence', () => {
    const deployJob = branchDeploymentConfig.jobs['deploy-branch'];
    const steps = deployJob.steps;
    
    const commentSteps = steps.filter(step => 
      step.run && step.run.includes('manage-pr-comment.py')
    );
    
    // Most comment steps should check if PR was found
    const conditionalSteps = commentSteps.filter(step => 
      step.if && step.if.includes('find_pr.outputs.result')
    );
    
    expect(conditionalSteps.length).toBeGreaterThan(0);
  });

  test('workflow should maintain proper permissions for PR comments', () => {
    const permissions = branchDeploymentConfig.permissions;
    
    // Should have pull-requests write permission to post comments
    expect(permissions['pull-requests']).toBe('write');
  });
});
