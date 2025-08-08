/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzSafeAny, NzSizeLDSType, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import { NzRadioService } from './radio.service';
import * as i0 from "@angular/core";
export type NzRadioButtonStyle = 'outline' | 'solid';
export declare class NzRadioGroupComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {
    private cdr;
    private nzRadioService;
    private directionality;
    private value;
    private destroy$;
    private isNzDisableFirstChange;
    onChange: OnChangeType;
    onTouched: OnTouchedType;
    nzDisabled: boolean;
    nzButtonStyle: NzRadioButtonStyle;
    nzSize: NzSizeLDSType;
    nzName: string | null;
    dir: Direction;
    constructor(cdr: ChangeDetectorRef, nzRadioService: NzRadioService, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    writeValue(value: NzSafeAny): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    setDisabledState(isDisabled: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzRadioGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzRadioGroupComponent, "nz-radio-group", ["nzRadioGroup"], { "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzButtonStyle": { "alias": "nzButtonStyle"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzName": { "alias": "nzName"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzDisabled: unknown;
}
