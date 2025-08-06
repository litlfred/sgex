declare namespace _default {
    let __depends__: ({
        complexPreview: (string | typeof import("diagram-js/lib/features/complex-preview/ComplexPreview").default)[];
    } | {
      bpmnAutoPlace: (string | typeof import("../auto-place/BpmnAutoPlace").default)[];
    } | {
      bpmnFactory: (string | typeof import("../modeling/BpmnFactory").default)[];
      bpmnUpdater: (string | typeof import("../modeling/BpmnUpdater").default)[];
      elementFactory: (string | typeof import("../modeling/ElementFactory").default)[];
      modeling: (string | typeof import("../modeling/Modeling").default)[];
      layouter: (string | typeof import("../modeling/BpmnLayouter").default)[];
      connectionDocking: (string | typeof import("diagram-js/lib/layout/CroppingConnectionDocking").default)[];
    })[];
    let __init__: string[];
    let appendPreview: (string | typeof AppendPreview)[];
}
export default _default;
import AppendPreview from './AppendPreview';
