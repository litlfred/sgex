import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout, useDAKParams } from '../framework';
import githubService from '../../services/githubService';
import './PublicationView.css';

/**
 * User Scenarios Publication Component
 * 
 * Renders user scenarios and use cases for publication:
 * - Narrative descriptions of persona interactions
 * - System usage scenarios in healthcare contexts
 * - User journey documentation
 * - Workflow visualization and interaction patterns
 */
const UserScenariosPublication = () => {
  const location = useLocation();
  const frameworkData = useDAKParams();
  const { user, repo, branch } = useParams();
  
  // Get data from framework params or location state
  const profile = frameworkData?.profile || location.state?.profile;
  const repository = frameworkData?.repository || location.state?.repository;
  const selectedBranch = frameworkData?.branch || branch || location.state?.selectedBranch;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [publicationMeta, setPublicationMeta] = useState(null);

  useEffect(() => {
    const loadScenariosData = async () => {
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
          component: 'user-scenarios'
        });

        // Load user scenarios data
        const scenariosData = await loadUserScenarios(owner, repoName, selectedBranch);
        setScenarios(scenariosData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user scenarios data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadScenariosData();
  }, [profile, repository, selectedBranch]);

  const loadUserScenarios = async (owner, repoName, branch) => {
    try {
      // Try to load from various potential locations for user scenarios
      const locations = ['input/scenarios', 'input/use-cases', 'input/narratives', 'input'];
      
      for (const location of locations) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, location, branch);
          
          // Look for scenario-related files
          const scenarioFiles = dirContents.filter(file => 
            file.name.includes('scenario') || 
            file.name.includes('use-case') ||
            file.name.includes('narrative') ||
            file.name.includes('journey') ||
            file.name.includes('story')
          );
          
          if (scenarioFiles.length > 0) {
            const scenarios = [];
            for (const file of scenarioFiles.slice(0, 10)) {
              try {
                const content = await githubService.getFileContent(owner, repoName, file.path, branch);
                scenarios.push({
                  name: file.name,
                  path: file.path,
                  content: content,
                  type: file.name.includes('.json') ? 'JSON' : 
                        file.name.includes('.yaml') || file.name.includes('.yml') ? 'YAML' : 
                        file.name.includes('.md') ? 'Markdown' : 'Text'
                });
              } catch (err) {
                console.warn(`Could not load scenario file ${file.path}:`, err);
              }
            }
            
            if (scenarios.length > 0) {
              return scenarios;
            }
          }
        } catch (err) {
          // Continue to next location
        }
      }

      // Return sample data if no files found
      return getSampleUserScenarios();
    } catch (err) {
      console.warn('Error loading user scenarios:', err);
      return getSampleUserScenarios();
    }
  };

  const getSampleUserScenarios = () => {
    return [
      {
        name: 'Antenatal Care Visit Scenario',
        type: 'Clinical Scenario',
        content: {
          title: 'Routine Antenatal Care Visit',
          personas: ['Pregnant Woman', 'Midwife', 'Community Health Worker'],
          scenario: 'A pregnant woman visits a health facility for her routine antenatal care appointment.',
          steps: [
            'Patient arrives at health facility and registers',
            'Midwife reviews patient history and previous visit records',
            'Physical examination including vital signs and fetal assessment',
            'Laboratory tests ordered if required',
            'Health education and counseling provided',
            'Next appointment scheduled',
            'Visit documentation completed in health record'
          ],
          expected_outcomes: [
            'Patient receives appropriate antenatal care',
            'Visit is properly documented',
            'Follow-up care is scheduled',
            'Patient education needs are addressed'
          ],
          variations: [
            'First visit requiring more comprehensive assessment',
            'Follow-up visit with concerning symptoms',
            'Visit with laboratory result review'
          ]
        }
      },
      {
        name: 'Immunization Campaign Scenario',
        type: 'Public Health Scenario',
        content: {
          title: 'Mass Immunization Campaign',
          personas: ['Program Manager', 'Vaccinator', 'Community Mobilizer', 'Caregiver'],
          scenario: 'Implementation of a mass immunization campaign in a rural district.',
          steps: [
            'Campaign planning and microplanning completed',
            'Community mobilization activities conducted',
            'Vaccination sites established with cold chain management',
            'Target population identified and tracked',
            'Vaccination sessions conducted with safety protocols',
            'Adverse events monitored and managed',
            'Coverage data collected and reported'
          ],
          expected_outcomes: [
            'Target coverage achieved (≥95%)',
            'Zero stock-outs of vaccines',
            'Adverse events properly managed',
            'Accurate coverage data reported'
          ]
        }
      },
      {
        name: 'Clinical Decision Support Scenario',
        type: 'Technology Scenario',
        content: {
          title: 'Point-of-Care Clinical Decision Support',
          personas: ['Clinician', 'Patient', 'System Administrator'],
          scenario: 'A clinician uses digital tools to make clinical decisions during patient care.',
          steps: [
            'Patient presents with symptoms',
            'Clinician enters patient data into digital system',
            'Decision support algorithm provides recommendations',
            'Clinician reviews recommendations and clinical guidelines',
            'Treatment decision made with patient input',
            'Care plan documented and shared',
            'Follow-up monitoring scheduled'
          ],
          expected_outcomes: [
            'Evidence-based care decisions made',
            'Clinical guidelines followed appropriately',
            'Patient safety maintained',
            'Care coordination improved'
          ]
        }
      }
    ];
  };

  if (loading) {
    return (
      <PageLayout pageName="user-scenarios-publication">
        <div className="publication-loading">
          <div className="loading-content">
            <h3>Loading User Scenarios Publication...</h3>
            <p>Preparing user scenarios and interaction narratives...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="user-scenarios-publication">
        <div className="publication-error">
          <div className="error-content">
            <h3>Error Loading User Scenarios Publication</h3>
            <p>{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="user-scenarios-publication">
      <div className="publication-container">
        {/* Publication Header */}
        <div className="publication-header">
          <div className="publication-title">
            <h1>User Scenarios and Use Cases</h1>
            <p className="publication-subtitle">
              Narrative Descriptions of System Interactions and User Journeys
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
              <strong>Component:</strong> User Scenarios ({scenarios.length} scenarios)
            </div>
          </div>
        </div>

        {/* Publication Content */}
        <div className="publication-content">
          <div className="component-overview">
            <h2>Overview</h2>
            <p>
              User scenarios describe how different personas interact with the healthcare system in 
              specific contexts. These narratives provide concrete examples of system usage, 
              user journeys, and interaction patterns that guide implementation and validate 
              system functionality against real-world healthcare workflows.
            </p>
          </div>

          <div className="scenarios-section">
            <h2>User Scenarios and Use Cases</h2>
            
            {scenarios.map((scenario, index) => (
              <div key={index} className="scenario-card">
                <div className="scenario-header">
                  <h3>{scenario.name}</h3>
                  <span className="scenario-type">{scenario.type}</span>
                </div>
                
                <div className="scenario-content">
                  {typeof scenario.content === 'object' ? (
                    <div className="structured-content">
                      {scenario.content.title && (
                        <div className="content-field">
                          <h4>{scenario.content.title}</h4>
                        </div>
                      )}
                      
                      {scenario.content.personas && Array.isArray(scenario.content.personas) && (
                        <div className="content-field">
                          <strong>Personas Involved:</strong>
                          <div className="personas-list">
                            {scenario.content.personas.map((persona, i) => (
                              <span key={i} className="persona-tag">{persona}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {scenario.content.scenario && (
                        <div className="content-field">
                          <strong>Scenario Description:</strong>
                          <p>{scenario.content.scenario}</p>
                        </div>
                      )}
                      
                      {scenario.content.steps && Array.isArray(scenario.content.steps) && (
                        <div className="content-field">
                          <strong>Scenario Steps:</strong>
                          <ol>
                            {scenario.content.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {scenario.content.expected_outcomes && Array.isArray(scenario.content.expected_outcomes) && (
                        <div className="content-field">
                          <strong>Expected Outcomes:</strong>
                          <ul>
                            {scenario.content.expected_outcomes.map((outcome, i) => (
                              <li key={i}>{outcome}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {scenario.content.variations && Array.isArray(scenario.content.variations) && (
                        <div className="content-field">
                          <strong>Scenario Variations:</strong>
                          <ul>
                            {scenario.content.variations.map((variation, i) => (
                              <li key={i}>{variation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {scenario.content.preconditions && (
                        <div className="content-field">
                          <strong>Preconditions:</strong>
                          <p>{scenario.content.preconditions}</p>
                        </div>
                      )}
                      
                      {scenario.content.postconditions && (
                        <div className="content-field">
                          <strong>Postconditions:</strong>
                          <p>{scenario.content.postconditions}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-content">
                      <pre>{scenario.content}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="scenarios-analysis">
            <h2>Scenario Analysis and Patterns</h2>
            <div className="analysis-content">
              <h3>Common Interaction Patterns</h3>
              <p>
                Analysis of user scenarios reveals common interaction patterns that inform 
                system design and implementation:
              </p>
              <ul>
                <li><strong>Data Entry and Validation:</strong> Consistent patterns for capturing and validating clinical data</li>
                <li><strong>Decision Support Integration:</strong> Points where clinical decision support enhances care</li>
                <li><strong>Workflow Coordination:</strong> Handoffs and communication between different personas</li>
                <li><strong>Information Sharing:</strong> Requirements for sharing information across care continuum</li>
              </ul>
              
              <h3>User Journey Insights</h3>
              <p>
                Key insights from user journey analysis:
              </p>
              <ul>
                <li>Critical decision points requiring system support</li>
                <li>Information needs at different stages of care</li>
                <li>Potential failure modes and recovery strategies</li>
                <li>Opportunities for workflow optimization</li>
              </ul>
            </div>
          </div>

          <div className="implementation-guidance">
            <h2>Implementation Guidance</h2>
            <div className="guidance-content">
              <h3>Scenario Validation</h3>
              <p>
                Use these scenarios to validate system implementation:
              </p>
              <ul>
                <li>Test each scenario as an end-to-end workflow</li>
                <li>Verify that all personas can complete their tasks</li>
                <li>Validate expected outcomes are achieved</li>
                <li>Test scenario variations and edge cases</li>
              </ul>
              
              <h3>Training and Change Management</h3>
              <p>
                Scenarios support training and change management:
              </p>
              <ul>
                <li>Use scenarios for user training and orientation</li>
                <li>Develop role-based training materials</li>
                <li>Create simulation exercises based on scenarios</li>
                <li>Monitor real-world performance against scenario expectations</li>
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
              For the most current version of these user scenarios, please refer to the source repository.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserScenariosPublication;