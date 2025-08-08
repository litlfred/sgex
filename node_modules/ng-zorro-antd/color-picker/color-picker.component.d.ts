import { ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzSafeAny, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { NzColor, NzColorPickerFormatType, NzColorPickerTriggerType } from './typings';
import * as i0 from "@angular/core";
export declare class NzColorPickerComponent implements OnInit, OnChanges, ControlValueAccessor, OnDestroy {
    private cdr;
    nzFormat: NzColorPickerFormatType | null;
    nzValue: string | NzColor;
    nzSize: NzSizeLDSType;
    nzDefaultValue: string | NzColor;
    nzTrigger: NzColorPickerTriggerType;
    nzTitle: TemplateRef<void> | string;
    nzFlipFlop: TemplateRef<void> | null;
    nzShowText: boolean;
    nzOpen: boolean;
    nzAllowClear: boolean;
    nzDisabled: boolean;
    nzDisabledAlpha: boolean;
    readonly nzOnChange: EventEmitter<{
        color: NzColor;
        format: string;
    }>;
    readonly nzOnFormatChange: EventEmitter<NzColorPickerFormatType>;
    readonly nzOnClear: EventEmitter<boolean>;
    readonly nzOnOpenChange: EventEmitter<boolean>;
    private formBuilder;
    private destroy$;
    private isNzDisableFirstChange;
    blockColor: string;
    clearColor: boolean;
    showText: string;
    constructor(cdr: ChangeDetectorRef);
    formControl: import("@angular/forms").FormControl<string | null>;
    onChange: (value: string) => void;
    writeValue(value: string): void;
    registerOnChange(fn: NzSafeAny): void;
    registerOnTouched(): void;
    setDisabledState(isDisabled: boolean): void;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    clearColorHandle(): void;
    getBlockColor(): void;
    colorChange(value: {
        color: NzColor;
    }): void;
    formatChange(value: {
        color: string;
        format: NzColorPickerFormatType;
    }): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzColorPickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzColorPickerComponent, "nz-color-picker", ["NzColorPicker"], { "nzFormat": { "alias": "nzFormat"; "required": false; }; "nzValue": { "alias": "nzValue"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzDefaultValue": { "alias": "nzDefaultValue"; "required": false; }; "nzTrigger": { "alias": "nzTrigger"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzFlipFlop": { "alias": "nzFlipFlop"; "required": false; }; "nzShowText": { "alias": "nzShowText"; "required": false; }; "nzOpen": { "alias": "nzOpen"; "required": false; }; "nzAllowClear": { "alias": "nzAllowClear"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzDisabledAlpha": { "alias": "nzDisabledAlpha"; "required": false; }; }, { "nzOnChange": "nzOnChange"; "nzOnFormatChange": "nzOnFormatChange"; "nzOnClear": "nzOnClear"; "nzOnOpenChange": "nzOnOpenChange"; }, never, never, true, never>;
    static ngAcceptInputType_nzShowText: unknown;
    static ngAcceptInputType_nzOpen: unknown;
    static ngAcceptInputType_nzAllowClear: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzDisabledAlpha: unknown;
}
