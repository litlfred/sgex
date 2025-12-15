# WYSIWYG Implementation Guide for DAK Publication System

## Current Architecture Integration

### Existing Components Using WYSIWYG
Based on the current codebase analysis:

```javascript
// Current usage: @uiw/react-md-editor v4.0.8
import MDEditor from '@uiw/react-md-editor';

// Found in components like:
// - PageEditModal.js
// - Other form components
```

### DAK Publication API Integration Points

The WYSIWYG editors need to integrate with these existing API endpoints:

1. **Template Variables**: `/api/variables/resolve`
2. **User Content**: `/api/content/user/:userId`
3. **Publication Generation**: `/api/publication/generate`
4. **FAQ Integration**: `/api/integrations/faq/batch`

## Implementation Examples

### 1. TinyMCE Integration

#### Installation & Setup:
```bash
npm install @tinymce/tinymce-react
```

#### Component Implementation:
```javascript
// src/components/DAK/DAKTinyMCEEditor.jsx
import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const DAKTinyMCEEditor = ({ 
  dakRepository, 
  templateId, 
  userId,
  initialContent = '',
  onContentChange 
}) => {
  const [content, setContent] = useState(initialContent);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplateVariables();
  }, [dakRepository, templateId]);

  const loadTemplateVariables = async () => {
    try {
      const response = await fetch('/api/variables/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dakRepository,
          templateId,
          serviceIntegration: {
            useFAQ: true,
            useMCP: true
          }
        })
      });
      const variables = await response.json();
      setTemplateVariables(variables.resolved);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load template variables:', error);
      setIsLoading(false);
    }
  };

  const generateTemplates = () => {
    return [
      {
        title: 'DAK Component Section',
        description: 'Standard DAK component with variables',
        content: `
          <h2>\${component.title}</h2>
          <p><strong>Description:</strong> \${component.description}</p>
          <p><strong>Version:</strong> \${dak.version}</p>
          <p><strong>Generated:</strong> \${current.date}</p>
        `
      },
      {
        title: 'User Editable Section',
        description: 'Section for custom user content',
        content: `
          <div class="user-content">
            <h3>Custom Section</h3>
            <p>Enter your custom content here...</p>
          </div>
        `
      }
    ];
  };

  const handleEditorChange = async (newContent, editor) => {
    setContent(newContent);
    
    // Auto-save to API
    try {
      await fetch(`/api/content/user/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          content: {
            'user.custom_content': newContent
          }
        })
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }

    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  if (isLoading) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="dak-tinymce-editor">
      <div className="editor-toolbar">
        <span>📝 WYSIWYG Mode</span>
        <button onClick={() => window.open('/api/publication/generate', '_blank')}>
          👁️ Preview
        </button>
      </div>
      
      <Editor
        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
        init={{
          height: 600,
          menubar: 'edit view insert format tools table help',
          plugins: [
            'template', 'link', 'image', 'code', 'table', 'lists',
            'textcolor', 'colorpicker', 'wordcount', 'searchreplace',
            'visualblocks', 'help'
          ],
          toolbar: `
            template | undo redo | formatselect |
            bold italic underline strikethrough | 
            forecolor backcolor | 
            link image table | 
            bullist numlist outdent indent |
            alignleft aligncenter alignright alignjustify |
            code visualblocks | help
          `,
          templates: generateTemplates(),
          content_style: `
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 { color: #0078d4; }
            .template-variable {
              background-color: #e6f3ff;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #0078d4;
              font-family: monospace;
              font-size: 0.9em;
            }
            .user-content {
              border-left: 4px solid #0078d4;
              padding-left: 16px;
              margin: 16px 0;
            }
          `,
          setup: (editor) => {
            // Custom button for DAK variables
            editor.ui.registry.addButton('dakvariable', {
              text: 'Insert Variable',
              onAction: () => {
                editor.windowManager.open({
                  title: 'Insert DAK Variable',
                  body: {
                    type: 'panel',
                    items: [
                      {
                        type: 'selectbox',
                        name: 'variable',
                        label: 'Select Variable',
                        items: templateVariables.map(v => ({
                          text: v.description || v.key,
                          value: v.key
                        }))
                      }
                    ]
                  },
                  buttons: [
                    {
                      type: 'cancel',
                      text: 'Cancel'
                    },
                    {
                      type: 'submit',
                      text: 'Insert',
                      primary: true
                    }
                  ],
                  onSubmit: (api) => {
                    const data = api.getData();
                    editor.insertContent(`<span class="template-variable">\${${data.variable}}</span>`);
                    api.close();
                  }
                });
              }
            });
          }
        }}
        value={content}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default DAKTinyMCEEditor;
```

#### Bundle Size Impact:
```javascript
// Before: ~5MB total
// After: ~6.2MB total (+24% increase)
// Load time: +200-300ms
```

### 2. React Quill Integration

#### Installation & Setup:
```bash
npm install react-quill quill
```

#### Component Implementation:
```javascript
// src/components/DAK/DAKQuillEditor.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const DAKQuillEditor = ({ 
  dakRepository, 
  templateId, 
  userId,
  initialContent = '',
  onContentChange 
}) => {
  const [content, setContent] = useState(initialContent);
  const [templateVariables, setTemplateVariables] = useState([]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'code-block'],
        ['clean'],
        ['dakvariable'] // Custom button
      ],
      handlers: {
        'dakvariable': function() {
          insertDAKVariable(this.quill);
        }
      }
    }
  }), [templateVariables]);

  const insertDAKVariable = (quill) => {
    const variable = prompt('Enter variable name (e.g., dak.title):');
    if (variable) {
      const range = quill.getSelection();
      quill.insertText(range.index, `\${${variable}}`, 'user');
      quill.formatText(range.index, variable.length + 3, {
        'background': '#e6f3ff',
        'color': '#0078d4'
      });
    }
  };

  const handleChange = async (newContent) => {
    setContent(newContent);
    
    // Auto-save to API
    try {
      await fetch(`/api/content/user/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          content: {
            'user.custom_content': newContent
          }
        })
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }

    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  return (
    <div className="dak-quill-editor">
      <div className="editor-toolbar">
        <span>📝 WYSIWYG Mode</span>
        <select onChange={(e) => insertDAKVariable({ 
          getSelection: () => ({ index: 0 }),
          insertText: (index, text) => setContent(prev => text + prev)
        })}>
          <option value="">Insert Variable...</option>
          {templateVariables.map(v => (
            <option key={v.key} value={v.key}>{v.description}</option>
          ))}
        </select>
      </div>
      
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        placeholder="Enter your DAK content here..."
        style={{
          height: '400px',
          marginBottom: '50px'
        }}
      />
    </div>
  );
};

export default DAKQuillEditor;
```

#### Bundle Size Impact:
```javascript
// Before: ~5MB total
// After: ~5.5MB total (+10% increase)
// Load time: +100-150ms
```

### 3. Slate.js Integration (Custom Implementation)

#### Installation & Setup:
```bash
npm install slate slate-react slate-history
```

#### Component Implementation:
```javascript
// src/components/DAK/DAKSlateEditor.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { createEditor, Transforms, Element as SlateElement } from 'slate';
import { withHistory } from 'slate-history';

const DAKSlateEditor = ({ 
  dakRepository, 
  templateId, 
  userId,
  initialContent = '',
  onContentChange 
}) => {
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: initialContent }],
    },
  ]);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'template-variable':
        return <TemplateVariableElement {...props} />;
      case 'heading':
        return <h2 {...props.attributes}>{props.children}</h2>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue);
    
    // Convert to HTML for API storage
    const htmlContent = serializeToHTML(newValue);
    
    if (onContentChange) {
      onContentChange(htmlContent);
    }
  };

  return (
    <div className="dak-slate-editor">
      <Toolbar />
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          placeholder="Enter DAK content..."
          style={{
            minHeight: '400px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </Slate>
    </div>
  );
};

const TemplateVariableElement = ({ attributes, children, element }) => {
  return (
    <span
      {...attributes}
      style={{
        backgroundColor: '#e6f3ff',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #0078d4',
        fontFamily: 'monospace',
        fontSize: '0.9em'
      }}
    >
      ${element.variable}
      {children}
    </span>
  );
};

const Toolbar = () => {
  const editor = useSlate();

  const insertVariable = () => {
    const variable = prompt('Enter variable name:');
    if (variable) {
      Transforms.insertNodes(editor, {
        type: 'template-variable',
        variable: variable,
        children: [{ text: '' }],
      });
    }
  };

  return (
    <div style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
      <button onClick={insertVariable}>Insert Variable</button>
      <button onClick={() => {
        Transforms.setNodes(editor, { type: 'heading' });
      }}>Heading</button>
    </div>
  );
};

const serializeToHTML = (nodes) => {
  return nodes.map(node => {
    if (SlateElement.isElement(node)) {
      switch (node.type) {
        case 'template-variable':
          return `<span class="template-variable">\${${node.variable}}</span>`;
        case 'heading':
          return `<h2>${node.children.map(child => child.text).join('')}</h2>`;
        default:
          return `<p>${node.children.map(child => child.text).join('')}</p>`;
      }
    }
    return node.text;
  }).join('');
};

export default DAKSlateEditor;
```

## Integration with Current DAK Publication System

### Replacing Current @uiw/react-md-editor

#### Current Usage Pattern:
```javascript
// Before (using MDEditor)
import MDEditor from '@uiw/react-md-editor';

<MDEditor
  value={content}
  onChange={setContent}
  preview="edit"
/>
```

#### Migration Strategy:
```javascript
// After (with TinyMCE)
import DAKTinyMCEEditor from './components/DAK/DAKTinyMCEEditor';

<DAKTinyMCEEditor
  dakRepository={repository}
  templateId="who-dak-standard-v1"
  userId={user.login}
  initialContent={content}
  onContentChange={setContent}
/>
```

### API Integration Points

#### Variable Resolution:
```javascript
// Fetch available template variables
const getTemplateVariables = async (dakRepository, templateId) => {
  const response = await fetch('/api/variables/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dakRepository,
      templateId,
      serviceIntegration: {
        useFAQ: true,
        useMCP: true
      }
    })
  });
  return response.json();
};
```

#### Content Persistence:
```javascript
// Save user content
const saveUserContent = async (userId, templateId, content) => {
  await fetch(`/api/content/user/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId,
      content: {
        'user.custom_content': content
      }
    })
  });
};
```

#### Publication Generation:
```javascript
// Generate publication with WYSIWYG content
const generatePublication = async (dakRepository, templateId, format = 'html') => {
  const response = await fetch('/api/publication/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId,
      dakRepository,
      options: { format }
    })
  });
  return response.blob();
};
```

## Performance Considerations

### Bundle Size Comparison:
```javascript
// Current App (with @uiw/react-md-editor)
Base: ~5MB

// With WYSIWYG Additions:
+ TinyMCE: +1.2MB (+24%)
+ React Quill: +500KB (+10%)
+ Slate.js: +600KB (+12%)
```

### Lazy Loading Strategy:
```javascript
// Lazy load WYSIWYG components
const DAKTinyMCEEditor = React.lazy(() => 
  import('./components/DAK/DAKTinyMCEEditor')
);

// Use with Suspense
<Suspense fallback={<div>Loading editor...</div>}>
  <DAKTinyMCEEditor {...props} />
</Suspense>
```

## Recommendation Summary

**Primary Choice: TinyMCE** for WHO SMART Guidelines DAK publication system because:

1. **Professional Features**: Best suited for medical/clinical documentation
2. **Template Support**: Built-in variable templating system
3. **Output Quality**: Clean HTML suitable for multi-format conversion
4. **Accessibility**: WCAG compliant out of the box
5. **Industry Standard**: Used by healthcare organizations globally

The 24% bundle increase is justified by the professional-grade capabilities and reduced development time compared to custom implementations.