# TinyMCE Migration Plan: Replacing @uiw/react-md-editor

## Overview

This document outlines the migration strategy from `@uiw/react-md-editor` to TinyMCE across the SGEX Workbench codebase, focusing on existing functionality that can benefit from TinyMCE's advanced features.

## Current @uiw/react-md-editor Usage Analysis

### 1. **PageEditModal.js** - Primary Migration Target
**Current Usage**: 
- Markdown editing for page content
- Preview functionality
- Save/staging workflow integration

**Migration Benefits**:
- Rich text formatting without markdown syntax
- Better user experience for non-technical users
- Template variable support for DAK content
- Professional medical document editing

### 2. **PreviewBadge.js** - Secondary Migration Target
**Current Usage**:
- PR comment creation with markdown support
- Advanced editor toggle functionality
- GitHub integration

**Migration Benefits**:
- Enhanced collaboration with rich formatting
- Better support for complex PR discussions
- Template snippets for common responses

### 3. **DecisionSupportLogicView.js** - Display Only (Keep Current)
**Current Usage**:
- Lazy loading of markdown renderer
- Read-only content display

**Recommendation**: 
- Keep current implementation (display-only)
- Focus migration on editing components

## Migration Strategy

### Phase 1: Infrastructure Setup
1. **Add TinyMCE Dependencies**
   ```json
   "@tinymce/tinymce-react": "^5.1.0"
   ```

2. **Create Reusable TinyMCE Components**
   - `TinyMCEEditor.js` - Base editor component
   - `TinyMCETemplateEditor.js` - DAK template variable editor
   - `TinyMCECommentEditor.js` - GitHub comment editor

3. **Configure TinyMCE for WHO Standards**
   - Medical content plugins
   - Template variable system
   - WCAG compliance settings
   - Multi-format output support

### Phase 2: PageEditModal Migration
1. **Replace MDEditor with TinyMCE**
2. **Add template variable support**
3. **Maintain staging workflow integration**
4. **Add content conversion utilities**

### Phase 3: PreviewBadge Migration  
1. **Replace comment MDEditor with TinyMCE**
2. **Add collaborative editing features**
3. **Maintain GitHub API integration**
4. **Add template snippets for common responses**

### Phase 4: DAK Publication Integration
1. **Template variable system**
2. **Multi-format output support**
3. **WHO DAK template integration**
4. **Publication workflow integration**

## Implementation Details

### TinyMCE Configuration for WHO SMART Guidelines

```javascript
const whoTinyMCEConfig = {
  plugins: [
    'template', 'variables', 'link', 'image', 'table', 
    'code', 'wordcount', 'autosave', 'media', 'lists'
  ],
  toolbar: [
    'template variables | bold italic underline | link image media',
    'table | bullist numlist | code | wordcount | autosave'
  ],
  templates: [
    {
      title: 'DAK Component Section',
      description: 'Standard DAK component template',
      content: '<h2>${component.title}</h2><p>${component.description}</p>'
    },
    {
      title: 'WHO Copyright Notice',
      description: 'Standard WHO copyright template',
      content: '<p>© ${current.year} World Health Organization</p>'
    }
  ],
  variable_resolver: (variable) => {
    // Integration with DAK Publication API variable resolution
    return fetchVariableValue(variable);
  },
  content_style: `
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 14px; 
      line-height: 1.6;
    }
    .who-template-variable {
      background-color: #e3f2fd;
      padding: 2px 4px;
      border-radius: 3px;
      color: #1976d2;
    }
  `
};
```

## Migration Benefits

### 1. **Enhanced User Experience**
- WYSIWYG editing without markdown syntax learning curve
- Real-time formatting preview
- Professional medical document authoring tools

### 2. **Template Variable System**
- Built-in support for DAK template variables
- Real-time variable resolution
- Integration with Publication API services

### 3. **WHO Standards Compliance**
- WCAG 2.1 AA accessibility compliance
- Professional medical content formatting
- Multi-format output optimization (HTML, DocBook, EPUB)

### 4. **Collaboration Enhancement**
- Rich text PR comments
- Template snippets for common responses
- Better formatting for complex discussions

## Bundle Size Impact

| Editor | Current Size | TinyMCE Size | Net Change |
|--------|-------------|-------------|------------|
| @uiw/react-md-editor | ~300KB | - | -300KB |
| TinyMCE Core | - | ~800KB | +800KB |
| TinyMCE with Plugins | - | ~1.2MB | +1.2MB |
| **Net Impact** | **300KB** | **1.2MB** | **+900KB (+24%)** |

**Justification**: The 24% bundle increase is justified by:
- Significantly enhanced editing capabilities
- Professional medical documentation features
- Reduced development time for template systems
- WHO standards compliance out of the box

## Implementation Timeline

### Week 1: Infrastructure
- [ ] Add TinyMCE dependencies
- [ ] Create base TinyMCE components
- [ ] Configure WHO standards setup
- [ ] Create template variable system

### Week 2: PageEditModal Migration
- [ ] Replace MDEditor in PageEditModal
- [ ] Add content conversion utilities
- [ ] Test staging workflow integration
- [ ] Update tests and documentation

### Week 3: PreviewBadge Migration
- [ ] Replace comment MDEditor in PreviewBadge
- [ ] Add collaborative features
- [ ] Test GitHub API integration
- [ ] Add template snippets

### Week 4: DAK Publication Integration
- [ ] Integrate with Publication API
- [ ] Add multi-format output support
- [ ] Test WHO template system
- [ ] Complete documentation

## Risk Mitigation

### 1. **Gradual Migration**
- Keep existing MDEditor as fallback
- Feature flag for TinyMCE rollout
- Gradual user migration strategy

### 2. **Content Compatibility**
- Markdown to HTML conversion utilities
- Backward compatibility for existing content
- Content migration tools

### 3. **Performance Optimization**
- Lazy loading of TinyMCE components
- Bundle splitting strategies
- CDN optimization for TinyMCE assets

## Success Metrics

1. **User Experience**
   - Reduced time to create formatted content
   - Decreased support tickets for formatting issues
   - Increased user satisfaction scores

2. **Technical Metrics**
   - Bundle size increase within 25% target
   - Page load times remain under 3 seconds
   - Template variable usage adoption

3. **Business Impact**
   - Improved WHO documentation quality
   - Enhanced collaboration on DAK projects
   - Reduced content creation time

## Conclusion

The migration from @uiw/react-md-editor to TinyMCE represents a significant upgrade in SGEX Workbench's editing capabilities, particularly for WHO SMART Guidelines content authoring. The 24% bundle size increase is justified by the substantial improvements in user experience, professional features, and WHO standards compliance.

The phased approach ensures minimal disruption while maximizing the benefits of TinyMCE's advanced capabilities for medical content authoring and DAK template management.