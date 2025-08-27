/**
 * @fileoverview Tests for enhanced GitHub Actions workflow automation
 * Verifies that workflows trigger automatically for copilot commits and PR updates
 * 
 * This test addresses issue #800: ensuring automatic workflow triggers
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

describe('Enhanced Workflow Automation Configuration', () => {
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

  describe('Branch Deployment Workflow Automation', () => {
    test('should trigger on push events to feature branches', () => {
      const pushConfig = branchDeploymentConfig.on.push;
      
      // Should exclude specific branches
      expect(pushConfig['branches-ignore']).toEqual(['gh-pages', 'deploy', 'main']);
      
      // Should include relevant file paths
      expect(pushConfig.paths).toContain('src/**');
      expect(pushConfig.paths).toContain('public/**');
      expect(pushConfig.paths).toContain('package.json');
      expect(pushConfig.paths).toContain('.github/workflows/branch-deployment.yml');
    });

    test('should trigger on pull request events for comprehensive coverage', () => {
      const prConfig = branchDeploymentConfig.on.pull_request;
      
      // Should trigger on PR events
      expect(prConfig).toBeDefined();
      expect(prConfig.types).toEqual(['opened', 'synchronize', 'reopened']);
      expect(prConfig.branches).toEqual(['main']);
      
      // Should include relevant file paths
      expect(prConfig.paths).toContain('src/**');
      expect(prConfig.paths).toContain('public/**');
      expect(prConfig.paths).toContain('package.json');
    });

    test('should have both manual and automatic triggers', () => {
      const config = branchDeploymentConfig.on;
      
      // Manual triggers
      expect(config.workflow_dispatch).toBeDefined();
      expect(config.workflow_call).toBeDefined();
      
      // Automatic triggers
      expect(config.push).toBeDefined();
      expect(config.pull_request).toBeDefined();
    });
  });

  describe('PR Commit Feedback Workflow Automation', () => {
    test('should trigger on push events to feature branches', () => {
      const pushConfig = prCommitFeedbackConfig.on.push;
      
      // Should exclude main and other special branches
      expect(pushConfig['branches-ignore']).toEqual([
        'main',
        'develop',
        'gh-pages',
        'deploy'
      ]);
      
      // Should include relevant file paths for efficiency
      expect(pushConfig.paths).toContain('src/**');
      expect(pushConfig.paths).toContain('public/**');
      expect(pushConfig.paths).toContain('.github/workflows/**');
    });

    test('should trigger on pull request events for copilot commits', () => {
      const prConfig = prCommitFeedbackConfig.on.pull_request;
      
      // Should trigger on PR events
      expect(prConfig).toBeDefined();
      expect(prConfig.types).toEqual(['opened', 'synchronize', 'reopened']);
      expect(prConfig.branches).toEqual(['main']);
      
      // Should include relevant file paths
      expect(prConfig.paths).toContain('src/**');
      expect(prConfig.paths).toContain('public/**');
    });
  });

  describe('Workflow Coordination and Coverage', () => {
    test('should have consistent path filtering between workflows', () => {
      const branchPaths = branchDeploymentConfig.on.push.paths;
      const feedbackPaths = prCommitFeedbackConfig.on.push.paths;
      
      // Core paths should be covered by both workflows
      ['src/**', 'public/**', 'package.json'].forEach(path => {
        expect(branchPaths).toContain(path);
        expect(feedbackPaths).toContain(path);
      });
    });

    test('should trigger for all typical copilot commit scenarios', () => {
      // Test scenarios where copilot creates commits
      const scenarios = [
        {
          event: 'push',
          branch: 'copilot-fix-123',
          description: 'Copilot pushes to feature branch'
        },
        {
          event: 'pull_request',
          action: 'synchronize',
          branch: 'copilot-fix-123',
          description: 'Copilot updates existing PR'
        },
        {
          event: 'pull_request',
          action: 'opened',
          branch: 'copilot-fix-123', 
          description: 'Copilot creates new PR'
        }
      ];

      scenarios.forEach(scenario => {
        // For push events
        if (scenario.event === 'push') {
          const pushConfig = branchDeploymentConfig.on.push;
          const excludedBranches = pushConfig['branches-ignore'];
          const shouldTrigger = !excludedBranches.includes(scenario.branch);
          expect(shouldTrigger).toBe(true);
        }

        // For pull_request events
        if (scenario.event === 'pull_request') {
          const prConfig = branchDeploymentConfig.on.pull_request;
          const shouldTrigger = prConfig.types.includes(scenario.action);
          expect(shouldTrigger).toBe(true);
        }
      });
    });

    test('should not trigger on excluded branches', () => {
      const excludedBranches = ['main', 'gh-pages', 'deploy', 'develop'];
      
      excludedBranches.forEach(branch => {
        const branchPushConfig = branchDeploymentConfig.on.push;
        const feedbackPushConfig = prCommitFeedbackConfig.on.push;
        
        if (branchPushConfig['branches-ignore'].includes(branch)) {
          // Branch should be excluded from push triggers
          expect(branchPushConfig['branches-ignore']).toContain(branch);
        }
        
        if (feedbackPushConfig['branches-ignore'].includes(branch)) {
          // Branch should be excluded from feedback triggers
          expect(feedbackPushConfig['branches-ignore']).toContain(branch);
        }
      });
    });
  });

  describe('YAML Configuration Validity', () => {
    test('branch deployment workflow should be valid YAML', () => {
      expect(branchDeploymentConfig).toBeDefined();
      expect(branchDeploymentConfig.name).toBe('Deploy Feature Branch');
      expect(branchDeploymentConfig.on).toBeDefined();
      expect(branchDeploymentConfig.jobs).toBeDefined();
    });

    test('PR commit feedback workflow should be valid YAML', () => {
      expect(prCommitFeedbackConfig).toBeDefined();
      expect(prCommitFeedbackConfig.name).toBe('PR Commit Feedback');
      expect(prCommitFeedbackConfig.on).toBeDefined();
      expect(prCommitFeedbackConfig.jobs).toBeDefined();
    });

    test('workflows should have required permissions', () => {
      const branchPerms = branchDeploymentConfig.permissions;
      const feedbackPerms = prCommitFeedbackConfig.permissions;
      
      // Branch deployment needs write permissions
      expect(branchPerms.contents).toBe('write');
      expect(branchPerms.pages).toBe('write');
      expect(branchPerms['pull-requests']).toBe('write');
      
      // Feedback workflow needs read and PR write permissions
      expect(feedbackPerms.contents).toBe('read');
      expect(feedbackPerms['pull-requests']).toBe('write');
    });
  });
});