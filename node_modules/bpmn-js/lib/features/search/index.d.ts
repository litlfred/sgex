declare namespace _default {
    let __depends__: ({
        searchPad: (string | typeof import("diagram-js/lib/features/search-pad/SearchPad").default)[];
    } | {
        search: (string | typeof import("diagram-js/lib/features/search/search").default)[];
    })[];
    let __init__: string[];
    let bpmnSearch: (string | typeof BpmnSearchProvider)[];
}
export default _default;
import BpmnSearchProvider from './BpmnSearchProvider';
