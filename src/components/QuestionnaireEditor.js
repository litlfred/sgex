import React, { useState, useEffect, Component } from 'react';
import { PageLayout, AssetEditorLayout, useDAKParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import './QuestionnaireEditor.css';

// Enhanced Visual Editor Component with LForms integration
const LFormsVisualEditor = ({ questionnaire, onChange, onError }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [lformsInstance, setLformsInstance] = useState(null);
  const [lformsReady, setLformsReady] = useState(false);
  const [lformsContainerId] = useState(`lforms-container-${Date.now()}`);
  
  // LForms integration with proper lazy loading
  useEffect(() => {
    const initializeLForms = async () => {
      try {
        console.log('Loading LForms library...');
        
        // Check if LForms is already loaded globally
        if (window.LForms) {
          console.log('LForms already available globally');
          setLformsInstance(window.LForms);
          setLformsReady(true);
          if (onError) {
            onError(null);
          }
          return;
        }
        
        // Try multiple CDN URLs for LForms
        const cdnUrls = [
          'https://lhcforms.nlm.nih.gov/lhcforms/38.2.0/lforms.min.js',
          'https://lhcforms.nlm.nih.gov/lhcforms/latest/lforms.min.js',
          'https://cdn.jsdelivr.net/npm/lhc-forms@38.2.0/dist/lforms.min.js',
          'https://unpkg.com/lhc-forms@38.2.0/dist/lforms.min.js'
        ];
        
        let loaded = false;
        
        for (const url of cdnUrls) {
          if (loaded) break;
          
          try {
            console.log(`Attempting to load LForms from: ${url}`);
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = url;
              script.onload = () => {
                if (window.LForms) {
                  console.log(`LForms loaded successfully from ${url}`);
                  setLformsInstance(window.LForms);
                  setLformsReady(true);
                  loaded = true;
                  if (onError) {
                    onError(null);
                  }
                  resolve();
                } else {
                  reject(new Error('LForms failed to initialize after script load'));
                }
              };
              script.onerror = () => {
                reject(new Error(`Failed to load LForms from ${url}`));
              };
              // Set timeout for script loading
              setTimeout(() => {
                if (!loaded) {
                  reject(new Error(`Timeout loading LForms from ${url}`));
                }
              }, 10000);
              document.head.appendChild(script);
            });
          } catch (error) {
            console.warn(`Failed to load from ${url}:`, error);
            // Continue to next URL
          }
        }
        
        if (!loaded) {
          throw new Error('All LForms CDN URLs failed to load');
        }
        
      } catch (error) {
        console.error('Failed to load LForms:', error);
        if (onError) {
          onError(`LHC-Forms library could not be loaded. Using fallback editor. Error: ${error.message}`);
        }
        // Still allow fallback editor to function
        setLformsReady(true);
      }
    };
    
    initializeLForms();
  }, [onError]);

  // Initialize LForms questionnaire when ready
  useEffect(() => {
    // Helper function to convert FHIR Questionnaire to LForms format
    const convertFhirToLForms = (fhirQuestionnaire) => {
      return {
        type: "LOINC",
        code: fhirQuestionnaire.id || "questionnaire",
        name: fhirQuestionnaire.title || "Questionnaire",
        items: (fhirQuestionnaire.item || []).map((item, index) => ({
          questionCode: item.linkId || `q${index + 1}`,
          question: item.text || `Question ${index + 1}`,
          dataType: mapFhirTypeToLForms(item.type),
          answerRequired: item.required || false,
          answers: item.answerOption ? item.answerOption.map(opt => ({
            text: opt.valueCoding?.display || opt.valueString || 'Option',
            code: opt.valueCoding?.code || opt.valueString
          })) : undefined
        }))
      };
    };

    // Helper function to convert LForms data back to FHIR
    const convertLFormsToFhir = (lformsData, originalQuestionnaire) => {
      // For now, return the original questionnaire with updated values
      // This is a simplified conversion - in a full implementation, 
      // you would map the LForms response data back to FHIR format
      return {
        ...originalQuestionnaire,
        meta: {
          ...originalQuestionnaire.meta,
          lastUpdated: new Date().toISOString()
        }
      };
    };

    if (lformsInstance && questionnaire && !previewMode) {
      try {
        // Convert FHIR Questionnaire to LForms format
        const lformsQuestionnaire = convertFhirToLForms(questionnaire);
        
        // Initialize LForms in the container
        const container = document.getElementById(lformsContainerId);
        if (container) {
          container.innerHTML = ''; // Clear previous content
          lformsInstance.Util.addFormToPage(lformsQuestionnaire, lformsContainerId);
          
          // Set up change listener
          const form = container.querySelector('form');
          if (form) {
            form.addEventListener('input', () => {
              // Get updated data from LForms
              const formData = lformsInstance.Util.getUserData(form);
              if (formData && onChange) {
                // Convert back to FHIR format
                const updatedQuestionnaire = convertLFormsToFhir(formData, questionnaire);
                onChange(updatedQuestionnaire);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error initializing LForms questionnaire:', error);
        if (onError) {
          onError(`Error displaying questionnaire: ${error.message}`);
        }
      }
    }
  }, [lformsInstance, questionnaire, previewMode, lformsContainerId, onChange, onError]);

  // Helper function to map FHIR types to LForms data types
  const mapFhirTypeToLForms = (fhirType) => {
    const typeMap = {
      'string': 'ST',
      'text': 'TX',
      'boolean': 'BL',
      'decimal': 'REAL',
      'integer': 'INT',
      'date': 'DT',
      'dateTime': 'DTM',
      'choice': 'CWE',
      'open-choice': 'CWE'
    };
    return typeMap[fhirType] || 'ST';
  };
  
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
      {!lformsReady ? (
        <div className="lforms-loading">
          <div className="loading-spinner"></div>
          <p>Loading LHC-Forms visual editor...</p>
        </div>
      ) : (
        <>
          <div className="editor-modes">
            <button 
              className={`mode-toggle ${!previewMode ? 'active' : ''}`}
              onClick={() => setPreviewMode(false)}
            >
              {lformsInstance ? '🎯 LHC-Forms Editor' : '🔧 Build Mode'}
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
              {lformsInstance ? (
                // LHC-Forms integration
                <div className="lhc-forms-container">
                  <div className="lhc-forms-header">
                    <h5>✨ LHC-Forms Visual Editor</h5>
                    <p>Powered by NIH LHC-Forms for professional questionnaire design</p>
                    <div className="lhc-forms-status success">
                      ✅ LHC-Forms library loaded successfully
                    </div>
                  </div>
                  
                  <div 
                    id={lformsContainerId}
                    className="lhc-forms-widget"
                    style={{ minHeight: '400px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}
                  >
                    {/* LForms will render here */}
                    <div className="lforms-placeholder">
                      <p>Initializing LHC-Forms questionnaire editor...</p>
                    </div>
                  </div>
                  
                  <div className="lhc-forms-instructions">
                    <h6>✨ LHC-Forms Features:</h6>
                    <ul>
                      <li>Professional visual questionnaire design interface</li>
                      <li>Real-time FHIR Questionnaire generation</li>
                      <li>Advanced question types and validation</li>
                      <li>Industry-standard questionnaire authoring</li>
                    </ul>
                  </div>
                </div>
              ) : (
                // Fallback editor if LForms fails to load
                <div className="fallback-editor-container">
                  <div className="fallback-editor-header">
                    <h5>🔧 Built-in Questionnaire Editor</h5>
                    <p>Visual questionnaire builder with essential features</p>
                    <div className="lhc-forms-status warning">
                      ⚠️ LHC-Forms library could not be loaded - using fallback editor
                    </div>
                  </div>
                <>
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
                </>
                </div>
              )}
          </div>
        )}
      </>
    )}
  </div>
);
};

const QuestionnaireEditorContent = () => {
  const { repository, branch, isLoading: pageLoading } = useDAKParams();
  
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

  // Check if we have the necessary context data
  const hasRequiredData = repository && branch && !pageLoading;

  // Load LForms library with proper lazy loading
  useEffect(() => {
    const loadLForms = async () => {
      try {
        setLformsError(null);
        console.log('Initializing LForms lazy loading...');
        
        // LForms will be loaded on-demand by the LFormsVisualEditor component
        // This just sets up the initial state
        setLformsLoaded(true);
        console.log('LForms lazy loading initialized successfully');
      } catch (error) {
        console.error('Failed to initialize LForms:', error);
        setLformsError(`Failed to initialize questionnaire editor: ${error.message}`);
        // Still mark as loaded to enable basic functionality
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          loadQuestionnaireContent(questionnaire);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${questionnaire.displayName} questionnaire`}
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
                  <strong>Editor Error:</strong> {lformsError}
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
                      <strong>Note:</strong> Use the visual editor above to build questionnaires interactively or switch to JSON mode for direct editing.
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