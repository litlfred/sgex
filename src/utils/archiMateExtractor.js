/**
 * ArchiMate Extraction Utility
 * 
 * Transforms FHIR Logical Models (FSH) into ArchiMate Data Objects and Relationships
 * according to ArchiMate XSD specifications.
 */

/**
 * Extracts logical model information from FSH content
 * @param {string} fshContent - The FSH file content
 * @param {string} filename - The FSH file name
 * @returns {Object} Parsed logical model information
 */
export function parseFSHLogicalModel(fshContent, filename) {
  if (!fshContent) {
    return null;
  }

  const lines = fshContent.split('\n');
  const model = {
    id: null,
    title: null,
    description: null,
    parent: null,
    elements: [],
    filename: filename,
    raw: fshContent
  };

  let inLogicalModel = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*')) {
      continue;
    }

    // Detect Logical Model definition
    if (line.startsWith('Logical:')) {
      inLogicalModel = true;
      const logicalMatch = line.match(/Logical:\s*(\S+)/);
      if (logicalMatch) {
        model.id = logicalMatch[1];
      }
      continue;
    }

    // Extract metadata
    if (line.startsWith('Id:')) {
      model.id = line.replace('Id:', '').trim();
      continue;
    }
    
    if (line.startsWith('Title:')) {
      model.title = line.replace('Title:', '').trim().replace(/"/g, '');
      continue;
    }
    
    if (line.startsWith('Description:')) {
      model.description = line.replace('Description:', '').trim().replace(/"/g, '');
      continue;
    }
    
    if (line.startsWith('Parent:')) {
      model.parent = line.replace('Parent:', '').trim();
      continue;
    }

    // Parse element definitions
    if (inLogicalModel && line.includes('*') && !line.startsWith('*')) {
      const elementMatch = line.match(/^\s*(\S+)\s*(\d+\.\.\*|\d+\.\.\d+|\d+)?\s*(\S+)?\s*(.*)?/);
      if (elementMatch) {
        const [, path, cardinality, type, description] = elementMatch;
        
        const element = {
          path: path,
          cardinality: cardinality || '0..1',
          type: type || 'string',
          description: description ? description.replace(/"/g, '').trim() : '',
          level: (path.match(/\./g) || []).length
        };
        
        model.elements.push(element);
      }
    }
  }

  // Set default title if not found
  if (!model.title && model.id) {
    model.title = model.id.replace(/([A-Z])/g, ' $1').trim();
  }

  return model.id ? model : null;
}

/**
 * Converts a single Logical Model to ArchiMate DataObject XML
 * @param {Object} logicalModel - Parsed logical model from parseFSHLogicalModel
 * @returns {string} ArchiMate DataObject XML
 */
export function logicalModelToDataObject(logicalModel) {
  if (!logicalModel || !logicalModel.id) {
    return null;
  }

  const dataObjectId = `do-${logicalModel.id.toLowerCase()}`;
  const name = logicalModel.title || logicalModel.id;
  
  // Create hierarchical description of fields
  let description = `id: ${logicalModel.id}`;
  if (logicalModel.description) {
    description += `\nDescription: ${logicalModel.description}`;
  }
  
  if (logicalModel.elements && logicalModel.elements.length > 0) {
    description += '\nFields:';
    
    for (const element of logicalModel.elements) {
      const indent = '  '.repeat(element.level);
      const cardinalityStr = element.cardinality ? `[${element.cardinality}]` : '[0..1]';
      const typeStr = element.type ? `(${element.type})` : '(string)';
      
      if (element.level === 0) {
        description += `\n- ${element.path} ${cardinalityStr} ${typeStr}`;
      } else {
        description += `\n${indent}└── ${element.path.split('.').pop()} ${cardinalityStr} ${typeStr}`;
      }
      
      if (element.description) {
        description += ` - ${element.description}`;
      }
    }
  }

  // Generate ArchiMate DataObject XML
  return `    <element xsi:type="archimate:DataObject" id="${dataObjectId}" name="${name}">
      <documentation>${escapeXml(description)}</documentation>
    </element>`;
}

/**
 * Analyzes relationships between logical models
 * @param {Array} logicalModels - Array of parsed logical models
 * @returns {Array} Array of relationship objects
 */
export function analyzeLogicalModelRelationships(logicalModels) {
  const relationships = [];
  const modelIds = logicalModels.map(m => m.id);

  for (const model of logicalModels) {
    if (!model.elements) continue;

    for (const element of model.elements) {
      // Check for composition relationships (direct type reference to another LM)
      if (modelIds.includes(element.type)) {
        relationships.push({
          id: `rel-comp-${model.id}-${element.type}`,
          type: 'composition',
          source: model.id,
          target: element.type,
          name: `${model.id} contains ${element.type}`,
          description: `Composition relationship: ${model.id}.${element.path} is of type ${element.type}`
        });
      }
      
      // Check for aggregation relationships (Reference types)
      if (element.type === 'Reference' || element.type.startsWith('Reference(')) {
        const refMatch = element.type.match(/Reference\((\w+)\)/);
        const referencedType = refMatch ? refMatch[1] : null;
        
        if (referencedType && modelIds.includes(referencedType)) {
          relationships.push({
            id: `rel-agg-${model.id}-${referencedType}`,
            type: 'aggregation',
            source: model.id,
            target: referencedType,
            name: `${model.id} references ${referencedType}`,
            description: `Aggregation relationship: ${model.id}.${element.path} references ${referencedType}`
          });
        }
      }
    }
  }

  return relationships;
}

/**
 * Converts relationships to ArchiMate XML
 * @param {Array} relationships - Array of relationship objects
 * @returns {string} ArchiMate relationships XML
 */
export function relationshipsToArchiMateXML(relationships) {
  return relationships.map(rel => {
    const relationshipType = rel.type === 'composition' ? 'archimate:CompositionRelationship' : 'archimate:AggregationRelationship';
    
    return `    <element xsi:type="${relationshipType}" id="${rel.id}" name="${rel.name}" source="do-${rel.source.toLowerCase()}" target="do-${rel.target.toLowerCase()}">
      <documentation>${escapeXml(rel.description)}</documentation>
    </element>`;
  }).join('\n');
}

/**
 * Generates complete ArchiMate model XML from logical models
 * @param {Array} logicalModels - Array of parsed logical models
 * @param {Object} options - Generation options
 * @returns {string} Complete ArchiMate XML
 */
export function generateArchiMateModel(logicalModels, options = {}) {
  const {
    modelName = 'FHIR Logical Models',
    modelId = 'fhir-logical-models',
    version = '1.0.0'
  } = options;

  if (!logicalModels || logicalModels.length === 0) {
    throw new Error('No logical models provided');
  }

  // Generate DataObjects
  const dataObjects = logicalModels
    .map(model => logicalModelToDataObject(model))
    .filter(obj => obj !== null)
    .join('\n');

  // Generate Relationships
  const relationships = analyzeLogicalModelRelationships(logicalModels);
  const relationshipsXML = relationshipsToArchiMateXML(relationships);

  // Generate complete ArchiMate XML
  const timestamp = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<archimate:model 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xmlns:archimate="http://www.archimatetool.com/archimate" 
  name="${modelName}" 
  id="${modelId}" 
  version="${version}"
  xsi:schemaLocation="http://www.archimatetool.com/archimate http://www.archimatetool.com/xsd/archimate3_Diagram.xsd">
  
  <documentation>Generated from FHIR Logical Models
Generated on: ${timestamp}
Source: ${logicalModels.length} logical model(s)
Models: ${logicalModels.map(m => m.id).join(', ')}
  </documentation>
  
  <folder name="Business" id="business-folder" type="business"/>
  <folder name="Application" id="application-folder" type="application"/>
  <folder name="Technology &amp; Physical" id="technology-folder" type="technology"/>
  <folder name="Motivation" id="motivation-folder" type="motivation"/>
  <folder name="Implementation &amp; Migration" id="implementation-folder" type="implementation_migration"/>
  <folder name="Other" id="other-folder" type="other"/>
  <folder name="Relations" id="relations-folder" type="relations">
${relationshipsXML}
  </folder>
  
  <folder name="Views" id="views-folder" type="diagrams"/>
  
  <!-- Data Objects from Logical Models -->
${dataObjects}

</archimate:model>`;
}

/**
 * Utility function to escape XML content
 * @param {string} text - Text to escape
 * @returns {string} XML-escaped text
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates ArchiMate XML against basic structural requirements
 * @param {string} archiMateXML - The generated XML
 * @returns {Object} Validation result with success flag and errors
 */
export function validateArchiMateXML(archiMateXML) {
  const errors = [];
  
  try {
    // Basic XML structure validation
    if (!archiMateXML.includes('<?xml version="1.0"')) {
      errors.push('Missing XML declaration');
    }
    
    if (!archiMateXML.includes('xmlns:archimate="http://www.archimatetool.com/archimate"')) {
      errors.push('Missing ArchiMate namespace declaration');
    }
    
    if (!archiMateXML.includes('archimate:model')) {
      errors.push('Missing ArchiMate model root element');
    }
    
    // Check for balanced tags
    const openTags = (archiMateXML.match(/<\w[^>]*>/g) || []).length;
    const closeTags = (archiMateXML.match(/<\/\w[^>]*>/g) || []).length;
    const selfClosingTags = (archiMateXML.match(/<\w[^>]*\/>/g) || []).length;
    
    if (openTags !== closeTags + selfClosingTags) {
      errors.push('Unbalanced XML tags detected');
    }
    
    return {
      success: errors.length === 0,
      errors: errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Validation error: ${error.message}`]
    };
  }
}