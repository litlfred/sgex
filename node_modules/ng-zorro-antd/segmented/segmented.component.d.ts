/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AnimationEvent } from '@angular/animations';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ThumbAnimationProps } from 'ng-zorro-antd/core/animation';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSizeLDSType, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import { NzSegmentedOption, NzSegmentedOptions } from './types';
import * as i0 from "@angular/core";
export declare class NzSegmentedComponent implements OnChanges, ControlValueAccessor {
    readonly nzConfigService: NzConfigService;
    private readonly cdr;
    private readonly directionality;
    readonly _nzModuleName: NzConfigKey;
    nzBlock: boolean;
    nzDisabled: boolean;
    nzOptions: NzSegmentedOptions;
    nzSize: NzSizeLDSType;
    readonly nzValueChange: EventEmitter<string | number>;
    private viewItemCmps;
    private contentItemCmps;
    protected dir: Direction;
    protected value?: number | string;
    protected animationState: null | {
        value: string;
        params: ThumbAnimationProps;
    };
    protected normalizedOptions: NzSegmentedOption[];
    protected onChange: OnChangeType;
    protected onTouched: OnTouchedType;
    private readonly service;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnChanges(changes: SimpleChanges): void;
    handleThumbAnimationDone(event: AnimationEvent): void;
    writeValue(value: number | string): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSegmentedComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSegmentedComponent, "nz-segmented", ["nzSegmented"], { "nzBlock": { "alias": "nzBlock"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzOptions": { "alias": "nzOptions"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, { "nzValueChange": "nzValueChange"; }, ["contentItemCmps"], ["*"], true, never>;
    static ngAcceptInputType_nzBlock: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
}
