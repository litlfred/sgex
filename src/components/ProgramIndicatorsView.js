/**
 * Program Indicators View Component
 * 
 * Provides editing and management capabilities for program indicators and population measures
 * using CQL with Population context. This component focuses on indicator calculations,
 * measure definitions, and population-level analytics.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, useDAKParams } from './framework';
import CQLEditor from './CQLEditor';
import cqlValidationService from '../services/cqlValidationService';
import stagingGroundService from '../services/stagingGroundService';
import './ProgramIndicatorsView.css';

const ProgramIndicatorsView = () => {
  return (
    <PageLayout pageName="program-indicators">
      <ProgramIndicatorsViewContent />
    </PageLayout>
  );
};

const ProgramIndicatorsViewContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch: selectedBranch } = useDAKParams();
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cqlFiles, setCqlFiles] = useState([]);
  const [indicatorDefinitions, setIndicatorDefinitions] = useState([]);
  const [selectedCQLFile, setSelectedCQLFile] = useState(null);
  const [dataDictionary, setDataDictionary] = useState(null);
  const [activeSection, setActiveSection] = useState('indicators'); // 'indicators', 'cql', 'measures'

  // Load data on component mount
  useEffect(() => {
    const loadIndicatorData = async () => {
      if (!repository || !selectedBranch) return;

      try {
        setLoading(true);
        
        // Load CQL files (Population context)
        await loadPopulationCQLFiles();
        
        // Load indicator definitions
        await loadIndicatorDefinitions();
        
        // Load data dictionary for validation
        await loadDataDictionary();
        
      } catch (err) {
        console.error('Error loading program indicators data:', err);
        setError('Failed to load program indicators data.');
      } finally {
        setLoading(false);
      }
    };

    const loadPopulationCQLFiles = async () => {
      try {
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;

        // Load CQL files and filter for Population context
        const contents = await githubService.getDirectoryContents(
          owner,
          repoName,
          'input/cql',
          selectedBranch
        );

        const cqlFileList = contents.filter(file => 
          file.name.endsWith('.cql') && file.type === 'file'
        );

        // Load content for each CQL file to determine context
        const populationCQLFiles = await Promise.all(
          cqlFileList.map(async (file) => {
            try {
              const content = await githubService.getFileContent(
                owner,
                repoName,
                file.path,
                selectedBranch
              );
              
              // Only include Population context files
              const contextMatch = content.match(/context\s+(\w+)/i);
              const context = contextMatch ? contextMatch[1] : 'Patient';
              
              if (context === 'Population') {
                return {
                  name: file.name,
                  path: file.path,
                  size: file.size,
                  sha: file.sha,
                  downloadUrl: file.download_url,
                  githubUrl: `https://github.com/${owner}/${repoName}/blob/${selectedBranch}/${file.path}`,
                  content,
                  context
                };
              }
              return null;
            } catch (error) {
              console.warn(`Failed to load content for ${file.name}:`, error);
              return null;
            }
          })
        );

        // Filter out null values and set state
        setCqlFiles(populationCQLFiles.filter(file => file !== null));

      } catch (error) {
        console.warn('No Population context CQL files found:', error);
        setCqlFiles([]);
      }
    };

    const loadIndicatorDefinitions = async () => {
      try {
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;

        // Try to load indicator definitions from various locations
        const indicatorSources = [
          'input/fsh/measures',
          'input/fsh/indicators', 
          'input/resources/measures'
        ];

        const indicators = [];

        for (const sourcePath of indicatorSources) {
          try {
            const contents = await githubService.getDirectoryContents(
              owner,
              repoName,
              sourcePath,
              selectedBranch
            );

            const measureFiles = contents.filter(file => 
              (file.name.endsWith('.fsh') || file.name.endsWith('.json')) && 
              file.type === 'file'
            );

            for (const file of measureFiles) {
              try {
                const content = await githubService.getFileContent(
                  owner,
                  repoName,
                  file.path,
                  selectedBranch
                );

                // Parse measure/indicator definition
                const indicator = parseIndicatorDefinition(file.name, content);
                if (indicator) {
                  indicators.push({
                    ...indicator,
                    file: file.name,
                    path: file.path,
                    githubUrl: `https://github.com/${owner}/${repoName}/blob/${selectedBranch}/${file.path}`
                  });
                }
              } catch (error) {
                console.warn(`Failed to load indicator file ${file.name}:`, error);
              }
            }
          } catch (error) {
            // Directory doesn't exist, continue to next source
            continue;
          }
        }

        setIndicatorDefinitions(indicators);

      } catch (error) {
        console.warn('No indicator definitions found:', error);
        setIndicatorDefinitions([]);
      }
    };

    const loadDataDictionary = async () => {
      try {
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        
        const fshContent = await githubService.getFileContent(
          owner, 
          repoName, 
          'input/fsh/codesystems/DAK.fsh', 
          selectedBranch
        );
        
        const codeSystemData = parseFSHCodeSystem(fshContent);
        setDataDictionary(codeSystemData);
        cqlValidationService.loadDataDictionary(codeSystemData);
        
      } catch (error) {
        console.warn('Data dictionary not found:', error);
        setDataDictionary(null);
      }
    };

    loadIndicatorData();
  }, [repository, selectedBranch]);

  // Helper function to parse indicator definitions
  const parseIndicatorDefinition = (fileName, content) => {
    try {
      // Parse FSH or JSON indicator/measure definitions
      if (fileName.endsWith('.fsh')) {
        return parseFSHIndicator(content);
      } else if (fileName.endsWith('.json')) {
        return parseJSONIndicator(content);
      }
      return null;
    } catch (error) {
      console.warn(`Failed to parse indicator ${fileName}:`, error);
      return null;
    }
  };

  const parseFSHIndicator = (fshContent) => {
    // Basic FSH parser for indicator definitions
    const lines = fshContent.split('\n');
    let indicator = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract title
      const titleMatch = trimmed.match(/^\* title = "([^"]+)"/);
      if (titleMatch) {
        indicator.title = titleMatch[1];
      }
      
      // Extract description
      const descMatch = trimmed.match(/^\* description = "([^"]+)"/);
      if (descMatch) {
        indicator.description = descMatch[1];
      }
      
      // Extract library reference
      const libraryMatch = trimmed.match(/^\* library = "([^"]+)"/);
      if (libraryMatch) {
        indicator.library = libraryMatch[1];
      }
    }
    
    return Object.keys(indicator).length > 0 ? indicator : null;
  };

  const parseJSONIndicator = (jsonContent) => {
    try {
      const measure = JSON.parse(jsonContent);
      return {
        title: measure.title || measure.name,
        description: measure.description,
        library: measure.library?.[0]?.reference,
        status: measure.status,
        type: measure.type?.map(t => t.coding?.[0]?.display).join(', ')
      };
    } catch (error) {
      return null;
    }
  };

  const parseFSHCodeSystem = (fshContent) => {
    // Simplified parser for data dictionary
    const concepts = [];
    const lines = fshContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      const conceptMatch = trimmed.match(/^\* #([^\s]+)\s+"([^"]+)"/);
      if (conceptMatch) {
        concepts.push({
          Code: conceptMatch[1],
          Display: conceptMatch[2]
        });
      }
    }
    
    return { concepts };
  };

  if (loading) {
    return (
      <div className="program-indicators-view loading-state">
        <div className="loading-content">
          <h2>Loading Program Indicators...</h2>
          <p>Fetching indicator definitions and CQL files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-indicators-view error-state">
        <div className="error-content">
          <h2>Error Loading Program Indicators</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              Return to Home
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
    <div className="program-indicators-view">
      <div className="view-content">
        <div className="view-main">
          <div className="view-intro">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2>📊 Program Indicators</h2>
              <div className="artifact-badges">
                <span className="artifact-badge indicators">📈 Indicators</span>
                <span className="dak-component-badge">📊 Population Measures</span>
              </div>
            </div>
            <p>
              Manage program indicators and population-level measures for
              {repository ? ` ${repository.name}` : ' this DAK'}. 
              Create and edit CQL with Population context for calculating program performance metrics.
            </p>
          </div>

          {/* Section Toggle Tabs */}
          <div className="section-tabs">
            <button 
              className={`tab-button ${activeSection === 'indicators' ? 'active' : ''}`}
              onClick={() => setActiveSection('indicators')}
            >
              <span className="tab-icon">📈</span>
              <span className="tab-text">Indicator Definitions</span>
              {indicatorDefinitions.length > 0 && (
                <span className="tab-badge">{indicatorDefinitions.length}</span>
              )}
            </button>
            <button 
              className={`tab-button ${activeSection === 'cql' ? 'active' : ''}`}
              onClick={() => setActiveSection('cql')}
            >
              <span className="tab-icon">📜</span>
              <span className="tab-text">Population CQL</span>
              {cqlFiles.length > 0 && (
                <span className="tab-badge">{cqlFiles.length}</span>
              )}
            </button>
          </div>

          {/* Indicator Definitions Section */}
          {activeSection === 'indicators' && (
            <div className="components-section indicators-section active">
              <div className="section-header">
                <h3 className="section-title">📈 Indicator Definitions</h3>
                <p className="section-description">
                  FHIR Measure resources and indicator definitions for program monitoring
                </p>
              </div>

              <div className="indicators-grid">
                {indicatorDefinitions.map((indicator, index) => (
                  <div key={index} className="indicator-card">
                    <div className="indicator-header">
                      <h4>{indicator.title || indicator.file}</h4>
                      <div className="indicator-meta">
                        <span className="indicator-type">{indicator.type || 'Measure'}</span>
                        <span className="indicator-status">{indicator.status || 'draft'}</span>
                      </div>
                    </div>
                    
                    {indicator.description && (
                      <div className="indicator-description">
                        {indicator.description}
                      </div>
                    )}
                    
                    {indicator.library && (
                      <div className="indicator-library">
                        <strong>Library:</strong> {indicator.library}
                      </div>
                    )}

                    <div className="indicator-actions">
                      <a
                        href={indicator.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn secondary"
                        title="View on GitHub"
                      >
                        🔗 GitHub
                      </a>
                    </div>
                  </div>
                ))}

                {indicatorDefinitions.length === 0 && (
                  <div className="no-indicators">
                    <p>No indicator definitions found.</p>
                    <p>Indicators should be defined in input/fsh/measures/ or input/resources/measures/</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Population CQL Section */}
          {activeSection === 'cql' && (
            <div className="components-section population-cql-section active">
              <div className="section-header">
                <h3 className="section-title">📜 Population CQL Files</h3>
                <p className="section-description">
                  CQL files with Population context for indicator calculations and population measures
                </p>
              </div>

              {/* CQL File Editor or List */}
              {selectedCQLFile ? (
                <div className="cql-editor-container">
                  <div className="cql-editor-header">
                    <button 
                      onClick={() => setSelectedCQLFile(null)}
                      className="back-btn"
                    >
                      ← Back to CQL Files
                    </button>
                    <h4>{selectedCQLFile.name}</h4>
                    <span className="context-badge population">Population Context</span>
                  </div>
                  <CQLEditor
                    file={selectedCQLFile}
                    content={selectedCQLFile.content}
                    repository={repository}
                    branch={selectedBranch}
                    dataDictionary={dataDictionary}
                    onSave={(content, saveType) => {
                      if (saveType === 'staging') {
                        // Save to staging ground
                        stagingGroundService.updateFile(selectedCQLFile.path, content, {
                          tool: 'Population CQL Editor',
                          type: 'cql',
                          context: 'Population'
                        });
                        alert('Population CQL file saved to staging ground');
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="cql-files-grid">
                  <div className="cql-files-list">
                    {cqlFiles.map((file, index) => (
                      <div key={index} className="cql-file-card population-context">
                        <div className="file-header">
                          <h5>{file.name}</h5>
                          <div className="file-meta">
                            <span className="file-size">{Math.round(file.size / 1024)}KB</span>
                            <span className="file-context population">{file.context}</span>
                          </div>
                        </div>
                        
                        <div className="file-preview">
                          <code>{file.content.substring(0, 200)}...</code>
                        </div>

                        <div className="file-actions">
                          <button
                            onClick={() => setSelectedCQLFile(file)}
                            className="action-btn primary"
                            title="Edit Population CQL file"
                          >
                            📝 Edit
                          </button>
                          <a
                            href={file.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn secondary"
                            title="View on GitHub"
                          >
                            🔗 GitHub
                          </a>
                        </div>
                      </div>
                    ))}

                    {cqlFiles.length === 0 && (
                      <div className="no-files">
                        <p>No Population context CQL files found.</p>
                        <p>Create CQL files with "context Population" in the input/cql/ directory for indicator calculations.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="diagram-info">
          <div className="condensed-file-info">
            <div className="condensed-info-item">
              <span className="label">📊</span>
              <span className="value">Program Indicators</span>
            </div>
            <div className="condensed-info-item">
              <span className="label">📁</span>
              <span className="value">{repository?.name || 'Repository'}</span>
            </div>
            <div className="condensed-info-item">
              <span className="label">🌿</span>
              <span className="value">{selectedBranch || 'main'}</span>
            </div>
            <div className="condensed-info-item">
              <span className="label">📈</span>
              <span className="value">{indicatorDefinitions.length} Indicators</span>
            </div>
            <div className="condensed-info-item">
              <span className="label">📜</span>
              <span className="value">{cqlFiles.length} CQL Files</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramIndicatorsView;