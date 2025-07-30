import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout } from './framework';
import './TestingViewer.css';

const TestingViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, repository, selectedBranch } = location.state || {};

  const [featureFiles, setFeatureFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFeatureFiles = async () => {
      if (!repository) {
        setError('Missing repository information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Extract owner and repo name - handle both demo and real repository structures
        let owner, repoName;
        
        if (repository.owner?.login) {
          // Real GitHub repository structure
          owner = repository.owner.login;
          repoName = repository.name;
        } else if (repository.full_name) {
          // Handle repository with full_name
          [owner, repoName] = repository.full_name.split('/');
        } else if (typeof repository === 'string') {
          // Handle string format
          [owner, repoName] = repository.split('/');
        } else {
          // Fallback - try to extract from repository properties
          owner = repository.owner || 'demo-user';
          repoName = repository.name || repository.repo || 'unknown';
        }

        console.log('Fetching feature files for:', { owner, repoName, repository });

        // Try to get files from input/testing directory
        const files = await githubService.getDirectoryContents(
          owner,
          repoName,
          'input/testing',
          selectedBranch || repository.default_branch || 'main'
        );

        // Filter for .feature files
        const featureFiles = files
          .filter(file => file.type === 'file' && file.name.endsWith('.feature'))
          .map(file => ({
            name: file.name,
            path: file.path,
            url: file.html_url,
            download_url: file.download_url
          }));

        setFeatureFiles(featureFiles);
      } catch (err) {
        console.error('Error fetching feature files:', err);
        if (err.message.includes('Not Found')) {
          setError('No input/testing directory found in this repository');
        } else {
          setError(`Error loading feature files: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFiles();
  }, [profile, repository, selectedBranch]);

  const handleViewFile = async (file) => {
    try {
      setLoading(true);
      const response = await fetch(file.download_url);
      const content = await response.text();
      setSelectedFile(file);
      setFileContent(content);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading file content:', err);
      setError(`Error loading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard', { 
      state: { profile, repository, selectedBranch } 
    });
  };

  const renderModal = () => {
    if (!showModal || !selectedFile) return null;

    return (
      <div className="testing-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="testing-modal" onClick={(e) => e.stopPropagation()}>
          <div className="testing-modal-header">
            <h3>{selectedFile.name}</h3>
            <button 
              className="testing-modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
          <div className="testing-modal-content">
            <pre className="feature-content">{fileContent}</pre>
          </div>
          <div className="testing-modal-footer">
            <a 
              href={selectedFile.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View on GitHub
            </a>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout pageName="testing-viewer">
      <div className="testing-viewer">
        <div className="testing-header">
          <button onClick={handleBack} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Testing Files</h1>
          <p className="testing-description">
            Feature files from the input/testing directory
          </p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading feature files...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && featureFiles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No Feature Files Found</h3>
            <p>No .feature files were found in the input/testing directory.</p>
          </div>
        )}

        {!loading && !error && featureFiles.length > 0 && (
          <div className="feature-files-grid">
            {featureFiles.map((file, index) => (
              <div key={index} className="feature-file-card">
                <div className="file-icon">🧪</div>
                <div className="file-info">
                  <h3 className="file-name">{file.name}</h3>
                  <p className="file-path">{file.path}</p>
                </div>
                <div className="file-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewFile(file)}
                  >
                    View
                  </button>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderModal()}
      </div>
    </PageLayout>
  );
};

export default TestingViewer;