import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import githubService from '../services/githubService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './BPMNViewer.css';

const BPMNViewerComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  const { profile, repository, component, selectedFile, selectedBranch } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          // Simple permission check - in real app, this would use githubService
          const writeAccess = profile.token && repository.permissions?.push;
          setHasWriteAccess(writeAccess || false);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };

    checkPermissions();
  }, [repository, profile]);

  // Load BPMN file content
  const loadBpmnContent = useCallback(async () => {
    console.log('loadBpmnContent called with:', {
      hasViewer: !!viewerRef.current,
      selectedFile: selectedFile,
      repository: repository ? {
        name: repository.name,
        owner: repository.owner
      } : null
    });

    if (!viewerRef.current || !selectedFile || !repository) {
      console.warn('Missing required parameters for loadBpmnContent:', {
        hasViewer: !!viewerRef.current,
        hasSelectedFile: !!selectedFile,
        hasRepository: !!repository
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const ref = selectedBranch || 'main';

      console.log(`Loading BPMN content from ${owner}/${repoName}:${selectedFile.path} (ref: ${ref})`);
      console.log('Selected file object:', selectedFile);
      
      // Add a timeout for the entire loading process
      const loadingTimeout = setTimeout(() => {
        setError('Loading timed out. Please try again or check your internet connection.');
        setLoading(false);
      }, 30000); // 30 second timeout
      
      try {
        // Use githubService to fetch file content (works for both public and private repos)
        const bpmnXml = await githubService.getFileContent(owner, repoName, selectedFile.path, ref);
        
        console.log('Successfully loaded BPMN content from repository, length:', bpmnXml.length);
        console.log('BPMN content preview:', bpmnXml.substring(0, 200));

        // Validate that we got valid BPMN XML content
        if (!bpmnXml || !bpmnXml.trim()) {
          throw new Error('Empty or invalid BPMN file content');
        }
        
        if (!bpmnXml.includes('bpmn:definitions') && !bpmnXml.includes('<definitions')) {
          throw new Error('File does not appear to contain valid BPMN XML content');
        }

        // Load the BPMN diagram
        console.log('Attempting to import XML into BPMN viewer...');
        await viewerRef.current.importXML(bpmnXml);
        console.log('Successfully imported BPMN XML into viewer');
        
        // Center the diagram in the viewer
        try {
          const canvas = viewerRef.current.get('canvas');
          canvas.zoom('fit-viewport');
          console.log('Centered BPMN diagram in viewport');
        } catch (centerError) {
          console.warn('Could not center diagram:', centerError);
          // This is not a critical error, continue
        }
        
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (contentError) {
        clearTimeout(loadingTimeout);
        throw contentError;
      }
    } catch (err) {
      console.error('Error loading BPMN file:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        stack: err.stack
      });
      
      // Provide specific error messages based on the error type
      if (err.message.includes('timeout') || err.message.includes('timed out')) {
        setError('Loading timed out. Please check your internet connection and try again.');
      } else if (err.status === 404) {
        setError('BPMN file not found in the repository. The file may have been moved or deleted.');
      } else if (err.status === 403) {
        setError('Access denied. This repository may be private and require authentication.');
      } else if (err.message.includes('rate limit')) {
        setError('GitHub API rate limit exceeded. Please try again later or authenticate for higher limits.');
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        setError('Network error occurred. Please check your internet connection and try again.');
      } else if (err.message.includes('Empty or invalid BPMN')) {
        setError('The selected file appears to be empty or corrupted.');
      } else if (err.message.includes('does not appear to contain valid BPMN')) {
        setError('The selected file does not appear to contain valid BPMN XML content.');
      } else if (err.message.includes('failed to parse XML') || err.message.includes('XML')) {
        setError('The BPMN file contains invalid XML and cannot be displayed.');
      } else {
        setError(`Failed to load BPMN diagram: ${err.message}`);
      }
      
      setLoading(false);
    }
  }, [selectedFile, repository, selectedBranch]);

  // Initialize BPMN viewer
  useEffect(() => {
    const initializeViewer = () => {
      console.log('initializeViewer called with:', {
        hasContainer: !!containerRef.current,
        hasViewer: !!viewerRef.current,
        selectedFile: selectedFile ? selectedFile.name : 'none'
      });

      if (containerRef.current && !viewerRef.current && selectedFile) {
        try {
          console.log('Creating new BPMN viewer...');
          viewerRef.current = new BpmnViewer({
            container: containerRef.current,
            keyboard: {
              bindTo: window
            }
          });
          console.log('BPMN viewer initialized successfully');
          loadBpmnContent();
        } catch (error) {
          console.error('Failed to initialize BPMN viewer:', error);
          setError('Failed to initialize BPMN viewer');
          setLoading(false);
        }
      }
    };

    if (selectedFile) {
      console.log('Setting up viewer initialization timer for selectedFile:', selectedFile.name);
      // Wait for container to be ready
      const timer = setTimeout(initializeViewer, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('No selectedFile, skipping viewer initialization');
    }

    return () => {
      if (viewerRef.current) {
        try {
          console.log('Destroying BPMN viewer...');
          viewerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying BPMN viewer:', error);
        }
        viewerRef.current = null;
      }
    };
  }, [selectedFile, loadBpmnContent]);

  const handleEditMode = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    navigate('/bpmn-editor', {
      state: {
        profile,
        repository,
        component,
        selectedFile,
        selectedBranch,
        mode: 'edit'
      }
    });
  };

  const handleBackToSelection = () => {
    navigate('/business-process-selection', {
      state: {
        profile,
        repository,
        component,
        selectedBranch
      }
    });
  };

  if (!profile || !repository || !selectedFile) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="bpmn-viewer">
      <div className="viewer-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repository.name}</span>
            <span className="context-component">Business Process Viewer</span>
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
          <button onClick={() => navigate('/dashboard', { state: { profile, repository } })} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToSelection} className="breadcrumb-link">
            Business Processes
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{selectedFile.name}</span>
        </div>

        <div className="viewer-main">
          <div className="viewer-toolbar">
            <div className="toolbar-left">
              <h3>{selectedFile.name}</h3>
              <span className="view-mode-badge">👁️ Read-Only View</span>
            </div>
            <div className="toolbar-right">
              <button 
                className="action-btn secondary"
                onClick={handleBackToSelection}
              >
                ← Back to List
              </button>
              {hasWriteAccess && (
                <button 
                  className="action-btn primary"
                  onClick={handleEditMode}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>

          <div className="diagram-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <div className="loading-info">
                  <p>Loading BPMN diagram...</p>
                  <p className="loading-details">
                    Fetching {selectedFile.name} from {repository.name}
                  </p>
                  <p className="loading-hint">
                    This may take a few moments for large files or slow connections.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="error-overlay">
                <p>❌ {error}</p>
                <div className="error-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => loadBpmnContent()}
                  >
                    🔄 Retry
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate('/business-process-selection', {
                      state: { profile, repository, component, selectedBranch }
                    })}
                  >
                    ← Back to List
                  </button>
                </div>
              </div>
            ) : (
              <div className="bpmn-container" ref={containerRef}></div>
            )}
          </div>

          <div className="diagram-info">
            <div className="info-section">
              <h4>File Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Name:</label>
                  <span>{selectedFile.name}</span>
                </div>
                <div className="info-item">
                  <label>File Path:</label>
                  <span className="file-path">{selectedFile.path}</span>
                </div>
                <div className="info-item">
                  <label>File Size:</label>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="info-item">
                  <label>Access Level:</label>
                  <span className={`access-badge ${hasWriteAccess ? 'write' : 'read'}`}>
                    {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only'}
                  </span>
                </div>
              </div>
            </div>

            {!hasWriteAccess && (
              <div className="permission-notice">
                <h4>🔒 Read-Only Access</h4>
                <p>
                  You currently have read-only access to this repository. 
                  To edit BPMN diagrams, you need write permissions. 
                  Contact the repository administrator or update your GitHub Personal Access Token with write permissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="bpmn-viewer"
        contextData={{ profile, repository, selectedFile }}
      />
    </div>
  );
};

export default BPMNViewerComponent;