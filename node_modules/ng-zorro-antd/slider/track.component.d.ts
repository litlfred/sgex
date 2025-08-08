/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { OnChanges } from '@angular/core';
import * as i0 from "@angular/core";
export interface NzSliderTrackStyle {
    bottom?: string | null;
    height?: string | null;
    left?: string | null;
    right?: string | null;
    width?: string | null;
    visibility?: string;
}
export declare class NzSliderTrackComponent implements OnChanges {
    offset: number;
    reverse: boolean;
    dir: Direction;
    length: number;
    vertical: boolean;
    included: boolean;
    style: NzSliderTrackStyle;
    ngOnChanges(): void;
    private getHorizontalStylePosition;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSliderTrackComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSliderTrackComponent, "nz-slider-track", ["nzSliderTrack"], { "offset": { "alias": "offset"; "required": false; }; "reverse": { "alias": "reverse"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "length": { "alias": "length"; "required": false; }; "vertical": { "alias": "vertical"; "required": false; }; "included": { "alias": "included"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_offset: unknown;
    static ngAcceptInputType_reverse: unknown;
    static ngAcceptInputType_length: unknown;
    static ngAcceptInputType_vertical: unknown;
    static ngAcceptInputType_included: unknown;
}
