import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './CoreDataDictionaryViewer.css';

const CoreDataDictionaryViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  // Get data from URL params or location state (for backward compatibility)
  const { profile, repository, component, selectedBranch } = location.state || {};
  const user = params.user;
  const repo = params.repo;
  const branch = params.branch;
  
  const [fshFiles, setFshFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [hasGhPages, setHasGhPages] = useState(false);

  // Generate base URL for IG Publisher artifacts
  const getBaseUrl = (branchName) => {
    const owner = user || repository?.owner?.login || repository?.full_name.split('/')[0];
    const repoName = repo || repository?.name;
    
    if (branchName === (repository?.default_branch || 'main')) {
      return `https://${owner}.github.io/${repoName}`;
    } else {
      return `https://${owner}.github.io/${repoName}/branches/${branchName}`;
    }
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    if (user && repo) {
      // Use URL parameters for navigation
      const dashboardPath = branch ? 
        `/dashboard/${user}/${repo}/${branch}` : 
        `/dashboard/${user}/${repo}`;
      navigate(dashboardPath);
    } else {
      // Fallback to state-based navigation
      navigate('/dashboard', { 
        state: { 
          profile, 
          repository, 
          selectedBranch 
        } 
      });
    }
  };

  // Fetch FSH files from input/fsh directory
  useEffect(() => {
    const fetchFshFiles = async () => {
      // Support both URL params and state-based data
      const currentRepository = repository;
      const currentBranch = branch || selectedBranch;
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      
      if ((!currentRepository && (!currentUser || !currentRepo)) || !currentBranch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch the input/fsh directory
        try {
          const fshDirContents = await githubService.getDirectoryContents(
            currentUser, 
            currentRepo, 
            'input/fsh', 
            currentBranch
          );

          // Filter for .fsh files
          const fshFilesList = fshDirContents
            .filter(file => file.name.endsWith('.fsh') && file.type === 'file')
            .map(file => ({
              name: file.name,
              path: file.path,
              download_url: file.download_url,
              html_url: file.html_url
            }));

          setFshFiles(fshFilesList);
        } catch (err) {
          if (err.status === 404) {
            // input/fsh directory doesn't exist
            setFshFiles([]);
          } else {
            throw err;
          }
        }

        // Fetch branches to check for gh-pages
        const allBranches = await githubService.getBranches(currentUser, currentRepo);
        const branchNames = allBranches.map(b => b.name);
        setBranches(branchNames.filter(name => name !== 'gh-pages'));
        setHasGhPages(branchNames.includes('gh-pages'));

      } catch (err) {
        console.error('Error fetching FSH files:', err);
        setError('Failed to load Core Data Dictionary files. Please check repository access.');
      } finally {
        setLoading(false);
      }
    };

    fetchFshFiles();
  }, [repository, selectedBranch, user, repo, branch]);

  // Fetch file content for modal display
  const handleViewSource = async (file) => {
    try {
      setSelectedFile(file);
      setFileContent('Loading...');
      setShowModal(true);

      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch || selectedBranch;
      
      const content = await githubService.getFileContent(
        currentUser,
        currentRepo,
        file.path,
        currentBranch
      );

      setFileContent(content);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setFileContent('Error loading file content.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFileContent('');
  };

  if ((!profile || !repository || !component) && !user && !repo) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  if (loading) {
    return (
      <div className="core-data-dictionary-viewer loading-state">
        <div className="loading-content">
          <h2>Loading Core Data Dictionary...</h2>
          <p>Fetching FHIR FSH files and repository data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="core-data-dictionary-viewer">
      <div className="viewer-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile?.avatar_url || `https://github.com/${user || profile?.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repo || repository?.name}</span>
            <span className="context-component">Core Data Dictionary</span>
          </div>
        </div>
      </div>

      <div className="viewer-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
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
          <span className="breadcrumb-current">Core Data Dictionary</span>
        </div>

        <div className="viewer-main">
          <div className="component-intro">
            <div className="component-icon" style={{ color: component?.color || '#0078d4' }}>
              {component?.icon || '📊'}
            </div>
            <div className="intro-content">
              <h2>Core Data Dictionary Viewer</h2>
              <p>
                View canonical representations of Component 2 Core Data Dictionary including FHIR CodeSystems, 
                ValueSets, and ConceptMaps stored in FSH format.
              </p>
              {(branch || selectedBranch) && (
                <div className="branch-info">
                  <strong>Branch:</strong> <code>{branch || selectedBranch}</code>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Documentation Link */}
          <div className="documentation-section">
            <p>
              <a 
                href="https://smart.who.int/ig-starter-kit/v1.0.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="documentation-link"
              >
                📚 WHO IG Starter Kit Documentation ↗
              </a>
            </p>
          </div>

          {/* Main content layout with two columns */}
          <div className="two-column-layout">
            {/* Standard Dictionaries Section - Left Column */}
            <div className="section standard-dictionaries-section left-column">
              <h3>Standard Dictionaries</h3>
              
              <div className="subsection">
                <h4>Code Systems</h4>
                {hasGhPages ? (
                  <div className="dictionary-links">
                    <a 
                      href={`${getBaseUrl(branch || selectedBranch)}/CodeSystem-DAK.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dictionary-link primary"
                    >
                      Core Data Dictionary (DAK) ↗
                    </a>
                  </div>
                ) : (
                  <p className="no-publication-note">
                    Published CodeSystems will be available once GitHub Pages is configured.
                  </p>
                )}
              </div>

              <div className="subsection">
                <h4>Value Sets</h4>
                <div className="placeholder-links">
                  <span className="placeholder-link">Actors (Coming Soon)</span>
                  <span className="placeholder-link">Workflows (Coming Soon)</span>
                  <span className="placeholder-link">Decision Tables (Coming Soon)</span>
                </div>
              </div>
            </div>

            {/* Publications Section - Right Column */}
            {hasGhPages ? (
              <div className="section publications-section right-column">
                <h3>Publications</h3>
                <p>Published FHIR Implementation Guide artifacts generated by the IG Publisher</p>
                
                {branches.sort().map((branchName) => (
                  <div key={branchName} className="branch-publication">
                    <h4>Branch: <code>{branchName}</code></h4>
                    <div className="artifact-links">
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-code-systems`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Code Systems ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-value-sets`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Value Sets ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#structures-logical-models`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Logical Models ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-concept-maps`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Concept Maps ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="section no-publications-section right-column">
                <h3>Publications</h3>
                <div className="no-gh-pages-message">
                  <p>📋 No published artifacts available</p>
                  <p>This repository does not have a <code>gh-pages</code> branch for publishing FHIR Implementation Guide artifacts.</p>
                </div>
              </div>
            )}
          </div>

          {/* FHIR FSH Files Section */}
          <div className="section fsh-files-section">
            <h3>FHIR FSH Source Files</h3>
            <p>FHIR Shorthand (FSH) files containing CodeSystems, ValueSets, and ConceptMaps</p>
            
            {fshFiles.length === 0 ? (
              <div className="no-files-message">
                <p>No FHIR FSH files found in <code>input/fsh/</code> directory.</p>
                <p>Core Data Dictionary files should be stored in FSH format in this location.</p>
              </div>
            ) : (
              <div className="fsh-files-grid">
                {fshFiles.map((file) => (
                  <div key={file.path} className="fsh-file-card">
                    <div className="file-header">
                      <div className="file-icon">📄</div>
                      <div className="file-name">{file.name}</div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleViewSource(file)}
                        title="View source code with syntax highlighting"
                      >
                        View Source
                      </button>
                      <a 
                        href={file.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn secondary"
                        title="View source on GitHub"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Source Code Modal */}
      {showModal && selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedFile.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <pre className="fsh-code">
                <code>{fileContent}</code>
              </pre>
            </div>
            <div className="modal-footer">
              <a 
                href={selectedFile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub ↗
              </a>
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ContextualHelpMascot 
        pageId="core-data-dictionary-viewer"
        contextData={{ 
          profile, 
          repository, 
          component,
          selectedBranch,
          hasGhPages,
          fshFilesCount: fshFiles.length
        }}
        notificationBadge={!hasGhPages}
      />
    </div>
  );
};

export default CoreDataDictionaryViewer;