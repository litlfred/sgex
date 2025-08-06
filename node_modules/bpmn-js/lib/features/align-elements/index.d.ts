declare namespace _default {
    let __depends__: ({
        alignElements: (string | typeof import("diagram-js/lib/features/align-elements/AlignElements").default)[];
    } | {
        contextPad: (string | typeof import("diagram-js/lib/features/context-pad/ContextPad").default)[];
    } | {
        popupMenu: (string | typeof import("diagram-js/lib/features/popup-menu/PopupMenu").default)[];
    })[];
    let __init__: string[];
    let alignElementsContextPadProvider: (string | typeof AlignElementsContextPadProvider)[];
    let alignElementsMenuProvider: (string | typeof AlignElementsMenuProvider)[];
    let bpmnAlignElements: (string | typeof BpmnAlignElements)[];
}
export default _default;
import AlignElementsContextPadProvider from './AlignElementsContextPadProvider';
import AlignElementsMenuProvider from './AlignElementsMenuProvider';
import BpmnAlignElements from './BpmnAlignElements';
