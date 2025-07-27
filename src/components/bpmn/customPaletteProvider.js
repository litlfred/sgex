function CustomPaletteProvider(palette, create, elementFactory, translate) {
  this.getPaletteEntries = () => ({
    'create.business-decision-task': {
      group: 'activity',
      className: 'bpmn-icon-business-rule',
      title: translate('Business Decision Task'),
      action: {
        dragstart: (event) => createTask(event),
        click: (event) => createTask(event)
      }
    }
  });

  function createTask(event) {
    const shape = elementFactory.createShape({
      type: 'bpmn:BusinessRuleTask',
      businessObject: elementFactory._bpmnFactory.create('bpmn:BusinessRuleTask', {
        $attrs: { 'custom:isDecisionTask': true }
      })
    });
    create.start(event, shape);
  }
}

CustomPaletteProvider.$inject = ['palette', 'create', 'elementFactory', 'translate'];

const customPaletteModule = {
  __init__: ['customPaletteProvider'],
  customPaletteProvider: ['type', CustomPaletteProvider]
};

export default customPaletteModule;