declare namespace _default {
    let __depends__: {
        spaceTool: (string | typeof import("diagram-js/lib/features/space-tool/SpaceTool").default)[];
        spaceToolPreview: (string | typeof import("diagram-js/lib/features/space-tool/SpaceToolPreview").default)[];
    }[];
    let spaceTool: (string | typeof BpmnSpaceTool)[];
}
export default _default;
import BpmnSpaceTool from './BpmnSpaceTool';
