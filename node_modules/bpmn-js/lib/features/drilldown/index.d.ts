declare namespace _default {
    let __depends__: ({
        overlays: (string | typeof import("diagram-js/lib/features/overlays/Overlays").default)[];
    } | {
        changeSupport: (string | typeof import("diagram-js/lib/features/change-support/ChangeSupport").default)[];
    } | {
        rootElementsBehavior: (string | typeof import("diagram-js/lib/features/root-elements/RootElementsBehavior").default)[];
    })[];
    let __init__: string[];
    let drilldownBreadcrumbs: (string | typeof DrilldownBreadcrumbs)[];
    let drilldownCentering: (string | typeof DrilldownCentering)[];
    let drilldownOverlayBehavior: (string | typeof DrilldownOverlayBehavior)[];
    let subprocessCompatibility: (string | typeof SubprocessCompatibility)[];
}
export default _default;
import DrilldownBreadcrumbs from './DrilldownBreadcrumbs';
import DrilldownCentering from './DrilldownCentering';
import DrilldownOverlayBehavior from './DrilldownOverlayBehavior';
import SubprocessCompatibility from './SubprocessCompatibility';
