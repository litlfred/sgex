import { ElementRef, EventEmitter } from '@angular/core';
import { NzConfigKey } from 'ng-zorro-antd/core/config';
import { NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { NzToolTipComponent, NzTooltipBaseDirective, NzTooltipTrigger, PropertyMapping } from 'ng-zorro-antd/tooltip';
import * as i0 from "@angular/core";
export declare class NzPopoverDirective extends NzTooltipBaseDirective {
    readonly _nzModuleName: NzConfigKey;
    arrowPointAtCenter?: boolean;
    title?: NzTSType;
    content?: NzTSType;
    directiveTitle?: NzTSType | null;
    trigger?: NzTooltipTrigger;
    placement?: string | string[];
    origin?: ElementRef<HTMLElement>;
    visible?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    overlayClassName?: string;
    overlayStyle?: NgStyleInterface;
    overlayClickable?: boolean;
    directiveContent?: NzTSType | null;
    nzPopoverBackdrop?: boolean;
    readonly visibleChange: EventEmitter<boolean>;
    protected getProxyPropertyMap(): PropertyMapping;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopoverDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzPopoverDirective, "[nz-popover]", ["nzPopover"], { "arrowPointAtCenter": { "alias": "nzPopoverArrowPointAtCenter"; "required": false; }; "title": { "alias": "nzPopoverTitle"; "required": false; }; "content": { "alias": "nzPopoverContent"; "required": false; }; "directiveTitle": { "alias": "nz-popover"; "required": false; }; "trigger": { "alias": "nzPopoverTrigger"; "required": false; }; "placement": { "alias": "nzPopoverPlacement"; "required": false; }; "origin": { "alias": "nzPopoverOrigin"; "required": false; }; "visible": { "alias": "nzPopoverVisible"; "required": false; }; "mouseEnterDelay": { "alias": "nzPopoverMouseEnterDelay"; "required": false; }; "mouseLeaveDelay": { "alias": "nzPopoverMouseLeaveDelay"; "required": false; }; "overlayClassName": { "alias": "nzPopoverOverlayClassName"; "required": false; }; "overlayStyle": { "alias": "nzPopoverOverlayStyle"; "required": false; }; "overlayClickable": { "alias": "nzPopoverOverlayClickable"; "required": false; }; "nzPopoverBackdrop": { "alias": "nzPopoverBackdrop"; "required": false; }; }, { "visibleChange": "nzPopoverVisibleChange"; }, never, never, true, never>;
    static ngAcceptInputType_arrowPointAtCenter: unknown;
}
export declare class NzPopoverComponent extends NzToolTipComponent {
    _prefix: string;
    get hasBackdrop(): boolean;
    protected isEmpty(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopoverComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPopoverComponent, "nz-popover", ["nzPopoverComponent"], {}, {}, never, never, true, never>;
}
