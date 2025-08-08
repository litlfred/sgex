/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, EventEmitter, NgZone, OnChanges, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { BooleanInput, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { NzStepComponent } from './step.component';
import * as i0 from "@angular/core";
export type NzDirectionType = 'horizontal' | 'vertical';
export type NzStatusType = 'wait' | 'process' | 'finish' | 'error';
export type NzProgressDotTemplate = TemplateRef<{
    $implicit: TemplateRef<void>;
    status: string;
    index: number;
}>;
export declare class NzStepsComponent implements OnChanges, OnInit, AfterContentInit {
    private ngZone;
    private cdr;
    private directionality;
    private destroy$;
    static ngAcceptInputType_nzProgressDot: BooleanInput | NzProgressDotTemplate | undefined | null;
    steps: QueryList<NzStepComponent>;
    nzCurrent: number;
    nzDirection: NzDirectionType;
    nzLabelPlacement: 'horizontal' | 'vertical';
    nzType: 'default' | 'navigation';
    nzSize: NzSizeDSType;
    nzStartIndex: number;
    nzStatus: NzStatusType;
    set nzProgressDot(value: boolean | NzProgressDotTemplate | undefined | null);
    readonly nzIndexChange: EventEmitter<number>;
    private indexChangeSubscription;
    showProcessDot: boolean;
    showProgress: boolean;
    customProcessDotTemplate?: TemplateRef<{
        $implicit: TemplateRef<void>;
        status: string;
        index: number;
    }>;
    dir: Direction;
    constructor(ngZone: NgZone, cdr: ChangeDetectorRef, directionality: Directionality, destroy$: NzDestroyService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngAfterContentInit(): void;
    private updateHostProgressClass;
    private updateChildrenSteps;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzStepsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzStepsComponent, "nz-steps", ["nzSteps"], { "nzCurrent": { "alias": "nzCurrent"; "required": false; }; "nzDirection": { "alias": "nzDirection"; "required": false; }; "nzLabelPlacement": { "alias": "nzLabelPlacement"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzStartIndex": { "alias": "nzStartIndex"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzProgressDot": { "alias": "nzProgressDot"; "required": false; }; }, { "nzIndexChange": "nzIndexChange"; }, ["steps"], ["*"], true, never>;
}
