import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import githubService from '../services/githubService';
import { PageLayout } from './framework';
import './BPMNViewer.css';

const BPMNViewerComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  const { profile, repository, component, selectedFile, selectedBranch } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [enhancedFullwidth, setEnhancedFullwidth] = useState(false);
  const [autoHide, setAutoHide] = useState(false);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (repository && profile) {
        try {
          // Simple permission check - in real app, this would use githubService
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

  // Load BPMN file content - simplified to avoid race conditions
  const loadBpmnContent = useCallback(async () => {
    if (!viewerRef.current || !selectedFile || !repository) {
      console.warn('❌ BPMNViewer: Missing required parameters for loadBpmnContent');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const ref = selectedBranch || 'main';

      console.log('📂 BPMNViewer: Loading BPMN content for:', selectedFile.name);

      let bpmnXml;
      const isDemo = selectedFile.path?.includes('demo/') || selectedFile.sha?.startsWith('demo-');
      
      if (isDemo) {
        // For demo files, generate BPMN XML locally
        console.log('🎭 BPMNViewer: Demo file detected, generating BPMN content locally');
        const processName = selectedFile.name.replace('.bpmn', '').replace(/[-_]/g, ' ');
        bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="${processName}">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="82" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="158" y="125" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="250" y="60" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="402" y="82" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="410" y="125" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="100" />
        <di:waypoint x="250" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="350" y="100" />
        <di:waypoint x="402" y="100" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
      } else {
        // For real files, use githubService to fetch file content
        bpmnXml = await githubService.getFileContent(owner, repoName, selectedFile.path, ref);
      }
      
      // Validate BPMN content
      if (!bpmnXml || !bpmnXml.trim()) {
        throw new Error('Empty or invalid BPMN file content');
      }
      
      if (!bpmnXml.includes('bpmn:definitions') && !bpmnXml.includes('<definitions')) {
        throw new Error('File does not appear to contain valid BPMN XML content');
      }

      // Import XML into viewer
      console.log('🎨 BPMNViewer: Importing XML into BPMN viewer...');
      await viewerRef.current.importXML(bpmnXml);
      
      // Center the diagram
      try {
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        console.log('✅ BPMNViewer: Successfully loaded and centered BPMN diagram');
      } catch (centerError) {
        console.warn('⚠️ BPMNViewer: Could not center diagram:', centerError);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('💥 BPMNViewer: Error loading BPMN file:', err);
      
      // Provide specific error messages
      if (err.status === 404) {
        setError('BPMN file not found in the repository.');
      } else if (err.status === 403) {
        setError('Access denied. This repository may be private and require authentication.');
      } else if (err.message.includes('Empty or invalid BPMN')) {
        setError('The selected file appears to be empty or corrupted.');
      } else if (err.message.includes('does not appear to contain valid BPMN')) {
        setError('The selected file does not appear to contain valid BPMN XML content.');
      } else {
        setError(`Failed to load BPMN diagram: ${err.message}`);
      }
      
      setLoading(false);
    }
  }, [selectedFile, repository, selectedBranch]);

  // Initialize BPMN viewer - simplified to avoid race conditions
  useEffect(() => {
    const initializeViewer = async () => {
      if (!selectedFile || !containerRef.current || viewerRef.current) {
        return;
      }

      try {
        console.log('🔧 BPMNViewer: Initializing BPMN viewer for:', selectedFile.name);
        
        // Clean container first
        containerRef.current.innerHTML = '';
        
        // Create viewer
        const viewer = new BpmnViewer();
        viewerRef.current = viewer;
        
        // Attach to container
        await viewer.attachTo(containerRef.current);
        
        // Load content
        await loadBpmnContent();
        
        console.log('✅ BPMNViewer: BPMN viewer initialized successfully');
      } catch (error) {
        console.error('❌ BPMNViewer: Failed to initialize viewer:', error);
        setError(`Failed to initialize BPMN viewer: ${error.message}`);
        setLoading(false);
      }
    };

    initializeViewer();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (error) {
          console.warn('Warning cleaning up BPMN viewer:', error);
        }
        viewerRef.current = null;
      }
    };
  }, [selectedFile]); // Remove loadBpmnContent dependency to prevent loops

  const handleEditMode = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const path = selectedBranch 
      ? `/bpmn-editor/${owner}/${repoName}/${selectedBranch}`
      : `/bpmn-editor/${owner}/${repoName}`;

    navigate(path, {
      state: {
        profile,
        repository,
        component,
        selectedFile,
        selectedBranch,
        mode: 'edit'
      }
    });
  };

  const handleBackToSelection = () => {
    navigate('/business-process-selection', {
      state: {
        profile,
        repository,
        component,
        selectedBranch
      }
    });
  };

  const handleToggleEnhancedFullwidth = () => {
    const newState = !enhancedFullwidth;
    setEnhancedFullwidth(newState);
    
    // Add/remove class on body for enhanced fullwidth mode
    if (newState) {
      document.body.classList.add('enhanced-fullwidth-active');
    } else {
      document.body.classList.remove('enhanced-fullwidth-active');
    }
  };

  const handleToggleAutoHide = () => {
    setAutoHide(!autoHide);
  };

  // Cleanup effect for enhanced fullwidth
  useEffect(() => {
    return () => {
      // Clean up body class on unmount
      document.body.classList.remove('enhanced-fullwidth-active');
    };
  }, []);

  // Update body class when enhanced fullwidth changes
  useEffect(() => {
    if (enhancedFullwidth) {
      document.body.classList.add('enhanced-fullwidth-active');
    } else {
      document.body.classList.remove('enhanced-fullwidth-active');
    }
    
    return () => {
      document.body.classList.remove('enhanced-fullwidth-active');
    };
  }, [enhancedFullwidth]);

  if (!profile || !repository || !selectedFile) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <PageLayout pageName="bpmn-viewer">
      <div className={`bpmn-viewer ${enhancedFullwidth ? 'enhanced-fullwidth' : ''} ${autoHide ? 'auto-hide' : ''}`}>
      <div className="viewer-content">

        <div className="viewer-main">
          <div className="viewer-toolbar">
            <div className="toolbar-left">
              <h3>{selectedFile.name}</h3>
              <div className="artifact-badges">
                <span className="artifact-badge bpmn">📊 BPMN</span>
                <span className="dak-component-badge">🔄 Business Process</span>
              </div>
              <span className="view-mode-badge">👁️ Read-Only View</span>
            </div>
            <div className="toolbar-right">
              <button 
                className="action-btn secondary"
                onClick={handleToggleAutoHide}
                title="Toggle auto-hide headers/footers"
              >
                {autoHide ? '📌' : '👁️'} Auto-Hide
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleToggleEnhancedFullwidth}
                title="Toggle enhanced fullwidth mode"
              >
                {enhancedFullwidth ? '🔳' : '⛶'} Full Container
              </button>
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

          <div className="diagram-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <div className="loading-info">
                  <p>Loading BPMN diagram...</p>
                  <p className="loading-details">
                    Fetching {selectedFile.name} from {repository.name}
                  </p>
                  <p className="loading-hint">
                    This may take a few moments for large files or slow connections.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="error-overlay">
                <p>❌ {error}</p>
                <div className="error-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => loadBpmnContent()}
                  >
                    🔄 Retry
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate('/business-process-selection', {
                      state: { profile, repository, component, selectedBranch }
                    })}
                  >
                    ← Back to List
                  </button>
                </div>
              </div>
            ) : null}
            
            {/* Always render the BPMN container so the ref can be set */}
            <div 
              className="bpmn-container" 
              ref={containerRef}
              style={{ 
                display: loading || error ? 'none' : 'block',
                width: '100%',
                height: '100%'
              }}
            ></div>
          </div>

          <div className="diagram-info">
            <div className="condensed-file-info">
              <div className="condensed-info-item">
                <span className="label">📁</span>
                <span className="value">{selectedFile?.name || 'No file'}</span>
              </div>
              <div className="condensed-info-item">
                <span className="label">📏</span>
                <span className="value">{selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
              </div>
              <div className="condensed-info-item">
                <span className="label">🌿</span>
                <span className="value">{selectedBranch || 'main'}</span>
              </div>
            </div>
            <div className="condensed-view-mode">
              <span className={`condensed-access-badge ${hasWriteAccess ? 'write' : 'read'}`}>
                {hasWriteAccess ? '✏️ Edit' : '👁️ Read'}
              </span>
              <span className="condensed-info-item">
                <span className="value">
                  {enhancedFullwidth ? '⛶ Full Container' : autoHide ? '👁️ Auto-Hide' : '📺 Fullwidth'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageLayout>
  );
};

export default BPMNViewerComponent;