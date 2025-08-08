/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzDropdownButtonDirective implements AfterViewInit {
    private renderer;
    private elementRef;
    private nzButtonGroupComponent;
    constructor(renderer: Renderer2, elementRef: ElementRef);
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzDropdownButtonDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzDropdownButtonDirective, "[nz-button][nz-dropdown]", never, {}, {}, never, never, true, never>;
}
