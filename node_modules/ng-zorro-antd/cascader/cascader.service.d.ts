/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { NzTreeNode } from 'ng-zorro-antd/core/tree';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzCascaderComponentAsSource, NzCascaderOption } from './typings';
import * as i0 from "@angular/core";
/**
 * All data is stored and parsed in NzCascaderService.
 */
export declare class NzCascaderService implements OnDestroy {
    /** Activated options in each column. */
    activatedNodes: NzTreeNode[];
    /** An array to store cascader items arranged in different layers. */
    columns: NzTreeNode[][];
    /** If user has entered searching mode. */
    inSearchingMode: boolean;
    values: NzSafeAny[];
    /**
     * Emit an event when loading state changes.
     * Emit true if nzOptions is loading by `nzLoadData`.
     */
    readonly $loading: BehaviorSubject<boolean>;
    /**
     * Emit an event to notify cascader it needs to redraw because activated or
     * selected options are changed.
     */
    readonly $redraw: Subject<void>;
    /**
     * Emit an event when an option gets selected.
     * Emit true if a leaf options is selected.
     */
    readonly $nodeSelected: Subject<NzTreeNode | null>;
    /**
     * Emit an event to notify cascader it needs to quit searching mode.
     * Only emit when user do select a searching option.
     */
    readonly $quitSearching: Subject<void>;
    /** To hold columns before entering searching mode. */
    private columnSnapshot;
    private cascaderComponent;
    private searchOptionPathMap;
    /** Return cascader options in the first layer. */
    get nzOptions(): NzCascaderOption[];
    ngOnDestroy(): void;
    /**
     * Bind cascader component so this service could use inputs.
     */
    withComponent(cascaderComponent: NzCascaderComponentAsSource): void;
    /**
     * Try to set an option as activated.
     *
     * @param node Cascader option node
     * @param columnIndex Of which column this option is in
     * @param performSelect Select
     * @param multiple Multiple mode
     * @param loadingChildren Try to load children asynchronously.
     */
    setNodeActivated(node: NzTreeNode, columnIndex: number, performSelect?: boolean, multiple?: boolean, loadingChildren?: boolean): void;
    /**
     * Set an option as selected.
     * @param node
     * @param index
     * @param multiple
     */
    setNodeSelected(node: NzTreeNode, index: number, multiple?: boolean): void;
    setNodeDeactivatedSinceColumn(column: number): void;
    /**
     * Set a searching option as selected, finishing up things.
     *
     * @param node
     * @param multiple
     */
    setSearchOptionSelected(node: NzTreeNode, multiple?: boolean): void;
    /**
     * Reset node's `title` and `disabled` status and clear `searchOptionPathMap`.
     */
    private clearSearchOptions;
    /**
     * Filter cascader options to reset `columns`.
     *
     * @param searchValue The string user wants to search.
     */
    prepareSearchOptions(searchValue: string): void;
    /**
     * Set searching mode by UI. It deals with things not directly related to UI.
     *
     * @param toSearching If this cascader is entering searching mode
     */
    setSearchingMode(toSearching: boolean): void;
    /**
     * Clear selected options.
     */
    clear(): void;
    getOptionLabel(o: NzCascaderOption): string;
    getOptionValue(o: NzCascaderOption): NzSafeAny;
    /**
     * Try to insert options into a column.
     *
     * @param nodes Options to insert
     * @param columnIndex Position
     */
    setColumnData(nodes: NzTreeNode[], columnIndex: number): void;
    /**
     * Set all columns data according to activate option's path
     */
    private trackAncestorColumnData;
    /**
     * Set all ancestor options as activated.
     */
    private trackAncestorActivatedNodes;
    private dropBehindActivatedNodes;
    dropBehindColumns(lastReserveIndex: number): void;
    /**
     * Load children of an option asynchronously.
     */
    loadChildren(node: NzTreeNode | null, columnIndex: number, onLoaded?: (options: NzCascaderOption[]) => void): void;
    isLoaded(index: number): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCascaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzCascaderService>;
}
