# Phase 6: Asset Editor Integration with DAK Component Objects

## Overview

Phase 6 focuses on updating asset editors to use DAK Component Objects instead of direct staging ground or file access. This provides a clean separation of concerns and automatic dak.json management.

## Integration Strategy

### Non-Breaking Approach
- Existing editors continue to work during migration
- Opt-in migration path for each editor
- Can migrate editors one at a time
- Backwards compatible with current patterns

### Architecture

```
React Editor Component
    ↓ (uses useDakComponent hook)
ComponentObjectProvider (React Context)
    ↓ (provides access to)
DAK Object → Component Objects
    ↓ (handles storage through)
StagingGroundIntegrationService → stagingGroundService
```

## Core Integration Components

### 1. ComponentObjectProvider (React Context)
Provides DAK object and component objects to editor components.

```javascript
// src/services/ComponentObjectProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DAKFactory } from '@sgex/dak-core';
import stagingGroundService from './stagingGroundService';

const ComponentObjectContext = createContext(null);

export const ComponentObjectProvider = ({ children, repository, branch }) => {
  const [dakObject, setDakObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDakObject = async () => {
      if (!repository) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const factory = new DAKFactory(stagingGroundService);
        const dak = await factory.createFromRepository(
          repository.owner?.login || repository.full_name.split('/')[0],
          repository.name,
          branch || 'main'
        );
        setDakObject(dak);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize DAK object:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initializeDakObject();
  }, [repository, branch]);

  const value = {
    dakObject,
    loading,
    error,
    // Convenience accessors for all 9 components
    healthInterventions: dakObject?.healthInterventions,
    personas: dakObject?.personas,
    userScenarios: dakObject?.userScenarios,
    businessProcesses: dakObject?.businessProcesses,
    dataElements: dakObject?.dataElements,
    decisionLogic: dakObject?.decisionLogic,
    indicators: dakObject?.indicators,
    requirements: dakObject?.requirements,
    testScenarios: dakObject?.testScenarios
  };

  return (
    <ComponentObjectContext.Provider value={value}>
      {children}
    </ComponentObjectContext.Provider>
  );
};

export const useDakObject = () => {
  const context = useContext(ComponentObjectContext);
  if (!context) {
    throw new Error('useDakObject must be used within ComponentObjectProvider');
  }
  return context;
};
```

### 2. useDakComponent Hook
Custom hook for accessing specific component objects.

```javascript
// src/hooks/useDakComponent.js
import { useDakObject } from '../services/ComponentObjectProvider';

export const useDakComponent = (componentType) => {
  const { dakObject, loading, error, [componentType]: component } = useDakObject();

  return {
    component,
    dakObject,
    loading,
    error,
    // Convenience methods
    retrieveAll: async () => component?.retrieveAll(),
    retrieveById: async (id) => component?.retrieveById(id),
    save: async (data, options) => component?.save(data, options),
    validate: async (data) => component?.validate(data),
    getSources: () => component?.getSources(),
    addSource: (source) => component?.addSource(source)
  };
};
```

### 3. Editor Integration Service (Bridge Layer)
Bridges existing editor services with Component Objects.

```javascript
// src/services/editorIntegrationService.js
/**
 * Editor Integration Service
 * 
 * Bridges existing editor services with new DAK Component Objects.
 * Provides backwards compatibility while enabling migration.
 */

class EditorIntegrationService {
  constructor() {
    this.dakFactory = null;
    this.currentDakObject = null;
  }

  /**
   * Initialize DAK object for current repository
   */
  async initializeForRepository(repository, branch, stagingGroundService) {
    const { DAKFactory } = await import('@sgex/dak-core');
    this.dakFactory = new DAKFactory(stagingGroundService);
    
    this.currentDakObject = await this.dakFactory.createFromRepository(
      repository.owner?.login || repository.full_name.split('/')[0],
      repository.name,
      branch || 'main'
    );
    
    return this.currentDakObject;
  }

  /**
   * Get DAK object (initialize if needed)
   */
  getDakObject() {
    return this.currentDakObject;
  }

  /**
   * Save BPMN workflow through BusinessProcessWorkflowComponent
   */
  async saveBpmnWorkflow(filename, xmlContent, metadata = {}) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.businessProcesses;
    const result = await component.save({
      id: filename.replace('.bpmn', ''),
      name: metadata.name || filename,
      description: metadata.description || '',
      xml: xmlContent
    }, {
      filename,
      format: 'bpmn',
      validate: true
    });

    return result;
  }

  /**
   * Load BPMN workflows through BusinessProcessWorkflowComponent
   */
  async loadBpmnWorkflows() {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.businessProcesses;
    const workflows = await component.retrieveAll();
    return workflows;
  }

  /**
   * Save actor/persona through GenericPersonaComponent
   */
  async saveActor(actorDefinition, generateFsh = true) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.personas;
    const result = await component.save({
      id: actorDefinition.id,
      name: actorDefinition.name,
      description: actorDefinition.description,
      type: actorDefinition.type,
      roles: actorDefinition.roles,
      qualifications: actorDefinition.qualifications,
      metadata: actorDefinition.metadata
    }, {
      format: 'fsh',
      validate: true
    });

    return result;
  }

  /**
   * Load actors/personas through GenericPersonaComponent
   */
  async loadActors() {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject.personas;
    const actors = await component.retrieveAll();
    return actors;
  }

  /**
   * Generic save method for any component type
   */
  async saveComponent(componentType, data, options) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject[componentType];
    if (!component) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return await component.save(data, options);
  }

  /**
   * Generic retrieve method for any component type
   */
  async retrieveComponent(componentType) {
    if (!this.currentDakObject) {
      throw new Error('DAK object not initialized');
    }

    const component = this.currentDakObject[componentType];
    if (!component) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return await component.retrieveAll();
  }
}

// Singleton instance
const editorIntegrationService = new EditorIntegrationService();
export default editorIntegrationService;
```

## Editor Migration Examples

### Example 1: BPMNEditor Migration

**Before (Direct staging ground access):**
```javascript
// Old approach - direct file manipulation
import stagingGroundService from '../services/stagingGroundService';

const saveBpmn = async () => {
  const xml = await modeler.saveXML();
  stagingGroundService.updateFile(
    `input/process/${filename}`,
    xml.xml
  );
};
```

**After (Using Component Object):**
```javascript
// New approach - through Component Object
import { useDakComponent } from '../hooks/useDakComponent';

const BPMNEditor = () => {
  const { component, save, validate } = useDakComponent('businessProcesses');
  
  const saveBpmn = async () => {
    const xml = await modeler.saveXML();
    
    // Validate first
    const validation = await validate({
      id: filename.replace('.bpmn', ''),
      xml: xml.xml
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Save through Component Object
    // This automatically updates dak.json with source reference
    await save({
      id: filename.replace('.bpmn', ''),
      name: processName,
      description: processDescription,
      xml: xml.xml
    }, {
      filename,
      format: 'bpmn'
    });
  };
  
  // ...rest of component
};
```

### Example 2: ActorEditor Migration

**Before (Using actorDefinitionService):**
```javascript
// Old approach - custom service layer
import actorDefinitionService from '../services/actorDefinitionService';

const saveActor = async () => {
  actorDefinitionService.saveToStagingGround(actorDefinition, {
    generateFSH: true
  });
};
```

**After (Using Component Object):**
```javascript
// New approach - through Component Object
import { useDakComponent } from '../hooks/useDakComponent';

const ActorEditor = () => {
  const { component, save, validate, retrieveAll } = useDakComponent('personas');
  
  const saveActor = async () => {
    // Validate first
    const validation = await validate(actorDefinition);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Save through Component Object
    // FSH generation and dak.json update handled automatically
    await save(actorDefinition, {
      format: 'fsh',
      validate: true
    });
  };
  
  const loadActors = async () => {
    const actors = await retrieveAll();
    setStagedActors(actors);
  };
  
  // ...rest of component
};
```

## Migration Checklist for Each Editor

### For each asset editor:

1. **Wrap with ComponentObjectProvider** (if not already at app level)
   ```javascript
   <ComponentObjectProvider repository={repository} branch={branch}>
     <YourEditor />
   </ComponentObjectProvider>
   ```

2. **Replace direct staging ground calls with useDakComponent**
   ```javascript
   const { component, save, retrieveAll, validate } = useDakComponent('componentType');
   ```

3. **Update save operations**
   - Replace direct file writes with `component.save()`
   - Remove manual dak.json updates (handled automatically)
   - Add validation before save

4. **Update load operations**
   - Replace direct file reads with `component.retrieveAll()` or `component.retrieveById()`
   - Remove manual source scanning

5. **Update validation**
   - Use `component.validate()` for consistent validation
   - Display validation errors consistently

6. **Test thoroughly**
   - Verify save/load operations
   - Check dak.json is updated correctly
   - Confirm sources are created properly

## Editor Migration Priority

### High Priority (Core Editors)
1. **BPMNEditor** - Business processes (most complex)
2. **ActorEditor** - Generic personas (FSH generation)
3. **DecisionSupportLogicView** - DMN decision tables

### Medium Priority (Specialized Editors)
4. **CoreDataDictionaryViewer** - Core data elements
5. **QuestionnaireEditor** - Data entry forms
6. **ExampleValueSetEditor** - Terminology

### Lower Priority (Documentation Editors)
7. User scenario editors (markdown)
8. Requirements editors (markdown)
9. Health interventions editors (markdown)

## Benefits of Migration

1. **Automatic dak.json Management**
   - No manual source tracking
   - Consistent source format
   - Proper relative URL handling

2. **Validation Integration**
   - Component-specific validation rules
   - Consistent error handling
   - Early error detection

3. **Source Resolution**
   - Support for canonical URLs
   - Support for relative URLs
   - Support for inline data
   - Automatic caching

4. **Cleaner Code**
   - Less boilerplate
   - No direct file manipulation
   - Separation of concerns

5. **Type Safety**
   - TypeScript types from @sgex/dak-core
   - Consistent interfaces
   - Better IDE support

## Testing Strategy

### Unit Tests
- Test Component Object methods in isolation
- Mock staging ground service
- Verify dak.json updates

### Integration Tests
- Test editor → Component Object → Staging Ground flow
- Verify file creation and updates
- Check dak.json synchronization

### E2E Tests
- Test complete editor workflows
- Verify UI reflects Component Object state
- Check saved artifacts are correct

## Timeline Estimate

- **Integration Framework**: 1 day (completed)
- **High Priority Editors** (3): 3-4 days
- **Medium Priority Editors** (3): 2-3 days
- **Lower Priority Editors** (3): 1-2 days
- **Testing & Documentation**: 2 days

**Total**: ~9-12 days for complete migration

## Next Steps

1. ✅ Create integration framework (ComponentObjectProvider, hooks, bridge service)
2. Create example integration for BPMNEditor
3. Create example integration for ActorEditor
4. Document patterns and create migration guide
5. Migrate remaining editors following established pattern
6. Add comprehensive tests
7. Update documentation

## Implementation Notes

- Keep existing editor services during migration for backwards compatibility
- Add feature flags if needed for gradual rollout
- Monitor for performance issues (Component Objects add abstraction layer)
- Consider lazy loading Component Objects for large repositories
- Add error boundaries around Component Object operations
