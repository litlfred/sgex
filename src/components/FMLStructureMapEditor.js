import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout, usePage } from './framework';
import { createLazyArchimateViewer, createLazyMonacoEditor, createLazyBpmnViewer } from '../services/lazyFactoryService';
import { generateArchimateModel, parseLogicalModelForArchimate } from '../services/archimateModelService';
import githubService from '../services/githubService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './FMLStructureMapEditor.css';

const FMLStructureMapEditor = () => {
  return (
    <PageLayout pageName="fml-structuremap-editor">
      <FMLStructureMapEditorContent />
    </PageLayout>
  );
};

const FMLStructureMapEditorContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = usePage();
  const params = useParams();
  
  // Get data from page framework or URL params
  const user = params.user || profile?.login;
  const repo = params.repo || repository?.name;
  const currentBranch = params.branch || branch || repository?.default_branch || 'main';
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('strategic'); // 'strategic' or 'technical'
  const [fshFiles, setFshFiles] = useState([]);
  const [fmlFiles, setFmlFiles] = useState([]);
  const [selectedFMLFile, setSelectedFMLFile] = useState(null);
  const [fmlContent, setFmlContent] = useState('');
  const [logicalModels, setLogicalModels] = useState([]);
  const [archimateModel, setArchimateModel] = useState(null);
  const [dakConcepts, setDakConcepts] = useState([]);
  
  // Component refs
  const archimateViewerRef = useRef(null);
  const mappingViewerRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const archimateContainerRef = useRef(null);
  const mappingContainerRef = useRef(null);
  
  // Load logical models from FSH files (reusing CoreDataDictionaryViewer logic)
  const loadLogicalModels = useCallback(async () => {
    try {
      // Fetch FSH files from input/fsh directory
      const fshFilesList = await githubService.getDirectoryContents(
        user,
        repo,
        'input/fsh',
        currentBranch
      );
      
      setFshFiles(fshFilesList);
      
      // Parse logical models from FSH files
      const models = [];
      for (const file of fshFilesList) {
        if (file.name.endsWith('.fsh')) {
          try {
            const content = await githubService.getFileContent(
              user,
              repo,
              file.path,
              currentBranch
            );
            
            // Check if this FSH file contains logical models
            if (content.includes('Logical:')) {
              const parsedModel = parseLogicalModelForArchimate(content);
              models.push({
                ...parsedModel,
                fileName: file.name,
                path: file.path
              });
            }
          } catch (err) {
            console.warn(`Failed to parse FSH file ${file.name}:`, err);
          }
        }
      }
      
      setLogicalModels(models);
      
      // Load DAK concepts if DAK.fsh exists
      const dakFile = fshFilesList.find(f => f.name === 'DAK.fsh');
      if (dakFile) {
        try {
          const dakContent = await githubService.getFileContent(
            user,
            repo,
            dakFile.path,
            currentBranch
          );
          const concepts = parseDakConcepts(dakContent);
          setDakConcepts(concepts);
        } catch (err) {
          console.warn('Failed to load DAK concepts:', err);
        }
      }
      
      // Generate ArchiMate model
      const archiModel = generateArchimateModel(models, dakConcepts);
      setArchimateModel(archiModel);
      
    } catch (err) {
      console.error('Error loading logical models:', err);
      setError('Failed to load logical models from FSH files');
    }
  }, [user, repo, currentBranch, dakConcepts]);
  
  // Load FML files from input/maps directory
  const loadFMLFiles = useCallback(async () => {
    try {
      // Check if input/maps directory exists
      const mapFiles = await githubService.getDirectoryContents(
        user,
        repo,
        'input/maps',
        currentBranch
      );
      
      const fmlFilesList = mapFiles.filter(file => file.name.endsWith('.fml'));
      setFmlFiles(fmlFilesList);
      
      // Load first FML file by default
      if (fmlFilesList.length > 0) {
        const firstFile = fmlFilesList[0];
        setSelectedFMLFile(firstFile);
        const content = await githubService.getFileContent(
          user,
          repo,
          firstFile.path,
          currentBranch
        );
        setFmlContent(content);
      }
      
    } catch (err) {
      console.warn('No FML files found or error loading:', err);
      // Not an error - may be a new DAK without FML files yet
    }
  }, [user, repo, currentBranch]);
  
  // Parse DAK concepts (reusing logic from CoreDataDictionaryViewer)
  const parseDakConcepts = (content) => {
    const concepts = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const conceptMatch = line.match(/^\*\s*#([^\s"]+)\s*"([^"]+)"\s*"([^"]+)"/);
      if (conceptMatch) {
        concepts.push({
          code: conceptMatch[1],
          display: conceptMatch[2],
          definition: conceptMatch[3]
        });
      }
    }
    
    return concepts;
  };
  
  // Initialize components on mount
  useEffect(() => {
    const initializeEditor = async () => {
      if (!user || !repo) {
        navigate('/');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadLogicalModels(),
          loadFMLFiles()
        ]);
      } catch (err) {
        setError(err.message || 'Failed to initialize FML/StructureMap editor');
      } finally {
        setLoading(false);
      }
    };
    
    initializeEditor();
  }, [user, repo, currentBranch, navigate, loadLogicalModels, loadFMLFiles]);
  
  // Initialize ArchiMate viewer
  useEffect(() => {
    const initArchiMateViewer = async () => {
      if (viewMode === 'strategic' && archimateContainerRef.current && archimateModel && !archimateViewerRef.current) {
        try {
          const ArchiMateViewer = await createLazyArchimateViewer({
            container: archimateContainerRef.current
          });
          archimateViewerRef.current = ArchiMateViewer;
          
          // Load the ArchiMate model
          await ArchiMateViewer.importModel(archimateModel);
          console.log('ArchiMate viewer initialized successfully');
        } catch (err) {
          console.error('Failed to initialize ArchiMate viewer:', err);
          // Fallback: show text-based model info
        }
      }
    };
    
    initArchiMateViewer();
  }, [viewMode, archimateModel]);
  
  // Initialize diagram-js mapping viewer
  useEffect(() => {
    const initMappingViewer = async () => {
      if (viewMode === 'technical' && mappingContainerRef.current && !mappingViewerRef.current) {
        try {
          // Use BPMN viewer as foundation for diagram-js functionality
          const MappingViewer = await createLazyBpmnViewer({
            container: mappingContainerRef.current
          });
          mappingViewerRef.current = MappingViewer;
          
          // Create a basic mapping diagram
          const mappingDiagram = createMappingDiagram(logicalModels);
          await MappingViewer.importXML(mappingDiagram);
          console.log('Mapping viewer initialized successfully');
        } catch (err) {
          console.error('Failed to initialize mapping viewer:', err);
        }
      }
    };
    
    initMappingViewer();
  }, [viewMode, logicalModels]);
  
  // Create a basic BPMN-style diagram for FML mapping visualization
  const createMappingDiagram = (models) => {
    const modelElements = models.map((model, index) => {
      const x = 100 + (index % 3) * 300;
      const y = 100 + Math.floor(index / 3) * 200;
      
      return `
        <bpmn:task id="model_${index}" name="${model.metadata?.title || model.fileName}">
          <bpmn:documentation>Logical Model: ${model.metadata?.description || 'FHIR logical model'}</bpmn:documentation>
        </bpmn:task>
        <bpmndi:BPMNShape id="model_${index}_di" bpmnElement="model_${index}">
          <dc:Bounds x="${x}" y="${y}" width="100" height="80" />
        </bpmndi:BPMNShape>
      `;
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://fml.mapping.example">
  <bpmn:process id="Process_1" isExecutable="false">
    ${modelElements}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      ${modelElements}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  };
  
  // Handle FML file selection
  const handleFMLFileSelect = async (file) => {
    try {
      setSelectedFMLFile(file);
      const content = await githubService.getFileContent(
        user,
        repo,
        file.path,
        currentBranch
      );
      setFmlContent(content);
    } catch (err) {
      console.error('Error loading FML file:', err);
      setError('Failed to load FML file content');
    }
  };
  
  // Handle home navigation
  const handleHomeNavigation = () => {
    if (profile && repository) {
      navigate('/dashboard', { 
        state: { profile, repository, branch: currentBranch } 
      });
    } else {
      navigate('/');
    }
  };
  
  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }
  
  if (loading) {
    return (
      <div className="fml-editor loading-state">
        <div className="loading-content">
          <h2>Loading FML/StructureMap Editor...</h2>
          <p>Initializing logical models and mapping capabilities...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fml-editor">
      {/* Header */}
      <div className="fml-editor-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile?.avatar_url || `https://github.com/${user}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repo}</span>
            <span className="context-component">FML/StructureMap Editor</span>
          </div>
        </div>
      </div>
      
      {/* View Mode Selector */}
      <div className="view-mode-selector">
        <button 
          className={`mode-btn ${viewMode === 'strategic' ? 'active' : ''}`}
          onClick={() => setViewMode('strategic')}
        >
          📊 Strategic View (ArchiMate)
        </button>
        <button 
          className={`mode-btn ${viewMode === 'technical' ? 'active' : ''}`}
          onClick={() => setViewMode('technical')}
        >
          🔧 Technical View (Mapping)
        </button>
      </div>
      
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Main Content */}
      <div className="fml-editor-content">
        {viewMode === 'strategic' ? (
          <div className="strategic-view">
            <div className="strategic-header">
              <h2>Logical Models Strategic Overview</h2>
              <p>ArchiMate Application Layer visualization of FHIR Logical Models and relationships</p>
            </div>
            
            {/* ArchiMate Viewer Container */}
            <div className="archimate-section">
              <div 
                ref={archimateContainerRef}
                className="archimate-viewer-container"
              >
                {/* Fallback content while ArchiMate loads */}
                {archimateModel ? (
                  <div className="archimate-fallback">
                    <h3>Logical Models ({archimateModel.elements.filter(el => el.type === 'ApplicationComponent').length})</h3>
                    <div className="model-grid">
                      {archimateModel.elements
                        .filter(el => el.type === 'ApplicationComponent')
                        .map((element, index) => (
                          <div key={element.id} className="model-card">
                            <h4>{element.name}</h4>
                            <p>{element.description}</p>
                            <div className="model-properties">
                              <span>Source: {element.properties?.fshFile}</span>
                              <span>Elements: {element.properties?.elementCount || 0}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <h3>DAK Concepts ({archimateModel.elements.filter(el => el.type === 'DataObject').length})</h3>
                    <div className="concept-grid">
                      {archimateModel.elements
                        .filter(el => el.type === 'DataObject')
                        .map((element, index) => (
                          <div key={element.id} className="concept-card">
                            <h4>{element.name}</h4>
                            <p>{element.description}</p>
                            <div className="concept-properties">
                              <span>Code: {element.properties?.code}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-models-message">
                    <p>No logical models found in FSH files.</p>
                    <p>Logical models are required for FML mapping visualization.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="technical-view">
            <div className="technical-layout">
              {/* Left Panel: FML Files */}
              <div className="fml-files-panel">
                <h3>FML Files</h3>
                {fmlFiles.length > 0 ? (
                  <div className="fml-file-list">
                    {fmlFiles.map((file, index) => (
                      <div 
                        key={index}
                        className={`fml-file-item ${selectedFMLFile?.path === file.path ? 'selected' : ''}`}
                        onClick={() => handleFMLFileSelect(file)}
                      >
                        <span className="file-name">{file.name}</span>
                        <span className="file-path">{file.path}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-fml-files">
                    <p>No FML files found in input/maps/</p>
                    <p>Create .fml files to define StructureMap transformations</p>
                  </div>
                )}
              </div>
              
              {/* Center Panel: Mapping Visualization */}
              <div className="mapping-panel">
                <h3>Mapping Visualization</h3>
                <div 
                  ref={mappingContainerRef}
                  className="mapping-viewer-container"
                >
                  <div className="mapping-placeholder">
                    <p>Interactive mapping visualization</p>
                    <p>Powered by diagram-js</p>
                  </div>
                </div>
              </div>
              
              {/* Right Panel: FML Code Editor */}
              <div className="fml-code-panel">
                <h3>FML Code Editor</h3>
                <div className="fml-editor-container">
                  {selectedFMLFile ? (
                    <FMLCodeEditor
                      content={fmlContent}
                      fileName={selectedFMLFile.name}
                      onChange={setFmlContent}
                    />
                  ) : (
                    <div className="no-file-selected">
                      <p>Select an FML file to edit</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Help Mascot */}
      <ContextualHelpMascot 
        pageId="fml-structuremap-editor"
        notificationBadge={logicalModels.length === 0 ? "No logical models found" : null}
      />
    </div>
  );
};

// FML Code Editor Component using Monaco
const FMLCodeEditor = ({ content, fileName, onChange }) => {
  const [MonacoEditor, setMonacoEditor] = useState(null);
  
  useEffect(() => {
    const loadMonaco = async () => {
      try {
        const monaco = await createLazyMonacoEditor();
        setMonacoEditor(() => monaco);
      } catch (err) {
        console.error('Failed to load Monaco Editor:', err);
      }
    };
    
    loadMonaco();
  }, []);
  
  if (!MonacoEditor) {
    return (
      <div className="editor-loading">
        <p>Loading FML editor...</p>
      </div>
    );
  }
  
  return (
    <MonacoEditor
      height="400px"
      language="fhir-fml" // Custom language for FML
      theme="vs-light"
      value={content}
      onChange={onChange}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      }}
    />
  );
};

export default FMLStructureMapEditor;