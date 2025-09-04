#!/usr/bin/env node

/**
 * DAK Publication Generator - Proof of Concept Implementation
 * 
 * This script demonstrates the core concepts for generating WHO SMART Guidelines
 * Digital Adaptation Kit publications in multiple formats (HTML, PDF, Word).
 * 
 * Usage:
 *   node scripts/generate-dak-publication-poc.js --repo owner/repo-name [options]
 * 
 * Features demonstrated:
 * - DAK repository analysis and content extraction
 * - Template-based publication generation
 * - Multi-format output (HTML first, extensible to PDF/Word)
 * - WHO branding and styling compliance
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration for the POC
const POC_CONFIG = {
  outputDir: path.join(__dirname, '../output/dak-publications'),
  templatesDir: path.join(__dirname, '../templates/dak-publication'),
  stylesDir: path.join(__dirname, '../public/styles'),
  
  // Default template configuration
  defaultTemplate: {
    id: 'who-dak-standard-poc',
    name: 'WHO DAK Standard Publication (POC)',
    version: '0.1.0',
    
    branding: {
      primaryColor: '#0078d4',
      secondaryColor: '#005a9e',
      accentColor: '#40e0d0',
      logo: 'who-logo.svg'
    },
    
    sections: {
      cover: { enabled: true, order: 1 },
      toc: { enabled: true, order: 2 },
      executive_summary: { enabled: true, order: 3 },
      health_interventions: { enabled: true, order: 4 },
      personas: { enabled: true, order: 5 },
      user_scenarios: { enabled: true, order: 6 },
      business_processes: { enabled: true, order: 7 },
      data_elements: { enabled: true, order: 8 },
      decision_logic: { enabled: true, order: 9 },
      indicators: { enabled: true, order: 10 },
      requirements: { enabled: true, order: 11 },
      test_scenarios: { enabled: true, order: 12 }
    }
  }
};

/**
 * Main DAK Publication Generator class
 */
class DAKPublicationGeneratorPOC {
  constructor() {
    this.config = POC_CONFIG;
    this.dakData = null;
    this.template = null;
  }

  /**
   * Main entry point for publication generation
   */
  async generatePublication(options) {
    console.log('🚀 Starting DAK Publication Generation...');
    
    try {
      // Step 1: Analyze DAK repository
      console.log('📊 Analyzing DAK repository...');
      this.dakData = await this.analyzeDAKRepository(options.repo, options.branch);
      
      // Step 2: Load template configuration
      console.log('📋 Loading publication template...');
      this.template = await this.loadTemplate(options.template);
      
      // Step 3: Generate HTML publication
      console.log('📝 Generating HTML publication...');
      const htmlOutput = await this.generateHTML();
      
      // Step 4: Save output
      console.log('💾 Saving publication files...');
      const outputPath = await this.savePublication(htmlOutput, options);
      
      console.log('✅ Publication generated successfully!');
      console.log(`📁 Output saved to: ${outputPath}`);
      
      return {
        success: true,
        outputPath: outputPath,
        formats: ['html'],
        metadata: this.dakData.metadata
      };
      
    } catch (error) {
      console.error('❌ Publication generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze DAK repository and extract content
   */
  async analyzeDAKRepository(repoPath, branch = 'main') {
    // Mock DAK repository analysis - in real implementation this would
    // use GitHub API to analyze the repository structure and content
    
    const [owner, repo] = repoPath.split('/');
    
    // Simulate repository metadata extraction
    const metadata = {
      id: `${owner}.${repo}`,
      name: repo.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      title: `${repo.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Digital Adaptation Kit`,
      description: `WHO SMART Guidelines Digital Adaptation Kit for ${repo}`,
      version: '1.0.0',
      owner: owner,
      repository: repo,
      branch: branch,
      canonical: `https://smart.who.int/dak/${owner}/${repo}`,
      generated: new Date().toISOString(),
      generator: 'SGEX DAK Publication Generator POC v0.1.0'
    };

    // Simulate DAK component content extraction
    const components = {
      healthInterventions: {
        title: 'Health Interventions and Recommendations',
        description: 'Overview of the health interventions and WHO recommendations included within the DAK',
        content: this.generateMockContent('health interventions'),
        iris_references: [
          { title: 'WHO Guidelines Example', url: 'https://iris.who.int/example' }
        ]
      },
      
      personas: {
        title: 'Generic Personas',
        description: 'Depiction of the human and system actors',
        content: this.generateMockContent('personas'),
        actors: [
          { name: 'Healthcare Worker', role: 'Primary Care Provider', description: 'Front-line healthcare provider' },
          { name: 'Patient', role: 'Care Recipient', description: 'Individual receiving healthcare services' }
        ]
      },
      
      userScenarios: {
        title: 'User Scenarios',
        description: 'Narratives that describe how different personas interact',
        content: this.generateMockContent('user scenarios'),
        scenarios: [
          { name: 'Patient Registration', actors: ['Healthcare Worker', 'Patient'], steps: 5 }
        ]
      },
      
      businessProcesses: {
        title: 'Business Processes and Workflows',
        description: 'Business processes and workflows for achieving health programme objectives',
        content: this.generateMockContent('business processes'),
        workflows: [
          { name: 'Patient Care Workflow', type: 'BPMN', steps: 12, complexity: 'Medium' }
        ]
      },
      
      dataElements: {
        title: 'Core Data Elements',
        description: 'Data elements required throughout different points of a workflow',
        content: this.generateMockContent('data elements'),
        elements: [
          { name: 'Patient ID', type: 'identifier', required: true },
          { name: 'Visit Date', type: 'date', required: true }
        ]
      },
      
      decisionLogic: {
        title: 'Decision Support Logic',
        description: 'Decision-support logic and algorithms to support appropriate service delivery',
        content: this.generateMockContent('decision logic'),
        tables: [
          { name: 'Treatment Decision Table', inputs: 3, rules: 8, complexity: 'Medium' }
        ]
      },
      
      indicators: {
        title: 'Program Indicators',
        description: 'Core set of indicators for decision-making, performance metrics and reporting',
        content: this.generateMockContent('indicators'),
        metrics: [
          { name: 'Patient Satisfaction', type: 'quality', target: '> 90%' },
          { name: 'Treatment Completion Rate', type: 'outcome', target: '> 85%' }
        ]
      },
      
      requirements: {
        title: 'Functional and Non-Functional Requirements',
        description: 'High-level list of core functions and capabilities that the system must have',
        content: this.generateMockContent('requirements'),
        functional: 8,
        nonFunctional: 5
      },
      
      testScenarios: {
        title: 'Test Scenarios',
        description: 'Set of test scenarios to validate an implementation of the DAK',
        content: this.generateMockContent('test scenarios'),
        scenarios: [
          { name: 'Patient Registration Test', type: 'functional', priority: 'high' },
          { name: 'Performance Load Test', type: 'non-functional', priority: 'medium' }
        ]
      }
    };

    return {
      metadata: metadata,
      components: components,
      assets: [],
      structure: {
        componentCount: Object.keys(components).length,
        totalSections: Object.keys(components).length + 3, // +3 for cover, toc, summary
        estimatedPages: 25
      }
    };
  }

  /**
   * Generate mock content for demonstration
   */
  generateMockContent(componentType) {
    const mockContent = {
      'health interventions': `
# Health Interventions and Recommendations

This section outlines the key health interventions and evidence-based recommendations included in this Digital Adaptation Kit.

## Overview

The health interventions defined in this DAK are based on WHO guidelines and best practices for healthcare delivery. These interventions are designed to improve patient outcomes and support healthcare workers in providing high-quality care.

## Key Interventions

1. **Primary Care Assessment**: Comprehensive health assessment protocols
2. **Treatment Guidelines**: Evidence-based treatment recommendations
3. **Follow-up Procedures**: Standardized follow-up care protocols

## Implementation Considerations

- Healthcare worker training requirements
- Resource allocation and planning
- Quality assurance measures
- Performance monitoring indicators
      `,
      
      'personas': `
# Generic Personas

This section describes the key actors and personas involved in the healthcare delivery process.

## Healthcare Worker

**Role**: Primary care provider
**Responsibilities**: 
- Patient assessment and diagnosis
- Treatment planning and implementation
- Documentation and reporting

**Skills and Training**:
- Clinical expertise in relevant health area
- Training on DAK implementation
- Familiarity with digital health tools

## Patient

**Role**: Care recipient
**Characteristics**:
- Seeking healthcare services
- May have varying levels of health literacy
- Requires culturally appropriate care

## System Administrator

**Role**: Technical support and system management
**Responsibilities**:
- System maintenance and updates
- User access management
- Technical troubleshooting
      `,
      
      'user scenarios': `
# User Scenarios

This section presents typical scenarios of how different personas interact with the system and each other.

## Scenario 1: Patient Registration and Initial Assessment

**Actors**: Healthcare Worker, Patient, System

**Flow**:
1. Patient arrives at healthcare facility
2. Healthcare worker initiates registration process
3. System captures patient demographic information
4. Healthcare worker conducts initial health assessment
5. System records assessment data and generates care plan

## Scenario 2: Follow-up Visit

**Actors**: Healthcare Worker, Patient, System

**Flow**:
1. Patient returns for scheduled follow-up
2. Healthcare worker reviews previous care plan
3. System displays patient history and recommendations
4. Healthcare worker updates patient status
5. System generates updated care plan if needed
      `,
      
      'business processes': `
# Business Processes and Workflows

This section documents the key business processes and workflows that support the health interventions.

## Patient Care Workflow

**Purpose**: Standardized approach to patient care delivery

**Key Steps**:
1. Patient registration and identification
2. Initial health assessment
3. Diagnosis and treatment planning
4. Treatment implementation
5. Outcome monitoring and evaluation
6. Follow-up care coordination

## Quality Assurance Process

**Purpose**: Ensure adherence to clinical guidelines and quality standards

**Key Components**:
- Regular supervision and mentoring
- Performance indicator monitoring
- Continuous quality improvement
- Feedback and corrective action processes
      `,
      
      'data elements': `
# Core Data Elements

This section defines the essential data elements required for effective implementation of the DAK.

## Patient Demographics

- **Patient ID**: Unique identifier for each patient
- **Name**: Patient full name
- **Date of Birth**: Patient age calculation
- **Gender**: Biological sex classification
- **Contact Information**: Phone number, address

## Clinical Data

- **Visit Date**: Date of healthcare encounter
- **Chief Complaint**: Primary reason for visit
- **Vital Signs**: Blood pressure, temperature, weight, height
- **Clinical Assessment**: Healthcare worker observations
- **Diagnosis**: Primary and secondary diagnoses
- **Treatment Plan**: Prescribed interventions and medications

## Administrative Data

- **Healthcare Facility**: Location of care delivery
- **Healthcare Worker ID**: Provider identification
- **Visit Type**: Initial, follow-up, emergency
- **Payment Method**: Insurance, out-of-pocket, etc.
      `,
      
      'decision logic': `
# Decision Support Logic

This section outlines the clinical decision support algorithms and logic embedded in the DAK.

## Treatment Decision Algorithm

**Purpose**: Guide healthcare workers in selecting appropriate treatments based on patient characteristics and clinical findings.

**Input Variables**:
- Patient age and gender
- Clinical symptoms and signs
- Severity indicators
- Contraindications and allergies
- Resource availability

**Decision Rules**:
1. If severe symptoms present → Immediate referral
2. If moderate symptoms + risk factors → Enhanced monitoring
3. If mild symptoms → Standard treatment protocol

## Risk Stratification Logic

**Purpose**: Categorize patients based on risk level for targeted interventions.

**Risk Categories**:
- **High Risk**: Multiple risk factors, immediate intervention required
- **Medium Risk**: Some risk factors, enhanced monitoring needed
- **Low Risk**: Minimal risk factors, standard care appropriate
      `,
      
      'indicators': `
# Program Indicators

This section defines the key performance indicators for monitoring and evaluation of the DAK implementation.

## Quality Indicators

### Patient Safety Indicators
- **Adverse Event Rate**: Number of adverse events per 1000 patient visits
- **Medication Error Rate**: Percentage of medication administration errors
- **Patient Satisfaction Score**: Average patient satisfaction rating

### Clinical Quality Indicators
- **Guideline Adherence Rate**: Percentage of cases following clinical guidelines
- **Treatment Completion Rate**: Percentage of patients completing prescribed treatment
- **Diagnostic Accuracy**: Percentage of accurate initial diagnoses

## Efficiency Indicators

### Process Indicators
- **Average Wait Time**: Mean time from arrival to consultation
- **Consultation Duration**: Average time spent per patient consultation
- **Patient Throughput**: Number of patients served per day

### Resource Utilization
- **Healthcare Worker Productivity**: Patients seen per healthcare worker per day
- **Equipment Utilization Rate**: Percentage of time equipment is in use
- **Supply Stock-out Rate**: Percentage of time essential supplies are unavailable
      `,
      
      'requirements': `
# Functional and Non-Functional Requirements

This section outlines the system requirements for successful DAK implementation.

## Functional Requirements

### Core System Functions
1. **Patient Registration**: System shall support patient demographic data capture
2. **Clinical Documentation**: System shall enable structured clinical data entry
3. **Decision Support**: System shall provide real-time clinical decision support
4. **Reporting**: System shall generate standardized reports
5. **Data Export**: System shall support data export in standard formats

### User Management
1. **User Authentication**: System shall authenticate users securely
2. **Role-Based Access**: System shall enforce role-based permissions
3. **Audit Trail**: System shall maintain complete audit logs

## Non-Functional Requirements

### Performance Requirements
- **Response Time**: System responses shall be under 3 seconds
- **Concurrent Users**: System shall support up to 100 concurrent users
- **Availability**: System shall maintain 99.5% uptime

### Security Requirements
- **Data Encryption**: All data shall be encrypted in transit and at rest
- **Access Control**: Strong authentication and authorization mechanisms
- **Privacy Compliance**: Adherence to local data protection regulations

### Usability Requirements
- **User Interface**: Intuitive interface requiring minimal training
- **Mobile Compatibility**: Responsive design for mobile devices
- **Offline Capability**: Core functions available without internet connectivity
      `,
      
      'test scenarios': `
# Test Scenarios

This section defines comprehensive test scenarios for validating DAK implementation.

## Functional Test Scenarios

### Patient Registration Testing
- **Scenario**: New patient registration with complete demographic information
- **Expected Result**: Patient record created successfully with unique identifier
- **Data Requirements**: Valid demographic data set
- **Acceptance Criteria**: Registration completed within 2 minutes

### Clinical Workflow Testing
- **Scenario**: Complete patient care workflow from registration to discharge
- **Expected Result**: All clinical data captured and care plan generated
- **Data Requirements**: Clinical test cases with various conditions
- **Acceptance Criteria**: Workflow completed without errors

## Performance Test Scenarios

### Load Testing
- **Scenario**: Multiple concurrent users accessing the system
- **Expected Result**: System maintains performance under load
- **Test Parameters**: 50 concurrent users for 30 minutes
- **Acceptance Criteria**: Response times remain under 3 seconds

### Stress Testing
- **Scenario**: System behavior under extreme load conditions
- **Expected Result**: Graceful degradation without data loss
- **Test Parameters**: 200% of expected user load
- **Acceptance Criteria**: System recovers automatically when load decreases

## Security Test Scenarios

### Authentication Testing
- **Scenario**: Various authentication attempts including invalid credentials
- **Expected Result**: Appropriate access granted/denied based on credentials
- **Test Cases**: Valid login, invalid password, account lockout
- **Acceptance Criteria**: No unauthorized access permitted

### Data Protection Testing
- **Scenario**: Attempt to access patient data without proper authorization
- **Expected Result**: Access denied and security event logged
- **Test Parameters**: Various unauthorized access attempts
- **Acceptance Criteria**: All attempts blocked and logged
      `
    };

    return mockContent[componentType] || `# ${componentType.toUpperCase()}\n\nContent for ${componentType} would be generated from repository analysis.`;
  }

  /**
   * Load template configuration
   */
  async loadTemplate(templatePath) {
    if (templatePath && templatePath !== 'default') {
      // In real implementation, would load custom template
      console.log(`📋 Using custom template: ${templatePath}`);
    }
    
    return this.config.defaultTemplate;
  }

  /**
   * Generate HTML publication
   */
  async generateHTML() {
    const html = this.buildHTMLDocument();
    const css = this.generateCSS();
    
    return {
      html: html,
      css: css,
      assets: [],
      metadata: this.dakData.metadata
    };
  }

  /**
   * Build complete HTML document
   */
  buildHTMLDocument() {
    const sections = this.buildSections();
    const toc = this.generateTableOfContents();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${this.dakData.metadata.description}">
    <meta name="author" content="World Health Organization">
    <meta name="generator" content="${this.dakData.metadata.generator}">
    
    <title>${this.dakData.metadata.title}</title>
    
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="who-header">
            <div class="who-logo">WHO</div>
            <div class="document-type">SMART Guidelines Digital Adaptation Kit</div>
        </div>
        
        <div class="title-section">
            <h1>${this.dakData.metadata.title}</h1>
            <div class="subtitle">${this.dakData.metadata.description}</div>
        </div>
        
        <div class="metadata-section">
            <div class="metadata-item">
                <label>Version:</label>
                <span>${this.dakData.metadata.version}</span>
            </div>
            <div class="metadata-item">
                <label>Generated:</label>
                <span>${new Date(this.dakData.metadata.generated).toLocaleDateString()}</span>
            </div>
            <div class="metadata-item">
                <label>Repository:</label>
                <span>${this.dakData.metadata.owner}/${this.dakData.metadata.repository}</span>
            </div>
        </div>
        
        <div class="who-footer">
            <div class="copyright">© 2024 World Health Organization</div>
            <div class="license">This work is available under the Creative Commons Attribution-ShareAlike 3.0 IGO licence</div>
        </div>
    </div>

    <!-- Table of Contents -->
    <div class="page-break"></div>
    <div class="toc-page">
        <h1>Table of Contents</h1>
        ${toc}
    </div>

    <!-- Executive Summary -->
    <div class="page-break"></div>
    <div class="executive-summary">
        <h1>Executive Summary</h1>
        <p>This Digital Adaptation Kit (DAK) provides comprehensive guidance for implementing ${this.dakData.metadata.name} according to WHO SMART Guidelines methodology.</p>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-number">${this.dakData.structure.componentCount}</div>
                <div class="stat-label">DAK Components</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.dakData.structure.totalSections}</div>
                <div class="stat-label">Total Sections</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.dakData.structure.estimatedPages}</div>
                <div class="stat-label">Estimated Pages</div>
            </div>
        </div>
        
        <h2>DAK Component Overview</h2>
        <div class="component-overview">
            ${Object.keys(this.dakData.components).map(key => `
                <div class="component-card">
                    <h3>${this.dakData.components[key].title}</h3>
                    <p>${this.dakData.components[key].description}</p>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- DAK Components -->
    ${sections}

    <!-- Copyright Page -->
    <div class="page-break"></div>
    <div class="copyright-page">
        <h1>Copyright and Licensing</h1>
        <div class="copyright-notice">
            <p>© 2024 World Health Organization</p>
            
            <p>This work is available under the Creative Commons Attribution-ShareAlike 3.0 IGO licence 
            (CC BY-SA 3.0 IGO; https://creativecommons.org/licenses/by-sa/3.0/igo).</p>
            
            <p><strong>Under the terms of this licence, you may copy, redistribute and adapt the work for 
            non-commercial purposes, provided the work is appropriately cited, as indicated below. In any 
            use of this work, there should be no suggestion that WHO endorses any specific organization, 
            products or services.</strong></p>
            
            <h2>Third-party materials</h2>
            <p>If you wish to reuse material from this work that is attributed to a third party, such as 
            tables, figures or images, it is your responsibility to determine whether permission is needed 
            for that reuse and to obtain permission from the copyright holder.</p>
            
            <h2>General disclaimers</h2>
            <p>The designations employed and the presentation of the material in this publication do not 
            imply the expression of any opinion whatsoever on the part of WHO concerning the legal status 
            of any country, territory, city or area or of its authorities, or concerning the delimitation 
            of its frontiers or boundaries.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Build DAK component sections
   */
  buildSections() {
    const enabledSections = Object.entries(this.template.sections)
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.order - b.order);

    return enabledSections.map(([sectionName, config]) => {
      const component = this.dakData.components[sectionName];
      if (!component) return '';

      return `
        <div class="page-break"></div>
        <div class="component-section" id="${sectionName}">
            <h1>${component.title}</h1>
            <div class="component-description">
                <p>${component.description}</p>
            </div>
            
            <div class="component-content">
                ${this.processMarkdownContent(component.content)}
            </div>
            
            ${this.generateComponentMetadata(component, sectionName)}
        </div>
      `;
    }).join('');
  }

  /**
   * Generate component-specific metadata
   */
  generateComponentMetadata(component, sectionName) {
    let metadata = '';

    switch (sectionName) {
      case 'healthInterventions':
        if (component.iris_references?.length) {
          metadata = `
            <div class="component-metadata">
                <h3>IRIS References</h3>
                <ul>
                    ${component.iris_references.map(ref => 
                      `<li><a href="${ref.url}" target="_blank">${ref.title}</a></li>`
                    ).join('')}
                </ul>
            </div>
          `;
        }
        break;
        
      case 'personas':
        if (component.actors?.length) {
          metadata = `
            <div class="component-metadata">
                <h3>Actor Summary</h3>
                <div class="actors-grid">
                    ${component.actors.map(actor => `
                        <div class="actor-card">
                            <h4>${actor.name}</h4>
                            <div class="actor-role">${actor.role}</div>
                            <p>${actor.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
          `;
        }
        break;
        
      case 'businessProcesses':
        if (component.workflows?.length) {
          metadata = `
            <div class="component-metadata">
                <h3>Workflow Summary</h3>
                <table class="workflows-table">
                    <thead>
                        <tr>
                            <th>Workflow Name</th>
                            <th>Type</th>
                            <th>Steps</th>
                            <th>Complexity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${component.workflows.map(workflow => `
                            <tr>
                                <td>${workflow.name}</td>
                                <td>${workflow.type}</td>
                                <td>${workflow.steps}</td>
                                <td>${workflow.complexity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
          `;
        }
        break;
        
      case 'indicators':
        if (component.metrics?.length) {
          metadata = `
            <div class="component-metadata">
                <h3>Key Metrics</h3>
                <div class="metrics-grid">
                    ${component.metrics.map(metric => `
                        <div class="metric-card">
                            <h4>${metric.name}</h4>
                            <div class="metric-type">${metric.type}</div>
                            <div class="metric-target">Target: ${metric.target}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
          `;
        }
        break;
    }

    return metadata;
  }

  /**
   * Process markdown content for HTML display
   */
  processMarkdownContent(markdown) {
    // Simple markdown processing (in real implementation would use markdown-it)
    return markdown
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^(?!<[hul]|<li)(.+)$/gm, '<p>$1</p>')
      .replace(/\n\s*\n/g, '\n');
  }

  /**
   * Generate table of contents
   */
  generateTableOfContents() {
    const sections = [
      { title: 'Executive Summary', page: 3 },
      ...Object.entries(this.template.sections)
        .filter(([_, config]) => config.enabled)
        .sort(([_, a], [__, b]) => a.order - b.order)
        .map(([sectionName, config], index) => ({
          title: this.dakData.components[sectionName]?.title || sectionName,
          page: index + 4,
          anchor: sectionName
        })),
      { title: 'Copyright and Licensing', page: 99 }
    ];

    return `
      <div class="toc-list">
        ${sections.map(section => `
          <div class="toc-item">
            <div class="toc-title">
              ${section.anchor ? `<a href="#${section.anchor}">${section.title}</a>` : section.title}
            </div>
            <div class="toc-dots"></div>
            <div class="toc-page">${section.page}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate WHO-compliant CSS styles
   */
  generateCSS() {
    return `
/* WHO SMART Guidelines DAK Publication Styles */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background: white;
    font-size: 11pt;
}

/* Page layout and breaks */
.page-break {
    page-break-before: always;
}

@page {
    size: A4;
    margin: 2.5cm 2cm;
    
    @top-center {
        content: "WHO SMART Guidelines - DAK Publication";
        font-size: 9pt;
        color: #666;
    }
    
    @bottom-center {
        content: "Page " counter(page);
        font-size: 9pt;
        color: #666;
    }
}

/* WHO Branding */
.who-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 3px solid #0078d4;
    margin-bottom: 30px;
}

.who-logo {
    font-size: 24pt;
    font-weight: bold;
    color: #0078d4;
    background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.document-type {
    font-size: 12pt;
    color: #005a9e;
    font-weight: 600;
}

/* Cover page */
.cover-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 0;
}

.title-section {
    text-align: center;
    padding: 60px 0;
}

.title-section h1 {
    font-size: 28pt;
    color: #0078d4;
    margin-bottom: 20px;
    line-height: 1.3;
}

.subtitle {
    font-size: 16pt;
    color: #666;
    font-style: italic;
}

.metadata-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 8px;
    margin: 40px 0;
}

.metadata-item {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
}

.metadata-item:last-child {
    border-bottom: none;
}

.metadata-item label {
    font-weight: bold;
    color: #005a9e;
    width: 120px;
    flex-shrink: 0;
}

.metadata-item span {
    color: #333;
}

.who-footer {
    text-align: center;
    padding: 20px 0;
    border-top: 2px solid #e9ecef;
}

.copyright {
    font-size: 12pt;
    color: #005a9e;
    font-weight: 600;
    margin-bottom: 10px;
}

.license {
    font-size: 10pt;
    color: #666;
}

/* Table of Contents */
.toc-page h1 {
    color: #0078d4;
    font-size: 24pt;
    margin-bottom: 30px;
    border-bottom: 3px solid #0078d4;
    padding-bottom: 10px;
}

.toc-list {
    margin: 20px 0;
}

.toc-item {
    display: flex;
    align-items: baseline;
    padding: 8px 0;
    border-bottom: 1px dotted #ccc;
}

.toc-title {
    flex-shrink: 0;
}

.toc-title a {
    color: #0078d4;
    text-decoration: none;
}

.toc-title a:hover {
    text-decoration: underline;
}

.toc-dots {
    flex-grow: 1;
    border-bottom: 1px dotted #ccc;
    margin: 0 10px;
    height: 1px;
}

.toc-page {
    flex-shrink: 0;
    font-weight: bold;
    color: #005a9e;
}

/* Executive Summary */
.executive-summary h1 {
    color: #0078d4;
    font-size: 24pt;
    margin-bottom: 20px;
    border-bottom: 3px solid #0078d4;
    padding-bottom: 10px;
}

.summary-stats {
    display: flex;
    justify-content: space-around;
    margin: 30px 0;
    padding: 20px;
    background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
    border-radius: 8px;
    color: white;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 36pt;
    font-weight: bold;
    margin-bottom: 10px;
}

.stat-label {
    font-size: 12pt;
    opacity: 0.9;
}

.component-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.component-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #0078d4;
}

.component-card h3 {
    color: #005a9e;
    margin-bottom: 10px;
    font-size: 14pt;
}

.component-card p {
    color: #666;
    font-size: 10pt;
}

/* Component sections */
.component-section {
    margin-bottom: 40px;
}

.component-section h1 {
    color: #0078d4;
    font-size: 20pt;
    margin-bottom: 20px;
    border-bottom: 2px solid #0078d4;
    padding-bottom: 10px;
}

.component-description {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    border-left: 4px solid #40e0d0;
}

.component-description p {
    color: #666;
    font-style: italic;
    margin: 0;
}

.component-content {
    margin: 20px 0;
}

.component-content h2 {
    color: #005a9e;
    font-size: 16pt;
    margin: 25px 0 15px 0;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 8px;
}

.component-content h3 {
    color: #333;
    font-size: 14pt;
    margin: 20px 0 10px 0;
}

.component-content h4 {
    color: #555;
    font-size: 12pt;
    margin: 15px 0 8px 0;
}

.component-content p {
    margin: 10px 0;
    text-align: justify;
}

.component-content ul, .component-content ol {
    margin: 10px 0 10px 20px;
}

.component-content li {
    margin: 5px 0;
}

.component-content strong {
    color: #005a9e;
}

/* Component metadata */
.component-metadata {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.component-metadata h3 {
    color: #005a9e;
    margin-bottom: 15px;
    font-size: 14pt;
}

/* Actors grid */
.actors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.actor-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.actor-card h4 {
    color: #0078d4;
    margin-bottom: 5px;
}

.actor-role {
    font-size: 10pt;
    color: #666;
    font-style: italic;
    margin-bottom: 10px;
}

/* Workflows table */
.workflows-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.workflows-table th,
.workflows-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.workflows-table th {
    background: #0078d4;
    color: white;
    font-weight: bold;
}

.workflows-table tbody tr:hover {
    background: #f8f9fa;
}

/* Metrics grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.metric-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    text-align: center;
}

.metric-card h4 {
    color: #0078d4;
    margin-bottom: 8px;
    font-size: 12pt;
}

.metric-type {
    font-size: 10pt;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 5px;
}

.metric-target {
    font-size: 11pt;
    color: #005a9e;
    font-weight: bold;
}

/* Copyright page */
.copyright-page {
    padding: 20px 0;
}

.copyright-page h1 {
    color: #0078d4;
    font-size: 20pt;
    margin-bottom: 20px;
    border-bottom: 2px solid #0078d4;
    padding-bottom: 10px;
}

.copyright-notice p {
    margin: 15px 0;
    text-align: justify;
}

.copyright-notice h2 {
    color: #005a9e;
    font-size: 14pt;
    margin: 25px 0 10px 0;
}

/* Print optimizations */
@media print {
    body {
        font-size: 10pt;
    }
    
    .page-break {
        page-break-before: always;
    }
    
    .component-section {
        page-break-inside: avoid;
    }
    
    .component-card,
    .actor-card,
    .metric-card {
        page-break-inside: avoid;
    }
    
    a {
        color: #0078d4 !important;
        text-decoration: none;
    }
    
    a::after {
        content: " (" attr(href) ")";
        font-size: 8pt;
        color: #666;
    }
}

/* Responsive design for web viewing */
@media screen and (max-width: 768px) {
    .summary-stats {
        flex-direction: column;
        gap: 20px;
    }
    
    .actors-grid,
    .metrics-grid {
        grid-template-columns: 1fr;
    }
    
    .metadata-item {
        flex-direction: column;
    }
    
    .metadata-item label {
        width: auto;
        margin-bottom: 5px;
    }
}
    `;
  }

  /**
   * Save publication to files
   */
  async savePublication(output, options) {
    // Ensure output directory exists
    await fs.mkdir(this.config.outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const fileName = `${this.dakData.metadata.owner}-${this.dakData.metadata.repository}-${timestamp}`;
    const outputPath = path.join(this.config.outputDir, fileName);
    
    // Create publication directory
    await fs.mkdir(outputPath, { recursive: true });
    
    // Save HTML file
    const htmlPath = path.join(outputPath, 'publication.html');
    await fs.writeFile(htmlPath, output.html);
    
    // Save CSS file (separate for easier customization)
    const cssPath = path.join(outputPath, 'styles.css');
    await fs.writeFile(cssPath, output.css);
    
    // Save metadata
    const metadataPath = path.join(outputPath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify({
      ...output.metadata,
      generatedFiles: ['publication.html', 'styles.css'],
      outputPath: outputPath
    }, null, 2));
    
    // Generate a simple index.html for easy viewing
    const indexHTML = `<!DOCTYPE html>
<html>
<head>
    <title>DAK Publication - ${this.dakData.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0078d4; }
        .file-link { display: block; margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; text-decoration: none; color: #333; }
        .file-link:hover { background: #e9ecef; }
        .file-name { font-weight: bold; color: #0078d4; }
        .file-desc { font-size: 14px; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DAK Publication Generated</h1>
        <p><strong>Repository:</strong> ${this.dakData.metadata.owner}/${this.dakData.metadata.repository}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Generated Files:</h2>
        
        <a href="publication.html" class="file-link">
            <div class="file-name">📄 publication.html</div>
            <div class="file-desc">Complete DAK publication in HTML format</div>
        </a>
        
        <a href="styles.css" class="file-link">
            <div class="file-name">🎨 styles.css</div>
            <div class="file-desc">WHO-compliant styling for the publication</div>
        </a>
        
        <a href="metadata.json" class="file-link">
            <div class="file-name">📋 metadata.json</div>
            <div class="file-desc">Publication metadata and generation details</div>
        </a>
    </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(outputPath, 'index.html'), indexHTML);
    
    return outputPath;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--repo':
      case '-r':
        options.repo = args[++i];
        break;
      case '--branch':
      case '-b':
        options.branch = args[++i];
        break;
      case '--template':
      case '-t':
        options.template = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
DAK Publication Generator - Proof of Concept

Usage: node generate-dak-publication-poc.js --repo owner/repo [options]

Options:
  -r, --repo <repo>       GitHub repository (owner/repo) [required]
  -b, --branch <branch>   Repository branch (default: main)
  -t, --template <path>   Template configuration file (default: built-in)
  -o, --output <dir>      Output directory (default: ./output/dak-publications)
  -h, --help              Show this help message

Examples:
  node generate-dak-publication-poc.js --repo WorldHealthOrganization/smart-immunizations
  node generate-dak-publication-poc.js --repo who/anc-dak --branch develop
        `);
        process.exit(0);
        break;
    }
  }
  
  // Validate required arguments
  if (!options.repo) {
    console.error('❌ Error: --repo argument is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }
  
  // Set defaults
  options.branch = options.branch || 'main';
  options.template = options.template || 'default';
  
  try {
    console.log('🚀 DAK Publication Generator - Proof of Concept');
    console.log('=' .repeat(50));
    
    const generator = new DAKPublicationGeneratorPOC();
    const result = await generator.generatePublication(options);
    
    console.log('');
    console.log('✅ SUCCESS: DAK Publication Generated!');
    console.log('=' .repeat(50));
    console.log(`📁 Output Directory: ${result.outputPath}`);
    console.log(`📄 Publication Title: ${result.metadata.title}`);
    console.log(`🏷️  Repository: ${result.metadata.owner}/${result.metadata.repository}`);
    console.log(`📊 Components: ${Object.keys(result.metadata).length}`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Open the generated index.html file in your browser');
    console.log('   2. Review the publication.html for the complete document');
    console.log('   3. Customize styles.css for your organization needs');
    console.log('   4. Use this as a template for production implementation');
    
  } catch (error) {
    console.error('');
    console.error('❌ FAILED: DAK Publication Generation Failed');
    console.error('=' .repeat(50));
    console.error(`Error: ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Verify the repository path is correct (owner/repo)');
    console.error('   2. Check that you have access to the repository');
    console.error('   3. Ensure the repository is a valid WHO DAK');
    console.error('   4. Try with a different branch if specified');
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { DAKPublicationGeneratorPOC, POC_CONFIG };