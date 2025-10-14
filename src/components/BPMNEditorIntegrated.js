import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetEditorLayout, usePage } from './framework';
import { useDakComponent } from '../services/ComponentObjectProvider';
import { createLazyBpmnModeler } from '../services/lazyFactoryService';

/**
 * BPMN Editor - Integrated with DAK Component Objects
 * 
 * This is the updated version that uses BusinessProcessWorkflowComponent
 * for all data operations instead of direct staging ground/GitHub access.
 * 
 * Key changes from original:
 * - Uses useDakComponent('businessProcesses') hook for Component Object access
 * - Saves via component.save() which automatically updates dak.json
 * - Loads via component.retrieveAll() for consistent data access
 * - No direct staging ground or GitHub API calls
 */
const BPMNEditorIntegrated = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = usePage();
  const component = useDakComponent('businessProcesses');
  const modelerRef = useRef(null);
  const containerRef = useRef(null);
  
  const [bpmnFiles, setBpmnFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentXmlContent, setCurrentXmlContent] = useState('');
  const [originalXmlContent, setOriginalXmlContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize BPMN modeler
  useEffect(() => {
    const initializeModeler = async () => {
      if (containerRef.current && !modelerRef.current && selectedFile) {
        try {
          modelerRef.current = await createLazyBpmnModeler({
            container: containerRef.current
          });
          console.log('BPMN modeler initialized successfully');
        } catch (error) {
          console.error('Failed to initialize BPMN modeler:', error);
          setError('Failed to initialize BPMN editor');
        }
      }
    };

    if (selectedFile) {
      initializeModeler();
      const timer = setTimeout(initializeModeler, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (modelerRef.current) {
        try {
          modelerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying BPMN modeler:', error);
        }
        modelerRef.current = null;
      }
    };
  }, [selectedFile]);

  // Load BPMN files using Component Object
  useEffect(() => {
    const loadBpmnFiles = async () => {
      if (!profile || !repository) {
        navigate('/');
        return;
      }

      if (!component) {
        console.log('Component Object not yet available, waiting...');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use Component Object to retrieve all business processes
        const workflows = await component.retrieveAll();
        
        // Transform Component Object data to file list format
        const fileList = workflows.map((workflow, index) => ({
          name: workflow.filename || `workflow-${index + 1}.bpmn`,
          path: workflow.path || `input/process/${workflow.filename || `workflow-${index + 1}.bpmn`}`,
          sha: workflow.sha || `mock-sha-${index}`,
          size: workflow.content?.length || 0,
          type: 'file',
          url: workflow.url,
          download_url: workflow.downloadUrl,
          content: workflow.content
        }));

        setBpmnFiles(fileList);
        console.log(`Loaded ${fileList.length} BPMN files via Component Object`);
        setLoading(false);
      } catch (error) {
        console.error('Error loading BPMN files via Component Object:', error);
        setError('Failed to load BPMN files');
        setLoading(false);
      }
    };

    loadBpmnFiles();
  }, [profile, repository, component, navigate]);

  // Save BPMN using Component Object
  const saveBpmn = async () => {
    if (!modelerRef.current || !selectedFile) {
      console.error('Cannot save: modeler or file not available');
      return false;
    }

    try {
      // Get current XML from modeler
      const { xml } = await modelerRef.current.saveXML({ format: true });
      
      // Validate the BPMN
      const validationResult = await component.validate({
        id: selectedFile.name.replace('.bpmn', ''),
        name: selectedFile.name.replace('.bpmn', '').replace(/-/g, ' '),
        content: xml,
        filename: selectedFile.name
      });

      if (!validationResult.isValid) {
        setError(`Validation errors: ${validationResult.errors.join(', ')}`);
        return false;
      }

      // Save using Component Object
      // This automatically creates/updates the source in dak.json
      await component.save(
        {
          id: selectedFile.name.replace('.bpmn', ''),
          name: selectedFile.name.replace('.bpmn', '').replace(/-/g, ' '),
          content: xml,
          filename: selectedFile.name,
          path: selectedFile.path
        },
        {
          saveType: 'file', // Save as file (not inline)
          path: selectedFile.path,
          commit: false // Don't commit yet, just stage
        }
      );

      // Update state
      setOriginalXmlContent(xml);
      setCurrentXmlContent(xml);
      setHasUnsavedChanges(false);
      
      console.log('BPMN saved successfully via Component Object');
      console.log('dak.json automatically updated with source reference');
      return true;
    } catch (error) {
      console.error('Error saving BPMN via Component Object:', error);
      setError(`Failed to save: ${error.message}`);
      return false;
    }
  };

  // Load selected BPMN file
  const loadBpmnFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(file);

      // Wait for modeler to be ready
      setTimeout(async () => {
        try {
          if (!modelerRef.current && containerRef.current) {
            modelerRef.current = await createLazyBpmnModeler({
              container: containerRef.current
            });
          }

          if (!modelerRef.current) {
            setError('BPMN editor not ready. Please try again.');
            setLoading(false);
            return;
          }

          // Get BPMN content
          let bpmnXml = file.content;
          
          if (!bpmnXml) {
            // If no content in file object, try to retrieve via Component Object
            const workflows = await component.retrieveAll();
            const workflow = workflows.find(w => w.filename === file.name);
            if (workflow && workflow.content) {
              bpmnXml = workflow.content;
            }
          }

          // Use default if still no content
          if (!bpmnXml) {
            bpmnXml = createDefaultBpmnXml(file.name);
          }

          // Import diagram
          await modelerRef.current.importXML(bpmnXml);
          setOriginalXmlContent(bpmnXml);
          setCurrentXmlContent(bpmnXml);
          setHasUnsavedChanges(false);

          // Listen for changes
          const eventBus = modelerRef.current.get('eventBus');
          eventBus.on('commandStack.changed', () => {
            modelerRef.current.saveXML({ format: true }).then(({ xml }) => {
              setCurrentXmlContent(xml);
              setHasUnsavedChanges(xml !== originalXmlContent);
            });
          });

          setLoading(false);
        } catch (error) {
          console.error('Error loading BPMN file:', error);
          setError(`Failed to load diagram: ${error.message}`);
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error in loadBpmnFile:', error);
      setError(`Failed to load file: ${error.message}`);
      setLoading(false);
    }
  };

  // Create default BPMN XML
  const createDefaultBpmnXml = (filename) => {
    const processId = filename.replace('.bpmn', '');
    const processName = processId.replace(/-/g, ' ').toUpperCase();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${processId}" name="${processName}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="${processName}">
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
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${processId}">
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
  };

  // Component status message
  const componentStatus = component ? 
    'Using Component Object for data operations' : 
    'Waiting for Component Object initialization...';

  return (
    <AssetEditorLayout
      title="BPMN Business Process Editor (Integrated)"
      status={componentStatus}
      onSave={saveBpmn}
      onCancel={() => navigate('/dashboard')}
      hasUnsavedChanges={hasUnsavedChanges}
      saveLabel="Save Process"
    >
      <div className="bpmn-editor">
        <div className="bpmn-editor-header">
          <h2>BPMN Workflows</h2>
          <p className="integration-note">
            ✅ This editor uses Component Objects - all changes automatically update dak.json
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            <p>Loading BPMN files...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="file-list">
              <h3>Available Workflows ({bpmnFiles.length})</h3>
              <ul>
                {bpmnFiles.map((file) => (
                  <li
                    key={file.path}
                    className={selectedFile?.path === file.path ? 'selected' : ''}
                    onClick={() => loadBpmnFile(file)}
                  >
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedFile && (
              <div className="bpmn-modeler-container">
                <div className="modeler-header">
                  <h3>Editing: {selectedFile.name}</h3>
                  {hasUnsavedChanges && (
                    <span className="unsaved-indicator">● Unsaved changes</span>
                  )}
                </div>
                <div 
                  ref={containerRef} 
                  className="bpmn-canvas"
                  style={{ height: '600px', border: '1px solid #ccc' }}
                />
              </div>
            )}
          </>
        )}

        <style jsx>{`
          .bpmn-editor {
            padding: 20px;
          }
          .bpmn-editor-header {
            margin-bottom: 20px;
          }
          .integration-note {
            color: #0078d4;
            font-weight: 500;
            margin-top: 8px;
          }
          .file-list {
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .file-list ul {
            list-style: none;
            padding: 0;
          }
          .file-list li {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .file-list li:hover {
            background: #e8e8e8;
          }
          .file-list li.selected {
            background: #0078d4;
            color: white;
          }
          .file-name {
            flex: 1;
          }
          .file-size {
            font-size: 0.9em;
            color: #666;
          }
          .file-list li.selected .file-size {
            color: #fff;
          }
          .modeler-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .unsaved-indicator {
            color: #ff9800;
            font-weight: bold;
          }
          .loading-message, .error-message {
            padding: 20px;
            text-align: center;
          }
          .error-message {
            background: #ffe6e6;
            color: #d32f2f;
            border-radius: 4px;
          }
        `}</style>
      </div>
    </AssetEditorLayout>
  );
};

export default BPMNEditorIntegrated;
