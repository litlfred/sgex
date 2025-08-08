/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef, NgZone } from '@angular/core';
import { NzTabPositionMode } from './interfaces';
import * as i0 from "@angular/core";
export declare class NzTabsInkBarDirective {
    private elementRef;
    private ngZone;
    position: NzTabPositionMode;
    animated: boolean;
    animationMode: "NoopAnimations" | "BrowserAnimations" | null;
    get _animated(): boolean;
    constructor(elementRef: ElementRef<HTMLElement>, ngZone: NgZone);
    alignToElement(element: HTMLElement): void;
    setStyles(element: HTMLElement): void;
    getLeftPosition(element: HTMLElement): string;
    getElementWidth(element: HTMLElement): string;
    getTopPosition(element: HTMLElement): string;
    getElementHeight(element: HTMLElement): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTabsInkBarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTabsInkBarDirective, "nz-tabs-ink-bar, [nz-tabs-ink-bar]", never, { "position": { "alias": "position"; "required": false; }; "animated": { "alias": "animated"; "required": false; }; }, {}, never, never, true, never>;
}
