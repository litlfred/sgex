/**
 * Help Content Service
 * 
 * Provides page-specific help topics and content for contextual assistance
 * 
 * @module helpContentService
 */

import repositoryConfig from '../config/repositoryConfig';

/**
 * Help topic slide
 */
export interface HelpSlide {
  /** Slide title */
  title: string;
  /** Slide content (HTML) */
  content: string;
  /** Image URL */
  image?: string;
}

/**
 * Help topic
 * @example { "id": "welcome", "title": "Welcome", "type": "slideshow", "content": [...] }
 */
export interface HelpTopic {
  /** Topic ID */
  id: string;
  /** Topic title */
  title: string;
  /** Badge icon */
  badge?: string;
  /** Topic type */
  type: 'slideshow' | 'action' | 'link';
  /** Slideshow content */
  content?: HelpSlide[];
  /** Action function */
  action?: () => void;
  /** Link URL */
  url?: string;
  /** Open in new tab */
  external?: boolean;
}

/**
 * Page help topics
 */
export interface PageHelpTopics {
  [pageId: string]: HelpTopic[];
}

/**
 * Help Content Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     HelpTopic:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - type
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         type:
 *           type: string
 *           enum: [slideshow, action, link]
 */
class HelpContentService {
  private universalTopics: Record<string, HelpTopic>;
  private helpTopics: PageHelpTopics;

  constructor() {
    // Universal help topics that appear on all pages
    this.universalTopics = {
      documentation: {
        id: 'sgex-documentation',
        title: 'View Documentation',
        badge: 'cat-paw-info-icon.svg',
        type: 'action',
        action: () => {
          // Navigate to documentation viewer in the same window
          const currentPath = window.location.pathname;
          
          // Determine the correct documentation path based on deployment context
          let docsPath = '';
          
          if (currentPath.includes('/sgex')) {
            const pathParts = currentPath.split('/');
            const sgexIndex = pathParts.indexOf('sgex');
            
            if (sgexIndex !== -1 && pathParts.length > sgexIndex + 1) {
              const potentialBranch = pathParts[sgexIndex + 1];
              
              // Check if we're in a branch deployment (not main app pages)
              const mainAppPages = ['dashboard', 'docs', 'select_profile', 'dak-action', 'dak-selection', 'main'];
              
              if (potentialBranch && !mainAppPages.includes(potentialBranch)) {
                // We're in a feature branch deployment: /sgex/branch-name
                docsPath = `/sgex/${potentialBranch}/docs`;
              } else {
                // We're in the main deployment or a main app page
                docsPath = '/sgex/main/docs';
              }
            } else {
              // Fallback to main if we can't determine branch
              docsPath = '/sgex/main/docs';
            }
          } else {
            // Not in a /sgex path, default to main
            docsPath = '/sgex/main/docs';
          }
          
          // Navigate to docs with overview as the default document
          window.location.href = `${docsPath}/overview`;
        },
        content: [
          {
            title: 'Documentation',
            content: `
              <p>Access comprehensive documentation and guides for using SGEX Workbench.</p>
              <div class="help-tip">
                <strong>📖 Available Documentation:</strong> Requirements, Architecture, DAK Components, User Guides, and more.
              </div>
            `
          }
        ]
      },
      workflows: {
        id: 'sgex-workflows',
        title: 'View Deployment Workflows',
        badge: 'cat-paw-workflow-icon.svg',
        type: 'action',
        action: () => {
          const owner = repositoryConfig.getOwner();
          const repo = repositoryConfig.getName();
          window.open(`https://github.com/${owner}/${repo}/actions`, '_blank');
        },
        content: [
          {
            title: 'GitHub Actions',
            content: `
              <p>View deployment workflows and build status on GitHub Actions.</p>
            `
          }
        ]
      }
    };

    // Page-specific help topics
    this.helpTopics = this.initializeHelpTopics();
  }

  /**
   * Initialize help topics for all pages
   */
  initializeHelpTopics(): PageHelpTopics {
    return {
      // Landing page help
      'landing': [
        {
          id: 'welcome',
          title: 'Welcome to SGEX Workbench',
          badge: '/sgex/cat-paw-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Welcome',
              content: `
                <p>Welcome to the WHO SMART Guidelines Exchange (SGEX) Workbench!</p>
                <p>This tool helps you create and manage Digital Adaptation Kits (DAKs) following WHO SMART Guidelines standards.</p>
              `
            },
            {
              title: 'Getting Started',
              content: `
                <p>To begin, you'll need:</p>
                <ul>
                  <li>A GitHub account</li>
                  <li>A Personal Access Token with appropriate permissions</li>
                  <li>Access to a DAK repository</li>
                </ul>
              `
            }
          ]
        }
      ],

      // Dashboard help
      'dashboard': [
        {
          id: 'dashboard-overview',
          title: 'DAK Dashboard Overview',
          badge: '/sgex/cat-paw-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Dashboard',
              content: `
                <p>The DAK Dashboard provides quick access to all components of your Digital Adaptation Kit.</p>
              `
            },
            {
              title: 'Components',
              content: `
                <p>Access the 8 core DAK components:</p>
                <ul>
                  <li>Business Processes</li>
                  <li>Decision Support Logic</li>
                  <li>Indicators & Measures</li>
                  <li>Data Entry Forms</li>
                  <li>Terminology</li>
                  <li>FHIR Profiles</li>
                  <li>FHIR Extensions</li>
                  <li>Test Data & Examples</li>
                </ul>
              `
            }
          ]
        }
      ],

      // Documentation viewer help
      'documentation': [
        {
          id: 'documentation-navigation',
          title: 'Navigating Documentation',
          badge: '/sgex/cat-paw-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Documentation',
              content: `
                <p>Browse comprehensive documentation organized by categories.</p>
              `
            }
          ]
        }
      ]
    };
  }

  /**
   * Get help topics for a specific page
   */
  getHelpTopicsForPage(pageId: string): HelpTopic[] {
    const pageTopics = this.helpTopics[pageId] || [];
    const universal = Object.values(this.universalTopics);
    return [...pageTopics, ...universal];
  }

  /**
   * Get a specific help topic
   */
  getHelpTopic(topicId: string): HelpTopic | null {
    // Search in universal topics first
    if (this.universalTopics[topicId]) {
      return this.universalTopics[topicId];
    }

    // Search in page-specific topics
    for (const topics of Object.values(this.helpTopics)) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        return topic;
      }
    }

    return null;
  }

  /**
   * Register a new help topic for a page
   */
  registerHelpTopic(pageId: string, topic: HelpTopic): void {
    if (!this.helpTopics[pageId]) {
      this.helpTopics[pageId] = [];
    }
    this.helpTopics[pageId].push(topic);
  }

  /**
   * Remove a help topic from a page
   */
  removeHelpTopic(pageId: string, topicId: string): boolean {
    if (!this.helpTopics[pageId]) {
      return false;
    }

    const index = this.helpTopics[pageId].findIndex(t => t.id === topicId);
    if (index !== -1) {
      this.helpTopics[pageId].splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get all page IDs with help topics
   */
  getPageIds(): string[] {
    return Object.keys(this.helpTopics);
  }

  /**
   * Check if a page has help topics
   */
  hasHelpTopicsForPage(pageId: string): boolean {
    return !!this.helpTopics[pageId] && this.helpTopics[pageId].length > 0;
  }

  /**
   * Get universal help topics
   */
  getUniversalTopics(): HelpTopic[] {
    return Object.values(this.universalTopics);
  }
}

// Export singleton instance
const helpContentService = new HelpContentService();
export default helpContentService;
