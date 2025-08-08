/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzScrollService } from 'ng-zorro-antd/core/services';
import { NgStyleInterface, NzDirectionVHType } from 'ng-zorro-antd/core/types';
import { NzAnchorLinkComponent } from './anchor-link.component';
import * as i0 from "@angular/core";
export declare class NzAnchorComponent implements OnDestroy, AfterViewInit, OnChanges {
    nzConfigService: NzConfigService;
    private scrollSrv;
    private cdr;
    private platform;
    private renderer;
    readonly _nzModuleName: NzConfigKey;
    private ink;
    nzAffix: boolean;
    nzShowInkInFixed: boolean;
    nzBounds: number;
    nzOffsetTop?: number;
    nzTargetOffset?: number;
    nzContainer?: string | HTMLElement;
    nzCurrentAnchor?: string;
    nzDirection: NzDirectionVHType;
    readonly nzClick: EventEmitter<string>;
    readonly nzChange: EventEmitter<string>;
    readonly nzScroll: EventEmitter<NzAnchorLinkComponent>;
    visible: boolean;
    wrapperStyle: NgStyleInterface;
    container?: HTMLElement | Window;
    activeLink?: string;
    private links;
    private animating;
    private destroy$;
    private handleScrollTimeoutID?;
    private doc;
    constructor(nzConfigService: NzConfigService, scrollSrv: NzScrollService, cdr: ChangeDetectorRef, platform: Platform, renderer: Renderer2);
    registerLink(link: NzAnchorLinkComponent): void;
    unregisterLink(link: NzAnchorLinkComponent): void;
    private getContainer;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private registerScrollEvent;
    handleScroll(): void;
    private clearActive;
    private setActive;
    private handleActive;
    private setVisible;
    handleScrollTo(linkComp: NzAnchorLinkComponent): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzAnchorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzAnchorComponent, "nz-anchor", ["nzAnchor"], { "nzAffix": { "alias": "nzAffix"; "required": false; }; "nzShowInkInFixed": { "alias": "nzShowInkInFixed"; "required": false; }; "nzBounds": { "alias": "nzBounds"; "required": false; }; "nzOffsetTop": { "alias": "nzOffsetTop"; "required": false; }; "nzTargetOffset": { "alias": "nzTargetOffset"; "required": false; }; "nzContainer": { "alias": "nzContainer"; "required": false; }; "nzCurrentAnchor": { "alias": "nzCurrentAnchor"; "required": false; }; "nzDirection": { "alias": "nzDirection"; "required": false; }; }, { "nzClick": "nzClick"; "nzChange": "nzChange"; "nzScroll": "nzScroll"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzAffix: unknown;
    static ngAcceptInputType_nzShowInkInFixed: unknown;
    static ngAcceptInputType_nzBounds: unknown;
    static ngAcceptInputType_nzOffsetTop: unknown;
    static ngAcceptInputType_nzTargetOffset: unknown;
}
