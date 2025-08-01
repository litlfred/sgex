import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import './CommitsSlider.css';

const CommitsSlider = ({ repository, selectedBranch }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sliderRef = useRef(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;
  const branch = selectedBranch || repository.default_branch || 'main';

  // Load commits
  const loadCommits = async (page = 1, append = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const options = {
        sha: branch,
        per_page: 10,
        page: page
      };

      const newCommits = await githubService.getCommits(owner, repoName, options);
      
      if (append) {
        setCommits(prev => [...prev, ...newCommits]);
      } else {
        setCommits(newCommits);
      }

      // Check if there are more commits
      setHasMore(newCommits.length === 10);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading commits:', err);
      setError('Failed to load commits');
      setCommits([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize commits on mount or branch change
  useEffect(() => {
    loadCommits(1, false);
  }, [repository, selectedBranch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more commits
  const loadMoreCommits = () => {
    if (hasMore && !loading) {
      loadCommits(currentPage + 1, true);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Format commit date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Truncate commit message
  const truncateMessage = (message, maxLength = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="commits-slider-error">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="commits-slider-container">
      <div className="slider-header">
        <div className="slider-controls">
          <button 
            className="slider-control left" 
            onClick={scrollLeft}
            disabled={loading}
          >
            ←
          </button>
          <button 
            className="slider-control right" 
            onClick={scrollRight}
            disabled={loading}
          >
            →
          </button>
        </div>
      </div>

      <div className="commits-slider" ref={sliderRef}>
        {commits.map((commit, index) => (
          <div key={commit.sha} className="commit-card">
            <div className="commit-header">
              <img 
                src={commit.author?.avatar_url || commit.committer?.avatar_url || `https://github.com/ghost.png`}
                alt={commit.author?.login || commit.commit.author.name}
                className="commit-avatar"
              />
              <div className="commit-info">
                <div className="commit-author">
                  {commit.author?.login || commit.commit.author.name}
                </div>
                <div className="commit-date">
                  {formatDate(commit.commit.author.date)}
                </div>
              </div>
            </div>
            
            <div className="commit-message">
              {truncateMessage(commit.commit.message)}
            </div>
            
            <div className="commit-meta">
              <div className="commit-sha">
                <code>{commit.sha.substring(0, 7)}</code>
              </div>
              <a 
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="commit-link"
                title="View commit on GitHub"
              >
                ↗️
              </a>
            </div>
          </div>
        ))}

        {/* Load more button */}
        {hasMore && (
          <div className="load-more-container">
            <button 
              className="load-more-btn"
              onClick={loadMoreCommits}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* Loading state for initial load */}
        {loading && commits.length === 0 && (
          <div className="commits-loading">
            <span className="loading-spinner">⏳</span>
            Loading commits...
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitsSlider;