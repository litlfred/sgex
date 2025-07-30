import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import { PageLayout } from './framework';
import PageViewModal from './PageViewModal';
import PageEditModal from './PageEditModal';
import DAKStatusBox from './DAKStatusBox';
import './PagesManager.css';

const PagesManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, selectedBranch } = location.state || {};
  
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [initializingAuth, setInitializingAuth] = useState(true);
  const [viewModalPage, setViewModalPage] = useState(null);
  const [editModalPage, setEditModalPage] = useState(null);

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
    };

    if (!initializingAuth) {
      checkPermissions();
    }
  }, [repository, profile, initializingAuth]);

  // Initialize staging ground service
  useEffect(() => {
    if (repository && selectedBranch && !initializingAuth) {
      stagingGroundService.initialize(repository, selectedBranch);
    }
  }, [repository, selectedBranch, initializingAuth]);

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
        return atob(data.content);
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
          
          // Look for markdown file entries (e.g., "index.md:")
          if (trimmedLine.endsWith('.md:')) {
            const filename = trimmedLine.replace(':', '').trim();
            let title = filename; // Default title to filename if no title found
            
            // Look ahead for the title on the next line(s)
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j];
              const nextTrimmed = nextLine.trim();
              const nextIndent = nextLine.length - nextLine.trimStart().length;
              
              // If we've moved to same or lesser indent, stop looking for title
              if (nextTrimmed && nextIndent <= lineIndent) {
                break;
              }
              
              // Look for title line
              if (nextTrimmed.startsWith('title:')) {
                title = nextTrimmed.replace('title:', '').trim();
                break;
              }
            }
            
            pages.push({
              title,
              filename,
              path: `input/pagecontent/${filename}`,
              level: Math.floor((lineIndent - currentIndent) / 2)
            });
          }
          // Handle nested sections (lines that end with : but aren't .md files)
          else if (trimmedLine.endsWith(':') && !trimmedLine.includes('.md')) {
            const sectionName = trimmedLine.replace(':', '').trim();
            if (sectionName) {
              pages.push({
                title: sectionName,
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
    setViewModalPage(page);
  };

  const handleEditPage = (page) => {
    setEditModalPage(page);
  };

  const handleSavePage = async (page, content, action = 'staged') => {
    // For staging ground integration, we don't need write access check here
    // as the content is being staged, not directly committed
    if (action === 'staged') {
      // Content has been successfully staged, no further action needed
      console.log(`Page ${page.filename} has been staged for commit`);
      return;
    }
    
    // Legacy direct save functionality (if needed for backward compatibility)
    if (action === 'direct' && !hasWriteAccess) {
      throw new Error('You need write access to save changes. Please upgrade your GitHub token permissions.');
    }

    // This direct save path should not be used anymore with staging ground integration
    if (action === 'direct') {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const branch = selectedBranch || 'main';
      
      // Encode content to base64
      const encodedContent = btoa(content);
      
      // Get current file SHA for update
      const currentSha = page.content?.sha;
      
      await githubService.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo: repository.name,
        path: page.path,
        message: `Update ${page.filename} via SGEX Workbench`,
        content: encodedContent,
        branch,
        sha: currentSha
      });

      // Refresh pages after save
      const owner2 = repository.owner?.login || repository.full_name.split('/')[0];
      const sushiConfigContent = await fetchSushiConfig(owner2, repository.name, branch);
      if (sushiConfigContent) {
        const parsedPages = parsePagesFromSushiConfig(sushiConfigContent);
        const pagesWithStatus = await checkPagesExistence(owner2, repository.name, branch, parsedPages);
        setPages(pagesWithStatus);
      }
    }
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard', { 
      state: { profile, repository }
    });
  };

  // Redirect if missing required context - use useEffect to avoid render issues
  useEffect(() => {
    if (!profile || !repository) {
      navigate('/');
    }
  }, [profile, repository, navigate]);

  if (!profile || !repository) {
    return (
      <PageLayout pageName="pages-manager">
        <div className="pages-manager">
          <div className="redirecting-state">
            <h2>Redirecting...</h2>
            <p>Missing required context. Redirecting to home page...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="pages-manager">
      <div className="pages-manager">
        <div className="pages-content">

        {/* Staging Ground Status */}
        <DAKStatusBox
          repository={repository}
          selectedBranch={selectedBranch}
          hasWriteAccess={hasWriteAccess}
          profile={profile}
        />

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
                            title="Edit page with WYSIWYG editor"
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

      {/* View Modal */}
      {viewModalPage && (
        <PageViewModal
          page={viewModalPage}
          onClose={() => setViewModalPage(null)}
        />
      )}

      {/* Edit Modal */}
      {editModalPage && (
        <PageEditModal
          page={editModalPage}
          onClose={() => setEditModalPage(null)}
          onSave={handleSavePage}
        />
      )}
      </div>
    </PageLayout>
  );
};

export default PagesManager;