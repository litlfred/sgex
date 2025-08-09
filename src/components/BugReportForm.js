import React, { useState, useEffect } from 'react';
import bugReportService from '../services/bugReportService';
import githubService from '../services/githubService';

const BugReportForm = ({ onClose, contextData = {} }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [includeConsole, setIncludeConsole] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [consoleCapture, setConsoleCapture] = useState(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Start console capture when component mounts
  useEffect(() => {
    const capture = bugReportService.captureConsoleOutput();
    setConsoleCapture(capture);
    
    return () => {
      capture.stop();
    };
  }, []);

  // Auto-select Bug Report template and enable console by default for bug reports
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const bugTemplate = templates.find(t => t.type === 'bug') || templates[0];
      setSelectedTemplate(bugTemplate);
      setIncludeConsole(bugTemplate.type === 'bug');
    }
  }, [templates]); // Only depend on templates

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await bugReportService.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load bug report templates. Using defaults.');
      // Use default templates as fallback
      setTemplates(bugReportService._getDefaultTemplates());
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setFormData({}); // Reset form data when template changes
    setIncludeConsole(template.type === 'bug'); // Auto-enable console for bug reports
  };

  const handleFormChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get current console output if including
      const currentConsoleOutput = includeConsole && consoleCapture ? consoleCapture.getLogs() : '';
      
      // Check if user is authenticated and can submit via API
      if (githubService.isAuthenticated) {
        const result = await bugReportService.submitIssue(
          'litlfred',
          'sgex',
          selectedTemplate,
          formData,
          includeConsole,
          currentConsoleOutput
        );
        
        setSubmitResult(result);
        if (result.success) {
          setSubmitted(true);
        } else {
          setError(result.error?.message || 'Failed to submit issue');
        }
      } else {
        // Generate URL for manual submission
        const url = bugReportService.generateIssueUrl(
          'litlfred',
          'sgex',
          selectedTemplate,
          formData,
          includeConsole,
          currentConsoleOutput
        );
        
        // Try to open URL
        try {
          const newWindow = window.open(url, '_blank');
          if (!newWindow || newWindow.closed) {
            setSubmitResult({
              success: false,
              fallbackUrl: url,
              error: { type: 'popup_blocked' }
            });
          } else {
            setSubmitResult({
              success: true,
              fallbackUrl: url,
              manual: true
            });
            setSubmitted(true);
          }
        } catch (openError) {
          setSubmitResult({
            success: false,
            fallbackUrl: url,
            error: { type: 'popup_blocked' }
          });
        }
      }
    } catch (err) {
      console.error('Failed to submit bug report:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateFallbackUrl = () => {
    if (!selectedTemplate) return '';
    
    const currentConsoleOutput = includeConsole && consoleCapture ? consoleCapture.getLogs() : '';
    return bugReportService.generateIssueUrl(
      'litlfred',
      'sgex',
      selectedTemplate,
      formData,
      includeConsole,
      currentConsoleOutput
    );
  };

  const renderFormField = (field) => {
    const { id, type, attributes = {}, validations = {} } = field;
    const { label, description, placeholder, options } = attributes;
    const { required } = validations;

    if (type === 'markdown') {
      return (
        <div key={id || Math.random()} className="form-field markdown-field">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: attributes.value }}
          />
        </div>
      );
    }

    const fieldId = id || `field_${Math.random()}`;

    switch (type) {
      case 'textarea':
        return (
          <div key={fieldId} className="form-field">
            <label htmlFor={fieldId} className="field-label">
              {label}
              {required && <span className="required">*</span>}
            </label>
            {description && <p className="field-description">{description}</p>}
            <textarea
              id={fieldId}
              className="field-input textarea-input"
              placeholder={placeholder}
              value={formData[fieldId] || ''}
              onChange={(e) => handleFormChange(fieldId, e.target.value)}
              required={required}
              rows={4}
            />
          </div>
        );

      case 'input':
        return (
          <div key={fieldId} className="form-field">
            <label htmlFor={fieldId} className="field-label">
              {label}
              {required && <span className="required">*</span>}
            </label>
            {description && <p className="field-description">{description}</p>}
            <input
              id={fieldId}
              type="text"
              className="field-input text-input"
              placeholder={placeholder}
              value={formData[fieldId] || ''}
              onChange={(e) => handleFormChange(fieldId, e.target.value)}
              required={required}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={fieldId} className="form-field">
            <label htmlFor={fieldId} className="field-label">
              {label}
              {required && <span className="required">*</span>}
            </label>
            {description && <p className="field-description">{description}</p>}
            <select
              id={fieldId}
              className="field-input select-input"
              value={formData[fieldId] || ''}
              onChange={(e) => handleFormChange(fieldId, e.target.value)}
              required={required}
            >
              <option value="">Select an option...</option>
              {options?.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkboxes':
        return (
          <div key={fieldId} className="form-field">
            <fieldset className="checkbox-fieldset">
              <legend className="field-label">
                {label}
                {required && <span className="required">*</span>}
              </legend>
              {description && <p className="field-description">{description}</p>}
              {options?.map((option, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={formData[fieldId]?.includes(option.value || option) || false}
                    onChange={(e) => {
                      const value = option.value || option;
                      const currentValues = formData[fieldId] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, value]
                        : currentValues.filter(v => v !== value);
                      handleFormChange(fieldId, newValues);
                    }}
                  />
                  {option.label || option}
                </label>
              ))}
            </fieldset>
          </div>
        );

      default:
        return (
          <div key={fieldId} className="form-field">
            <p className="unsupported-field">
              Unsupported field type: {type}
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="bug-report-form">
        <div className="form-header">
          <h3>Loading Bug Report Templates...</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close bug report form"
          >
            ×
          </button>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (submitted && submitResult?.success) {
    return (
      <div className="bug-report-form">
        <div className="form-header">
          <h3>Issue Submitted Successfully!</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close bug report form"
          >
            ×
          </button>
        </div>
        <div className="success-message">
          {submitResult.manual ? (
            <div>
              <p>✅ Your issue has been opened in a new tab.</p>
              <p>If the tab didn't open, you can access it here:</p>
              <a 
                href={submitResult.fallbackUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="issue-link"
              >
                Open Issue Form
              </a>
            </div>
          ) : (
            <div>
              <p>✅ Issue #{submitResult.issue?.number} has been created successfully!</p>
              <a 
                href={submitResult.issue?.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="issue-link"
              >
                View Issue #{submitResult.issue?.number}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bug-report-form">
      <div className="form-header">
        <h3>Report an Issue</h3>
        <button 
          className="close-btn"
          onClick={onClose}
          aria-label="Close bug report form"
        >
          ×
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          {submitResult?.fallbackUrl && (
            <div>
              <p>You can still submit your issue manually:</p>
              <a 
                href={submitResult.fallbackUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fallback-link"
              >
                Open GitHub Issue Form
              </a>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="report-form">
        {/* Template Selection */}
        <div className="form-field">
          <label htmlFor="template-select" className="field-label">
            Issue Type <span className="required">*</span>
          </label>
          <select
            id="template-select"
            className="field-input select-input"
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value);
              handleTemplateChange(template);
            }}
            required
          >
            <option value="">Select issue type...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        {/* Console Output Option */}
        <div className="form-field">
          <label className="checkbox-label console-option">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={includeConsole}
              onChange={(e) => setIncludeConsole(e.target.checked)}
            />
            Include JavaScript console output in report
            <span className="checkbox-help">
              (Recommended for bug reports - helps developers debug issues)
            </span>
          </label>
        </div>

        {/* Template Fields */}
        {selectedTemplate && (
          <div className="template-fields">
            {selectedTemplate.body.map(field => renderFormField(field))}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn primary"
            disabled={submitting || !selectedTemplate}
          >
            {submitting ? 'Submitting...' : 
             githubService.isAuthenticated ? 'Submit Issue' : 'Open in GitHub'}
          </button>
          
          <button
            type="button"
            className="cancel-btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          
          {selectedTemplate && (
            <a
              href={generateFallbackUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="fallback-btn tertiary"
            >
              Open in GitHub
            </a>
          )}
        </div>

        {/* Authentication Status */}
        <div className="auth-status">
          {githubService.isAuthenticated ? (
            <p className="auth-info authenticated">
              ✅ Authenticated - Issues will be submitted directly to GitHub
            </p>
          ) : (
            <p className="auth-info not-authenticated">
              ℹ️ Not authenticated - Issue will open in GitHub for manual submission
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BugReportForm;