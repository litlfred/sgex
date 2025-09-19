import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, usePage } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import './FunctionalRequirementsEditor.css';

const FunctionalRequirementsEditor = () => {
  return (
    <PageLayout pageName="functional-requirements">
      <FunctionalRequirementsContent />
    </PageLayout>
  );
};

const FunctionalRequirementsContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = usePage();
  
  // Get data from page framework
  const user = profile?.login;
  const repo = repository?.name;
  
  const [requirementFiles, setRequirementFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    if (user && repo) {
      const dashboardPath = branch ? 
        `/dashboard/${user}/${repo}/${branch}` : 
        `/dashboard/${user}/${repo}`;
      navigate(dashboardPath);
    } else {
      navigate('/dashboard', { 
        state: { 
          profile, 
          repository, 
          branch 
        } 
      });
    }
  };

  // Fetch requirement FSH files from input/fsh directory
  useEffect(() => {
    const fetchRequirementFiles = async () => {
      const currentRepository = repository;
      const currentBranch = branch;
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      
      if ((!currentRepository && (!currentUser || !currentRepo)) || !currentBranch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the input/fsh directory
        try {
          const fshDirContents = await githubService.getDirectoryContents(
            currentUser, 
            currentRepo, 
            'input/fsh', 
            currentBranch
          );

          // Filter for requirement-related .fsh files
          const requirementFilesList = fshDirContents
            .filter(file => {
              const isReqFile = file.name.toLowerCase().includes('requirement') || 
                              file.name.toLowerCase().includes('req-') ||
                              file.name.toLowerCase().includes('functional') ||
                              file.name.toLowerCase().includes('nonfunctional') ||
                              file.name.toLowerCase().includes('non-functional');
              return isReqFile && file.name.endsWith('.fsh') && file.type === 'file';
            })
            .map(file => ({
              name: file.name,
              path: file.path,
              download_url: file.download_url,
              type: determineRequirementType(file.name)
            }));

          setRequirementFiles(requirementFilesList);
        } catch (err) {
          if (err.status === 404) {
            setRequirementFiles([]);
          } else {
            throw err;
          }
        }
      } catch (error) {
        console.error('Error fetching requirement files:', error);
        setError(`Failed to load requirement files: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirementFiles();
  }, [repository, branch, user, repo]);

  // Determine requirement type from filename
  const determineRequirementType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('functional') && !lower.includes('non')) {
      return 'FunctionalRequirement';
    } else if (lower.includes('nonfunctional') || lower.includes('non-functional')) {
      return 'NonFunctionalRequirement';
    }
    // Default to functional
    return 'FunctionalRequirement';
  };

  // Open file content modal for viewing only
  const handleViewFile = async (file) => {
    try {
      setSelectedFile(file);
      setShowModal(true);
      
      if (file.download_url) {
        const response = await fetch(file.download_url);
        if (response.ok) {
          const content = await response.text();
          setFileContent(content);
        } else {
          setFileContent('// Error loading file content');
        }
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('// Error loading file content');
    }
  };

  // Filter files based on search term
  const filteredFiles = requirementFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group files by type
  const groupedFiles = {
    FunctionalRequirement: filteredFiles.filter(f => f.type === 'FunctionalRequirement'),
    NonFunctionalRequirement: filteredFiles.filter(f => f.type === 'NonFunctionalRequirement')
  };

  if (loading) {
    return (
      <div className="functional-requirements-editor loading-state">
        <div className="loading-content">
          <h2>Loading Requirements...</h2>
          <p>Fetching requirement files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="functional-requirements-editor error-state">
        <div className="error-content">
          <h2>Error Loading Requirements</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleBackToDashboard} className="action-btn primary">
              Back to Dashboard
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="functional-requirements-editor">
      <div className="requirements-header" style={{backgroundColor: 'rgb(4, 11, 118)'}}>
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToDashboard} className="back-button">
              ← Back to Dashboard
            </button>
            <div className="header-info">
              <h1>Functional & Non-Functional Requirements</h1>
              <p>{repository?.full_name} - {branch}</p>
            </div>
          </div>
          <div className="header-right">
            <button onClick={handleHomeNavigation} className="home-button">
              🏠 Home
            </button>
          </div>
        </div>
      </div>

      <div className="requirements-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Requirements Viewer</h2>
            <p>View and browse functional and non-functional requirements as FHIR FSH files</p>
          </div>

          <div className="requirements-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="requirements-sections">
            {Object.entries(groupedFiles).map(([type, files]) => (
              <div key={type} className="requirement-type-section">
                <h3>{type === 'FunctionalRequirement' ? 'Functional Requirements' : 'Non-Functional Requirements'}</h3>
                
                {files.length === 0 ? (
                  <div className="no-files-message">
                    <p>No {type.toLowerCase().replace('requirement', ' requirements')} found.</p>
                    <p>Requirements files should be stored in the input/fsh/ directory.</p>
                  </div>
                ) : (
                  <div className="requirements-grid">
                    {files.map((file) => (
                      <div key={file.path} className="requirement-file-card">
                        <div className="file-header">
                          <div className="file-icon">📋</div>
                          <div className="file-name">{file.name}</div>
                          <div className="file-type-badge">{file.type}</div>
                        </div>
                        <div className="file-actions">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="action-btn view"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Content Modal - View Only */}
      {showModal && selectedFile && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{selectedFile.name}</h3>
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="action-btn close">
                  Close
                </button>
              </div>
            </div>
            <div className="modal-body">
              <pre className="content-viewer">{fileContent}</pre>
            </div>
          </div>
        </div>
      )}

      <ContextualHelpMascot 
        pageId="functional-requirements"
        notificationBadge={!githubService.isAuth()}
      />
    </div>
  );
};

export default FunctionalRequirementsEditor;