import React from 'react';
import PublicationView from './PublicationView';

/**
 * Decision Support Logic Publication Component
 * 
 * Renders DMN decision tables and logic in publication format
 */
const DecisionSupportPublication = () => {
  
  const renderDecisionSupport = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Decision Support Logic</h3>
          <p>
            This section contains DMN (Decision Model and Notation) files that define 
            the clinical decision support logic and business rules for this Digital Adaptation Kit.
          </p>
          
          {dakData?.dmnFiles && dakData.dmnFiles.length > 0 ? (
            <div className="decision-support-content">
              <h4>DMN Decision Tables</h4>
              <div className="file-list">
                {dakData.dmnFiles.map((dmnFile, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">🧠</span>
                    <span className="file-name">{dmnFile.name}</span>
                    <span className="file-path">{dmnFile.path}</span>
                  </div>
                ))}
              </div>
              
              <div className="decision-rules-info">
                <h4>Clinical Decision Support Rules</h4>
                <p>
                  The DMN files listed above contain structured decision tables that encode clinical 
                  logic for automated decision support. These rules help healthcare providers make 
                  evidence-based decisions by providing standardized algorithms for:
                </p>
                <ul>
                  <li>Clinical assessments and screening protocols</li>
                  <li>Treatment recommendations and care pathways</li>
                  <li>Risk stratification and patient triage</li>
                  <li>Medication dosing and contraindication checks</li>
                  <li>Follow-up scheduling and monitoring intervals</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No DMN decision support files found in this repository.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="decision-support"
      renderFunction={renderDecisionSupport}
      title="Decision Support Logic"
      printMode={true}
    />
  );
};

export default DecisionSupportPublication;