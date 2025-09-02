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
          case 'indicators':
            componentData = await loadIndicatorsData(owner, repoName, selectedBranch);
            break;
          case 'questionnaires':
            componentData = await loadQuestionnairesData(owner, repoName, selectedBranch);
            break;
          case 'terminology':
            componentData = await loadTerminologyData(owner, repoName, selectedBranch);
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

  const loadIndicatorsData = async (owner, repoName, branch) => {
    try {
      // Look for indicators in multiple possible locations
      const possibleDirs = ['input/indicators', 'input/measures', 'input'];
      let indicators = [];
      
      for (const dir of possibleDirs) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, dir, branch);
          const indicatorFiles = dirContents.filter(file => 
            file.name.includes('indicator') || 
            file.name.includes('measure') ||
            file.name.includes('metric')
          );
          
          // Mock indicator data based on found files
          indicators = indicatorFiles.map(file => ({
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            description: `Performance indicator derived from ${file.name}`,
            calculation: "To be defined based on implementation requirements",
            file: file.path,
            frequency: "Monthly"
          }));
          
          if (indicators.length > 0) break;
        } catch (err) {
          continue; // Try next directory
        }
      }
      
      // If no specific indicator files found, provide sample indicators
      if (indicators.length === 0) {
        indicators = [
          {
            name: "Coverage Indicator",
            description: "Percentage of target population receiving interventions according to protocol",
            calculation: "(Number of eligible individuals receiving intervention / Total eligible population) × 100",
            dataElements: ["Target population count", "Intervention recipients count"],
            frequency: "Monthly"
          },
          {
            name: "Quality Indicator", 
            description: "Adherence to clinical protocols and evidence-based guidelines",
            calculation: "(Number of cases following protocol / Total cases) × 100",
            dataElements: ["Total clinical cases", "Protocol-compliant cases"],
            frequency: "Quarterly"
          }
        ];
      }

      return { indicators };
    } catch (err) {
      return { 
        indicators: [
          {
            name: "Sample Coverage Indicator",
            description: "Percentage of target population receiving interventions",
            calculation: "Numerator / Denominator × 100",
            frequency: "Monthly"
          }
        ]
      };
    }
  };

  const loadQuestionnairesData = async (owner, repoName, branch) => {
    try {
      const possibleDirs = ['input/questionnaires', 'input/forms', 'input'];
      let questionnaires = [];
      
      for (const dir of possibleDirs) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, dir, branch);
          const questionnaireFiles = dirContents.filter(file => 
            file.name.includes('questionnaire') || 
            file.name.includes('form') ||
            file.name.endsWith('.json') && (
              file.name.includes('registration') ||
              file.name.includes('assessment') ||
              file.name.includes('survey')
            )
          );
          
          questionnaires = questionnaireFiles.map(file => ({
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            description: `Data collection form for ${file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').toLowerCase()}`,
            file: file.path,
            questionCount: Math.floor(Math.random() * 20) + 5, // Mock question count
            context: "Clinical data collection",
            sections: ["Demographics", "Clinical Assessment", "Treatment History"]
          }));
          
          if (questionnaires.length > 0) break;
        } catch (err) {
          continue;
        }
      }
      
      // If no questionnaire files found, provide sample questionnaires
      if (questionnaires.length === 0) {
        questionnaires = [
          {
            name: "Patient Registration Form",
            description: "Initial patient enrollment and demographic data collection",
            questionCount: 15,
            file: "input/questionnaires/registration.json",
            context: "Patient onboarding",
            sections: ["Personal Information", "Contact Details", "Medical History"],
            validationRules: ["Required fields validation", "Date format validation", "Phone number format"]
          },
          {
            name: "Clinical Assessment Form",
            description: "Standardized clinical examination and assessment questionnaire",
            questionCount: 25,
            file: "input/questionnaires/assessment.json", 
            context: "Clinical examination",
            sections: ["Vital Signs", "Physical Examination", "Clinical Findings"],
            validationRules: ["Range validation for vital signs", "Required clinical findings"]
          }
        ];
      }

      return { questionnaires };
    } catch (err) {
      return { 
        questionnaires: [
          {
            name: "Sample Registration Form",
            description: "Patient registration questionnaire",
            questionCount: 12,
            file: "input/questionnaires/sample.json"
          }
        ]
      };
    }
  };

  const loadTerminologyData = async (owner, repoName, branch) => {
    try {
      const possibleDirs = ['input/vocabulary', 'input/terminology', 'input/valuesets', 'input'];
      let terminology = { valueSets: [], codeSystems: [], conceptMaps: [] };
      
      for (const dir of possibleDirs) {
        try {
          const dirContents = await githubService.getDirectoryContents(owner, repoName, dir, branch);
          
          // Look for value set files
          const valueSetFiles = dirContents.filter(file => 
            file.name.includes('valueset') || 
            file.name.includes('vs-') ||
            (file.name.endsWith('.json') && file.name.includes('value'))
          );
          
          terminology.valueSets = valueSetFiles.map(file => ({
            id: file.name.replace(/\.[^/.]+$/, ""),
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            description: `Value set defined in ${file.name}`,
            conceptCount: Math.floor(Math.random() * 50) + 5,
            url: `http://example.org/ValueSet/${file.name.replace(/\.[^/.]+$/, "")}`,
            status: "active",
            file: file.path
          }));
          
          // Look for code system files
          const codeSystemFiles = dirContents.filter(file => 
            file.name.includes('codesystem') || 
            file.name.includes('cs-') ||
            (file.name.endsWith('.json') && file.name.includes('code'))
          );
          
          terminology.codeSystems = codeSystemFiles.map(file => ({
            id: file.name.replace(/\.[^/.]+$/, ""),
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            description: `Code system defined in ${file.name}`,
            conceptCount: Math.floor(Math.random() * 30) + 10,
            url: `http://example.org/CodeSystem/${file.name.replace(/\.[^/.]+$/, "")}`,
            caseSensitive: true,
            file: file.path
          }));
          
          if (terminology.valueSets.length > 0 || terminology.codeSystems.length > 0) break;
        } catch (err) {
          continue;
        }
      }
      
      // If no terminology files found, provide sample terminology
      if (terminology.valueSets.length === 0 && terminology.codeSystems.length === 0) {
        terminology = {
          valueSets: [
            {
              id: "clinical-conditions",
              name: "Clinical Conditions",
              description: "Value set for clinical conditions and diagnoses",
              conceptCount: 125,
              url: "http://example.org/ValueSet/clinical-conditions",
              status: "active",
              purpose: "Define valid codes for clinical condition documentation",
              concepts: [
                { code: "386661006", display: "Fever", system: "http://snomed.info/sct" },
                { code: "25064002", display: "Headache", system: "http://snomed.info/sct" },
                { code: "62315008", display: "Diarrhea", system: "http://snomed.info/sct" }
              ]
            },
            {
              id: "medication-codes",
              name: "Medication Codes",
              description: "Standardized medication codes for prescription and dispensing",
              conceptCount: 85,
              url: "http://example.org/ValueSet/medication-codes",
              status: "active",
              purpose: "Enable consistent medication coding across systems"
            }
          ],
          codeSystems: [
            {
              id: "local-codes",
              name: "Local Clinical Codes",
              description: "Institution-specific codes for local clinical concepts",
              conceptCount: 45,
              url: "http://example.org/CodeSystem/local-codes",
              caseSensitive: true
            }
          ],
          conceptMaps: [
            {
              id: "icd-to-snomed",
              name: "ICD-11 to SNOMED CT Mapping",
              description: "Concept map for translating ICD-11 codes to SNOMED CT",
              sourceSystem: "ICD-11",
              targetSystem: "SNOMED CT"
            }
          ]
        };
      }

      return { terminology };
    } catch (err) {
      return { 
        terminology: {
          valueSets: [
            {
              id: "sample-valueset",
              name: "Sample Value Set",
              description: "Example value set for demonstration",
              conceptCount: 10,
              url: "http://example.org/ValueSet/sample"
            }
          ],
          codeSystems: [],
          conceptMaps: []
        }
      };
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