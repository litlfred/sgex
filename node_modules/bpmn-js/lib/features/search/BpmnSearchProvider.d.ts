/**
 * Provides ability to search for BPMN elements.
 *
 * @implements {SearchPadProvider}
 *
 */
export default class BpmnSearchProvider implements SearchPadProvider {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param searchPad
   * @param canvas
   * @param search
   */
  constructor(elementRegistry: ElementRegistry, searchPad: SearchPad, canvas: Canvas, search: Search);

  /**
   * @param pattern
   *
   * @return
   */
  find(pattern: string): SearchPadResult[];
}

type Canvas = import("diagram-js/lib/core/Canvas").default;
type ElementRegistry = import("diagram-js/lib/core/ElementRegistry").default;
type SearchPad = import("diagram-js/lib/features/search-pad/SearchPad").default;
type SearchPadProvider = import("diagram-js/lib/features/search-pad/SearchPadProvider").default;
type SearchPadResult = import("diagram-js/lib/features/search-pad/SearchPadProvider").SearchResult;
type SearchPadToken = import("diagram-js/lib/features/search-pad/SearchPadProvider").Token;
export type Search = typeof import("diagram-js/lib/features/search/search").default;
export type SearchResult = any;
type SearchToken = import("diagram-js/lib/features/search/search").Token;
