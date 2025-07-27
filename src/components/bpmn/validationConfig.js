export const requiredFields = {
  'bpmn:Task': ['definition'],
  'bpmn:BusinessRuleTask': ['definition'],
  'bpmn:UserTask': ['definition'],
  'bpmn:Lane': ['definition']
};

export function getRequiredFields(type) {
  return requiredFields[type] || [];
}

export function validateRequiredFields(element) {
  const type = element.type;
  const required = getRequiredFields(type);
  const docs = element.businessObject.documentation || [];

  const values = {};
  docs.forEach(doc => {
    if (doc.text.startsWith('Definition:')) {
      values.definition = doc.text.slice('Definition: '.length);
    }
  });

  const missing = required.filter(key => !values[key]);
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
}

export function validateId(id, elementType) {
  if (!id) {
    return {
      isValid: false,
      error: 'ID is required'
    };
  }

  // Must consist of only alphanumeric characters and periods
  if (!/^[a-zA-Z0-9.]+$/.test(id)) {
    return {
      isValid: false,
      error: 'ID must consist of only alphanumeric characters and periods'
    };
  }

  // Must start with a letter
  if (!/^[a-zA-Z]/.test(id)) {
    return {
      isValid: false,
      error: 'ID must start with a letter'
    };
  }

  // Must not end in a period
  if (id.endsWith('.')) {
    return {
      isValid: false,
      error: 'ID must not end in a period'
    };
  }

  // Must be 55 characters or less
  if (id.length > 55) {
    return {
      isValid: false,
      error: 'ID must be 55 characters or less'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

export function validateName(name, elementType) {
  if (!name) {
    return {
      isValid: false,
      error: 'Name is required'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

export function validateElement(element) {
  const type = element.type;
  const businessObject = element.businessObject;
  
  // Check required fields
  const requiredValidation = validateRequiredFields(element);
  
  // Check ID validation for specific element types
  const needsIdValidation = [
    'bpmn:Task', 
    'bpmn:UserTask', 
    'bpmn:BusinessRuleTask', 
    'bpmn:Lane'
  ].includes(type);
  
  let idValidation = { isValid: true, error: null };
  let nameValidation = { isValid: true, error: null };
  
  if (needsIdValidation) {
    idValidation = validateId(businessObject.id, type);
    nameValidation = validateName(businessObject.name, type);
  }

  return {
    isValid: requiredValidation.isValid && idValidation.isValid && nameValidation.isValid,
    missingFields: requiredValidation.missingFields,
    idError: idValidation.error,
    nameError: nameValidation.error
  };
}