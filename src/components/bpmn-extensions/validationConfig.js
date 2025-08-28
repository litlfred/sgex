/**
 * Validation configuration for BPMN elements
 * Defines required fields and validation rules as specified in issue #159
 */

export const requiredFields = {
  'bpmn:Task': ['name', 'id', 'requirements'],
  'bpmn:UserTask': ['name', 'id', 'requirements'],
  'bpmn:BusinessRuleTask': ['name', 'id', 'requirements'],
  'bpmn:Lane': ['name', 'id', 'requirements'],
  'bpmn:ServiceTask': ['name', 'id', 'requirements'],
  'bpmn:ScriptTask': ['name', 'id', 'requirements'],
  'bpmn:SendTask': ['name', 'id', 'requirements'],
  'bpmn:ReceiveTask': ['name', 'id', 'requirements'],
  'bpmn:ManualTask': ['name', 'id', 'requirements']
};

/**
 * Get required fields for a specific element type
 */
export function getRequiredFields(type) {
  return requiredFields[type] || [];
}

/**
 * Validate element ID according to WHO SMART Guidelines rules
 */
export function validateElementId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, message: 'ID is required' };
  }

  // Must consist only of alphanumeric characters and periods
  if (!/^[a-zA-Z][a-zA-Z0-9.]*$/.test(id)) {
    return { 
      valid: false, 
      message: 'ID must start with a letter and contain only alphanumeric characters and periods' 
    };
  }

  // Must not end with a period
  if (id.endsWith('.')) {
    return { valid: false, message: 'ID must not end with a period' };
  }

  // Must not exceed 55 characters
  if (id.length > 55) {
    return { valid: false, message: 'ID must not exceed 55 characters' };
  }

  return { valid: true };
}

/**
 * Validate element name
 */
export function validateElementName(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { valid: false, message: 'Name is required and cannot be empty' };
  }
  return { valid: true };
}

/**
 * Get documentation value for a specific key prefix
 */
function getDocumentationValue(element, keyPrefix) {
  const docs = element.businessObject.documentation || [];
  const entry = docs.find(d => d.text && d.text.startsWith(keyPrefix));
  return entry ? entry.text.replace(`${keyPrefix} `, '') : '';
}

/**
 * Validate required fields for a BPMN element
 */
export function validateRequiredFields(element) {
  const type = element.type;
  const required = getRequiredFields(type);
  const businessObject = element.businessObject;
  const docs = businessObject.documentation || [];

  const values = {};
  const errors = [];
  const warnings = [];

  // Extract values from business object and documentation
  if (businessObject.name) {
    values.name = businessObject.name;
  }
  if (businessObject.id) {
    values.id = businessObject.id;
  }

  // Extract custom properties from documentation
  docs.forEach(doc => {
    if (doc.text) {
      if (doc.text.startsWith('Requirements:')) {
        values.requirements = doc.text.slice('Requirements: '.length);
      }
      if (doc.text.startsWith('FHIR Definition:')) {
        values.fhirDefinition = doc.text.slice('FHIR Definition: '.length);
      }
    }
  });

  // Validate required fields
  const missing = required.filter(key => !values[key] || values[key].trim() === '');
  
  // Validate ID format
  if (values.id) {
    const idValidation = validateElementId(values.id);
    if (!idValidation.valid) {
      errors.push(`ID: ${idValidation.message}`);
    }
  }

  // Validate name
  if (values.name) {
    const nameValidation = validateElementName(values.name);
    if (!nameValidation.valid) {
      errors.push(`Name: ${nameValidation.message}`);
    }
  }

  // Validate FHIR Definition URL if provided
  if (values.fhirDefinition && values.fhirDefinition.trim() !== '') {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(values.fhirDefinition)) {
      errors.push('FHIR Definition must be a valid URL starting with http:// or https://');
    }
  }

  // Add missing field errors
  missing.forEach(field => {
    errors.push(`Missing required field: ${field}`);
  });

  const isValid = errors.length === 0 && missing.length === 0;
  
  return {
    isValid,
    missingFields: missing,
    errors,
    warnings,
    values
  };
}