function CustomPropertiesProvider(eventBus, elementRegistry, translate, modeling) {
  
  // Simple properties display in the console for now
  eventBus.on('element.click', function(event) {
    const element = event.element;
    if (element.businessObject) {
      console.log('Selected element:', element.type, element.businessObject.id || 'no-id');
      console.log('Requirements:', getDocumentation(element, 'Definition:') || 'none');
      console.log('FHIR Definition:', getDocumentation(element, 'FHIR Definition:') || 'none');
    }
  });
  
  // For now, we'll add event listeners for element changes to validate
  eventBus.on('element.changed', function() {
    // This will trigger validation rendering
  });
}

function getDocumentation(element, keyPrefix) {
  const docs = element.businessObject.documentation || [];
  const entry = docs.find(d => d.text && d.text.startsWith(keyPrefix));
  return entry ? entry.text.replace(`${keyPrefix} `, '') : '';
}

CustomPropertiesProvider.$inject = ['eventBus', 'elementRegistry', 'translate', 'modeling'];

const customPropertiesProviderModule = {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', CustomPropertiesProvider]
};

export default customPropertiesProviderModule;