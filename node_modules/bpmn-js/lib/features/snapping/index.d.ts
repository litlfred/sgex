declare namespace _default {
    let __depends__: {
        createMoveSnapping: (string | typeof import("diagram-js/lib/features/snapping/CreateMoveSnapping").default)[];
        resizeSnapping: (string | typeof import("diagram-js/lib/features/snapping/ResizeSnapping").default)[];
        snapping: (string | typeof import("diagram-js/lib/features/snapping/Snapping").default)[];
    }[];
    let __init__: string[];
    let connectSnapping: (string | typeof BpmnConnectSnapping)[];
    let createMoveSnapping: (string | typeof BpmnCreateMoveSnapping)[];
}
export default _default;
import BpmnConnectSnapping from './BpmnConnectSnapping';
import BpmnCreateMoveSnapping from './BpmnCreateMoveSnapping';
