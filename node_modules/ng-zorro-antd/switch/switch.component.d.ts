/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterViewInit, ChangeDetectorRef, ElementRef, NgZone, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSizeDSType, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSwitchComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, OnInit {
    nzConfigService: NzConfigService;
    private host;
    private ngZone;
    private cdr;
    private focusMonitor;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    isChecked: boolean;
    onChange: OnChangeType;
    onTouched: OnTouchedType;
    switchElement: ElementRef<HTMLElement>;
    nzLoading: boolean;
    nzDisabled: boolean;
    nzControl: boolean;
    nzCheckedChildren: string | TemplateRef<void> | null;
    nzUnCheckedChildren: string | TemplateRef<void> | null;
    nzSize: NzSizeDSType;
    nzId: string | null;
    dir: Direction;
    private destroy$;
    private isNzDisableFirstChange;
    updateValue(value: boolean): void;
    focus(): void;
    blur(): void;
    constructor(nzConfigService: NzConfigService, host: ElementRef<HTMLElement>, ngZone: NgZone, cdr: ChangeDetectorRef, focusMonitor: FocusMonitor, directionality: Directionality);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: boolean): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    setDisabledState(disabled: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSwitchComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSwitchComponent, "nz-switch", ["nzSwitch"], { "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzControl": { "alias": "nzControl"; "required": false; }; "nzCheckedChildren": { "alias": "nzCheckedChildren"; "required": false; }; "nzUnCheckedChildren": { "alias": "nzUnCheckedChildren"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzId": { "alias": "nzId"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzLoading: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzControl: unknown;
}
