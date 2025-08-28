import { validateRequiredFields } from './validationConfig';

/**
 * Validation renderer that provides visual feedback for BPMN elements
 * Shows red outline for invalid elements, green for valid elements
 * Follows the specification in issue #159
 */
function ValidationRenderer(eventBus, elementRegistry, canvas) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;

  // Listen for render events to apply validation styling
  eventBus.on('render.shape', 1500, (context) => {
    const { element, gfx } = context;
    this.validateElement(element, gfx);
  });

  // Listen for element changes to update validation
  eventBus.on('element.changed', (context) => {
    const { element } = context;
    const gfx = elementRegistry.getGraphics(element);
    if (gfx) {
      this.validateElement(element, gfx);
    }
  });

  // Listen for commandStack changes to update validation
  eventBus.on('commandStack.changed', () => {
    this.validateAllElements();
  });
}

ValidationRenderer.$inject = ['eventBus', 'elementRegistry', 'canvas'];

/**
 * Validate a single element and apply visual styling
 */
ValidationRenderer.prototype.validateElement = function(element, gfx) {
  if (!element || !gfx) return;

  const validation = validateRequiredFields(element);
  const visual = gfx.querySelector('.djs-visual > *');
  
  if (!visual) return;

  // Remove existing validation classes
  visual.classList.remove('sgex-validation-valid', 'sgex-validation-invalid', 'sgex-validation-warning');

  if (validation.errors.length > 0 || !validation.isValid) {
    // Invalid: red outline
    visual.style.stroke = '#DC2626'; // red-600
    visual.style.strokeWidth = '3px';
    visual.style.strokeDasharray = '';
    visual.classList.add('sgex-validation-invalid');
    
    // Add tooltip with error information
    this.addValidationTooltip(element, gfx, validation);
  } else if (validation.warnings.length > 0) {
    // Warning: orange outline
    visual.style.stroke = '#F59E0B'; // amber-500
    visual.style.strokeWidth = '3px';
    visual.style.strokeDasharray = '5,5';
    visual.classList.add('sgex-validation-warning');
    
    this.addValidationTooltip(element, gfx, validation);
  } else {
    // Valid: green outline
    visual.style.stroke = '#16A34A'; // green-600
    visual.style.strokeWidth = '3px';
    visual.style.strokeDasharray = '';
    visual.classList.add('sgex-validation-valid');
    
    // Remove any existing tooltip
    this.removeValidationTooltip(gfx);
  }
};

/**
 * Validate all elements in the diagram
 */
ValidationRenderer.prototype.validateAllElements = function() {
  const elementRegistry = this._elementRegistry;
  const elements = elementRegistry.getAll();
  
  elements.forEach(element => {
    const gfx = elementRegistry.getGraphics(element);
    if (gfx && element.type && element.type.startsWith('bpmn:')) {
      this.validateElement(element, gfx);
    }
  });
};

/**
 * Add validation tooltip to element
 */
ValidationRenderer.prototype.addValidationTooltip = function(element, gfx, validation) {
  // Remove existing tooltip
  this.removeValidationTooltip(gfx);
  
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    return;
  }

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'sgex-validation-tooltip';
  tooltip.innerHTML = `
    <div class="sgex-validation-tooltip-content">
      <strong>Validation Issues:</strong>
      ${validation.errors.map(error => `<div class="error">• ${error}</div>`).join('')}
      ${validation.warnings.map(warning => `<div class="warning">• ${warning}</div>`).join('')}
    </div>
  `;
  
  // Position tooltip
  const bbox = element.businessObject.di?.bounds;
  if (bbox) {
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${bbox.x + bbox.width + 10}px`;
    tooltip.style.top = `${bbox.y}px`;
    tooltip.style.zIndex = '1000';
  }
  
  // Add to canvas container
  const canvas = this._canvas.getContainer();
  canvas.appendChild(tooltip);
  
  // Store reference for cleanup
  gfx._validationTooltip = tooltip;
};

/**
 * Remove validation tooltip from element
 */
ValidationRenderer.prototype.removeValidationTooltip = function(gfx) {
  if (gfx._validationTooltip) {
    gfx._validationTooltip.remove();
    delete gfx._validationTooltip;
  }
};

/**
 * Get validation summary for the entire diagram
 */
ValidationRenderer.prototype.getValidationSummary = function() {
  const elementRegistry = this._elementRegistry;
  const elements = elementRegistry.getAll();
  
  let totalElements = 0;
  let validElements = 0;
  let invalidElements = 0;
  let warningElements = 0;
  const allIssues = [];
  
  elements.forEach(element => {
    if (element.type && element.type.startsWith('bpmn:')) {
      totalElements++;
      const validation = validateRequiredFields(element);
      
      if (validation.errors.length > 0 || !validation.isValid) {
        invalidElements++;
        allIssues.push({
          element: element.id || 'Unknown',
          type: 'error',
          issues: validation.errors
        });
      } else if (validation.warnings.length > 0) {
        warningElements++;
        allIssues.push({
          element: element.id || 'Unknown',
          type: 'warning',
          issues: validation.warnings
        });
      } else {
        validElements++;
      }
    }
  });
  
  return {
    totalElements,
    validElements,
    invalidElements,
    warningElements,
    allIssues,
    isValid: invalidElements === 0
  };
};

const validationRendererModule = {
  __init__: ['validationRenderer'],
  validationRenderer: ['type', ValidationRenderer]
};

export default validationRendererModule;