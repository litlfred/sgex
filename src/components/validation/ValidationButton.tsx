/**
 * ValidationButton Component
 * 
 * Reusable button component for triggering DAK validation.
 * Displays validation status using button-style indicators ([RED], [YELLOW], [GREEN], [BLUE])
 * following GitHub Pages deployment workflow styling.
 * 
 * @example
 * ```tsx
 * <ValidationButton
 *   onClick={handleValidate}
 *   loading={isValidating}
 *   status={report?.isValid ? 'success' : 'error'}
 *   label="Validate DAK"
 * />
 * ```
 */

import React from 'react';
import './ValidationButton.css';

export interface ValidationButtonProps {
  /** Handler for validation trigger */
  onClick: () => void;
  /** Loading state display */
  loading?: boolean;
  /** Disable button */
  disabled?: boolean;
  /** Validation status for color indicator */
  status?: 'error' | 'warning' | 'success' | 'info' | null;
  /** Button text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Button component for triggering validation with status indicators
 */
export const ValidationButton: React.FC<ValidationButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  status = null,
  label = 'Validate',
  className = ''
}) => {
  const getStatusClass = (): string => {
    if (!status) return '';
    switch (status) {
      case 'error':
        return 'validation-button--error';
      case 'warning':
        return 'validation-button--warning';
      case 'success':
        return 'validation-button--success';
      case 'info':
        return 'validation-button--info';
      default:
        return '';
    }
  };

  const getStatusIndicator = (): string => {
    if (!status) return '';
    switch (status) {
      case 'error':
        return '[RED]';
      case 'warning':
        return '[YELLOW]';
      case 'success':
        return '[GREEN]';
      case 'info':
        return '[BLUE]';
      default:
        return '';
    }
  };

  return (
    <button
      type="button"
      className={`validation-button ${getStatusClass()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={loading ? 'Validating...' : label}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="validation-button__spinner" aria-hidden="true">
            ⟳
          </span>
          <span>Validating...</span>
        </>
      ) : (
        <>
          {status && (
            <span className="validation-button__indicator" aria-hidden="true">
              {getStatusIndicator()}
            </span>
          )}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default ValidationButton;
