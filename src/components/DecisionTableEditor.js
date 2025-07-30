import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import githubService from '../services/githubService';
import './DecisionTableEditor.css';

const DecisionTableEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch, tableId } = useParams();
  
  // State from location or URL params
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [repository, setRepository] = useState(location.state?.repository || null);
  const [selectedBranch, setSelectedBranch] = useState(location.state?.selectedBranch || branch || null);
  
  // Editor state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Table data
  const [tableData, setTableData] = useState({
    id: '',
    name: '',
    description: '',
    businessRule: '',
    trigger: '',
    inputs: [],
    outputs: [],
    rules: []
  });
  
  const [originalTableData, setOriginalTableData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Initialize repository data if not available
  const initializeData = useCallback(async () => {
    if (!profile && !repository && user && repo) {
      try {
        setLoading(true);
        setError(null);

        const publicProfile = {
          login: user,
          name: user.charAt(0).toUpperCase() + user.slice(1),
          avatar_url: `https://github.com/${user}.png`,
          type: 'User',
          isDemo: false
        };

        const publicRepository = {
          name: repo,
          full_name: `${user}/${repo}`,
          owner: { login: user },
          default_branch: branch || 'main',
          html_url: `https://github.com/${user}/${repo}`,
          isDemo: false
        };

        setProfile(publicProfile);
        setRepository(publicRepository);
        setSelectedBranch(branch || 'main');
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load data. Please check the URL or try again.');
      }
    }
  }, [user, repo, branch, profile, repository]);

  // Load table data
  const loadTableData = useCallback(async () => {
    if (!repository || !selectedBranch || !tableId) return;

    try {
      setLoading(true);
      setError(null);

      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const filePath = `input/dmn/${tableId}.dmn`;

      console.log('🎯 DecisionTableEditor: Loading table data with parameters:', {
        owner,
        repoName,
        branch: selectedBranch,
        tableId,
        filePath,
        isNewTable: tableId === 'new'
      });

      // Check if this is a new table
      if (tableId === 'new') {
        console.log('📝 DecisionTableEditor: Creating new table');
        // Initialize with empty table structure
        const newTable = {
          id: generateTableId(),
          name: 'New Decision Table',
          description: '',
          businessRule: '',
          trigger: '',
          inputs: [
            {
              id: 'input1',
              label: 'Input 1',
              expression: '',
              typeRef: 'string',
              description: ''
            }
          ],
          outputs: [
            {
              id: 'output1',
              label: 'Output 1',
              typeRef: 'string',
              description: ''
            }
          ],
          rules: [
            {
              id: 'rule1',
              description: '',
              inputEntries: [''],
              outputEntries: [''],
              annotations: ['']
            }
          ]
        };
        setTableData(newTable);
        setOriginalTableData(null);
        setLoading(false);
        return;
      }

      // Load existing DMN file
      console.log(`📁 DecisionTableEditor: Loading existing DMN file from ${filePath}`);
      const dmnContent = await githubService.getFileContent(
        owner,
        repoName,
        filePath,
        selectedBranch
      );

      console.log('✅ DecisionTableEditor: Successfully loaded DMN content, parsing...');
      // Parse DMN XML to extract table data
      const parsedData = parseDMNContent(dmnContent);
      console.log('✅ DecisionTableEditor: Successfully parsed DMN data:', {
        id: parsedData.id,
        name: parsedData.name,
        inputCount: parsedData.inputs.length,
        outputCount: parsedData.outputs.length,
        ruleCount: parsedData.rules.length
      });
      
      setTableData(parsedData);
      setOriginalTableData(JSON.parse(JSON.stringify(parsedData)));

    } catch (err) {
      console.error('❌ DecisionTableEditor: Error loading table data:', err);
      console.error('🔍 DecisionTableEditor: Error details:', {
        message: err.message,
        status: err.status,
        type: typeof err,
        stack: err.stack?.substring(0, 500)
      });
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to load decision table.';
      
      if (err.message.includes('File not found')) {
        errorMessage = `Decision table file "${tableId}.dmn" not found in the repository. The file may have been moved, deleted, or the table ID in the URL is incorrect.`;
      } else if (err.message.includes('Access denied') || err.message.includes('403')) {
        errorMessage = 'Access denied. This repository may be private or you may not have permission to access it.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out while loading the decision table. Please check your internet connection and try again.';
      } else if (err.message.includes('rate limit')) {
        errorMessage = 'GitHub API rate limit exceeded. Please wait a moment and try again.';
      } else if (err.message.includes('Failed to parse DMN file')) {
        errorMessage = `The DMN file "${tableId}.dmn" exists but contains invalid XML format. ${err.message}`;
      } else {
        errorMessage = `Failed to load decision table: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [repository, selectedBranch, tableId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (repository && selectedBranch) {
      loadTableData();
    }
  }, [loadTableData, repository, selectedBranch]);

  // Parse DMN XML content into editable structure
  const parseDMNContent = (dmnXml) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(dmnXml, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const decision = xmlDoc.getElementsByTagName('dmn:decision')[0];
      const decisionTable = xmlDoc.getElementsByTagName('dmn:decisionTable')[0];
      
      if (!decision || !decisionTable) {
        throw new Error('Invalid DMN structure');
      }

      // Extract metadata
      const id = decision.getAttribute('id') || '';
      const name = decision.getAttribute('label') || '';
      const question = decision.getElementsByTagName('dmn:question')[0]?.textContent || '';
      
      // Extract inputs
      const inputElements = xmlDoc.getElementsByTagName('dmn:input');
      const inputs = Array.from(inputElements).map((input, index) => ({
        id: input.getAttribute('id') || `input${index + 1}`,
        label: input.getAttribute('label') || `Input ${index + 1}`,
        expression: input.getElementsByTagName('dmn:text')[0]?.textContent || '',
        typeRef: input.getElementsByTagName('dmn:inputExpression')[0]?.getAttribute('typeRef') || 'string',
        description: input.getElementsByTagName('dmn:description')[0]?.textContent || ''
      }));

      // Extract outputs
      const outputElements = xmlDoc.getElementsByTagName('dmn:output');
      const outputs = Array.from(outputElements).map((output, index) => ({
        id: output.getAttribute('id') || `output${index + 1}`,
        label: output.getAttribute('label') || `Output ${index + 1}`,
        typeRef: output.getAttribute('typeRef') || 'string',
        description: output.getElementsByTagName('dmn:description')[0]?.textContent || ''
      }));

      // Extract rules
      const ruleElements = xmlDoc.getElementsByTagName('dmn:rule');
      const rules = Array.from(ruleElements).map((rule, index) => {
        const inputEntries = Array.from(rule.getElementsByTagName('dmn:inputEntry')).map(
          entry => entry.getElementsByTagName('dmn:text')[0]?.textContent || ''
        );
        const outputEntries = Array.from(rule.getElementsByTagName('dmn:outputEntry')).map(
          entry => entry.getElementsByTagName('dmn:text')[0]?.textContent || ''
        );
        const annotations = Array.from(rule.getElementsByTagName('dmn:annotationEntry')).map(
          entry => entry.getElementsByTagName('dmn:text')[0]?.textContent || ''
        );

        return {
          id: rule.getAttribute('id') || `rule${index + 1}`,
          description: rule.getElementsByTagName('dmn:description')[0]?.textContent || '',
          inputEntries,
          outputEntries,
          annotations
        };
      });

      return {
        id,
        name,
        description: question,
        businessRule: '', // Extract from metadata if available
        trigger: '', // Extract from metadata if available
        inputs,
        outputs,
        rules
      };

    } catch (err) {
      console.error('Error parsing DMN content:', err);
      throw new Error('Failed to parse DMN file: ' + err.message);
    }
  };

  // Generate DMN XML from table data
  const generateDMNContent = (data) => {
    const escapeXml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20240513/MODEL/" 
                 xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
                 xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" 
                 xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/"
                 namespace="http://smart.who.int/decision-tables" 
                 label="${escapeXml(data.name)}" 
                 id="${escapeXml(data.id)}">
  
  <dmn:decision id="${escapeXml(data.id)}" label="${escapeXml(data.name)}">
    <dmn:question>${escapeXml(data.description)}</dmn:question>
    ${data.businessRule ? `<dmn:businessRule>${escapeXml(data.businessRule)}</dmn:businessRule>` : ''}
    ${data.trigger ? `<dmn:trigger>${escapeXml(data.trigger)}</dmn:trigger>` : ''}
    
    <dmn:decisionTable id="${escapeXml(data.id)}.table" hitPolicy="FIRST" preferredOrientation="Rule-as-Row">
`;

    // Add inputs
    data.inputs.forEach(input => {
      xml += `      <dmn:input id="${escapeXml(input.id)}" label="${escapeXml(input.label)}">
        <dmn:inputExpression id="${escapeXml(input.id)}.expression" typeRef="${escapeXml(input.typeRef)}">
          <dmn:text>${escapeXml(input.expression)}</dmn:text>
        </dmn:inputExpression>
        ${input.description ? `<dmn:description>${escapeXml(input.description)}</dmn:description>` : ''}
      </dmn:input>
`;
    });

    // Add outputs
    data.outputs.forEach(output => {
      xml += `      <dmn:output id="${escapeXml(output.id)}" label="${escapeXml(output.label)}" typeRef="${escapeXml(output.typeRef)}">
        ${output.description ? `<dmn:description>${escapeXml(output.description)}</dmn:description>` : ''}
      </dmn:output>
`;
    });

    // Add rules
    data.rules.forEach(rule => {
      xml += `      <dmn:rule id="${escapeXml(rule.id)}">
        ${rule.description ? `<dmn:description>${escapeXml(rule.description)}</dmn:description>` : ''}
`;
      
      rule.inputEntries.forEach(entry => {
        xml += `        <dmn:inputEntry>
          <dmn:text>${escapeXml(entry)}</dmn:text>
        </dmn:inputEntry>
`;
      });

      rule.outputEntries.forEach(entry => {
        xml += `        <dmn:outputEntry>
          <dmn:text>${escapeXml(entry)}</dmn:text>
        </dmn:outputEntry>
`;
      });

      rule.annotations.forEach(annotation => {
        xml += `        <dmn:annotationEntry>
          <dmn:text>${escapeXml(annotation)}</dmn:text>
        </dmn:annotationEntry>
`;
      });

      xml += `      </dmn:rule>
`;
    });

    xml += `    </dmn:decisionTable>
  </dmn:decision>
  
</dmn:definitions>`;

    return xml;
  };

  // Generate unique table ID
  const generateTableId = () => {
    return 'DAK.DT.' + Date.now().toString(36).toUpperCase();
  };

  // Validate table data
  const validateTable = (data) => {
    const errors = [];
    
    if (!data.name.trim()) {
      errors.push('Table name is required');
    }
    
    if (!data.id.trim()) {
      errors.push('Table ID is required');
    }
    
    if (data.inputs.length === 0) {
      errors.push('At least one input is required');
    }
    
    if (data.outputs.length === 0) {
      errors.push('At least one output is required');
    }
    
    if (data.rules.length === 0) {
      errors.push('At least one rule is required');
    }

    // Validate inputs
    data.inputs.forEach((input, index) => {
      if (!input.label.trim()) {
        errors.push(`Input ${index + 1}: Label is required`);
      }
      if (!input.expression.trim()) {
        errors.push(`Input ${index + 1}: Expression is required`);
      }
    });

    // Validate outputs
    data.outputs.forEach((output, index) => {
      if (!output.label.trim()) {
        errors.push(`Output ${index + 1}: Label is required`);
      }
    });

    // Validate rules
    data.rules.forEach((rule, index) => {
      if (rule.inputEntries.length !== data.inputs.length) {
        errors.push(`Rule ${index + 1}: Must have entry for each input`);
      }
      if (rule.outputEntries.length !== data.outputs.length) {
        errors.push(`Rule ${index + 1}: Must have entry for each output`);
      }
    });

    return errors;
  };

  // Handle table save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate table
      const errors = validateTable(tableData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors([]);

      // Generate DMN content
      const dmnContent = generateDMNContent(tableData);

      // Save to repository
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const filePath = `input/dmn/${tableData.id}.dmn`;
      const message = tableId === 'new' 
        ? `Add new decision table: ${tableData.name}`
        : `Update decision table: ${tableData.name}`;

      await githubService.updateFile(
        owner,
        repoName,
        filePath,
        dmnContent,
        message,
        selectedBranch,
        originalTableData ? 'update' : 'create'
      );

      setOriginalTableData(JSON.parse(JSON.stringify(tableData)));
      setHasChanges(false);

      // Navigate back to decision support view
      navigate(`/decision-support/${owner}/${repoName}/${selectedBranch}`, {
        state: { profile, repository, selectedBranch }
      });

    } catch (err) {
      console.error('Error saving table:', err);
      setError('Failed to save decision table: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle data changes
  const updateTableData = (updates) => {
    setTableData(prev => {
      const updated = { ...prev, ...updates };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalTableData));
      return updated;
    });
  };

  // Add new input
  const addInput = () => {
    const newInput = {
      id: `input${tableData.inputs.length + 1}`,
      label: `Input ${tableData.inputs.length + 1}`,
      expression: '',
      typeRef: 'string',
      description: ''
    };
    
    updateTableData({
      inputs: [...tableData.inputs, newInput],
      rules: tableData.rules.map(rule => ({
        ...rule,
        inputEntries: [...rule.inputEntries, '']
      }))
    });
  };

  // Add new output
  const addOutput = () => {
    const newOutput = {
      id: `output${tableData.outputs.length + 1}`,
      label: `Output ${tableData.outputs.length + 1}`,
      typeRef: 'string',
      description: ''
    };
    
    updateTableData({
      outputs: [...tableData.outputs, newOutput],
      rules: tableData.rules.map(rule => ({
        ...rule,
        outputEntries: [...rule.outputEntries, ''],
        annotations: [...(rule.annotations || []), '']
      }))
    });
  };

  // Add new rule
  const addRule = () => {
    const newRule = {
      id: `rule${tableData.rules.length + 1}`,
      description: '',
      inputEntries: new Array(tableData.inputs.length).fill(''),
      outputEntries: new Array(tableData.outputs.length).fill(''),
      annotations: new Array(tableData.outputs.length).fill('')
    };
    
    updateTableData({
      rules: [...tableData.rules, newRule]
    });
  };

  // Navigation handlers
  const handleBackToDecisionSupport = () => {
    if (repository && profile) {
      const owner = repository.owner?.login || repository.full_name.split('/')[0];
      const repoName = repository.name;
      const path = selectedBranch 
        ? `/decision-support/${owner}/${repoName}/${selectedBranch}`
        : `/decision-support/${owner}/${repoName}`;
      
      navigate(path, {
        state: { profile, repository, selectedBranch }
      });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="decision-table-editor loading-state">
        <div className="loading-content">
          <h2>Loading Decision Table Editor...</h2>
          <p>Preparing editor interface...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decision-table-editor error-state">
        <div className="error-content">
          <h2>Error Loading Decision Table Editor</h2>
          <p>{error}</p>
          
          {/* Show debugging information in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
              <h4>Debug Information:</h4>
              <pre>
                {JSON.stringify({
                  user,
                  repo,
                  branch,
                  tableId,
                  hasProfile: !!profile,
                  hasRepository: !!repository,
                  selectedBranch,
                  repositoryDetails: repository ? {
                    name: repository.name,
                    full_name: repository.full_name,
                    owner: repository.owner?.login
                  } : null
                }, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="error-suggestions">
            <h4>Troubleshooting:</h4>
            <ul>
              <li>If you're trying to edit an existing table, verify that the table ID in the URL is correct</li>
              <li>Check that the repository has the <code>input/dmn/</code> directory structure</li>
              <li>Make sure the repository is public or you have access to it</li>
              <li>Try creating a new table instead by clicking "New Table" from the Decision Support Logic view</li>
            </ul>
          </div>
          
          <div className="error-actions">
            <button onClick={handleBackToDecisionSupport} className="action-btn primary">
              Back to Decision Support
            </button>
            <button onClick={() => window.location.reload()} className="action-btn secondary">
              Retry
            </button>
            {repository && (
              <button 
                onClick={() => {
                  const owner = repository.owner?.login || repository.full_name.split('/')[0];
                  const repoName = repository.name;
                  navigate(`/decision-table-editor/${owner}/${repoName}/${selectedBranch}/new`, {
                    state: { profile, repository, selectedBranch }
                  });
                }}
                className="action-btn secondary"
              >
                Create New Table
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="decision-table-editor">
      <div className="editor-header">
        <div className="header-left">
          <div className="who-branding">
            <h1 onClick={() => navigate('/')} className="clickable-title">SGEX Workbench</h1>
            <p className="subtitle">WHO SMART Guidelines Exchange</p>
          </div>
          <div className="repo-context">
            {repository && (
              <div className="repo-info">
                <a 
                  href={`https://github.com/${repository.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="context-repo-link"
                  title="View repository on GitHub"
                >
                  <span className="repo-icon">📁</span>
                  <span className="context-repo">{repository.name}</span>
                  <span className="external-link">↗</span>
                </a>
                {selectedBranch && (
                  <span className="branch-info">
                    <code className="branch-display">{selectedBranch}</code>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="header-right">
          {profile && (
            <>
              <img 
                src={profile.avatar_url || `https://github.com/${profile.login}.png`} 
                alt="Profile" 
                className="context-avatar" 
              />
              <span className="context-owner">@{profile.login}</span>
            </>
          )}
        </div>
      </div>

      <div className="editor-content">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Select Profile
          </button>
          <span className="breadcrumb-separator">›</span>
          <button onClick={handleBackToDecisionSupport} className="breadcrumb-link">
            Decision Support Logic
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">
            {tableId === 'new' ? 'New Decision Table' : 'Edit Decision Table'}
          </span>
        </div>

        <div className="editor-main">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <h2>🎯 Decision Table Editor</h2>
              <div className="file-context">
                {tableId === 'new' ? (
                  <span className="source-file-info new-file">
                    📄 New table (not saved yet)
                  </span>
                ) : (
                  <span className="source-file-info">
                    📄 Editing: <code>input/dmn/{tableId}.dmn</code>
                  </span>
                )}
              </div>
              {hasChanges && <span className="changes-indicator">• Unsaved changes</span>}
            </div>
            <div className="toolbar-right">
              <button 
                onClick={handleBackToDecisionSupport}
                className="action-btn secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="action-btn primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Table'}
              </button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="validation-errors">
              <h4>Please fix the following errors:</h4>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="editor-sections">
            {/* Table Metadata Section */}
            <div className="editor-section">
              <h3>📋 Table Information</h3>
              <div className="metadata-grid">
                <div className="form-group">
                  <label htmlFor="table-id">Table ID</label>
                  <input
                    id="table-id"
                    type="text"
                    value={tableData.id}
                    onChange={(e) => updateTableData({ id: e.target.value })}
                    placeholder="e.g., DAK.DT.EXAMPLE"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="table-name">Table Name</label>
                  <input
                    id="table-name"
                    type="text"
                    value={tableData.name}
                    onChange={(e) => updateTableData({ name: e.target.value })}
                    placeholder="Descriptive name for the decision table"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="table-description">Description</label>
                  <textarea
                    id="table-description"
                    value={tableData.description}
                    onChange={(e) => updateTableData({ description: e.target.value })}
                    placeholder="What decision does this table make?"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="business-rule">Business Rule</label>
                  <textarea
                    id="business-rule"
                    value={tableData.businessRule}
                    onChange={(e) => updateTableData({ businessRule: e.target.value })}
                    placeholder="Business rule or policy statement"
                    rows="2"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="trigger">Trigger</label>
                  <input
                    id="trigger"
                    type="text"
                    value={tableData.trigger}
                    onChange={(e) => updateTableData({ trigger: e.target.value })}
                    placeholder="When is this decision table triggered?"
                  />
                </div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="editor-section">
              <div className="section-header">
                <h3>📥 Input Columns</h3>
                <button onClick={addInput} className="action-btn secondary small">
                  + Add Input
                </button>
              </div>
              <div className="inputs-list">
                {tableData.inputs.map((input, index) => (
                  <div key={input.id} className="input-card">
                    <div className="card-header">
                      <h4>Input {index + 1}</h4>
                      {tableData.inputs.length > 1 && (
                        <button 
                          onClick={() => {
                            const newInputs = tableData.inputs.filter((_, i) => i !== index);
                            const newRules = tableData.rules.map(rule => ({
                              ...rule,
                              inputEntries: rule.inputEntries.filter((_, i) => i !== index)
                            }));
                            updateTableData({ inputs: newInputs, rules: newRules });
                          }}
                          className="remove-btn"
                          title="Remove input"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Label</label>
                      <input
                        type="text"
                        value={input.label}
                        onChange={(e) => {
                          const newInputs = [...tableData.inputs];
                          newInputs[index] = { ...input, label: e.target.value };
                          updateTableData({ inputs: newInputs });
                        }}
                        placeholder="Human-readable label"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expression</label>
                      <textarea
                        value={input.expression}
                        onChange={(e) => {
                          const newInputs = [...tableData.inputs];
                          newInputs[index] = { ...input, expression: e.target.value };
                          updateTableData({ inputs: newInputs });
                        }}
                        placeholder="CQL expression or data element path"
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={input.typeRef}
                        onChange={(e) => {
                          const newInputs = [...tableData.inputs];
                          newInputs[index] = { ...input, typeRef: e.target.value };
                          updateTableData({ inputs: newInputs });
                        }}
                      >
                        <option value="string">String</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="duration">Duration</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={input.description}
                        onChange={(e) => {
                          const newInputs = [...tableData.inputs];
                          newInputs[index] = { ...input, description: e.target.value };
                          updateTableData({ inputs: newInputs });
                        }}
                        placeholder="Additional details about this input"
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs Section */}
            <div className="editor-section">
              <div className="section-header">
                <h3>📤 Output Columns</h3>
                <button onClick={addOutput} className="action-btn secondary small">
                  + Add Output
                </button>
              </div>
              <div className="outputs-list">
                {tableData.outputs.map((output, index) => (
                  <div key={output.id} className="output-card">
                    <div className="card-header">
                      <h4>Output {index + 1}</h4>
                      {tableData.outputs.length > 1 && (
                        <button 
                          onClick={() => {
                            const newOutputs = tableData.outputs.filter((_, i) => i !== index);
                            const newRules = tableData.rules.map(rule => ({
                              ...rule,
                              outputEntries: rule.outputEntries.filter((_, i) => i !== index),
                              annotations: rule.annotations.filter((_, i) => i !== index)
                            }));
                            updateTableData({ outputs: newOutputs, rules: newRules });
                          }}
                          className="remove-btn"
                          title="Remove output"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Label</label>
                      <input
                        type="text"
                        value={output.label}
                        onChange={(e) => {
                          const newOutputs = [...tableData.outputs];
                          newOutputs[index] = { ...output, label: e.target.value };
                          updateTableData({ outputs: newOutputs });
                        }}
                        placeholder="Human-readable label"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={output.typeRef}
                        onChange={(e) => {
                          const newOutputs = [...tableData.outputs];
                          newOutputs[index] = { ...output, typeRef: e.target.value };
                          updateTableData({ outputs: newOutputs });
                        }}
                      >
                        <option value="string">String</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="duration">Duration</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={output.description}
                        onChange={(e) => {
                          const newOutputs = [...tableData.outputs];
                          newOutputs[index] = { ...output, description: e.target.value };
                          updateTableData({ outputs: newOutputs });
                        }}
                        placeholder="Additional details about this output"
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules Section */}
            <div className="editor-section">
              <div className="section-header">
                <h3>⚖️ Decision Rules</h3>
                <button onClick={addRule} className="action-btn secondary small">
                  + Add Rule
                </button>
              </div>
              <div className="rules-table-container">
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th className="rule-number">#</th>
                      <th className="rule-description">Description</th>
                      {tableData.inputs.map((input, index) => (
                        <th key={`input-${index}`} className="rule-input">
                          {input.label}
                        </th>
                      ))}
                      {tableData.outputs.map((output, index) => (
                        <th key={`output-${index}`} className="rule-output">
                          {output.label}
                        </th>
                      ))}
                      <th className="rule-annotations">Notes</th>
                      <th className="rule-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rules.map((rule, ruleIndex) => (
                      <tr key={rule.id}>
                        <td className="rule-number">{ruleIndex + 1}</td>
                        <td className="rule-description">
                          <textarea
                            value={rule.description}
                            onChange={(e) => {
                              const newRules = [...tableData.rules];
                              newRules[ruleIndex] = { ...rule, description: e.target.value };
                              updateTableData({ rules: newRules });
                            }}
                            placeholder="Rule description"
                            rows="2"
                          />
                        </td>
                        {rule.inputEntries.map((entry, entryIndex) => (
                          <td key={`input-${entryIndex}`} className="rule-input">
                            <textarea
                              value={entry}
                              onChange={(e) => {
                                const newRules = [...tableData.rules];
                                const newInputEntries = [...rule.inputEntries];
                                newInputEntries[entryIndex] = e.target.value;
                                newRules[ruleIndex] = { ...rule, inputEntries: newInputEntries };
                                updateTableData({ rules: newRules });
                              }}
                              placeholder="Condition"
                              rows="2"
                            />
                          </td>
                        ))}
                        {rule.outputEntries.map((entry, entryIndex) => (
                          <td key={`output-${entryIndex}`} className="rule-output">
                            <textarea
                              value={entry}
                              onChange={(e) => {
                                const newRules = [...tableData.rules];
                                const newOutputEntries = [...rule.outputEntries];
                                newOutputEntries[entryIndex] = e.target.value;
                                newRules[ruleIndex] = { ...rule, outputEntries: newOutputEntries };
                                updateTableData({ rules: newRules });
                              }}
                              placeholder="Result"
                              rows="2"
                            />
                          </td>
                        ))}
                        <td className="rule-annotations">
                          <textarea
                            value={rule.annotations[0] || ''}
                            onChange={(e) => {
                              const newRules = [...tableData.rules];
                              const newAnnotations = [...(rule.annotations || [])];
                              newAnnotations[0] = e.target.value;
                              newRules[ruleIndex] = { ...rule, annotations: newAnnotations };
                              updateTableData({ rules: newRules });
                            }}
                            placeholder="Additional notes"
                            rows="2"
                          />
                        </td>
                        <td className="rule-actions">
                          {tableData.rules.length > 1 && (
                            <button 
                              onClick={() => {
                                const newRules = tableData.rules.filter((_, i) => i !== ruleIndex);
                                updateTableData({ rules: newRules });
                              }}
                              className="remove-btn"
                              title="Remove rule"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionTableEditor;