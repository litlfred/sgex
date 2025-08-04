declare namespace _default {
    let __depends__: {
        keyboard: (string | typeof import("diagram-js/lib/features/keyboard/Keyboard").default)[];
        keyboardBindings: (string | typeof import("diagram-js/lib/features/keyboard/KeyboardBindings").default)[];
    }[];
    let __init__: string[];
    let keyboardBindings: (string | typeof BpmnKeyboardBindings)[];
}
export default _default;
import BpmnKeyboardBindings from './BpmnKeyboardBindings';
