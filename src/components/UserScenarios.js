import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
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

  // Load user scenario files from GitHub and staging ground
  const loadScenarioFiles = useCallback(async () => {
    if (!user || !repo || !branch) return;

    try {
      setLoading(true);
      setError(null);

      // Get files from input/pagecontent directory in GitHub
      const pageContentPath = 'input/pagecontent';
      const files = await githubService.getDirectoryContents(user, repo, pageContentPath, branch);
      
      // Filter for userscenario-*.md files from GitHub
      const githubScenarios = files
        .filter(file => 
          file.type === 'file' && 
          file.name.startsWith('userscenario-') && 
          file.name.endsWith('.md')
        )
        .map(file => ({
          ...file,
          id: file.name.replace('userscenario-', '').replace('.md', ''),
          title: file.name.replace('userscenario-', '').replace('.md', '').replace(/-/g, ' '),
          source: 'github'
        }));

      // Get files from staging ground
      const stagingGround = stagingGroundService.getStagingGround();
      const stagedScenarios = stagingGround.files
        .filter(file => 
          file.path.startsWith('input/pagecontent/userscenario-') && 
          file.path.endsWith('.md')
        )
        .map(file => {
          const fileName = file.path.split('/').pop();
          return {
            path: file.path,
            name: fileName,
            id: fileName.replace('userscenario-', '').replace('.md', ''),
            title: file.metadata?.scenarioTitle || fileName.replace('userscenario-', '').replace('.md', '').replace(/-/g, ' '),
            source: 'staging',
            isNew: file.metadata?.isNew || false,
            lastModified: file.metadata?.lastModified
          };
        });

      // Merge GitHub and staged files, giving priority to staged versions
      const allScenarios = [...githubScenarios];
      
      stagedScenarios.forEach(staged => {
        const existingIndex = allScenarios.findIndex(s => s.path === staged.path);
        if (existingIndex >= 0) {
          // Replace with staged version (has unsaved changes)
          allScenarios[existingIndex] = { ...allScenarios[existingIndex], ...staged, hasChanges: true };
        } else {
          // New file in staging ground
          allScenarios.push(staged);
        }
      });

      setScenarioFiles(allScenarios);
    } catch (err) {
      console.error('Error loading scenario files:', err);
      setError(`Failed to load user scenarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, repo, branch]);

  // Load content of a specific scenario file from staging ground or GitHub
  const loadScenarioContent = useCallback(async (scenarioFile) => {
    if (!scenarioFile) return;

    try {
      setLoading(true);
      let content;
      
      // Check staging ground first
      if (scenarioFile.source === 'staging' || scenarioFile.hasChanges) {
        const stagingGround = stagingGroundService.getStagingGround();
        const stagedFile = stagingGround.files.find(f => f.path === scenarioFile.path);
        if (stagedFile) {
          content = stagedFile.content;
        }
      }
      
      // Fall back to GitHub if not in staging ground
      if (!content && user && repo && branch) {
        content = await githubService.getFileContent(user, repo, scenarioFile.path, branch);
      }
      
      if (content) {
        setScenarioContent(content);
        setSelectedScenario(scenarioFile);
      } else {
        throw new Error('Could not load scenario content');
      }
    } catch (err) {
      console.error('Error loading scenario content:', err);
      setError(`Failed to load scenario: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, repo, branch]);

  // Save scenario content to staging ground (not directly to GitHub)
  const saveScenarioContent = useCallback(async () => {
    if (!selectedScenario) return;

    try {
      setSaving(true);
      
      // Save to staging ground (local storage), not directly to GitHub
      const success = stagingGroundService.updateFile(selectedScenario.path, scenarioContent, {
        componentType: 'user-scenario',
        scenarioId: selectedScenario.id,
        lastModified: Date.now()
      });
      
      if (success) {
        // Update local state to reflect saved content
        setIsEditMode(false);
        setError(null);
        // Show success message
        console.log('Scenario saved to staging ground. Use Publications → Staging Ground to commit to GitHub.');
      } else {
        throw new Error('Failed to save to staging ground');
      }
      
    } catch (err) {
      console.error('Error saving scenario:', err);
      setError(`Failed to save scenario: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [selectedScenario, scenarioContent]);

  // Create new scenario in staging ground (not directly in GitHub)
  const createNewScenario = useCallback(async () => {
    if (!newScenarioId || !newScenarioTitle) return;

    try {
      setSaving(true);
      
      // Validate the ID
      if (!validateScenarioId(newScenarioId)) {
        setError('Scenario ID must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens.');
        setSaving(false);
        return;
      }

      // Check if file already exists in staging ground
      const fileName = `userscenario-${newScenarioId}.md`;
      const filePath = `input/pagecontent/${fileName}`;
      
      const stagingGround = stagingGroundService.getStagingGround();
      const existsInStaging = stagingGround.files.some(f => f.path === filePath);
      
      if (existsInStaging) {
        setError('A scenario with this ID already exists in staging ground. Please choose a different ID.');
        setSaving(false);
        return;
      }
      
      // Also check if it exists in GitHub
      if (user && repo && branch) {
        try {
          await githubService.getFileContent(user, repo, filePath, branch);
          setError('A scenario with this ID already exists in the repository. Please choose a different ID.');
          setSaving(false);
          return;
        } catch (err) {
          // File doesn't exist in GitHub, which is what we want
        }
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

      // Save to staging ground (local storage), not directly to GitHub
      const success = stagingGroundService.updateFile(filePath, initialContent, {
        componentType: 'user-scenario',
        scenarioId: newScenarioId,
        scenarioTitle: newScenarioTitle,
        isNew: true,
        createdAt: Date.now()
      });
      
      if (success) {
        // Refresh the file list
        await loadScenarioFiles();
        
        // Clear the modal
        setShowNewScenarioModal(false);
        setNewScenarioId('');
        setNewScenarioTitle('');
        setError(null);
        
        // Show success message
        console.log('New scenario created in staging ground. Use Publications → Staging Ground to commit to GitHub.');
      } else {
        throw new Error('Failed to save to staging ground');
      }
      
    } catch (err) {
      console.error('Error creating scenario:', err);
      setError(`Failed to create scenario: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [newScenarioId, newScenarioTitle, user, repo, branch, loadScenarioFiles]);

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