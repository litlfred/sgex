declare namespace _default {
    let __depends__: {
        copyPaste: (string | typeof import("diagram-js/lib/features/copy-paste/CopyPaste").default)[];
    }[];
    let __init__: string[];
    let bpmnCopyPaste: (string | typeof BpmnCopyPaste)[];
    let moddleCopy: (string | typeof ModdleCopy)[];
}
export default _default;
import BpmnCopyPaste from './BpmnCopyPaste';
import ModdleCopy from './ModdleCopy';
