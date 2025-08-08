/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzRowExpandButtonDirective {
    expand: boolean;
    spaceMode: boolean;
    readonly expandChange: EventEmitter<any>;
    onHostClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzRowExpandButtonDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzRowExpandButtonDirective, "button[nz-row-expand-button]", never, { "expand": { "alias": "expand"; "required": false; }; "spaceMode": { "alias": "spaceMode"; "required": false; }; }, { "expandChange": "expandChange"; }, never, never, true, never>;
}
