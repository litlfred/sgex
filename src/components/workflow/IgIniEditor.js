import React from 'react';

const IgIniEditor = ({ config, setConfig, errors = {}, profile, onValidate }) => {
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

  const commonTemplates = [
    {
      value: 'fhir.base.template#current',
      name: 'FHIR Base Template (Current)',
      description: 'Standard FHIR IG template with latest features'
    },
    {
      value: 'hl7.base.template#current',
      name: 'HL7 Base Template (Current)',
      description: 'HL7 standard template for implementation guides'
    },
    {
      value: 'hl7.utg.template#current',
      name: 'HL7 UTG Template (Current)',
      description: 'Universal Terminology Governance template'
    },
    {
      value: 'hl7.cda.template#current',
      name: 'HL7 CDA Template (Current)',
      description: 'Clinical Document Architecture template'
    },
    {
      value: 'smart.base.template#current',
      name: 'SMART Base Template (Current)',
      description: 'WHO SMART Guidelines specific template'
    }
  ];

  return (
    <div className="workflow-form">
      <h2>IG Configuration</h2>
      <p>Configure the ig.ini file that controls how your FHIR Implementation Guide is built.</p>

      <div className="workflow-form-section">
        <h3>Implementation Guide Settings</h3>

        <div className="workflow-form-group">
          <label htmlFor="ig-path" className="workflow-form-label required">
            IG Configuration File
          </label>
          <input
            id="ig-path"
            type="text"
            className={`workflow-form-input ${errors.ig ? 'error' : ''}`}
            value={config.ig}
            onChange={(e) => handleInputChange('ig', e.target.value)}
            placeholder="sushi-config.yaml"
          />
          {errors.ig && (
            <div className="workflow-form-error">{errors.ig}</div>
          )}
          <div className="workflow-form-help">
            Path to the SUSHI configuration file (typically "sushi-config.yaml")
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="ig-template" className="workflow-form-label">
            Template
          </label>
          <select
            id="ig-template"
            className="workflow-form-select"
            value={config.template}
            onChange={(e) => handleInputChange('template', e.target.value)}
          >
            {commonTemplates.map(template => (
              <option key={template.value} value={template.value}>
                {template.name}
              </option>
            ))}
          </select>
          <div className="workflow-form-help">
            Template used for building and styling the Implementation Guide
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="template-details" className="workflow-form-label">Template Details</label>
          <div id="template-details" style={{
            background: '#f9fafb',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            {(() => {
              const selectedTemplate = commonTemplates.find(t => t.value === config.template);
              return selectedTemplate ? (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                    {selectedTemplate.name}
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                    {selectedTemplate.description}
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#6b7280', fontStyle: 'italic' }}>
                  Custom template configuration
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="workflow-form-section">
        <h3>About ig.ini</h3>
        <div style={{ 
          background: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: '8px', 
          padding: '1rem',
          color: '#1e40af'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 What is ig.ini?</h4>
          <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>
            The ig.ini file is a configuration file used by the FHIR IG Publisher to build your Implementation Guide. 
            It tells the publisher where to find your SUSHI configuration and which template to use for styling and layout.
          </p>
          
          <h4 style={{ margin: '1rem 0 0.5rem 0' }}>🔧 How it works:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.5' }}>
            <li>The IG Publisher reads ig.ini to understand your project structure</li>
            <li>It processes your sushi-config.yaml to generate FHIR resources</li>
            <li>It applies the selected template to create the final HTML output</li>
            <li>The result is a complete, navigable Implementation Guide website</li>
          </ul>
        </div>
      </div>

      <div className="workflow-form-section">
        <h3>Generated Content Preview</h3>
        <div style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <div style={{ color: '#60a5fa', marginBottom: '0.5rem' }}># ig.ini</div>
          <div style={{ color: '#34d399' }}>[IG]</div>
          <div><span style={{ color: '#fbbf24' }}>ig</span> = {config.ig || 'sushi-config.yaml'}</div>
          <div><span style={{ color: '#fbbf24' }}>template</span> = {config.template}</div>
        </div>
        <div className="workflow-form-help" style={{ marginTop: '0.5rem' }}>
          This is what your ig.ini file will look like with the current configuration.
        </div>
      </div>
    </div>
  );
};

export default IgIniEditor;