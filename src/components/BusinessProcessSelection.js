import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import useDAKUrlParams from '../hooks/useDAKUrlParams';
import { PageLayout } from './framework';
import { handleNavigationClick } from '../utils/navigationUtils';
import BPMNPreview from './BPMNPreview';
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
        
        // If no files found and we're in demo mode, provide fallback files
        if (bpmnFiles.length === 0 && profile?.isDemo) {
          console.log('No BPMN files found in demo mode, providing fallback demo files');
          const demoFiles = [
            {
              name: 'patient-registration.bpmn',
              path: 'demo/business-processes/patient-registration.bpmn',
              sha: 'demo-sha-1',
              size: 2048,
              download_url: '#',
              html_url: '#'
            },
            {
              name: 'vaccination-workflow.bpmn',
              path: 'demo/business-processes/vaccination-workflow.bpmn',
              sha: 'demo-sha-2',
              size: 3072,
              download_url: '#'
            },
            {
              name: 'appointment-scheduling.bpmn',
              path: 'demo/business-processes/appointment-scheduling.bpmn',
              sha: 'demo-sha-3',
              size: 1536,
              download_url: '#'
            }
          ];
          setBpmnFiles(demoFiles);
        } else {
          setBpmnFiles(bpmnFiles);
        }
        
        setLoading(false);
      } catch (apiError) {
        console.error('Failed to fetch BPMN files from repository:', apiError);
        
        // For demo mode or when network access fails, provide fallback BPMN files
        if (profile?.isDemo || apiError.message?.includes('Failed to fetch')) {
          console.log('Providing fallback demo BPMN files');
          const demoFiles = [
            {
              name: 'patient-registration.bpmn',
              path: 'demo/business-processes/patient-registration.bpmn',
              sha: 'demo-sha-1',
              size: 2048,
              download_url: '#',
              html_url: '#'
            },
            {
              name: 'vaccination-workflow.bpmn',
              path: 'demo/business-processes/vaccination-workflow.bpmn',
              sha: 'demo-sha-2',
              size: 3072,
              download_url: '#'
            },
            {
              name: 'appointment-scheduling.bpmn',
              path: 'demo/business-processes/appointment-scheduling.bpmn',
              sha: 'demo-sha-3',
              size: 1536,
              download_url: '#'
            }
          ];
          setBpmnFiles(demoFiles);
          setLoading(false);
          return;
        }
        
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

    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const branch = selectedBranch || 'main';
    const path = `/bpmn-editor/${owner}/${repoName}/${branch}/${file.path}`;

    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch,
      mode: 'edit'
    };
    
    handleNavigationClick(event, path, navigate, navigationState);
  };

  const handleView = (event, file) => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const branch = selectedBranch || 'main';
    const path = `/bpmn-viewer/${owner}/${repoName}/${branch}/${file.path}`;

    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch,
      mode: 'view'
    };
    
    handleNavigationClick(event, path, navigate, navigationState);
  };

  const handleViewSource = (event, file) => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const branch = selectedBranch || 'main';
    const path = `/bpmn-source/${owner}/${repoName}/${branch}/${file.path}`;

    const navigationState = {
      profile,
      repository,
      component,
      selectedFile: file,
      selectedBranch
    };
    
    handleNavigationClick(event, path, navigate, navigationState);
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
    <PageLayout pageName="business-process-selection">
      <div className="business-process-selection">
      <div className="selection-content">

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
                  <BPMNPreview 
                    file={file} 
                    repository={repository} 
                    selectedBranch={selectedBranch}
                    profile={profile}
                  />
                  
                  <div className="file-header">
                    <div className="file-icon">🔄</div>
                    <div className="file-details">
                      <h3 className="file-name">{file.name}</h3>
                      <div className="file-info-compact">
                        <span className="file-path">{file.path}</span>
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </PageLayout>
  );
};

export default BusinessProcessSelection;