import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import './BPMNViewer.css';

const BPMNViewerComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  const { profile, repository, component, selectedFile } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);

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

  // Load BPMN file content
  const loadBpmnContent = useCallback(async () => {
    if (!viewerRef.current || !selectedFile) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load actual BPMN content from GitHub if available
      let bpmnXml = null;
      if (profile.token && selectedFile.download_url) {
        try {
          const response = await fetch(selectedFile.download_url);
          if (response.ok) {
            bpmnXml = await response.text();
            console.log('Loaded BPMN content from GitHub');
          }
        } catch (fetchError) {
          console.warn('Could not fetch BPMN content from GitHub:', fetchError);
        }
      }

      // Use mock content if we couldn't load from GitHub
      if (!bpmnXml) {
        bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="17.11.1">
  <bpmn:process id="Process_${selectedFile.name.replace('.bpmn', '')}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="${selectedFile.name.replace('.bpmn', '').replace('-', ' ').toUpperCase()}">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${selectedFile.name.replace('.bpmn', '')}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
      }

      // Load the BPMN diagram
      await viewerRef.current.importXML(bpmnXml);
      setLoading(false);
    } catch (err) {
      console.error('Error loading BPMN file:', err);
      setError('Failed to load BPMN diagram');
      setLoading(false);
    }
  }, [selectedFile, profile.token]);

  // Initialize BPMN viewer
  useEffect(() => {
    const initializeViewer = () => {
      if (containerRef.current && !viewerRef.current && selectedFile) {
        try {
          viewerRef.current = new BpmnViewer({
            container: containerRef.current,
            keyboard: {
              bindTo: window
            }
          });
          console.log('BPMN viewer initialized successfully');
          loadBpmnContent();
        } catch (error) {
          console.error('Failed to initialize BPMN viewer:', error);
          setError('Failed to initialize BPMN viewer');
          setLoading(false);
        }
      }
    };

    if (selectedFile) {
      // Wait for container to be ready
      const timer = setTimeout(initializeViewer, 100);
      return () => clearTimeout(timer);
    }

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
  }, [selectedFile, loadBpmnContent]);

  const handleEditMode = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    navigate('/bpmn-editor', {
      state: {
        profile,
        repository,
        component,
        selectedFile,
        mode: 'edit'
      }
    });
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
          <button onClick={() => navigate('/repositories', { state: { profile } })} className="breadcrumb-link">
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
              <span className="view-mode-badge">👁️ Read-Only View</span>
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

          <div className="diagram-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading BPMN diagram...</p>
              </div>
            ) : error ? (
              <div className="error-overlay">
                <p>❌ {error}</p>
                <button 
                  className="action-btn secondary"
                  onClick={() => loadBpmnContent()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="bpmn-container" ref={containerRef}></div>
            )}
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

export default BPMNViewerComponent;