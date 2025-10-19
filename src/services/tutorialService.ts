/**
 * Enhanced Tutorial Service
 * 
 * Provides branching tutorial support and improved content organization
 * 
 * @module tutorialService
 */

/**
 * Tutorial step
 * @example { "id": "step-1", "title": "Setup", "content": "First step...", "nextSteps": ["step-2"] }
 */
export interface TutorialStep {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Step content */
  content: string;
  /** Next possible steps */
  nextSteps?: string[];
  /** Condition for this step */
  condition?: string;
  /** Actions to perform */
  actions?: Array<{
    type: string;
    target: string;
    value?: any;
  }>;
}

/**
 * Tutorial definition
 */
export interface TutorialDefinition {
  /** Tutorial ID */
  id: string;
  /** Tutorial title */
  title: string;
  /** Tutorial description */
  description: string;
  /** Tutorial category */
  category: string;
  /** Tutorial difficulty */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Estimated duration */
  duration?: string;
  /** Tutorial steps */
  steps: TutorialStep[];
  /** Prerequisites */
  prerequisites?: string[];
  /** Registered timestamp */
  registeredAt?: string;
}

/**
 * Tutorial categories
 */
export interface TutorialCategories {
  [key: string]: string;
}

/**
 * Tutorial Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     TutorialDefinition:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - description
 *         - category
 *         - steps
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 */
class TutorialService {
  private tutorials: Map<string, TutorialDefinition>;
  private categories: TutorialCategories;

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
   */
  registerTutorial(tutorialId: string, tutorialDefinition: Omit<TutorialDefinition, 'id' | 'registeredAt'>): void {
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
   */
  getTutorial(tutorialId: string): TutorialDefinition | null {
    return this.tutorials.get(tutorialId) || null;
  }

  /**
   * Get all tutorials
   */
  getAllTutorials(): TutorialDefinition[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Get tutorials by category
   */
  getTutorialsByCategory(category: string): TutorialDefinition[] {
    return this.getAllTutorials().filter(t => t.category === category);
  }

  /**
   * Get tutorial categories
   */
  getCategories(): TutorialCategories {
    return { ...this.categories };
  }

  /**
   * Validate tutorial definition
   */
  validateTutorialDefinition(tutorial: any): void {
    if (!tutorial.title) {
      throw new Error('Tutorial must have a title');
    }
    if (!tutorial.description) {
      throw new Error('Tutorial must have a description');
    }
    if (!tutorial.category) {
      throw new Error('Tutorial must have a category');
    }
    if (!tutorial.steps || !Array.isArray(tutorial.steps) || tutorial.steps.length === 0) {
      throw new Error('Tutorial must have at least one step');
    }

    // Validate each step
    tutorial.steps.forEach((step: any, index: number) => {
      if (!step.id) {
        throw new Error(`Step ${index + 1} must have an id`);
      }
      if (!step.title) {
        throw new Error(`Step ${index + 1} must have a title`);
      }
      if (!step.content) {
        throw new Error(`Step ${index + 1} must have content`);
      }
    });
  }

  /**
   * Initialize built-in tutorials
   */
  initializeBuiltInTutorials(): void {
    // GitHub PAT Setup Tutorial
    this.registerTutorial('github-pat-setup', {
      title: 'Setting up GitHub Personal Access Token',
      description: 'Learn how to create and configure a GitHub Personal Access Token for SGEX Workbench',
      category: 'getting-started',
      difficulty: 'beginner',
      duration: '5 minutes',
      steps: [
        {
          id: 'intro',
          title: 'Introduction',
          content: 'This tutorial will guide you through creating a GitHub Personal Access Token (PAT) for use with SGEX Workbench.',
          nextSteps: ['navigate-github']
        },
        {
          id: 'navigate-github',
          title: 'Navigate to GitHub Settings',
          content: 'Go to GitHub.com and click on your profile icon in the top right, then select "Settings".',
          nextSteps: ['developer-settings']
        },
        {
          id: 'developer-settings',
          title: 'Access Developer Settings',
          content: 'In the left sidebar, scroll down and click on "Developer settings".',
          nextSteps: ['generate-token']
        },
        {
          id: 'generate-token',
          title: 'Generate New Token',
          content: 'Click on "Personal access tokens" → "Tokens (classic)" → "Generate new token".',
          nextSteps: ['configure-scopes']
        },
        {
          id: 'configure-scopes',
          title: 'Configure Token Scopes',
          content: 'Select the following scopes: repo (full control), read:org',
          nextSteps: ['complete']
        },
        {
          id: 'complete',
          title: 'Complete',
          content: 'Click "Generate token" and copy your token. Paste it into SGEX Workbench.'
        }
      ]
    });

    // DAK Selection Tutorial
    this.registerTutorial('dak-selection', {
      title: 'Selecting a Digital Adaptation Kit',
      description: 'Learn how to browse and select a DAK repository',
      category: 'dak-management',
      difficulty: 'beginner',
      duration: '3 minutes',
      steps: [
        {
          id: 'intro',
          title: 'Introduction',
          content: 'This tutorial will guide you through selecting a Digital Adaptation Kit (DAK) repository.',
          nextSteps: ['authenticate']
        },
        {
          id: 'authenticate',
          title: 'Authenticate with GitHub',
          content: 'First, make sure you are authenticated with your GitHub Personal Access Token.',
          nextSteps: ['select-org']
        },
        {
          id: 'select-org',
          title: 'Select Organization',
          content: 'Choose an organization or profile that contains DAK repositories.',
          nextSteps: ['browse-daks']
        },
        {
          id: 'browse-daks',
          title: 'Browse DAKs',
          content: 'SGEX will scan for repositories with sushi-config.yaml files.',
          nextSteps: ['select-dak']
        },
        {
          id: 'select-dak',
          title: 'Select a DAK',
          content: 'Click on a DAK repository to start working with it.'
        }
      ]
    });
  }

  /**
   * Get next step for a tutorial
   */
  getNextStep(tutorialId: string, currentStepId: string, branch?: string): TutorialStep | null {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) {
      return null;
    }

    const currentStep = tutorial.steps.find(s => s.id === currentStepId);
    if (!currentStep || !currentStep.nextSteps || currentStep.nextSteps.length === 0) {
      return null;
    }

    // If there are multiple next steps, use branch to determine which one
    const nextStepId = branch && currentStep.nextSteps.length > 1
      ? currentStep.nextSteps.find(id => id === branch) || currentStep.nextSteps[0]
      : currentStep.nextSteps[0];

    return tutorial.steps.find(s => s.id === nextStepId) || null;
  }

  /**
   * Check if tutorial is complete
   */
  isTutorialComplete(tutorialId: string, currentStepId: string): boolean {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) {
      return false;
    }

    const currentStep = tutorial.steps.find(s => s.id === currentStepId);
    return currentStep ? !currentStep.nextSteps || currentStep.nextSteps.length === 0 : false;
  }
}

// Export singleton instance
const tutorialService = new TutorialService();
export default tutorialService;
