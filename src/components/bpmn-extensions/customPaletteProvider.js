/**
 * Custom palette provider that adds a Business Decision Task to the BPMN palette
 * Follows the specification in issue #159
 */
function CustomPaletteProvider(palette, create, elementFactory, spaceTool, lassoTool, translate) {
  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._translate = translate;

  palette.registerProvider(this);
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'translate'
];

CustomPaletteProvider.prototype.getPaletteEntries = function(element) {
  const {
    _create: create,
    _elementFactory: elementFactory,
    _translate: translate
  } = this;

  function createTask() {
    return function(event) {
      const shape = elementFactory.createShape({
        type: 'bpmn:BusinessRuleTask',
        businessObject: { 
          $attrs: { 'custom:isDecisionTask': true }
        }
      });
      create.start(event, shape);
    };
  }

  return {
    'create.business-decision-task': {
      group: 'activity',
      className: 'bpmn-icon-business-rule',
      title: translate('Business Decision Task'),
      action: {
        dragstart: createTask(),
        click: createTask()
      }
    }
  };
};

const customPaletteModule = {
  __init__: ['customPaletteProvider'],
  customPaletteProvider: ['type', CustomPaletteProvider]
};

export default customPaletteModule;