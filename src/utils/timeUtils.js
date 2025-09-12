/**
 * Time utility functions for formatting dates and relative times
 */

/**
 * Format a date as relative time (e.g., "5 minutes ago", "2 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export const timeAgo = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const targetDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(targetDate.getTime())) {
    return 'Invalid date';
  }
  
  const diffMs = now.getTime() - targetDate.getTime();
  
  // If in the future, show as "just now"
  if (diffMs < 0) {
    return 'just now';
  }
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) {
    return diffSeconds <= 1 ? 'just now' : `${diffSeconds} seconds ago`;
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  } else {
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  }
};

/**
 * Format a date for display with both absolute and relative time
 * @param {Date|string} date - The date to format
 * @returns {Object} Object with absolute and relative time strings
 */
export const formatTimestamp = (date) => {
  if (!date) {
    return {
      absolute: 'Never',
      relative: 'Never',
      full: 'Never'
    };
  }
  
  const targetDate = new Date(date);
  
  if (isNaN(targetDate.getTime())) {
    return {
      absolute: 'Invalid date',
      relative: 'Invalid date',
      full: 'Invalid date'
    };
  }
  
  const absolute = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(targetDate);
  
  const relative = timeAgo(targetDate);
  
  const full = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(targetDate);
  
  return {
    absolute,
    relative,
    full
  };
};