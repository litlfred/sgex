/**
 * Custom properties provider for BPMN elements
 * Adds Requirements and FHIR Definition fields to the properties panel
 * Follows the specification in issue #159
 */
function CustomPropertiesProvider(propertiesPanel, elementRegistry, translate, eventBus) {
  this._propertiesPanel = propertiesPanel;
  this._elementRegistry = elementRegistry;
  this._translate = translate;
  this._eventBus = eventBus;

  propertiesPanel.registerProvider(500, this);
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'elementRegistry', 'translate', 'eventBus'];

CustomPropertiesProvider.prototype.getTabs = function(element) {
  const translate = this._translate;
  const eventBus = this._eventBus;

  return [{
    id: 'custom',
    label: translate('Custom Properties'),
    groups: [{
      id: 'customProps',
      label: translate('WHO SMART Guidelines Fields'),
      entries: [
        {
          id: 'requirements',
          label: translate('Requirements'),
          modelProperty: 'requirements',
          get: function(element) {
            return { requirements: getDocumentation(element, 'Requirements:') };
          },
          set: function(element, values) {
            const result = setDocumentation(element, 'Requirements:', values.requirements);
            // Trigger validation update
            eventBus.fire('element.changed', { element });
            return result;
          },
          html: '<input type="text" name="requirements" placeholder="Describe the requirements for this element (required)" />',
          validate: function(element, values) {
            const requirements = values.requirements;
            if (!requirements || requirements.trim() === '') {
              return { requirements: 'Requirements field is mandatory for all BPMN elements' };
            }
            return {};
          }
        },
        {
          id: 'fhirDefinition',
          label: translate('FHIR Definition (URL)'),
          modelProperty: 'fhirDefinition',
          get: function(element) {
            return { fhirDefinition: getDocumentation(element, 'FHIR Definition:') };
          },
          set: function(element, values) {
            const result = setDocumentation(element, 'FHIR Definition:', values.fhirDefinition);
            // Trigger validation update
            eventBus.fire('element.changed', { element });
            return result;
          },
          html: '<input type="url" name="fhirDefinition" placeholder="https://hl7.org/fhir/..." />',
          validate: function(element, values) {
            const fhirDefinition = values.fhirDefinition;
            if (fhirDefinition && fhirDefinition.trim() !== '') {
              const urlPattern = /^https?:\/\/.+/;
              if (!urlPattern.test(fhirDefinition)) {
                return { fhirDefinition: 'FHIR Definition must be a valid URL starting with http:// or https://' };
              }
            }
            return {};
          }
        }
      ]
    }]
  }];
};

/**
 * Get documentation value for a specific key prefix
 */
function getDocumentation(element, keyPrefix) {
  const docs = element.businessObject.documentation || [];
  const entry = docs.find(d => d.text && d.text.startsWith(keyPrefix));
  return entry ? entry.text.replace(`${keyPrefix} `, '') : '';
}

/**
 * Set documentation value for a specific key prefix
 */
function setDocumentation(element, keyPrefix, newVal) {
  const docs = element.businessObject.documentation || [];
  const existingDocIndex = docs.findIndex(d => d.text && d.text.startsWith(keyPrefix));
  
  if (newVal && newVal.trim() !== '') {
    const docText = `${keyPrefix} ${newVal}`;
    
    if (existingDocIndex !== -1) {
      // Update existing documentation
      docs[existingDocIndex].text = docText;
    } else {
      // Create new documentation entry
      const newDoc = element.businessObject.$model.create('bpmn:Documentation', {
        text: docText
      });
      docs.push(newDoc);
    }
  } else {
    // Remove documentation if value is empty
    if (existingDocIndex !== -1) {
      docs.splice(existingDocIndex, 1);
    }
  }
  
  element.businessObject.documentation = docs;
  return element;
}

const customPropertiesProviderModule = {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', CustomPropertiesProvider]
};

export default customPropertiesProviderModule;