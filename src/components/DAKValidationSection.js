/**
 * DAK Validation Section Component
 * 
 * Lazy-loaded component that encapsulates all validation functionality.
 * This prevents the validation services from being loaded until this component is rendered.
 */

import React, { useState } from 'react';
import { useValidation } from './validation/useValidation';
import { ValidationButton } from './validation/ValidationButton';
import { ValidationReport } from './validation/ValidationReport';
import { ValidationSummary } from './validation/ValidationSummary';

const DAKValidationSection = ({ owner, repo, branch }) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationComponent, setValidationComponent] = useState('all');

  // Validation hook - only loaded when this component renders
  const { report, loading: validating, validate } = useValidation({
    owner,
    repo,
    branch
  });

  return (
    <div className="dak-validation-section">
      <div className="section-header">
        <h3 className="section-title">DAK Validation</h3>
        <p className="section-description">
          Validate DAK artifacts against WHO SMART Guidelines standards. Check BPMN processes, 
          DMN decision tables, FSH profiles, and DAK-level compliance.
        </p>
      </div>

      <div className="validation-controls">
        <div className="component-filter">
          <label htmlFor="validation-component-filter">Validate Component:</label>
          <select
            id="validation-component-filter"
            value={validationComponent}
            onChange={(e) => setValidationComponent(e.target.value)}
            className="component-select"
          >
            <option value="all">All Components</option>
            <option value="business-processes">Business Processes (BPMN)</option>
            <option value="decision-logic">Decision Logic (DMN)</option>
            <option value="fhir-profiles">FHIR Profiles (FSH)</option>
            <option value="dak-config">DAK Configuration</option>
          </select>
        </div>

        <ValidationButton
          onClick={() => validate({ component: validationComponent === 'all' ? undefined : validationComponent })}
          loading={validating}
          status={report ? (report.isValid ? 'success' : (report.summary.errorCount > 0 ? 'error' : 'warning')) : undefined}
          label={validating ? 'Validating...' : 'Run Validation'}
        />
      </div>

      {report && (
        <div className="validation-results">
          <ValidationSummary
            report={report}
            onClick={() => setShowValidationModal(true)}
          />
        </div>
      )}

      <ValidationReport
        report={report}
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
      />
    </div>
  );
};

export default DAKValidationSection;
