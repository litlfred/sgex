import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import actorDefinitionService from '../services/actorDefinitionService';
import { PageLayout, useDAKParams } from './framework';

const ActorEditor = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = useDAKParams();
  
  // For now, we'll set editActorId to null since it's not in URL params
  // This could be enhanced later to support URL-based actor editing
  const editActorId = null;

  // State management
  const [actorDefinition, setActorDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [fshPreview, setFshPreview] = useState('');
  const [stagedActors, setStagedActors] = useState([]);
  const [showActorList, setShowActorList] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize component
  useEffect(() => {
    const initializeEditor = async () => {
      setLoading(true);
      
      try {
        if (editActorId) {
          // Load existing actor from staging ground
          const result = actorDefinitionService.getFromStagingGround(editActorId);
          if (result) {
            setActorDefinition(result.actorDefinition);
          } else {
            // Actor not found, create new one
            setActorDefinition(actorDefinitionService.createEmptyActorDefinition());
          }
        } else {
          // Create new actor
          setActorDefinition(actorDefinitionService.createEmptyActorDefinition());
        }
        
        // Load list of staged actors
        setStagedActors(actorDefinitionService.listStagedActors());
        
      } catch (error) {
        console.error('Error initializing actor editor:', error);
        setErrors({ general: 'Failed to initialize editor' });
      }
      
      setLoading(false);
    };

    initializeEditor();
  }, [editActorId]);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setActorDefinition(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle nested field changes
  const handleNestedFieldChange = useCallback((parentField, index, field, value) => {
    setActorDefinition(prev => {
      const newDefinition = { ...prev };
      if (!newDefinition[parentField]) {
        newDefinition[parentField] = [];
      }
      
      if (!newDefinition[parentField][index]) {
        newDefinition[parentField][index] = {};
      }
      
      newDefinition[parentField][index][field] = value;
      return newDefinition;
    });
  }, []);

  // Add new item to array fields
  const addArrayItem = useCallback((field, defaultItem = {}) => {
    setActorDefinition(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem]
    }));
  }, []);

  // Remove item from array fields
  const removeArrayItem = useCallback((field, index) => {
    setActorDefinition(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!actorDefinition) return false;
    
    const validation = actorDefinitionService.validateActorDefinition(actorDefinition);
    
    if (!validation.isValid) {
      const fieldErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('ID')) fieldErrors.id = error;
        else if (error.includes('Name')) fieldErrors.name = error;
        else if (error.includes('Description')) fieldErrors.description = error;
        else if (error.includes('type')) fieldErrors.type = error;
        else if (error.includes('role')) fieldErrors.roles = error;
        else fieldErrors.general = error;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [actorDefinition]);

  // Save actor definition
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const result = await actorDefinitionService.saveToStagingGround(actorDefinition);
      
      if (result.success) {
        // Refresh staged actors list
        setStagedActors(actorDefinitionService.listStagedActors());
        
        // Show success message (could be a toast notification)
        alert('Actor definition saved to staging ground successfully!');
        
        // Update the URL to reflect we're now editing this actor
        if (!editActorId) {
          navigate(`/actor-editor/${profile?.login}/${repository?.name}${branch && branch !== 'main' ? `/${branch}` : ''}`);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Error saving actor definition:', error);
      setErrors({ general: 'Failed to save actor definition' });
    }
    
    setSaving(false);
  };

  // Generate FSH preview
  const generatePreview = useCallback(() => {
    if (!actorDefinition) return;
    
    try {
      const fsh = actorDefinitionService.generateFSH(actorDefinition);
      setFshPreview(fsh);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating FSH preview:', error);
      setErrors({ general: 'Failed to generate FSH preview' });
    }
  }, [actorDefinition]);

  // Load actor template
  const loadTemplate = (template) => {
    setActorDefinition({
      ...actorDefinitionService.createEmptyActorDefinition(),
      ...template,
      metadata: {
        ...actorDefinitionService.createEmptyActorDefinition().metadata,
        ...template.metadata
      }
    });
    setErrors({});
  };

  // Load existing staged actor
  const loadStagedActor = (actorId) => {
    const result = actorDefinitionService.getFromStagingGround(actorId);
    if (result) {
      setActorDefinition(result.actorDefinition);
      setErrors({});
      setShowActorList(false);
      
      // Update URL
      navigate(`/actor-editor/${profile?.login}/${repository?.name}${branch && branch !== 'main' ? `/${branch}` : ''}`);
    }
  };

  // Delete staged actor
  const deleteStagedActor = (actorId) => {
    if (window.confirm(`Are you sure you want to delete the actor "${actorId}"?`)) {
      const success = actorDefinitionService.removeFromStagingGround(actorId);
      if (success) {
        setStagedActors(actorDefinitionService.listStagedActors());
        
        // If we're currently editing this actor, create a new one
        if (editActorId === actorId) {
          setActorDefinition(actorDefinitionService.createEmptyActorDefinition());
          navigate(`/actor-editor/${profile?.login}/${repository?.name}${branch && branch !== 'main' ? `/${branch}` : ''}`);
        }
      }
    }
  };



  // Redirect if missing required context - use useEffect to avoid render issues
  useEffect(() => {
    if (!profile || !repository) {
      navigate('/');
    }
  }, [profile, repository, navigate]);

  return (
    <PageLayout pageName="actor-editor">
      <div className="actor-editor">
        {!profile || !repository ? (
          <div className="redirecting-state">
            <h2>Redirecting...</h2>
            <p>Missing required context. Redirecting to home page...</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="loading-content">
              <h2>Loading Actor Editor...</h2>
              <p>Initializing editor and loading data...</p>
            </div>
          </div>
        ) : (
          <div className="editor-content">

        <div className="editor-toolbar">
          <div className="toolbar-left">
            <button 
              onClick={() => setShowActorList(!showActorList)}
              className="toolbar-btn"
              title="Browse staged actors"
            >
              📋 Staged Actors ({stagedActors.length})
            </button>
            <button 
              onClick={generatePreview}
              className="toolbar-btn"
              disabled={!actorDefinition?.id}
              title="Preview FSH output"
            >
              👁️ Preview FSH
            </button>
          </div>
          <div className="toolbar-right">
            <button 
              onClick={handleSave}
              disabled={saving || !actorDefinition?.id}
              className="toolbar-btn primary"
              title="Save to staging ground"
            >
              {saving ? '💾 Saving...' : '💾 Save'}
            </button>
          </div>
        </div>

        {errors.general && (
          <div className="error-message">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        <div className="editor-layout">
          {/* Staged Actors Sidebar */}
          {showActorList && (
            <div className="actor-list-sidebar">
              <div className="sidebar-header">
                <h3>Staged Actors</h3>
                <button 
                  onClick={() => setShowActorList(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="sidebar-content">
                <div className="templates-section">
                  <h4>Templates</h4>
                  {actorDefinitionService.getActorTemplates().map(template => (
                    <div key={template.id} className="template-item">
                      <span className="template-name">{template.name}</span>
                      <button 
                        onClick={() => loadTemplate(template)}
                        className="load-btn"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
                
                {stagedActors.length > 0 && (
                  <div className="staged-actors-section">
                    <h4>Staged Actors</h4>
                    {stagedActors.map(actor => (
                      <div key={actor.id} className="staged-actor-item">
                        <div className="actor-info">
                          <span className="actor-name">{actor.name}</span>
                          <span className="actor-id">{actor.id}</span>
                          <span className="actor-modified">
                            {new Date(actor.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="actor-actions">
                          <button 
                            onClick={() => loadStagedActor(actor.id)}
                            className="load-btn"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteStagedActor(actor.id)}
                            className="delete-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Editor */}
          <div className={`main-editor ${showActorList ? 'with-sidebar' : ''}`}>
            {actorDefinition && (
              <>
                <div className="editor-tabs">
                  <button 
                    className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                  >
                    Basic Info
                  </button>
                  <button 
                    className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                  >
                    Roles & Qualifications
                  </button>
                  <button 
                    className={`tab ${activeTab === 'context' ? 'active' : ''}`}
                    onClick={() => setActiveTab('context')}
                  >
                    Context & Access
                  </button>
                  <button 
                    className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
                    onClick={() => setActiveTab('metadata')}
                  >
                    Metadata
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'basic' && (
                    <BasicInfoTab
                      actorDefinition={actorDefinition}
                      errors={errors}
                      onFieldChange={handleFieldChange}
                    />
                  )}
                  
                  {activeTab === 'roles' && (
                    <RolesTab
                      actorDefinition={actorDefinition}
                      errors={errors}
                      onNestedFieldChange={handleNestedFieldChange}
                      onAddItem={addArrayItem}
                      onRemoveItem={removeArrayItem}
                    />
                  )}
                  
                  {activeTab === 'context' && (
                    <ContextTab
                      actorDefinition={actorDefinition}
                      errors={errors}
                      onFieldChange={handleFieldChange}
                      onNestedFieldChange={handleNestedFieldChange}
                      onAddItem={addArrayItem}
                      onRemoveItem={removeArrayItem}
                    />
                  )}
                  
                  {activeTab === 'metadata' && (
                    <MetadataTab
                      actorDefinition={actorDefinition}
                      errors={errors}
                      onFieldChange={handleFieldChange}
                      onNestedFieldChange={handleNestedFieldChange}
                      onAddItem={addArrayItem}
                      onRemoveItem={removeArrayItem}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* FSH Preview Modal */}
        {showPreview && (
          <div 
            className="modal-overlay" 
            onClick={() => setShowPreview(false)}
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
                onClick={() => setShowPreview(false)}
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
                  alert('FSH copied to clipboard!');
                }}
                className="copy-btn"
              >
                📋 Copy to Clipboard
              </button>
            </div>
        </div>
        )}
      </div>
    </PageLayout>
  );
};

// Basic Info Tab Component
const BasicInfoTab = ({ actorDefinition, errors, onFieldChange }) => (
  <div className="form-section">
    <h3>Basic Information</h3>
    
    <div className="form-group">
      <label htmlFor="id">Actor ID *</label>
      <input
        type="text"
        id="id"
        value={actorDefinition.id}
        onChange={(e) => onFieldChange('id', e.target.value)}
        className={errors.id ? 'error' : ''}
        placeholder="e.g., primary-care-physician"
        pattern="[a-zA-Z][a-zA-Z0-9_-]*"
      />
      {errors.id && <span className="error-text">{errors.id}</span>}
      <span className="help-text">Unique identifier (letters, numbers, underscores, hyphens only)</span>
    </div>

    <div className="form-group">
      <label htmlFor="name">Display Name *</label>
      <input
        type="text"
        id="name"
        value={actorDefinition.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        className={errors.name ? 'error' : ''}
        placeholder="e.g., Primary Care Physician"
      />
      {errors.name && <span className="error-text">{errors.name}</span>}
    </div>

    <div className="form-group">
      <label htmlFor="description">Description *</label>
      <textarea
        id="description"
        value={actorDefinition.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        className={errors.description ? 'error' : ''}
        placeholder="Detailed description of the actor's role and responsibilities..."
        rows={4}
      />
      {errors.description && <span className="error-text">{errors.description}</span>}
    </div>

    <div className="form-group">
      <label htmlFor="type">Actor Type *</label>
      <select
        id="type"
        value={actorDefinition.type}
        onChange={(e) => onFieldChange('type', e.target.value)}
        className={errors.type ? 'error' : ''}
      >
        <option value="person">Person</option>
        <option value="practitioner">Practitioner</option>
        <option value="patient">Patient</option>
        <option value="relatedperson">Related Person</option>
        <option value="organization">Organization</option>
        <option value="device">Device</option>
        <option value="system">System</option>
      </select>
      {errors.type && <span className="error-text">{errors.type}</span>}
    </div>
  </div>
);

// Roles Tab Component
const RolesTab = ({ actorDefinition, errors, onNestedFieldChange, onAddItem, onRemoveItem }) => (
  <div className="form-section">
    <h3>Roles & Qualifications</h3>
    
    <div className="subsection">
      <div className="subsection-header">
        <h4>Roles *</h4>
        <button 
          type="button"
          onClick={() => onAddItem('roles', { code: '', display: '', system: 'http://snomed.info/sct' })}
          className="add-btn"
        >
          + Add Role
        </button>
      </div>
      {errors.roles && <span className="error-text">{errors.roles}</span>}
      
      {actorDefinition.roles && actorDefinition.roles.map((role, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span>Role {index + 1}</span>
            <button 
              type="button"
              onClick={() => onRemoveItem('roles', index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`role-code-${index}`}>Code</label>
              <input
                id={`role-code-${index}`}
                type="text"
                value={role.code}
                onChange={(e) => onNestedFieldChange('roles', index, 'code', e.target.value)}
                placeholder="Role code"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`role-display-${index}`}>Display Name</label>
              <input
                id={`role-display-${index}`}
                type="text"
                value={role.display}
                onChange={(e) => onNestedFieldChange('roles', index, 'display', e.target.value)}
                placeholder="Human-readable role name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`role-system-${index}`}>Code System</label>
            <input
              id={`role-system-${index}`}
              type="text"
              value={role.system || ''}
              onChange={(e) => onNestedFieldChange('roles', index, 'system', e.target.value)}
              placeholder="http://snomed.info/sct"
            />
          </div>
        </div>
      ))}
    </div>

    <div className="subsection">
      <div className="subsection-header">
        <h4>Qualifications</h4>
        <button 
          type="button"
          onClick={() => onAddItem('qualifications', { code: '', display: '', issuer: '' })}
          className="add-btn"
        >
          + Add Qualification
        </button>
      </div>
      
      {actorDefinition.qualifications && actorDefinition.qualifications.map((qual, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span>Qualification {index + 1}</span>
            <button 
              type="button"
              onClick={() => onRemoveItem('qualifications', index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`qualification-code-${index}`}>Code</label>
              <input
                id={`qualification-code-${index}`}
                type="text"
                value={qual.code}
                onChange={(e) => onNestedFieldChange('qualifications', index, 'code', e.target.value)}
                placeholder="Qualification code"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`qualification-display-${index}`}>Display Name</label>
              <input
                id={`qualification-display-${index}`}
                type="text"
                value={qual.display}
                onChange={(e) => onNestedFieldChange('qualifications', index, 'display', e.target.value)}
                placeholder="Qualification name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`qualification-issuer-${index}`}>Issuing Organization</label>
            <input
              id={`qualification-issuer-${index}`}
              type="text"
              value={qual.issuer || ''}
              onChange={(e) => onNestedFieldChange('qualifications', index, 'issuer', e.target.value)}
              placeholder="Organization that issued this qualification"
            />
          </div>
        </div>
      ))}
    </div>

    <div className="subsection">
      <div className="subsection-header">
        <h4>Specialties</h4>
        <button 
          type="button"
          onClick={() => onAddItem('specialties', { code: '', display: '', system: 'http://snomed.info/sct' })}
          className="add-btn"
        >
          + Add Specialty
        </button>
      </div>
      
      {actorDefinition.specialties && actorDefinition.specialties.map((specialty, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span>Specialty {index + 1}</span>
            <button 
              type="button"
              onClick={() => onRemoveItem('specialties', index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`specialty-code-${index}`}>Code</label>
              <input
                id={`specialty-code-${index}`}
                type="text"
                value={specialty.code}
                onChange={(e) => onNestedFieldChange('specialties', index, 'code', e.target.value)}
                placeholder="Specialty code"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`specialty-display-${index}`}>Display Name</label>
              <input
                id={`specialty-display-${index}`}
                type="text"
                value={specialty.display}
                onChange={(e) => onNestedFieldChange('specialties', index, 'display', e.target.value)}
                placeholder="Specialty name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`specialty-system-${index}`}>Code System</label>
            <input
              id={`specialty-system-${index}`}
              type="text"
              value={specialty.system || ''}
              onChange={(e) => onNestedFieldChange('specialties', index, 'system', e.target.value)}
              placeholder="http://snomed.info/sct"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Context Tab Component
const ContextTab = ({ actorDefinition, errors, onFieldChange, onNestedFieldChange, onAddItem, onRemoveItem }) => (
  <div className="form-section">
    <h3>Context & Access</h3>
    
    <div className="subsection">
      <h4>Typical Location</h4>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location-type">Location Type</label>
          <select
            id="location-type"
            value={actorDefinition.location?.type || ''}
            onChange={(e) => onFieldChange('location', { ...actorDefinition.location, type: e.target.value })}
          >
            <option value="facility">Healthcare Facility</option>
            <option value="community">Community</option>
            <option value="home">Home</option>
            <option value="mobile">Mobile</option>
            <option value="virtual">Virtual/Remote</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="location-description">Description</label>
          <input
            id="location-description"
            type="text"
            value={actorDefinition.location?.description || ''}
            onChange={(e) => onFieldChange('location', { ...actorDefinition.location, description: e.target.value })}
            placeholder="Describe the typical location"
          />
        </div>
      </div>
    </div>

    <div className="subsection">
      <h4>System Access Level</h4>
      <div className="form-group">
        <select
          value={actorDefinition.accessLevel || 'standard'}
          onChange={(e) => onFieldChange('accessLevel', e.target.value)}
        >
          <option value="read-only">Read-Only</option>
          <option value="standard">Standard</option>
          <option value="administrative">Administrative</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>

    <div className="subsection">
      <div className="subsection-header">
        <h4>Key Interactions</h4>
        <button 
          type="button"
          onClick={() => onAddItem('interactions', { type: 'reads', target: '', description: '' })}
          className="add-btn"
        >
          + Add Interaction
        </button>
      </div>
      
      {actorDefinition.interactions && actorDefinition.interactions.map((interaction, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span>Interaction {index + 1}</span>
            <button 
              type="button"
              onClick={() => onRemoveItem('interactions', index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={interaction.type}
                onChange={(e) => onNestedFieldChange('interactions', index, 'type', e.target.value)}
              >
                <option value="creates">Creates</option>
                <option value="reads">Reads</option>
                <option value="updates">Updates</option>
                <option value="deletes">Deletes</option>
                <option value="approves">Approves</option>
                <option value="reviews">Reviews</option>
                <option value="monitors">Monitors</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target</label>
              <input
                type="text"
                value={interaction.target}
                onChange={(e) => onNestedFieldChange('interactions', index, 'target', e.target.value)}
                placeholder="What the actor interacts with"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={interaction.description || ''}
              onChange={(e) => onNestedFieldChange('interactions', index, 'description', e.target.value)}
              placeholder="Describe this interaction"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Metadata Tab Component
const MetadataTab = ({ actorDefinition, errors, onFieldChange, onNestedFieldChange, onAddItem, onRemoveItem }) => (
  <div className="form-section">
    <h3>Metadata</h3>
    
    <div className="form-row">
      <div className="form-group">
        <label>Version</label>
        <input
          type="text"
          value={actorDefinition.metadata?.version || ''}
          onChange={(e) => onFieldChange('metadata', { ...actorDefinition.metadata, version: e.target.value })}
          placeholder="1.0.0"
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          value={actorDefinition.metadata?.status || 'draft'}
          onChange={(e) => onFieldChange('metadata', { ...actorDefinition.metadata, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="retired">Retired</option>
        </select>
      </div>
    </div>

    <div className="form-group">
      <label>Publisher</label>
      <input
        type="text"
        value={actorDefinition.metadata?.publisher || ''}
        onChange={(e) => onFieldChange('metadata', { ...actorDefinition.metadata, publisher: e.target.value })}
        placeholder="Organization or person responsible"
      />
    </div>

    <div className="subsection">
      <div className="subsection-header">
        <h4>Contact Information</h4>
        <button 
          type="button"
          onClick={() => onAddItem('metadata.contact', { name: '', email: '' })}
          className="add-btn"
        >
          + Add Contact
        </button>
      </div>
      
      {actorDefinition.metadata?.contact && actorDefinition.metadata.contact.map((contact, index) => (
        <div key={index} className="array-item">
          <div className="array-item-header">
            <span>Contact {index + 1}</span>
            <button 
              type="button"
              onClick={() => {
                const newContacts = [...(actorDefinition.metadata.contact || [])];
                newContacts.splice(index, 1);
                onFieldChange('metadata', { ...actorDefinition.metadata, contact: newContacts });
              }}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={contact.name || ''}
                onChange={(e) => {
                  const newContacts = [...(actorDefinition.metadata.contact || [])];
                  newContacts[index] = { ...contact, name: e.target.value };
                  onFieldChange('metadata', { ...actorDefinition.metadata, contact: newContacts });
                }}
                placeholder="Contact name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => {
                  const newContacts = [...(actorDefinition.metadata.contact || [])];
                  newContacts[index] = { ...contact, email: e.target.value };
                  onFieldChange('metadata', { ...actorDefinition.metadata, contact: newContacts });
                }}
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="form-group">
      <label>Tags</label>
      <input
        type="text"
        value={actorDefinition.metadata?.tags?.join(', ') || ''}
        onChange={(e) => onFieldChange('metadata', { 
          ...actorDefinition.metadata, 
          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
        })}
        placeholder="Enter tags separated by commas"
      />
      <span className="help-text">Comma-separated tags for categorization</span>
    </div>
  </div>
);

export default ActorEditor;