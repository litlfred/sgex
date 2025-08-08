/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzSliderService } from './slider.service';
import { NzSliderShowTooltip } from './typings';
import * as i0 from "@angular/core";
export declare class NzSliderHandleComponent implements OnChanges {
    private sliderService;
    private cdr;
    handleEl?: ElementRef;
    tooltip?: NzTooltipDirective;
    vertical?: boolean;
    reverse?: boolean;
    offset?: number;
    value?: number;
    tooltipVisible: NzSliderShowTooltip;
    tooltipPlacement?: string;
    tooltipFormatter?: null | ((value: number) => string) | TemplateRef<void>;
    active: boolean;
    dir: Direction;
    tooltipTitle?: NzTSType;
    style: NgStyleInterface;
    constructor(sliderService: NzSliderService, cdr: ChangeDetectorRef);
    ngOnChanges(changes: SimpleChanges): void;
    enterHandle: () => void;
    leaveHandle: () => void;
    focus(): void;
    private toggleTooltip;
    private updateTooltipTitle;
    private updateTooltipPosition;
    private updateStyle;
    private getHorizontalStylePosition;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSliderHandleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSliderHandleComponent, "nz-slider-handle", ["nzSliderHandle"], { "vertical": { "alias": "vertical"; "required": false; }; "reverse": { "alias": "reverse"; "required": false; }; "offset": { "alias": "offset"; "required": false; }; "value": { "alias": "value"; "required": false; }; "tooltipVisible": { "alias": "tooltipVisible"; "required": false; }; "tooltipPlacement": { "alias": "tooltipPlacement"; "required": false; }; "tooltipFormatter": { "alias": "tooltipFormatter"; "required": false; }; "active": { "alias": "active"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_vertical: unknown;
    static ngAcceptInputType_reverse: unknown;
    static ngAcceptInputType_offset: unknown;
    static ngAcceptInputType_value: unknown;
    static ngAcceptInputType_active: unknown;
}
