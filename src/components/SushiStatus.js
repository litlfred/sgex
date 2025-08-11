import React, { useState, useEffect, useCallback } from 'react';
import sushiService from '../services/sushiService';
import stagingGroundService from '../services/stagingGroundService';
import './SushiStatus.css';

const SushiStatus = ({ profile, repository, selectedBranch, hasWriteAccess }) => {
  const [expanded, setExpanded] = useState(false);
  const [sushiConfig, setSushiConfig] = useState(null);
  const [configSources, setConfigSources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [validation, setValidation] = useState(null);
  const [pages, setPages] = useState([]);
  const [showSource, setShowSource] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [expandedPages, setExpandedPages] = useState(false);
  const [expandedDependencies, setExpandedDependencies] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);
  
  // SUSHI Runner integration state
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [expandedResources, setExpandedResources] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runnerResults, setRunnerResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  // Enhanced log message rendering with file links
  const renderLogMessage = useCallback((log) => {
    if (!log.message) return '';
    
    // Use the SUSHI service to parse the log message
    const parsedMessage = sushiService.parseLogMessage(log.message, repository, selectedBranch);
    
    if (!parsedMessage.hasLinks) {
      return log.message;
    }
    
    // Render message parts with links
    return (
      <span>
        {parsedMessage.parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else if (part.type === 'link') {
            return renderFileLink(part.content, part.linkInfo, `${log.id}-${index}`);
          }
          return null;
        })}
      </span>
    );
  }, [repository, selectedBranch]);

  // Render file links based on link info
  const renderFileLink = useCallback((fileName, linkInfo, key) => {
    if (linkInfo.type === 'github' && linkInfo.url) {
      return (
        <a 
          key={key}
          href={linkInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="file-link github-link"
          title={linkInfo.title}
          onClick={(e) => e.stopPropagation()} // Prevent log copying when clicking link
        >
          {linkInfo.icon} {fileName}
        </a>
      );
    } else if (linkInfo.type === 'staging') {
      return (
        <span 
          key={key}
          className="file-link staging-link"
          title={linkInfo.title}
        >
          {linkInfo.icon} {fileName}
        </span>
      );
    } else if (linkInfo.type === 'dak') {
      return (
        <span 
          key={key}
          className="file-link dak-link"
          title={linkInfo.title}
        >
          {linkInfo.icon} {fileName}
        </span>
      );
    } else if (linkInfo.type === 'config') {
      return (
        <a 
          key={key}
          href={linkInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="file-link config-link"
          title={linkInfo.title}
          onClick={(e) => e.stopPropagation()}
        >
          {linkInfo.icon} {fileName}
        </a>
      );
    } else {
      return (
        <span 
          key={key}
          className="file-link generic-link"
          title={linkInfo.title}
        >
          {linkInfo.icon} {fileName}
        </span>
      );
    }
  }, []);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;

  // Listen to SUSHI service updates for runner integration
  useEffect(() => {
    const unsubscribe = sushiService.addListener((update) => {
      setLogs(update.logs || []);
      if (update.results) {
        setRunnerResults(update.results);
      }
    });

    return unsubscribe;
  }, []);

  // Load SUSHI configuration function
  const loadSushiConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const configResult = await sushiService.loadSushiConfig(repository, selectedBranch, profile);
      setSushiConfig(configResult.config);
      setConfigSources(configResult);
      setEditingConfig({ ...configResult.config });

      // Validate the config
      const validationResult = sushiService.validateSushiConfig(configResult.config);
      setValidation(validationResult);

      // Load pages with sources
      const pagesWithSources = await sushiService.loadPagesWithSources(
        repository, 
        selectedBranch, 
        profile, 
        configResult.config
      );
      setPages(pagesWithSources);

    } catch (err) {
      console.error('Error loading SUSHI config:', err);
      setError(`Failed to load SUSHI configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [repository, selectedBranch, profile]);

  // Load SUSHI configuration when component becomes expanded
  useEffect(() => {
    if (expanded && !sushiConfig && repository && selectedBranch) {
      loadSushiConfig();
    }
  }, [expanded, repository, selectedBranch, sushiConfig, loadSushiConfig]);

  const handleSushiRunnerClick = async () => {
    if (!repository || !selectedBranch || !profile) {
      alert('Missing required parameters for SUSHI runner');
      return;
    }

    setIsRunning(true);
    setRunnerResults(null);
    setLogs([]);
    setExpandedLogs(true); // Auto-expand logs when running

    try {
      const result = await sushiService.runSUSHI(repository, selectedBranch, profile, {
        logLevel: 'info'
      });
      
      setRunnerResults(result);
      if (result.files && result.files.length > 0) {
        setExpandedResources(true); // Auto-expand resources if files found
      }
    } catch (error) {
      console.error('SUSHI runner error:', error);
      setRunnerResults({
        success: false,
        error: error.message,
        logs: sushiService.getLogs()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditToggle = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit the SUSHI configuration.');
      return;
    }
    
    if (editMode) {
      // Cancel edit
      setEditingConfig({ ...sushiConfig });
      setEditMode(false);
    } else {
      // Start edit
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    try {
      // Validate before saving
      const validationResult = sushiService.validateSushiConfig(editingConfig);
      setValidation(validationResult);

      if (validationResult.errors.length > 0) {
        alert('Please fix validation errors before saving.');
        return;
      }

      // Save to staging ground
      await sushiService.saveSushiConfigToStaging(editingConfig);
      setSushiConfig({ ...editingConfig });
      setConfigSources(prev => ({ ...prev, hasStagingVersion: true, isUsingStaging: true }));
      setEditMode(false);
      
      alert('SUSHI configuration saved to staging ground successfully!');
    } catch (err) {
      console.error('Error saving SUSHI config:', err);
      alert(`Failed to save SUSHI configuration: ${err.message}`);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePublisherChange = (field, value) => {
    setEditingConfig(prev => ({
      ...prev,
      publisher: {
        ...prev.publisher,
        [field]: value
      }
    }));
  };

  const handleDependencyAdd = () => {
    const name = prompt('Enter dependency name (e.g., smart.who.int.base):');
    const version = prompt('Enter version (e.g., 1.0.0):');
    
    if (name && version) {
      setEditingConfig(prev => ({
        ...prev,
        dependencies: {
          ...prev.dependencies,
          [name]: version
        }
      }));
    }
  };

  const handleDependencyRemove = (depName) => {
    if (window.confirm(`Remove dependency ${depName}?`)) {
      setEditingConfig(prev => {
        const newDeps = { ...prev.dependencies };
        delete newDeps[depName];
        return {
          ...prev,
          dependencies: newDeps
        };
      });
    }
  };

  const viewSource = async (sourceType) => {
    try {
      setShowSource(true);
      if (sourceType === 'staging' && configSources.hasStagingVersion) {
        // Get staging version from staging ground service
        const stagingFiles = stagingGroundService.getStagingFiles();
        const stagingFile = stagingFiles.find(file => file.path === 'sushi-config.yaml');
        setSourceContent(stagingFile ? stagingFile.content : 'Staging version not found');
      } else {
        // Get GitHub version
        import('js-yaml').then(yaml => {
          const yamlContent = yaml.dump(sushiConfig, { indent: 2 });
          setSourceContent(yamlContent);
        });
      }
    } catch (err) {
      setSourceContent(`Error loading source: ${err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // SUSHI Runner helper functions
  const copyLogsToClipboard = () => {
    const logText = sushiService.exportLogsAsText();
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy logs:', err);
    });
  };

  const copyLogEntry = (log) => {
    const logText = `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.location ? ` (${log.location})` : ''}`;
    navigator.clipboard.writeText(logText).then(() => {
      // Visual feedback could be added here
    }).catch(err => {
      console.error('Failed to copy log entry:', err);
    });
  };

  const toggleFileExpansion = (fileName) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName);
    } else {
      newExpanded.add(fileName);
    }
    setExpandedFiles(newExpanded);
  };

  // Filter logs based on selected filter and search term
  const filteredLogs = logs.filter(log => {
    const levelMatch = logFilter === 'all' || log.level === logFilter;
    const searchMatch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return levelMatch && searchMatch;
  });

  // Get log level counts for badges
  const logCounts = {
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length
  };

  if (!expanded) {
    return (
      <div className="sushi-status-collapsed" style={{ border: '2px solid red', minHeight: '60px' }}>
        <div className="sushi-status-header" onClick={() => setExpanded(true)}>
          <div className="sushi-status-info">
            <span className="sushi-status-icon">🍣</span>
            <span className="sushi-status-title">SUSHI Status</span>
            <span className="expand-indicator">▶</span>
          </div>
          <div className="sushi-actions">
            <button
              className="sushi-runner-btn"
              onClick={handleSushiRunnerClick}
              disabled={isRunning}
              title="Load & Analyze FSH Files"
            >
              {isRunning ? '🔄 Loading...' : '🏃 Load FSH Files'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sushi-status-expanded">
      <div className="sushi-status-header" onClick={() => setExpanded(false)}>
        <div className="sushi-status-info">
          <span className="sushi-status-icon">🍣</span>
          <span className="sushi-status-title">SUSHI Status</span>
          <span className="expand-indicator">▼</span>
        </div>
        <div className="sushi-actions">
          <button
            className="sushi-runner-btn"
            onClick={handleSushiRunnerClick}
            disabled={isRunning}
            title="Load & Analyze FSH Files"
          >
            {isRunning ? '🔄 Loading...' : '🏃 Load FSH Files'}
          </button>
        </div>
      </div>

      <div className="sushi-status-content">
        {loading && (
          <div className="sushi-loading">
            <p>Loading SUSHI configuration...</p>
          </div>
        )}

        {error && (
          <div className="sushi-error">
            <p>{error}</p>
            <button onClick={loadSushiConfig} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        {sushiConfig && (
          <div className="sushi-config-container">
            {/* Source Indicators */}
            <div className="source-indicators">
              {configSources.hasGithubVersion && (
                <span className="source-badge github">
                  📁 GitHub: sushi-config.yaml
                </span>
              )}
              {configSources.hasStagingVersion && (
                <span className="source-badge staging active">
                  📝 Staging: sushi-config.yaml (override)
                </span>
              )}
            </div>

            {/* Validation Messages */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="validation-messages">
                {validation.errors.map((error, idx) => (
                  <div key={idx} className="validation-error">
                    ❌ {error}
                  </div>
                ))}
                {validation.warnings.map((warning, idx) => (
                  <div key={idx} className="validation-warning">
                    ⚠️ {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Summary Section */}
            <div className="config-summary">
              <h4>Summary</h4>
              <div className="summary-grid">
                <div className="summary-field">
                  <label>ID:</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editingConfig.id || ''}
                      onChange={(e) => handleFieldChange('id', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{sushiConfig.id}</span>
                  )}
                </div>

                <div className="summary-field">
                  <label>FHIR Version:</label>
                  {editMode ? (
                    <select
                      value={editingConfig.fhirVersion || '4.0.1'}
                      onChange={(e) => handleFieldChange('fhirVersion', e.target.value)}
                      className="edit-input"
                    >
                      <option value="4.0.1">4.0.1</option>
                      <option value="4.3.0">4.3.0</option>
                      <option value="5.0.0">5.0.0</option>
                    </select>
                  ) : (
                    <span>{sushiConfig.fhirVersion || '4.0.1'}</span>
                  )}
                </div>

                <div className="summary-field">
                  <label>Name:</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editingConfig.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{sushiConfig.name}</span>
                  )}
                </div>

                <div className="summary-field">
                  <label>Version:</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editingConfig.version || ''}
                      onChange={(e) => handleFieldChange('version', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{sushiConfig.version}</span>
                  )}
                </div>

                <div className="summary-field full-width">
                  <label>Title:</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editingConfig.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{sushiConfig.title}</span>
                  )}
                </div>

                <div className="summary-field full-width">
                  <label>Description:</label>
                  {editMode ? (
                    <textarea
                      value={editingConfig.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="edit-input"
                      rows="3"
                    />
                  ) : (
                    <span>{sushiConfig.description}</span>
                  )}
                </div>
              </div>

              {/* Publisher Section */}
              <div className="publisher-section">
                <h5>Publisher</h5>
                <div className="publisher-fields">
                  <div className="summary-field">
                    <label>Name:</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editingConfig.publisher?.name || ''}
                        onChange={(e) => handlePublisherChange('name', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{sushiConfig.publisher?.name || 'Not specified'}</span>
                    )}
                  </div>

                  <div className="summary-field">
                    <label>URL:</label>
                    {editMode ? (
                      <input
                        type="url"
                        value={editingConfig.publisher?.url || ''}
                        onChange={(e) => handlePublisherChange('url', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>
                        {sushiConfig.publisher?.url ? (
                          <a href={sushiConfig.publisher.url} target="_blank" rel="noopener noreferrer">
                            {sushiConfig.publisher.url}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    )}
                  </div>

                  <div className="summary-field">
                    <label>Email:</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={editingConfig.publisher?.email || ''}
                        onChange={(e) => handlePublisherChange('email', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>
                        {sushiConfig.publisher?.email ? (
                          <a href={`mailto:${sushiConfig.publisher.email}`}>
                            {sushiConfig.publisher.email}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dependencies Section */}
            <div className="dependencies-section">
              <div 
                className="section-toggle"
                onClick={() => setExpandedDependencies(!expandedDependencies)}
              >
                <h4>Dependencies {expandedDependencies ? '▼' : '▶'}</h4>
              </div>
              
              {expandedDependencies && (
                <div className="dependencies-content">
                  {editingConfig.dependencies && Object.keys(editingConfig.dependencies).length > 0 ? (
                    <div className="dependencies-list">
                      {Object.entries(editingConfig.dependencies).map(([name, version]) => (
                        <div key={name} className="dependency-item">
                          <span className="dep-name">{name}</span>
                          <span className="dep-version">{version}</span>
                          {editMode && (
                            <button 
                              onClick={() => handleDependencyRemove(name)}
                              className="remove-dep-btn"
                              title="Remove dependency"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No dependencies defined</p>
                  )}
                  
                  {editMode && (
                    <button onClick={handleDependencyAdd} className="add-dep-btn">
                      ➕ Add Dependency
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pages Section */}
            <div className="pages-section">
              <div 
                className="section-toggle"
                onClick={() => setExpandedPages(!expandedPages)}
              >
                <h4>Pages ({pages.length}) {expandedPages ? '▼' : '▶'}</h4>
              </div>
              
              {expandedPages && (
                <div className="pages-content">
                  {pages.length > 0 ? (
                    <div className="pages-list">
                      {pages.map((page, idx) => (
                        <div key={idx} className="page-item">
                          <div className="page-info">
                            <strong>{page.key}</strong>
                            {page.title && <span className="page-title">: {page.title}</span>}
                          </div>
                          <div className="page-sources">
                            {page.sources.github && (
                              <a 
                                href={page.sources.github.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-link github"
                              >
                                📁 GitHub
                              </a>
                            )}
                            {page.sources.staging && (
                              <span className="source-link staging">
                                📝 Staging
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No pages defined</p>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Section */}
            <div className="advanced-section">
              <div 
                className="section-toggle"
                onClick={() => setExpandedAdvanced(!expandedAdvanced)}
              >
                <h4>Advanced Configuration {expandedAdvanced ? '▼' : '▶'}</h4>
              </div>
              
              {expandedAdvanced && (
                <div className="advanced-content">
                  <p>Additional SUSHI configuration fields can be viewed and edited in the source view.</p>
                  <div className="advanced-fields">
                    <div className="field-info">
                      <label>Canonical URL:</label>
                      <span>{sushiConfig.canonical || 'Not specified'}</span>
                    </div>
                    <div className="field-info">
                      <label>Status:</label>
                      <span>{sushiConfig.status || 'Not specified'}</span>
                    </div>
                    <div className="field-info">
                      <label>Copyright Year:</label>
                      <span>{sushiConfig.copyrightYear || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SUSHI Logs Section */}
            <div className="logs-section">
              <div 
                className="section-toggle"
                onClick={() => setExpandedLogs(!expandedLogs)}
              >
                <h4>SUSHI Processing Logs {expandedLogs ? '▼' : '▶'}</h4>
              </div>
              
              {expandedLogs && (
                <div className="logs-content">
                  <div className="logs-controls">
                    <select 
                      value={logFilter} 
                      onChange={(e) => setLogFilter(e.target.value)}
                      className="log-filter"
                    >
                      <option value="all">All Logs ({logs.length})</option>
                      <option value="error">Errors ({logCounts.error})</option>
                      <option value="warn">Warnings ({logCounts.warn})</option>
                      <option value="info">Info ({logCounts.info})</option>
                      <option value="debug">Debug ({logCounts.debug})</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="log-search"
                    />
                    <button onClick={copyLogsToClipboard} className="copy-logs-button">
                      📋 Copy All
                    </button>
                  </div>

                  <div className="logs-container">
                    {filteredLogs.length === 0 ? (
                      <p className="no-logs">
                        {logs.length === 0 ? 'No logs available. Click "Load FSH Files" to generate logs.' : 'No logs match current filter.'}
                      </p>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <div 
                          key={log.id || index} 
                          className={`log-entry log-${log.level}`}
                          onClick={() => copyLogEntry(log)}
                          title="Click to copy to clipboard"
                        >
                          <span className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`log-level level-${log.level}`}>{log.level.toUpperCase()}</span>
                          <span className="log-message">{renderLogMessage(log)}</span>
                          {log.location && (
                            <span className="log-location">({log.location})</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FHIR Resources Section */}
            <div className="resources-section">
              <div 
                className="section-toggle"
                onClick={() => setExpandedResources(!expandedResources)}
              >
                <h4>Generated FHIR Resources {expandedResources ? '▼' : '▶'}</h4>
              </div>
              
              {expandedResources && (
                <div className="resources-content">
                  {runnerResults && runnerResults.success !== false ? (
                    <>
                      {/* Analysis Results Summary */}
                      {runnerResults && (
                        <div className={`results-summary ${runnerResults.success ? 'success' : 'error'}`}>
                          <h5>Analysis Results</h5>
                          <p>
                            Status: <strong>{runnerResults.success !== false ? 'Success' : 'Failed'}</strong>
                          </p>
                          {runnerResults.files && (
                            <p>FSH Files Processed: {runnerResults.files.length}</p>
                          )}
                          {runnerResults.error && (
                            <p className="error-message">Error: {runnerResults.error}</p>
                          )}
                          {runnerResults.stats && (
                            <div className="compilation-stats">
                              <p>Analysis Statistics:</p>
                              <pre>{JSON.stringify(runnerResults.stats, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Processed Files */}
                      {runnerResults && runnerResults.files && (
                        <div className="processed-files">
                          <h5>Processed FSH Files ({runnerResults.files.length})</h5>
                          <div className="files-list">
                            {runnerResults.files.map((file, index) => (
                              <div key={index} className="file-item">
                                <div 
                                  className="file-header" 
                                  onClick={() => toggleFileExpansion(file.path)}
                                >
                                  <span className="file-path">{file.path}</span>
                                  <span className={`file-source source-${file.source}`}>
                                    {file.source}
                                  </span>
                                  <span className="expand-icon">
                                    {expandedFiles.has(file.path) ? '▼' : '▶'}
                                  </span>
                                </div>
                                {expandedFiles.has(file.path) && (
                                  <div className="file-content">
                                    <pre>{file.content}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Output */}
                      {runnerResults && runnerResults.result && (
                        <div className="fhir-output">
                          <h5>FSH Analysis Results</h5>
                          <div className="fhir-resources">
                            <pre>{JSON.stringify(runnerResults.result, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="no-resources">
                      {runnerResults && runnerResults.error ? 
                        `Error: ${runnerResults.error}` : 
                        'No FHIR resources available. Click "Load FSH Files" to analyze and generate resources.'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="config-actions">
              {editMode ? (
                <>
                  <button onClick={handleSave} className="save-btn">
                    💾 Save to Staging
                  </button>
                  <button onClick={handleEditToggle} className="cancel-btn">
                    ❌ Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditToggle} 
                  className="edit-btn"
                  disabled={!hasWriteAccess}
                  title={hasWriteAccess ? 'Edit configuration' : 'Write permissions required'}
                >
                  ✏️ Edit
                </button>
              )}
              
              <button onClick={() => viewSource('current')} className="view-source-btn">
                👁️ View Source
              </button>
              
              {configSources.hasGithubVersion && (
                <a 
                  href={`https://github.com/${owner}/${repoName}/blob/${selectedBranch}/sushi-config.yaml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-source-btn"
                >
                  🔗 GitHub Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Source View Modal */}
      {showSource && (
        <div className="source-modal-overlay" onClick={() => setShowSource(false)}>
          <div className="source-modal" onClick={(e) => e.stopPropagation()}>
            <div className="source-modal-header">
              <h3>SUSHI Configuration Source</h3>
              <button onClick={() => setShowSource(false)} className="modal-close">❌</button>
            </div>
            <div className="source-modal-content">
              <pre><code>{sourceContent}</code></pre>
            </div>
            <div className="source-modal-actions">
              <button onClick={() => copyToClipboard(sourceContent)} className="copy-btn">
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SushiStatus;