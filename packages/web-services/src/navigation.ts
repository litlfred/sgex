/**
 * Navigation Service - Web UI navigation and routing utilities
 * 
 * Extracted from various services to centralize web-specific navigation logic.
 * Handles DAK component routing, breadcrumb generation, and URL context management.
 */

export interface NavigationContext {
  user?: string;
  repo?: string;
  branch?: string;
  component?: string;
  path?: string;
}

export interface Breadcrumb {
  label: string;
  url: string;
  active: boolean;
}

export class NavigationService {
  /**
   * Generate DAK component route
   */
  generateDAKRoute(component: string, user: string, repo: string, branch?: string): string {
    const basePath = `/${component}/${user}/${repo}`;
    return branch ? `${basePath}/${branch}` : basePath;
  }

  /**
   * Parse navigation context from URL
   */
  parseNavigationContext(pathname: string): NavigationContext {
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length >= 3) {
      return {
        component: parts[0],
        user: parts[1],
        repo: parts[2],
        branch: parts[3],
        path: parts.slice(4).join('/')
      };
    }

    return {};
  }

  /**
   * Generate breadcrumbs for DAK navigation
   */
  generateBreadcrumbs(context: NavigationContext): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];

    if (context.component) {
      breadcrumbs.push({
        label: 'Dashboard',
        url: '/dashboard',
        active: false
      });

      if (context.user && context.repo) {
        breadcrumbs.push({
          label: `${context.user}/${context.repo}`,
          url: `/dashboard/${context.user}/${context.repo}`,
          active: false
        });

        if (context.component !== 'dashboard') {
          breadcrumbs.push({
            label: this.formatComponentName(context.component),
            url: this.generateDAKRoute(context.component, context.user, context.repo, context.branch),
            active: true
          });
        }
      }
    }

    return breadcrumbs;
  }

  /**
   * Format component name for display
   */
  private formatComponentName(component: string): string {
    const componentNames: Record<string, string> = {
      'core-data-dictionary-viewer': 'Core Data Dictionary',
      'business-process-selection': 'Business Processes',
      'decision-support-tables': 'Decision Support Logic',
      'indicators-manager': 'Indicators & Measures',
      'data-entry-forms': 'Data Entry Forms',
      'terminology-manager': 'Terminology',
      'fhir-profiles': 'FHIR Profiles',
      'fhir-extensions': 'FHIR Extensions',
      'test-data-examples': 'Test Data & Examples',
      'pages-manager': 'Page Content'
    };

    return componentNames[component] || component.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Check if current route is DAK component
   */
  isDAKComponentRoute(pathname: string): boolean {
    const context = this.parseNavigationContext(pathname);
    return !!(context.component && context.user && context.repo);
  }

  /**
   * Generate GitHub artifact URL
   */
  generateGitHubArtifactUrl(user: string, repo: string, branch: string = 'main'): string {
    return `https://${user}.github.io/${repo}/branches/${branch}`;
  }
}