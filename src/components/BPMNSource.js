import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './BPMNSource.css';

const BPMNSource = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, component, selectedFile, selectedBranch } = location.state || {};
  
  const [bpmnXml, setBpmnXml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          // Simple permission check - in real app, this would use githubService
          const writeAccess = profile.token && repository.permissions?.push;
          setHasWriteAccess(writeAccess || false);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };

    checkPermissions();
  }, [repository, profile]);

  // Load BPMN XML source
  useEffect(() => {
    const loadBpmnSource = async () => {
      if (!selectedFile || !repository) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        const ref = selectedBranch || 'main';

        console.log(`Loading BPMN source from ${owner}/${repoName}:${selectedFile.path} (ref: ${ref})`);
        
        // Use githubService to fetch file content (works for both public and private repos)
        const xmlContent = await githubService.getFileContent(owner, repoName, selectedFile.path, ref);
        
        console.log('Successfully loaded BPMN source from repository');

        setBpmnXml(xmlContent);
        setLoading(false);
      } catch (err) {
        console.error('Error loading BPMN source:', err);
        
        // Provide specific error messages based on the error type
        if (err.status === 404) {
          setError('BPMN file not found in the repository. The file may have been moved or deleted.');
        } else if (err.status === 403) {
          setError('Access denied. This repository may be private and require authentication.');
        } else if (err.message.includes('rate limit')) {
          setError('GitHub API rate limit exceeded. Please try again later or authenticate for higher limits.');
        } else {
          setError(`Failed to load BPMN source: ${err.message}`);
        }
        
        setLoading(false);
      }
    };

    loadBpmnSource();
  }, [selectedFile, repository, selectedBranch]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bpmnXml);
      // Show temporary success message
      const button = document.querySelector('.copy-btn');
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToSelection = () => {
    navigate('/business-process-selection', {
      state: {
        profile,
        repository,
        component,
        selectedBranch
      }
    });
  };

  const getGitHubUrl = () => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    return `https://github.com/${owner}/${repository.name}/blob/main/${selectedFile.path}`;
  };

  const getGitHubEditUrl = () => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    return `https://github.com/${owner}/${repository.name}/edit/main/${selectedFile.path}`;
  };

  if (!profile || !repository || !selectedFile) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="bpmn-source">
      <div className="source-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repository.name}</span>
            <span className="context-component">BPMN Source Code</span>
          </div>
        </div>
      </div>

      <div className="source-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dashboard', { state: { profile, repository } })} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToSelection} className="breadcrumb-link">
            Business Processes
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{selectedFile.name} (source)</span>
        </div>

        <div className="source-main">
          <div className="source-toolbar">
            <div className="toolbar-left">
              <h3>{selectedFile.name}</h3>
              <span className="source-mode-badge">📄 XML Source</span>
            </div>
            <div className="toolbar-right">
              <button 
                className="action-btn secondary"
                onClick={handleBackToSelection}
              >
                ← Back to List
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleCopyToClipboard}
                disabled={loading}
              >
                📋 Copy
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleDownload}
                disabled={loading}
              >
                💾 Download
              </button>
            </div>
          </div>

          <div className="source-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading BPMN source code...</p>
              </div>
            ) : error ? (
              <div className="error-overlay">
                <p>❌ {error}</p>
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <pre className="source-code">
                <code className="xml-code">{bpmnXml}</code>
              </pre>
            )}
          </div>

          <div className="source-actions">
            <div className="github-links">
              <h4>GitHub Actions</h4>
              <div className="link-buttons">
                <a 
                  href={getGitHubUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn github-view"
                >
                  👁️ View on GitHub
                </a>
                {hasWriteAccess && (
                  <a 
                    href={getGitHubEditUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn github-edit"
                  >
                    ✏️ Edit on GitHub
                  </a>
                )}
              </div>
            </div>

            <div className="file-info">
              <h4>File Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Path:</label>
                  <span className="file-path">{selectedFile.path}</span>
                </div>
                <div className="info-item">
                  <label>File Size:</label>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="info-item">
                  <label>Format:</label>
                  <span>BPMN 2.0 XML</span>
                </div>
                <div className="info-item">
                  <label>Access Level:</label>
                  <span className={`access-badge ${hasWriteAccess ? 'write' : 'read'}`}>
                    {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="bpmn-source"
        contextData={{ profile, repository, component, selectedFile }}
      />
    </div>
  );
};

export default BPMNSource;