/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { AfterViewInit, ChangeDetectorRef, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzSafeAny, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzRadioComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, OnInit {
    private ngZone;
    private elementRef;
    private cdr;
    private focusMonitor;
    private isNgModel;
    private destroy$;
    private isNzDisableFirstChange;
    private directionality;
    private nzRadioService;
    nzFormStatusService: NzFormStatusService | null;
    isChecked: boolean;
    name: string | null;
    onChange: OnChangeType;
    onTouched: OnTouchedType;
    inputElement: ElementRef<HTMLInputElement>;
    nzValue: NzSafeAny | null;
    nzDisabled: boolean;
    nzAutoFocus: boolean;
    isRadioButton: boolean;
    dir: Direction;
    focus(): void;
    blur(): void;
    constructor(ngZone: NgZone, elementRef: ElementRef, cdr: ChangeDetectorRef, focusMonitor: FocusMonitor);
    setDisabledState(disabled: boolean): void;
    writeValue(value: boolean): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private setupClickListener;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzRadioComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzRadioComponent, "[nz-radio],[nz-radio-button]", ["nzRadio"], { "nzValue": { "alias": "nzValue"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzAutoFocus": { "alias": "nzAutoFocus"; "required": false; }; "isRadioButton": { "alias": "nz-radio-button"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzAutoFocus: unknown;
    static ngAcceptInputType_isRadioButton: unknown;
}
