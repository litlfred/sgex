import React, { useState, useEffect } from 'react';
import { PageLayout, useDAKParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import requirementsService from '../services/requirementsService';
import stagingGroundService from '../services/stagingGroundService';
import { escapeFSHString, extractFSHMetadata } from '@sgex/dak-core/dist/browser';
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [requirementType, setRequirementType] = useState('functional'); // 'functional' or 'nonfunctional'
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showFSHPreview, setShowFSHPreview] = useState(false);
  const [fshPreview, setFSHPreview] = useState('');
  const [idValidationError, setIdValidationError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form data for functional requirement
  const [functionalReq, setFunctionalReq] = useState({
    id: '',
    title: '',
    description: '',
    activity: '',
    actor: '',
    capability: '',
    benefit: '',
    classification: ''
  });
  
  // Form data for non-functional requirement
  const [nonFunctionalReq, setNonFunctionalReq] = useState({
    id: '',
    title: '',
    description: '',
    requirement: '',
    category: '',
    classification: ''
  });

  // Handle ID change with validation
  const handleIdChange = (newId, isFunctional) => {
    if (isFunctional) {
      setFunctionalReq({...functionalReq, id: newId});
    } else {
      setNonFunctionalReq({...nonFunctionalReq, id: newId});
    }
    
    // Validate ID in real-time
    if (newId) {
      const validation = requirementsService.validateRequirementId(newId);
      setIdValidationError(validation.isValid ? null : validation.error);
    } else {
      setIdValidationError(null);
    }
  };

  // Extract user and repo from repository
  const user = repository?.owner?.login || repository?.full_name?.split('/')[0];
  const repo = repository?.name || repository?.full_name?.split('/')[1];

  // Initialize staging ground when repository and branch are available
  useEffect(() => {
    if (repository && branch) {
      try {
        stagingGroundService.initialize(repository, branch);
      } catch (error) {
        console.error('Error initializing staging ground:', error);
      }
    }
  }, [repository, branch]);

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
      
      // Use extractFSHMetadata to parse the FSH content
      try {
        const metadata = await extractFSHMetadata(content);
        
        // Determine type from metadata or filename
        const isNonFunctional = metadata.name?.toLowerCase().includes('nonfunctional') || 
            metadata.name?.toLowerCase().includes('non-functional') ||
            requirement.name.toLowerCase().includes('nonfunctional') || 
            requirement.name.toLowerCase().includes('non-functional');
        
        setRequirementType(isNonFunctional ? 'nonfunctional' : 'functional');
        
        // Parse FSH content into form fields
        if (isNonFunctional) {
          setNonFunctionalReq({
            id: parseFSHValue(content, 'id') || '',
            title: metadata.title || '',
            description: metadata.description || '',
            requirement: parseFSHValue(content, 'requirement') || '',
            category: parseFSHValue(content, 'category') || '',
            classification: parseFSHValue(content, 'classification') || ''
          });
        } else {
          setFunctionalReq({
            id: parseFSHValue(content, 'id') || '',
            title: metadata.title || '',
            description: metadata.description || '',
            activity: parseFSHValue(content, 'activity') || '',
            actor: parseFSHValue(content, 'actor') || '',
            capability: parseFSHValue(content, 'capability') || '',
            benefit: parseFSHValue(content, 'benefit') || '',
            classification: parseFSHValue(content, 'classification') || ''
          });
        }
      } catch (metaErr) {
        console.warn('Could not parse FSH metadata:', metaErr);
        setError('Failed to parse requirement content');
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
    
    // Reset form fields
    if (type === 'functional') {
      setFunctionalReq({
        id: '',
        title: '',
        description: '',
        activity: '',
        actor: '',
        capability: '',
        benefit: '',
        classification: ''
      });
    } else {
      setNonFunctionalReq({
        id: '',
        title: '',
        description: '',
        requirement: '',
        category: '',
        classification: ''
      });
    }
  };

  // Generate FSH from form data
  const generateFSHFromForm = () => {
    if (requirementType === 'functional') {
      const req = functionalReq;
      const logicalName = req.id || 'NewFunctionalRequirement';
      const header = generateLogicalModelHeader(
        logicalName,
        req.title || 'New Functional Requirement',
        req.description || 'Description of the functional requirement',
        'FunctionalRequirement'
      );
      
      const fields = [];
      if (req.id) fields.push(`* id = "${req.id}"`);
      if (req.activity) fields.push(`* activity = "${escapeFSHString(req.activity)}"`);
      if (req.actor) fields.push(`* actor = Reference(${req.actor})`);
      if (req.capability) fields.push(`* capability = "${escapeFSHString(req.capability)}"`);
      if (req.benefit) fields.push(`* benefit = "${escapeFSHString(req.benefit)}"`);
      if (req.classification) fields.push(`* classification = #${req.classification}`);
      
      return `${header}\n\n${fields.join('\n')}\n`;
    } else {
      const req = nonFunctionalReq;
      const logicalName = req.id || 'NewNonFunctionalRequirement';
      const header = generateLogicalModelHeader(
        logicalName,
        req.title || 'New Non-Functional Requirement',
        req.description || 'Description of the non-functional requirement',
        'NonFunctionalRequirement'
      );
      
      const fields = [];
      if (req.id) fields.push(`* id = "${req.id}"`);
      if (req.requirement) fields.push(`* requirement = "${escapeFSHString(req.requirement)}"`);
      if (req.category) fields.push(`* category = #${req.category}`);
      if (req.classification) fields.push(`* classification = #${req.classification}`);
      
      return `${header}\n\n${fields.join('\n')}\n`;
    }
  };

  // Show FSH preview
  const handlePreviewFSH = () => {
    const fsh = generateFSHFromForm();
    setFSHPreview(fsh);
    setShowFSHPreview(true);
  };

  // Save requirement
  const handleSave = () => {
    const currentReq = requirementType === 'functional' ? functionalReq : nonFunctionalReq;
    
    if (!currentReq.id) {
      setError('Please provide a requirement ID');
      return;
    }

    // Validate ID according to WHO IG Starter Kit naming conventions
    const idValidation = requirementsService.validateRequirementId(currentReq.id);
    if (!idValidation.isValid) {
      setError(idValidation.error);
      return;
    }

    try {
      // Save to staging ground - this handles FSH generation and staging
      const result = requirementsService.saveToStagingGround(currentReq, requirementType);
      
      if (result.success) {
        // Show success message
        setSuccessMessage(`Requirement ${currentReq.id} saved to staging ground successfully! Use the staging ground to commit your changes.`);
        
        // Reset state
        setEditing(false);
        setShowCreateNew(false);
        setSelectedRequirement(null);
        setError(null);
        setIdValidationError(null);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Failed to save requirement to staging ground');
      }
    } catch (err) {
      console.error('Error saving requirement:', err);
      setError(err.message || 'Failed to save requirement to staging ground');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    setShowCreateNew(false);
    setSelectedRequirement(null);
    setRequirementType('functional');
    setError(null);
    setIdValidationError(null);
  };

  // Delete requirement
  const handleDelete = async () => {
    if (!selectedRequirement) return;
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedRequirement) return;

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
      setShowDeleteConfirm(false);
      setSuccessMessage(`Requirement ${selectedRequirement.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setError(err.message || 'Failed to delete requirement');
      setShowDeleteConfirm(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
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
    <div className="requirements-editor">
      <ContextualHelpMascot pageId="functional-requirements" />

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
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
                    <button className="btn-preview" onClick={handlePreviewFSH}>
                      👁️ Preview FSH
                    </button>
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
                  {requirementType === 'functional' ? (
                    <div className="form-fields">
                      <div className="form-group">
                        <label htmlFor="req-id">Requirement ID *</label>
                        <input
                          type="text"
                          id="req-id"
                          value={functionalReq.id}
                          onChange={(e) => handleIdChange(e.target.value, true)}
                          placeholder="e.g., FunctionalReq001 or Functional-Req-001"
                          required
                          className={idValidationError ? 'input-error' : ''}
                        />
                        {idValidationError ? (
                          <span className="error-text">{idValidationError}</span>
                        ) : (
                          <span className="help-text">Must start with capital letter, no underscores. Hyphens allowed but not preferred.</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-title">Title *</label>
                        <input
                          type="text"
                          id="req-title"
                          value={functionalReq.title}
                          onChange={(e) => setFunctionalReq({...functionalReq, title: e.target.value})}
                          placeholder="e.g., Patient Registration"
                          required
                        />
                        <span className="help-text">Short descriptive title</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-description">Description</label>
                        <textarea
                          id="req-description"
                          value={functionalReq.description}
                          onChange={(e) => setFunctionalReq({...functionalReq, description: e.target.value})}
                          placeholder="Detailed description of the functional requirement"
                          rows="3"
                        />
                        <span className="help-text">Detailed explanation of the requirement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-activity">Activity *</label>
                        <textarea
                          id="req-activity"
                          value={functionalReq.activity}
                          onChange={(e) => setFunctionalReq({...functionalReq, activity: e.target.value})}
                          placeholder="Description of the activity being performed"
                          rows="2"
                          required
                        />
                        <span className="help-text">What activity is being performed</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-actor">Actor</label>
                        <input
                          type="text"
                          id="req-actor"
                          value={functionalReq.actor}
                          onChange={(e) => setFunctionalReq({...functionalReq, actor: e.target.value})}
                          placeholder="e.g., HealthWorker"
                        />
                        <span className="help-text">Actor reference (who performs this)</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-capability">Capability ("I want to...")</label>
                        <textarea
                          id="req-capability"
                          value={functionalReq.capability}
                          onChange={(e) => setFunctionalReq({...functionalReq, capability: e.target.value})}
                          placeholder="I want to..."
                          rows="2"
                        />
                        <span className="help-text">User story capability statement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-benefit">Benefit ("So that...")</label>
                        <textarea
                          id="req-benefit"
                          value={functionalReq.benefit}
                          onChange={(e) => setFunctionalReq({...functionalReq, benefit: e.target.value})}
                          placeholder="So that..."
                          rows="2"
                        />
                        <span className="help-text">User story benefit statement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="req-classification">Classification</label>
                        <input
                          type="text"
                          id="req-classification"
                          value={functionalReq.classification}
                          onChange={(e) => setFunctionalReq({...functionalReq, classification: e.target.value})}
                          placeholder="e.g., registration"
                        />
                        <span className="help-text">Classification code (optional)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="form-fields">
                      <div className="form-group">
                        <label htmlFor="nfr-id">Requirement ID *</label>
                        <input
                          type="text"
                          id="nfr-id"
                          value={nonFunctionalReq.id}
                          onChange={(e) => handleIdChange(e.target.value, false)}
                          placeholder="e.g., NonFunctionalReq001 or NonFunctional-Req-001"
                          required
                          className={idValidationError ? 'input-error' : ''}
                        />
                        {idValidationError ? (
                          <span className="error-text">{idValidationError}</span>
                        ) : (
                          <span className="help-text">Must start with capital letter, no underscores. Hyphens allowed but not preferred.</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="nfr-title">Title *</label>
                        <input
                          type="text"
                          id="nfr-title"
                          value={nonFunctionalReq.title}
                          onChange={(e) => setNonFunctionalReq({...nonFunctionalReq, title: e.target.value})}
                          placeholder="e.g., Response Time"
                          required
                        />
                        <span className="help-text">Short descriptive title</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="nfr-description">Description</label>
                        <textarea
                          id="nfr-description"
                          value={nonFunctionalReq.description}
                          onChange={(e) => setNonFunctionalReq({...nonFunctionalReq, description: e.target.value})}
                          placeholder="Detailed description of the non-functional requirement"
                          rows="3"
                        />
                        <span className="help-text">Detailed explanation of the requirement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="nfr-requirement">Requirement *</label>
                        <textarea
                          id="nfr-requirement"
                          value={nonFunctionalReq.requirement}
                          onChange={(e) => setNonFunctionalReq({...nonFunctionalReq, requirement: e.target.value})}
                          placeholder="The system SHALL..."
                          rows="3"
                          required
                        />
                        <span className="help-text">Description of the requirement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="nfr-category">Category</label>
                        <select
                          id="nfr-category"
                          value={nonFunctionalReq.category}
                          onChange={(e) => setNonFunctionalReq({...nonFunctionalReq, category: e.target.value})}
                        >
                          <option value="">Select category...</option>
                          <option value="performance">Performance</option>
                          <option value="security">Security</option>
                          <option value="usability">Usability</option>
                          <option value="reliability">Reliability</option>
                          <option value="scalability">Scalability</option>
                          <option value="maintainability">Maintainability</option>
                          <option value="accessibility">Accessibility</option>
                        </select>
                        <span className="help-text">Category of non-functional requirement</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="nfr-classification">Classification</label>
                        <input
                          type="text"
                          id="nfr-classification"
                          value={nonFunctionalReq.classification}
                          onChange={(e) => setNonFunctionalReq({...nonFunctionalReq, classification: e.target.value})}
                          placeholder="e.g., quality"
                        />
                        <span className="help-text">Classification code (optional)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FSH Preview Modal */}
        {showFSHPreview && (
          <div 
            className="modal-overlay" 
            onClick={() => setShowFSHPreview(false)}
            role="presentation"
          >
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-labelledby="fsh-preview-title"
              aria-modal="true"
            >
              <div className="modal-header">
                <h3 id="fsh-preview-title">FSH Preview</h3>
                <button 
                  onClick={() => setShowFSHPreview(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <pre className="fsh-preview">{fshPreview}</pre>
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(fshPreview);
                    setSuccessMessage('FSH copied to clipboard!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }}
                  className="copy-btn"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && selectedRequirement && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <h3>⚠️ Delete Requirement</h3>
              <p>Are you sure you want to delete <strong>{selectedRequirement.name}</strong>?</p>
              <p>This action cannot be undone.</p>
              <div className="confirm-dialog-buttons">
                <button className="btn-cancel" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn-delete" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

// Helper function to generate FSH header for Logical models
// Uses escapeFSHString from @sgex/dak-core
function generateLogicalModelHeader(id, title, description, parent) {
  const lines = [];
  lines.push(`Logical: ${id}`);
  lines.push(`Title: "${escapeFSHString(title)}"`);
  lines.push(`Description: "${escapeFSHString(description)}"`);
  if (parent) {
    lines.push(`Parent: ${parent}`);
  }
  return lines.join('\n');
}

// Helper function to parse FSH field values
function parseFSHValue(fshContent, fieldName) {
  // Pattern to match FSH field assignments
  const patterns = [
    new RegExp(`\\*\\s*${fieldName}\\s*=\\s*"([^"]*)"`, 'i'),  // * field = "value"
    new RegExp(`\\*\\s*${fieldName}\\s*=\\s*#(\\S+)`, 'i'),     // * field = #code
    new RegExp(`\\*\\s*${fieldName}\\s*=\\s*Reference\\(([^)]+)\\)`, 'i') // * field = Reference(Actor)
  ];
  
  for (const pattern of patterns) {
    const match = fshContent.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

export default RequirementsEditor;
