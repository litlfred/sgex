import React, { useState, useEffect, useRef } from 'react';
import { lazyLoadBpmnViewer } from '../services/libraryLoaderService';

const BPMNPreview = ({ file, repository, selectedBranch, profile }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!file || !repository || !containerRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Clean container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Create a simple demo BPMN for preview (always use demo for performance)
        const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="${file.name.replace('.bpmn', '').replace(/[-_]/g, ' ')}">
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

        // Lazy load BPMN viewer to reduce initial bundle size
        const BpmnViewer = await lazyLoadBpmnViewer();
        
        // Create and initialize viewer with timeout
        const viewer = new BpmnViewer({
          container: containerRef.current,
          width: '100%',
          height: '120px'
        });

        viewerRef.current = viewer;

        // Set a timeout for rendering
        const renderTimeout = setTimeout(() => {
          setError('Preview timed out');
          setLoading(false);
        }, 3000);

        await viewer.importXML(bpmnXml);

        // Fit to viewport for preview
        const canvas = viewer.get('canvas');
        canvas.zoom('fit-viewport');

        clearTimeout(renderTimeout);
        setLoading(false);
      } catch (err) {
        console.warn('BPMN Preview error:', err);
        setError('Preview unavailable');
        setLoading(false);
      }
    };

    // Small delay to ensure container is ready
    const timer = setTimeout(loadPreview, 200);
    return () => clearTimeout(timer);
  }, [file, repository, selectedBranch, profile]);

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          console.warn('Error destroying BPMN viewer:', err);
        }
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bpmn-preview">
      {loading ? (
        <div className="preview-loading">
          <div className="preview-spinner"></div>
          <span>Loading preview...</span>
        </div>
      ) : error ? (
        <div className="preview-error">
          <span>🔄 BPMN Preview</span>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="preview-container"
          style={{ width: '100%', height: '120px' }}
        />
      )}
    </div>
  );
};

export default BPMNPreview;