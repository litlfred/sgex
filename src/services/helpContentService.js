// Help Content Service - Provides page-specific help topics and content
class HelpContentService {
  constructor() {
    // Universal help topics that appear on all pages
    this.universalTopics = {
      documentation: {
        id: 'sgex-documentation',
        title: 'View Documentation',
        badge: '/sgex/cat-paw-info-icon.svg',
        type: 'action',
        action: () => {
          // Navigate to documentation viewer in the same window
          const currentPath = window.location.pathname;
          const basePath = currentPath.includes('/sgex') ? '/sgex' : '';
          window.location.href = `${basePath}/docs/overview`;
        },
        content: `
          <p>Access comprehensive documentation and guides for using SGEX Workbench.</p>
          <div class="help-tip">
            <strong>📖 Available Documentation:</strong> Requirements, Architecture, DAK Components, User Guides, and more.
          </div>
        `
      },
      bugReport: {
        id: 'report-sgex-bug',
        title: 'Report a SGeX bug',
        badge: '/sgex/cat-paw-bug-icon.svg',
        type: 'slideshow',
        content: [
          {
            title: 'Report a Bug or Issue',
            content: `
              <p>Help us improve SGeX by reporting bugs and issues:</p>
              <h4>What type of issue are you experiencing?</h4>
              <div class="bug-report-options">
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('bug')">
                  🐛 Bug Report - Something isn't working correctly
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('feature')">
                  ✨ Feature Request - Suggest a new feature or improvement
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('question')">
                  ❓ Question - Ask for help or clarification
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('documentation')">
                  📚 Documentation Issue - Report problems with documentation
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openSgexIssue('blank')">
                  📝 Blank Issue - Create an issue without a template
                </button>
              </div>
              <div class="help-tip">
                <strong>💡 Tip:</strong> Please provide as much detail as possible including steps to reproduce, expected behavior, and actual behavior.
              </div>
              <div class="help-fallback">
                <strong>🔗 Can't access GitHub?</strong> If the buttons above don't work in your environment:
                <ol>
                  <li>Email us directly at <a href="mailto:smart@who.int?subject=SGEX Bug Report">smart@who.int</a></li>
                  <li>Or visit <a href="https://github.com/litlfred/sgex/issues/new" target="_blank">github.com/litlfred/sgex/issues/new</a> manually</li>
                </ol>
              </div>
            `
          }
        ]
      },
      dakFeedback: {
        id: 'provide-dak-feedback',
        title: 'Provide DAK Feedback',
        type: 'slideshow',
        content: [
          {
            title: 'Provide Feedback on this DAK',
            content: `
              <p>Share feedback about this Digital Adaptation Kit (DAK):</p>
              <h4>What type of feedback do you have?</h4>
              <div class="bug-report-options">
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('content')">
                  📝 Report DAK Content Error - Problems with clinical content or logic
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('bug')">
                  🐛 DAK Bug - Issue with this specific DAK content
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('improvement')">
                  📈 DAK Improvement - Suggest enhancements to this DAK
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('question')">
                  ❓ DAK Question - Ask about this DAK's implementation
                </button>
                <button class="bug-type-btn" onclick="window.helpModalInstance?.openDakIssue('blank')">
                  📝 Blank DAK Issue - Create an issue without a template
                </button>
              </div>
              <div class="help-tip">
                <strong>💡 Note:</strong> This will open an issue in the selected DAK repository for targeted feedback.
              </div>
            `
          }
        ]
      }
    };

    this.helpTopics = {
      'landing-page-unauthenticated': [
        {
          id: 'github-pat-setup',
          title: 'How to Create a GitHub Personal Access Token',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Step 1: Go to GitHub Settings',
              content: `
                <p>Navigate to your GitHub account settings:</p>
                <ol>
                  <li>Click your profile picture in the top right</li>
                  <li>Select "Settings" from the dropdown</li>
                  <li>Go to "Developer settings" → "Personal access tokens"</li>
                  <li>Choose "Fine-grained tokens" (recommended) or "Tokens (classic)"</li>
                </ol>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Fine-grained tokens provide better security with repository-specific access.
                </div>
              `
            },
            {
              title: 'Step 2: Generate New Token',
              content: `
                <p>Create your new token:</p>
                <ol>
                  <li>Click "Generate new token"</li>
                  <li>Give it a descriptive name like "SGEX Workbench"</li>
                  <li>Set expiration (90 days recommended)</li>
                  <li>Select repository access (specific repos or all)</li>
                </ol>
                <div class="help-warning">
                  <strong>⚠️ Important:</strong> You'll only see the token once, so copy it immediately!
                </div>
              `
            },
            {
              title: 'Step 3: Set Required Permissions',
              content: `
                <p>For <strong>fine-grained tokens</strong>, enable:</p>
                <ul>
                  <li><strong>Contents:</strong> Read and Write</li>
                  <li><strong>Metadata:</strong> Read</li>
                  <li><strong>Pull requests:</strong> Read and Write</li>
                </ul>
                <p>For <strong>classic tokens</strong>, select:</p>
                <ul>
                  <li><strong>repo</strong> - Full control of private repositories</li>
                  <li><strong>read:org</strong> - Read org and team membership</li>
                </ul>
              `
            },
            {
              title: 'Step 4: Use Your Token',
              content: `
                <p>Now you can authenticate with SGEX:</p>
                <ol>
                  <li>Copy your newly generated token</li>
                  <li>Paste it into the login form</li>
                  <li>Click "Sign in with Personal Access Token"</li>
                </ol>
                <div class="help-tip">
                  <strong>🔒 Security:</strong> Your token is stored securely in your browser and never shared with servers.
                </div>
              `
            }
          ]
        }
      ],
      'landing-page-authenticated': [
        {
          id: 'profile-selection',
          title: 'Selecting Your Profile or Organization',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding Profile Types',
              content: `
                <p>SGEX shows different types of profiles:</p>
                <ul>
                  <li><strong>Personal:</strong> Your individual GitHub repositories</li>
                  <li><strong>Organization:</strong> Repositories belonging to organizations you're a member of</li>
                  <li><strong>WHO Official:</strong> World Health Organization repositories (always available)</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> DAK count badges show how many SMART Guidelines repositories were found.
                </div>
              `
            }
          ]
        }
      ],
      'dak-action-selection': [
        {
          id: 'choosing-dak-action',
          title: 'Choosing Your DAK Action',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Actions',
              content: `
                <p>Choose the right action for your workflow:</p>
                <ul>
                  <li><strong>Edit Existing DAK:</strong> Modify an existing repository you have write access to</li>
                  <li><strong>Fork and Edit:</strong> Create your own copy of a repository to work on</li>
                  <li><strong>Create New DAK:</strong> Start a brand new DAK repository from scratch</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> If you're not sure, start with "Edit Existing DAK" if you have permissions, or "Fork and Edit" to experiment safely.
                </div>
              `
            }
          ]
        }
      ],
      'documentation-viewer': [
        {
          id: 'navigation-help',
          title: 'Navigating Documentation',
          type: 'slideshow',
          content: [
            {
              title: 'Using the Documentation Viewer',
              content: `
                <p>The documentation viewer provides easy access to all project information:</p>
                <ul>
                  <li>Use the sidebar menu to navigate between sections</li>
                  <li>Use the dropdown to quickly jump to any document</li>
                  <li>Click "Back" to return to the previous page</li>
                </ul>
                <div class="help-tip">
                  <strong>📖 Available Documentation:</strong> Requirements, Architecture, DAK Components, and more.
                </div>
              `
            }
          ]
        }
      ],
      'dak-dashboard': [
        {
          id: 'dak-authoring-guide',
          title: 'Authoring a DAK',
          badge: '/sgex/cat-paw-info-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Welcome to DAK Authoring',
              content: `
                <p>Welcome to the WHO SMART Guidelines Digital Adaptation Kit (DAK) authoring guide!</p>
                <p>This interactive storyboard will help you understand how to create and maintain DAKs for clinical decision support and workflow management.</p>
                <h4>Who is this for?</h4>
                <ul>
                  <li><strong>L2 Business Analysts:</strong> Clinical experts and workflow designers</li>
                  <li><strong>L3 Technical Developers:</strong> FHIR implementers and system integrators</li>
                  <li><strong>DAK Authors:</strong> Anyone contributing to digital health guidelines</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Click through the slides to learn about each component, or use the navigation dots to jump to specific topics.
                </div>
                <div class="help-actions">
                  <button class="help-action-btn" onclick="this.closest('.help-slideshow').querySelector('.slide-nav-btn:last-child').click()">
                    🚀 Start Learning
                  </button>
                </div>
              `
            },
            {
              title: 'What is a Digital Adaptation Kit (DAK)?',
              content: `
                <p>A DAK is a comprehensive package that transforms WHO health guidelines into implementable digital tools.</p>
                <h4>Key Characteristics:</h4>
                <ul>
                  <li><strong>Evidence-Based:</strong> Built from WHO clinical guidelines and recommendations</li>
                  <li><strong>Interoperable:</strong> Uses FHIR R4 and international standards</li>
                  <li><strong>Modular:</strong> Composed of 9 core components that work together</li>
                  <li><strong>Implementable:</strong> Ready for integration into health information systems</li>
                </ul>
                <h4>DAK Components Overview:</h4>
                <p>Every DAK contains <strong>9 core components</strong> organized in logical layers:</p>
                <div class="component-preview">
                  <div class="component-layer">
                    <strong>📖 Layer 1: Guidelines & Context</strong>
                    <ul><li>Health Interventions & Recommendations</li><li>Generic Personas</li><li>User Scenarios</li></ul>
                  </div>
                  <div class="component-layer">
                    <strong>🔄 Layer 2: Workflows & Logic</strong>
                    <ul><li>Business Processes</li><li>Decision Support Logic</li><li>Core Data Elements</li></ul>
                  </div>
                  <div class="component-layer">
                    <strong>📊 Layer 3: Monitoring & Quality</strong>
                    <ul><li>Program Indicators</li><li>Functional Requirements</li><li>Testing</li></ul>
                  </div>
                </div>
                <div class="help-tip">
                  <strong>📚 Reference:</strong> Based on <a href="https://worldhealthorganization.github.io/smart-ig-starter-kit/l2_dak_authoring.html" target="_blank">WHO L2 DAK Authoring Guide</a>
                </div>
              `
            },
            {
              title: '1. Health Interventions and Recommendations',
              content: `
                <p><strong>Component 1:</strong> The clinical foundation of your DAK containing evidence-based health interventions.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Clinical Guidelines:</strong> WHO recommendations and evidence</li>
                  <li><strong>IRIS References:</strong> Intervention reference specifications</li>
                  <li><strong>Publication Links:</strong> Source documents and research</li>
                  <li><strong>Evidence Grades:</strong> Strength of recommendations</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Review and validate clinical content accuracy</li>
                  <li>Ensure alignment with current WHO guidelines</li>
                  <li>Map interventions to target health conditions</li>
                  <li>Document rationale for clinical decisions</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Structure clinical content as FHIR ActivityDefinitions</li>
                  <li>Link to terminology (ICD-11, SNOMED, LOINC)</li>
                  <li>Create machine-readable clinical protocols</li>
                  <li>Validate against WHO SMART Guidelines profiles</li>
                </ul>
                <div class="help-tip">
                  <strong>🎯 Goal:</strong> Ensure all clinical recommendations are evidence-based and properly documented
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="health-interventions">
                    📖 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '2. Generic Personas',
              content: `
                <p><strong>Component 2:</strong> Standardized user roles that define who performs actions in clinical workflows.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Actor Definitions:</strong> Healthcare worker roles and responsibilities</li>
                  <li><strong>Patient Personas:</strong> Representative patient types and characteristics</li>
                  <li><strong>System Actors:</strong> Automated systems and external services</li>
                  <li><strong>Access Controls:</strong> Permissions and authorization levels</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Define realistic healthcare worker personas</li>
                  <li>Specify role-based responsibilities and permissions</li>
                  <li>Document workflow handoffs between personas</li>
                  <li>Validate personas with field experts</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Map personas to FHIR Practitioner and PractitionerRole resources</li>
                  <li>Implement role-based access control (RBAC)</li>
                  <li>Configure authentication and authorization policies</li>
                  <li>Design user interface adaptations per persona</li>
                </ul>
                <div class="help-tip">
                  <strong>🎯 Goal:</strong> Create clear role definitions that drive workflow design and system permissions
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="generic-personas">
                    👥 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '3. User Scenarios',
              content: `
                <p><strong>Component 3:</strong> Narrative descriptions of how personas interact with the system in realistic healthcare contexts.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Clinical Narratives:</strong> Step-by-step patient care stories</li>
                  <li><strong>Use Cases:</strong> Specific system interactions and outcomes</li>
                  <li><strong>Workflow Context:</strong> Environmental factors and constraints</li>
                  <li><strong>Success Criteria:</strong> Measurable outcomes and quality indicators</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Write realistic clinical scenarios based on field experience</li>
                  <li>Document workflow variations and edge cases</li>
                  <li>Specify expected outcomes and decision points</li>
                  <li>Validate scenarios with healthcare practitioners</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Convert scenarios into automated test cases</li>
                  <li>Design system interactions and API calls</li>
                  <li>Implement scenario-based validation logic</li>
                  <li>Create demonstration data and examples</li>
                </ul>
                <div class="help-tip">
                  <strong>🎯 Goal:</strong> Bridge clinical practice with technical implementation through concrete examples
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="user-scenarios">
                    📝 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '4. Generic Business Processes and Workflows',
              content: `
                <p><strong>Component 4:</strong> BPMN 2.0 workflow diagrams that model clinical care pathways and business processes.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>BPMN Diagrams:</strong> Visual workflow representations</li>
                  <li><strong>Process Models:</strong> Sequential clinical activities</li>
                  <li><strong>Decision Gates:</strong> Conditional routing and branching</li>
                  <li><strong>Task Assignments:</strong> Who performs each activity</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Design clinical workflows using BPMN notation</li>
                  <li>Map decision points to clinical guidelines</li>
                  <li>Define task sequences and parallel activities</li>
                  <li>Specify workflow inputs, outputs, and conditions</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Implement BPMN execution engines</li>
                  <li>Map BPMN tasks to FHIR operations</li>
                  <li>Configure workflow orchestration services</li>
                  <li>Build process monitoring and analytics</li>
                </ul>
                <div class="help-tip">
                  <strong>🔧 Technical Note:</strong> BPMN files use standard XML format and can be edited with the integrated visual editor
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="business-processes">
                    🔄 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '5. Core Data Elements',
              content: `
                <p><strong>Component 5:</strong> Essential data structures and terminology needed for clinical data capture and exchange.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Data Dictionary:</strong> Standardized clinical data elements</li>
                  <li><strong>Concept Maps:</strong> Terminology mapping to ICD-11, SNOMED</li>
                  <li><strong>Value Sets:</strong> Allowed values for coded fields</li>
                  <li><strong>Logical Models:</strong> Data structure definitions</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Define clinical data requirements for workflows</li>
                  <li>Map data elements to international standards</li>
                  <li>Specify data validation rules and constraints</li>
                  <li>Document clinical context and usage notes</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Create FHIR CodeSystems and ValueSets</li>
                  <li>Implement terminology servers and concept maps</li>
                  <li>Build data validation and transformation logic</li>
                  <li>Design interoperability with existing systems</li>
                </ul>
                <div class="help-tip">
                  <strong>🗃️ Technical Note:</strong> Data elements are defined in FSH (FHIR Shorthand) format in the <code>input/fsh/</code> directory
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="core-data-elements">
                    🗃️ View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '6. Decision-Support Logic',
              content: `
                <p><strong>Component 6:</strong> DMN decision tables and clinical decision support rules that encode clinical logic.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>DMN Decision Tables:</strong> Structured business rules</li>
                  <li><strong>Clinical Algorithms:</strong> Evidence-based decision logic</li>
                  <li><strong>Risk Assessment:</strong> Scoring and classification rules</li>
                  <li><strong>Care Recommendations:</strong> Automated guidance generation</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Design decision tables based on clinical guidelines</li>
                  <li>Define input conditions and output recommendations</li>
                  <li>Specify clinical thresholds and scoring criteria</li>
                  <li>Validate logic with clinical experts</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Implement DMN execution engines</li>
                  <li>Convert decisions to CQL (Clinical Quality Language)</li>
                  <li>Build real-time clinical decision support systems</li>
                  <li>Create testing frameworks for decision logic</li>
                </ul>
                <div class="help-tip">
                  <strong>🎯 Technical Note:</strong> DMN tables can be exported to CQL for FHIR-based clinical decision support
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="decision-support">
                    🎯 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '7. Program Indicators',
              content: `
                <p><strong>Component 7:</strong> Performance indicators and measurement definitions for monitoring and evaluation.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Quality Measures:</strong> Clinical outcome indicators</li>
                  <li><strong>Performance Metrics:</strong> Process and efficiency measures</li>
                  <li><strong>Aggregate Indicators:</strong> Population-level statistics</li>
                  <li><strong>Reporting Logic:</strong> Automated data aggregation rules</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Define key performance indicators (KPIs) for the health program</li>
                  <li>Specify measurement criteria and calculation methods</li>
                  <li>Map indicators to WHO monitoring frameworks</li>
                  <li>Design reporting requirements and frequencies</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Implement FHIR Measure resources</li>
                  <li>Build automated data collection and aggregation</li>
                  <li>Create dashboards and reporting interfaces</li>
                  <li>Configure real-time monitoring systems</li>
                </ul>
                <div class="help-tip">
                  <strong>📊 Goal:</strong> Enable continuous monitoring and improvement of health program outcomes
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="program-indicators">
                    📊 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '8. Functional and Non-Functional Requirements',
              content: `
                <p><strong>Component 8:</strong> System requirements specifications that define capabilities and constraints.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Functional Requirements:</strong> What the system must do</li>
                  <li><strong>Non-Functional Requirements:</strong> Performance, security, usability criteria</li>
                  <li><strong>Interface Specifications:</strong> API and integration requirements</li>
                  <li><strong>Compliance Requirements:</strong> Regulatory and standards adherence</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Document business requirements and user needs</li>
                  <li>Specify workflow capabilities and constraints</li>
                  <li>Define acceptance criteria for system features</li>
                  <li>Map requirements to clinical use cases</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Translate requirements into technical specifications</li>
                  <li>Design system architecture and component interfaces</li>
                  <li>Implement requirement traceability matrices</li>
                  <li>Build automated requirement validation tests</li>
                </ul>
                <div class="help-tip">
                  <strong>⚙️ Goal:</strong> Ensure clear, testable requirements that guide implementation and validation
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="functional-requirements">
                    ⚙️ View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: '9. Testing',
              content: `
                <p><strong>Component 9:</strong> Comprehensive testing framework for validating DAK implementation and quality.</p>
                <h4>What it contains:</h4>
                <ul>
                  <li><strong>Feature Files:</strong> Gherkin-based test scenarios</li>
                  <li><strong>Test Data:</strong> Sample patient data and test cases</li>
                  <li><strong>Validation Rules:</strong> Automated quality checks</li>
                  <li><strong>Conformance Tests:</strong> FHIR compliance validation</li>
                </ul>
                <h4>For L2 Business Analysts:</h4>
                <ul>
                  <li>Write behavior-driven test scenarios in natural language</li>
                  <li>Validate clinical workflows against user stories</li>
                  <li>Define acceptance criteria for business requirements</li>
                  <li>Review test results for clinical accuracy</li>
                </ul>
                <h4>For L3 Technical Developers:</h4>
                <ul>
                  <li>Implement automated testing frameworks</li>
                  <li>Build continuous integration/continuous deployment (CI/CD) pipelines</li>
                  <li>Create performance and load testing suites</li>
                  <li>Integrate with FHIR validation servers</li>
                </ul>
                <div class="help-tip">
                  <strong>🧪 Goal:</strong> Ensure DAK quality through comprehensive testing at all levels
                </div>
                <div class="help-actions">
                  <button class="help-action-btn component-btn" data-component="testing">
                    🧪 View in Dashboard
                  </button>
                </div>
              `
            },
            {
              title: 'DAK Authoring Workflow',
              content: `
                <p>Now that you understand the components, here's a recommended workflow for authoring a DAK:</p>
                <h4>Phase 1: Foundation (L2 Focus)</h4>
                <ol>
                  <li><strong>Health Interventions:</strong> Gather and document clinical guidelines</li>
                  <li><strong>Personas:</strong> Define user roles and responsibilities</li>
                  <li><strong>Scenarios:</strong> Write realistic clinical use cases</li>
                  <li><strong>Requirements:</strong> Document business and functional needs</li>
                </ol>
                <h4>Phase 2: Processes & Logic (L2/L3 Collaboration)</h4>
                <ol>
                  <li><strong>Business Processes:</strong> Design BPMN workflows</li>
                  <li><strong>Data Elements:</strong> Define clinical data requirements</li>
                  <li><strong>Decision Support:</strong> Create DMN decision tables</li>
                </ol>
                <h4>Phase 3: Implementation & Validation (L3 Focus)</h4>
                <ol>
                  <li><strong>Program Indicators:</strong> Build monitoring and reporting</li>
                  <li><strong>Testing:</strong> Create comprehensive test suites</li>
                  <li><strong>Validation:</strong> Ensure compliance and quality</li>
                </ol>
                <div class="help-tip">
                  <strong>🔄 Iterative:</strong> DAK authoring is iterative - expect to revisit and refine components based on testing and feedback
                </div>
              `
            },
            {
              title: 'Best Practices for DAK Authoring',
              content: `
                <h4>🎯 Clinical Accuracy</h4>
                <ul>
                  <li>Always base components on current WHO guidelines and evidence</li>
                  <li>Involve clinical experts in design and validation</li>
                  <li>Document the rationale for clinical decisions</li>
                  <li>Regular review and update cycles</li>
                </ul>
                <h4>🔗 Interoperability</h4>
                <ul>
                  <li>Use international standards (FHIR R4, ICD-11, SNOMED)</li>
                  <li>Map to existing terminology systems</li>
                  <li>Design for integration with health information systems</li>
                  <li>Follow WHO SMART Guidelines technical specifications</li>
                </ul>
                <h4>👥 Collaboration</h4>
                <ul>
                  <li>Use version control (Git) for all components</li>
                  <li>Maintain clear documentation and change logs</li>
                  <li>Regular team reviews and stakeholder feedback</li>
                  <li>Cross-functional L2/L3 team collaboration</li>
                </ul>
                <h4>🔍 Quality Assurance</h4>
                <ul>
                  <li>Implement comprehensive testing strategies</li>
                  <li>Use automated validation tools</li>
                  <li>Regular quality audits and peer reviews</li>
                  <li>Monitor implementation outcomes and iterate</li>
                </ul>
              `
            },
            {
              title: 'Next Steps',
              content: `
                <p>You're now ready to start authoring your DAK! Here's what you can do next:</p>
                <h4>🚀 Get Started</h4>
                <ul>
                  <li><strong>Explore Components:</strong> Click on any component in the dashboard to start editing</li>
                  <li><strong>Read Documentation:</strong> Access the full WHO SMART Guidelines documentation</li>
                  <li><strong>Join Community:</strong> Connect with other DAK authors and implementers</li>
                  <li><strong>Get Support:</strong> Use the help system for specific questions</li>
                </ul>
                <h4>📚 Additional Resources</h4>
                <ul>
                  <li><a href="https://worldhealthorganization.github.io/smart-ig-starter-kit/l2_dak_authoring.html" target="_blank">WHO L2 DAK Authoring Guide</a></li>
                  <li><a href="https://smart.who.int" target="_blank">WHO SMART Guidelines Portal</a></li>
                  <li><a href="https://hl7.org/fhir/R4/" target="_blank">FHIR R4 Documentation</a></li>
                  <li><a href="https://www.omg.org/bpmn/" target="_blank">BPMN 2.0 Specification</a></li>
                </ul>
                <div class="help-actions">
                  <button class="help-action-btn" onclick="this.closest('.help-modal-overlay').click()">
                    ✅ Start Creating Your DAK
                  </button>
                </div>
                <div class="help-tip">
                  <strong>💡 Remember:</strong> Use the help button anytime you need guidance while working on your DAK components!
                </div>
              `
            }
          ]
        },
        {
          id: 'dak-components-overview',
          title: 'Understanding DAK Components',
          type: 'slideshow',
          content: [
            {
              title: 'WHO SMART Guidelines DAK Components',
              content: `
                <p>Digital Adaptation Kits (DAKs) contain 9 core components organized in two levels:</p>
                <h4>Level 2: Business Logic & Processes</h4>
                <ul>
                  <li><strong>Business Processes:</strong> BPMN workflows</li>
                  <li><strong>Decision Support Logic:</strong> DMN decision tables</li>
                  <li><strong>Indicators & Measures:</strong> Performance metrics</li>
                  <li><strong>Data Entry Forms:</strong> Structured questionnaires</li>
                </ul>
                <h4>Level 3: Technical Implementation</h4>
                <ul>
                  <li><strong>Terminology:</strong> Code systems and value sets</li>
                  <li><strong>FHIR Profiles:</strong> Resource structure definitions</li>
                  <li><strong>FHIR Extensions:</strong> Custom data elements</li>
                  <li><strong>Test Data & Examples:</strong> Sample data for validation</li>
                </ul>
              `
            }
          ]
        }
      ],
      'dak-selection': [
        {
          id: 'choosing-dak-repository',
          title: 'Selecting the Right DAK Repository',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Repository Types',
              content: `
                <p>Choose the right repository based on your workflow:</p>
                <ul>
                  <li><strong>Published DAKs:</strong> Official WHO repositories with complete implementations</li>
                  <li><strong>Community DAKs:</strong> Community-maintained repositories with adaptations</li>
                  <li><strong>Template DAKs:</strong> Starting templates for creating new DAKs</li>
                  <li><strong>Private DAKs:</strong> Your private repositories or organization-specific DAKs</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Look for the "SMART Guidelines" badge to ensure compatibility.
                </div>
              `
            }
          ]
        }
      ],
      'organization-selection': [
        {
          id: 'selecting-organization',
          title: 'Choosing an Organization',
          type: 'slideshow',
          content: [
            {
              title: 'Organization vs Personal Account',
              content: `
                <p>Decide where to create or fork your DAK:</p>
                <ul>
                  <li><strong>Personal Account:</strong> For individual development and experimentation</li>
                  <li><strong>Organization Account:</strong> For team collaboration and official implementations</li>
                  <li><strong>WHO Official:</strong> Only for authorized WHO contributors</li>
                </ul>
                <div class="help-warning">
                  <strong>⚠️ Important:</strong> Make sure you have the necessary permissions for the selected organization.
                </div>
              `
            }
          ]
        }
      ],
      'bpmn-editor': [
        {
          id: 'using-bpmn-editor',
          title: 'Using the BPMN Editor',
          type: 'slideshow',
          content: [
            {
              title: 'BPMN Business Process Modeling',
              content: `
                <p>The BPMN editor helps you create and modify business process workflows:</p>
                <ul>
                  <li><strong>Drag and Drop:</strong> Use the palette to add process elements</li>
                  <li><strong>Connect Elements:</strong> Click and drag to create sequence flows</li>
                  <li><strong>Properties Panel:</strong> Configure element properties and conditions</li>
                  <li><strong>Validation:</strong> The editor highlights errors and warnings</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> BPMN processes define the clinical workflow and decision logic for your DAK.
                </div>
              `
            }
          ]
        }
      ],
      'component-editor': [
        {
          id: 'component-editor-overview',
          title: 'Understanding the Component Editor',
          type: 'slideshow',
          content: [
            {
              title: 'DAK Component Types',
              content: `
                <p>The component editor provides specialized interfaces for different DAK components:</p>
                <h4>Business Logic Components</h4>
                <ul>
                  <li><strong>Business Processes:</strong> BPMN workflow editor</li>
                  <li><strong>Decision Logic:</strong> DMN decision table editor</li>
                  <li><strong>Forms:</strong> Structured questionnaire builder</li>
                </ul>
                <h4>Technical Components</h4>
                <ul>
                  <li><strong>FHIR Resources:</strong> Profile and extension definitions</li>
                  <li><strong>Terminology:</strong> Code systems and value sets</li>
                  <li><strong>Test Data:</strong> Example data and test cases</li>
                </ul>
              `
            }
          ]
        }
      ],
      'pat-login': [
        {
          id: 'pat-authentication-help',
          title: 'Using Personal Access Tokens',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Why Personal Access Tokens?',
              content: `
                <p>SGEX uses GitHub Personal Access Tokens (PATs) for secure authentication:</p>
                <ul>
                  <li><strong>No Backend Required:</strong> Works entirely in your browser</li>
                  <li><strong>Fine-grained Control:</strong> Choose which repositories to access</li>
                  <li><strong>Enhanced Security:</strong> Can be easily rotated and revoked</li>
                  <li><strong>Privacy Focused:</strong> Your token never leaves your browser</li>
                </ul>
                <div class="help-tip">
                  <strong>🔒 Security:</strong> SGEX stores your token locally and never transmits it to any server.
                </div>
              `
            }
          ]
        }
      ],
      'pat-setup-instructions': [
        {
          id: 'detailed-pat-setup',
          title: 'Detailed PAT Setup Guide',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Token Type Comparison',
              content: `
                <p>GitHub offers two types of Personal Access Tokens:</p>
                <h4>Fine-grained Tokens (Recommended)</h4>
                <ul>
                  <li>Repository-specific access control</li>
                  <li>Better security with minimal permissions</li>
                  <li>More granular permission settings</li>
                  <li>Shorter default expiration times</li>
                </ul>
                <h4>Classic Tokens</h4>
                <ul>
                  <li>Broader scope-based permissions</li>
                  <li>Simpler permission model</li>
                  <li>Longer expiration options</li>
                  <li>Works with all GitHub integrations</li>
                </ul>
              `
            }
          ]
        }
      ],
      'welcome': [
        {
          id: 'github-pat-setup',
          title: 'How to Create a GitHub Personal Access Token',
          badge: '/sgex/cat-paw-lock-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Step 1: Go to GitHub Settings',
              content: `
                <p>Navigate to your GitHub account settings:</p>
                <ol>
                  <li>Click your profile picture in the top right</li>
                  <li>Select "Settings" from the dropdown</li>
                  <li>Go to "Developer settings" → "Personal access tokens"</li>
                  <li>Choose "Fine-grained tokens" (recommended) or "Tokens (classic)"</li>
                </ol>
                <div class="help-tip">
                  <strong>💡 Tip:</strong> Fine-grained tokens provide better security with repository-specific access.
                </div>
              `
            },
            {
              title: 'Step 2: Generate New Token',
              content: `
                <p>Create your new token:</p>
                <ol>
                  <li>Click "Generate new token"</li>
                  <li>Give it a descriptive name like "SGEX Workbench"</li>
                  <li>Set expiration (90 days recommended)</li>
                  <li>Select repository access (specific repos or all)</li>
                </ol>
                <div class="help-warning">
                  <strong>⚠️ Important:</strong> You'll only see the token once, so copy it immediately!
                </div>
              `
            },
            {
              title: 'Step 3: Set Required Permissions',
              content: `
                <p>For <strong>fine-grained tokens</strong>, enable:</p>
                <ul>
                  <li><strong>Contents:</strong> Read and Write</li>
                  <li><strong>Metadata:</strong> Read</li>
                  <li><strong>Pull requests:</strong> Read and Write</li>
                </ul>
                <p>For <strong>classic tokens</strong>, select:</p>
                <ul>
                  <li><strong>repo</strong> - Full control of private repositories</li>
                  <li><strong>read:org</strong> - Read org and team membership</li>
                </ul>
              `
            },
            {
              title: 'Step 4: Use Your Token',
              content: `
                <p>Now you can authenticate with SGEX:</p>
                <ol>
                  <li>Copy your newly generated token</li>
                  <li>Paste it into the login form</li>
                  <li>Click "Sign in with Personal Access Token"</li>
                </ol>
                <div class="help-tip">
                  <strong>🔒 Security:</strong> Your token is stored securely in your browser and never shared with servers.
                </div>
              `
            }
          ]
        }
      ],
      'dak-configuration': [
        {
          id: 'dak-configuration-guide',
          title: 'Configuring Your DAK',
          type: 'slideshow',
          content: [
            {
              title: 'Understanding DAK Configuration',
              content: `
                <p>When creating a new DAK, you need to configure both repository and FHIR settings:</p>
                <h4>Repository Configuration</h4>
                <ul>
                  <li><strong>Repository Name:</strong> GitHub repository identifier (lowercase with hyphens)</li>
                  <li><strong>Description:</strong> Brief description of your DAK's purpose</li>
                  <li><strong>Topics:</strong> Tags that help others discover your DAK</li>
                  <li><strong>Visibility:</strong> Public repositories are discoverable by the community</li>
                </ul>
                <h4>FHIR Implementation Guide Settings</h4>
                <ul>
                  <li><strong>IG ID:</strong> Unique identifier for your Implementation Guide</li>
                  <li><strong>Name:</strong> Technical name used in code generation</li>
                  <li><strong>Title:</strong> Human-readable title for documentation</li>
                  <li><strong>Publisher:</strong> Organization responsible for the DAK</li>
                </ul>
              `
            }
          ]
        }
      ],
      'core-data-dictionary-viewer': [
        {
          id: 'core-data-dictionary-help',
          title: 'Understanding Core Data Dictionary',
          badge: '/sgex/cat-paw-info-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'What is the Core Data Dictionary?',
              content: `
                <p>The Core Data Dictionary (Component 2) contains the data elements required throughout the different points of the workflow. These data elements are mapped to the International Classification of Diseases version 11 (ICD-11) codes and other established concept mapping standards to ensure the data dictionary is compatible with other digital systems.</p>
                <h4>Purpose: System Design and Interoperability</h4>
                <p>To know which data elements need to be logged and how they map to other standard terminologies (e.g. ICD, Systematized Nomenclature of Medicine [SNOMED]) for interoperability with other standards-based systems.</p>
                <h4>FHIR FSH Source Files</h4>
                <ul>
                  <li><strong>CodeSystems:</strong> Define custom codes and concepts used in your DAK</li>
                  <li><strong>ValueSets:</strong> Specify allowed values for clinical data elements</li>
                  <li><strong>ConceptMaps:</strong> Map between different terminology systems including ICD-11 and SNOMED</li>
                  <li><strong>Logical Models:</strong> Define data structures for clinical workflows</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Location:</strong> FSH files are stored in the <code>input/fsh/</code> directory of your repository.
                </div>
              `
            },
            {
              title: 'GitHub Pages Integration',
              content: `
                <p>When GitHub Pages is configured, your FSH files are automatically compiled into HTML documentation:</p>
                <h4>Published Artifacts</h4>
                <ul>
                  <li><strong>Code Systems:</strong> Browse and search your custom terminologies</li>
                  <li><strong>Value Sets:</strong> View allowed values with descriptions</li>
                  <li><strong>Logical Models:</strong> Interactive data structure documentation</li>
                  <li><strong>Concept Maps:</strong> Visual mapping between terminologies</li>
                </ul>
                <div class="help-tip">
                  <strong>⚡ URL Pattern:</strong> Main branch publishes to <code>user.github.io/repo</code>, feature branches to <code>user.github.io/repo/branches/branch-name</code>
                </div>
              `
            }
          ]
        },
        {
          id: 'github-pages-setup',
          title: 'Setting Up GitHub Pages',
          badge: '/sgex/cat-paw-settings-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'Enable GitHub Pages for Your DAK',
              content: `
                <p>Follow these steps to enable automatic publishing of your Implementation Guide:</p>
                <h4>Step 1: Repository Settings</h4>
                <ol>
                  <li>Go to your repository on GitHub</li>
                  <li>Click on the <strong>Settings</strong> tab</li>
                  <li>Scroll down to <strong>Pages</strong> in the left sidebar</li>
                  <li>Under <strong>Source</strong>, select <strong>GitHub Actions</strong></li>
                </ol>
                <div class="help-tip">
                  <strong>📋 Note:</strong> Your repository must contain a valid FHIR Implementation Guide structure with <code>sushi-config.yaml</code>
                </div>
              `
            },
            {
              title: 'Configure IG Publisher Workflow',
              content: `
                <p>Set up the automated publishing workflow:</p>
                <h4>Step 2: GitHub Actions</h4>
                <ol>
                  <li>Create <code>.github/workflows/</code> directory in your repository</li>
                  <li>Add an IG Publisher workflow file (e.g., <code>publish.yml</code>)</li>
                  <li>Configure the workflow to run on push to main branch</li>
                  <li>Include steps to build and deploy the Implementation Guide</li>
                </ol>
                <h4>Step 3: Verify Publishing</h4>
                <ul>
                  <li>Check the <strong>Actions</strong> tab for workflow status</li>
                  <li>Once successful, visit your GitHub Pages URL</li>
                  <li>Verify that artifacts are accessible from the Core Data Dictionary viewer</li>
                </ul>
                <div class="help-tip">
                  <strong>🔗 Reference:</strong> See the <a href="https://smart.who.int/ig-starter-kit/v1.0.0/ig_setup.html#ghpages-build" target="_blank">WHO IG Starter Kit</a> for detailed setup instructions.
                </div>
              `
            }
          ]
        }
      ],
      'business-process-selection': [
        {
          id: 'business-process-help',
          title: 'Understanding Business Processes',
          badge: '/sgex/cat-paw-workflow-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'What are Business Processes?',
              content: `
                <p>Business Processes (Component 5) define the clinical workflows and care processes in your DAK:</p>
                <h4>BPMN 2.0 Diagrams</h4>
                <ul>
                  <li><strong>Clinical Workflows:</strong> Step-by-step patient care processes</li>
                  <li><strong>Decision Points:</strong> Where clinical decisions are made</li>
                  <li><strong>Task Assignments:</strong> Who performs each step in the workflow</li>
                  <li><strong>Data Flows:</strong> How information moves through the process</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Standard:</strong> Uses BPMN 2.0 (Business Process Model and Notation) for workflow modeling
                </div>
              `
            },
            {
              title: 'Working with BPMN Files',
              content: `
                <p>Business process diagrams are stored as BPMN XML files in your repository:</p>
                <h4>File Management</h4>
                <ul>
                  <li><strong>Location:</strong> Typically stored in <code>input/models/</code> or <code>input/bpmn/</code></li>
                  <li><strong>Format:</strong> BPMN 2.0 XML standard format</li>
                  <li><strong>Editing:</strong> Use the built-in BPMN editor or external tools</li>
                  <li><strong>Validation:</strong> Automatic validation against BPMN 2.0 schema</li>
                </ul>
                <div class="help-tip">
                  <strong>🔧 Tools:</strong> SGeX includes an integrated BPMN editor for creating and modifying workflow diagrams
                </div>
              `
            }
          ]
        }
      ],
      'pages-manager': [
        {
          id: 'page-content-help',
          title: 'Managing Page Content',
          badge: '/sgex/cat-paw-document-icon.svg',
          type: 'slideshow',
          content: [
            {
              title: 'What is Page Content?',
              content: `
                <p>Page Content represents the narrative documentation and educational materials in your DAK:</p>
                <h4>Content Types</h4>
                <ul>
                  <li><strong>Clinical Guidelines:</strong> Evidence-based care recommendations</li>
                  <li><strong>User Guides:</strong> Instructions for healthcare workers</li>
                  <li><strong>Training Materials:</strong> Educational content and scenarios</li>
                  <li><strong>Reference Documentation:</strong> Technical specifications and background</li>
                </ul>
                <div class="help-tip">
                  <strong>💡 Format:</strong> Content is typically authored in Markdown format for easy editing and version control
                </div>
              `
            },
            {
              title: 'Content Organization',
              content: `
                <p>Page content is organized to support different user needs and workflows:</p>
                <h4>Structure</h4>
                <ul>
                  <li><strong>Pages Directory:</strong> Main content files organized by topic</li>
                  <li><strong>Assets:</strong> Images, diagrams, and multimedia content</li>
                  <li><strong>Templates:</strong> Reusable content patterns and layouts</li>
                  <li><strong>Navigation:</strong> Menus and linking between related content</li>
                </ul>
                <h4>Publishing</h4>
                <ul>
                  <li><strong>GitHub Pages:</strong> Automatic publishing of content as web pages</li>
                  <li><strong>FHIR IG:</strong> Integration with Implementation Guide publishing</li>
                  <li><strong>Version Control:</strong> Track changes and collaborate on content</li>
                </ul>
                <div class="help-tip">
                  <strong>📝 Best Practice:</strong> Use clear headings, bullet points, and visual elements to make content accessible to healthcare workers
                </div>
              `
            }
          ]
        }
      ]
    };
  }

  // Get help topics for a specific page
  getHelpTopicsForPage(pageId, contextData = {}) {
    const pageTopics = this.helpTopics[pageId] || [];
    const universalTopics = this.getUniversalTopics(contextData);
    return [...pageTopics, ...universalTopics];
  }

  // Get universal topics based on context (e.g., if DAK is selected)
  getUniversalTopics(contextData = {}) {
    const topics = [
      this.universalTopics.documentation,
      this.universalTopics.bugReport
    ];
    
    // Add DAK feedback if we have DAK context
    if (contextData.selectedDak || contextData.repository) {
      topics.push(this.universalTopics.dakFeedback);
    }
    
    return topics;
  }

  // Get a specific help topic by ID
  getHelpTopic(topicId) {
    for (const pageTopics of Object.values(this.helpTopics)) {
      const topic = pageTopics.find(t => t.id === topicId);
      if (topic) {
        return topic;
      }
    }
    return null;
  }

  // Check if a page has help topics (now always true since we have universal topics)
  hasHelpTopics(pageId, contextData = {}) {
    return true; // Always true now due to universal topics
  }

  // Add a help topic to a page
  addHelpTopicToPage(pageId, helpTopic) {
    if (!this.helpTopics[pageId]) {
      this.helpTopics[pageId] = [];
    }
    this.helpTopics[pageId].push(helpTopic);
  }

  // Get all available page IDs that have help content
  getAvailablePages() {
    return Object.keys(this.helpTopics);
  }

  // Helper method to open DAK-specific issues
  openDakIssue(issueType, dakRepository) {
    if (!dakRepository) {
      console.warn('No DAK repository specified for feedback');
      return;
    }

    const baseUrl = `https://github.com/${dakRepository.owner}/${dakRepository.name}/issues/new`;
    let url = baseUrl;

    switch (issueType) {
      case 'bug':
        url += '?template=bug_report.md&labels=bug,dak-issue';
        break;
      case 'improvement':
        url += '?template=feature_request.md&labels=enhancement,dak-improvement';
        break;
      case 'content':
        url += '?labels=content-issue,clinical-content';
        break;
      case 'question':
        url += '?template=question.md&labels=question,dak-question';
        break;
      default:
        url += '?labels=dak-feedback';
    }

    window.open(url, '_blank');
  }
}

// Create and export a singleton instance
const helpContentService = new HelpContentService();
export default helpContentService;