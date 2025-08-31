import React, { useState, Suspense, lazy } from 'react';
import githubService from '../services/githubService';
import './IssueCreationModal.css';

// Lazy load MDEditor for advanced markdown editing
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

/**
 * Modal component for creating GitHub issues using forms instead of external links
 */
const IssueCreationModal = ({ 
  isOpen, 
  onClose, 
  issueType = 'bug', 
  repository = null, 
  contextData = {},
  onSuccess = () => {},
  onError = () => {}
}) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState({});

  // Get the repository information
  const getRepoInfo = () => {
    if (repository) {
      return {
        owner: repository.owner?.login || repository.owner || repository.full_name?.split('/')[0],
        repo: repository.name || repository.full_name?.split('/')[1]
      };
    }
    return { owner: 'litlfred', repo: 'sgex' }; // Default to SGEX repo
  };

  // Get template configuration based on issue type
  const getTemplateConfig = () => {
    switch (issueType) {
      case 'bug':
        return {
          title: 'Bug Report Template for SGeX',
          titlePrefix: '[Bug]: ',
          labels: ['bug reports'],
          fields: [
            {
              id: 'what-happened',
              label: 'What happened?',
              type: 'textarea',
              required: true,
              description: 'A clear description of what the bug is.'
            },
            {
              id: 'expected',
              label: 'Expected behavior',
              type: 'textarea',
              required: true,
              description: 'What did you expect to happen?'
            },
            {
              id: 'steps',
              label: 'Steps to reproduce',
              type: 'textarea',
              required: true,
              description: 'Steps to reproduce the behavior',
              placeholder: '1. Go to \'...\'\n2. Click on \'....\'\n3. See error'
            }
          ]
        };
      case 'feature':
        return {
          title: 'Feature Request for SGeX',
          titlePrefix: '[Feature]: ',
          labels: ['feature request'],
          fields: [
            {
              id: 'description',
              label: 'Feature Description',
              type: 'textarea',
              required: true,
              description: 'Describe the feature you\'d like to see added and why it would be useful.',
              placeholder: 'Please provide a clear description of the feature you\'re requesting...'
            }
          ]
        };
      case 'dak-content':
        return {
          title: 'DAK Content Feedback',
          titlePrefix: '[DAK Content Feedback]: ',
          labels: ['authoring'],
          fields: [
            {
              id: 'content-error',
              label: 'Content Error Description',
              type: 'textarea',
              required: true,
              description: 'What clinical content or logic appears to be incorrect?'
            },
            {
              id: 'error-type',
              label: 'Type of Content Error',
              type: 'select',
              required: true,
              description: 'What type of content error is this?',
              options: [
                'Clinical Logic Error',
                'Incorrect Medical Information',
                'Missing Clinical Guidance',
                'Terminology/Coding Error',
                'Decision Tree/Algorithm Error',
                'Form Design Issue',
                'Indicator/Measure Calculation Error',
                'Other'
              ]
            },
            {
              id: 'clinical-context',
              label: 'Clinical Context',
              type: 'textarea',
              required: true,
              description: 'In what clinical scenario or workflow does this error occur?'
            },
            {
              id: 'correct-approach',
              label: 'Expected Clinical Approach',
              type: 'textarea',
              required: true,
              description: 'What should the correct clinical guidance or logic be?'
            },
            {
              id: 'evidence',
              label: 'Supporting Evidence',
              type: 'textarea',
              required: false,
              description: 'Any clinical guidelines, research, or other evidence supporting the correction?'
            },
            {
              id: 'patient-safety',
              label: 'Patient Safety Impact',
              type: 'textarea',
              required: false,
              description: 'Could this error impact patient safety or clinical outcomes?'
            }
          ]
        };
      case 'discussion':
        return {
          title: 'New Discussion',
          titlePrefix: '[Discussion]: ',
          labels: ['authoring'],
          fields: [
            {
              id: 'description',
              label: 'Discussion Topic',
              type: 'textarea',
              required: true,
              description: 'What would you like to discuss with the team? Provide context and any questions you have.',
              placeholder: 'Please describe what you would like to discuss...'
            }
          ]
        };
      default:
        return {
          title: 'Issue Report',
          titlePrefix: '',
          labels: ['needs-triage'],
          fields: [
            {
              id: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
              description: 'Please describe the issue or request.'
            }
          ]
        };
    }
  };

  const templateConfig = getTemplateConfig();

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const buildIssueBody = () => {
    let body = '';
    
    templateConfig.fields.forEach(field => {
      const value = formData[field.id] || '';
      body += `**${field.label}**\n${value}\n\n`;
    });

    // Add contextual information
    if (contextData.pageId) {
      body += `**Page Context**\n- Page: ${contextData.pageId}\n- URL: ${window.location.href}\n\n`;
    }

    if (contextData.selectedDak) {
      body += `**DAK Context**\n- Repository: ${contextData.selectedDak.full_name || `${contextData.selectedDak.owner}/${contextData.selectedDak.name}`}\n- Branch: ${contextData.selectedBranch || 'default'}\n\n`;
    }

    body += `**System Information**\n- Timestamp: ${new Date().toISOString()}\n- Browser: ${navigator.userAgent}\n`;

    return body;
  };

  const validateForm = () => {
    const requiredFields = templateConfig.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData[field.id] || formData[field.id].trim() === '') {
        return `${field.label} is required`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { owner, repo } = getRepoInfo();
      
      // Build issue data
      const issueData = {
        title: templateConfig.titlePrefix + (formData.title || formData.description || 'Issue reported from SGEX'),
        body: buildIssueBody(),
        labels: templateConfig.labels
      };

      // Check if should assign copilot (same logic as HelpModal)
      const shouldAssignCopilot = () => {
        if (!contextData.profile || issueType === 'dak-content') {
          return false;
        }
        
        const userLogin = contextData.profile.login;
        const repoOwner = owner;
        
        // If user is the repository owner
        if (userLogin === repoOwner) {
          return true;
        }
        
        return false;
      };

      if (shouldAssignCopilot()) {
        issueData.assignees = ['copilot'];
      }

      // Create the issue
      const createdIssue = await githubService.createIssue(owner, repo, issueData);
      
      onSuccess(createdIssue);
      onClose();
      
    } catch (err) {
      console.error('Failed to create issue:', err);
      
      // Check for various GitHub API permission errors
      const errorMessage = err.message || '';
      const isPermissionError = 
        errorMessage.includes('authentication') || 
        errorMessage.includes('GitHub API') ||
        errorMessage.includes('Resource not accessible by personal access token') ||
        errorMessage.includes('Not Found') ||
        errorMessage.includes('403') ||
        errorMessage.includes('401') ||
        err.status === 403 ||
        err.status === 401;
      
      if (isPermissionError) {
        // Fall back to GitHub URL method with pre-filled form data
        setError('Unable to create issue directly. Opening GitHub with your details...');
        const fallbackUrl = generateFallbackUrl();
        window.open(fallbackUrl, '_blank');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(err.message || 'Failed to create issue');
        onError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateFallbackUrl = () => {
    const { owner, repo } = getRepoInfo();
    const params = new URLSearchParams();
    
    params.set('template', issueType === 'bug' ? 'bug_report.yml' : 
                         issueType === 'feature' ? 'feature_request.yml' : 
                         'dak_content_error.yml');
    
    // Pre-fill the title if available
    if (formData.title) {
      params.set('title', templateConfig.titlePrefix + formData.title);
    }
    
    // Add labels
    params.set('labels', templateConfig.labels.join(',').replace(/\s+/g, '+'));
    
    // Pre-fill all form field data
    templateConfig.fields.forEach(field => {
      if (formData[field.id] && formData[field.id].trim()) {
        params.set(field.id, formData[field.id]);
      }
    });
    
    // Add context
    if (contextData.pageId) {
      params.set('sgex_page', contextData.pageId);
    }
    params.set('sgex_current_url', window.location.href);
    
    return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`;
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';
    const showAdvanced = showAdvancedEditor[field.id];
    
    switch (field.type) {
      case 'textarea':
        return (
          <div className="textarea-field-container">
            {!showAdvanced ? (
              <div className="textarea-simple-container">
                <textarea
                  id={field.id}
                  value={value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  required={field.required}
                />
                <button
                  type="button"
                  className="advanced-editor-toggle"
                  onClick={() => setShowAdvancedEditor(prev => ({
                    ...prev,
                    [field.id]: true
                  }))}
                >
                  📝 Advanced Editor
                </button>
              </div>
            ) : (
              <div className="textarea-advanced-container">
                <Suspense fallback={<div className="loading-spinner">Loading editor...</div>}>
                  <MDEditor
                    value={value}
                    onChange={(val) => handleInputChange(field.id, val || '')}
                    preview="edit"
                    height={300}
                    visibleDragBar={false}
                    data-color-mode="light"
                    hideToolbar={submitting}
                  />
                </Suspense>
                <button
                  type="button"
                  className="simple-editor-toggle"
                  onClick={() => setShowAdvancedEditor(prev => ({
                    ...prev,
                    [field.id]: false
                  }))}
                >
                  Simple Editor
                </button>
              </div>
            )}
          </div>
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="issue-creation-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="issue-creation-modal">
        <div className="modal-header">
          <h2>{templateConfig.title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Title field for all issue types */}
            <div className="form-group">
              <label htmlFor="title">
                Issue Title <span className="required">*</span>
              </label>
              <div className="input-with-prefix">
                <span className="title-prefix">{templateConfig.titlePrefix}</span>
                <input
                  type="text"
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
            </div>

            {/* Template-specific fields */}
            {templateConfig.fields.map(field => (
              <div key={field.id} className="form-group">
                <label htmlFor={field.id}>
                  {field.label} {field.required && <span className="required">*</span>}
                </label>
                {field.description && (
                  <div className="field-description">{field.description}</div>
                )}
                {renderField(field)}
              </div>
            ))}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Creating Issue...' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueCreationModal;