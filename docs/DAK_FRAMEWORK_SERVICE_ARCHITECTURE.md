# DAK Framework Service - Actor Loading Architecture

## Overview

The `dakFrameworkService.js` provides centralized services for DAK component pages, starting with actor/persona loading. This service abstracts away the complexity of loading DAK assets from multiple sources and provides a consistent interface for all DAK component pages.

## Problem Solved

Previously, actor/persona loading was duplicated across components (UserScenariosManager had its own `loadPersonas()` method). This caused:
- Code duplication
- Inconsistent actor loading logic
- No integration with staging ground for draft changes
- No caching mechanism

## Solution: Centralized DAK Framework Service

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DAK Component Pages                       │
│  (UserScenariosManager, BPMNEditor, DecisionTables, etc.)   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ getActors(owner, repo, branch)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              dakFrameworkService.js                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  getActors() - Centralized Actor Loading            │   │
│  │    - Priority: Staging Ground → GitHub              │   │
│  │    - Caching: 5-minute TTL                          │   │
│  │    - Auto-invalidation on staging updates           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┬──────────────────────┬────────────────────────┘
              │                      │
              ▼                      ▼
┌──────────────────────┐  ┌──────────────────────┐
│ stagingGroundService │  │   githubService      │
│                      │  │                      │
│ - Staged actors      │  │ - input/fsh/actors   │
│ - Draft changes      │  │ - input/actors       │
└──────────────────────┘  └──────────────────────┘
```

### Key Features

#### 1. Prioritized Multi-Source Loading

The service loads actors from multiple sources with priority:

1. **Staging Ground** (highest priority)
   - Draft/edited actors that haven't been committed
   - Allows immediate preview of changes across all components
   
2. **GitHub Repository** (fallback)
   - Committed actors from the repository
   - Two formats supported: FSH and FHIR JSON

**Deduplication Logic**:
- If an actor exists in both staging ground and GitHub, the **staging ground version is used**
- This ensures draft changes are immediately visible across all components

#### 2. Intelligent Caching

```javascript
// Cache structure
Map {
  "owner/repo/branch" => {
    actors: [...],
    timestamp: Date.now()
  }
}
```

**Benefits**:
- Reduces GitHub API calls (rate limiting protection)
- Improves performance for repeated queries
- 5-minute TTL balances freshness and performance

**Cache Invalidation**:
- Automatically clears when staging ground is updated
- Can be manually cleared per repository or globally
- Subscribes to staging ground change events

#### 3. Dual Format Support

**FSH (FHIR Shorthand)**:
```fsh
Profile: Healthcare-worker
Parent: ActorDefinition
Id: Healthcare-worker
Title: "Healthcare Worker"
Description: "A trained healthcare professional"
```

**FHIR JSON**:
```json
{
  "resourceType": "Person",
  "id": "Healthcare-worker",
  "name": [{
    "text": "Healthcare Worker"
  }]
}
```

Both formats are parsed and normalized to a consistent structure:
```javascript
{
  id: "Healthcare-worker",
  title: "Healthcare Worker",
  description: "A trained healthcare professional",
  type: "actor",
  source: "staging-fsh" | "github-fsh" | "staging-fhir" | "github-fhir",
  staged: true | false
}
```

## API Reference

### getActors(owner, repo, branch, options)

Main method to retrieve actors from all sources.

**Parameters**:
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `branch` (string): Branch name
- `options` (object): Optional configuration
  - `useCache` (boolean): Use cached results (default: true)
  - `includeStaging` (boolean): Include staging ground actors (default: true)

**Returns**: `Promise<Array<Actor>>`

**Example**:
```javascript
import dakFrameworkService from '../services/dakFrameworkService';

// Get all actors (staging + GitHub)
const actors = await dakFrameworkService.getActors('WHO', 'anc-dak', 'main');

// Get only committed actors (skip staging)
const committedActors = await dakFrameworkService.getActors(
  'WHO', 'anc-dak', 'main',
  { includeStaging: false }
);

// Force refresh (skip cache)
const freshActors = await dakFrameworkService.getActors(
  'WHO', 'anc-dak', 'main',
  { useCache: false }
);
```

### clearCache()

Clears all cached actor data.

**Example**:
```javascript
dakFrameworkService.clearCache();
```

### clearCacheForRepo(owner, repo, branch)

Clears cache for a specific repository.

**Example**:
```javascript
dakFrameworkService.clearCacheForRepo('WHO', 'anc-dak', 'main');
```

## Usage in DAK Components

### UserScenariosManager (Updated)

```javascript
import dakFrameworkService from '../services/dakFrameworkService';

// In component
const actors = await dakFrameworkService.getActors(owner, repo, branch);
setPersonas(actors);

// In persona dropdown
{personas.map(persona => (
  <optgroup label={`${persona.title}${persona.staged ? ' 📝' : ''}`}>
    <option value={`{{persona.${persona.id}.title}}`}>
      Insert {persona.title} - title
    </option>
  </optgroup>
))}
```

### BPMN Editor (Example Usage)

```javascript
import dakFrameworkService from '../services/dakFrameworkService';

// Validate actor references in BPMN diagram
const actors = await dakFrameworkService.getActors(owner, repo, branch);
const actorIds = actors.map(a => a.id);

// Check if all referenced actors exist
bpmnParticipants.forEach(participant => {
  if (!actorIds.includes(participant.actorId)) {
    warnings.push(`Actor ${participant.actorId} not found`);
  }
});
```

### Decision Tables (Example Usage)

```javascript
import dakFrameworkService from '../services/dakFrameworkService';

// Populate actor dropdown in decision table
const actors = await dakFrameworkService.getActors(owner, repo, branch);

<select name="actor">
  {actors.map(actor => (
    <option value={actor.id}>
      {actor.title} {actor.staged ? '(draft)' : ''}
    </option>
  ))}
</select>
```

## Benefits

### 1. Consistency
- Single source of truth for actor data
- Same parsing logic across all components
- Consistent actor structure

### 2. Performance
- Caching reduces GitHub API calls
- 5-minute TTL balances freshness and performance
- Automatic cache invalidation on updates

### 3. User Experience
- Draft actors visible immediately across all components
- Visual indicators (📝) show staged changes
- No need to commit to see changes in other components

### 4. Maintainability
- No code duplication
- Easy to add new actor sources
- Centralized error handling
- Clear separation of concerns

### 5. Extensibility
- Easy to add new formats (e.g., XML, YAML)
- Can add additional data sources
- Supports future DAK framework features

## Migration Guide

### Before (Component-specific loading)

```javascript
// In UserScenariosManager.js
const loadPersonas = async (owner, repo, branch) => {
  const personas = [];
  
  // Try loading from input/fsh/actors
  const response = await githubService.octokit.rest.repos.getContent(...);
  // Parse FSH...
  
  // Try loading from input/actors
  const response2 = await githubService.octokit.rest.repos.getContent(...);
  // Parse FHIR...
  
  return personas;
};

const personas = await loadPersonas(owner, repo, branch);
```

### After (Centralized service)

```javascript
// In any component
import dakFrameworkService from '../services/dakFrameworkService';

const actors = await dakFrameworkService.getActors(owner, repo, branch);
```

**Benefits of Migration**:
- 95% less code in component
- Automatic staging ground integration
- Caching included
- Consistent with other components

## Implementation Details

### Staging Ground Integration

```javascript
// Listen for staging ground changes
stagingGroundService.addListener(() => {
  dakFrameworkService.clearCache();
});
```

When a user:
1. Edits an actor in Actor Editor
2. Saves to staging ground
3. The cache is automatically cleared
4. Next `getActors()` call loads the updated actor
5. All components see the draft actor immediately

### Actor Merging Logic

```javascript
// 1. Load staged actors
const stagedActors = await loadActorsFromStagingGround();

// 2. Load GitHub actors
const githubActors = await loadActorsFromGitHub(owner, repo, branch);

// 3. Merge - prefer staging ground
githubActors.forEach(githubActor => {
  const stagedIndex = stagedActors.findIndex(a => a.id === githubActor.id);
  if (stagedIndex === -1) {
    // Not in staging ground, add from GitHub
    stagedActors.push(githubActor);
  }
  // If in staging ground, keep staged version
});
```

### Error Handling

```javascript
try {
  const actors = await dakFrameworkService.getActors(owner, repo, branch);
} catch (error) {
  console.error('Error loading actors:', error);
  // Service returns empty array on error
  // Components can handle gracefully
}
```

## Future Enhancements

### Planned Features
1. **Validation** - Validate actor references across components
2. **Search** - Full-text search across actor properties
3. **Filtering** - Filter by type, source, status
4. **Sorting** - Sort by name, date modified, type
5. **Export** - Export actors to different formats
6. **Import** - Import actors from external sources

### Potential Extensions
1. **Personas** - Extend to support full persona objects
2. **Relationships** - Track actor relationships
3. **Versions** - Support actor versioning
4. **Permissions** - Actor-level access control

## Testing

### Unit Tests (Recommended)

```javascript
describe('dakFrameworkService', () => {
  test('getActors prioritizes staging ground', async () => {
    // Mock staging ground with actor
    // Mock GitHub with same actor
    const actors = await dakFrameworkService.getActors('owner', 'repo', 'main');
    expect(actors[0].staged).toBe(true);
  });

  test('getActors caches results', async () => {
    const actors1 = await dakFrameworkService.getActors('owner', 'repo', 'main');
    const actors2 = await dakFrameworkService.getActors('owner', 'repo', 'main');
    // Second call should use cache
  });
});
```

### Integration Tests

Test with real DAK repository:
1. Create draft actor in staging ground
2. Verify it appears in User Scenarios dropdown
3. Verify it appears in BPMN Editor actor list
4. Commit the actor
5. Verify staging indicator (📝) disappears

## Summary

The `dakFrameworkService` provides a centralized, efficient, and consistent way to load actors across all DAK component pages. By integrating with staging ground and implementing intelligent caching, it improves both developer experience (DX) and user experience (UX).

**Key Takeaways**:
- ✅ Single source of truth for actor data
- ✅ Staging ground integration for immediate preview
- ✅ Performance optimization through caching
- ✅ Reusable across all DAK components
- ✅ Extensible for future enhancements

---

**Created**: 2024
**Version**: 1.0
**Status**: Implemented and Ready for Use
