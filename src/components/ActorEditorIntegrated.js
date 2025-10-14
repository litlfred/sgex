import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, useDAKParams } from './framework';
import { useDakComponent } from '../services/ComponentObjectProvider';

/**
 * Actor Editor - Integrated with DAK Component Objects
 * 
 * This is the updated version that uses GenericPersonaComponent
 * for all data operations instead of direct staging ground access.
 * 
 * Key changes from original:
 * - Uses useDakComponent('personas') hook for Component Object access
 * - Saves via component.save() which automatically updates dak.json
 * - Loads via component.retrieveAll() for consistent data access
 * - No direct actorDefinitionService or staging ground calls
 */
const ActorEditorIntegrated = () => {
  const navigate = useNavigate();
  const pageParams = useDAKParams();
  const component = useDakComponent('personas');
  
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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };
    if (showPreview) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showPreview]);

  // Initialize editor using Component Object
  const initializeEditor = useCallback(async () => {
    setLoading(true);
    
    if (!component) {
      console.log('Component Object not yet available, waiting...');
      return;
    }
    
    try {
      // Create new empty actor definition
      setActorDefinition(createEmptyActorDefinition());
      
      // Load all staged actors via Component Object
      const personas = await component.retrieveAll();
      setStagedActors(personas.map(p => ({
        id: p.id,
        name: p.name || p.title,
        definition: p
      })));
      
      console.log(`Loaded ${personas.length} personas via Component Object`);
    } catch (error) {
      console.error('Error initializing actor editor:', error);
      setErrors({ initialization: 'Failed to initialize editor' });
    } finally {
      setLoading(false);
    }
  }, [component]);

  useEffect(() => {
    if (!pageParams.error && !pageParams.loading && component) {
      initializeEditor();
    }
  }, [pageParams.error, pageParams.loading, component, initializeEditor]);

  // Create empty actor definition
  const createEmptyActorDefinition = () => ({
    id: `actor-${Date.now()}`,
    name: '',
    title: '',
    description: '',
    type: 'Person',
    roles: [],
    qualifications: [],
    responsibilities: []
  });

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setActorDefinition(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!actorDefinition?.name) {
      newErrors.name = 'Actor name is required';
    }
    if (!actorDefinition?.title) {
      newErrors.title = 'Actor title is required';
    }
    if (!actorDefinition?.type) {
      newErrors.type = 'Actor type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [actorDefinition]);

  // Generate FSH preview
  const generatePreview = useCallback(async () => {
    if (!actorDefinition || !component) return;
    
    try {
      // Use Component Object's validation which includes FSH generation
      const validationResult = await component.validate(actorDefinition);
      
      if (validationResult.isValid) {
        // Generate FSH representation
        const fsh = generateFSH(actorDefinition);
        setFshPreview(fsh);
      } else {
        setErrors({ general: validationResult.errors.join(', ') });
      }
    } catch (error) {
      console.error('Error generating FSH preview:', error);
      setErrors({ general: 'Failed to generate FSH preview' });
    }
  }, [actorDefinition, component]);

  // Generate FSH
  const generateFSH = (actor) => {
    let fsh = `Instance: ${actor.id}\n`;
    fsh += `InstanceOf: GenericPersona\n`;
    fsh += `Title: "${actor.title}"\n`;
    fsh += `Description: "${actor.description || actor.title}"\n`;
    fsh += `* name = "${actor.name}"\n`;
    fsh += `* type = #${actor.type}\n`;
    
    if (actor.roles && actor.roles.length > 0) {
      actor.roles.forEach(role => {
        fsh += `* role = "${role.display || role.code}"\n`;
      });
    }
    
    if (actor.qualifications && actor.qualifications.length > 0) {
      actor.qualifications.forEach(qual => {
        fsh += `* qualification = "${qual.display || qual.code}"\n`;
      });
    }
    
    return fsh;
  };

  // Save actor definition using Component Object
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!component) {
      setErrors({ general: 'Component Object not available' });
      return;
    }
    
    setSaving(true);
    
    try {
      // Save using Component Object
      // This automatically creates/updates the source in dak.json
      await component.save(
        actorDefinition,
        {
          saveType: 'file', // Save as FSH file
          path: `input/fsh/actors/${actorDefinition.id}.fsh`,
          commit: false // Don't commit yet, just stage
        }
      );
      
      // Refresh staged actors list
      const personas = await component.retrieveAll();
      setStagedActors(personas.map(p => ({
        id: p.id,
        name: p.name || p.title,
        definition: p
      })));
      
      setErrors({});
      console.log('Actor saved successfully via Component Object');
      console.log('dak.json automatically updated with source reference');
      
      // Show success message
      alert('Actor saved successfully!');
    } catch (error) {
      console.error('Error saving actor definition:', error);
      setErrors({ general: `Failed to save actor definition: ${error.message}` });
    } finally {
      setSaving(false);
    }
  }, [actorDefinition, validateForm, component]);

  // Load staged actor
  const loadStagedActor = useCallback((actorId) => {
    const actor = stagedActors.find(a => a.id === actorId);
    if (actor) {
      setActorDefinition(actor.definition);
      setShowActorList(false);
    }
  }, [stagedActors]);

  // Handle page provider issues
  if (pageParams.error) {
    return (
      <PageLayout pageName="actor-editor-integrated">
        <div className="actor-editor-container">
          <div className="error-message">
            <p>{pageParams.error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading || !actorDefinition) {
    return (
      <PageLayout pageName="actor-editor-integrated">
        <div className="actor-editor-container">
          <div className="loading-message">
            <p>Loading Actor Editor...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Component status message
  const componentStatus = component ? 
    'Using Component Object for data operations' : 
    'Waiting for Component Object initialization...';

  return (
    <PageLayout pageName="actor-editor-integrated">
      <div className="actor-editor-container">
        <div className="actor-editor-header">
          <h1>Generic Persona Editor (Integrated)</h1>
          <p className="integration-note">
            ✅ This editor uses Component Objects - all changes automatically update dak.json
          </p>
          <p className="component-status">{componentStatus}</p>
        </div>

        {errors.general && (
          <div className="error-message">
            <p>{errors.general}</p>
          </div>
        )}

        <div className="editor-actions">
          <button onClick={() => setShowActorList(!showActorList)}>
            {showActorList ? 'Hide' : 'Show'} Staged Actors ({stagedActors.length})
          </button>
          <button onClick={generatePreview}>Generate FSH Preview</button>
          <button onClick={handleSave} disabled={saving || !component}>
            {saving ? 'Saving...' : 'Save Actor'}
          </button>
        </div>

        {showActorList && (
          <div className="staged-actors-list">
            <h3>Staged Actors</h3>
            <ul>
              {stagedActors.map(actor => (
                <li key={actor.id} onClick={() => loadStagedActor(actor.id)}>
                  {actor.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="editor-tabs">
          <button
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={activeTab === 'roles' ? 'active' : ''}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
          <button
            className={activeTab === 'qualifications' ? 'active' : ''}
            onClick={() => setActiveTab('qualifications')}
          >
            Qualifications
          </button>
        </div>

        <div className="editor-content">
          {activeTab === 'basic' && (
            <div className="basic-info">
              <div className="form-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={actorDefinition.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g., community-health-worker"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label>Title *</label>
                <input
                  type="text"
                  value={actorDefinition.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., Community Health Worker"
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={actorDefinition.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the actor's role and responsibilities..."
                  rows="4"
                />
              </div>

              <div className="form-field">
                <label>Type *</label>
                <select
                  value={actorDefinition.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                >
                  <option value="Person">Person</option>
                  <option value="Organization">Organization</option>
                  <option value="Device">Device</option>
                  <option value="System">System</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="roles-section">
              <p>Roles management coming soon...</p>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="qualifications-section">
              <p>Qualifications management coming soon...</p>
            </div>
          )}
        </div>

        {showPreview && (
          <div className="preview-modal" onClick={() => setShowPreview(false)}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
              <div className="preview-header">
                <h3>FSH Preview</h3>
                <button onClick={() => setShowPreview(false)}>×</button>
              </div>
              <pre className="fsh-code">{fshPreview}</pre>
            </div>
          </div>
        )}

        <style jsx>{`
          .actor-editor-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .actor-editor-header {
            margin-bottom: 20px;
          }
          .integration-note {
            color: #0078d4;
            font-weight: 500;
            margin-top: 8px;
          }
          .component-status {
            color: #666;
            font-size: 0.9em;
            margin-top: 4px;
          }
          .editor-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }
          .editor-actions button {
            padding: 10px 20px;
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .editor-actions button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .editor-actions button:hover:not(:disabled) {
            background: #005a9e;
          }
          .staged-actors-list {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .staged-actors-list ul {
            list-style: none;
            padding: 0;
          }
          .staged-actors-list li {
            padding: 8px;
            background: white;
            margin: 5px 0;
            border-radius: 4px;
            cursor: pointer;
          }
          .staged-actors-list li:hover {
            background: #e8e8e8;
          }
          .editor-tabs {
            display: flex;
            gap: 5px;
            border-bottom: 2px solid #ddd;
            margin-bottom: 20px;
          }
          .editor-tabs button {
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            border-bottom: 3px solid transparent;
          }
          .editor-tabs button.active {
            border-bottom-color: #0078d4;
            color: #0078d4;
            font-weight: bold;
          }
          .editor-content {
            background: white;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .form-field {
            margin-bottom: 20px;
          }
          .form-field label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }
          .form-field input,
          .form-field textarea,
          .form-field select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .field-error {
            color: #d32f2f;
            font-size: 0.9em;
            display: block;
            margin-top: 5px;
          }
          .preview-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .preview-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow: auto;
          }
          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .preview-header button {
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
          }
          .fsh-code {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
          }
          .error-message, .loading-message {
            padding: 20px;
            text-align: center;
          }
          .error-message {
            background: #ffe6e6;
            color: #d32f2f;
            border-radius: 4px;
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default ActorEditorIntegrated;
