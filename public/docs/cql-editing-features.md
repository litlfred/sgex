# CQL Editing and Execution Features

## Overview

The SGEX Workbench now provides comprehensive client-side Clinical Quality Language (CQL) editing, execution, validation, and introspection capabilities. This implementation addresses the requirements for both **Decision Logic** (Patient context) and **Program Indicators** (Population context) DAK components.

## Features Implemented

### ✅ Core CQL Infrastructure

**CQL Services:**
- **CQLExecutionService**: Client-side CQL execution using the `cql-execution` library
- **CQLIntrospectionService**: Parse CQL to extract data elements, library dependencies, and metadata
- **CQLValidationService**: Validate data element references against DAK data dictionary
- **CQLEditor**: Full-featured editor with tabbed interface for editing, execution, validation, and introspection

**Key Capabilities:**
- Client-side CQL editing with syntax highlighting (SQL fallback)
- CQL execution against test data (FHIR bundles)
- Validation of data elements against data dictionary with suggestions
- Introspection of CQL dependencies and references
- Library linking with clickable navigation between CQL files

### ✅ Enhanced DecisionSupportLogicView

**New CQL Files Tab:**
- Lists all CQL files from the `input/cql` directory
- Categorizes files by context (Patient, Population, Unknown)
- Patient context CQL files appear under "Decision Logic" section
- Integrated CQLEditor for in-browser editing
- Save to staging ground functionality

**Features:**
- File listing with size and context information
- Edit button to open CQL files in the integrated editor
- GitHub links for direct repository access
- Validation against loaded data dictionary

### ✅ New ProgramIndicatorsView Component

**Dedicated Indicators Component:**
- Route: `/program-indicators/{user}/{repo}/{branch}`
- Focuses on Population context CQL files
- Parses FHIR Measure resources for indicator definitions
- Population-specific CQL file management

**Features:**
- Indicator Definitions tab showing parsed FHIR Measure resources
- Population CQL tab for editing Population context CQL files
- File categorization and context validation
- Integration with data dictionary validation

### ✅ CQL Editor Features

**Tabbed Interface:**
- **Editor Tab**: Split-view editing with syntax highlighting and preview
- **Execution Tab**: Run CQL against test data with result visualization
- **Validation Tab**: Validate data elements with detailed error reporting
- **Introspection Tab**: View extracted dependencies and references

**Functionality:**
- Syntax highlighting using react-syntax-highlighter (SQL fallback for CQL)
- Real-time introspection as content changes
- Test data selection for execution
- Save to staging ground with metadata
- Library linking with clickable navigation

### ✅ Library Linking System

**Navigation Features:**
- Parse CQL `include` statements and extract library references
- Extract function calls to external libraries
- Clickable "View" buttons in introspection results
- Smart matching by library name and content analysis
- Navigation between referenced CQL files

**Implementation:**
- `extractLibraryReferences()` method extracts includes and function calls
- `onLibraryClick` prop enables navigation between files
- Search algorithm matches library names with available CQL files
- Handles aliases and versioned library references

### ✅ Data Element Validation

**Validation Features:**
- Check all referenced data elements against DAK data dictionary
- Support for upstream dependencies validation
- Provide suggestions for similar elements (typo detection)
- Validate value set references with format checking
- Generate comprehensive validation reports

**Validation Results:**
- Element-by-element validation status
- Source identification (local vs upstream)
- Issue reporting with suggestions
- Summary statistics and overall validity

### ✅ File Management and Categorization

**CQL File Organization:**
- **Patient Context**: Decision logic for individual patient care
- **Population Context**: Indicator calculations and population measures
- **Unknown Context**: Files with unrecognized or missing context

**Features:**
- Automatic context detection from CQL content
- File size display and metadata
- GitHub integration for version control
- Staging ground integration for local changes

## Implementation Details

### Dependencies Added
```json
{
  "cql-execution": "^3.3.0",
  "cql-exec-fhir": "^2.1.6"
}
```

### New Components
- `src/components/CQLEditor.js` - Main CQL editing component
- `src/components/CQLEditor.css` - Styles for CQL editor
- `src/components/ProgramIndicatorsView.js` - Program indicators component
- `src/components/ProgramIndicatorsView.css` - Styles for indicators view

### New Services
- `src/services/cqlExecutionService.js` - CQL execution engine
- `src/services/cqlIntrospectionService.js` - CQL parsing and analysis
- `src/services/cqlValidationService.js` - Data element validation

### Route Configuration
Added to `public/routes-config.json`:
```json
{
  "program-indicators": {
    "component": "ProgramIndicatorsView",
    "path": "./components/ProgramIndicatorsView"
  }
}
```

### Testing
- `src/tests/CQLServices.integration.test.js` - Comprehensive integration tests
- 15 test cases covering introspection, validation, and execution workflows
- Tests for library reference extraction and data element validation

## Usage Guide

### Accessing CQL Features

**Decision Support Logic:**
1. Navigate to `/decision-support-logic/{user}/{repo}/{branch}`
2. Click the "CQL Files" tab
3. View categorized CQL files and click "Edit" to open in editor

**Program Indicators:**
1. Navigate to `/program-indicators/{user}/{repo}/{branch}`
2. View indicator definitions and Population CQL files
3. Click "Edit" to open CQL files in the integrated editor

### Using the CQL Editor

**Editing CQL:**
1. Use the Editor tab for split-view editing with syntax highlighting
2. Save changes to staging ground for version control
3. Preview changes in real-time

**Executing CQL:**
1. Switch to Execution tab
2. Select test data (FHIR bundles)
3. Click "Execute CQL" to run against test data
4. View results and execution status

**Validating CQL:**
1. Switch to Validation tab
2. Click "Validate" to check data elements
3. Review validation results and fix issues
4. View suggestions for similar elements

**Introspection and Navigation:**
1. Switch to Introspection tab to view dependencies
2. Click "View" buttons next to libraries to navigate
3. Review data elements and value sets referenced
4. See extracted definitions and parameters

### Library Linking

**Navigation Between CQL Files:**
1. Open any CQL file in the editor
2. Switch to Introspection tab
3. Click "View" next to library dependencies
4. Navigate directly to referenced CQL files

## Architecture Notes

### Client-Side Execution
- All CQL processing happens in the browser
- No server-side dependencies required
- Uses `cql-execution` library for ELM JSON execution
- Integrates with existing GitHub-based architecture

### Data Flow
1. Load CQL files from `input/cql` directory
2. Parse and categorize by context (Patient/Population)
3. Validate against data dictionary from `input/fsh/codesystems/DAK.fsh`
4. Enable editing with real-time introspection
5. Save changes to staging ground for commit workflow

### Integration Points
- **Staging Ground**: Save CQL changes before commit
- **Data Dictionary**: Validate against DAK code systems
- **GitHub Service**: Load files and repository metadata
- **Page Framework**: Consistent routing and navigation

## Future Enhancements

### Potential Improvements
1. **CQL-to-ELM Translation**: Integrate with CQL translation service
2. **Advanced Syntax Highlighting**: Custom CQL language mode
3. **Test Data Management**: Enhanced test data editor and management
4. **Measure Authoring**: FHIR Measure resource creation and editing
5. **Library Management**: Advanced dependency management and versioning

### Extension Points
- Pluggable CQL engines for different execution environments
- Additional validation rules and custom validators
- Enhanced test data formats and sources
- Integration with external terminology services

## Related Documentation

- [Requirements](./requirements.md) - Original functional requirements
- [Solution Architecture](./solution-architecture.md) - Technical architecture
- [DAK Components](./dak-components.md) - DAK component specifications
- [GitHub Issue #867](https://github.com/litlfred/sgex/issues/867) - Original implementation request

---

This implementation provides a complete solution for client-side CQL editing, execution, validation, and introspection, addressing all requirements specified in the original issue for both Decision Logic and Program Indicators DAK components.