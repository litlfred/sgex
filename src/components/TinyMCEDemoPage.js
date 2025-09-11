import React, { useState, useEffect } from 'react';
import { PageLayout, usePageParams, useDAKParams, AccessBadge } from './framework';
import TinyMCEEditor from './TinyMCEEditor';
import TinyMCETemplateEditor from './TinyMCETemplateEditor';
import TinyMCECommentEditor from './TinyMCECommentEditor';
import userAccessService from '../services/userAccessService';
import dataAccessLayer from '../services/dataAccessLayer';
import githubService from '../services/githubService';
import './TinyMCEDemoPage.css';

/**
 * TinyMCE Demo Page showcasing proper framework integration
 * 
 * This page demonstrates how TinyMCE components should be integrated
 * with the SGEX page framework, including:
 * - User access control and authentication
 * - Repository context and branch management
 * - GitHub services integration
 * - Data access layer usage
 * - URL parameter handling
 * - Access badges and user feedback
 */
const TinyMCEDemoPage = () => {
  const { type } = usePageParams();
  const { user, profile, repository, branch } = useDAKParams();
  
  const [standardContent, setStandardContent] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [userType, setUserType] = useState('unauthenticated');
  const [accessLevel, setAccessLevel] = useState('read');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dakComponents, setDakComponents] = useState([]);

  // Initialize page and load data
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);
        
        // Get user type and access level
        const currentUserType = userAccessService.getUserType();
        setUserType(currentUserType);
        
        // Get access level if repository is available
        if (repository && branch) {
          const saveOptions = await dataAccessLayer.getSaveOptions(
            repository.owner.login,
            repository.name,
            branch
          );
          setAccessLevel(saveOptions.showSaveGitHub ? 'write' : 'read');
        }
        
        // Load demo content
        setStandardContent(`
          <h2>TinyMCE Standard Editor Demo</h2>
          <p>This demonstrates the standard TinyMCE editor with WHO SMART Guidelines styling.</p>
          <p><strong>User Type:</strong> ${currentUserType}</p>
          <p><strong>Repository:</strong> ${repository?.name || 'No repository selected'}</p>
          <p><strong>Branch:</strong> ${branch || 'No branch selected'}</p>
        `);
        
        setTemplateContent(`
          <div class="who-section">
            <h2>\${publication.title}</h2>
            <p><strong>Version:</strong> \${dak.version}</p>
            <p><strong>Generated:</strong> \${current.date}</p>
            <p><strong>Repository:</strong> <a href="\${repository.url}">\${repository.owner}/\${repository.name}</a></p>
          </div>
        `);
        
        setCommentContent('This is a demo comment using the TinyMCE comment editor with GitHub integration.');
        
        // Simulate DAK components for template variables
        setDakComponents([
          { name: 'Business Processes', count: 3 },
          { name: 'Decision Support Logic', count: 5 },
          { name: 'Data Dictionary', count: 12 }
        ]);
        
      } catch (error) {
        console.error('Failed to initialize TinyMCE demo page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, [repository, branch]);

  const handleSaveContent = async (content, editorType) => {
    try {
      setSaveStatus({ type: 'info', message: 'Saving content...' });
      
      if (userType === 'demo') {
        // Demo users can only save locally
        const success = await dataAccessLayer.saveAssetLocal(
          `demo/${editorType}-content.html`,
          content
        );
        
        if (success) {
          setSaveStatus({ 
            type: 'success', 
            message: 'Demo content saved locally!' 
          });
        } else {
          setSaveStatus({ 
            type: 'error', 
            message: 'Failed to save demo content locally' 
          });
        }
      } else if (userType === 'authenticated' && repository && accessLevel === 'write') {
        // Authenticated users with write access can save to GitHub
        const result = await dataAccessLayer.saveAssetGitHub(
          repository.owner.login,
          repository.name,
          branch,
          `examples/${editorType}-demo.html`,
          content,
          `Update ${editorType} demo content via TinyMCE`
        );
        
        if (result.success) {
          setSaveStatus({ 
            type: 'success', 
            message: 'Content saved to GitHub successfully!' 
          });
        } else {
          setSaveStatus({ 
            type: 'error', 
            message: result.error || 'Failed to save to GitHub' 
          });
        }
      } else {
        setSaveStatus({ 
          type: 'warning', 
          message: 'Read-only access - cannot save changes' 
        });
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Save operation failed' 
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleCommentSubmit = async (content) => {
    if (!githubService.isAuth()) {
      alert('GitHub authentication required to submit comments');
      return;
    }
    
    if (userType === 'demo') {
      alert('Demo mode: Comments cannot be submitted to GitHub');
      return;
    }
    
    // In a real implementation, this would submit to GitHub API
    console.log('Comment submitted:', content);
    alert('Comment would be submitted to GitHub (demo)');
  };

  if (isLoading) {
    return (
      <PageLayout pageName="tinymce-demo">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading TinyMCE demo...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="tinymce-demo">
      <div className="tinymce-demo-page">
        {/* Page Header */}
        <div className="demo-header">
          <h1>TinyMCE Framework Integration Demo</h1>
          <p>
            This page demonstrates proper integration of TinyMCE components 
            with the SGEX page framework architecture.
          </p>
          
          {repository && (
            <div className="repository-context">
              <AccessBadge 
                owner={repository.owner.login}
                repo={repository.name}
                branch={branch}
                className="demo-access-badge"
              />
              <span className="repo-info">
                📁 {repository.owner.login}/{repository.name} 
                {branch && branch !== 'main' && ` • 🌿 ${branch}`}
              </span>
            </div>
          )}
          
          <div className="user-context">
            <span className="user-type">👤 User Type: {userType}</span>
            <span className="access-level">
              {accessLevel === 'write' ? '✏️ Write Access' : '👁️ Read Only'}
            </span>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`save-status ${saveStatus.type}`}>
            {saveStatus.type === 'success' && '✅ '}
            {saveStatus.type === 'error' && '❌ '}
            {saveStatus.type === 'warning' && '⚠️ '}
            {saveStatus.type === 'info' && 'ℹ️ '}
            {saveStatus.message}
          </div>
        )}

        {/* Standard Editor Demo */}
        <section className="editor-demo-section">
          <h2>1. Standard TinyMCE Editor</h2>
          <p>Basic editor with WHO styling and framework integration:</p>
          
          <TinyMCEEditor
            value={standardContent}
            onChange={setStandardContent}
            height={300}
            placeholder="Edit content using the standard TinyMCE editor..."
            repository={repository}
            branch={branch}
            accessLevel={accessLevel}
          />
          
          <div className="demo-actions">
            <button 
              onClick={() => handleSaveContent(standardContent, 'standard')}
              disabled={userType === 'unauthenticated'}
              className="save-button"
            >
              💾 Save Standard Content
            </button>
          </div>
        </section>

        {/* Template Editor Demo */}
        <section className="editor-demo-section">
          <h2>2. Template Editor with Variables</h2>
          <p>Template editor with dynamic variable resolution and DAK context:</p>
          
          <TinyMCETemplateEditor
            value={templateContent}
            onChange={setTemplateContent}
            height={400}
            repository={repository}
            branch={branch}
            dakComponents={dakComponents}
          />
          
          <div className="demo-actions">
            <button 
              onClick={() => handleSaveContent(templateContent, 'template')}
              disabled={userType === 'unauthenticated'}
              className="save-button"
            >
              💾 Save Template Content
            </button>
          </div>
        </section>

        {/* Comment Editor Demo */}
        <section className="editor-demo-section">
          <h2>3. GitHub Comment Editor</h2>
          <p>Comment editor optimized for GitHub PR/issue interactions:</p>
          
          <TinyMCECommentEditor
            value={commentContent}
            onChange={setCommentContent}
            onSubmit={handleCommentSubmit}
            onCancel={() => setCommentContent('')}
            height={200}
            showAdvanced={true}
            githubUser={profile?.login}
            repository={repository}
            branch={branch}
          />
        </section>

        {/* Framework Integration Summary */}
        <section className="integration-summary">
          <h2>Framework Integration Features</h2>
          
          <div className="feature-grid">
            <div className="feature-item">
              <h3>🔐 User Access Control</h3>
              <p>
                Editors automatically adapt based on user type and permissions.
                Demo users can edit locally, authenticated users can save to GitHub.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>📁 Repository Context</h3>
              <p>
                Template variables automatically populate with repository information,
                branch context, and DAK metadata.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>🌐 GitHub Integration</h3>
              <p>
                Comment editor includes GitHub-specific features like mentions,
                issue references, and template responses.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>💾 Data Access Layer</h3>
              <p>
                All save operations go through the unified data access layer
                with appropriate user access validation.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>🎨 WHO Styling</h3>
              <p>
                Consistent WHO SMART Guidelines styling and branding
                across all editor modes and components.
              </p>
            </div>
            
            <div className="feature-item">
              <h3>📱 Responsive Design</h3>
              <p>
                Editors adapt to different screen sizes and provide
                appropriate fallbacks for accessibility.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="usage-instructions">
          <h2>Usage in Components</h2>
          
          <div className="code-example">
            <h3>Basic Integration Example:</h3>
            <pre><code>{`
import { TinyMCEEditor } from './TinyMCEEditor';
import { useDAKParams } from './framework';

const MyDAKComponent = () => {
  const { repository, branch } = useDAKParams();
  const [content, setContent] = useState('');
  
  return (
    <TinyMCEEditor
      value={content}
      onChange={setContent}
      repository={repository}
      branch={branch}
      accessLevel="write"
    />
  );
};
            `}</code></pre>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default TinyMCEDemoPage;