# DAK Publication System - Software Architecture Options

## Executive Summary

This document presents comprehensive software architecture options for implementing the DAK publication system in SGeX Workbench. Based on the requirements analysis and client-side only constraints, we propose three distinct architectural approaches that address the core needs: client-side HTML rendering optimized for print-to-PDF, EPUB generation, individual component publications, and GitHub workflow integration.

## Requirements Summary

**Core Requirements:**
- Client-side only implementation (no server-side processing)
- HTML rendering optimized for browser print-to-PDF functionality
- Individual publication views for each DAK component
- Leverage existing React components (BPMNViewer, DMN components)
- EPUB format generation for complete DAK publications
- GitHub workflow integration for automated artifact generation
- Publications status bar with artifact display and build log linking
- Styling extracted from uploaded DAK PDFs (not direct WHO branding)

**Technical Constraints:**
- React-based SPA architecture
- Existing component routing: `/{component}/{user}/{repo}/{branch}`
- BPMN diagram pagination across print pages (hardest challenge)
- Client-side EPUB generation capabilities

---

## Architecture Option 1: Component-Extension Pattern (RECOMMENDED)

### Overview
Extend existing React components with print-mode rendering capabilities while maintaining clean separation between display and publication views.

### Architecture Diagram
```
DAK Dashboard (Publications Tab)
    │
    ├── Component Publication Routes
    │   ├── /publications/business-processes/{user}/{repo}/{branch}
    │   ├── /publications/decision-support/{user}/{repo}/{branch}
    │   ├── /publications/data-entry-forms/{user}/{repo}/{branch}
    │   └── ... (other DAK components)
    │
    ├── Publication Components (Print-Optimized)
    │   ├── PublicationLayout.js (shared layout/styling)
    │   ├── BPMNPublicationView.js (extends BPMNViewer)
    │   ├── DMNPublicationView.js (extends DMN components)
    │   └── FormPublicationView.js (extends QuestionnaireEditor)
    │
    ├── EPUB Generation Service
    │   ├── EPUBBuilder.js (client-side EPUB creation)
    │   ├── ChapterGenerator.js (component to chapter conversion)
    │   └── NavigationBuilder.js (table of contents)
    │
    └── GitHub Integration
        ├── WorkflowTrigger.js (trigger publication workflows)
        ├── ArtifactManager.js (download/display artifacts)
        └── PublicationStatusBar.js (status display)
```

### Key Components

#### 1. Publication Layout Framework
```javascript
// PublicationLayout.js
const PublicationLayout = ({ children, dakMetadata, printMode = true }) => {
  return (
    <div className={`publication-layout ${printMode ? 'print-mode' : ''}`}>
      <PublicationHeader metadata={dakMetadata} />
      <PublicationContent>
        {children}
      </PublicationContent>
      <PublicationFooter />
    </div>
  );
};
```

#### 2. BPMN Publication Component (Addresses Page Splitting Challenge)
```javascript
// BPMNPublicationView.js
const BPMNPublicationView = ({ bpmnXml, printMode = true }) => {
  const [pageLayout, setPageLayout] = useState(null);
  
  useEffect(() => {
    if (printMode) {
      const layout = calculateBPMNPageLayout(bpmnXml);
      setPageLayout(layout);
    }
  }, [bpmnXml, printMode]);
  
  if (printMode && pageLayout) {
    return (
      <div className="bpmn-publication">
        {pageLayout.pages.map((page, index) => (
          <div key={index} className="bpmn-page">
            <BPMNViewerSegment 
              xml={bpmnXml} 
              viewport={page.viewport}
              pageNumber={index + 1}
            />
            {index < pageLayout.pages.length - 1 && (
              <div className="page-break" />
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return <BPMNViewer xml={bpmnXml} />; // Fallback to normal view
};
```

#### 3. EPUB Generation Service
```javascript
// EPUBBuilder.js
class EPUBBuilder {
  constructor(dakMetadata) {
    this.metadata = dakMetadata;
    this.chapters = [];
  }
  
  addComponentChapter(component, htmlContent) {
    this.chapters.push({
      id: component.id,
      title: component.title,
      content: this.processContentForEPUB(htmlContent),
      order: component.order
    });
  }
  
  async generateEPUB() {
    const epub = new EPUBGenerator();
    
    // Add metadata
    epub.setMetadata(this.metadata);
    
    // Add chapters in order
    this.chapters
      .sort((a, b) => a.order - b.order)
      .forEach(chapter => epub.addChapter(chapter));
    
    return epub.build();
  }
}
```

### Implementation Strategy

#### Phase 1: Core Publication Views (4-6 weeks)
1. **Publication Route Setup**
   - Add publication routes to lazyRouteUtils.js
   - Create PublicationLayout component
   - Set up print CSS framework

2. **Component Extensions**
   - Extend BPMNViewer with print mode
   - Create publication views for core components
   - Implement BPMN page splitting algorithm

#### Phase 2: EPUB Generation (3-4 weeks)
1. **EPUB Service Implementation**
   - Client-side EPUB generation using epub.js
   - Component-to-chapter conversion
   - Navigation and TOC generation

2. **Full DAK Publication**
   - Aggregate all component publications
   - Create unified EPUB with proper structure
   - Add embedded diagrams and styling

#### Phase 3: GitHub Integration (2-3 weeks)
1. **Workflow Integration**
   - GitHub Actions for automated publication
   - Artifact generation on merge to main/deploy
   - Integration with existing IG Publisher

2. **Status Bar Implementation**
   - Publication artifact display
   - Build status monitoring
   - Direct links to build logs

### Pros
- ✅ Leverages existing React components with minimal changes
- ✅ Clean separation between display and publication views
- ✅ Addresses BPMN pagination challenge with viewport segmentation
- ✅ Incremental implementation with clear phases
- ✅ Maintains SGeX architectural patterns

### Cons
- ⚠️ BPMN page splitting requires complex viewport calculation
- ⚠️ EPUB generation complexity for embedded diagrams
- ⚠️ Browser print quality limitations

---

## Architecture Option 2: Dedicated Publication Service

### Overview
Create a dedicated publication service within SGeX that handles all publication-related functionality as a separate module.

### Architecture Diagram
```
Publication Service Module
    │
    ├── Publication Engine
    │   ├── ComponentRenderer.js (unified rendering)
    │   ├── LayoutEngine.js (page layout calculation)
    │   ├── StyleExtractor.js (DAK PDF style extraction)
    │   └── PrintOptimizer.js (print-specific optimizations)
    │
    ├── Format Generators
    │   ├── HTMLGenerator.js (static HTML output)
    │   ├── EPUBGenerator.js (EPUB creation)
    │   └── PrintableGenerator.js (print-optimized HTML)
    │
    ├── Data Aggregation
    │   ├── DAKAggregator.js (combine all components)
    │   ├── ComponentExtractor.js (individual component data)
    │   └── MetadataBuilder.js (publication metadata)
    │
    └── Integration Layer
        ├── GitHubPublisher.js (workflow integration)
        ├── ArtifactManager.js (artifact management)
        └── StatusTracker.js (build status tracking)
```

### Key Components

#### 1. Publication Engine
```javascript
// PublicationEngine.js
class PublicationEngine {
  constructor(dakData, options = {}) {
    this.dakData = dakData;
    this.options = options;
    this.renderer = new ComponentRenderer();
    this.layoutEngine = new LayoutEngine();
  }
  
  async generateComponentPublication(componentType) {
    const componentData = this.dakData.getComponent(componentType);
    const renderedContent = await this.renderer.render(componentType, componentData);
    const optimizedLayout = this.layoutEngine.optimize(renderedContent, 'print');
    
    return {
      html: optimizedLayout.html,
      css: optimizedLayout.css,
      metadata: optimizedLayout.metadata
    };
  }
  
  async generateFullDAKPublication() {
    const components = await Promise.all(
      this.dakData.getAllComponents().map(comp => 
        this.generateComponentPublication(comp.type)
      )
    );
    
    return this.aggregateComponents(components);
  }
}
```

#### 2. BPMN Layout Engine (Solves Page Splitting)
```javascript
// BPMNLayoutEngine.js
class BPMNLayoutEngine {
  calculatePageBreaks(bpmnXml, pageSize = { width: 210, height: 297 }) { // A4 mm
    const parser = new BPMNAnalyzer(bpmnXml);
    const elements = parser.getAllElements();
    const bounds = parser.getCanvasBounds();
    
    // Calculate optimal page segmentation
    const pages = this.segmentCanvas(bounds, pageSize, elements);
    
    return pages.map((page, index) => ({
      pageNumber: index + 1,
      viewport: page.viewport,
      elements: page.elements,
      connections: page.connections
    }));
  }
  
  segmentCanvas(bounds, pageSize, elements) {
    // Intelligent segmentation that preserves element boundaries
    const segmentation = new CanvasSegmentation(bounds, pageSize);
    return segmentation.createOptimalSegments(elements);
  }
}
```

### Implementation Strategy

#### Phase 1: Publication Engine Core (6-8 weeks)
1. **Service Architecture Setup**
   - Create publication service module
   - Implement component renderer framework
   - Build layout engine with BPMN support

2. **Core Rendering**
   - Component-specific renderers
   - Print optimization algorithms
   - Style extraction from DAK PDFs

#### Phase 2: Format Generation (4-5 weeks)
1. **Multi-Format Support**
   - HTML static generator
   - EPUB builder with proper structure
   - Print-optimized HTML with CSS

2. **Quality Assurance**
   - Output validation
   - Cross-browser testing
   - Print quality verification

#### Phase 3: Integration & Automation (3-4 weeks)
1. **GitHub Integration**
   - Automated workflow triggers
   - Artifact management
   - Status tracking and reporting

### Pros
- ✅ Dedicated focus on publication quality
- ✅ Sophisticated BPMN layout engine
- ✅ Modular, testable architecture
- ✅ Potential for advanced features

### Cons
- ⚠️ Higher development complexity
- ⚠️ Longer implementation timeline
- ⚠️ More maintenance overhead
- ⚠️ May duplicate existing component logic

---

## Architecture Option 3: Hybrid Component-Service Approach

### Overview
Combines the best of both approaches: extends existing components for simple cases while using a dedicated service for complex publication logic.

### Architecture Diagram
```
Hybrid Publication System
    │
    ├── Component Extensions (Simple Publications)
    │   ├── Enhanced Components with Print Modes
    │   ├── Basic Print CSS Optimization
    │   └── Individual Component Views
    │
    ├── Publication Service (Complex Publications)
    │   ├── BPMN Advanced Layout Engine
    │   ├── Multi-Component Aggregation
    │   ├── EPUB Generation Service
    │   └── Advanced Print Optimization
    │
    ├── Unified Publication Router
    │   ├── Route Decision Logic
    │   ├── Simple vs Complex Publication Detection
    │   └── Fallback Mechanisms
    │
    └── GitHub Integration Layer
        ├── Workflow Coordination
        ├── Artifact Management
        └── Status Monitoring
```

### Key Decision Logic
```javascript
// PublicationRouter.js
class PublicationRouter {
  determinePublicationStrategy(componentType, complexity) {
    const simpleComponents = ['terminology', 'forms', 'documentation'];
    const complexComponents = ['business-processes', 'decision-support'];
    
    if (simpleComponents.includes(componentType)) {
      return 'component-extension';
    }
    
    if (complexComponents.includes(componentType) || complexity === 'high') {
      return 'publication-service';
    }
    
    return 'component-extension'; // Default
  }
}
```

### Implementation Strategy

#### Phase 1: Component Extensions (3-4 weeks)
1. **Simple Component Publications**
   - Forms, terminology, documentation
   - Basic print CSS optimization
   - Individual publication views

#### Phase 2: Advanced Service (5-6 weeks)
1. **Complex Component Service**
   - BPMN advanced layout engine
   - DMN complex table handling
   - Multi-component aggregation

#### Phase 3: Integration (2-3 weeks)
1. **Router and Coordination**
   - Unified publication interface
   - GitHub workflow integration
   - Status monitoring

### Pros
- ✅ Best of both approaches
- ✅ Incremental complexity
- ✅ Flexible implementation
- ✅ Risk mitigation through fallbacks

### Cons
- ⚠️ Architectural complexity
- ⚠️ Potential inconsistencies
- ⚠️ More testing required

---

## Recommendation: Architecture Option 1 (Component-Extension Pattern)

### Rationale

**Best Fit for SGeX Requirements:**
1. **Leverages Existing Investment** - Maximizes reuse of BPMNViewer and other components
2. **Client-Side Only** - Perfectly aligns with no server-side constraint
3. **Incremental Implementation** - Can be developed and deployed in phases
4. **Maintainable** - Extends existing patterns rather than creating new architectures
5. **Addresses Core Challenge** - Provides solution for BPMN pagination

### Next Steps

1. **Immediate (Week 1):**
   - Create publication route structure
   - Build PublicationLayout component
   - Set up print CSS framework

2. **Short-term (Weeks 2-4):**
   - Implement BPMNPublicationView with page splitting
   - Create publication views for 2-3 core components
   - Basic GitHub integration

3. **Medium-term (Weeks 5-8):**
   - EPUB generation service
   - Complete all component publications
   - Full GitHub workflow integration

4. **Long-term (Weeks 9-12):**
   - Publications status bar
   - Advanced styling and optimization
   - Quality assurance and testing

### Success Metrics

- **Functional:** All 8 DAK components have publication views accessible from dashboard
- **Quality:** Print-to-PDF output matches professional medical publication standards
- **Integration:** Automated EPUB and HTML generation on every merge
- **Usability:** Publications status bar shows real-time artifact availability

This architecture provides the optimal balance of leveraging existing SGeX infrastructure while delivering the sophisticated publication capabilities required for WHO DAK publications.