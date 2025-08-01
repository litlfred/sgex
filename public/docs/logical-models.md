# Core Data Dictionary Logical Model Management

## Overview

The Core Data Dictionary component has been enhanced with Logical Model management capabilities and ArchiMate extraction functionality.

## New Features

### Toggleable Sections

The Core Data Dictionary page now has two main sections:

1. **Core Data Dictionary** - Preserves existing functionality for viewing FHIR CodeSystems, ValueSets, and ConceptMaps
2. **Logical Models** - New section for managing FHIR Logical Models stored in `input/fsh/models/`

### Logical Models Management

#### Global Tools
- **Extract All to ArchiMate** - Processes all logical models and generates ArchiMate DataObjects with relationships
- Batch processing with progress indicators
- Automatic XML download generation

#### Individual Logical Model Tools
- **View** - Display FSH content with syntax highlighting
- **Edit** - Interactive editor with validation and syntax highlighting  
- **Extract to ArchiMate** - Convert single logical model to ArchiMate DataObject

### Reusable Components

#### FSHFileViewer
- General purpose FHIR Shorthand file viewer
- Syntax highlighting for FSH keywords, data types, cardinality
- Configurable display options
- Responsive design

#### FSHFileEditor  
- Interactive FSH file editor with live syntax highlighting
- Basic validation (keywords, cardinality, string formatting)
- Change detection and save functionality
- Error/warning display with line numbers

### ArchiMate Extraction

#### Features
- Parses FHIR Logical Models from FSH content
- Generates ArchiMate DataObjects with hierarchical field descriptions
- Detects relationships between logical models:
  - **Composition** - for contained data elements
  - **Aggregation** - for reference data elements
- Produces ArchiMate XSD-compliant XML output

#### Output Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.archimatetool.com/archimate">
  <elements>
    <element xsi:type="DataObject" id="do-patient-lm" name="Patient Logical Model">
      <documentation>id: patient-lm
Fields:
- name [0..1] (string)
- address [0..*] (Address)
- managingOrganization [1..1] (Reference)</documentation>
    </element>
  </elements>
  <relationships>
    <relationship xsi:type="aggregation" source="do-patient-lm" target="do-address-lm"/>
  </relationships>
</model>
```

## Technical Implementation

### File Structure
- `src/components/framework/FSHFileViewer.js` - Reusable FSH viewer component
- `src/components/framework/FSHFileEditor.js` - Reusable FSH editor component  
- `src/utils/archiMateExtraction.js` - ArchiMate extraction utilities
- Updated `src/components/CoreDataDictionaryViewer.js` - Main component with toggleable sections

### Data Sources
- **Core Data Dictionary**: FSH files in `input/fsh/` directory
- **Logical Models**: FSH files in `input/fsh/models/` directory

### Standards Compliance
- ArchiMate XSD schema compliance
- FHIR R4 StructureDefinition compatibility
- FSH syntax highlighting and validation

## Usage

### Navigation
1. Access Core Data Dictionary from DAK Components dashboard
2. Use toggle buttons to switch between sections:
   - 📊 Core Data Dictionary 
   - 🏗️ Logical Models

### ArchiMate Extraction Workflow
1. Navigate to Logical Models section
2. Use "Extract All to ArchiMate" for batch processing
3. Or use individual "Extract to ArchiMate" buttons for single models
4. XML files are automatically downloaded

### Viewing and Editing
1. Click "View" to open FSH file with syntax highlighting
2. Click "Edit" to open interactive editor with validation
3. Toggle between view/edit modes in modal dialog
4. Access GitHub source via direct links

## Future Enhancements

- Integration with SUSHI FSH validation
- GitHub commit functionality for edited files
- Enhanced relationship detection algorithms
- Support for additional ArchiMate element types
- Batch editing capabilities

---

*This feature implements the requirements specified in issue #429 for Core Data Dictionary Logical Model management and ArchiMate extraction.*