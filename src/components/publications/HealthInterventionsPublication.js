import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout, useDAKParams } from '../framework';
import githubService from '../../services/githubService';
import './PublicationView.css';

/**
 * Health Interventions Publication Component
 * 
 * Renders health interventions and recommendations for publication:
 * - Clinical guidelines and health intervention specifications
 * - Evidence-based care recommendations
 * - References to IRIS Publications
 * - WHO publication references and citations
 */
const HealthInterventionsPublication = () => {
  const location = useLocation();
  const frameworkData = useDAKParams();
  const { branch } = useParams();
  console.log('Health interventions publication branch:', branch); // Keep for debugging
  
  // Get data from framework params or location state
  const profile = frameworkData?.profile || location.state?.profile;
  const repository = frameworkData?.repository || location.state?.repository;
  const selectedBranch = frameworkData?.branch || branch || location.state?.selectedBranch;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [publicationMeta, setPublicationMeta] = useState(null);

  useEffect(() => {
    const loadInterventionsData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!profile || !repository) {
          throw new Error('Missing required profile or repository information');
        }

        const owner = repository.owner?.login || repository.full_name?.split('/')[0];
        const repoName = repository.name;

        // Set publication metadata
        setPublicationMeta({
          repository,
          owner,
          repoName,
          branch: selectedBranch,
          generatedAt: new Date().toISOString(),
          component: 'health-interventions'
        });

        // Load health interventions data
        const interventionsData = await loadHealthInterventions(owner, repoName, selectedBranch);
        setInterventions(interventionsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading health interventions data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadInterventionsData();
  }, [profile, repository, selectedBranch, loadHealthInterventions]);

  const loadHealthInterventions = async (owner, repoName, branch) => {
    try {
      // Try to load from various potential locations for health interventions
      const locations = ['input/interventions', 'input/publications', 'input/iris', 'input'];
      
      for (const location of locations) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, location, branch);
          
          // Look for intervention-related files
          const interventionFiles = dirContents.filter(file => 
            file.name.includes('intervention') || 
            file.name.includes('guideline') ||
            file.name.includes('recommendation') ||
            file.name.includes('iris') ||
            file.name.includes('publication')
          );
          
          if (interventionFiles.length > 0) {
            const interventions = [];
            for (const file of interventionFiles.slice(0, 10)) {
              try {
                const content = await githubService.getFileContent(owner, repoName, file.path, branch);
                interventions.push({
                  name: file.name,
                  path: file.path,
                  content: content,
                  type: file.name.includes('.json') ? 'JSON' : 
                        file.name.includes('.yaml') || file.name.includes('.yml') ? 'YAML' : 'Text'
                });
              } catch (err) {
                console.warn(`Could not load intervention file ${file.path}:`, err);
              }
            }
            
            if (interventions.length > 0) {
              return interventions;
            }
          }
        } catch (err) {
          // Continue to next location
        }
      }

      // Return sample data if no files found
      return getSampleHealthInterventions();
    } catch (err) {
      console.warn('Error loading health interventions:', err);
      return getSampleHealthInterventions();
    }
  };

  const getSampleHealthInterventions = () => {
    return [
      {
        name: 'WHO ANC Guidelines',
        type: 'IRIS Publication',
        content: {
          title: 'WHO recommendations on antenatal care for a positive pregnancy experience',
          iris_id: '9789241549912',
          publication_year: '2016',
          url: 'https://iris.who.int/handle/10665/250796',
          description: 'Evidence-based recommendations for antenatal care to reduce perinatal mortality and morbidity and improve women\'s experience of care.'
        }
      },
      {
        name: 'Immunization Guidelines',
        type: 'Clinical Guideline',
        content: {
          title: 'WHO position papers on vaccines',
          description: 'Comprehensive vaccine recommendations and implementation guidance',
          interventions: [
            'Routine immunization schedules',
            'Catch-up vaccination strategies', 
            'Adverse event management'
          ]
        }
      },
      {
        name: 'Maternal Health Interventions',
        type: 'Care Package',
        content: {
          title: 'Essential interventions for maternal and newborn health',
          interventions: [
            'Skilled birth attendance',
            'Emergency obstetric care',
            'Postnatal care for mother and baby',
            'Family planning counseling'
          ]
        }
      }
    ];
  };

  if (loading) {
    return (
      <PageLayout pageName="health-interventions-publication">
        <div className="publication-loading">
          <div className="loading-content">
            <h3>Loading Health Interventions Publication...</h3>
            <p>Preparing clinical guidelines and intervention specifications...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="health-interventions-publication">
        <div className="publication-error">
          <div className="error-content">
            <h3>Error Loading Health Interventions Publication</h3>
            <p>{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="health-interventions-publication">
      <div className="publication-container">
        {/* Publication Header */}
        <div className="publication-header">
          <div className="publication-title">
            <h1>Health Interventions and Recommendations</h1>
            <p className="publication-subtitle">
              Clinical Guidelines and Evidence-Based Care Recommendations
            </p>
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
            <div className="meta-item">
              <strong>Component:</strong> Health Interventions ({interventions.length} items)
            </div>
          </div>
        </div>

        {/* Publication Content */}
        <div className="publication-content">
          <div className="component-overview">
            <h2>Overview</h2>
            <p>
              This section presents the health interventions and clinical recommendations that form the 
              foundation of evidence-based care within this Digital Adaptation Kit. These interventions 
              are derived from WHO guidelines, clinical practice guidelines, and evidence-based protocols 
              that ensure quality healthcare delivery.
            </p>
          </div>

          <div className="interventions-section">
            <h2>Clinical Guidelines and Interventions</h2>
            
            {interventions.map((intervention, index) => (
              <div key={index} className="intervention-card">
                <div className="intervention-header">
                  <h3>{intervention.name}</h3>
                  <span className="intervention-type">{intervention.type}</span>
                </div>
                
                <div className="intervention-content">
                  {typeof intervention.content === 'object' ? (
                    <div className="structured-content">
                      {intervention.content.title && (
                        <div className="content-field">
                          <strong>Title:</strong> {intervention.content.title}
                        </div>
                      )}
                      
                      {intervention.content.iris_id && (
                        <div className="content-field">
                          <strong>IRIS ID:</strong> {intervention.content.iris_id}
                        </div>
                      )}
                      
                      {intervention.content.publication_year && (
                        <div className="content-field">
                          <strong>Publication Year:</strong> {intervention.content.publication_year}
                        </div>
                      )}
                      
                      {intervention.content.url && (
                        <div className="content-field">
                          <strong>URL:</strong> 
                          <a href={intervention.content.url} target="_blank" rel="noopener noreferrer">
                            {intervention.content.url}
                          </a>
                        </div>
                      )}
                      
                      {intervention.content.description && (
                        <div className="content-field">
                          <strong>Description:</strong>
                          <p>{intervention.content.description}</p>
                        </div>
                      )}
                      
                      {intervention.content.interventions && Array.isArray(intervention.content.interventions) && (
                        <div className="content-field">
                          <strong>Key Interventions:</strong>
                          <ul>
                            {intervention.content.interventions.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-content">
                      <pre>{intervention.content}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="implementation-guidance">
            <h2>Implementation Guidance</h2>
            <div className="guidance-content">
              <h3>Clinical Integration</h3>
              <p>
                These health interventions should be integrated into clinical workflows through:
              </p>
              <ul>
                <li>Training programs for healthcare providers</li>
                <li>Clinical decision support systems</li>
                <li>Quality assurance protocols</li>
                <li>Performance monitoring and evaluation</li>
              </ul>
              
              <h3>Quality Standards</h3>
              <p>
                All interventions must adhere to:
              </p>
              <ul>
                <li>WHO clinical practice guidelines</li>
                <li>Evidence-based medicine principles</li>
                <li>Local regulatory requirements</li>
                <li>Patient safety protocols</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Publication Footer */}
        <div className="publication-footer">
          <div className="footer-content">
            <p>
              This publication was generated from the DAK repository at {publicationMeta?.owner}/{publicationMeta?.repoName} 
              on {new Date(publicationMeta?.generatedAt).toLocaleDateString()}.
            </p>
            <p>
              For the most current version of these health interventions, please refer to the source repository.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HealthInterventionsPublication;