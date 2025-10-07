# DAK FAQ Component Questions Implementation Summary

## Issue Reference
Issue #1009 - Expand DAK FAQ questions to include all 9 DAK components

## What Was Implemented

Successfully created **9 component-level FAQ questions** that scan DAK repositories for each of the 9 core DAK components. Each question follows the established modular question pattern with:
- A `definition.json` file containing metadata and schema
- An `executor.ts` file containing the scanning and analysis logic

## Questions Implemented

| Question ID | Component | Description | Directories Scanned |
|------------|-----------|-------------|-------------------|
| `health-interventions` | Health Interventions | Scans for health intervention and guideline files | `input/pagecontent/l2-dak.md`, `input/iris-references/`, `input/pagecontent/*health*.md` |
| `personas` | Generic Personas | Scans for actor/persona definition files | `input/actors/`, `input/**/persona*.{json,md}` |
| `user-scenarios` | User Scenarios | Scans for user scenario and use case files | `input/scenarios/`, `input/**/*scenario*.{json,md}` |
| `business-processes` | Business Processes | Scans for BPMN workflow files | `input/process/*.bpmn`, `input/**/*.bpmn`, `input/**/*workflow*.md` |
| `data-elements` | Core Data Elements | Scans for data dictionaries, value sets, profiles | `input/vocabulary/`, `input/profiles/`, `input/extensions/` |
| `decision-logic` | Decision Support Logic | Scans for DMN decision tables and CQL logic | `input/decision-support/`, `input/cql/`, `input/**/*.dmn`, `input/**/PlanDefinition*.json` |
| `indicators` | Program Indicators | Scans for program indicator and measure definitions | `input/indicators/`, `input/measures/`, `input/**/Measure*.json` |
| `requirements` | Requirements | Scans for requirement specification files | `input/requirements/`, `input/**/Requirements*.json`, `input/pagecontent/*requirement*.md` |
| `test-scenarios` | Test Scenarios | Scans for test scenarios and example data | `input/tests/`, `input/examples/`, `input/**/TestScript*.json`, `input/pagecontent/*test*.md` |

## Technical Implementation

### File Structure
```
services/dak-faq-mcp/questions/component/
├── health-interventions/
│   ├── definition.json
│   └── executor.ts
├── personas/
│   ├── definition.json
│   └── executor.ts
├── user-scenarios/
│   ├── definition.json
│   └── executor.ts
├── business-processes/
│   ├── definition.json
│   └── executor.ts
├── data-elements/
│   ├── definition.json
│   └── executor.ts
├── decision-logic/
│   ├── definition.json
│   └── executor.ts
├── indicators/
│   ├── definition.json
│   └── executor.ts
├── requirements/
│   ├── definition.json
│   └── executor.ts
└── test-scenarios/
    ├── definition.json
    └── executor.ts
```

### Key Features

1. **Smart File Detection**: Each question intelligently scans multiple directory patterns to find relevant files
2. **Content Parsing**: Attempts to parse file contents (JSON, YAML, Markdown, XML) to extract meaningful names and metadata
3. **Type Grouping**: Results are grouped by type (e.g., ValueSet, CodeSystem, BPMN, DMN) for better organization
4. **Structured Output**: Returns both structured data (for programmatic use) and narrative HTML (for display)
5. **Caching Support**: Includes cache hints for optimization
6. **Error Handling**: Graceful fallback to filename when content parsing fails
7. **Internationalization Ready**: Uses translation keys for all user-facing text

### Response Format

Each question returns:
```json
{
  "structured": {
    "<items_key>": [
      {
        "name": "Item Name",
        "file": "path/to/file",
        "type": "Item Type"
      }
    ]
  },
  "narrative": "<h4>Question Title</h4><p>Found X items...</p><ul>...</ul>",
  "errors": [],
  "warnings": [],
  "meta": {
    "cacheHint": {
      "scope": "repository",
      "key": "component-name",
      "ttl": 3600,
      "dependencies": ["input/dir/"]
    }
  }
}
```

## Usage

### Via Catalog
```bash
curl http://127.0.0.1:3001/faq/questions/catalog?level=component
```

### Via Execution
```bash
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "health-interventions",
        "parameters": {"repository": "/path/to/dak-repo"}
      }
    ]
  }'
```

## Integration with DAK Dashboard

These questions enable the DAK Dashboard FAQ tab to:

1. **Display Badges**: Show counts of items in each component
   - Example: "Health Interventions [3]"
   
2. **Interactive Lists**: Click badges to see detailed lists with file paths

3. **Repository Links**: Provide direct links to source files in GitHub

## Build Verification

✅ TypeScript compilation successful
✅ All 9 component questions discovered
✅ Questions copied to distribution directory
✅ No build errors or warnings

## Documentation

- `services/dak-faq-mcp/docs/component-questions-usage.md` - Complete usage guide
- `docs/dak/faq/implementation-summary.md` - Updated with new questions

## Testing Status

- [x] TypeScript compilation
- [x] Question discovery via catalog
- [x] File structure validation
- [ ] Execution against real DAK repository (requires live DAK repo)
- [ ] UI integration in DAK Dashboard
- [ ] End-to-end workflow testing

## Next Steps

1. Test questions against a real WHO SMART Guidelines DAK repository
2. Integrate badge display in DAK Dashboard FAQ tab
3. Add internationalization strings for all question titles and messages
4. Consider adding optional parameters (e.g., filters, sorting)
5. Add more detailed parsing for specific file types (BPMN process details, DMN rule counts, etc.)

## Files Changed

**New Files (18):**
- 9 × `definition.json` files (one per component)
- 9 × `executor.ts` files (one per component)

**Modified Files (1):**
- `docs/dak/faq/implementation-summary.md` - Updated to reflect new questions

**Documentation (1):**
- `services/dak-faq-mcp/docs/component-questions-usage.md` - New usage guide

## Compliance with Requirements

✅ All 9 DAK components covered as specified in issue #1009
✅ Each question scans appropriate directories
✅ Returns list of items with names and source file links
✅ Follows existing question pattern (definition.json + executor.ts)
✅ TypeScript type safety maintained
✅ Build process successful
✅ Documentation provided
