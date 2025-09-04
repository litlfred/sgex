import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import StagingGround from './StagingGround';
import { constructFullUrl } from '../utils/navigationUtils';

const Publications = ({ profile, repository, selectedBranch, hasWriteAccess }) => {
  const [branches, setBranches] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [workflowRuns, setWorkflowRuns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;

  useEffect(() => {
    const fetchPublicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Handle demo mode - provide mock data
        if (profile?.isDemo) {
          const mockBranches = [
            { name: 'main', commit: { sha: 'abc123' } },
            { name: 'feature/updates', commit: { sha: 'def456' } },
            { name: 'dev', commit: { sha: 'ghi789' } }
          ];
          setBranches(mockBranches);

          const mockWorkflows = [
            { id: 'pages-build', name: 'Deploy to GitHub Pages', triggers: ['push', 'manual'] }
          ];
          setWorkflows(mockWorkflows);

          // Mock workflow runs
          const mockWorkflowRuns = {
            'main': { 
              status: 'completed', 
              conclusion: 'success', 
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/123456`,
              updated_at: new Date().toISOString()
            },
            'feature/updates': { 
              status: 'completed', 
              conclusion: 'action_required', 
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/123457`,
              updated_at: new Date().toISOString()
            },
            'dev': { 
              status: 'completed', 
              conclusion: 'failure', 
              html_url: `https://github.com/${owner}/${repoName}/actions/runs/123458`,
              updated_at: new Date().toISOString()
            }
          };
          setWorkflowRuns(mockWorkflowRuns);
          setLoading(false);
          return;
        }

        // Fetch branches (excluding gh-pages)
        const branchesData = await githubService.getBranches(owner, repoName);
        const filteredBranches = branchesData.filter(branch => branch.name !== 'gh-pages');
        setBranches(filteredBranches);

        // Fetch workflows to find ghbuild workflow
        const workflowsData = await githubService.getWorkflows(owner, repoName);
        setWorkflows(workflowsData);

        // Find the ghbuild workflow (look for workflow with 'build' or 'publish' in name)
        const ghbuildWorkflow = workflowsData.find(workflow => 
          workflow.name.toLowerCase().includes('build') || 
          workflow.name.toLowerCase().includes('publish') ||
          workflow.name.toLowerCase().includes('pages')
        );

        // Fetch recent workflow runs for each branch if ghbuild workflow exists and has valid ID
        if (ghbuildWorkflow && ghbuildWorkflow.id) {
          const runsByBranch = {};
          for (const branch of filteredBranches) {
            try {
              const runs = await githubService.getWorkflowRunsForWorkflow(
                owner, 
                repoName, 
                ghbuildWorkflow.id,
                { branch: branch.name, per_page: 1 }
              );
              if (runs.length > 0) {
                runsByBranch[branch.name] = runs[0];
              }
            } catch (err) {
              console.warn(`Could not fetch workflow runs for branch ${branch.name}:`, err);
            }
          }
          setWorkflowRuns(runsByBranch);
        } else if (ghbuildWorkflow && !ghbuildWorkflow.id) {
          console.warn('Found workflow but missing ID:', ghbuildWorkflow);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching publication data:', err);
        setError('Failed to load publication data');
        setLoading(false);
      }
    };

    fetchPublicationData();
  }, [owner, repoName, profile?.isDemo]);

  const getPublicationUrl = (branchName) => {
    if (branchName === repository.default_branch || branchName === 'main') {
      return `https://${owner}.github.io/${repoName}/`;
    } else {
      return `https://${owner}.github.io/${repoName}/branches/${branchName}/`;
    }
  };

  const getWorkflowStatusIcon = (branchName) => {
    const run = workflowRuns[branchName];
    if (!run) return { icon: '⚪', title: 'No recent workflow runs', link: null };

    const status = run.status;
    const conclusion = run.conclusion;

    if (status === 'in_progress' || status === 'queued') {
      return { 
        icon: '🔄', 
        title: 'Workflow running', 
        link: run.html_url,
        className: 'running' 
      };
    } else if (conclusion === 'success') {
      return { 
        icon: '✅', 
        title: 'Last build successful', 
        link: run.html_url,
        className: 'success' 
      };
    } else if (conclusion === 'failure') {
      return { 
        icon: '❌', 
        title: 'Last build failed', 
        link: run.html_url,
        className: 'failure' 
      };
    } else if (conclusion === 'action_required') {
      return { 
        icon: '⏳', 
        title: 'Workflow requires approval', 
        link: run.html_url,
        className: 'approval-required' 
      };
    } else {
      return { 
        icon: '⚠️', 
        title: `Build ${conclusion || status}`, 
        link: run.html_url,
        className: 'warning' 
      };
    }
  };

  const handleRestartWorkflow = async (branchName) => {
    // Handle demo mode
    if (profile?.isDemo) {
      alert(`Demo Mode: Workflow restart simulated for branch: ${branchName}`);
      return;
    }

    const ghbuildWorkflow = workflows.find(workflow => 
      workflow.name.toLowerCase().includes('build') || 
      workflow.name.toLowerCase().includes('publish') ||
      workflow.name.toLowerCase().includes('pages')
    );

    if (!ghbuildWorkflow) {
      alert('No suitable workflow found to restart');
      return;
    }

    if (!ghbuildWorkflow.id) {
      alert('Workflow found but missing ID - cannot restart');
      console.warn('Workflow missing ID:', ghbuildWorkflow);
      return;
    }

    try {
      await githubService.triggerWorkflow(owner, repoName, ghbuildWorkflow.id, branchName);
      alert(`Workflow restarted for branch: ${branchName}`);
      
      // Refresh workflow runs after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error restarting workflow:', err);
      alert('Failed to restart workflow. Please check your permissions.');
    }
  };

  if (loading) {
    return (
      <div className="publications-loading">
        <div className="loading-content">
          <h3>Loading Publications...</h3>
          <p>Fetching branch and workflow information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="publications-error">
        <div className="error-content">
          <h3>Error Loading Publications</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="publications-section">
      {/* Comprehensive Publication Section */}
      <div className="comprehensive-publication-section">
        <div className="section-header">
          <h3 className="section-title">📚 Complete DAK Publication</h3>
          <p className="section-description">
            Generate a comprehensive publication containing all DAK components in a single document 
            suitable for stakeholder review and distribution.
          </p>
        </div>
        
        <div className="comprehensive-publication-card">
          <div className="publication-header">
            <div className="publication-info">
              <span className="publication-icon">📖</span>
              <div className="publication-details">
                <h4>All Components Publication</h4>
                <p>Complete DAK documentation with all 8 core components</p>
              </div>
            </div>
          </div>
          
          <div className="publication-actions">
            <a 
              href={constructFullUrl(`/publications-all-components/${owner}/${repoName}/${selectedBranch}`)}
              className="comprehensive-publication-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 HTML View
            </a>
            <button 
              className="comprehensive-publication-btn epub-btn"
              onClick={() => generateEPUBPublication('all-components', owner, repoName, selectedBranch)}
            >
              📚 EPUB Download
            </button>
          </div>
        </div>
      </div>
      
      {/* Individual Component Publications Section */}
      <div className="individual-publications-section">
        <div className="section-header">
          <h3 className="section-title">📑 Individual Component Publications</h3>
          <p className="section-description">
            Access publication views for individual DAK components. Each component can be 
            reviewed and printed separately for focused stakeholder discussions.
          </p>
        </div>
        
        <div className="component-publications-grid">
          {[
            { id: 'business-processes', name: 'Business Processes', icon: '🔄', description: 'BPMN workflows and care pathways' },
            { id: 'decision-support', name: 'Decision Support', icon: '🧠', description: 'DMN decision tables and clinical logic' },
            { id: 'core-data-dictionary', name: 'Core Data Dictionary', icon: '📊', description: 'FHIR profiles and data specifications' },
            { id: 'actors', name: 'User Personas', icon: '👥', description: 'User roles and system actors' },
            { id: 'questionnaires', name: 'Data Forms', icon: '📝', description: 'Questionnaires and data entry forms' },
            { id: 'terminology', name: 'Terminology', icon: '📚', description: 'Value sets and code systems' },
            { id: 'indicators', name: 'Indicators', icon: '📈', description: 'Performance measures and KPIs' },
            { id: 'testing', name: 'Testing', icon: '🧪', description: 'Test scenarios and validation' }
          ].map((component) => (
            <div key={component.id} className="component-publication-card">
              <div className="component-header">
                <span className="component-icon">{component.icon}</span>
                <div className="component-info">
                  <h5>{component.name}</h5>
                  <p>{component.description}</p>
                </div>
              </div>
              <div className="component-actions">
                <a 
                  href={constructFullUrl(`/publications-${component.id}/${owner}/${repoName}/${selectedBranch}`)}
                  className="component-publication-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 HTML View
                </a>
                <button 
                  className="component-publication-btn epub-btn"
                  onClick={() => generateEPUBPublication(component.id, owner, repoName, selectedBranch)}
                >
                  📚 EPUB Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staging Ground Section */}
      <StagingGround
        repository={repository}
        selectedBranch={selectedBranch}
        hasWriteAccess={hasWriteAccess}
        profile={profile}
      />
      
      <div className="section-header">
        <h3 className="section-title">🚀 Published DAK Artifacts</h3>
        <p className="section-description">
          Access published Implementation Guide content for this DAK repository. Each branch is published 
          automatically via GitHub Actions to GitHub Pages.
        </p>
      </div>

      <div className="publications-grid">
        {branches.map((branch) => {
          const isMainBranch = branch.name === repository.default_branch || branch.name === 'main';
          const publicationUrl = getPublicationUrl(branch.name);
          const workflowStatus = getWorkflowStatusIcon(branch.name);

          return (
            <div key={branch.name} className={`publication-card ${isMainBranch ? 'main-branch' : ''}`}>
              <div className="publication-header">
                <div className="branch-info">
                  <span className="branch-icon">🌿</span>
                  <span className="branch-name">{branch.name}</span>
                  {isMainBranch && <span className="main-badge">MAIN</span>}
                </div>
                <div className="workflow-status">
                  {workflowStatus.link ? (
                    <a 
                      href={workflowStatus.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`status-icon ${workflowStatus.className || ''}`}
                      title={workflowStatus.title}
                    >
                      {workflowStatus.icon}
                    </a>
                  ) : (
                    <span 
                      className={`status-icon ${workflowStatus.className || ''}`}
                      title={workflowStatus.title}
                    >
                      {workflowStatus.icon}
                    </span>
                  )}
                </div>
              </div>

              <div className="publication-content">
                <div className="publication-url">
                  <label>Published at:</label>
                  <a 
                    href={publicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="publication-link"
                  >
                    {publicationUrl}
                    <span className="external-link">↗</span>
                  </a>
                </div>

                <div className="publication-actions">
                  <button
                    className="restart-workflow-btn"
                    onClick={() => handleRestartWorkflow(branch.name)}
                    disabled={!hasWriteAccess}
                    title={hasWriteAccess ? 'Restart build workflow for this branch' : 'Write permissions required'}
                  >
                    🔄 Rebuild
                  </button>
                  
                  <a 
                    href={`https://github.com/${owner}/${repoName}/tree/${branch.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-source-btn"
                    title="View source code for this branch"
                  >
                    👁️ View Source
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {branches.length === 0 && (
        <div className="no-branches">
          <p>No publishable branches found (excluding gh-pages).</p>
        </div>
      )}
    </div>
  );
};

/**
 * Generate EPUB publication for a DAK component
 */
const generateEPUBPublication = async (componentType, owner, repoName, branch) => {
  try {
    // For now, create a simple EPUB-like package with HTML content
    // This is a client-side implementation that doesn't require server dependencies
    
    const publicationUrl = constructFullUrl(`/publications-${componentType}/${owner}/${repoName}/${branch}`);
    
    // Open the HTML publication in a new window for now
    // In the future, this could be enhanced with proper EPUB generation using libraries like epub-gen
    const newWindow = window.open(publicationUrl, '_blank');
    
    if (newWindow) {
      // Give the page time to load, then trigger a download simulation
      setTimeout(() => {
        try {
          // Create a simple alert for now - this will be enhanced with proper EPUB generation
          alert(`EPUB generation initiated for ${componentType}.\n\nNote: Currently opening HTML view. Full EPUB generation with offline reading capability will be implemented in the next phase.\n\nFor now, you can use your browser's "Save As" or "Print to PDF" functionality.`);
        } catch (err) {
          console.warn('Could not show EPUB info:', err);
        }
      }, 1000);
    } else {
      alert('Please allow popups for EPUB generation to work properly.');
    }
    
  } catch (err) {
    console.error('Error generating EPUB publication:', err);
    alert('Failed to generate EPUB publication. Please try again.');
  }
};

export default Publications;