import React, { useState, useEffect, useCallback } from 'react';
import githubService from '../services/githubService';
import { PageLayout, useDAKParams } from './framework';
import './PersonaViewer.css';

const PersonaViewer = () => {
  return (
    <PageLayout pageName="persona-viewer">
      <PersonaViewerContent />
    </PageLayout>
  );
};

const PersonaViewerContent = () => {
  const { profile, repository, branch } = useDAKParams();
  
  // Get data from page framework
  const user = profile?.login;
  const repo = repository?.name;
  const selectedBranch = branch || repository?.default_branch || 'main';
  
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanStatus, setScanStatus] = useState('');

  // Helper function to parse FSH file content for actor definitions
  const parseFshFileForActors = useCallback((filePath, content) => {
    const actors = [];
    const lines = content.split('\n');
    
    let currentActor = null;
    let inActorDefinition = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for Profile definitions that could be actors
      if (line.startsWith('Profile:') || line.startsWith('Instance:')) {
        const id = line.split(':')[1]?.trim();
        if (id) {
          // Generous assumption: any instance ID could be an actor
          currentActor = {
            id,
            name: id,
            description: '',
            type: 'FSH Profile/Instance',
            source: {
              type: 'fsh',
              path: filePath,
              lineNumber: i + 1
            }
          };
          inActorDefinition = true;
        }
      }
      
      // Look for explicit actor-related keywords
      if (line.includes('ActorDefinition') || line.includes('Actor') || 
          line.toLowerCase().includes('persona') || line.toLowerCase().includes('role')) {
        if (!currentActor && line.includes(':')) {
          const parts = line.split(':');
          const id = parts[parts.length - 1]?.trim();
          if (id) {
            currentActor = {
              id,
              name: id,
              description: 'Actor definition found',
              type: 'FSH Actor',
              source: {
                type: 'fsh',
                path: filePath,
                lineNumber: i + 1
              }
            };
            inActorDefinition = true;
          }
        }
      }
      
      // Extract title and description
      if (currentActor && inActorDefinition) {
        if (line.startsWith('Title:')) {
          currentActor.name = line.split(':')[1]?.trim().replace(/"/g, '') || currentActor.id;
        } else if (line.startsWith('Description:')) {
          currentActor.description = line.split(':')[1]?.trim().replace(/"/g, '') || '';
        } else if (line.startsWith('Id:')) {
          currentActor.id = line.split(':')[1]?.trim() || currentActor.id;
        }
        
        // End of definition (empty line or new definition)
        if (line === '' || line.startsWith('Profile:') || line.startsWith('Instance:')) {
          if (currentActor.id && i > 0) {
            actors.push(currentActor);
            currentActor = null;
            inActorDefinition = false;
          }
        }
      }
    }
    
    // Add the last actor if we ended the file while in a definition
    if (currentActor && currentActor.id) {
      actors.push(currentActor);
    }
    
    return actors;
  }, []);

  // Helper function to parse JSON file content for actor definitions
  const parseJsonFileForActors = useCallback((filePath, content) => {
    const actors = [];
    
    try {
      const jsonData = JSON.parse(content);
      
      // Function to recursively search for actor-like objects
      const searchForActors = (obj, path = '') => {
        if (typeof obj !== 'object' || obj === null) return;
        
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => searchForActors(item, `${path}[${index}]`));
          return;
        }
        
        // Check if this object looks like an actor definition
        const resourceType = obj.resourceType;
        const id = obj.id;
        
        if (resourceType && id) {
          // Be generous with actor-like resource types
          if (resourceType === 'ActorDefinition' || 
              resourceType === 'SGActorDefinition' ||
              resourceType === 'Persona' ||
              resourceType === 'SGPersona' ||
              resourceType.toLowerCase().includes('actor') ||
              resourceType.toLowerCase().includes('persona')) {
            
            actors.push({
              id: id,
              name: obj.name || obj.title || id,
              description: obj.description || `${resourceType} resource`,
              type: `JSON ${resourceType}`,
              source: {
                type: 'json',
                path: filePath,
                resourceType: resourceType,
                fullPath: path
              }
            });
          }
        }
        
        // Recursively search nested objects
        Object.keys(obj).forEach(key => {
          searchForActors(obj[key], path ? `${path}.${key}` : key);
        });
      };
      
      searchForActors(jsonData);
      
    } catch (parseError) {
      console.warn(`Failed to parse JSON file ${filePath}:`, parseError);
    }
    
    return actors;
  }, []);

  // Scan the repository for actor definitions
  const scanForActors = useCallback(async () => {
    if (!githubService.isAuth() || !user || !repo) {
      setError('GitHub authentication required and repository information needed');
      setLoading(false);
      return;
    }

    setScanStatus('Starting scan...');
    setActors([]);
    
    try {
      const allActors = [];
      
      // 1. Scan FSH files under input/fsh/actors
      setScanStatus('Scanning FSH files in input/fsh/actors...');
      try {
        const actorsDir = await githubService.getDirectoryContents(user, repo, 'input/fsh/actors', selectedBranch);
        
        for (const file of actorsDir) {
          if (file.type === 'file' && file.name.endsWith('.fsh')) {
            setScanStatus(`Scanning FSH file: ${file.name}`);
            try {
              const content = await githubService.getFileContent(user, repo, file.path, selectedBranch);
              const fshActors = parseFshFileForActors(file.path, content);
              allActors.push(...fshActors);
            } catch (fileError) {
              console.warn(`Failed to read FSH file ${file.path}:`, fileError);
            }
          }
        }
      } catch (dirError) {
        console.warn('No input/fsh/actors directory found or access denied:', dirError);
      }
      
      // 2. Scan JSON files under inputs/resources
      setScanStatus('Scanning JSON files in inputs/resources...');
      try {
        const resourcesDir = await githubService.getDirectoryContents(user, repo, 'inputs/resources', selectedBranch);
        
        for (const file of resourcesDir) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            setScanStatus(`Scanning JSON file: ${file.name}`);
            try {
              const content = await githubService.getFileContent(user, repo, file.path, selectedBranch);
              const jsonActors = parseJsonFileForActors(file.path, content);
              allActors.push(...jsonActors);
            } catch (fileError) {
              console.warn(`Failed to read JSON file ${file.path}:`, fileError);
            }
          }
        }
      } catch (dirError) {
        console.warn('No inputs/resources directory found or access denied:', dirError);
      }
      
      setScanStatus(`Scan complete. Found ${allActors.length} actors.`);
      setActors(allActors);
      setError(null);
      
    } catch (error) {
      console.error('Error scanning for actors:', error);
      setError(`Failed to scan repository: ${error.message}`);
      setScanStatus('Scan failed');
    } finally {
      setLoading(false);
    }
  }, [user, repo, selectedBranch, parseFshFileForActors, parseJsonFileForActors]);

  // Initial scan when component mounts
  useEffect(() => {
    if (user && repo) {
      scanForActors();
    } else {
      setLoading(false);
      setError('Repository information not available');
    }
  }, [user, repo, selectedBranch, scanForActors]);

  // Helper function to generate source file link
  const getSourceFileLink = useCallback((actor) => {
    if (!user || !repo || !actor.source) return '#';
    
    const baseUrl = `https://github.com/${user}/${repo}/blob/${selectedBranch}/${actor.source.path}`;
    
    if (actor.source.lineNumber) {
      return `${baseUrl}#L${actor.source.lineNumber}`;
    }
    
    return baseUrl;
  }, [user, repo, selectedBranch]);

  if (loading) {
    return (
      <div className="user-scenarios-viewer">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading user scenarios and personas...</p>
          {scanStatus && <p className="scan-status">{scanStatus}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-scenarios-viewer">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          {user && repo && (
            <button onClick={scanForActors} className="retry-button">
              Retry Scan
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="user-scenarios-viewer">
      <div className="page-header">
        <h1>User Scenarios & Personas</h1>
        <p className="page-description">
          Actor definitions and personas found in this DAK repository.
        </p>
        {user && repo && (
          <div className="repository-info">
            <strong>Repository:</strong> {user}/{repo} 
            <span className="branch-info">(branch: {selectedBranch})</span>
          </div>
        )}
      </div>

      <div className="scan-controls">
        <button onClick={scanForActors} className="rescan-button" disabled={loading}>
          {loading ? 'Scanning...' : 'Rescan Repository'}
        </button>
        {scanStatus && <p className="scan-status">{scanStatus}</p>}
      </div>

      <div className="actors-summary">
        <h2>Found Actors ({actors.length})</h2>
        {actors.length === 0 ? (
          <div className="no-actors">
            <p>No actor definitions found in this repository.</p>
            <div className="search-info">
              <h3>Searched in:</h3>
              <ul>
                <li><code>input/fsh/actors/*.fsh</code> - FSH actor definitions (generous matching)</li>
                <li><code>inputs/resources/*.json</code> - JSON ActorDefinition resources (strict matching)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="actors-list">
            {actors.map((actor, index) => (
              <div key={index} className="actor-card">
                <div className="actor-header">
                  <h3 className="actor-name">{actor.name}</h3>
                  <span className={`actor-type ${actor.source.type}`}>
                    {actor.type}
                  </span>
                </div>
                
                <div className="actor-details">
                  <p className="actor-id"><strong>ID:</strong> {actor.id}</p>
                  {actor.description && (
                    <p className="actor-description">{actor.description}</p>
                  )}
                </div>
                
                <div className="actor-source">
                  <p className="source-path">
                    <strong>Source:</strong> 
                    <a 
                      href={getSourceFileLink(actor)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      {actor.source.path}
                      {actor.source.lineNumber && ` (line ${actor.source.lineNumber})`}
                    </a>
                  </p>
                  {actor.source.resourceType && (
                    <p className="resource-type">
                      <strong>Resource Type:</strong> {actor.source.resourceType}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaViewer;