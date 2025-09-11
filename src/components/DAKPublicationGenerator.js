import React, { useState } from 'react';
import './DAKPublicationGenerator.css';

const DAKPublicationGenerator = ({ profile, repository, selectedBranch, hasWriteAccess }) => {
  const [selectedFormat, setSelectedFormat] = useState('html');
  const [selectedScope, setSelectedScope] = useState('full'); // 'full' or component id
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPublications, setGeneratedPublications] = useState([]);
  const [error, setError] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;

  const formatOptions = [
    { value: 'html', label: 'HTML Publication', icon: '🌐', description: 'Web-ready HTML with WHO styling' },
    { value: 'epub', label: 'EPUB E-book', icon: '📖', description: 'EPUB 3.0 format for e-readers' },
    { value: 'docbook', label: 'DocBook XML', icon: '📄', description: 'Professional publishing format' },
    { value: 'pdf', label: 'PDF Document', icon: '📋', description: 'Print to PDF using browser functionality' },
  ];

  const dakComponents = [
    { id: 'full', name: 'Complete DAK', icon: '📚', description: 'Generate publication for the entire DAK' },
    { id: 'health-interventions', name: 'Health Interventions', icon: '📖', description: 'Clinical guidelines and health intervention specifications' },
    { id: 'generic-personas', name: 'Generic Personas', icon: '👥', description: 'Standardized user roles and actor definitions' },
    { id: 'user-scenarios', name: 'User Scenarios', icon: '📝', description: 'Narrative descriptions of system interactions' },
    { id: 'business-processes', name: 'Business Processes', icon: '🔄', description: 'BPMN workflows and business process definitions' },
    { id: 'core-data-elements', name: 'Core Data Elements', icon: '🗃️', description: 'Essential data structures and terminology' },
    { id: 'decision-support', name: 'Decision Support Logic', icon: '🎯', description: 'DMN decision tables and clinical decision support' },
    { id: 'program-indicators', name: 'Program Indicators', icon: '📊', description: 'Performance indicators and measurement definitions' },
    { id: 'functional-requirements', name: 'Functional Requirements', icon: '⚙️', description: 'System requirements specifications' },
    { id: 'test-scenarios', name: 'Test Scenarios', icon: '🧪', description: 'Feature files and test scenarios' }
  ];

  const handleGeneratePublication = async () => {
    // Handle PDF print functionality
    if (selectedFormat === 'pdf') {
      // Open current page in print mode
      window.print();
      return;
    }

    // Handle demo mode or users without write access
    if (profile?.isDemo || !hasWriteAccess) {
      setIsGenerating(true);
      setTimeout(() => {
        const selectedComponent = dakComponents.find(comp => comp.id === selectedScope);
        const scopeName = selectedComponent ? selectedComponent.name : 'Full DAK';
        const filePrefix = selectedScope === 'full' ? repoName : `${repoName}-${selectedScope}`;
        
        const mockPublication = {
          id: `demo-${Date.now()}`,
          format: selectedFormat,
          scope: selectedScope,
          scopeName: scopeName,
          filename: `${filePrefix}-${selectedBranch}-publication.${selectedFormat === 'html' ? 'html' : selectedFormat}`,
          downloadUrl: '#demo-download',
          generatedAt: new Date().toISOString(),
          size: selectedScope === 'full' ? '2.1 MB' : '850 KB'
        };
        setGeneratedPublications(prev => [mockPublication, ...prev]);
        setIsGenerating(false);
      }, 2000);
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Call DAK Publication API
      const response = await fetch('http://localhost:3002/api/publication/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: 'who-dak-standard-v1',
          dakRepository: `${owner}/${repoName}`,
          options: {
            format: selectedFormat,
            scope: selectedScope,
            includeAssets: true,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Publication generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const selectedComponent = dakComponents.find(comp => comp.id === selectedScope);
        const scopeName = selectedComponent ? selectedComponent.name : 'Full DAK';
        const filePrefix = selectedScope === 'full' ? repoName : `${repoName}-${selectedScope}`;
        
        const publication = {
          id: result.data.id,
          format: selectedFormat,
          scope: selectedScope,
          scopeName: scopeName,
          filename: `${filePrefix}-${selectedBranch}-publication.${selectedFormat === 'html' ? 'html' : selectedFormat}`,
          downloadUrl: `/api/publication/${result.data.id}/download`,
          generatedAt: result.data.generatedAt,
          size: result.data.metadata?.size || 'Unknown'
        };
        setGeneratedPublications(prev => [publication, ...prev]);
      } else {
        throw new Error(result.message || 'Publication generation failed');
      }
    } catch (err) {
      console.error('Publication generation error:', err);
      setError(err.message || 'Failed to generate publication');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormatIcon = (format) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option ? option.icon : '📄';
  };

  const getSelectedComponentName = () => {
    const component = dakComponents.find(comp => comp.id === selectedScope);
    return component ? component.name : 'Unknown';
  };

  return (
    <div className="dak-publication-generator">
      <div className="section-header">
        <h3 className="section-title">📚 DAK Publication Generator</h3>
        <p className="section-description">
          Generate professional WHO SMART Guidelines publications in multiple formats from your DAK repository content.
        </p>
      </div>

      <div className="publication-generator-content">
        <div className="publication-scope-selection">
          <label className="scope-label">Publication Scope:</label>
          <div className="scope-options">
            {dakComponents.map((component) => (
              <div
                key={component.id}
                className={`scope-option ${selectedScope === component.id ? 'selected' : ''}`}
                onClick={() => setSelectedScope(component.id)}
              >
                <div className="scope-icon">{component.icon}</div>
                <div className="scope-info">
                  <div className="scope-name">{component.name}</div>
                  <div className="scope-description">{component.description}</div>
                </div>
                {selectedScope === component.id && <div className="scope-selected">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="format-selection">
          <label className="format-label">Select Publication Format:</label>
          <div className="format-options">
            {formatOptions.map((option) => (
              <div
                key={option.value}
                className={`format-option ${selectedFormat === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedFormat(option.value)}
              >
                <div className="format-icon">{option.icon}</div>
                <div className="format-info">
                  <div className="format-name">{option.label}</div>
                  <div className="format-description">{option.description}</div>
                </div>
                {selectedFormat === option.value && <div className="format-selected">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="generation-controls">
          <button
            className="generate-btn"
            onClick={handleGeneratePublication}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner">⏳</span>
                Generating {selectedFormat.toUpperCase()}...
              </>
            ) : selectedFormat === 'pdf' ? (
              <>
                🖨️ Print {getSelectedComponentName()} to PDF
              </>
            ) : (
              <>
                🚀 Generate {getSelectedComponentName()} {selectedFormat.toUpperCase()} Publication
              </>
            )}
          </button>
          
          {!hasWriteAccess && !profile?.isDemo && (
            <p className="permission-notice">
              ℹ️ Demo mode: Publications will be generated locally for preview
            </p>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        {generatedPublications.length > 0 && (
          <div className="generated-publications">
            <h4>📥 Generated Publications</h4>
            <div className="publications-list">
              {generatedPublications.map((publication) => (
                <div key={publication.id} className="publication-item">
                  <div className="publication-icon">
                    {getFormatIcon(publication.format)}
                  </div>
                  <div className="publication-details">
                    <div className="publication-name">{publication.filename}</div>
                    <div className="publication-scope">
                      {publication.scopeName || 'Complete DAK'} • {publication.format.toUpperCase()}
                    </div>
                    <div className="publication-meta">
                      Generated: {new Date(publication.generatedAt).toLocaleString()} • 
                      Size: {publication.size}
                    </div>
                  </div>
                  <div className="publication-actions">
                    <a
                      href={publication.downloadUrl}
                      className="download-btn"
                      download={publication.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💾 Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="service-status">
          <div className="service-indicator">
            <span className="status-dot"></span>
            <span className="status-text">DAK Publication API: {profile?.isDemo ? 'Demo Mode' : 'Connecting...'}</span>
          </div>
          <p className="service-note">
            Publications are generated using the DAK Publication API service with WHO SMART Guidelines templates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DAKPublicationGenerator;