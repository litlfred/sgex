import { ElementRef, EventEmitter, OnDestroy, QueryList, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NzButtonType } from 'ng-zorro-antd/button';
import { NzConfigKey } from 'ng-zorro-antd/core/config';
import { NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { NzToolTipComponent, NzTooltipBaseDirective, NzTooltipTrigger, PropertyMapping } from 'ng-zorro-antd/tooltip';
import * as i0 from "@angular/core";
export type NzAutoFocusType = null | 'ok' | 'cancel';
export declare class NzPopconfirmDirective extends NzTooltipBaseDirective {
    readonly _nzModuleName: NzConfigKey;
    arrowPointAtCenter?: boolean;
    title?: NzTSType;
    titleContext?: object | null;
    directiveTitle?: NzTSType | null;
    trigger?: NzTooltipTrigger;
    placement?: string | string[];
    origin?: ElementRef<HTMLElement>;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    overlayClassName?: string;
    overlayStyle?: NgStyleInterface;
    visible?: boolean;
    nzOkText?: string;
    nzOkType?: string;
    nzOkDisabled?: boolean;
    nzOkDanger?: boolean;
    nzCancelText?: string;
    nzBeforeConfirm?: () => Observable<boolean> | Promise<boolean> | boolean;
    nzIcon?: string | TemplateRef<void>;
    nzCondition: boolean;
    nzPopconfirmShowArrow: boolean;
    nzPopconfirmBackdrop?: boolean;
    nzAutofocus: NzAutoFocusType;
    directiveContent?: NzTSType | null;
    content?: NzTSType | null;
    overlayClickable?: boolean;
    readonly visibleChange: EventEmitter<boolean>;
    readonly nzOnCancel: EventEmitter<void>;
    readonly nzOnConfirm: EventEmitter<void>;
    protected getProxyPropertyMap(): PropertyMapping;
    constructor();
    /**
     * @override
     */
    protected createComponent(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopconfirmDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzPopconfirmDirective, "[nz-popconfirm]", ["nzPopconfirm"], { "arrowPointAtCenter": { "alias": "nzPopconfirmArrowPointAtCenter"; "required": false; }; "title": { "alias": "nzPopconfirmTitle"; "required": false; }; "titleContext": { "alias": "nzPopconfirmTitleContext"; "required": false; }; "directiveTitle": { "alias": "nz-popconfirm"; "required": false; }; "trigger": { "alias": "nzPopconfirmTrigger"; "required": false; }; "placement": { "alias": "nzPopconfirmPlacement"; "required": false; }; "origin": { "alias": "nzPopconfirmOrigin"; "required": false; }; "mouseEnterDelay": { "alias": "nzPopconfirmMouseEnterDelay"; "required": false; }; "mouseLeaveDelay": { "alias": "nzPopconfirmMouseLeaveDelay"; "required": false; }; "overlayClassName": { "alias": "nzPopconfirmOverlayClassName"; "required": false; }; "overlayStyle": { "alias": "nzPopconfirmOverlayStyle"; "required": false; }; "visible": { "alias": "nzPopconfirmVisible"; "required": false; }; "nzOkText": { "alias": "nzOkText"; "required": false; }; "nzOkType": { "alias": "nzOkType"; "required": false; }; "nzOkDisabled": { "alias": "nzOkDisabled"; "required": false; }; "nzOkDanger": { "alias": "nzOkDanger"; "required": false; }; "nzCancelText": { "alias": "nzCancelText"; "required": false; }; "nzBeforeConfirm": { "alias": "nzBeforeConfirm"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzCondition": { "alias": "nzCondition"; "required": false; }; "nzPopconfirmShowArrow": { "alias": "nzPopconfirmShowArrow"; "required": false; }; "nzPopconfirmBackdrop": { "alias": "nzPopconfirmBackdrop"; "required": false; }; "nzAutofocus": { "alias": "nzAutofocus"; "required": false; }; }, { "visibleChange": "nzPopconfirmVisibleChange"; "nzOnCancel": "nzOnCancel"; "nzOnConfirm": "nzOnConfirm"; }, never, never, true, never>;
    static ngAcceptInputType_arrowPointAtCenter: unknown;
    static ngAcceptInputType_nzOkDisabled: unknown;
    static ngAcceptInputType_nzOkDanger: unknown;
    static ngAcceptInputType_nzCondition: unknown;
    static ngAcceptInputType_nzPopconfirmShowArrow: unknown;
}
export declare class NzPopconfirmComponent extends NzToolTipComponent implements OnDestroy {
    private elementRef;
    okBtn: QueryList<ElementRef>;
    cancelBtn: QueryList<ElementRef>;
    nzCancelText?: string;
    nzCondition: boolean;
    nzPopconfirmShowArrow: boolean;
    nzIcon?: string | TemplateRef<void>;
    nzOkText?: string;
    nzOkType: NzButtonType | 'danger';
    nzOkDanger: boolean;
    nzOkDisabled: boolean;
    nzAutoFocus: NzAutoFocusType;
    nzBeforeConfirm: (() => Observable<boolean> | Promise<boolean> | boolean) | null;
    readonly nzOnCancel: Subject<void>;
    readonly nzOnConfirm: Subject<void>;
    protected _trigger: NzTooltipTrigger;
    private elementFocusedBeforeModalWasOpened;
    private document;
    _prefix: string;
    confirmLoading: boolean;
    constructor(elementRef: ElementRef);
    ngOnDestroy(): void;
    /**
     * @override
     */
    show(): void;
    hide(): void;
    handleConfirm(): void;
    onCancel(): void;
    onConfirm(): void;
    private capturePreviouslyFocusedElement;
    private restoreFocus;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPopconfirmComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPopconfirmComponent, "nz-popconfirm", ["nzPopconfirmComponent"], {}, {}, never, never, true, never>;
}
