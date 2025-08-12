import React, { useState, useEffect, useCallback } from 'react';
import githubService from '../services/githubService';

const CommitDiffModal = ({ isOpen, onClose, owner, repo, commitSha, commitMessage }) => {
  const [commitData, setCommitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCommitData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await githubService.getCommit(owner, repo, commitSha);
      setCommitData(data);
    } catch (err) {
      console.error('Error loading commit data:', err);
      setError('Failed to load commit changes');
    } finally {
      setLoading(false);
    }
  }, [owner, repo, commitSha]);

  useEffect(() => {
    if (isOpen && commitSha) {
      loadCommitData();
    }
  }, [isOpen, commitSha, loadCommitData]);

  const getFileChangeIcon = (status) => {
    switch (status) {
      case 'added':
        return '✅';
      case 'removed':
        return '❌';
      case 'modified':
        return '📝';
      case 'renamed':
        return '🔄';
      default:
        return '📄';
    }
  };

  const getFileChangeClass = (status) => {
    switch (status) {
      case 'added':
        return 'file-added';
      case 'removed':
        return 'file-removed';
      case 'modified':
        return 'file-modified';
      case 'renamed':
        return 'file-renamed';
      default:
        return 'file-default';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="commit-diff-modal-overlay" onClick={onClose}>
      <div className="commit-diff-modal" onClick={e => e.stopPropagation()}>
        <div className="commit-diff-header">
          <h3>📋 Commit Changes</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="commit-diff-content">
          {loading ? (
            <div className="loading-state">
              <span className="loading-spinner">⏳</span>
              Loading commit changes...
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          ) : commitData ? (
            <>
              <div className="commit-info">
                <div className="commit-message">
                  <strong>Message:</strong> {commitData.commit.message}
                </div>
                <div className="commit-author">
                  <strong>Author:</strong> {commitData.commit.author.name} ({commitData.commit.author.email})
                </div>
                <div className="commit-date">
                  <strong>Date:</strong> {new Date(commitData.commit.author.date).toLocaleString()}
                </div>
                <div className="commit-sha">
                  <strong>SHA:</strong> 
                  <a 
                    href={commitData.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="commit-link"
                  >
                    {commitData.sha.substring(0, 7)}
                  </a>
                </div>
              </div>

              <div className="commit-stats">
                <div className="stat-item">
                  <span className="stat-icon">📁</span>
                  <span className="stat-value">{commitData.files?.length || 0}</span>
                  <span className="stat-label">files changed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">➕</span>
                  <span className="stat-value">{commitData.stats?.additions || 0}</span>
                  <span className="stat-label">additions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">➖</span>
                  <span className="stat-value">{commitData.stats?.deletions || 0}</span>
                  <span className="stat-label">deletions</span>
                </div>
              </div>

              <div className="files-changed">
                <h4>Files Changed</h4>
                {commitData.files && commitData.files.length > 0 ? (
                  <div className="files-list">
                    {commitData.files.map((file, index) => (
                      <div key={index} className={`file-item ${getFileChangeClass(file.status)}`}>
                        <div className="file-header">
                          <span className="file-icon">{getFileChangeIcon(file.status)}</span>
                          <span className="file-name">{file.filename}</span>
                          <span className="file-changes">
                            {file.additions > 0 && <span className="additions">+{file.additions}</span>}
                            {file.deletions > 0 && <span className="deletions">-{file.deletions}</span>}
                          </span>
                        </div>
                        {file.status === 'renamed' && file.previous_filename && (
                          <div className="file-rename-info">
                            Renamed from: {file.previous_filename}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-files">No files changed in this commit</div>
                )}
              </div>

              <div className="commit-actions">
                <a 
                  href={commitData.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-on-github-btn"
                >
                  View Full Diff on GitHub ↗️
                </a>
              </div>
            </>
          ) : (
            <div className="no-data">No commit data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitDiffModal;