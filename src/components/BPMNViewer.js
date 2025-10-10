import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import githubService from '../services/githubService';
import { PageLayout, usePage } from './framework';
import { createLazyBpmnViewer } from '../services/lazyFactoryService';

const BPMNViewerComponent = () => {
  return (
    <PageLayout pageName="bpmn-viewer">
      <BPMNViewerContent />
    </PageLayout>
  );
};

const BPMNViewerContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Get page data from framework
  const { profile, repository, branch, asset, loading: pageLoading, error: pageError } = usePage();
  
  console.log('BPMNViewer: Page framework data:', { profile: !!profile, repository: !!repository, branch, asset });
  console.log('BPMNViewer: Location state (legacy):', location.state);
  
  // Legacy support for location.state (backward compatibility)
  const { component, selectedFile, selectedBranch } = location.state || {};
  
  // Use framework data as primary source, fall back to location state
  const currentProfile = profile || location.state?.profile;
  const currentRepository = repository || location.state?.repository;
  const currentBranch = branch || selectedBranch;
  
  console.log('BPMNViewer: Final computed values:', {
    currentProfile: !!currentProfile,
    currentRepository: !!currentRepository,
    currentBranch,
    asset
  });
  
  // Create selectedFile from asset path or use legacy selectedFile
  const currentSelectedFile = useMemo(() => {
    return asset ? {
      name: asset.split('/').pop(),
      path: asset
    } : selectedFile;
  }, [asset, selectedFile]);
  
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('initializing');
  const [error, setError] = useState(null);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const [enhancedFullwidth, setEnhancedFullwidth] = useState(false);
  const [autoHide, setAutoHide] = useState(false);

  // Check write permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (currentRepository && currentProfile) {
        try {
          // Simple permission check - in real app, this would use githubService
          const writeAccess = currentProfile.token && currentRepository.permissions?.push;
          setHasWriteAccess(writeAccess || false);
        } catch (error) {
          console.warn('Could not check write permissions:', error);
          setHasWriteAccess(false);
        }
      }
    };

    checkPermissions();
  }, [currentRepository, currentProfile]);

  // Load BPMN file content with enhanced loading states
  const loadBpmnContent = useCallback(async () => {
    console.log('🚀 BPMNViewer: loadBpmnContent called with:', {
      hasViewer: !!viewerRef.current,
      selectedFile: currentSelectedFile,
      repository: currentRepository ? {
        name: currentRepository.name,
        owner: currentRepository.owner
      } : null
    });

    if (!viewerRef.current || !currentSelectedFile || !currentRepository) {
      console.warn('❌ BPMNViewer: Missing required parameters for loadBpmnContent:', {
        hasViewer: !!viewerRef.current,
        hasSelectedFile: !!currentSelectedFile,
        hasRepository: !!currentRepository
      });
      return;
    }

    // Declare variables outside try block so they're accessible in catch block
    const owner = currentRepository.owner?.login || currentRepository.full_name.split('/')[0];
    const repoName = currentRepository.name;
    const ref = currentBranch || 'main';
    try {
      setLoading(true);
      setError(null);
      setLoadingStep('initializing');

      console.log('🔍 BPMNViewer: Repository and file analysis:', {
        repository: {
          name: currentRepository.name,
          full_name: currentRepository.full_name,
          owner: currentRepository.owner,
          isDemo: currentRepository.isDemo,
          default_branch: currentRepository.default_branch
        },
        selectedFile: {
          name: currentSelectedFile.name,
          path: currentSelectedFile.path,
          size: currentSelectedFile.size
        },
        derivedOwner: owner,
        repoName: repoName,
        ref: ref,
        githubServiceAuthenticated: githubService.isAuth()
      });

      setLoadingStep('fetching');
      console.log(`📂 BPMNViewer: Preparing to load BPMN content from ${owner}/${repoName}:${currentSelectedFile.path} (ref: ${ref})`);
      console.log('📋 BPMNViewer: Full selected file object:', JSON.stringify(currentSelectedFile, null, 2));

      let bpmnXml;
      const isDemo = currentSelectedFile.path?.includes('demo/') || currentSelectedFile.sha?.startsWith('demo-');
      
      if (isDemo) {
        // For demo files, generate BPMN XML locally
        console.log('🎭 BPMNViewer: Demo file detected, generating BPMN content locally');
        setLoadingStep('generating');
        const processName = currentSelectedFile.name.replace('.bpmn', '').replace(/[-_]/g, ' ');
        bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${currentSelectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}" isExecutable="false">
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
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${currentSelectedFile.name.replace(/[^a-zA-Z0-9]/g, '_')}">
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
        setLoadingStep('downloading');
        bpmnXml = await githubService.getFileContent(owner, repoName, currentSelectedFile.path, ref);
      }
      
      // Validate BPMN content
      setLoadingStep('validating');
      if (!bpmnXml || !bpmnXml.trim()) {
        throw new Error('Empty or invalid BPMN file content');
      }
      
      if (!bpmnXml.includes('bpmn:definitions') && !bpmnXml.includes('<definitions')) {
        throw new Error('File does not appear to contain valid BPMN XML content');
      }

      // Import XML into viewer
      setLoadingStep('importing');
      console.log('🎨 BPMNViewer: Importing XML into BPMN viewer...');
      await viewerRef.current.importXML(bpmnXml);
      
      // Center the diagram
      setLoadingStep('centering');
      try {
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
        
        // Force canvas update to ensure diagram is immediately visible
        // This prevents the issue where diagram requires a mouse click to appear
        setTimeout(() => {
          if (viewerRef.current) {
            const canvas = viewerRef.current.get('canvas');
            // Trigger a canvas update by getting the viewbox
            canvas.viewbox();
            // Force a repaint by slightly adjusting zoom and resetting
            const currentZoom = canvas.zoom();
            canvas.zoom(currentZoom);
          }
        }, 50);
        
        console.log('✅ BPMNViewer: Successfully loaded and centered BPMN diagram');
      } catch (centerError) {
        console.warn('⚠️ BPMNViewer: Could not center diagram:', centerError);
      }
      
      // Force immediate and comprehensive visibility
      const forceVisibility = () => {
        const container = containerRef.current;
        if (container) {
          // Force visibility on all SVG elements and their children
          const svgElements = container.querySelectorAll('svg, svg *');
          svgElements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.display = element.tagName.toLowerCase() === 'svg' ? 'block' : '';
            
            // Force remove bold styling from text elements
            if (element.tagName.toLowerCase() === 'text' || element.tagName.toLowerCase() === 'tspan') {
              element.style.fontWeight = 'normal';
              element.style.fontStyle = 'normal';
              element.style.fontVariant = 'normal';
              // Remove any inline font-weight attributes
              element.removeAttribute('font-weight');
              element.removeAttribute('style');
            }
            
            // Force proper fill colors for paths and shapes
            if (['path', 'rect', 'circle', 'ellipse', 'polygon'].includes(element.tagName.toLowerCase())) {
              // Don't override text color fills
              if (!element.closest('text')) {
                element.style.fill = 'var(--who-card-bg)';
                element.style.stroke = 'var(--who-text-secondary)';
                element.style.strokeWidth = '1.5px';
              }
            }
          });
          
          // Also force the container itself to be visible
          container.style.opacity = '1';
          container.style.visibility = 'visible';
          container.style.display = 'block';
          
          console.log('🎨 BPMNViewer: Forced comprehensive SVG visibility and styling');
        }
      };
      
      // Apply immediately
      forceVisibility();
      
      // Also apply after a short delay to catch any delayed rendering
      setTimeout(forceVisibility, 50);
      setTimeout(forceVisibility, 200);
      setTimeout(forceVisibility, 500);
      
      // Set up a MutationObserver to watch for dynamic changes and fix them
      const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            needsUpdate = true;
          }
        });
        if (needsUpdate) {
          setTimeout(forceVisibility, 10);
        }
      });
      
      // Observe changes to the container
      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'fill', 'stroke', 'font-weight']
        });
        
        // Store observer for cleanup
        containerRef.current._bpmnObserver = observer;
      }
      
      setLoadingStep('complete');
      setLoading(false);
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
          name: currentSelectedFile.name,
          path: currentSelectedFile.path
        }
      });
      
      setLoadingStep('error');
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
  }, [currentSelectedFile, currentRepository, currentBranch]);

  const cleanupContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      console.log('🧹 BPMNViewer: Container cleaned up');
    }
  }, []);

  // Initialize BPMN viewer - simplified to avoid race conditions
  useEffect(() => {
    const initializeViewer = async () => {
      console.log('🛠️ BPMNViewer: initializeViewer called with:', {
        hasContainer: !!containerRef.current,
        hasViewer: !!viewerRef.current,
        selectedFile: currentSelectedFile ? currentSelectedFile.name : 'none',
        containerRefCurrent: containerRef.current,
        viewerRefCurrent: viewerRef.current
      });

      if (containerRef.current && !viewerRef.current && currentSelectedFile) {
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
          
          // Lazy load BPMN.js viewer to improve initial page responsiveness
          viewerRef.current = await createLazyBpmnViewer({
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
            setTimeout(async () => {
              if (containerRef.current && !viewerRef.current) {
                try {
                  console.log('🔄 BPMNViewer: Retrying viewer creation after cleanup...');
                  // Lazy load BPMN.js viewer to improve initial page responsiveness
                  viewerRef.current = await createLazyBpmnViewer({
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
          hasSelectedFile: !!currentSelectedFile,
          reason: !containerRef.current ? 'No container' : 
                  viewerRef.current ? 'Viewer already exists' : 
                  !currentSelectedFile ? 'No selected file' : 'Unknown'
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

    if (currentSelectedFile) {
      console.log('⏰ BPMNViewer: Starting container readiness check for selectedFile:', currentSelectedFile.name);
      waitForContainer();
    } else {
      console.log('❌ BPMNViewer: No currentSelectedFile, skipping viewer initialization');
    }

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (error) {
          console.warn('Warning cleaning up BPMN viewer:', error);
        }
        viewerRef.current = null;
      }
      
      // Clean up mutation observer
      if (containerRef.current && containerRef.current._bpmnObserver) {
        containerRef.current._bpmnObserver.disconnect();
        delete containerRef.current._bpmnObserver;
      }
    };
  }, [currentSelectedFile, loadBpmnContent, cleanupContainer]);

  const handleEditMode = () => {
    if (!hasWriteAccess) {
      alert('You need write permissions to edit BPMN files. Please check your GitHub token permissions.');
      return;
    }

    const owner = currentRepository.owner?.login || currentRepository.full_name.split('/')[0];
    const repoName = currentRepository.name;
    const path = currentBranch 
      ? `/bpmn-editor/${owner}/${repoName}/${currentBranch}`
      : `/bpmn-editor/${owner}/${repoName}`;

    navigate(path, {
      state: {
        profile: currentProfile,
        repository: currentRepository,
        component,
        selectedFile: currentSelectedFile,
        selectedBranch: currentBranch,
        mode: 'edit'
      }
    });
  };

  const handleBackToSelection = () => {
    navigate('/business-process-selection', {
      state: {
        profile: currentProfile,
        repository: currentRepository,
        component,
        selectedBranch: currentBranch
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

  // Handle redirect when data is missing
  useEffect(() => {
    // Check if we're on an asset URL pattern (has more than 5 path segments after /sgex)
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const isAssetURL = pathSegments.length > 5; // /sgex/bpmn-viewer/user/repo/branch/asset...
    
    // If we're on an asset URL, wait for framework to load before deciding to redirect
    if (isAssetURL) {
      // Only redirect if we have both no framework data AND no location state
      if (!profile && !repository && !asset && 
          !currentProfile && !currentRepository && !currentSelectedFile) {
        console.log('BPMNViewer: On asset URL but no data available from framework or location state, redirecting to home');
        navigate('/');
      }
    } else {
      // For non-asset URLs, use the original logic
      if (!currentProfile || !currentRepository || !currentSelectedFile) {
        console.log('BPMNViewer: Missing required data, redirecting to home:', {
          hasProfile: !!currentProfile,
          hasRepository: !!currentRepository,
          hasSelectedFile: !!currentSelectedFile
        });
        navigate('/');
      }
    }
  }, [currentProfile, currentRepository, currentSelectedFile, profile, repository, asset, location.pathname, navigate]);

  // Don't render the component if we're missing required data, unless we're on asset URL and framework is loading
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  const isAssetURL = pathSegments.length > 5;
  
  if (!currentProfile || !currentRepository || !currentSelectedFile) {
    if (isAssetURL && (!profile || !repository || !asset)) {
      // Framework might still be loading for asset URL
      return <div>Loading framework data...</div>;
    }
    return <div>Loading or redirecting...</div>;
  }

  return (
      <div className={`bpmn-viewer ${enhancedFullwidth ? 'enhanced-fullwidth' : ''} ${autoHide ? 'auto-hide' : ''}`}>
      <div className="viewer-content">

        <div className="viewer-main">
          <div className="viewer-toolbar">
            <div className="toolbar-left">
              <h3>{currentSelectedFile.name}</h3>
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
                    Fetching {currentSelectedFile.name} from {currentRepository.name}
                  </p>
                  <div className="loading-progress">
                    <div className={`loading-step ${loadingStep === 'initializing' ? 'active' : loadingStep === 'fetching' || loadingStep === 'downloading' || loadingStep === 'generating' || loadingStep === 'validating' || loadingStep === 'importing' || loadingStep === 'centering' || loadingStep === 'complete' ? 'complete' : ''}`}>
                      Initializing viewer
                    </div>
                    <div className={`loading-step ${loadingStep === 'fetching' || loadingStep === 'downloading' || loadingStep === 'generating' ? 'active' : loadingStep === 'validating' || loadingStep === 'importing' || loadingStep === 'centering' || loadingStep === 'complete' ? 'complete' : ''}`}>
                      {loadingStep === 'generating' ? 'Generating demo content' : 'Fetching BPMN file'}
                    </div>
                    <div className={`loading-step ${loadingStep === 'validating' ? 'active' : loadingStep === 'importing' || loadingStep === 'centering' || loadingStep === 'complete' ? 'complete' : ''}`}>
                      Validating BPMN XML
                    </div>
                    <div className={`loading-step ${loadingStep === 'importing' ? 'active' : loadingStep === 'centering' || loadingStep === 'complete' ? 'complete' : ''}`}>
                      Importing diagram
                    </div>
                    <div className={`loading-step ${loadingStep === 'centering' ? 'active' : loadingStep === 'complete' ? 'complete' : ''}`}>
                      Centering view
                    </div>
                  </div>
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
                      state: { profile: currentProfile, repository: currentRepository, component, selectedBranch: currentBranch }
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
                <span className="value">{currentSelectedFile?.name || 'No file'}</span>
              </div>
              <div className="condensed-info-item">
                <span className="label">📏</span>
                <span className="value">{currentSelectedFile?.size ? `${(currentSelectedFile.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
              </div>
              <div className="condensed-info-item">
                <span className="label">🌿</span>
                <span className="value">{currentBranch || 'main'}</span>
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
  );
};

export default BPMNViewerComponent;