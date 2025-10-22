/**
 * ValidationReport Modal Component
 * 
 * Displays detailed validation results in a modal dialog with:
 * - Summary statistics (errors/warnings/info)
 * - Filter by level and component type
 * - File grouping with expandable sections
 * - Violation details with line numbers and suggestions
 * - Export functionality (JSON/Markdown/CSV)
 * 
 * @example
 * <ValidationReport
 *   report={validationReport}
 *   isOpen={showReport}
 *   onClose={() => setShowReport(false)}
 *   onExport={handleExport}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { DAKValidationReport, ValidationViolation, FileValidationResult } from '../../services/validation/types';
import './ValidationReport.css';

export interface ValidationReportProps {
  /** Validation report to display */
  report: DAKValidationReport | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler for closing the modal */
  onClose: () => void;
  /** Optional handler for export functionality */
  onExport?: (format: 'json' | 'markdown' | 'csv') => void;
}

type FilterLevel = 'all' | 'error' | 'warning' | 'info';

/**
 * ValidationReport Modal Component
 */
export const ValidationReport: React.FC<ValidationReportProps> = ({
  report,
  isOpen,
  onClose,
  onExport
}) => {
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilterLevel('all');
      setFilterComponent('all');
      setExpandedFiles(new Set());
    }
  }, [isOpen]);

  const toggleFile = useCallback((filePath: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback((format: 'json' | 'markdown' | 'csv') => {
    if (onExport) {
      onExport(format);
    }
  }, [onExport]);

  if (!isOpen || !report) {
    return null;
  }

  // Filter violations
  const filteredResults = report.fileResults.reduce((acc, result) => {
    const filteredViolations = result.violations.filter(v => {
      const levelMatch = filterLevel === 'all' || v.level === filterLevel;
      const componentMatch = filterComponent === 'all' || result.component === filterComponent;
      return levelMatch && componentMatch;
    });

    if (filteredViolations.length > 0) {
      acc[result.filePath] = { ...result, violations: filteredViolations };
    }

    return acc;
  }, {} as Record<string, FileValidationResult>);

  // Get unique components
  const components = Array.from(new Set(
    report.fileResults.map(r => r.component).filter(Boolean)
  ));

  // Calculate filtered summary
  const filteredSummary = Object.values(filteredResults).reduce((acc, result) => {
    result.violations.forEach(v => {
      if (v.level === 'error') acc.errorCount++;
      else if (v.level === 'warning') acc.warningCount++;
      else if (v.level === 'info') acc.infoCount++;
    });
    return acc;
  }, { errorCount: 0, warningCount: 0, infoCount: 0 });

  return (
    <div 
      className="validation-report-overlay" 
      role="presentation"
    >
      <div 
        className="validation-report-modal" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="validation-report-title"
      >
        <div className="validation-report-header">
          <h2 id="validation-report-title">Validation Report</h2>
          <button
            className="validation-report-close"
            onClick={onClose}
            aria-label="Close validation report"
          >
            ×
          </button>
        </div>

        <div className="validation-report-summary">
          <div className="validation-summary-stat">
            <span className="validation-stat-label">Errors</span>
            <span className="validation-stat-value validation-stat-error">
              {report.summary.totalErrors}
            </span>
          </div>
          <div className="validation-summary-stat">
            <span className="validation-stat-label">Warnings</span>
            <span className="validation-stat-value validation-stat-warning">
              {report.summary.totalWarnings}
            </span>
          </div>
          <div className="validation-summary-stat">
            <span className="validation-stat-label">Info</span>
            <span className="validation-stat-value validation-stat-info">
              {report.summary.totalInfo}
            </span>
          </div>
          <div className="validation-summary-stat">
            <span className="validation-stat-label">Files</span>
            <span className="validation-stat-value">
              {report.summary.totalFiles}
            </span>
          </div>
        </div>

        <div className="validation-report-filters">
          <div className="validation-filter-group">
            <label htmlFor="level-filter">Level:</label>
            <select
              id="level-filter"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
            >
              <option value="all">All</option>
              <option value="error">Errors Only</option>
              <option value="warning">Warnings Only</option>
              <option value="info">Info Only</option>
            </select>
          </div>

          {components.length > 0 && (
            <div className="validation-filter-group">
              <label htmlFor="component-filter">Component:</label>
              <select
                id="component-filter"
                value={filterComponent}
                onChange={(e) => setFilterComponent(e.target.value)}
              >
                <option value="all">All Components</option>
                {components.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          )}

          {onExport && (
            <div className="validation-export-group">
              <span>Export:</span>
              <button onClick={() => handleExport('json')}>JSON</button>
              <button onClick={() => handleExport('markdown')}>Markdown</button>
              <button onClick={() => handleExport('csv')}>CSV</button>
            </div>
          )}
        </div>

        <div className="validation-report-results">
          {Object.keys(filteredResults).length === 0 ? (
            <div className="validation-no-results">
              <p>No violations found matching the current filters.</p>
            </div>
          ) : (
            Object.entries(filteredResults).map(([filePath, result]) => (
              <div key={filePath} className="validation-file-group">
                <div
                  className="validation-file-header"
                  onClick={() => toggleFile(filePath)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFile(filePath);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedFiles.has(filePath)}
                >
                  <span className="validation-file-toggle">
                    {expandedFiles.has(filePath) ? '▼' : '▶'}
                  </span>
                  <span className="validation-file-path">{filePath}</span>
                  <span className="validation-file-counts">
                    {result.errorCount > 0 && (
                      <span className="validation-count validation-count-error">
                        {result.errorCount} error{result.errorCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {result.warningCount > 0 && (
                      <span className="validation-count validation-count-warning">
                        {result.warningCount} warning{result.warningCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {result.infoCount > 0 && (
                      <span className="validation-count validation-count-info">
                        {result.infoCount} info
                      </span>
                    )}
                  </span>
                </div>

                {expandedFiles.has(filePath) && (
                  <div className="validation-violations">
                    {result.violations.map((violation, idx) => (
                      <div
                        key={idx}
                        className={`validation-violation validation-violation-${violation.level}`}
                      >
                        <div className="validation-violation-header">
                          <span className={`validation-level-badge validation-level-${violation.level}`}>
                            {violation.level.toUpperCase()}
                          </span>
                          <span className="validation-rule-code">{violation.ruleCode}</span>
                          {violation.line && (
                            <span className="validation-location">
                              Line {violation.line}
                              {violation.column && `:${violation.column}`}
                            </span>
                          )}
                        </div>
                        <div className="validation-violation-message">
                          {violation.message}
                        </div>
                        {violation.path && (
                          <div className="validation-violation-path">
                            Path: <code>{violation.path}</code>
                          </div>
                        )}
                        {violation.suggestion && (
                          <div className="validation-violation-suggestion">
                            💡 {violation.suggestion}
                          </div>
                        )}
                        {violation.context && (
                          <details className="validation-violation-context">
                            <summary>Additional Context</summary>
                            <pre>{JSON.stringify(violation.context, null, 2)}</pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="validation-report-footer">
          <button className="validation-button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationReport;
