import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, usePageParams, FSHFileViewer, FSHFileEditor } from './framework';
import { processLogicalModelsToArchiMate, parseLogicalModel } from '../utils/archiMateExtraction';
import './CoreDataDictionaryViewer.css';

const CoreDataDictionaryViewer = () => {
  return (
    <PageLayout pageName="core-data-dictionary-viewer">
      <CoreDataDictionaryViewerContent />
    </PageLayout>
  );
};

const CoreDataDictionaryViewerContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { params } = usePageParams();
  
  // Get data from URL params or location state (for backward compatibility)
  const { profile, repository, component, selectedBranch } = location.state || {};
  const user = params?.user;
  const repo = params?.repo;
  const branch = params?.branch;
  
  const [fshFiles, setFshFiles] = useState([]);
  const [logicalModelFiles, setLogicalModelFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [branches, setBranches] = useState([]);
  const [hasGhPages, setHasGhPages] = useState(false);
  const [dakFshFile, setDakFshFile] = useState(null);
  const [dakConcepts, setDakConcepts] = useState([]);
  const [dakTableSearch, setDakTableSearch] = useState('');
  const [hasPublishedDak, setHasPublishedDak] = useState(false);
  const [checkingPublishedDak, setCheckingPublishedDak] = useState(false);
  const [activeSection, setActiveSection] = useState('core-data-dictionary'); // 'core-data-dictionary' or 'logical-models'

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

  // Fetch FSH files from input/fsh directory
  useEffect(() => {
    const fetchFshFiles = async () => {
      // Support both URL params and state-based data
      const currentRepository = repository;
      const currentBranch = branch || selectedBranch;
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

        // Try to fetch logical models from input/fsh/models directory
        try {
          const modelsDirContents = await githubService.getDirectoryContents(
            currentUser, 
            currentRepo, 
            'input/fsh/models', 
            currentBranch
          );

          // Filter for .fsh files containing logical models
          const modelsFilesList = modelsDirContents
            .filter(file => file.name.endsWith('.fsh') && file.type === 'file')
            .map(file => ({
              name: file.name,
              path: file.path,
              download_url: file.download_url,
              html_url: file.html_url
            }));

          setLogicalModelFiles(modelsFilesList);
        } catch (err) {
          if (err.status === 404) {
            // input/fsh/models directory doesn't exist
            setLogicalModelFiles([]);
          } else {
            console.warn('Error fetching logical models:', err);
            setLogicalModelFiles([]);
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
  }, [repository, selectedBranch, user, repo, branch, getBaseUrl, parseDakFshConcepts]);

  // Fetch file content for modal display
  const handleViewSource = async (file, mode = 'view') => {
    try {
      setSelectedFile(file);
      setFileContent('Loading...');
      setModalMode(mode);
      setShowModal(true);

      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      const currentBranch = branch || selectedBranch;
      
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

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFileContent('');
  };

  if ((!profile || !repository || !component) && !user && !repo) {
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
    <>
      <div className="component-intro">
        <div className="component-icon" style={{ color: component?.color || '#0078d4' }}>
          {component?.icon || '📊'}
        </div>
        <div className="intro-content">
          <h2>Core Data Dictionary Viewer</h2>
          <p>
            View canonical representations of Component 2 Core Data Dictionary including FHIR CodeSystems, 
            ValueSets, and ConceptMaps stored in FSH format.
          </p>
          {(branch || selectedBranch) && (
            <div className="branch-info">
              <strong>Branch:</strong> <code>{branch || selectedBranch}</code>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Documentation Link */}
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

      {/* Section Toggle */}
      <div className="section-toggle">
        <button 
          className={`toggle-btn ${activeSection === 'core-data-dictionary' ? 'active' : ''}`}
          onClick={() => setActiveSection('core-data-dictionary')}
        >
          📊 Core Data Dictionary
        </button>
        <button 
          className={`toggle-btn ${activeSection === 'logical-models' ? 'active' : ''}`}
          onClick={() => setActiveSection('logical-models')}
        >
          🏗️ Logical Models
        </button>
      </div>

      {/* Main content layout */}
      <div className="viewer-main">
        {activeSection === 'core-data-dictionary' && (
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
                          href={`${getBaseUrl(branch || selectedBranch)}/CodeSystem-DAK.html`}
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
        )}

        {activeSection === 'logical-models' && (
          <div className="logical-models-section">
            <LogicalModelsContent 
              logicalModelFiles={logicalModelFiles}
              user={user || repository?.owner?.login || repository?.full_name.split('/')[0]}
              repo={repo || repository?.name}
              branch={branch || selectedBranch}
              onViewSource={handleViewSource}
            />
          </div>
        )}

        {/* FHIR FSH Files Section - Always visible */}
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

      {/* Source Code Modal */}
      {showModal && selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content fsh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedFile.name}</h3>
              <div className="modal-actions">
                {modalMode === 'view' && (
                  <button 
                    className="mode-switch-btn"
                    onClick={() => setModalMode('edit')}
                    title="Switch to edit mode"
                  >
                    ✏️ Edit
                  </button>
                )}
                {modalMode === 'edit' && (
                  <button 
                    className="mode-switch-btn"
                    onClick={() => setModalMode('view')}
                    title="Switch to view mode"
                  >
                    👁️ View
                  </button>
                )}
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body">
              {modalMode === 'view' ? (
                <FSHFileViewer
                  content={fileContent}
                  fileName={selectedFile.name}
                  showFileName={false}
                />
              ) : (
                <FSHFileEditor
                  content={fileContent}
                  fileName={selectedFile.name}
                  showFileName={false}
                  onChange={(newContent) => setFileContent(newContent)}
                />
              )}
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
    </>
  );
};

/**
 * Logical Models Content Component
 */
const LogicalModelsContent = ({ logicalModelFiles, user, repo, branch, onViewSource }) => {
  const [archiMateLoading, setArchiMateLoading] = useState(false);

  // Handle ArchiMate extraction for all logical models
  const handleExtractAllToArchiMate = async () => {
    if (logicalModelFiles.length === 0) {
      alert('No logical models found to extract.');
      return;
    }

    setArchiMateLoading(true);
    try {
      // Fetch content for all logical model files
      const filesWithContent = await Promise.all(
        logicalModelFiles.map(async (file) => {
          try {
            const content = await githubService.getFileContent(user, repo, file.path, branch);
            return { ...file, content };
          } catch (err) {
            console.warn(`Failed to fetch content for ${file.name}:`, err);
            return { ...file, content: null };
          }
        })
      );

      // Process files and extract ArchiMate
      const result = processLogicalModelsToArchiMate(filesWithContent);

      if (result.error) {
        alert(`ArchiMate extraction failed: ${result.error}`);
      } else {
        // Create and download XML file
        const blob = new Blob([result.xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${repo}-logical-models-archimate.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error extracting ArchiMate:', err);
      alert('Failed to extract ArchiMate. Please check the console for details.');
    } finally {
      setArchiMateLoading(false);
    }
  };

  // Handle individual LM ArchiMate extraction
  const handleExtractSingleToArchiMate = async (file) => {
    try {
      const content = await githubService.getFileContent(user, repo, file.path, branch);
      const logicalModel = parseLogicalModel(content, file.name);
      
      if (!logicalModel.id) {
        alert('No logical model found in this file.');
        return;
      }

      const result = processLogicalModelsToArchiMate([{ ...file, content }]);
      
      if (result.error) {
        alert(`ArchiMate extraction failed: ${result.error}`);
      } else {
        // Create and download XML file
        const blob = new Blob([result.xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${logicalModel.id}-archimate.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error extracting ArchiMate for single LM:', err);
      alert('Failed to extract ArchiMate. Please check the console for details.');
    }
  };

  return (
    <div className="logical-models-content">
      {/* Global Tools for Logical Models */}
      <div className="global-tools-section">
        <h3>Global Tools</h3>
        <p>Tools that operate on all Logical Models in the DAK at once.</p>
        <div className="global-tools-actions">
          <button
            className={`global-tool-btn ${archiMateLoading ? 'loading' : ''}`}
            onClick={handleExtractAllToArchiMate}
            disabled={archiMateLoading || logicalModelFiles.length === 0}
            title={logicalModelFiles.length === 0 ? 'No logical models found' : 'Extract all logical models to ArchiMate DataObjects with relationships'}
          >
            {archiMateLoading ? '⏳ Extracting...' : '🏗️ Extract All to ArchiMate'}
          </button>
          {logicalModelFiles.length > 0 && (
            <span className="tool-info">
              Found {logicalModelFiles.length} logical model{logicalModelFiles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Logical Models Listing */}
      <div className="logical-models-listing">
        <h3>Logical Models</h3>
        <p>FHIR Logical Models stored as FSH files in <code>input/fsh/models/</code></p>
        
        {logicalModelFiles.length === 0 ? (
          <div className="no-models-message">
            <p>No Logical Model files found in <code>input/fsh/models/</code> directory.</p>
            <p>Logical Models should be stored in FSH format in this location.</p>
          </div>
        ) : (
          <div className="logical-models-grid">
            {logicalModelFiles.map((file) => (
              <LogicalModelCard
                key={file.path}
                file={file}
                onView={() => onViewSource(file, 'view')}
                onEdit={() => onViewSource(file, 'edit')}
                onExtractArchiMate={() => handleExtractSingleToArchiMate(file)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Logical Model Card Component
 */
const LogicalModelCard = ({ file, onView, onEdit, onExtractArchiMate }) => {
  return (
    <div className="logical-model-card">
      <div className="file-header">
        <div className="file-icon">🏗️</div>
        <div className="file-name">{file.name}</div>
      </div>
      <div className="file-actions">
        <button 
          className="action-btn primary"
          onClick={onView}
          title="View logical model with syntax highlighting"
        >
          👁️ View
        </button>
        <button 
          className="action-btn secondary"
          onClick={onEdit}
          title="Edit logical model"
        >
          ✏️ Edit
        </button>
        <button 
          className="action-btn archimate"
          onClick={onExtractArchiMate}
          title="Extract to ArchiMate format"
        >
          🏗️ ArchiMate
        </button>
        <a 
          href={file.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn github"
          title="View source on GitHub"
        >
          GitHub ↗
        </a>
      </div>
    </div>
  );
};

export default CoreDataDictionaryViewer;