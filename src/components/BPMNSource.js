import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ContextualHelpMascot from './ContextualHelpMascot';
import './BPMNSource.css';

const BPMNSource = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { profile, repository, component, selectedFile } = location.state || {};
  
  const [bpmnXml, setBpmnXml] = useState('');
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

  // Load BPMN XML source
  useEffect(() => {
    const loadBpmnSource = async () => {
      if (!selectedFile) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load actual BPMN content from GitHub if available
        let xmlContent = null;
        if (profile.token && selectedFile.download_url) {
          try {
            const response = await fetch(selectedFile.download_url);
            if (response.ok) {
              xmlContent = await response.text();
              console.log('Loaded BPMN source from GitHub');
            }
          } catch (fetchError) {
            console.warn('Could not fetch BPMN source from GitHub:', fetchError);
          }
        }

        // Use mock content if we couldn't load from GitHub
        if (!xmlContent) {
          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn" 
                  exporter="bpmn-js (https://demo.bpmn.io)" 
                  exporterVersion="17.11.1">
  
  <bpmn:process id="Process_${selectedFile.name.replace('.bpmn', '')}" isExecutable="true">
    <bpmn:documentation>
      Business Process: ${selectedFile.name.replace('.bpmn', '').replace('-', ' ').toUpperCase()}
      
      This is a sample BPMN process diagram demonstrating the WHO SMART Guidelines
      business process modeling approach for digital adaptation kits (DAKs).
    </bpmn:documentation>
    
    <bpmn:startEvent id="StartEvent_1" name="Process Start">
      <bpmn:documentation>Initial event that triggers the business process.</bpmn:documentation>
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    
    <bpmn:task id="Task_1" name="${selectedFile.name.replace('.bpmn', '').replace('-', ' ').toUpperCase()}">
      <bpmn:documentation>Main processing task for this business workflow.</bpmn:documentation>
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    
    <bpmn:endEvent id="EndEvent_1" name="Process Complete">
      <bpmn:documentation>Final event indicating successful completion of the process.</bpmn:documentation>
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${selectedFile.name.replace('.bpmn', '')}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="162" y="142" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1" bpmnElement="Task_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="405" y="142" width="90" height="14" />
        </bpmndi:BPMNLabel>
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

        setBpmnXml(xmlContent);
        setLoading(false);
      } catch (err) {
        console.error('Error loading BPMN source:', err);
        setError('Failed to load BPMN source code');
        setLoading(false);
      }
    };

    loadBpmnSource();
  }, [selectedFile, profile]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bpmnXml);
      // Show temporary success message
      const button = document.querySelector('.copy-btn');
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const getGitHubUrl = () => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    return `https://github.com/${owner}/${repository.name}/blob/main/${selectedFile.path}`;
  };

  const getGitHubEditUrl = () => {
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    return `https://github.com/${owner}/${repository.name}/edit/main/${selectedFile.path}`;
  };

  if (!profile || !repository || !selectedFile) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  return (
    <div className="bpmn-source">
      <div className="source-header">
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
            <span className="context-component">BPMN Source Code</span>
          </div>
          <a href="/sgex/docs/overview" className="nav-link">📖 Documentation</a>
        </div>
      </div>

      <div className="source-content">
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
          <span className="breadcrumb-current">{selectedFile.name} (source)</span>
        </div>

        <div className="source-main">
          <div className="source-toolbar">
            <div className="toolbar-left">
              <h3>{selectedFile.name}</h3>
              <span className="source-mode-badge">📄 XML Source</span>
            </div>
            <div className="toolbar-right">
              <button 
                className="action-btn secondary"
                onClick={handleBackToSelection}
              >
                ← Back to List
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleCopyToClipboard}
                disabled={loading}
              >
                📋 Copy
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleDownload}
                disabled={loading}
              >
                💾 Download
              </button>
            </div>
          </div>

          <div className="source-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading BPMN source code...</p>
              </div>
            ) : error ? (
              <div className="error-overlay">
                <p>❌ {error}</p>
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <pre className="source-code">
                <code className="xml-code">{bpmnXml}</code>
              </pre>
            )}
          </div>

          <div className="source-actions">
            <div className="github-links">
              <h4>GitHub Actions</h4>
              <div className="link-buttons">
                <a 
                  href={getGitHubUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn github-view"
                >
                  👁️ View on GitHub
                </a>
                {hasWriteAccess && (
                  <a 
                    href={getGitHubEditUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn github-edit"
                  >
                    ✏️ Edit on GitHub
                  </a>
                )}
              </div>
            </div>

            <div className="file-info">
              <h4>File Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Path:</label>
                  <span className="file-path">{selectedFile.path}</span>
                </div>
                <div className="info-item">
                  <label>File Size:</label>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="info-item">
                  <label>Format:</label>
                  <span>BPMN 2.0 XML</span>
                </div>
                <div className="info-item">
                  <label>Access Level:</label>
                  <span className={`access-badge ${hasWriteAccess ? 'write' : 'read'}`}>
                    {hasWriteAccess ? '✏️ Edit Access' : '👁️ Read-Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ContextualHelpMascot 
        pageId="bpmn-source"
        contextData={{ profile, repository, component, selectedFile }}
      />
    </div>
  );
};

export default BPMNSource;