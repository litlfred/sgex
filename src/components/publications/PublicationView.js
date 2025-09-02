import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout, useDAKParams } from '../framework';
import githubService from '../../services/githubService';
import './PublicationView.css';

/**
 * Generic Publication View Component
 * 
 * This component provides a reusable publication wrapper that can render
 * any DAK component in publication mode with print-optimized styling.
 * 
 * Features:
 * - Print-optimized CSS for browser print-to-PDF
 * - Page header and footer for professional appearance
 * - Viewport-based BPMN diagram pagination
 * - Responsive layout that works across different formats
 */
const PublicationView = ({ 
  componentType, 
  renderFunction, 
  title, 
  printMode = false 
}) => {
  const location = useLocation();
  const frameworkData = useDAKParams();
  const { user, repo, branch } = useParams();
  
  // Get data from framework params or location state
  const profile = frameworkData?.profile || location.state?.profile;
  const repository = frameworkData?.repository || location.state?.repository;
  const selectedBranch = frameworkData?.branch || branch || location.state?.selectedBranch;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dakData, setDakData] = useState(null);
  const [publicationMeta, setPublicationMeta] = useState(null);

  useEffect(() => {
    const loadPublicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!profile || !repository) {
          throw new Error('Missing required profile or repository information');
        }

        // Load repository metadata
        const owner = repository.owner?.login || repository.full_name?.split('/')[0];
        const repoName = repository.name;

        // Get repository info and sushi config for DAK metadata
        const [repoInfo, sushiConfig] = await Promise.allSettled([
          githubService.getRepository(owner, repoName),
          githubService.getFileContent(owner, repoName, 'sushi-config.yaml', selectedBranch)
        ]);

        // Set publication metadata
        setPublicationMeta({
          repository: repoInfo.status === 'fulfilled' ? repoInfo.value : repository,
          owner,
          repoName,
          branch: selectedBranch,
          sushiConfig: sushiConfig.status === 'fulfilled' ? sushiConfig.value : null,
          generatedAt: new Date().toISOString(),
          component: componentType
        });

        // Load component-specific data based on componentType
        let componentData = null;
        switch (componentType) {
          case 'business-processes':
            componentData = await loadBusinessProcessData(owner, repoName, selectedBranch);
            break;
          case 'decision-support':
            componentData = await loadDecisionSupportData(owner, repoName, selectedBranch);
            break;
          case 'core-data-dictionary':
            componentData = await loadCoreDataData(owner, repoName, selectedBranch);
            break;
          case 'testing':
            componentData = await loadTestingData(owner, repoName, selectedBranch);
            break;
          case 'actors':
            componentData = await loadActorData(owner, repoName, selectedBranch);
            break;
          default:
            componentData = { message: 'Component type not yet implemented' };
        }

        setDakData(componentData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading publication data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadPublicationData();
  }, [profile, repository, selectedBranch, componentType]);

  // Component-specific data loading functions
  const loadBusinessProcessData = async (owner, repoName, branch) => {
    try {
      const inputDir = await githubService.getDirectoryContents(owner, repoName, 'input', branch);
      const bpmnFiles = inputDir
        .filter(file => file.name.endsWith('.bpmn'))
        .slice(0, 5); // Limit for demo

      const bpmnData = [];
      for (const file of bpmnFiles) {
        try {
          const content = await githubService.getFileContent(owner, repoName, file.path, branch);
          bpmnData.push({
            name: file.name,
            path: file.path,
            content: content
          });
        } catch (err) {
          console.warn(`Failed to load BPMN file ${file.path}:`, err);
        }
      }

      return { bpmnFiles: bpmnData };
    } catch (err) {
      console.warn('Error loading business process data:', err);
      return { bpmnFiles: [] };
    }
  };

  const loadDecisionSupportData = async (owner, repoName, branch) => {
    try {
      const inputDir = await githubService.getDirectoryContents(owner, repoName, 'input', branch);
      const dmnFiles = inputDir
        .filter(file => file.name.endsWith('.dmn'))
        .slice(0, 5); // Limit for demo

      return { dmnFiles: dmnFiles.map(f => ({ name: f.name, path: f.path })) };
    } catch (err) {
      return { dmnFiles: [] };
    }
  };

  const loadCoreDataData = async (owner, repoName, branch) => {
    try {
      const profilesDir = await githubService.getDirectoryContents(
        owner, repoName, 'input/profiles', branch
      );
      const profiles = profilesDir
        .filter(file => file.name.endsWith('.json'))
        .slice(0, 10); // Limit for demo

      return { profiles: profiles.map(f => ({ name: f.name, path: f.path })) };
    } catch (err) {
      return { profiles: [] };
    }
  };

  const loadTestingData = async (owner, repoName, branch) => {
    try {
      const testsDir = await githubService.getDirectoryContents(
        owner, repoName, 'input/tests', branch
      );
      const testFiles = testsDir
        .filter(file => file.name.endsWith('.feature') || file.name.endsWith('.json'))
        .slice(0, 10);

      return { testFiles: testFiles.map(f => ({ name: f.name, path: f.path })) };
    } catch (err) {
      return { testFiles: [] };
    }
  };

  const loadActorData = async (owner, repoName, branch) => {
    try {
      const actorsDir = await githubService.getDirectoryContents(
        owner, repoName, 'input/actors', branch
      );
      const actorFiles = actorsDir
        .filter(file => file.name.endsWith('.json'))
        .slice(0, 10);

      return { actorFiles: actorFiles.map(f => ({ name: f.name, path: f.path })) };
    } catch (err) {
      return { actorFiles: [] };
    }
  };

  if (loading) {
    return (
      <PageLayout pageName={`${componentType}-publication`}>
        <div className="publication-loading">
          <div className="loading-content">
            <h3>Loading Publication...</h3>
            <p>Preparing {title} for publication view...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName={`${componentType}-publication`}>
        <div className="publication-error">
          <div className="error-content">
            <h3>Error Loading Publication</h3>
            <p>{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName={`${componentType}-publication`}>
      <div className={`publication-container ${printMode ? 'print-mode' : ''}`}>
        {/* Publication Header */}
        <div className="publication-header">
          <div className="publication-title">
            <h1>{title}</h1>
            <h2>{publicationMeta?.repository?.description || 'WHO SMART Guidelines DAK'}</h2>
          </div>
          
          <div className="publication-meta">
            <div className="meta-item">
              <strong>Repository:</strong> {publicationMeta?.owner}/{publicationMeta?.repoName}
            </div>
            <div className="meta-item">
              <strong>Branch:</strong> {publicationMeta?.branch}
            </div>
            <div className="meta-item">
              <strong>Generated:</strong> {new Date(publicationMeta?.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Publication Content */}
        <div className="publication-content">
          {renderFunction && renderFunction(dakData, publicationMeta)}
        </div>

        {/* Publication Footer */}
        <div className="publication-footer">
          <div className="footer-content">
            <p>Generated by SGeX Workbench - WHO SMART Guidelines Exchange</p>
            <p>Component: {componentType} | Repository: {publicationMeta?.owner}/{publicationMeta?.repoName} | Branch: {publicationMeta?.branch}</p>
          </div>
        </div>

        {/* Print Controls */}
        {!printMode && (
          <div className="publication-controls">
            <button 
              className="print-button"
              onClick={() => window.print()}
            >
              🖨️ Print / Save as PDF
            </button>
            <button 
              className="epub-button"
              onClick={() => generateEPUB(dakData, publicationMeta)}
            >
              📚 Generate EPUB
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

/**
 * Generate EPUB format publication (client-side)
 */
const generateEPUB = async (dakData, publicationMeta) => {
  try {
    // This is a placeholder for EPUB generation
    // In a full implementation, this would use epub.js or similar library
    alert('EPUB generation will be implemented in the next phase. Current focus is on HTML publication views.');
  } catch (err) {
    console.error('Error generating EPUB:', err);
    alert('Failed to generate EPUB publication');
  }
};

export default PublicationView;