import React, { useState, useCallback, useMemo } from 'react';
import TinyMCEEditor from './TinyMCEEditor';

/**
 * TinyMCE Template Editor for WHO DAK Publications
 * 
 * Features:
 * - Template variable management
 * - Real-time variable resolution
 * - DAK component integration
 * - WHO branding and styling
 */
const TinyMCETemplateEditor = ({
  value = '',
  onChange,
  templateData = {},
  variableResolver = null,
  mode = 'edit', // 'edit', 'preview'
  height = 500,
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const [resolvedVariables, setResolvedVariables] = useState({});
  const [isResolvingVariables, setIsResolvingVariables] = useState(false);

  // Default WHO DAK template variables
  const defaultVariables = useMemo(() => ({
    'dak.name': {
      label: 'DAK Name',
      description: 'Name of the Digital Adaptation Kit',
      defaultValue: 'WHO SMART Guidelines DAK'
    },
    'dak.version': {
      label: 'DAK Version',
      description: 'Version of the DAK',
      defaultValue: '1.0.0'
    },
    'current.year': {
      label: 'Current Year',
      description: 'Current year for copyright notices',
      defaultValue: new Date().getFullYear().toString()
    },
    'current.date': {
      label: 'Current Date',
      description: 'Current date in ISO format',
      defaultValue: new Date().toISOString().split('T')[0]
    },
    'publication.title': {
      label: 'Publication Title',
      description: 'Title of the publication document',
      defaultValue: '${dak.name} - Implementation Guide'
    },
    'publication.author': {
      label: 'Publication Author',
      description: 'Author or organization',
      defaultValue: 'World Health Organization'
    },
    'user.preface': {
      label: 'User Preface',
      description: 'User-editable preface content',
      defaultValue: '',
      editable: true
    },
    'user.copyright': {
      label: 'Copyright Notice',
      description: 'User-editable copyright notice',
      defaultValue: '© ${current.year} World Health Organization',
      editable: true
    },
    'component.title': {
      label: 'Component Title',
      description: 'Title of the current DAK component',
      defaultValue: 'DAK Component'
    },
    'component.description': {
      label: 'Component Description',
      description: 'Description of the current DAK component',
      defaultValue: 'Component description'
    },
    'repository.name': {
      label: 'Repository Name',
      description: 'Name of the GitHub repository',
      defaultValue: 'dak-repository'
    },
    'repository.owner': {
      label: 'Repository Owner',
      description: 'Owner of the GitHub repository',
      defaultValue: 'organization'
    },
    'repository.branch': {
      label: 'Repository Branch',
      description: 'Current branch of the repository',
      defaultValue: 'main'
    }
  }), []);

  // Merge default variables with template data
  const allVariables = useMemo(() => ({
    ...defaultVariables,
    ...templateData.variables
  }), [defaultVariables, templateData.variables]);

  // Default WHO templates
  const defaultTemplates = useMemo(() => [
    {
      title: 'WHO DAK Title Page',
      description: 'Standard WHO DAK publication title page',
      content: `
        <div class="who-section">
          <h1>\${publication.title}</h1>
          <h2>WHO SMART Guidelines Implementation Guide</h2>
          <p><strong>Version:</strong> \${dak.version}</p>
          <p><strong>Publication Date:</strong> \${current.date}</p>
          <p><strong>Author:</strong> \${publication.author}</p>
        </div>
      `
    },
    {
      title: 'Copyright Notice',
      description: 'Standard WHO copyright notice',
      content: `
        <div class="who-section">
          <h3>Copyright Notice</h3>
          <p>\${user.copyright}</p>
          <p>This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 IGO License.</p>
        </div>
      `
    },
    {
      title: 'Preface Section',
      description: 'User-editable preface section',
      content: `
        <div class="who-section">
          <h3>Preface</h3>
          <div class="who-template-variable" data-variable="user.preface">\${user.preface}</div>
        </div>
      `
    },
    {
      title: 'DAK Component Overview',
      description: 'Standard DAK component section',
      content: `
        <div class="who-section">
          <h3>\${component.title}</h3>
          <p>\${component.description}</p>
          <p><strong>Repository:</strong> <a href="https://github.com/\${repository.owner}/\${repository.name}">\${repository.owner}/\${repository.name}</a></p>
          <p><strong>Branch:</strong> \${repository.branch}</p>
        </div>
      `
    },
    {
      title: 'Table of Components',
      description: 'Table listing DAK components',
      content: `
        <div class="who-section">
          <h3>DAK Components</h3>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Business Processes</td>
                <td>BPMN workflows and process definitions</td>
                <td>Complete</td>
              </tr>
              <tr>
                <td>Decision Support Logic</td>
                <td>DMN decision tables and clinical logic</td>
                <td>Complete</td>
              </tr>
              <tr>
                <td>Data Dictionary</td>
                <td>Core data elements and structures</td>
                <td>Complete</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    }
  ], []);

  // Merge default templates with template data
  const allTemplates = useMemo(() => [
    ...defaultTemplates,
    ...(templateData.templates || [])
  ], [defaultTemplates, templateData.templates]);

  // Resolve variables in content
  const resolveVariables = useCallback(async () => {
    if (!variableResolver) {
      // Use default values if no resolver provided
      const resolved = {};
      Object.keys(allVariables).forEach(key => {
        resolved[key] = allVariables[key].defaultValue || '';
      });
      setResolvedVariables(resolved);
      return;
    }

    setIsResolvingVariables(true);
    try {
      const resolved = await variableResolver(allVariables);
      setResolvedVariables(resolved);
    } catch (error) {
      console.error('Failed to resolve variables:', error);
      // Fallback to default values
      const defaultResolved = {};
      Object.keys(allVariables).forEach(key => {
        defaultResolved[key] = allVariables[key].defaultValue || '';
      });
      setResolvedVariables(defaultResolved);
    } finally {
      setIsResolvingVariables(false);
    }
  }, [allVariables, variableResolver]);

  // Resolve variables when component mounts or dependencies change
  React.useEffect(() => {
    resolveVariables();
  }, [resolveVariables]);

  // Handle editor initialization
  const handleEditorInit = useCallback((editor) => {
    // Add custom variable resolution command
    editor.addCommand('resolveVariables', () => {
      resolveVariables();
    });

    // Add variable resolution button
    editor.ui.registry.addButton('resolve_variables', {
      text: 'Resolve',
      tooltip: 'Resolve template variables',
      onAction: () => editor.execCommand('resolveVariables')
    });

    // Add preview mode toggle
    editor.ui.registry.addButton('preview_mode', {
      text: 'Preview',
      tooltip: 'Toggle preview mode',
      onAction: () => {
        const currentContent = editor.getContent();
        const previewContent = replaceVariablesInContent(currentContent);
        
        // Create preview window
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Template Preview</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  font-size: 14px; 
                  line-height: 1.6;
                  margin: 20px;
                  background-color: #fff;
                }
                .who-section {
                  padding: 12px;
                  margin: 8px 0;
                  border: 1px solid #e0e0e0;
                  border-radius: 4px;
                  background-color: #fafafa;
                }
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
              </style>
            </head>
            <body>
              <h1>Template Preview</h1>
              <hr>
              ${previewContent}
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    });

    // Custom toolbar setup for template mode
    if (props.onInit) {
      props.onInit(editor);
    }
  }, [resolvedVariables, props]);

  // Replace variables in content for preview
  const replaceVariablesInContent = useCallback((content) => {
    let processedContent = content;
    
    Object.keys(resolvedVariables).forEach(varKey => {
      const value = resolvedVariables[varKey];
      const variablePattern = new RegExp(`\\$\\{${varKey}\\}`, 'g');
      processedContent = processedContent.replace(variablePattern, value);
    });

    return processedContent;
  }, [resolvedVariables]);

  // Enhanced toolbar for template editing
  const templateToolbar = [
    'template resolve_variables preview_mode | undo redo | bold italic underline',
    'link image | alignleft aligncenter alignright | bullist numlist | table | code fullscreen | help'
  ];

  return (
    <div className={`tinymce-template-editor ${className}`} style={style}>
      {isResolvingVariables && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          marginBottom: '8px',
          color: '#1976d2',
          fontSize: '0.9em'
        }}>
          🔄 Resolving template variables...
        </div>
      )}
      
      <TinyMCEEditor
        value={value}
        onChange={onChange}
        onInit={handleEditorInit}
        height={height}
        disabled={disabled}
        mode="template"
        templates={allTemplates}
        variables={allVariables}
        toolbar={templateToolbar}
        placeholder="Start creating your WHO DAK publication content..."
        {...props}
      />
      
      {Object.keys(resolvedVariables).length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '0.9em', 
            color: '#495057' 
          }}>
            Template Variables ({Object.keys(resolvedVariables).length})
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '8px',
            fontSize: '0.8em'
          }}>
            {Object.keys(resolvedVariables).slice(0, 6).map(varKey => (
              <div key={varKey} style={{
                padding: '4px 8px',
                backgroundColor: '#fff',
                borderRadius: '3px',
                border: '1px solid #dee2e6'
              }}>
                <strong>${varKey}:</strong> {resolvedVariables[varKey] || 'Empty'}
              </div>
            ))}
            {Object.keys(resolvedVariables).length > 6 && (
              <div style={{
                padding: '4px 8px',
                color: '#6c757d',
                fontStyle: 'italic'
              }}>
                +{Object.keys(resolvedVariables).length - 6} more variables
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TinyMCETemplateEditor;