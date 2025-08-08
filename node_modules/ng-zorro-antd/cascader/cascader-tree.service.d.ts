import { NzTreeBaseService, NzTreeNode, NzTreeNodeKey } from 'ng-zorro-antd/core/tree';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzCascaderOption } from './typings';
import * as i0 from "@angular/core";
interface InternalFieldNames {
    label: string;
    value: string;
}
export declare class NzCascaderTreeService extends NzTreeBaseService {
    fieldNames: InternalFieldNames;
    treeNodePostProcessor: (node: NzTreeNode) => void;
    getOptionValue(node: NzTreeNode): NzSafeAny;
    getOptionLabel(node: NzTreeNode): string;
    get children(): NzTreeNode[];
    set children(value: Array<NzTreeNode | NzSafeAny>);
    constructor();
    /**
     * Map list of nodes to list of option
     */
    toOptions(nodes: NzTreeNode[]): NzCascaderOption[];
    getAncestorNodeList(node: NzTreeNode | null): NzTreeNode[];
    /**
     * Render by nzCheckedKeys
     * When keys equals null, just render with checkStrictly
     *
     * @param paths
     * @param checkStrictly
     */
    conductCheckPaths(paths: NzTreeNodeKey[][] | null, checkStrictly: boolean): void;
    conductSelectedPaths(paths: NzTreeNodeKey[][]): void;
    private handleMissingNodeList;
    private getMissingNodeList;
    private createMissingNode;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCascaderTreeService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzCascaderTreeService>;
}
export {};
