import React, { useState, useEffect, useCallback } from 'react';
import bookmarkService from '../services/bookmarkService';
import BookmarkButton from './BookmarkButton';
import './BookmarksSection.css';

const BookmarksSection = ({ onRepositorySelect, profile, action }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadBookmarks = useCallback(() => {
    let allBookmarks;
    
    if (profile && profile.login) {
      // Load bookmarks for specific user/org
      allBookmarks = bookmarkService.getBookmarksForOwner(profile.login);
    } else {
      // Load all bookmarks
      allBookmarks = bookmarkService.getBookmarkedRepositories();
    }
    
    setBookmarks(allBookmarks);
  }, [profile]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleBookmarkToggle = (repository, isBookmarked) => {
    // Refresh bookmarks after toggle
    loadBookmarks();
  };

  const handleRepositoryClick = (repository) => {
    if (onRepositorySelect) {
      onRepositorySelect(repository);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all bookmarks? This action cannot be undone.')) {
      bookmarkService.clearAllBookmarks();
      loadBookmarks();
    }
  };

  if (bookmarks.length === 0) {
    return null; // Don't show section if no bookmarks
  }

  return (
    <div className="bookmarks-section">
      <div className="bookmarks-header">
        <div className="bookmarks-title-container">
          <h3 className="bookmarks-title">
            <span className="bookmarks-icon">★</span>
            Bookmarked Repositories
            <span className="bookmark-count">({bookmarks.length})</span>
          </h3>
          <button
            className="bookmarks-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse bookmarks' : 'Expand bookmarks'}
          >
            <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        {isExpanded && bookmarks.length > 0 && (
          <button 
            className="clear-bookmarks-btn"
            onClick={clearAllBookmarks}
            title="Clear all bookmarks"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="bookmarks-grid">
          {bookmarks.map((repo) => (
            <div 
              key={repo.id}
              className="bookmark-card"
              onClick={() => handleRepositoryClick(repo)}
            >
              <div className="bookmark-card-header">
                <div className="repo-header-info">
                  <h4>{repo.name}</h4>
                  <div className="repo-meta">
                    {repo.is_template && (
                      <span className="template-badge">
                        {repo.template_config?.name || 'Template'}
                      </span>
                    )}
                    {repo.private && <span className="private-badge">Private</span>}
                    {repo.language && <span className="language-badge">{repo.language}</span>}
                    {repo.smart_guidelines_compatible && (
                      <span className="compatible-badge">SMART Guidelines</span>
                    )}
                  </div>
                </div>
                <BookmarkButton 
                  repository={repo}
                  onToggle={handleBookmarkToggle}
                  className="bookmark-card-button"
                />
              </div>
              
              <p className="bookmark-description">
                {repo.description || 'No description available'}
              </p>
              
              <div className="bookmark-topics">
                {(repo.topics || []).slice(0, 3).map((topic) => (
                  <span key={topic} className="topic-tag">{topic}</span>
                ))}
                {(repo.topics || []).length > 3 && (
                  <span className="topic-more">+{(repo.topics || []).length - 3} more</span>
                )}
              </div>
              
              <div className="bookmark-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <span>{repo.stargazers_count || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🍴</span>
                  <span>{repo.forks_count || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <span>Updated {formatDate(repo.updated_at)}</span>
                </div>
              </div>

              <div className="bookmark-meta">
                <span className="bookmarked-date">
                  Bookmarked {formatDate(repo.bookmarked_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksSection;