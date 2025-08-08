/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { NzColorPickerFormatType } from './typings';
import * as i0 from "@angular/core";
export declare class NzColorFormatComponent implements OnChanges, OnInit, OnDestroy {
    private formBuilder;
    format: NzColorPickerFormatType | null;
    colorValue: string;
    clearColor: boolean;
    nzDisabledAlpha: boolean;
    readonly formatChange: EventEmitter<{
        color: string;
        format: NzColorPickerFormatType;
    }>;
    readonly nzOnFormatChange: EventEmitter<NzColorPickerFormatType>;
    private destroy$;
    validatorFn(): ValidatorFn;
    validateForm: FormGroup<{
        isFormat: FormControl<NzColorPickerFormatType | null>;
        hex: FormControl<string | null>;
        hsbH: FormControl<number>;
        hsbS: FormControl<number>;
        hsbB: FormControl<number>;
        rgbR: FormControl<number>;
        rgbG: FormControl<number>;
        rgbB: FormControl<number>;
        roundA: FormControl<number>;
    }>;
    formatterPercent: (value: number) => string;
    parserPercent: (value: string) => number;
    constructor(formBuilder: FormBuilder);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzColorFormatComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzColorFormatComponent, "nz-color-format", ["NzColorFormat"], { "format": { "alias": "format"; "required": false; }; "colorValue": { "alias": "colorValue"; "required": false; }; "clearColor": { "alias": "clearColor"; "required": false; }; "nzDisabledAlpha": { "alias": "nzDisabledAlpha"; "required": false; }; }, { "formatChange": "formatChange"; "nzOnFormatChange": "nzOnFormatChange"; }, never, never, true, never>;
    static ngAcceptInputType_clearColor: unknown;
    static ngAcceptInputType_nzDisabledAlpha: unknown;
}
