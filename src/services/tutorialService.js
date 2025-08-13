// Enhanced Tutorial Service - Provides branching tutorial support and improved content organization

class TutorialService {
  constructor() {
    // Tutorial registry - maps tutorial IDs to tutorial definitions
    this.tutorials = new Map();
    
    // Tutorial categories for better organization
    this.categories = {
      'getting-started': 'Getting Started',
      'authentication': 'Authentication',
      'dak-management': 'DAK Management', 
      'content-editing': 'Content Editing',
      'collaboration': 'Collaboration',
      'troubleshooting': 'Troubleshooting'
    };

    // Initialize built-in tutorials
    this.initializeBuiltInTutorials();
  }

  /**
   * Register a tutorial definition
   * @param {string} tutorialId - Alphanumeric ID with dashes (e.g., 'github-pat-setup')
   * @param {Object} tutorialDefinition - Tutorial definition object
   */
  registerTutorial(tutorialId, tutorialDefinition) {
    // Validate tutorial ID format (alphanumeric with dashes)
    if (!/^[a-zA-Z0-9-]+$/.test(tutorialId)) {
      throw new Error(`Invalid tutorial ID format: ${tutorialId}. Must contain only alphanumeric characters and dashes.`);
    }

    // Validate tutorial definition
    this.validateTutorialDefinition(tutorialDefinition);

    this.tutorials.set(tutorialId, {
      id: tutorialId,
      ...tutorialDefinition,
      registeredAt: new Date().toISOString()
    });
  }

  /**
   * Get a tutorial by ID
   * @param {string} tutorialId - Tutorial ID
   * @returns {Object|null} Tutorial definition or null if not found
   */
  getTutorial(tutorialId) {
    return this.tutorials.get(tutorialId) || null;
  }

  /**
   * Get all tutorials for a specific page
   * @param {string} pageId - Page ID
   * @param {Object} contextData - Context data for filtering
   * @returns {Array} Array of tutorial definitions
   */
  getTutorialsForPage(pageId, contextData = {}) {
    const tutorials = [];
    
    // Get tutorials registered for this page
    for (const [, tutorial] of this.tutorials) {
      if (tutorial.pages && tutorial.pages.includes(pageId)) {
        // Check if tutorial is applicable given context
        if (this.isTutorialApplicable(tutorial, contextData)) {
          tutorials.push(tutorial);
        }
      }
    }

    return tutorials.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  /**
   * Get tutorials by category
   * @param {string} category - Category ID
   * @returns {Array} Array of tutorial definitions
   */
  getTutorialsByCategory(category) {
    const tutorials = [];
    
    for (const [, tutorial] of this.tutorials) {
      if (tutorial.category === category) {
        tutorials.push(tutorial);
      }
    }

    return tutorials.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  /**
   * Get all available tutorial categories
   * @returns {Object} Category ID to name mapping
   */
  getCategories() {
    return { ...this.categories };
  }

  /**
   * Process a tutorial step, handling branching logic
   * @param {Object} tutorial - Tutorial definition
   * @param {number} currentStepIndex - Current step index
   * @param {string} userChoice - User's choice for branching
   * @param {Object} context - Tutorial context/state
   * @returns {Object} Next step information
   */
  processStep(tutorial, currentStepIndex, userChoice = null, context = {}) {
    if (!tutorial || !tutorial.steps || currentStepIndex >= tutorial.steps.length) {
      return { step: null, isComplete: true };
    }

    const currentStep = tutorial.steps[currentStepIndex];
    
    // Handle branching logic
    if (currentStep.branches && userChoice) {
      const branch = currentStep.branches.find(b => b.choice === userChoice);
      if (branch) {
        // Update context if needed
        if (branch.updateContext) {
          Object.assign(context, branch.updateContext);
        }

        // Jump to target step if specified
        if (branch.targetStep !== undefined) {
          return {
            step: tutorial.steps[branch.targetStep] || null,
            stepIndex: branch.targetStep,
            isComplete: branch.targetStep >= tutorial.steps.length,
            context
          };
        }
      }
    }

    // Normal linear progression
    const nextIndex = currentStepIndex + 1;
    return {
      step: currentStep,
      stepIndex: currentStepIndex,
      isComplete: false,
      hasNext: nextIndex < tutorial.steps.length,
      hasPrevious: currentStepIndex > 0,
      context
    };
  }

  /**
   * Validate tutorial definition structure
   * @param {Object} definition - Tutorial definition to validate
   */
  validateTutorialDefinition(definition) {
    const required = ['title', 'steps'];
    
    for (const field of required) {
      if (!definition[field]) {
        throw new Error(`Tutorial definition missing required field: ${field}`);
      }
    }

    if (!Array.isArray(definition.steps) || definition.steps.length === 0) {
      throw new Error('Tutorial must have at least one step');
    }

    // Validate each step
    definition.steps.forEach((step, index) => {
      if (!step.title || !step.content) {
        throw new Error(`Step ${index} missing required title or content`);
      }

      // Validate branches if present
      if (step.branches) {
        if (!Array.isArray(step.branches)) {
          throw new Error(`Step ${index} branches must be an array`);
        }

        step.branches.forEach((branch, branchIndex) => {
          if (!branch.choice || !branch.label) {
            throw new Error(`Step ${index} branch ${branchIndex} missing choice or label`);
          }
        });
      }
    });
  }

  /**
   * Check if tutorial is applicable given context
   * @param {Object} tutorial - Tutorial definition
   * @param {Object} contextData - Context data
   * @returns {boolean} True if tutorial should be shown
   */
  isTutorialApplicable(tutorial, contextData) {
    // Check authentication requirements
    if (tutorial.requiresAuth && !contextData.isAuthenticated) {
      return false;
    }

    // Check DAK context requirements
    if (tutorial.requiresDak && !contextData.repository) {
      return false;
    }

    // Check custom conditions
    if (tutorial.condition && typeof tutorial.condition === 'function') {
      return tutorial.condition(contextData);
    }

    return true;
  }

  /**
   * Initialize built-in tutorials converted from existing help content
   */
  initializeBuiltInTutorials() {
    // Convert existing GitHub PAT setup tutorial
    this.registerTutorial('github-pat-setup', {
      title: 'How to Create a GitHub Personal Access Token',
      description: 'Step-by-step guide to creating and configuring GitHub Personal Access Tokens for SGEX',
      category: 'authentication',
      pages: ['landing-page-unauthenticated', 'welcome', 'pat-login', 'pat-setup-instructions'],
      priority: 1,
      badge: '/sgex/cat-paw-lock-icon.svg',
      steps: [
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
            <h4>Which token type are you creating?</h4>
            <p>The permissions needed depend on your token type:</p>
          `,
          branches: [
            {
              choice: 'fine-grained',
              label: '🎯 Fine-grained Token (Recommended)',
              targetStep: 3
            },
            {
              choice: 'classic',
              label: '🔧 Classic Token',
              targetStep: 4
            }
          ]
        },
        {
          title: 'Fine-grained Token Permissions',
          content: `
            <p>For <strong>fine-grained tokens</strong>, enable these permissions:</p>
            <ul>
              <li><strong>Contents:</strong> Read and Write</li>
              <li><strong>Metadata:</strong> Read</li>
              <li><strong>Pull requests:</strong> Read and Write</li>
            </ul>
            <div class="help-tip">
              <strong>🔒 Security:</strong> Fine-grained tokens provide better security with minimal permissions.
            </div>
          `,
          next: 5
        },
        {
          title: 'Classic Token Permissions',
          content: `
            <p>For <strong>classic tokens</strong>, select these scopes:</p>
            <ul>
              <li><strong>repo</strong> - Full control of private repositories</li>
              <li><strong>read:org</strong> - Read org and team membership</li>
            </ul>
            <div class="help-tip">
              <strong>📝 Note:</strong> Classic tokens have broader permissions but simpler setup.
            </div>
          `,
          next: 5
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
    });

    // DAK Components overview tutorial
    this.registerTutorial('dak-components-overview', {
      title: 'Understanding DAK Components',
      description: 'Learn about the 8 core components of WHO SMART Guidelines Digital Adaptation Kits',
      category: 'dak-management',
      pages: ['dak-dashboard'],
      priority: 1,
      steps: [
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
            <div class="help-tip">
              <strong>💡 Tip:</strong> Start with Level 2 components to define business logic, then move to Level 3 for technical implementation.
            </div>
          `
        },
        {
          title: 'Where to Start?',
          content: `
            <h4>What would you like to focus on first?</h4>
            <p>Choose your primary interest to continue with specific guidance:</p>
          `,
          branches: [
            {
              choice: 'business-logic',
              label: '📋 Business Logic & Clinical Workflows',
              targetStep: 2
            },
            {
              choice: 'technical-implementation', 
              label: '⚙️ Technical Implementation & FHIR',
              targetStep: 4
            },
            {
              choice: 'overview-complete',
              label: '✅ Just wanted an overview, I\'m good to go!',
              targetStep: 6
            }
          ]
        },
        {
          title: 'Business Logic Components',
          content: `
            <p>Business logic components define <em>what</em> your DAK does:</p>
            <h4>🔄 Business Processes</h4>
            <p>Define clinical workflows and care processes using BPMN diagrams.</p>
            <h4>🧠 Decision Support Logic</h4>
            <p>Create decision tables and rules using DMN notation.</p>
            <h4>📊 Indicators & Measures</h4>
            <p>Define performance metrics and measurement criteria.</p>
            <h4>📝 Data Entry Forms</h4>
            <p>Design structured questionnaires for data collection.</p>
            <div class="help-tip">
              <strong>🎯 Best Practice:</strong> Start with business processes to map out your clinical workflow, then add decision logic and forms.
            </div>
          `,
          next: 5
        },
        {
          title: 'Getting Started with Business Logic',
          content: `
            <h4>Recommended starting order:</h4>
            <ol>
              <li><strong>Business Processes:</strong> Map your clinical workflow first</li>
              <li><strong>Data Entry Forms:</strong> Design forms for data collection points</li>
              <li><strong>Decision Support Logic:</strong> Add decision rules and logic</li>
              <li><strong>Indicators & Measures:</strong> Define success metrics</li>
            </ol>
            <div class="help-tip">
              <strong>💡 Next Steps:</strong> Click on "Business Processes" in the dashboard to start creating your first workflow diagram.
            </div>
          `,
          next: 6
        },
        {
          title: 'Technical Implementation Components',
          content: `
            <p>Technical components define <em>how</em> your DAK integrates with systems:</p>
            <h4>🏷️ Terminology</h4>
            <p>Define code systems, value sets, and concept mappings.</p>
            <h4>📋 FHIR Profiles</h4>
            <p>Structure definitions for healthcare data resources.</p>
            <h4>🔧 FHIR Extensions</h4>
            <p>Custom data elements and extensions to FHIR.</p>
            <h4>🧪 Test Data & Examples</h4>
            <p>Sample data and test cases for validation.</p>
            <div class="help-tip">
              <strong>🎯 Best Practice:</strong> Define terminology first, then create profiles, extensions, and test data.
            </div>
          `,
          next: 5
        },
        {
          title: 'Getting Started with Technical Implementation',
          content: `
            <h4>Recommended starting order:</h4>
            <ol>
              <li><strong>Terminology:</strong> Define your code systems and value sets</li>
              <li><strong>FHIR Profiles:</strong> Create resource structure definitions</li>
              <li><strong>FHIR Extensions:</strong> Add custom data elements as needed</li>
              <li><strong>Test Data & Examples:</strong> Create validation examples</li>
            </ol>
            <div class="help-tip">
              <strong>💡 Next Steps:</strong> Click on "Terminology" in the dashboard to start defining your code systems and value sets.
            </div>
          `
        },
        {
          title: 'You\'re Ready to Go!',
          content: `
            <p>Great! You now understand the DAK component structure:</p>
            <ul>
              <li>✅ Know the 8 core DAK components</li>
              <li>✅ Understand Level 2 vs Level 3 distinction</li>
              <li>✅ Ready to start building your DAK</li>
            </ul>
            <div class="help-tip">
              <strong>🚀 Pro Tip:</strong> Use the contextual help on each component page for specific guidance as you work.
            </div>
          `
        }
      ]
    });

    // Tutorial Framework Demo - New enhanced tutorial to demonstrate the system
    this.registerTutorial('tutorial-framework-demo', {
      title: 'Enhanced Tutorial System Demo',
      description: 'Demonstration of the new branching tutorial capabilities in SGEX',
      category: 'getting-started',
      pages: ['dak-dashboard', 'landing-page-authenticated'],
      priority: 0, // High priority to show first
      badge: '/sgex/cat-paw-icon.svg',
      steps: [
        {
          title: 'Welcome to Enhanced Tutorials!',
          content: `
            <p>🎉 Welcome to the new enhanced tutorial system in SGEX Workbench!</p>
            <p>This tutorial demonstrates the new features:</p>
            <ul>
              <li><strong>Branching Logic:</strong> Choose your own path through tutorials</li>
              <li><strong>Progress Tracking:</strong> Your progress is automatically saved</li>
              <li><strong>Interactive Choices:</strong> Click buttons to make decisions</li>
              <li><strong>Contextual Content:</strong> Tutorials adapt to your current workflow</li>
            </ul>
            <div class="help-tip">
              <strong>🚀 New Feature:</strong> This tutorial system supports conditional navigation based on user choices!
            </div>
          `
        },
        {
          title: 'Choose Your Learning Path',
          content: `
            <p>Let's demonstrate branching logic! What would you like to learn about?</p>
            <h4>Select your area of interest:</h4>
          `,
          branches: [
            {
              choice: 'tutorial-features',
              label: '🔧 Tutorial System Features',
              description: 'Learn about the capabilities of the new tutorial framework'
            },
            {
              choice: 'accessibility-features',
              label: '♿ Accessibility & Standards',
              description: 'Discover how tutorials support accessibility and internationalization'
            },
            {
              choice: 'developer-features',
              label: '👩‍💻 Developer Integration',
              description: 'See how developers can create and integrate new tutorials'
            }
          ]
        },
        {
          title: 'Tutorial System Features',
          content: `
            <p>You chose to learn about tutorial features! Here's what makes this system powerful:</p>
            <h4>🎯 Key Features</h4>
            <ul>
              <li><strong>Branching Navigation:</strong> Users can choose different paths through content</li>
              <li><strong>Progress Persistence:</strong> Tutorial state is saved automatically</li>
              <li><strong>Context Awareness:</strong> Tutorials adapt based on current page and user state</li>
              <li><strong>Category Organization:</strong> Tutorials are organized by topic and difficulty</li>
              <li><strong>Responsive Design:</strong> Works perfectly on desktop and mobile</li>
            </ul>
            <div class="help-tip">
              <strong>💡 Implementation:</strong> Tutorials use alphanumeric IDs with dashes for easy identification and management.
            </div>
          `,
          next: 5
        },
        {
          title: 'Accessibility & Standards Compliance',
          content: `
            <p>You chose accessibility! Great choice - SGEX tutorials are built with standards in mind:</p>
            <h4>♿ Accessibility Features</h4>
            <ul>
              <li><strong>WCAG 2.1 AA Compliance:</strong> Proper color contrast and keyboard navigation</li>
              <li><strong>Screen Reader Support:</strong> Semantic HTML and ARIA labels</li>
              <li><strong>Keyboard Navigation:</strong> Full keyboard support for all interactions</li>
              <li><strong>Focus Management:</strong> Clear focus indicators and logical tab order</li>
            </ul>
            <h4>🌍 Internationalization</h4>
            <ul>
              <li><strong>i18n Ready:</strong> All content supports translation</li>
              <li><strong>RTL Support:</strong> Right-to-left languages supported</li>
              <li><strong>Default Locale:</strong> en_US with fallback support</li>
            </ul>
            <div class="help-tip">
              <strong>🏆 Standards:</strong> Follows WHO Enterprise Architecture guidelines for healthcare applications.
            </div>
          `,
          next: 5
        },
        {
          title: 'Developer Integration Guide',
          content: `
            <p>You chose the developer path! Here's how to integrate tutorials into your components:</p>
            <h4>👩‍💻 Integration Methods</h4>
            <ul>
              <li><strong>TutorialManager:</strong> Higher-order component for page-level tutorial management</li>
              <li><strong>TutorialLauncher:</strong> Button component to launch specific tutorials</li>
              <li><strong>useTutorials Hook:</strong> React hook for functional components</li>
              <li><strong>Direct Service:</strong> Import tutorialService for advanced usage</li>
            </ul>
            <div class="help-tip">
              <strong>🛠️ Code Example:</strong><br>
              <code>import { TutorialLauncher } from '../components/TutorialManager';</code><br>
              <code>&lt;TutorialLauncher tutorialId="my-tutorial" /&gt;</code>
            </div>
          `,
          next: 5
        },
        {
          title: 'Tutorial Complete!',
          content: `
            <p>🎊 Congratulations! You've experienced the enhanced tutorial system!</p>
            <h4>What You've Learned</h4>
            <ul>
              <li>✅ How branching logic works in tutorials</li>
              <li>✅ The key features available to content creators</li>
              <li>✅ Accessibility and internationalization support</li>
              <li>✅ Developer integration options</li>
            </ul>
            <h4>🚀 Next Steps</h4>
            <p>Now you can:</p>
            <ul>
              <li>Create your own tutorials using the framework</li>
              <li>Use the TutorialManager components in your pages</li>
              <li>Explore other tutorials available in the system</li>
            </ul>
            <div class="help-tip">
              <strong>💡 Tip:</strong> Look for the contextual help button on any page to access page-specific tutorials!
            </div>
          `
        }
      ]
    });
  }

  /**
   * Convert existing help content to enhanced tutorial format (for backward compatibility)
   * @param {Object} helpTopic - Existing help topic from helpContentService
   * @returns {Object} Enhanced tutorial definition
   */
  convertHelpTopicToTutorial(helpTopic) {
    if (!helpTopic || helpTopic.type !== 'slideshow') {
      return null;
    }

    return {
      id: helpTopic.id,
      title: helpTopic.title,
      description: `Converted from help topic: ${helpTopic.title}`,
      category: 'legacy',
      badge: helpTopic.badge,
      steps: helpTopic.content.map(slide => ({
        title: slide.title,
        content: slide.content
      }))
    };
  }

  /**
   * Get tutorial progress/state storage key
   * @param {string} tutorialId - Tutorial ID
   * @param {Object} contextData - Context data
   * @returns {string} Storage key
   */
  getTutorialStateKey(tutorialId, contextData = {}) {
    const baseKey = `sgex_tutorial_${tutorialId}`;
    const contextKey = contextData.repository ? 
      `_${contextData.repository.owner}_${contextData.repository.name}` : 
      '';
    return baseKey + contextKey;
  }

  /**
   * Save tutorial progress
   * @param {string} tutorialId - Tutorial ID
   * @param {Object} state - Tutorial state
   * @param {Object} contextData - Context data
   */
  saveTutorialProgress(tutorialId, state, contextData = {}) {
    try {
      const key = this.getTutorialStateKey(tutorialId, contextData);
      const progressData = {
        tutorialId,
        state,
        lastAccessed: new Date().toISOString(),
        contextData: {
          page: contextData.pageId,
          repository: contextData.repository ? `${contextData.repository.owner}/${contextData.repository.name}` : null
        }
      };
      localStorage.setItem(key, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save tutorial progress:', error);
    }
  }

  /**
   * Load tutorial progress
   * @param {string} tutorialId - Tutorial ID
   * @param {Object} contextData - Context data
   * @returns {Object|null} Tutorial state or null
   */
  loadTutorialProgress(tutorialId, contextData = {}) {
    try {
      const key = this.getTutorialStateKey(tutorialId, contextData);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load tutorial progress:', error);
    }
    return null;
  }
}

// Create and export singleton instance
const tutorialService = new TutorialService();
export default tutorialService;