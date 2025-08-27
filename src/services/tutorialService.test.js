import tutorialService from '../services/tutorialService';

describe('TutorialService', () => {
  beforeEach(() => {
    // Clear any existing tutorials before each test
    tutorialService.tutorials.clear();
  });

  test('should register a tutorial successfully', () => {
    const tutorialDef = {
      title: 'Test Tutorial',
      description: 'A test tutorial',
      category: 'testing',
      pages: ['test-page'],
      steps: [
        {
          title: 'Step 1',
          content: 'Test content'
        }
      ]
    };

    expect(() => {
      tutorialService.registerTutorial('test-tutorial', tutorialDef);
    }).not.toThrow();

    const retrieved = tutorialService.getTutorial('test-tutorial');
    expect(retrieved).toBeDefined();
    expect(retrieved.title).toBe('Test Tutorial');
  });

  test('should reject invalid tutorial IDs', () => {
    const tutorialDef = {
      title: 'Test Tutorial',
      steps: [{ title: 'Step 1', content: 'Test' }]
    };

    expect(() => {
      tutorialService.registerTutorial('invalid tutorial id!', tutorialDef);
    }).toThrow('Invalid tutorial ID format');
  });

  test('should reject tutorials missing required fields', () => {
    expect(() => {
      tutorialService.registerTutorial('test-tutorial', {
        // Missing title and steps
      });
    }).toThrow('Tutorial definition missing required field: title');
  });

  test('should get tutorials for a specific page', () => {
    const tutorial1 = {
      title: 'Tutorial 1',
      pages: ['page1', 'page2'],
      steps: [{ title: 'Step 1', content: 'Test' }]
    };

    const tutorial2 = {
      title: 'Tutorial 2', 
      pages: ['page2', 'page3'],
      steps: [{ title: 'Step 1', content: 'Test' }]
    };

    tutorialService.registerTutorial('tutorial-1', tutorial1);
    tutorialService.registerTutorial('tutorial-2', tutorial2);

    const page1Tutorials = tutorialService.getTutorialsForPage('page1');
    expect(page1Tutorials).toHaveLength(1);
    expect(page1Tutorials[0].title).toBe('Tutorial 1');

    const page2Tutorials = tutorialService.getTutorialsForPage('page2');
    expect(page2Tutorials).toHaveLength(2);
  });

  test('should support branching logic in step processing', () => {
    const tutorial = {
      title: 'Branching Tutorial',
      steps: [
        {
          title: 'Choice Step',
          content: 'Make a choice',
          branches: [
            { choice: 'option-a', label: 'Option A', targetStep: 2 },
            { choice: 'option-b', label: 'Option B', targetStep: 1 }
          ]
        },
        {
          title: 'Step 2',
          content: 'This is step 2'
        },
        {
          title: 'Step 3', 
          content: 'This is step 3'
        }
      ]
    };

    tutorialService.registerTutorial('branching-tutorial', tutorial);

    // Test normal progression
    let result = tutorialService.processStep(tutorial, 0, null, {});
    expect(result.step.title).toBe('Choice Step');
    expect(result.stepIndex).toBe(0);

    // Test branching to step 2 (index 2)
    result = tutorialService.processStep(tutorial, 0, 'option-a', {});
    expect(result.stepIndex).toBe(2);
    expect(result.step.title).toBe('Step 3');

    // Test branching to step 1 (index 1)  
    result = tutorialService.processStep(tutorial, 0, 'option-b', {});
    expect(result.stepIndex).toBe(1);
    expect(result.step.title).toBe('Step 2');
  });

  test('should convert legacy help topics to tutorials', () => {
    const helpTopic = {
      id: 'legacy-help',
      title: 'Legacy Help Topic',
      type: 'slideshow',
      content: [
        {
          title: 'Step 1',
          content: 'Legacy content 1'
        },
        {
          title: 'Step 2', 
          content: 'Legacy content 2'
        }
      ]
    };

    const converted = tutorialService.convertHelpTopicToTutorial(helpTopic);
    expect(converted).toBeDefined();
    expect(converted.id).toBe('legacy-help');
    expect(converted.title).toBe('Legacy Help Topic');
    expect(converted.steps).toHaveLength(2);
    expect(converted.steps[0].title).toBe('Step 1');
  });

  test('should handle tutorial state persistence keys', () => {
    const contextData = {
      repository: { owner: 'test-user', name: 'test-repo' }
    };

    const key = tutorialService.getTutorialStateKey('test-tutorial', contextData);
    expect(key).toBe('sgex_tutorial_test-tutorial_test-user_test-repo');

    const keyWithoutRepo = tutorialService.getTutorialStateKey('test-tutorial');
    expect(keyWithoutRepo).toBe('sgex_tutorial_test-tutorial');
  });

  test('should filter tutorials based on context requirements', () => {
    const authRequiredTutorial = {
      title: 'Auth Required',
      requiresAuth: true,
      pages: ['test-page'],
      steps: [{ title: 'Step 1', content: 'Test' }]
    };

    const dakRequiredTutorial = {
      title: 'DAK Required',
      requiresDak: true,
      pages: ['test-page'], 
      steps: [{ title: 'Step 1', content: 'Test' }]
    };

    tutorialService.registerTutorial('auth-tutorial', authRequiredTutorial);
    tutorialService.registerTutorial('dak-tutorial', dakRequiredTutorial);

    // Without authentication
    const noAuthTutorials = tutorialService.getTutorialsForPage('test-page', { isAuthenticated: false });
    expect(noAuthTutorials).toHaveLength(0);

    // With authentication but no DAK
    const authTutorials = tutorialService.getTutorialsForPage('test-page', { isAuthenticated: true });
    expect(authTutorials).toHaveLength(1);
    expect(authTutorials[0].title).toBe('Auth Required');

    // With authentication and DAK
    const allTutorials = tutorialService.getTutorialsForPage('test-page', { 
      isAuthenticated: true,
      repository: { name: 'test-repo' }
    });
    expect(allTutorials).toHaveLength(2);
  });
});