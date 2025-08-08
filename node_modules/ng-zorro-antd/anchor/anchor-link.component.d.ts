/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { NzDirectionVHType, NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzAnchorComponent } from './anchor.component';
import * as i0 from "@angular/core";
export declare class NzAnchorLinkComponent implements OnInit, OnDestroy {
    elementRef: ElementRef;
    private anchorComp;
    private platform;
    private renderer;
    nzHref: string;
    nzTarget?: string;
    titleStr: string | null;
    titleTpl?: TemplateRef<NzSafeAny>;
    nzDirection: NzDirectionVHType;
    set nzTitle(value: string | TemplateRef<void>);
    nzTemplate: TemplateRef<void>;
    linkTitle: ElementRef<HTMLAnchorElement>;
    constructor(elementRef: ElementRef, anchorComp: NzAnchorComponent, platform: Platform, renderer: Renderer2);
    ngOnInit(): void;
    getLinkTitleElement(): HTMLAnchorElement;
    setActive(): void;
    unsetActive(): void;
    goToClick(e: Event): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzAnchorLinkComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzAnchorLinkComponent, "nz-link", ["nzLink"], { "nzHref": { "alias": "nzHref"; "required": false; }; "nzTarget": { "alias": "nzTarget"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; }, {}, ["nzTemplate"], ["*"], true, never>;
}
