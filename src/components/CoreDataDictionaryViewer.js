import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import logicalModelService from '../services/logicalModelService';
import { PageLayout, useDAKParams } from './framework';

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
  const [logicalModels, setLogicalModels] = useState([]);
  const [loadingLogicalModels, setLoadingLogicalModels] = useState(false);

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

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    if (user && repo) {
      // Use URL parameters for navigation
      const dashboardPath = branch ? 
        `/dashboard/${user}/${repo}/${branch}` : 
        `/dashboard/${user}/${repo}`;
      navigate(dashboardPath);
    } else {
      // Fallback to state-based navigation
      navigate('/dashboard', { 
        state: { 
          profile, 
          repository, 
          branch 
        } 
      });
    }
  };

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

  // Separate effect for loading logical models asynchronously
  useEffect(() => {
    const detectLogicalModelsAsync = async () => {
      // Support both URL params and state-based data
      const currentRepository = repository;
      const currentBranch = branch;
      const currentUser = user || repository?.owner?.login || repository?.full_name.split('/')[0];
      const currentRepo = repo || repository?.name;
      
      console.log('🔍 Logical Models Detection - Effect triggered:', {
        loading,
        repository: !!repository,
        branch,
        user,
        repo,
        currentUser,
        currentRepo,
        currentBranch
      });
      
      if ((!currentRepository && (!currentUser || !currentRepo)) || !currentBranch) {
        console.log('❌ Logical Models Detection - Missing required params, skipping:', {
          hasRepository: !!currentRepository,
          hasUser: !!currentUser,
          hasRepo: !!currentRepo,
          hasBranch: !!currentBranch
        });
        return;
      }

      // Only start loading logical models after main loading is complete
      if (loading) {
        console.log('⏳ Logical Models Detection - Main loading still in progress, waiting...');
        return;
      }

      console.log('🚀 Logical Models Detection - Starting detection for:', {
        user: currentUser,
        repo: currentRepo,
        branch: currentBranch
      });

      setLoadingLogicalModels(true);
      try {
        const baseUrl = getBaseUrl(currentBranch);
        console.log('🌐 Logical Models Detection - Base URL:', baseUrl);
        
        const detectedModels = await logicalModelService.detectLogicalModels(
          baseUrl, 
          currentUser, 
          currentRepo, 
          currentBranch
        );
        
        console.log('✅ Logical Models Detection - Completed successfully:', {
          modelsFound: detectedModels.length,
          models: detectedModels.map(m => `${m.id} (${m.title || m.name})`)
        });
        
        setLogicalModels(detectedModels);
      } catch (error) {
        console.warn('❌ Error detecting logical models:', error);
        setLogicalModels([]);
      } finally {
        setLoadingLogicalModels(false);
      }
    };

    detectLogicalModelsAsync();
  }, [loading, repository, branch, user, repo, getBaseUrl]);

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

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFileContent('');
  };

  // Handle creating questionnaire from logical model
  const handleDraftQuestionnaireFromModel = async (logicalModel) => {
    try {
      // Generate questionnaire from logical model
      const questionnaire = logicalModelService.generateQuestionnaireFromLogicalModel(logicalModel, {
        questionnaireId: `questionnaire-${logicalModel.id.toLowerCase()}`,
        title: `Data Collection for ${logicalModel.title || logicalModel.name}`,
        description: `Questionnaire based on ${logicalModel.title || logicalModel.name} logical model for data collection`,
        prefix: 'lm'
      });

      // Navigate to questionnaire editor with pre-populated content
      const questionnaireEditorPath = branch ? 
        `/questionnaire-editor/${user}/${repo}/${branch}` : 
        `/questionnaire-editor/${user}/${repo}`;
      
      navigate(questionnaireEditorPath, {
        state: {
          profile,
          repository,
          branch,
          prePopulatedQuestionnaire: questionnaire,
          sourceLogicalModel: logicalModel
        }
      });
    } catch (error) {
      console.error('Error generating questionnaire from logical model:', error);
      alert('Error generating questionnaire from logical model. Please try again.');
    }
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
      <div className="viewer-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile?.avatar_url || `https://github.com/${user || profile?.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repo || repository?.name}</span>
            <span className="context-component">Core Data Dictionary</span>
          </div>
        </div>
      </div>

      <div className="viewer-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate(`/dak-selection/${profile.login}`, { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToDashboard} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Core Data Dictionary</span>
        </div>

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
                      {(logicalModels.length > 0 || loadingLogicalModels) && (
                        <div className="logical-models-actions">
                          {loadingLogicalModels ? (
                            <span className="loading-indicator">🔍 Fetching Logical Models...</span>
                          ) : (
                            <>
                              <span className="models-count">({logicalModels.length} detected)</span>
                              <div className="models-dropdown">
                                <select 
                                  onChange={(e) => {
                                    const selectedModel = logicalModels.find(m => m.id === e.target.value);
                                    if (selectedModel) {
                                      handleDraftQuestionnaireFromModel(selectedModel);
                                    }
                                  }}
                                  defaultValue=""
                                  className="model-selector"
                                >
                                  <option value="" disabled>Draft Questionnaire from...</option>
                                  {logicalModels.map((model) => (
                                    <option key={model.id} value={model.id}>
                                      {model.title || model.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
      </div>

      {/* Source Code Modal */}
      {showModal && selectedFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedFile.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <pre className="fsh-code">
                <code>{fileContent}</code>
              </pre>
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
      </div>
  );
};

export default CoreDataDictionaryViewer;