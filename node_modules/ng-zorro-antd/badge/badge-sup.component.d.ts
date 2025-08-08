/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzSafeAny, NzSizeDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzBadgeSupComponent implements OnInit, OnChanges {
    nzOffset?: [number, number];
    nzTitle?: string | null | undefined;
    nzStyle: Record<string, string> | null;
    nzDot: boolean;
    nzOverflowCount: number;
    disableAnimation: boolean;
    nzCount?: number | TemplateRef<NzSafeAny>;
    noAnimation: boolean;
    nzSize: NzSizeDSType;
    maxNumberArray: string[];
    countArray: number[];
    count: number;
    countSingleArray: number[];
    generateMaxNumberArray(): void;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzBadgeSupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzBadgeSupComponent, "nz-badge-sup", ["nzBadgeSup"], { "nzOffset": { "alias": "nzOffset"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzStyle": { "alias": "nzStyle"; "required": false; }; "nzDot": { "alias": "nzDot"; "required": false; }; "nzOverflowCount": { "alias": "nzOverflowCount"; "required": false; }; "disableAnimation": { "alias": "disableAnimation"; "required": false; }; "nzCount": { "alias": "nzCount"; "required": false; }; "noAnimation": { "alias": "noAnimation"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzOverflowCount: unknown;
}
