/**
 * Test for the select_profile routing issue
 * Issue: URL /sgex/copilot-fix-895/select_profile should route correctly
 */

describe('Select Profile URL Routing', () => {
  // Mock route configuration that matches the actual one
  const mockRouteConfig = {
    isDeployedBranch: (branch) => branch === 'main',
    isValidComponent: (component) => {
      // This should include component names AND route paths
      const componentNames = [
        'WelcomePage', 'SelectProfilePage', 'DAKActionSelection', 'DAKSelection', 
        'OrganizationSelection', 'DAKConfiguration', 'RepositorySelection',
        'DashboardRedirect', 'TestDashboard', 'BPMNViewerTestComponent',
        'DocumentationViewer', 'PagesManager', 'LandingPageWithFramework',
        'TestDocumentationPage', 'AssetEditorTest', 'NotFound',
        'dashboard', 'testing-viewer', 'core-data-dictionary-viewer',
        'health-interventions', 'actor-editor', 'business-process-selection',
        'bpmn-editor', 'bpmn-viewer', 'bpmn-source', 'decision-support-logic',
        'questionnaire-editor', 'faq-demo'
      ];
      
      const routePaths = [
        'select_profile', 'dak-action', 'dak-selection', 'organization-selection',
        'dak-configuration', 'repositories', 'dashboard', 'test-dashboard',
        'test-bpmn-viewer', 'docs', 'pages', 'test-framework', 'test-documentation',
        'test-asset-editor'
      ];
      
      return componentNames.includes(component) || routePaths.includes(component);
    },
    isValidRoutePath: (path) => {
      const routePaths = [
        'select_profile', 'dak-action', 'dak-selection', 'organization-selection',
        'dak-configuration', 'repositories', 'dashboard', 'test-dashboard',
        'test-bpmn-viewer', 'docs', 'pages', 'test-framework', 'test-documentation',
        'test-asset-editor'
      ];
      return routePaths.includes(path);
    }
  };

  // Current (broken) routing logic
  function currentRouteLogic(pathname, routeConfig) {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0 || pathSegments[0] !== 'sgex') {
      return { error: 'invalid-base-path' };
    }

    if (pathSegments.length === 1) {
      return { redirect: '/sgex/', type: 'root-redirect' };
    }

    const secondSegment = pathSegments[1];
    
    if (routeConfig && routeConfig.isDeployedBranch && routeConfig.isDeployedBranch(secondSegment)) {
      return { type: 'branch-deployment', branch: secondSegment };
    } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(secondSegment)) {
      return { type: 'component-first' };
    } else if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
      return { type: 'branch-index-redirect' };
    } else {
      if (pathSegments.length === 2) {
        return { type: 'branch-root-redirect', branch: secondSegment, redirect: `/sgex/${secondSegment}/` };
      }
      
      // This is where the issue lies - it checks isValidComponent but select_profile 
      // might not be recognized correctly
      if (pathSegments.length >= 3 && 
          routeConfig && 
          routeConfig.isValidComponent && 
          routeConfig.isValidComponent(pathSegments[2])) {
        return { type: 'branch-deployment', branch: secondSegment, component: pathSegments[2] };
      }
      
      return { error: 'unknown-pattern' };
    }
  }

  test('should handle select_profile URL correctly', () => {
    const result = currentRouteLogic('/sgex/copilot-fix-895/select_profile', mockRouteConfig);
    expect(result.type).toBe('branch-deployment');
    expect(result.branch).toBe('copilot-fix-895');
    expect(result.component).toBe('select_profile');
  });

  test('should handle other standard components correctly', () => {
    const result = currentRouteLogic('/sgex/some-branch/dak-action', mockRouteConfig);
    expect(result.type).toBe('branch-deployment');
    expect(result.branch).toBe('some-branch');
    expect(result.component).toBe('dak-action');
  });

  test('should handle DAK components correctly', () => {
    const result = currentRouteLogic('/sgex/feature-branch/dashboard', mockRouteConfig);
    expect(result.type).toBe('branch-deployment');
    expect(result.branch).toBe('feature-branch');
    expect(result.component).toBe('dashboard');
  });

  test('should still show error for invalid components', () => {
    const result = currentRouteLogic('/sgex/some-branch/invalid-component', mockRouteConfig);
    expect(result.error).toBe('unknown-pattern');
  });
});