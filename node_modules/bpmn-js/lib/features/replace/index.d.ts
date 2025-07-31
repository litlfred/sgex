declare namespace _default {
    let __depends__: ({
        selection: (string | typeof import("diagram-js/lib/features/selection/Selection").default)[];
        selectionVisuals: (string | typeof import("diagram-js/lib/features/selection/SelectionVisuals").default)[];
        selectionBehavior: (string | typeof import("diagram-js/lib/features/selection/SelectionBehavior").default)[];
    } | {
        replaceSelectionBehavior: (string | typeof import("diagram-js/lib/features/replace/ReplaceSelectionBehavior").default)[];
        replace: (string | typeof import("diagram-js/lib/features/replace/Replace").default)[];
    } | {
      bpmnCopyPaste: (string | typeof import("../copy-paste/BpmnCopyPaste").default)[];
      moddleCopy: (string | typeof import("../copy-paste/ModdleCopy").default)[];
    })[];
    let bpmnReplace: (string | typeof BpmnReplace)[];
}
export default _default;
import BpmnReplace from './BpmnReplace';
