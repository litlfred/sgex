# Feature File Linking and Chaining Analysis

This document analyzes best practices for managing linking and chaining of Gherkin feature files in the SGEX tutorial generation system.

## Current Implementation

The tutorial generation system currently processes feature files independently. Each feature file represents a complete user journey scenario.

## Linking/Chaining Options

### 1. Background Dependencies

**Approach**: Use Gherkin `Background` sections to establish common prerequisites.

**Example**:
```gherkin
# base-authentication.feature
Feature: Base Authentication Setup
  Background:
    Given I am on the SGEX Workbench landing page
    And I have a valid GitHub PAT
    And I am ready to authenticate

# user-login-pat.feature  
Feature: User PAT Login Process
  Background:
    Given I include "base-authentication.feature"
    
  Scenario: User successfully logs in with PAT
    When I say "Now that we have our prerequisites ready..."
    # ... rest of scenario
```

**Pros**:
- Clear dependency structure
- Reusable authentication setup
- Maintains scenario independence

**Cons**:
- Requires additional parsing logic
- Complex dependency resolution

### 2. Scenario Chaining

**Approach**: Link scenarios across files using precondition/postcondition contracts.

**Example**:
```gherkin
# user-login-pat.feature
Feature: User PAT Login Process
  @postcondition:authenticated
  Scenario: User successfully logs in with PAT
    # ... login steps
    Then I should be authenticated and on the welcome page

# profile-selection.feature  
Feature: Profile Selection
  @precondition:authenticated
  Scenario: User selects WHO profile
    Given I am authenticated and on the welcome page
    # ... profile selection steps
```

**Pros**:
- Explicit dependency contracts
- Supports complex workflows
- Clear state transitions

**Cons**:
- Requires annotation processing
- Potential circular dependencies
- Complex state management

### 3. Story-Based Grouping

**Approach**: Group related feature files into story collections.

**Example**:
```yaml
# stories/new-user-onboarding.yml
story: "New User Onboarding"
description: "Complete journey for new SGEX users"
features:
  - user-login-pat.feature
  - profile-selection-dak-scanning.feature  
  - help-mascot-documentation.feature
execution:
  mode: "sequential"
  shared_state: true
  reset_between: false
```

**Pros**:
- High-level workflow organization
- Supports both sequential and parallel execution
- Maintains feature file independence
- Easy to understand and maintain

**Cons**:
- Additional configuration layer
- Need for story execution engine

### 4. Composite Scenarios

**Approach**: Create master feature files that reference other scenarios.

**Example**:
```gherkin
# complete-user-journey.feature
Feature: Complete User Journey
  Scenario: End-to-end user experience
    When I execute scenario "User successfully logs in with PAT" from "user-login-pat.feature"
    And I execute scenario "User selects WHO profile" from "profile-selection-dak-scanning.feature"  
    And I execute scenario "User accesses help system" from "help-mascot-documentation.feature"
    Then I should have completed the full user journey
```

**Pros**:
- Natural Gherkin syntax
- Clear execution flow
- Supports scenario reuse

**Cons**:
- Custom step definitions required
- Potential for complex nesting
- Difficult error isolation

## Recommended Approach: Story-Based Grouping

For the SGEX tutorial generation system, **Story-Based Grouping** is recommended because:

### Benefits

1. **Simplicity**: Easy to understand and implement
2. **Flexibility**: Supports both chained and independent scenarios
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new stories and features
5. **Tool Integration**: Works well with existing CI/CD workflows

### Implementation Plan

#### 1. Story Configuration Format

Create story definition files in `stories/` directory:

```yaml
# stories/new-user-onboarding.yml
story: "New User Onboarding"
description: "Complete workflow for new users getting started with SGEX"
tags: ["onboarding", "beginner"]

execution:
  mode: "sequential"           # or "parallel"
  shared_state: true          # maintain browser state between features
  reset_between: false        # don't reset application state
  
features:
  - file: "user-login-pat.feature"
    description: "Authentication with GitHub PAT"
    required: true
    
  - file: "profile-selection-dak-scanning.feature" 
    description: "Finding and selecting DAK repositories"
    required: true
    depends_on: ["user-login-pat.feature"]
    
  - file: "help-mascot-documentation.feature"
    description: "Accessing help and documentation"
    required: false

output:
  combined_video: true        # create single video for entire story
  individual_videos: true    # also create per-feature videos
  languages: ["en", "fr", "es"]
```

#### 2. Story Execution Engine

Extend the tutorial orchestrator to support story-based execution:

```javascript
// In tutorial-orchestrator.js
class StoryExecutor {
  async executeStory(storyConfig, languages) {
    const results = {};
    
    if (storyConfig.execution.mode === 'sequential') {
      // Execute features in order, maintaining state
      for (const featureConfig of storyConfig.features) {
        const result = await this.executeFeature(featureConfig, languages, {
          preserveState: storyConfig.execution.shared_state
        });
        results[featureConfig.file] = result;
      }
    } else {
      // Execute features in parallel
      const promises = storyConfig.features.map(featureConfig => 
        this.executeFeature(featureConfig, languages)
      );
      const parallelResults = await Promise.all(promises);
      // Combine results...
    }
    
    if (storyConfig.output.combined_video) {
      await this.createCombinedVideo(results, storyConfig);
    }
    
    return results;
  }
}
```

#### 3. Enhanced CLI Interface

```bash
# Execute individual features (current behavior)
node scripts/tutorial-orchestrator.js --features user-login-pat

# Execute complete stories
node scripts/tutorial-orchestrator.js --story new-user-onboarding

# Execute multiple stories
node scripts/tutorial-orchestrator.js --stories new-user-onboarding,advanced-workflows

# List available stories
node scripts/tutorial-orchestrator.js --list-stories
```

#### 4. GitHub Actions Integration

Extend the workflow to support story execution:

```yaml
inputs:
  execution_mode:
    description: 'Execution mode'
    required: false
    type: choice
    options:
      - 'features'  # Individual features
      - 'stories'   # Story-based execution
    default: 'features'
    
  story_names:
    description: 'Story names to execute (when execution_mode=stories)'
    required: false
    default: 'new-user-onboarding'
```

### Migration Strategy

1. **Phase 1**: Implement story configuration parser
2. **Phase 2**: Add story execution engine to orchestrator
3. **Phase 3**: Create initial story definitions
4. **Phase 4**: Update GitHub Actions workflow
5. **Phase 5**: Add documentation and examples

### Example Stories

#### Basic Stories
- `new-user-onboarding`: Login → Profile Selection → Help
- `dak-authoring`: Login → DAK Selection → Component Editing
- `collaboration`: Login → Branch Creation → PR Workflow

#### Advanced Stories  
- `complete-dak-workflow`: Full DAK development lifecycle
- `multi-language-setup`: Internationalization workflow
- `troubleshooting`: Common error scenarios and resolutions

## Alternative Considerations

### State Management

For chained scenarios, consider:

1. **Browser State Persistence**: Keep browser session active between features
2. **Application State Snapshots**: Save/restore application state
3. **Database Seeding**: Pre-populate with required data
4. **Mock Services**: Use consistent mock responses

### Error Handling

Chain execution requires robust error handling:

1. **Graceful Degradation**: Continue execution when possible
2. **Rollback Mechanisms**: Reset state on failures
3. **Partial Results**: Save successful portions
4. **Error Reporting**: Clear indication of failure points

## Conclusion

Story-based grouping provides the best balance of simplicity, flexibility, and maintainability for the SGEX tutorial generation system. It allows for both independent feature execution and complex chained workflows while maintaining clear separation of concerns and easy extensibility.

The recommended implementation provides a foundation for sophisticated tutorial workflows while keeping the system approachable for both developers and content creators.