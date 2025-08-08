/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit } from '@angular/core';
import { CandyDate } from 'ng-zorro-antd/core/time';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell } from './interface';
import * as i0 from "@angular/core";
export declare class DateTableComponent extends AbstractTable implements OnChanges, OnInit {
    format?: string;
    private i18n;
    private dateHelper;
    private changeValueFromInside;
    makeHeadRow(): DateCell[];
    private getVeryShortWeekFormat;
    makeBodyRows(): DateBodyRow[];
    addCellProperty(cell: DateCell, date: CandyDate): void;
    getClassMap(cell: DateCell): Record<string, boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateTableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DateTableComponent, "date-table", ["dateTable"], { "format": { "alias": "format"; "required": false; }; }, {}, never, never, true, never>;
}
