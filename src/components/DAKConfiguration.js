import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DAKConfiguration.css';

const DAKConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, templateRepository, destinationOrganization, action } = location.state || {};
  
  const [configuration, setConfiguration] = useState({
    repositoryName: '',
    repositoryDescription: '',
    repositoryPrivate: false,
    repositoryTopics: ['who', 'smart-guidelines', 'dak', 'fhir', 'implementation-guide'],
    sushiId: '',
    sushiName: '',
    sushiTitle: '',
    sushiDescription: '',
    sushiVersion: '0.1.0',
    sushiStatus: 'draft',
    sushiExperimental: true,
    sushiPublisher: destinationOrganization?.display_name || destinationOrganization?.login || '',
    contactName: profile?.name || profile?.login || '',
    contactEmail: profile?.email || ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'repositoryName':
        if (!value || value.length < 3) {
          newErrors.repositoryName = 'Repository name must be at least 3 characters';
        } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
          newErrors.repositoryName = 'Repository name must be lowercase with hyphens only';
        } else {
          delete newErrors.repositoryName;
        }
        break;
      
      case 'sushiId':
        if (!value || value.length < 3) {
          newErrors.sushiId = 'Implementation Guide ID must be at least 3 characters';
        } else if (!/^[a-z0-9][a-z0-9-.]*[a-z0-9]$/.test(value)) {
          newErrors.sushiId = 'ID must be lowercase with dots or hyphens only';
        } else {
          delete newErrors.sushiId;
        }
        break;
      
      case 'sushiName':
        if (!value || value.length < 3) {
          newErrors.sushiName = 'Name must be at least 3 characters';
        } else if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
          newErrors.sushiName = 'Name must be PascalCase (no spaces)';
        } else {
          delete newErrors.sushiName;
        }
        break;
      
      case 'sushiTitle':
        if (!value || value.length < 5) {
          newErrors.sushiTitle = 'Title must be at least 5 characters';
        } else {
          delete newErrors.sushiTitle;
        }
        break;
      
      case 'sushiDescription':
        if (!value || value.length < 20) {
          newErrors.sushiDescription = 'Description must be at least 20 characters';
        } else {
          delete newErrors.sushiDescription;
        }
        break;
      
      case 'sushiPublisher':
        if (!value || value.length < 2) {
          newErrors.sushiPublisher = 'Publisher is required';
        } else {
          delete newErrors.sushiPublisher;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field, value) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate related fields
    if (field === 'repositoryName') {
      if (!configuration.sushiId) {
        const id = `${destinationOrganization.login}.${value}`.toLowerCase();
        setConfiguration(prev => ({ ...prev, sushiId: id }));
      }
      if (!configuration.sushiName) {
        const name = value.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
        setConfiguration(prev => ({ ...prev, sushiName: name }));
      }
    }
    
    validateField(field, value);
  };

  const handleTopicAdd = (topic) => {
    if (topic && !configuration.repositoryTopics.includes(topic)) {
      setConfiguration(prev => ({
        ...prev,
        repositoryTopics: [...prev.repositoryTopics, topic]
      }));
    }
  };

  const handleTopicRemove = (topic) => {
    setConfiguration(prev => ({
      ...prev,
      repositoryTopics: prev.repositoryTopics.filter(t => t !== topic)
    }));
  };

  const isValid = () => {
    const required = ['repositoryName', 'repositoryDescription', 'sushiId', 'sushiName', 'sushiTitle', 'sushiDescription', 'sushiPublisher'];
    const hasAllRequired = required.every(field => configuration[field]?.trim());
    const hasNoErrors = Object.keys(errors).length === 0;
    
    return hasAllRequired && hasNoErrors;
  };

  const handleContinue = async () => {
    if (!isValid()) {
      alert('Please fix all errors before continuing');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate repository creation and configuration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to dashboard with the new repository info
      const newRepository = {
        id: Date.now(),
        name: configuration.repositoryName,
        full_name: `${destinationOrganization.login}/${configuration.repositoryName}`,
        description: configuration.repositoryDescription,
        html_url: `https://github.com/${destinationOrganization.login}/${configuration.repositoryName}`,
        clone_url: `https://github.com/${destinationOrganization.login}/${configuration.repositoryName}.git`,
        topics: configuration.repositoryTopics,
        private: configuration.repositoryPrivate,
        owner: destinationOrganization,
        smart_guidelines_compatible: true,
        created_from_template: true,
        template_repository: templateRepository
      };

      navigate('/dashboard', {
        state: {
          profile,
          repository: newRepository,
          configuration,
          action: 'create',
          isNewRepository: true
        }
      });
      
    } catch (error) {
      console.error('Error creating repository:', error);
      alert('Failed to create repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/organization-selection', {
      state: {
        profile,
        sourceRepository: templateRepository,
        action
      }
    });
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  if (!profile || !templateRepository || !destinationOrganization || action !== 'create') {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  const suggestedTopics = [
    'maternal-health', 'immunization', 'anc', 'family-planning', 
    'clinical-guidelines', 'healthcare', 'digital-health', 'who-guidelines'
  ];

  return (
    <div className="dak-configuration">
      <div className="config-header">
        <div className="who-branding">
          <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="profile-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="profile-avatar" 
          />
          <span>{profile.name || profile.login}</span>
        </div>
      </div>

      <div className="config-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dak-action', { state: { profile } })} className="breadcrumb-link">
            Choose DAK Action
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dak-selection', { state: { profile, action } })} className="breadcrumb-link">
            Select DAK
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBack} className="breadcrumb-link">
            Select Organization
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Configure DAK</span>
        </div>

        <div className="config-main">
          <div className="config-intro">
            <h2>Configure New DAK</h2>
            <p>
              Set up your new Digital Adaptation Kit repository and FHIR Implementation Guide parameters.
            </p>
            
            <div className="template-info">
              <div className="info-item">
                <span className="info-label">Template:</span>
                <span className="info-value">{templateRepository.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Destination:</span>
                <span className="info-value">@{destinationOrganization.login}</span>
              </div>
            </div>
          </div>

          <div className="config-form">
            <div className="form-section">
              <h3>Repository Settings</h3>
              
              <div className="form-group">
                <label htmlFor="repositoryName">Repository Name*</label>
                <input
                  id="repositoryName"
                  type="text"
                  value={configuration.repositoryName}
                  onChange={(e) => handleInputChange('repositoryName', e.target.value)}
                  placeholder="my-dak-repository"
                  className={errors.repositoryName ? 'error' : ''}
                />
                {errors.repositoryName && <span className="error-message">{errors.repositoryName}</span>}
                <small>Lowercase with hyphens only. Will be used in the GitHub URL.</small>
              </div>

              <div className="form-group">
                <label htmlFor="repositoryDescription">Repository Description*</label>
                <textarea
                  id="repositoryDescription"
                  value={configuration.repositoryDescription}
                  onChange={(e) => handleInputChange('repositoryDescription', e.target.value)}
                  placeholder="Digital Adaptation Kit for..."
                  rows={3}
                />
                <small>Short description for the GitHub repository.</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={configuration.repositoryPrivate}
                    onChange={(e) => handleInputChange('repositoryPrivate', e.target.checked)}
                  />
                  <span>Make repository private</span>
                </label>
              </div>

              <div className="form-group">
                <label>Repository Topics</label>
                <div className="topics-container">
                  <div className="current-topics">
                    {configuration.repositoryTopics.map(topic => (
                      <span key={topic} className="topic-tag">
                        {topic}
                        <button 
                          type="button" 
                          onClick={() => handleTopicRemove(topic)}
                          className="topic-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="suggested-topics">
                    <small>Suggested topics:</small>
                    <div className="topic-suggestions">
                      {suggestedTopics.filter(topic => !configuration.repositoryTopics.includes(topic)).map(topic => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleTopicAdd(topic)}
                          className="topic-suggestion"
                        >
                          + {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>FHIR Implementation Guide Settings</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sushiId">Implementation Guide ID*</label>
                  <input
                    id="sushiId"
                    type="text"
                    value={configuration.sushiId}
                    onChange={(e) => handleInputChange('sushiId', e.target.value)}
                    placeholder="who.smart.maternal-health"
                    className={errors.sushiId ? 'error' : ''}
                  />
                  {errors.sushiId && <span className="error-message">{errors.sushiId}</span>}
                  <small>Unique identifier for the IG (lowercase with dots/hyphens)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="sushiName">Implementation Guide Name*</label>
                  <input
                    id="sushiName"
                    type="text"
                    value={configuration.sushiName}
                    onChange={(e) => handleInputChange('sushiName', e.target.value)}
                    placeholder="WHOSmartMaternalHealth"
                    className={errors.sushiName ? 'error' : ''}
                  />
                  {errors.sushiName && <span className="error-message">{errors.sushiName}</span>}
                  <small>PascalCase technical name (no spaces)</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sushiTitle">Implementation Guide Title*</label>
                <input
                  id="sushiTitle"
                  type="text"
                  value={configuration.sushiTitle}
                  onChange={(e) => handleInputChange('sushiTitle', e.target.value)}
                  placeholder="WHO SMART Guidelines - Maternal Health DAK"
                  className={errors.sushiTitle ? 'error' : ''}
                />
                {errors.sushiTitle && <span className="error-message">{errors.sushiTitle}</span>}
                <small>Human-readable title for the DAK</small>
              </div>

              <div className="form-group">
                <label htmlFor="sushiDescription">Description*</label>
                <textarea
                  id="sushiDescription"
                  value={configuration.sushiDescription}
                  onChange={(e) => handleInputChange('sushiDescription', e.target.value)}
                  placeholder="This implementation guide provides digital adaptation kit components for..."
                  rows={4}
                  className={errors.sushiDescription ? 'error' : ''}
                />
                {errors.sushiDescription && <span className="error-message">{errors.sushiDescription}</span>}
                <small>Detailed description of the DAK's purpose and scope</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sushiVersion">Version</label>
                  <input
                    id="sushiVersion"
                    type="text"
                    value={configuration.sushiVersion}
                    onChange={(e) => handleInputChange('sushiVersion', e.target.value)}
                    placeholder="0.1.0"
                  />
                  <small>Semantic version number</small>
                </div>

                <div className="form-group">
                  <label htmlFor="sushiPublisher">Publisher*</label>
                  <input
                    id="sushiPublisher"
                    type="text"
                    value={configuration.sushiPublisher}
                    onChange={(e) => handleInputChange('sushiPublisher', e.target.value)}
                    placeholder="World Health Organization"
                    className={errors.sushiPublisher ? 'error' : ''}
                  />
                  {errors.sushiPublisher && <span className="error-message">{errors.sushiPublisher}</span>}
                  <small>Organization responsible for publishing</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">Contact Name</label>
                  <input
                    id="contactName"
                    type="text"
                    value={configuration.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Your Name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Contact Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={configuration.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="config-footer">
              <button 
                className="create-btn"
                onClick={handleContinue}
                disabled={!isValid() || loading}
              >
                {loading ? 'Creating DAK Repository...' : 'Create DAK Repository'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAKConfiguration;