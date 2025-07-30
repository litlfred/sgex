import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout } from './framework';
import './TestingViewer.css';

// Demo feature files data for when in demo mode
const DEMO_FEATURE_FILES = [
  {
    name: 'ViewIPSContent.feature',
    path: 'input/testing/ViewIPSContent.feature',
    url: 'https://github.com/demo-user/anc-dak/blob/main/input/testing/ViewIPSContent.feature',
    download_url: 'https://raw.githubusercontent.com/demo-user/anc-dak/main/input/testing/ViewIPSContent.feature',
    content: `Feature: View IPS Content
  As a healthcare provider
  I want to view International Patient Summary (IPS) content
  So that I can review standardized patient information

  Background:
    Given the system has IPS data available
    And the user has appropriate permissions

  Scenario: View basic IPS information
    Given I am logged into the system
    When I navigate to the IPS viewer
    Then I should see the patient summary header
    And I should see basic patient demographics
    And I should see medical history section

  Scenario: View IPS medications
    Given I am viewing an IPS document
    When I scroll to the medications section
    Then I should see a list of current medications
    And each medication should display name, dosage, and frequency
    And medications should be sorted by importance

  Scenario: Export IPS content
    Given I am viewing an IPS document
    When I click the export button
    Then I should be able to download the IPS as PDF
    And the PDF should contain all visible sections
    And the formatting should be preserved

  Scenario: Handle missing IPS data
    Given the patient has no IPS document
    When I attempt to view their IPS
    Then I should see a "No IPS available" message
    And I should see options to create a new IPS
    And the system should suggest relevant data sources`
  },
  {
    name: 'PatientRegistration.feature',
    path: 'input/testing/PatientRegistration.feature',
    url: 'https://github.com/demo-user/anc-dak/blob/main/input/testing/PatientRegistration.feature',
    download_url: 'https://raw.githubusercontent.com/demo-user/anc-dak/main/input/testing/PatientRegistration.feature',
    content: `Feature: Patient Registration
  As a healthcare worker
  I want to register new patients in the system
  So that I can track their care journey

  Background:
    Given I am logged into the healthcare system
    And I have patient registration permissions

  Scenario: Register a new patient with complete information
    Given I am on the patient registration page
    When I enter the patient's full name "Sarah Johnson"
    And I enter the date of birth "1990-05-15"
    And I enter the contact phone "555-0123"
    And I select the preferred language "English"
    And I click the "Register Patient" button
    Then the patient should be successfully registered
    And I should see a confirmation message
    And the patient should receive a unique identifier

  Scenario: Register patient with minimal required information
    Given I am on the patient registration page
    When I enter only the required fields
    And I click "Register Patient"
    Then the system should accept the registration
    And prompt me to complete the profile later

  Scenario: Handle duplicate patient registration
    Given a patient with phone "555-0123" already exists
    When I try to register another patient with the same phone
    Then the system should show a duplicate warning
    And offer to link to the existing patient record
    And allow me to verify this is the same person`
  },
  {
    name: 'AntenatalCareWorkflow.feature',
    path: 'input/testing/AntenatalCareWorkflow.feature',
    url: 'https://github.com/demo-user/anc-dak/blob/main/input/testing/AntenatalCareWorkflow.feature',
    download_url: 'https://raw.githubusercontent.com/demo-user/anc-dak/main/input/testing/AntenatalCareWorkflow.feature',
    content: `Feature: Antenatal Care Workflow
  As a midwife
  I want to follow standardized antenatal care protocols
  So that I can provide consistent quality care to pregnant women

  Background:
    Given I am a certified midwife logged into the system
    And the WHO antenatal care guidelines are loaded

  Scenario: First antenatal visit workflow
    Given a pregnant woman is attending her first ANC visit
    When I start the first visit assessment
    Then I should see prompts for initial health history
    And I should see required vital signs checklist
    And I should see screening test recommendations
    And the system should calculate gestational age
    And I should see next appointment scheduling options

  Scenario: Follow-up visit risk assessment
    Given a patient is attending a follow-up ANC visit
    And her previous visit data is available
    When I review her current condition
    Then the system should highlight any risk factors
    And suggest appropriate interventions
    And update the care plan automatically
    And schedule appropriate follow-up intervals

  Scenario: High-risk pregnancy detection
    Given I am conducting an ANC assessment
    When the patient shows signs of complications
    Then the system should trigger risk alerts
    And recommend immediate specialist referral
    And provide emergency contact information
    And document the escalation in patient records

  Scenario: Generate antenatal care summary
    Given a patient has completed multiple ANC visits
    When I request a care summary report
    Then I should see a timeline of all visits
    And all test results and measurements
    And current risk status and recommendations
    And the report should be suitable for referrals`
  }
];

const TestingViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, repository, selectedBranch } = location.state || {};

  const [featureFiles, setFeatureFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFeatureFiles = async () => {
      if (!repository) {
        setError('Missing repository information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if we're in demo mode - improved detection for demo repositories
        const isDemoMode = repository.isDemo || 
                          (repository.owner && repository.owner.login === 'demo-user') ||
                          (repository.full_name && repository.full_name.startsWith('demo-user/'));
        
        if (isDemoMode) {
          // Use demo data in demo mode
          console.log('Demo mode detected, using demo feature files');
          setTimeout(() => {
            setFeatureFiles(DEMO_FEATURE_FILES.map(file => ({
              name: file.name,
              path: file.path,
              url: file.url,
              download_url: file.download_url
            })));
            setLoading(false);
          }, 1000); // Simulate loading time
          return;
        }

        // Extract owner and repo name - handle both demo and real repository structures
        let owner, repoName;
        
        if (repository.owner?.login) {
          // Real GitHub repository structure
          owner = repository.owner.login;
          repoName = repository.name;
        } else if (repository.full_name) {
          // Handle repository with full_name
          [owner, repoName] = repository.full_name.split('/');
        } else if (typeof repository === 'string') {
          // Handle string format
          [owner, repoName] = repository.split('/');
        } else {
          // Fallback - try to extract from repository properties
          owner = repository.owner || 'demo-user';
          repoName = repository.name || repository.repo || 'unknown';
        }

        console.log('Fetching feature files for:', { owner, repoName, repository });

        // Try to get files from input/testing directory
        const files = await githubService.getDirectoryContents(
          owner,
          repoName,
          'input/testing',
          selectedBranch || repository.default_branch || 'main'
        );

        // Filter for .feature files
        const featureFiles = files
          .filter(file => file.type === 'file' && file.name.endsWith('.feature'))
          .map(file => ({
            name: file.name,
            path: file.path,
            url: file.html_url,
            download_url: file.download_url
          }));

        setFeatureFiles(featureFiles);
      } catch (err) {
        console.error('Error fetching feature files:', err);
        if (err.message.includes('Not Found')) {
          setError('No input/testing directory found in this repository');
        } else {
          setError(`Error loading feature files: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFiles();
  }, [profile, repository, selectedBranch]);

  const handleViewFile = async (file) => {
    try {
      setLoading(true);
      
      // Check if we're in demo mode - improved detection for demo repositories
      const isDemoMode = repository.isDemo || 
                        (repository.owner && repository.owner.login === 'demo-user') ||
                        (repository.full_name && repository.full_name.startsWith('demo-user/'));
      
      if (isDemoMode) {
        // Find the demo file content
        const demoFile = DEMO_FEATURE_FILES.find(df => df.name === file.name);
        if (demoFile) {
          setTimeout(() => {
            setSelectedFile(file);
            setFileContent(demoFile.content);
            setShowModal(true);
            setLoading(false);
          }, 500); // Simulate loading time
        } else {
          setError(`Demo content not found for file: ${file.name}`);
          setLoading(false);
        }
        return;
      }

      // For real repositories, fetch from GitHub
      const response = await fetch(file.download_url);
      const content = await response.text();
      setSelectedFile(file);
      setFileContent(content);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading file content:', err);
      setError(`Error loading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard', { 
      state: { profile, repository, selectedBranch } 
    });
  };

  const renderModal = () => {
    if (!showModal || !selectedFile) return null;

    return (
      <div className="testing-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="testing-modal" onClick={(e) => e.stopPropagation()}>
          <div className="testing-modal-header">
            <h3>{selectedFile.name}</h3>
            <button 
              className="testing-modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
          <div className="testing-modal-content">
            <pre className="feature-content">{fileContent}</pre>
          </div>
          <div className="testing-modal-footer">
            <a 
              href={selectedFile.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View on GitHub
            </a>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout pageName="testing-viewer">
      <div className="testing-viewer">
        <div className="testing-header">
          <button onClick={handleBack} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Testing Files</h1>
          <p className="testing-description">
            Feature files from the input/testing directory
          </p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading feature files...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && featureFiles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No Feature Files Found</h3>
            <p>No .feature files were found in the input/testing directory.</p>
          </div>
        )}

        {!loading && !error && featureFiles.length > 0 && (
          <div className="feature-files-grid">
            {featureFiles.map((file, index) => (
              <div key={index} className="feature-file-card">
                <div className="file-icon">🧪</div>
                <div className="file-info">
                  <h3 className="file-name">{file.name}</h3>
                  <p className="file-path">{file.path}</p>
                </div>
                <div className="file-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewFile(file)}
                  >
                    View
                  </button>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderModal()}
      </div>
    </PageLayout>
  );
};

export default TestingViewer;