/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { CandyDate } from 'ng-zorro-antd/core/time';
import { FunctionProp } from 'ng-zorro-antd/core/types';
import { NzCalendarI18nInterface } from 'ng-zorro-antd/i18n';
import { DateBodyRow, DateCell } from './interface';
import * as i0 from "@angular/core";
export declare abstract class AbstractTable implements OnInit, OnChanges {
    headRow: DateCell[];
    bodyRows: DateBodyRow[];
    MAX_ROW: number;
    MAX_COL: number;
    prefixCls: string;
    value: CandyDate;
    locale: NzCalendarI18nInterface;
    activeDate: CandyDate;
    showWeek: boolean;
    selectedValue: CandyDate[];
    hoverValue: CandyDate[];
    disabledDate?: (d: Date) => boolean;
    cellRender?: string | TemplateRef<Date> | FunctionProp<TemplateRef<Date> | string>;
    fullCellRender?: string | TemplateRef<Date> | FunctionProp<TemplateRef<Date> | string>;
    canSelectWeek: boolean;
    readonly valueChange: EventEmitter<CandyDate>;
    readonly cellHover: EventEmitter<CandyDate>;
    protected render(): void;
    hasRangeValue(): boolean;
    getClassMap(cell: DateCell): Record<string, boolean>;
    abstract makeHeadRow(): DateCell[];
    abstract makeBodyRows(): DateBodyRow[];
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private isDateRealChange;
    private isSameDate;
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractTable, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractTable, never, never, { "prefixCls": { "alias": "prefixCls"; "required": false; }; "value": { "alias": "value"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "activeDate": { "alias": "activeDate"; "required": false; }; "showWeek": { "alias": "showWeek"; "required": false; }; "selectedValue": { "alias": "selectedValue"; "required": false; }; "hoverValue": { "alias": "hoverValue"; "required": false; }; "disabledDate": { "alias": "disabledDate"; "required": false; }; "cellRender": { "alias": "cellRender"; "required": false; }; "fullCellRender": { "alias": "fullCellRender"; "required": false; }; "canSelectWeek": { "alias": "canSelectWeek"; "required": false; }; }, { "valueChange": "valueChange"; "cellHover": "cellHover"; }, never, never, true, never>;
    static ngAcceptInputType_showWeek: unknown;
    static ngAcceptInputType_canSelectWeek: unknown;
}
