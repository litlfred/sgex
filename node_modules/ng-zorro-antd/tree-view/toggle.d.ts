/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { CdkTreeNodeToggle } from '@angular/cdk/tree';
import * as i0 from "@angular/core";
export declare class NzTreeNodeNoopToggleDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeNoopToggleDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTreeNodeNoopToggleDirective, "nz-tree-node-toggle[nzTreeNodeNoopToggle], [nzTreeNodeNoopToggle]", never, {}, {}, never, never, true, never>;
}
export declare class NzTreeNodeToggleDirective<T> extends CdkTreeNodeToggle<T> {
    recursive: boolean;
    get isExpanded(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeToggleDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTreeNodeToggleDirective<any>, "nz-tree-node-toggle:not([nzTreeNodeNoopToggle]), [nzTreeNodeToggle]", never, { "recursive": { "alias": "nzTreeNodeToggleRecursive"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_recursive: unknown;
}
export declare class NzTreeNodeToggleRotateIconDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeToggleRotateIconDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTreeNodeToggleRotateIconDirective, "[nzTreeNodeToggleRotateIcon]", never, {}, {}, never, never, true, never>;
}
export declare class NzTreeNodeToggleActiveIconDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeToggleActiveIconDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTreeNodeToggleActiveIconDirective, "[nzTreeNodeToggleActiveIcon]", never, {}, {}, never, never, true, never>;
}
