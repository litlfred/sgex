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
      fileName: fileName,
      content: content
    };

    // Extract title from various possible formats
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for Instance definition with title
      if (trimmedLine.startsWith('Instance:')) {
        const instanceMatch = trimmedLine.match(/Instance:\s*([^\s]+)/);
        if (instanceMatch) {
          measure.id = instanceMatch[1];
        }
      }
      
      // Look for title field
      if (trimmedLine.startsWith('* title =') || trimmedLine.startsWith('* title=')) {
        const titleMatch = trimmedLine.match(/\* title\s*=\s*"([^"]+)"/);
        if (titleMatch) {
          measure.title = titleMatch[1];
        }
      }
      
      // Look for description field
      if (trimmedLine.startsWith('* description =') || trimmedLine.startsWith('* description=')) {
        const descMatch = trimmedLine.match(/\* description\s*=\s*"([^"]+)"/);
        if (descMatch) {
          measure.description = descMatch[1];
        }
      }
      
      // Alternative title pattern (first line comment)
      if (trimmedLine.startsWith('//') && !measure.title) {
        measure.title = trimmedLine.replace('//', '').trim();
      }
    }

    // If no title found, use filename
    if (!measure.title) {
      measure.title = measure.id || fileName.replace('.fsh', '');
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
  }, [user, repo, effectiveBranch, fetchMeasureFiles, fetchBranches, checkPublishedIG]);

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
                </div>
                {measure.description && (
                  <p className="measure-description">{measure.description}</p>
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
              </div>
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