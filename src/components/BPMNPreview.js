import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import { createLazyBpmnViewer } from '../utils/lazyImports';

const BPMNPreview = ({ file, repository, selectedBranch, profile }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!file || !repository || !containerRef.current) {
        console.log('🚫 BPMNPreview: Missing required props:', {
          hasFile: !!file,
          hasRepository: !!repository,
          hasContainer: !!containerRef.current,
          fileName: file?.name
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Clean container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        const ref = selectedBranch || 'main';
        const isDemo = file.path?.includes('demo/') || file.sha?.startsWith('demo-');

        console.log('🎬 BPMNPreview: Starting preview load for file:', {
          fileName: file.name,
          filePath: file.path,
          owner: owner,
          repoName: repoName,
          ref: ref,
          isDemo: isDemo,
          hasDownloadUrl: !!file.download_url
        });

        let bpmnXml;

        if (isDemo) {
          // For demo files, create a representative BPMN diagram
          const processName = file.name.replace('.bpmn', '').replace(/[-_]/g, ' ');
          bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}" isExecutable="false">
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
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}">
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
          // For real files, try to load the actual BPMN content
          console.log('📥 BPMNPreview: Attempting to load real BPMN file content...');
          try {
            console.log('🌐 BPMNPreview: Calling githubService.getFileContent with params:', {
              owner, repoName, path: file.path, ref
            });
            bpmnXml = await githubService.getFileContent(owner, repoName, file.path, ref);
            console.log('✅ BPMNPreview: Successfully loaded BPMN content, length:', bpmnXml?.length);
            console.log('🔍 BPMNPreview: Content preview (first 100 chars):', bpmnXml?.substring(0, 100));
            
            // Validate that we got actual BPMN content
            if (!bpmnXml || typeof bpmnXml !== 'string') {
              throw new Error('Invalid content received: not a string');
            }
            
            if (!bpmnXml.includes('bpmn:definitions') && !bpmnXml.includes('<definitions')) {
              console.warn('⚠️ BPMNPreview: Content does not appear to be valid BPMN XML');
              console.log('🔍 BPMNPreview: Full content received:', bpmnXml);
              throw new Error('Content does not appear to be valid BPMN');
            }
            
            console.log('✅ BPMNPreview: BPMN content validation passed');
          } catch (fileError) {
            console.warn('❌ BPMNPreview: Could not load BPMN file content:', fileError.message, fileError.status);
            console.error('🔍 BPMNPreview: File loading error details:', {
              error: fileError,
              stack: fileError.stack,
              fileName: file.name,
              filePath: file.path,
              owner,
              repoName,
              ref
            });
            // Fallback to a generic BPMN diagram if file can't be loaded
            const processName = file.name.replace('.bpmn', '').replace(/[-_]/g, ' ');
            console.log('🔄 BPMNPreview: Using fallback BPMN diagram for:', processName);
            bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}" isExecutable="false">
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
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}">
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
          }
        }

        console.log('🔧 BPMNPreview: Creating BPMN viewer...');
        console.log('🔍 BPMNPreview: About to create viewer with BPMN content length:', bpmnXml?.length);
        
        // Create and initialize viewer with clean separation - lazy load BPMN.js
        const viewer = await createLazyBpmnViewer();
        viewerRef.current = viewer;
        
        console.log('✅ BPMNPreview: BPMN viewer instance created successfully');

        try {
          console.log('🔗 BPMNPreview: Attaching viewer to container...');
          console.log('🔍 BPMNPreview: Container element details:', {
            exists: !!containerRef.current,
            className: containerRef.current?.className,
            width: containerRef.current?.offsetWidth,
            height: containerRef.current?.offsetHeight,
            parentExists: !!containerRef.current?.parentElement
          });
          
          // Create timeout promise for viewer operations
          const createTimeoutPromise = (operation, timeoutMs = 10000) => {
            return new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`${operation} timeout after ${timeoutMs}ms`));
              }, timeoutMs);
            });
          };
          
          // Attach viewer to container first with timeout
          const attachPromise = viewer.attachTo(containerRef.current);
          await Promise.race([attachPromise, createTimeoutPromise('Viewer attach', 5000)]);
          console.log('✅ BPMNPreview: Successfully attached viewer to container');
          
          console.log('📊 BPMNPreview: Importing BPMN XML...');
          console.log('🔍 BPMNPreview: XML content preview (first 200 chars):', bpmnXml?.substring(0, 200));
          
          // Import XML with timeout handling
          const importStartTime = Date.now();
          const importPromise = viewer.importXML(bpmnXml);
          const importResult = await Promise.race([importPromise, createTimeoutPromise('XML import', 15000)]);
          const importTime = Date.now() - importStartTime;
          
          console.log(`✅ BPMNPreview: Successfully imported BPMN XML in ${importTime}ms`);
          console.log('📊 BPMNPreview: Import result details:', {
            warnings: importResult?.warnings?.length || 0,
            hasWarnings: !!(importResult?.warnings?.length),
            warningDetails: importResult?.warnings
          });
          
          if (importResult?.warnings?.length > 0) {
            console.warn('⚠️ BPMNPreview: Import warnings:', importResult.warnings);
          }
          
          console.log('🎯 BPMNPreview: Fitting to viewport...');
          // Fit to viewport for preview
          const canvas = viewer.get('canvas');
          console.log('🔍 BPMNPreview: Canvas service retrieved:', !!canvas);
          
          const zoomStartTime = Date.now();
          canvas.zoom('fit-viewport');
          const zoomTime = Date.now() - zoomStartTime;
          
          console.log(`✅ BPMNPreview: Successfully fitted to viewport in ${zoomTime}ms`);

          // Final validation - check if diagram was actually rendered
          const viewbox = canvas.viewbox();
          console.log('🔍 BPMNPreview: Final viewport details:', {
            viewbox,
            hasElements: viewbox.inner?.width > 0 && viewbox.inner?.height > 0,
            containerHasContent: containerRef.current?.children?.length > 0
          });
          
          // Check if container actually has content
          if (containerRef.current?.children?.length === 0) {
            console.warn('⚠️ BPMNPreview: Container is empty after rendering - potential issue');
          }

          console.log(`🎉 BPMNPreview: Successfully rendered preview for: ${file.name}`);
          setLoading(false);
        } catch (importError) {
          console.error('❌ BPMNPreview: Failed to import BPMN XML:', importError);
          console.error('🔍 BPMNPreview: Import error details:', {
            message: importError.message,
            stack: importError.stack,
            fileName: file.name,
            xmlLength: bpmnXml?.length,
            xmlPreview: bpmnXml?.substring(0, 300),
            containerState: {
              exists: !!containerRef.current,
              hasChildren: containerRef.current?.children?.length || 0,
              clientHeight: containerRef.current?.clientHeight,
              clientWidth: containerRef.current?.clientWidth
            }
          });
          setError(`Failed to load preview: ${importError.message}`);
          setLoading(false);
        }

      } catch (renderError) {
        console.error('❌ BPMNPreview: Failed to render BPMN preview:', renderError.message || renderError);
        console.log('🔍 BPMNPreview: Error details:', {
          fileName: file.name,
          filePath: file.path,
          errorMessage: renderError.message,
          errorStack: renderError.stack
        });
        setError('Failed to load preview');
        setLoading(false);
      }
    };

    // Cleanup function
    const cleanup = () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (cleanupError) {
          console.warn('Error cleaning up BPMN viewer:', cleanupError);
        }
        viewerRef.current = null;
      }
    };

    // Only run if we have all required props
    if (file && repository && containerRef.current) {
      console.log('🚀 BPMNPreview: Starting loadPreview for:', file.name);
      loadPreview();
    } else {
      console.log('⏭️ BPMNPreview: Skipping loadPreview, missing props:', {
        hasFile: !!file,
        hasRepository: !!repository,
        hasContainer: !!containerRef.current,
        fileName: file?.name
      });
      setLoading(false);
    }

    return cleanup;
  }, [file, repository, selectedBranch, profile]);

  if (loading) {
    return (
      <div className="bpmn-preview">
        <div className="preview-loading">
          <div className="preview-spinner"></div>
          <span>Loading preview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bpmn-preview">
        <div className="preview-error">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bpmn-preview">
      <div className="preview-container" ref={containerRef}>
        {/* BPMN viewer will be rendered here */}
      </div>
    </div>
  );
};

export default BPMNPreview;