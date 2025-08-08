import { ChangeDetectorRef, EventEmitter, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { Color } from './interfaces/color';
import { ColorValue, HsbaColorType } from './interfaces/type';
import * as i0 from "@angular/core";
export declare class NgAntdColorPickerComponent implements OnInit, OnChanges {
    private cdr;
    value: ColorValue;
    defaultValue: ColorValue;
    readonly nzOnChange: EventEmitter<{
        color: Color;
        type?: HsbaColorType;
    }>;
    readonly nzOnChangeComplete: EventEmitter<HsbaColorType>;
    panelRenderHeader: TemplateRef<void> | null;
    panelRenderFooter: TemplateRef<void> | null;
    disabledAlpha: boolean;
    disabled: boolean;
    colorValue: Color | null;
    alphaColor: string;
    hueColor: string[];
    gradientColors: string[];
    toRgbString: string;
    constructor(cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    hasValue(value: ColorValue): boolean;
    setColorValue(color: ColorValue): void;
    setAlphaColor(colorValue: Color): void;
    handleChange(color: Color, type?: HsbaColorType): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgAntdColorPickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgAntdColorPickerComponent, "ng-antd-color-picker", never, { "value": { "alias": "value"; "required": false; }; "defaultValue": { "alias": "defaultValue"; "required": false; }; "panelRenderHeader": { "alias": "panelRenderHeader"; "required": false; }; "panelRenderFooter": { "alias": "panelRenderFooter"; "required": false; }; "disabledAlpha": { "alias": "disabledAlpha"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "nzOnChange": "nzOnChange"; "nzOnChangeComplete": "nzOnChangeComplete"; }, never, never, true, never>;
    static ngAcceptInputType_disabledAlpha: unknown;
    static ngAcceptInputType_disabled: unknown;
}
