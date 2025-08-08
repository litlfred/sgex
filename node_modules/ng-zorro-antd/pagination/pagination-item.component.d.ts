import { EventEmitter, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { NzPaginationI18nInterface } from 'ng-zorro-antd/i18n';
import { PaginationItemRenderContext, PaginationItemType } from './pagination.types';
import * as i0 from "@angular/core";
export declare class NzPaginationItemComponent implements OnChanges {
    active: boolean;
    locale: NzPaginationI18nInterface;
    index: number | null | undefined;
    disabled: boolean;
    direction: string;
    type: PaginationItemType | string | null | undefined;
    itemRender: TemplateRef<PaginationItemRenderContext> | null;
    readonly diffIndex: EventEmitter<number>;
    readonly gotoIndex: EventEmitter<number>;
    title: string | null;
    clickItem(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzPaginationItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzPaginationItemComponent, "li[nz-pagination-item]", never, { "active": { "alias": "active"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "index": { "alias": "index"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "direction": { "alias": "direction"; "required": false; }; "type": { "alias": "type"; "required": false; }; "itemRender": { "alias": "itemRender"; "required": false; }; }, { "diffIndex": "diffIndex"; "gotoIndex": "gotoIndex"; }, never, never, true, never>;
}
