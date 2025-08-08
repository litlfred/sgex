/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnInit, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NgClassType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzRateComponent implements OnInit, ControlValueAccessor, OnChanges {
    nzConfigService: NzConfigService;
    private ngZone;
    private renderer;
    private cdr;
    private directionality;
    private destroy$;
    readonly _nzModuleName: NzConfigKey;
    ulElement: ElementRef<HTMLUListElement>;
    nzAllowClear: boolean;
    nzAllowHalf: boolean;
    nzDisabled: boolean;
    nzAutoFocus: boolean;
    nzCharacter: TemplateRef<{
        $implicit: number;
    }>;
    nzCount: number;
    nzTooltips: string[];
    readonly nzOnBlur: EventEmitter<FocusEvent>;
    readonly nzOnFocus: EventEmitter<FocusEvent>;
    readonly nzOnHoverChange: EventEmitter<number>;
    readonly nzOnKeyDown: EventEmitter<KeyboardEvent>;
    classMap: NgClassType;
    starArray: number[];
    starStyleArray: NgClassType[];
    dir: Direction;
    private hasHalf;
    private hoverValue;
    private isFocused;
    private _value;
    private isNzDisableFirstChange;
    get nzValue(): number;
    set nzValue(input: number);
    constructor(nzConfigService: NzConfigService, ngZone: NgZone, renderer: Renderer2, cdr: ChangeDetectorRef, directionality: Directionality, destroy$: NzDestroyService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    onItemClick(index: number, isHalf: boolean): void;
    onItemHover(index: number, isHalf: boolean): void;
    onRateLeave(): void;
    focus(): void;
    blur(): void;
    onKeyDown(e: KeyboardEvent): void;
    private updateStarArray;
    private updateStarStyle;
    writeValue(value: number | null): void;
    setDisabledState(isDisabled: boolean): void;
    registerOnChange(fn: (_: number) => void): void;
    registerOnTouched(fn: () => void): void;
    onChange: (value: number) => void;
    onTouched: () => void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzRateComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzRateComponent, "nz-rate", ["nzRate"], { "nzAllowClear": { "alias": "nzAllowClear"; "required": false; }; "nzAllowHalf": { "alias": "nzAllowHalf"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzAutoFocus": { "alias": "nzAutoFocus"; "required": false; }; "nzCharacter": { "alias": "nzCharacter"; "required": false; }; "nzCount": { "alias": "nzCount"; "required": false; }; "nzTooltips": { "alias": "nzTooltips"; "required": false; }; }, { "nzOnBlur": "nzOnBlur"; "nzOnFocus": "nzOnFocus"; "nzOnHoverChange": "nzOnHoverChange"; "nzOnKeyDown": "nzOnKeyDown"; }, never, never, true, never>;
    static ngAcceptInputType_nzAllowClear: unknown;
    static ngAcceptInputType_nzAllowHalf: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzAutoFocus: unknown;
    static ngAcceptInputType_nzCount: unknown;
}
