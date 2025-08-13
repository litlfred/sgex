import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout, usePageParams } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import SushiConfigEditor from './workflow/SushiConfigEditor';
import IgIniEditor from './workflow/IgIniEditor';
import RepositoryConfigEditor from './workflow/RepositoryConfigEditor';
import './DAKWorkflow.css';

const DAKWorkflow = () => {
  return (
    <PageLayout pageName="dak-workflow">
      <DAKWorkflowContent />
    </PageLayout>
  );
};

const DAKWorkflowContent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = usePageParams();
  const { user } = useParams();

  // State management
  const [currentStep, setCurrentStep] = useState('repository');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [repositoryConfig, setRepositoryConfig] = useState({
    name: '',
    description: '',
    private: false,
    topics: ['who', 'smart-guidelines', 'dak', 'fhir']
  });
  const [sushiConfig, setSushiConfig] = useState({
    id: '',
    canonical: '',
    name: '',
    title: '',
    description: '',
    version: '0.1.0',
    status: 'draft',
    publisher: '',
    dependencies: [
      { name: 'smart.who.int.base', version: 'dev' },
      { name: 'hl7.fhir.uv.extensions.r4', version: '5.1.0' }
    ],
    pages: {
      'index.md': { title: 'Home', enabled: true },
      'business-requirements.md': { title: 'Business Requirements', enabled: true },
      'data-models-and-exchange.md': { title: 'Data Models and Exchange', enabled: true },
      'deployment.md': { title: 'Deployment', enabled: true },
      'indices.md': { title: 'Indices', enabled: true }
    }
  });
  const [igIniConfig, setIgIniConfig] = useState({
    ig: '',
    template: 'fhir.base.template#current'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Use profile from framework or location state
  const effectiveProfile = profile || location.state?.profile;

  // File steps configuration
  const fileSteps = [
    {
      id: 'repository',
      title: 'Repository Settings',
      description: 'Configure repository name and basic settings',
      required: true,
      component: RepositoryConfigEditor,
      config: repositoryConfig,
      setConfig: setRepositoryConfig,
      validate: validateRepositoryConfig
    },
    {
      id: 'sushi',
      title: 'SUSHI Configuration',
      description: 'Set up sushi-config.yaml with DAK metadata',
      required: true,
      component: SushiConfigEditor,
      config: sushiConfig,
      setConfig: setSushiConfig,
      validate: validateSushiConfig
    },
    {
      id: 'ig-ini',
      title: 'IG Configuration',
      description: 'Configure ig.ini for FHIR implementation guide',
      required: false,
      component: IgIniEditor,
      config: igIniConfig,
      setConfig: setIgIniConfig,
      validate: validateIgIniConfig
    }
  ];

  // Validation functions
  function validateRepositoryConfig(config) {
    const errors = {};
    if (!config.name || config.name.length < 3) {
      errors.name = 'Repository name must be at least 3 characters';
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(config.name)) {
      errors.name = 'Repository name must be lowercase with hyphens only';
    }
    if (!config.description || config.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  function validateSushiConfig(config) {
    const errors = {};
    if (!config.id || config.id.length < 3) {
      errors.id = 'ID is required and must be at least 3 characters';
    }
    if (!config.canonical) {
      errors.canonical = 'Canonical URL is required';
    }
    if (!config.name || config.name.length < 3) {
      errors.name = 'Name is required and must be at least 3 characters';
    }
    if (!config.title || config.title.length < 5) {
      errors.title = 'Title is required and must be at least 5 characters';
    }
    if (!config.description || config.description.length < 20) {
      errors.description = 'Description is required and must be at least 20 characters';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  function validateIgIniConfig(config) {
    const errors = {};
    if (!config.ig) {
      errors.ig = 'IG path is required';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  // Auto-update related fields when repository name changes
  useEffect(() => {
    if (repositoryConfig.name && effectiveProfile) {
      // Auto-generate sushi ID based on repository name
      if (!sushiConfig.id || sushiConfig.id === '' || sushiConfig.id.endsWith(repositoryConfig.name.replace(/-/g, '.'))) {
        const newId = `${effectiveProfile.login}.${repositoryConfig.name.replace(/-/g, '.')}`;
        setSushiConfig(prev => ({ ...prev, id: newId }));
      }

      // Auto-generate canonical URL
      if (!sushiConfig.canonical || sushiConfig.canonical === '') {
        const newCanonical = `http://smart.who.int/${repositoryConfig.name}`;
        setSushiConfig(prev => ({ ...prev, canonical: newCanonical }));
      }

      // Auto-generate sushi name (PascalCase)
      if (!sushiConfig.name || sushiConfig.name === '') {
        const newName = repositoryConfig.name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        setSushiConfig(prev => ({ ...prev, name: newName }));
      }

      // Auto-generate ig.ini IG path
      if (!igIniConfig.ig || igIniConfig.ig === '') {
        setIgIniConfig(prev => ({ ...prev, ig: `sushi-config.yaml` }));
      }
    }
  }, [repositoryConfig.name, effectiveProfile]);

  // Check step completion
  const checkStepCompletion = useCallback((stepId) => {
    const step = fileSteps.find(s => s.id === stepId);
    if (!step) return false;

    const validation = step.validate(step.config);
    const isComplete = validation.isValid;

    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (isComplete) {
        newSet.add(stepId);
      } else {
        newSet.delete(stepId);
      }
      return newSet;
    });

    return isComplete;
  }, [fileSteps]);

  // Check all steps on config changes
  useEffect(() => {
    fileSteps.forEach(step => checkStepCompletion(step.id));
  }, [repositoryConfig, sushiConfig, igIniConfig, checkStepCompletion]);

  // Handle step navigation
  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    setShowValidation(false);
  };

  // Handle workflow completion
  const handleCreateRepository = async () => {
    setLoading(true);
    setShowValidation(true);

    try {
      // Validate all steps
      let allValid = true;
      const allErrors = {};

      fileSteps.forEach(step => {
        const validation = step.validate(step.config);
        if (!validation.isValid) {
          allValid = false;
          allErrors[step.id] = validation.errors;
        }
      });

      if (!allValid) {
        setErrors(allErrors);
        setLoading(false);
        return;
      }

      // Clear errors
      setErrors({});

      // Initialize staging ground
      const tempRepo = { name: repositoryConfig.name, owner: effectiveProfile };
      stagingGroundService.initialize(tempRepo, 'main');

      // Generate and stage files
      await stageConfigurationFiles();

      // Create GitHub repository
      await createGitHubRepository();

      // Navigate to DAK dashboard
      navigate(`/dashboard/${effectiveProfile.login}/${repositoryConfig.name}/main`, {
        state: {
          profile: effectiveProfile,
          repository: {
            name: repositoryConfig.name,
            full_name: `${effectiveProfile.login}/${repositoryConfig.name}`,
            description: repositoryConfig.description,
            owner: effectiveProfile,
            private: repositoryConfig.private,
            topics: repositoryConfig.topics
          },
          isNewRepository: true
        }
      });

    } catch (error) {
      console.error('Error creating DAK repository:', error);
      alert('Failed to create repository: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stage configuration files
  const stageConfigurationFiles = async () => {
    // Generate sushi-config.yaml content
    const sushiYaml = generateSushiConfigYaml();
    stagingGroundService.addFile({
      path: 'sushi-config.yaml',
      content: sushiYaml,
      type: 'configuration'
    });

    // Generate ig.ini content
    const igIniContent = generateIgIniContent();
    stagingGroundService.addFile({
      path: 'ig.ini',
      content: igIniContent,
      type: 'configuration'
    });

    // Generate basic README.md
    const readmeContent = generateReadmeContent();
    stagingGroundService.addFile({
      path: 'README.md',
      content: readmeContent,
      type: 'documentation'
    });
  };

  // Generate file contents
  const generateSushiConfigYaml = () => {
    const config = {
      id: sushiConfig.id,
      canonical: sushiConfig.canonical,
      name: sushiConfig.name,
      title: sushiConfig.title,
      description: sushiConfig.description,
      status: sushiConfig.status,
      version: sushiConfig.version,
      fhirVersion: '4.0.1',
      copyrightYear: `${new Date().getFullYear()}+`,
      releaseLabel: 'ci-build',
      license: 'CC0-1.0',
      date: new Date().toISOString().split('T')[0],
      publisher: {
        name: sushiConfig.publisher || effectiveProfile.name || effectiveProfile.login,
        url: effectiveProfile.html_url || `https://github.com/${effectiveProfile.login}`
      },
      meta: {
        profile: ['SMARTImplementationGuide']
      },
      pages: Object.fromEntries(
        Object.entries(sushiConfig.pages)
          .filter(([_, config]) => config.enabled)
          .map(([path, config]) => [path, { title: config.title }])
      ),
      dependencies: Object.fromEntries(
        sushiConfig.dependencies.map(dep => [dep.name, dep.version])
      )
    };

    return `# SUSHI Configuration for ${sushiConfig.title}
# Generated by SGEX DAK Workflow

${Object.entries(config).map(([key, value]) => {
  if (typeof value === 'object' && value !== null) {
    return `${key}:\n${formatYamlObject(value, 2)}`;
  }
  return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
}).join('\n')}
`;
  };

  const formatYamlObject = (obj, indent = 0) => {
    const spaces = ' '.repeat(indent);
    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${spaces}${key}:\n${formatYamlObject(value, indent + 2)}`;
      }
      return `${spaces}${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
    }).join('\n');
  };

  const generateIgIniContent = () => {
    return `[IG]
ig = ${igIniConfig.ig}
template = ${igIniConfig.template}
`;
  };

  const generateReadmeContent = () => {
    return `# ${sushiConfig.title}

${sushiConfig.description}

This Digital Adaptation Kit (DAK) was created using the SGEX Workbench.

## Development

This implementation guide uses [SUSHI](https://fshschool.org/sushi/) for building the FHIR implementation guide.

### Prerequisites

- Node.js and npm
- SUSHI
- Jekyll (for local preview)

### Building

\`\`\`bash
npm install
sushi build
\`\`\`

## License

This work is licensed under [CC0 1.0 Universal](LICENSE).
`;
  };

  // Create GitHub repository
  const createGitHubRepository = async () => {
    const repoData = {
      name: repositoryConfig.name,
      description: repositoryConfig.description,
      private: repositoryConfig.private,
      topics: repositoryConfig.topics,
      has_issues: true,
      has_projects: true,
      has_wiki: false,
      allow_squash_merge: true,
      allow_merge_commit: false,
      allow_rebase_merge: false,
      delete_branch_on_merge: true
    };

    // Use GitHub service to create repository
    await githubService.createRepository(repoData);
    
    // Commit staged files
    const stagedFiles = stagingGroundService.getStagingGround().files;
    if (stagedFiles.length > 0) {
      await githubService.commitFiles(
        effectiveProfile.login,
        repositoryConfig.name,
        'main',
        stagedFiles,
        'Initial DAK setup created by SGEX Workbench'
      );
    }
  };

  // Check if all required steps are completed
  const allRequiredStepsComplete = fileSteps
    .filter(step => step.required)
    .every(step => completedSteps.has(step.id));

  const currentStepData = fileSteps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  return (
    <div className="dak-workflow">
      <div className="workflow-header">
        <h1>Create New DAK</h1>
        <p>Set up a new Digital Adaptation Kit repository with required configuration files.</p>
        {effectiveProfile && (
          <div className="workflow-profile">
            <img 
              src={effectiveProfile.avatar_url} 
              alt={effectiveProfile.login} 
              className="profile-avatar"
            />
            <span>Creating under: <strong>@{effectiveProfile.login}</strong></span>
          </div>
        )}
      </div>

      <div className="workflow-content">
        <div className="workflow-sidebar">
          <h3>Configuration Files</h3>
          <div className="workflow-steps">
            {fileSteps.map(step => (
              <div
                key={step.id}
                className={`workflow-step ${currentStep === step.id ? 'active' : ''} ${
                  completedSteps.has(step.id) ? 'completed' : ''
                } ${step.required ? 'required' : 'optional'}`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="step-icon">
                  {completedSteps.has(step.id) ? '✓' : step.required ? '*' : '○'}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                  {errors[step.id] && (
                    <div className="step-errors">
                      {Object.values(errors[step.id]).slice(0, 1).map((error, idx) => (
                        <span key={idx} className="step-error">{error}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="workflow-actions">
            <button
              className="create-repository-btn"
              onClick={handleCreateRepository}
              disabled={!allRequiredStepsComplete || loading}
            >
              {loading ? 'Creating Repository...' : 'Create DAK Repository'}
            </button>
            {!allRequiredStepsComplete && (
              <p className="validation-note">
                Please complete all required steps marked with *
              </p>
            )}
          </div>
        </div>

        <div className="workflow-main">
          {CurrentStepComponent && (
            <CurrentStepComponent
              config={currentStepData.config}
              setConfig={currentStepData.setConfig}
              errors={showValidation ? errors[currentStep] : {}}
              profile={effectiveProfile}
              onValidate={() => checkStepCompletion(currentStep)}
            />
          )}
        </div>
      </div>

      <ContextualHelpMascot 
        pageName="dak-workflow"
        notificationBadge={!allRequiredStepsComplete}
      />
    </div>
  );
};

export default DAKWorkflow;