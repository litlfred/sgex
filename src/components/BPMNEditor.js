import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { Octokit } from '@octokit/rest';
import { AssetEditorLayout } from './framework';
import './BPMNEditor.css';

const BPMNEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modelerRef = useRef(null);
  const containerRef = useRef(null);
  
  const { profile, repository, component } = location.state || {};
  
  const [bpmnFiles, setBpmnFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentXmlContent, setCurrentXmlContent] = useState('');
  const [originalXmlContent, setOriginalXmlContent] = useState('');

  // Initialize BPMN modeler
  useEffect(() => {
    // Initialize modeler when container is available and file is selected
    const initializeModeler = () => {
      if (containerRef.current && !modelerRef.current && selectedFile) {
        try {
          modelerRef.current = new BpmnModeler({
            container: containerRef.current,
            keyboard: {
              bindTo: window
            }
          });
          console.log('BPMN modeler initialized successfully');
        } catch (error) {
          console.error('Failed to initialize BPMN modeler:', error);
        }
      }
    };

    // Try to initialize immediately if we have a selected file
    if (selectedFile) {
      initializeModeler();
      
      // If container is not ready, wait a bit and try again
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

  // Load BPMN files from repository
  useEffect(() => {
    const loadBpmnFiles = async () => {
      if (!profile || !repository) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use GitHub API if profile has token, otherwise use mock data
        if (profile.token) {
          try {
            const octokit = new Octokit({ auth: profile.token });
            const { data } = await octokit.rest.repos.getContent({
              owner: repository.owner?.login || repository.full_name.split('/')[0],
              repo: repository.name,
              path: 'input/business-processes'
            });

            // Filter for .bpmn files
            const bpmnFiles = Array.isArray(data) 
              ? data.filter(file => file.name.endsWith('.bpmn'))
              : data.name.endsWith('.bpmn') ? [data] : [];

            setBpmnFiles(bpmnFiles);
            setLoading(false);
            return;
          } catch (apiError) {
            console.warn('GitHub API error, falling back to mock data:', apiError);
            // Fall through to mock data
          }
        }

        // Mock BPMN files for demonstration
        const mockFiles = [
          {
            name: 'patient-registration.bpmn',
            path: 'input/business-processes/patient-registration.bpmn',
            sha: 'abc123',
            size: 2048,
            download_url: 'https://raw.githubusercontent.com/...'
          },
          {
            name: 'vaccination-workflow.bpmn',
            path: 'input/business-processes/vaccination-workflow.bpmn',
            sha: 'def456',
            size: 3072,
            download_url: 'https://raw.githubusercontent.com/...'
          },
          {
            name: 'appointment-scheduling.bpmn',
            path: 'input/business-processes/appointment-scheduling.bpmn',
            sha: 'ghi789',
            size: 1536,
            download_url: 'https://raw.githubusercontent.com/...'
          }
        ];

        setBpmnFiles(mockFiles);
        setLoading(false);
      } catch (err) {
        console.error('Error loading BPMN files:', err);
        setError('Failed to load BPMN files from repository');
        setLoading(false);
      }
    };

    loadBpmnFiles();
  }, [profile, repository, navigate]);

  // Track BPMN content changes
  useEffect(() => {
    if (modelerRef.current) {
      const handleChanged = () => {
        // Update current content when diagram changes
        modelerRef.current.saveXML({ format: true })
          .then(({ xml }) => {
            setCurrentXmlContent(xml);
          })
          .catch(error => {
            console.error('Error getting XML content:', error);
          });
      };

      modelerRef.current.on('commandStack.changed', handleChanged);
      
      return () => {
        if (modelerRef.current) {
          modelerRef.current.off('commandStack.changed', handleChanged);
        }
      };
    }
  }, [selectedFile]);

  // Handle save completion
  const handleSave = async (content, saveType) => {
    console.log(`BPMN diagram saved to ${saveType}`);
    if (saveType === 'github') {
      // After GitHub save, update the original content
      setOriginalXmlContent(content);
    }
  };

  // Custom save to GitHub function that exports XML and uses GitHub API
  const customSaveToGitHub = async (commitMessage) => {
    if (!commitMessage.trim() || !selectedFile || !modelerRef.current) {
      return false;
    }

    try {
      // Export BPMN XML
      const { xml } = await modelerRef.current.saveXML({ format: true });

      // Use GitHub API if profile has token
      if (profile.token && repository) {
        const octokit = new Octokit({ auth: profile.token });
        
        // Get current file to get SHA for update
        let currentSha = selectedFile.sha;
        try {
          const { data: currentFile } = await octokit.rest.repos.getContent({
            owner: repository.owner?.login || repository.full_name.split('/')[0],
            repo: repository.name,
            path: selectedFile.path
          });
          currentSha = currentFile.sha;
        } catch (getError) {
          console.warn('Could not get current file SHA, using provided SHA:', getError);
        }

        // Commit the updated BPMN file
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: repository.owner?.login || repository.full_name.split('/')[0],
          repo: repository.name,
          path: selectedFile.path,
          message: commitMessage,
          content: btoa(xml), // Base64 encode the XML content
          sha: currentSha,
          committer: {
            name: profile.name || profile.login,
            email: profile.email || `${profile.login}@users.noreply.github.com`
          }
        });

        console.log('BPMN file committed to GitHub successfully');
        return true;
      }

      // Fallback: return false for demo mode
      return false;
    } catch (error) {
      console.error('Error saving BPMN to GitHub:', error);
      throw error;
    }
  };

  // Load selected BPMN file content
  const loadBpmnFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(file);

      // Wait for the next render cycle to ensure container is visible
      setTimeout(async () => {
        try {
          // Initialize modeler if not already done
          if (!modelerRef.current && containerRef.current) {
            modelerRef.current = new BpmnModeler({
              container: containerRef.current,
              keyboard: {
                bindTo: window
              }
            });
            console.log('BPMN modeler initialized for file loading');
          }

          // Ensure modeler is initialized
          if (!modelerRef.current) {
            console.error('BPMN modeler not available');
            setError('BPMN editor not ready. Please try again.');
            setLoading(false);
            return;
          }

          // Load actual BPMN content from GitHub if available
          let bpmnXml = null;
          if (profile.token && file.download_url) {
            try {
              const response = await fetch(file.download_url);
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
  <bpmn:process id="Process_${file.name.replace('.bpmn', '')}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="${file.name.replace('.bpmn', '').replace('-', ' ').toUpperCase()}">
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
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${file.name.replace('.bpmn', '')}">
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
          await modelerRef.current.importXML(bpmnXml);
          
          // Set the content states
          setOriginalXmlContent(bpmnXml);
          setCurrentXmlContent(bpmnXml);
          
          setLoading(false);
        } catch (err) {
          console.error('Error loading BPMN file:', err);
          setError('Failed to load BPMN diagram');
          setLoading(false);
        }
      }, 100);

    } catch (err) {
      console.error('Error initializing BPMN file load:', err);
      setError('Failed to initialize BPMN editor');
      setLoading(false);
    }
  };

  if (!profile || !repository || !component) {
    navigate('/');
    return <div>Redirecting...</div>;
  }

  // Check if there are changes in the BPMN diagram
  const hasChanges = currentXmlContent !== originalXmlContent;

  return (
    <AssetEditorLayout
      pageName="bpmn-editor"
      file={selectedFile}
      repository={repository}
      branch="main" // You might want to get this from props or state
      content={currentXmlContent}
      originalContent={originalXmlContent}
      hasChanges={hasChanges}
      onSave={handleSave}
      saveButtonsPosition="top"
      // Custom save function for GitHub to handle BPMN XML export
      customSaveToGitHub={customSaveToGitHub}
    >
      <div className="bpmn-editor">
        <div className="editor-content">
          <div className="bpmn-workspace">
            <div className="file-browser">
              <div className="file-browser-header">
                <h3>BPMN Files</h3>
                <span className="file-path">input/business-processes/</span>
              </div>
              
              {loading && !selectedFile ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading BPMN files...</p>
                </div>
              ) : error ? (
                <div className="error">
                  <p>❌ {error}</p>
                </div>
              ) : (
                <div className="file-list">
                  {bpmnFiles.map((file) => (
                    <div 
                      key={file.sha}
                      className={`file-item ${selectedFile?.sha === file.sha ? 'selected' : ''}`}
                      onClick={() => loadBpmnFile(file)}
                    >
                      <div className="file-icon">📋</div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="diagram-editor">
              {selectedFile ? (
                <>
                  <div className="editor-toolbar">
                    <div className="toolbar-left">
                      <h4>{selectedFile.name}</h4>
                    </div>
                  </div>
                  <div className="bpmn-container" ref={containerRef}></div>
                </>
              ) : (
                <div className="diagram-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔄</div>
                    <h3>Select a BPMN File</h3>
                    <p>Choose a .bpmn file from the list to start editing business processes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AssetEditorLayout>
  );
};

export default BPMNEditor;