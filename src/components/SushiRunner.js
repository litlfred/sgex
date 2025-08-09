import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import sushiService from '../services/sushiService';
import githubService from '../services/githubService';
import './SushiRunner.css';

const SushiRunner = () => {
  const { user, repo, branch } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for repository and profile context
  const [repository, setRepository] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(branch || 'main');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  // Initialize repository context from URL parameters or location state
  useEffect(() => {
    const initializeContext = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get profile from localStorage or redirect to login
        const storedProfile = localStorage.getItem('sgex-profile');
        if (!storedProfile) {
          navigate('/select_profile');
          return;
        }

        const profileData = JSON.parse(storedProfile);
        setProfile(profileData);

        // If we have URL parameters, load repository
        if (user && repo) {
          const repositoryData = await githubService.getRepository(user, repo, profileData.token);
          setRepository(repositoryData);
          setSelectedBranch(branch || repositoryData.default_branch || 'main');
        } else if (location.state?.repository) {
          // Use repository from navigation state
          setRepository(location.state.repository);
          setSelectedBranch(location.state.selectedBranch || location.state.repository.default_branch || 'main');
        } else {
          setError('No repository context available. Please navigate from a DAK dashboard.');
        }
      } catch (err) {
        console.error('Error initializing SUSHI runner context:', err);
        setError(`Failed to load repository: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeContext();
  }, [user, repo, branch, location.state, navigate]);

  // Listen to SUSHI service updates
  useEffect(() => {
    const unsubscribe = sushiService.addListener((update) => {
      setLogs(update.logs || []);
      setResults(update.results);
    });

    return unsubscribe;
  }, []);

  // Filter logs based on selected filter and search term
  const filteredLogs = logs.filter(log => {
    const levelMatch = logFilter === 'all' || log.level === logFilter;
    const searchMatch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return levelMatch && searchMatch;
  });

  // Run SUSHI compilation
  const runCompilation = useCallback(async () => {
    if (!repository || !selectedBranch || !profile) {
      alert('Missing required parameters for SUSHI compilation');
      return;
    }

    setIsRunning(true);
    setResults(null);
    setLogs([]);

    try {
      const result = await sushiService.runSUSHI(repository, selectedBranch, profile, {
        logLevel: 'info'
      });
      
      setResults(result);
    } catch (error) {
      console.error('SUSHI compilation error:', error);
      setResults({
        success: false,
        error: error.message,
        logs: sushiService.getLogs()
      });
    } finally {
      setIsRunning(false);
    }
  }, [repository, selectedBranch, profile]);

  // Copy logs to clipboard
  const copyLogsToClipboard = () => {
    const logText = sushiService.exportLogsAsText();
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy logs:', err);
    });
  };

  // Copy single log entry to clipboard
  const copyLogEntry = (log) => {
    const logText = `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.location ? ` (${log.location})` : ''}`;
    navigator.clipboard.writeText(logText).then(() => {
      // Visual feedback could be added here
    }).catch(err => {
      console.error('Failed to copy log entry:', err);
    });
  };

  // Toggle file expansion in results
  const toggleFileExpansion = (fileName) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName);
    } else {
      newExpanded.add(fileName);
    }
    setExpandedFiles(newExpanded);
  };

  // Navigate back to dashboard
  const goBackToDashboard = () => {
    if (user && repo && selectedBranch) {
      navigate(`/dashboard/${user}/${repo}/${selectedBranch}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Get log level counts for badges
  const logCounts = {
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length
  };

  if (loading) {
    return (
      <div className="sushi-runner">
        <div className="sushi-runner-header">
          <h2>FSH File Manager & Analyzer</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading repository context...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sushi-runner">
        <div className="sushi-runner-header">
          <h2>FSH File Manager & Analyzer</h2>
          <button onClick={goBackToDashboard} className="close-button">
            Back to Dashboard
          </button>
        </div>
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={goBackToDashboard} className="back-button">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sushi-runner">
      <div className="sushi-runner-header">
        <h2>FSH File Manager & Analyzer</h2>
        <div className="sushi-runner-controls">
          <button 
            onClick={runCompilation} 
            disabled={isRunning}
            className="run-button"
          >
            {isRunning ? 'Loading...' : 'Load & Analyze FSH Files'}
          </button>
          <button onClick={goBackToDashboard} className="close-button">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="sushi-runner-content">
        {/* Repository Information */}
        <div className="repository-info">
          <h3>Repository: {repository?.full_name} ({selectedBranch})</h3>
          <p>This will load and analyze all FSH files from the repository and staging ground. Staging ground files will override repository files with the same path. Full SUSHI compilation will be available in future releases.</p>
        </div>

        {/* Analysis Results Summary */}
        {results && (
          <div className={`results-summary ${results.success ? 'success' : 'error'}`}>
            <h3>Analysis Results</h3>
            <p>
              Status: <strong>{results.success ? 'Success' : 'Failed'}</strong>
            </p>
            {results.files && (
              <p>FSH Files Processed: {results.files.length}</p>
            )}
            {results.error && (
              <p className="error-message">Error: {results.error}</p>
            )}
            {results.stats && (
              <div className="compilation-stats">
                <p>Analysis Statistics:</p>
                <pre>{JSON.stringify(results.stats, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Logs Section */}
        <div className="logs-section">
          <div className="logs-header">
            <h3>Processing Logs</h3>
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
                Copy All Logs
              </button>
            </div>
          </div>

          <div className="logs-container">
            {filteredLogs.length === 0 ? (
              <p className="no-logs">No logs to display</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`log-entry log-${log.level}`}
                  onClick={() => copyLogEntry(log)}
                  title="Click to copy to clipboard"
                >
                  <span className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`log-level level-${log.level}`}>{log.level.toUpperCase()}</span>
                  <span className="log-message">{log.message}</span>
                  {log.location && (
                    <span className="log-location">({log.location})</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Processed Files */}
        {results && results.files && (
          <div className="processed-files">
            <h3>Processed FSH Files ({results.files.length})</h3>
            <div className="files-list">
              {results.files.map((file, index) => (
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
        {results && results.result && (
          <div className="fhir-output">
            <h3>FSH Analysis Results</h3>
            <div className="fhir-resources">
              <pre>{JSON.stringify(results.result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SushiRunner;