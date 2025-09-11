import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import userAccessService from '../services/userAccessService';
import githubService from '../services/githubService';
import logger from '../utils/logger';

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
  // Framework integration props
  repository = null,
  branch = null,
  userContext = null,
  accessLevel = 'read',
  ...props
}) => {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [userType, setUserType] = useState('unauthenticated');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Initialize user context and access checking
  useEffect(() => {
    const initializeUserContext = async () => {
      try {
        const type = userAccessService.getUserType();
        const user = userAccessService.getCurrentUser();
        
        setUserType(type);
        setCurrentUser(user);
        
        if (logger?.getLogger) {
          logger.getLogger('TinyMCEEditor').debug('User context initialized', {
            userType: type,
            hasUser: !!user,
            accessLevel,
            repository: repository?.name
          });
        }
      } catch (error) {
        if (logger?.getLogger) {
          logger.getLogger('TinyMCEEditor').error('Failed to initialize user context', error);
        }
      }
    };
    
    initializeUserContext();
  }, [repository, accessLevel]);
  
  // Check if editing is allowed based on user type and access level
  const isEditingAllowed = () => {
    if (disabled) return false;
    
    switch (userType) {
      case 'authenticated':
        return accessLevel === 'write';
      case 'demo':
        return true; // Demo users can edit locally
      case 'unauthenticated':
        return false; // Unauthenticated users cannot edit
      default:
        return false;
    }
  };
  
  // Get user-specific placeholder text
  const getUserPlaceholder = () => {
    if (!isEditingAllowed()) {
      return 'Editing not available - please authenticate for write access';
    }
    
    if (userType === 'demo') {
      return placeholder + ' (Demo mode - changes will not be saved to GitHub)';
    }
    
    return placeholder;
  };

  // WHO SMART Guidelines TinyMCE Configuration
  const getEditorConfig = () => {
    const isReadOnly = !isEditingAllowed();
    
    const baseConfig = {
      height,
      menubar: mode === 'comment' ? false : (isReadOnly ? false : 'edit view insert format tools table help'),
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount',
        mode === 'template' ? 'template' : '',
        !isReadOnly ? 'autosave' : '', 
        !isReadOnly ? 'save' : ''
      ].filter(Boolean),
      toolbar: isReadOnly ? false : getToolbarConfig(),
      content_style: getContentStyle(),
      placeholder: getUserPlaceholder(),
      branding: false,
      promotion: false,
      resize: !isReadOnly,
      readonly: isReadOnly,
      contextmenu: isReadOnly ? false : 'link image table',
      skin: 'oxide',
      content_css: 'default',
      directionality: 'ltr',
      language: 'en',
      // User access integration
      setup: (editor) => {
        // Add user context to editor
        editor.userContext = {
          userType,
          currentUser,
          repository,
          branch,
          accessLevel,
          isEditingAllowed: isEditingAllowed()
        };
        
        if (onInit) {
          onInit(editor);
        }
        
        // Add GitHub services integration for authenticated users
        if (userType === 'authenticated' && githubService.isAuth()) {
          setupGitHubIntegration(editor);
        }
        
        // Add custom buttons for template variables
        if (mode === 'template' && Object.keys(variables).length > 0 && !isReadOnly) {
          setupTemplateVariableButtons(editor, variables);
        }
        
        // Add WHO-specific commands
        if (!isReadOnly) {
          setupWHOCommands(editor);
        }
        
        // Set up editor ready state
        editor.on('init', () => {
          setIsReady(true);
          setLoadError(null);
          
          // Add user access notification if needed
          if (userType === 'demo') {
            editor.notificationManager.open({
              text: '📝 Demo Mode: Changes will be saved locally but not to GitHub',
              type: 'info',
              timeout: 5000
            });
          } else if (userType === 'unauthenticated') {
            editor.notificationManager.open({
              text: '👀 Read Only: Please authenticate for editing capabilities',
              type: 'warning',
              timeout: 3000
            });
          }
        });
        
        // Handle content changes with user access awareness
        if (!isReadOnly) {
          editor.on('change keyup setcontent', () => {
            if (onChange) {
              onChange(editor.getContent());
            }
          });
        }
        
        // Error handling
        editor.on('LoadError', (e) => {
          setLoadError('Failed to load TinyMCE editor');
          if (logger?.getLogger) {
            logger.getLogger('TinyMCEEditor').error('TinyMCE LoadError:', e);
          }
        });
      },
      // Accessibility features
      a11y_advanced_options: true,
      // Auto-save functionality (only for authenticated users)
      ...(userType === 'authenticated' && !isReadOnly && {
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: `sgex-${repository?.name || 'editor'}-`,
        autosave_restore_when_empty: false,
        autosave_retention: '2m'
      }),
      // Template support
      ...(mode === 'template' && templates.length > 0 && !isReadOnly && {
        templates: templates.map(template => ({
          title: template.title,
          description: template.description || '',
          content: template.content || ''
        }))
      }),
      // Link configuration
      link_context_toolbar: !isReadOnly,
      link_default_target: '_blank',
      link_default_protocol: 'https',
      // Image configuration
      image_advtab: !isReadOnly,
      image_caption: !isReadOnly,
      image_title: !isReadOnly,
      // Table configuration
      table_use_colgroups: !isReadOnly,
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
        {text: 'CQL', value: 'sql'},
        {text: 'FHIR', value: 'json'}
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
      content_style: getContentStyle()
    };

    return baseConfig;
  };

  const getToolbarConfig = () => {
    const isReadOnly = !isEditingAllowed();
    
    if (isReadOnly) {
      return false; // No toolbar for read-only mode
    }
    
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

  // GitHub integration for authenticated users
  const setupGitHubIntegration = (editor) => {
    // Add GitHub-specific commands and buttons
    editor.addCommand('openGitHubRepo', () => {
      if (repository) {
        const url = `https://github.com/${repository.owner.login}/${repository.name}`;
        window.open(url, '_blank');
      }
    });
    
    editor.ui.registry.addButton('github_repo', {
      text: '📁',
      tooltip: 'Open GitHub Repository',
      onAction: () => editor.execCommand('openGitHubRepo')
    });
    
    // Add branch information
    if (branch && branch !== 'main') {
      editor.ui.registry.addButton('github_branch', {
        text: `🌿 ${branch}`,
        tooltip: `Current branch: ${branch}`,
        onAction: () => {
          editor.notificationManager.open({
            text: `Working on branch: ${branch}`,
            type: 'info',
            timeout: 3000
          });
        }
      });
    }
  };

  const getContentStyle = () => {
    const isReadOnly = !isEditingAllowed();
    
    return `
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
        background-color: ${isReadOnly ? '#f8f9fa' : '#fff'};
        margin: 8px;
        ${isReadOnly ? 'cursor: default !important;' : ''}
      }
      
      /* Read-only mode indicator */
      ${isReadOnly ? `
        body::before {
          content: "🔒 Read-only mode";
          position: fixed;
          top: 10px;
          right: 10px;
          background-color: #6c757d;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          z-index: 1000;
        }
      ` : ''}
      
      /* WHO Template Variables */
      .who-template-variable {
        background-color: #e3f2fd;
        padding: 2px 6px;
        border-radius: 4px;
        color: #1976d2;
        border: 1px solid #bbdefb;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        cursor: ${isReadOnly ? 'default' : 'pointer'};
      }
      
      .who-template-variable:hover {
        background-color: ${isReadOnly ? '#e3f2fd' : '#bbdefb'};
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
      
      /* User type specific styling */
      ${userType === 'demo' ? `
        body::after {
          content: "📝 Demo Mode - Changes saved locally";
          position: fixed;
          bottom: 10px;
          right: 10px;
          background-color: #17a2b8;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          z-index: 1000;
        }
      ` : ''}
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
    if (onChange && isEditingAllowed()) {
      onChange(content);
    }
  };

  // User access aware error display
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
            {isEditingAllowed() ? 
              'Falling back to basic text editor...' : 
              'Editor not available in read-only mode'
            }
          </p>
          {isEditingAllowed() && (
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
              placeholder={getUserPlaceholder()}
              disabled={disabled}
            />
          )}
          {!isEditingAllowed() && (
            <div style={{
              width: '100%',
              height: height,
              minHeight: '200px',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
              color: '#6c757d',
              overflow: 'auto',
              textAlign: 'left'
            }} dangerouslySetInnerHTML={{ __html: value || '<p>No content available</p>' }} />
          )}
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
          {userType && (
            <div style={{ fontSize: '0.8em', marginTop: '4px' }}>
              User type: {userType} | Access: {isEditingAllowed() ? 'Write' : 'Read-only'}
            </div>
          )}
        </div>
      )}
      
      {/* User access information bar */}
      {isReady && (userType === 'demo' || userType === 'unauthenticated') && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: userType === 'demo' ? '#e3f2fd' : '#fff3cd',
          border: `1px solid ${userType === 'demo' ? '#bbdefb' : '#ffc107'}`,
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '0.9em',
          color: userType === 'demo' ? '#1976d2' : '#856404'
        }}>
          {userType === 'demo' && (
            <>📝 <strong>Demo Mode:</strong> Changes will be saved locally but not to GitHub</>
          )}
          {userType === 'unauthenticated' && (
            <>👀 <strong>Read Only:</strong> Please authenticate for editing capabilities</>
          )}
        </div>
      )}
      
      <Editor
        ref={editorRef}
        apiKey={apiKey}
        value={value}
        init={getEditorConfig()}
        disabled={disabled || !isEditingAllowed()}
        onEditorChange={handleEditorChange}
        {...props}
      />
      
      {/* Repository context information */}
      {repository && isReady && (
        <div style={{
          marginTop: '8px',
          padding: '6px 8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.8em',
          color: '#6c757d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            📁 {repository.owner.login}/{repository.name}
            {branch && branch !== 'main' && ` • 🌿 ${branch}`}
          </span>
          <span>
            {accessLevel === 'write' ? '✏️ Write' : '👁️ Read'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TinyMCEEditor;