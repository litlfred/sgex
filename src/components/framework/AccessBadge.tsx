/**
 * Access Badge Component
 * 
 * Displays user's access level (read/write) for the current repository
 * Shows in the title bar with dynamic styling based on permissions
 * 
 * @module AccessBadge
 */

import React, { useState, useEffect } from 'react';
import userAccessService from '../../services/userAccessService';

/**
 * Badge information
 * @example { text: "Read", icon: "👁️", color: "blue", description: "You have read-only access" }
 */
export interface BadgeInfo {
  /** Badge text label */
  text: string;
  /** Badge icon emoji */
  icon: string;
  /** Badge color theme */
  color: string;
  /** Badge description for tooltip */
  description: string;
}

/**
 * Access badge component props
 * @example { owner: "who", repo: "anc-dak", branch: "main" }
 */
export interface AccessBadgeProps {
  /** Repository owner username */
  owner: string;
  /** Repository name */
  repo: string;
  /** Git branch name (default: 'main') */
  branch?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Access Badge Component
 * 
 * Displays user's access level (read/write) for the current repository
 * Shows in the title bar with dynamic styling based on permissions
 * 
 * @param props - Component props
 * @returns Access badge component
 * 
 * @example
 * <AccessBadge 
 *   owner="who" 
 *   repo="anc-dak" 
 *   branch="main"
 *   className="context-access-badge"
 * />
 */
const AccessBadge: React.FC<AccessBadgeProps> = ({ 
  owner, 
  repo, 
  branch = 'main', 
  className = '' 
}) => {
  const [badge, setBadge] = useState<BadgeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadBadge = async (): Promise<void> => {
      if (!owner || !repo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const badgeInfo = await userAccessService.getAccessBadge(owner, repo, branch);
        
        if (mounted) {
          setBadge(badgeInfo);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading access badge:', error);
        if (mounted) {
          setBadge({
            text: 'Unknown',
            icon: '❓',
            color: 'gray',
            description: 'Unable to determine access level'
          });
          setLoading(false);
        }
      }
    };

    loadBadge();

    // Listen for access changes
    const unsubscribe = userAccessService.addListener(() => {
      loadBadge();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [owner, repo, branch]);

  if (loading) {
    return (
      <div className={`access-badge loading ${className}`}>
        <span className="access-badge-icon">⏳</span>
        <span className="access-badge-text">Loading...</span>
      </div>
    );
  }

  if (!badge) {
    return null;
  }

  return (
    <div 
      className={`access-badge ${badge.color} ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title={badge.description}
    >
      <span className="access-badge-icon" role="img" aria-label={badge.text}>
        {badge.icon}
      </span>
      <span className="access-badge-text">
        {badge.text}
      </span>
      
      {showTooltip && (
        <div className="access-badge-tooltip">
          <div className="tooltip-content">
            <strong>{badge.text}</strong>
            <p>{badge.description}</p>
            {repo && (
              <small>Repository: {owner}/{repo}</small>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessBadge;
