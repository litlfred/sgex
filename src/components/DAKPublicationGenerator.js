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

    try {
      setIsGenerating(true);
      setError(null);

      // Generate publications client-side
      const selectedComponent = dakComponents.find(comp => comp.id === selectedScope);
      const scopeName = selectedComponent ? selectedComponent.name : 'Full DAK';
      const filePrefix = selectedScope === 'full' ? repoName : `${repoName}-${selectedScope}`;
      
      // Client-side publication generation
      const publicationContent = await generatePublicationContent(selectedFormat, selectedScope, selectedComponent);
      
      // Create downloadable file
      const blob = new Blob([publicationContent], { 
        type: getContentType(selectedFormat) 
      });
      const downloadUrl = URL.createObjectURL(blob);
      
      const publication = {
        id: `pub-${Date.now()}`,
        format: selectedFormat,
        scope: selectedScope,
        scopeName: scopeName,
        filename: `${filePrefix}-${selectedBranch}-publication.${getFileExtension(selectedFormat)}`,
        downloadUrl: downloadUrl,
        generatedAt: new Date().toISOString(),
        size: formatFileSize(blob.size)
      };
      
      setGeneratedPublications(prev => [publication, ...prev]);
      setIsGenerating(false);
    } catch (err) {
      console.error('Publication generation error:', err);
      setError(err.message || 'Failed to generate publication');
      setIsGenerating(false);
    }
  };

  const generatePublicationContent = async (format, scope, component) => {
    const publicationTitle = scope === 'full' 
      ? `${repoName} - WHO SMART Guidelines Implementation Guide`
      : `${repoName} - ${component.name}`;
    
    const currentDate = new Date().toLocaleDateString();
    const currentYear = new Date().getFullYear();
    
    if (format === 'html') {
      return generateHTMLPublication(publicationTitle, scope, component, currentDate);
    } else if (format === 'epub') {
      return generateEPUBPublication(publicationTitle, scope, component, currentDate);
    } else if (format === 'docbook') {
      return generateDocBookPublication(publicationTitle, scope, component, currentDate);
    }
    
    throw new Error(`Unsupported format: ${format}`);
  };

  const generateHTMLPublication = (title, scope, component, date) => {
    const scopeContent = scope === 'full' 
      ? generateFullDAKContent() 
      : generateComponentContent(component);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; color: #333; }
        .header { background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%); color: white; padding: 2rem; margin: -2rem -2rem 2rem -2rem; }
        .who-logo { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        h1 { color: #0078d4; border-bottom: 2px solid #0078d4; padding-bottom: 0.5rem; }
        h2 { color: #005a9e; margin-top: 2rem; }
        .metadata { background: #f8f9fa; padding: 1rem; border-left: 4px solid #0078d4; margin: 2rem 0; }
        .component-section { margin: 2rem 0; padding: 1.5rem; border: 1px solid #dee2e6; border-radius: 8px; }
        @media print { .header { background: #0078d4 !important; -webkit-print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="who-logo">WHO</div>
        <h1 style="color: white; border: none; margin: 0;">${title}</h1>
        <p style="margin: 0.5rem 0 0 0;">WHO SMART Guidelines Implementation Guide</p>
    </div>

    <div class="metadata">
        <h2>Publication Information</h2>
        <p><strong>Repository:</strong> ${owner}/${repoName}</p>
        <p><strong>Branch:</strong> ${selectedBranch}</p>
        <p><strong>Generated:</strong> ${date}</p>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Copyright:</strong> © ${new Date().getFullYear()} World Health Organization</p>
    </div>

    ${scopeContent}

    <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d;">
        <p>Generated by SGeX Workbench • WHO SMART Guidelines Digital Adaptation Kit</p>
    </footer>
</body>
</html>`;
  };

  const generateEPUBPublication = (title, scope, component, date) => {
    // Simplified EPUB content (could be enhanced with full EPUB structure)
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>${title}</title>
    <style type="text/css">
        body { font-family: Georgia, serif; line-height: 1.6; margin: 2em; }
        h1 { color: #0078d4; border-bottom: 2px solid #0078d4; }
        h2 { color: #005a9e; margin-top: 2em; }
        .metadata { background: #f8f9fa; padding: 1em; border-left: 4px solid #0078d4; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    
    <div class="metadata">
        <h2>Publication Information</h2>
        <p><strong>Repository:</strong> ${owner}/${repoName}</p>
        <p><strong>Branch:</strong> ${selectedBranch}</p>
        <p><strong>Generated:</strong> ${date}</p>
        <p><strong>Copyright:</strong> © ${new Date().getFullYear()} World Health Organization</p>
    </div>

    ${scope === 'full' ? generateFullDAKContent() : generateComponentContent(component)}
</body>
</html>`;
    return content;
  };

  const generateDocBookPublication = (title, scope, component, date) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<book xmlns="http://docbook.org/ns/docbook" version="5.0">
    <info>
        <title>${title}</title>
        <subtitle>WHO SMART Guidelines Implementation Guide</subtitle>
        <author>
            <orgname>World Health Organization</orgname>
        </author>
        <date>${date}</date>
        <copyright>
            <year>${new Date().getFullYear()}</year>
            <holder>World Health Organization</holder>
        </copyright>
    </info>

    <chapter xml:id="metadata">
        <title>Publication Information</title>
        <para><emphasis>Repository:</emphasis> ${owner}/${repoName}</para>
        <para><emphasis>Branch:</emphasis> ${selectedBranch}</para>
        <para><emphasis>Generated:</emphasis> ${date}</para>
        <para><emphasis>Version:</emphasis> 1.0.0</para>
    </chapter>

    <chapter xml:id="content">
        <title>${scope === 'full' ? 'Complete DAK Content' : component.name}</title>
        ${scope === 'full' ? generateFullDAKDocBookContent() : generateComponentDocBookContent(component)}
    </chapter>
</book>`;
  };

  const generateFullDAKContent = () => {
    return `
    <div class="component-section">
        <h2>🔄 Business Processes</h2>
        <p>This section contains BPMN workflows and business process definitions for the ${repoName} DAK.</p>
        <p><em>Content would be dynamically loaded from the repository's business process files.</em></p>
    </div>

    <div class="component-section">
        <h2>🎯 Decision Support Logic</h2>
        <p>DMN decision tables and clinical decision support logic.</p>
        <p><em>Content would be dynamically loaded from the repository's decision support files.</em></p>
    </div>

    <div class="component-section">
        <h2>🗃️ Core Data Elements</h2>
        <p>Essential data structures, terminology, and data dictionary.</p>
        <p><em>Content would be dynamically loaded from the repository's data element definitions.</em></p>
    </div>

    <div class="component-section">
        <h2>📖 Health Interventions</h2>
        <p>Clinical guidelines and health intervention specifications.</p>
        <p><em>Content would be dynamically loaded from the repository's intervention guidelines.</em></p>
    </div>

    <div class="component-section">
        <h2>📊 Program Indicators</h2>
        <p>Performance indicators and measurement definitions.</p>
        <p><em>Content would be dynamically loaded from the repository's indicator definitions.</em></p>
    </div>

    <div class="component-section">
        <h2>⚙️ Additional Components</h2>
        <p>Generic personas, user scenarios, functional requirements, and test scenarios.</p>
        <p><em>Additional DAK components and documentation.</em></p>
    </div>`;
  };

  const generateComponentContent = (component) => {
    return `
    <div class="component-section">
        <h2>${component.icon} ${component.name}</h2>
        <p>${component.description}</p>
        <p><strong>Component Details:</strong></p>
        <ul>
            <li>Repository: ${owner}/${repoName}</li>
            <li>Branch: ${selectedBranch}</li>
            <li>Component Type: ${component.name}</li>
            <li>Generated: ${new Date().toLocaleString()}</li>
        </ul>
        <p><em>Detailed content for this component would be dynamically loaded from the repository files specific to ${component.id}.</em></p>
        
        <h3>Implementation Notes</h3>
        <p>This component publication contains targeted content for ${component.name} from the DAK repository. 
        In a full implementation, this would include:</p>
        <ul>
            <li>Specific file content from the repository</li>
            <li>Related documentation and specifications</li>
            <li>Cross-references to other DAK components</li>
            <li>Implementation guidance and examples</li>
        </ul>
    </div>`;
  };

  const generateFullDAKDocBookContent = () => {
    return `
        <section xml:id="business-processes">
            <title>Business Processes</title>
            <para>BPMN workflows and business process definitions.</para>
        </section>
        <section xml:id="decision-support">
            <title>Decision Support Logic</title>
            <para>DMN decision tables and clinical decision support.</para>
        </section>
        <section xml:id="core-data">
            <title>Core Data Elements</title>
            <para>Essential data structures and terminology.</para>
        </section>`;
  };

  const generateComponentDocBookContent = (component) => {
    return `
        <section xml:id="${component.id}">
            <title>${component.name}</title>
            <para>${component.description}</para>
            <para>Component-specific content and implementation details.</para>
        </section>`;
  };

  const getContentType = (format) => {
    switch (format) {
      case 'html': return 'text/html';
      case 'epub': return 'application/epub+zip';
      case 'docbook': return 'application/xml';
      default: return 'text/plain';
    }
  };

  const getFileExtension = (format) => {
    switch (format) {
      case 'html': return 'html';
      case 'epub': return 'xhtml'; // Simplified EPUB as XHTML
      case 'docbook': return 'xml';
      default: return 'txt';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <div className="scope-label">Publication Scope:</div>
          <div className="scope-options">
            {dakComponents.map((component) => (
              <button
                key={component.id}
                className={`scope-option ${selectedScope === component.id ? 'selected' : ''}`}
                onClick={() => setSelectedScope(component.id)}
                type="button"
                aria-pressed={selectedScope === component.id}
              >
                <div className="scope-icon">{component.icon}</div>
                <div className="scope-info">
                  <div className="scope-name">{component.name}</div>
                  <div className="scope-description">{component.description}</div>
                </div>
                {selectedScope === component.id && <div className="scope-selected">✓</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="format-selection">
          <div className="format-label">Select Publication Format:</div>
          <div className="format-options">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                className={`format-option ${selectedFormat === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedFormat(option.value)}
                type="button"
                aria-pressed={selectedFormat === option.value}
              >
                <div className="format-icon">{option.icon}</div>
                <div className="format-info">
                  <div className="format-name">{option.label}</div>
                  <div className="format-description">{option.description}</div>
                </div>
                {selectedFormat === option.value && <div className="format-selected">✓</div>}
              </button>
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
            <span className="status-dot ready"></span>
            <span className="status-text">Client-Side Generation: Ready</span>
          </div>
          <p className="service-note">
            Publications are generated directly in your browser using WHO SMART Guidelines templates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DAKPublicationGenerator;