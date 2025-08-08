/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzI18nService, NzPaginationI18nInterface } from 'ng-zorro-antd/i18n';
import { PaginationItemRenderContext } from './pagination.types';
import * as i0 from "@angular/core";
export declare class NzPaginationComponent implements OnInit, OnDestroy, OnChanges {
    private i18n;
    private cdr;
    private breakpointService;
    protected nzConfigService: NzConfigService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    readonly nzPageSizeChange: EventEmitter<number>;
    readonly nzPageIndexChange: EventEmitter<number>;
    nzShowTotal: TemplateRef<{
        $implicit: number;
        range: [number, number];
    }> | null;
    nzItemRender: TemplateRef<PaginationItemRenderContext> | null;
    nzSize: 'default' | 'small';
    nzPageSizeOptions: number[];
    nzShowSizeChanger: boolean;
    nzShowQuickJumper: boolean;
    nzSimple: boolean;
    nzDisabled: boolean;
    nzResponsive: boolean;
    nzHideOnSinglePage: boolean;
    nzTotal: number;
    nzPageIndex: number;
    nzPageSize: number;
    showPagination: boolean;
    locale: NzPaginationI18nInterface;
    size: 'default' | 'small';
    dir: Direction;
    private destroy$;
    private total$;
    validatePageIndex(value: number, lastIndex: number): number;
    onPageIndexChange(index: number): void;
    onPageSizeChange(size: number): void;
    onTotalChange(total: number): void;
    getLastIndex(total: number, pageSize: number): number;
    constructor(i18n: NzI18nService, cdr: ChangeDetectorRef, breakpointService: NzBreakpointService, nzConfigService: NzConfigService, directionality: Directionality);
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPaginationComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPaginationComponent, "nz-pagination", ["nzPagination"], { "nzShowTotal": { "alias": "nzShowTotal"; "required": false; }; "nzItemRender": { "alias": "nzItemRender"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzPageSizeOptions": { "alias": "nzPageSizeOptions"; "required": false; }; "nzShowSizeChanger": { "alias": "nzShowSizeChanger"; "required": false; }; "nzShowQuickJumper": { "alias": "nzShowQuickJumper"; "required": false; }; "nzSimple": { "alias": "nzSimple"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzResponsive": { "alias": "nzResponsive"; "required": false; }; "nzHideOnSinglePage": { "alias": "nzHideOnSinglePage"; "required": false; }; "nzTotal": { "alias": "nzTotal"; "required": false; }; "nzPageIndex": { "alias": "nzPageIndex"; "required": false; }; "nzPageSize": { "alias": "nzPageSize"; "required": false; }; }, { "nzPageSizeChange": "nzPageSizeChange"; "nzPageIndexChange": "nzPageIndexChange"; }, never, never, true, never>;
    static ngAcceptInputType_nzShowSizeChanger: unknown;
    static ngAcceptInputType_nzShowQuickJumper: unknown;
    static ngAcceptInputType_nzSimple: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzResponsive: unknown;
    static ngAcceptInputType_nzHideOnSinglePage: unknown;
    static ngAcceptInputType_nzTotal: unknown;
    static ngAcceptInputType_nzPageIndex: unknown;
    static ngAcceptInputType_nzPageSize: unknown;
}
