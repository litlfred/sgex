/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NzMenuModeType, NzSubmenuTrigger } from './menu.types';
import * as i0 from "@angular/core";
export declare class NzSubMenuTitleComponent implements OnDestroy, OnInit {
    private cdr;
    private directionality;
    nzIcon: string | null;
    nzTitle: string | TemplateRef<void> | null;
    isMenuInsideDropDown: boolean;
    nzDisabled: boolean;
    paddingLeft: number | null;
    mode: NzMenuModeType;
    nzTriggerSubMenuAction: NzSubmenuTrigger;
    readonly toggleSubMenu: EventEmitter<any>;
    readonly subMenuMouseState: EventEmitter<boolean>;
    dir: Direction;
    private destroy$;
    constructor(cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnDestroy(): void;
    setMouseState(state: boolean): void;
    clickTitle(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSubMenuTitleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSubMenuTitleComponent, "[nz-submenu-title]", ["nzSubmenuTitle"], { "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "isMenuInsideDropDown": { "alias": "isMenuInsideDropDown"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "paddingLeft": { "alias": "paddingLeft"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "nzTriggerSubMenuAction": { "alias": "nzTriggerSubMenuAction"; "required": false; }; }, { "toggleSubMenu": "toggleSubMenu"; "subMenuMouseState": "subMenuMouseState"; }, never, ["*"], true, never>;
}
