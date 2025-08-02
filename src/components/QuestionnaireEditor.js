import React, { useState, useEffect } from 'react';
import { PageLayout, useDAKParams } from './framework';
import githubService from '../services/githubService';
// import { useTranslation } from 'react-i18next'; // TODO: Add i18n support later
import './QuestionnaireEditor.css';

const QuestionnaireEditor = () => {
  return (
    <PageLayout pageName="questionnaire-editor">
      <QuestionnaireEditorContent />
    </PageLayout>
  );
};

const QuestionnaireEditorContent = () => {
  const { profile, repository, branch } = useDAKParams();
  // const { t } = useTranslation(); // TODO: Add i18n support later
  
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load questionnaires from input/questionnaires/
  useEffect(() => {
    const loadQuestionnaires = async () => {
      if (!profile || !repository || !githubService.isAuth()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to get the questionnaires directory
        const questionnaireFiles = await githubService.getDirectoryContents(
          repository.owner.login,
          repository.name,
          'input/questionnaires',
          branch
        );

        if (questionnaireFiles && questionnaireFiles.length > 0) {
          // Filter for .json files and load their content
          const jsonFiles = questionnaireFiles.filter(file => 
            file.name.endsWith('.json') && file.type === 'file'
          );

          const questionnaireData = await Promise.all(
            jsonFiles.map(async (file) => {
              try {
                const content = await githubService.getFileContent(
                  repository.owner.login,
                  repository.name,
                  file.path,
                  branch
                );
                const parsedContent = JSON.parse(content);
                return {
                  ...file,
                  content: parsedContent,
                  isValid: parsedContent.resourceType === 'Questionnaire'
                };
              } catch (error) {
                console.warn(`Error loading questionnaire ${file.name}:`, error);
                return {
                  ...file,
                  content: null,
                  isValid: false,
                  error: error.message
                };
              }
            })
          );

          setQuestionnaires(questionnaireData);
        } else {
          setQuestionnaires([]);
        }
      } catch (error) {
        console.error('Error loading questionnaires:', error);
        setError(`Failed to load questionnaires: ${error.message}`);
        setQuestionnaires([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaires();
  }, [profile, repository, branch]);

  const createNewQuestionnaire = () => {
    const newQuestionnaire = {
      resourceType: "Questionnaire",
      id: `questionnaire-${Date.now()}`,
      url: `http://example.org/questionnaires/questionnaire-${Date.now()}`,
      name: "NewQuestionnaire",
      title: "New Questionnaire",
      status: "draft",
      date: new Date().toISOString(),
      item: []
    };

    setSelectedQuestionnaire({
      name: `questionnaire-${Date.now()}.json`,
      content: newQuestionnaire,
      isNew: true,
      isValid: true
    });
    setIsEditing(true);
  };

  const editQuestionnaire = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsEditing(true);
  };

  const saveQuestionnaire = async (updatedContent) => {
    if (!selectedQuestionnaire || !profile || !repository) {
      return;
    }

    try {
      const filePath = `input/questionnaires/${selectedQuestionnaire.name}`;
      const contentString = JSON.stringify(updatedContent, null, 2);

      if (selectedQuestionnaire.isNew) {
        // Create new file
        await githubService.createFile(
          repository.owner.login,
          repository.name,
          filePath,
          contentString,
          `Add new questionnaire: ${updatedContent.title || updatedContent.name}`,
          branch
        );
      } else {
        // Update existing file
        await githubService.updateFile(
          repository.owner.login,
          repository.name,
          filePath,
          contentString,
          `Update questionnaire: ${updatedContent.title || updatedContent.name}`,
          selectedQuestionnaire.sha,
          branch
        );
      }

      // Refresh the questionnaires list
      window.location.reload();
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      setError(`Failed to save questionnaire: ${error.message}`);
    }
  };

  const deleteQuestionnaire = async (questionnaire) => {
    if (!window.confirm(`Are you sure you want to delete ${questionnaire.name}?`)) {
      return;
    }

    try {
      await githubService.deleteFile(
        repository.owner.login,
        repository.name,
        questionnaire.path,
        `Delete questionnaire: ${questionnaire.name}`,
        questionnaire.sha,
        branch
      );

      // Refresh the questionnaires list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      setError(`Failed to delete questionnaire: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="questionnaire-editor loading">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading questionnaires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questionnaire-editor error">
        <div className="error-message">
          <h3>Error Loading Questionnaires</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && selectedQuestionnaire) {
    return (
      <QuestionnaireEditorForm 
        questionnaire={selectedQuestionnaire}
        onSave={saveQuestionnaire}
        onCancel={() => {
          setSelectedQuestionnaire(null);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="questionnaire-editor">
      <div className="questionnaire-header">
        <h1>FHIR Questionnaire Assets</h1>
        <p>Manage FHIR Questionnaire resources in the input/questionnaires/ directory</p>
        <button 
          className="btn-primary create-questionnaire-btn"
          onClick={createNewQuestionnaire}
        >
          + Create New Questionnaire
        </button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Questionnaires Found</h3>
          <p>Get started by creating your first FHIR Questionnaire asset.</p>
          <button 
            className="btn-primary"
            onClick={createNewQuestionnaire}
          >
            Create Your First Questionnaire
          </button>
        </div>
      ) : (
        <div className="questionnaires-grid">
          {questionnaires.map((questionnaire, index) => (
            <div 
              key={index}
              className={`questionnaire-card ${!questionnaire.isValid ? 'invalid' : ''}`}
            >
              <div className="questionnaire-card-header">
                <h3>{questionnaire.content?.title || questionnaire.name}</h3>
                <div className="questionnaire-status">
                  <span className={`status-badge ${questionnaire.content?.status || 'unknown'}`}>
                    {questionnaire.content?.status || 'unknown'}
                  </span>
                </div>
              </div>
              
              <div className="questionnaire-card-body">
                <div className="questionnaire-meta">
                  <div className="meta-item">
                    <strong>ID:</strong> {questionnaire.content?.id || 'N/A'}
                  </div>
                  <div className="meta-item">
                    <strong>File:</strong> {questionnaire.name}
                  </div>
                  {questionnaire.content?.date && (
                    <div className="meta-item">
                      <strong>Date:</strong> {new Date(questionnaire.content.date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="meta-item">
                    <strong>Items:</strong> {questionnaire.content?.item?.length || 0}
                  </div>
                </div>

                {questionnaire.error && (
                  <div className="error-info">
                    <strong>Error:</strong> {questionnaire.error}
                  </div>
                )}
              </div>

              <div className="questionnaire-card-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => editQuestionnaire(questionnaire)}
                  disabled={!questionnaire.isValid}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => deleteQuestionnaire(questionnaire)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Basic questionnaire editing form (to be enhanced with LHC-Forms)
const QuestionnaireEditorForm = ({ questionnaire, onSave, onCancel }) => {
  const [content, setContent] = useState(questionnaire.content);
  const [isModified, setIsModified] = useState(false);

  const handleSave = () => {
    onSave(content);
  };

  const updateField = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    setIsModified(true);
  };

  return (
    <div className="questionnaire-editor-form">
      <div className="form-header">
        <h2>
          {questionnaire.isNew ? 'Create New Questionnaire' : `Edit: ${questionnaire.name}`}
        </h2>
        <div className="form-actions">
          <button 
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleSave}
            disabled={!isModified}
          >
            Save
          </button>
        </div>
      </div>

      <div className="form-content">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={content.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Questionnaire title"
            />
          </div>

          <div className="form-field">
            <label htmlFor="id">ID</label>
            <input
              id="id"
              type="text"
              value={content.id || ''}
              onChange={(e) => updateField('id', e.target.value)}
              placeholder="Questionnaire ID"
            />
          </div>

          <div className="form-field">
            <label htmlFor="url">URL</label>
            <input
              id="url"
              type="url"
              value={content.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="Questionnaire URL"
            />
          </div>

          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={content.status || 'draft'}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>JSON Content</h3>
          <p className="note">
            Note: This is a basic JSON editor. LHC-Forms visual editor will be integrated here.
          </p>
          <textarea
            className="json-editor"
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setContent(parsed);
                setIsModified(true);
              } catch (error) {
                // Invalid JSON, don't update content
              }
            }}
            rows={20}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireEditor;