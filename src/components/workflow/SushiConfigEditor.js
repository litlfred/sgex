import React, { useState } from 'react';

const SushiConfigEditor = ({ config, setConfig, errors = {}, profile, onValidate }) => {
  const [newDependency, setNewDependency] = useState({ name: '', version: '' });
  const [showDependencySearch, setShowDependencySearch] = useState(false);

  // Common FHIR dependencies
  const commonDependencies = [
    { name: 'smart.who.int.base', version: 'dev', description: 'WHO SMART Guidelines Base' },
    { name: 'hl7.fhir.uv.extensions.r4', version: '5.1.0', description: 'FHIR R4 Extensions' },
    { name: 'hl7.fhir.uv.cql', version: '1.0.0', description: 'Clinical Quality Language' },
    { name: 'hl7.fhir.uv.crmi', version: '1.0.0', description: 'Canonical Resource Management Infrastructure' },
    { name: 'hl7.fhir.uv.sdc', version: '3.0.0', description: 'Structured Data Capture' },
    { name: 'hl7.fhir.uv.cpg', version: 'current', description: 'Clinical Practice Guidelines' },
    { name: 'hl7.fhir.us.cqfmeasures', version: '5.0.0', description: 'Clinical Quality Framework Measures' },
    { name: 'fhir.cqf.common', version: '4.0.1', description: 'Clinical Quality Framework Common' },
    { name: 'hl7.fhir.uv.ips', version: '1.1.0', description: 'International Patient Summary' },
    { name: 'hl7.fhir.uv.smart-app-launch', version: '2.1.0', description: 'SMART App Launch' }
  ];

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Trigger validation after a short delay
    setTimeout(() => {
      if (onValidate) onValidate();
    }, 100);
  };

  const handlePageToggle = (pageKey, enabled) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          enabled
        }
      }
    }));
    if (onValidate) onValidate();
  };

  const handleAddDependency = (dependency) => {
    const depToAdd = dependency || newDependency;
    if (depToAdd.name && depToAdd.version && 
        !config.dependencies.find(d => d.name === depToAdd.name)) {
      setConfig(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, depToAdd]
      }));
      setNewDependency({ name: '', version: '' });
      setShowDependencySearch(false);
      if (onValidate) onValidate();
    }
  };

  const handleRemoveDependency = (dependencyName) => {
    setConfig(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d.name !== dependencyName)
    }));
    if (onValidate) onValidate();
  };

  // Search dependencies - removed as it's not being used currently
  // Future enhancement: integrate with HL7 FHIR registry search

  return (
    <div className="workflow-form">
      <h2>SUSHI Configuration</h2>
      <p>Configure the sushi-config.yaml file that defines your FHIR Implementation Guide.</p>

      <div className="workflow-form-section">
        <h3>Implementation Guide Identity</h3>

        <div className="workflow-form-row">
          <div className="workflow-form-group">
            <label htmlFor="sushi-id" className="workflow-form-label required">
              Implementation Guide ID
            </label>
            <input
              id="sushi-id"
              type="text"
              className={`workflow-form-input ${errors.id ? 'error' : ''}`}
              value={config.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              placeholder="who.smart.maternal-health"
            />
            {errors.id && (
              <div className="workflow-form-error">{errors.id}</div>
            )}
            <div className="workflow-form-help">
              Unique identifier for the Implementation Guide (lowercase with dots or hyphens)
            </div>
          </div>

          <div className="workflow-form-group">
            <label htmlFor="sushi-canonical" className="workflow-form-label required">
              Canonical URL
            </label>
            <input
              id="sushi-canonical"
              type="url"
              className={`workflow-form-input ${errors.canonical ? 'error' : ''}`}
              value={config.canonical}
              onChange={(e) => handleInputChange('canonical', e.target.value)}
              placeholder="http://smart.who.int/maternal-health"
            />
            {errors.canonical && (
              <div className="workflow-form-error">{errors.canonical}</div>
            )}
            <div className="workflow-form-help">
              Base URL where the Implementation Guide will be published
            </div>
          </div>
        </div>

        <div className="workflow-form-row">
          <div className="workflow-form-group">
            <label htmlFor="sushi-name" className="workflow-form-label required">
              Technical Name
            </label>
            <input
              id="sushi-name"
              type="text"
              className={`workflow-form-input ${errors.name ? 'error' : ''}`}
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="MaternalHealth"
            />
            {errors.name && (
              <div className="workflow-form-error">{errors.name}</div>
            )}
            <div className="workflow-form-help">
              PascalCase technical name (no spaces)
            </div>
          </div>

          <div className="workflow-form-group">
            <label htmlFor="sushi-version" className="workflow-form-label">
              Version
            </label>
            <input
              id="sushi-version"
              type="text"
              className="workflow-form-input"
              value={config.version}
              onChange={(e) => handleInputChange('version', e.target.value)}
              placeholder="0.1.0"
            />
            <div className="workflow-form-help">
              Semantic version number (e.g., 0.1.0, 1.0.0)
            </div>
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="sushi-title" className="workflow-form-label required">
            Title
          </label>
          <input
            id="sushi-title"
            type="text"
            className={`workflow-form-input ${errors.title ? 'error' : ''}`}
            value={config.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="WHO SMART Guidelines - Maternal Health DAK"
          />
          {errors.title && (
            <div className="workflow-form-error">{errors.title}</div>
          )}
          <div className="workflow-form-help">
            Human-readable title for the Implementation Guide
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="sushi-description" className="workflow-form-label required">
            Description
          </label>
          <textarea
            id="sushi-description"
            className={`workflow-form-textarea ${errors.description ? 'error' : ''}`}
            value={config.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="This implementation guide provides digital adaptation kit components for maternal health care..."
            rows={4}
          />
          {errors.description && (
            <div className="workflow-form-error">{errors.description}</div>
          )}
          <div className="workflow-form-help">
            Detailed description of the DAK's purpose and scope
          </div>
        </div>

        <div className="workflow-form-row">
          <div className="workflow-form-group">
            <label htmlFor="sushi-status" className="workflow-form-label">
              Status
            </label>
            <select
              id="sushi-status"
              className="workflow-form-select"
              value={config.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="workflow-form-group">
            <label htmlFor="sushi-publisher" className="workflow-form-label">
              Publisher
            </label>
            <input
              id="sushi-publisher"
              type="text"
              className="workflow-form-input"
              value={config.publisher}
              onChange={(e) => handleInputChange('publisher', e.target.value)}
              placeholder="World Health Organization"
            />
            <div className="workflow-form-help">
              Organization responsible for publishing this IG
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-form-section">
        <h3>Dependencies</h3>
        <p>FHIR Implementation Guides that this DAK depends on.</p>

        <div className="workflow-form-group">
          <label htmlFor="current-dependencies" className="workflow-form-label">Current Dependencies</label>
          <div style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '1rem', background: '#f9fafb' }}>
            <div id="current-dependencies" role="list" aria-label="Current dependencies">
              {config.dependencies.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                No dependencies added yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {config.dependencies.map((dep, index) => (
                  <div key={index} role="listitem" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <strong>{dep.name}</strong>
                      <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                        v{dep.version}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(dep.name)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="add-dependencies" className="workflow-form-label">Add Dependencies</label>
          
          {!showDependencySearch ? (
            <div id="add-dependencies">
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Choose from common WHO and FHIR dependencies:
              </p>
              <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {commonDependencies
                  .filter(dep => !config.dependencies.find(d => d.name === dep.name))
                  .map(dep => (
                    <div key={dep.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div><strong>{dep.name}</strong></div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {dep.description} (v{dep.version})
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddDependency(dep)}
                        style={{
                          background: '#0078d4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
              
              <button
                type="button"
                onClick={() => setShowDependencySearch(true)}
                style={{
                  marginTop: '1rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Add Custom Dependency
              </button>
            </div>
          ) : (
            <div>
              <div className="workflow-form-row">
                <div className="workflow-form-group">
                  <label htmlFor="dep-name" className="workflow-form-label">
                    Dependency Name
                  </label>
                  <input
                    id="dep-name"
                    type="text"
                    className="workflow-form-input"
                    value={newDependency.name}
                    onChange={(e) => setNewDependency(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="hl7.fhir.uv.example"
                  />
                </div>
                <div className="workflow-form-group">
                  <label htmlFor="dep-version" className="workflow-form-label">
                    Version
                  </label>
                  <input
                    id="dep-version"
                    type="text"
                    className="workflow-form-input"
                    value={newDependency.version}
                    onChange={(e) => setNewDependency(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleAddDependency()}
                  disabled={!newDependency.name || !newDependency.version}
                  style={{
                    background: '#0078d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  Add Dependency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDependencySearch(false);
                    setNewDependency({ name: '', version: '' });
                  }}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="workflow-form-section">
        <h3>Pages Configuration</h3>
        <p>Enable or disable pages that will be included in your Implementation Guide.</p>

        <div className="workflow-form-group">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {Object.entries(config.pages).map(([pageKey, pageConfig]) => (
              <div key={pageKey} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #d1d5db'
              }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{pageConfig.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {pageKey}
                  </div>
                </div>
                <div className="workflow-checkbox-group">
                  <input
                    type="checkbox"
                    className="workflow-checkbox"
                    checked={pageConfig.enabled}
                    onChange={(e) => handlePageToggle(pageKey, e.target.checked)}
                    id={`page-${pageKey}`}
                  />
                  <label htmlFor={`page-${pageKey}`} className="workflow-checkbox-label">
                    {pageConfig.enabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SushiConfigEditor;