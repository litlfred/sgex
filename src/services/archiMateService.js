/**
 * ArchiMate Extraction Service
 * Converts FHIR FSH Logical Models to ArchiMate DataObject format
 */

/**
 * Extract ArchiMate DataObject from FSH Logical Model content
 * @param {Object} logicalModel - The logical model object with content, title, etc.
 * @returns {Object} ArchiMate extraction result
 */
export const extractLogicalModelToArchiMate = (logicalModel) => {
  try {
    console.log('🚀 ArchiMate extraction started for:', logicalModel?.name || 'unknown model');
    const { content, title, description, name } = logicalModel;
    
    if (!content) {
      throw new Error('No content provided for extraction');
    }
    
    console.log('📝 Content length:', content.length, 'characters');
    
    // Parse the FSH content to extract structure
    const parsed = parseFSHLogicalModel(content);
    console.log('📊 Parsed structure:', parsed);
    
    // Generate ArchiMate DataObject
    const archiMateObject = generateArchiMateDataObject(parsed, title, description, name);
    console.log('🏗️ Generated ArchiMate object:', archiMateObject);
    
    const xml = generateArchiMateXML(archiMateObject);
    console.log('📋 Generated XML length:', xml.length);
    
    return {
      success: true,
      archiMateObject,
      xml,
      sourceModel: logicalModel
    };
  } catch (error) {
    console.error('❌ ArchiMate extraction failed:', error);
    return {
      success: false,
      error: error.message,
      sourceModel: logicalModel
    };
  }
};

/**
 * Parse FSH Logical Model content to extract structure
 * @param {string} content - FSH file content
 * @returns {Object} Parsed logical model structure
 */
const parseFSHLogicalModel = (content) => {
  console.log('🔍 Starting FSH parsing...');
  const lines = content.split('\n');
  console.log('📄 Total lines to parse:', lines.length);
  
  const result = {
    name: '',
    title: '',
    description: '',
    parent: '',
    elements: [],
    rules: []
  };
  
  let currentContext = 'global';
  let currentElement = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.startsWith('//')) continue;
    
    // Parse Logical model declaration
    const logicalMatch = line.match(/^Logical:\s*(.+)$/);
    if (logicalMatch) {
      result.name = logicalMatch[1].trim();
      continue;
    }
    
    // Parse Parent declaration
    const parentMatch = line.match(/^Parent:\s*(.+)$/);
    if (parentMatch) {
      result.parent = parentMatch[1].trim();
      continue;
    }
    
    // Parse Title
    const titleMatch = line.match(/^Title:\s*"(.+)"$/);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
      continue;
    }
    
    // Parse Description
    const descMatch = line.match(/^Description:\s*"(.+)"$/);
    if (descMatch) {
      result.description = descMatch[1].trim();
      continue;
    }
    
    // Parse Element definitions: * element : type card "short" "definition"
    const elementMatch = line.match(/^\*\s+([^\s:]+)\s*:\s*([^\s]+)(?:\s+(\d+\.\.\*|\d+\.\.\d+|\d+))?\s*"([^"]*)"(?:\s*"([^"]*)")?/);
    if (elementMatch) {
      const [, name, type, cardinality, short, definition] = elementMatch;
      result.elements.push({
        name: name.trim(),
        type: type.trim(),
        cardinality: cardinality?.trim() || '0..1',
        short: short.trim(),
        definition: definition?.trim() || short.trim(),
        constraints: []
      });
      continue;
    }
    
    // Parse constraints and invariants
    const constraintMatch = line.match(/^\*\s+([^\s:]+)\s+(.+)$/);
    if (constraintMatch && result.elements.length > 0) {
      const [, property, value] = constraintMatch;
      const lastElement = result.elements[result.elements.length - 1];
      lastElement.constraints.push({
        property: property.trim(),
        value: value.trim()
      });
    }
  }
  
  console.log('✅ FSH parsing completed. Found:', result.elements.length, 'elements');
  return result;
};

/**
 * Generate formatted description following Example Description Format from issue #429
 * @param {Object} parsed - Parsed FSH logical model
 * @param {string} fileName - Original file name
 * @returns {string} Formatted description
 */
const generateFormattedDescription = (parsed, fileName) => {
  // Start with the FHIR id
  const id = parsed.name || fileName.replace('.fsh', '');
  let description = `id: ${id}\nFields:`;
  
  // Add each field with proper formatting
  parsed.elements.forEach(element => {
    const cardinality = element.cardinality || '0..1';
    const dataType = element.type || 'string';
    
    // Format: - name [cardinality] (dataType)
    description += `\n- ${element.name} [${cardinality}] (${dataType})`;
    
    // Add hierarchy for complex types (nested elements)
    // For now, we'll show basic structure. This could be enhanced to parse
    // nested BackboneElements or complex types in future iterations
    if (isComplexType(dataType) && !dataType.includes('Reference(')) {
      // Add placeholder for potential nested elements
      // This would need to be enhanced based on actual FSH parsing of nested structures
      description += `\n  └── (nested elements would be parsed here)`;
    }
  });
  
  return description;
};

/**
 * Check if a data type is complex (not primitive)
 * @param {string} dataType - The data type to check
 * @returns {boolean} True if complex type
 */
const isComplexType = (dataType) => {
  const primitives = [
    'string', 'boolean', 'integer', 'decimal', 'date', 'dateTime', 'time',
    'code', 'uri', 'url', 'canonical', 'base64Binary', 'instant', 
    'positiveInt', 'unsignedInt', 'id', 'oid', 'uuid'
  ];
  
  // Check if it's a primitive type
  if (primitives.includes(dataType.toLowerCase())) {
    return false;
  }
  
  // Reference types are handled separately
  if (dataType.includes('Reference(')) {
    return false;
  }
  
  // Everything else is considered complex
  return true;
};

/**
 * Generate ArchiMate DataObject from parsed FSH structure
 * @param {Object} parsed - Parsed FSH logical model
 * @param {string} title - Model title
 * @param {string} description - Model description  
 * @param {string} fileName - Original file name
 * @returns {Object} ArchiMate DataObject structure
 */
const generateArchiMateDataObject = (parsed, title, description, fileName) => {
  const modelId = generateId();
  const timestamp = new Date().toISOString();
  
  // Generate the description following the Example Description Format from the issue
  const formattedDescription = generateFormattedDescription(parsed, fileName);
  
  return {
    id: modelId,
    name: parsed.title || title || parsed.name || fileName.replace('.fsh', ''),
    type: 'DataObject',
    documentation: formattedDescription,
    source: {
      type: 'FHIR FSH Logical Model',
      fileName: fileName,
      originalName: parsed.name
    },
    metadata: {
      extractedAt: timestamp,
      parent: parsed.parent,
      elementCount: parsed.elements.length
    },
    elements: parsed.elements.map(element => ({
      id: generateId(),
      name: element.name,
      type: 'DataAttribute',
      dataType: mapFHIRTypeToArchiMate(element.type),
      cardinality: element.cardinality,
      description: element.definition,
      shortDescription: element.short,
      constraints: element.constraints,
      source: {
        fhirType: element.type,
        originalCardinality: element.cardinality
      }
    })),
    relationships: generateRelationships(parsed.elements)
  };
};

/**
 * Map FHIR data types to ArchiMate-compatible types
 * @param {string} fhirType - FHIR data type
 * @returns {string} ArchiMate data type
 */
const mapFHIRTypeToArchiMate = (fhirType) => {
  const typeMap = {
    'string': 'String',
    'boolean': 'Boolean',
    'integer': 'Integer',
    'decimal': 'Decimal',
    'date': 'Date',
    'dateTime': 'DateTime',
    'time': 'Time',
    'code': 'Code',
    'uri': 'URI',
    'url': 'URL',
    'canonical': 'URI',
    'base64Binary': 'Binary',
    'instant': 'DateTime',
    'positiveInt': 'PositiveInteger',
    'unsignedInt': 'UnsignedInteger',
    'id': 'Identifier',
    'oid': 'OID',
    'uuid': 'UUID'
  };
  
  // Handle complex types
  if (fhirType.includes('Reference(')) {
    return 'Reference';
  }
  
  if (fhirType.includes('CodeableConcept')) {
    return 'CodeableConcept';
  }
  
  if (fhirType.includes('Coding')) {
    return 'Coding';
  }
  
  if (fhirType.includes('Identifier')) {
    return 'Identifier';
  }
  
  if (fhirType.includes('Period')) {
    return 'Period';
  }
  
  if (fhirType.includes('Quantity')) {
    return 'Quantity';
  }
  
  // Return mapped type or original if not found
  return typeMap[fhirType] || fhirType;
};

/**
 * Generate relationships between elements (composition, aggregation)
 * @param {Array} elements - Array of parsed elements
 * @returns {Array} Array of relationships
 */
const generateRelationships = (elements) => {
  const relationships = [];
  
  elements.forEach(element => {
    // Create composition relationships for complex types
    if (element.type && !isPrimitiveType(element.type)) {
      relationships.push({
        id: generateId(),
        type: 'Composition',
        source: 'parent',
        target: element.name,
        cardinality: element.cardinality,
        description: `${element.name} is composed within the logical model`
      });
    }
    
    // Create aggregation relationships for references
    if (element.type.includes('Reference(')) {
      relationships.push({
        id: generateId(),
        type: 'Aggregation', 
        source: 'parent',
        target: element.name,
        cardinality: element.cardinality,
        description: `${element.name} references external resource`
      });
    }
  });
  
  return relationships;
};

/**
 * Check if a FHIR type is primitive
 * @param {string} type - FHIR type
 * @returns {boolean} True if primitive type
 */
const isPrimitiveType = (type) => {
  const primitives = [
    'string', 'boolean', 'integer', 'decimal', 'date', 'dateTime', 'time',
    'code', 'uri', 'url', 'canonical', 'base64Binary', 'instant', 
    'positiveInt', 'unsignedInt', 'id', 'oid', 'uuid'
  ];
  return primitives.includes(type);
};

/**
 * Generate ArchiMate XML representation
 * @param {Object} archiMateObject - ArchiMate DataObject structure
 * @returns {string} XML representation
 */
const generateArchiMateXML = (archiMateObject) => {
  const { id, name, type, documentation, elements, relationships } = archiMateObject;
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<archimate:model 
  xmlns:archimate="http://www.archimatetool.com/archimate" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  name="${escapeXml(name)}" 
  id="${id}"
  version="4.9.0">
  
  <documentation>${escapeXml(documentation)}</documentation>
  
  <!-- Data Object Element -->
  <element xsi:type="archimate:DataObject" 
           name="${escapeXml(name)}" 
           id="${id}"
           documentation="${escapeXml(documentation)}">
    
    <!-- Metadata Properties -->
    <property key="source.type" value="${escapeXml(archiMateObject.source.type)}"/>
    <property key="source.fileName" value="${escapeXml(archiMateObject.source.fileName)}"/>
    <property key="extractedAt" value="${archiMateObject.metadata.extractedAt}"/>
    <property key="elementCount" value="${archiMateObject.metadata.elementCount}"/>
    ${archiMateObject.metadata.parent ? `<property key="parent" value="${escapeXml(archiMateObject.metadata.parent)}"/>` : ''}
  </element>
  
  <!-- Data Attributes -->
${elements.map(element => `  <element xsi:type="archimate:DataObject" 
           name="${escapeXml(element.name)}" 
           id="${element.id}"
           documentation="${escapeXml(element.description)}">
    <property key="dataType" value="${escapeXml(element.dataType)}"/>
    <property key="cardinality" value="${escapeXml(element.cardinality)}"/>
    <property key="shortDescription" value="${escapeXml(element.shortDescription)}"/>
    <property key="fhirType" value="${escapeXml(element.source.fhirType)}"/>
  </element>`).join('\n')}
  
  <!-- Relationships -->
${relationships.map(rel => `  <relationship xsi:type="archimate:${rel.type}Relationship" 
              id="${rel.id}"
              source="${rel.source === 'parent' ? id : rel.source}"
              target="${rel.target}">
    <documentation>${escapeXml(rel.description)}</documentation>
    ${rel.cardinality ? `<property key="cardinality" value="${escapeXml(rel.cardinality)}"/>` : ''}
  </relationship>`).join('\n')}
  
</archimate:model>`;

  return xml;
};

/**
 * Extract multiple logical models to ArchiMate format
 * @param {Array} logicalModels - Array of logical model objects
 * @returns {Object} Bulk extraction result
 */
export const extractMultipleModelsToArchiMate = (logicalModels) => {
  const results = [];
  const errors = [];
  
  logicalModels.forEach(model => {
    const result = extractLogicalModelToArchiMate(model);
    if (result.success) {
      results.push(result);
    } else {
      errors.push(result);
    }
  });
  
  // Generate combined ArchiMate model
  const combinedModel = generateCombinedArchiMateModel(results);
  
  return {
    success: errors.length === 0,
    extractedCount: results.length,
    errorCount: errors.length,
    individualResults: results,
    errors: errors,
    combinedModel: combinedModel,
    combinedXML: combinedModel ? generateArchiMateXML(combinedModel) : null
  };
};

/**
 * Generate combined ArchiMate model from multiple extractions
 * @param {Array} results - Array of individual extraction results
 * @returns {Object} Combined ArchiMate model
 */
const generateCombinedArchiMateModel = (results) => {
  if (results.length === 0) return null;
  
  const combinedId = generateId();
  const timestamp = new Date().toISOString();
  
  return {
    id: combinedId,
    name: `Combined Logical Models (${results.length} models)`,
    type: 'DataObject',
    documentation: `Combined ArchiMate model containing ${results.length} logical models extracted at ${timestamp}`,
    source: {
      type: 'Multiple FHIR FSH Logical Models',
      modelCount: results.length,
      models: results.map(r => r.sourceModel.name)
    },
    metadata: {
      extractedAt: timestamp,
      totalElements: results.reduce((sum, r) => sum + r.archiMateObject.elements.length, 0),
      sourceModels: results.length
    },
    elements: results.flatMap(r => r.archiMateObject.elements),
    relationships: results.flatMap(r => r.archiMateObject.relationships),
    subModels: results.map(r => r.archiMateObject)
  };
};

/**
 * Download ArchiMate XML as file
 * @param {string} xml - ArchiMate XML content
 * @param {string} fileName - Suggested file name
 */
export const downloadArchiMateXML = (xml, fileName = 'archimate-model.xml') => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate unique ID for ArchiMate elements
 * @returns {string} Unique identifier
 */
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

/**
 * Escape XML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeXml = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export default {
  extractLogicalModelToArchiMate,
  extractMultipleModelsToArchiMate,
  downloadArchiMateXML
};