import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AssetEditorLayout } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import './QuestionnaireEditor.css';

const QuestionnaireEditor = () => {
  const { user, repo, branch } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get context from location state or URL params - memoized to prevent re-renders
  const profile = location.state?.profile;
  const repository = useMemo(() => 
    location.state?.repository || {
      name: repo,
      owner: { login: user },
      full_name: `${user}/${repo}`
    }, [location.state?.repository, repo, user]
  );
  const selectedBranch = location.state?.selectedBranch || branch || 'main';
  
  // Component state
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [questionnaireContent, setQuestionnaireContent] = useState(null);
  const [originalContent, setOriginalContent] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // LForms integration
  const [lformsLoaded, setLformsLoaded] = useState(false);

  // Load LForms library
  useEffect(() => {
    const loadLForms = async () => {
      try {
        // For now, mark as loaded to enable the interface
        // TODO: Integrate LForms properly once we can test the import
        console.log('LForms integration pending - using basic JSON editor for now');
        setLformsLoaded(true);
      } catch (error) {
        console.error('Failed to load LForms:', error);
        setError('Failed to load questionnaire editor. Please refresh the page.');
      }
    };

    loadLForms();
  }, []);

  // Load questionnaires from repository
  useEffect(() => {
    const loadQuestionnaires = async () => {
      if (!repository || !selectedBranch) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const allQuestionnaires = [];
        
        // Check multiple possible locations for questionnaires
        const paths = [
          { path: 'input/questionnaires', extensions: ['.json'], type: 'JSON' },
          { path: 'input/fsh/questionnaires', extensions: ['.fsh'], type: 'FSH' }
        ];
        
        for (const pathConfig of paths) {
          try {
            const files = await githubService.getDirectoryContents(
              repository.owner.login,
              repository.name,
              pathConfig.path,
              selectedBranch
            );
            
            // Filter for supported file extensions
            const questionnaireFiles = files
              .filter(file => file.type === 'file' && 
                pathConfig.extensions.some(ext => file.name.endsWith(ext)))
              .map(file => {
                const extension = pathConfig.extensions.find(ext => file.name.endsWith(ext));
                return {
                  ...file,
                  displayName: file.name.replace(extension, ''),
                  fullPath: `${pathConfig.path}/${file.name}`,
                  fileType: pathConfig.type,
                  extension: extension
                };
              });
            
            allQuestionnaires.push(...questionnaireFiles);
          } catch (error) {
            // Directory doesn't exist, continue with other paths
            if (error.status !== 404) {
              console.warn(`Error loading from ${pathConfig.path}:`, error);
            }
          }
        }
        
        setQuestionnaires(allQuestionnaires);
      } catch (error) {
        console.error('Error loading questionnaires:', error);
        setError(`Failed to load questionnaires: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaires();
  }, [repository, selectedBranch]);

  // Load questionnaire content
  const loadQuestionnaireContent = async (questionnaire) => {
    try {
      setLoading(true);
      const content = await githubService.getFileContent(
        repository.owner.login,
        repository.name,
        questionnaire.fullPath,
        selectedBranch
      );
      
      let questionnaireData;
      
      if (questionnaire.fileType === 'JSON') {
        // Parse JSON questionnaire
        questionnaireData = JSON.parse(content);
      } else if (questionnaire.fileType === 'FSH') {
        // For FSH files, create a preview object with metadata
        questionnaireData = {
          resourceType: 'Questionnaire',
          fileType: 'FSH',
          title: extractFshTitle(content) || questionnaire.displayName,
          status: extractFshStatus(content) || 'draft',
          name: extractFshName(content) || questionnaire.displayName,
          description: extractFshDescription(content) || 'FHIR Shorthand Questionnaire',
          rawContent: content,
          isReadOnly: true
        };
      }
      
      setQuestionnaireContent(questionnaireData);
      setOriginalContent(content);
      setSelectedQuestionnaire(questionnaire);
      setEditing(true);
      setHasChanges(false);
      
      console.log('Questionnaire loaded:', questionnaireData);
    } catch (error) {
      console.error('Error loading questionnaire content:', error);
      setError(`Failed to load questionnaire: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract metadata from FSH content
  const extractFshTitle = (content) => {
    const titleMatch = content.match(/\*\s*title\s*=\s*"([^"]+)"/);
    return titleMatch ? titleMatch[1] : null;
  };

  const extractFshStatus = (content) => {
    const statusMatch = content.match(/\*\s*status\s*=\s*#(\w+)/);
    return statusMatch ? statusMatch[1] : null;
  };

  const extractFshName = (content) => {
    const nameMatch = content.match(/\*\s*name\s*=\s*"([^"]+)"/);
    return nameMatch ? nameMatch[1] : null;
  };

  const extractFshDescription = (content) => {
    const descMatch = content.match(/\*\s*description\s*=\s*"([^"]+)"/);
    return descMatch ? descMatch[1] : null;
  };

  // Create new questionnaire
  const createNewQuestionnaire = () => {
    const newQuestionnaire = {
      resourceType: 'Questionnaire',
      id: `questionnaire-${Date.now()}`,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString()
      },
      url: `http://example.org/Questionnaire/${Date.now()}`,
      name: 'NewQuestionnaire',
      title: 'New Questionnaire',
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      publisher: 'WHO SMART Guidelines',
      description: 'A new FHIR Questionnaire',
      item: [
        {
          linkId: '1',
          text: 'Sample Question',
          type: 'string',
          required: false
        }
      ]
    };

    setQuestionnaireContent(newQuestionnaire);
    setOriginalContent(JSON.stringify(newQuestionnaire, null, 2));
    setSelectedQuestionnaire({
      name: `${newQuestionnaire.name}.json`,
      displayName: newQuestionnaire.name,
      fullPath: `input/questionnaires/${newQuestionnaire.name}.json`,
      isNew: true
    });
    setEditing(true);
    setHasChanges(true);

    // TODO: Render in LForms when integration is complete
    console.log('New questionnaire created:', newQuestionnaire);
  };

  // Save questionnaire
  const handleSave = async (commitMessage, saveToGitHub = false) => {
    try {
      const content = JSON.stringify(questionnaireContent, null, 2);
      
      if (saveToGitHub) {
        await githubService.updateFile(
          repository.owner.login,
          repository.name,
          selectedQuestionnaire.fullPath,
          content,
          commitMessage,
          selectedQuestionnaire.sha,
          selectedBranch
        );
        setHasChanges(false);
        setOriginalContent(content);
        
        // Refresh questionnaires list
        const files = await githubService.getDirectoryContents(
          repository.owner.login,
          repository.name,
          'input/questionnaires',
          selectedBranch
        );
        
        const questionnaireFiles = files
          .filter(file => file.type === 'file' && file.name.endsWith('.json'))
          .map(file => ({
            ...file,
            displayName: file.name.replace('.json', ''),
            fullPath: `input/questionnaires/${file.name}`
          }));
        
        setQuestionnaires(questionnaireFiles);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      throw error;
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    const navigationState = {
      profile,
      repository,
      selectedBranch
    };
    navigate(`/dashboard/${repository.owner.login}/${repository.name}/${selectedBranch}`, {
      state: navigationState
    });
  };

  if (loading && !editing) {
    return (
      <AssetEditorLayout pageName="questionnaire-editor">
        <div className="questionnaire-editor-loading">
          <h2>Loading Questionnaires...</h2>
          <p>Fetching questionnaire files from repository...</p>
        </div>
      </AssetEditorLayout>
    );
  }

  return (
    <AssetEditorLayout
      pageName="questionnaire-editor"
      file={selectedQuestionnaire}
      repository={repository}
      branch={selectedBranch}
      content={questionnaireContent ? JSON.stringify(questionnaireContent, null, 2) : null}
      originalContent={originalContent}
      hasChanges={hasChanges}
      onSave={handleSave}
      showSaveButtons={editing}
    >
      <div className="questionnaire-editor">
        <div className="questionnaire-header">
          <div className="header-content">
            <div className="breadcrumb">
              <button onClick={handleBackToDashboard} className="back-link">
                ← {repository.name}
              </button>
              <span className="separator">/</span>
              <span>Questionnaire Editor</span>
              {selectedBranch && (
                <>
                  <span className="separator">/</span>
                  <span className="branch">{selectedBranch}</span>
                </>
              )}
            </div>
            <h1>FHIR Questionnaire Editor</h1>
            <p>Manage and edit FHIR Questionnaire assets for your DAK</p>
          </div>
        </div>

        <div className="questionnaire-content">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!editing ? (
            <div className="questionnaire-list">
              <div className="list-header">
                <h2>Questionnaires ({questionnaires.length})</h2>
                <button 
                  onClick={createNewQuestionnaire}
                  className="btn-primary"
                  disabled={!lformsLoaded}
                >
                  + Create New Questionnaire
                </button>
              </div>

              {questionnaires.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Questionnaires Found</h3>
                  <p>This repository doesn't have any FHIR Questionnaire files yet.</p>
                  <p>Questionnaires can be stored as:</p>
                  <ul style={{textAlign: 'left', maxWidth: '400px', margin: '0 auto'}}>
                    <li><code>input/questionnaires/*.json</code> - FHIR JSON format</li>
                    <li><code>input/fsh/questionnaires/*.fsh</code> - FHIR Shorthand format</li>
                  </ul>
                  <button 
                    onClick={createNewQuestionnaire}
                    className="btn-primary"
                    disabled={!lformsLoaded}
                  >
                    Create Your First Questionnaire
                  </button>
                </div>
              ) : (
                <div className="questionnaire-grid">
                  {questionnaires.map((questionnaire) => (
                    <div 
                      key={questionnaire.name}
                      className="questionnaire-card"
                      onClick={() => loadQuestionnaireContent(questionnaire)}
                    >
                      <div className="card-icon">
                        {questionnaire.fileType === 'FSH' ? '📝' : '📋'}
                      </div>
                      <div className="card-content">
                        <h3>{questionnaire.displayName}</h3>
                        <p className="card-type">{questionnaire.fileType} Questionnaire</p>
                        <p className="card-path">{questionnaire.fullPath}</p>
                        <p className="card-size">{(questionnaire.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="questionnaire-editor-container">
              <div className="editor-header">
                <button 
                  onClick={() => setEditing(false)}
                  className="back-to-list"
                >
                  ← Back to List
                </button>
                <h2>{selectedQuestionnaire?.displayName || 'New Questionnaire'}</h2>
                {hasChanges && <span className="changes-indicator">• Unsaved changes</span>}
              </div>

              {!lformsLoaded ? (
                <div className="lforms-loading">
                  <p>Loading questionnaire editor...</p>
                </div>
              ) : (
                <div className="lforms-container">
                  <div className="questionnaire-preview">
                    <h4>Questionnaire Preview</h4>
                    <div className="questionnaire-metadata">
                      <p><strong>Title:</strong> {questionnaireContent?.title || 'Untitled'}</p>
                      <p><strong>Status:</strong> {questionnaireContent?.status || 'draft'}</p>
                      <p><strong>Format:</strong> {questionnaireContent?.fileType || 'JSON'}</p>
                      <p><strong>Date:</strong> {questionnaireContent?.date || 'Not specified'}</p>
                      {questionnaireContent?.fileType !== 'FSH' && (
                        <p><strong>Items:</strong> {questionnaireContent?.item?.length || 0} questions</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="questionnaire-content-editor">
                    <h4>
                      {questionnaireContent?.fileType === 'FSH' ? 'FHIR Shorthand Content' : 'Raw JSON Content'}
                      {questionnaireContent?.isReadOnly && <span className="readonly-badge"> (Read-Only)</span>}
                    </h4>
                    
                    {questionnaireContent?.fileType === 'FSH' ? (
                      <div className="fsh-editor">
                        <textarea
                          value={questionnaireContent?.rawContent || ''}
                          readOnly={true}
                          className="fsh-content"
                          rows={20}
                        />
                        <div className="fsh-notice">
                          <strong>📝 FSH File:</strong> This is a FHIR Shorthand questionnaire. 
                          Direct editing is not supported yet - please edit the .fsh file directly in your repository.
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={JSON.stringify(questionnaireContent, null, 2)}
                        onChange={(e) => {
                          try {
                            const newContent = JSON.parse(e.target.value);
                            setQuestionnaireContent(newContent);
                            setHasChanges(e.target.value !== originalContent);
                          } catch (error) {
                            // Invalid JSON, don't update
                            console.warn('Invalid JSON in editor');
                          }
                        }}
                        className="json-editor"
                        rows={20}
                      />
                    )}
                  </div>
                  
                  <div className="editor-instructions">
                    <h4>Editing Instructions:</h4>
                    {questionnaireContent?.fileType === 'FSH' ? (
                      <ul>
                        <li>This is a FHIR Shorthand (.fsh) questionnaire file</li>
                        <li>FSH files define questionnaires using a domain-specific language</li>
                        <li>To edit this questionnaire, modify the .fsh file directly in your repository</li>
                        <li>FSH files are compiled into JSON during the build process</li>
                        <li>Learn more about FHIR Shorthand at <a href="https://build.fhir.org/ig/HL7/fhir-shorthand/" target="_blank" rel="noopener noreferrer">HL7 FHIR Shorthand</a></li>
                      </ul>
                    ) : (
                      <ul>
                        <li>Edit the JSON structure above to modify the questionnaire</li>
                        <li>The preview shows key questionnaire metadata</li>
                        <li>Changes are automatically detected for saving</li>
                        <li>Click "Save to Staging" to save changes locally</li>
                        <li>Click "Commit to GitHub" to publish changes to the repository</li>
                      </ul>
                    )}
                    <div className="help-tip">
                      <strong>🚧 Note:</strong> LHC-Forms visual editor integration is coming soon for enhanced editing experience
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ContextualHelpMascot 
          pageId="questionnaire-editor"
          contextData={{
            repository: repository.name,
            branch: selectedBranch,
            hasQuestionnaires: questionnaires.length > 0,
            isEditing: editing
          }}
        />
      </div>
    </AssetEditorLayout>
  );
};

export default QuestionnaireEditor;