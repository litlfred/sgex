# Tutorial Framework

The SGEX Workbench tutorial framework provides an interactive, branching tutorial system that transforms the existing help system into a sophisticated learning experience. The framework supports context-aware tutorials, branching logic, progress tracking, and seamless integration with the page framework.

## Overview

The tutorial framework consists of several key components that work together to provide an enhanced user experience:

- **TutorialService**: Core service for tutorial management, registration, and progress tracking
- **EnhancedTutorialModal**: Interactive modal with branching navigation and accessibility features
- **TutorialManager**: Higher-order component for page-level tutorial integration
- **TutorialLauncher**: Button component for launching specific tutorials
- **TutorialMenu**: Menu component displaying available tutorials with categories
- **useTutorials**: React hook for functional component integration

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tutorial Framework Architecture              │
├─────────────────────────────────────────────────────────────────┤
│  Page Components                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ TutorialManager │  │ TutorialLauncher│  │ ContextualHelp  │  │
│  │                 │  │                 │  │ Mascot          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 TutorialService                             │ │
│  │  • Tutorial Registration    • Context Filtering            │ │
│  │  • Branching Logic          • Progress Persistence         │ │
│  │  • Category Management      • Legacy Compatibility         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                 │                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              EnhancedTutorialModal                          │ │
│  │  • Interactive Navigation   • Accessibility Features       │ │
│  │  • Progress Tracking        • Theme-Aware Styling          │ │
│  │  • Branching Support        • Responsive Design            │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ localStorage    │  │ Tutorial        │  │ Legacy Help     │  │
│  │ Progress        │  │ Definitions     │  │ Topics          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Enhanced Tutorial Service

The `tutorialService.js` provides the core functionality for tutorial management:

- **Alphanumeric Tutorial IDs** with dashes for clean identification (e.g., `github-pat-setup`, `dak-components-overview`)
- **Branching Logic Support** for conditional navigation based on user choices
- **Tutorial Categories** for better organization (authentication, dak-management, getting-started, etc.)
- **Context-Aware Filtering** that shows relevant tutorials based on page and user state
- **Progress Persistence** using localStorage to save tutorial state
- **Legacy Compatibility** with automatic conversion of existing help topics

### 2. Interactive Tutorial Modal

The `EnhancedTutorialModal.js` provides an interactive learning experience:

- **Branching Navigation** with interactive choice buttons for user-driven paths
- **Visual Progress Tracking** with step indicators and completion status
- **Responsive Design** that works on desktop and mobile devices
- **Accessibility Features** including ARIA labels, keyboard navigation, and screen reader support
- **Theme-Aware Styling** supporting both light and dark modes

### 3. Tutorial Management Components

The framework provides several components for easy integration:

- **`TutorialManager`** - Higher-order component for page-level tutorial integration
- **`TutorialLauncher`** - Button component for launching specific tutorials
- **`TutorialMenu`** - Menu component displaying available tutorials with categories
- **`useTutorials`** - React hook for functional component integration

## Tutorial Definition Format

Tutorials are defined as structured JSON objects with clear separation of content and logic:

```javascript
{
  id: 'tutorial-id',                    // Unique alphanumeric ID with dashes
  title: 'Tutorial Title',              // Display title
  description: 'Brief description',     // Description for tutorial menu
  category: 'category-name',            // Category for organization
  pages: ['page-id'],                   // Array of page IDs where tutorial is relevant
  requirements: {                       // Optional requirements
    userType: 'authenticated',          // 'authenticated', 'unauthenticated', 'demo', 'any'
    context: {                         // Context-specific requirements
      hasRepository: true
    }
  },
  steps: [
    {
      title: 'Step Title',             // Step title
      content: 'HTML content',         // HTML content for the step
      branches: [                      // Optional branching choices
        {
          choice: 'option-a',          // Choice identifier
          label: 'Option A Label',     // Choice button label
          targetStep: 2                // Target step index (0-based)
        },
        {
          choice: 'option-b',
          label: 'Option B Label',
          targetStep: 3
        }
      ]
    },
    {
      title: 'Step 2 Title',
      content: 'Content for option A path'
    },
    {
      title: 'Step 3 Title', 
      content: 'Content for option B path'
    }
  ]
}
```

### Tutorial Categories

The framework supports the following built-in categories:

- **`getting-started`** - Getting Started tutorials
- **`authentication`** - Authentication and setup tutorials
- **`dak-management`** - DAK Management tutorials
- **`content-editing`** - Content Editing tutorials
- **`collaboration`** - Collaboration tutorials
- **`troubleshooting`** - Troubleshooting tutorials

## API Reference

### TutorialService

#### Core Methods

```javascript
// Register a new tutorial
tutorialService.registerTutorial(tutorialId, tutorialDefinition);

// Get a tutorial by ID
const tutorial = tutorialService.getTutorial(tutorialId);

// Get tutorials for a specific page
const tutorials = tutorialService.getTutorialsForPage(pageId, contextData);

// Get tutorials by category
const tutorials = tutorialService.getTutorialsByCategory(category);

// Process branching logic
const nextStep = tutorialService.processBranchChoice(
  tutorial, currentStep, choice, tutorialState
);

// Progress management
tutorialService.saveTutorialProgress(tutorialId, progress, contextData);
const progress = tutorialService.loadTutorialProgress(tutorialId, contextData);

// Legacy help topic conversion
const convertedTutorial = tutorialService.convertHelpTopicToTutorial(helpTopic);
```

### TutorialManager Component

Higher-order component that provides tutorial management capabilities:

```javascript
<TutorialManager 
  pageId="page-identifier"           // Required: Page identifier
  contextData={{                     // Optional: Context data for filtering
    user: 'username',
    repository: repositoryObject,
    userType: 'authenticated'
  }}
  tutorials={[]}                     // Optional: Page-specific tutorials to register
  autoRegisterTutorials={true}       // Optional: Auto-register provided tutorials
>
  {({ 
    launchTutorial,                  // Function to launch a tutorial
    availableTutorials,              // Array of available tutorials
    showTutorialMenu                 // Function to show tutorial menu
  }) => (
    <div>
      <button onClick={() => launchTutorial('github-pat-setup')}>
        Launch GitHub Setup Tutorial
      </button>
      <TutorialMenu tutorials={availableTutorials} />
    </div>
  )}
</TutorialManager>
```

### TutorialLauncher Component

Button component for launching specific tutorials:

```javascript
<TutorialLauncher 
  tutorialId="github-pat-setup"      // Required: Tutorial to launch
  variant="primary"                  // Optional: Button variant
  size="medium"                      // Optional: Button size
  className="custom-button"          // Optional: Additional CSS classes
  contextData={contextData}          // Optional: Context data
>
  Launch Tutorial
</TutorialLauncher>
```

### TutorialMenu Component

Menu component for displaying available tutorials:

```javascript
<TutorialMenu 
  tutorials={tutorials}              // Required: Array of tutorials
  onTutorialSelect={handleSelect}    // Optional: Selection callback
  showCategories={true}              // Optional: Show category grouping
  maxHeight="400px"                  // Optional: Maximum menu height
/>
```

### useTutorials Hook

React hook for functional component integration:

```javascript
const {
  tutorials,                         // Available tutorials for current page
  launchTutorial,                   // Function to launch tutorial
  currentTutorial,                  // Currently active tutorial
  tutorialState                     // Current tutorial state
} = useTutorials(pageId, contextData);
```

## Page Framework Integration

The tutorial framework is fully integrated with the SGEX page framework and follows the same patterns:

### Automatic Integration

The tutorial system is automatically available on any page that uses `PageLayout`:

```javascript
import { PageLayout } from '../components/framework';

const MyPage = () => {
  return (
    <PageLayout pageName="my-page">
      {/* Tutorial system is automatically available */}
      <div>Page content</div>
    </PageLayout>
  );
};
```

### ContextualHelpMascot Integration

The help mascot automatically includes tutorial functionality:

```javascript
import { ContextualHelpMascot } from '../components';

// Mascot automatically includes tutorial menu and legacy help topics
<ContextualHelpMascot 
  pageId="my-page"
  notificationBadge="/sgex/cat-paw-icon.svg"
/>
```

### Tutorial Registration in Page Components

Page components can register their own tutorials:

```javascript
import React, { useEffect } from 'react';
import { PageLayout } from '../components/framework';
import tutorialService from '../services/tutorialService';

const MyPage = () => {
  useEffect(() => {
    // Register page-specific tutorial
    tutorialService.registerTutorial('my-page-tutorial', {
      id: 'my-page-tutorial',
      title: 'My Page Tutorial',
      description: 'Learn how to use this page',
      category: 'getting-started',
      pages: ['my-page'],
      steps: [
        {
          title: 'Welcome',
          content: '<p>Welcome to this page tutorial!</p>'
        }
      ]
    });
  }, []);

  return (
    <PageLayout pageName="my-page">
      <div>Page content</div>
    </PageLayout>
  );
};
```

## Built-in Tutorials

The framework includes several built-in tutorials:

### 1. GitHub PAT Setup Tutorial (`github-pat-setup`)

Enhanced tutorial for setting up GitHub Personal Access Tokens with branching logic for different token types:

- Fine-grained tokens setup path
- Classic tokens setup path  
- Permission configuration guidance
- Integration with SGEX authentication

### 2. DAK Components Overview Tutorial (`dak-components-overview`)

Interactive learning paths for understanding DAK components:

- Business logic vs technical implementation paths
- Component-specific deep dives
- L2/L3 architecture explanation
- Hands-on examples

### 3. Tutorial Framework Demo (`tutorial-framework-demo`)

Showcases the new branching capabilities:

- Interactive choice demonstrations
- Progress tracking examples
- Accessibility feature highlights
- Integration pattern examples

## Usage Examples

### Basic Tutorial Registration

```javascript
import tutorialService from '../services/tutorialService';

// Register a simple tutorial
tutorialService.registerTutorial('basic-tutorial', {
  id: 'basic-tutorial',
  title: 'Basic Tutorial',
  description: 'A simple tutorial example',
  category: 'getting-started',
  pages: ['dashboard'],
  steps: [
    {
      title: 'Welcome',
      content: '<p>Welcome to SGEX Workbench!</p>'
    },
    {
      title: 'Navigation',
      content: '<p>Use the navigation bar to move between sections.</p>'
    }
  ]
});
```

### Branching Tutorial Example

```javascript
tutorialService.registerTutorial('branching-tutorial', {
  id: 'branching-tutorial',
  title: 'Branching Tutorial',
  description: 'Demonstrates branching logic',
  category: 'getting-started',
  pages: ['dashboard'],
  steps: [
    {
      title: 'Choose Your Path',
      content: '<p>Select your experience level:</p>',
      branches: [
        {
          choice: 'beginner',
          label: 'I\'m new to SGEX',
          targetStep: 1
        },
        {
          choice: 'advanced',
          label: 'I\'m experienced',
          targetStep: 2
        }
      ]
    },
    {
      title: 'Beginner Path',
      content: '<p>Let\'s start with the basics...</p>'
    },
    {
      title: 'Advanced Path', 
      content: '<p>Here are the advanced features...</p>'
    }
  ]
});
```

### Context-Aware Tutorial

```javascript
tutorialService.registerTutorial('context-tutorial', {
  id: 'context-tutorial',
  title: 'Context-Aware Tutorial',
  description: 'Adapts based on user context',
  category: 'dak-management',
  pages: ['dak-dashboard'],
  requirements: {
    userType: 'authenticated',
    context: {
      hasRepository: true
    }
  },
  steps: [
    {
      title: 'Repository Specific',
      content: '<p>This tutorial is specific to your repository context.</p>'
    }
  ]
});
```

### Page Integration with TutorialManager

```javascript
import React from 'react';
import { PageLayout } from '../components/framework';
import { TutorialManager, TutorialLauncher } from '../components';

const DAKDashboard = () => {
  const pageTutorials = [
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'Learn about the DAK dashboard',
      category: 'dak-management',
      steps: [
        {
          title: 'Dashboard Features',
          content: '<p>The dashboard shows your DAK components...</p>'
        }
      ]
    }
  ];

  return (
    <PageLayout pageName="dak-dashboard">
      <TutorialManager 
        pageId="dak-dashboard"
        tutorials={pageTutorials}
        contextData={{ hasRepository: true }}
      >
        {({ launchTutorial, availableTutorials }) => (
          <div>
            <h1>DAK Dashboard</h1>
            
            <div className="tutorial-section">
              <h2>Getting Started</h2>
              <TutorialLauncher 
                tutorialId="dashboard-overview"
                variant="primary"
              >
                Take Dashboard Tour
              </TutorialLauncher>
            </div>

            <div className="dashboard-content">
              {/* Dashboard content */}
            </div>
          </div>
        )}
      </TutorialManager>
    </PageLayout>
  );
};
```

## Accessibility Features

The tutorial framework includes comprehensive accessibility support:

### Keyboard Navigation
- **Tab navigation** through all interactive elements
- **Enter/Space** to activate buttons and choices
- **Escape** to close tutorial modal
- **Arrow keys** for step navigation

### Screen Reader Support
- **ARIA labels** on all interactive elements
- **Role attributes** for proper element identification
- **Live regions** for dynamic content updates
- **Descriptive text** for progress indicators

### Visual Accessibility
- **High contrast** colors that meet WCAG 2.1 AA standards
- **Scalable text** that respects user font size preferences
- **Focus indicators** for keyboard navigation
- **Color-independent** information presentation

### Implementation Example

```javascript
// Tutorial steps automatically include accessibility features
{
  title: 'Accessible Step',
  content: `
    <p>This content includes proper accessibility markup:</p>
    <ul role="list">
      <li>Screen reader friendly descriptions</li>
      <li>Proper heading hierarchy</li>
      <li>Descriptive link text</li>
    </ul>
  `
}
```

## Internationalization Support

The tutorial framework is fully internationalized using react-i18next:

### Translation Keys

Tutorial content supports translation keys:

```javascript
{
  title: t('tutorial.github-pat-setup.title'),
  content: t('tutorial.github-pat-setup.step1.content')
}
```

### Built-in Language Support

Default language support includes:
- **en_US** - English (United States) - Default locale
- Ready for additional locale additions

### Translation Example

```json
{
  "tutorial": {
    "github-pat-setup": {
      "title": "GitHub Personal Access Token Setup",
      "description": "Learn how to set up GitHub authentication",
      "step1": {
        "title": "Choose Token Type",
        "content": "<p>Select the type of GitHub token you want to create:</p>"
      }
    }
  }
}
```

## Performance Considerations

The tutorial framework is designed for optimal performance:

### Lazy Loading
- Tutorials are loaded only when needed
- Modal components are rendered on demand
- Large tutorial content is chunked appropriately

### Caching
- Tutorial definitions are cached in memory
- Progress data is cached in localStorage
- Context filtering results are cached per page

### Bundle Size
- Core tutorial service is lightweight (~15KB)
- Modal components are code-split
- Dependencies are minimized

## Testing

The tutorial framework includes comprehensive test coverage:

### Test Categories
- **Unit Tests**: Individual service and component testing
- **Integration Tests**: Component interaction testing  
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Performance Tests**: Load time and memory usage testing

### Running Tests

```bash
# Run all tutorial framework tests
npm test -- tutorialService.test.js

# Run with coverage
npm test -- --coverage tutorialService.test.js
```

### Test Coverage Areas
- Tutorial registration and validation
- Branching logic processing
- Context-based filtering
- Legacy help topic conversion
- Progress persistence
- Component rendering and interaction

## Migration from Legacy Help System

The tutorial framework provides seamless migration from the existing help system:

### Automatic Conversion

Legacy help topics are automatically converted to tutorials:

```javascript
// Legacy help topic
const helpTopic = {
  id: 'legacy-help',
  title: 'Legacy Help Topic',
  type: 'slideshow',
  content: [
    { title: 'Step 1', content: '<p>Content 1</p>' },
    { title: 'Step 2', content: '<p>Content 2</p>' }
  ]
};

// Automatically converted to tutorial
const tutorial = tutorialService.convertHelpTopicToTutorial(helpTopic);
```

### Backwards Compatibility

Existing help topics continue to work:
- **HelpModal** supports both legacy topics and new tutorials
- **ContextualHelpMascot** displays both in unified menu
- **No breaking changes** to existing help functionality

### Migration Strategy

1. **Phase 1**: Deploy tutorial framework alongside existing help system
2. **Phase 2**: Convert high-priority help topics to enhanced tutorials
3. **Phase 3**: Gradually migrate remaining help content
4. **Phase 4**: Optional removal of legacy help system (if desired)

## Best Practices

### Tutorial Design

1. **Keep Steps Focused**: Each step should cover one concept or action
2. **Use Branching Wisely**: Branch only when user experience diverges significantly  
3. **Provide Context**: Include relevant context data for filtering
4. **Test Accessibility**: Verify keyboard navigation and screen reader compatibility

### Content Guidelines

1. **Clear Language**: Use simple, clear language appropriate for target audience
2. **Progressive Disclosure**: Start with basics, add complexity gradually
3. **Visual Hierarchy**: Use proper HTML heading structure
4. **Actionable Content**: Include specific steps users can take

### Integration Patterns

1. **Page-Level Registration**: Register tutorials at the page level where they're used
2. **Context Awareness**: Use context data to show relevant tutorials
3. **Category Organization**: Group related tutorials by category
4. **Progress Tracking**: Enable progress tracking for multi-step tutorials

### Performance Best Practices

1. **Lazy Registration**: Register tutorials only when needed
2. **Efficient Filtering**: Cache context filtering results
3. **Minimal Dependencies**: Keep tutorial definitions lightweight
4. **Progress Cleanup**: Clean up old progress data periodically

## Future Enhancements

Planned enhancements for the tutorial framework:

### Short-term Roadmap
- **Tutorial Analytics**: Track tutorial completion and user behavior
- **Dynamic Content**: Support for dynamic tutorial content based on user data
- **Advanced Branching**: More sophisticated branching logic with conditions
- **Tutorial Playlists**: Sequential tutorial chains for learning paths

### Long-term Vision
- **AI-Powered Suggestions**: Intelligent tutorial recommendations
- **User-Created Tutorials**: Allow users to create and share tutorials
- **Integration APIs**: APIs for external tutorial content sources
- **Advanced Progress Tracking**: Detailed progress analytics and reporting

## Troubleshooting

### Common Issues

#### Tutorial Not Appearing
```javascript
// Check registration
const tutorial = tutorialService.getTutorial('my-tutorial-id');
if (!tutorial) {
  console.log('Tutorial not registered');
}

// Check page context
const pageTutorials = tutorialService.getTutorialsForPage('my-page');
console.log('Available tutorials:', pageTutorials);
```

#### Branching Not Working
```javascript
// Verify branch definition
const step = tutorial.steps[currentStepIndex];
if (!step.branches || step.branches.length === 0) {
  console.log('No branches defined for this step');
}

// Check choice processing
const nextStep = tutorialService.processBranchChoice(
  tutorial, currentStep, choice, tutorialState
);
```

#### Progress Not Persisting
```javascript
// Check localStorage permissions
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (e) {
  console.log('localStorage not available:', e);
}
```

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Enable debug mode
tutorialService.setDebugMode(true);

// Tutorial operations will now log detailed information
```

## Support and Contributing

### Getting Help
- Check the [troubleshooting section](#troubleshooting) above
- Review the [API reference](#api-reference) for implementation details
- Examine the built-in tutorials for examples
- Use browser developer tools to inspect tutorial state

### Contributing
- Follow the established patterns for tutorial registration
- Include comprehensive tests for new features
- Maintain accessibility standards
- Update documentation for new capabilities

The tutorial framework provides a powerful foundation for creating interactive learning experiences within SGEX Workbench while maintaining full backward compatibility and following established accessibility and internationalization standards.