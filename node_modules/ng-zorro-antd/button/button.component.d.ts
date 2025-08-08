/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, ElementRef, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/space";
export type NzButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text' | null;
export type NzButtonShape = 'circle' | 'round' | null;
export type NzButtonSize = NzSizeLDSType;
export declare class NzButtonComponent implements OnChanges, AfterViewInit, AfterContentInit, OnInit {
    private elementRef;
    private cdr;
    private renderer;
    nzConfigService: NzConfigService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzIconDirectiveElement: ElementRef;
    nzBlock: boolean;
    nzGhost: boolean;
    nzSearch: boolean;
    nzLoading: boolean;
    nzDanger: boolean;
    disabled: boolean;
    tabIndex: number | string | null;
    nzType: NzButtonType;
    nzShape: NzButtonShape;
    nzSize: NzButtonSize;
    dir: Direction;
    protected finalSize: import("@angular/core").Signal<NzSizeLDSType>;
    private size;
    private compactSize;
    private destroy$;
    private loading$;
    insertSpan(nodes: NodeList, renderer: Renderer2): void;
    get iconOnly(): boolean;
    constructor(elementRef: ElementRef, cdr: ChangeDetectorRef, renderer: Renderer2, nzConfigService: NzConfigService, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges({ nzLoading, nzSize }: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngAfterContentInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzButtonComponent, "button[nz-button], a[nz-button]", ["nzButton"], { "nzBlock": { "alias": "nzBlock"; "required": false; }; "nzGhost": { "alias": "nzGhost"; "required": false; }; "nzSearch": { "alias": "nzSearch"; "required": false; }; "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzDanger": { "alias": "nzDanger"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "tabIndex": { "alias": "tabIndex"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzShape": { "alias": "nzShape"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, {}, ["nzIconDirectiveElement"], ["*"], true, [{ directive: typeof i1.NzSpaceCompactItemDirective; inputs: {}; outputs: {}; }]>;
    static ngAcceptInputType_nzBlock: unknown;
    static ngAcceptInputType_nzGhost: unknown;
    static ngAcceptInputType_nzSearch: unknown;
    static ngAcceptInputType_nzLoading: unknown;
    static ngAcceptInputType_nzDanger: unknown;
    static ngAcceptInputType_disabled: unknown;
}
