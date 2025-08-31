/**
 * @fileoverview Test to verify the "always build pages" requirement
 * Tests that the Deploy Feature Branch workflow triggers on any branch except gh-pages
 * 
 * This test addresses issue #883: always build pages
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

describe('Always Build Pages Requirement (Issue #883)', () => {
  let branchDeploymentConfig;

  beforeAll(() => {
    // Load the branch deployment workflow configuration
    const branchDeploymentPath = path.join(process.cwd(), '.github/workflows/branch-deployment.yml');
    const branchDeploymentContent = fs.readFileSync(branchDeploymentPath, 'utf8');
    branchDeploymentConfig = yaml.load(branchDeploymentContent);
  });

  test('should trigger on any branch except gh-pages', () => {
    const pushConfig = branchDeploymentConfig.on.push;
    
    // Should only exclude gh-pages branch
    expect(pushConfig['branches-ignore']).toEqual(['gh-pages']);
    
    // This means the workflow will trigger on ALL other branches
    const testBranches = ['main', 'deploy', 'feature/test', 'develop', 'release/v1.0'];
    
    testBranches.forEach(branch => {
      const shouldTrigger = !pushConfig['branches-ignore'].includes(branch);
      expect(shouldTrigger).toBe(true);
    });
  });

  test('should NOT trigger on gh-pages branch', () => {
    const pushConfig = branchDeploymentConfig.on.push;
    const ghPagesBranch = 'gh-pages';
    
    const shouldTrigger = !pushConfig['branches-ignore'].includes(ghPagesBranch);
    expect(shouldTrigger).toBe(false);
  });

  test('should have the correct workflow name', () => {
    expect(branchDeploymentConfig.name).toBe('Deploy Feature Branch');
  });

  test('should have push trigger with relevant paths', () => {
    const pushConfig = branchDeploymentConfig.on.push;
    
    expect(pushConfig.paths).toContain('src/**');
    expect(pushConfig.paths).toContain('public/**');
    expect(pushConfig.paths).toContain('package.json');
    expect(pushConfig.paths).toContain('.github/workflows/branch-deployment.yml');
  });

  test('workflow configuration should be valid and complete', () => {
    // Verify all required sections exist
    expect(branchDeploymentConfig.on).toBeDefined();
    expect(branchDeploymentConfig.on.push).toBeDefined();
    expect(branchDeploymentConfig.on.workflow_dispatch).toBeDefined();
    expect(branchDeploymentConfig.on.workflow_call).toBeDefined();
    expect(branchDeploymentConfig.on.pull_request).toBeDefined();
    
    expect(branchDeploymentConfig.permissions).toBeDefined();
    expect(branchDeploymentConfig.concurrency).toBeDefined();
    expect(branchDeploymentConfig.jobs).toBeDefined();
  });
});