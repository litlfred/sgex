# Manage DAK Workflow Diagrams

This directory contains the complete set of workflow diagrams for the "Manage DAK" functionality in the SGeX Workbench.

## Files

### BPMN Diagrams
- **`manage-dak-workflow.bpmn`** - Complete BPMN 2.0 diagram showing all three workflow paths (edit, fork, create)
- **`manage-dak-workflow.svg`** - SVG export of the BPMN diagram for documentation and web display

### PlantUML Sequence Diagrams
- **`manage-dak-edit-workflow.puml`** - Sequence diagram for editing existing DAKs
- **`manage-dak-fork-workflow.puml`** - Sequence diagram for forking existing DAKs  
- **`manage-dak-create-workflow.puml`** - Sequence diagram for creating new DAKs from templates

### Legacy Diagram (Replaced)
- **`manage-dak-sequence.puml`** - Original unified sequence diagram (kept for reference)

## Workflow Actors

All diagrams reference the following actors with clickable links to their definitions in [`../requirements.md`](../requirements.md):

1. **[DAK Author](../requirements.md#req-actor-001)** - L2/L3 author of WHO SMART Guidelines Digital Adaptation Kits
2. **[SGeX Workbench](../requirements.md#req-actor-002)** - The collaborative editing platform (React application)
3. **[GitHub](../requirements.md#req-actor-003)** - Version control and repository management platform
4. **[OCL](../requirements.md#req-actor-004)** - Open Concept Lab terminology management system
5. **[PCMT](../requirements.md#req-actor-005)** - Product Catalogue Management Tool for health commodities

## Workflow Types

### 1. Edit Existing DAK (`manage-dak-edit-workflow.puml`)
- Select existing DAK repository with SMART Guidelines compatibility
- Direct access to component editing interface
- Integration with OCL and PCMT for terminology and product data

### 2. Fork Existing DAK (`manage-dak-fork-workflow.puml`)
- Select source DAK repository 
- Choose destination organization
- Fork repository and proceed to editing
- Maintains connection to original repository for upstream updates

### 3. Create New DAK (`manage-dak-create-workflow.puml`)
- Template selection from configuration-driven list
- Organization selection for repository creation
- DAK parameter configuration (name, title, description, etc.)
- Repository creation from WHO template with customized sushi-config.yaml

## Template Configuration

DAK templates are now managed through a configuration file at [`../../src/config/dak-templates.json`](../../src/config/dak-templates.json), containing:

- **WHO template SMART Guidelines** - Based on `WorldHealthOrganization/smart-ig-empty`
- Extensible structure for additional templates in the future
- Template metadata including name, description, repository URL, and documentation links

## Technical Notes

- All PlantUML diagrams include clickable actor references using `[[../requirements.md#req-actor-xxx ActorName]]` syntax
- SVG diagram has been corrected to show query operations (orgs/repos) originating from SGeX Workbench, not DAK Author
- Template selection uses configuration-driven approach rather than hard-coded repositories
- Diagrams follow WHO SMART Guidelines branding and visual standards

## Viewing Diagrams

- **BPMN**: Use any BPMN 2.0 compatible viewer or the SVG export
- **PlantUML**: Use PlantUML server, VS Code extensions, or online viewers
- **SVG**: Can be viewed directly in web browsers or embedded in documentation

## Business Process Navigation Workflow (NEW)

### Enhanced Business Process Selection Flow

As of the latest implementation, the business process navigation workflow has been enhanced to provide a more user-friendly experience with proper permission handling:

#### 1. **Initial Navigation (No Permission Check)**
- Users can click the "Business Processes" component card on the DAK Dashboard without permission validation
- Navigates directly to `/business-process-selection` page
- Shows all available BPMN files in the `input/business-processes/` directory

#### 2. **File Selection Interface**
- Displays grid of BPMN file cards with file information (name, path, size)
- Each file card provides three action options:
  - **👁️ View**: Read-only BPMN diagram viewer (available to all users)
  - **✏️ Edit**: BPMN diagram editor (requires write permissions)
  - **📄 Source**: XML source code viewer with GitHub integration (available to all users)

#### 3. **Permission-Based Actions**
- **View Mode**: Uses `bpmn-js/NavigatedViewer` for read-only diagram viewing
  - No editing palette or tools displayed
  - Includes "Edit" button for users with write permissions
  - Clear read-only indicators and permission notices
- **Edit Mode**: Uses existing `BPMNEditor` with full editing capabilities (permission required)
- **Source Mode**: Displays formatted XML source code with:
  - Syntax-highlighted code display
  - Copy to clipboard functionality
  - Download file capability
  - Direct GitHub links for viewing/editing on GitHub

#### 4. **Navigation Flow**
```
DAK Dashboard → Business Process Selection → [View|Edit|Source] Mode
     ↓                      ↓                         ↓
No permission check    Permission check only    Action-specific UI
```

#### 5. **Key Features**
- **Deferred Permission Checking**: Permissions validated only when attempting to edit, not during navigation
- **Multi-Modal Access**: View, edit, and source examination options for each BPMN file
- **GitHub Integration**: Direct links to GitHub for file viewing and editing
- **Consistent Breadcrumb Navigation**: Full navigation path maintained across all screens
- **Responsive Design**: Mobile-friendly interface for all business process workflows

This enhancement addresses the requirement to "not check permissions of the DAK Author once they claim the business process button" while providing comprehensive access to BPMN files through multiple interaction modes.

## Integration

These diagrams are referenced in:
- [`../requirements.md`](../requirements.md) - Actor definitions and functional requirements
- [`../solution-architecture.md`](../solution-architecture.md) - System architecture documentation
- React application components implementing the actual workflows
- **NEW**: Business process selection navigation components:
  - `BusinessProcessSelection.js` - File selection interface
  - `BPMNViewer.js` - Read-only BPMN diagram viewer
  - `BPMNSource.js` - XML source code viewer with GitHub integration