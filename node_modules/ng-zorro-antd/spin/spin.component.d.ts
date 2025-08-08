/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSafeAny, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSpinComponent implements OnChanges, OnDestroy, OnInit {
    nzConfigService: NzConfigService;
    private cdr;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzIndicator: TemplateRef<NzSafeAny> | null;
    nzSize: NzSizeLDSType;
    nzTip: string | null;
    nzDelay: number;
    nzSimple: boolean;
    nzSpinning: boolean;
    private destroy$;
    private spinning$;
    private delay$;
    isLoading: boolean;
    dir: Direction;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSpinComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSpinComponent, "nz-spin", ["nzSpin"], { "nzIndicator": { "alias": "nzIndicator"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzTip": { "alias": "nzTip"; "required": false; }; "nzDelay": { "alias": "nzDelay"; "required": false; }; "nzSimple": { "alias": "nzSimple"; "required": false; }; "nzSpinning": { "alias": "nzSpinning"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzDelay: unknown;
    static ngAcceptInputType_nzSimple: unknown;
    static ngAcceptInputType_nzSpinning: unknown;
}
