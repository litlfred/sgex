import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createLazyBpmnViewer } from '../utils/lazyRouteUtils';

// Sample BPMN content for demo purposes - moved outside component to avoid re-renders
const sampleBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                 xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                 id="Definitions_Sample" 
                 targetNamespace="http://bpmn.io/schema/bpmn" 
                 exporter="SGEX Workbench" 
                 exporterVersion="1.0.0">
  <bpmn:process id="Process_Sample" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Process Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Patient Registration">
      <bpmn:documentation>Register new patient in the system</bpmn:documentation>
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Registration Valid?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_2" name="Create Patient Record">
      <bpmn:documentation>Create new patient record in database</bpmn:documentation>
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_3" name="Request Additional Info">
      <bpmn:documentation>Request missing information from patient</bpmn:documentation>
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Registration Complete">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_2" name="Registration Pending">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" name="Valid" sourceRef="Gateway_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_4" name="Invalid" sourceRef="Gateway_1" targetRef="Task_3" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_2" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Sample">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="163" y="142" width="69" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="425" y="92" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="406" y="62" width="89" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2" bpmnElement="Task_2">
        <dc:Bounds x="530" y="77" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3" bpmnElement="Task_3">
        <dc:Bounds x="530" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1" bpmnElement="EndEvent_1">
        <dc:Bounds x="692" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="672" y="142" width="76" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_2" bpmnElement="EndEvent_2">
        <dc:Bounds x="692" y="222" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="675" y="265" width="70" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="425" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="475" y="117" />
        <di:waypoint x="530" y="117" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="493" y="99" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="450" y="142" />
        <di:waypoint x="450" y="240" />
        <di:waypoint x="530" y="240" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="454" y="188" width="31" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="630" y="117" />
        <di:waypoint x="692" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="630" y="240" />
        <di:waypoint x="692" y="240" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BPMNViewerEnhanced = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);
  
  const { profile, repository, component, selectedFile, branch } = location.state || {};
  
  console.log('BPMNViewerEnhanced - location.state:', location.state);
  console.log('BPMNViewerEnhanced - selectedFile:', selectedFile);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Container ref callback to notify when element is ready
  const handleContainerRef = useCallback((element) => {
    console.log('Container ref callback called with element:', !!element);
    containerRef.current = element;
    
    if (element) {
      // Use requestAnimationFrame to ensure element is properly attached to DOM
      requestAnimationFrame(() => {
        if (element.parentNode && element.offsetWidth > 0 && element.offsetHeight > 0) {
          console.log('Container is ready with dimensions:', {
            width: element.offsetWidth,
            height: element.offsetHeight,
            attached: !!element.parentNode
          });
          setContainerReady(true);
        } else {
          console.warn('Container element not properly ready yet, retrying...');
          // Retry after a short delay
          setTimeout(() => {
            if (element.parentNode && element.offsetWidth > 0 && element.offsetHeight > 0) {
              console.log('Container ready after retry');
              setContainerReady(true);
            } else {
              console.error('Container still not ready after retry');
              setContainerReady(false);
            }
          }, 100);
        }
      });
    } else {
      setContainerReady(false);
    }
  }, []);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          const writeAccess = profile.token && repository.permissions?.push;
          setHasWriteAccess(writeAccess || false);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };

    checkPermissions();
  }, [repository, profile]);

  // Initialize BPMN viewer and load content
  useEffect(() => {
    console.log('useEffect running, containerReady:', containerReady, 'selectedFile:', !!selectedFile);
    
    if (!selectedFile || !containerReady || !containerRef.current) {
      console.log('Missing selectedFile or container not ready, skipping initialization');
      return;
    }

    const initializeViewer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clean up any existing viewer
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (cleanupError) {
            console.warn('Error destroying existing viewer:', cleanupError);
          }
          viewerRef.current = null;
        }

        // Ensure container is properly ready with multiple validation checks
        if (!containerRef.current) {
          throw new Error('Container element is null');
        }

        if (!containerRef.current.parentNode) {
          throw new Error('Container element is not attached to DOM');
        }

        if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
          throw new Error('Container element has no dimensions');
        }

        console.log('Creating BPMN viewer with container element...', {
          element: containerRef.current,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
          parentNode: !!containerRef.current.parentNode
        });

        // Add a small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Lazy load BPMN.js viewer to improve initial page responsiveness
        viewerRef.current = await createLazyBpmnViewer({
          container: containerRef.current
        });

        console.log('BPMN viewer initialized successfully');

        // Load BPMN content
        let bpmnXml = sampleBpmnXml;
        
        // Try to load actual BPMN content from GitHub if available
        if (profile?.token && selectedFile.download_url) {
          try {
            const response = await fetch(selectedFile.download_url);
            if (response.ok) {
              bpmnXml = await response.text();
              console.log('Loaded BPMN content from GitHub');
            }
          } catch (fetchError) {
            console.warn('Could not fetch BPMN content from GitHub:', fetchError);
          }
        } else {
          console.log('Using sample BPMN content');
        }

        console.log('Importing BPMN XML...');
        // Import the BPMN diagram
        await viewerRef.current.importXML(bpmnXml);
        
        // Set up event listeners for element selection
        const eventBus = viewerRef.current.get('eventBus');
        
        eventBus.on('element.click', (event) => {
          setSelectedElement(event.element);
        });
        
        // Initialize zoom level
        const canvas = viewerRef.current.get('canvas');
        setZoomLevel(canvas.zoom());
        
        // Fit the diagram to viewport
        canvas.zoom('fit-viewport');
        
        console.log('BPMN diagram loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize BPMN viewer:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to initialize diagram container';
        if (error.message.includes('Container element is null')) {
          errorMessage = 'Container element not found. Please try refreshing the page.';
        } else if (error.message.includes('not attached to DOM')) {
          errorMessage = 'Container element not properly attached. Please try again.';
        } else if (error.message.includes('no dimensions')) {
          errorMessage = 'Container element has no size. Please check CSS styling.';
        } else if (error.message.includes('importXML')) {
          errorMessage = 'Failed to load BPMN diagram: ' + error.message;
        } else {
          errorMessage = 'Failed to initialize BPMN viewer: ' + error.message;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    // Initialize immediately since we know the container is ready
    initializeViewer();
    
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying BPMN viewer:', error);
        }
        viewerRef.current = null;
      }
    };
  }, [selectedFile, containerReady, profile?.token]);  // Depend on containerReady state

  // Toolbar actions
  const handleZoomIn = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      const newZoom = Math.min(zoomLevel * 1.2, 4);
      canvas.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      const newZoom = Math.max(zoomLevel * 0.8, 0.2);
      canvas.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomFit = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
      setZoomLevel(canvas.zoom());
    }
  };

  const handleZoomReset = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom(1);
      setZoomLevel(1);
    }
  };

  const handleExportSVG = async () => {
    if (viewerRef.current) {
      try {
        const { svg } = await viewerRef.current.saveSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile.name.replace('.bpmn', '')}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export SVG:', error);
        alert('Failed to export diagram as SVG');
      }
    }
  };

  const handleEditMode = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const path = branch 
      ? `/bpmn-editor/${owner}/${repoName}/${branch}`
      : `/bpmn-editor/${owner}/${repoName}`;

    navigate(path, {
      state: {
        profile,
        repository,
        component,
        selectedFile,
        mode: 'edit'
      }
    });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setSelectedElement(null);
    
    // Reset container state to force re-initialization
    setContainerReady(false);
    
    // Force a re-evaluation of container readiness
    if (containerRef.current) {
      // Trigger the container ref callback again
      setTimeout(() => {
        handleContainerRef(containerRef.current);
      }, 50);
    }
  };

  const handleBackToSelection = () => {
    navigate('/business-process-selection', {
      state: {
        profile,
        repository,
        component
      }
    });
  };

  if (!profile || !repository || !selectedFile) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="bpmn-viewer">
      <div className="viewer-header">
        <div className="who-branding">
          <h1>SGEX Workbench</h1>
          <p className="subtitle">WHO SMART Guidelines Exchange</p>
        </div>
        <div className="context-info">
          <img 
            src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
            alt="Profile" 
            className="context-avatar" 
          />
          <div className="context-details">
            <span className="context-repo">{repository.name}</span>
            <span className="context-component">Business Process Viewer</span>
          </div>

        </div>
      </div>

      <div className="viewer-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate(`/dak-selection/${profile.login}`, { state: { profile } })} className="breadcrumb-link">
            Select Repository
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={() => navigate('/dashboard', { state: { profile, repository } })} className="breadcrumb-link">
            DAK Components
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToSelection} className="breadcrumb-link">
            Business Processes
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{selectedFile.name}</span>
        </div>

        <div className="viewer-main">
          <div className="viewer-toolbar">
            <div className="toolbar-left">
              <h3>{selectedFile.name}</h3>
              <span className="view-mode-badge">👁️ BPMN 2.0 Viewer</span>
            </div>
            <div className="toolbar-center">
              <div className="zoom-controls">
                <button 
                  className="tool-btn" 
                  onClick={handleZoomOut}
                  title="Zoom Out"
                >
                  🔍-
                </button>
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className="tool-btn" 
                  onClick={handleZoomIn}
                  title="Zoom In"
                >
                  🔍+
                </button>
                <button 
                  className="tool-btn" 
                  onClick={handleZoomFit}
                  title="Fit to Screen"
                >
                  📐
                </button>
                <button 
                  className="tool-btn" 
                  onClick={handleZoomReset}
                  title="Reset Zoom"
                >
                  🎯
                </button>
                <button 
                  className="tool-btn" 
                  onClick={handleExportSVG}
                  title="Export as SVG"
                >
                  💾
                </button>
              </div>
            </div>
            <div className="toolbar-right">
              <button 
                className="action-btn secondary"
                onClick={handleBackToSelection}
              >
                ← Back to List
              </button>
              {hasWriteAccess && (
                <button 
                  className="action-btn primary"
                  onClick={handleEditMode}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>

          <div className="viewer-body">
            <div className="diagram-container">
              <div className="bpmn-container" ref={handleContainerRef}></div>
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading BPMN diagram...</p>
                </div>
              )}
              {error && (
                <div className="error-overlay">
                  <p>❌ {error}</p>
                  <button 
                    className="action-btn secondary"
                    onClick={handleRetry}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Element Inspector Sidebar */}
            <div className="element-inspector">
              <div className="inspector-header">
                <h4>Element Properties</h4>
              </div>
              <div className="inspector-content">
                {selectedElement ? (
                  <div className="inspector-properties">
                    <div className="property-group">
                      <h5>General</h5>
                      <div className="property-item">
                        <label>ID:</label>
                        <span>{selectedElement.id}</span>
                      </div>
                      <div className="property-item">
                        <label>Type:</label>
                        <span>{selectedElement.type}</span>
                      </div>
                      {selectedElement.businessObject?.name && (
                        <div className="property-item">
                          <label>Name:</label>
                          <span>{selectedElement.businessObject.name}</span>
                        </div>
                      )}
                      {selectedElement.businessObject?.documentation && (
                        <div className="property-item">
                          <label>Documentation:</label>
                          <div className="documentation">
                            {selectedElement.businessObject.documentation[0]?.text || 'No documentation'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedElement.type === 'bpmn:SequenceFlow' && (
                      <div className="property-group">
                        <h5>Sequence Flow</h5>
                        <div className="property-item">
                          <label>Source:</label>
                          <span>{selectedElement.businessObject.sourceRef?.id}</span>
                        </div>
                        <div className="property-item">
                          <label>Target:</label>
                          <span>{selectedElement.businessObject.targetRef?.id}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="property-group">
                      <h5>BPMN 2.0 Standard</h5>
                      <div className="standard-note">
                        This element conforms to the OMG BPMN 2.0 specification. 
                        No custom extensions are supported.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection">
                    <p>Click on a BPMN element to view its properties</p>
                    <div className="help-text">
                      This inspector shows only standard BPMN 2.0 properties and attributes. 
                      Custom extensions from Camunda, Zeebe, or other vendors are not supported.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="diagram-info">
            <div className="info-section">
              <h4>File Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Name:</label>
                  <span>{selectedFile.name}</span>
                </div>
                <div className="info-item">
                  <label>File Path:</label>
                  <span className="file-path">{selectedFile.path}</span>
                </div>
                <div className="info-item">
                  <label>File Size:</label>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="info-item">
                  <label>Access Level:</label>
                  <span className={`access-badge ${hasWriteAccess ? 'write' : 'read'}`}>
                    {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>BPMN 2.0 Compliance</h4>
              <div className="compliance-info">
                <p>
                  This viewer supports only standard OMG BPMN 2.0 elements and properties.
                  Custom extensions from Camunda, Zeebe, or other vendors are not displayed.
                </p>
                <div className="supported-elements">
                  <h5>Supported Elements:</h5>
                  <ul>
                    <li>Start/End Events</li>
                    <li>Tasks and Activities</li>
                    <li>Gateways (Exclusive, Inclusive, Parallel)</li>
                    <li>Sequence Flows</li>
                    <li>Pools and Lanes</li>
                    <li>Message Flows</li>
                  </ul>
                </div>
              </div>
            </div>

            {!hasWriteAccess && (
              <div className="permission-notice">
                <h4>🔒 Read-Only Access</h4>
                <p>
                  You currently have read-only access to this repository. 
                  To edit BPMN diagrams, you need write permissions. 
                  Contact the repository administrator or update your GitHub Personal Access Token with write permissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPMNViewerEnhanced;