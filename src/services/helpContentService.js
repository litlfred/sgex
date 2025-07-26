// Help Content Service - Provides page-specific help topics and content
class HelpContentService {
  constructor() {
    // Universal help topics that appear on all pages
    this.universalTopics = {
      bugReport: {
        id: 'report-sgex-bug',
        title: 'Report a SGeX bug',
        badge: '/sgex/cat-paw-bug-icon.svg',
        type: 'slideshow',
        content: [
          {
            title: 'Report a Bug or Issue',
            content: `
              <p>Help us improve SGeX by reporting bugs and issues:</p>
              <h4>What type of issue are you experiencing?</h4>
              <div class="bug-report-options">
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('bug')">
                  🐛 Bug Report - Something isn't working correctly
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('feature')">
                  ✨ Feature Request - Suggest a new feature or improvement
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('question')">
                  ❓ Question - Ask for help or clarification
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('documentation')">
                  📚 Documentation Issue - Report problems with documentation
                </button>
              </div>
              <div class="help-tip">
                <strong>💡 Tip:</strong> Please provide as much detail as possible including steps to reproduce, expected behavior, and actual behavior.
              </div>
            `
          }
        ]
      },
      dakFeedback: {
        id: 'provide-dak-feedback',
        title: 'Provide DAK Feedback',
        type: 'slideshow',
        content: [
          {
            title: 'Provide Feedback on this DAK',
            content: `
              <p>Share feedback about this Digital Adaptation Kit (DAK):</p>
              <h4>What type of feedback do you have?</h4>
              <div class="bug-report-options">
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('content')">
                  📝 Report DAK Content Error - Problems with clinical content or logic
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('bug')">
                  🐛 DAK Bug - Issue with this specific DAK content
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('improvement')">
                  📈 DAK Improvement - Suggest enhancements to this DAK
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('question')">
                  ❓ DAK Question - Ask about this DAK's implementation
                </button>
              </div>
              <div class="help-tip">
                <strong>💡 Note:</strong> This will open an issue in the selected DAK repository for targeted feedback.
              </div>
            `
          }
        ]
      }
    };

    this.helpTopics = {
      'landing-page-unauthenticated': [
        {
          id: 'github-pat-setup',
          title: 'How to Create a GitHub Personal Access Token',
          badge: '/sgex/cat-paw-lock-icon.svg',
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
      ],
      'dak-selection': [
        {
          id: 'choosing-dak-repository',
          title: 'Selecting the Right DAK Repository',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Repository Types',
              content: `
                <p>Choose the right repository based on your workflow:</p>
                <ul>
                  <li><strong>Published DAKs:</strong> Official WHO repositories with complete implementations</li>
                  <li><strong>Community DAKs:</strong> Community-maintained repositories with adaptations</li>
                  <li><strong>Template DAKs:</strong> Starting templates for creating new DAKs</li>
                  <li><strong>Private DAKs:</strong> Your private repositories or organization-specific DAKs</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Look for the "SMART Guidelines" badge to ensure compatibility.
                </div>
              `
            }
          ]
        }
      ],
      'organization-selection': [
        {
          id: 'selecting-organization',
          title: 'Choosing an Organization',
          type: 'slideshow',
          content: [
            {
              title: 'Organization vs Personal Account',
              content: `
                <p>Decide where to create or fork your DAK:</p>
                <ul>
                  <li><strong>Personal Account:</strong> For individual development and experimentation</li>
                  <li><strong>Organization Account:</strong> For team collaboration and official implementations</li>
                  <li><strong>WHO Official:</strong> Only for authorized WHO contributors</li>
                </ul>
                <div class="help-warning">
                  <strong>⚠️ Important:</strong> Make sure you have the necessary permissions for the selected organization.
                </div>
              `
            }
          ]
        }
      ],
      'bpmn-editor': [
        {
          id: 'using-bpmn-editor',
          title: 'Using the BPMN Editor',
          type: 'slideshow',
          content: [
            {
              title: 'BPMN Business Process Modeling',
              content: `
                <p>The BPMN editor helps you create and modify business process workflows:</p>
                <ul>
                  <li><strong>Drag and Drop:</strong> Use the palette to add process elements</li>
                  <li><strong>Connect Elements:</strong> Click and drag to create sequence flows</li>
                  <li><strong>Properties Panel:</strong> Configure element properties and conditions</li>
                  <li><strong>Validation:</strong> The editor highlights errors and warnings</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> BPMN processes define the clinical workflow and decision logic for your DAK.
                </div>
              `
            }
          ]
        }
      ],
      'component-editor': [
        {
          id: 'component-editor-overview',
          title: 'Understanding the Component Editor',
          type: 'slideshow',
          content: [
            {
              title: 'DAK Component Types',
              content: `
                <p>The component editor provides specialized interfaces for different DAK components:</p>
                <h4>Business Logic Components</h4>
                <ul>
                  <li><strong>Business Processes:</strong> BPMN workflow editor</li>
                  <li><strong>Decision Logic:</strong> DMN decision table editor</li>
                  <li><strong>Forms:</strong> Structured questionnaire builder</li>
                </ul>
                <h4>Technical Components</h4>
                <ul>
                  <li><strong>FHIR Resources:</strong> Profile and extension definitions</li>
                  <li><strong>Terminology:</strong> Code systems and value sets</li>
                  <li><strong>Test Data:</strong> Example data and test cases</li>
                </ul>
              `
            }
          ]
        }
      ],
      'pat-login': [
        {
          id: 'pat-authentication-help',
          title: 'Using Personal Access Tokens',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Why Personal Access Tokens?',
              content: `
                <p>SGEX uses GitHub Personal Access Tokens (PATs) for secure authentication:</p>
                <ul>
                  <li><strong>No Backend Required:</strong> Works entirely in your browser</li>
                  <li><strong>Fine-grained Control:</strong> Choose which repositories to access</li>
                  <li><strong>Enhanced Security:</strong> Can be easily rotated and revoked</li>
                  <li><strong>Privacy Focused:</strong> Your token never leaves your browser</li>
                </ul>
                <div class="help-tip">
                  <strong>🔒 Security:</strong> SGEX stores your token locally and never transmits it to any server.
                </div>
              `
            }
          ]
        }
      ],
      'pat-setup-instructions': [
        {
          id: 'detailed-pat-setup',
          title: 'Detailed PAT Setup Guide',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Token Type Comparison',
              content: `
                <p>GitHub offers two types of Personal Access Tokens:</p>
                <h4>Fine-grained Tokens (Recommended)</h4>
                <ul>
                  <li>Repository-specific access control</li>
                  <li>Better security with minimal permissions</li>
                  <li>More granular permission settings</li>
                  <li>Shorter default expiration times</li>
                </ul>
                <h4>Classic Tokens</h4>
                <ul>
                  <li>Broader scope-based permissions</li>
                  <li>Simpler permission model</li>
                  <li>Longer expiration options</li>
                  <li>Works with all GitHub integrations</li>
                </ul>
              `
            }
          ]
        }
      ],
      'dak-configuration': [
        {
          id: 'dak-configuration-guide',
          title: 'Configuring Your DAK',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Configuration',
              content: `
                <p>When creating a new DAK, you need to configure both repository and FHIR settings:</p>
                <h4>Repository Configuration</h4>
                <ul>
                  <li><strong>Repository Name:</strong> GitHub repository identifier (lowercase with hyphens)</li>
                  <li><strong>Description:</strong> Brief description of your DAK's purpose</li>
                  <li><strong>Topics:</strong> Tags that help others discover your DAK</li>
                  <li><strong>Visibility:</strong> Public repositories are discoverable by the community</li>
                </ul>
                <h4>FHIR Implementation Guide Settings</h4>
                <ul>
                  <li><strong>IG ID:</strong> Unique identifier for your Implementation Guide</li>
                  <li><strong>Name:</strong> Technical name used in code generation</li>
                  <li><strong>Title:</strong> Human-readable title for documentation</li>
                  <li><strong>Publisher:</strong> Organization responsible for the DAK</li>
                </ul>
              `
            }
          ]
        }
      ]
    };
  }

  // Get help topics for a specific page
  getHelpTopicsForPage(pageId, contextData = {}) {
    const pageTopics = this.helpTopics[pageId] || [];
    const universalTopics = this.getUniversalTopics(contextData);
    return [...pageTopics, ...universalTopics];
  }

  // Get universal topics based on context (e.g., if DAK is selected)
  getUniversalTopics(contextData = {}) {
    const topics = [this.universalTopics.bugReport];
    
    // Add DAK feedback if we have DAK context
    if (contextData.selectedDak || contextData.repository) {
      topics.push(this.universalTopics.dakFeedback);
    }
    
    return topics;
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

  // Check if a page has help topics (now always true since we have universal topics)
  hasHelpTopics(pageId, contextData = {}) {
    return true; // Always true now due to universal topics
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

  // Helper method to open DAK-specific issues
  openDakIssue(issueType, dakRepository) {
    if (!dakRepository) {
      console.warn('No DAK repository specified for feedback');
      return;
    }

    const baseUrl = `https://github.com/${dakRepository.owner}/${dakRepository.name}/issues/new`;
    let url = baseUrl;

    switch (issueType) {
      case 'bug':
        url += '?template=bug_report.md&labels=bug,dak-issue';
        break;
      case 'improvement':
        url += '?template=feature_request.md&labels=enhancement,dak-improvement';
        break;
      case 'content':
        url += '?labels=content-issue,clinical-content';
        break;
      case 'question':
        url += '?template=question.md&labels=question,dak-question';
        break;
      default:
        url += '?labels=dak-feedback';
    }

    window.open(url, '_blank');
  }
}

// Create and export a singleton instance
const helpContentService = new HelpContentService();
export default helpContentService;