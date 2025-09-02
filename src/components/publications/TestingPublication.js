import React from 'react';
import PublicationView from './PublicationView';

/**
 * Testing Scenarios Publication Component
 * 
 * Renders test scenarios and validation criteria in publication format
 */
const TestingPublication = () => {
  
  const renderTesting = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Test Scenarios and Validation</h3>
          <p>
            This section contains test scenarios, feature files, and validation criteria 
            that ensure the correct implementation and behavior of this Digital Adaptation Kit.
          </p>
          
          {dakData?.testFiles && dakData.testFiles.length > 0 ? (
            <div className="testing-content">
              <h4>Test Files and Scenarios</h4>
              <div className="file-list">
                {dakData.testFiles.map((testFile, index) => {
                  const isFeatureFile = testFile.name.endsWith('.feature');
                  const icon = isFeatureFile ? '📝' : '🧪';
                  
                  return (
                    <div key={index} className="file-item">
                      <span className="file-icon">{icon}</span>
                      <span className="file-name">{testFile.name}</span>
                      <span className="file-path">{testFile.path}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="test-scenarios-info">
                <h4>Testing Framework</h4>
                <p>
                  The test files implement a comprehensive validation framework that covers:
                </p>
                <ul>
                  <li><strong>Feature Files (.feature)</strong> - Behavior-driven development scenarios in Gherkin syntax</li>
                  <li><strong>Test Data (.json)</strong> - Structured test datasets and mock clinical scenarios</li>
                  <li><strong>FHIR Test Bundles</strong> - Standardized test cases for FHIR resource validation</li>
                  <li><strong>Integration Tests</strong> - End-to-end workflow and system integration scenarios</li>
                </ul>
              </div>

              <div className="validation-criteria">
                <h4>Validation Criteria</h4>
                <p>
                  Test scenarios validate the following aspects of the DAK implementation:
                </p>
                <div className="validation-categories">
                  <div className="validation-category">
                    <h5>Clinical Logic Validation</h5>
                    <ul>
                      <li>Decision support rule accuracy</li>
                      <li>Clinical workflow compliance</li>
                      <li>Care pathway adherence</li>
                      <li>Risk assessment algorithms</li>
                    </ul>
                  </div>
                  
                  <div className="validation-category">
                    <h5>Data Structure Validation</h5>
                    <ul>
                      <li>FHIR profile conformance</li>
                      <li>Terminology binding verification</li>
                      <li>Data element completeness</li>
                      <li>Interoperability standards</li>
                    </ul>
                  </div>
                  
                  <div className="validation-category">
                    <h5>Business Process Validation</h5>
                    <ul>
                      <li>BPMN workflow execution</li>
                      <li>Process step completion</li>
                      <li>Error handling scenarios</li>
                      <li>Integration point testing</li>
                    </ul>
                  </div>
                  
                  <div className="validation-category">
                    <h5>Performance and Security</h5>
                    <ul>
                      <li>System performance benchmarks</li>
                      <li>Security compliance verification</li>
                      <li>Data privacy protection</li>
                      <li>Access control validation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="acceptance-criteria">
                <h4>Acceptance Criteria</h4>
                <p>
                  Each test scenario defines specific acceptance criteria that must be met for 
                  successful DAK implementation:
                </p>
                <ul>
                  <li>All clinical decision rules produce expected outcomes</li>
                  <li>FHIR resources validate against defined profiles</li>
                  <li>Business processes complete without errors</li>
                  <li>Data quality meets defined standards</li>
                  <li>Integration interfaces function correctly</li>
                  <li>Performance metrics are within acceptable ranges</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No test files found in this repository.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="testing"
      renderFunction={renderTesting}
      title="Test Scenarios and Validation"
      printMode={true}
    />
  );
};

export default TestingPublication;