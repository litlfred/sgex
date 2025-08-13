import React, { useState } from 'react';

const RepositoryConfigEditor = ({ config, setConfig, errors = {}, profile, onValidate }) => {
  const [newTopic, setNewTopic] = useState('');

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Trigger validation after a short delay
    setTimeout(() => {
      if (onValidate) onValidate();
    }, 100);
  };

  const handleTopicAdd = (topic) => {
    const topicToAdd = topic || newTopic.trim();
    if (topicToAdd && !config.topics.includes(topicToAdd)) {
      setConfig(prev => ({
        ...prev,
        topics: [...prev.topics, topicToAdd]
      }));
      setNewTopic('');
      if (onValidate) onValidate();
    }
  };

  const handleTopicRemove = (topic) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
    if (onValidate) onValidate();
  };

  const handleTopicKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTopicAdd();
    }
  };

  const suggestedTopics = [
    'maternal-health',
    'immunization',
    'anc',
    'family-planning',
    'clinical-guidelines',
    'healthcare',
    'digital-health',
    'who-guidelines',
    'pediatrics',
    'mental-health',
    'tuberculosis',
    'hiv',
    'malaria',
    'nutrition'
  ];

  return (
    <div className="workflow-form">
      <h2>Repository Configuration</h2>
      <p>Configure the basic settings for your new GitHub repository.</p>

      <div className="workflow-form-section">
        <h3>Repository Details</h3>

        <div className="workflow-form-group">
          <label htmlFor="repo-name" className="workflow-form-label required">
            Repository Name
          </label>
          <input
            id="repo-name"
            type="text"
            className={`workflow-form-input ${errors.name ? 'error' : ''}`}
            value={config.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="my-dak-repository"
          />
          {errors.name && (
            <div className="workflow-form-error">{errors.name}</div>
          )}
          <div className="workflow-form-help">
            Lowercase with hyphens only. This will be used in the GitHub URL: 
            <strong> github.com/{profile?.login}/{config.name || 'repository-name'}</strong>
          </div>
        </div>

        <div className="workflow-form-group">
          <label htmlFor="repo-description" className="workflow-form-label required">
            Description
          </label>
          <textarea
            id="repo-description"
            className={`workflow-form-textarea ${errors.description ? 'error' : ''}`}
            value={config.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Digital Adaptation Kit for maternal health guidelines..."
            rows={3}
          />
          {errors.description && (
            <div className="workflow-form-error">{errors.description}</div>
          )}
          <div className="workflow-form-help">
            A brief description of your DAK's purpose and scope. This will appear on GitHub and in search results.
          </div>
        </div>

        <div className="workflow-form-group">
          <div className="workflow-checkbox-group">
            <input
              id="repo-private"
              type="checkbox"
              className="workflow-checkbox"
              checked={config.private}
              onChange={(e) => handleInputChange('private', e.target.checked)}
            />
            <label htmlFor="repo-private" className="workflow-checkbox-label">
              Make repository private
            </label>
          </div>
          <div className="workflow-form-help">
            Private repositories are only visible to you and people you share them with. 
            WHO SMART Guidelines are typically public to encourage collaboration.
          </div>
        </div>
      </div>

      <div className="workflow-form-section">
        <h3>Repository Topics</h3>
        <p>Topics help others discover your repository and understand its purpose.</p>

        <div className="workflow-form-group">
          <label htmlFor="current-topics" className="workflow-form-label">Current Topics</label>
          <div className="topics-container">
            <div id="current-topics" className="current-topics">
              {config.topics.map(topic => (
                <span key={topic} className="topic-tag">
                  {topic}
                  <button 
                    type="button" 
                    onClick={() => handleTopicRemove(topic)}
                    className="topic-remove"
                    aria-label={`Remove ${topic} topic`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {config.topics.length === 0 && (
                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No topics added yet
                </span>
              )}
            </div>

            <div className="workflow-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="new-topic" className="workflow-form-label">
                Add Custom Topic
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="new-topic"
                  type="text"
                  className="workflow-form-input"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={handleTopicKeyPress}
                  placeholder="custom-topic"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleTopicAdd()}
                  disabled={!newTopic.trim()}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#0078d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="suggested-topics" className="workflow-form-label">Suggested Topics</label>
              <div id="suggested-topics" className="topic-suggestions">
                {suggestedTopics
                  .filter(topic => !config.topics.includes(topic))
                  .map(topic => (
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
    </div>
  );
};

export default RepositoryConfigEditor;