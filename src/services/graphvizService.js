/**
 * SGEX GraphViz Service
 * 
 * Provides layout positioning services for SVG graphics using GraphViz algorithms.
 * This service helps with automatic positioning and alignment of logical model elements,
 * ArchiMate diagrams, and FML mapping visualizations.
 * 
 * Uses @hpcc-js/wasm for browser-compatible GraphViz rendering via WebAssembly.
 * Integrates with the existing FML/StructureMap editor to provide dynamic layout
 * capabilities with different GraphViz layout engines (dot, neato, fdp, circo, twopi).
 */

import { Graphviz } from '@hpcc-js/wasm';

/**
 * Available GraphViz layout engines with their characteristics
 */
export const LAYOUT_ENGINES = {
  DOT: {
    name: 'dot',
    description: 'Hierarchical layouts, good for directed graphs and trees',
    useCase: 'Logical model hierarchies, data flow diagrams'
  },
  NEATO: {
    name: 'neato',
    description: 'Spring model layouts, good for undirected graphs',
    useCase: 'Concept relationships, general network diagrams'
  },
  FDP: {
    name: 'fdp',
    description: 'Force-directed placement, good for large graphs',
    useCase: 'Large ArchiMate models, complex mappings'
  },
  CIRCO: {
    name: 'circo',
    description: 'Circular layout, good for cyclic structures',
    useCase: 'Process cycles, feedback loops'
  },
  TWOPI: {
    name: 'twopi',
    description: 'Radial layout with one central node',
    useCase: 'Hub-and-spoke models, central concept diagrams'
  }
};

/**
 * Generate SVG layout for logical models using GraphViz
 * @param {Array} logicalModels - Array of logical model objects
 * @param {Array} relationships - Array of relationship objects
 * @param {Object} options - Layout configuration options
 * @returns {Promise<Object>} Layout result with coordinates and SVG
 */
export async function generateLogicalModelLayout(logicalModels = [], relationships = [], options = {}) {
  const {
    engine = LAYOUT_ENGINES.DOT.name,
    nodeSpacing = 100,
    rankSep = 100,
    nodeSep = 50,
    rankDir = 'TB' // Top to Bottom, LR = Left to Right
  } = options;

  try {
    // Initialize GraphViz WASM
    const graphviz = await Graphviz.load();
    
    // Create DOT notation string for GraphViz
    let dotString = `digraph LogicalModels {
      rankdir="${rankDir}";
      ranksep="${rankSep / 72}";
      nodesep="${nodeSep / 72}";
      splines="ortho";
      overlap="false";
      
      node [shape=box, style="rounded,filled", fillcolor="#e1f5fe", fontname="Arial", fontsize="10", margin="0.1,0.05"];
      edge [color="#666666", fontname="Arial", fontsize="8"];
    `;
    
    // Add logical model nodes
    logicalModels.forEach((model, index) => {
      const nodeId = `lm_${index}`;
      const modelName = extractModelName(model) || `Model-${index + 1}`;
      const elementCount = extractElementCount(model);
      
      // Create label with model name and element count
      const label = elementCount > 0 
        ? `${escapeLabel(modelName)}\\n(${elementCount} elements)`
        : escapeLabel(modelName);
      
      const fillcolor = getModelColor(model);
      const tooltip = escapeLabel(extractModelDescription(model) || 'FHIR Logical Model');
      
      dotString += `
        ${nodeId} [label="${label}", fillcolor="${fillcolor}", tooltip="${tooltip}"];`;
    });
    
    // Add relationship edges
    relationships.forEach((rel, index) => {
      const sourceId = `lm_${rel.sourceIndex || 0}`;
      const targetId = `lm_${rel.targetIndex || 1}`;
      const label = escapeLabel(rel.type || 'relates to');
      const tooltip = escapeLabel(rel.description || 'Model relationship');
      
      dotString += `
        ${sourceId} -> ${targetId} [label="${label}", tooltip="${tooltip}"];`;
    });
    
    dotString += '\n}';
    
    // Generate layout using specified engine
    const svgResult = graphviz.layout(dotString, 'svg', engine);
    
    // Parse coordinates from SVG output
    const coordinates = extractCoordinatesFromSVG(svgResult, logicalModels);
    
    return {
      svg: svgResult,
      coordinates: coordinates,
      engine: engine,
      dotString: dotString,
      success: true
    };
    
  } catch (error) {
    console.error('GraphViz layout generation failed:', error);
    return {
      error: error.message,
      fallbackCoordinates: generateFallbackLayout(logicalModels, nodeSpacing),
      success: false
    };
  }
}

/**
 * Generate ArchiMate model layout using GraphViz
 * @param {Object} archimateModel - ArchiMate model object
 * @param {Object} options - Layout configuration options
 * @returns {Promise<Object>} Layout result with coordinates and SVG
 */
export async function generateArchimateLayout(archimateModel, options = {}) {
  const {
    engine = LAYOUT_ENGINES.NEATO.name,
    showDataObjects = true,
    groupByType = true,
    clusterSpacing = 150
  } = options;

  if (!archimateModel || !archimateModel.elements) {
    return generateEmptyLayout();
  }

  try {
    // Initialize GraphViz WASM
    const graphviz = await Graphviz.load();
    
    let dotString = `digraph ArchimateModel {
      compound="true";
      clusterrank="local";
      rankdir="TB";
      splines="spline";
      overlap="false";
    `;
    
    // Group elements by type if requested
    if (groupByType) {
      const appComponents = archimateModel.elements.filter(el => el.type === 'ApplicationComponent');
      const dataObjects = archimateModel.elements.filter(el => el.type === 'DataObject');
      
      // Create cluster for Application Components
      if (appComponents.length > 0) {
        dotString += `
          subgraph cluster_apps {
            label="Logical Models";
            style="rounded,filled";
            fillcolor="#f0f8ff";
            color="#4682b4";
            
            node [shape=box, style="rounded,filled", fillcolor="#87ceeb"];`;
        
        appComponents.forEach(element => {
          const label = escapeLabel(element.name);
          const tooltip = escapeLabel(element.description);
          dotString += `
            ${element.id} [label="${label}", tooltip="${tooltip}"];`;
        });
        
        dotString += '\n          }';
      }
      
      // Create cluster for Data Objects if requested
      if (showDataObjects && dataObjects.length > 0) {
        dotString += `
          subgraph cluster_data {
            label="DAK Concepts";
            style="rounded,filled";
            fillcolor="#f5f5dc";
            color="#daa520";
            
            node [shape=ellipse, style="filled", fillcolor="#f0e68c"];`;
        
        dataObjects.forEach(element => {
          const label = escapeLabel(element.name);
          const tooltip = escapeLabel(element.description);
          dotString += `
            ${element.id} [label="${label}", tooltip="${tooltip}"];`;
        });
        
        dotString += '\n          }';
      }
    } else {
      // Add all elements without clustering
      dotString += '\n      node [fontname="Arial", fontsize="10"];';
      
      archimateModel.elements.forEach(element => {
        const shape = element.type === 'ApplicationComponent' ? 'box' : 'ellipse';
        const color = element.type === 'ApplicationComponent' ? '#87ceeb' : '#f0e68c';
        const label = escapeLabel(element.name);
        const tooltip = escapeLabel(element.description);
        
        dotString += `
          ${element.id} [label="${label}", shape="${shape}", style="filled", fillcolor="${color}", tooltip="${tooltip}"];`;
      });
    }
    
    // Add relationships
    if (archimateModel.relationships) {
      dotString += '\n      edge [fontname="Arial", fontsize="8"];';
      
      archimateModel.relationships.forEach(rel => {
        const label = escapeLabel(rel.name || rel.type);
        const tooltip = escapeLabel(rel.description || 'ArchiMate relationship');
        
        dotString += `
          ${rel.source} -> ${rel.target} [label="${label}", tooltip="${tooltip}"];`;
      });
    }
    
    dotString += '\n}';
    
    // Generate layout
    const svgResult = graphviz.layout(dotString, 'svg', engine);
    const coordinates = extractCoordinatesFromSVG(svgResult, archimateModel.elements);
    
    return {
      svg: svgResult,
      coordinates: coordinates,
      engine: engine,
      dotString: dotString,
      success: true
    };
    
  } catch (error) {
    console.error('ArchiMate layout generation failed:', error);
    return {
      error: error.message,
      fallbackCoordinates: generateFallbackLayout(archimateModel.elements, 150),
      success: false
    };
  }
}

/**
 * Generate FML mapping layout for technical view
 * @param {Array} sourceModels - Source logical models
 * @param {Array} targetModels - Target logical models  
 * @param {Array} mappings - FML mapping definitions
 * @param {Object} options - Layout configuration options
 * @returns {Promise<Object>} Layout result with coordinates and SVG
 */
export async function generateFMLMappingLayout(sourceModels = [], targetModels = [], mappings = [], options = {}) {
  const {
    engine = LAYOUT_ENGINES.DOT.name,
    orientation = 'LR', // Left to Right for mappings
    sourceColor = '#e3f2fd',
    targetColor = '#f3e5f5',
    mappingColor = '#ffeb3b'
  } = options;

  try {
    // Initialize GraphViz WASM
    const graphviz = await Graphviz.load();
    
    let dotString = `digraph FMLMapping {
      rankdir="${orientation}";
      ranksep="2.0";
      nodesep="1.0";
      splines="ortho";
      compound="true";
      
      subgraph cluster_source {
        label="Source Models";
        style="filled";
        fillcolor="${sourceColor}";
        rank="source";
        
        node [shape=box, style="rounded,filled", fillcolor="#2196f3", fontcolor="white"];`;
    
    // Add source model nodes
    sourceModels.forEach((model, index) => {
      const nodeId = `src_${index}`;
      const label = escapeLabel(extractModelName(model) || `Source-${index + 1}`);
      dotString += `
        ${nodeId} [label="${label}"];`;
    });
    
    dotString += `
      }
      
      subgraph cluster_target {
        label="Target Models";
        style="filled";
        fillcolor="${targetColor}";
        rank="sink";
        
        node [shape=box, style="rounded,filled", fillcolor="#9c27b0", fontcolor="white"];`;
    
    // Add target model nodes
    targetModels.forEach((model, index) => {
      const nodeId = `tgt_${index}`;
      const label = escapeLabel(extractModelName(model) || `Target-${index + 1}`);
      dotString += `
        ${nodeId} [label="${label}"];`;
    });
    
    dotString += `
      }
      
      edge [color="${mappingColor}", fontcolor="#ff6f00", style="bold"];`;
    
    // Add mapping edges
    mappings.forEach((mapping, index) => {
      const sourceId = `src_${mapping.sourceIndex || 0}`;
      const targetId = `tgt_${mapping.targetIndex || 0}`;
      const label = escapeLabel(mapping.name || `Map-${index + 1}`);
      const tooltip = escapeLabel(mapping.expression || 'FML mapping');
      
      dotString += `
      ${sourceId} -> ${targetId} [label="${label}", tooltip="${tooltip}"];`;
    });
    
    dotString += '\n}';
    
    // Generate layout
    const svgResult = graphviz.layout(dotString, 'svg', engine);
    const allModels = [...sourceModels, ...targetModels];
    const coordinates = extractCoordinatesFromSVG(svgResult, allModels);
    
    return {
      svg: svgResult,
      coordinates: coordinates,
      engine: engine,
      dotString: dotString,
      success: true
    };
    
  } catch (error) {
    console.error('FML mapping layout generation failed:', error);
    return {
      error: error.message,
      fallbackCoordinates: generateFallbackMappingLayout(sourceModels, targetModels),
      success: false
    };
  }
}

/**
 * Escape special characters in GraphViz labels
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeLabel(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '')      // Remove carriage returns
    .replace(/\t/g, ' ');    // Replace tabs with spaces
}

/**
 * Extract coordinates from GraphViz SVG output
 * @param {string} svgContent - SVG content from GraphViz
 * @param {Array} elements - Original elements to map coordinates to
 * @returns {Object} Coordinate mapping
 */
function extractCoordinatesFromSVG(svgContent, elements) {
  const coordinates = {};
  
  try {
    // Create a temporary DOM parser to extract SVG elements
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Find all group elements with node IDs
    const nodeGroups = svgDoc.querySelectorAll('g.node');
    
    nodeGroups.forEach((group, index) => {
      const titleElement = group.querySelector('title');
      const nodeId = titleElement ? titleElement.textContent.trim() : null;
      
      if (nodeId) {
        // Extract transform translate values
        const transform = group.getAttribute('transform');
        if (transform) {
          const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (translateMatch) {
            coordinates[nodeId] = {
              x: parseFloat(translateMatch[1]),
              y: parseFloat(translateMatch[2])
            };
          }
        }
      }
    });
    
    // Fallback: assign coordinates by element index if parsing fails
    if (Object.keys(coordinates).length === 0) {
      elements.forEach((element, index) => {
        const nodeId = element.id || `node_${index}`;
        coordinates[nodeId] = {
          x: 100 + (index % 3) * 200,
          y: 100 + Math.floor(index / 3) * 150
        };
      });
    }
    
  } catch (error) {
    console.warn('Failed to extract coordinates from SVG:', error);
    // Generate fallback coordinates
    elements.forEach((element, index) => {
      const nodeId = element.id || `node_${index}`;
      coordinates[nodeId] = {
        x: 100 + (index % 3) * 200,
        y: 100 + Math.floor(index / 3) * 150
      };
    });
  }
  
  return coordinates;
}

/**
 * Generate fallback layout when GraphViz fails
 * @param {Array} elements - Elements to position
 * @param {number} spacing - Space between elements
 * @returns {Object} Coordinate mapping
 */
function generateFallbackLayout(elements, spacing = 150) {
  const coordinates = {};
  const elementsPerRow = Math.ceil(Math.sqrt(elements.length));
  
  elements.forEach((element, index) => {
    const row = Math.floor(index / elementsPerRow);
    const col = index % elementsPerRow;
    
    coordinates[element.id || index] = {
      x: 50 + col * spacing,
      y: 50 + row * spacing
    };
  });
  
  return coordinates;
}

/**
 * Generate fallback mapping layout
 * @param {Array} sourceModels - Source models
 * @param {Array} targetModels - Target models
 * @returns {Object} Coordinate mapping
 */
function generateFallbackMappingLayout(sourceModels, targetModels) {
  const coordinates = {};
  
  // Position source models on the left
  sourceModels.forEach((model, index) => {
    coordinates[`src_${index}`] = {
      x: 100,
      y: 100 + index * 150
    };
  });
  
  // Position target models on the right
  targetModels.forEach((model, index) => {
    coordinates[`tgt_${index}`] = {
      x: 500,
      y: 100 + index * 150
    };
  });
  
  return coordinates;
}

/**
 * Generate empty layout result
 * @returns {Object} Empty layout object
 */
function generateEmptyLayout() {
  return {
    svg: '<svg width="400" height="200"><text x="50" y="100" font-family="Arial" font-size="14" fill="#666">No elements to layout</text></svg>',
    coordinates: {},
    engine: 'none',
    success: true
  };
}

/**
 * Utility functions for model data extraction
 */

function extractModelName(model) {
  if (model.metadata?.title) return model.metadata.title;
  if (model.metadata?.logical) return model.metadata.logical;
  if (model.name) return model.name;
  if (model.fileName) return model.fileName.replace(/\.(fsh|json)$/, '');
  return null;
}

function extractModelDescription(model) {
  if (model.metadata?.description) return model.metadata.description;
  if (model.description) return model.description;
  return 'FHIR Logical Model';
}

function extractElementCount(model) {
  if (model.elements && Array.isArray(model.elements)) {
    return model.elements.length;
  }
  if (model.content) {
    const elementMatches = model.content.match(/^\s*\*\s+/gm);
    return elementMatches ? elementMatches.length : 0;
  }
  return 0;
}

function getModelColor(model) {
  const elementCount = extractElementCount(model);
  
  // Color based on complexity
  if (elementCount === 0) return '#ffcdd2'; // Light red for empty
  if (elementCount <= 5) return '#c8e6c9'; // Light green for simple
  if (elementCount <= 15) return '#bbdefb'; // Light blue for medium
  return '#d1c4e9'; // Light purple for complex
}

/**
 * GraphViz Service utilities
 */
const GraphVizService = {
  LAYOUT_ENGINES,
  generateLogicalModelLayout,
  generateArchimateLayout, 
  generateFMLMappingLayout,
  generateFallbackLayout,
  escapeLabel
};

export default GraphVizService;