import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout, useDAKParams } from '../framework';
import githubService from '../../services/githubService';
import './PublicationView.css';

// Individual publication components will be imported dynamically as needed

/**
 * Comprehensive All Components Publication
 * 
 * Renders ALL DAK components in a single, comprehensive publication document:
 * - Executive summary and overview
 * - All 9 core DAK components in structured sections
 * - Table of contents with page references
 * - Professional publication styling for stakeholder review
 * - Print-optimized for PDF generation
 */
const AllComponentsPublication = () => {
  const location = useLocation();
  const frameworkData = useDAKParams();
  const { branch } = useParams();
  console.log('Publication branch:', branch); // Keep for debugging comprehensive publication loading
  
  // Get data from framework params or location state
  const profile = frameworkData?.profile || location.state?.profile;
  const repository = frameworkData?.repository || location.state?.repository;
  const selectedBranch = frameworkData?.branch || branch || location.state?.selectedBranch;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dakData, setDakData] = useState(null);
  const [publicationMeta, setPublicationMeta] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    const loadComprehensiveData = async () => {
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
          component: 'all-components'
        });

        // Load comprehensive data for all components
        const componentData = await loadAllComponentsData(owner, repoName, selectedBranch);
        setDakData(componentData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading comprehensive publication data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadComprehensiveData();
  }, [profile, repository, selectedBranch]);

  // Load data for all DAK components
  const loadAllComponentsData = async (owner, repoName, branch) => {
    try {
      const inputDir = await githubService.getDirectoryContents(owner, repoName, 'input', branch);
      
      // Load business processes (BPMN files)
      const bpmnFiles = inputDir
        .filter(file => file.name.endsWith('.bpmn'))
        .slice(0, 5);
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

      // Load decision support (DMN files)
      const dmnFiles = inputDir
        .filter(file => file.name.endsWith('.dmn'))
        .slice(0, 5);

      // Load FHIR profiles
      let profiles = [];
      try {
        const profilesDir = await githubService.getDirectoryContents(
          owner, repoName, 'input/profiles', branch
        );
        profiles = profilesDir
          .filter(file => file.name.endsWith('.json'))
          .slice(0, 10);
      } catch (err) {
        console.warn('No profiles directory found');
      }

      // Load test scenarios
      let testFiles = [];
      try {
        const testsDir = await githubService.getDirectoryContents(
          owner, repoName, 'input/tests', branch
        );
        testFiles = testsDir
          .filter(file => file.name.endsWith('.feature') || file.name.endsWith('.json'))
          .slice(0, 10);
      } catch (err) {
        console.warn('No tests directory found');
      }

      // Load actors/personas
      let actorFiles = [];
      try {
        const actorsDir = await githubService.getDirectoryContents(
          owner, repoName, 'input/actors', branch
        );
        actorFiles = actorsDir
          .filter(file => file.name.endsWith('.json'))
          .slice(0, 10);
      } catch (err) {
        console.warn('No actors directory found');
      }

      return {
        bpmnFiles: bpmnData,
        dmnFiles: dmnFiles.map(f => ({ name: f.name, path: f.path })),
        profiles: profiles.map(f => ({ name: f.name, path: f.path })),
        testFiles: testFiles.map(f => ({ name: f.name, path: f.path })),
        actorFiles: actorFiles.map(f => ({ name: f.name, path: f.path })),
        // Mock data for components not yet implemented in repository scanning
        indicators: [
          {
            name: "Coverage Indicator",
            description: "Percentage of target population receiving interventions",
            calculation: "Numerator / Denominator * 100",
            frequency: "Monthly"
          }
        ],
        questionnaires: [
          {
            name: "Patient Registration Form",
            description: "Initial patient enrollment questionnaire",
            questionCount: 15,
            file: "input/questionnaires/registration.json"
          }
        ],
        terminology: {
          valueSets: [
            {
              name: "Clinical Conditions",
              description: "Value set for clinical conditions",
              conceptCount: 25,
              url: "http://example.org/ValueSet/clinical-conditions"
            }
          ],
          codeSystems: [
            {
              name: "Local Codes",
              description: "Custom code system for local concepts",
              conceptCount: 10,
              url: "http://example.org/CodeSystem/local-codes"
            }
          ]
        }
      };
    } catch (err) {
      console.warn('Error loading component data:', err);
      return {
        bpmnFiles: [],
        dmnFiles: [],
        profiles: [],
        testFiles: [],
        actorFiles: [],
        indicators: [],
        questionnaires: [],
        terminology: { valueSets: [], codeSystems: [] }
      };
    }
  };

  if (loading) {
    return (
      <PageLayout pageName="all-components-publication">
        <div className="publication-loading">
          <div className="loading-content">
            <h3>Loading Comprehensive Publication...</h3>
            <p>Preparing complete DAK documentation for publication view...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="all-components-publication">
        <div className="publication-error">
          <div className="error-content">
            <h3>Error Loading Comprehensive Publication</h3>
            <p>{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const generateTableOfContents = () => {
    return (
      <div className="table-of-contents">
        <h2>Table of Contents</h2>
        <div className="toc-entries">
          <div className="toc-entry">
            <span className="toc-title">1. Executive Summary</span>
            <span className="toc-page">3</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">2. Health Interventions and Recommendations</span>
            <span className="toc-page">5</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">3. User Scenarios and Use Cases</span>
            <span className="toc-page">10</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">4. Business Processes and Workflows</span>
            <span className="toc-page">15</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">5. Decision Support Logic</span>
            <span className="toc-page">22</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">6. Core Data Dictionary</span>
            <span className="toc-page">28</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">7. User Personas and Roles</span>
            <span className="toc-page">35</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">8. Data Entry Forms and Questionnaires</span>
            <span className="toc-page">40</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">9. Terminology and Value Sets</span>
            <span className="toc-page">45</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">10. Indicators and Performance Measures</span>
            <span className="toc-page">52</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">11. Functional and Non-Functional Requirements</span>
            <span className="toc-page">58</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">12. Testing and Validation</span>
            <span className="toc-page">65</span>
          </div>
          <div className="toc-entry">
            <span className="toc-title">13. Implementation Guidance</span>
            <span className="toc-page">72</span>
          </div>
        </div>
      </div>
    );
  };

  const generateExecutiveSummary = () => {
    return (
      <div className="executive-summary">
        <h2>Executive Summary</h2>
        <div className="summary-content">
          <h3>Digital Adaptation Kit Overview</h3>
          <p>
            This Digital Adaptation Kit (DAK) provides a comprehensive, standards-based implementation 
            package for {publicationMeta?.repository?.description || 'healthcare delivery'} based on 
            WHO SMART Guidelines. The DAK includes all necessary components for digital health 
            implementation across diverse healthcare settings.
          </p>

          <h3>Key Components</h3>
          <div className="components-overview">
            <div className="component-summary">
              <h4>Health Interventions and Recommendations</h4>
              <p>Clinical guidelines and evidence-based care recommendations from WHO and other authoritative sources.</p>
            </div>
            
            <div className="component-summary">
              <h4>User Scenarios and Use Cases</h4>
              <p>Narrative descriptions of how different personas interact with the healthcare system in specific contexts.</p>
            </div>
            
            <div className="component-summary">
              <h4>Business Processes ({dakData?.bpmnFiles?.length || 0} workflows)</h4>
              <p>BPMN diagrams defining healthcare delivery workflows and care pathways.</p>
            </div>
            
            <div className="component-summary">
              <h4>Decision Support ({dakData?.dmnFiles?.length || 0} decision tables)</h4>
              <p>Clinical decision support logic using DMN for automated care recommendations.</p>
            </div>
            
            <div className="component-summary">
              <h4>Core Data Dictionary ({dakData?.profiles?.length || 0} profiles)</h4>
              <p>FHIR-based data specifications ensuring interoperability and standards compliance.</p>
            </div>
            
            <div className="component-summary">
              <h4>User Personas ({dakData?.actorFiles?.length || 0} personas)</h4>
              <p>Definitions of system users and their roles in healthcare delivery.</p>
            </div>
            
            <div className="component-summary">
              <h4>Data Collection Forms ({dakData?.questionnaires?.length || 0} questionnaires)</h4>
              <p>Structured questionnaires for consistent data collection across implementations.</p>
            </div>
            
            <div className="component-summary">
              <h4>Terminology ({dakData?.terminology?.valueSets?.length || 0} value sets)</h4>
              <p>Standardized terminology ensuring semantic interoperability.</p>
            </div>
            
            <div className="component-summary">
              <h4>Performance Indicators ({dakData?.indicators?.length || 0} indicators)</h4>
              <p>Metrics for monitoring and evaluating implementation effectiveness.</p>
            </div>
            
            <div className="component-summary">
              <h4>Functional and Non-Functional Requirements</h4>
              <p>System requirements specifications defining capabilities, constraints, and quality characteristics.</p>
            </div>
            
            <div className="component-summary">
              <h4>Testing Framework ({dakData?.testFiles?.length || 0} test scenarios)</h4>
              <p>Validation scenarios ensuring correct implementation and operation.</p>
            </div>
          </div>

          <h3>Implementation Readiness</h3>
          <p>
            This DAK is designed for immediate implementation in digital health systems, 
            with all components following international standards and WHO guidelines. 
            The package supports diverse implementation contexts while maintaining 
            consistency and interoperability.
          </p>
        </div>
      </div>
    );
  };

  return (
    <PageLayout pageName="all-components-publication">
      <div className={`publication-container comprehensive ${showPrintView ? 'print-mode' : ''}`}>
        {/* Publication Title Page */}
        <div className="publication-title-page">
          <div className="title-content">
            <h1>Digital Adaptation Kit</h1>
            <h2>Complete Implementation Package</h2>
            <h3>{publicationMeta?.repository?.description || 'WHO SMART Guidelines DAK'}</h3>
            
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
                <strong>Version:</strong> Comprehensive Publication v1.0
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="publication-page">
          {generateTableOfContents()}
        </div>

        {/* Executive Summary */}
        <div className="publication-page">
          {generateExecutiveSummary()}
        </div>

        {/* Component Sections */}
        <div className="component-sections">
          
          {/* 1. Health Interventions and Recommendations */}
          <div className="publication-section" id="health-interventions">
            <div className="section-header">
              <h2>2. Health Interventions and Recommendations</h2>
            </div>
            <div className="component-content">
              <h3>Clinical Guidelines and Evidence-Based Recommendations</h3>
              <p>
                This section contains health interventions and recommendations derived from WHO guidelines, 
                clinical practice guidelines, and evidence-based protocols that ensure quality healthcare delivery.
              </p>
              <p>
                <em>Note: Health interventions are typically referenced through IRIS (WHO's Institutional Repository 
                for Information Sharing) and other authoritative publication sources.</em>
              </p>
            </div>
          </div>

          {/* 2. User Scenarios and Use Cases */}
          <div className="publication-section" id="user-scenarios">
            <div className="section-header">
              <h2>3. User Scenarios and Use Cases</h2>
            </div>
            <div className="component-content">
              <h3>System Interaction Narratives</h3>
              <p>
                This section describes how different personas interact with the healthcare system in 
                specific contexts, providing concrete examples of system usage and user journeys.
              </p>
              <p>
                <em>Note: User scenarios help validate system functionality against real-world healthcare workflows 
                and guide implementation planning.</em>
              </p>
            </div>
          </div>

          {/* 3. Business Processes and Workflows */}
          <div className="publication-section" id="business-processes">
            <div className="section-header">
              <h2>4. Business Processes and Workflows</h2>
            </div>
            <div className="component-content">
              <h3>Business Processes and Workflows</h3>
              <p>
                This section contains BPMN (Business Process Model and Notation) diagrams that define 
                the clinical workflows and business processes for this Digital Adaptation Kit.
              </p>
              
              {dakData?.bpmnFiles && dakData.bpmnFiles.length > 0 ? (
                <div className="bpmn-content">
                  {dakData.bpmnFiles.map((bpmnFile, index) => (
                    <div key={index} className="bpmn-diagram-summary">
                      <h4>{bpmnFile.name}</h4>
                      <p>BPMN workflow diagram defining healthcare delivery processes.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{bpmnFile.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No BPMN files found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Decision Support Logic */}
          <div className="publication-section" id="decision-support">
            <div className="section-header">
              <h2>5. Decision Support Logic</h2>
            </div>
            <div className="component-content">
              <h3>Clinical Decision Support Logic</h3>
              <p>
                This section contains DMN decision tables that provide automated clinical decision support 
                for healthcare providers implementing this Digital Adaptation Kit.
              </p>
              
              {dakData?.dmnFiles && dakData.dmnFiles.length > 0 ? (
                <div className="dmn-content">
                  {dakData.dmnFiles.map((dmnFile, index) => (
                    <div key={index} className="dmn-table-summary">
                      <h4>{dmnFile.name}</h4>
                      <p>Clinical decision table providing automated care recommendations.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{dmnFile.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No DMN files found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. Core Data Elements */}
          <div className="publication-section" id="core-data-elements">
            <div className="section-header">
              <h2>6. Core Data Elements</h2>
            </div>
            <div className="component-content">
              <h3>FHIR Implementation Specifications</h3>
              <p>
                This section contains FHIR profiles, extensions, and implementation guidance 
                that define the data standards for this Digital Adaptation Kit.
              </p>
              
              {dakData?.profiles && dakData.profiles.length > 0 ? (
                <div className="profiles-content">
                  {dakData.profiles.map((profile, index) => (
                    <div key={index} className="profile-summary">
                      <h4>{profile.name}</h4>
                      <p>FHIR profile defining data structure and constraints.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{profile.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No FHIR profiles found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 6. Generic Personas */}
          <div className="publication-section" id="generic-personas">
            <div className="section-header">
              <h2>7. Generic Personas and User Roles</h2>
            </div>
            <div className="component-content">
              <h3>System Users and Roles</h3>
              <p>
                This section defines the user personas and roles that interact with 
                the healthcare delivery processes defined in this Digital Adaptation Kit.
              </p>
              
              {dakData?.actorFiles && dakData.actorFiles.length > 0 ? (
                <div className="actors-content">
                  {dakData.actorFiles.map((actor, index) => (
                    <div key={index} className="actor-summary">
                      <h4>{actor.name}</h4>
                      <p>User persona definition for healthcare delivery roles.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{actor.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No actor definitions found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. Data Entry Forms and Questionnaires */}
          <div className="publication-section" id="questionnaires">
            <div className="section-header">
              <h2>8. Data Entry Forms and Questionnaires</h2>
            </div>
            <div className="component-content">
              <h3>Structured Data Collection Forms</h3>
              <p>
                This section contains questionnaires and data collection forms that provide 
                standardized data capture mechanisms for this Digital Adaptation Kit.
              </p>
              
              {dakData?.questionnaires && dakData.questionnaires.length > 0 ? (
                <div className="questionnaires-content">
                  {dakData.questionnaires.map((questionnaire, index) => (
                    <div key={index} className="questionnaire-summary">
                      <h4>{questionnaire.name}</h4>
                      <p>Structured data collection form for healthcare delivery.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{questionnaire.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No questionnaires found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 8. Terminology and Value Sets */}
          <div className="publication-section" id="terminology">
            <div className="section-header">
              <h2>9. Terminology and Value Sets</h2>
            </div>
            <div className="component-content">
              <h3>Standardized Terminology</h3>
              <p>
                This section contains value sets, code systems, and terminology mappings 
                that ensure semantic interoperability for this Digital Adaptation Kit.
              </p>
              
              {dakData?.terminology?.valueSets && dakData.terminology.valueSets.length > 0 ? (
                <div className="terminology-content">
                  {dakData.terminology.valueSets.map((valueSet, index) => (
                    <div key={index} className="valueset-summary">
                      <h4>{valueSet.name}</h4>
                      <p>Value set defining standardized codes and concepts.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{valueSet.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No terminology resources found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 9. Program Indicators */}
          <div className="publication-section" id="program-indicators">
            <div className="section-header">
              <h2>10. Program Indicators and Performance Measures</h2>
            </div>
            <div className="component-content">
              <h3>Monitoring and Evaluation Metrics</h3>
              <p>
                This section contains performance indicators and measurement definitions 
                for monitoring and evaluating implementation effectiveness.
              </p>
              
              {dakData?.indicators && dakData.indicators.length > 0 ? (
                <div className="indicators-content">
                  {dakData.indicators.map((indicator, index) => (
                    <div key={index} className="indicator-summary">
                      <h4>{indicator.name}</h4>
                      <p>Performance indicator for monitoring implementation success.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{indicator.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No indicators found in this repository.</p>
                </div>
              )}
            </div>
          </div>

          {/* 10. Functional and Non-Functional Requirements */}
          <div className="publication-section" id="functional-requirements">
            <div className="section-header">
              <h2>11. Functional and Non-Functional Requirements</h2>
            </div>
            <div className="component-content">
              <h3>System Requirements and Constraints</h3>
              <p>
                This section contains system requirements specifications that define 
                capabilities, constraints, and quality characteristics for implementation.
              </p>
              <p>
                <em>Note: Requirements ensure that implementations meet clinical, operational, 
                and technical standards for healthcare delivery.</em>
              </p>
            </div>
          </div>

          {/* 11. Test Scenarios */}
          <div className="publication-section" id="test-scenarios">
            <div className="section-header">
              <h2>12. Test Scenarios and Validation</h2>
            </div>
            <div className="component-content">
              <h3>Validation and Testing Framework</h3>
              <p>
                This section contains test scenarios and validation criteria for ensuring 
                correct implementation and operation of this Digital Adaptation Kit.
              </p>
              
              {dakData?.testFiles && dakData.testFiles.length > 0 ? (
                <div className="testing-content">
                  {dakData.testFiles.map((testFile, index) => (
                    <div key={index} className="test-summary">
                      <h4>{testFile.name}</h4>
                      <p>Test scenario for validating implementation functionality.</p>
                      <div className="file-reference">
                        <strong>Source:</strong> <code>{testFile.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>No test files found in this repository.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Implementation Guidance */}
        <div className="publication-section">
          <div className="implementation-guidance">
            <h2>13. Implementation Guidance</h2>
            <div className="guidance-content">
              <h3>Getting Started</h3>
              <p>
                This Digital Adaptation Kit provides a complete, standards-based implementation 
                package ready for deployment in digital health systems. Follow the implementation 
                sequence outlined below for successful deployment.
              </p>
              
              <h4>Implementation Sequence</h4>
              <ol>
                <li><strong>Environment Setup:</strong> Configure FHIR server and terminology services</li>
                <li><strong>Data Standards:</strong> Implement FHIR profiles and value sets</li>
                <li><strong>Workflow Configuration:</strong> Deploy business process definitions</li>
                <li><strong>Decision Support:</strong> Configure clinical decision support rules</li>
                <li><strong>User Training:</strong> Train healthcare providers on new workflows</li>
                <li><strong>Testing:</strong> Execute validation scenarios and user acceptance testing</li>
                <li><strong>Monitoring:</strong> Implement performance indicators and monitoring</li>
              </ol>

              <h4>Technical Requirements</h4>
              <ul>
                <li>FHIR R4 compliant server</li>
                <li>Terminology service (SNOMED CT, ICD-11, LOINC)</li>
                <li>Workflow engine supporting BPMN 2.0</li>
                <li>Decision support engine supporting DMN 1.3</li>
                <li>Mobile-responsive user interface</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Publication Footer */}
        <div className="publication-footer">
          <div className="footer-content">
            <p>Generated by SGeX Workbench - WHO SMART Guidelines Exchange</p>
            <p>Comprehensive DAK Publication | Repository: {publicationMeta?.owner}/{publicationMeta?.repoName} | Branch: {publicationMeta?.branch}</p>
          </div>
        </div>

        {/* Print Controls */}
        {!showPrintView && (
          <div className="publication-controls">
            <button 
              className="print-button"
              onClick={() => window.print()}
            >
              🖨️ Print Complete DAK
            </button>
            <button 
              className="print-view-button"
              onClick={() => setShowPrintView(!showPrintView)}
            >
              📄 Toggle Print View
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
    alert('EPUB generation will be implemented in the next phase. Current focus is on comprehensive HTML publication.');
  } catch (err) {
    console.error('Error generating EPUB:', err);
    alert('Failed to generate EPUB publication');
  }
};

export default AllComponentsPublication;