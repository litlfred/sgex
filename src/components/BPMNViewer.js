import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnViewer from 'bpmn-js';
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

  // Load BPMN file content
  const loadBpmnContent = useCallback(async () => {
    console.log('🚀 BPMNViewer: loadBpmnContent called with:', {
      hasViewer: !!viewerRef.current,
      selectedFile: selectedFile,
      repository: repository ? {
        name: repository.name,
        owner: repository.owner
      } : null
    });

    if (!viewerRef.current || !selectedFile || !repository) {
      console.warn('❌ BPMNViewer: Missing required parameters for loadBpmnContent:', {
        hasViewer: !!viewerRef.current,
        hasSelectedFile: !!selectedFile,
        hasRepository: !!repository
      });
      return;
    }

    // Declare variables outside try block so they're accessible in catch block
    const owner = repository.owner?.login || repository.full_name.split('/')[0];
    const repoName = repository.name;
    const ref = selectedBranch || 'main';

    try {
      console.log('📡 BPMNViewer: Setting loading state to true');
      setLoading(true);
      setError(null);

      console.log('🔍 BPMNViewer: Repository and file analysis:', {
        repository: {
          name: repository.name,
          full_name: repository.full_name,
          owner: repository.owner,
          isDemo: repository.isDemo,
          default_branch: repository.default_branch
        },
        selectedFile: {
          name: selectedFile.name,
          path: selectedFile.path,
          size: selectedFile.size
        },
        derivedOwner: owner,
        repoName: repoName,
        ref: ref,
        githubServiceAuthenticated: githubService.isAuth()
      });

      console.log(`📂 BPMNViewer: Preparing to load BPMN content from ${owner}/${repoName}:${selectedFile.path} (ref: ${ref})`);
      console.log('📋 BPMNViewer: Full selected file object:', JSON.stringify(selectedFile, null, 2));
      
      // Add a timeout for the entire loading process
      console.log('⏰ BPMNViewer: Setting up 30-second timeout for loading process');
      const loadingTimeout = setTimeout(() => {
        console.error('⏰ BPMNViewer: Loading process timed out after 30 seconds');
        setError('Loading timed out. Please try again or check your internet connection.');
        setLoading(false);
      }, 30000); // 30 second timeout
      
      try {
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
          console.log('✅ BPMNViewer: Generated demo BPMN content locally');
        } else {
          // For real files, use githubService to fetch file content
          console.log(`🌐 BPMNViewer: About to call githubService.getFileContent with params:`, {
            owner,
            repoName,
            path: selectedFile.path,
            ref
          });
          
          console.log('🌐 BPMNViewer: Making GitHub API call...');
          const startTime = Date.now();
          bpmnXml = await githubService.getFileContent(owner, repoName, selectedFile.path, ref);
          const endTime = Date.now();
          
          console.log(`✅ BPMNViewer: Successfully loaded BPMN content from repository in ${endTime - startTime}ms`);
        }
        
        console.log('📏 BPMNViewer: Content length:', bpmnXml.length);
        console.log('👀 BPMNViewer: Content preview (first 200 chars):', bpmnXml.substring(0, 200));
        console.log('🔍 BPMNViewer: Content type check - contains bpmn:definitions:', bpmnXml.includes('bpmn:definitions'));
        console.log('🔍 BPMNViewer: Content type check - contains <definitions:', bpmnXml.includes('<definitions'));

        // Validate that we got valid BPMN XML content
        if (!bpmnXml || !bpmnXml.trim()) {
          console.error('❌ BPMNViewer: Empty or invalid BPMN file content received');
          throw new Error('Empty or invalid BPMN file content');
        }
        
        if (!bpmnXml.includes('bpmn:definitions') && !bpmnXml.includes('<definitions')) {
          console.error('❌ BPMNViewer: File does not contain valid BPMN XML content');
          console.error('🔍 BPMNViewer: Content preview for debugging:', bpmnXml.substring(0, 500));
          throw new Error('File does not appear to contain valid BPMN XML content');
        }

        // Load the BPMN diagram
        console.log('🎨 BPMNViewer: Attempting to import XML into BPMN viewer...');
        await viewerRef.current.importXML(bpmnXml);
        console.log('✅ BPMNViewer: Successfully imported BPMN XML into viewer');
        
        // Center the diagram in the viewer
        try {
          console.log('🎯 BPMNViewer: Attempting to center diagram in viewport...');
          const canvas = viewerRef.current.get('canvas');
          canvas.zoom('fit-viewport');
          console.log('✅ BPMNViewer: Successfully centered BPMN diagram in viewport');
        } catch (centerError) {
          console.warn('⚠️ BPMNViewer: Could not center diagram:', centerError);
          // This is not a critical error, continue
        }
        
        clearTimeout(loadingTimeout);
        console.log('🎉 BPMNViewer: BPMN loading completed successfully, setting loading to false');
        setLoading(false);
      } catch (contentError) {
        clearTimeout(loadingTimeout);
        console.error('❌ BPMNViewer: Error during file content processing:', contentError);
        throw contentError;      }
    } catch (err) {
      console.error('💥 BPMNViewer: Error loading BPMN file:', err);
      console.error('🔍 BPMNViewer: Full error details:', {
        message: err.message,
        status: err.status,
        stack: err.stack,
        repository: {
          owner: owner,
          name: repoName,
          ref: ref
        },
        file: {
          name: selectedFile.name,
          path: selectedFile.path
        }
      });
      
      // Provide specific error messages based on the error type
      if (err.message.includes('timeout') || err.message.includes('timed out')) {
        console.error('⏰ BPMNViewer: Timeout error detected');
        setError('Loading timed out. Please check your internet connection and try again.');
      } else if (err.status === 404) {
        console.error('🔍 BPMNViewer: 404 error detected - file not found');
        setError('BPMN file not found in the repository. The file may have been moved or deleted.');
      } else if (err.status === 403) {
        console.error('🔒 BPMNViewer: 403 error detected - access denied');
        setError('Access denied. This repository may be private and require authentication.');
      } else if (err.message.includes('rate limit')) {
        console.error('🚦 BPMNViewer: Rate limit error detected');
        setError('GitHub API rate limit exceeded. Please try again later or authenticate for higher limits.');
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        console.error('🌐 BPMNViewer: Network error detected');
        setError('Network error occurred. Please check your internet connection and try again.');
      } else if (err.message.includes('Empty or invalid BPMN')) {
        console.error('📄 BPMNViewer: Empty file error detected');
        setError('The selected file appears to be empty or corrupted.');
      } else if (err.message.includes('does not appear to contain valid BPMN')) {
        console.error('📋 BPMNViewer: Invalid BPMN content error detected');
        setError('The selected file does not appear to contain valid BPMN XML content.');
      } else if (err.message.includes('failed to parse XML') || err.message.includes('XML')) {
        console.error('🔧 BPMNViewer: XML parsing error detected');
        setError('The BPMN file contains invalid XML and cannot be displayed.');
      } else {
        console.error('❓ BPMNViewer: Unknown error type');
        setError(`Failed to load BPMN diagram: ${err.message}`);
      }
      
      console.log('🔄 BPMNViewer: Setting loading state to false due to error');
      setLoading(false);
    }
  }, [selectedFile, repository, selectedBranch]);

  // Initialize BPMN viewer with improved container readiness check
  useEffect(() => {
    const cleanupContainer = () => {
      if (containerRef.current) {
        // Clear any existing BPMN.js content from the container
        containerRef.current.innerHTML = '';
        console.log('🧹 BPMNViewer: Container cleaned up');
      }
    };

    const initializeViewer = () => {
      console.log('🛠️ BPMNViewer: initializeViewer called with:', {
        hasContainer: !!containerRef.current,
        hasViewer: !!viewerRef.current,
        selectedFile: selectedFile ? selectedFile.name : 'none',
        containerRefCurrent: containerRef.current,
        viewerRefCurrent: viewerRef.current
      });

      if (containerRef.current && !viewerRef.current && selectedFile) {
        try {
          // Clean the container before creating a new viewer
          cleanupContainer();
          
          console.log('🔧 BPMNViewer: Creating new BPMN viewer...');
          console.log('🔧 BPMNViewer: Container element details:', {
            tagName: containerRef.current.tagName,
            className: containerRef.current.className,
            clientWidth: containerRef.current.clientWidth,
            clientHeight: containerRef.current.clientHeight,
            innerHTML: containerRef.current.innerHTML.length
          });
          
          viewerRef.current = new BpmnViewer({
            container: containerRef.current
          });
          console.log('✅ BPMNViewer: BPMN viewer initialized successfully');
          console.log('📞 BPMNViewer: About to call loadBpmnContent()...');
          
          loadBpmnContent();
        } catch (error) {
          console.error('❌ BPMNViewer: Failed to initialize BPMN viewer:', error);
          console.error('🔍 BPMNViewer: Initialization error details:', {
            message: error.message,
            stack: error.stack,
            containerExists: !!containerRef.current,
            containerContent: containerRef.current ? containerRef.current.innerHTML : 'N/A'
          });
          
          // If it's an "element already exists" error, try to clean up and retry once
          if (error.message.includes('already exists')) {
            console.log('🔄 BPMNViewer: Detected "element already exists" error, attempting cleanup and retry...');
            cleanupContainer();
            
            // Wait a bit and try again
            setTimeout(() => {
              if (containerRef.current && !viewerRef.current) {
                try {
                  console.log('🔄 BPMNViewer: Retrying viewer creation after cleanup...');
                  viewerRef.current = new BpmnViewer({
                    container: containerRef.current
                  });
                  console.log('✅ BPMNViewer: BPMN viewer initialized successfully on retry');
                  loadBpmnContent();
                } catch (retryError) {
                  console.error('❌ BPMNViewer: Failed to initialize BPMN viewer on retry:', retryError);
                  setError(`Failed to initialize BPMN viewer: ${retryError.message}`);
                  setLoading(false);
                }
              }
            }, 100);
          } else {
            setError(`Failed to initialize BPMN viewer: ${error.message}`);
            setLoading(false);
          }
        }
      } else {
        console.log('⚠️ BPMNViewer: Skipping viewer initialization:', {
          hasContainer: !!containerRef.current,
          hasViewer: !!viewerRef.current,
          hasSelectedFile: !!selectedFile,
          reason: !containerRef.current ? 'No container' : 
                  viewerRef.current ? 'Viewer already exists' : 
                  !selectedFile ? 'No selected file' : 'Unknown'
        });
      }
    };

    const waitForContainer = (attempt = 0) => {
      const maxAttempts = 50; // Try for up to 5 seconds (50 * 100ms)
      
      if (containerRef.current) {
        console.log(`✅ BPMNViewer: Container found on attempt ${attempt + 1}`);
        initializeViewer();
      } else if (attempt < maxAttempts) {
        console.log(`⏳ BPMNViewer: Container not ready, attempt ${attempt + 1}/${maxAttempts}, retrying in 100ms...`);
        setTimeout(() => waitForContainer(attempt + 1), 100);
      } else {
        console.error('❌ BPMNViewer: Container never became available after maximum attempts');
        setError('Failed to initialize BPMN viewer: container not available');
        setLoading(false);
      }
    };

    if (selectedFile) {
      console.log('⏰ BPMNViewer: Starting container readiness check for selectedFile:', selectedFile.name);
      waitForContainer();
    } else {
      console.log('❌ BPMNViewer: No selectedFile, skipping viewer initialization');
    }

    return () => {
      if (viewerRef.current) {
        try {
          console.log('🧹 BPMNViewer: Destroying BPMN viewer...');
          viewerRef.current.destroy();
          console.log('✅ BPMNViewer: BPMN viewer destroyed successfully');
        } catch (error) {
          console.error('❌ BPMNViewer: Error destroying BPMN viewer:', error);
        }
        viewerRef.current = null;
      }
      // Also clean up the container on unmount
      cleanupContainer();
    };
  }, [selectedFile, loadBpmnContent]);

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