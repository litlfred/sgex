import React, { useState, useEffect, useRef } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import githubService from '../services/githubService';
import './BPMNPreview.css';

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
            bpmnXml = await githubService.getFileContent(owner, repoName, file.path, ref);
            console.log('✅ BPMNPreview: Successfully loaded BPMN content, length:', bpmnXml?.length);
          } catch (fileError) {
            console.warn('❌ BPMNPreview: Could not load BPMN file content:', fileError.message, fileError.status);
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
        // Create and initialize viewer with clean separation
        const viewer = new BpmnViewer();
        viewerRef.current = viewer;

        try {
          console.log('🔗 BPMNPreview: Attaching viewer to container...');
          // Attach viewer to container first
          await viewer.attachTo(containerRef.current);
          
          console.log('📊 BPMNPreview: Importing BPMN XML...');
          // Then import XML
          await viewer.importXML(bpmnXml);
          
          console.log('🎯 BPMNPreview: Fitting to viewport...');
          // Fit to viewport for preview
          const canvas = viewer.get('canvas');
          canvas.zoom('fit-viewport');

          console.log('✅ BPMNPreview: Successfully rendered preview for:', file.name);
          setLoading(false);
        } catch (importError) {
          console.error('❌ BPMNPreview: Failed to import BPMN XML:', importError.message || importError);
          setError('Failed to load preview');
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