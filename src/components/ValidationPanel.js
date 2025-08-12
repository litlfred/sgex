import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import enhancedDAKValidationService from '../services/enhancedDAKValidationService';
import dakValidationRegistry, { DAK_COMPONENTS, VALIDATION_LEVELS } from '../services/dakValidationRegistry';
import './ValidationPanel.css';

// Get component for file based on path patterns
const getComponentForFile = (filePath) => {
  if (filePath.endsWith('sushi-config.yaml')) return 'dak-structure';
  if (filePath.endsWith('.bpmn')) return 'business-processes';
  if (filePath.endsWith('.dmn')) return 'decision-support-logic';
  if (filePath.includes('questionnaire')) return 'core-data-elements';
  if (filePath.includes('measure')) return 'indicators';
  if (filePath.includes('test') || filePath.endsWith('.feature')) return 'test-scenarios';
  if (filePath.includes('requirement')) return 'requirements';
  return 'file-structure';
};

const ValidationPanel = ({ repository, profile, selectedBranch, onValidationComplete }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('all');
  const [validationHistory, setValidationHistory] = useState([]);

  // Get validation summary for component overview
  const componentSummary = dakValidationRegistry.getComponentSummary();

  // Handle validation execution
  const runValidation = async (component = 'all') => {
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

      let results;
      
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
      const historyEntry = {
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

    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResults({
        error: `Validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        canSave: false,
        total: 1
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Format validation level for display
  const formatLevel = (level) => {
    return t(`validation.levels.${level}`, level);
  };

  // Get level icon
  const getLevelIcon = (level) => {
    switch (level) {
      case VALIDATION_LEVELS.ERROR: return '🚫';
      case VALIDATION_LEVELS.WARNING: return '⚠️';
      case VALIDATION_LEVELS.INFO: return 'ℹ️';
      default: return '•';
    }
  };

  // Get level color
  const getLevelColor = (level) => {
    switch (level) {
      case VALIDATION_LEVELS.ERROR: return '#d13438';
      case VALIDATION_LEVELS.WARNING: return '#ff8c00';
      case VALIDATION_LEVELS.INFO: return '#0078d4';
      default: return '#666';
    }
  };

  return (
    <div className={`validation-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="validation-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <div className="header-left">
            <span className="validation-icon">🔍</span>
            <h3 className="validation-title">{t('validation.framework.title')}</h3>
            {validationResults && (
              <div className="validation-status">
                {validationResults.canSave ? (
                  <span className="status-badge success">✓ {t('validation.framework.canSave')}</span>
                ) : (
                  <span className="status-badge error">✗ {t('validation.framework.cannotSave')}</span>
                )}
              </div>
            )}
          </div>
          <div className="header-right">
            <button 
              className="expand-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>
        
        {validationResults && !isExpanded && (
          <div className="validation-summary-compact">
            {validationResults.summary.error > 0 && (
              <span className="summary-item error">
                {validationResults.summary.error} {t('validation.framework.errorCount', { count: validationResults.summary.error })}
              </span>
            )}
            {validationResults.summary.warning > 0 && (
              <span className="summary-item warning">
                {validationResults.summary.warning} {t('validation.framework.warningCount', { count: validationResults.summary.warning })}
              </span>
            )}
            {validationResults.summary.info > 0 && (
              <span className="summary-item info">
                {validationResults.summary.info} {t('validation.framework.infoCount', { count: validationResults.summary.info })}
              </span>
            )}
            {validationResults.total === 0 && (
              <span className="summary-item success">{t('validation.framework.noIssues')}</span>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="validation-content">
          {/* Validation Controls */}
          <div className="validation-controls">
            <div className="component-selector">
              <label htmlFor="component-select">{t('validation.framework.runSelected')}:</label>
              <select 
                id="component-select"
                value={selectedComponent} 
                onChange={(e) => setSelectedComponent(e.target.value)}
              >
                <option value="all">All Components</option>
                {Object.values(DAK_COMPONENTS).map(component => (
                  <option key={component.id} value={component.id}>
                    {t(`validation.components.${component.id}`, component.name)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="validation-actions">
              <button 
                className="run-validation-btn primary"
                onClick={() => runValidation(selectedComponent)}
                disabled={isValidating}
              >
                {isValidating ? '🔄 Validating...' : `🔍 ${t('validation.framework.runSelected')}`}
              </button>
              
              <button 
                className="run-validation-btn secondary"
                onClick={() => runValidation('all')}
                disabled={isValidating}
              >
                {t('validation.framework.runAll')}
              </button>
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="validation-results">
              <div className="results-header">
                <h4>{t('validation.framework.results')}</h4>
                <div className="results-summary">
                  <div className="summary-stats">
                    {validationResults.summary.error > 0 && (
                      <span className="stat error" style={{ color: getLevelColor(VALIDATION_LEVELS.ERROR) }}>
                        {getLevelIcon(VALIDATION_LEVELS.ERROR)} {validationResults.summary.error} Errors
                      </span>
                    )}
                    {validationResults.summary.warning > 0 && (
                      <span className="stat warning" style={{ color: getLevelColor(VALIDATION_LEVELS.WARNING) }}>
                        {getLevelIcon(VALIDATION_LEVELS.WARNING)} {validationResults.summary.warning} Warnings
                      </span>
                    )}
                    {validationResults.summary.info > 0 && (
                      <span className="stat info" style={{ color: getLevelColor(VALIDATION_LEVELS.INFO) }}>
                        {getLevelIcon(VALIDATION_LEVELS.INFO)} {validationResults.summary.info} Info
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {validationResults.error ? (
                <div className="validation-error">
                  <p>{validationResults.error}</p>
                </div>
              ) : (
                <div className="results-content">
                  {/* Group by Component */}
                  {Object.entries(validationResults.byComponent || {}).map(([componentId, componentResults]) => (
                    <div key={componentId} className="component-results">
                      <div className="component-header">
                        <h5>{t(`validation.components.${componentId}`, componentId)}</h5>
                        <span className="component-count">
                          {componentResults.length} issue{componentResults.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="component-issues">
                        {componentResults.map((result, index) => (
                          <div key={index} className={`validation-issue ${result.level}`}>
                            <div className="issue-header">
                              <span className="issue-level" style={{ color: getLevelColor(result.level) }}>
                                {getLevelIcon(result.level)} {formatLevel(result.level)}
                              </span>
                              <span className="issue-file">{result.filePath}</span>
                              {result.line && (
                                <span className="issue-location">Line {result.line}</span>
                              )}
                            </div>
                            
                            <div className="issue-content">
                              <p className="issue-message">{result.message}</p>
                              {result.suggestion && (
                                <p className="issue-suggestion">💡 {result.suggestion}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {validationResults.total === 0 && (
                    <div className="no-issues">
                      <span className="success-icon">✅</span>
                      <p>{t('validation.framework.noIssues')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Validation History */}
          {validationHistory.length > 0 && (
            <div className="validation-history">
              <h4>Recent Validations</h4>
              <div className="history-list">
                {validationHistory.map((entry, index) => (
                  <div key={index} className="history-entry">
                    <div className="history-info">
                      <span className="history-component">
                        {entry.component === 'all' ? 'All Components' : t(`validation.components.${entry.component}`, entry.component)}
                      </span>
                      <span className="history-time">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="history-summary">
                      {entry.summary.error > 0 && <span className="history-stat error">{entry.summary.error}E</span>}
                      {entry.summary.warning > 0 && <span className="history-stat warning">{entry.summary.warning}W</span>}
                      {entry.summary.info > 0 && <span className="history-stat info">{entry.summary.info}I</span>}
                      {entry.totalIssues === 0 && <span className="history-stat success">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;