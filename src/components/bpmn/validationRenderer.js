import { validateElement } from './validationConfig';

function ValidationRenderer(eventBus, elementRegistry) {
  eventBus.on('render.shape', 1500, ({ element, gfx }) => {
    this.validateElement(element, gfx);
  });

  eventBus.on('element.changed', ({ element }) => {
    const gfx = elementRegistry.getGraphics(element);
    if (gfx) this.validateElement(element, gfx);
  });

  this.validateElement = (element, gfx) => {
    const validation = validateElement(element);
    const visual = gfx.querySelector('.djs-visual > *');
    if (!visual) return;

    // Reset styles first
    visual.style.stroke = '';
    visual.style.strokeWidth = '';

    if (!validation.isValid) {
      visual.style.stroke = '#8B0000';
      visual.style.strokeWidth = '3px';
    } else {
      // Only apply green outline to elements that have validation rules
      const hasValidationRules = [
        'bpmn:Task', 
        'bpmn:UserTask', 
        'bpmn:BusinessRuleTask', 
        'bpmn:Lane'
      ].includes(element.type);
      
      if (hasValidationRules) {
        visual.style.stroke = '#006400';
        visual.style.strokeWidth = '3px';
      }
    }
  };
}

ValidationRenderer.$inject = ['eventBus', 'elementRegistry'];

const validationRendererModule = {
  __init__: ['validationRenderer'],
  validationRenderer: ['type', ValidationRenderer]
};

export default validationRendererModule;