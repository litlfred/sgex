import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import './SushiDashboard.css';

const SushiDashboard = ({ repository, selectedBranch, hasWriteAccess, profile }) => {
  const [sushiConfig, setSushiConfig] = useState(null);
  const [originalYamlContent, setOriginalYamlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    pages: false,
    dependencies: false,
    fullConfig: false
  });

  // Load sushi-config.yaml on component mount
  useEffect(() => {
    if (repository && selectedBranch) {
      loadSushiConfig();
    }
  }, [repository, selectedBranch]);

  const loadSushiConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repo = repository.name;
      const branch = selectedBranch || 'main';

      // Fetch sushi-config.yaml from GitHub
      const { data } = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'sushi-config.yaml',
        ref: branch
      });

      if (data.type === 'file' && data.content) {
        const yamlContent = atob(data.content);
        setOriginalYamlContent(yamlContent);
        
        // Parse YAML content
        const parsed = yamlLoad(yamlContent);
        setSushiConfig(parsed);
      } else {
        throw new Error('sushi-config.yaml not found or invalid');
      }
    } catch (error) {
      console.error('Failed to load sushi-config.yaml:', error);
      if (error.status === 404) {
        setError('sushi-config.yaml not found in this repository');
      } else {
        setError(`Failed to load sushi-config.yaml: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case 'id':
        if (!value || value.length < 3) {
          errors.id = 'ID must be at least 3 characters';
        } else if (!/^[a-z0-9][a-z0-9-.]*[a-z0-9]$/.test(value)) {
          errors.id = 'ID must be lowercase with dots or hyphens only';
        } else {
          delete errors.id;
        }
        break;
      
      case 'name':
        if (!value || value.length < 3) {
          errors.name = 'Name must be at least 3 characters';
        } else if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
          errors.name = 'Name must be PascalCase (no spaces)';
        } else {
          delete errors.name;
        }
        break;
      
      case 'version':
        if (!value) {
          errors.version = 'Version is required';
        } else if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/.test(value)) {
          errors.version = 'Version must follow semantic versioning (e.g., 1.0.0)';
        } else {
          delete errors.version;
        }
        break;
      
      case 'fhirVersion':
        if (!value) {
          errors.fhirVersion = 'FHIR version is required';
        } else if (!/^\d+\.\d+\.\d+$/.test(value)) {
          errors.fhirVersion = 'FHIR version must be in format x.y.z (e.g., 4.0.1)';
        } else {
          delete errors.fhirVersion;
        }
        break;
      
      case 'title':
        if (!value || value.length < 5) {
          errors.title = 'Title must be at least 5 characters';
        } else {
          delete errors.title;
        }
        break;
      
      case 'description':
        if (!value || value.length < 20) {
          errors.description = 'Description must be at least 20 characters';
        } else {
          delete errors.description;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field, value, isPublisherField = false) => {
    const newConfig = { ...sushiConfig };
    
    if (isPublisherField) {
      if (!newConfig.publisher) {
        newConfig.publisher = {};
      }
      newConfig.publisher[field] = value;
    } else {
      newConfig[field] = value;
    }
    
    setSushiConfig(newConfig);
    setHasChanges(true);
    validateField(isPublisherField ? `publisher.${field}` : field, value);
  };

  const addDependency = () => {
    const newDependencyId = prompt('Enter dependency ID (e.g., hl7.fhir.uv.cpg):');
    const newDependencyVersion = prompt('Enter dependency version (e.g., 2.0.0):');
    
    if (newDependencyId && newDependencyVersion) {
      const newConfig = { ...sushiConfig };
      if (!newConfig.dependencies) {
        newConfig.dependencies = {};
      }
      newConfig.dependencies[newDependencyId] = {
        version: newDependencyVersion
      };
      setSushiConfig(newConfig);
      setHasChanges(true);
    }
  };

  const removeDependency = (depId) => {
    const newConfig = { ...sushiConfig };
    if (newConfig.dependencies) {
      delete newConfig.dependencies[depId];
      setSushiConfig(newConfig);
      setHasChanges(true);
    }
  };

  const saveSushiConfig = async () => {
    try {
      setSaving(true);
      
      // Validate all fields before saving
      const fieldsToValidate = ['id', 'name', 'version', 'fhirVersion', 'title', 'description'];
      let hasValidationErrors = false;
      
      fieldsToValidate.forEach(field => {
        if (!validateField(field, sushiConfig[field])) {
          hasValidationErrors = true;
        }
      });

      if (hasValidationErrors) {
        alert('Please fix validation errors before saving');
        return;
      }

      // Convert back to YAML
      const newYamlContent = yamlDump(sushiConfig, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });

      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repo = repository.name;
      const branch = selectedBranch || 'main';

      // Get current file to get its SHA
      const { data: currentFile } = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'sushi-config.yaml',
        ref: branch
      });

      // Update the file
      await githubService.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: 'sushi-config.yaml',
        message: 'Update sushi-config.yaml via SGEX Workbench',
        content: btoa(newYamlContent),
        sha: currentFile.sha,
        branch
      });

      setOriginalYamlContent(newYamlContent);
      setHasChanges(false);
      setEditing(false);
      alert('sushi-config.yaml saved successfully!');
      
    } catch (error) {
      console.error('Failed to save sushi-config.yaml:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="sushi-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading sushi-config.yaml...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sushi-dashboard error">
        <div className="error-icon">⚠️</div>
        <h3>Could not load sushi-config.yaml</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!sushiConfig) {
    return null;
  }

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repo = repository.name;
  const branch = selectedBranch || 'main';
  const githubUrl = `https://github.com/${owner}/${repo}/blob/${branch}/sushi-config.yaml`;
  const githubEditUrl = `https://github.com/${owner}/${repo}/edit/${branch}/sushi-config.yaml`;

  return (
    <div className="sushi-dashboard">
      <div className="sushi-header">
        <div className="sushi-title">
          <h2>📄 SUSHI Configuration</h2>
          <p>Management and editing of sushi-config.yaml for this DAK</p>
        </div>
        
        <div className="sushi-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowSourceModal(true)}
            title="View raw YAML source"
          >
            View Source
          </button>
          
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            title="View on GitHub"
          >
            GitHub Source
          </a>
          
          {hasWriteAccess && (
            <>
              <a
                href={githubEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                title="Edit on GitHub"
              >
                GitHub Edit
              </a>
              
              {!editing ? (
                <button
                  className="btn-primary"
                  onClick={() => setEditing(true)}
                  title="Enable inline editing"
                >
                  Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      setHasChanges(false);
                      setSushiConfig(yamlLoad(originalYamlContent));
                      setValidationErrors({});
                    }}
                    title="Cancel changes"
                  >
                    Cancel
                  </button>
                  
                  <button
                    className="btn-primary"
                    onClick={saveSushiConfig}
                    disabled={saving || Object.keys(validationErrors).length > 0}
                    title="Save changes"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="changes-indicator">
          <span className="changes-icon">●</span>
          You have unsaved changes
        </div>
      )}

      {/* Summary Section */}
      <div className="sushi-section summary">
        <h3>Summary</h3>
        <div className="summary-grid">
          <div className="summary-field">
            <label>ID</label>
            {editing ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={sushiConfig.id || ''}
                  onChange={(e) => handleFieldChange('id', e.target.value)}
                  className={validationErrors.id ? 'error' : ''}
                />
                {validationErrors.id && <span className="error-message">{validationErrors.id}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.id || 'Not set'}</span>
            )}
          </div>

          <div className="summary-field">
            <label>FHIR Version</label>
            {editing ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={sushiConfig.fhirVersion || ''}
                  onChange={(e) => handleFieldChange('fhirVersion', e.target.value)}
                  className={validationErrors.fhirVersion ? 'error' : ''}
                />
                {validationErrors.fhirVersion && <span className="error-message">{validationErrors.fhirVersion}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.fhirVersion || 'Not set'}</span>
            )}
          </div>

          <div className="summary-field">
            <label>Name</label>
            {editing ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={sushiConfig.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={validationErrors.name ? 'error' : ''}
                />
                {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.name || 'Not set'}</span>
            )}
          </div>

          <div className="summary-field">
            <label>Version</label>
            {editing ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={sushiConfig.version || ''}
                  onChange={(e) => handleFieldChange('version', e.target.value)}
                  className={validationErrors.version ? 'error' : ''}
                />
                {validationErrors.version && <span className="error-message">{validationErrors.version}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.version || 'Not set'}</span>
            )}
          </div>

          <div className="summary-field full-width">
            <label>Title</label>
            {editing ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={sushiConfig.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className={validationErrors.title ? 'error' : ''}
                />
                {validationErrors.title && <span className="error-message">{validationErrors.title}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.title || 'Not set'}</span>
            )}
          </div>

          <div className="summary-field full-width">
            <label>Description</label>
            {editing ? (
              <div className="edit-field">
                <textarea
                  value={sushiConfig.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className={validationErrors.description ? 'error' : ''}
                  rows="3"
                />
                {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
              </div>
            ) : (
              <span className="value">{sushiConfig.description || 'Not set'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Publisher Section */}
      <div className="sushi-section publisher">
        <h3>Publisher</h3>
        <div className="publisher-grid">
          <div className="publisher-field">
            <label>Name</label>
            {editing ? (
              <input
                type="text"
                value={sushiConfig.publisher?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value, true)}
              />
            ) : (
              <span className="value">{sushiConfig.publisher?.name || 'Not set'}</span>
            )}
          </div>

          <div className="publisher-field">
            <label>URL</label>
            {editing ? (
              <input
                type="url"
                value={sushiConfig.publisher?.url || ''}
                onChange={(e) => handleFieldChange('url', e.target.value, true)}
              />
            ) : (
              <span className="value">
                {sushiConfig.publisher?.url ? (
                  <a href={sushiConfig.publisher.url} target="_blank" rel="noopener noreferrer">
                    {sushiConfig.publisher.url}
                  </a>
                ) : (
                  'Not set'
                )}
              </span>
            )}
          </div>

          <div className="publisher-field">
            <label>Email</label>
            {editing ? (
              <input
                type="email"
                value={sushiConfig.publisher?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value, true)}
              />
            ) : (
              <span className="value">
                {sushiConfig.publisher?.email ? (
                  <a href={`mailto:${sushiConfig.publisher.email}`}>
                    {sushiConfig.publisher.email}
                  </a>
                ) : (
                  'Not set'
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dependencies Section */}
      <div className="sushi-section dependencies">
        <div 
          className="section-header clickable"
          onClick={() => toggleSection('dependencies')}
        >
          <h3>Dependencies</h3>
          <span className="toggle-icon">{expandedSections.dependencies ? '▼' : '▶'}</span>
        </div>
        
        {expandedSections.dependencies && (
          <div className="dependencies-content">
            {sushiConfig.dependencies && Object.keys(sushiConfig.dependencies).length > 0 ? (
              <div className="dependencies-list">
                {Object.entries(sushiConfig.dependencies).map(([depId, depInfo]) => (
                  <div key={depId} className="dependency-item">
                    <div className="dependency-info">
                      <strong>{depId}</strong>
                      <span className="dependency-version">v{depInfo.version || depInfo}</span>
                      {depInfo.uri && (
                        <a 
                          href={depInfo.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dependency-link"
                        >
                          {depInfo.uri}
                        </a>
                      )}
                    </div>
                    {editing && hasWriteAccess && depId !== 'smart.who.int.base' && (
                      <button
                        className="btn-danger small"
                        onClick={() => removeDependency(depId)}
                        title="Remove dependency"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-dependencies">No dependencies defined</p>
            )}
            
            {editing && hasWriteAccess && (
              <button
                className="btn-secondary"
                onClick={addDependency}
                title="Add new dependency"
              >
                Add Dependency
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pages Section */}
      <div className="sushi-section pages">
        <div 
          className="section-header clickable"
          onClick={() => toggleSection('pages')}
        >
          <h3>Pages</h3>
          <span className="toggle-icon">{expandedSections.pages ? '▼' : '▶'}</span>
        </div>
        
        {expandedSections.pages && (
          <div className="pages-content">
            {sushiConfig.pages && Object.keys(sushiConfig.pages).length > 0 ? (
              <div className="pages-list">
                {Object.entries(sushiConfig.pages).map(([pagePath, pageInfo]) => (
                  <div key={pagePath} className="page-item">
                    <div className="page-info">
                      <strong>{pageInfo.title || pagePath}</strong>
                      <span className="page-path">{pagePath}</span>
                    </div>
                    <div className="page-links">
                      <a
                        href={`https://github.com/${owner}/${repo}/blob/${branch}/input/pagecontent/${pagePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary small"
                        title="View source on GitHub"
                      >
                        GitHub
                      </a>
                      {/* TODO: Add staging link if staging exists */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-pages">No pages defined</p>
            )}
          </div>
        )}
      </div>

      {/* Full Configuration Section */}
      <div className="sushi-section full-config">
        <div 
          className="section-header clickable"
          onClick={() => toggleSection('fullConfig')}
        >
          <h3>Full Configuration</h3>
          <span className="toggle-icon">{expandedSections.fullConfig ? '▼' : '▶'}</span>
        </div>
        
        {expandedSections.fullConfig && (
          <div className="full-config-content">
            <p>Complete sushi-config.yaml structure with all available fields:</p>
            <div className="config-fields">
              {Object.entries(sushiConfig).map(([key, value]) => (
                <div key={key} className="config-field">
                  <strong>{key}:</strong>
                  <span className="config-value">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Source Modal */}
      {showSourceModal && (
        <div className="modal-overlay" onClick={() => setShowSourceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>sushi-config.yaml Source</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSourceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <pre className="yaml-source">
                <code>{originalYamlContent}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SushiDashboard;