import React, { useState, useRef, useEffect } from 'react';
import PATManagementModal from './PATManagementModal';
import './SettingsMenu.css';

const SettingsMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPATModal, setShowPATModal] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handlePATManagement = () => {
    setIsOpen(false);
    setShowPATModal(true);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleDocumentation = () => {
    setIsOpen(false);
    window.open('/sgex/docs/overview', '_blank');
  };

  return (
    <>
      <div className="settings-menu" ref={menuRef}>
        <button 
          className="user-avatar-btn"
          onClick={toggleMenu}
          aria-label="User settings menu"
        >
          <img 
            src={user?.avatar_url} 
            alt="User avatar" 
            className="user-avatar" 
          />
          <span className="user-name">{user?.name || user?.login}</span>
          <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="settings-dropdown">
            <div className="dropdown-header">
              <img 
                src={user?.avatar_url} 
                alt="User avatar" 
                className="dropdown-avatar" 
              />
              <div className="user-info">
                <div className="user-display-name">{user?.name || user?.login}</div>
                <div className="user-username">@{user?.login}</div>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item"
              onClick={handlePATManagement}
            >
              <span className="dropdown-icon">🔑</span>
              Manage Access Tokens
            </button>
            
            <button 
              className="dropdown-item"
              onClick={handleDocumentation}
            >
              <span className="dropdown-icon">📖</span>
              Documentation
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <span className="dropdown-icon">🚪</span>
              Sign out
            </button>
          </div>
        )}
      </div>

      {showPATModal && (
        <PATManagementModal
          onClose={() => setShowPATModal(false)}
        />
      )}
    </>
  );
};

export default SettingsMenu;