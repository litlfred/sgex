/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzFormatBeforeDropEvent, NzFormatEmitEvent, NzTreeBase, NzTreeBaseService, NzTreeNode, NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare function NzTreeServiceFactory(): NzTreeBaseService;
export declare class NzTreeComponent extends NzTreeBase implements OnInit, OnDestroy, ControlValueAccessor, OnChanges, AfterViewInit {
    nzConfigService: NzConfigService;
    private cdr;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzShowIcon: boolean;
    nzHideUnMatched: boolean;
    nzBlockNode: boolean;
    nzExpandAll: boolean;
    nzSelectMode: boolean;
    nzCheckStrictly: boolean;
    nzShowExpand: boolean;
    nzShowLine: boolean;
    nzCheckable: boolean;
    nzAsyncData: boolean;
    nzDraggable: boolean;
    nzMultiple: boolean;
    nzExpandedIcon?: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }>;
    nzVirtualItemSize: number;
    nzVirtualMaxBufferPx: number;
    nzVirtualMinBufferPx: number;
    nzVirtualHeight: string | null;
    nzTreeTemplate?: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }>;
    nzBeforeDrop?: (confirm: NzFormatBeforeDropEvent) => Observable<boolean>;
    nzData: NzTreeNodeOptions[] | NzTreeNode[];
    nzExpandedKeys: NzTreeNodeKey[];
    nzSelectedKeys: NzTreeNodeKey[];
    nzCheckedKeys: NzTreeNodeKey[];
    nzSearchValue: string;
    nzSearchFunc?: (node: NzTreeNodeOptions) => boolean;
    nzTreeTemplateChild: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }>;
    cdkVirtualScrollViewport: CdkVirtualScrollViewport;
    nzFlattenNodes: NzTreeNode[];
    beforeInit: boolean;
    dir: Direction;
    readonly nzExpandedKeysChange: EventEmitter<string[]>;
    readonly nzSelectedKeysChange: EventEmitter<string[]>;
    readonly nzCheckedKeysChange: EventEmitter<NzTreeNodeKey[]>;
    readonly nzSearchValueChange: EventEmitter<NzFormatEmitEvent>;
    readonly nzClick: EventEmitter<NzFormatEmitEvent>;
    readonly nzDblClick: EventEmitter<NzFormatEmitEvent>;
    readonly nzContextMenu: EventEmitter<NzFormatEmitEvent>;
    readonly nzCheckboxChange: EventEmitter<NzFormatEmitEvent>;
    readonly nzExpandChange: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDragStart: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDragEnter: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDragOver: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDragLeave: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDrop: EventEmitter<NzFormatEmitEvent>;
    readonly nzOnDragEnd: EventEmitter<NzFormatEmitEvent>;
    HIDDEN_STYLE: {
        width: number;
        height: number;
        display: string;
        overflow: string;
        opacity: number;
        border: number;
        padding: number;
        margin: number;
    };
    HIDDEN_NODE_STYLE: {
        position: string;
        pointerEvents: string;
        visibility: string;
        height: number;
        overflow: string;
    };
    destroy$: Subject<boolean>;
    onChange: (value: NzTreeNode[]) => void;
    onTouched: () => void;
    writeValue(value: NzTreeNode[]): void;
    registerOnChange(fn: (_: NzTreeNode[]) => void): void;
    registerOnTouched(fn: () => void): void;
    /**
     * Render all properties of nzTree
     *
     * @param changes all changes from @Input
     */
    renderTreeProperties(changes: SimpleChanges): void;
    trackByFlattenNode(_: number, node: NzTreeNode): string;
    /**
     * nzData
     *
     * @param value
     */
    handleNzData(value: NzSafeAny[]): void;
    handleFlattenNodes(data: NzTreeNode[], expandKeys?: NzTreeNodeKey[] | true): void;
    handleCheckedKeys(keys: NzTreeNodeKey[] | null): void;
    handleExpandedKeys(keys?: NzTreeNodeKey[] | true): void;
    handleSelectedKeys(keys: NzTreeNodeKey[], isMulti: boolean): void;
    handleSearchValue(value: string, searchFunc?: (node: NzTreeNodeOptions) => boolean): void;
    /**
     * Handle emit event
     *
     * @param event
     * handle each event
     */
    eventTriggerChanged(event: NzFormatEmitEvent): void;
    /**
     * Click expand icon
     */
    renderTree(): void;
    noAnimation: NzNoAnimationDirective | null;
    constructor(nzTreeService: NzTreeBaseService, nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeComponent, "nz-tree", ["nzTree"], { "nzShowIcon": { "alias": "nzShowIcon"; "required": false; }; "nzHideUnMatched": { "alias": "nzHideUnMatched"; "required": false; }; "nzBlockNode": { "alias": "nzBlockNode"; "required": false; }; "nzExpandAll": { "alias": "nzExpandAll"; "required": false; }; "nzSelectMode": { "alias": "nzSelectMode"; "required": false; }; "nzCheckStrictly": { "alias": "nzCheckStrictly"; "required": false; }; "nzShowExpand": { "alias": "nzShowExpand"; "required": false; }; "nzShowLine": { "alias": "nzShowLine"; "required": false; }; "nzCheckable": { "alias": "nzCheckable"; "required": false; }; "nzAsyncData": { "alias": "nzAsyncData"; "required": false; }; "nzDraggable": { "alias": "nzDraggable"; "required": false; }; "nzMultiple": { "alias": "nzMultiple"; "required": false; }; "nzExpandedIcon": { "alias": "nzExpandedIcon"; "required": false; }; "nzVirtualItemSize": { "alias": "nzVirtualItemSize"; "required": false; }; "nzVirtualMaxBufferPx": { "alias": "nzVirtualMaxBufferPx"; "required": false; }; "nzVirtualMinBufferPx": { "alias": "nzVirtualMinBufferPx"; "required": false; }; "nzVirtualHeight": { "alias": "nzVirtualHeight"; "required": false; }; "nzTreeTemplate": { "alias": "nzTreeTemplate"; "required": false; }; "nzBeforeDrop": { "alias": "nzBeforeDrop"; "required": false; }; "nzData": { "alias": "nzData"; "required": false; }; "nzExpandedKeys": { "alias": "nzExpandedKeys"; "required": false; }; "nzSelectedKeys": { "alias": "nzSelectedKeys"; "required": false; }; "nzCheckedKeys": { "alias": "nzCheckedKeys"; "required": false; }; "nzSearchValue": { "alias": "nzSearchValue"; "required": false; }; "nzSearchFunc": { "alias": "nzSearchFunc"; "required": false; }; }, { "nzExpandedKeysChange": "nzExpandedKeysChange"; "nzSelectedKeysChange": "nzSelectedKeysChange"; "nzCheckedKeysChange": "nzCheckedKeysChange"; "nzSearchValueChange": "nzSearchValueChange"; "nzClick": "nzClick"; "nzDblClick": "nzDblClick"; "nzContextMenu": "nzContextMenu"; "nzCheckboxChange": "nzCheckboxChange"; "nzExpandChange": "nzExpandChange"; "nzOnDragStart": "nzOnDragStart"; "nzOnDragEnter": "nzOnDragEnter"; "nzOnDragOver": "nzOnDragOver"; "nzOnDragLeave": "nzOnDragLeave"; "nzOnDrop": "nzOnDrop"; "nzOnDragEnd": "nzOnDragEnd"; }, ["nzTreeTemplateChild"], never, true, never>;
    static ngAcceptInputType_nzShowIcon: unknown;
    static ngAcceptInputType_nzHideUnMatched: unknown;
    static ngAcceptInputType_nzBlockNode: unknown;
    static ngAcceptInputType_nzExpandAll: unknown;
    static ngAcceptInputType_nzSelectMode: unknown;
    static ngAcceptInputType_nzCheckStrictly: unknown;
    static ngAcceptInputType_nzShowExpand: unknown;
    static ngAcceptInputType_nzShowLine: unknown;
    static ngAcceptInputType_nzCheckable: unknown;
    static ngAcceptInputType_nzAsyncData: unknown;
    static ngAcceptInputType_nzDraggable: unknown;
    static ngAcceptInputType_nzMultiple: unknown;
}
