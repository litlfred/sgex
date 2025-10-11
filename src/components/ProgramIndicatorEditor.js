import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetEditorLayout, usePage } from './framework';
import githubService from '../services/githubService';
import stagingGroundService from '../services/stagingGroundService';
import './ProgramIndicatorEditor.css';

const ProgramIndicatorEditor = () => {
  const navigate = useNavigate();
  const { repository, branch } = usePage();
  const { '*': assetPath } = useParams(); // Get the file path from URL
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [fshContent, setFshContent] = useState('');
  
  // ProgramIndicator LM fields
  const [indicatorData, setIndicatorData] = useState({
    id: '',
    name: '',
    definition: '',
    numerator: '',
    denominator: '',
    disaggregation: '',
    descriptionString: '',
    descriptionUri: '',
    references: []
  });

  // Load measure file
  useEffect(() => {
    const loadMeasureFile = async () => {
      if (!repository || !assetPath) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const owner = repository.owner?.login || repository.full_name.split('/')[0];
        const repoName = repository.name;
        const ref = branch || 'main';
        
        // Decode the asset path
        const decodedPath = decodeURIComponent(assetPath);

        console.log('Loading measure file:', { owner, repoName, path: decodedPath, ref });

        // Get file content
        const content = await githubService.getFileContent(owner, repoName, decodedPath, ref);
        
        setOriginalContent(content);
        setFshContent(content);
        
        // Parse FSH to extract ProgramIndicator LM data
        const parsed = parseFSHToIndicatorData(content);
        setIndicatorData(parsed);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading measure file:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadMeasureFile();
  }, [repository, branch, assetPath, navigate]);

  // Parse FSH content to extract ProgramIndicator LM fields
  const parseFSHToIndicatorData = (fshContent) => {
    const data = {
      id: '',
      name: '',
      definition: '',
      numerator: '',
      denominator: '',
      disaggregation: '',
      descriptionString: '',
      descriptionUri: '',
      references: []
    };

    if (!fshContent) return data;

    // Extract Instance name (ID)
    const instanceMatch = fshContent.match(/^Instance:\s+(\S+)/m);
    if (instanceMatch) {
      data.id = instanceMatch[1];
    }

    // Extract Title (maps to name)
    const titleMatch = fshContent.match(/^Title:\s*"(.+)"$/m);
    if (titleMatch) {
      data.name = titleMatch[1];
    }

    // Extract description
    const descMatch = fshContent.match(/^\*\s*description\s*=\s*"(.+)"$/m);
    if (descMatch) {
      data.definition = descMatch[1];
    }

    // Extract numerator description
    const numeratorMatch = fshContent.match(/population\[numerator\][\s\S]*?description\s*=\s*"(.+?)"/);
    if (numeratorMatch) {
      data.numerator = numeratorMatch[1];
    }

    // Extract denominator description
    const denominatorMatch = fshContent.match(/population\[denominator\][\s\S]*?description\s*=\s*"(.+?)"/);
    if (denominatorMatch) {
      data.denominator = denominatorMatch[1];
    }

    // Look for comments that might contain disaggregation or references
    const commentMatches = fshContent.matchAll(/^\/\/\s*(.+)$/gm);
    for (const match of commentMatches) {
      const comment = match[1].trim();
      if (comment.toLowerCase().startsWith('disaggregation:')) {
        data.disaggregation = comment.substring('disaggregation:'.length).trim();
      } else if (comment.toLowerCase().startsWith('references:')) {
        const refs = comment.substring('references:'.length).trim();
        data.references = refs.split(',').map(r => r.trim()).filter(r => r);
      }
    }

    return data;
  };

  // Generate FSH content from ProgramIndicator LM data
  const generateFSHFromIndicatorData = (data) => {
    // Keep the original FSH structure but update specific fields
    let newFsh = fshContent;

    // Update Instance name
    if (data.id && data.id !== indicatorData.id) {
      newFsh = newFsh.replace(/^Instance:\s+\S+/m, `Instance: ${data.id}`);
    }

    // Update Title
    if (data.name) {
      newFsh = newFsh.replace(/^Title:\s*".+"$/m, `Title: "${data.name}"`);
      newFsh = newFsh.replace(/^\*\s*title\s*=\s*".+"$/m, `* title = "${data.name}"`);
      newFsh = newFsh.replace(/^\*\s*name\s*=\s*".+"$/m, `* name = "${data.id}"`);
    }

    // Update description (definition)
    if (data.definition) {
      newFsh = newFsh.replace(/^\*\s*description\s*=\s*".+"$/m, `* description = "${data.definition}"`);
    }

    // Update numerator description
    if (data.numerator) {
      newFsh = newFsh.replace(
        /(population\[numerator\][\s\S]*?description\s*=\s*")(.+?)(")/,
        `$1${data.numerator}$3`
      );
    }

    // Update denominator description
    if (data.denominator) {
      newFsh = newFsh.replace(
        /(population\[denominator\][\s\S]*?description\s*=\s*")(.+?)(")/,
        `$1${data.denominator}$3`
      );
    }

    // Add comments for disaggregation and references if they don't exist
    if (data.disaggregation || data.references.length > 0) {
      const lines = newFsh.split('\n');
      const titleLineIndex = lines.findIndex(line => line.startsWith('Title:'));
      
      if (titleLineIndex >= 0) {
        const commentsToAdd = [];
        if (data.disaggregation) {
          commentsToAdd.push(`// Disaggregation: ${data.disaggregation}`);
        }
        if (data.references.length > 0) {
          commentsToAdd.push(`// References: ${data.references.join(', ')}`);
        }
        
        // Insert comments after Title line
        lines.splice(titleLineIndex + 1, 0, ...commentsToAdd);
        newFsh = lines.join('\n');
      }
    }

    return newFsh;
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const newData = { ...indicatorData, [field]: value };
    setIndicatorData(newData);
    
    // Update FSH content
    const newFsh = generateFSHFromIndicatorData(newData);
    setFshContent(newFsh);
  };

  // Handle save
  const handleSave = async (content, saveType) => {
    try {
      if (saveType === 'local') {
        // Save to staging ground
        const decodedPath = decodeURIComponent(assetPath);
        stagingGroundService.updateFile(decodedPath, content, {
          source: 'program-indicator-editor',
          timestamp: Date.now()
        });
        
        // TODO: Update dak.json indicators array
        console.log('Saved to staging ground:', decodedPath);
        return { result: 'success' };
      } else {
        // GitHub save would go here, but we're only saving to staging ground per requirements
        console.log('GitHub save not yet implemented');
        return { result: 'error', message: 'GitHub save not implemented' };
      }
    } catch (error) {
      console.error('Save error:', error);
      return { result: 'error', message: error.message };
    }
  };

  const hasChanges = fshContent !== originalContent;

  if (loading) {
    return (
      <AssetEditorLayout
        pageName="program-indicator-editor"
        file={{ name: 'Loading...', path: assetPath }}
        repository={repository}
        branch={branch}
        content=""
        originalContent=""
        hasChanges={false}
        showSaveButtons={false}
      >
        <div className="editor-loading">
          <div className="loading-spinner"></div>
          <p>Loading measure...</p>
        </div>
      </AssetEditorLayout>
    );
  }

  if (error) {
    return (
      <AssetEditorLayout
        pageName="program-indicator-editor"
        file={{ name: 'Error', path: assetPath }}
        repository={repository}
        branch={branch}
        content=""
        originalContent=""
        hasChanges={false}
        showSaveButtons={false}
      >
        <div className="editor-error">
          <h3>Error Loading Measure</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </AssetEditorLayout>
    );
  }

  const fileName = assetPath ? decodeURIComponent(assetPath).split('/').pop() : 'measure.fsh';

  return (
    <AssetEditorLayout
      pageName="program-indicator-editor"
      file={{ name: fileName, path: assetPath }}
      repository={repository}
      branch={branch}
      content={fshContent}
      originalContent={originalContent}
      hasChanges={hasChanges}
      onSave={handleSave}
      saveButtonsPosition="top"
    >
      <div className="program-indicator-editor">
        <div className="editor-header">
          <h2>Program Indicator Editor</h2>
          <p>Edit ProgramIndicator Logical Model fields mapped to FHIR Measure FSH</p>
        </div>

        <div className="editor-layout">
          {/* Left side: Editable LM fields */}
          <div className="editor-panel lm-fields-panel">
            <h3>ProgramIndicator LM Fields</h3>
            <div className="field-mapping-note">
              <small>WHO SMART Base ProgramIndicator Logical Model fields mapped to FHIR Measure FSH</small>
            </div>

            <div className="form-group">
              <label htmlFor="id">
                <strong>ID</strong> <span className="required">*</span>
                <small>Indicator ID (letters, numbers, hyphens, dots, 1-64 chars)</small>
              </label>
              <input
                id="id"
                type="text"
                value={indicatorData.id}
                onChange={(e) => handleFieldChange('id', e.target.value)}
                pattern="[A-Za-z0-9\-\.]{1,64}"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">
                <strong>Name</strong> <span className="required">*</span>
                <small>Name of the indicator (maps to FSH Title and name)</small>
              </label>
              <input
                id="name"
                type="text"
                value={indicatorData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="definition">
                <strong>Definition</strong> <span className="required">*</span>
                <small>Definition of what the indicator measures (maps to FSH description)</small>
              </label>
              <textarea
                id="definition"
                value={indicatorData.definition}
                onChange={(e) => handleFieldChange('definition', e.target.value)}
                rows={3}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numerator">
                <strong>Numerator</strong> <span className="required">*</span>
                <small>Description of the numerator calculation</small>
              </label>
              <textarea
                id="numerator"
                value={indicatorData.numerator}
                onChange={(e) => handleFieldChange('numerator', e.target.value)}
                rows={3}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="denominator">
                <strong>Denominator</strong> <span className="required">*</span>
                <small>Description of the denominator calculation</small>
              </label>
              <textarea
                id="denominator"
                value={indicatorData.denominator}
                onChange={(e) => handleFieldChange('denominator', e.target.value)}
                rows={3}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="disaggregation">
                <strong>Disaggregation</strong> <span className="required">*</span>
                <small>Description of how the indicator should be disaggregated (stored as FSH comment)</small>
              </label>
              <textarea
                id="disaggregation"
                value={indicatorData.disaggregation}
                onChange={(e) => handleFieldChange('disaggregation', e.target.value)}
                rows={2}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="references">
                <strong>References</strong>
                <small>Health Intervention IDs (comma-separated, stored as FSH comment)</small>
              </label>
              <input
                id="references"
                type="text"
                value={indicatorData.references.join(', ')}
                onChange={(e) => {
                  const refs = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                  handleFieldChange('references', refs);
                }}
                className="form-control"
                placeholder="intervention-1, intervention-2"
              />
            </div>

            <div className="field-mapping-help">
              <h4>Field Mapping Table</h4>
              <table className="mapping-table">
                <thead>
                  <tr>
                    <th>LM Field</th>
                    <th>FSH Mapping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>id</code></td>
                    <td><code>Instance: {'{'} id {'}'}</code></td>
                  </tr>
                  <tr>
                    <td><code>name</code></td>
                    <td><code>Title: "{'{'} name {'}'}"</code></td>
                  </tr>
                  <tr>
                    <td><code>definition</code></td>
                    <td><code>* description = "{'{'} definition {'}'}"</code></td>
                  </tr>
                  <tr>
                    <td><code>numerator</code></td>
                    <td><code>population[numerator].description</code></td>
                  </tr>
                  <tr>
                    <td><code>denominator</code></td>
                    <td><code>population[denominator].description</code></td>
                  </tr>
                  <tr>
                    <td><code>disaggregation</code></td>
                    <td><code>{'// Disaggregation: { value }'}</code></td>
                  </tr>
                  <tr>
                    <td><code>references</code></td>
                    <td><code>{'// References: { ids }'}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side: FSH preview */}
          <div className="editor-panel fsh-preview-panel">
            <h3>FHIR Measure FSH Preview</h3>
            <div className="fsh-preview">
              <pre><code>{fshContent}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </AssetEditorLayout>
  );
};

export default ProgramIndicatorEditor;
