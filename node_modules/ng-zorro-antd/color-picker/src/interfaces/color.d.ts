/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Numberify, TinyColor } from '@ctrl/tinycolor';
import type { ColorGenInput, HSBA } from './type';
export declare const getRoundNumber: (value: number) => number;
export declare class Color extends TinyColor {
    constructor(color: ColorGenInput);
    toHsbString(): string;
    toHsb(): Numberify<HSBA>;
}
