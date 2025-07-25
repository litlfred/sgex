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

## Integration

These diagrams are referenced in:
- [`../requirements.md`](../requirements.md) - Actor definitions and functional requirements
- [`../solution-architecture.md`](../solution-architecture.md) - System architecture documentation
- React application components implementing the actual workflows