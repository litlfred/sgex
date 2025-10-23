import React, { useState, useEffect, useCallback } from 'react';
import githubService from '../services/githubService';
import CommitsSlider from './CommitsSlider';
import GitHubActionsIntegration from './GitHubActionsIntegration';

interface Repository {
  owner?: { login: string };
  full_name: string;
  name: string;
  default_branch?: string;
}

interface Profile {
  login: string;
  [key: string]: any;
}

interface DAKStatusBoxProps {
  repository: Repository;
  selectedBranch?: string;
  hasWriteAccess?: boolean;
  profile?: Profile;
}

interface RepositoryStats {
  recentCommits: any[];
  openPullRequestsCount: number;
  openIssuesCount: number;
  statsLoading: boolean;
  statsError: string | null;
}

const DAKStatusBox: React.FC<DAKStatusBoxProps> = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [repositoryStats, setRepositoryStats] = useState<RepositoryStats>({
    recentCommits: [],
    openPullRequestsCount: 0,
    openIssuesCount: 0,
    statsLoading: false,
    statsError: null
  });

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load repository statistics
  const loadRepositoryStats = useCallback(async () => {
    if (!githubService.isAuth()) {
      return;
    }

    setRepositoryStats(prev => ({ ...prev, statsLoading: true, statsError: null }));

    try {
      const stats = await githubService.getRepositoryStats(owner, repoName, branch);
      setRepositoryStats({
        recentCommits: stats.recentCommits,
        openPullRequestsCount: stats.openPullRequestsCount,
        openIssuesCount: stats.openIssuesCount,
        statsLoading: false,
        statsError: null
      });
    } catch (err) {
      console.error('Error loading repository stats:', err);
      setRepositoryStats(prev => ({
        ...prev,
        statsLoading: false,
        statsError: 'Failed to load repository statistics'
      }));
    }
  }, [owner, repoName, branch]);

  // Initialize component
  useEffect(() => {
    if (repository && selectedBranch) {
      loadRepositoryStats();
    }
  }, [repository, selectedBranch, loadRepositoryStats]);

  // Handle toggle expansion
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Format the last commit for display
  const formatLastCommit = () => {
    if (!repositoryStats.recentCommits || repositoryStats.recentCommits.length === 0) {
      return null;
    }
    
    const lastCommit = repositoryStats.recentCommits[0];
    const commitDate = new Date(lastCommit.author.date);
    const shortSha = lastCommit.sha.substring(0, 7);
    
    return {
      message: lastCommit.message,
      author: lastCommit.author.name,
      sha: shortSha,
      date: commitDate.toLocaleDateString(),
      time: commitDate.toLocaleTimeString(),
      url: lastCommit.html_url
    };
  };

  const lastCommit = formatLastCommit();

  return (
    <div className="dak-status-box">
      <div className="status-header" onClick={handleToggle}>
        <div className="status-title">
          <span className="status-icon">📊</span>
          <h3>Repository Status</h3>
          <span className="branch-indicator">
            {branch && <code>{branch}</code>}
          </span>
        </div>
        <div className="status-indicators">
          {/* Repository stats summary */}
          <div className="repo-stats-summary">
            <div className="stat-item">
              <span className="stat-icon">🔄</span>
              <span className="stat-count">{repositoryStats.recentCommits.length}</span>
              <span className="stat-label">commits</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔀</span>
              <span className="stat-count">{repositoryStats.openPullRequestsCount}</span>
              <span className="stat-label">PRs</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🐛</span>
              <span className="stat-count">{repositoryStats.openIssuesCount}</span>
              <span className="stat-label">issues</span>
            </div>
          </div>
        </div>
        
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="status-content">
          {repositoryStats.statsLoading ? (
            <div className="loading-indicator">
              <span className="loading-spinner">⏳</span>
              Loading repository stats...
            </div>
          ) : repositoryStats.statsError ? (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {repositoryStats.statsError}
            </div>
          ) : (
            <>
              {/* Last Commit Section */}
              {lastCommit && (
                <div className="status-section">
                  <h4>📝 Latest Commit</h4>
                  <div className="last-commit">
                    <div className="commit-message">
                      {lastCommit.message}
                    </div>
                    <div className="commit-meta">
                      <span className="commit-author">by {lastCommit.author}</span>
                      <span className="commit-sha">
                        <a href={lastCommit.url} target="_blank" rel="noopener noreferrer">
                          {lastCommit.sha}
                        </a>
                      </span>
                      <span className="commit-date">{lastCommit.date} at {lastCommit.time}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Repository Summary */}
              <div className="status-section">
                <h4>📊 Repository Summary</h4>
                <div className="repo-summary">
                  <div className="summary-item">
                    <span className="summary-icon">🔀</span>
                    <span className="summary-label">Open Pull Requests:</span>
                    <span className="summary-value">{repositoryStats.openPullRequestsCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">🐛</span>
                    <span className="summary-label">Open Issues:</span>
                    <span className="summary-value">{repositoryStats.openIssuesCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">🌿</span>
                    <span className="summary-label">Current Branch:</span>
                    <span className="summary-value">{branch}</span>
                  </div>
                </div>
              </div>

              {/* Commits Section */}
              <div className="status-section">
                <h4>🔄 Recent Commits</h4>
                <CommitsSlider 
                  repository={repository}
                  selectedBranch={branch}
                />
              </div>

              {/* GitHub Actions Section */}
              <div className="status-section">
                <h4>⚙️ GitHub Actions</h4>
                <GitHubActionsIntegration
                  repository={repository}
                  selectedBranch={branch}
                  hasWriteAccess={hasWriteAccess}
                  profile={profile}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DAKStatusBox;