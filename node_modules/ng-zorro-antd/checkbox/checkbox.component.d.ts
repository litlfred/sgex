/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzSafeAny, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzCheckboxComponent implements OnInit, ControlValueAccessor, OnDestroy, AfterViewInit {
    private ngZone;
    private elementRef;
    private cdr;
    private focusMonitor;
    private directionality;
    dir: Direction;
    private destroy$;
    private isNzDisableFirstChange;
    onChange: OnChangeType;
    onTouched: OnTouchedType;
    inputElement: ElementRef<HTMLInputElement>;
    readonly nzCheckedChange: EventEmitter<boolean>;
    nzValue: NzSafeAny | null;
    nzAutoFocus: boolean;
    nzDisabled: boolean;
    nzIndeterminate: boolean;
    nzChecked: boolean;
    nzId: string | null;
    nzName: string | null;
    innerCheckedChange(checked: boolean): void;
    writeValue(value: boolean): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    setDisabledState(disabled: boolean): void;
    focus(): void;
    blur(): void;
    /** @deprecated */
    private nzCheckboxWrapperComponent;
    protected checkboxGroupComponent: import("ng-zorro-antd/checkbox").NzCheckboxGroupComponent | null;
    protected nzFormStatusService: NzFormStatusService | null;
    constructor(ngZone: NgZone, elementRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, focusMonitor: FocusMonitor, directionality: Directionality);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private setValue;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCheckboxComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCheckboxComponent, "[nz-checkbox]", ["nzCheckbox"], { "nzValue": { "alias": "nzValue"; "required": false; }; "nzAutoFocus": { "alias": "nzAutoFocus"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzIndeterminate": { "alias": "nzIndeterminate"; "required": false; }; "nzChecked": { "alias": "nzChecked"; "required": false; }; "nzId": { "alias": "nzId"; "required": false; }; "nzName": { "alias": "nzName"; "required": false; }; }, { "nzCheckedChange": "nzCheckedChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzAutoFocus: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzIndeterminate: unknown;
    static ngAcceptInputType_nzChecked: unknown;
}
