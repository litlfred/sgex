/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import { NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import * as i0 from "@angular/core";
export declare class NzTreeNodeSwitcherComponent {
    nzShowExpand?: boolean;
    nzShowLine?: boolean;
    nzExpandedIcon?: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }>;
    nzSelectMode: boolean;
    context: NzTreeNode;
    isLeaf?: boolean;
    isLoading?: boolean;
    isExpanded?: boolean;
    get isShowLineIcon(): boolean;
    get isShowSwitchIcon(): boolean;
    get isSwitcherOpen(): boolean;
    get isSwitcherClose(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeSwitcherComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeNodeSwitcherComponent, "nz-tree-node-switcher", never, { "nzShowExpand": { "alias": "nzShowExpand"; "required": false; }; "nzShowLine": { "alias": "nzShowLine"; "required": false; }; "nzExpandedIcon": { "alias": "nzExpandedIcon"; "required": false; }; "nzSelectMode": { "alias": "nzSelectMode"; "required": false; }; "context": { "alias": "context"; "required": false; }; "isLeaf": { "alias": "isLeaf"; "required": false; }; "isLoading": { "alias": "isLoading"; "required": false; }; "isExpanded": { "alias": "isExpanded"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzShowExpand: unknown;
    static ngAcceptInputType_nzShowLine: unknown;
    static ngAcceptInputType_isLeaf: unknown;
    static ngAcceptInputType_isLoading: unknown;
    static ngAcceptInputType_isExpanded: unknown;
}
