/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { OnChanges, SimpleChanges, TrackByFunction } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzTreeVirtualNodeData } from './node';
import { NzTreeNodeOutletDirective } from './outlet';
import { NzTreeView } from './tree';
import * as i0 from "@angular/core";
export declare class NzTreeVirtualScrollViewComponent<T> extends NzTreeView<T> implements OnChanges {
    readonly nodeOutlet: NzTreeNodeOutletDirective;
    readonly virtualScrollViewport: CdkVirtualScrollViewport;
    nzItemSize: number;
    nzMinBufferPx: number;
    nzMaxBufferPx: number;
    trackBy: TrackByFunction<T>;
    nodes: Array<NzTreeVirtualNodeData<T>>;
    innerTrackBy: TrackByFunction<NzTreeVirtualNodeData<T>>;
    ngOnChanges({ trackBy }: SimpleChanges): void;
    get compareBy(): ((value: T) => NzSafeAny) | null;
    renderNodeChanges(data: T[] | readonly T[]): void;
    /**
     * @note
     * angular/cdk v18.2.0 breaking changes: https://github.com/angular/components/pull/29062
     * Temporary workaround: revert to old method of getting level
     * TODO: refactor tree-view, remove #treeControl and adopt #levelAccessor and #childrenAccessor
     * */
    _getLevel(nodeData: T): number | undefined;
    private createNode;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeVirtualScrollViewComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeVirtualScrollViewComponent<any>, "nz-tree-virtual-scroll-view", ["nzTreeVirtualScrollView"], { "nzItemSize": { "alias": "nzItemSize"; "required": false; }; "nzMinBufferPx": { "alias": "nzMinBufferPx"; "required": false; }; "nzMaxBufferPx": { "alias": "nzMaxBufferPx"; "required": false; }; "trackBy": { "alias": "trackBy"; "required": false; }; }, {}, never, never, true, never>;
}
