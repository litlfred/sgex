/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NzSliderHandleComponent } from './handle.component';
import { NzSliderService } from './slider.service';
import { NzExtendedMark, NzMarks, NzSliderHandler, NzSliderShowTooltip, NzSliderValue } from './typings';
import * as i0 from "@angular/core";
export declare class NzSliderComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
    slider: ElementRef<HTMLDivElement>;
    private sliderService;
    private cdr;
    private platform;
    private directionality;
    handlerComponents: QueryList<NzSliderHandleComponent>;
    nzDisabled: boolean;
    nzDots: boolean;
    nzIncluded: boolean;
    nzRange: boolean;
    nzVertical: boolean;
    nzReverse: boolean;
    nzDefaultValue?: NzSliderValue;
    nzMarks: NzMarks | null;
    nzMax: number;
    nzMin: number;
    nzStep: number;
    nzTooltipVisible: NzSliderShowTooltip;
    nzTooltipPlacement: string;
    nzTipFormatter?: null | ((value: number) => string) | TemplateRef<void>;
    readonly nzOnAfterChange: EventEmitter<NzSliderValue>;
    value: NzSliderValue | null;
    cacheSliderStart: number | null;
    cacheSliderLength: number | null;
    activeValueIndex: number | undefined;
    track: {
        offset: null | number;
        length: null | number;
    };
    handles: NzSliderHandler[];
    marksArray: NzExtendedMark[] | null;
    bounds: {
        lower: NzSliderValue | null;
        upper: NzSliderValue | null;
    };
    dir: Direction;
    private dragStart$?;
    private dragMove$?;
    private dragEnd$?;
    private dragStart_?;
    private dragMove_?;
    private dragEnd_?;
    private destroy$;
    private isNzDisableFirstChange;
    constructor(slider: ElementRef<HTMLDivElement>, sliderService: NzSliderService, cdr: ChangeDetectorRef, platform: Platform, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    writeValue(val: NzSliderValue | null): void;
    onValueChange(_value: NzSliderValue): void;
    onTouched(): void;
    registerOnChange(fn: (value: NzSliderValue) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    /**
     * Event handler is only triggered when a slider handler is focused.
     */
    onKeyDown(e: KeyboardEvent): void;
    onHandleFocusIn(index: number): void;
    private setValue;
    private getValue;
    /**
     * Clone & sort current value and convert them to offsets, then return the new one.
     */
    private getValueToOffset;
    /**
     * Find the closest value to be activated.
     */
    private setActiveValueIndex;
    private setActiveValue;
    /**
     * Update track and handles' position and length.
     */
    private updateTrackAndHandles;
    private onDragStart;
    private onDragMove;
    private getLogicalValue;
    private onDragEnd;
    /**
     * Create user interactions handles.
     */
    private bindDraggingHandlers;
    private subscribeDrag;
    private unsubscribeDrag;
    private toggleDragMoving;
    private toggleDragDisabled;
    private findClosestValue;
    private valueToOffset;
    private getSliderStartPosition;
    private getSliderLength;
    /**
     * Cache DOM layout/reflow operations for performance (may not necessary?)
     */
    private cacheSliderProperty;
    private formatValue;
    /**
     * Show one handle's tooltip and hide others'.
     */
    private showHandleTooltip;
    private hideAllHandleTooltip;
    private generateMarkItems;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSliderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSliderComponent, "nz-slider", ["nzSlider"], { "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzDots": { "alias": "nzDots"; "required": false; }; "nzIncluded": { "alias": "nzIncluded"; "required": false; }; "nzRange": { "alias": "nzRange"; "required": false; }; "nzVertical": { "alias": "nzVertical"; "required": false; }; "nzReverse": { "alias": "nzReverse"; "required": false; }; "nzDefaultValue": { "alias": "nzDefaultValue"; "required": false; }; "nzMarks": { "alias": "nzMarks"; "required": false; }; "nzMax": { "alias": "nzMax"; "required": false; }; "nzMin": { "alias": "nzMin"; "required": false; }; "nzStep": { "alias": "nzStep"; "required": false; }; "nzTooltipVisible": { "alias": "nzTooltipVisible"; "required": false; }; "nzTooltipPlacement": { "alias": "nzTooltipPlacement"; "required": false; }; "nzTipFormatter": { "alias": "nzTipFormatter"; "required": false; }; }, { "nzOnAfterChange": "nzOnAfterChange"; }, never, never, true, never>;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzDots: unknown;
    static ngAcceptInputType_nzIncluded: unknown;
    static ngAcceptInputType_nzRange: unknown;
    static ngAcceptInputType_nzVertical: unknown;
    static ngAcceptInputType_nzReverse: unknown;
    static ngAcceptInputType_nzMax: unknown;
    static ngAcceptInputType_nzMin: unknown;
    static ngAcceptInputType_nzStep: unknown;
}
