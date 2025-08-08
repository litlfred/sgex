/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, SimpleChanges } from '@angular/core';
import { NzDisplayedStep, NzExtendedMark } from './typings';
import * as i0 from "@angular/core";
export declare class NzSliderStepComponent implements OnChanges {
    lowerBound: number | null;
    upperBound: number | null;
    marksArray: NzExtendedMark[];
    min: number;
    max: number;
    vertical: boolean;
    included: boolean;
    reverse: boolean;
    steps: NzDisplayedStep[];
    ngOnChanges(changes: SimpleChanges): void;
    private buildSteps;
    private togglePointActive;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSliderStepComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSliderStepComponent, "nz-slider-step", ["nzSliderStep"], { "lowerBound": { "alias": "lowerBound"; "required": false; }; "upperBound": { "alias": "upperBound"; "required": false; }; "marksArray": { "alias": "marksArray"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "vertical": { "alias": "vertical"; "required": false; }; "included": { "alias": "included"; "required": false; }; "reverse": { "alias": "reverse"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_min: unknown;
    static ngAcceptInputType_max: unknown;
    static ngAcceptInputType_vertical: unknown;
    static ngAcceptInputType_included: unknown;
    static ngAcceptInputType_reverse: unknown;
}
