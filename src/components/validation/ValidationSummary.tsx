/**
 * ValidationSummary Component
 * Displays compact validation status with error/warning/info counts
 */

import React from 'react';
import { DAKValidationReport } from '@/services/validation/types';
import './ValidationSummary.css';

export interface ValidationSummaryProps {
  /** Validation report to display */
  report: DAKValidationReport | null;
  /** Click handler to show full report */
  onClick?: () => void;
  /** Display mode */
  mode?: 'compact' | 'inline';
  /** Additional CSS class */
  className?: string;
}

/**
 * ValidationSummary component for compact validation status display
 */
export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  report,
  onClick,
  mode = 'compact',
  className = ''
}) => {
  if (!report) {
    return null;
  }

  const { summary } = report;
  const { totalErrors = 0, totalWarnings = 0, totalInfo = 0 } = summary;

  // Determine overall status
  const getStatus = (): 'error' | 'warning' | 'success' => {
    if (totalErrors > 0) return 'error';
    if (totalWarnings > 0) return 'warning';
    return 'success';
  };

  const status = getStatus();

  // Status labels
  const statusLabels = {
    error: '[RED]',
    warning: '[YELLOW]',
    success: '[GREEN]'
  };

  const statusText = {
    error: 'Validation Failed',
    warning: 'Validation Passed with Warnings',
    success: 'Validation Passed'
  };

  return (
    <div
      className={`validation-summary validation-summary--${mode} validation-summary--${status} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title="Click to view detailed validation report"
    >
      <div className="validation-summary__status">
        <span className={`validation-summary__indicator validation-summary__indicator--${status}`}>
          {statusLabels[status]}
        </span>
        <span className="validation-summary__text">{statusText[status]}</span>
      </div>

      <div className="validation-summary__counts">
        {totalErrors > 0 && (
          <span className="validation-summary__badge validation-summary__badge--error">
            <span className="validation-summary__badge-label">Errors:</span>
            <span className="validation-summary__badge-count">{totalErrors}</span>
          </span>
        )}
        
        {totalWarnings > 0 && (
          <span className="validation-summary__badge validation-summary__badge--warning">
            <span className="validation-summary__badge-label">Warnings:</span>
            <span className="validation-summary__badge-count">{totalWarnings}</span>
          </span>
        )}
        
        {totalInfo > 0 && (
          <span className="validation-summary__badge validation-summary__badge--info">
            <span className="validation-summary__badge-label">Info:</span>
            <span className="validation-summary__badge-count">{totalInfo}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ValidationSummary;
