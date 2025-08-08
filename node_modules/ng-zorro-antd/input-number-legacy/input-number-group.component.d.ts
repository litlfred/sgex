/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, ElementRef, OnChanges, OnDestroy, OnInit, QueryList, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { NgClassInterface, NzSizeLDSType, NzStatus, NzValidateStatus } from 'ng-zorro-antd/core/types';
import { NzInputNumberLegacyComponent } from './input-number.component';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/space";
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
export declare class NzInputNumberGroupWhitSuffixOrPrefixDirective {
    elementRef: ElementRef;
    constructor(elementRef: ElementRef);
    static ɵfac: i0.ɵɵFactoryDeclaration<NzInputNumberGroupWhitSuffixOrPrefixDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzInputNumberGroupWhitSuffixOrPrefixDirective, "nz-input-number-group[nzSuffix], nz-input-number-group[nzPrefix]", never, {}, {}, never, never, true, never>;
}
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
export declare class NzInputNumberGroupComponent implements AfterContentInit, OnChanges, OnInit, OnDestroy {
    private focusMonitor;
    private elementRef;
    private renderer;
    private cdr;
    private directionality;
    listOfNzInputNumberComponent: QueryList<NzInputNumberLegacyComponent>;
    nzAddOnBeforeIcon?: string | null;
    nzAddOnAfterIcon?: string | null;
    nzPrefixIcon?: string | null;
    nzSuffixIcon?: string | null;
    nzAddOnBefore?: string | TemplateRef<void>;
    nzAddOnAfter?: string | TemplateRef<void>;
    nzPrefix?: string | TemplateRef<void>;
    nzStatus: NzStatus;
    nzSuffix?: string | TemplateRef<void>;
    nzSize: NzSizeLDSType;
    /**
     * @deprecated Will be removed in v20. Use `NzSpaceCompactComponent` instead.
     */
    nzCompact: boolean;
    isLarge: boolean;
    isSmall: boolean;
    isAffix: boolean;
    isAddOn: boolean;
    isFeedback: boolean;
    focused: boolean;
    disabled: boolean;
    dir: Direction;
    prefixCls: string;
    affixStatusCls: NgClassInterface;
    groupStatusCls: NgClassInterface;
    affixInGroupStatusCls: NgClassInterface;
    status: NzValidateStatus;
    hasFeedback: boolean;
    private destroy$;
    private nzFormStatusService;
    private nzFormNoStatusService;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef, directionality: Directionality);
    updateChildrenInputSize(): void;
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private setStatusStyles;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzInputNumberGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzInputNumberGroupComponent, "nz-input-number-group", ["nzInputNumberGroup"], { "nzAddOnBeforeIcon": { "alias": "nzAddOnBeforeIcon"; "required": false; }; "nzAddOnAfterIcon": { "alias": "nzAddOnAfterIcon"; "required": false; }; "nzPrefixIcon": { "alias": "nzPrefixIcon"; "required": false; }; "nzSuffixIcon": { "alias": "nzSuffixIcon"; "required": false; }; "nzAddOnBefore": { "alias": "nzAddOnBefore"; "required": false; }; "nzAddOnAfter": { "alias": "nzAddOnAfter"; "required": false; }; "nzPrefix": { "alias": "nzPrefix"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzSuffix": { "alias": "nzSuffix"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzCompact": { "alias": "nzCompact"; "required": false; }; }, {}, ["listOfNzInputNumberComponent"], ["*"], true, [{ directive: typeof i1.NzSpaceCompactItemDirective; inputs: {}; outputs: {}; }]>;
    static ngAcceptInputType_nzCompact: unknown;
}
