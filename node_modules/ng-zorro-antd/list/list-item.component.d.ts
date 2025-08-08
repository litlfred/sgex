import { AfterViewInit, ChangeDetectorRef, OnDestroy, TemplateRef } from '@angular/core';
import { NzListItemExtraComponent } from './list-item-cell';
import { NzListComponent } from './list.component';
import * as i0 from "@angular/core";
export declare class NzListItemComponent implements OnDestroy, AfterViewInit {
    private parentComp;
    private cdr;
    nzActions: Array<TemplateRef<void>>;
    nzContent?: string | TemplateRef<void>;
    nzExtra: TemplateRef<void> | null;
    nzNoFlex: boolean;
    listItemExtraDirective?: NzListItemExtraComponent;
    private itemLayout?;
    private itemLayout$?;
    get isVerticalAndExtra(): boolean;
    constructor(parentComp: NzListComponent, cdr: ChangeDetectorRef);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListItemComponent, "nz-list-item, [nz-list-item]", ["nzListItem"], { "nzActions": { "alias": "nzActions"; "required": false; }; "nzContent": { "alias": "nzContent"; "required": false; }; "nzExtra": { "alias": "nzExtra"; "required": false; }; "nzNoFlex": { "alias": "nzNoFlex"; "required": false; }; }, {}, ["listItemExtraDirective"], ["nz-list-item-actions, [nz-list-item-actions]", "nz-list-item-meta, [nz-list-item-meta]", "*", "nz-list-item-extra, [nz-list-item-extra]"], true, never>;
    static ngAcceptInputType_nzNoFlex: unknown;
}
