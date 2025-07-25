# BPMN Integration Requirements

## Overview

This document describes the requirements and implementation for BPMN (Business Process Model and Notation) diagram editing functionality in the SGEX Workbench, enabling collaborative editing of WHO SMART Guidelines business processes.

## Functional Requirements

### Pre-Conditions

- **REQ-BPMN-001**: User must have selected a SMART Guidelines GitHub repository
  - Repository must contain `input/business-processes/` directory
  - User must have appropriate GitHub repository permissions
  - User authentication via GitHub OAuth must be completed

### BPMN File Management

- **REQ-BPMN-002**: The system SHALL browse and list .bpmn files in `input/business-processes/` directory
  - Display files with metadata (name, size, last modified)
  - Support file selection for editing
  - Show file path context (`input/business-processes/`)
  - Handle empty directories gracefully

- **REQ-BPMN-003**: The system SHALL load BPMN content from GitHub repository
  - Fetch actual BPMN XML content via GitHub API
  - Fallback to mock content for demonstration purposes
  - Support both public and private repositories (with appropriate permissions)
  - Handle network errors and API rate limits gracefully

### BPMN Diagram Editing

- **REQ-BPMN-004**: The system SHALL provide visual BPMN diagram editing capabilities
  - Integration with bpmn-js library for diagram rendering
  - Support for BPMN 2.0 standard elements (start events, tasks, end events, sequence flows)
  - Interactive diagram editing with drag-and-drop functionality
  - Element property editing and configuration
  - Visual palette for adding new BPMN elements

- **REQ-BPMN-005**: The system SHALL support BPMN XML import/export
  - Import existing BPMN XML files for editing
  - Export edited diagrams as valid BPMN XML
  - Preserve BPMN XML structure and metadata
  - Maintain compatibility with other BPMN tools

### Save and Version Control

- **REQ-BPMN-006**: The system SHALL provide save functionality with commit messages
  - Prompt user for descriptive commit message before saving
  - Validate commit message is not empty
  - Show save progress and completion status
  - Handle save errors with user-friendly messaging

- **REQ-BPMN-007**: The system SHALL commit changes to GitHub repository
  - Use GitHub API to create or update file contents
  - Include user-provided commit message
  - Maintain commit authorship information
  - Handle file SHA conflicts and updates
  - Support branch-based workflows

### User Experience

- **REQ-BPMN-008**: The system SHALL provide intuitive navigation
  - Breadcrumb navigation showing: Select Profile › Select Repository › DAK Components › Business Processes
  - File browser sidebar showing available BPMN files
  - Clear visual indication of selected file
  - Responsive design for different screen sizes

- **REQ-BPMN-009**: The system SHALL provide appropriate feedback
  - Loading indicators during file operations
  - Error messages for failed operations
  - Success confirmation for save operations
  - Progress indicators for GitHub API operations

## Technical Implementation

### Architecture

- **Component Structure**: Dedicated `BPMNEditor` component separate from generic `ComponentEditor`
- **Routing**: Specific route `/bpmn-editor` for business processes component
- **State Management**: React hooks for component state and GitHub API integration
- **Styling**: Custom CSS with WHO SMART Guidelines branding

### Dependencies

- **bpmn-js**: Core BPMN diagram editing library
- **bpmn-moddle**: BPMN model handling and XML processing
- **@octokit/rest**: GitHub API integration
- **React Router**: Navigation and routing

### GitHub API Integration

The BPMN editor integrates with GitHub's REST API for:

1. **File Listing**: `GET /repos/{owner}/{repo}/contents/input/business-processes`
2. **File Content**: `GET {download_url}` for individual BPMN files
3. **File Updates**: `PUT /repos/{owner}/{repo}/contents/{path}` for saving changes

### Error Handling

- **Network Errors**: Graceful fallback to mock data for demonstration
- **API Rate Limits**: Appropriate error messaging and retry strategies
- **File Conflicts**: SHA-based conflict resolution
- **Authentication**: Clear error messages for permission issues

## User Workflow

### Primary Use Case: Edit BPMN Diagram

1. **Access**: User navigates to DAK Components dashboard
2. **Selection**: User clicks on "Business Processes" component
3. **Browse**: System displays BPMN files from `input/business-processes/`
4. **Open**: User selects a .bpmn file to edit
5. **Edit**: User modifies the BPMN diagram using visual editor
6. **Save**: User clicks Save button and enters commit message
7. **Commit**: System commits changes to GitHub repository
8. **Confirmation**: User receives success notification

### Alternative Flows

- **New File Creation**: Future enhancement for creating new BPMN files
- **Collaborative Editing**: Integration with GitHub pull request workflow
- **Validation**: BPMN diagram validation and error checking

## Integration with WHO SMART Guidelines

### Directory Structure

The BPMN editor follows WHO SMART Guidelines conventions:

```
smart-guidelines-repo/
├── input/
│   └── business-processes/
│       ├── patient-registration.bpmn
│       ├── vaccination-workflow.bpmn
│       └── appointment-scheduling.bpmn
└── [other DAK components]
```

### Process Categories

BPMN diagrams in SMART Guidelines typically represent:

- **Clinical Workflows**: Patient care processes and decision flows
- **Administrative Processes**: Registration, scheduling, and documentation
- **Quality Assurance**: Monitoring and evaluation processes
- **Data Flows**: Information exchange and reporting processes

### Compliance

- **BPMN 2.0 Standard**: Full compliance with OMG BPMN 2.0 specification
- **WHO Terminology**: Support for WHO-specific process terminology
- **Interoperability**: Compatible with other SMART Guidelines tools

## Security Considerations

### Authentication

- All GitHub operations require valid OAuth token
- Repository permissions enforced by GitHub
- No local storage of sensitive credentials

### Authorization

- Users can only access repositories with appropriate permissions
- File operations respect GitHub repository access controls
- Commit attribution maintains audit trail

### Data Protection

- No sensitive data stored in browser beyond session
- All data processing happens client-side
- GitHub serves as single source of truth for content

## Testing Requirements

### Unit Testing

- BPMN file loading and parsing
- GitHub API integration mocking
- Component state management
- Error handling scenarios

### Integration Testing

- End-to-end workflow testing
- GitHub API interaction testing
- File save and commit verification
- Error recovery testing

### User Acceptance Testing

- Business process expert validation
- WHO SMART Guidelines compliance verification
- Usability testing with target users
- Cross-browser compatibility testing

## Future Enhancements

### Advanced Features

- **Real-time Collaboration**: Multiple users editing simultaneously
- **Version History**: Visual diff and rollback capabilities
- **Advanced Validation**: SMART Guidelines-specific business rules
- **Export Options**: PDF, SVG, and other format exports

### Integration Opportunities

- **DMN Integration**: Decision tables linked to BPMN processes
- **FHIR Mapping**: Process steps mapped to FHIR resources
- **Terminology Binding**: Process elements linked to value sets
- **Form Integration**: Process tasks linked to data entry forms

## Acceptance Criteria

### Definition of Done

- [ ] BPMN files can be browsed from GitHub repository
- [ ] BPMN diagrams load and display correctly in visual editor
- [ ] Users can edit diagrams using bpmn-js interface
- [ ] Save functionality prompts for commit message
- [ ] Changes are committed to GitHub with proper attribution
- [ ] Error handling provides clear user feedback
- [ ] Component integrates seamlessly with existing SGEX navigation
- [ ] Documentation is complete and accurate

### Performance Criteria

- [ ] File listing loads within 2 seconds
- [ ] BPMN diagram rendering completes within 3 seconds
- [ ] Save operations complete within 5 seconds
- [ ] Error recovery is immediate and user-friendly

---

*This requirements document supports the implementation of BPMN editing capabilities in SGEX Workbench for WHO SMART Guidelines Digital Adaptation Kits.*