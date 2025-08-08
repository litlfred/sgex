/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit } from '@angular/core';
import { DateHelperService } from 'ng-zorro-antd/i18n';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell } from './interface';
import * as i0 from "@angular/core";
export declare class QuarterTableComponent extends AbstractTable implements OnChanges, OnInit {
    private dateHelper;
    MAX_ROW: number;
    MAX_COL: number;
    constructor(dateHelper: DateHelperService);
    private changeValueFromInside;
    makeHeadRow(): DateCell[];
    makeBodyRows(): DateBodyRow[];
    private isDisabledQuarter;
    private addCellProperty;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuarterTableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<QuarterTableComponent, "quarter-table", ["quarterTable"], {}, {}, never, never, true, never>;
}
