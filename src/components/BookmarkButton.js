import React from 'react';
import bookmarkService from '../services/bookmarkService';
import './BookmarkButton.css';

const BookmarkButton = ({ repository, onToggle, className = '' }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    if (repository) {
      setIsBookmarked(bookmarkService.isBookmarked(repository));
    }
  }, [repository]);

  const handleToggle = (event) => {
    event.stopPropagation(); // Prevent card selection when clicking bookmark
    
    if (!repository) {
      return;
    }

    const newBookmarkState = bookmarkService.toggleBookmark(repository);
    setIsBookmarked(newBookmarkState);
    
    // Call optional callback
    if (onToggle) {
      onToggle(repository, newBookmarkState);
    }
  };

  if (!repository) {
    return null;
  }

  return (
    <button
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : 'not-bookmarked'} ${className}`}
      onClick={handleToggle}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <span className="bookmark-icon">
        {isBookmarked ? '★' : '☆'}
      </span>
    </button>
  );
};

export default BookmarkButton;