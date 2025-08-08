import { ElementRef, EventEmitter } from '@angular/core';
import { NzPresetColor } from 'ng-zorro-antd/core/color';
import { NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { NzTooltipBaseComponent, NzTooltipBaseDirective, NzTooltipTrigger, PropertyMapping } from './base';
import * as i0 from "@angular/core";
export declare class NzTooltipDirective extends NzTooltipBaseDirective {
    title?: NzTSType | null;
    titleContext?: object | null;
    directiveTitle?: NzTSType | null;
    trigger?: NzTooltipTrigger;
    placement?: string | string[];
    origin?: ElementRef<HTMLElement>;
    visible?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    overlayClassName?: string;
    overlayStyle?: NgStyleInterface;
    arrowPointAtCenter?: boolean;
    cdkConnectedOverlayPush?: boolean;
    nzTooltipColor?: string;
    directiveContent?: NzTSType | null;
    content?: NzTSType | null;
    overlayClickable?: boolean;
    readonly visibleChange: EventEmitter<boolean>;
    constructor();
    protected getProxyPropertyMap(): PropertyMapping;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTooltipDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTooltipDirective, "[nz-tooltip]", ["nzTooltip"], { "title": { "alias": "nzTooltipTitle"; "required": false; }; "titleContext": { "alias": "nzTooltipTitleContext"; "required": false; }; "directiveTitle": { "alias": "nz-tooltip"; "required": false; }; "trigger": { "alias": "nzTooltipTrigger"; "required": false; }; "placement": { "alias": "nzTooltipPlacement"; "required": false; }; "origin": { "alias": "nzTooltipOrigin"; "required": false; }; "visible": { "alias": "nzTooltipVisible"; "required": false; }; "mouseEnterDelay": { "alias": "nzTooltipMouseEnterDelay"; "required": false; }; "mouseLeaveDelay": { "alias": "nzTooltipMouseLeaveDelay"; "required": false; }; "overlayClassName": { "alias": "nzTooltipOverlayClassName"; "required": false; }; "overlayStyle": { "alias": "nzTooltipOverlayStyle"; "required": false; }; "arrowPointAtCenter": { "alias": "nzTooltipArrowPointAtCenter"; "required": false; }; "cdkConnectedOverlayPush": { "alias": "cdkConnectedOverlayPush"; "required": false; }; "nzTooltipColor": { "alias": "nzTooltipColor"; "required": false; }; }, { "visibleChange": "nzTooltipVisibleChange"; }, never, never, true, never>;
    static ngAcceptInputType_arrowPointAtCenter: unknown;
    static ngAcceptInputType_cdkConnectedOverlayPush: unknown;
}
export declare class NzToolTipComponent extends NzTooltipBaseComponent {
    nzTitle: NzTSType | null;
    nzTitleContext: object | null;
    nzColor?: string | NzPresetColor;
    _contentStyleMap: NgStyleInterface;
    protected isEmpty(): boolean;
    protected updateStyles(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzToolTipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzToolTipComponent, "nz-tooltip", ["nzTooltipComponent"], {}, {}, never, never, true, never>;
}
