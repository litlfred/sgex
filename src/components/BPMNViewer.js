import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import githubService from '../services/githubService';
import { PageLayout, useDAKParams } from './framework';
import './BPMNViewer.css';

const BPMNViewerComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Try to get data from framework params first, then fall back to location state
  const frameworkData = useDAKParams();
  
  const { profile, repository, component, selectedFile, selectedBranch } = location.state || {};
  
  // Use framework data if available, otherwise use location state
  const currentProfile = frameworkData?.profile || profile;
  const currentRepository = frameworkData?.repository || repository;
  const currentBranch = frameworkData?.branch || selectedBranch;
  const assetPath = frameworkData?.asset;
  
  // If we have asset path from URL, create a selectedFile object
  const currentSelectedFile = useMemo(() => {
    return assetPath ? {
      name: assetPath.split('/').pop(),
      path: assetPath
    } : selectedFile;
  }, [assetPath, selectedFile]);
  
  const [loading, setLoading] = useState(true);
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

  // Load BPMN file content
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
      console.log('📡 BPMNViewer: Setting loading state to true');
      setLoading(true);
      setError(null);

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

      console.log(`📂 BPMNViewer: Preparing to load BPMN content from ${owner}/${repoName}:${currentSelectedFile.path} (ref: ${ref})`);
      console.log('📋 BPMNViewer: Full selected file object:', JSON.stringify(currentSelectedFile, null, 2));
      
      // Add a timeout for the entire loading process
      console.log('⏰ BPMNViewer: Setting up 30-second timeout for loading process');
      const loadingTimeout = setTimeout(() => {
        console.error('⏰ BPMNViewer: Loading process timed out after 30 seconds');
        setError('Loading timed out. Please try again or check your internet connection.');
        setLoading(false);
      }, 30000); // 30 second timeout
      
      try {
        // Use githubService to fetch file content (works for both public and private repos)
        console.log(`🌐 BPMNViewer: About to call githubService.getFileContent with params:`, {
          owner,
          repoName,
          path: currentSelectedFile.path,
          ref
        });
        
        console.log('🌐 BPMNViewer: Making GitHub API call...');
        const startTime = Date.now();
        const bpmnXml = await githubService.getFileContent(owner, repoName, currentSelectedFile.path, ref);
        const endTime = Date.now();
        
        console.log(`✅ BPMNViewer: Successfully loaded BPMN content from repository in ${endTime - startTime}ms`);
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
          name: currentSelectedFile.name,
          path: currentSelectedFile.path
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
  }, [currentSelectedFile, currentRepository, currentBranch]);

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
  }, [currentSelectedFile, loadBpmnContent]);

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

  if (!currentProfile || !currentRepository || !currentSelectedFile) {
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
    </PageLayout>
  );
};

export default BPMNViewerComponent;