/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Color } from '../interfaces/color';
import { HsbaColorType } from '../interfaces/type';
import * as i0 from "@angular/core";
export declare class GradientComponent implements OnInit, OnChanges {
    colors: Color[] | string[];
    direction: string;
    type: HsbaColorType;
    gradientColors: string;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    useMemo(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GradientComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GradientComponent, "color-gradient", never, { "colors": { "alias": "colors"; "required": false; }; "direction": { "alias": "direction"; "required": false; }; "type": { "alias": "type"; "required": false; }; }, {}, never, ["*"], true, never>;
}
