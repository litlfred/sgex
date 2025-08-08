/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter } from '@angular/core';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzColorBlockComponent {
    nzColor: string;
    nzSize: NzSizeLDSType;
    readonly nzOnClick: EventEmitter<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzColorBlockComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzColorBlockComponent, "nz-color-block", ["NzColorBlock"], { "nzColor": { "alias": "nzColor"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, { "nzOnClick": "nzOnClick"; }, never, never, true, never>;
}
