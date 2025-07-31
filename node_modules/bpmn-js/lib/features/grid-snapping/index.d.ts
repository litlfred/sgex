declare namespace _default {
    let __depends__: ({
        gridSnapping: (string | typeof import("diagram-js/lib/features/grid-snapping/GridSnapping").default)[];
    } | {
      gridSnappingAutoPlaceBehavior: (string | typeof import("./behavior/GridSnappingAutoPlaceBehavior").default)[];
      gridSnappingParticipantBehavior: (string | typeof import("./behavior/GridSnappingParticipantBehavior").default)[];
      gridSnappingLayoutConnectionBehavior: (string | typeof import("./behavior/GridSnappingLayoutConnectionBehavior").default)[];
    })[];
    let __init__: string[];
    let bpmnGridSnapping: (string | typeof BpmnGridSnapping)[];
}
export default _default;
import BpmnGridSnapping from './BpmnGridSnapping';
