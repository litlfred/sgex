import React, { useState, useEffect } from 'react';
import { PageLayout, AssetEditorLayout, useDAKParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import './RequirementsEditor.css';

/**
 * RequirementsEditor Component
 * 
 * Editor for WHO SMART Guidelines Functional and Non-Functional Requirements
 * Based on the WHO smart-base logical models:
 * - FunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-FunctionalRequirement.html
 * - NonFunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-NonFunctionalRequirement.html
 * 
 * Supports creating, editing, and deleting FSH files for requirements.
 */

const RequirementsEditor = () => {
  return (
    <PageLayout pageName="functional-requirements">
      <RequirementsEditorContent />
    </PageLayout>
  );
};

const RequirementsEditorContent = () => {
  const { repository, branch, isLoading: pageLoading } = useDAKParams();
  
  // Component state
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [requirementContent, setRequirementContent] = useState(null);
  const [requirementType, setRequirementType] = useState('functional'); // 'functional' or 'nonfunctional'
  const [showCreateNew, setShowCreateNew] = useState(false);

  // Extract user and repo from repository
  const user = repository?.owner?.login || repository?.full_name?.split('/')[0];
  const repo = repository?.name || repository?.full_name?.split('/')[1];

  // Fetch requirements FSH files from input/fsh/requirements directory
  useEffect(() => {
    const fetchRequirements = async () => {
      if (!user || !repo || !branch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch the input/fsh/requirements directory
        let requirementFiles = [];
        try {
          const fshRequirementsContents = await githubService.getDirectoryContents(
            user,
            repo,
            'input/fsh/requirements',
            branch
          );

          // Filter for .fsh files
          requirementFiles = fshRequirementsContents
            .filter(file => file.name.endsWith('.fsh') && file.type === 'file')
            .map(file => ({
              name: file.name,
              path: file.path,
              download_url: file.download_url,
              html_url: file.html_url,
              sha: file.sha
            }));
        } catch (err) {
          if (err.status !== 404) {
            throw err;
          }
          // Directory doesn't exist yet - that's OK
        }

        setRequirements(requirementFiles);
      } catch (err) {
        console.error('Error fetching requirements:', err);
        setError('Failed to load requirements files');
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [user, repo, branch]);

  // Load requirement content when selected
  const handleRequirementSelect = async (requirement) => {
    setSelectedRequirement(requirement);
    setEditing(true);
    setShowCreateNew(false);

    try {
      const response = await fetch(requirement.download_url);
      const content = await response.text();
      
      setRequirementContent(content);
      
      // Detect type from filename or content
      if (requirement.name.toLowerCase().includes('nonfunctional') || 
          requirement.name.toLowerCase().includes('non-functional')) {
        setRequirementType('nonfunctional');
      } else {
        setRequirementType('functional');
      }
    } catch (err) {
      console.error('Error loading requirement:', err);
      setError('Failed to load requirement content');
    }
  };

  // Create new requirement
  const handleCreateNew = (type) => {
    setRequirementType(type);
    setShowCreateNew(true);
    setEditing(true);
    setSelectedRequirement(null);
    
    const template = type === 'functional' 
      ? generateFunctionalRequirementTemplate()
      : generateNonFunctionalRequirementTemplate();
    
    setRequirementContent(template);
  };

  // Save requirement
  const handleSave = async () => {
    if (!requirementContent) return;

    try {
      const fileName = showCreateNew 
        ? `${requirementType === 'functional' ? 'Functional' : 'NonFunctional'}Requirement-${Date.now()}.fsh`
        : selectedRequirement.name;

      const filePath = `input/fsh/requirements/${fileName}`;
      const commitMessage = showCreateNew
        ? `Add ${requirementType} requirement: ${fileName}`
        : `Update ${requirementType} requirement: ${fileName}`;

      await githubService.createOrUpdateFile(
        user,
        repo,
        filePath,
        requirementContent,
        commitMessage,
        branch,
        showCreateNew ? null : selectedRequirement.sha
      );

      // Refresh requirements list
      const updatedRequirements = [...requirements];
      if (showCreateNew) {
        updatedRequirements.push({
          name: fileName,
          path: filePath,
          download_url: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`,
          html_url: `https://github.com/${user}/${repo}/blob/${branch}/${filePath}`
        });
      }
      setRequirements(updatedRequirements);

      // Reset state
      setEditing(false);
      setShowCreateNew(false);
      setSelectedRequirement(null);
      setRequirementContent(null);
      
    } catch (err) {
      console.error('Error saving requirement:', err);
      setError('Failed to save requirement');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    setShowCreateNew(false);
    setSelectedRequirement(null);
    setRequirementContent(null);
    setRequirementType('functional');
  };

  // Delete requirement
  const handleDelete = async () => {
    if (!selectedRequirement) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedRequirement.name}?`
    );
    
    if (!confirmDelete) return;

    try {
      await githubService.deleteFile(
        user,
        repo,
        selectedRequirement.path,
        `Delete requirement: ${selectedRequirement.name}`,
        branch,
        selectedRequirement.sha
      );

      // Remove from list
      setRequirements(requirements.filter(r => r.name !== selectedRequirement.name));
      
      // Reset state
      setEditing(false);
      setSelectedRequirement(null);
      setRequirementContent(null);
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setError('Failed to delete requirement');
    }
  };

  if (pageLoading || loading) {
    return (
      <div className="requirements-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading requirements...</p>
      </div>
    );
  }

  return (
    <AssetEditorLayout
      title="Functional and Non-Functional Requirements"
      subtitle="System requirements specifications that define capabilities and constraints"
    >
      <div className="requirements-editor">
        <ContextualHelpMascot pageId="functional-requirements" />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="requirements-layout">
          {/* Left sidebar - Requirements list */}
          <div className="requirements-sidebar">
            <div className="sidebar-header">
              <h3>Requirements ({requirements.length})</h3>
              <div className="create-buttons">
                <button 
                  className="btn-create-functional"
                  onClick={() => handleCreateNew('functional')}
                  title="Create Functional Requirement"
                >
                  + Functional
                </button>
                <button 
                  className="btn-create-nonfunctional"
                  onClick={() => handleCreateNew('nonfunctional')}
                  title="Create Non-Functional Requirement"
                >
                  + Non-Functional
                </button>
              </div>
            </div>

            <div className="requirements-list">
              {requirements.length === 0 ? (
                <div className="no-requirements">
                  <p>No requirements found.</p>
                  <p>Create a new functional or non-functional requirement to get started.</p>
                </div>
              ) : (
                requirements.map(req => (
                  <div
                    key={req.path}
                    className={`requirement-item ${selectedRequirement?.path === req.path ? 'selected' : ''}`}
                    onClick={() => handleRequirementSelect(req)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRequirementSelect(req);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select requirement ${req.name}`}
                  >
                    <div className="requirement-icon">
                      {req.name.toLowerCase().includes('nonfunctional') || 
                       req.name.toLowerCase().includes('non-functional') ? '📋' : '⚙️'}
                    </div>
                    <div className="requirement-name">{req.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel - Editor */}
          <div className="requirements-editor-panel">
            {!editing ? (
              <div className="requirements-welcome">
                <h2>Requirements Editor</h2>
                <p>
                  Select a requirement from the list or create a new one to get started.
                </p>
                <div className="requirements-info">
                  <h3>About Requirements</h3>
                  <p>
                    Requirements define the system capabilities and constraints for a DAK implementation.
                  </p>
                  <ul>
                    <li><strong>Functional Requirements:</strong> Define what the system must do (capabilities, features, behaviors)</li>
                    <li><strong>Non-Functional Requirements:</strong> Define how the system should perform (performance, security, usability)</li>
                  </ul>
                  <p>
                    Requirements are stored as FSH (FHIR Shorthand) files in <code>input/fsh/requirements/</code>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="requirement-editor">
                <div className="editor-header">
                  <h3>
                    {showCreateNew ? 'New ' : 'Edit '}
                    {requirementType === 'functional' ? 'Functional' : 'Non-Functional'} Requirement
                  </h3>
                  <div className="editor-actions">
                    {!showCreateNew && (
                      <button className="btn-delete" onClick={handleDelete}>
                        🗑️ Delete
                      </button>
                    )}
                    <button className="btn-cancel" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                      💾 Save
                    </button>
                  </div>
                </div>

                <div className="editor-content">
                  <textarea
                    className="fsh-editor"
                    value={requirementContent || ''}
                    onChange={(e) => setRequirementContent(e.target.value)}
                    placeholder="Enter FSH content..."
                    spellCheck="false"
                  />
                </div>

                <div className="editor-help">
                  <h4>FSH Format</h4>
                  {requirementType === 'functional' ? (
                    <div>
                      <p>Functional requirements should include:</p>
                      <ul>
                        <li><code>id</code>: Requirement identifier (required)</li>
                        <li><code>activity</code>: Description of the activity (required)</li>
                        <li><code>actor</code>: Reference to actors (optional)</li>
                        <li><code>capability</code>: "I want" statement (optional)</li>
                        <li><code>benefit</code>: "So that" statement (optional)</li>
                        <li><code>classification</code>: Classification codes (optional)</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p>Non-functional requirements should include:</p>
                      <ul>
                        <li><code>id</code>: Requirement identifier (required)</li>
                        <li><code>requirement</code>: Requirement description (required)</li>
                        <li><code>category</code>: Category code (optional)</li>
                        <li><code>classification</code>: Classification codes (optional)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AssetEditorLayout>
  );
};

// Generate template for functional requirement based on WHO smart-base model
function generateFunctionalRequirementTemplate() {
  return `Logical: NewFunctionalRequirement
Title: "New Functional Requirement"
Description: "Description of the functional requirement"
Parent: FunctionalRequirement

* id = "FR-NEW-001"
* activity = "Description of the activity being performed"
* actor = Reference(ActorName) // Optional: Reference to actor
* capability = "I want to..." // Optional: Capability statement
* benefit = "So that..." // Optional: Benefit statement
* classification = #category // Optional: Classification code
`;
}

// Generate template for non-functional requirement based on WHO smart-base model
function generateNonFunctionalRequirementTemplate() {
  return `Logical: NewNonFunctionalRequirement
Title: "New Non-Functional Requirement"
Description: "Description of the non-functional requirement"
Parent: NonFunctionalRequirement

* id = "NFR-NEW-001"
* requirement = "Description of the non-functional requirement"
* category = #performance // Optional: Category (e.g., #performance, #security, #usability)
* classification = #category // Optional: Classification code
`;
}

export default RequirementsEditor;
