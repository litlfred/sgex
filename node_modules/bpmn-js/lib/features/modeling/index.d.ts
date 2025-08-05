declare namespace _default {
    let __init__: string[];
    let __depends__: (import("didi").ModuleDeclaration | {
        changeSupport: (string | typeof import("diagram-js/lib/features/change-support/ChangeSupport").default)[];
    } | {
        selection: (string | typeof import("diagram-js/lib/features/selection/Selection").default)[];
        selectionVisuals: (string | typeof import("diagram-js/lib/features/selection/SelectionVisuals").default)[];
        selectionBehavior: (string | typeof import("diagram-js/lib/features/selection/SelectionBehavior").default)[];
    } | {
        commandStack: (string | typeof import("diagram-js/lib/command/CommandStack").default)[];
    } | {
        labelSupport: (string | typeof import("diagram-js/lib/features/label-support/LabelSupport").default)[];
    } | {
        attachSupport: (string | typeof import("diagram-js/lib/features/attach-support/AttachSupport").default)[];
    } | {
      bpmnRules: (string | typeof import("../rules/BpmnRules").default)[];
    } | {
      bpmnDiOrdering: (string | typeof import("../di-ordering/BpmnDiOrdering").default)[];
    } | {
      bpmnOrderingProvider: (string | typeof import("../ordering/BpmnOrderingProvider").default)[];
    } | {
      bpmnReplace: (string | typeof import("../replace/BpmnReplace").default)[];
    } | {
      spaceTool: (string | typeof import("../space-tool/BpmnSpaceTool").default)[];
    })[];
    let bpmnFactory: (string | typeof BpmnFactory)[];
    let bpmnUpdater: (string | typeof BpmnUpdater)[];
    let elementFactory: (string | typeof ElementFactory)[];
    let modeling: (string | typeof Modeling)[];
    let layouter: (string | typeof BpmnLayouter)[];
    let connectionDocking: (string | typeof CroppingConnectionDocking)[];
}
export default _default;
import BpmnFactory from './BpmnFactory';
import BpmnUpdater from './BpmnUpdater';
import ElementFactory from './ElementFactory';
import Modeling from './Modeling';
import BpmnLayouter from './BpmnLayouter';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';
