export default class BpmnSpaceTool extends SpaceTool {
  /**
   * @param injector
   * @param canvas
   */
  constructor(injector: Injector, canvas: Canvas);

  /**
   * @param elements
   * @param axis
   * @param delta
   * @param start
   *
   * @return
   */
  calculateAdjustments(elements: Shape[], axis: Axis, delta: Point, start: number): any;
}

type Injector = import("didi").Injector;
type Canvas = import("diagram-js/lib/core/Canvas").default;
type Shape = import("../../model/Types").Shape;
type Axis = import("diagram-js/lib/util/Types").Axis;
type Point = import("diagram-js/lib/util/Types").Point;
import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';
