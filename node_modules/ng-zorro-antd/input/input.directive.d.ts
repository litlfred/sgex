/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ComponentRef, ElementRef, OnChanges, OnInit, Renderer2, SimpleChanges, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import { NgClassInterface, NzSizeLDSType, NzStatus, NzValidateStatus } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/space";
export declare class NzInputDirective implements OnChanges, OnInit {
    private renderer;
    private elementRef;
    protected hostView: ViewContainerRef;
    private directionality;
    nzBorderless: boolean;
    nzSize: NzSizeLDSType;
    nzStepperless: boolean;
    nzStatus: NzStatus;
    get disabled(): boolean;
    set disabled(value: boolean);
    _disabled: boolean;
    disabled$: Subject<boolean>;
    dir: Direction;
    prefixCls: string;
    status: NzValidateStatus;
    statusCls: NgClassInterface;
    hasFeedback: boolean;
    feedbackRef: ComponentRef<NzFormItemFeedbackIconComponent> | null;
    components: Array<ComponentRef<NzFormItemFeedbackIconComponent>>;
    ngControl: NgControl | null;
    protected finalSize: import("@angular/core").Signal<NzSizeLDSType>;
    private size;
    private compactSize;
    private destroy$;
    private nzFormStatusService;
    private nzFormNoStatusService;
    constructor(renderer: Renderer2, elementRef: ElementRef, hostView: ViewContainerRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges({ disabled, nzStatus, nzSize }: SimpleChanges): void;
    private setStatusStyles;
    private renderFeedbackIcon;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzInputDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzInputDirective, "input[nz-input],textarea[nz-input]", ["nzInput"], { "nzBorderless": { "alias": "nzBorderless"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzStepperless": { "alias": "nzStepperless"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, never, true, [{ directive: typeof i1.NzSpaceCompactItemDirective; inputs: {}; outputs: {}; }]>;
    static ngAcceptInputType_nzBorderless: unknown;
    static ngAcceptInputType_nzStepperless: unknown;
    static ngAcceptInputType_disabled: unknown;
}
