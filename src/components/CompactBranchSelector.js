import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import './CompactBranchSelector.css';

const CompactBranchSelector = ({ 
  repository, 
  selectedBranch, 
  onBranchChange, 
  className = '' 
}) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranches, setFilteredBranches] = useState([]);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch branches when repository changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (!repository) return;

      try {
        setLoading(true);
        setError(null);
        
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const branchData = await githubService.getBranches(owner, repository.name);
        
        // Sort branches alphabetically
        const sortedBranches = branchData.sort((a, b) => a.name.localeCompare(b.name));
        setBranches(sortedBranches);
        setFilteredBranches(sortedBranches);
        
      } catch (err) {
        console.error('Failed to fetch branches:', err);
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [repository]);

  // Filter branches based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
  }, [searchTerm, branches]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleBranchSelect = (branchName) => {
    if (onBranchChange) {
      onBranchChange(branchName);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (branches.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (event.key === 'Enter' && filteredBranches.length === 1) {
      handleBranchSelect(filteredBranches[0].name);
    }
  };

  if (loading) {
    return (
      <div className={`compact-branch-selector loading ${className}`}>
        <span className="branch-icon">🌿</span>
        <span className="branch-text">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`compact-branch-selector error ${className}`}>
        <span className="branch-icon">⚠️</span>
        <span className="branch-text">{selectedBranch || 'main'}</span>
      </div>
    );
  }

  if (!branches.length) {
    return (
      <div className={`compact-branch-selector ${className}`}>
        <span className="branch-icon">🌿</span>
        <span className="branch-text">{selectedBranch || 'main'}</span>
      </div>
    );
  }

  return (
    <div className={`compact-branch-selector ${className}`} ref={dropdownRef}>
      <button 
        className="branch-button"
        onClick={handleToggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select branch"
      >
        <span className="branch-icon">🌿</span>
        <span className="branch-text">{selectedBranch}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="branch-dropdown">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              className="branch-search"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <ul className="branch-list" role="listbox">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <li 
                  key={branch.name} 
                  className={`branch-item ${branch.name === selectedBranch ? 'selected' : ''}`}
                  role="option"
                  aria-selected={branch.name === selectedBranch}
                  onClick={() => handleBranchSelect(branch.name)}
                >
                  <span className="branch-name">{branch.name}</span>
                  {branch.name === repository.default_branch && (
                    <span className="default-badge">default</span>
                  )}
                </li>
              ))
            ) : (
              <li className="no-results">No branches found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompactBranchSelector;