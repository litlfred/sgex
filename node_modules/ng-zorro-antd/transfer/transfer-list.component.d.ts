import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, QueryList, TemplateRef } from '@angular/core';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { RenderListContext, TransferDirection, TransferItem, TransferStat } from './interface';
import * as i0 from "@angular/core";
export declare class NzTransferListComponent implements AfterViewInit {
    private cdr;
    direction: TransferDirection;
    titleText: string;
    showSelectAll: boolean;
    dataSource: TransferItem[];
    itemUnit: string | undefined;
    itemsUnit: string | undefined;
    filter: string;
    oneWay: boolean;
    disabled: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    notFoundContent?: string;
    filterOption?: (inputValue: string, item: TransferItem) => boolean;
    renderList: TemplateRef<RenderListContext> | null;
    render: TemplateRef<{
        $implicit: TransferItem;
    }> | null;
    footer: TemplateRef<{
        $implicit: TransferDirection;
    }> | null;
    readonly handleSelectAll: EventEmitter<boolean>;
    readonly handleSelect: EventEmitter<TransferItem>;
    readonly filterChange: EventEmitter<{
        direction: TransferDirection;
        value: string;
    }>;
    readonly moveToLeft: EventEmitter<void>;
    headerCheckbox?: NzCheckboxComponent;
    checkboxes: QueryList<ElementRef<HTMLLabelElement>>;
    stat: TransferStat;
    get validData(): TransferItem[];
    get availableData(): TransferItem[];
    onItemSelect: (item: TransferItem) => void;
    onItemSelectAll: (status: boolean) => void;
    private updateCheckStatus;
    handleFilter(value: string): void;
    handleClear(): void;
    deleteItem(item: TransferItem): void;
    private matchFilter;
    constructor(cdr: ChangeDetectorRef);
    markForCheck(): void;
    ngAfterViewInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTransferListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTransferListComponent, "nz-transfer-list", ["nzTransferList"], { "direction": { "alias": "direction"; "required": false; }; "titleText": { "alias": "titleText"; "required": false; }; "showSelectAll": { "alias": "showSelectAll"; "required": false; }; "dataSource": { "alias": "dataSource"; "required": false; }; "itemUnit": { "alias": "itemUnit"; "required": false; }; "itemsUnit": { "alias": "itemsUnit"; "required": false; }; "filter": { "alias": "filter"; "required": false; }; "oneWay": { "alias": "oneWay"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "showSearch": { "alias": "showSearch"; "required": false; }; "searchPlaceholder": { "alias": "searchPlaceholder"; "required": false; }; "notFoundContent": { "alias": "notFoundContent"; "required": false; }; "filterOption": { "alias": "filterOption"; "required": false; }; "renderList": { "alias": "renderList"; "required": false; }; "render": { "alias": "render"; "required": false; }; "footer": { "alias": "footer"; "required": false; }; }, { "handleSelectAll": "handleSelectAll"; "handleSelect": "handleSelect"; "filterChange": "filterChange"; "moveToLeft": "moveToLeft"; }, never, never, true, never>;
    static ngAcceptInputType_disabled: unknown;
    static ngAcceptInputType_showSearch: unknown;
}
