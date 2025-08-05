declare namespace _default {
    let __depends__: ({
        popupMenu: (string | typeof import("diagram-js/lib/features/popup-menu/PopupMenu").default)[];
    } | {
      bpmnReplace: (string | typeof import("../replace/BpmnReplace").default)[];
    } | {
      bpmnAutoPlace: (string | typeof import("../auto-place/BpmnAutoPlace").default)[];
    })[];
    let __init__: string[];
    let replaceMenuProvider: (string | typeof ReplaceMenuProvider)[];
}
export default _default;
import ReplaceMenuProvider from './ReplaceMenuProvider';
