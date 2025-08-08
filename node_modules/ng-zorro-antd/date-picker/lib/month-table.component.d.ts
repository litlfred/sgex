/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit } from '@angular/core';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell } from './interface';
import * as i0 from "@angular/core";
export declare class MonthTableComponent extends AbstractTable implements OnChanges, OnInit {
    MAX_ROW: number;
    MAX_COL: number;
    private dateHelper;
    makeHeadRow(): DateCell[];
    makeBodyRows(): DateBodyRow[];
    private isDisabledMonth;
    private addCellProperty;
    private chooseMonth;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonthTableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MonthTableComponent, "month-table", ["monthTable"], {}, {}, never, never, true, never>;
}
