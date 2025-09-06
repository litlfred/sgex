import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

/**
 * Base TinyMCE Editor Component for SGEX Workbench
 * 
 * Features:
 * - WHO SMART Guidelines optimized configuration
 * - Template variable support
 * - Medical content authoring tools
 * - WCAG compliance
 * - Multi-format output support
 */
const TinyMCEEditor = ({
  value = '',
  onChange,
  onInit,
  height = 400,
  disabled = false,
  placeholder = 'Start typing...',
  templates = [],
  variables = {},
  mode = 'standard', // 'standard', 'template', 'comment'
  apiKey = 'no-api-key', // Use TinyMCE's free tier
  className = '',
  style = {},
  ...props
}) => {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // WHO SMART Guidelines TinyMCE Configuration
  const getEditorConfig = () => {
    const baseConfig = {
      height,
      menubar: mode === 'comment' ? false : 'edit view insert format tools table help',
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount',
        mode === 'template' ? 'template' : '',
        'autosave', 'save'
      ].filter(Boolean),
      toolbar: getToolbarConfig(),
      content_style: getContentStyle(),
      placeholder,
      branding: false,
      promotion: false,
      resize: true,
      contextmenu: 'link image table',
      skin: 'oxide',
      content_css: 'default',
      directionality: 'ltr',
      language: 'en',
      // Accessibility features
      a11y_advanced_options: true,
      // Auto-save functionality
      autosave_ask_before_unload: true,
      autosave_interval: '30s',
      autosave_prefix: '{path}{query}-{id}-',
      autosave_restore_when_empty: false,
      autosave_retention: '2m',
      // Template support
      ...(mode === 'template' && templates.length > 0 && {
        templates: templates.map(template => ({
          title: template.title,
          description: template.description || '',
          content: template.content || ''
        }))
      }),
      // Link configuration
      link_context_toolbar: true,
      link_default_target: '_blank',
      link_default_protocol: 'https',
      // Image configuration
      image_advtab: true,
      image_caption: true,
      image_title: true,
      // Table configuration
      table_use_colgroups: true,
      table_responsive_width: true,
      table_default_attributes: {
        border: '1'
      },
      table_default_styles: {
        'border-collapse': 'collapse'
      },
      // Code highlighting
      codesample_languages: [
        {text: 'HTML/XML', value: 'markup'},
        {text: 'JavaScript', value: 'javascript'},
        {text: 'CSS', value: 'css'},
        {text: 'JSON', value: 'json'},
        {text: 'Python', value: 'python'},
        {text: 'CQL', value: 'sql'}
      ],
      // Custom formats for WHO content
      formats: {
        who_highlight: {
          inline: 'span',
          classes: 'who-highlight',
          attributes: {
            'data-who-type': 'highlight'
          }
        },
        who_variable: {
          inline: 'span',
          classes: 'who-template-variable',
          attributes: {
            'data-who-type': 'variable',
            'contenteditable': 'false'
          }
        },
        who_section: {
          block: 'div',
          classes: 'who-section',
          wrapper: true
        }
      },
      // Style formats dropdown
      style_formats: [
        {
          title: 'WHO Styles',
          items: [
            {title: 'Highlight', format: 'who_highlight'},
            {title: 'Template Variable', format: 'who_variable'},
            {title: 'Section Container', format: 'who_section'}
          ]
        },
        {
          title: 'Headings',
          items: [
            {title: 'Heading 2', format: 'h2'},
            {title: 'Heading 3', format: 'h3'},
            {title: 'Heading 4', format: 'h4'}
          ]
        }
      ],
      // Custom CSS for WHO branding
      content_style: getContentStyle(),
      // Setup callback
      setup: (editor) => {
        if (onInit) {
          onInit(editor);
        }
        
        // Add custom buttons for template variables
        if (mode === 'template' && Object.keys(variables).length > 0) {
          setupTemplateVariableButtons(editor, variables);
        }
        
        // Add WHO-specific commands
        setupWHOCommands(editor);
        
        // Set up editor ready state
        editor.on('init', () => {
          setIsReady(true);
          setLoadError(null);
        });
        
        // Handle content changes
        editor.on('change keyup setcontent', () => {
          if (onChange) {
            onChange(editor.getContent());
          }
        });
        
        // Error handling
        editor.on('LoadError', (e) => {
          setLoadError('Failed to load TinyMCE editor');
          console.error('TinyMCE LoadError:', e);
        });
      }
    };

    return baseConfig;
  };

  const getToolbarConfig = () => {
    switch (mode) {
      case 'comment':
        return [
          'bold italic underline | link | bullist numlist | code | help'
        ];
      case 'template':
        return [
          'template | undo redo | bold italic underline | forecolor backcolor',
          'link image media | alignleft aligncenter alignright | bullist numlist | table | code fullscreen | help'
        ];
      default:
        return [
          'undo redo | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
          'bullist numlist outdent indent | link image media | table | code fullscreen | help'
        ];
    }
  };

  const getContentStyle = () => {
    return `
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
        background-color: #fff;
        margin: 8px;
      }
      
      /* WHO Template Variables */
      .who-template-variable {
        background-color: #e3f2fd;
        padding: 2px 6px;
        border-radius: 4px;
        color: #1976d2;
        border: 1px solid #bbdefb;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        cursor: pointer;
      }
      
      .who-template-variable:hover {
        background-color: #bbdefb;
      }
      
      /* WHO Highlight */
      .who-highlight {
        background-color: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
        border-left: 3px solid #ffc107;
      }
      
      /* WHO Section */
      .who-section {
        padding: 12px;
        margin: 8px 0;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background-color: #fafafa;
      }
      
      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 8px 0;
      }
      
      table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      table th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      
      /* Code blocks */
      pre {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      /* Links */
      a {
        color: #0066cc;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
      }
      
      /* Lists */
      ul, ol {
        padding-left: 20px;
      }
      
      li {
        margin-bottom: 4px;
      }
    `;
  };

  const setupTemplateVariableButtons = (editor, variables) => {
    // Add variable insertion buttons to toolbar
    Object.keys(variables).forEach((varKey, index) => {
      const variable = variables[varKey];
      
      editor.ui.registry.addButton(`insert_${varKey}`, {
        text: variable.label || varKey,
        tooltip: `Insert ${variable.description || varKey}`,
        onAction: () => {
          const variableHtml = `<span class="who-template-variable" data-variable="${varKey}" contenteditable="false">\${${varKey}}</span>`;
          editor.insertContent(variableHtml);
        }
      });
    });
    
    // Add variables menu
    if (Object.keys(variables).length > 3) {
      editor.ui.registry.addMenuButton('variables', {
        text: 'Variables',
        tooltip: 'Insert template variables',
        fetch: (callback) => {
          const items = Object.keys(variables).map(varKey => ({
            type: 'menuitem',
            text: variables[varKey].label || varKey,
            onAction: () => {
              const variableHtml = `<span class="who-template-variable" data-variable="${varKey}" contenteditable="false">\${${varKey}}</span>`;
              editor.insertContent(variableHtml);
            }
          }));
          callback(items);
        }
      });
    }
  };

  const setupWHOCommands = (editor) => {
    // Add custom WHO formatting commands
    editor.addCommand('insertWHOSection', () => {
      const content = '<div class="who-section"><p>Section content...</p></div>';
      editor.insertContent(content);
    });
    
    editor.addCommand('insertWHOHighlight', () => {
      const selection = editor.selection.getContent();
      const content = `<span class="who-highlight">${selection || 'Highlighted text'}</span>`;
      editor.insertContent(content);
    });
    
    // Add buttons for these commands
    editor.ui.registry.addButton('who_section', {
      text: 'Section',
      tooltip: 'Insert WHO section container',
      onAction: () => editor.execCommand('insertWHOSection')
    });
    
    editor.ui.registry.addButton('who_highlight', {
      text: 'Highlight',
      tooltip: 'Highlight selected text',
      onAction: () => editor.execCommand('insertWHOHighlight')
    });
  };

  const handleEditorChange = (content, editor) => {
    if (onChange) {
      onChange(content);
    }
  };

  if (loadError) {
    return (
      <div className={`tinymce-error ${className}`} style={style}>
        <div style={{
          padding: '20px',
          border: '2px dashed #dc3545',
          borderRadius: '4px',
          color: '#dc3545',
          textAlign: 'center'
        }}>
          <p><strong>Editor Load Error</strong></p>
          <p>{loadError}</p>
          <p style={{ fontSize: '0.9em', color: '#6c757d' }}>
            Falling back to basic text editor...
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{
              width: '100%',
              height: height,
              minHeight: '200px',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              resize: 'vertical'
            }}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`tinymce-wrapper ${className}`} style={style}>
      {!isReady && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6c757d',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          Loading TinyMCE editor...
        </div>
      )}
      <Editor
        ref={editorRef}
        apiKey={apiKey}
        value={value}
        init={getEditorConfig()}
        disabled={disabled}
        onEditorChange={handleEditorChange}
        {...props}
      />
    </div>
  );
};

export default TinyMCEEditor;