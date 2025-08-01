/**
 * ArchiMate extraction utilities for converting FHIR Logical Models to ArchiMate DataObjects
 * Ensures compliance with ArchiMate XSD schemas
 */

/**
 * Parse a FHIR FSH Logical Model and extract its structure
 * @param {string} fshContent - The FSH file content
 * @param {string} fileName - The FSH file name
 * @returns {Object} Parsed logical model structure
 */
export function parseLogicalModel(fshContent, fileName) {
  const lines = fshContent.split('\n');
  const model = {
    id: null,
    title: null,
    description: null,
    parent: null,
    fields: [],
    fileName: fileName
  };

  let inLogicalDefinition = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*')) {
      continue;
    }

    // Check for Logical Model definition
    if (line.startsWith('Logical:')) {
      inLogicalDefinition = true;
      const match = line.match(/Logical:\s*(\S+)/);
      if (match) {
        model.id = match[1];
      }
      continue;
    }

    if (!inLogicalDefinition) {
      continue;
    }

    // Parse metadata
    if (line.startsWith('Title:')) {
      const match = line.match(/Title:\s*"([^"]+)"/);
      if (match) {
        model.title = match[1];
      }
    } else if (line.startsWith('Description:')) {
      const match = line.match(/Description:\s*"([^"]+)"/);
      if (match) {
        model.description = match[1];
      }
    } else if (line.startsWith('Parent:')) {
      const match = line.match(/Parent:\s*(\S+)/);
      if (match) {
        model.parent = match[1];
      }
    }

    // Parse field definitions (elements starting with *)
    if (line.startsWith('*')) {
      const field = parseFieldDefinition(line);
      if (field) {
        model.fields.push(field);
      }
    }
  }

  return model;
}

/**
 * Parse a field definition line from FSH
 * @param {string} line - The field definition line
 * @returns {Object|null} Parsed field or null if invalid
 */
function parseFieldDefinition(line) {
  // Pattern: * fieldName cardinality datatype "description"
  const match = line.match(/\*\s+([^\s[]+)(\s+\[[^\]]+\])?\s+([^\s"]+)(\s+"([^"]+)")?/);
  
  if (!match) {
    return null;
  }

  const [, name, cardinalityPart, datatype, , description] = match;
  
  // Extract cardinality
  let cardinality = '0..1'; // default
  if (cardinalityPart) {
    const cardMatch = cardinalityPart.match(/\[([^\]]+)\]/);
    if (cardMatch) {
      cardinality = cardMatch[1];
    }
  }

  return {
    name: name.trim(),
    cardinality: cardinality.trim(),
    datatype: datatype.trim(),
    description: description ? description.trim() : '',
    level: 0 // Will be calculated based on indentation if needed
  };
}

/**
 * Convert a logical model to ArchiMate DataObject
 * @param {Object} logicalModel - Parsed logical model
 * @param {Object[]} allModels - All logical models for relationship detection
 * @returns {Object} ArchiMate DataObject structure
 */
export function convertToArchiMateDataObject(logicalModel, allModels = []) {
  const description = generateDataObjectDescription(logicalModel);
  
  return {
    id: `do-${logicalModel.id}`,
    name: logicalModel.title || logicalModel.id,
    type: 'DataObject',
    description: description,
    properties: {
      sourceFile: logicalModel.fileName,
      sourceId: logicalModel.id,
      elementType: 'LogicalModel'
    }
  };
}

/**
 * Generate a hierarchical description for the DataObject
 * @param {Object} logicalModel - Parsed logical model
 * @returns {string} Formatted description
 */
function generateDataObjectDescription(logicalModel) {
  let description = '';
  
  if (logicalModel.id) {
    description += `id: ${logicalModel.id}\n`;
  }
  
  if (logicalModel.fields && logicalModel.fields.length > 0) {
    description += 'Fields:\n';
    logicalModel.fields.forEach(field => {
      description += `- ${field.name} [${field.cardinality}] (${field.datatype})\n`;
      // Note: Hierarchical indentation can be added here if FSH supports nested structures
    });
  }
  
  return description.trim();
}

/**
 * Detect relationships between logical models
 * @param {Object[]} logicalModels - Array of parsed logical models
 * @returns {Object[]} Array of ArchiMate relationships
 */
export function detectRelationships(logicalModels) {
  const relationships = [];
  const modelMap = new Map();
  
  // Create a map of model IDs for quick lookup
  logicalModels.forEach(model => {
    if (model.id) {
      modelMap.set(model.id, model);
    }
  });

  logicalModels.forEach(sourceModel => {
    sourceModel.fields.forEach(field => {
      // Check if field datatype references another logical model
      const referencedModel = modelMap.get(field.datatype);
      
      if (referencedModel) {
        // Determine relationship type based on field characteristics
        const relationshipType = determineRelationshipType(field);
        
        relationships.push({
          id: `rel-${sourceModel.id}-${referencedModel.id}-${field.name}`,
          type: relationshipType,
          source: `do-${sourceModel.id}`,
          target: `do-${referencedModel.id}`,
          properties: {
            fieldName: field.name,
            cardinality: field.cardinality,
            description: field.description
          }
        });
      }
    });
  });

  return relationships;
}

/**
 * Determine the type of relationship based on field characteristics
 * @param {Object} field - Field definition
 * @returns {string} ArchiMate relationship type
 */
function determineRelationshipType(field) {
  // If the field name contains 'reference' or 'ref', it's likely an aggregation
  if (field.name.toLowerCase().includes('reference') || 
      field.name.toLowerCase().includes('ref') ||
      field.datatype === 'Reference') {
    return 'aggregation';
  }
  
  // If cardinality suggests containment (1..1, 1..*, etc.), it's likely composition
  if (field.cardinality.startsWith('1') || field.cardinality === '0..1') {
    return 'composition';
  }
  
  // Default to aggregation for other cases
  return 'aggregation';
}

/**
 * Generate ArchiMate XML document from DataObjects and relationships
 * @param {Object[]} dataObjects - Array of ArchiMate DataObjects
 * @param {Object[]} relationships - Array of ArchiMate relationships
 * @returns {string} ArchiMate XML compliant with XSD schema
 */
export function generateArchiMateXML(dataObjects, relationships) {
  const timestamp = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.archimatetool.com/archimate" 
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
       xsi:schemaLocation="http://www.archimatetool.com/archimate http://www.archimatetool.com/archimate/model.xsd"
       name="DAK Logical Models"
       id="dak-logical-models"
       version="5.0.0">
  
  <metadata>
    <schema-version>3.1</schema-version>
    <created>${timestamp}</created>
    <changed>${timestamp}</changed>
    <generator>SGEX Workbench - Core Data Dictionary Logical Models</generator>
  </metadata>
  
  <elements>
`;

  // Add data objects
  dataObjects.forEach(dataObject => {
    xml += `    <element xsi:type="DataObject" 
             id="${dataObject.id}" 
             name="${escapeXML(dataObject.name)}">
      <documentation>${escapeXML(dataObject.description)}</documentation>
      <properties>
        <property key="sourceFile" value="${escapeXML(dataObject.properties.sourceFile)}" />
        <property key="sourceId" value="${escapeXML(dataObject.properties.sourceId)}" />
        <property key="elementType" value="${escapeXML(dataObject.properties.elementType)}" />
      </properties>
    </element>
`;
  });

  xml += `  </elements>
  
  <relationships>
`;

  // Add relationships
  relationships.forEach(relationship => {
    xml += `    <relationship xsi:type="${relationship.type}" 
                  id="${relationship.id}" 
                  source="${relationship.source}" 
                  target="${relationship.target}">
      <properties>
        <property key="fieldName" value="${escapeXML(relationship.properties.fieldName)}" />
        <property key="cardinality" value="${escapeXML(relationship.properties.cardinality)}" />
        <property key="description" value="${escapeXML(relationship.properties.description)}" />
      </properties>
    </relationship>
`;
  });

  xml += `  </relationships>
  
</model>`;

  return xml;
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extract all logical models from a directory of FSH files
 * @param {Object[]} fshFiles - Array of FSH file objects with name, path, content
 * @returns {Object[]} Array of parsed logical models
 */
export function extractLogicalModelsFromFiles(fshFiles) {
  const logicalModels = [];
  
  fshFiles.forEach(file => {
    if (file.content && file.content.includes('Logical:')) {
      const model = parseLogicalModel(file.content, file.name);
      if (model.id) {
        logicalModels.push(model);
      }
    }
  });
  
  return logicalModels;
}

/**
 * Process all logical models and generate complete ArchiMate export
 * @param {Object[]} fshFiles - Array of FSH file objects
 * @returns {Object} Complete ArchiMate export with DataObjects, relationships, and XML
 */
export function processLogicalModelsToArchiMate(fshFiles) {
  const logicalModels = extractLogicalModelsFromFiles(fshFiles);
  
  if (logicalModels.length === 0) {
    return {
      logicalModels: [],
      dataObjects: [],
      relationships: [],
      xml: null,
      error: 'No logical models found in the provided FSH files'
    };
  }
  
  const dataObjects = logicalModels.map(model => 
    convertToArchiMateDataObject(model, logicalModels)
  );
  
  const relationships = detectRelationships(logicalModels);
  
  const xml = generateArchiMateXML(dataObjects, relationships);
  
  return {
    logicalModels,
    dataObjects,
    relationships,
    xml,
    error: null
  };
}