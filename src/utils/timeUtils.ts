/**
 * Time utility functions for formatting dates and relative times
 * 
 * @module timeUtils
 */

/**
 * Formatted timestamp with absolute and relative time strings
 * @example { "absolute": "Jan 1, 10:30 AM", "relative": "5 minutes ago", "full": "January 1, 2024, 10:30:45 AM EST" }
 */
export interface FormattedTimestamp {
  /** Short absolute time format (e.g., "Jan 1, 10:30 AM") */
  absolute: string;
  /** Relative time format (e.g., "5 minutes ago") */
  relative: string;
  /** Full detailed timestamp with timezone */
  full: string;
}

/**
 * Format a date as relative time (e.g., "5 minutes ago", "2 hours ago")
 * @param date - The date to format (Date object or ISO string)
 * @returns Relative time string
 * 
 * @example
 * timeAgo(new Date()); // "just now"
 * timeAgo(new Date(Date.now() - 60000)); // "1 minute ago"
 * timeAgo(new Date(Date.now() - 3600000)); // "1 hour ago"
 */
export const timeAgo = (date: Date | string | null | undefined): string => {
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
 * @param date - The date to format (Date object or ISO string)
 * @returns Object with absolute, relative, and full time strings
 * 
 * @example
 * const timestamp = formatTimestamp(new Date());
 * // {
 * //   absolute: "Jan 15, 10:30 AM",
 * //   relative: "5 minutes ago",
 * //   full: "January 15, 2024, 10:30:45 AM EST"
 * // }
 */
export const formatTimestamp = (date: Date | string | null | undefined): FormattedTimestamp => {
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

/**
 * Time utilities for formatting dates and relative times
 * @example
 * import { timeAgo, formatTimestamp } from './timeUtils';
 * const relativeTime = timeAgo(new Date());
 */
const timeUtils = {
  timeAgo,
  formatTimestamp
};

export default timeUtils;
