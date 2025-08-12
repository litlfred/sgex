import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, useDAKParams } from './framework';
import FSHFileViewer from './FSHFileViewer';
import FSHFileEditor from './FSHFileEditor';

const CoreDataDictionaryViewer = () => {
  return (
    <PageLayout pageName="core-data-dictionary-viewer">
      <CoreDataDictionaryViewerContent />
    </PageLayout>
  );
};

const CoreDataDictionaryViewerContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = useDAKParams();
  
  // Get data from URL params
  const user = profile?.login;
  const repo = repository?.name;
  
  const [fshFiles, setFshFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [hasGhPages, setHasGhPages] = useState(false);
  const [dakFshFile, setDakFshFile] = useState(null);
  const [dakConcepts, setDakConcepts] = useState([]);
  const [dakTableSearch, setDakTableSearch] = useState('');
  const [hasPublishedDak, setHasPublishedDak] = useState(false);
  const [checkingPublishedDak, setCheckingPublishedDak] = useState(false);
  const [activeSection, setActiveSection] = useState('core-data-dictionary');
  
  // Logical Models state
  const [logicalModels, setLogicalModels] = useState([]);
  const [loadingLogicalModels, setLoadingLogicalModels] = useState(false);
  const [logicalModelsError, setLogicalModelsError] = useState(null);
  
  // FSH Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  // Generate base URL for IG Publisher artifacts
  const getBaseUrl = useCallback((branchName) => {
    const owner = user || repository?.owner?.login || repository?.full_name.split('/')[0];
    const repoName = repo || repository?.name;
    
    if (branchName === (repository?.default_branch || 'main')) {
      return `https://${owner}.github.io/${repoName}`;
    } else {
      return `https://${owner}.github.io/${repoName}/branches/${branchName}`;
    }
  }, [user, repository, repo]);

  // Parse DAK.fsh file to extract concepts
  const parseDakFshConcepts = useCallback((content) => {
    const concepts = [];
    
    // Split by lines and find concept definitions
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for concept definitions: * #code "display" "definition"
      const conceptMatch = line.match(/^\*\s*#([^\s"]+)\s*"([^"]+)"\s*"([^"]+)"/);
      if (conceptMatch) {
        const [, code, display, definition] = conceptMatch;
        concepts.push({
          code: code.trim(),
          display: display.trim(),
          definition: definition.trim()
        });
      }
    }
    
    return concepts;
  }, []);

  // Parse FSH content to extract logical model information
  const parseLogicalModelInfo = useCallback((content, fileName) => {
    const lines = content.split('\n');
    let title = fileName.replace('.fsh', '');
    let description = '';
    
    // Look for Logical model definition and title
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for Logical declaration: Logical: ModelName
      const logicalMatch = line.match(/^Logical:\s*(.+)$/);
      if (logicalMatch) {
        title = logicalMatch[1].trim();
        continue;
      }
      
      // Look for Title: "..."
      const titleMatch = line.match(/^Title:\s*"([^"]+)"/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        continue;
      }
      
      // Look for Description: "..."
      const descMatch = line.match(/^Description:\s*"([^"]+)"/);
      if (descMatch) {
        description = descMatch[1].trim();
        continue;
      }
    }
    
    return {
      title,
      description,
      fileName
    };
  }, []);

  // Fetch logical models from inputs/fsh/models directory
  const fetchLogicalModels = useCallback(async () => {
    const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
    const currentRepo = repo || repository?.name;
    const currentBranch = branch;
    
    if (!currentUser || !currentRepo || !currentBranch) {
      return;
    }

    try {
      setLoadingLogicalModels(true);
      setLogicalModelsError(null);
      
      // Try to fetch the input/fsh/models directory
      const modelsDir = await githubService.getDirectoryContents(
        currentUser, 
        currentRepo, 
        'input/fsh/models', 
        currentBranch
      );

      // Filter for .fsh files
      const fshModelFiles = modelsDir
        .filter(file => file.name.endsWith('.fsh') && file.type === 'file')
        .map(file => ({
          name: file.name,
          path: file.path,
          download_url: file.download_url,
          html_url: file.html_url
        }));

      // Fetch content for each file to extract model information
      const modelsWithInfo = await Promise.all(
        fshModelFiles.map(async (file) => {
          try {
            const content = await githubService.getFileContent(
              currentUser,
              currentRepo,
              file.path,
              currentBranch
            );
            
            const modelInfo = parseLogicalModelInfo(content, file.name);
            
            return {
              ...file,
              ...modelInfo,
              content
            };
          } catch (error) {
            console.warn(`Failed to fetch content for ${file.name}:`, error);
            return {
              ...file,
              title: file.name.replace('.fsh', ''),
              description: 'Failed to load model details',
              content: ''
            };
          }
        })
      );

      setLogicalModels(modelsWithInfo);
    } catch (err) {
      if (err.status === 404) {
        // inputs/fsh/models directory doesn't exist
        setLogicalModels([]);
      } else {
        console.error('Error fetching logical models:', err);
        setLogicalModelsError('Failed to load logical models. Please check repository access.');
      }
    } finally {
      setLoadingLogicalModels(false);
    }
  }, [user, repository, repo, branch, parseLogicalModelInfo]);

  // Fetch FSH files from input/fsh directory
  useEffect(() => {
    const fetchFshFiles = async () => {
      // Support both URL params and state-based data
      const currentRepository = repository;
      const currentBranch = branch;
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      
      if ((!currentRepository && (!currentUser || !currentRepo)) || !currentBranch) {
        setLoading(false);
        return;
      }

      // Check if published DAK CodeSystem exists
      const checkPublishedDakExists = async (baseUrl) => {
        try {
          setCheckingPublishedDak(true);
          const dakUrl = `${baseUrl}/CodeSystem-DAK.html`;
          
          // Use fetch to check if the URL exists (HEAD request would be better but may have CORS issues)
          const response = await fetch(dakUrl, { method: 'HEAD' });
          return response.ok;
        } catch (error) {
          console.warn('Error checking published DAK:', error);
          return false;
        } finally {
          setCheckingPublishedDak(false);
        }
      };

      try {
        setLoading(true);
        setError(null);

        // Try to fetch the input/fsh directory
        try {
          const fshDirContents = await githubService.getDirectoryContents(
            currentUser, 
            currentRepo, 
            'input/fsh', 
            currentBranch
          );

          // Filter for .fsh files
          const fshFilesList = fshDirContents
            .filter(file => file.name.endsWith('.fsh') && file.type === 'file')
            .map(file => ({
              name: file.name,
              path: file.path,
              download_url: file.download_url,
              html_url: file.html_url
            }));

          setFshFiles(fshFilesList);
        } catch (err) {
          if (err.status === 404) {
            // input/fsh directory doesn't exist
            setFshFiles([]);
          } else {
            throw err;
          }
        }

        // Try to fetch the DAK.fsh file specifically from input/fsh/codesystems/
        try {
          const dakFile = await githubService.getDirectoryContents(
            currentUser,
            currentRepo,
            'input/fsh/codesystems',
            currentBranch
          );
          
          // Look for DAK.fsh file
          const dakFsh = dakFile.find(file => file.name === 'DAK.fsh' && file.type === 'file');
          if (dakFsh) {
            setDakFshFile({
              name: dakFsh.name,
              path: dakFsh.path,
              download_url: dakFsh.download_url,
              html_url: dakFsh.html_url
            });

            // Fetch and parse DAK.fsh content for table display
            try {
              const dakContent = await githubService.getFileContent(
                currentUser,
                currentRepo,
                dakFsh.path,
                currentBranch
              );
              const concepts = parseDakFshConcepts(dakContent);
              setDakConcepts(concepts);
            } catch (contentErr) {
              console.warn('Could not parse DAK.fsh content:', contentErr);
              setDakConcepts([]);
            }
          } else {
            setDakFshFile(null);
            setDakConcepts([]);
          }
        } catch (err) {
          if (err.status === 404) {
            // input/fsh/codesystems directory doesn't exist or no DAK.fsh
            setDakFshFile(null);
            setDakConcepts([]);
          } else {
            console.warn('Error fetching DAK.fsh:', err);
            setDakFshFile(null);
            setDakConcepts([]);
          }
        }

        // Fetch branches to check for gh-pages
        const allBranches = await githubService.getBranches(currentUser, currentRepo);
        const branchNames = allBranches.map(b => b.name);
        setBranches(branchNames.filter(name => name !== 'gh-pages'));
        const hasGhPagesVar = branchNames.includes('gh-pages');
        setHasGhPages(hasGhPagesVar);

        // Check if published DAK exists if we have gh-pages
        if (hasGhPagesVar) {
          const baseUrl = getBaseUrl(currentBranch);
          const dakExists = await checkPublishedDakExists(baseUrl);
          setHasPublishedDak(dakExists);
        } else {
          setHasPublishedDak(false);
        }

      } catch (err) {
        console.error('Error fetching FSH files:', err);
        setError('Failed to load Core Data Dictionary files. Please check repository access.');
      } finally {
        setLoading(false);
      }
    };

    fetchFshFiles();
  }, [repository, branch, user, repo, getBaseUrl, parseDakFshConcepts]);

  // Fetch logical models when the Logical Models section is active
  useEffect(() => {
    if (activeSection === 'logical-models') {
      fetchLogicalModels();
    }
  }, [activeSection, fetchLogicalModels]);

  // Fetch file content for modal display
  const handleViewSource = async (file) => {
    try {
      setSelectedFile(file);
      setFileContent('Loading...');
      setShowModal(true);

      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch;
      
      const content = await githubService.getFileContent(
        currentUser,
        currentRepo,
        file.path,
        currentBranch
      );

      setFileContent(content);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setFileContent('Error loading file content.');
    }
  };

  // Handle logical model actions
  const handleViewLogicalModel = (model) => {
    setSelectedFile({
      name: model.name,
      path: model.path,
      html_url: model.html_url
    });
    setFileContent(model.content);
    setShowModal(true);
  };

  const handleEditLogicalModel = (model) => {
    setEditingModel(model);
    setShowEditor(true);
  };

  const handleExtractLogicalModel = (model) => {
    // TODO: Implement ArchiMate extraction for individual model
    alert(`ArchiMate extraction for "${model.title}" will be implemented in Phase 5`);
  };

  const handleExtractAllModels = () => {
    // TODO: Implement bulk ArchiMate extraction
    alert(`Bulk ArchiMate extraction for all ${logicalModels.length} models will be implemented in Phase 5`);
  };

  const handleSaveLogicalModel = (content) => {
    // TODO: Implement save functionality
    console.log('Saving logical model:', editingModel?.name, content);
    alert('Save functionality will be implemented with proper GitHub integration');
    setShowEditor(false);
    setEditingModel(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFileContent('');
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingModel(null);
  };

  if (!profile || !repository) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  if (loading) {
    return (
      <div className="core-data-dictionary-viewer loading-state">
        <div className="loading-content">
          <h2>Loading Core Data Dictionary...</h2>
          <p>Fetching FHIR FSH files and repository data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="core-data-dictionary-viewer">
      <div className="viewer-content">

        <div className="viewer-main">
          <div className="component-intro">
            <div className="component-icon" style={{ color: '#0078d4' }}>
              📊
            </div>
            <div className="intro-content">
              <h2>Core Data Dictionary Viewer</h2>
              <p>
                View canonical representations of Component 2 Core Data Dictionary including FHIR CodeSystems, 
                ValueSets, and ConceptMaps stored in FSH format.
              </p>
              {branch && (
                <div className="branch-info">
                  <strong>Branch:</strong> <code>{branch}</code>
                </div>
              )}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="section-tabs">
            <button 
              className={`tab-button ${activeSection === 'core-data-dictionary' ? 'active' : ''}`}
              onClick={() => setActiveSection('core-data-dictionary')}
            >
              📊 Core Data Dictionary
            </button>
            <button 
              className={`tab-button ${activeSection === 'logical-models' ? 'active' : ''}`}
              onClick={() => setActiveSection('logical-models')}
            >
              🗂️ Logical Models
            </button>
          </div>

          {error && (
            <div className="error-message">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Documentation Link */}
          {activeSection === 'core-data-dictionary' && (
            <div className="core-data-dictionary-section">
              <div className="documentation-section">
                <p>
                  <a 
                    href="https://smart.who.int/ig-starter-kit/v1.0.0/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="documentation-link"
                  >
                    📚 WHO IG Starter Kit Documentation ↗
                  </a>
                </p>
              </div>

          {/* Main content layout with two columns */}
          <div className="two-column-layout">
            {/* Standard Dictionaries Section - Left Column */}
            <div className="section standard-dictionaries-section left-column">
              <h3>Standard Dictionaries</h3>
              
              <div className="subsection">
                <h4>Code Systems</h4>
                
                {/* DAK Source File Links */}
                {dakFshFile && (
                  <div className="dak-source-section">
                    <h5>DAK Source File (FSH)</h5>
                    <div className="dak-source-links">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleViewSource(dakFshFile)}
                        title="View DAK.fsh source code with syntax highlighting"
                      >
                        📄 View Source
                      </button>
                      <a 
                        href={dakFshFile.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn secondary"
                        title="View DAK.fsh source on GitHub"
                      >
                        🔗 GitHub Source ↗
                      </a>
                    </div>
                  </div>
                )}

                {/* Published DAK CodeSystem */}
                {hasGhPages ? (
                  <div className="dak-published-section">
                    <h5>Published CodeSystem</h5>
                    {checkingPublishedDak ? (
                      <p className="checking-published">Checking published version...</p>
                    ) : hasPublishedDak ? (
                      <div className="dictionary-links">
                        <a 
                          href={`${getBaseUrl(branch)}/CodeSystem-DAK.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dictionary-link primary"
                        >
                          📊 View Published Core Data Dictionary (DAK) ↗
                        </a>
                      </div>
                    ) : (
                      <div className="unpublished-dak">
                        <span className="disabled-link">Core Data Dictionary (DAK)</span>
                        <p className="unpublished-note">
                          ⚠️ The published version is not yet available. The CodeSystem-DAK.html file has not been published to GitHub Pages.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-publication-note">
                    Published CodeSystems will be available once GitHub Pages is configured.
                  </p>
                )}
              </div>

              {/* DAK Concepts Table */}
              {dakConcepts.length > 0 && (
                <div className="subsection">
                  <h4>DAK Concepts ({dakConcepts.length} total)</h4>
                  <div className="dak-table-controls">
                    <input
                      type="text"
                      placeholder="Search concepts..."
                      value={dakTableSearch}
                      onChange={(e) => setDakTableSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="dak-concepts-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Display</th>
                          <th>Definition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dakConcepts
                          .filter(concept => 
                            !dakTableSearch || 
                            concept.code.toLowerCase().includes(dakTableSearch.toLowerCase()) ||
                            concept.display.toLowerCase().includes(dakTableSearch.toLowerCase()) ||
                            concept.definition.toLowerCase().includes(dakTableSearch.toLowerCase())
                          )
                          .map((concept, index) => (
                            <tr key={index}>
                              <td className="concept-code">{concept.code}</td>
                              <td className="concept-display">{concept.display}</td>
                              <td className="concept-definition">{concept.definition}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="subsection">
                <h4>Value Sets</h4>
                <div className="placeholder-links">
                  <span className="placeholder-link">Actors (Coming Soon)</span>
                  <span className="placeholder-link">Workflows (Coming Soon)</span>
                  <span className="placeholder-link">Decision Tables (Coming Soon)</span>
                </div>
              </div>
            </div>

            {/* Publications Section - Right Column */}
            {hasGhPages ? (
              <div className="section publications-section right-column">
                <h3>Publications</h3>
                <p>Published FHIR Implementation Guide artifacts generated by the IG Publisher</p>
                
                {branches.sort().map((branchName) => (
                  <div key={branchName} className="branch-publication">
                    <h4>Branch: <code>{branchName}</code></h4>
                    <div className="artifact-links">
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-code-systems`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Code Systems ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-value-sets`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Value Sets ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#structures-logical-models`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Logical Models ↗
                      </a>
                      <a 
                        href={`${getBaseUrl(branchName)}/artifacts.html#terminology-concept-maps`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artifact-link"
                      >
                        Concept Maps ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="section no-publications-section right-column">
                <h3>Publications</h3>
                <div className="no-gh-pages-message">
                  <p>📋 No published artifacts available</p>
                  <p>This repository does not have a <code>gh-pages</code> branch for publishing FHIR Implementation Guide artifacts.</p>
                </div>
              </div>
            )}
          </div>

          {/* FHIR FSH Files Section */}
          <div className="section fsh-files-section">
            <h3>FHIR FSH Source Files</h3>
            <p>FHIR Shorthand (FSH) files containing CodeSystems, ValueSets, and ConceptMaps</p>
            
            {fshFiles.length === 0 ? (
              <div className="no-files-message">
                <p>No FHIR FSH files found in <code>input/fsh/</code> directory.</p>
                <p>Core Data Dictionary files should be stored in FSH format in this location.</p>
              </div>
            ) : (
              <div className="fsh-files-grid">
                {fshFiles.map((file) => (
                  <div key={file.path} className="fsh-file-card">
                    <div className="file-header">
                      <div className="file-icon">📄</div>
                      <div className="file-name">{file.name}</div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleViewSource(file)}
                        title="View source code with syntax highlighting"
                      >
                        View Source
                      </button>
                      <a 
                        href={file.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn secondary"
                        title="View source on GitHub"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Logical Models Section */}
        {activeSection === 'logical-models' && (
          <div className="logical-models-section">
            <div className="global-tools">
              <h3>Global Tools</h3>
              <div className="global-tools-buttons">
                <button 
                  className="action-btn primary" 
                  onClick={handleExtractAllModels}
                  disabled={logicalModels.length === 0}
                  title="Extract all logical models to ArchiMate DataObjects with relationships"
                >
                  📦 Extract All to ArchiMate ({logicalModels.length})
                </button>
                <button 
                  className="action-btn secondary" 
                  onClick={() => fetchLogicalModels()}
                  disabled={loadingLogicalModels}
                  title="Refresh the list of logical models"
                >
                  🔄 {loadingLogicalModels ? 'Refreshing...' : 'Refresh All Models'}
                </button>
              </div>
            </div>

            <div className="logical-models-list">
              <h3>Logical Models</h3>
              <p>FHIR Logical Models stored as StructureDefinitions in FSH format under <code>input/fsh/models/</code></p>
              
              {loadingLogicalModels && (
                <div className="loading-message">
                  <p>🔄 Loading logical models...</p>
                </div>
              )}

              {logicalModelsError && (
                <div className="error-message">
                  <h4>⚠️ Error</h4>
                  <p>{logicalModelsError}</p>
                </div>
              )}

              {!loadingLogicalModels && !logicalModelsError && logicalModels.length === 0 && (
                <div className="no-models-message">
                  <p>📂 No logical models found in <code>input/fsh/models/</code> directory.</p>
                  <p>Logical models should be stored as <code>*.fsh</code> files in this location.</p>
                </div>
              )}

              {!loadingLogicalModels && logicalModels.length > 0 && (
                <div className="logical-models-grid">
                  {logicalModels.map((model) => (
                    <div key={model.path} className="logical-model-card">
                      <div className="model-header">
                        <div className="model-icon">🗂️</div>
                        <div className="model-info">
                          <div className="model-title">{model.title}</div>
                          <div className="model-filename">{model.name}</div>
                        </div>
                      </div>
                      
                      {model.description && (
                        <div className="model-description">
                          {model.description}
                        </div>
                      )}
                      
                      <div className="model-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => handleViewLogicalModel(model)}
                          title="View FSH source with syntax highlighting"
                        >
                          📄 View
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleEditLogicalModel(model)}
                          title="Edit FSH file with syntax highlighting and validation"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="action-btn tertiary"
                          onClick={() => handleExtractLogicalModel(model)}
                          title="Extract to ArchiMate DataObject"
                        >
                          📊 Extract to ArchiMate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* FSH File Viewer Modal */}
      {showModal && selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content fsh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>View FSH File</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <FSHFileViewer 
                content={fileContent}
                fileName={selectedFile.name}
                showLineNumbers={true}
                className="modal-fsh-viewer"
              />
            </div>
            <div className="modal-footer">
              <a 
                href={selectedFile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub ↗
              </a>
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FSH File Editor Modal */}
      {showEditor && editingModel && (
        <div className="modal-overlay" onClick={closeEditor}>
          <div className="modal-content fsh-modal editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Logical Model</h3>
              <button className="modal-close" onClick={closeEditor}>×</button>
            </div>
            <div className="modal-body">
              <FSHFileEditor 
                content={editingModel.content}
                fileName={editingModel.name}
                onSave={handleSaveLogicalModel}
                showPreview={true}
                className="modal-fsh-editor"
              />
            </div>
            <div className="modal-footer">
              <a 
                href={editingModel.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub ↗
              </a>
              <button className="btn-primary" onClick={closeEditor}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreDataDictionaryViewer;