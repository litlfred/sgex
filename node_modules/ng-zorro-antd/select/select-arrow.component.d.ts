/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSelectArrowComponent {
    listOfValue: NzSafeAny[];
    loading: boolean;
    search: boolean;
    showArrow: boolean;
    isMaxMultipleCountSet: boolean;
    suffixIcon: TemplateRef<NzSafeAny> | string | null;
    feedbackIcon: TemplateRef<NzSafeAny> | string | null;
    nzMaxMultipleCount: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSelectArrowComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSelectArrowComponent, "nz-select-arrow", never, { "listOfValue": { "alias": "listOfValue"; "required": false; }; "loading": { "alias": "loading"; "required": false; }; "search": { "alias": "search"; "required": false; }; "showArrow": { "alias": "showArrow"; "required": false; }; "isMaxMultipleCountSet": { "alias": "isMaxMultipleCountSet"; "required": false; }; "suffixIcon": { "alias": "suffixIcon"; "required": false; }; "feedbackIcon": { "alias": "feedbackIcon"; "required": false; }; "nzMaxMultipleCount": { "alias": "nzMaxMultipleCount"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzMaxMultipleCount: unknown;
}
