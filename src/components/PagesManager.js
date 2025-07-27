import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import BranchSelector from './BranchSelector';
import HelpButton from './HelpButton';
import ContextualHelpMascot from './ContextualHelpMascot';
import './PagesManager.css';

const PagesManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, component, selectedBranch } = location.state || {};
  
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [initializingAuth, setInitializingAuth] = useState(true);

  // Initialize authentication if needed
  useEffect(() => {
    const initializeAuthentication = async () => {
      // Check if GitHub service is already authenticated
      if (githubService.isAuth()) {
        setInitializingAuth(false);
        return;
      }

      // Try to restore authentication from stored token
      const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
      if (token) {
        console.log('Restoring GitHub authentication from stored token');
        const success = githubService.authenticate(token);
        if (success) {
          console.log('GitHub authentication restored successfully');
        } else {
          console.warn('Failed to restore GitHub authentication');
          // Clean up invalid tokens
          sessionStorage.removeItem('github_token');
          localStorage.removeItem('github_token');
        }
      } else {
        console.warn('No stored GitHub token found');
      }

      setInitializingAuth(false);
    };

    initializeAuthentication();
  }, []);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile && !initializingAuth) {
        try {
          const writeAccess = await githubService.checkRepositoryWritePermissions(
            repository.owner?.login || repository.full_name.split('/')[0],
            repository.name
          );
          setHasWriteAccess(writeAccess);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
      setCheckingPermissions(false);
    };

    if (!initializingAuth) {
      checkPermissions();
    }
  }, [repository, profile, initializingAuth]);

  // Load pages from sushi-config.yaml
  useEffect(() => {
    const loadPages = async () => {
      if (!profile || !repository) {
        navigate('/');
        return;
      }

      // Wait for authentication to be initialized
      if (initializingAuth) {
        return;
      }

      // Check if we have authentication after initialization
      if (!githubService.isAuth()) {
        setError('GitHub authentication not available. Please return to the home page and sign in again.');
        setLoading(false);
        return;
      }

      // Retry logic for GitHub service authentication
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          setLoading(true);
          setError(null);

          const owner = repository.owner?.login || repository.full_name.split('/')[0];
          const repo = repository.name;
          const branch = selectedBranch || 'main';

          console.log(`Loading pages for ${owner}/${repo} on branch: ${branch} (attempt ${retries + 1})`);
          console.log('selectedBranch:', selectedBranch);
          console.log('GitHub auth status:', githubService.isAuth());
          console.log('GitHub octokit:', !!githubService.octokit);

          // Double-check authentication status
          if (!githubService.isAuth() || !githubService.octokit) {
            if (retries < maxRetries - 1) {
              console.log('GitHub service not ready, waiting...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries++;
              continue;
            } else {
              throw new Error('GitHub service not authenticated. Please return to the home page and sign in again.');
            }
          }

          // Fetch sushi-config.yaml
          const sushiConfigContent = await fetchSushiConfig(owner, repo, branch);
          if (!sushiConfigContent) {
            throw new Error(`sushi-config.yaml not found in repository on branch "${branch}"`);
          }
        
          // Parse pages from sushi-config.yaml
          const parsedPages = parsePagesFromSushiConfig(sushiConfigContent);
          
          // Check if page files exist and get their status
          const pagesWithStatus = await checkPagesExistence(owner, repo, branch, parsedPages);
          
          setPages(pagesWithStatus);
          break; // Success, exit retry loop
          
        } catch (error) {
          console.error('Failed to load pages:', error);
          
          if (retries < maxRetries - 1) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          
          // Final error after all retries
          setError(error.message);
        } finally {
          setLoading(false);
        }
        break;
      }
    };

    loadPages();
  }, [profile, repository, selectedBranch, navigate, initializingAuth]);

  const fetchSushiConfig = async (owner, repo, branch) => {
    try {
      // Check if GitHub service is authenticated and available
      if (!githubService.isAuth() || !githubService.octokit) {
        throw new Error('GitHub service not authenticated');
      }

      console.log(`Fetching sushi-config.yaml from ${owner}/${repo} on branch ${branch}`);
      
      const { data } = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'sushi-config.yaml',
        ref: branch
      });

      if (data.type === 'file' && data.content) {
        console.log('Successfully fetched sushi-config.yaml');
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      
      console.log('sushi-config.yaml found but no content or not a file');
      return null;
    } catch (error) {
      console.error('Failed to fetch sushi-config.yaml:', error);
      
      // Provide more specific error messages
      if (error.status === 404) {
        throw new Error(`sushi-config.yaml not found in repository on branch "${branch}"`);
      } else if (error.status === 403) {
        throw new Error('Access denied - insufficient permissions to read repository contents');
      } else if (error.status === 401) {
        throw new Error('Authentication failed - please check your GitHub token');
      } else if (!githubService.isAuth()) {
        throw new Error('GitHub service not authenticated');
      } else {
        throw new Error(`Failed to fetch sushi-config.yaml: ${error.message}`);
      }
    }
  };

  const parsePagesFromSushiConfig = (configContent) => {
    const pages = [];
    
    try {
      // Simple YAML parsing for pages section
      const lines = configContent.split('\n');
      let inPagesSection = false;
      let currentIndent = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (trimmedLine === 'pages:') {
          inPagesSection = true;
          currentIndent = line.length - line.trimStart().length;
          continue;
        }
        
        if (inPagesSection) {
          const lineIndent = line.length - line.trimStart().length;
          
          // If we've moved back to the same or lesser indent level, we're out of pages section
          if (trimmedLine && lineIndent <= currentIndent) {
            break;
          }
          
          // Parse page entries - looking for lines with markdown file references
          if (trimmedLine.includes('.md')) {
            const match = trimmedLine.match(/([^:]+):\s*(.+\.md)/);
            if (match) {
              const [, title, filename] = match;
              pages.push({
                title: title.trim(),
                filename: filename.trim(),
                path: `input/pagecontent/${filename.trim()}`,
                level: Math.floor((lineIndent - currentIndent) / 2)
              });
            }
          } else if (trimmedLine.includes(':') && !trimmedLine.includes('.md')) {
            // This might be a section header
            const title = trimmedLine.replace(':', '').trim();
            if (title) {
              pages.push({
                title,
                isSection: true,
                level: Math.floor((lineIndent - currentIndent) / 2)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse pages from sushi-config.yaml:', error);
    }
    
    return pages;
  };

  const checkPagesExistence = async (owner, repo, branch, parsedPages) => {
    const pagesWithStatus = [];
    
    for (const page of parsedPages) {
      if (page.isSection) {
        pagesWithStatus.push(page);
        continue;
      }
      
      let exists = false;
      let content = null;
      
      try {
        // Check if GitHub service is authenticated and available
        if (githubService.isAuth() && githubService.octokit) {
          const { data } = await githubService.octokit.rest.repos.getContent({
            owner,
            repo,
            path: page.path,
            ref: branch
          });
          
          if (data.type === 'file') {
            exists = true;
            content = data;
          }
        }
      } catch (error) {
        exists = false;
      }
      
      pagesWithStatus.push({
        ...page,
        exists,
        content,
        githubUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${page.path}`
      });
    }
    
    return pagesWithStatus;
  };

  const handleViewPage = (page) => {
    if (page.exists && page.content) {
      // Decode and display the markdown content
      const markdownContent = Buffer.from(page.content.content, 'base64').toString('utf-8');
      
      // For now, just open in a new window with raw markdown
      // In a full implementation, this would render the markdown
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${page.title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; line-height: 1.6; }
              pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
              code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>${page.title}</h1>
            <pre>${markdownContent}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleEditPage = (page) => {
    if (!hasWriteAccess) {
      alert('You need write access to edit pages. Please upgrade your GitHub token permissions.');
      return;
    }
    
    // For now, just link to GitHub's edit interface
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const branch = selectedBranch || 'main';
    const editUrl = `https://github.com/${owner}/${repository.name}/edit/${branch}/${page.path}`;
    window.open(editUrl, '_blank');
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard', { 
      state: { profile, repository }
    });
  };

  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="pages-manager">
      <div className="pages-header">
        <div className="header-left">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <div className="repo-status">
            <div className="repo-info">
              <a 
                href={`https://github.com/${repository.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="context-repo-link"
                title="View repository on GitHub"
              >
                <span className="repo-icon">📁</span>
                <span className="context-repo">{repository.name}</span>
                <span className="external-link">↗</span>
              </a>
            </div>
            <div className="branch-info">
              <BranchSelector
                repository={repository}
                selectedBranch={selectedBranch}
                onBranchChange={(branch) => {
                  // Reload pages when branch changes
                  navigate('/pages', {
                    state: { profile, repository, component, selectedBranch: branch }
                  });
                }}
                className="header-branch-selector"
              />
            </div>
            {!checkingPermissions && (
              <span className={`access-level ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only Access'}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <span className="context-owner">@{profile.login}</span>
          <HelpButton 
            helpTopic="pages-manager"
            contextData={{ repository, hasWriteAccess }}
          />
        </div>
      </div>

      <div className="pages-content">
        <div className="breadcrumb">
          <button onClick={handleHomeNavigation} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToDashboard} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Pages</span>
        </div>

        <div className="pages-main">
          <div className="pages-intro">
            <h2>
              <span className="component-icon" style={{ color: '#8b5cf6' }}>📄</span>
              Pages
            </h2>
            <p>
              Published page content and documentation for <strong>{repository.name}</strong>
              {selectedBranch && (
                <span> on branch <code className="branch-display">{selectedBranch}</code></span>
              )}. 
              Pages are defined in <code>sushi-config.yaml</code> and stored as Markdown files in <code>input/pagecontent/</code>.
            </p>
          </div>

          {(loading || initializingAuth) && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{initializingAuth ? 'Initializing GitHub authentication...' : 'Loading pages from sushi-config.yaml...'}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h3>Could not load pages</h3>
                <p>{error}</p>
                <div className="error-suggestions">
                  <p>Make sure:</p>
                  <ul>
                    <li>The repository contains a <code>sushi-config.yaml</code> file{selectedBranch && ` on branch "${selectedBranch}"`}</li>
                    <li>The sushi-config.yaml file has a <code>pages:</code> section</li>
                    <li>You have access to view the repository contents</li>
                    {selectedBranch && selectedBranch !== 'main' && <li>The branch "{selectedBranch}" exists and is accessible</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!loading && !initializingAuth && !error && pages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No pages found</h3>
              <p>This repository doesn't have any pages defined in sushi-config.yaml</p>
              <div className="empty-actions">
                <a 
                  href={`https://github.com/${repository.full_name}/blob/${selectedBranch || 'main'}/sushi-config.yaml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View sushi-config.yaml
                </a>
              </div>
            </div>
          )}

          {!loading && !initializingAuth && !error && pages.length > 0 && (
            <div className="pages-list">
              <div className="pages-header-info">
                <div className="pages-count">
                  {pages.filter(p => !p.isSection).length} pages found
                </div>
                <div className="pages-actions">
                  <a
                    href={`https://github.com/${repository.full_name}/blob/${selectedBranch || 'main'}/sushi-config.yaml`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary small"
                  >
                    View sushi-config.yaml
                  </a>
                </div>
              </div>

              <div className="pages-tree">
                {pages.map((page, index) => (
                  <div 
                    key={index}
                    className={`page-item ${page.isSection ? 'section' : 'page'} level-${page.level}`}
                    style={{ '--indent-level': page.level }}
                  >
                    {page.isSection ? (
                      <div className="section-header">
                        <span className="section-icon">📁</span>
                        <span className="section-title">{page.title}</span>
                      </div>
                    ) : (
                      <div className="page-row">
                        <div className="page-info">
                          <div className="page-title">
                            <span className={`page-status ${page.exists ? 'exists' : 'missing'}`}>
                              {page.exists ? '✅' : '❌'}
                            </span>
                            <span className="page-name">{page.title}</span>
                            <span className="page-filename">({page.filename})</span>
                          </div>
                          {!page.exists && (
                            <div className="page-error">
                              File not found in repository
                            </div>
                          )}
                        </div>
                        
                        <div className="page-actions">
                          {page.exists && (
                            <button
                              onClick={() => handleViewPage(page)}
                              className="btn-action view"
                              title="View page content"
                            >
                              👁️ View
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditPage(page)}
                            className="btn-action edit"
                            title={hasWriteAccess ? "Edit page on GitHub" : "Edit access required"}
                            disabled={!hasWriteAccess}
                          >
                            ✏️ Edit
                          </button>
                          
                          <a
                            href={page.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-action source"
                            title="View source on GitHub"
                          >
                            🔗 Source
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ContextualHelpMascot 
        pageId="pages-manager"
        position="bottom-right"
        contextData={{ repository, hasWriteAccess, pages }}
      />
    </div>
  );
};

export default PagesManager;