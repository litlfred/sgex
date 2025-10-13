import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import dakFrameworkService from '../services/dakFrameworkService';
import PageEditModal from './PageEditModal';
import DAKStatusBox from './DAKStatusBox';
import './UserScenariosManager.css';

const UserScenariosManager = () => {
  const { user, repo, branch } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, selectedBranch } = location.state || {};
  
  const [scenarios, setScenarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [editModalScenario, setEditModalScenario] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newScenarioId, setNewScenarioId] = useState('');
  const [idValidationError, setIdValidationError] = useState('');

  // Get repository details
  const owner = user || repository?.owner?.login || repository?.full_name?.split('/')[0];
  const repoName = repo || repository?.name;
  const currentBranch = branch || selectedBranch || 'main';

  useEffect(() => {
    const initializeAuth = async () => {
      if (!githubService.isAuth()) {
        const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
        if (token) {
          githubService.authenticate(token);
        }
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (repository && currentBranch) {
      stagingGroundService.initialize(repository, currentBranch);
    }
  }, [repository, currentBranch]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (owner && repoName) {
        try {
          const writeAccess = await githubService.checkRepositoryWritePermissions(owner, repoName);
          setHasWriteAccess(writeAccess);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };
    checkPermissions();
  }, [owner, repoName]);

  useEffect(() => {
    const loadScenarios = async () => {
      if (!owner || !repoName) {
        setError('Missing repository information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load scenarios from input/pagecontent/
        const scenarios = await loadUserScenarios(owner, repoName, currentBranch);
        setScenarios(scenarios);

        // Load personas/actors for variable substitution using DAK framework service
        const actors = await dakFrameworkService.getActors(owner, repoName, currentBranch);
        setPersonas(actors);

      } catch (error) {
        console.error('Error loading scenarios:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (owner && repoName) {
      loadScenarios();
    }
  }, [owner, repoName, currentBranch]);

  const loadUserScenarios = async (owner, repo, branch) => {
    try {
      const response = await githubService.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'input/pagecontent',
        ref: branch
      });

      const files = Array.isArray(response.data) ? response.data : [response.data];
      const scenarioFiles = files.filter(file => 
        file.type === 'file' && 
        file.name.match(/^userscenario-[A-Za-z0-9-]+\.md$/)
      );

      const scenarios = await Promise.all(
        scenarioFiles.map(async (file) => {
          try {
            const contentResponse = await githubService.octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path,
              ref: branch
            });

            return {
              id: file.name.replace('.md', '').replace('userscenario-', ''),
              name: file.name,
              path: file.path,
              sha: file.sha,
              content: contentResponse.data
            };
          } catch (error) {
            console.warn(`Failed to load content for ${file.name}:`, error);
            return {
              id: file.name.replace('.md', '').replace('userscenario-', ''),
              name: file.name,
              path: file.path,
              sha: file.sha,
              content: null
            };
          }
        })
      );

      return scenarios;
    } catch (error) {
      if (error.status === 404) {
        // Directory doesn't exist yet
        return [];
      }
      throw error;
    }
  };

  // Note: loadPersonas has been removed and replaced with dakFrameworkService.getActors()
  // This provides centralized actor loading with staging ground integration

  const validateScenarioId = (id) => {
    if (!id) {
      return 'ID is required';
    }

    // Must start with capital letter
    if (!/^[A-Z]/.test(id)) {
      return 'ID must start with a capital letter';
    }

    // Can only contain letters, numbers, and hyphens (no underscores)
    if (!/^[A-Za-z0-9-]+$/.test(id)) {
      return 'ID can only contain letters, numbers, and hyphens (no underscores)';
    }

    // Check if already exists
    const exists = scenarios.some(s => s.id.toLowerCase() === id.toLowerCase());
    if (exists) {
      return 'A scenario with this ID already exists';
    }

    return '';
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
    setNewScenarioId('');
    setIdValidationError('');
  };

  const handleCreateScenario = async () => {
    const error = validateScenarioId(newScenarioId);
    if (error) {
      setIdValidationError(error);
      return;
    }

    const filename = `userscenario-${newScenarioId}.md`;
    const path = `input/pagecontent/${filename}`;

    const newScenario = {
      id: newScenarioId,
      name: filename,
      path: path,
      content: {
        content: btoa(`# User Scenario: ${newScenarioId}\n\n## Description\n\n[Describe the user scenario here]\n\n## Steps\n\n1. [Step 1]\n2. [Step 2]\n`),
        encoding: 'base64'
      },
      filename: filename,
      title: newScenarioId,
      isNew: true
    };

    setEditModalScenario(newScenario);
    setCreatingNew(false);
  };

  const handleEdit = (scenario) => {
    setEditModalScenario(scenario);
  };

  const handleSave = async (scenario, content, status) => {
    // Update DAK JSON with user scenario
    await updateDAKJSON(scenario.id, content);
    
    // Reload scenarios
    const scenarios = await loadUserScenarios(owner, repoName, currentBranch);
    setScenarios(scenarios);
  };

  const updateDAKJSON = async (scenarioId, content) => {
    try {
      // Extract personas referenced in the content
      const personaRefs = [...content.matchAll(/\{\{persona\.([A-Za-z0-9-]+)\./g)].map(m => m[1]);
      const uniquePersonaRefs = [...new Set(personaRefs)];

      // Build UserScenario object
      const userScenario = {
        id: scenarioId,
        title: scenarioId,
        description: {
          uri: `input/pagecontent/userscenario-${scenarioId}.md`
        },
        personas: uniquePersonaRefs.map(personaId => {
          const persona = personas.find(p => p.id === personaId);
          return {
            id: personaId,
            title: persona?.title || personaId
          };
        })
      };

      // Load existing DAK JSON or create new
      let dakData = null;
      try {
        const dakResponse = await githubService.octokit.rest.repos.getContent({
          owner,
          repo: repoName,
          path: 'dak.json',
          ref: currentBranch
        });
        dakData = JSON.parse(atob(dakResponse.data.content));
      } catch (error) {
        // DAK JSON doesn't exist, create minimal structure
        dakData = {
          resourceType: 'DAK',
          id: repoName,
          userScenarios: []
        };
      }

      // Update or add user scenario
      if (!dakData.userScenarios) {
        dakData.userScenarios = [];
      }

      const existingIndex = dakData.userScenarios.findIndex(us => us.id === scenarioId);
      if (existingIndex >= 0) {
        dakData.userScenarios[existingIndex] = userScenario;
      } else {
        dakData.userScenarios.push(userScenario);
      }

      // Save to staging ground
      stagingGroundService.updateFile(
        'dak.json',
        JSON.stringify(dakData, null, 2),
        {
          title: 'DAK Configuration',
          filename: 'dak.json',
          tool: 'UserScenarioEditor',
          contentType: 'json'
        }
      );

    } catch (error) {
      console.error('Failed to update DAK JSON:', error);
    }
  };

  const renderPersonaVariableHelper = () => {
    if (personas.length === 0) {
      return (
        <div className="variable-helper">
          <span className="variable-helper-label">📝 Insert Variable:</span>
          <span className="variable-helper-empty">No personas found</span>
        </div>
      );
    }

    return (
      <div className="variable-helper">
        <span className="variable-helper-label">📝 Insert Variable:</span>
        <select 
          className="variable-helper-select"
          onChange={(e) => {
            if (e.target.value) {
              navigator.clipboard.writeText(e.target.value);
              alert(`Copied to clipboard: ${e.target.value}`);
              e.target.value = '';
            }
          }}
        >
          <option value="">Select persona property...</option>
          {personas.map(persona => (
            <optgroup key={persona.id} label={`${persona.title}${persona.staged ? ' 📝' : ''}`}>
              <option value={`{{persona.${persona.id}.title}}`}>
                Insert {persona.title} - title
              </option>
              <option value={`{{persona.${persona.id}.description}}`}>
                Insert {persona.title} - description
              </option>
              <option value={`{{persona.${persona.id}.id}}`}>
                Insert {persona.title} - id
              </option>
            </optgroup>
          ))}
        </select>
        <span className="variable-helper-hint">
          (Select a variable to copy to clipboard. 📝 = staged changes)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-scenarios-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-scenarios-manager">
        <div className="error-container">
          <h2>Error Loading User Scenarios</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-scenarios-manager">
      <div className="user-scenarios-header">
        <h1>👥 User Scenarios</h1>
        <p className="header-subtitle">
          {owner}/{repoName} on {currentBranch}
        </p>
      </div>

      <div className="user-scenarios-content">
        <DAKStatusBox 
          repository={{ full_name: `${owner}/${repoName}`, name: repoName }}
          selectedBranch={currentBranch}
        />

        <div className="scenarios-actions">
          <button 
            className="btn-create-new"
            onClick={handleCreateNew}
            disabled={!hasWriteAccess}
            title={!hasWriteAccess ? 'You need write access to create scenarios' : ''}
          >
            ➕ Create New Scenario
          </button>
        </div>

        <div className="scenarios-list">
          <h2>📄 Existing User Scenarios ({scenarios.length})</h2>
          
          {scenarios.length === 0 ? (
            <div className="empty-state">
              <p>No user scenarios found in input/pagecontent/</p>
              <p className="empty-state-hint">
                User scenario files should be named: userscenario-[ID].md
              </p>
            </div>
          ) : (
            <div className="scenarios-grid">
              {scenarios.map(scenario => (
                <div key={scenario.id} className="scenario-card">
                  <div className="scenario-card-header">
                    <h3>📝 {scenario.name}</h3>
                  </div>
                  <div className="scenario-card-body">
                    <p className="scenario-id">ID: {scenario.id}</p>
                    <p className="scenario-path">{scenario.path}</p>
                  </div>
                  <div className="scenario-card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(scenario)}
                      disabled={!hasWriteAccess}
                      title={!hasWriteAccess ? 'You need write access to edit' : ''}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {creatingNew && (
        <div className="modal-overlay" onClick={() => setCreatingNew(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Create New User Scenario</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="scenario-id">Scenario ID</label>
                <input 
                  type="text"
                  id="scenario-id"
                  className={`form-input ${idValidationError ? 'error' : ''}`}
                  value={newScenarioId}
                  onChange={(e) => {
                    setNewScenarioId(e.target.value);
                    setIdValidationError('');
                  }}
                  placeholder="e.g., Anc-registration-001"
                  autoFocus
                />
                {idValidationError && (
                  <div className="error-message">{idValidationError}</div>
                )}
              </div>
              
              <div className="id-requirements">
                <h4>ℹ️ ID Requirements:</h4>
                <ul>
                  <li>✓ Must start with a capital letter</li>
                  <li>✓ Can contain letters, numbers, and hyphens</li>
                  <li>✗ Cannot contain underscores</li>
                  <li>✓ Must be unique</li>
                </ul>
                <p className="id-examples">
                  <strong>Examples:</strong><br/>
                  ✅ Anc-registration-001<br/>
                  ✅ Health-check<br/>
                  ✅ VaccinationRecord<br/>
                  ❌ anc-registration (must start with capital)<br/>
                  ❌ Health_check (no underscores)
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setCreatingNew(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateScenario}
                disabled={!newScenarioId}
              >
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalScenario && (
        <PageEditModal 
          page={editModalScenario}
          title={`Edit User Scenario: ${editModalScenario.id}`}
          onClose={() => setEditModalScenario(null)}
          onSave={handleSave}
          enablePreview={true}
          variableHelper={renderPersonaVariableHelper()}
          additionalMetadata={{
            tool: 'UserScenarioEditor',
            scenarioId: editModalScenario.id
          }}
        />
      )}
    </div>
  );
};

export default UserScenariosManager;
