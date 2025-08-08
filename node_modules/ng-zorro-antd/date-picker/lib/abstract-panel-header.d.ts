/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CandyDate } from 'ng-zorro-antd/core/time';
import { NzCalendarI18nInterface } from 'ng-zorro-antd/i18n';
import { NzDateMode, NzPanelChangeType } from '../standard-types';
import { PanelSelector } from './interface';
import * as i0 from "@angular/core";
export declare abstract class AbstractPanelHeader implements OnInit, OnChanges {
    prefixCls: string;
    selectors: PanelSelector[];
    mode: NzDateMode;
    value: CandyDate;
    locale: NzCalendarI18nInterface;
    showSuperPreBtn: boolean;
    showSuperNextBtn: boolean;
    showPreBtn: boolean;
    showNextBtn: boolean;
    readonly panelChange: EventEmitter<NzPanelChangeType>;
    readonly valueChange: EventEmitter<CandyDate>;
    abstract getSelectors(): PanelSelector[];
    superPreviousTitle(): string;
    previousTitle(): string;
    superNextTitle(): string;
    nextTitle(): string;
    superPrevious(): void;
    superNext(): void;
    previous(): void;
    next(): void;
    changeValue(value: CandyDate): void;
    changeMode(mode: NzDateMode): void;
    private render;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    trackBySelector(selector: PanelSelector): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AbstractPanelHeader, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractPanelHeader, never, never, { "value": { "alias": "value"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "showSuperPreBtn": { "alias": "showSuperPreBtn"; "required": false; }; "showSuperNextBtn": { "alias": "showSuperNextBtn"; "required": false; }; "showPreBtn": { "alias": "showPreBtn"; "required": false; }; "showNextBtn": { "alias": "showNextBtn"; "required": false; }; }, { "panelChange": "panelChange"; "valueChange": "valueChange"; }, never, never, true, never>;
    static ngAcceptInputType_showSuperPreBtn: unknown;
    static ngAcceptInputType_showSuperNextBtn: unknown;
    static ngAcceptInputType_showPreBtn: unknown;
    static ngAcceptInputType_showNextBtn: unknown;
}
