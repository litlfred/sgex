import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import './DecisionSupportLogicView.css';

const DecisionSupportLogicView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  // State from location or URL params
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [repository, setRepository] = useState(location.state?.repository || null);
  const [selectedBranch, setSelectedBranch] = useState(location.state?.selectedBranch || branch || null);
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dakDTCodeSystem, setDakDTCodeSystem] = useState(null);
  const [decisionTables, setDecisionTables] = useState([]);
  const [filteredVariables, setFilteredVariables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Code');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDialog, setSelectedDialog] = useState(null);

  // Initialize repository data if not available
  useEffect(() => {
    const initializeData = async () => {
      if ((!profile || !repository) && user && repo) {
        try {
          setLoading(true);
          setError(null);

          // Create demo profile if not authenticated
          const demoProfile = {
            login: user,
            name: user.charAt(0).toUpperCase() + user.slice(1),
            avatar_url: `https://github.com/${user}.png`,
            type: 'User',
            isDemo: true
          };

          const demoRepository = {
            name: repo,
            full_name: `${user}/${repo}`,
            owner: { login: user },
            default_branch: branch || 'main',
            html_url: `https://github.com/${user}/${repo}`,
            isDemo: true
          };

          setProfile(demoProfile);
          setRepository(demoRepository);
          setSelectedBranch(branch || 'main');
        } catch (err) {
          console.error('Error initializing data:', err);
          setError('Failed to load data. Please check the URL or try again.');
        }
      }
      setLoading(false);
    };

    initializeData();
  }, [user, repo, branch, profile, repository]);

  // Load DAK decision support data
  useEffect(() => {
    const loadDecisionSupportData = async () => {
      if (!repository || !selectedBranch) return;

      try {
        setLoading(true);
        
        // Load DAK.DT code system
        await loadDAKDTCodeSystem();
        
        // Load decision tables (.dmn files)
        await loadDecisionTables();
        
      } catch (err) {
        console.error('Error loading decision support data:', err);
        setError('Failed to load decision support data.');
      } finally {
        setLoading(false);
      }
    };

    const loadDAKDTCodeSystem = async () => {
      try {
        // Try to load DAK.DT code system from input/fsh/codesystems/DAK.DT.fsh
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        
        try {
          const fshContent = await githubService.getFileContent(
            owner, 
            repoName, 
            'input/fsh/codesystems/DAK.DT.fsh', 
            selectedBranch
          );
          
          // Parse FSH content to extract code system data
          const codeSystemData = parseFSHCodeSystem(fshContent);
          setDakDTCodeSystem(codeSystemData);
          setFilteredVariables(codeSystemData.concepts || []);
        } catch (error) {
          console.warn('DAK.DT.fsh not found, using fallback data');
          // Fallback data if file doesn't exist
          const fallbackData = createFallbackDAKDT();
          setDakDTCodeSystem(fallbackData);
          setFilteredVariables(fallbackData.concepts || []);
        }
      } catch (err) {
        console.error('Error loading DAK.DT code system:', err);
      }
    };

    const loadDecisionTables = async () => {
      try {
        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        
        // Try to get decision-logic directory contents
        try {
          const contents = await githubService.getDirectoryContents(
            owner,
            repoName,
            'input/decision-logic',
            selectedBranch
          );
          
          // Filter for .dmn files
          const dmnFiles = contents.filter(file => 
            file.name.endsWith('.dmn') && file.type === 'file'
          );
          
          // Create decision table objects with metadata
          const tables = await Promise.all(dmnFiles.map(async (file) => {
            const fileBasename = file.name.replace('.dmn', '');
            
            // Check for corresponding HTML file
            let htmlFile = null;
            try {
              await githubService.getFileContent(
                owner,
                repoName,
                `input/pagecontent/${fileBasename}.html`,
                selectedBranch
              );
              htmlFile = `input/pagecontent/${fileBasename}.html`;
            } catch {
              // HTML file doesn't exist, which is fine
            }
            
            return {
              name: file.name,
              basename: fileBasename,
              path: file.path,
              downloadUrl: file.download_url,
              htmlUrl: file.html_url,
              githubUrl: `https://github.com/${owner}/${repoName}/blob/${selectedBranch}/${file.path}`,
              htmlFile: htmlFile,
              size: file.size
            };
          }));
          
          setDecisionTables(tables);
        } catch (error) {
          console.warn('Decision-logic directory not found or empty');
          setDecisionTables([]);
        }
      } catch (err) {
        console.error('Error loading decision tables:', err);
        setDecisionTables([]);
      }
    };

    loadDecisionSupportData();
  }, [repository, selectedBranch]);

  const parseFSHCodeSystem = (fshContent) => {
    // Basic FSH parser for DAK.DT code system
    const lines = fshContent.split('\n');
    const concepts = [];
    let currentConcept = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for concept definitions
      if (trimmedLine.startsWith('*')) {
        // New concept
        const parts = trimmedLine.substring(1).trim().split(/\s+/);
        if (parts.length >= 2) {
          currentConcept = {
            Code: parts[0],
            Display: parts.slice(1).join(' ').replace(/"/g, ''),
            Definition: '',
            table: '',
            tab: '',
            CQL: ''
          };
          concepts.push(currentConcept);
        }
      } else if (currentConcept && trimmedLine.includes('definition')) {
        // Extract definition
        const match = trimmedLine.match(/definition\s*=\s*"([^"]*)"/);
        if (match) {
          currentConcept.Definition = match[1];
        }
      } else if (currentConcept && trimmedLine.includes('#table')) {
        // Extract table property
        const match = trimmedLine.match(/#table\s*=\s*"([^"]*)"/);
        if (match) {
          currentConcept.table = match[1];
        }
      } else if (currentConcept && trimmedLine.includes('#tab')) {
        // Extract tab property
        const match = trimmedLine.match(/#tab\s*=\s*"([^"]*)"/);
        if (match) {
          currentConcept.tab = match[1];
        }
      } else if (currentConcept && trimmedLine.includes('#CQL')) {
        // Extract CQL property (may span multiple lines)
        const match = trimmedLine.match(/#CQL\s*=\s*"([^"]*)"/);
        if (match) {
          currentConcept.CQL = match[1].replace(/\\n/g, '\n');
        }
      }
    }
    
    return {
      id: 'DAK.DT',
      name: 'Decision Table',
      concepts: concepts
    };
  };

  const createFallbackDAKDT = () => {
    // Fallback data for demonstration
    return {
      id: 'DAK.DT',
      name: 'Decision Table',
      concepts: [
        {
          Code: 'VAR001',
          Display: 'Patient Age',
          Definition: 'The age of the patient in years',
          table: 'Demographics',
          tab: 'Basic Info',
          CQL: `define "Patient Age":\n  AgeInYears()\n\ndefine "Age Range":\n  case\n    when "Patient Age" < 18 then 'Pediatric'\n    when "Patient Age" >= 65 then 'Geriatric'\n    else 'Adult'\n  end`
        },
        {
          Code: 'VAR002',
          Display: 'BMI Category',
          Definition: 'Body Mass Index categorization',
          table: 'Clinical Measurements',
          tab: 'Vitals',
          CQL: `define "BMI":\n  [Observation: "Body mass index"] BMIObservation\n    where BMIObservation.status = 'final'\n    return BMIObservation.value as Quantity\n\ndefine "BMI Category":\n  case\n    when "BMI" < 18.5 then 'Underweight'\n    when "BMI" < 25 then 'Normal'\n    when "BMI" < 30 then 'Overweight'\n    else 'Obese'\n  end`
        },
        {
          Code: 'VAR003',
          Display: 'Vaccination Status',
          Definition: 'Current vaccination status for immunization recommendations',
          table: 'Immunizations',
          tab: 'Status',
          CQL: `define "Completed Vaccinations":\n  [Immunization] I\n    where I.status = 'completed'\n      and I.vaccineCode in "Required Vaccines"\n\ndefine "Vaccination Complete":\n  Count("Completed Vaccinations") >= 3`
        }
      ]
    };
  };

  // Filter and sort variables
  useEffect(() => {
    if (!dakDTCodeSystem?.concepts) return;
    
    let filtered = dakDTCodeSystem.concepts.filter(concept =>
      concept.Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.Display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.Definition?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    setFilteredVariables(filtered);
  }, [dakDTCodeSystem, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openSourceDialog = async (table) => {
    try {
      const content = await fetch(table.downloadUrl).then(res => res.text());
      setSelectedDialog({
        title: `${table.name} Source`,
        content: content,
        type: 'dmn'
      });
    } catch (err) {
      console.error('Error loading DMN source:', err);
      setSelectedDialog({
        title: 'Error',
        content: 'Failed to load DMN source content.',
        type: 'error'
      });
    }
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    if (repository && profile) {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/dashboard/${owner}/${repoName}/${selectedBranch}`
        : `/dashboard/${owner}/${repoName}`;
      
      navigate(path, {
        state: {
          profile,
          repository,
          selectedBranch
        }
      });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="decision-support-view loading-state">
        <div className="loading-content">
          <h2>Loading Decision Support Logic...</h2>
          <p>Fetching variables and decision tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decision-support-view error-state">
        <div className="error-content">
          <h2>Error Loading Decision Support Logic</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="action-btn primary">
              Return to Home
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
    <div className="decision-support-view">
      <div className="view-header">
        <div className="header-left">
          <div className="who-branding">
            <h1 onClick={handleHomeNavigation} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <div className="repo-context">
            {repository && (
              <div className="repo-info">
                <a 
                  href={`https://github.com/${repository.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="context-repo-link"
                  title="View repository on GitHub"
                >
                  <span className="repo-icon">📁</span>
                  <span className="context-repo">{repository.name}</span>
                  <span className="external-link">↗</span>
                </a>
                {selectedBranch && (
                  <span className="branch-info">
                    <code className="branch-display">{selectedBranch}</code>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="header-right">
          {profile && (
            <>
              <img 
                src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
                alt="Profile" 
                className="context-avatar" 
              />
              <span className="context-owner">@{profile.login}</span>
            </>
          )}
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
        </div>
      </div>

      <div className="view-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToDashboard} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Decision Support Logic</span>
        </div>

        <div className="view-main">
          <div className="view-intro">
            <h2>🎯 Decision Support Logic</h2>
            <p>
              Explore decision variables and tables that encode clinical logic for 
              {repository ? ` ${repository.name}` : ' this DAK'}. 
              All content is publicly accessible and designed for transparency in digital health implementation.
            </p>
          </div>

          {/* Variables Section */}
          <div className="section variables-section">
            <div className="section-header">
              <h3>📊 Variables</h3>
              <p>Decision variables and their CQL implementations from the DAK.DT code system</p>
            </div>

            <div className="variables-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="results-count">
                {filteredVariables.length} variable{filteredVariables.length !== 1 ? 's' : ''} found
              </div>
            </div>

            <div className="variables-table-container">
              <table className="variables-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('Code')} className="sortable">
                      Code {sortField === 'Code' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleSort('Display')} className="sortable">
                      Display {sortField === 'Display' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleSort('Definition')} className="sortable">
                      Definition {sortField === 'Definition' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleSort('table')} className="sortable">
                      Table {sortField === 'table' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleSort('tab')} className="sortable">
                      Tab {sortField === 'tab' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th>CQL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariables.map((variable, index) => (
                    <tr key={index}>
                      <td><code className="variable-code">{variable.Code}</code></td>
                      <td><strong>{variable.Display}</strong></td>
                      <td>{variable.Definition}</td>
                      <td><span className="table-tag">{variable.table}</span></td>
                      <td><span className="tab-tag">{variable.tab}</span></td>
                      <td>
                        {variable.CQL && (
                          <pre className="cql-code"><code>{variable.CQL}</code></pre>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredVariables.length === 0 && (
                <div className="no-results">
                  <p>No variables match your search criteria.</p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="clear-search-btn"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Decision Tables Section */}
          <div className="section decision-tables-section">
            <div className="section-header">
              <h3>📋 Decision Tables</h3>
              <p>DMN decision tables that implement clinical decision logic</p>
            </div>

            <div className="decision-tables-grid">
              {decisionTables.map((table, index) => (
                <div key={index} className="decision-table-card">
                  <div className="table-header">
                    <h4>{table.basename}</h4>
                    <div className="table-meta">
                      <span className="file-size">{Math.round(table.size / 1024)}KB</span>
                      <span className="file-type">DMN</span>
                    </div>
                  </div>
                  
                  <div className="table-actions">
                    <button
                      onClick={() => openSourceDialog(table)}
                      className="action-btn secondary"
                      title="View DMN source"
                    >
                      📄 View Source
                    </button>
                    
                    <a
                      href={table.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn secondary"
                      title="View on GitHub"
                    >
                      🔗 GitHub
                    </a>
                    
                    {table.htmlFile && (
                      <a
                        href={`https://github.com/${repository.owner?.login || repository.full_name.split('/')[0]}/${repository.name}/blob/${selectedBranch}/${table.htmlFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn primary"
                        title="View HTML rendering"
                      >
                        🌐 View HTML
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {decisionTables.length === 0 && (
              <div className="no-tables">
                <p>No decision tables found in the input/decision-logic directory.</p>
                <p>Decision tables should be stored as .dmn files in the repository's input/decision-logic/ directory.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Source Dialog */}
      {selectedDialog && (
        <div className="dialog-overlay" onClick={() => setSelectedDialog(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>{selectedDialog.title}</h3>
              <button 
                className="dialog-close"
                onClick={() => setSelectedDialog(null)}
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <pre className="source-content">
                <code>{selectedDialog.content}</code>
              </pre>
            </div>
            <div className="dialog-actions">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedDialog.content);
                }}
                className="action-btn secondary"
              >
                📋 Copy
              </button>
              <button
                onClick={() => setSelectedDialog(null)}
                className="action-btn primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionSupportLogicView;