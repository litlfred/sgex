/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { CdkTreeNodePadding } from '@angular/cdk/tree';
import * as i0 from "@angular/core";
export declare class NzTreeNodePaddingDirective<T> extends CdkTreeNodePadding<T> {
    _indent: number;
    get level(): number;
    set level(value: number);
    get indent(): number | string;
    set indent(indent: number | string);
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodePaddingDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTreeNodePaddingDirective<any>, "[nzTreeNodePadding]", never, { "level": { "alias": "nzTreeNodePadding"; "required": false; }; "indent": { "alias": "nzTreeNodePaddingIndent"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_level: unknown;
}
