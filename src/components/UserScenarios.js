import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import githubService from '../services/githubService';
import { PageLayout, usePage } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import './UserScenarios.css';

// Lazy load the markdown editor to avoid bundle bloat
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const UserScenarios = () => {
  return (
    <PageLayout pageName="user-scenarios">
      <UserScenariosContent />
    </PageLayout>
  );
};

const UserScenariosContent = () => {
  const { profile, repository, branch } = usePage();
  
  // Get data from page framework
  const user = profile?.login;
  const repo = repository?.name;
  
  const [scenarioFiles, setScenarioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioContent, setScenarioContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [newScenarioId, setNewScenarioId] = useState('');
  const [newScenarioTitle, setNewScenarioTitle] = useState('');

  // Function to validate WHO SMART Guidelines SOP ID requirements
  const validateScenarioId = (id) => {
    // WHO SMART Guidelines SOP ID requirements:
    // - Must be lowercase
    // - Must use hyphens instead of spaces
    // - Should be descriptive and follow kebab-case format
    // - Should not contain special characters except hyphens
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return regex.test(id) && id.length >= 3 && id.length <= 50;
  };

  // Function to generate a valid scenario ID from title
  const generateScenarioId = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Load user scenario files from input/pagecontent/
  const loadScenarioFiles = useCallback(async () => {
    if (!user || !repo || !branch) return;

    try {
      setLoading(true);
      setError(null);

      // Get files from input/pagecontent directory
      const pageContentPath = 'input/pagecontent';
      const files = await githubService.getDirectoryContents(user, repo, pageContentPath, branch);
      
      // Filter for userscenario-*.md files
      const scenarioFiles = files
        .filter(file => 
          file.type === 'file' && 
          file.name.startsWith('userscenario-') && 
          file.name.endsWith('.md')
        )
        .map(file => ({
          ...file,
          id: file.name.replace('userscenario-', '').replace('.md', ''),
          title: file.name.replace('userscenario-', '').replace('.md', '').replace(/-/g, ' ')
        }));

      setScenarioFiles(scenarioFiles);
    } catch (err) {
      console.error('Error loading scenario files:', err);
      setError(`Failed to load user scenarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, repo, branch]);

  // Load content of a specific scenario file
  const loadScenarioContent = useCallback(async (scenarioFile) => {
    if (!user || !repo || !branch || !scenarioFile) return;

    try {
      setLoading(true);
      const content = await githubService.getFileContent(user, repo, scenarioFile.path, branch);
      setScenarioContent(content);
      setSelectedScenario(scenarioFile);
    } catch (err) {
      console.error('Error loading scenario content:', err);
      setError(`Failed to load scenario: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, repo, branch]);

  // Save scenario content
  const saveScenarioContent = useCallback(async () => {
    if (!user || !repo || !branch || !selectedScenario) return;

    try {
      setSaving(true);
      
      const commitMessage = `Update user scenario: ${selectedScenario.id}`;
      
      await githubService.updateFile(
        user,
        repo,
        selectedScenario.path,
        scenarioContent,
        commitMessage,
        selectedScenario.sha,
        branch
      );
      
      // Refresh the file list to get updated SHA
      await loadScenarioFiles();
      
      // Update the selected scenario with new SHA
      const updatedFiles = await githubService.getDirectoryContents(user, repo, 'input/pagecontent', branch);
      const updatedScenario = updatedFiles.find(f => f.path === selectedScenario.path);
      if (updatedScenario) {
        setSelectedScenario({
          ...selectedScenario,
          sha: updatedScenario.sha
        });
      }
      
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving scenario:', err);
      setError(`Failed to save scenario: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, repo, branch, selectedScenario, scenarioContent, loadScenarioFiles]);

  // Create new scenario
  const createNewScenario = useCallback(async () => {
    if (!user || !repo || !branch || !newScenarioId || !newScenarioTitle) return;

    try {
      setSaving(true);
      
      // Validate the ID
      if (!validateScenarioId(newScenarioId)) {
        setError('Scenario ID must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens.');
        setSaving(false);
        return;
      }

      // Check if file already exists
      const fileName = `userscenario-${newScenarioId}.md`;
      const filePath = `input/pagecontent/${fileName}`;
      
      try {
        await githubService.getFileContent(user, repo, filePath, branch);
        setError('A scenario with this ID already exists. Please choose a different ID.');
        setSaving(false);
        return;
      } catch (err) {
        // File doesn't exist, which is what we want
      }

      // Create initial content
      const initialContent = `# ${newScenarioTitle}

## Overview
Brief description of this user scenario.

## Actors
- Primary actor: [Actor name]
- Secondary actors: [List other actors if applicable]

## Preconditions
- [List any preconditions]

## Flow of Events
1. [Step 1]
2. [Step 2]
3. [Continue with the main flow]

## Postconditions
- [List the expected outcomes]

## Alternative Flows
### [Alternative Flow Name]
- [Describe alternative scenarios]

## Exception Flows
### [Exception Flow Name]
- [Describe error handling scenarios]

## Notes
- [Additional notes or considerations]
`;

      const commitMessage = `Create new user scenario: ${newScenarioTitle}`;
      
      await githubService.createFile(
        user,
        repo,
        filePath,
        initialContent,
        commitMessage,
        branch
      );
      
      // Refresh the file list
      await loadScenarioFiles();
      
      // Clear the modal
      setShowNewScenarioModal(false);
      setNewScenarioId('');
      setNewScenarioTitle('');
      
    } catch (err) {
      console.error('Error creating scenario:', err);
      setError(`Failed to create scenario: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, repo, branch, newScenarioId, newScenarioTitle, loadScenarioFiles]);

  // Load scenario files when component mounts or context changes
  useEffect(() => {
    loadScenarioFiles();
  }, [loadScenarioFiles]);

  // Auto-generate scenario ID when title changes
  useEffect(() => {
    if (newScenarioTitle) {
      const generatedId = generateScenarioId(newScenarioTitle);
      setNewScenarioId(generatedId);
    }
  }, [newScenarioTitle]);

  // Render loading state
  if (loading && !selectedScenario) {
    return (
      <div className="user-scenarios-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user scenarios...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !selectedScenario) {
    return (
      <div className="user-scenarios-container">
        <div className="error-container">
          <h2>Error Loading User Scenarios</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-scenarios-container">
      <div className="user-scenarios-header">
        <h1>User Scenarios</h1>
        <p>Narrative descriptions of how different personas interact with the system in specific healthcare contexts.</p>
        
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowNewScenarioModal(true)}
            disabled={saving}
          >
            Create New Scenario
          </button>
        </div>
      </div>

      <div className="user-scenarios-content">
        {/* Scenario List */}
        <div className="scenarios-sidebar">
          <h3>Available Scenarios ({scenarioFiles.length})</h3>
          
          {scenarioFiles.length === 0 ? (
            <div className="empty-state">
              <p>No user scenarios found.</p>
              <p>Click "Create New Scenario" to get started.</p>
            </div>
          ) : (
            <div className="scenarios-list">
              {scenarioFiles.map((file) => (
                <div
                  key={file.path}
                  className={`scenario-item ${selectedScenario?.path === file.path ? 'selected' : ''}`}
                  onClick={() => loadScenarioContent(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      loadScenarioContent(file);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select user scenario: ${file.title}`}
                >
                  <h4>{file.title}</h4>
                  <p className="scenario-id">ID: {file.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scenario Editor */}
        <div className="scenario-editor">
          {selectedScenario ? (
            <>
              <div className="editor-header">
                <h2>{selectedScenario.title}</h2>
                <div className="editor-actions">
                  {isEditMode ? (
                    <>
                      <button 
                        className="btn-secondary"
                        onClick={() => setIsEditMode(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={saveScenarioContent}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="editor-content">
                {isEditMode ? (
                  <Suspense fallback={<div>Loading editor...</div>}>
                    <MDEditor
                      value={scenarioContent}
                      onChange={setScenarioContent}
                      height={600}
                      data-color-mode="light"
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={<div>Loading preview...</div>}>
                    <MDEditor.Markdown 
                      source={scenarioContent} 
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </Suspense>
                )}
              </div>
            </>
          ) : (
            <div className="editor-placeholder">
              <p>Select a scenario from the list to view or edit it.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Scenario Modal */}
      {showNewScenarioModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User Scenario</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewScenarioModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="scenario-title">Scenario Title:</label>
                <input
                  id="scenario-title"
                  type="text"
                  value={newScenarioTitle}
                  onChange={(e) => setNewScenarioTitle(e.target.value)}
                  placeholder="e.g., Patient Registration Flow"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="scenario-id">Scenario ID:</label>
                <input
                  id="scenario-id"
                  type="text"
                  value={newScenarioId}
                  onChange={(e) => setNewScenarioId(e.target.value)}
                  placeholder="e.g., patient-registration-flow"
                />
                <small className="form-help">
                  ID must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens.
                </small>
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowNewScenarioModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={createNewScenario}
                disabled={saving || !newScenarioTitle.trim() || !newScenarioId.trim()}
              >
                {saving ? 'Creating...' : 'Create Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error display for save/create operations */}
      {error && selectedScenario && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <ContextualHelpMascot 
        pageId="user-scenarios"
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
      />
    </div>
  );
};

export default UserScenarios;