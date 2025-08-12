import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import enhancedDAKValidationService from '../services/enhancedDAKValidationService';
import dakValidationRegistry, { DAK_COMPONENTS, VALIDATION_LEVELS } from '../services/dakValidationRegistry';
import { 
  FormattedValidationResults, 
  DAKValidationResult, 
  ValidationSummary, 
  GitHubRepository,
  GitHubUser 
} from '../types/core';
import './ValidationPanel.css';

// Component props interface
interface ValidationPanelProps {
  repository?: GitHubRepository | any; // Allow existing structure during migration
  profile?: GitHubUser | any; // Allow existing structure during migration
  selectedBranch?: string;
  onValidationComplete?: (results: FormattedValidationResults) => void;
}

// Validation history entry interface
interface ValidationHistoryEntry {
  timestamp: number;
  component: string;
  summary: ValidationSummary;
  canSave: boolean;
  totalIssues: number;
}

// Get component for file based on path patterns
const getComponentForFile = (filePath: string): string => {
  if (filePath.endsWith('sushi-config.yaml')) return 'dak-structure';
  if (filePath.endsWith('.bpmn')) return 'business-processes';
  if (filePath.endsWith('.dmn')) return 'decision-support-logic';
  if (filePath.includes('questionnaire')) return 'core-data-elements';
  if (filePath.includes('measure')) return 'indicators';
  if (filePath.includes('test') || filePath.endsWith('.feature')) return 'test-scenarios';
  if (filePath.includes('requirement')) return 'requirements';
  return 'file-structure';
};

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  repository, 
  profile, 
  selectedBranch, 
  onValidationComplete 
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<FormattedValidationResults | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [validationHistory, setValidationHistory] = useState<ValidationHistoryEntry[]>([]);

  // Get validation summary for component overview
  const componentSummary = dakValidationRegistry.getComponentSummary();

  // Handle validation execution
  const runValidation = async (component: string = 'all'): Promise<void> => {
    if (!repository || !profile) {
      console.warn('Cannot run validation without repository and profile');
      return;
    }

    setIsValidating(true);
    setSelectedComponent(component);

    try {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repo = repository.name;
      const branch = selectedBranch || repository.default_branch || 'main';

      let results: FormattedValidationResults;
      
      if (component === 'all') {
        // Validate entire DAK
        results = await enhancedDAKValidationService.validateDAK(owner, repo, branch);
      } else {
        // Validate specific component
        const files = await enhancedDAKValidationService.getDAKFiles(owner, repo, branch);
        const componentFiles = files.filter(file => 
          getComponentForFile(file.path) === component
        );
        results = await enhancedDAKValidationService.validateComponent(component, componentFiles);
      }

      setValidationResults(results);
      
      // Add to history
      const historyEntry: ValidationHistoryEntry = {
        timestamp: Date.now(),
        component,
        summary: results.summary,
        canSave: results.canSave,
        totalIssues: results.total
      };
      
      setValidationHistory(prev => [historyEntry, ...prev.slice(0, 4)]); // Keep last 5

      // Notify parent if callback provided
      if (onValidationComplete) {
        onValidationComplete(results);
      }

    } catch (error: any) {
      console.error('Validation failed:', error);
      setValidationResults({
        error: `Validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        byComponent: {},
        byFile: {},
        canSave: false,
        total: 1
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Format validation level for display
  const formatLevel = (level: string): string => {
    return t(`validation.levels.${level}`, level);
  };

  // Get level icon
  const getLevelIcon = (level: string): string => {
    switch (level) {
      case VALIDATION_LEVELS.ERROR: return '🚫';
      case VALIDATION_LEVELS.WARNING: return '⚠️';
      case VALIDATION_LEVELS.INFO: return 'ℹ️';
      default: return '❓';
    }
  };

  // Get level color class
  const getLevelClass = (level: string): string => {
    switch (level) {
      case VALIDATION_LEVELS.ERROR: return 'validation-error';
      case VALIDATION_LEVELS.WARNING: return 'validation-warning'; 
      case VALIDATION_LEVELS.INFO: return 'validation-info';
      default: return 'validation-unknown';
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Auto-run validation when repository changes
  useEffect(() => {
    if (repository && profile && !isValidating) {
      runValidation('all');
    }
  }, [repository?.name, repository?.owner?.login, selectedBranch]);

  // Get total issues count for summary
  const getTotalIssues = (): number => {
    if (!validationResults) return 0;
    return validationResults.summary.error + validationResults.summary.warning + validationResults.summary.info;
  };

  // Render validation result item
  const renderValidationResult = (result: DAKValidationResult, index: number): React.ReactElement => (
    <div key={`${result.validationId}-${index}`} className={`validation-result ${getLevelClass(result.level)}`}>
      <div className="validation-result-header">
        <span className="validation-icon">{getLevelIcon(result.level)}</span>
        <span className="validation-level">{formatLevel(result.level)}</span>
        <span className="validation-component">{DAK_COMPONENTS[result.component]?.name || result.component}</span>
      </div>
      <div className="validation-result-content">
        <div className="validation-message">{result.message}</div>
        <div className="validation-file">{result.filePath}</div>
        {result.line && (
          <div className="validation-location">
            Line {result.line}{result.column && `, Column ${result.column}`}
          </div>
        )}
        {result.suggestion && (
          <div className="validation-suggestion">
            <strong>Suggestion:</strong> {result.suggestion}
          </div>
        )}
      </div>
    </div>
  );

  // Render validation results by component
  const renderResultsByComponent = (): React.ReactElement => {
    if (!validationResults || !validationResults.byComponent) {
      return <div className="no-results">No validation results available</div>;
    }

    return (
      <div className="validation-results-by-component">
        {Object.entries(validationResults.byComponent).map(([componentId, results]) => (
          <div key={componentId} className="component-validation-section">
            <h4 className="component-title">
              {DAK_COMPONENTS[componentId]?.name || componentId} ({results.length})
            </h4>
            <div className="component-results">
              {results.map((result, index) => renderValidationResult(result, index))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render component selector
  const renderComponentSelector = (): React.ReactElement => (
    <div className="component-selector">
      <label htmlFor="component-select">Validate Component:</label>
      <select
        id="component-select"
        value={selectedComponent}
        onChange={(e) => setSelectedComponent(e.target.value)}
        disabled={isValidating}
      >
        <option value="all">All Components</option>
        {Object.entries(DAK_COMPONENTS).map(([id, component]) => (
          <option key={id} value={id}>
            {component.name} ({componentSummary[id]?.validationCount || 0} validations)
          </option>
        ))}
      </select>
      <button
        className="validate-button"
        onClick={() => runValidation(selectedComponent)}
        disabled={isValidating || !repository || !profile}
      >
        {isValidating ? 'Validating...' : 'Run Validation'}
      </button>
    </div>
  );

  // Render validation summary
  const renderValidationSummary = (): React.ReactElement | null => {
    if (!validationResults) return null;

    const { summary } = validationResults;
    const hasIssues = summary.error > 0 || summary.warning > 0 || summary.info > 0;

    return (
      <div className="validation-summary">
        <div className="summary-header">
          <h3>Validation Summary</h3>
          <div className={`save-indicator ${validationResults.canSave ? 'can-save' : 'cannot-save'}`}>
            {validationResults.canSave ? '✅ Can Save' : '❌ Cannot Save'}
          </div>
        </div>
        
        {hasIssues ? (
          <div className="summary-counts">
            {summary.error > 0 && (
              <span className="summary-count summary-error">
                🚫 {summary.error} Errors
              </span>
            )}
            {summary.warning > 0 && (
              <span className="summary-count summary-warning">
                ⚠️ {summary.warning} Warnings
              </span>
            )}
            {summary.info > 0 && (
              <span className="summary-count summary-info">
                ℹ️ {summary.info} Info
              </span>
            )}
          </div>
        ) : (
          <div className="summary-success">
            ✅ All validations passed!
          </div>
        )}
        
        {validationResults.metadata && (
          <div className="validation-metadata">
            <small>
              {validationResults.metadata.filesValidated} files validated
              {validationResults.metadata.validatedAt && 
                ` at ${new Date(validationResults.metadata.validatedAt).toLocaleTimeString()}`
              }
            </small>
          </div>
        )}
      </div>
    );
  };

  // Render validation history
  const renderValidationHistory = (): React.ReactElement | null => {
    if (validationHistory.length === 0) return null;

    return (
      <div className="validation-history">
        <h4>Recent Validations</h4>
        <div className="history-list">
          {validationHistory.map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="history-entry">
              <div className="history-header">
                <span className="history-component">
                  {entry.component === 'all' ? 'All Components' : DAK_COMPONENTS[entry.component]?.name || entry.component}
                </span>
                <span className="history-time">{formatTimestamp(entry.timestamp)}</span>
              </div>
              <div className="history-summary">
                <span className={`history-save-status ${entry.canSave ? 'can-save' : 'cannot-save'}`}>
                  {entry.canSave ? '✅' : '❌'}
                </span>
                <span className="history-counts">
                  {entry.summary.error > 0 && `🚫 ${entry.summary.error} `}
                  {entry.summary.warning > 0 && `⚠️ ${entry.summary.warning} `}
                  {entry.summary.info > 0 && `ℹ️ ${entry.summary.info} `}
                  {entry.totalIssues === 0 && 'All passed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="validation-panel">
      <div className="validation-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="validation-panel-title">
          DAK Validation 
          {validationResults && (
            <span className="validation-count">
              ({getTotalIssues()} issues)
            </span>
          )}
        </h2>
        <button className="expand-button" aria-label="Toggle validation panel">
          {isExpanded ? '🔽' : '🔼'}
        </button>
      </div>

      {isExpanded && (
        <div className="validation-panel-content">
          {renderComponentSelector()}
          
          {validationResults?.error && (
            <div className="validation-error-message">
              <strong>Error:</strong> {validationResults.error}
            </div>
          )}
          
          {renderValidationSummary()}
          
          {isValidating && (
            <div className="validation-loading">
              <div className="loading-spinner">⏳</div>
              <span>Running validation...</span>
            </div>
          )}
          
          {!isValidating && validationResults && !validationResults.error && (
            <div className="validation-results">
              <h3>Validation Results</h3>
              {renderResultsByComponent()}
            </div>
          )}
          
          {renderValidationHistory()}
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;