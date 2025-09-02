import React, { useState, useEffect, useRef } from 'react';
import PublicationView from './PublicationView';
import { createLazyBpmnViewer } from '../../utils/lazyRouteUtils';

/**
 * Business Processes Publication Component
 * 
 * Renders BPMN diagrams in publication-ready format with:
 * - Page-friendly BPMN diagram rendering
 * - Viewport-based pagination for large diagrams
 * - Print-optimized layout
 */
const BusinessProcessesPublication = () => {
  
  const renderBusinessProcesses = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Business Processes and Workflows</h3>
          <p>
            This section contains BPMN (Business Process Model and Notation) diagrams that define 
            the clinical workflows and business processes for this Digital Adaptation Kit.
          </p>
          
          {dakData?.bpmnFiles && dakData.bpmnFiles.length > 0 ? (
            <div className="bpmn-content">
              {dakData.bpmnFiles.map((bpmnFile, index) => (
                <BPMNDiagramRenderer 
                  key={index} 
                  bpmnFile={bpmnFile} 
                  printMode={true} 
                />
              ))}
            </div>
          ) : (
            <div className="no-content">
              <p>No BPMN files found in this repository.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="business-processes"
      renderFunction={renderBusinessProcesses}
      title="Business Processes and Workflows"
      printMode={true}
    />
  );
};

/**
 * BPMN Diagram Renderer with Pagination Support
 * 
 * Handles the challenge of BPMN pagination by:
 * - Calculating optimal viewport segments
 * - Rendering each segment as a separate page
 * - Preserving element boundaries
 */
const BPMNDiagramRenderer = ({ bpmnFile, printMode = false }) => {
  const containerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLayout, setPageLayout] = useState(null);

  useEffect(() => {
    const initializeBPMNViewer = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!bpmnFile.content) {
          throw new Error('No BPMN content provided');
        }

        // Create BPMN viewer instance
        const BpmnViewer = await createLazyBpmnViewer();
        const viewerInstance = new BpmnViewer({
          container: containerRef.current,
          width: '100%',
          height: '400px'
        });

        await viewerInstance.importXML(bpmnFile.content);
        setViewer(viewerInstance);

        // Calculate page layout for print mode
        if (printMode) {
          const layout = calculateBPMNPageLayout(viewerInstance, bpmnFile.content);
          setPageLayout(layout);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing BPMN viewer:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (containerRef.current) {
      initializeBPMNViewer();
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [bpmnFile.content, printMode, viewer]);

  /**
   * Calculate optimal page layout for BPMN diagrams
   * This addresses the main challenge of BPMN pagination
   */
  const calculateBPMNPageLayout = (viewerInstance, bpmnXml) => {
    try {
      const canvas = viewerInstance.get('canvas');
      const viewbox = canvas.viewbox();
      
      // Standard page dimensions (A4 in pixels at 96 DPI)
      const pageWidth = 794; // ~210mm
      const pageHeight = 1123; // ~297mm
      const margin = 60; // Safety margin
      
      const effectivePageWidth = pageWidth - (margin * 2);
      const effectivePageHeight = pageHeight - (margin * 2);
      
      // Calculate number of pages needed
      const pagesX = Math.ceil(viewbox.width / effectivePageWidth);
      const pagesY = Math.ceil(viewbox.height / effectivePageHeight);
      
      const pages = [];
      
      for (let y = 0; y < pagesY; y++) {
        for (let x = 0; x < pagesX; x++) {
          const viewport = {
            x: viewbox.x + (x * effectivePageWidth),
            y: viewbox.y + (y * effectivePageHeight),
            width: Math.min(effectivePageWidth, viewbox.width - (x * effectivePageWidth)),
            height: Math.min(effectivePageHeight, viewbox.height - (y * effectivePageHeight))
          };
          
          pages.push({
            pageNumber: (y * pagesX) + x + 1,
            viewport: viewport,
            gridPosition: { x, y }
          });
        }
      }
      
      return {
        totalPages: pages.length,
        pages: pages,
        originalViewbox: viewbox
      };
    } catch (err) {
      console.warn('Could not calculate BPMN page layout:', err);
      return {
        totalPages: 1,
        pages: [{
          pageNumber: 1,
          viewport: null,
          gridPosition: { x: 0, y: 0 }
        }],
        originalViewbox: null
      };
    }
  };

  if (loading) {
    return (
      <div className="bpmn-diagram-container">
        <div className="bpmn-diagram-title">{bpmnFile.name}</div>
        <div className="bpmn-loading">
          <p>Loading BPMN diagram...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bpmn-diagram-container">
        <div className="bpmn-diagram-title">{bpmnFile.name}</div>
        <div className="bpmn-error">
          <p>Error loading BPMN diagram: {error}</p>
        </div>
      </div>
    );
  }

  // Render paginated view for print mode
  if (printMode && pageLayout && pageLayout.totalPages > 1) {
    return (
      <div className="bpmn-publication">
        <h4>{bpmnFile.name}</h4>
        <p>This diagram is split across {pageLayout.totalPages} pages for optimal printing.</p>
        
        {pageLayout.pages.map((page, index) => (
          <div key={index} className="bpmn-page">
            <div className="bpmn-page-header">
              {bpmnFile.name} - Page {page.pageNumber} of {pageLayout.totalPages}
            </div>
            <BPMNViewerSegment 
              bpmnContent={bpmnFile.content}
              viewport={page.viewport}
              pageNumber={page.pageNumber}
            />
          </div>
        ))}
      </div>
    );
  }

  // Single page view
  return (
    <div className="bpmn-diagram-container">
      <div className="bpmn-diagram-title">{bpmnFile.name}</div>
      <div ref={containerRef} className="bpmn-diagram-viewer" />
    </div>
  );
};

/**
 * BPMN Viewer Segment for Paginated Display
 * Renders a specific viewport of a BPMN diagram
 */
const BPMNViewerSegment = ({ bpmnContent, viewport, pageNumber }) => {
  const segmentRef = useRef(null);
  const [segmentViewer, setSegmentViewer] = useState(null);

  useEffect(() => {
    const initializeSegment = async () => {
      try {
        if (!segmentRef.current || !bpmnContent) return;

        const BpmnViewer = await createLazyBpmnViewer();
        const viewerInstance = new BpmnViewer({
          container: segmentRef.current,
          width: '100%',
          height: '350px'
        });

        await viewerInstance.importXML(bpmnContent);
        
        // Set specific viewport if provided
        if (viewport) {
          const canvas = viewerInstance.get('canvas');
          canvas.viewbox(viewport);
        }

        setSegmentViewer(viewerInstance);
      } catch (err) {
        console.error('Error initializing BPMN segment viewer:', err);
      }
    };

    initializeSegment();

    return () => {
      if (segmentViewer) {
        segmentViewer.destroy();
      }
    };
  }, [bpmnContent, viewport, segmentViewer]);

  return (
    <div className="bpmn-viewer-segment">
      <div ref={segmentRef} className="bpmn-segment-container" />
    </div>
  );
};

export default BusinessProcessesPublication;