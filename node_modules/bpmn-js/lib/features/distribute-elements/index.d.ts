declare namespace _default {
    let __depends__: ({
        popupMenu: (string | typeof import("diagram-js/lib/features/popup-menu/PopupMenu").default)[];
    } | {
        distributeElements: (string | typeof import("diagram-js/lib/features/distribute-elements/DistributeElements").default)[];
    })[];
    let __init__: string[];
    let bpmnDistributeElements: (string | typeof BpmnDistributeElements)[];
    let distributeElementsMenuProvider: (string | typeof DistributeElementsMenuProvider)[];
}
export default _default;
import BpmnDistributeElements from './BpmnDistributeElements';
import DistributeElementsMenuProvider from './DistributeElementsMenuProvider';
