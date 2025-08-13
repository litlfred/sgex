import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleNavigationClick, constructFullUrl } from '../utils/navigationUtils';
import './ActionCard.css';

/**
 * Reusable ActionCard component that provides:
 * - Direct navigation on click
 * - URL preview on right-click and long-press
 * - Accessibility support
 * - Consistent interaction patterns
 */
const ActionCard = ({
  children,
  href,
  navigationState = null,
  className = '',
  ariaLabel = '',
  onNavigate = null,
  disabled = false,
  ...props
}) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);
  const cardRef = useRef(null);

  // Clear context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && cardRef.current && !cardRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [contextMenu]);

  // Handle direct navigation
  const handleClick = (event) => {
    if (disabled) return;
    
    // Don't navigate if context menu is open
    if (contextMenu) {
      setContextMenu(null);
      return;
    }

    if (href) {
      // Call custom onNavigate handler if provided
      if (onNavigate) {
        onNavigate(event, href, navigationState);
      } else {
        handleNavigationClick(event, href, navigate, navigationState);
      }
    }
  };

  // Handle context menu (right-click)
  const handleContextMenu = (event) => {
    if (disabled || !href) return;
    
    event.preventDefault();
    const rect = cardRef.current.getBoundingClientRect();
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      url: constructFullUrl(href),
      position: {
        top: event.clientY - rect.top,
        left: event.clientX - rect.left
      }
    });
  };

  // Handle long press for mobile
  const handleTouchStart = (event) => {
    if (disabled || !href) return;
    
    const timeout = setTimeout(() => {
      const touch = event.touches[0];
      const rect = cardRef.current.getBoundingClientRect();
      
      setContextMenu({
        x: touch.clientX,
        y: touch.clientY,
        url: constructFullUrl(href),
        position: {
          top: touch.clientY - rect.top,
          left: touch.clientX - rect.left
        }
      });
    }, 500); // 500ms long press
    
    setLongPressTimeout(timeout);
  };

  const handleTouchEnd = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    } else if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
      event.preventDefault();
      handleContextMenu({
        preventDefault: () => {},
        clientX: cardRef.current.getBoundingClientRect().left + 50,
        clientY: cardRef.current.getBoundingClientRect().top + 50
      });
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = () => {
    if (contextMenu?.url) {
      navigator.clipboard.writeText(contextMenu.url).then(() => {
        setContextMenu(null);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = contextMenu.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setContextMenu(null);
      });
    }
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    if (contextMenu?.url) {
      window.open(contextMenu.url, '_blank', 'noopener,noreferrer');
      setContextMenu(null);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`action-card ${className} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      style={{ position: 'relative' }}
      {...props}
    >
      {children}
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="action-card-context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000
          }}
        >
          <div className="context-menu-content">
            <div className="context-menu-url">
              <span className="url-label">Destination:</span>
              <span className="url-text" title={contextMenu.url}>
                {contextMenu.url}
              </span>
            </div>
            <div className="context-menu-actions">
              <button
                className="context-menu-item"
                onClick={handleClick}
              >
                <span className="menu-icon">↗️</span>
                Open
              </button>
              <button
                className="context-menu-item"
                onClick={handleOpenInNewTab}
              >
                <span className="menu-icon">🗗</span>
                Open in New Tab
              </button>
              <button
                className="context-menu-item"
                onClick={handleCopyUrl}
              >
                <span className="menu-icon">📋</span>
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionCard;