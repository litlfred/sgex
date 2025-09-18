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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('FunctionalRequirement');
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

  // Open file content modal
  const handleViewFile = async (file) => {
    try {
      setSelectedFile(file);
      setShowModal(true);
      
      if (file.download_url) {
        const response = await fetch(file.download_url);
        if (response.ok) {
          const content = await response.text();
          setFileContent(content);
          setEditContent(content);
        } else {
          setFileContent('// Error loading file content');
        }
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('// Error loading file content');
    }
  };

  // Start editing
  const handleEditFile = () => {
    setIsEditing(true);
  };

  // Save file content
  const handleSaveFile = async () => {
    if (!selectedFile || !githubService.isAuth()) {
      alert('Authentication required to save files');
      return;
    }

    try {
      setSaving(true);
      
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch;

      await githubService.updateFile(
        currentUser,
        currentRepo,
        selectedFile.path,
        editContent,
        `Update requirement file: ${selectedFile.name}`,
        currentBranch
      );

      setFileContent(editContent);
      setIsEditing(false);
      alert('File saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      alert(`Error saving file: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Create new requirement file
  const handleCreateFile = async () => {
    if (!newFileName.trim() || !githubService.isAuth()) {
      alert('Please provide a filename and ensure you are authenticated');
      return;
    }

    try {
      setSaving(true);
      
      const fileName = newFileName.endsWith('.fsh') ? newFileName : `${newFileName}.fsh`;
      const filePath = `input/fsh/${fileName}`;
      
      const template = createRequirementTemplate(newFileType, fileName);
      
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch;

      await githubService.createFile(
        currentUser,
        currentRepo,
        filePath,
        template,
        `Create new ${newFileType} file: ${fileName}`,
        currentBranch
      );

      // Refresh file list
      setRequirementFiles(prev => [...prev, {
        name: fileName,
        path: filePath,
        type: newFileType
      }]);

      setShowCreateModal(false);
      setNewFileName('');
      alert('File created successfully!');
    } catch (error) {
      console.error('Error creating file:', error);
      alert(`Error creating file: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete file
  const handleDeleteFile = async () => {
    if (!selectedFile || !githubService.isAuth()) {
      alert('Authentication required to delete files');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedFile.name}?`)) {
      return;
    }

    try {
      setSaving(true);
      
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch;

      await githubService.deleteFile(
        currentUser,
        currentRepo,
        selectedFile.path,
        `Delete requirement file: ${selectedFile.name}`,
        currentBranch
      );

      // Remove from list
      setRequirementFiles(prev => prev.filter(f => f.path !== selectedFile.path));
      setShowModal(false);
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Create FSH template for requirements
  const createRequirementTemplate = (type, filename) => {
    const reqId = filename.replace('.fsh', '').replace(/[^a-zA-Z0-9]/g, '');
    const profileType = type === 'FunctionalRequirement' ? 'FunctionalRequirement' : 'NonFunctionalRequirement';
    
    return `// ${type} Definition - WHO SMART Guidelines DAK
// Based on: https://worldhealthorganization.github.io/smart-base/StructureDefinition-${profileType}.html
// Generated by SGEX Workbench

Profile: ${reqId}
Parent: ${profileType}
Id: ${reqId.toLowerCase()}
Title: "${reqId} - ${type}"
Description: "TODO: Add description for this ${type.toLowerCase()}"

// Required elements from base profile
* identifier MS
* identifier ^short = "Unique identifier for this requirement"
* title MS  
* title ^short = "Title of the requirement"
* description MS
* description ^short = "Detailed description of the requirement"
* status MS
* status ^short = "Status of the requirement (draft | active | retired)"

// Additional elements specific to requirements
* priority MS
* priority ^short = "Priority level (high | medium | low)"
* category MS
* category ^short = "Category or classification of the requirement"

// Traceability and relationships
* derivedFrom MS
* derivedFrom ^short = "Source document or requirement this derives from"

// Implementation guidance
* implementationGuidance MS
* implementationGuidance ^short = "Technical implementation notes"

// TODO: Add domain-specific constraints based on requirement type
${type === 'FunctionalRequirement' ? 
  `// Functional requirement specific elements
* acceptanceCriteria MS
* acceptanceCriteria ^short = "Testable acceptance criteria"
* userStory MS  
* userStory ^short = "User story format description"` :
  `// Non-functional requirement specific elements  
* performanceMetrics MS
* performanceMetrics ^short = "Measurable performance criteria"
* qualityAttributes MS
* qualityAttributes ^short = "Quality characteristics (usability, reliability, etc.)"`
}

Instance: ${reqId}Example
InstanceOf: ${reqId}
Usage: #example
Title: "Example ${type}"
Description: "Example instance of ${reqId}"

* identifier.value = "${reqId.toLowerCase()}-example"
* title = "Example ${type} Title"
* description = "This is an example description for the ${type.toLowerCase()}"
* status = #draft
* priority = #medium
* category = "System Function"
* implementationGuidance = "Provide specific technical implementation details here"
${type === 'FunctionalRequirement' ? 
  `* acceptanceCriteria = "Given [context], when [action], then [expected result]"
* userStory = "As a [user type], I want [goal] so that [benefit]"` :
  `* performanceMetrics = "Response time < 2 seconds under normal load"
* qualityAttributes = "Usability, Performance, Security"`
}
`;
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
            <h2>Requirements Editor</h2>
            <p>Create, edit, and manage functional and non-functional requirements as FHIR FSH files</p>
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
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="create-button"
              disabled={!githubService.isAuth()}
            >
              + Create Requirement
            </button>
          </div>

          {!githubService.isAuth() && (
            <div className="auth-notice">
              <p>⚠️ Authentication required to create, edit, or delete requirement files.</p>
            </div>
          )}

          <div className="requirements-sections">
            {Object.entries(groupedFiles).map(([type, files]) => (
              <div key={type} className="requirement-type-section">
                <h3>{type === 'FunctionalRequirement' ? 'Functional Requirements' : 'Non-Functional Requirements'}</h3>
                
                {files.length === 0 ? (
                  <div className="no-files-message">
                    <p>No {type.toLowerCase().replace('requirement', ' requirements')} found.</p>
                    <p>Create new requirement files to get started.</p>
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
                            View/Edit
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

      {/* File Content Modal */}
      {showModal && selectedFile && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>{selectedFile.name}</h3>
              <div className="modal-actions">
                {githubService.isAuth() && (
                  <>
                    {!isEditing ? (
                      <button onClick={handleEditFile} className="action-btn edit">
                        Edit
                      </button>
                    ) : (
                      <button 
                        onClick={handleSaveFile} 
                        className="action-btn save"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                    <button 
                      onClick={handleDeleteFile} 
                      className="action-btn delete"
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </>
                )}
                <button onClick={() => setShowModal(false)} className="action-btn close">
                  Close
                </button>
              </div>
            </div>
            <div className="modal-body">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="content-editor"
                  rows={25}
                />
              ) : (
                <pre className="content-viewer">{fileContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Requirement</h3>
              <button onClick={() => setShowCreateModal(false)} className="action-btn close">
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g., user-authentication-req"
                  className="form-input"
                />
                <small>File will be saved as {newFileName}.fsh in input/fsh/</small>
              </div>
              <div className="form-group">
                <label>Requirement Type:</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="form-select"
                >
                  <option value="FunctionalRequirement">Functional Requirement</option>
                  <option value="NonFunctionalRequirement">Non-Functional Requirement</option>
                </select>
              </div>
              <div className="form-actions">
                <button 
                  onClick={handleCreateFile} 
                  className="action-btn primary"
                  disabled={!newFileName.trim() || saving}
                >
                  {saving ? 'Creating...' : 'Create File'}
                </button>
              </div>
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