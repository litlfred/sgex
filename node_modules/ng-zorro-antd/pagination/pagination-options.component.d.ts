/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NzPaginationI18nInterface } from 'ng-zorro-antd/i18n';
import * as i0 from "@angular/core";
export declare class NzPaginationOptionsComponent implements OnChanges {
    nzSize: 'default' | 'small';
    disabled: boolean;
    showSizeChanger: boolean;
    showQuickJumper: boolean;
    locale: NzPaginationI18nInterface;
    total: number;
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
    readonly pageIndexChange: EventEmitter<number>;
    readonly pageSizeChange: EventEmitter<number>;
    listOfPageSizeOption: Array<{
        value: number;
        label: string;
    }>;
    onPageSizeChange(size: number): void;
    jumpToPageViaInput($event: Event): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPaginationOptionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPaginationOptionsComponent, "li[nz-pagination-options]", never, { "nzSize": { "alias": "nzSize"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "showSizeChanger": { "alias": "showSizeChanger"; "required": false; }; "showQuickJumper": { "alias": "showQuickJumper"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "total": { "alias": "total"; "required": false; }; "pageIndex": { "alias": "pageIndex"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "pageSizeOptions": { "alias": "pageSizeOptions"; "required": false; }; }, { "pageIndexChange": "pageIndexChange"; "pageSizeChange": "pageSizeChange"; }, never, never, true, never>;
}
