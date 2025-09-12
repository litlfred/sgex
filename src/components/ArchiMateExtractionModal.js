import React, { useState } from 'react';
import './ArchiMateExtractionModal.css';

/**
 * Modal component for displaying ArchiMate extraction results
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.extractionResult - ArchiMate extraction result
 * @param {string} props.sourceModelName - Name of the source logical model
 */
const ArchiMateExtractionModal = ({
  isOpen,
  onClose,
  extractionResult,
  sourceModelName = 'Logical Model'
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!isOpen || !extractionResult) return null;

  const { success, archiMateObject, xml, error } = extractionResult;

  const handleDownloadXML = () => {
    if (xml) {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sourceModelName.replace(/\s+/g, '_')}_archimate.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyXML = () => {
    if (xml) {
      navigator.clipboard.writeText(xml).then(() => {
        // You could add a toast notification here
        alert('ArchiMate XML copied to clipboard!');
      });
    }
  };

  if (!success) {
    return (
      <div className="modal-overlay archimate-modal-overlay" onClick={onClose}>
        <div className="modal-content archimate-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>ArchiMate Extraction Failed</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Extraction Error</h4>
                <p>Failed to extract ArchiMate model from <strong>{sourceModelName}</strong></p>
                <div className="error-details">
                  <code>{error}</code>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay archimate-modal-overlay" onClick={onClose}>
      <div className="modal-content archimate-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>ArchiMate Extraction Results</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="extraction-tabs">
            <button 
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              📊 Summary
            </button>
            <button 
              className={`tab-btn ${activeTab === 'structure' ? 'active' : ''}`}
              onClick={() => setActiveTab('structure')}
            >
              🏗️ Structure
            </button>
            <button 
              className={`tab-btn ${activeTab === 'xml' ? 'active' : ''}`}
              onClick={() => setActiveTab('xml')}
            >
              📄 XML
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'summary' && (
              <div className="summary-tab">
                <div className="extraction-summary">
                  <div className="summary-header">
                    <h4>📦 DataObject: {archiMateObject.name}</h4>
                    <p className="summary-description">{archiMateObject.documentation}</p>
                  </div>
                  
                  <div className="summary-stats">
                    <div className="stat-card">
                      <div className="stat-value">{archiMateObject.elements.length}</div>
                      <div className="stat-label">Data Attributes</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{archiMateObject.relationships.length}</div>
                      <div className="stat-label">Relationships</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{archiMateObject.source.type}</div>
                      <div className="stat-label">Source Type</div>
                    </div>
                  </div>

                  <div className="source-info">
                    <h5>Source Information</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">File:</span>
                        <span className="info-value">{archiMateObject.source.fileName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Original Name:</span>
                        <span className="info-value">{archiMateObject.source.originalName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Extracted:</span>
                        <span className="info-value">{new Date(archiMateObject.metadata.extractedAt).toLocaleString()}</span>
                      </div>
                      {archiMateObject.metadata.parent && (
                        <div className="info-item">
                          <span className="info-label">Parent:</span>
                          <span className="info-value">{archiMateObject.metadata.parent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="structure-tab">
                <div className="structure-view">
                  <h4>Data Attributes ({archiMateObject.elements.length})</h4>
                  <div className="elements-list">
                    {archiMateObject.elements.map((element, index) => (
                      <div key={element.id} className="element-card">
                        <div className="element-header">
                          <span className="element-name">{element.name}</span>
                          <span className="element-type">{element.dataType}</span>
                          <span className="element-cardinality">{element.cardinality}</span>
                        </div>
                        <div className="element-description">
                          {element.description}
                        </div>
                        {element.constraints && element.constraints.length > 0 && (
                          <div className="element-constraints">
                            <strong>Constraints:</strong>
                            <ul>
                              {element.constraints.map((constraint, idx) => (
                                <li key={idx}>{constraint.property}: {constraint.value}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {archiMateObject.relationships.length > 0 && (
                    <div className="relationships-section">
                      <h4>Relationships ({archiMateObject.relationships.length})</h4>
                      <div className="relationships-list">
                        {archiMateObject.relationships.map((rel, index) => (
                          <div key={rel.id} className="relationship-card">
                            <div className="relationship-header">
                              <span className="relationship-type">{rel.type}</span>
                              <span className="relationship-target">{rel.target}</span>
                            </div>
                            <div className="relationship-description">
                              {rel.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'xml' && (
              <div className="xml-tab">
                <div className="xml-controls">
                  <button className="btn-secondary" onClick={handleCopyXML}>
                    📋 Copy XML
                  </button>
                  <button className="btn-primary" onClick={handleDownloadXML}>
                    💾 Download XML
                  </button>
                </div>
                <div className="xml-content">
                  <pre><code>{xml}</code></pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            <span>ArchiMate model extracted from {sourceModelName}</span>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={handleDownloadXML}>
              💾 Download XML
            </button>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiMateExtractionModal;