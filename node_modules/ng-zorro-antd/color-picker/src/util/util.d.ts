/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Color } from '../interfaces/color';
import type { ColorGenInput, HsbaColorType, TransformOffset } from '../interfaces/type';
export declare const generateColor: (color: ColorGenInput) => Color;
export declare const defaultColor: Color;
export declare function calculateColor(offset: TransformOffset, containerRef: HTMLDivElement, targetRef: HTMLDivElement, color?: Color | null, type?: HsbaColorType): Color;
export declare const calculateOffset: (containerRef: HTMLDivElement, targetRef: HTMLDivElement, color?: Color | null, type?: HsbaColorType) => TransformOffset | null;
