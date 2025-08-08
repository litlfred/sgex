/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { MenuService } from './menu.service';
import * as i0 from "@angular/core";
export declare class NzMenuItemComponent implements OnInit, OnChanges, OnDestroy, AfterContentInit {
    private nzMenuService;
    private cdr;
    private destroy$;
    private nzSubmenuService;
    private directionality;
    private routerLink;
    private router;
    isMenuInsideDropDown: boolean;
    level: number;
    selected$: Subject<boolean>;
    inlinePaddingLeft: number | null;
    dir: Direction;
    nzPaddingLeft?: number;
    nzDisabled: boolean;
    nzSelected: boolean;
    nzDanger: boolean;
    nzMatchRouterExact: boolean;
    nzMatchRouter: boolean;
    listOfRouterLink: QueryList<RouterLink>;
    /** clear all item selected status except this */
    clickMenuItem(e: MouseEvent): void;
    setSelectedState(value: boolean): void;
    private updateRouterActive;
    private hasActiveLinks;
    private isLinkActive;
    constructor(nzMenuService: MenuService, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMenuItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzMenuItemComponent, "[nz-menu-item]", ["nzMenuItem"], { "nzPaddingLeft": { "alias": "nzPaddingLeft"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzSelected": { "alias": "nzSelected"; "required": false; }; "nzDanger": { "alias": "nzDanger"; "required": false; }; "nzMatchRouterExact": { "alias": "nzMatchRouterExact"; "required": false; }; "nzMatchRouter": { "alias": "nzMatchRouter"; "required": false; }; }, {}, ["listOfRouterLink"], ["*"], true, never>;
    static ngAcceptInputType_nzPaddingLeft: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzSelected: unknown;
    static ngAcceptInputType_nzDanger: unknown;
    static ngAcceptInputType_nzMatchRouterExact: unknown;
    static ngAcceptInputType_nzMatchRouter: unknown;
}
