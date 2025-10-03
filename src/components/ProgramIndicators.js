import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, usePage } from './framework';
import ContextualHelpMascot from './ContextualHelpMascot';
import './ProgramIndicators.css';

const ProgramIndicators = () => {
  return (
    <PageLayout pageName="program-indicators">
      <ProgramIndicatorsContent />
    </PageLayout>
  );
};

const ProgramIndicatorsContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch, error: pageError } = usePage();
  const { user: urlUser, repo: urlRepo, branch: urlBranch } = useParams();
  
  // Get data from page framework, with URL params as fallback
  const user = profile?.login || urlUser;
  const repo = repository?.name || urlRepo;
  const effectiveBranch = branch || urlBranch || 'main';
  
  const [measureFiles, setMeasureFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [hasGhPages, setHasGhPages] = useState(false);
  const [measures, setMeasures] = useState([]);
  const [measureSearch, setMeasureSearch] = useState('');
  const [hasPublishedIG, setHasPublishedIG] = useState(false);
  const [checkingPublishedIG, setCheckingPublishedIG] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeasureName, setNewMeasureName] = useState('');
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [programIndicatorModel, setProgramIndicatorModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);

  // Fetch ProgramIndicator model from smart-base repository
  const fetchProgramIndicatorModel = useCallback(async () => {
    try {
      setLoadingModel(true);
      const modelUrl = 'https://raw.githubusercontent.com/WorldHealthOrganization/smart-base/main/input/fsh/models/ProgramIndicator.fsh';
      const response = await fetch(modelUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ProgramIndicator model');
      }
      
      const modelContent = await response.text();
      
      // Parse the model to extract field definitions
      const fields = [];
      const lines = modelContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Match field definitions like: * id 1..1 id "Indicator ID" "Description..."
        const fieldMatch = trimmed.match(/^\*\s+(\w+)\s+([0-9.]+)\s+(\w+(?:\s+or\s+\w+)?)\s+"([^"]+)"\s+"([^"]+)"/);
        if (fieldMatch) {
          const [, name, cardinality, type, displayName, description] = fieldMatch;
          const isRequired = cardinality.startsWith('1..');
          fields.push({
            name,
            cardinality,
            type,
            displayName,
            description,
            isRequired
          });
        }
      }
      
      setProgramIndicatorModel({
        content: modelContent,
        fields: fields,
        url: modelUrl
      });
      
      console.log('ProgramIndicators: Fetched ProgramIndicator model with', fields.length, 'fields');
    } catch (error) {
      console.warn('ProgramIndicators: Failed to fetch ProgramIndicator model:', error);
      // Set a fallback model structure
      setProgramIndicatorModel({
        content: null,
        fields: [
          { name: 'id', cardinality: '1..1', type: 'id', displayName: 'Indicator ID', description: 'Identifier for the program indicator', isRequired: true },
          { name: 'description', cardinality: '0..1', type: 'string or uri', displayName: 'Description', description: 'Description of the program indicator', isRequired: false },
          { name: 'name', cardinality: '1..1', type: 'string', displayName: 'Name', description: 'Name of the indicator', isRequired: true },
          { name: 'definition', cardinality: '1..1', type: 'string', displayName: 'Definition', description: 'Definition of what the indicator measures', isRequired: true },
          { name: 'numerator', cardinality: '1..1', type: 'string', displayName: 'Numerator', description: 'Description of the numerator calculation', isRequired: true },
          { name: 'denominator', cardinality: '1..1', type: 'string', displayName: 'Denominator', description: 'Description of the denominator calculation', isRequired: true },
          { name: 'disaggregation', cardinality: '1..1', type: 'string', displayName: 'Disaggregation', description: 'Description of how the indicator should be disaggregated', isRequired: true },
          { name: 'references', cardinality: '0..*', type: 'id', displayName: 'References', description: 'References to Health Intervention IDs', isRequired: false }
        ],
        url: modelUrl,
        isFallback: true
      });
    } finally {
      setLoadingModel(false);
    }
  }, []);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          // Check if user has write access to repository
          const isAuthenticated = githubService.isAuth();
          const hasPermissions = repository.permissions?.push || false;
          setHasWriteAccess(isAuthenticated && hasPermissions);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      } else {
        setHasWriteAccess(false);
      }
    };

    checkPermissions();
  }, [repository, profile]);

  // Generate base URL for IG Publisher artifacts
  const getBaseUrl = useCallback((branchName) => {
    const owner = user || repository?.owner?.login || repository?.full_name.split('/')[0];
    const repoName = repo || repository?.name;
    
    if (branchName === (repository?.default_branch || 'main')) {
      return `https://${owner}.github.io/${repoName}`;
    } else {
      return `https://${owner}.github.io/${repoName}/branches/${branchName}`;
    }
  }, [user, repository, repo]);

  // Parse measure file to extract measure information
  const parseMeasureFile = useCallback((content, fileName) => {
    const measure = {
      id: fileName.replace('.fsh', ''),
      title: '',
      description: '',
      name: '',
      definition: '',
      numerator: '',
      denominator: '',
      disaggregation: '',
      fileName: fileName,
      content: content,
      instanceOf: ''
    };

    // Extract fields from FSH content
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for Instance definition
      if (trimmedLine.startsWith('Instance:')) {
        const instanceMatch = trimmedLine.match(/Instance:\s*([^\s]+)/);
        if (instanceMatch) {
          measure.id = instanceMatch[1];
        }
      }
      
      // Look for InstanceOf to determine if it's a ProgramIndicator
      if (trimmedLine.startsWith('InstanceOf:')) {
        const instanceOfMatch = trimmedLine.match(/InstanceOf:\s*([^\s]+)/);
        if (instanceOfMatch) {
          measure.instanceOf = instanceOfMatch[1];
        }
      }
      
      // Look for Title field
      if (trimmedLine.startsWith('Title:')) {
        const titleMatch = trimmedLine.match(/Title:\s*"([^"]+)"/);
        if (titleMatch) {
          measure.title = titleMatch[1];
        }
      }
      
      // Look for Description field
      if (trimmedLine.startsWith('Description:')) {
        const descMatch = trimmedLine.match(/Description:\s*"([^"]+)"/);
        if (descMatch) {
          measure.description = descMatch[1];
        }
      }
      
      // Look for ProgramIndicator-specific fields
      if (trimmedLine.startsWith('* name =')) {
        const nameMatch = trimmedLine.match(/\* name\s*=\s*"([^"]+)"/);
        if (nameMatch) {
          measure.name = nameMatch[1];
          // Use name as title if title is not set
          if (!measure.title) {
            measure.title = nameMatch[1];
          }
        }
      }
      
      if (trimmedLine.startsWith('* definition =')) {
        const defMatch = trimmedLine.match(/\* definition\s*=\s*"([^"]+)"/);
        if (defMatch) {
          measure.definition = defMatch[1];
        }
      }
      
      if (trimmedLine.startsWith('* numerator =')) {
        const numMatch = trimmedLine.match(/\* numerator\s*=\s*"([^"]+)"/);
        if (numMatch) {
          measure.numerator = numMatch[1];
        }
      }
      
      if (trimmedLine.startsWith('* denominator =')) {
        const denomMatch = trimmedLine.match(/\* denominator\s*=\s*"([^"]+)"/);
        if (denomMatch) {
          measure.denominator = denomMatch[1];
        }
      }
      
      if (trimmedLine.startsWith('* disaggregation =')) {
        const disagMatch = trimmedLine.match(/\* disaggregation\s*=\s*"([^"]+)"/);
        if (disagMatch) {
          measure.disaggregation = disagMatch[1];
        }
      }
      
      // Alternative parsing for older formats
      if (trimmedLine.startsWith('* title =') || trimmedLine.startsWith('* title=')) {
        const titleMatch = trimmedLine.match(/\* title\s*=\s*"([^"]+)"/);
        if (titleMatch && !measure.title) {
          measure.title = titleMatch[1];
        }
      }
      
      // First line comment as fallback title
      if (trimmedLine.startsWith('//') && !measure.title) {
        measure.title = trimmedLine.replace('//', '').trim();
      }
    }

    // If no title found, use id or filename
    if (!measure.title) {
      measure.title = measure.name || measure.id || fileName.replace('.fsh', '');
    }
    
    // Build comprehensive description for display
    if (!measure.description && measure.definition) {
      measure.description = measure.definition;
    }

    return measure;
  }, []);

  // Fetch measure files from the repository
  const fetchMeasureFiles = useCallback(async () => {
    if (!user || !repo || !effectiveBranch) {
      console.log('ProgramIndicators: Missing required data:', { user, repo, branch: effectiveBranch });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`ProgramIndicators: Fetching measures from ${user}/${repo}/${effectiveBranch}`);
      
      // Check if measures directory exists
      let measuresPath = 'input/fsh/measures';
      let files = [];
      
      try {
        const dirContents = await githubService.getDirectoryContents(user, repo, measuresPath, effectiveBranch);
        files = dirContents.filter(file => 
          file.type === 'file' && 
          (file.name.endsWith('.fsh') || file.name.endsWith('.cql'))
        );
      } catch (dirError) {
        console.log('ProgramIndicators: input/fsh/measures directory not found, trying alternative paths...');
        
        // Try alternative paths
        const altPaths = [
          'input/fsh',
          'input/measures',
          'measures',
          'fsh/measures'
        ];
        
        for (const altPath of altPaths) {
          try {
            const dirContents = await githubService.getDirectoryContents(user, repo, altPath, effectiveBranch);
            const measureFiles = dirContents.filter(file => 
              file.type === 'file' && 
              (file.name.toLowerCase().includes('measure') || 
               file.name.toLowerCase().includes('indicator')) &&
              (file.name.endsWith('.fsh') || file.name.endsWith('.cql'))
            );
            if (measureFiles.length > 0) {
              files = measureFiles;
              measuresPath = altPath;
              break;
            }
          } catch (e) {
            console.log(`ProgramIndicators: Alternative path ${altPath} not found`);
          }
        }
      }

      console.log(`ProgramIndicators: Found ${files.length} measure files in ${measuresPath}`);
      setMeasureFiles(files.map(file => ({ ...file, path: `${measuresPath}/${file.name}` })));

      // Parse measure files to extract metadata
      const parsedMeasures = [];
      for (const file of files) {
        try {
          const content = await githubService.getFileContent(user, repo, `${measuresPath}/${file.name}`, effectiveBranch);
          const measure = parseMeasureFile(content, file.name);
          parsedMeasures.push(measure);
        } catch (fileError) {
          console.warn(`ProgramIndicators: Failed to parse measure file ${file.name}:`, fileError);
          // Add basic info even if parsing fails
          parsedMeasures.push({
            id: file.name.replace(/\.(fsh|cql)$/, ''),
            title: file.name.replace(/\.(fsh|cql)$/, ''),
            description: `Measure file: ${file.name}`,
            fileName: file.name,
            content: '',
            parseError: true
          });
        }
      }

      setMeasures(parsedMeasures);
      
    } catch (error) {
      console.error('ProgramIndicators: Error fetching measure files:', error);
      // Check if this is a repository access error
      if (error.message.includes('not found') || error.message.includes('not accessible')) {
        setError('Unable to access repository. This may be due to network issues, rate limiting, or repository permissions. Please try again later.');
      } else {
        setError(`Failed to fetch measure files: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, repo, effectiveBranch, parseMeasureFile]);

  // Check for published IG
  const checkPublishedIG = useCallback(async () => {
    if (!user || !repo || !effectiveBranch) return;
    
    try {
      setCheckingPublishedIG(true);
      const baseUrl = getBaseUrl(effectiveBranch);
      
      // Check if IG is published by trying to access index.html
      const response = await fetch(`${baseUrl}/index.html`, { method: 'HEAD' });
      setHasPublishedIG(response.ok);
    } catch (error) {
      console.log('ProgramIndicators: No published IG found');
      setHasPublishedIG(false);
    } finally {
      setCheckingPublishedIG(false);
    }
  }, [user, repo, effectiveBranch, getBaseUrl]);

  // Fetch branches for repository
  const fetchBranches = useCallback(async () => {
    if (!user || !repo) return;
    
    try {
      const branchList = await githubService.listBranches(user, repo);
      setBranches(branchList);
      setHasGhPages(branchList.some(b => b.name === 'gh-pages'));
    } catch (error) {
      console.warn('ProgramIndicators: Failed to fetch branches:', error);
    }
  }, [user, repo]);

  // Load file content for viewing
  const handleFileClick = async (measure) => {
    try {
      setSelectedFile(measure);
      
      if (measure.content && !measure.parseError) {
        setFileContent(measure.content);
      } else {
        // Fetch content if not already loaded
        const content = await githubService.getFileContent(user, repo, measure.fileName, effectiveBranch);
        setFileContent(content);
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('ProgramIndicators: Error loading file content:', error);
      setError(`Failed to load file content: ${error.message}`);
    }
  };

  // Create new measure file
  const handleCreateMeasure = () => {
    if (!hasWriteAccess) {
      alert('You need write access to this repository to create new measures.');
      return;
    }
    setShowCreateModal(true);
  };

  // Generate template for new measure using dynamically fetched model
  const createNewMeasure = () => {
    if (!newMeasureName.trim()) {
      alert('Please enter a measure name');
      return;
    }

    if (!programIndicatorModel) {
      alert('ProgramIndicator model not loaded yet. Please try again in a moment.');
      return;
    }

    const sanitizedName = newMeasureName.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    const measureId = `${sanitizedName}`;
    const measureTitle = newMeasureName.trim();

    // Generate template dynamically from model fields
    let templateLines = [
      `Instance: ${measureId}`,
      `InstanceOf: ProgramIndicator`,
      `Usage: #definition`,
      `Title: "${measureTitle}"`,
      `Description: "Program indicator for ${measureTitle}"`,
      ``
    ];

    // Add required fields
    const requiredFields = programIndicatorModel.fields.filter(f => f.isRequired);
    for (const field of requiredFields) {
      if (field.name === 'id') {
        templateLines.push(`* ${field.name} = "${measureId}"`);
      } else if (field.name === 'name') {
        templateLines.push(`* ${field.name} = "${measureTitle}"`);
      } else {
        templateLines.push(`* ${field.name} = "${field.description}"`);
      }
    }

    // Add optional fields as comments
    templateLines.push(``);
    templateLines.push(`// Optional fields:`);
    const optionalFields = programIndicatorModel.fields.filter(f => !f.isRequired);
    for (const field of optionalFields) {
      if (field.cardinality.includes('*')) {
        // Array field
        templateLines.push(`// * ${field.name}[+] = "value1"`);
        templateLines.push(`// * ${field.name}[+] = "value2"`);
      } else {
        templateLines.push(`// * ${field.name} = "${field.description}"`);
      }
    }

    // Add model reference
    templateLines.push(``);
    templateLines.push(`// Model reference: ${programIndicatorModel.url}`);
    if (programIndicatorModel.isFallback) {
      templateLines.push(`// Note: Using fallback model structure (could not fetch from smart-base)`);
    }

    const measureTemplate = templateLines.join('\n');

    // Show the template in a modal for editing/saving
    setSelectedFile({
      id: measureId,
      title: measureTitle,
      fileName: `${sanitizedName}.fsh`,
      description: `Program indicator for ${measureTitle}`,
      content: measureTemplate,
      isNew: true
    });
    setFileContent(measureTemplate);
    setShowCreateModal(false);
    setNewMeasureName('');
    setShowModal(true);
  };

  // Filter measures based on search
  const filteredMeasures = measures.filter(measure =>
    measure.title.toLowerCase().includes(measureSearch.toLowerCase()) ||
    measure.description.toLowerCase().includes(measureSearch.toLowerCase()) ||
    measure.id.toLowerCase().includes(measureSearch.toLowerCase())
  );

  // Initialize data
  useEffect(() => {
    if (user && repo && effectiveBranch) {
      fetchMeasureFiles();
      fetchBranches();
      checkPublishedIG();
    }
    
    // Fetch ProgramIndicator model once when component mounts
    if (!programIndicatorModel) {
      fetchProgramIndicatorModel();
    }
  }, [user, repo, effectiveBranch, fetchMeasureFiles, fetchBranches, checkPublishedIG, programIndicatorModel, fetchProgramIndicatorModel]);

  if (loading) {
    return (
      <div className="program-indicators loading-state">
        <div className="loading-content">
          <h2>Loading Program Indicators...</h2>
          <p>Fetching measure files from repository...</p>
          {pageError && (
            <div className="page-error-notice">
              <p><strong>Repository Access:</strong> {pageError}</p>
              <p>Attempting to access repository directly...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-indicators error-state">
        <div className="error-content">
          <h2>Error Loading Program Indicators</h2>
          <p>{error}</p>
          {pageError && (
            <div className="page-error-details">
              <h3>Repository Access Issue</h3>
              <p>{pageError}</p>
              <p>This may be due to:</p>
              <ul>
                <li>Network connectivity issues</li>
                <li>GitHub API rate limiting</li>
                <li>Repository access permissions</li>
                <li>Temporary service unavailability</li>
              </ul>
            </div>
          )}
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              Return Home
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="program-indicators">
      <div className="viewer-header">
        <div className="header-content">
          <div className="header-info">
            <h1>📊 Program Indicators & Measures</h1>
            <p className="header-subtitle">
              Performance indicators and measurement definitions for monitoring and evaluation
            </p>
            <div className="repository-info">
              <span className="repo-badge">
                📁 {user}/{repo}
              </span>
              <span className="branch-badge">
                🌿 {effectiveBranch}
              </span>
              <span className="count-badge">
                📊 {measures.length} measure{measures.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {hasPublishedIG && (
            <div className="published-ig-link">
              <a 
                href={`${getBaseUrl(effectiveBranch)}/artifacts.html#structures-measures`}
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn secondary"
              >
                📋 View Published Measures
              </a>
            </div>
          )}

          {hasWriteAccess && (
            <div className="create-measure-section">
              <button 
                onClick={handleCreateMeasure}
                className="action-btn primary create-btn"
                title="Create a new measure file"
                disabled={loadingModel}
              >
                {loadingModel ? '⏳ Loading Model...' : '➕ Create New Measure'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="viewer-content">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search measures by title, description, or ID..."
              value={measureSearch}
              onChange={(e) => setMeasureSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {filteredMeasures.length === 0 ? (
          <div className="no-measures">
            <div className="no-measures-content">
              <h3>📊 No Program Indicators Found</h3>
              <p>
                {measures.length === 0 
                  ? "This repository doesn't contain any measure files in the expected locations."
                  : "No measures match your search criteria."
                }
              </p>
              {measures.length === 0 && (
                <div className="help-text">
                  <p>Expected locations for measure files:</p>
                  <ul>
                    <li><code>input/fsh/measures/</code></li>
                    <li><code>input/fsh/</code> (with measure-related files)</li>
                    <li><code>input/measures/</code></li>
                  </ul>
                  {hasWriteAccess && (
                    <button 
                      onClick={handleCreateMeasure}
                      className="action-btn primary"
                      style={{ marginTop: '1rem' }}
                      disabled={loadingModel}
                    >
                      {loadingModel ? '⏳ Loading Model...' : '➕ Create Your First Measure'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="measures-grid">
            {filteredMeasures.map((measure, index) => (
              <div key={index} className="measure-card" onClick={() => handleFileClick(measure)}>
                <div className="measure-header">
                  <h3 className="measure-title">{measure.title}</h3>
                  <span className="measure-id">{measure.id}</span>
                  {measure.instanceOf && (
                    <span className="instance-badge">{measure.instanceOf}</span>
                  )}
                </div>
                {measure.description && (
                  <p className="measure-description">{measure.description}</p>
                )}
                {measure.instanceOf === 'ProgramIndicator' && (
                  <div className="indicator-details">
                    {measure.numerator && (
                      <div className="indicator-field">
                        <strong>Numerator:</strong> {measure.numerator.substring(0, 100)}{measure.numerator.length > 100 ? '...' : ''}
                      </div>
                    )}
                    {measure.denominator && (
                      <div className="indicator-field">
                        <strong>Denominator:</strong> {measure.denominator.substring(0, 100)}{measure.denominator.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                )}
                <div className="measure-meta">
                  <span className="file-name">📄 {measure.fileName}</span>
                  {measure.parseError && (
                    <span className="parse-warning">⚠️ Parse error</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="file-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="file-modal create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New Measure</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">✕</button>
            </div>
            <div className="modal-content">
              <div className="create-form">
                <label htmlFor="measure-name">Measure Name:</label>
                <input
                  id="measure-name"
                  type="text"
                  placeholder="e.g., HIV Testing Coverage"
                  value={newMeasureName}
                  onChange={(e) => setNewMeasureName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createNewMeasure();
                    }
                  }}
                  className="measure-name-input"
                  autoFocus
                />
                <div className="create-form-help">
                  <p>This will create a new Program Indicator using the WHO SMART Guidelines ProgramIndicator logical model.</p>
                  <p>The template is dynamically generated from the model definition in smart-base repository.</p>
                  <p>The file will be saved as: <code>input/fsh/measures/{newMeasureName.trim().replace(/[^a-zA-Z0-9-_]/g, '') || 'measure-name'}.fsh</code></p>
                  <p className="model-reference">
                    Model: <a href="https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/ProgramIndicator.fsh" target="_blank" rel="noopener noreferrer">ProgramIndicator.fsh</a>
                    {programIndicatorModel?.isFallback && <span className="fallback-notice"> (using fallback)</span>}
                  </p>
                </div>
                <div className="create-form-actions">
                  <button 
                    onClick={createNewMeasure}
                    className="action-btn primary"
                    disabled={!newMeasureName.trim()}
                  >
                    Create Measure Template
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="action-btn secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedFile && (
        <div className="file-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="file-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 {selectedFile.title}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
            </div>
            <div className="modal-content">
              <div className="file-info">
                <span className="file-name">📄 {selectedFile.fileName}</span>
                <span className="measure-id">ID: {selectedFile.id}</span>
                {selectedFile.instanceOf && (
                  <span className="instance-badge">{selectedFile.instanceOf}</span>
                )}
                {selectedFile.isNew && (
                  <span className="new-badge">✨ New</span>
                )}
              </div>
              
              {/* Show ProgramIndicator fields if available */}
              {selectedFile.instanceOf === 'ProgramIndicator' && !selectedFile.isNew && (
                <div className="program-indicator-details">
                  {selectedFile.name && (
                    <div className="indicator-detail-field">
                      <strong>Name:</strong> {selectedFile.name}
                    </div>
                  )}
                  {selectedFile.definition && (
                    <div className="indicator-detail-field">
                      <strong>Definition:</strong> {selectedFile.definition}
                    </div>
                  )}
                  {selectedFile.numerator && (
                    <div className="indicator-detail-field">
                      <strong>Numerator:</strong> {selectedFile.numerator}
                    </div>
                  )}
                  {selectedFile.denominator && (
                    <div className="indicator-detail-field">
                      <strong>Denominator:</strong> {selectedFile.denominator}
                    </div>
                  )}
                  {selectedFile.disaggregation && (
                    <div className="indicator-detail-field">
                      <strong>Disaggregation:</strong> {selectedFile.disaggregation}
                    </div>
                  )}
                </div>
              )}
              
              {selectedFile.isNew && (
                <div className="new-measure-notice">
                  <p><strong>WHO ProgramIndicator Template Generated</strong></p>
                  <p>This template follows the WHO SMART Guidelines ProgramIndicator logical model from smart-base. To save this indicator to your repository:</p>
                  <ol>
                    <li>Review and customize the template below</li>
                    <li>Fill in the required fields (name, definition, numerator, denominator, disaggregation)</li>
                    <li>Copy the content</li>
                    <li>Create a new file at <code>input/fsh/measures/{selectedFile.fileName}</code></li>
                    <li>Paste and save the content</li>
                  </ol>
                  <div className="notice-actions">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(fileContent);
                        alert('Template copied to clipboard!');
                      }}
                      className="action-btn primary"
                    >
                      📋 Copy Template
                    </button>
                  </div>
                </div>
              )}
              <pre className="file-content">{fileContent}</pre>
            </div>
          </div>
        </div>
      )}

      <ContextualHelpMascot 
        pageId="program-indicators"
        helpTopics={[
          'program-indicators-overview',
          'viewing-measure-files',
          'searching-measures'
        ]}
      />
    </div>
  );
};

export default ProgramIndicators;