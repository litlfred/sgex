# FML/StructureMap Implementation Roadmap

## Phase-by-Phase Implementation Guide

This document provides a detailed, step-by-step implementation roadmap for integrating FML/StructureMap capabilities into the SGEX Workbench, ensuring minimal impact on existing functionality while providing comprehensive mapping tools.

## Implementation Phases Overview

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| 1 | 2 weeks | Foundation Services | fmlrunner integration, base components |
| 2 | 2 weeks | Core UI Components | Visual editor, FML code editor |
| 3 | 2 weeks | Mapping Workflow | End-to-end mapping creation |
| 4 | 2 weeks | Testing & Validation | Comprehensive testing framework |
| 5 | 2 weeks | Integration & Polish | DAK integration, help system |

## Phase 1: Foundation Services (Weeks 1-2)

### Week 1: Service Layer Foundation

#### Day 1-2: fmlrunner Service Integration
**File: `src/services/fmlRunnerService.js`**

```javascript
import logger from '../utils/logger';

class FMLRunnerService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_FMLRUNNER_URL || 'http://localhost:8080';
    this.timeout = parseInt(process.env.REACT_APP_FMLRUNNER_TIMEOUT || '30000');
    this.logger = logger.getLogger('FMLRunnerService');
    this.cache = new Map(); // Simple caching for validation results
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: this.timeout
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error('fmlrunner request failed', { endpoint, error: error.message });
      throw error;
    }
  }

  // Core API Methods
  async validateFML(fmlContent, context = {}) {
    const cacheKey = `validate_${btoa(fmlContent)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.makeRequest('/api/v1/fml/validate', 'POST', {
      fml: fmlContent,
      context
    });

    this.cache.set(cacheKey, result);
    return result;
  }

  async transformResource(structureMap, sourceResource, parameters = {}) {
    return await this.makeRequest('/api/v1/structuremap/transform', 'POST', {
      structureMap,
      source: sourceResource,
      parameters
    });
  }

  async getFMLSuggestions(fmlContent, position, context = {}) {
    return await this.makeRequest('/api/v1/fml/complete', 'POST', {
      fml: fmlContent,
      position,
      context
    });
  }

  async translateConcept(conceptMap, system, code) {
    return await this.makeRequest('/api/v1/terminology/translate', 'POST', {
      conceptMap,
      system,
      code
    });
  }

  // Health check
  async checkHealth() {
    try {
      return await this.makeRequest('/api/v1/health');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

export default new FMLRunnerService();
```

**Tests: `src/services/fmlRunnerService.test.js`**

```javascript
import fmlRunnerService from './fmlRunnerService';

describe('FMLRunnerService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.REACT_APP_FMLRUNNER_URL = 'http://localhost:8080';
  });

  describe('validateFML', () => {
    it('should validate FML content successfully', async () => {
      const mockResponse = {
        isValid: true,
        errors: [],
        suggestions: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await fmlRunnerService.validateFML('map "test" {}');
      expect(result.isValid).toBe(true);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        isValid: false,
        errors: [{
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error'
        }],
        suggestions: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await fmlRunnerService.validateFML('invalid fml');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('health check', () => {
    it('should return healthy status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      });

      const result = await fmlRunnerService.checkHealth();
      expect(result.status).toBe('healthy');
    });
  });
});
```

#### Day 3-4: Logical Model Service
**File: `src/services/logicalModelService.js`**

```javascript
import githubService from './githubService';
import logger from '../utils/logger';

class LogicalModelService {
  constructor() {
    this.logger = logger.getLogger('LogicalModelService');
    this.cache = new Map();
  }

  async getLogicalModels(owner, repo, branch = 'main') {
    const cacheKey = `${owner}/${repo}/${branch}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Look for StructureDefinitions in common DAK locations
      const paths = [
        'input/fsh/profiles',
        'input/fsh/logicalmodels', 
        'input/profiles',
        'input/resources'
      ];

      const models = [];
      for (const path of paths) {
        try {
          const files = await githubService.getRepositoryContents(owner, repo, path, branch);
          const fshFiles = files.filter(file => 
            file.name.endsWith('.fsh') || 
            file.name.endsWith('.json') && file.name.includes('StructureDefinition')
          );

          for (const file of fshFiles) {
            const content = await githubService.getFileContent(owner, repo, file.path, branch);
            const model = this.parseLogicalModel(content, file.name);
            if (model) {
              models.push(model);
            }
          }
        } catch (error) {
          this.logger.debug(`Path ${path} not found or inaccessible`, { error: error.message });
        }
      }

      this.cache.set(cacheKey, models);
      return models;
    } catch (error) {
      this.logger.error('Failed to load logical models', { owner, repo, branch, error: error.message });
      return [];
    }
  }

  parseLogicalModel(content, filename) {
    try {
      // Handle both FSH and JSON StructureDefinitions
      if (filename.endsWith('.fsh')) {
        return this.parseFSHLogicalModel(content, filename);
      } else if (filename.endsWith('.json')) {
        return this.parseJSONStructureDefinition(content, filename);
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to parse logical model', { filename, error: error.message });
      return null;
    }
  }

  parseFSHLogicalModel(fshContent, filename) {
    // Basic FSH parsing for logical models
    const lines = fshContent.split('\n');
    let model = null;
    let currentElement = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Parse logical model definition
      if (trimmed.startsWith('Logical:')) {
        const name = trimmed.replace('Logical:', '').trim();
        model = {
          id: name,
          name: name,
          type: 'logical',
          filename: filename,
          elements: []
        };
      }
      
      // Parse elements
      if (model && trimmed.startsWith('*')) {
        const elementMatch = trimmed.match(/\*\s+([^\s]+)\s+(\d+\.\.\*|\d+\.\.\d+|\d+)\s+(.+)/);
        if (elementMatch) {
          const element = {
            path: elementMatch[1],
            cardinality: elementMatch[2],
            type: elementMatch[3],
            line: lines.indexOf(line) + 1
          };
          model.elements.push(element);
        }
      }
    }

    return model;
  }

  parseJSONStructureDefinition(jsonContent, filename) {
    try {
      const structDef = JSON.parse(jsonContent);
      if (structDef.resourceType !== 'StructureDefinition') {
        return null;
      }

      return {
        id: structDef.id,
        name: structDef.name || structDef.id,
        type: structDef.kind === 'logical' ? 'logical' : 'profile',
        filename: filename,
        url: structDef.url,
        baseDefinition: structDef.baseDefinition,
        elements: (structDef.snapshot?.element || structDef.differential?.element || []).map(elem => ({
          path: elem.path,
          cardinality: `${elem.min || 0}..${elem.max || '*'}`,
          type: elem.type?.[0]?.code || 'unknown',
          definition: elem.definition,
          short: elem.short
        }))
      };
    } catch (error) {
      this.logger.warn('Failed to parse JSON StructureDefinition', { filename, error: error.message });
      return null;
    }
  }

  generateVisualizationData(models, mappings = []) {
    return {
      nodes: models.map((model, index) => ({
        id: model.id,
        name: model.name,
        type: model.type,
        elements: model.elements,
        position: { x: index * 400, y: 100 },
        width: 300,
        height: Math.max(200, model.elements.length * 25 + 50)
      })),
      edges: mappings.map(mapping => ({
        id: mapping.id,
        source: mapping.sourceElement,
        target: mapping.targetElement,
        label: mapping.fmlExpression,
        isValid: mapping.isValid
      }))
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new LogicalModelService();
```

#### Day 5: Mock fmlrunner Service
**File: `src/services/__mocks__/fmlRunnerService.js`**

```javascript
// Mock service for development and testing
class MockFMLRunnerService {
  async validateFML(fmlContent) {
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Basic FML syntax validation
    const hasMapKeyword = fmlContent.includes('map ');
    const hasBraces = fmlContent.includes('{') && fmlContent.includes('}');
    
    return {
      isValid: hasMapKeyword && hasBraces,
      errors: hasMapKeyword && hasBraces ? [] : [
        {
          line: 1,
          column: 1,
          message: 'Missing map declaration or braces',
          severity: 'error'
        }
      ],
      suggestions: []
    };
  }

  async transformResource(structureMap, sourceResource) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      result: {
        ...sourceResource,
        id: 'transformed-' + (sourceResource.id || 'resource'),
        meta: {
          ...sourceResource.meta,
          profile: ['http://example.org/TransformedProfile']
        }
      },
      logs: [
        { level: 'info', message: 'Transformation completed successfully' }
      ]
    };
  }

  async getFMLSuggestions(fmlContent, position) {
    return {
      suggestions: [
        {
          label: 'source',
          insertText: 'source',
          documentation: 'Define source element',
          kind: 'keyword'
        },
        {
          label: 'target',
          insertText: 'target',
          documentation: 'Define target element', 
          kind: 'keyword'
        }
      ]
    };
  }

  async checkHealth() {
    return { status: 'healthy', mock: true };
  }
}

export default new MockFMLRunnerService();
```

### Week 2: Base Components

#### Day 6-7: Logical Model Visualizer Base
**File: `src/components/LogicalModelVisualizer.js`**

```javascript
import React, { useState, useEffect, useRef } from 'react';
import './LogicalModelVisualizer.css';

const LogicalModelVisualizer = ({ 
  models = [], 
  mappings = [], 
  onElementClick = () => {},
  onMappingCreate = () => {},
  readOnly = false 
}) => {
  const svgRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });

  useEffect(() => {
    if (models.length > 0) {
      updateLayout();
    }
  }, [models]);

  const updateLayout = () => {
    // Auto-arrange models in a grid
    const cols = Math.ceil(Math.sqrt(models.length));
    const spacing = 50;
    const modelWidth = 300;
    const modelHeight = 250;

    models.forEach((model, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      model.position = {
        x: col * (modelWidth + spacing) + spacing,
        y: row * (modelHeight + spacing) + spacing
      };
    });

    // Update viewBox to fit all models
    const maxX = Math.max(...models.map(m => m.position.x + modelWidth)) + spacing;
    const maxY = Math.max(...models.map(m => m.position.y + modelHeight)) + spacing;
    setViewBox({ x: 0, y: 0, width: maxX, height: maxY });
  };

  const handleElementClick = (model, element, event) => {
    if (readOnly) {
      onElementClick(model, element);
      return;
    }

    if (dragState?.sourceElement) {
      // Complete mapping creation
      if (dragState.sourceModel.id !== model.id) {
        onMappingCreate({
          sourceModel: dragState.sourceModel,
          sourceElement: dragState.sourceElement,
          targetModel: model,
          targetElement: element
        });
      }
      setDragState(null);
    } else {
      // Start mapping creation
      setDragState({
        sourceModel: model,
        sourceElement: element
      });
    }
    
    setSelectedElement({ model: model.id, element: element.path });
    onElementClick(model, element);
  };

  const renderModel = (model) => (
    <g key={model.id} transform={`translate(${model.position.x}, ${model.position.y})`}>
      {/* Model container */}
      <rect
        width="300"
        height={Math.max(200, model.elements.length * 25 + 80)}
        fill="#f8f9fa"
        stroke="#dee2e6"
        strokeWidth="1"
        rx="8"
      />
      
      {/* Model header */}
      <rect
        width="300"
        height="40"
        fill="#0078d4"
        rx="8"
      />
      <rect
        width="300"
        height="32"
        fill="#0078d4"
      />
      
      <text
        x="150"
        y="25"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
      >
        {model.name}
      </text>
      
      {/* Model elements */}
      {model.elements.map((element, index) => (
        <g key={element.path}>
          <rect
            x="5"
            y={50 + index * 25}
            width="290"
            height="24"
            fill={selectedElement?.model === model.id && selectedElement?.element === element.path ? 
              '#e3f2fd' : 'transparent'}
            stroke={dragState?.sourceModel?.id === model.id && dragState?.sourceElement?.path === element.path ?
              '#ff9800' : 'transparent'}
            strokeWidth="2"
            rx="3"
            className="element-rect"
            onClick={(e) => handleElementClick(model, element, e)}
          />
          <text
            x="10"
            y={50 + index * 25 + 16}
            fontSize="12"
            fill="#333"
            className="element-text"
            onClick={(e) => handleElementClick(model, element, e)}
          >
            {element.path} [{element.cardinality}] : {element.type}
          </text>
        </g>
      ))}
    </g>
  );

  const renderMapping = (mapping) => {
    // Find source and target positions
    const sourceModel = models.find(m => m.id === mapping.sourceModel);
    const targetModel = models.find(m => m.id === mapping.targetModel);
    
    if (!sourceModel || !targetModel) return null;

    const sourceElementIndex = sourceModel.elements.findIndex(e => e.path === mapping.sourceElement);
    const targetElementIndex = targetModel.elements.findIndex(e => e.path === mapping.targetElement);

    const x1 = sourceModel.position.x + 300;
    const y1 = sourceModel.position.y + 50 + sourceElementIndex * 25 + 12;
    const x2 = targetModel.position.x;
    const y2 = targetModel.position.y + 50 + targetElementIndex * 25 + 12;

    return (
      <g key={mapping.id}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={mapping.isValid ? '#28a745' : '#dc3545'}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
          className="mapping-label"
        >
          {mapping.fmlExpression || 'copy()'}
        </text>
      </g>
    );
  };

  return (
    <div className="logical-model-visualizer">
      <div className="visualizer-controls">
        <button onClick={() => setViewBox(prev => ({ ...prev, x: 0, y: 0 }))}>
          Reset View
        </button>
        {dragState && (
          <div className="mapping-instruction">
            Click on a target element to create mapping from {dragState.sourceElement.path}
          </div>
        )}
      </div>
      
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="model-svg"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#666"
            />
          </marker>
        </defs>
        
        {models.map(renderModel)}
        {mappings.map(renderMapping)}
      </svg>
    </div>
  );
};

export default LogicalModelVisualizer;
```

**Styles: `src/components/LogicalModelVisualizer.css`**

```css
.logical-model-visualizer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.visualizer-controls {
  padding: 10px;
  background: white;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
  align-items: center;
}

.model-svg {
  flex: 1;
  background: white;
  cursor: default;
}

.element-rect {
  cursor: pointer;
  transition: fill 0.2s ease;
}

.element-rect:hover {
  fill: #e3f2fd;
}

.element-text {
  cursor: pointer;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.mapping-label {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.mapping-instruction {
  background: #fff3cd;
  color: #856404;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}
```

#### Day 8-10: FML Code Editor Base
**File: `src/components/FMLCodeEditor.js`**

```javascript
import React, { useState, useEffect, useRef } from 'react';
import fmlRunnerService from '../services/fmlRunnerService';
import './FMLCodeEditor.css';

const FMLCodeEditor = ({ 
  content = '', 
  onChange = () => {}, 
  onValidation = () => {},
  readOnly = false,
  height = '400px' 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationTimeout, setValidationTimeout] = useState(null);

  useEffect(() => {
    initializeMonacoEditor();
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && content !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(content);
    }
  }, [content]);

  const initializeMonacoEditor = async () => {
    try {
      // Dynamically import Monaco to avoid SSR issues
      const monaco = await import('monaco-editor');
      
      // Configure FML language
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'fml')) {
        monaco.languages.register({ id: 'fml' });
        
        // Basic FML syntax highlighting
        monaco.languages.setMonarchTokensProvider('fml', {
          tokenizer: {
            root: [
              [/\b(map|uses|imports|group|rule|source|target|log|then|as|where|check|default)\b/, 'keyword'],
              [/\b(string|boolean|integer|decimal|date|dateTime|id|code|uri|url)\b/, 'type'],
              [/\b(copy|create|evaluate|translate|reference|uuid|resolve)\b/, 'function'],
              [/"([^"\\]|\\.)*$/, 'string.invalid'],
              [/"/, 'string', '@string'],
              [/'([^'\\]|\\.)*$/, 'string.invalid'],
              [/'/, 'string', '@string_single'],
              [/\/\/.*$/, 'comment'],
              [/\/\*/, 'comment', '@comment'],
              [/[{}()\[\]]/, 'bracket'],
              [/[;,.]/, 'delimiter'],
              [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
              [/\d+/, 'number'],
            ],
            string: [
              [/[^\\"]+/, 'string'],
              [/\\./, 'string.escape'],
              [/"/, 'string', '@pop']
            ],
            string_single: [
              [/[^\\']+/, 'string'],
              [/\\./, 'string.escape'],
              [/'/, 'string', '@pop']
            ],
            comment: [
              [/[^\/*]+/, 'comment'],
              [/\*\//, 'comment', '@pop'],
              [/[\/*]/, 'comment']
            ]
          }
        });
      }

      // Create editor instance
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: content,
        language: 'fml',
        theme: 'vs',
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly: readOnly,
        wordWrap: 'on',
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3
      });

      // Add change listener
      monacoRef.current.onDidChangeModelContent(() => {
        const newContent = monacoRef.current.getValue();
        onChange(newContent);
        
        // Debounced validation
        if (validationTimeout) {
          clearTimeout(validationTimeout);
        }
        
        const timeout = setTimeout(() => {
          validateContent(newContent);
        }, 1000);
        
        setValidationTimeout(timeout);
      });

      // Initial validation
      if (content) {
        validateContent(content);
      }

    } catch (error) {
      console.error('Failed to initialize Monaco editor:', error);
    }
  };

  const validateContent = async (fmlContent) => {
    if (!fmlContent.trim()) {
      setValidationErrors([]);
      onValidation([]);
      return;
    }

    try {
      const result = await fmlRunnerService.validateFML(fmlContent);
      setValidationErrors(result.errors || []);
      onValidation(result.errors || []);
      
      // Update Monaco markers
      if (monacoRef.current) {
        const monaco = await import('monaco-editor');
        const markers = result.errors.map(error => ({
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.line,
          endColumn: error.column + 10,
          message: error.message,
          severity: error.severity === 'error' ? 
            monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning
        }));
        
        monaco.editor.setModelMarkers(monacoRef.current.getModel(), 'fml', markers);
      }
    } catch (error) {
      console.error('FML validation failed:', error);
      setValidationErrors([{
        line: 1,
        column: 1,
        message: 'Validation service unavailable',
        severity: 'warning'
      }]);
    }
  };

  const insertTemplate = (template) => {
    if (monacoRef.current) {
      const position = monacoRef.current.getPosition();
      monacoRef.current.executeEdits('', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: template
      }]);
      monacoRef.current.focus();
    }
  };

  const templates = [
    {
      name: 'Basic Map',
      content: `map "MyMap" = "http://example.org/fhir/StructureMap/MyMap"

uses "http://example.org/fhir/StructureDefinition/Source" alias source as source
uses "http://example.org/fhir/StructureDefinition/Target" alias target as target

group MyGroup(source src : source, target tgt : target) {
  src.element -> tgt.element;
}`
    },
    {
      name: 'Group Rule',
      content: `group GroupName(source src : SourceType, target tgt : TargetType) {
  src.field -> tgt.field;
}`
    },
    {
      name: 'Conditional Rule',
      content: `src.field where (condition) -> tgt.field;`
    }
  ];

  return (
    <div className="fml-code-editor">
      <div className="editor-toolbar">
        <div className="editor-info">
          FML Editor
          {validationErrors.length > 0 && (
            <span className={`validation-status ${validationErrors.some(e => e.severity === 'error') ? 'error' : 'warning'}`}>
              {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="editor-templates">
          <select onChange={(e) => e.target.value && insertTemplate(e.target.value)}>
            <option value="">Insert Template...</option>
            {templates.map(template => (
              <option key={template.name} value={template.content}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div 
        ref={editorRef} 
        className="monaco-editor-container"
        style={{ height: height }}
      />
      
      {validationErrors.length > 0 && (
        <div className="validation-panel">
          <h4>Validation Issues</h4>
          {validationErrors.map((error, index) => (
            <div key={index} className={`validation-error ${error.severity}`}>
              <span className="error-location">Line {error.line}:{error.column}</span>
              <span className="error-message">{error.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FMLCodeEditor;
```

**Styles: `src/components/FMLCodeEditor.css`**

```css
.fml-code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.editor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #495057;
}

.validation-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.validation-status.error {
  background: #f8d7da;
  color: #721c24;
}

.validation-status.warning {
  background: #fff3cd;
  color: #856404;
}

.editor-templates select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.monaco-editor-container {
  flex: 1;
  min-height: 300px;
}

.validation-panel {
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.validation-panel h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
}

.validation-error {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  font-size: 13px;
}

.validation-error.error {
  color: #721c24;
}

.validation-error.warning {
  color: #856404;
}

.error-location {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  min-width: 80px;
}

.error-message {
  flex: 1;
}
```

This completes Phase 1 of the implementation. The foundation services and base components provide:

1. **fmlrunner Integration**: Complete service layer with validation, transformation, and health checks
2. **Logical Model Service**: Parsing and visualization of FHIR StructureDefinitions
3. **Visual Components**: Interactive logical model visualization and FML code editing
4. **Testing Foundation**: Comprehensive tests and mock services for development

**Next Steps for Phase 2**: 
- Integration of these components into a cohesive mapping workflow
- Enhanced UI interactions and mapping creation tools
- Advanced FML features and syntax highlighting
- User experience refinements and accessibility improvements