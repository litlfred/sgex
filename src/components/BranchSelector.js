import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import './BranchSelector.css';

const BranchSelector = ({ 
  repository, 
  selectedBranch, 
  onBranchChange, 
  className = '' 
}) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!repository) return;

      try {
        setLoading(true);
        setError(null);
        
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const branchData = await githubService.getBranches(owner, repository.name);
        
        setBranches(branchData);
        
        // If no branch is selected, default to 'main' or the default branch
        if (!selectedBranch) {
          const mainBranch = branchData.find(b => b.name === 'main') || 
                            branchData.find(b => b.name === repository.default_branch) ||
                            branchData[0];
          if (mainBranch && onBranchChange) {
            onBranchChange(mainBranch.name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [repository, selectedBranch, onBranchChange]);

  const handleBranchSelect = (branchName) => {
    if (onBranchChange) {
      onBranchChange(branchName);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      setCreateError('Branch name is required');
      return;
    }

    // Validate branch name (basic GitHub rules)
    const branchNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!branchNameRegex.test(newBranchName)) {
      setCreateError('Branch name can only contain letters, numbers, periods, hyphens, and underscores');
      return;
    }

    if (branches.some(b => b.name === newBranchName)) {
      setCreateError('A branch with this name already exists');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const sourceBranch = selectedBranch || 'main';
      
      await githubService.createBranch(owner, repository.name, newBranchName, sourceBranch);
      
      // Refresh branches list
      const updatedBranches = await githubService.getBranches(owner, repository.name);
      setBranches(updatedBranches);
      
      // Select the new branch
      handleBranchSelect(newBranchName);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewBranchName('');
    } catch (err) {
      console.error('Failed to create branch:', err);
      setCreateError('Failed to create branch. Please check your permissions.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={`branch-selector loading ${className}`}>
        <span className="branch-icon">🌿</span>
        <span>Loading branches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`branch-selector error ${className}`}>
        <span className="branch-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={`branch-selector ${className}`}>
      <div className="branch-selector-main">
        <span className="branch-icon">🌿</span>
        <select 
          value={selectedBranch || ''} 
          onChange={(e) => handleBranchSelect(e.target.value)}
          className="branch-select"
        >
          {branches.map((branch) => (
            <option key={branch.name} value={branch.name}>
              {branch.name}
              {branch.name === repository.default_branch && ' (default)'}
            </option>
          ))}
        </select>
        <button 
          className="create-branch-btn"
          onClick={() => setShowCreateModal(true)}
          title="Create new branch"
        >
          +
        </button>
      </div>

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="create-branch-modal-overlay">
          <div className="create-branch-modal">
            <div className="modal-header">
              <h3>Create New Branch</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBranchName('');
                  setCreateError(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="branchName">Branch Name:</label>
                <input
                  id="branchName"
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/new-dak-component"
                  className="branch-name-input"
                />
              </div>
              <div className="form-group">
                <label>Create from:</label>
                <span className="source-branch">{selectedBranch || 'main'}</span>
              </div>
              {createError && (
                <div className="error-message">{createError}</div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBranchName('');
                  setCreateError(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateBranch}
                disabled={creating || !newBranchName.trim()}
              >
                {creating ? 'Creating...' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;