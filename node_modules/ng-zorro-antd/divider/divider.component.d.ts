/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzDividerComponent {
    nzText?: string | TemplateRef<void>;
    nzType: 'horizontal' | 'vertical';
    nzOrientation: 'left' | 'right' | 'center';
    nzVariant: 'dashed' | 'dotted' | 'solid';
    nzDashed: boolean;
    nzPlain: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzDividerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzDividerComponent, "nz-divider", ["nzDivider"], { "nzText": { "alias": "nzText"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzOrientation": { "alias": "nzOrientation"; "required": false; }; "nzVariant": { "alias": "nzVariant"; "required": false; }; "nzDashed": { "alias": "nzDashed"; "required": false; }; "nzPlain": { "alias": "nzPlain"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzDashed: unknown;
    static ngAcceptInputType_nzPlain: unknown;
}
