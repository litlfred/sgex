declare namespace _default {
    let __depends__: ({
        translate: (string | typeof import("diagram-js/lib/i18n/translate/translate").default)[];
    } | {
      spaceTool: (string | typeof import("../space-tool/BpmnSpaceTool").default)[];
    } | {
        create: (string | typeof import("diagram-js/lib/features/create/Create").default)[];
        createPreview: (string | typeof import("diagram-js/lib/features/create/CreatePreview").default)[];
    } | {
        palette: (string | typeof import("diagram-js/lib/features/palette/Palette").default)[];
    } | {
        lassoTool: (string | typeof import("diagram-js/lib/features/lasso-tool/LassoTool").default)[];
    } | {
        handTool: (string | typeof import("diagram-js/lib/features/hand-tool/HandTool").default)[];
    } | {
        globalConnect: (string | typeof import("diagram-js/lib/features/global-connect/GlobalConnect").default)[];
    })[];
    let __init__: string[];
    let paletteProvider: (string | typeof PaletteProvider)[];
}
export default _default;
import PaletteProvider from './PaletteProvider';
