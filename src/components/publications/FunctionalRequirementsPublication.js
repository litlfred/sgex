import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout, useDAKParams } from '../framework';
import githubService from '../../services/githubService';
import './PublicationView.css';

/**
 * Functional Requirements Publication Component
 * 
 * Renders functional and non-functional requirements for publication:
 * - System requirements specifications
 * - Functional capabilities and constraints
 * - Non-functional requirements (performance, security, etc.)
 * - Implementation conformance rules
 */
const FunctionalRequirementsPublication = () => {
  const location = useLocation();
  const frameworkData = useDAKParams();
  const { user, repo, branch } = useParams();
  
  // Get data from framework params or location state
  const profile = frameworkData?.profile || location.state?.profile;
  const repository = frameworkData?.repository || location.state?.repository;
  const selectedBranch = frameworkData?.branch || branch || location.state?.selectedBranch;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [publicationMeta, setPublicationMeta] = useState(null);

  useEffect(() => {
    const loadRequirementsData = async () => {
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
          component: 'functional-requirements'
        });

        // Load requirements data
        const requirementsData = await loadFunctionalRequirements(owner, repoName, selectedBranch);
        setRequirements(requirementsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading requirements data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadRequirementsData();
  }, [profile, repository, selectedBranch]);

  const loadFunctionalRequirements = async (owner, repoName, branch) => {
    try {
      // Try to load from various potential locations for requirements
      const locations = ['input/requirements', 'input/specs', 'input/conformance', 'input'];
      
      for (const location of locations) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, location, branch);
          
          // Look for requirements-related files
          const requirementFiles = dirContents.filter(file => 
            file.name.includes('requirement') || 
            file.name.includes('spec') ||
            file.name.includes('conformance') ||
            file.name.includes('constraint') ||
            file.name.includes('functional') ||
            file.name.includes('non-functional')
          );
          
          if (requirementFiles.length > 0) {
            const requirements = [];
            for (const file of requirementFiles.slice(0, 15)) {
              try {
                const content = await githubService.getFileContent(owner, repoName, file.path, branch);
                requirements.push({
                  name: file.name,
                  path: file.path,
                  content: content,
                  type: file.name.includes('.json') ? 'JSON' : 
                        file.name.includes('.yaml') || file.name.includes('.yml') ? 'YAML' : 
                        file.name.includes('.md') ? 'Markdown' : 'Text'
                });
              } catch (err) {
                console.warn(`Could not load requirement file ${file.path}:`, err);
              }
            }
            
            if (requirements.length > 0) {
              return requirements;
            }
          }
        } catch (err) {
          // Continue to next location
        }
      }

      // Return sample data if no files found
      return getSampleFunctionalRequirements();
    } catch (err) {
      console.warn('Error loading functional requirements:', err);
      return getSampleFunctionalRequirements();
    }
  };

  const getSampleFunctionalRequirements = () => {
    return [
      {
        name: 'Core Functional Requirements',
        type: 'Functional Requirements',
        content: {
          title: 'Core System Functional Requirements',
          requirements: [
            {
              id: 'REQ-FUNC-001',
              category: 'Data Management',
              description: 'The system SHALL capture and store patient demographic information in accordance with local data protection regulations.',
              priority: 'High',
              source: 'Clinical Workflow Analysis',
              acceptance_criteria: [
                'System captures required demographic fields',
                'Data validation rules are enforced',
                'Audit trail maintained for all data changes'
              ]
            },
            {
              id: 'REQ-FUNC-002',
              category: 'Clinical Decision Support',
              description: 'The system SHALL provide real-time clinical decision support based on evidence-based guidelines.',
              priority: 'High',
              source: 'WHO Clinical Guidelines',
              acceptance_criteria: [
                'Decision rules execute in real-time',
                'Recommendations are evidence-based',
                'Override capabilities with justification required'
              ]
            },
            {
              id: 'REQ-FUNC-003',
              category: 'Reporting',
              description: 'The system SHALL generate standard indicator reports for program monitoring and evaluation.',
              priority: 'Medium',
              source: 'Program Management Requirements',
              acceptance_criteria: [
                'Standard reports available for all indicators',
                'Reports can be filtered by time period and location',
                'Export capabilities in multiple formats'
              ]
            }
          ]
        }
      },
      {
        name: 'Non-Functional Requirements',
        type: 'Non-Functional Requirements',
        content: {
          title: 'System Performance and Quality Requirements',
          requirements: [
            {
              id: 'REQ-PERF-001',
              category: 'Performance',
              description: 'The system SHALL respond to user interactions within 2 seconds for 95% of transactions.',
              priority: 'High',
              source: 'User Experience Standards',
              acceptance_criteria: [
                'Response time measured under normal load',
                'Performance monitoring implemented',
                'Performance degradation alerts configured'
              ]
            },
            {
              id: 'REQ-SEC-001',
              category: 'Security',
              description: 'The system SHALL implement role-based access control with audit logging.',
              priority: 'Critical',
              source: 'Security Policy',
              acceptance_criteria: [
                'Role-based permissions enforced',
                'All access attempts logged',
                'Regular security audits conducted'
              ]
            },
            {
              id: 'REQ-AVAIL-001',
              category: 'Availability',
              description: 'The system SHALL maintain 99.5% uptime during operational hours.',
              priority: 'High',
              source: 'Service Level Agreement',
              acceptance_criteria: [
                'Uptime monitoring implemented',
                'Downtime notifications automated',
                'Recovery procedures documented'
              ]
            }
          ]
        }
      },
      {
        name: 'Integration Requirements',
        type: 'Integration Specifications',
        content: {
          title: 'System Integration and Interoperability Requirements',
          requirements: [
            {
              id: 'REQ-INT-001',
              category: 'Data Exchange',
              description: 'The system SHALL support FHIR R4 for health information exchange.',
              priority: 'High',
              source: 'Interoperability Standards',
              acceptance_criteria: [
                'FHIR R4 compliance validated',
                'Standard resource profiles implemented',
                'Terminology services integrated'
              ]
            },
            {
              id: 'REQ-INT-002',
              category: 'External Systems',
              description: 'The system SHALL integrate with national health information systems where available.',
              priority: 'Medium',
              source: 'National eHealth Strategy',
              acceptance_criteria: [
                'Integration endpoints documented',
                'Data mapping specifications defined',
                'Error handling for integration failures'
              ]
            }
          ]
        }
      }
    ];
  };

  const categorizeRequirements = (requirements) => {
    const categories = {
      functional: [],
      nonFunctional: [],
      integration: [],
      other: []
    };

    requirements.forEach(req => {
      if (req.name.toLowerCase().includes('functional') && !req.name.toLowerCase().includes('non-functional')) {
        categories.functional.push(req);
      } else if (req.name.toLowerCase().includes('non-functional') || req.name.toLowerCase().includes('performance') || req.name.toLowerCase().includes('security')) {
        categories.nonFunctional.push(req);
      } else if (req.name.toLowerCase().includes('integration') || req.name.toLowerCase().includes('interop')) {
        categories.integration.push(req);
      } else {
        categories.other.push(req);
      }
    });

    return categories;
  };

  if (loading) {
    return (
      <PageLayout pageName="functional-requirements-publication">
        <div className="publication-loading">
          <div className="loading-content">
            <h3>Loading Functional Requirements Publication...</h3>
            <p>Preparing system requirements and specifications...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout pageName="functional-requirements-publication">
        <div className="publication-error">
          <div className="error-content">
            <h3>Error Loading Functional Requirements Publication</h3>
            <p>{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const categorizedRequirements = categorizeRequirements(requirements);

  return (
    <PageLayout pageName="functional-requirements-publication">
      <div className="publication-container">
        {/* Publication Header */}
        <div className="publication-header">
          <div className="publication-title">
            <h1>Functional and Non-Functional Requirements</h1>
            <p className="publication-subtitle">
              System Requirements Specifications and Implementation Constraints
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
              <strong>Component:</strong> Requirements ({requirements.length} specifications)
            </div>
          </div>
        </div>

        {/* Publication Content */}
        <div className="publication-content">
          <div className="component-overview">
            <h2>Overview</h2>
            <p>
              This section presents the functional and non-functional requirements that define 
              the capabilities, constraints, and quality characteristics of the Digital Adaptation Kit 
              implementation. These requirements ensure that the system meets clinical, operational, 
              and technical standards for healthcare delivery.
            </p>
          </div>

          {/* Functional Requirements */}
          {categorizedRequirements.functional.length > 0 && (
            <div className="requirements-section">
              <h2>Functional Requirements</h2>
              <p>
                Functional requirements define what the system must do to support healthcare workflows 
                and clinical processes.
              </p>
              
              {categorizedRequirements.functional.map((requirement, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-header">
                    <h3>{requirement.name}</h3>
                    <span className="requirement-type">{requirement.type}</span>
                  </div>
                  
                  <div className="requirement-content">
                    {typeof requirement.content === 'object' ? (
                      <div className="structured-content">
                        {requirement.content.title && (
                          <h4>{requirement.content.title}</h4>
                        )}
                        
                        {requirement.content.requirements && Array.isArray(requirement.content.requirements) && (
                          <div className="requirements-list">
                            {requirement.content.requirements.map((req, i) => (
                              <div key={i} className="requirement-item">
                                <div className="req-header">
                                  <span className="req-id">{req.id}</span>
                                  <span className={`req-priority priority-${req.priority?.toLowerCase()}`}>
                                    {req.priority}
                                  </span>
                                </div>
                                <div className="req-category">{req.category}</div>
                                <div className="req-description">{req.description}</div>
                                {req.source && (
                                  <div className="req-source">
                                    <strong>Source:</strong> {req.source}
                                  </div>
                                )}
                                {req.acceptance_criteria && Array.isArray(req.acceptance_criteria) && (
                                  <div className="req-criteria">
                                    <strong>Acceptance Criteria:</strong>
                                    <ul>
                                      {req.acceptance_criteria.map((criteria, j) => (
                                        <li key={j}>{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-content">
                        <pre>{requirement.content}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Non-Functional Requirements */}
          {categorizedRequirements.nonFunctional.length > 0 && (
            <div className="requirements-section">
              <h2>Non-Functional Requirements</h2>
              <p>
                Non-functional requirements define quality characteristics and constraints that 
                the system must meet for performance, security, and reliability.
              </p>
              
              {categorizedRequirements.nonFunctional.map((requirement, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-header">
                    <h3>{requirement.name}</h3>
                    <span className="requirement-type">{requirement.type}</span>
                  </div>
                  
                  <div className="requirement-content">
                    {typeof requirement.content === 'object' ? (
                      <div className="structured-content">
                        {requirement.content.title && (
                          <h4>{requirement.content.title}</h4>
                        )}
                        
                        {requirement.content.requirements && Array.isArray(requirement.content.requirements) && (
                          <div className="requirements-list">
                            {requirement.content.requirements.map((req, i) => (
                              <div key={i} className="requirement-item">
                                <div className="req-header">
                                  <span className="req-id">{req.id}</span>
                                  <span className={`req-priority priority-${req.priority?.toLowerCase()}`}>
                                    {req.priority}
                                  </span>
                                </div>
                                <div className="req-category">{req.category}</div>
                                <div className="req-description">{req.description}</div>
                                {req.source && (
                                  <div className="req-source">
                                    <strong>Source:</strong> {req.source}
                                  </div>
                                )}
                                {req.acceptance_criteria && Array.isArray(req.acceptance_criteria) && (
                                  <div className="req-criteria">
                                    <strong>Acceptance Criteria:</strong>
                                    <ul>
                                      {req.acceptance_criteria.map((criteria, j) => (
                                        <li key={j}>{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-content">
                        <pre>{requirement.content}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Integration Requirements */}
          {categorizedRequirements.integration.length > 0 && (
            <div className="requirements-section">
              <h2>Integration Requirements</h2>
              <p>
                Integration requirements specify how the system must interact with external 
                systems and services to support interoperability.
              </p>
              
              {categorizedRequirements.integration.map((requirement, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-header">
                    <h3>{requirement.name}</h3>
                    <span className="requirement-type">{requirement.type}</span>
                  </div>
                  
                  <div className="requirement-content">
                    {typeof requirement.content === 'object' ? (
                      <div className="structured-content">
                        {requirement.content.title && (
                          <h4>{requirement.content.title}</h4>
                        )}
                        
                        {requirement.content.requirements && Array.isArray(requirement.content.requirements) && (
                          <div className="requirements-list">
                            {requirement.content.requirements.map((req, i) => (
                              <div key={i} className="requirement-item">
                                <div className="req-header">
                                  <span className="req-id">{req.id}</span>
                                  <span className={`req-priority priority-${req.priority?.toLowerCase()}`}>
                                    {req.priority}
                                  </span>
                                </div>
                                <div className="req-category">{req.category}</div>
                                <div className="req-description">{req.description}</div>
                                {req.source && (
                                  <div className="req-source">
                                    <strong>Source:</strong> {req.source}
                                  </div>
                                )}
                                {req.acceptance_criteria && Array.isArray(req.acceptance_criteria) && (
                                  <div className="req-criteria">
                                    <strong>Acceptance Criteria:</strong>
                                    <ul>
                                      {req.acceptance_criteria.map((criteria, j) => (
                                        <li key={j}>{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-content">
                        <pre>{requirement.content}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Requirements */}
          {categorizedRequirements.other.length > 0 && (
            <div className="requirements-section">
              <h2>Additional Requirements</h2>
              
              {categorizedRequirements.other.map((requirement, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-header">
                    <h3>{requirement.name}</h3>
                    <span className="requirement-type">{requirement.type}</span>
                  </div>
                  
                  <div className="requirement-content">
                    <div className="text-content">
                      <pre>{requirement.content}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="implementation-guidance">
            <h2>Implementation Guidance</h2>
            <div className="guidance-content">
              <h3>Requirements Traceability</h3>
              <p>
                Ensure requirements are traceable throughout implementation:
              </p>
              <ul>
                <li>Map requirements to system components and features</li>
                <li>Document design decisions that address requirements</li>
                <li>Create test cases that validate requirement satisfaction</li>
                <li>Maintain traceability matrix for change management</li>
              </ul>
              
              <h3>Compliance Validation</h3>
              <p>
                Validate compliance with requirements through:
              </p>
              <ul>
                <li>Automated testing for functional requirements</li>
                <li>Performance testing for non-functional requirements</li>
                <li>Security audits for security requirements</li>
                <li>Integration testing for interoperability requirements</li>
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
              For the most current version of these requirements specifications, please refer to the source repository.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FunctionalRequirementsPublication;