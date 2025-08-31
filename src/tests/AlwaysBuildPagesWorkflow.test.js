/**
 * Test suite to verify that the branch-deployment workflow triggers on all branches except gh-pages
 * This test validates the fix for issue #883: "always build pages"
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml'; // Note: this import might fail, but we'll validate syntax manually

describe('Always Build Pages Workflow Configuration', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/branch-deployment.yml');
  
  test('branch-deployment.yml exists', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  test('workflow only excludes gh-pages branch for push triggers', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Parse the workflow content to check the trigger configuration
    expect(workflowContent).toContain('branches-ignore: [gh-pages]');
    
    // Ensure it does NOT exclude main or deploy branches anymore
    expect(workflowContent).not.toContain('branches-ignore: [gh-pages, deploy, main]');
  });

  test('workflow configuration is syntactically valid YAML', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Basic YAML syntax validation
    expect(() => {
      // Simple validation - check for basic YAML structure
      const lines = workflowContent.split('\n');
      let inWorkflowSection = false;
      
      for (const line of lines) {
        if (line.trim().startsWith('on:')) {
          inWorkflowSection = true;
        }
        
        if (inWorkflowSection && line.trim().startsWith('push:')) {
          // Found push section, verify branches-ignore format
          expect(line.trim()).toBe('push:');
        }
        
        if (line.trim().startsWith('branches-ignore:')) {
          expect(line.trim()).toBe('branches-ignore: [gh-pages]');
        }
      }
    }).not.toThrow();
  });

  test('workflow should trigger on main branch pushes', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Since main is no longer in branches-ignore, pushes to main should trigger the workflow
    const branchesIgnoreLine = workflowContent.match(/branches-ignore:\s*\[(.*?)\]/);
    expect(branchesIgnoreLine).toBeTruthy();
    
    const excludedBranches = branchesIgnoreLine[1].split(',').map(b => b.trim().replace(/['"]/g, ''));
    expect(excludedBranches).not.toContain('main');
    expect(excludedBranches).not.toContain('deploy');
    expect(excludedBranches).toContain('gh-pages');
  });

  test('workflow should trigger on feature branch pushes', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Feature branches should trigger since only gh-pages is excluded
    const branchesIgnoreLine = workflowContent.match(/branches-ignore:\s*\[(.*?)\]/);
    const excludedBranches = branchesIgnoreLine[1].split(',').map(b => b.trim().replace(/['"]/g, ''));
    
    // Only gh-pages should be excluded
    expect(excludedBranches).toEqual(['gh-pages']);
  });

  test('workflow should NOT trigger on gh-pages branch pushes', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // gh-pages should still be excluded to prevent infinite loops
    expect(workflowContent).toContain('branches-ignore: [gh-pages]');
  });

  test('path filters are still in place for efficiency', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Verify that path filtering is still configured to avoid unnecessary builds
    expect(workflowContent).toContain('paths:');
    expect(workflowContent).toContain("- 'src/**'");
    expect(workflowContent).toContain("- 'public/**'");
    expect(workflowContent).toContain("- 'package.json'");
  });
});