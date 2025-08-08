/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NzDirectionVHType, NzSafeAny, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { NzListGrid } from './interface';
import { NzListFooterComponent, NzListLoadMoreDirective, NzListPaginationComponent } from './list-cell';
import * as i0 from "@angular/core";
export declare class NzListComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
    private directionality;
    nzDataSource?: NzSafeAny[];
    nzBordered: boolean;
    nzGrid?: NzListGrid | '' | null | undefined;
    nzHeader?: string | TemplateRef<void>;
    nzFooter?: string | TemplateRef<void>;
    nzItemLayout: NzDirectionVHType;
    nzRenderItem: TemplateRef<{
        $implicit: NzSafeAny;
        index: number;
    }> | null;
    nzLoading: boolean;
    nzLoadMore: TemplateRef<void> | null;
    nzPagination?: TemplateRef<void>;
    nzSize: NzSizeLDSType;
    nzSplit: boolean;
    nzNoResult?: string | TemplateRef<void>;
    nzListFooterComponent: NzListFooterComponent;
    nzListPaginationComponent: NzListPaginationComponent;
    nzListLoadMoreDirective: NzListLoadMoreDirective;
    hasSomethingAfterLastItem: boolean;
    dir: Direction;
    private itemLayoutNotifySource;
    private destroy$;
    get itemLayoutNotify$(): Observable<NzDirectionVHType>;
    constructor(directionality: Directionality);
    ngOnInit(): void;
    getSomethingAfterLastItem(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListComponent, "nz-list, [nz-list]", ["nzList"], { "nzDataSource": { "alias": "nzDataSource"; "required": false; }; "nzBordered": { "alias": "nzBordered"; "required": false; }; "nzGrid": { "alias": "nzGrid"; "required": false; }; "nzHeader": { "alias": "nzHeader"; "required": false; }; "nzFooter": { "alias": "nzFooter"; "required": false; }; "nzItemLayout": { "alias": "nzItemLayout"; "required": false; }; "nzRenderItem": { "alias": "nzRenderItem"; "required": false; }; "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzLoadMore": { "alias": "nzLoadMore"; "required": false; }; "nzPagination": { "alias": "nzPagination"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzSplit": { "alias": "nzSplit"; "required": false; }; "nzNoResult": { "alias": "nzNoResult"; "required": false; }; }, {}, ["nzListFooterComponent", "nzListPaginationComponent", "nzListLoadMoreDirective"], ["nz-list-header", "*", "nz-list-footer, [nz-list-footer]", "nz-list-load-more, [nz-list-load-more]", "nz-list-pagination, [nz-list-pagination]"], true, never>;
    static ngAcceptInputType_nzBordered: unknown;
    static ngAcceptInputType_nzLoading: unknown;
    static ngAcceptInputType_nzSplit: unknown;
}
