/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ElementRef, NgZone, OnChanges, OnDestroy, Renderer2, SimpleChanges, TemplateRef, TrackByFunction } from '@angular/core';
import { NzResizeService } from 'ng-zorro-antd/core/services';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzTableSummaryFixedType } from '../table.types';
import * as i0 from "@angular/core";
export declare class NzTableInnerScrollComponent<T> implements OnChanges, AfterViewInit, OnDestroy {
    private renderer;
    private ngZone;
    private platform;
    private resizeService;
    data: readonly T[];
    scrollX: string | null;
    scrollY: string | null;
    contentTemplate: TemplateRef<NzSafeAny> | null;
    widthConfig: string[];
    listOfColWidth: ReadonlyArray<string | null>;
    theadTemplate: TemplateRef<NzSafeAny> | null;
    tfootTemplate: TemplateRef<NzSafeAny> | null;
    tfootFixed: NzTableSummaryFixedType | null;
    virtualTemplate: TemplateRef<NzSafeAny> | null;
    virtualItemSize: number;
    virtualMaxBufferPx: number;
    virtualMinBufferPx: number;
    tableMainElement?: HTMLDivElement;
    virtualForTrackBy: TrackByFunction<T>;
    tableHeaderElement: ElementRef;
    tableBodyElement: ElementRef;
    tableFootElement?: ElementRef;
    cdkVirtualScrollViewport?: CdkVirtualScrollViewport;
    headerStyleMap: {};
    bodyStyleMap: {};
    verticalScrollBarWidth: number;
    noDataVirtualHeight: string;
    private data$;
    private scroll$;
    private destroy$;
    setScrollPositionClassName(clear?: boolean): void;
    constructor(renderer: Renderer2, ngZone: NgZone, platform: Platform, resizeService: NzResizeService);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTableInnerScrollComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTableInnerScrollComponent<any>, "nz-table-inner-scroll", never, { "data": { "alias": "data"; "required": false; }; "scrollX": { "alias": "scrollX"; "required": false; }; "scrollY": { "alias": "scrollY"; "required": false; }; "contentTemplate": { "alias": "contentTemplate"; "required": false; }; "widthConfig": { "alias": "widthConfig"; "required": false; }; "listOfColWidth": { "alias": "listOfColWidth"; "required": false; }; "theadTemplate": { "alias": "theadTemplate"; "required": false; }; "tfootTemplate": { "alias": "tfootTemplate"; "required": false; }; "tfootFixed": { "alias": "tfootFixed"; "required": false; }; "virtualTemplate": { "alias": "virtualTemplate"; "required": false; }; "virtualItemSize": { "alias": "virtualItemSize"; "required": false; }; "virtualMaxBufferPx": { "alias": "virtualMaxBufferPx"; "required": false; }; "virtualMinBufferPx": { "alias": "virtualMinBufferPx"; "required": false; }; "tableMainElement": { "alias": "tableMainElement"; "required": false; }; "virtualForTrackBy": { "alias": "virtualForTrackBy"; "required": false; }; "verticalScrollBarWidth": { "alias": "verticalScrollBarWidth"; "required": false; }; "noDataVirtualHeight": { "alias": "noDataVirtualHeight"; "required": false; }; }, {}, never, never, true, never>;
}
