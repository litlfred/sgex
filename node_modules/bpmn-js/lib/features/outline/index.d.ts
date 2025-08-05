declare namespace _default {
    let __depends__: {
        outline: (string | typeof import("diagram-js/lib/features/outline/Outline").default)[];
        multiSelectionOutline: (string | typeof import("diagram-js/lib/features/outline/MultiSelectionOutline").default)[];
    }[];
    let __init__: string[];
    let outlineProvider: (string | typeof OulineProvider)[];
}
export default _default;
import OulineProvider from './OutlineProvider';
