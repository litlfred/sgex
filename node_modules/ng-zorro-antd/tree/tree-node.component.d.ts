/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzFormatBeforeDropEvent, NzFormatEmitEvent, NzTreeBaseService, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import * as i0 from "@angular/core";
export declare class NzTreeNodeBuiltinComponent implements OnInit, OnChanges, OnDestroy {
    nzTreeService: NzTreeBaseService;
    private ngZone;
    private renderer;
    private elementRef;
    private cdr;
    /**
     * for global property
     */
    icon: string;
    title: string;
    isLoading: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isMatched: boolean;
    isExpanded: boolean;
    isLeaf: boolean;
    isChecked?: boolean;
    isHalfChecked?: boolean;
    isDisableCheckbox?: boolean;
    isSelectable?: boolean;
    canHide?: boolean;
    isStart: boolean[];
    isEnd: boolean[];
    nzTreeNode: NzTreeNode;
    nzShowLine?: boolean;
    nzShowExpand?: boolean;
    nzCheckable?: boolean;
    nzAsyncData?: boolean;
    nzHideUnMatched: boolean;
    nzNoAnimation: boolean;
    nzSelectMode: boolean;
    nzShowIcon: boolean;
    nzExpandedIcon?: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }>;
    nzTreeTemplate: TemplateRef<{
        $implicit: NzTreeNode;
        origin: NzTreeNodeOptions;
    }> | null;
    nzBeforeDrop?: (confirm: NzFormatBeforeDropEvent) => Observable<boolean>;
    nzSearchValue: string;
    nzDraggable: boolean;
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
    /**
     * drag var
     */
    destroy$: Subject<boolean>;
    dragPos: number;
    dragPosClass: Record<string, string>;
    draggingKey: string | null;
    showIndicator: boolean;
    /**
     * default set
     */
    get displayStyle(): string;
    get isSwitcherOpen(): boolean;
    get isSwitcherClose(): boolean;
    /**
     * collapse node
     *
     * @param event
     */
    clickExpand(event: MouseEvent): void;
    clickSelect(event: MouseEvent): void;
    dblClick(event: MouseEvent): void;
    contextMenu(event: MouseEvent): void;
    /**
     * check node
     *
     * @param event
     */
    clickCheckbox(event: MouseEvent): void;
    clearDragClass(): void;
    /**
     * drag event
     *
     * @param e
     */
    handleDragStart(e: DragEvent): void;
    handleDragEnter(e: DragEvent): void;
    handleDragOver(e: DragEvent): void;
    handleDragLeave(e: DragEvent): void;
    handleDragDrop(e: DragEvent): void;
    handleDragEnd(e: DragEvent): void;
    /**
     * Listening to dragging events.
     */
    handDragEvent(): void;
    markForCheck(): void;
    noAnimation: NzNoAnimationDirective | null;
    constructor(nzTreeService: NzTreeBaseService, ngZone: NgZone, renderer: Renderer2, elementRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private renderIndicator;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeBuiltinComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeNodeBuiltinComponent, "nz-tree-node[builtin]", ["nzTreeBuiltinNode"], { "icon": { "alias": "icon"; "required": false; }; "title": { "alias": "title"; "required": false; }; "isLoading": { "alias": "isLoading"; "required": false; }; "isSelected": { "alias": "isSelected"; "required": false; }; "isDisabled": { "alias": "isDisabled"; "required": false; }; "isMatched": { "alias": "isMatched"; "required": false; }; "isExpanded": { "alias": "isExpanded"; "required": false; }; "isLeaf": { "alias": "isLeaf"; "required": false; }; "isChecked": { "alias": "isChecked"; "required": false; }; "isHalfChecked": { "alias": "isHalfChecked"; "required": false; }; "isDisableCheckbox": { "alias": "isDisableCheckbox"; "required": false; }; "isSelectable": { "alias": "isSelectable"; "required": false; }; "canHide": { "alias": "canHide"; "required": false; }; "isStart": { "alias": "isStart"; "required": false; }; "isEnd": { "alias": "isEnd"; "required": false; }; "nzTreeNode": { "alias": "nzTreeNode"; "required": false; }; "nzShowLine": { "alias": "nzShowLine"; "required": false; }; "nzShowExpand": { "alias": "nzShowExpand"; "required": false; }; "nzCheckable": { "alias": "nzCheckable"; "required": false; }; "nzAsyncData": { "alias": "nzAsyncData"; "required": false; }; "nzHideUnMatched": { "alias": "nzHideUnMatched"; "required": false; }; "nzNoAnimation": { "alias": "nzNoAnimation"; "required": false; }; "nzSelectMode": { "alias": "nzSelectMode"; "required": false; }; "nzShowIcon": { "alias": "nzShowIcon"; "required": false; }; "nzExpandedIcon": { "alias": "nzExpandedIcon"; "required": false; }; "nzTreeTemplate": { "alias": "nzTreeTemplate"; "required": false; }; "nzBeforeDrop": { "alias": "nzBeforeDrop"; "required": false; }; "nzSearchValue": { "alias": "nzSearchValue"; "required": false; }; "nzDraggable": { "alias": "nzDraggable"; "required": false; }; }, { "nzClick": "nzClick"; "nzDblClick": "nzDblClick"; "nzContextMenu": "nzContextMenu"; "nzCheckboxChange": "nzCheckboxChange"; "nzExpandChange": "nzExpandChange"; "nzOnDragStart": "nzOnDragStart"; "nzOnDragEnter": "nzOnDragEnter"; "nzOnDragOver": "nzOnDragOver"; "nzOnDragLeave": "nzOnDragLeave"; "nzOnDrop": "nzOnDrop"; "nzOnDragEnd": "nzOnDragEnd"; }, never, never, true, never>;
    static ngAcceptInputType_isLoading: unknown;
    static ngAcceptInputType_isSelected: unknown;
    static ngAcceptInputType_isDisabled: unknown;
    static ngAcceptInputType_isMatched: unknown;
    static ngAcceptInputType_isExpanded: unknown;
    static ngAcceptInputType_isLeaf: unknown;
    static ngAcceptInputType_isChecked: unknown;
    static ngAcceptInputType_isHalfChecked: unknown;
    static ngAcceptInputType_isDisableCheckbox: unknown;
    static ngAcceptInputType_isSelectable: unknown;
    static ngAcceptInputType_canHide: unknown;
    static ngAcceptInputType_nzShowLine: unknown;
    static ngAcceptInputType_nzShowExpand: unknown;
    static ngAcceptInputType_nzCheckable: unknown;
    static ngAcceptInputType_nzAsyncData: unknown;
    static ngAcceptInputType_nzHideUnMatched: unknown;
    static ngAcceptInputType_nzNoAnimation: unknown;
    static ngAcceptInputType_nzSelectMode: unknown;
    static ngAcceptInputType_nzShowIcon: unknown;
    static ngAcceptInputType_nzDraggable: unknown;
}
