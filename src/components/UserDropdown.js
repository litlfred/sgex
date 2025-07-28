import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bookmarkService from '../services/bookmarkService';
import './UserDropdown.css';

const UserDropdown = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load bookmarks and check current page status
  useEffect(() => {
    const loadBookmarks = () => {
      const allBookmarks = bookmarkService.getBookmarks();
      setBookmarks(allBookmarks);
      
      const currentUrl = location.pathname + (location.search || '');
      setIsCurrentPageBookmarked(bookmarkService.isBookmarked(currentUrl));
    };

    loadBookmarks();
    
    // Listen for bookmark changes from other tabs/components
    const handleStorageChange = (event) => {
      if (event.key === 'sgex-bookmarks') {
        loadBookmarks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const addBookmark = () => {
    const bookmark = bookmarkService.createBookmark({ location });
    if (bookmarkService.addBookmark(bookmark)) {
      setIsCurrentPageBookmarked(true);
      setBookmarks(bookmarkService.getBookmarks());
      // Don't close dropdown so user can see the bookmark was added
    }
  };

  const removeBookmark = (bookmarkId) => {
    if (bookmarkService.removeBookmark(bookmarkId)) {
      const updatedBookmarks = bookmarkService.getBookmarks();
      setBookmarks(updatedBookmarks);
      
      // Check if current page is still bookmarked
      const currentUrl = location.pathname + (location.search || '');
      setIsCurrentPageBookmarked(bookmarkService.isBookmarked(currentUrl));
    }
  };

  const navigateToBookmark = (bookmark) => {
    setIsOpen(false);
    navigate(bookmark.url, { state: bookmark.data });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown-trigger"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img 
          src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
          alt="Profile" 
          className="context-avatar" 
        />
        <span className="context-owner">@{profile.login}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          {/* Bookmark current page section */}
          <div className="dropdown-section">
            <button 
              className={`bookmark-current-btn ${isCurrentPageBookmarked ? 'bookmarked' : ''}`}
              onClick={addBookmark}
              disabled={isCurrentPageBookmarked}
            >
              {isCurrentPageBookmarked ? (
                <>
                  <span className="bookmark-icon">★</span>
                  Page Bookmarked
                </>
              ) : (
                <>
                  <span className="bookmark-icon">☆</span>
                  Bookmark Page
                </>
              )}
            </button>
          </div>

          {/* Bookmarks list */}
          {bookmarks.length > 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <div className="dropdown-section-title">Bookmarks</div>
                <div className="bookmarks-list">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="bookmark-item">
                      <button 
                        className="bookmark-link"
                        onClick={() => navigateToBookmark(bookmark)}
                        title={bookmark.title}
                      >
                        <span className="bookmark-title">{bookmark.title}</span>
                        <span className="bookmark-date">{formatDate(bookmark.timestamp)}</span>
                      </button>
                      <button 
                        className="bookmark-remove"
                        onClick={() => removeBookmark(bookmark.id)}
                        title="Remove bookmark"
                        aria-label="Remove bookmark"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Documentation link */}
          <div className="dropdown-divider"></div>
          <div className="dropdown-section">
            <a 
              href="/sgex/docs/overview" 
              className="dropdown-link"
              onClick={() => setIsOpen(false)}
            >
              📖 Documentation
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;