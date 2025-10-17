# Program Indicators Component Migration Plan

## Overview

This document outlines the migration plan for updating the Program Indicators components to use the new DAK Component Object architecture introduced in PR #1111.

## Current Implementation

The current implementation (commits `caae430` and `9a553e1`) includes:

1. **ProgramIndicatorsViewer.js**: Lists measures from `input/fsh/measures/` directory
   - Directly uses `githubService.getContents()` and `githubService.getFileContent()`
   - Manually parses FSH files to extract Title
   - Custom FSH parsing logic

2. **ProgramIndicatorEditor.js**: Edits program indicators with FSH preview
   - Directly uses `githubService.getFileContent()` for loading
   - Uses `stagingGroundService.updateFile()` for saving
   - Manual FSH parsing with `parseFSHToIndicatorData()`
   - Manual FSH generation with `generateFSHFromIndicatorData()`

## Target Architecture (from PR #1111)

According to PR #1111, the new architecture includes:

### ProgramIndicatorComponent Class
- Location: `packages/dak-core/src/components/ProgramIndicatorComponent.ts`
- Handles JSON indicators with numerator/denominator
- Directory: `input/indicators/`
- Methods:
  - `getSources()` - Get all indicator sources
  - `addSource(source)` - Add new indicator source
  - `retrieveAll()` - Retrieve all indicators
  - `retrieveById(id)` - Get specific indicator
  - `save(indicator)` - Save indicator
  - `validate(indicator)` - Validate indicator data

### React Integration
- **ComponentObjectProvider** - React context for DAK object access
- **useDakComponent('indicators')** - Hook to access ProgramIndicatorComponent
- **editorIntegrationService** - Bridge between React and TypeScript

### DAK Object Integration
- DAKObject manages all 9 component types
- Automatic dak.json updates through component callbacks
- Source types: canonical URL, relative URL, inline instance data

## Migration Tasks

### Phase 1: Update ProgramIndicatorsViewer.js

**Current approach:**
```javascript
// Direct GitHub API usage
const files = await githubService.getContents(owner, repoName, 'input/fsh/measures', ref);
const content = await githubService.getFileContent(owner, repoName, file.path, ref);
const title = extractTitleFromFSH(content);
```

**New approach:**
```javascript
// Use ProgramIndicatorComponent
import { useDakComponent } from '../services/editorIntegrationService';

const component = useDakComponent('indicators');
const indicators = await component.retrieveAll();
// Indicators are already parsed with all metadata
```

**Changes needed:**
1. Import `useDakComponent` hook
2. Replace `githubService` calls with `component.retrieveAll()`
3. Remove manual FSH parsing logic (`extractTitleFromFSH`)
4. Update data structure to work with ProgramIndicator objects
5. Update navigation to pass indicator ID instead of file path

### Phase 2: Update ProgramIndicatorEditor.js

**Current approach:**
```javascript
// Manual loading and parsing
const content = await githubService.getFileContent(owner, repoName, decodedPath, ref);
const parsed = parseFSHToIndicatorData(content);

// Manual saving
stagingGroundService.updateFile(decodedPath, content, {...});
```

**New approach:**
```javascript
// Use ProgramIndicatorComponent
const component = useDakComponent('indicators');
const indicator = await component.retrieveById(indicatorId);

// Edit indicator object directly
indicator.name = newName;
indicator.numerator = newNumerator;

// Save with automatic dak.json update
await component.save(indicator);
```

**Changes needed:**
1. Import `useDakComponent` hook
2. Change from file path to indicator ID in URL params
3. Replace `githubService.getFileContent()` with `component.retrieveById()`
4. Work with ProgramIndicator object structure instead of FSH content
5. Replace manual FSH parsing/generation
6. Replace `stagingGroundService.updateFile()` with `component.save()`
7. Remove FSH preview panel (or keep as read-only generated FSH)
8. Update form fields to match ProgramIndicator schema

### Phase 3: Update Data Model

**Current ProgramIndicator fields (our interpretation):**
```javascript
{
  id: string,
  name: string,
  definition: string,
  numerator: string,
  denominator: string,
  disaggregation: string,
  descriptionString: string,
  descriptionUri: string,
  references: string[]
}
```

**Actual ProgramIndicator schema (from smart-base):**
Need to verify the exact schema in `packages/dak-core/src/schemas/` or the Component class.

According to PR #1111, ProgramIndicatorComponent handles "JSON indicators with numerator/denominator from `input/indicators/`".

This means indicators are stored as JSON files, not FSH files!

**Critical Discovery:** The current implementation is based on FHIR Measure FSH files in `input/fsh/measures/`, but the new Component Object architecture uses JSON files in `input/indicators/`. This is a significant change.

### Phase 4: Reconcile FSH vs JSON Format

**Issue:** Original requirement mentions "Measure instance fsh" but PR #1111 indicates JSON format.

**Options:**
1. **Option A:** Update to use JSON format exclusively
   - Store indicators as JSON in `input/indicators/`
   - Remove FSH parsing/generation
   - Simpler data model
   
2. **Option B:** Support both formats
   - JSON for LM data (`input/indicators/`)
   - FSH for FHIR Measure resources (`input/fsh/measures/`)
   - Maintain mapping between formats
   
3. **Option C:** Generate FSH from JSON
   - Edit JSON indicators
   - Auto-generate FSH Measure files
   - Requires FSH generation logic

**Recommendation:** Clarify with stakeholders which format(s) should be supported.

### Phase 5: Update Routing

**Current routes:**
- Viewer: `/program-indicators/:user/:repo/:branch`
- Editor: `/program-indicator-editor/:user/:repo/:branch/*` (file path)

**New routes:**
- Viewer: `/program-indicators/:user/:repo/:branch`
- Editor: `/program-indicator-editor/:user/:repo/:branch/:indicatorId`

Change from file path to indicator ID.

### Phase 6: Update Field Mapping

**Current mapping (FSH-based):**
- `id` → `Instance: {id}`
- `name` → `Title: "{name}"`
- `definition` → `* description = "{definition}"`
- etc.

**New mapping (JSON-based):**
Need to understand the actual JSON schema for ProgramIndicator from the Component class.

### Phase 7: Testing Updates

Update tests to use Component Object mocks instead of githubService mocks.

## Questions for Stakeholders

1. **Format Clarification:** Should indicators be stored as JSON (per Component Object architecture) or FSH (per original requirement)? Or both?

2. **Directory Location:** Should we use `input/indicators/` (Component Object default) or `input/fsh/measures/` (original requirement)?

3. **FSH Generation:** If using JSON format, should we auto-generate FSH Measure files for FHIR IG compilation?

4. **Migration Path:** Should we:
   - Completely replace current implementation?
   - Support both old and new formats during transition?
   - Provide migration tool for existing FSH files?

5. **dak.json Updates:** The Component Object architecture automatically updates dak.json. Should we keep or remove the manual dak.json update logic in our current implementation?

## Implementation Steps (After Main Merge)

1. **Merge main branch** into `copilot/add-dak-component-indicators`
2. **Verify ProgramIndicatorComponent** exists and review its API
3. **Decide on format** (JSON vs FSH) based on stakeholder input
4. **Update ProgramIndicatorsViewer** to use `useDakComponent('indicators')`
5. **Update ProgramIndicatorEditor** to use Component Object API
6. **Update tests** to work with new architecture
7. **Remove deprecated code** (manual FSH parsing, direct githubService calls)
8. **Test end-to-end** workflow
9. **Update documentation** with new approach

## Files to Modify

1. `src/components/ProgramIndicatorsViewer.js` - Use Component Object
2. `src/components/ProgramIndicatorEditor.js` - Use Component Object
3. `src/components/ProgramIndicatorsViewer.css` - May need updates for JSON data
4. `src/components/ProgramIndicatorEditor.css` - May need updates if UI changes
5. Tests (if any) - Update to use Component Object mocks

## Files to Potentially Remove

1. Manual FSH parsing functions in `ProgramIndicatorEditor.js`
2. Manual FSH generation functions in `ProgramIndicatorEditor.js`
3. Direct `githubService` usage for indicator files
4. Direct `stagingGroundService` usage (replaced by Component Object)

## Expected Benefits

1. **Automatic dak.json updates** - No manual sync needed
2. **Consistent data model** - All indicators use same structure
3. **Better validation** - Component Object provides built-in validation
4. **Easier testing** - Mock Component Object instead of multiple services
5. **Code reduction** - Remove 200-300 lines of manual FSH parsing/generation
6. **Type safety** - TypeScript types for indicator data

## Risks and Mitigation

**Risk 1: Breaking changes in data format**
- Mitigation: Provide migration script for existing data

**Risk 2: Loss of FSH editing capability**
- Mitigation: Keep FSH preview, or provide FSH export feature

**Risk 3: Different directory structure**
- Mitigation: Document new structure, provide migration guide

**Risk 4: User workflow disruption**
- Mitigation: Maintain similar UI/UX, clear documentation

## Timeline Estimate

- Phase 1-2: 4-6 hours (Update both components)
- Phase 3-4: 2-3 hours (Data model reconciliation)
- Phase 5-6: 2-3 hours (Routing and mapping updates)
- Phase 7: 2-3 hours (Testing)
- Total: 10-15 hours of development

## Next Steps

1. **Immediate:** Merge main branch to access new Component Object architecture
2. **Clarify:** Get stakeholder input on JSON vs FSH format question
3. **Plan:** Create detailed implementation tickets
4. **Execute:** Implement changes following this plan
5. **Review:** Test and validate all changes
6. **Document:** Update user documentation with new approach

---

**Status:** Waiting for main branch merge and stakeholder clarification on format questions.
**Last Updated:** 2025-10-16
