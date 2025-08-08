/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef } from '@angular/core';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSpaceCompactComponent {
    readonly nzBlock: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    readonly nzDirection: import("@angular/core").InputSignal<"vertical" | "horizontal">;
    readonly nzSize: import("@angular/core").InputSignal<NzSizeLDSType>;
    readonly elementRef: ElementRef<HTMLElement>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSpaceCompactComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSpaceCompactComponent, "nz-space-compact", ["nzSpaceCompact"], { "nzBlock": { "alias": "nzBlock"; "required": false; "isSignal": true; }; "nzDirection": { "alias": "nzDirection"; "required": false; "isSignal": true; }; "nzSize": { "alias": "nzSize"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}
