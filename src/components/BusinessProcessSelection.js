import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import useDAKUrlParams from '../hooks/useDAKUrlParams';
import ContextualHelpMascot from './ContextualHelpMascot';
import { handleNavigationClick } from '../utils/navigationUtils';
import './BusinessProcessSelection.css';

const BusinessProcessSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use the DAK URL params hook to get profile, repository, and branch
  const { 
    profile, 
    repository, 
    selectedBranch, 
    loading: dakLoading, 
    error: dakError 
  } = useDAKUrlParams();

  // Debug logging for repository data flow
  console.log('🚀 BusinessProcessSelection: Hook data received:', {
    hasProfile: !!profile,
    hasRepository: !!repository,
    profileLogin: profile?.login,
    repositoryName: repository?.name,
    repositoryFullName: repository?.full_name,
    repositoryOwner: repository?.owner?.login,
    selectedBranch,
    dakLoading,
    dakError
  });
  
  // Get component from location.state if available (when navigating from dashboard)
  const { component } = location.state || {};
  
  const [bpmnFiles, setBpmnFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

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
      setCheckingPermissions(false);
    };

    checkPermissions();
  }, [repository, profile]);

  // Load BPMN files from repository
  useEffect(() => {
    const loadBpmnFiles = async () => {
      if (!repository) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Debug logging to understand repository data flow
        console.log('📂 BusinessProcessSelection - Repository object analysis:', {
          name: repository.name,
          full_name: repository.full_name,
          owner: repository.owner,
          ownerLogin: repository.owner?.login,
          isDemo: repository.isDemo,
          html_url: repository.html_url,
          default_branch: repository.default_branch
        });
        console.log('👤 BusinessProcessSelection - Profile object analysis:', {
          login: profile?.login,
          name: profile?.name,
          isDemo: profile?.isDemo,
          type: profile?.type
        });

        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        const ref = selectedBranch || 'main';

        console.log(`📋 BusinessProcessSelection: Derived repository info:`, {
          original_owner_login: repository.owner?.login,
          original_full_name: repository.full_name,
          derived_owner: owner,
          derived_repoName: repoName,
          selected_ref: ref,
          derivation_method: repository.owner?.login ? 'owner.login' : 'full_name.split'
        });

        console.log(`🔍 BusinessProcessSelection: About to fetch BPMN files from ${owner}/${repoName} (branch: ${ref})`);
        console.log('BusinessProcessSelection: Final repository access details:', {
          derivedOwner: owner,
          repositoryName: repoName,
          ref: ref,
          fullRepositoryData: {
            name: repository.name,
            full_name: repository.full_name,
            owner: repository.owner,
            default_branch: repository.default_branch
          }
        });
        
        const bpmnFiles = await githubService.getBpmnFiles(owner, repoName, ref);
        
        console.log(`Found ${bpmnFiles.length} BPMN files:`, bpmnFiles.map(f => f.path));
        
        setBpmnFiles(bpmnFiles);
        setLoading(false);
      } catch (apiError) {
        console.error('Failed to fetch BPMN files from repository:', apiError);
        
        // Check if this is an authentication error for a private repository
        if (apiError.status === 401 || apiError.status === 403) {
          setError('Authentication required to access this repository. Please ensure you have a valid GitHub token with appropriate permissions.');
        } else if (apiError.status === 404) {
          setError('Repository or branch not found. Please check the repository name and branch.');
        } else {
          setError(`Failed to load BPMN files from repository: ${apiError.message}`);
        }
        
        setBpmnFiles([]);
        setLoading(false);
      }
    };

    loadBpmnFiles();
  }, [profile, repository, navigate, selectedBranch]);

  const handleEdit = (event, file) => {
    if (!hasWriteAccess) {
      // Show permission help message
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch,
      mode: 'edit'
    };
    
    handleNavigationClick(event, '/bpmn-editor', navigate, navigationState);
  };

  const handleView = (event, file) => {
    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch,
      mode: 'view'
    };
    
    handleNavigationClick(event, '/bpmn-viewer', navigate, navigationState);
  };

  const handleViewSource = (event, file) => {
    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch
    };
    
    handleNavigationClick(event, '/bpmn-source', navigate, navigationState);
  };

  if (dakLoading) {
    return (
      <div className="business-process-selection loading-state">
        <div className="loading-content">
          <h2>Loading DAK Data...</h2>
          <p>Fetching repository and user data...</p>
        </div>
      </div>
    );
  }

  if (dakError) {
    return (
      <div className="business-process-selection error-state">
        <div className="error-content">
          <h2>Error Loading DAK Data</h2>
          <p>{dakError}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              Return to Home
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="business-process-selection">
      <div className="selection-header">
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
            <span className="context-component">Business Processes</span>
            {!checkingPermissions && (
              <span className={`access-level ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only Access'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="selection-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button 
            onClick={() => navigate(`/dashboard/${repository.owner?.login || repository.full_name.split('/')[0]}/${repository.name}${selectedBranch ? `/${selectedBranch}` : ''}`, { 
              state: { profile, repository, selectedBranch } 
            })} 
            className="breadcrumb-link"
          >
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Business Processes</span>
        </div>

        <div className="selection-main">
          <div className="selection-intro">
            <h2>Business Process Files</h2>
            <p>
              Select a BPMN business process file to view, edit, or examine the source code.
              Files are loaded from <code>input/business-processes/</code> or <code>input/business-process/</code> directories and subdirectories.
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading business process files...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>❌ {error}</p>
            </div>
          ) : bpmnFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No BPMN Files Found</h3>
              <p>No .bpmn files were found in the input/business-processes/ or input/business-process/ directories.</p>
            </div>
          ) : (
            <div className="files-grid">
              {bpmnFiles.map((file) => (
                <div key={file.sha} className="file-card">
                  <div className="file-header">
                    <div className="file-icon">🔄</div>
                    <div className="file-details">
                      <h3 className="file-name">{file.name}</h3>
                      <p className="file-path">{file.path}</p>
                      <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>

                  <div className="file-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={(event) => handleView(event, file)}
                      title="View BPMN diagram (read-only)"
                    >
                      👁️ View
                    </button>

                    <button 
                      className={`action-btn edit-btn ${!hasWriteAccess ? 'disabled' : ''}`}
                      onClick={(event) => handleEdit(event, file)}
                      title={hasWriteAccess ? "Edit BPMN diagram" : "Edit access required"}
                      disabled={!hasWriteAccess}
                    >
                      ✏️ Edit
                    </button>

                    <button 
                      className="action-btn source-btn"
                      onClick={(event) => handleViewSource(event, file)}
                      title="View XML source code"
                    >
                      📄 Source
                    </button>
                  </div>

                  {!hasWriteAccess && (
                    <div className="permission-notice">
                      <p>🔒 Read-only access - editing requires write permissions</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="business-process-selection"
        contextData={{ profile, repository, component }}
      />
    </div>
  );
};

export default BusinessProcessSelection;