/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AfterViewInit, ElementRef, Renderer2, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare function MenuGroupFactory(): boolean;
export declare class NzMenuGroupComponent implements AfterViewInit {
    elementRef: ElementRef;
    private renderer;
    nzTitle?: string | TemplateRef<void>;
    titleElement?: ElementRef;
    isMenuInsideDropDown: boolean;
    constructor(elementRef: ElementRef, renderer: Renderer2);
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMenuGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzMenuGroupComponent, "[nz-menu-group]", ["nzMenuGroup"], { "nzTitle": { "alias": "nzTitle"; "required": false; }; }, {}, never, ["[title]", "*"], true, never>;
}
