import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import useDAKUrlParams from '../hooks/useDAKUrlParams';
import { PageLayout } from './framework';
import './ProgramIndicatorsViewer.css';

const ProgramIndicatorsViewer = () => {
  const navigate = useNavigate();
  
  // Use the DAK URL params hook to get profile, repository, and branch
  const { 
    profile, 
    repository, 
    selectedBranch, 
    loading: dakLoading, 
    error: dakError 
  } = useDAKUrlParams();

  const [measureFiles, setMeasureFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          const writeAccess = profile.token && repository.permissions?.push;
          setHasWriteAccess(writeAccess || false);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };

    checkPermissions();
  }, [repository, profile]);

  // Load measure files from repository
  useEffect(() => {
    const loadMeasureFiles = async () => {
      if (!repository) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        const ref = selectedBranch || 'main';

        console.log(`🔍 ProgramIndicatorsViewer: Fetching measure files from ${owner}/${repoName} (branch: ${ref})`);
        
        // Get files from input/fsh/measures directory
        const files = await githubService.getContents(owner, repoName, 'input/fsh/measures', ref);
        
        // Filter for .fsh files
        const fshFiles = files.filter(f => f.name.endsWith('.fsh'));
        
        // Load content for each file to extract Title
        const measuresWithTitles = await Promise.all(
          fshFiles.map(async (file) => {
            try {
              const content = await githubService.getFileContent(owner, repoName, file.path, ref);
              const title = extractTitleFromFSH(content);
              return {
                ...file,
                title: title || file.name.replace('.fsh', ''),
                content
              };
            } catch (err) {
              console.warn(`Could not load content for ${file.name}:`, err);
              return {
                ...file,
                title: file.name.replace('.fsh', ''),
                content: null
              };
            }
          })
        );
        
        console.log('📊 ProgramIndicatorsViewer: Loaded measure files:', {
          count: measuresWithTitles.length,
          files: measuresWithTitles.map(f => ({ name: f.name, title: f.title }))
        });
        
        setMeasureFiles(measuresWithTitles);
        setLoading(false);
      } catch (err) {
        console.error('Error loading measure files:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (!dakLoading && repository) {
      loadMeasureFiles();
    }
  }, [repository, selectedBranch, dakLoading, navigate]);

  // Extract Title from FSH content
  const extractTitleFromFSH = (content) => {
    if (!content) return null;
    
    // Look for Title line in FSH
    const titleMatch = content.match(/^Title:\s*"(.+)"$/m);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    // Fallback: look for * title = "..."
    const altTitleMatch = content.match(/^\*\s*title\s*=\s*"(.+)"$/m);
    if (altTitleMatch) {
      return altTitleMatch[1];
    }
    
    return null;
  };

  // Filter measures based on search
  const filteredMeasures = measureFiles.filter(measure => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      measure.title.toLowerCase().includes(searchLower) ||
      measure.name.toLowerCase().includes(searchLower)
    );
  });

  // Navigate to editor for a measure
  const handleMeasureClick = (measure) => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const path = selectedBranch 
      ? `/program-indicator-editor/${owner}/${repoName}/${selectedBranch}/${encodeURIComponent(measure.path)}`
      : `/program-indicator-editor/${owner}/${repoName}/${encodeURIComponent(measure.path)}`;
    
    const navigationState = {
      profile,
      repository,
      selectedBranch,
      measure
    };
    
    navigate(path, { state: navigationState });
  };

  if (dakLoading) {
    return (
      <PageLayout pageName="program-indicators-viewer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (dakError) {
    return (
      <PageLayout pageName="program-indicators-viewer">
        <div className="error-container">
          <h2>Error</h2>
          <p>{dakError}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="program-indicators-viewer">
      <div className="program-indicators-viewer">
        <div className="viewer-header">
          <h1>Program Indicators & Measures</h1>
          <p>
            Performance indicators and measurement definitions for monitoring and evaluation in{' '}
            <strong>{repository?.name}</strong>
            {selectedBranch && (
              <span> on branch <code className="branch-display">{selectedBranch}</code></span>
            )}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="viewer-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search measures by title or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="controls-info">
            <span className="measure-count">
              {filteredMeasures.length} measure{filteredMeasures.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading measure files...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {!loading && !error && filteredMeasures.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No measures found</h3>
            <p>
              {searchTerm 
                ? `No measures match "${searchTerm}"`
                : 'No measure files found in input/fsh/measures directory'
              }
            </p>
          </div>
        )}

        {!loading && !error && filteredMeasures.length > 0 && (
          <div className="measures-list">
            {filteredMeasures.map((measure) => (
              <div 
                key={measure.path} 
                className="measure-card"
                onClick={() => handleMeasureClick(measure)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleMeasureClick(measure);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="measure-icon">📊</div>
                <div className="measure-info">
                  <h3 className="measure-title">{measure.title}</h3>
                  <div className="measure-meta">
                    <span className="measure-filename">{measure.name}</span>
                    <span className="measure-path">{measure.path}</span>
                  </div>
                </div>
                <div className="measure-actions">
                  <button 
                    className="action-button view-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMeasureClick(measure);
                    }}
                  >
                    {hasWriteAccess ? '✏️ Edit' : '👁️ View'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProgramIndicatorsViewer;
