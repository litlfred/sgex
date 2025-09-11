import React, { useState, useCallback, useMemo, useEffect } from 'react';
import TinyMCEEditor from './TinyMCEEditor';
import userAccessService from '../services/userAccessService';
import githubService from '../services/githubService';
import logger from '../utils/logger';

/**
 * TinyMCE Comment Editor for GitHub Integration
 * 
 * Features:
 * - Optimized for GitHub PR/issue comments
 * - Template snippets for common responses
 * - GitHub markdown compatibility
 * - Compact interface for inline usage
 */
const TinyMCECommentEditor = ({
  value = '',
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  placeholder = 'Write a comment...',
  height = 200,
  showAdvanced = false,
  githubUser = null,
  contextType = 'comment', // 'comment', 'review', 'issue'
  className = '',
  style = {},
  // Framework integration props
  repository = null,
  branch = null,
  ...props
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(showAdvanced);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState('unauthenticated');
  const [currentUser, setCurrentUser] = useState(null);
  const [accessLevel, setAccessLevel] = useState('read');
  
  // Initialize framework integration
  useEffect(() => {
    const initializeFramework = async () => {
      try {
        const type = userAccessService.getUserType();
        const user = userAccessService.getCurrentUser();
        
        setUserType(type);
        setCurrentUser(user);
        
        // Comments typically require authentication for GitHub integration
        setAccessLevel(githubService.isAuth() ? 'write' : 'read');
        
        if (logger?.getLogger) {
          logger.getLogger('TinyMCECommentEditor').debug('Framework initialized', {
            userType: type,
            hasUser: !!user,
            canComment: githubService.isAuth(),
            repository: repository?.name
          });
        }
      } catch (error) {
        if (logger?.getLogger) {
          logger.getLogger('TinyMCECommentEditor').error('Framework initialization failed', error);
        }
      }
    };
    
    initializeFramework();
  }, [repository]);

  // Comment templates for GitHub interactions
  const commentTemplates = useMemo(() => [
    {
      title: 'Approval Comment',
      description: 'Standard approval message',
      content: `
        <p>✅ <strong>Approved</strong></p>
        <p>This PR looks good to me. The implementation addresses the requirements and follows the established patterns.</p>
        <p>Ready to merge! 🚀</p>
      `
    },
    {
      title: 'Request Changes',
      description: 'Standard change request format',
      content: `
        <p>🔄 <strong>Changes Requested</strong></p>
        <p>I've reviewed the changes and have some feedback:</p>
        <ul>
          <li>Please address [specific issue]</li>
          <li>Consider [suggestion]</li>
        </ul>
        <p>Thanks for the contribution!</p>
      `
    },
    {
      title: 'Question/Clarification',
      description: 'Ask for clarification',
      content: `
        <p>❓ <strong>Question</strong></p>
        <p>Could you help me understand [specific aspect]?</p>
        <p>I'm particularly interested in how this handles [specific case].</p>
      `
    },
    {
      title: 'Bug Report Response',
      description: 'Response to bug reports',
      content: `
        <p>🐛 <strong>Bug Confirmed</strong></p>
        <p>Thanks for reporting this issue! I can reproduce the problem and will investigate.</p>
        <p><strong>Steps to reproduce:</strong></p>
        <ol>
          <li>Step 1</li>
          <li>Step 2</li>
          <li>Step 3</li>
        </ol>
        <p><strong>Expected behavior:</strong> [description]</p>
        <p><strong>Actual behavior:</strong> [description]</p>
      `
    },
    {
      title: 'Feature Request Response',
      description: 'Response to feature requests',
      content: `
        <p>💡 <strong>Feature Request Acknowledged</strong></p>
        <p>This is an interesting suggestion! I can see how this would be useful.</p>
        <p><strong>Implementation considerations:</strong></p>
        <ul>
          <li>Impact on existing functionality</li>
          <li>Technical complexity</li>
          <li>User experience implications</li>
        </ul>
        <p>Let's discuss the approach in more detail.</p>
      `
    },
    {
      title: 'Testing Update',
      description: 'Update on testing progress',
      content: `
        <p>🧪 <strong>Testing Update</strong></p>
        <p>I've tested this change against:</p>
        <ul>
          <li>✅ Unit tests passing</li>
          <li>✅ Integration tests passing</li>
          <li>✅ Manual testing completed</li>
        </ul>
        <p>All tests are green! Ready for review.</p>
      `
    },
    {
      title: 'Documentation Note',
      description: 'Documentation update notice',
      content: `
        <p>📚 <strong>Documentation Updated</strong></p>
        <p>I've updated the documentation to reflect these changes:</p>
        <ul>
          <li>README.md - Updated usage examples</li>
          <li>API docs - Added new endpoints</li>
          <li>Migration guide - Added breaking change notes</li>
        </ul>
      `
    },
    {
      title: 'Copilot Interaction',
      description: 'Template for Copilot interactions',
      content: `
        <p>🤖 <strong>@copilot</strong></p>
        <p>[Your request or question for GitHub Copilot]</p>
        <p>Please help with [specific task or analysis].</p>
      `
    }
  ], []);

  // GitHub-specific formatting options
  const githubFormats = useMemo(() => ({
    mention: {
      inline: 'span',
      classes: 'github-mention',
      attributes: {
        'data-github-type': 'mention'
      }
    },
    issue_reference: {
      inline: 'span',
      classes: 'github-issue-ref',
      attributes: {
        'data-github-type': 'issue'
      }
    },
    code_inline: {
      inline: 'code',
      classes: 'github-code-inline'
    },
    code_block: {
      block: 'pre',
      classes: 'github-code-block'
    }
  }), []);

  const handleEditorInit = useCallback((editor) => {
    // Add GitHub-specific commands
    editor.addCommand('insertMention', () => {
      const username = prompt('Enter GitHub username:');
      if (username) {
        editor.insertContent(`<span class="github-mention">@${username}</span>`);
      }
    });

    editor.addCommand('insertIssueRef', () => {
      const issueNumber = prompt('Enter issue/PR number:');
      if (issueNumber) {
        editor.insertContent(`<span class="github-issue-ref">#${issueNumber}</span>`);
      }
    });

    // Add GitHub formatting buttons
    editor.ui.registry.addButton('github_mention', {
      text: '@',
      tooltip: 'Mention user (@username)',
      onAction: () => editor.execCommand('insertMention')
    });

    editor.ui.registry.addButton('github_issue', {
      text: '#',
      tooltip: 'Reference issue (#123)',
      onAction: () => editor.execCommand('insertIssueRef')
    });

    // Add quick response menu
    editor.ui.registry.addMenuButton('quick_responses', {
      text: 'Templates',
      tooltip: 'Insert comment template',
      fetch: (callback) => {
        const items = commentTemplates.map(template => ({
          type: 'menuitem',
          text: template.title,
          onAction: () => {
            editor.insertContent(template.content);
          }
        }));
        callback(items);
      }
    });

    if (props.onInit) {
      props.onInit(editor);
    }
  }, [commentTemplates, props]);

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || isSubmitting) return;
    
    // Check if user can actually submit comments
    if (!githubService.isAuth()) {
      if (logger?.getLogger) {
        logger.getLogger('TinyMCECommentEditor').warn('Comment submission attempted without authentication');
      }
      alert('Authentication required to submit comments');
      return;
    }
    
    if (userType === 'demo') {
      if (logger?.getLogger) {
        logger.getLogger('TinyMCECommentEditor').info('Demo user attempted comment submission');
      }
      alert('Demo mode: Comments cannot be submitted to GitHub');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(value);
      }
    } catch (error) {
      if (logger?.getLogger) {
        logger.getLogger('TinyMCECommentEditor').error('Failed to submit comment:', error);
      }
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [value, onSubmit, isSubmitting, userType]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const getToolbarConfig = () => {
    if (!isAdvancedMode) {
      return 'bold italic | link | github_mention github_issue | bullist numlist';
    }
    
    return [
      'quick_responses | bold italic underline | link | github_mention github_issue',
      'bullist numlist | code | help'
    ];
  };

  const getContentStyle = () => {
    return `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        font-size: 14px; 
        line-height: 1.5;
        color: #1f2328;
        background-color: #ffffff;
        margin: 8px;
      }
      
      /* GitHub-style mentions */
      .github-mention {
        color: #0969da;
        font-weight: 600;
        text-decoration: none;
        background-color: transparent;
      }
      
      .github-mention:hover {
        text-decoration: underline;
      }
      
      /* GitHub-style issue references */
      .github-issue-ref {
        color: #0969da;
        text-decoration: none;
        font-weight: 600;
      }
      
      .github-issue-ref:hover {
        text-decoration: underline;
      }
      
      /* Code styling */
      code {
        background-color: #f6f8fa;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
        padding: 2px 4px;
      }
      
      pre {
        background-color: #f6f8fa;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
        padding: 16px;
        overflow: auto;
        line-height: 1.45;
      }
      
      /* Lists */
      ul, ol {
        padding-left: 2em;
        margin: 0 0 16px 0;
      }
      
      li {
        margin-bottom: 4px;
      }
      
      /* Links */
      a {
        color: #0969da;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      /* Paragraphs */
      p {
        margin: 0 0 16px 0;
      }
      
      p:last-child {
        margin-bottom: 0;
      }
      
      /* Emphasis */
      strong {
        font-weight: 600;
      }
      
      em {
        font-style: italic;
      }
    `;
  };

  return (
    <div className={`tinymce-comment-editor ${className}`} style={style}>
      <div style={{ 
        border: '1px solid #d1d9e0',
        borderRadius: '6px',
        backgroundColor: '#ffffff'
      }}>
        <TinyMCEEditor
          value={value}
          onChange={onChange}
          onInit={handleEditorInit}
          height={height}
          disabled={disabled || isSubmitting}
          mode="comment"
          templates={commentTemplates}
          toolbar={getToolbarConfig()}
          placeholder={placeholder}
          content_style={getContentStyle()}
          menubar={false}
          statusbar={false}
          branding={false}
          resize={false}
          // Framework integration
          repository={repository}
          branch={branch}
          userContext={currentUser}
          accessLevel={accessLevel}
          {...props}
        />
        
        {/* Action buttons */}
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid #d1d9e0',
          backgroundColor: '#f6f8fa',
          borderBottomLeftRadius: '6px',
          borderBottomRightRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              style={{
                background: 'none',
                border: 'none',
                color: '#656d76',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
              disabled={isSubmitting}
            >
              {isAdvancedMode ? '📝 Simple' : '⚙️ Advanced'}
            </button>
            
            {githubUser || currentUser?.login && (
              <span style={{
                fontSize: '12px',
                color: '#656d76'
              }}>
                Commenting as @{githubUser || currentUser.login}
                {userType === 'demo' && ' (Demo)'}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d9e0',
                  backgroundColor: '#ffffff',
                  color: '#1f2328',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
            
            {onSubmit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() || isSubmitting || !githubService.isAuth() || userType === 'demo'}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #1f883d',
                  backgroundColor: '#1f883d',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: (!value.trim() || isSubmitting || !githubService.isAuth() || userType === 'demo') ? 'not-allowed' : 'pointer',
                  opacity: (!value.trim() || isSubmitting || !githubService.isAuth() || userType === 'demo') ? 0.6 : 1
                }}
                title={
                  !githubService.isAuth() ? 'Authentication required' :
                  userType === 'demo' ? 'Demo mode - cannot submit to GitHub' :
                  !value.trim() ? 'Enter comment text' :
                  'Submit comment'
                }
              >
                {isSubmitting ? 'Submitting...' : 'Comment'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isAdvancedMode && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#dbeafe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          💡 <strong>Tip:</strong> Use templates for common responses, @ to mention users, # to reference issues/PRs
          {userType === 'demo' && (
            <div style={{ marginTop: '4px', color: '#dc2626' }}>
              <strong>Demo Mode:</strong> Comments cannot be submitted to GitHub
            </div>
          )}
          {!githubService.isAuth() && (
            <div style={{ marginTop: '4px', color: '#dc2626' }}>
              <strong>Not Authenticated:</strong> Please authenticate to submit comments
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TinyMCECommentEditor;