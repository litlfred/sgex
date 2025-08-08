/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';
import { NzFormNoStatusService, NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NgClassInterface, NzSizeLDSType, NzStatus, NzValidateStatus, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/space";
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
export declare class NzInputNumberLegacyComponent implements ControlValueAccessor, AfterViewInit, OnChanges, OnInit, OnDestroy {
    private ngZone;
    private elementRef;
    private cdr;
    private focusMonitor;
    private renderer;
    private directionality;
    private destroy$;
    displayValue?: string | number;
    isFocused: boolean;
    disabled$: Subject<boolean>;
    disabledUp: boolean;
    disabledDown: boolean;
    dir: Direction;
    prefixCls: string;
    status: NzValidateStatus;
    statusCls: NgClassInterface;
    hasFeedback: boolean;
    onChange: OnChangeType;
    onTouched: OnTouchedType;
    readonly nzBlur: EventEmitter<any>;
    readonly nzFocus: EventEmitter<any>;
    /** The native `<span class="ant-input-number-handler-up"></span>` element. */
    upHandler: ElementRef<HTMLElement>;
    /** The native `<span class="ant-input-number-handler-down"></span>` element. */
    downHandler: ElementRef<HTMLElement>;
    /** The native `<input class="ant-input-number-input" />` element. */
    inputElement: ElementRef<HTMLInputElement>;
    nzSize: NzSizeLDSType;
    nzMin: number;
    nzMax: number;
    nzParser: (value: string) => string;
    nzPrecision?: number;
    nzPrecisionMode: 'cut' | 'toFixed' | ((value: number | string, precision?: number) => number);
    nzPlaceHolder: string;
    nzStatus: NzStatus;
    nzStep: number;
    nzInputMode: string;
    nzId: string | null;
    nzDisabled: boolean;
    nzReadOnly: boolean;
    nzAutoFocus: boolean;
    nzBorderless: boolean;
    nzFormatter: (value: number) => string | number;
    protected finalSize: import("@angular/core").Signal<NzSizeLDSType>;
    private size;
    private compactSize;
    private autoStepTimer?;
    private parsedValue?;
    private value?;
    private isNzDisableFirstChange;
    onModelChange(value: string): void;
    getCurrentValidValue(value: string | number): number;
    isNotCompleteNumber(num: string | number): boolean;
    getValidValue(value?: string | number): string | number | undefined;
    toNumber(num: string | number): number;
    getRatio(e: KeyboardEvent): number;
    down(e: MouseEvent | KeyboardEvent, ratio?: number): void;
    up(e: MouseEvent | KeyboardEvent, ratio?: number): void;
    getPrecision(value: number): number;
    getMaxPrecision(currentValue: string | number, ratio: number): number;
    getPrecisionFactor(currentValue: string | number, ratio: number): number;
    upStep(val: string | number, rat: number): number;
    downStep(val: string | number, rat: number): number;
    step<T extends keyof NzInputNumberLegacyComponent>(type: T, e: MouseEvent | KeyboardEvent, ratio?: number): void;
    stop(): void;
    setValue(value: number): void;
    updateDisplayValue(value: number): void;
    writeValue(value: number): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    setDisabledState(disabled: boolean): void;
    focus(): void;
    blur(): void;
    nzFormStatusService: NzFormStatusService | null;
    nzFormNoStatusService: NzFormNoStatusService | null;
    constructor(ngZone: NgZone, elementRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, focusMonitor: FocusMonitor, renderer: Renderer2, directionality: Directionality, destroy$: NzDestroyService);
    ngOnInit(): void;
    ngOnChanges({ nzStatus, nzDisabled, nzFormatter, nzSize }: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private setupHandlersListeners;
    private setStatusStyles;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzInputNumberLegacyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzInputNumberLegacyComponent, "nz-input-number", ["nzInputNumber"], { "nzSize": { "alias": "nzSize"; "required": false; }; "nzMin": { "alias": "nzMin"; "required": false; }; "nzMax": { "alias": "nzMax"; "required": false; }; "nzParser": { "alias": "nzParser"; "required": false; }; "nzPrecision": { "alias": "nzPrecision"; "required": false; }; "nzPrecisionMode": { "alias": "nzPrecisionMode"; "required": false; }; "nzPlaceHolder": { "alias": "nzPlaceHolder"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzStep": { "alias": "nzStep"; "required": false; }; "nzInputMode": { "alias": "nzInputMode"; "required": false; }; "nzId": { "alias": "nzId"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzReadOnly": { "alias": "nzReadOnly"; "required": false; }; "nzAutoFocus": { "alias": "nzAutoFocus"; "required": false; }; "nzBorderless": { "alias": "nzBorderless"; "required": false; }; "nzFormatter": { "alias": "nzFormatter"; "required": false; }; }, { "nzBlur": "nzBlur"; "nzFocus": "nzFocus"; }, never, never, true, [{ directive: typeof i1.NzSpaceCompactItemDirective; inputs: {}; outputs: {}; }]>;
    static ngAcceptInputType_nzMin: unknown;
    static ngAcceptInputType_nzMax: unknown;
    static ngAcceptInputType_nzStep: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzReadOnly: unknown;
    static ngAcceptInputType_nzAutoFocus: unknown;
    static ngAcceptInputType_nzBorderless: unknown;
}
