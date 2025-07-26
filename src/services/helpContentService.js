// Help Content Service - Provides page-specific help topics and content
class HelpContentService {
  constructor() {
    this.helpTopics = {
      'landing-page-unauthenticated': [
        {
          id: 'github-pat-setup',
          title: 'How to Create a GitHub Personal Access Token',
          type: 'slideshow',
          content: [
            {
              title: 'Step 1: Go to GitHub Settings',
              content: `
                <p>Navigate to your GitHub account settings:</p>
                <ol>
                  <li>Click your profile picture in the top right</li>
                  <li>Select "Settings" from the dropdown</li>
                  <li>Go to "Developer settings" → "Personal access tokens"</li>
                  <li>Choose "Fine-grained tokens" (recommended) or "Tokens (classic)"</li>
                </ol>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Fine-grained tokens provide better security with repository-specific access.
                </div>
              `
            },
            {
              title: 'Step 2: Generate New Token',
              content: `
                <p>Create your new token:</p>
                <ol>
                  <li>Click "Generate new token"</li>
                  <li>Give it a descriptive name like "SGEX Workbench"</li>
                  <li>Set expiration (90 days recommended)</li>
                  <li>Select repository access (specific repos or all)</li>
                </ol>
                <div class="help-warning">
                  <strong>⚠️ Important:</strong> You'll only see the token once, so copy it immediately!
                </div>
              `
            },
            {
              title: 'Step 3: Set Required Permissions',
              content: `
                <p>For <strong>fine-grained tokens</strong>, enable:</p>
                <ul>
                  <li><strong>Contents:</strong> Read and Write</li>
                  <li><strong>Metadata:</strong> Read</li>
                  <li><strong>Pull requests:</strong> Read and Write</li>
                </ul>
                <p>For <strong>classic tokens</strong>, select:</p>
                <ul>
                  <li><strong>repo</strong> - Full control of private repositories</li>
                  <li><strong>read:org</strong> - Read org and team membership</li>
                </ul>
              `
            },
            {
              title: 'Step 4: Use Your Token',
              content: `
                <p>Now you can authenticate with SGEX:</p>
                <ol>
                  <li>Copy your newly generated token</li>
                  <li>Paste it into the login form</li>
                  <li>Click "Sign in with Personal Access Token"</li>
                </ol>
                <div class="help-tip">
                  <strong>🔒 Security:</strong> Your token is stored securely in your browser and never shared with servers.
                </div>
              `
            }
          ]
        }
      ],
      'landing-page-authenticated': [
        {
          id: 'profile-selection',
          title: 'Selecting Your Profile or Organization',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding Profile Types',
              content: `
                <p>SGEX shows different types of profiles:</p>
                <ul>
                  <li><strong>Personal:</strong> Your individual GitHub repositories</li>
                  <li><strong>Organization:</strong> Repositories belonging to organizations you're a member of</li>
                  <li><strong>WHO Official:</strong> World Health Organization repositories (always available)</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> DAK count badges show how many SMART Guidelines repositories were found.
                </div>
              `
            }
          ]
        }
      ],
      'dak-action-selection': [
        {
          id: 'choosing-dak-action',
          title: 'Choosing Your DAK Action',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Actions',
              content: `
                <p>Choose the right action for your workflow:</p>
                <ul>
                  <li><strong>Edit Existing DAK:</strong> Modify an existing repository you have write access to</li>
                  <li><strong>Fork and Edit:</strong> Create your own copy of a repository to work on</li>
                  <li><strong>Create New DAK:</strong> Start a brand new DAK repository from scratch</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> If you're not sure, start with "Edit Existing DAK" if you have permissions, or "Fork and Edit" to experiment safely.
                </div>
              `
            }
          ]
        }
      ],
      'documentation-viewer': [
        {
          id: 'navigation-help',
          title: 'Navigating Documentation',
          type: 'slideshow',
          content: [
            {
              title: 'Using the Documentation Viewer',
              content: `
                <p>The documentation viewer provides easy access to all project information:</p>
                <ul>
                  <li>Use the sidebar menu to navigate between sections</li>
                  <li>Use the dropdown to quickly jump to any document</li>
                  <li>Click "Back" to return to the previous page</li>
                </ul>
                <div class="help-tip">
                  <strong>📖 Available Documentation:</strong> Requirements, Architecture, DAK Components, and more.
                </div>
              `
            }
          ]
        }
      ],
      'dak-dashboard': [
        {
          id: 'dak-components-overview',
          title: 'Understanding DAK Components',
          type: 'slideshow',
          content: [
            {
              title: 'WHO SMART Guidelines DAK Components',
              content: `
                <p>Digital Adaptation Kits (DAKs) contain 8 core components organized in two levels:</p>
                <h4>Level 2: Business Logic & Processes</h4>
                <ul>
                  <li><strong>Business Processes:</strong> BPMN workflows</li>
                  <li><strong>Decision Support Logic:</strong> DMN decision tables</li>
                  <li><strong>Indicators & Measures:</strong> Performance metrics</li>
                  <li><strong>Data Entry Forms:</strong> Structured questionnaires</li>
                </ul>
                <h4>Level 3: Technical Implementation</h4>
                <ul>
                  <li><strong>Terminology:</strong> Code systems and value sets</li>
                  <li><strong>FHIR Profiles:</strong> Resource structure definitions</li>
                  <li><strong>FHIR Extensions:</strong> Custom data elements</li>
                  <li><strong>Test Data & Examples:</strong> Sample data for validation</li>
                </ul>
              `
            }
          ]
        }
      ]
    };
  }

  // Get help topics for a specific page
  getHelpTopicsForPage(pageId) {
    return this.helpTopics[pageId] || [];
  }

  // Get a specific help topic by ID
  getHelpTopic(topicId) {
    for (const pageTopics of Object.values(this.helpTopics)) {
      const topic = pageTopics.find(t => t.id === topicId);
      if (topic) {
        return topic;
      }
    }
    return null;
  }

  // Check if a page has help topics
  hasHelpTopics(pageId) {
    const topics = this.getHelpTopicsForPage(pageId);
    return topics && topics.length > 0;
  }

  // Add a help topic to a page
  addHelpTopicToPage(pageId, helpTopic) {
    if (!this.helpTopics[pageId]) {
      this.helpTopics[pageId] = [];
    }
    this.helpTopics[pageId].push(helpTopic);
  }

  // Get all available page IDs that have help content
  getAvailablePages() {
    return Object.keys(this.helpTopics);
  }
}

// Create and export a singleton instance
const helpContentService = new HelpContentService();
export default helpContentService;