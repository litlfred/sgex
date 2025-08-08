/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges } from '@angular/core';
import { NzMenuItemComponent } from './menu-item.component';
import { MenuService } from './menu.service';
import { NzMenuModeType, NzMenuThemeType } from './menu.types';
import { NzSubMenuComponent } from './submenu.component';
import * as i0 from "@angular/core";
export declare function MenuServiceFactory(): MenuService;
export declare function MenuDropDownTokenFactory(): boolean;
export declare class NzMenuDirective implements AfterContentInit, OnInit, OnChanges, OnDestroy {
    private nzMenuService;
    private cdr;
    listOfNzMenuItemDirective: QueryList<NzMenuItemComponent>;
    isMenuInsideDropDown: boolean;
    listOfNzSubMenuComponent: QueryList<NzSubMenuComponent>;
    nzInlineIndent: number;
    nzTheme: NzMenuThemeType;
    nzMode: NzMenuModeType;
    nzInlineCollapsed: boolean;
    nzSelectable: boolean;
    readonly nzClick: EventEmitter<NzMenuItemComponent>;
    actualMode: NzMenuModeType;
    dir: Direction;
    private inlineCollapsed$;
    private mode$;
    private destroy$;
    private listOfOpenedNzSubMenuComponent;
    private directionality;
    setInlineCollapsed(inlineCollapsed: boolean): void;
    updateInlineCollapse(): void;
    constructor(nzMenuService: MenuService, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMenuDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzMenuDirective, "[nz-menu]", ["nzMenu"], { "nzInlineIndent": { "alias": "nzInlineIndent"; "required": false; }; "nzTheme": { "alias": "nzTheme"; "required": false; }; "nzMode": { "alias": "nzMode"; "required": false; }; "nzInlineCollapsed": { "alias": "nzInlineCollapsed"; "required": false; }; "nzSelectable": { "alias": "nzSelectable"; "required": false; }; }, { "nzClick": "nzClick"; }, ["listOfNzMenuItemDirective", "listOfNzSubMenuComponent"], never, true, never>;
    static ngAcceptInputType_nzInlineCollapsed: unknown;
    static ngAcceptInputType_nzSelectable: unknown;
}
