import React, { useState, useEffect, useRef } from 'react';
import githubService from '../services/githubService';
import { createLazyBpmnViewer } from '../services/lazyFactoryService';

const BPMNPreview = ({ file, repository, selectedBranch, profile }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!file || !repository) {
        console.log('🚫 BPMNPreview: Missing required props:', {
          hasFile: !!file,
          hasRepository: !!repository,
          fileName: file?.name
        });
        return;
      }

      // Wait for container to be available in DOM
      const waitForContainer = (attempt = 0) => {
        const maxAttempts = 20; // Try for up to 2 seconds
        
        if (containerRef.current) {
          console.log(`✅ BPMNPreview: Container found on attempt ${attempt + 1}`);
          startPreviewLoad();
        } else if (attempt < maxAttempts) {
          console.log(`⏳ BPMNPreview: Container not ready, attempt ${attempt + 1}/${maxAttempts}`);
          setTimeout(() => waitForContainer(attempt + 1), 100);
        } else {
          console.error('❌ BPMNPreview: Container never became available');
          setError('Failed to initialize preview container');
          setLoading(false);
        }
      };

      const startPreviewLoad = async () => {
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

          // Add comprehensive event logging for bpmn-js lifecycle
          const eventBus = viewer.get('eventBus');
          console.log('🎧 BPMNPreview: Setting up bpmn-js event listeners...');
          
          eventBus.on('import.done', (event) => {
            console.log('🎉 [BPMN Event] import.done:', {
              error: event.error,
              warnings: event.warnings?.length || 0
            });
          });
          
          eventBus.on('import.render.start', () => {
            console.log('🎨 [BPMN Event] import.render.start - Rendering began');
          });
          
          eventBus.on('import.render.complete', (event) => {
            console.log('✅ [BPMN Event] import.render.complete:', {
              duration: event.duration || 'N/A',
              error: event.error
            });
            
            // Log canvas state after render
            const canvas = viewer.get('canvas');
            const viewbox = canvas.viewbox();
            const svg = containerRef.current?.querySelector('svg');
            console.log('📊 [Post-Render State]:', {
              viewbox: viewbox,
              svgExists: !!svg,
              svgVisibility: svg ? window.getComputedStyle(svg).visibility : 'N/A',
              svgOpacity: svg ? window.getComputedStyle(svg).opacity : 'N/A',
              svgDisplay: svg ? window.getComputedStyle(svg).display : 'N/A',
              svgChildCount: svg?.children?.length || 0
            });
          });
          
          eventBus.on('canvas.viewbox.changed', (event) => {
            console.log('🔄 [BPMN Event] canvas.viewbox.changed:', {
              viewbox: event.viewbox,
              outer: event.viewbox?.outer,
              inner: event.viewbox?.inner,
              scale: event.viewbox?.scale
            });
          });
          
          eventBus.on('shape.added', (event) => {
            console.log('➕ [BPMN Event] shape.added:', {
              id: event.element?.id,
              type: event.element?.type,
              x: event.element?.x,
              y: event.element?.y,
              width: event.element?.width,
              height: event.element?.height
            });
          });
          
          eventBus.on('elements.changed', (event) => {
            console.log('🔧 [BPMN Event] elements.changed:', {
              elementCount: event.elements?.length || 0
            });
          });

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
            const elementRegistry = viewer.get('elementRegistry');
            console.log('🔍 BPMNPreview: Canvas service retrieved:', !!canvas);
            console.log('🔍 BPMNPreview: ElementRegistry retrieved:', !!elementRegistry);
            
            // Log container state
            const containerStyle = containerRef.current ? window.getComputedStyle(containerRef.current) : null;
            console.log('📦 BPMNPreview: Container state:', {
              exists: !!containerRef.current,
              dimensions: {
                offsetWidth: containerRef.current?.offsetWidth,
                offsetHeight: containerRef.current?.offsetHeight,
                clientWidth: containerRef.current?.clientWidth,
                clientHeight: containerRef.current?.clientHeight
              },
              visibility: {
                display: containerStyle?.display,
                visibility: containerStyle?.visibility,
                opacity: containerStyle?.opacity
              },
              hasParent: !!containerRef.current?.parentElement,
              isAttached: containerRef.current ? document.body.contains(containerRef.current) : false
            });
            
            // Log SVG state before zoom
            const svgBefore = containerRef.current?.querySelector('svg');
            const svgBeforeStyle = svgBefore ? window.getComputedStyle(svgBefore) : null;
            console.log('📐 BPMNPreview: SVG state BEFORE zoom:', {
              exists: !!svgBefore,
              width: svgBefore?.getAttribute('width'),
              height: svgBefore?.getAttribute('height'),
              viewBox: svgBefore?.getAttribute('viewBox'),
              inlineStyle: {
                display: svgBefore?.style.display,
                visibility: svgBefore?.style.visibility,
                opacity: svgBefore?.style.opacity,
                width: svgBefore?.style.width,
                height: svgBefore?.style.height
              },
              computedStyle: svgBeforeStyle ? {
                display: svgBeforeStyle.display,
                visibility: svgBeforeStyle.visibility,
                opacity: svgBeforeStyle.opacity,
                position: svgBeforeStyle.position,
                top: svgBeforeStyle.top,
                left: svgBeforeStyle.left
              } : null,
              childCount: svgBefore?.children?.length || 0,
              transform: svgBefore?.querySelector('g')?.getAttribute('transform')
            });
            
            // Advanced initialization sequence based on bpmn-js documentation
            // Wait for bpmn-js to complete internal layout before applying zoom
            const initializeViewport = async () => {
              console.log('🔄 BPMNPreview: Starting viewport initialization sequence...');
              
              // Step 1: Wait for elements to be registered (confirms diagram is loaded)
              const waitForElements = async (maxAttempts = 30) => {
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                  const elements = elementRegistry.getAll();
                  const nonRootElements = elements.filter(el => el.type !== 'bpmn:Process' && el.type !== 'bpmn:Collaboration' && !el.labelTarget);
                  
                  console.log(`🔍 BPMNPreview: Element check attempt ${attempt + 1}/${maxAttempts}:`, {
                    totalElements: elements.length,
                    nonRootElements: nonRootElements.length,
                    elementTypes: [...new Set(elements.map(el => el.type))]
                  });
                  
                  if (nonRootElements.length > 0) {
                    console.log('✅ BPMNPreview: Found diagram elements:', nonRootElements.length);
                    return true;
                  }
                  
                  await new Promise(resolve => requestAnimationFrame(resolve));
                }
                console.warn('⚠️ BPMNPreview: No diagram elements found after max attempts');
                return false;
              };
              
              // Step 2: Wait for canvas viewbox to have valid outer bounds
              const waitForViewbox = async (maxAttempts = 30) => {
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                  const viewbox = canvas.viewbox();
                  console.log(`🔍 BPMNPreview: Viewbox check attempt ${attempt + 1}/${maxAttempts}:`, {
                    outer: viewbox?.outer,
                    inner: viewbox?.inner,
                    hasValidOuter: !!(viewbox?.outer && viewbox.outer.width > 0 && viewbox.outer.height > 0)
                  });
                  
                  if (viewbox?.outer && viewbox.outer.width > 0 && viewbox.outer.height > 0) {
                    console.log('✅ BPMNPreview: Canvas viewbox has valid bounds:', viewbox.outer);
                    return viewbox;
                  }
                  
                  await new Promise(resolve => requestAnimationFrame(resolve));
                }
                console.warn('⚠️ BPMNPreview: Canvas viewbox never got valid bounds');
                return null;
              };
              
              // Execute initialization sequence
              const hasElements = await waitForElements();
              if (!hasElements) {
                console.error('❌ BPMNPreview: Cannot initialize viewport - no elements found');
                return false;
              }
              
              const viewbox = await waitForViewbox();
              if (!viewbox) {
                console.error('❌ BPMNPreview: Cannot initialize viewport - invalid viewbox');
                return false;
              }
              
              // Step 3: Calculate bounds from actual elements for accurate viewport
              const containerWidth = containerRef.current?.offsetWidth || 0;
              const containerHeight = containerRef.current?.offsetHeight || 0;
              
              if (containerWidth === 0 || containerHeight === 0) {
                console.error('❌ BPMNPreview: Container has invalid dimensions:', { containerWidth, containerHeight });
                return false;
              }
              
              // Get all visible elements and calculate their actual bounds
              const allElements = elementRegistry.getAll();
              const visibleElements = allElements.filter(el => {
                // Filter out root elements, labels, and connection elements
                // Only include shapes with actual dimensions
                return el.x !== undefined && 
                       el.y !== undefined && 
                       el.width !== undefined && 
                       el.height !== undefined &&
                       el.width > 0 && 
                       el.height > 0 &&
                       !el.labelTarget; // Exclude labels
              });
              
              console.log('📐 BPMNPreview: Calculating viewport from element bounds...');
              console.log('📊 BPMNPreview: Found visible elements:', {
                totalElements: allElements.length,
                visibleElements: visibleElements.length,
                containerDimensions: { containerWidth, containerHeight }
              });
              
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              
              visibleElements.forEach(element => {
                minX = Math.min(minX, element.x);
                minY = Math.min(minY, element.y);
                maxX = Math.max(maxX, element.x + element.width);
                maxY = Math.max(maxY, element.y + element.height);
              });
              
              // If we found valid bounds, use them; otherwise fall back to viewbox.outer
              let diagramBounds;
              if (minX !== Infinity && maxX !== -Infinity && minX < maxX && minY < maxY) {
                diagramBounds = {
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY
                };
                console.log('✅ BPMNPreview: Calculated bounds from elements:', diagramBounds);
              } else {
                // Fallback to viewbox.outer if element-based calculation fails
                diagramBounds = {
                  x: viewbox.outer.x,
                  y: viewbox.outer.y,
                  width: viewbox.outer.width,
                  height: viewbox.outer.height
                };
                console.warn('⚠️ BPMNPreview: Using viewbox.outer as fallback:', diagramBounds);
              }
              
              // Manual viewport calculation with padding
              const padding = 20; // Add padding around diagram
              const diagramWidth = diagramBounds.width;
              const diagramHeight = diagramBounds.height;
              
              // Calculate scale to fit diagram in container
              const scaleX = containerWidth / (diagramWidth + padding * 2);
              const scaleY = containerHeight / (diagramHeight + padding * 2);
              const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
              
              // Calculate centered position
              const x = diagramBounds.x - (containerWidth / scale - diagramWidth) / 2;
              const y = diagramBounds.y - (containerHeight / scale - diagramHeight) / 2;
              
              const manualViewbox = {
                x,
                y,
                width: containerWidth / scale,
                height: containerHeight / scale
              };
              
              console.log('📊 BPMNPreview: Manual viewport calculated:', {
                scale,
                scaleX,
                scaleY,
                diagramBounds,
                manualViewbox
              });
              
              // Step 4: Apply element-based manual viewport calculation
              try {
                // Use manual viewbox based on actual element bounds
                // This is more accurate than fit-viewport which uses viewbox.outer
                console.log('🎯 BPMNPreview: Applying element-based manual viewbox...');
                canvas.viewbox(manualViewbox);
                
                // Verify it was applied
                await new Promise(resolve => requestAnimationFrame(resolve));
                const appliedViewbox = canvas.viewbox();
                const appliedZoom = canvas.zoom();
                
                console.log('✅ BPMNPreview: Manual viewbox applied:', {
                  zoom: appliedZoom,
                  viewbox: appliedViewbox,
                  requested: manualViewbox
                });
                
                return true;
              } catch (viewboxError) {
                console.error('❌ BPMNPreview: Manual viewbox failed, trying fit-viewport fallback:', viewboxError);
                
                // Last resort: use automatic fit-viewport
                try {
                  canvas.zoom('fit-viewport');
                  console.warn('⚠️ BPMNPreview: Used fit-viewport as fallback');
                  return true;
                } catch (fallbackError) {
                  console.error('❌ BPMNPreview: All viewport methods failed:', fallbackError);
                  return false;
                }
              }
            };
            
            // Use RAF to ensure DOM is ready, then run initialization
            requestAnimationFrame(() => {
              requestAnimationFrame(async () => {
                const success = await initializeViewport();
                
                if (!success) {
                  console.error('❌ BPMNPreview: Viewport initialization failed completely');
                } else {
                  console.log('✅ BPMNPreview: Viewport initialization completed successfully');
                }
              });
            });
            
            // Ensure SVG visibility after viewport initialization
            const ensureVisibility = () => {
              requestAnimationFrame(() => {
                const svg = containerRef.current?.querySelector('svg');
                const svgStyle = svg ? window.getComputedStyle(svg) : null;
                
                console.log('👁️ BPMNPreview: Checking SVG visibility:', {
                  exists: !!svg,
                  inlineStyle: {
                    display: svg?.style.display,
                    visibility: svg?.style.visibility,
                    opacity: svg?.style.opacity
                  },
                  computedStyle: svgStyle ? {
                    display: svgStyle.display,
                    visibility: svgStyle.visibility,
                    opacity: svgStyle.opacity
                  } : null
                });
                
                if (svg) {
                  // Ensure SVG is visible
                  if (!svg.style.opacity || svg.style.opacity === '0') {
                    svg.style.opacity = '1';
                  }
                  if (svg.style.visibility === 'hidden') {
                    svg.style.visibility = 'visible';
                  }
                  if (svg.style.display === 'none') {
                    svg.style.display = 'block';
                  }
                  
                  console.log('✅ BPMNPreview: SVG visibility ensured');
                }
              });
            };
            
            // Apply visibility check after viewport initialization
            setTimeout(ensureVisibility, 100);
            setTimeout(ensureVisibility, 300);

            // Final validation - check if diagram was actually rendered
            setTimeout(() => {
              const viewbox = canvas.viewbox();
              const currentZoom = canvas.zoom();
              const svgFinal = containerRef.current?.querySelector('svg');
              const gElements = svgFinal?.querySelectorAll('g') || [];
              const shapeElements = svgFinal?.querySelectorAll('[data-element-id]') || [];
              const svgTransform = svgFinal?.querySelector('g.viewport')?.getAttribute('transform') || 'not found';
              const svgFinalStyle = svgFinal ? window.getComputedStyle(svgFinal) : null;
              
              console.log('🔍 BPMNPreview: Final rendering state:', {
                viewbox: {
                  outer: viewbox?.outer,
                  inner: viewbox?.inner,
                  scale: viewbox?.scale,
                  x: viewbox?.x,
                  y: viewbox?.y,
                  width: viewbox?.width,
                  height: viewbox?.height
                },
                zoom: {
                  level: currentZoom,
                  isIdentity: currentZoom === 1
                },
                svg: {
                  exists: !!svgFinal,
                  width: svgFinal?.getAttribute('width'),
                  height: svgFinal?.getAttribute('height'),
                  viewBox: svgFinal?.getAttribute('viewBox'),
                  childCount: svgFinal?.children?.length || 0,
                  gElementCount: gElements.length,
                  shapeElementCount: shapeElements.length,
                  viewportTransform: svgTransform,
                  inlineStyle: {
                    display: svgFinal?.style.display,
                    visibility: svgFinal?.style.visibility,
                    opacity: svgFinal?.style.opacity
                  },
                  computedStyle: svgFinalStyle ? {
                    display: svgFinalStyle.display,
                    visibility: svgFinalStyle.visibility,
                    opacity: svgFinalStyle.opacity,
                    backgroundColor: svgFinalStyle.backgroundColor,
                    fill: svgFinalStyle.fill
                  } : null
                },
                container: {
                  hasChildren: containerRef.current?.children?.length || 0,
                  dimensions: {
                    offsetWidth: containerRef.current?.offsetWidth,
                    offsetHeight: containerRef.current?.offsetHeight,
                    scrollWidth: containerRef.current?.scrollWidth,
                    scrollHeight: containerRef.current?.scrollHeight
                  },
                  style: {
                    display: containerRef.current?.style.display,
                    visibility: containerRef.current?.style.visibility,
                    backgroundColor: containerRef.current?.style.backgroundColor
                  },
                  computedStyle: containerRef.current ? {
                    display: window.getComputedStyle(containerRef.current).display,
                    visibility: window.getComputedStyle(containerRef.current).visibility,
                    backgroundColor: window.getComputedStyle(containerRef.current).backgroundColor
                  } : null
                },
                hasElements: viewbox?.inner?.width > 0 && viewbox?.inner?.height > 0,
                containerHasContent: containerRef.current?.children?.length > 0,
                transformIsIdentity: svgTransform.includes('matrix(1, 0, 0, 1, 0, 0)') || svgTransform.includes('matrix(1,0,0,1,0,0)')
              });
              
              // Check if container actually has content
              if (containerRef.current?.children?.length === 0) {
                console.error('❌ BPMNPreview: Container is EMPTY after rendering - CRITICAL ISSUE');
              } else if (!svgFinal) {
                console.error('❌ BPMNPreview: No SVG element found after rendering - CRITICAL ISSUE');
              } else if (shapeElements.length === 0) {
                console.warn('⚠️ BPMNPreview: SVG exists but has no BPMN shape elements - possible rendering issue');
              } else if (svgTransform.includes('matrix(1, 0, 0, 1, 0, 0)') || svgTransform.includes('matrix(1,0,0,1,0,0)')) {
                console.warn('⚠️ BPMNPreview: Viewport transform is identity matrix - zoom may not have worked properly');
              } else {
                console.log(`✅ BPMNPreview: Diagram appears to be properly rendered with ${shapeElements.length} shapes and valid transform`);
              }
            }, 1000); // Give more time for all operations to complete

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

      // Start the container waiting process
      waitForContainer();
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
    if (file && repository) {
      console.log('🚀 BPMNPreview: Starting loadPreview for:', file.name);
      loadPreview();
    } else {
      console.log('⏭️ BPMNPreview: Skipping loadPreview, missing props:', {
        hasFile: !!file,
        hasRepository: !!repository,
        fileName: file?.name
      });
      setLoading(false);
    }

    return cleanup;
  }, [file, repository, selectedBranch, profile]);

  return (
    <div className="bpmn-preview">
      {loading && (
        <div className="preview-loading">
          <div className="preview-spinner"></div>
          <span>Loading preview...</span>
        </div>
      )}
      {error && (
        <div className="preview-error">
          <span>❌ {error}</span>
        </div>
      )}
      <div 
        className="preview-container" 
        ref={containerRef}
        style={{ display: loading || error ? 'none' : 'block' }}
      >
        {/* BPMN viewer will be rendered here */}
      </div>
    </div>
  );
};

export default BPMNPreview;