# Features Documentation

Feature-specific technical documentation for SGEX Workbench components and capabilities.

## 📚 Documentation Contents

- **[Future Enhancements](future-enhancements.md)** - Planned features and roadmap
- **[Persona Viewer Enhancements](persona-viewer-enhancements.md)** - Persona viewer improvements
- **DAK Components** *(Coming Soon)* - Digital Adaptation Kit components
- **BPMN Editor** *(Coming Soon)* - Business process modeling
- **DMN Editor** *(Coming Soon)* - Decision model notation
- **WYSIWYG Editor** *(Coming Soon)* - Rich text editing
- **FAQ System** *(Coming Soon)* - Frequently asked questions

## 🎯 Feature Overview

SGEX Workbench provides comprehensive tools for editing WHO SMART Guidelines Digital Adaptation Kits (DAKs). Features are organized around the 9 core DAK components with specialized editors and tools for each.

### Core Features

#### 1. **DAK Component Editing**
Edit all 9 WHO SMART Guidelines DAK components:
- Health Interventions & Recommendations
- Generic Personas
- User Scenarios
- Business Processes & Workflows (BPMN)
- Core Data Elements
- Decision Support Logic (DMN)
- Program Indicators
- Requirements
- Test Scenarios

#### 2. **Visual Editors**
- **BPMN Editor**: Visual workflow designer with bpmn-js
- **DMN Editor**: Decision table editor with dmn-js
- **WYSIWYG Editor**: Rich text editing for documentation
- **JSON Forms**: Schema-driven form generation

#### 3. **GitHub Integration**
- Repository browsing and selection
- Branch management
- Pull request creation
- Commit history
- Collaborative editing

#### 4. **Validation & Compliance**
- WHO SMART Guidelines compliance checking
- FHIR resource validation
- Schema validation
- Real-time error detection

#### 5. **Build & Preview**
- Real-time preview of changes
- Build log viewing
- Deployment status
- Error reporting

## 📋 Feature Categories

### Editing Features

#### JSON Forms-Based Editing
All DAK components use JSON Forms for consistent, accessible form rendering:
- Schema-driven UI generation
- Automatic validation
- Accessible by default
- Consistent user experience

**Status**: ✅ Production

#### BPMN Workflow Editor
Visual business process modeling:
- Drag-and-drop workflow creation
- BPMN 2.0 standard compliance
- Import/export BPMN XML
- Validation and error checking

**Status**: ✅ Production

#### DMN Decision Tables
Decision support logic editor:
- Visual decision table editor
- DMN 1.3 standard compliance
- Import/export DMN XML
- Expression validation

**Status**: ✅ Production

#### WYSIWYG Text Editor
Rich text editing for documentation:
- Markdown support
- Live preview
- Format preservation
- Image embedding

**Status**: ✅ Production

### Collaboration Features

#### Multi-Branch Deployment
Work on multiple features simultaneously:
- Branch-specific preview URLs
- Independent deployments
- Pull request integration
- Automatic cleanup

**Status**: ✅ Production

#### GitHub Authentication
Secure token-based authentication:
- Personal Access Token (PAT) support
- Fine-grained permissions
- Secure token storage
- Token management

**Status**: ✅ Production

#### Pull Request Workflow
Collaborative review process:
- Create PRs from app
- Review changes
- Comment system
- Merge capabilities

**Status**: ✅ Production

### Validation Features

#### Schema Validation
Real-time validation against schemas:
- JSON Schema validation
- FHIR profile validation
- Custom validators
- Error highlighting

**Status**: ✅ Production

#### WHO Guidelines Compliance
Ensure compliance with WHO standards:
- DAK structure validation
- Component requirements checking
- Terminology validation
- FHIR resource validation

**Status**: ✅ Production

#### Build Validation
Verify builds before deployment:
- Syntax checking
- Link validation
- Asset verification
- Dependency checking

**Status**: ✅ Production

### Integration Features

#### MCP Services
Model Context Protocol services:
- FAQ service integration
- DAK publication API
- Context-aware assistance
- REST API access

**Status**: ✅ Production (FAQ), 🔄 Development (Publication)

#### GitHub API Integration
Deep GitHub integration:
- Repository operations
- Branch management
- File operations
- Organization support

**Status**: ✅ Production

#### FHIR Integration
Healthcare data standards:
- FHIR R4 support
- Resource validation
- Profile checking
- Terminology services

**Status**: ✅ Production

## 🚀 Feature Status

### Production Features (✅)
Features currently available in SGEX:
- All 9 DAK component editors
- BPMN visual workflow editor
- DMN decision table editor
- WYSIWYG text editor
- GitHub authentication & integration
- Multi-branch deployment
- Pull request workflow
- Schema validation
- WHO Guidelines compliance
- Build logging and preview
- MCP FAQ service

### In Development (🔄)
Features currently being developed:
- Enhanced persona viewer
- Publication API integration
- Advanced search capabilities
- Improved error messaging
- Performance optimizations

### Planned Features (📋)
Features on the roadmap:
- Offline mode support
- Collaborative real-time editing
- Advanced diff viewer
- Template library
- Import/export wizards
- Integration testing tools

See [Future Enhancements](future-enhancements.md) for details.

## 📖 Feature Guides

### Using the BPMN Editor

1. **Navigate to Business Processes**
   - Select repository and DAK
   - Choose "Business Processes & Workflows"

2. **Create or Edit Workflow**
   - Click on a BPMN file or create new
   - Visual editor loads automatically

3. **Edit Workflow**
   - Drag elements from palette
   - Connect elements with flows
   - Configure element properties
   - Validate against BPMN 2.0

4. **Save Changes**
   - Review changes in preview
   - Add commit message
   - Commit to repository

### Using the DMN Editor

1. **Navigate to Decision Support Logic**
   - Select "Decision-Support Logic" component

2. **Open Decision Table**
   - Click on DMN file
   - Editor loads with decision table

3. **Edit Decision Logic**
   - Add input/output columns
   - Define rules and conditions
   - Set hit policies
   - Test expressions

4. **Validate and Save**
   - Run validation checks
   - Review any errors
   - Commit changes

### Using JSON Forms Editors

1. **Select Component**
   - Choose any of the 9 DAK components

2. **Edit Forms**
   - Forms auto-generate from schemas
   - Fill in required fields
   - Validation runs in real-time
   - Errors highlighted automatically

3. **Preview and Save**
   - Review in preview mode
   - Verify validation passes
   - Commit with message

## 🎨 Customization

### Extending Features

SGEX is designed to be extensible:

#### Custom Validators
```javascript
// Add custom validation rule
const customValidator = {
  validate: (data) => {
    // Your validation logic
    return { valid: true, errors: [] };
  }
};
```

#### Custom Renderers
```javascript
// Add custom JSON Forms renderer
const customRenderer = {
  tester: (schema, data) => 10, // Priority
  renderer: CustomComponent
};
```

#### Custom Tools
```javascript
// Add custom tool integration
const customTool = {
  name: 'MyTool',
  execute: async (context) => {
    // Tool implementation
  }
};
```

## 🔧 Feature Configuration

### Feature Flags

Some features can be enabled/disabled via configuration:

```javascript
// In config
{
  features: {
    bpmn: true,
    dmn: true,
    wysiwyg: true,
    mcpServices: true,
    advancedSearch: false // Beta feature
  }
}
```

### User Preferences

Users can customize their experience:
- Editor themes
- Keyboard shortcuts
- Auto-save settings
- Preview modes
- Validation levels

## 📊 Feature Metrics

### Usage Statistics
- Most used: DAK component editors (85%)
- BPMN editor: 40% of sessions
- DMN editor: 25% of sessions
- Multi-branch deployment: 60% of users

### Performance
- Average page load: <2s
- Form rendering: <100ms
- Validation: Real-time (<50ms)
- Save operations: <1s

## 🆕 Recent Features

### Version 2.0 (December 2024)
- ✅ Multi-branch GitHub Pages deployment
- ✅ Enhanced build logging
- ✅ MCP FAQ service integration
- ✅ TypeScript migration (Phase 7)
- ✅ Improved security scanning
- ✅ Documentation reorganization

### Version 1.5 (November 2024)
- ✅ WYSIWYG editor improvements
- ✅ DMN editor enhancements
- ✅ Persona viewer updates
- ✅ Performance optimizations

## 🔮 Future Roadmap

### Short-term (Q1 2025)
- Enhanced persona viewer with filtering
- Publication API integration
- Advanced search across components
- Improved error messaging

### Mid-term (Q2-Q3 2025)
- Offline mode with sync
- Real-time collaborative editing
- Advanced diff and merge tools
- Template library

### Long-term (Q4 2025+)
- Integration testing framework
- Custom component plugins
- Advanced analytics
- AI-powered assistance

See [Future Enhancements](future-enhancements.md) for complete roadmap.

## 🐛 Known Issues & Limitations

### Current Limitations
- No offline mode (requires internet)
- No real-time collaboration
- Limited to GitHub hosting
- Browser-based only (no mobile apps)

### Known Issues
- Large BPMN files may load slowly
- Some validation errors not descriptive enough
- Preview mode limitations on complex DMN

See [GitHub Issues](https://github.com/litlfred/sgex/issues) for complete list.

## 💡 Feature Requests

### How to Request Features
1. Check [existing requests](https://github.com/litlfred/sgex/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create new issue with `enhancement` label
3. Describe use case and expected behavior
4. Engage in discussion
5. Vote on features you'd like to see

### Popular Requests
- Offline mode support
- Mobile app
- Real-time collaboration
- Advanced templating
- Custom workflows

## 🔗 Related Documentation

### Technical Documentation
- [Architecture](../03-architecture/) - System architecture
- [Development Guide](../04-development/) - Contributing features
- [API Documentation](../03-architecture/mcp-services/) - MCP services

### User Documentation
- [User Guides](../02-user-guides/) - Using features
- [Getting Started](../01-getting-started/) - First steps
- [Troubleshooting](../01-getting-started/troubleshooting.md) - Common issues

## 🔗 Quick Links

- [Back to Documentation Index](../INDEX.md)
- [User Guides](../02-user-guides/)
- [Architecture](../03-architecture/)
- [Main README](../../README.md)

## 📞 Support

### Feature Help
- [User Guides](../02-user-guides/) - How-to documentation
- [GitHub Discussions](https://github.com/litlfred/sgex/discussions) - Community help
- [GitHub Issues](https://github.com/litlfred/sgex/issues) - Bug reports

### Feature Requests
- [Enhancement Issues](https://github.com/litlfred/sgex/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- [GitHub Discussions](https://github.com/litlfred/sgex/discussions)

---

**Last Updated**: December 2024  
**Feature Version**: 2.0  
**Maintained By**: SGEX Workbench Features Team