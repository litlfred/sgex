/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ElementRef, EventEmitter, NgZone, OnDestroy, Renderer2 } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzResizableService } from './resizable.service';
import { NzResizeDirection } from './resize-handle.component';
import * as i0 from "@angular/core";
export interface NzResizeEvent {
    width?: number;
    height?: number;
    col?: number;
    mouseEvent?: MouseEvent | TouchEvent;
    direction?: NzResizeDirection;
}
export declare class NzResizableDirective implements AfterViewInit, OnDestroy {
    private elementRef;
    private renderer;
    private nzResizableService;
    private platform;
    private ngZone;
    private destroy$;
    nzBounds: 'window' | 'parent' | ElementRef<HTMLElement>;
    nzMaxHeight?: number;
    nzMaxWidth?: number;
    nzMinHeight: number;
    nzMinWidth: number;
    nzGridColumnCount: number;
    nzMaxColumn: number;
    nzMinColumn: number;
    nzLockAspectRatio: boolean;
    nzPreview: boolean;
    nzDisabled: boolean;
    readonly nzResize: EventEmitter<NzResizeEvent>;
    readonly nzResizeEnd: EventEmitter<NzResizeEvent>;
    readonly nzResizeStart: EventEmitter<NzResizeEvent>;
    resizing: boolean;
    private elRect;
    private currentHandleEvent;
    private ghostElement;
    private el;
    private sizeCache;
    constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2, nzResizableService: NzResizableService, platform: Platform, ngZone: NgZone, destroy$: NzDestroyService);
    setPosition(): void;
    calcSize(width: number, height: number, ratio: number): NzResizeEvent;
    resize(event: MouseEvent | TouchEvent): void;
    endResize(event: MouseEvent | TouchEvent): void;
    previewResize({ width, height }: NzResizeEvent): void;
    createGhostElement(): void;
    removeGhostElement(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzResizableDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzResizableDirective, "[nz-resizable]", ["nzResizable"], { "nzBounds": { "alias": "nzBounds"; "required": false; }; "nzMaxHeight": { "alias": "nzMaxHeight"; "required": false; }; "nzMaxWidth": { "alias": "nzMaxWidth"; "required": false; }; "nzMinHeight": { "alias": "nzMinHeight"; "required": false; }; "nzMinWidth": { "alias": "nzMinWidth"; "required": false; }; "nzGridColumnCount": { "alias": "nzGridColumnCount"; "required": false; }; "nzMaxColumn": { "alias": "nzMaxColumn"; "required": false; }; "nzMinColumn": { "alias": "nzMinColumn"; "required": false; }; "nzLockAspectRatio": { "alias": "nzLockAspectRatio"; "required": false; }; "nzPreview": { "alias": "nzPreview"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; }, { "nzResize": "nzResize"; "nzResizeEnd": "nzResizeEnd"; "nzResizeStart": "nzResizeStart"; }, never, never, true, never>;
    static ngAcceptInputType_nzMinHeight: unknown;
    static ngAcceptInputType_nzMinWidth: unknown;
    static ngAcceptInputType_nzGridColumnCount: unknown;
    static ngAcceptInputType_nzMaxColumn: unknown;
    static ngAcceptInputType_nzMinColumn: unknown;
    static ngAcceptInputType_nzLockAspectRatio: unknown;
    static ngAcceptInputType_nzPreview: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
}
