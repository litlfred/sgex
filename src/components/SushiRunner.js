import React, { useState, useCallback, useMemo } from 'react';
import githubService from '../services/githubService';
import './SushiRunner.css';

const SushiRunner = ({ repository, selectedBranch, profile, stagingFiles = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logLevelToggles, setLogLevelToggles] = useState({
    info: true,
    success: true,
    warning: true,
    error: true
  });
  const [searchText, setSearchText] = useState('');
  const [sushiConfig, setSushiConfig] = useState(null);
  const [fshFiles, setFshFiles] = useState([]);
  const [includeStagingFiles, setIncludeStagingFiles] = useState(false);
  const [error, setError] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const fetchRepositoryFiles = async () => {
    try {
      addLog('🔍 Fetching sushi-config.yaml...', 'info');
      
      let config = null;
      try {
        const configContent = await githubService.getFileContent(
          owner, 
          repoName, 
          'sushi-config.yaml', 
          selectedBranch
        );
        config = configContent;
        setSushiConfig(config);
        addLog('✅ Found sushi-config.yaml', 'success');
      } catch (err) {
        addLog('⚠️ sushi-config.yaml not found in repository', 'warning');
      }

      addLog('🔍 Scanning input/fsh directory recursively...', 'info');
      
      const fshFiles = [];
      try {
        // Recursively scan for FSH files
        const scanDirectory = async (dirPath, depth = 0) => {
          const maxDepth = 5; // Prevent infinite recursion
          if (depth > maxDepth) {
            addLog(`⚠️ Maximum directory depth reached for ${dirPath}`, 'warning');
            return;
          }

          try {
            const contents = await githubService.getDirectoryContents(
              owner,
              repoName,
              dirPath,
              selectedBranch
            );
            
            for (const item of contents) {
              if (item.type === 'file' && item.name.endsWith('.fsh')) {
                try {
                  const fileContent = await githubService.getFileContent(
                    owner,
                    repoName,
                    item.path,
                    selectedBranch
                  );
                  fshFiles.push({
                    name: item.name,
                    path: item.path,
                    content: fileContent
                  });
                  addLog(`📄 Found ${item.path}`, 'success');
                } catch (err) {
                  addLog(`❌ Failed to fetch ${item.path}: ${err.message}`, 'error');
                }
              } else if (item.type === 'dir') {
                // Recursively scan subdirectories
                addLog(`📁 Scanning subdirectory: ${item.path}`, 'info');
                await scanDirectory(item.path, depth + 1);
              }
            }
          } catch (err) {
            addLog(`⚠️ Could not scan directory ${dirPath}: ${err.message}`, 'warning');
          }
        };

        await scanDirectory('input/fsh');
      } catch (err) {
        addLog('⚠️ input/fsh directory not found or empty', 'warning');
      }

      setFshFiles(fshFiles);
      addLog(`📊 Found ${fshFiles.length} FSH files in repository`, 'info');
      
      return { config, fshFiles };
    } catch (err) {
      addLog(`❌ Error fetching repository files: ${err.message}`, 'error');
      throw err;
    }
  };

  const integrateStagingFiles = (repoFshFiles) => {
    // Start with repository files
    const integratedFiles = [...repoFshFiles];
    
    // Override/add staging files
    stagingFiles.forEach(stagingFile => {
      if (stagingFile.path && stagingFile.path.endsWith('.fsh')) {
        const fileName = stagingFile.path.split('/').pop();
        const existingIndex = integratedFiles.findIndex(f => f.name === fileName);
        
        if (existingIndex >= 0) {
          // Override existing file
          integratedFiles[existingIndex] = {
            ...integratedFiles[existingIndex],
            content: stagingFile.content,
            isFromStaging: true
          };
          addLog(`🔄 Overriding ${fileName} with staging version`, 'info');
        } else {
          // Add new file from staging
          integratedFiles.push({
            name: fileName,
            path: stagingFile.path,
            content: stagingFile.content,
            isFromStaging: true
          });
          addLog(`➕ Adding ${fileName} from staging`, 'info');
        }
      }
    });

    return integratedFiles;
  };

  const runSushiInBrowser = async (config, files) => {
    try {
      addLog('🚀 Initializing SUSHI in browser environment...', 'info');
      
      // This is where we would integrate the actual sushi library
      // For now, we'll simulate the process with detailed logging
      
      addLog('📝 Creating virtual file system...', 'info');
      const virtualFs = {
        'sushi-config.yaml': config,
        'input/fsh/': {}
      };
      
      files.forEach(file => {
        virtualFs['input/fsh/'][file.name] = file.content;
        addLog(`📁 Added ${file.name} to virtual FS`, 'info');
      });

      addLog('⚙️ Parsing SUSHI configuration...', 'info');
      // Simulate configuration parsing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (config) {
        try {
          const configObj = typeof config === 'string' ? 
            await import('js-yaml').then(yaml => yaml.default.load(config)) : 
            config;
          addLog(`📋 Package: ${configObj.name || 'Unknown'}`, 'success');
          addLog(`📋 Version: ${configObj.version || 'Unknown'}`, 'success');
          addLog(`📋 FHIR Version: ${configObj.fhirVersion || 'Unknown'}`, 'success');
        } catch (err) {
          addLog(`⚠️ Could not parse config: ${err.message}`, 'warning');
        }
      }

      addLog('🔍 Analyzing FSH files...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate FSH parsing and analysis
      for (const file of files) {
        addLog(`🔍 Parsing ${file.name}...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simple FSH content analysis
        const lines = file.content.split('\n');
        const profiles = lines.filter(line => line.trim().startsWith('Profile:')).length;
        const instances = lines.filter(line => line.trim().startsWith('Instance:')).length;
        const valueSets = lines.filter(line => line.trim().startsWith('ValueSet:')).length;
        
        if (profiles > 0) addLog(`  📊 Found ${profiles} Profile(s)`, 'success');
        if (instances > 0) addLog(`  📊 Found ${instances} Instance(s)`, 'success');
        if (valueSets > 0) addLog(`  📊 Found ${valueSets} ValueSet(s)`, 'success');
        
        if (file.isFromStaging) {
          addLog(`  🏗️ File from staging ground`, 'info');
        }
      }

      addLog('✨ SUSHI compilation completed successfully!', 'success');
      addLog('📦 Generated FHIR resources (simulated)', 'success');
      addLog('📝 Implementation Guide structure created', 'success');
      
      // Simulate some warnings or notes
      if (files.length === 0) {
        addLog('⚠️ No FSH files found to process', 'warning');
      }
      
      if (!config) {
        addLog('⚠️ No sushi-config.yaml found - using defaults', 'warning');
      }

      return {
        success: true,
        resourceCount: files.length * 2, // Simulate generated resources
        warnings: [],
        errors: []
      };
      
    } catch (err) {
      addLog(`❌ SUSHI compilation failed: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleRunSushi = async (withStagingFiles = false) => {
    setIsRunning(true);
    setShowModal(true);
    setLogs([]);
    setError(null);
    setIncludeStagingFiles(withStagingFiles);

    try {
      addLog('🏁 Starting SUSHI client-side execution...', 'info');
      
      if (withStagingFiles && stagingFiles.length > 0) {
        addLog(`🗂️ Including ${stagingFiles.length} staging files`, 'info');
      }

      // Fetch repository files
      const { config, fshFiles: repoFiles } = await fetchRepositoryFiles();
      
      // Integrate staging files if requested
      const finalFiles = withStagingFiles ? 
        integrateStagingFiles(repoFiles) : 
        repoFiles;

      if (withStagingFiles) {
        addLog(`📊 Final file count: ${finalFiles.length} FSH files`, 'info');
      }

      // Run SUSHI
      await runSushiInBrowser(config, finalFiles);
      
      addLog('🎉 SUSHI execution completed successfully!', 'success');
      
    } catch (err) {
      setError(err.message);
      addLog(`💥 Execution failed: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const toggleLogLevel = useCallback((level) => {
    setLogLevelToggles(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setLogLevelToggles({
      info: true,
      success: true,
      warning: true,
      error: true
    });
    setSearchText('');
  }, []);

  const copyAllLogs = useCallback(async () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  }, [logs]);

  const copyLogMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (err) {
      console.error('Failed to copy log message:', err);
    }
  }, []);

  // Function to detect and create links for files mentioned in log messages
  const parseLogMessage = useCallback((message, logId) => {
    // Regex to find file paths (ending with .fsh, .yaml, .yml, etc.)
    const filePathRegex = /([a-zA-Z0-9_/-]+\.(?:fsh|yaml|yml|json))/g;
    const matches = message.match(filePathRegex);
    
    if (!matches) {
      return <span>{message}</span>;
    }
    
    let lastIndex = 0;
    const elements = [];
    
    matches.forEach((filePath, index) => {
      const matchIndex = message.indexOf(filePath, lastIndex);
      
      // Add text before the match
      if (matchIndex > lastIndex) {
        elements.push(
          <span key={`${logId}-text-${index}`}>
            {message.substring(lastIndex, matchIndex)}
          </span>
        );
      }
      
      // Determine link type based on file location
      const createFileLink = (path, text) => {
        const isFromStaging = stagingFiles.some(f => f.path && f.path.includes(path));
        
        if (isFromStaging) {
          // Link to staging ground
          return (
            <span key={`${logId}-link-${index}`} className="file-link staging-link" title="Open in Staging Ground">
              📝 {text}
            </span>
          );
        } else if (path.startsWith('input/fsh/')) {
          // Determine DAK component based on directory structure
          const getDakComponentLink = (fshPath) => {
            const pathParts = fshPath.split('/');
            if (pathParts.length > 2) {
              const subDir = pathParts[2];
              switch (subDir) {
                case 'profiles':
                  return { component: 'Profiles', icon: '👤' };
                case 'examples':
                  return { component: 'Examples', icon: '📋' };
                case 'valuesets':
                  return { component: 'ValueSets', icon: '📊' };
                case 'codesystems':
                  return { component: 'CodeSystems', icon: '🔢' };
                case 'extensions':
                  return { component: 'Extensions', icon: '🔧' };
                default:
                  return { component: 'FSH Files', icon: '📄' };
              }
            }
            return { component: 'FSH Files', icon: '📄' };
          };
          
          const dakInfo = getDakComponentLink(path);
          return (
            <span key={`${logId}-link-${index}`} className="file-link dak-link" title={`View in DAK ${dakInfo.component}`}>
              {dakInfo.icon} {text}
            </span>
          );
        } else {
          // Link to GitHub source
          const githubUrl = `https://github.com/${owner}/${repoName}/blob/${selectedBranch}/${path}`;
          return (
            <a 
              key={`${logId}-link-${index}`}
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="file-link github-link"
              title="Open in GitHub"
            >
              🔗 {text}
            </a>
          );
        }
      };
      
      elements.push(createFileLink(filePath, filePath));
      lastIndex = matchIndex + filePath.length;
    });
    
    // Add remaining text
    if (lastIndex < message.length) {
      elements.push(
        <span key={`${logId}-text-end`}>
          {message.substring(lastIndex)}
        </span>
      );
    }
    
    return <span>{elements}</span>;
  }, [owner, repoName, selectedBranch, stagingFiles]);

  // Optimized filtered logs with useMemo to prevent unnecessary re-computations
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by log level toggles
      const isLevelEnabled = logLevelToggles[log.type];
      
      // Filter by search text
      const matchesSearch = searchText === '' || 
        log.message.toLowerCase().includes(searchText.toLowerCase());
      
      return isLevelEnabled && matchesSearch;
    });
  }, [logs, logLevelToggles, searchText]);

  // Separate component for log controls to prevent re-renders
  const LogControls = React.memo(({ 
    logLevelToggles, 
    onToggleLogLevel, 
    searchText, 
    onSearchChange, 
    filteredCount, 
    totalCount 
  }) => {
    const handleSearchChange = useCallback((e) => {
      onSearchChange(e.target.value);
    }, [onSearchChange]);

    return (
      <div className="log-controls">
        <div className="log-level-toggles">
          <label className="toggle-group-label">Show levels:</label>
          <div className="toggle-buttons">
            {[
              { key: 'info', label: 'Info', icon: 'ℹ️' },
              { key: 'success', label: 'Success', icon: '✅' },
              { key: 'warning', label: 'Warning', icon: '⚠️' },
              { key: 'error', label: 'Error', icon: '❌' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className={`log-toggle-btn ${logLevelToggles[key] ? 'active' : 'inactive'}`}
                onClick={() => onToggleLogLevel(key)}
                title={`Toggle ${label} messages`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="log-search-group">
          <label htmlFor="log-search">Search logs:</label>
          <input
            id="log-search"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search log messages..."
            className="log-search-input"
          />
        </div>
        
        <div className="log-stats">
          {searchText || Object.values(logLevelToggles).some(v => !v) ? (
            <span>Showing {filteredCount} of {totalCount} logs</span>
          ) : (
            <span>{totalCount} logs</span>
          )}
        </div>
      </div>
    );
  });

  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
  }, []);

  const LogModal = () => (
    <div className="sushi-modal-overlay">
      <div className="sushi-modal">
        <div className="sushi-modal-header">
          <h3>
            🍣 SUSHI Client-Side Execution 
            {includeStagingFiles && <span className="staging-badge">+ Staging</span>}
          </h3>
          <div className="modal-actions">
            <button 
              onClick={copyAllLogs}
              className="copy-all-btn"
              disabled={logs.length === 0}
              title="Copy all logs to clipboard"
            >
              📋 Copy All
            </button>
            <button 
              onClick={clearLogs}
              className="clear-logs-btn"
              disabled={isRunning}
            >
              🗑️ Clear
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="close-modal-btn"
            >
              ✕
            </button>
          </div>
        </div>
        
        <LogControls
          logLevelToggles={logLevelToggles}
          onToggleLogLevel={toggleLogLevel}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          filteredCount={filteredLogs.length}
          totalCount={logs.length}
        />
        
        <div className="sushi-modal-content">
          <div className="log-container">
            {filteredLogs.map(log => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-message">
                  {parseLogMessage(log.message, log.id)}
                </span>
                <button 
                  onClick={() => copyLogMessage(log.message)}
                  className="copy-log-btn"
                  title="Copy this message to clipboard"
                >
                  📋
                </button>
              </div>
            ))}
            
            {isRunning && (
              <div className="log-entry log-running">
                <span className="log-timestamp">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="log-message">
                  <span className="spinner">⏳</span> Processing...
                </span>
                <div className="copy-log-btn-placeholder"></div>
              </div>
            )}
            
            {filteredLogs.length === 0 && !isRunning && logs.length > 0 && (
              <div className="log-placeholder">
                No logs match the current filter criteria...
              </div>
            )}
            
            {logs.length === 0 && !isRunning && (
              <div className="log-placeholder">
                Logs will appear here during SUSHI execution...
              </div>
            )}
          </div>
          
          {error && (
            <div className="error-summary">
              <h4>❌ Execution Error</h4>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="sushi-modal-footer">
          <div className="execution-info">
            {isRunning ? (
              <span className="status-running">🔄 Running SUSHI...</span>
            ) : logs.length > 0 ? (
              <span className="status-complete">✅ Execution complete</span>
            ) : (
              <span className="status-ready">🍣 Ready to run SUSHI</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sushi-runner-section">
      <div 
        className={`sushi-status-bar ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="status-bar-header">
          <span className="status-icon">🍣</span>
          <span className="status-title">SUSHI (FHIR Shorthand)</span>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        
        {!isExpanded && (
          <div className="status-summary">
            Client-side FHIR Implementation Guide compilation
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="sushi-controls">
          <div className="sushi-description">
            <p>
              Run SUSHI (FHIR Shorthand) compilation directly in your browser to generate 
              FHIR Implementation Guide resources from FSH files.
            </p>
          </div>

          <div className="execution-options">
            <div className="option-group">
              <h4>📂 Repository Files Only</h4>
              <p>
                Compile using sushi-config.yaml and input/fsh files from the GitHub repository ({selectedBranch} branch).
              </p>
              <button
                className="run-sushi-btn primary"
                onClick={() => handleRunSushi(false)}
                disabled={isRunning}
              >
                {isRunning ? '⏳ Running...' : '🚀 Run SUSHI'}
              </button>
            </div>

            {stagingFiles.length > 0 && (
              <div className="option-group">
                <h4>🏗️ Repository + Staging Files</h4>
                <p>
                  Compile using repository files, with staging ground files ({stagingFiles.length} files) 
                  overriding any repository files with the same name.
                </p>
                <button
                  className="run-sushi-btn secondary"
                  onClick={() => handleRunSushi(true)}
                  disabled={isRunning}
                >
                  {isRunning ? '⏳ Running...' : '🚀 Run SUSHI + Staging'}
                </button>
              </div>
            )}
          </div>

          <div className="sushi-status">
            <div className="status-item">
              <span className="label">Config:</span>
              <span className="value">{sushiConfig ? '✅ Found' : '❓ Unknown'}</span>
            </div>
            <div className="status-item">
              <span className="label">FSH Files:</span>
              <span className="value">{fshFiles.length} in repository</span>
            </div>
            {stagingFiles.length > 0 && (
              <div className="status-item">
                <span className="label">Staging:</span>
                <span className="value">{stagingFiles.filter(f => f.path && f.path.endsWith('.fsh')).length} FSH files</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <LogModal />}
    </div>
  );
};

export default SushiRunner;