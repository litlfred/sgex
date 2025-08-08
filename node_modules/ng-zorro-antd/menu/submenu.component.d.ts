/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { AfterContentInit, ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { POSITION_TYPE_HORIZONTAL } from 'ng-zorro-antd/core/overlay';
import { NzMenuItemComponent } from './menu-item.component';
import { MenuService } from './menu.service';
import { NzMenuModeType, NzMenuThemeType, NzSubmenuTrigger } from './menu.types';
import { NzSubmenuService } from './submenu.service';
import * as i0 from "@angular/core";
export declare class NzSubMenuComponent implements OnInit, OnDestroy, AfterContentInit, OnChanges {
    nzMenuService: MenuService;
    private cdr;
    private platform;
    nzMenuClassName: string;
    nzPaddingLeft: number | null;
    nzTitle: string | TemplateRef<void> | null;
    nzIcon: string | null;
    nzTriggerSubMenuAction: NzSubmenuTrigger;
    nzOpen: boolean;
    nzDisabled: boolean;
    nzPlacement: POSITION_TYPE_HORIZONTAL;
    readonly nzOpenChange: EventEmitter<boolean>;
    cdkOverlayOrigin: ElementRef | null;
    listOfNzSubMenuComponent: QueryList<NzSubMenuComponent> | null;
    listOfNzMenuItemDirective: QueryList<NzMenuItemComponent> | null;
    nzSubmenuService: NzSubmenuService;
    private level;
    private destroy$;
    position: string;
    triggerWidth: number | null;
    theme: NzMenuThemeType;
    mode: NzMenuModeType;
    inlinePaddingLeft: number | null;
    overlayPositions: import("@angular/cdk/overlay").ConnectionPositionPair[];
    isSelected: boolean;
    isActive: boolean;
    dir: Direction;
    isMenuInsideDropDown: boolean;
    noAnimation: NzNoAnimationDirective | null;
    private directionality;
    /** set the submenu host open status directly **/
    setOpenStateWithoutDebounce(open: boolean): void;
    toggleSubMenu(): void;
    setMouseEnterState(value: boolean): void;
    setTriggerWidth(): void;
    onPositionChange(position: ConnectedOverlayPositionChange): void;
    constructor(nzMenuService: MenuService, cdr: ChangeDetectorRef, platform: Platform);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSubMenuComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSubMenuComponent, "[nz-submenu]", ["nzSubmenu"], { "nzMenuClassName": { "alias": "nzMenuClassName"; "required": false; }; "nzPaddingLeft": { "alias": "nzPaddingLeft"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzTriggerSubMenuAction": { "alias": "nzTriggerSubMenuAction"; "required": false; }; "nzOpen": { "alias": "nzOpen"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzPlacement": { "alias": "nzPlacement"; "required": false; }; }, { "nzOpenChange": "nzOpenChange"; }, ["listOfNzSubMenuComponent", "listOfNzMenuItemDirective"], ["[title]", "*"], true, never>;
    static ngAcceptInputType_nzOpen: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
}
