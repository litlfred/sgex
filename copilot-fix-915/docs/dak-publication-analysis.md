# DAK Publications - Client-Side HTML Rendering Analysis

## Executive Summary

This document provides a comprehensive analysis for implementing client-side DAK (Digital Adaptation Kit) publication rendering using React components that generate print-optimized HTML. The solution focuses on creating individual publication views for each DAK component that can be accessed from the DAK dashboard, leveraging existing React components like bpmn-viewer, and producing HTML that renders well when printed to PDF through browser print functionality.

## 1. Current State Analysis

### 1.1 Client-Side Only Architecture

**Key Constraints:**
- **No Server-Side Processing:** All rendering must happen in the browser using React components
- **Print-to-PDF Focus:** Generate HTML optimized for browser print-to-PDF functionality 
- **Leverage Existing Components:** Reuse bpmn-viewer, dmn-viewer, and other existing React components
- **Individual Component Publications:** Separate publication view for each DAK component accessible from dashboard

### 1.2 DAK Component Publication Structure

**Target Publications per DAK Component:**
1. **Business Processes** - BPMN diagram publication with process documentation
2. **Decision Support Logic** - DMN table publication with decision logic explanations  
3. **Indicators & Measures** - Performance indicator reports and measurement documentation
4. **Data Entry Forms** - Form specifications and field documentation
5. **Terminology** - Code system and value set publications
6. **FHIR Profiles** - Profile documentation and structure definitions
7. **FHIR Extensions** - Extension specifications and usage guides
8. **Test Data & Examples** - Sample data publications and validation examples

### 1.3 Styling Approach

**Graphics and Styling Extraction:**
- Extract styling elements from uploaded DAK PDFs rather than direct WHO branding
- Use WHO color schemes and typography standards without direct logo/branding usage
- Create template system that adapts to extracted visual elements from DAK publications
- Maintain professional medical publication appearance matching observed standards

### 1.4 Existing SGeX Workbench Capabilities

**Component Rendering Infrastructure:**
- **BPMNViewer.js**: Existing BPMN diagram rendering component
- **DMN Components**: Decision table visualization components
- **React Component Architecture**: Established pattern for component rendering
- **JSON Forms**: Structured data rendering capabilities
- **Markdown Editor**: `@uiw/react-md-editor` for documentation rendering

**Current DAK Dashboard Integration:**
- DAK dashboard with component access at `/dak-dashboard/{user}/{repo}/{branch}`
- Publications tab already exists in DAK dashboard
- Component routing infrastructure supporting URL patterns: `/{component}/{user}/{repo}/{branch}`
- Existing component viewers: BPMNViewer, CoreDataDictionaryViewer, etc.

**Print Optimization Challenges:**
- **BPMN Page Splitting**: Most critical challenge - handling BPMN diagrams that span multiple pages
- **Responsive Print CSS**: Need print-specific stylesheets that differ from screen rendering
- **Content Flow**: Managing page breaks across different component types
- **Cross-browser Print Compatibility**: Ensuring consistent print output across browsers

## 2. Technical Implementation Strategy

### 2.1 Component-Based Publication Architecture

**Individual Publication Views:**
Each DAK component will have a dedicated publication view accessible from the DAK dashboard:

```
/publications/business-processes/{user}/{repo}/{branch}
/publications/decision-logic/{user}/{repo}/{branch}  
/publications/data-forms/{user}/{repo}/{branch}
/publications/terminology/{user}/{repo}/{branch}
/publications/fhir-profiles/{user}/{repo}/{branch}
/publications/test-data/{user}/{repo}/{branch}
```

**React Component Structure:**
```jsx
// Component publication wrapper
const PublicationView = ({ component, dakData, printMode }) => {
  return (
    <div className={`publication-container ${component}-publication`}>
      <PublicationHeader dakInfo={dakData} component={component} />
      <ComponentSpecificContent 
        component={component} 
        data={dakData} 
        printOptimized={printMode}
      />
      <PublicationFooter />
    </div>
  );
};
```

### 2.2 Print-Optimized HTML Rendering

**CSS Print Media Queries:**
```css
@media print {
  .publication-container {
    margin: 0;
    padding: 20mm;
    font-size: 12pt;
    line-height: 1.4;
  }
  
  .page-break-before { page-break-before: always; }
  .page-break-after { page-break-after: always; }
  .no-page-break { page-break-inside: avoid; }
}
```

**BPMN Page Break Handling:**
The most critical technical challenge is splitting BPMN diagrams across pages:

```jsx
const BPMNPublicationView = ({ bpmnXml, printMode }) => {
  const [pageLayout, setPageLayout] = useState(null);
  
  useEffect(() => {
    if (printMode) {
      // Calculate BPMN layout for print pagination
      const layout = calculateBPMNPageLayout(bpmnXml);
      setPageLayout(layout);
    }
  }, [bpmnXml, printMode]);
  
  return (
    <div className="bpmn-publication">
      {pageLayout?.pages.map((page, index) => (
        <div key={index} className="bpmn-page">
          <BPMNViewerSegment 
            xml={bpmnXml} 
            viewport={page.viewport}
            pageNumber={index + 1}
          />
        </div>
      ))}
    </div>
  );
};
```

### 2.3 DAK Styling Extraction System

**PDF Graphics Extraction:**
```jsx
const StyleExtractor = ({ dakPdfUrl }) => {
  const [extractedStyles, setExtractedStyles] = useState(null);
  
  useEffect(() => {
    // Extract styling elements from uploaded DAK PDFs
    const extractStyles = async () => {
      const pdfStyles = await analyzeDakPdfStyling(dakPdfUrl);
      setExtractedStyles({
        colors: pdfStyles.colorPalette,
        fonts: pdfStyles.typography,
        layout: pdfStyles.layoutPatterns,
        graphics: pdfStyles.graphicalElements
      });
    };
    
    if (dakPdfUrl) extractStyles();
  }, [dakPdfUrl]);
  
  return extractedStyles;
};
```

**Adaptive Template System:**
```css
:root {
  /* Extracted from DAK PDF styling */
  --primary-color: var(--dak-primary, #0078d4);
  --secondary-color: var(--dak-secondary, #005a9e);
  --text-color: var(--dak-text, #333333);
  --heading-font: var(--dak-heading-font, 'Arial', sans-serif);
  --body-font: var(--dak-body-font, 'Arial', sans-serif);
}
## 3. DAK Dashboard Integration

### 3.1 Publications Navigation

**Enhanced DAK Dashboard Publications Tab:**
```jsx
const PublicationsTab = ({ dakInfo, selectedBranch }) => {
  const navigate = useNavigate();
  
  const dakComponents = [
    { id: 'business-processes', name: 'Business Processes', icon: '🔄' },
    { id: 'decision-logic', name: 'Decision Support Logic', icon: '⚖️' },
    { id: 'data-forms', name: 'Data Entry Forms', icon: '📝' },
    { id: 'terminology', name: 'Terminology', icon: '📚' },
    { id: 'fhir-profiles', name: 'FHIR Profiles', icon: '🏗️' },
    { id: 'test-data', name: 'Test Data & Examples', icon: '🧪' }
  ];
  
  return (
    <div className="publications-grid">
      {dakComponents.map(component => (
        <div 
          key={component.id}
          className="publication-component-card"
          onClick={() => navigate(`/publications/${component.id}/${dakInfo.owner}/${dakInfo.repo}/${selectedBranch}`)}
        >
          <span className="component-icon">{component.icon}</span>
          <h3>{component.name}</h3>
          <p>Generate publication view</p>
          <button className="print-button">📄 View/Print</button>
        </div>
      ))}
    </div>
  );
};
```

### 3.2 Component-Specific Publication Views

**Business Process Publication:**
```jsx
const BusinessProcessPublication = ({ user, repo, branch }) => {
  const [bpmnFiles, setBpmnFiles] = useState([]);
  const [printMode, setPrintMode] = useState(false);
  
  return (
    <div className="publication-view business-process-publication">
      <PublicationHeader 
        title="Business Processes"
        dakInfo={{ user, repo, branch }}
        onPrintToggle={() => setPrintMode(!printMode)}
      />
      
      {bpmnFiles.map((file, index) => (
        <div key={index} className="process-section">
          <h2>{file.processName}</h2>
          <BPMNPublicationRenderer 
            bpmnXml={file.content}
            printOptimized={printMode}
          />
          <ProcessDocumentation content={file.documentation} />
        </div>
      ))}
    </div>
  );
};
```

## 4. Critical Technical Challenges

### 4.1 BPMN Page Break Solutions

**Challenge:** BPMN diagrams often don't fit on a single page and need intelligent splitting.

**Proposed Solutions:**

1. **Viewport-Based Segmentation:**
```jsx
const calculateBPMNPageLayout = (bpmnXml) => {
  const viewer = new BpmnJS({ container: document.createElement('div') });
  viewer.importXML(bpmnXml);
  
  const canvas = viewer.get('canvas');
  const viewbox = canvas.viewbox();
  
  // Calculate page boundaries based on A4 print dimensions
  const pageWidth = 210 - 40; // A4 width minus margins (mm)
  const pageHeight = 297 - 40; // A4 height minus margins (mm)
  
  const pages = [];
  let currentY = viewbox.y;
  
  while (currentY < viewbox.y + viewbox.height) {
    pages.push({
      viewport: {
        x: viewbox.x,
        y: currentY,
        width: Math.min(pageWidth, viewbox.width),
        height: Math.min(pageHeight, viewbox.y + viewbox.height - currentY)
      }
    });
    currentY += pageHeight;
  }
  
  return { pages };
};
```

2. **Element-Aware Breaking:**
```jsx
const splitBPMNByElements = (bpmnXml) => {
  // Analyze BPMN elements and group by logical sections
  // Ensure elements don't get cut across page boundaries
  const elementGroups = analyzeElementGrouping(bpmnXml);
  return groupsToPages(elementGroups);
};
```

### 4.2 Print CSS Optimization

**Print-Specific Stylesheets:**
```css
@media print {
  /* Hide navigation and interactive elements */
  .navigation, .toolbar, .sidebar { display: none !important; }
  
  /* Optimize fonts and spacing for print */
  body { 
    font-family: "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.3;
  }
  
  /* BPMN diagram print optimization */
  .bpmn-publication .djs-container {
    border: none !important;
    background: white !important;
  }
  
  /* Page break controls */
  .page-break-before { page-break-before: always; }
  .page-break-after { page-break-after: always; }
  .no-page-break { page-break-inside: avoid; }
  
  /* Footer on every page */
  .publication-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20mm;
    font-size: 9pt;
  }
}
```

## 5. Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create base publication component structure
- [ ] Implement print CSS framework
- [ ] Add publications routing to DAK dashboard
- [ ] Set up styling extraction utilities
- [ ] Create GitHub workflow for automated publication generation

### Phase 2: Component Publications (Weeks 3-4)
- [ ] Business Process publication view with BPMN rendering
- [ ] Decision Logic publication with DMN tables
- [ ] Basic page break handling for diagrams
- [ ] Single-page HTML generation for complete DAK

### Phase 3: EPUB Integration (Weeks 5-6)
- [ ] EPUB generation library integration
- [ ] DAK component to EPUB chapter conversion
- [ ] Diagram to image conversion for EPUB embedding
- [ ] EPUB metadata and structure generation

### Phase 4: Print Optimization & GitHub Integration (Weeks 7-8)
- [ ] Advanced BPMN page splitting algorithm
- [ ] Cross-browser print compatibility testing
- [ ] Print preview functionality
- [ ] GitHub Actions workflow implementation for artifact generation

### Phase 5: Status Bar & Artifact Management (Weeks 9-10)
- [ ] Publications status bar integration
- [ ] Artifact download and display functionality
- [ ] Build log linking and status monitoring
- [ ] IG Publisher coordination and .tgz artifact handling

### Phase 6: Styling & Polish (Weeks 11-12)
- [ ] DAK PDF styling extraction integration
- [ ] Responsive print layouts
- [ ] Documentation and user guides

## 6. Technical Specifications

### 6.1 Required Libraries

**Core Dependencies:**
- `bpmn-js`: Existing BPMN viewer (already installed)
- `react-to-print`: Print functionality for React components
- `pdf-lib`: PDF analysis for styling extraction (new)
- `epub`: EPUB generation library (new)
- `epub.js`: EPUB reading/parsing library (new)
- `canvas`: Node.js canvas for server-side diagram rendering
- `jsdom`: DOM implementation for Node.js workflow scripts

**CSS Framework:**
- Print media queries for optimal PDF output
- CSS variables for theme extraction from DAK PDFs
- EPUB-specific stylesheets for e-reader compatibility

### 6.2 File Structure

```
src/
├── components/
│   ├── publications/
│   │   ├── PublicationView.js          # Base publication component
│   │   ├── BusinessProcessPublication.js
│   │   ├── DecisionLogicPublication.js
│   │   ├── DataFormsPublication.js
│   │   ├── EPUBGenerator.js            # EPUB generation component
│   │   ├── PublicationStatusBar.js     # Status bar with artifacts
│   │   └── shared/
│   │       ├── PublicationHeader.js
│   │       ├── PublicationFooter.js
│   │       └── PrintControls.js
│   └── viewers/
│       ├── BPMNPublicationViewer.js    # Print-optimized BPMN viewer
│       └── PrintOptimizedViewer.js     # Base class for print viewers
├── services/
│   ├── publicationService.js           # Publication data management
│   ├── styleExtractionService.js       # DAK PDF styling extraction
│   ├── printLayoutService.js           # Page layout calculations
│   ├── epubService.js                  # EPUB generation service
│   └── githubWorkflowService.js        # GitHub Actions integration
├── scripts/
│   ├── generate-html-publication.js    # HTML generation script
│   ├── generate-epub-publication.js    # EPUB generation script
│   └── package-artifacts.js            # Artifact packaging script
└── styles/
    ├── publications.css                # Screen styles for publications
    ├── print.css                       # Print-specific styles
    └── epub.css                        # EPUB-specific styles
```

## 7. Success Criteria

### 7.1 Functional Requirements
- [ ] Individual publication view for each DAK component accessible from dashboard
- [ ] Print-to-PDF functionality produces professional-quality output
- [ ] BPMN diagrams render correctly across page breaks
- [ ] Styling adapts to extracted DAK PDF graphics and colors
- [ ] EPUB format generation for complete DAK with embedded diagrams
- [ ] Single-page HTML generation for complete DAK
- [ ] GitHub workflow automatically generates publication artifacts on merge
- [ ] Publications status bar displays available artifacts with download links
- [ ] Build logs accessible and linked from status bar

### 7.2 Quality Standards
- [ ] Print output quality matches professional publication standards
- [ ] Page breaks occur at logical content boundaries
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design supports different paper sizes
- [ ] EPUB files are compatible with standard e-readers
- [ ] Generated artifacts meet WHO publication quality standards

### 7.3 Performance Targets
- [ ] Publication views load within 3 seconds for typical DAK components
- [ ] Print preparation completes within 5 seconds for BPMN-heavy content
- [ ] Client-side processing handles DAKs up to 50 BPMN diagrams
- [ ] EPUB generation completes within 10 seconds for typical DAK
- [ ] GitHub workflow completes within 5 minutes for standard DAK
- [ ] Artifact downloads are available within 1 minute of workflow completion

This analysis provides a comprehensive roadmap for implementing client-side DAK publication rendering that meets the requirements of browser-based print-to-PDF functionality while leveraging existing React components and maintaining the WHO styling standards through extracted graphics from DAK PDFs.

## 8. EPUB Publication Format Integration

### 8.1 EPUB Generation Architecture

**Client-Side EPUB Creation:**
```javascript
const EPUBGenerator = ({ dakData, templateConfig }) => {
  const [epubStatus, setEpubStatus] = useState('ready');
  
  const generateEPUB = async () => {
    setEpubStatus('generating');
    
    try {
      // Create EPUB structure
      const epub = new EPUBBuilder({
        title: dakData.metadata.title,
        author: dakData.metadata.authors.join(', '),
        publisher: 'WHO SMART Guidelines',
        language: dakData.metadata.language || 'en',
        pubDate: new Date().toISOString()
      });
      
      // Add cover page
      epub.addCover(await generateCoverHTML(dakData));
      
      // Add table of contents
      epub.addTOC(generateTOCFromDAK(dakData));
      
      // Add DAK components as chapters
      for (const component of dakData.components) {
        const chapterHTML = await renderComponentHTML(component, templateConfig);
        epub.addChapter({
          title: component.title,
          content: chapterHTML,
          images: await extractComponentImages(component)
        });
      }
      
      // Generate and download EPUB
      const epubBlob = await epub.generate();
      downloadEPUB(epubBlob, `${dakData.metadata.title}.epub`);
      
      setEpubStatus('completed');
    } catch (error) {
      setEpubStatus('failed');
      console.error('EPUB generation failed:', error);
    }
  };
  
  return (
    <div className="epub-generator">
      <button onClick={generateEPUB} disabled={epubStatus === 'generating'}>
        {epubStatus === 'generating' ? 'Generating EPUB...' : 'Download EPUB'}
      </button>
      {epubStatus === 'failed' && (
        <div className="error">EPUB generation failed. Please try again.</div>
      )}
    </div>
  );
};
```

### 8.2 EPUB Content Structure

**Chapter Organization:**
```javascript
const generateEPUBStructure = (dakData) => {
  return {
    metadata: {
      title: dakData.title,
      identifier: `urn:isbn:${dakData.isbn || generateISBN()}`,
      creator: dakData.authors,
      date: dakData.publicationDate,
      language: dakData.language || 'en'
    },
    chapters: [
      {
        id: 'cover',
        title: 'Cover',
        content: generateCoverHTML(dakData)
      },
      {
        id: 'toc',
        title: 'Table of Contents',
        content: generateTOCHTML(dakData)
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary', 
        content: dakData.executiveSummary
      },
      ...dakData.components.map(component => ({
        id: `component-${component.id}`,
        title: component.title,
        content: renderComponentForEPUB(component)
      })),
      {
        id: 'appendices',
        title: 'Appendices',
        content: generateAppendicesHTML(dakData)
      }
    ],
    assets: {
      stylesheets: ['styles/epub.css'],
      images: extractAllImages(dakData),
      fonts: extractRequiredFonts(dakData)
    }
  };
};
```

### 8.3 EPUB Image Handling

**Diagram Conversion for EPUB:**
```javascript
const convertDiagramsForEPUB = async (component) => {
  const images = [];
  
  if (component.type === 'business-processes') {
    // Convert BPMN diagrams to images
    for (const bpmn of component.bpmnDiagrams) {
      const canvas = await renderBPMNToCanvas(bpmn.xml);
      const imageBlob = await canvasToBlob(canvas, 'image/png');
      images.push({
        id: `bpmn-${bpmn.id}`,
        filename: `diagrams/bpmn-${bpmn.id}.png`,
        blob: imageBlob,
        alt: bpmn.title || 'BPMN Process Diagram'
      });
    }
  }
  
  if (component.type === 'decision-logic') {
    // Convert DMN tables to images
    for (const dmn of component.dmnTables) {
      const canvas = await renderDMNToCanvas(dmn.xml);
      const imageBlob = await canvasToBlob(canvas, 'image/png');
      images.push({
        id: `dmn-${dmn.id}`,
        filename: `diagrams/dmn-${dmn.id}.png`,
        blob: imageBlob,
        alt: dmn.title || 'DMN Decision Table'
      });
    }
  }
  
  return images;
};
```

## 9. GitHub Workflow Integration

### 9.1 Automated Publication Workflow

**GitHub Actions Workflow:**
```yaml
# .github/workflows/dak-publication.yml
name: Generate DAK Publications

on:
  push:
    branches: [main, deploy]
  pull_request:
    branches: [main]

jobs:
  generate-publications:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build SGeX Workbench
      run: npm run build
      
    - name: Generate DAK Publications
      run: |
        npm run dak:generate-html
        npm run dak:generate-epub
        npm run dak:package-artifacts
      env:
        DAK_REPO: ${{ github.repository }}
        DAK_BRANCH: ${{ github.ref_name }}
        
    - name: Run IG Publisher
      run: |
        wget -q https://github.com/HL7/fhir-ig-publisher/releases/latest/download/publisher.jar
        java -jar publisher.jar -ig .
        
    - name: Package all artifacts
      run: |
        mkdir -p publication-artifacts
        cp dist/dak-complete.html publication-artifacts/
        cp dist/dak-complete.epub publication-artifacts/
        cp output/*.tgz publication-artifacts/ || true
        
    - name: Upload artifacts to release
      if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/deploy')
      uses: actions/upload-artifact@v4
      with:
        name: dak-publications-${{ github.sha }}
        path: publication-artifacts/
        retention-days: 90
        
    - name: Create release on tag
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: publication-artifacts/*
        body: |
          Automated DAK publication artifacts for ${{ github.ref_name }}
          
          Generated artifacts:
          - `dak-complete.html` - Single-page HTML publication
          - `dak-complete.epub` - EPUB format publication  
          - `*.tgz` - IG Publisher outputs
```

### 9.2 Publication Artifact Generation Scripts

**Package.json Scripts:**
```json
{
  "scripts": {
    "dak:generate-html": "node scripts/generate-html-publication.js",
    "dak:generate-epub": "node scripts/generate-epub-publication.js", 
    "dak:package-artifacts": "node scripts/package-artifacts.js",
    "dak:publish": "npm run dak:generate-html && npm run dak:generate-epub && npm run dak:package-artifacts"
  }
}
```

**HTML Generation Script:**
```javascript
// scripts/generate-html-publication.js
const { renderDAKToHTML } = require('../src/services/publicationService');
const fs = require('fs/promises');
const path = require('path');

async function generateHTMLPublication() {
  try {
    console.log('Generating DAK HTML publication...');
    
    // Load DAK data from repository
    const dakData = await loadDAKFromRepository();
    
    // Generate single-page HTML
    const htmlContent = await renderDAKToHTML(dakData, {
      template: 'who-standard',
      format: 'single-page',
      includeNavigation: true,
      optimizeForPrint: true
    });
    
    // Write to dist directory
    await fs.mkdir('dist', { recursive: true });
    await fs.writeFile('dist/dak-complete.html', htmlContent);
    
    console.log('HTML publication generated successfully');
    
    // Generate metadata
    const metadata = {
      generated: new Date().toISOString(),
      version: process.env.GITHUB_SHA || 'local',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      size: htmlContent.length,
      components: dakData.components.length
    };
    
    await fs.writeFile('dist/publication-metadata.json', JSON.stringify(metadata, null, 2));
    
  } catch (error) {
    console.error('HTML publication generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateHTMLPublication();
}
```

### 9.3 Publications Status Bar Integration

**Status Bar Component:**
```jsx
const PublicationStatusBar = ({ user, repo, branch }) => {
  const [artifacts, setArtifacts] = useState([]);
  const [buildStatus, setBuildStatus] = useState('unknown');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPublicationStatus = async () => {
      try {
        // Get latest workflow runs
        const workflows = await githubService.getWorkflowRuns(user, repo, 'dak-publication.yml');
        const latestRun = workflows.data.workflow_runs[0];
        
        if (latestRun) {
          setBuildStatus(latestRun.status);
          
          if (latestRun.status === 'completed') {
            // Get artifacts from the run
            const artifacts = await githubService.getWorkflowArtifacts(user, repo, latestRun.id);
            setArtifacts(artifacts.data.artifacts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch publication status:', error);
        setBuildStatus('failed');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicationStatus();
  }, [user, repo, branch]);
  
  const downloadArtifact = async (artifact) => {
    try {
      const downloadUrl = await githubService.getArtifactDownloadUrl(user, repo, artifact.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download artifact:', error);
    }
  };
  
  return (
    <div className="publication-status-bar">
      <div className="status-indicator">
        <span className={`status-badge ${buildStatus}`}>
          {buildStatus === 'completed' && '✅'}
          {buildStatus === 'in_progress' && '⏳'}
          {buildStatus === 'failed' && '❌'}
          {buildStatus === 'unknown' && '❓'}
        </span>
        <span>Publications: {buildStatus}</span>
      </div>
      
      {artifacts.length > 0 && (
        <div className="artifacts-dropdown">
          <button className="artifacts-toggle">
            📦 Artifacts ({artifacts.length})
          </button>
          <div className="artifacts-menu">
            {artifacts.map(artifact => (
              <div key={artifact.id} className="artifact-item">
                <span className="artifact-name">{artifact.name}</span>
                <span className="artifact-size">{formatBytes(artifact.size_in_bytes)}</span>
                <button 
                  onClick={() => downloadArtifact(artifact)}
                  className="download-btn"
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="build-logs-link">
        <a 
          href={`https://github.com/${user}/${repo}/actions/workflows/dak-publication.yml`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📋 Build Logs
        </a>
      </div>
    </div>
  );
};
```

### 9.4 Enhanced Publication Requirements

**Updated Dependencies:**
```json
{
  "epub": "^1.2.0",
  "epub.js": "^0.3.93", 
  "canvas": "^2.11.2",
  "jsdom": "^23.0.1"
}
```

**Implementation Priorities:**
1. **Single-page HTML Generation:** Complete DAK as single HTML document with embedded CSS
2. **EPUB Format Support:** Full DAK publication with chapter navigation and embedded diagrams
3. **GitHub Workflow Integration:** Automated artifact generation on merge events
4. **Status Bar Display:** Real-time publication status with download links and build logs
5. **IG Publisher Integration:** Coordination with existing FHIR IG publishing workflow

This enhancement provides a comprehensive publication system that generates multiple formats automatically while maintaining the client-side architecture and integrating seamlessly with existing GitHub workflows.
**Approach:** React templates with specialized export libraries
**Libraries:** React, Puppeteer/Playwright (via API), docx.js, html2canvas

**Pros:**
- Best of both worlds - React development + multi-format export
- Precise control over layout and styling
- Can leverage existing React component library
- Client-side Word document generation with docx.js

**Cons:**
- Complex PDF generation setup
- Multiple libraries to maintain
- Potential layout inconsistencies between formats

### 2.2 WYSIWYG Template Editor Options

#### Option A: Rich Text Editor Integration
**Libraries:** TinyMCE, CKEditor, or Quill with custom WHO styling

**Features:**
- Visual template editing with live preview
- Custom WHO SMART Guidelines styling presets
- Block-based editing for DAK component sections
- Template variable insertion (e.g., {{dak.title}}, {{component.content}})

#### Option B: Block-Based Visual Builder
**Libraries:** React-based page builder (GrapesJS React wrapper, or custom)

**Features:**
- Drag-and-drop template construction
- Pre-built WHO-branded components
- Visual styling controls
- Template inheritance and variables

#### Option C: Code-First with Visual Preview
**Libraries:** Monaco Editor + React preview pane

**Features:**
- Template code editing with syntax highlighting
- Real-time preview of rendered output
- Template validation and error checking
- Version control integration

## 3. Implementation Architecture

### 3.1 Recommended Approach: Hybrid React + Multi-format Export

**Core Components:**
```javascript
DAKPublicationSystem/
├── TemplateEngine/
│   ├── ReactTemplateRenderer.js     // Renders DAK content to React components
│   ├── TemplateRegistry.js          // Manages available templates
│   ├── ContentExtractor.js          // Extracts content from DAK components
│   └── VariableResolver.js          // Resolves template variables
├── ExportEngine/
│   ├── HTMLExporter.js              // Static HTML generation
│   ├── PDFExporter.js               // PDF generation via html2canvas + jsPDF
│   ├── WordExporter.js              // DOCX generation via docx.js
│   └── PreviewRenderer.js           // Live preview functionality
├── Templates/
│   ├── WHOStandardTemplate/         // Default WHO SMART Guidelines template
│   ├── CustomTemplates/             // Organization-specific templates
│   └── ComponentLayouts/            // Individual DAK component layouts
└── Editor/
    ├── WYSIWYGTemplateEditor.js     // Visual template editing interface
    ├── TemplateValidator.js         // Template validation and testing
    └── PreviewPane.js               // Multi-format preview
```

### 3.2 Data Model Extensions

**DAK Publication Metadata:**
```javascript
{
  "publication": {
    "metadata": {
      "title": "string",
      "version": "string", 
      "authors": ["string"],
      "copyright": "string",
      "publicationDate": "ISO8601",
      "status": "draft|review|published",
      "doi": "string", // Optional DOI identifier
      "isbn": "string" // Optional ISBN
    },
    "preMatter": {
      "executiveSummary": "markdown",
      "acknowledgments": "markdown",
      "glossary": [
        {
          "term": "string",
          "definition": "string"
        }
      ]
    },
    "styling": {
      "template": "template-id",
      "customCSS": "string",
      "branding": {
        "logo": "url",
        "primaryColor": "hex",
        "secondaryColor": "hex"
      }
    },
    "outputFormats": {
      "html": {
        "enabled": true,
        "singlePage": false,
        "includeNavigation": true
      },
      "pdf": {
        "enabled": true,
        "pageSize": "A4",
        "includeTableOfContents": true,
        "includePageNumbers": true
      },
      "docx": {
        "enabled": true,
        "includeTrackChanges": false,
        "includeComments": false
      }
    }
  }
}
```

## 4. Library Recommendations

### 4.1 Core Libraries

**Template Rendering:**
- `react` + `react-dom/server` for React-based templates
- `handlebars` as fallback for simple templates
- `mustache` for logic-less templates

**Export Libraries:**
- `jspdf` + `html2canvas` for PDF generation
- `docx` for Word document generation
- `jszip` for packaging multiple files
- `file-saver` for client-side downloads

**WYSIWYG Editor:**
- `@tinymce/tinymce-react` for rich text editing
- `monaco-editor` for code-based template editing
- `react-beautiful-dnd` for drag-and-drop functionality

**Styling & Layout:**
- `styled-components` for component styling
- `@emotion/react` as alternative CSS-in-JS solution
- `react-pdf` for PDF-specific layout components

### 4.2 WHO Branding Integration

**Design System:**
- Create WHO SMART Guidelines design tokens
- Implement consistent typography scale
- Define color palette and spacing system
- Create reusable component library

**Template Variables:**
```javascript
// Available template variables for WHO branding
{
  "who": {
    "logo": "official WHO logo URL",
    "colors": {
      "primary": "#0093D1",      // WHO Blue
      "secondary": "#00A651",    // WHO Green
      "accent": "#F39C12"        // WHO Orange
    },
    "typography": {
      "headingFont": "Arial, sans-serif",
      "bodyFont": "Arial, sans-serif"
    }
  }
}
```

## 5. Integration with Existing SGeX Workbench

### 5.1 Component Integration Points

**DAK Dashboard Integration:**
- Add "Create Publication" button to DAK component management
- Publication status tracking in DAK overview
- Template selection during DAK creation

**Content Extraction:**
- Integrate with existing editor components (BPMN, DMN, etc.)
- Extract structured content from JSON Forms
- Aggregate content from all 9 DAK components

**GitHub Integration:**
- Store publication templates in DAK repositories
- Version control for template changes
- Automated publication updates via GitHub Actions

### 5.2 URL Routing Extensions

**New Routes:**
```javascript
// Publication management routes
/publication-editor/{user}/{repo}/{branch}     // Template editor
/publication-preview/{user}/{repo}/{branch}    // Multi-format preview
/publication-export/{user}/{repo}/{branch}     // Export interface
/publication-templates                          // Template gallery
```

## 6. Implementation Phases

### Phase 1: Foundation (4-6 weeks)
- [ ] Create publication data model extensions
- [ ] Implement basic React template system
- [ ] Build content extraction from existing DAK components
- [ ] Create simple HTML export functionality
- [ ] Design WHO SMART Guidelines default template

### Phase 2: Multi-format Export (3-4 weeks)
- [ ] Implement PDF export using jsPDF + html2canvas
- [ ] Add Word document export using docx.js
- [ ] Create export configuration interface
- [ ] Add batch export functionality
- [ ] Implement download and sharing features

### Phase 3: WYSIWYG Editor (4-5 weeks)
- [ ] Build visual template editor interface
- [ ] Implement template variable system
- [ ] Create drag-and-drop component builder
- [ ] Add real-time preview functionality
- [ ] Implement template validation and testing

### Phase 4: Advanced Features (3-4 weeks)
- [ ] Custom template upload and management
- [ ] Advanced styling and branding options
- [ ] Collaborative template editing
- [ ] Publication workflow automation
- [ ] Integration with GitHub Actions for automated builds

## 7. Technical Challenges & Solutions

### 7.1 Client-Side PDF Generation
**Challenge:** High-quality PDF generation without server-side processing
**Solution:** 
- Use html2canvas for high-fidelity rendering
- Implement jsPDF for PDF assembly
- Create print-specific CSS for optimal layout
- Consider Puppeteer API integration for complex layouts

### 7.2 Word Document Compatibility
**Challenge:** Maintaining layout fidelity in Word documents
**Solution:**
- Use docx.js for programmatic Word document creation
- Create Word-specific template layouts
- Implement style mapping between HTML and Word formats
- Provide post-processing instructions for users

### 7.3 Template Version Management
**Challenge:** Template compatibility across DAK versions
**Solution:**
- Implement semantic versioning for templates
- Create migration utilities for template upgrades
- Maintain backward compatibility matrix
- Provide template validation tools

### 7.4 Performance Optimization
**Challenge:** Large DAK publications may cause performance issues
**Solution:**
- Implement lazy loading for template components
- Use Web Workers for heavy export operations
- Implement progressive rendering for large documents
- Add caching for frequently exported content

## 8. Cost-Benefit Analysis

### 8.1 Development Costs
**Estimated Effort:** 14-19 weeks of development time
**Resource Requirements:**
- 1 Senior React Developer (template system)
- 1 Frontend Developer (UI/UX implementation)  
- 1 DevOps Engineer (GitHub integration)
- Design consultation for WHO branding compliance

### 8.2 Benefits
**User Benefits:**
- Consistent, professional DAK publications
- Multi-format output for different use cases
- Reduced manual formatting effort
- WHO brand compliance automatically enforced

**Organizational Benefits:**
- Standardized DAK presentation across projects
- Improved collaboration through shared templates
- Automated publication workflows
- Better version control for publication materials

## 9. Risk Assessment

### 9.1 Technical Risks
**High Risk:**
- PDF generation quality and performance
- Cross-browser compatibility for export features
- Large file size handling

**Medium Risk:**
- Template editor complexity
- Word document format limitations
- Mobile device compatibility

**Low Risk:**
- React component integration
- GitHub API integration
- Basic HTML export functionality

### 9.2 Mitigation Strategies
- Prototype PDF generation early with representative content
- Implement progressive enhancement for export features
- Create fallback options for each export format
- Establish performance benchmarks and monitoring

## 10. Recommendations

### 10.1 Recommended Implementation Approach

**Primary Recommendation: Hybrid React + Multi-format Export (Enhanced with PDF Analysis)**

Based on analysis of the 9 provided WHO DAK publication examples, this approach provides the best balance of:
- **Fidelity to WHO Standards:** Can accurately reproduce layouts and styling observed in reference PDFs
- **Development efficiency:** Leveraging existing React infrastructure while meeting publication quality requirements
- **User experience:** WYSIWYG editing with live preview that matches actual WHO publication appearance
- **Output quality:** Multiple high-fidelity export formats that meet observed WHO publication standards
- **Maintainability:** Consistent with existing codebase while extending capabilities

**Enhanced Implementation Priorities Based on PDF Examples:**
1. **WHO Branding Compliance:** Implement exact color schemes, typography, and logo placement observed in reference publications
2. **Layout Fidelity:** Ensure generated publications match the structural patterns and formatting quality of provided examples
3. **Accessibility Standards:** Match or exceed the accessibility features present in WHO reference documents
4. **Quality Benchmarks:** Achieve file sizes, image quality, and formatting precision comparable to official WHO publications

### 10.2 Key Success Factors

1. **PDF Example Analysis:** Complete detailed analysis of provided WHO publications to extract:
   - Exact color codes, font specifications, and spacing measurements
   - Layout templates and structural patterns
   - Accessibility features and metadata requirements
   - Quality benchmarks for generated outputs

2. **WHO Design Compliance:** Ensure all template designs precisely match the standards observed in the 9 reference publications

3. **Comparative Quality Testing:** Implement testing framework that compares generated publications against reference examples for:
   - Visual layout accuracy
   - Typography and branding consistency  
   - File format compliance and accessibility

4. **User Testing:** Conduct testing with actual DAK authors using the reference publications as quality benchmarks

5. **Performance Focus:** Prioritize performance optimization while maintaining the quality standards established by WHO examples

6. **Incremental Delivery:** Implement core functionality first, validated against reference examples, then add advanced features iteratively

### 10.3 Alternative Approaches for Consideration

**Simplified Approach:** If development resources are limited:
- Start with HTML export targeting the layout patterns observed in WHO PDFs
- Use reference examples to define minimum viable formatting requirements
- Focus on exact reproduction of WHO branding elements first
- Add PDF/Word export as secondary phase with quality validation against examples

**Enterprise Approach:** For larger implementations:
- Implement automated comparison testing against the 9 reference publications
- Create template generation based on exact measurements extracted from WHO PDFs
- Advanced workflow supporting the publication approval processes observed in WHO standards
- Multi-language support matching the internationalization patterns in reference documents

## 11. Analysis Update: WHO DAK Reference Publications

**Enhanced Analysis Based on Concrete Examples:**
The addition of 9 WHO DAK reference publications (Issue #915) has significantly enhanced this technical analysis by providing concrete examples of WHO publication standards. This update includes:

**Key Analysis Enhancements:**
1. **Concrete Quality Benchmarks:** Analysis now includes specific quality targets based on actual WHO publications rather than theoretical requirements
2. **Layout Pattern Documentation:** Reference examples provide specific layout patterns and structural requirements for template design
3. **WHO Branding Specifications:** Concrete examples of official WHO color usage, typography, and logo placement for exact compliance
4. **Implementation Validation:** Generated publications can now be directly compared against official WHO examples for quality assurance

**Technical Implementation Impact:**
- Template designs will be validated against the 9 reference publications to ensure accuracy
- Quality metrics will be established based on file sizes, formatting precision, and accessibility features observed in examples
- Development priorities shifted to emphasize exact WHO branding compliance over generic templating
- Testing framework will include automated comparison against reference publications

**Next Steps for Detailed Analysis:**
1. **PDF Structure Analysis:** Detailed examination of each reference PDF's internal structure, metadata, and formatting
2. **Layout Extraction:** Document exact measurements, typography specifications, and layout patterns
3. **Branding Compliance Matrix:** Create detailed compliance requirements based on observed WHO branding usage
4. **Quality Validation Framework:** Establish metrics for comparing generated publications against reference examples

This update ensures the final implementation will generate publications that meet the exact standards demonstrated in official WHO DAK publications.

## 12. Conclusion

Implementing DAK PDF and web publications represents a significant enhancement to the SGeX Workbench that will standardize and professionalize DAK presentation. The recommended hybrid approach balances technical feasibility with user requirements while maintaining consistency with the existing system architecture.

The availability of 9 concrete WHO DAK reference publications has transformed this analysis from theoretical to practical, ensuring generated publications will meet established WHO standards. The phased implementation plan allows for iterative development and early user feedback, reducing risks and ensuring the final solution meets WHO SMART Guidelines requirements and user needs.

---

*This analysis provides the foundation for implementing consistent, professional DAK publications that follow WHO SMART Guidelines standards and support multiple output formats for diverse use cases.*