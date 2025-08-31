import React, { useState, useEffect, Component } from 'react';
import { PageLayout, AssetEditorLayout, useDAKParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import { useLocation } from 'react-router-dom';
import './QuestionnaireEditor.css';

// Enhanced Visual Editor Component with LForms integration
const LFormsVisualEditor = ({ questionnaire, onChange }) => {
  const [previewMode, setPreviewMode] = useState(false);
  
  // LForms integration - using fallback editor for now
  useEffect(() => {
    const initializeLForms = async () => {
      try {
        // Dynamic import commented out until lforms is properly configured
        // const LForms = await import('lforms');
        console.log('LForms initialization skipped - using fallback editor');
      } catch (error) {
        console.log('LForms not available, using fallback editor');
      }
    };
    
    initializeLForms();
  }, []);
  
  const addQuestion = () => {
    const newItem = {
      linkId: `item-${Date.now()}`,
      text: `New Question ${(questionnaire.item?.length || 0) + 1}`,
      type: 'string',
      required: false
    };
    
    const updatedQuestionnaire = {
      ...questionnaire,
      item: [...(questionnaire.item || []), newItem]
    };
    
    onChange(updatedQuestionnaire);
  };

  const removeQuestion = (index) => {
    if (!questionnaire.item) return;
    
    const updatedItems = questionnaire.item.filter((_, i) => i !== index);
    const updatedQuestionnaire = {
      ...questionnaire,
      item: updatedItems
    };
    
    onChange(updatedQuestionnaire);
  };

  const updateQuestion = (index, field, value) => {
    if (!questionnaire.item) return;
    
    const updatedItems = [...questionnaire.item];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    const updatedQuestionnaire = {
      ...questionnaire,
      item: updatedItems
    };
    
    onChange(updatedQuestionnaire);
  };

  const updateMetadata = (field, value) => {
    const updatedQuestionnaire = {
      ...questionnaire,
      [field]: value
    };
    onChange(updatedQuestionnaire);
  };

  return (
    <div className="lforms-visual-editor">
      <div className="editor-modes">
        <button 
          className={`mode-toggle ${!previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode(false)}
        >
          🔧 Build Mode
        </button>
        <button 
          className={`mode-toggle ${previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode(true)}
        >
          👁️ Preview Mode
        </button>
      </div>

      {previewMode ? (
        <div className="lforms-preview">
          <h5>Live Preview</h5>
          <div className="simple-questionnaire-preview">
            <div className="preview-header">
              <h3>{questionnaire.title || 'Untitled Questionnaire'}</h3>
              <p>{questionnaire.description || 'No description provided'}</p>
            </div>
            
            <div className="preview-questions">
              {questionnaire.item?.map((item, index) => (
                <div key={item.linkId} className="preview-question">
                  <label className="preview-question-label">
                    {index + 1}. {item.text}
                    {item.required && <span className="required-asterisk"> *</span>}
                  </label>
                  
                  {item.type === 'string' && (
                    <input type="text" placeholder="Text answer" disabled />
                  )}
                  {item.type === 'text' && (
                    <textarea placeholder="Long text answer" disabled rows={3} />
                  )}
                  {item.type === 'boolean' && (
                    <div className="preview-boolean">
                      <label><input type="radio" disabled /> Yes</label>
                      <label><input type="radio" disabled /> No</label>
                    </div>
                  )}
                  {item.type === 'decimal' && (
                    <input type="number" step="0.01" placeholder="Number" disabled />
                  )}
                  {item.type === 'integer' && (
                    <input type="number" step="1" placeholder="Integer" disabled />
                  )}
                  {item.type === 'date' && (
                    <input type="date" disabled />
                  )}
                  {item.type === 'choice' && (
                    <select disabled>
                      <option>Select an option...</option>
                    </select>
                  )}
                </div>
              )) || <p className="no-questions-preview">No questions added yet.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="lforms-builder">
          <div className="questionnaire-metadata-editor">
            <h5>Questionnaire Details</h5>
            <div className="metadata-grid">
              <div className="field-group">
                <label htmlFor="questionnaire-title">Title:</label>
                <input
                  id="questionnaire-title"
                  type="text"
                  value={questionnaire.title || ''}
                  onChange={(e) => updateMetadata('title', e.target.value)}
                  placeholder="Enter questionnaire title"
                />
              </div>
              <div className="field-group">
                <label htmlFor="questionnaire-name">Name:</label>
                <input
                  id="questionnaire-name"
                  type="text"
                  value={questionnaire.name || ''}
                  onChange={(e) => updateMetadata('name', e.target.value)}
                  placeholder="Enter questionnaire name"
                />
              </div>
              <div className="field-group">
                <label htmlFor="questionnaire-status">Status:</label>
                <select
                  id="questionnaire-status"
                  value={questionnaire.status || 'draft'}
                  onChange={(e) => updateMetadata('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="questionnaire-publisher">Publisher:</label>
                <input
                  id="questionnaire-publisher"
                  type="text"
                  value={questionnaire.publisher || ''}
                  onChange={(e) => updateMetadata('publisher', e.target.value)}
                  placeholder="Enter publisher"
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="questionnaire-description">Description:</label>
              <textarea
                id="questionnaire-description"
                value={questionnaire.description || ''}
                onChange={(e) => updateMetadata('description', e.target.value)}
                placeholder="Enter questionnaire description"
                rows={3}
              />
            </div>
          </div>

          <div className="questions-builder">
            <div className="questions-header">
              <h5>Questions ({questionnaire.item?.length || 0})</h5>
              <button onClick={addQuestion} className="add-question-btn">
                + Add Question
              </button>
            </div>

            {questionnaire.item?.map((item, index) => (
              <div key={item.linkId} className="question-editor">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}</span>
                  <button 
                    onClick={() => removeQuestion(index)} 
                    className="remove-question-btn"
                    title="Remove question"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="question-fields">
                  <div className="field-group">
                    <label htmlFor={`question-text-${index}`}>Question Text:</label>
                    <input
                      id={`question-text-${index}`}
                      type="text"
                      value={item.text || ''}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      placeholder="Enter question text"
                    />
                  </div>
                  
                  <div className="field-group">
                    <label htmlFor={`question-linkid-${index}`}>Link ID:</label>
                    <input
                      id={`question-linkid-${index}`}
                      type="text"
                      value={item.linkId || ''}
                      onChange={(e) => updateQuestion(index, 'linkId', e.target.value)}
                      placeholder="Enter unique ID"
                    />
                  </div>
                  
                  <div className="field-group">
                    <label htmlFor={`question-type-${index}`}>Question Type:</label>
                    <select
                      id={`question-type-${index}`}
                      value={item.type || 'string'}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    >
                      <option value="string">Short Text</option>
                      <option value="text">Long Text</option>
                      <option value="boolean">Yes/No</option>
                      <option value="decimal">Decimal Number</option>
                      <option value="integer">Integer</option>
                      <option value="date">Date</option>
                      <option value="choice">Single Choice</option>
                      <option value="open-choice">Choice with Other</option>
                    </select>
                  </div>
                  
                  <div className="field-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={item.required || false}
                        onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                      />
                      Required
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {(!questionnaire.item || questionnaire.item.length === 0) && (
              <div className="no-questions">
                <p>No questions yet. Click "Add Question" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionnaireEditorContent = () => {
  const { repository, branch, isLoading: pageLoading } = useDAKParams();
  const location = useLocation();
  
  // Component state
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [questionnaireContent, setQuestionnaireContent] = useState(null);
  const [originalContent, setOriginalContent] = useState(null);
  
  // LForms integration state
  const [lformsLoaded, setLformsLoaded] = useState(false);
  const [editMode, setEditMode] = useState('visual'); // 'visual' or 'json'
  const [lformsError, setLformsError] = useState(null);
  
  // Rename functionality
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState(null);

  // Check if we have the necessary context data
  const hasRequiredData = repository && branch && !pageLoading;

  // Handle pre-populated questionnaire from logical model
  useEffect(() => {
    if (location.state?.prePopulatedQuestionnaire) {
      const { prePopulatedQuestionnaire, sourceLogicalModel } = location.state;
      
      console.log('Loading pre-populated questionnaire from logical model:', sourceLogicalModel?.name);
      
      setQuestionnaireContent(prePopulatedQuestionnaire);
      setOriginalContent(JSON.stringify(prePopulatedQuestionnaire, null, 2));
      setSelectedQuestionnaire({
        name: `${prePopulatedQuestionnaire.id}.json`,
        displayName: prePopulatedQuestionnaire.name,
        fullPath: `input/questionnaires/${prePopulatedQuestionnaire.id}.json`,
        fileType: 'JSON',
        isNew: true,
        generatedFromLogicalModel: sourceLogicalModel
      });
      setEditing(true);
      setEditMode('visual'); // Start with visual editor for generated questionnaires
    }
  }, [location.state]);

  // Load LForms library
  useEffect(() => {
    const loadLForms = async () => {
      try {
        setLformsError(null);
        
        // LForms library loading temporarily disabled
        // const LForms = await import('lforms');
        
        // Use built-in editor as fallback for now
        console.log('Using built-in visual editor');
        setLformsLoaded(true);
      } catch (error) {
        console.error('Failed to load LForms:', error);
        setLformsError(`Failed to load questionnaire editor: ${error.message}`);
        // Still mark as loaded to enable basic functionality
        console.log('Using built-in visual editor as fallback');
        setLformsLoaded(true);
      }
    };

    loadLForms();
  }, []);

  // Load questionnaires from repository
  useEffect(() => {
    const loadQuestionnaires = async () => {
      // Don't attempt to load if PageProvider context is not ready
      if (!hasRequiredData) {
        console.log('QuestionnaireEditor: Waiting for PageProvider context...', { 
          repository: !!repository, 
          branch: !!branch, 
          pageLoading 
        });
        return;
      }
      
      try {
        console.log('QuestionnaireEditor: Loading questionnaires for', repository.name, 'branch', branch);
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
              branch
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
  }, [hasRequiredData, repository, branch, pageLoading]); // Include pageLoading since it's used in the effect

  // Early return if PageProvider context is not ready
  if (!repository || !branch) {
    return (
      <div className="questionnaire-editor-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Questionnaire Editor...</p>
      </div>
    );
  }

  // Load questionnaire content
  const loadQuestionnaireContent = async (questionnaire) => {
    try {
      setLoading(true);
      const content = await githubService.getFileContent(
        repository.owner.login,
        repository.name,
        questionnaire.fullPath,
        branch
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
    // Support various FSH title patterns
    const patterns = [
      /\*\s*title\s*=\s*"([^"]+)"/,  // * title = "Title"
      /^\s*Title:\s*"?([^"\n]+)"?/m,  // Title: "Title" or Title: Title
      /Instance:\s*\w+\s*"([^"]+)"/   // Instance: Name "Title"
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractFshStatus = (content) => {
    // Support various FSH status patterns
    const patterns = [
      /\*\s*status\s*=\s*#(\w+)/,     // * status = #draft
      /^\s*Status:\s*#?(\w+)/m        // Status: draft or Status: #draft
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractFshName = (content) => {
    // Support various FSH name patterns
    const patterns = [
      /\*\s*name\s*=\s*"([^"]+)"/,     // * name = "Name"
      /^\s*Name:\s*"?([^"\n]+)"?/m,    // Name: "Name" or Name: Name
      /Instance:\s*(\w+)/              // Instance: InstanceName
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractFshDescription = (content) => {
    // Support various FSH description patterns
    const patterns = [
      /\*\s*description\s*=\s*"([^"]+)"/,    // * description = "Description"
      /^\s*Description:\s*"?([^"\n]+)"?/m,   // Description: "Text" or Description: Text
      /\/\/\s*(.+)/                          // // Comment line
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
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
      fileType: 'JSON',
      isNew: true
    });
    setEditing(true);
    setEditMode('visual'); // Start with visual editor for new questionnaires

    console.log('New questionnaire created:', newQuestionnaire);
  };

  // Handle save operation (called by AssetEditorLayout)
  const handleSave = (content, saveType) => {
    console.log(`Questionnaire saved to ${saveType}`);
    
    if (saveType === 'github') {
      // Refresh questionnaires list after GitHub save
      const loadQuestionnaires = async () => {
        try {
          const allQuestionnaires = [];
          
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
                branch
              );
              
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
              if (error.status !== 404) {
                console.warn(`Error loading from ${pathConfig.path}:`, error);
              }
            }
          }
          
          setQuestionnaires(allQuestionnaires);
        } catch (error) {
          console.error('Error refreshing questionnaires:', error);
        }
      };
      
      loadQuestionnaires();
    }
  };

  // Check if there are changes in the questionnaire
  const hasChanges = questionnaireContent && originalContent &&
    JSON.stringify(questionnaireContent, null, 2) !== originalContent;

  // Handle starting rename process
  const handleStartRename = () => {
    if (!selectedQuestionnaire) return;
    
    setIsRenaming(true);
    setNewName(selectedQuestionnaire.displayName);
    setRenameError(null);
  };

  // Handle canceling rename
  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewName('');
    setRenameError(null);
  };

  // Handle confirming rename
  const handleConfirmRename = async () => {
    if (!selectedQuestionnaire || !newName.trim()) {
      setRenameError('Please enter a valid name');
      return;
    }

    try {
      setRenameError(null);
      
      // Determine file extension
      const fileExtension = selectedQuestionnaire.fileType === 'FSH' ? '.fsh' : '.json';
      const directory = selectedQuestionnaire.fileType === 'FSH' ? 'input/fsh/questionnaires' : 'input/questionnaires';
      
      // Create new file path
      const newFileName = `${newName.trim()}${fileExtension}`;
      const newFilePath = `${directory}/${newFileName}`;
      const oldFilePath = selectedQuestionnaire.fullPath;

      // Check if file is in staging ground
      if (selectedQuestionnaire.isNew) {
        // Rename in staging ground
        await stagingGroundService.renameFile(oldFilePath, newFilePath);
        
        // Update local state
        const updatedQuestionnaire = {
          ...selectedQuestionnaire,
          name: newFileName,
          displayName: newName.trim(),
          fullPath: newFilePath
        };
        
        setSelectedQuestionnaire(updatedQuestionnaire);
        
        // Update questionnaire content metadata
        if (questionnaireContent && questionnaireContent.resourceType === 'Questionnaire') {
          const updatedContent = {
            ...questionnaireContent,
            name: newName.trim().replace(/[^a-zA-Z0-9]/g, '_'),
            title: newName.trim()
          };
          setQuestionnaireContent(updatedContent);
        }
        
        console.log(`Questionnaire renamed from ${selectedQuestionnaire.displayName} to ${newName.trim()}`);
      } else {
        // For existing files, we'd need to implement Git operations
        setRenameError('Renaming existing questionnaires is not yet supported');
        return;
      }
      
      setIsRenaming(false);
      setNewName('');
      
    } catch (error) {
      console.error('Error renaming questionnaire:', error);
      setRenameError(`Failed to rename questionnaire: ${error.message}`);
    }
  };

  // Show loading state when PageProvider is not ready
  if (!hasRequiredData) {
    return (
      <AssetEditorLayout pageName="questionnaire-editor">
        <div className="questionnaire-editor-loading">
          <h2>Initializing Questionnaire Editor...</h2>
          <p>Loading repository context...</p>
        </div>
      </AssetEditorLayout>
    );
  }

  // Show loading state when fetching questionnaires
  if (loading && !editing) {
    return (
      <AssetEditorLayout 
        pageName="questionnaire-editor"
        repository={repository}
        branch={branch}
      >
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
      branch={branch}
      content={questionnaireContent ? JSON.stringify(questionnaireContent, null, 2) : null}
      originalContent={originalContent}
      hasChanges={hasChanges}
      onSave={handleSave}
      showSaveButtons={editing}
    >
      <div className="questionnaire-editor">
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
                
                {/* Questionnaire Name/Title with Rename Functionality */}
                <div className="questionnaire-header-title">
                  {isRenaming ? (
                    <div className="rename-section">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="rename-input"
                        placeholder="Enter new name"
                        autoFocus
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleConfirmRename();
                          } else if (e.key === 'Escape') {
                            handleCancelRename();
                          }
                        }}
                      />
                      <div className="rename-actions">
                        <button 
                          className="rename-confirm-btn"
                          onClick={handleConfirmRename}
                          disabled={!newName.trim()}
                        >
                          ✓ Save
                        </button>
                        <button 
                          className="rename-cancel-btn"
                          onClick={handleCancelRename}
                        >
                          ✗ Cancel
                        </button>
                      </div>
                      {renameError && (
                        <div className="rename-error">
                          {renameError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="title-with-rename">
                      <h2>{selectedQuestionnaire?.displayName || 'New Questionnaire'}</h2>
                      {selectedQuestionnaire?.isNew && (
                        <button 
                          className="rename-btn"
                          onClick={handleStartRename}
                          title="Rename questionnaire"
                        >
                          ✏️ Rename
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Logical Model Generation Notice */}
                {selectedQuestionnaire?.generatedFromLogicalModel && (
                  <div className="generation-notice">
                    <div className="notice-content">
                      <strong>✨ Generated from Logical Model:</strong> {selectedQuestionnaire.generatedFromLogicalModel.title || selectedQuestionnaire.generatedFromLogicalModel.name}
                      <p className="notice-description">
                        This questionnaire was automatically generated from the logical model. 
                        You can customize the questions, add validation rules, and modify the structure as needed.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Mode toggle for JSON questionnaires */}
                {questionnaireContent?.fileType !== 'FSH' && (
                  <div className="edit-mode-toggle">
                    <button 
                      className={`mode-btn ${editMode === 'visual' ? 'active' : ''}`}
                      onClick={() => setEditMode('visual')}
                    >
                      📝 Visual Editor
                    </button>
                    <button 
                      className={`mode-btn ${editMode === 'json' ? 'active' : ''}`}
                      onClick={() => setEditMode('json')}
                    >
                      {} JSON Editor
                    </button>
                  </div>
                )}
              </div>

              {lformsError && (
                <div className="error-message">
                  <strong>LForms Error:</strong> {lformsError}
                </div>
              )}

              {!lformsLoaded ? (
                <div className="lforms-loading">
                  <p>Loading questionnaire editor...</p>
                </div>
              ) : (
                <div className="lforms-container">
                  {/* Preview Section */}
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
                  
                  {/* Editor Section */}
                  {questionnaireContent?.fileType === 'FSH' ? (
                    // FSH files - read-only mode
                    <div className="questionnaire-content-editor">
                      <h4>
                        FHIR Shorthand Content
                        <span className="readonly-badge"> (Read-Only)</span>
                      </h4>
                      
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
                    </div>
                  ) : editMode === 'visual' ? (
                    // Visual editor
                    <div className="visual-editor-section">
                      <h4>Visual Questionnaire Builder</h4>
                      <div className="lforms-visual-editor">
                        <LFormsVisualEditor 
                          questionnaire={questionnaireContent}
                          onChange={(updatedQuestionnaire) => {
                            setQuestionnaireContent(updatedQuestionnaire);
                          }}
                          onError={setLformsError}
                        />
                      </div>
                    </div>
                  ) : (
                    // JSON editor mode
                    <div className="questionnaire-content-editor">
                      <h4>Raw JSON Content</h4>
                      <textarea
                        value={JSON.stringify(questionnaireContent, null, 2)}
                        onChange={(e) => {
                          try {
                            const newContent = JSON.parse(e.target.value);
                            setQuestionnaireContent(newContent);
                          } catch (error) {
                            // Invalid JSON, don't update
                            console.warn('Invalid JSON in editor');
                          }
                        }}
                        className="json-editor"
                        rows={20}
                      />
                    </div>
                  )}
                  
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
                    ) : editMode === 'visual' ? (
                      <ul>
                        <li>Use the visual editor above to build your questionnaire interactively</li>
                        <li>Add, remove, and modify questions using the form builder interface</li>
                        <li>Preview your questionnaire as users will see it</li>
                        <li>Switch to JSON mode to see the raw FHIR Questionnaire structure</li>
                        <li>Changes are automatically saved as you work</li>
                      </ul>
                    ) : (
                      <ul>
                        <li>Edit the JSON structure above to modify the questionnaire</li>
                        <li>The preview shows key questionnaire metadata</li>
                        <li>Changes are automatically detected for saving</li>
                        <li>Switch to Visual mode for an easier editing experience</li>
                        <li>Click "Save to Staging" to save changes locally</li>
                      </ul>
                    )}
                    <div className="help-tip">
                      <strong>✨ New:</strong> Visual questionnaire editor is now available using LHC-Forms!
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
            branch: branch,
            hasQuestionnaires: questionnaires.length > 0,
            isEditing: editing
          }}
        />
      </div>
    </AssetEditorLayout>
  );
};

// Error Boundary for QuestionnaireEditor
class QuestionnaireErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QuestionnaireEditor caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AssetEditorLayout pageName="questionnaire-editor">
          <div className="error-state">
            <h2>⚠️ Questionnaire Editor Error</h2>
            <p>An unexpected error occurred while loading the questionnaire editor.</p>
            <div className="error-details">
              <strong>Error:</strong> {this.state.error}
            </div>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary"
            >
              Reload Editor
            </button>
          </div>
        </AssetEditorLayout>
      );
    }

    return this.props.children;
  }
}

const QuestionnaireEditor = () => {
  return (
    <PageLayout pageName="questionnaire-editor">
      <QuestionnaireErrorBoundary>
        <QuestionnaireEditorContent />
      </QuestionnaireErrorBoundary>
    </PageLayout>
  );
};

export default QuestionnaireEditor;