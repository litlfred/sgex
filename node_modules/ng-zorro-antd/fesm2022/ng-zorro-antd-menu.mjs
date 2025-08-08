import * as i1 from '@angular/cdk/bidi';
import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, inject, booleanAttribute, ContentChildren, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, EventEmitter, Output, ElementRef, forwardRef, ViewChild, Directive, NgModule } from '@angular/core';
import { Subject, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { map, mergeMap, filter, auditTime, distinctUntilChanged, takeUntil, startWith, switchMap } from 'rxjs/operators';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { numberAttributeWithZeroFallback } from 'ng-zorro-antd/core/util';
import * as i3$1 from '@angular/cdk/overlay';
import { OverlayModule, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { POSITION_MAP, getPlacementName } from 'ng-zorro-antd/core/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { collapseMotion, zoomBigMotion, slideMotion } from 'ng-zorro-antd/core/animation';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2$1 from '@angular/cdk/platform';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NzIsMenuInsideDropDownToken = new InjectionToken('NzIsInDropDownMenuToken');
const NzMenuServiceLocalToken = new InjectionToken('NzMenuServiceLocalToken');

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class MenuService {
    /** all descendant menu click **/
    descendantMenuItemClick$ = new Subject();
    /** child menu item click **/
    childMenuItemClick$ = new Subject();
    theme$ = new BehaviorSubject('light');
    mode$ = new BehaviorSubject('vertical');
    inlineIndent$ = new BehaviorSubject(24);
    isChildSubMenuOpen$ = new BehaviorSubject(false);
    onDescendantMenuItemClick(menu) {
        this.descendantMenuItemClick$.next(menu);
    }
    onChildMenuItemClick(menu) {
        this.childMenuItemClick$.next(menu);
    }
    setMode(mode) {
        this.mode$.next(mode);
    }
    setTheme(theme) {
        this.theme$.next(theme);
    }
    setInlineIndent(indent) {
        this.inlineIndent$.next(indent);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: MenuService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: MenuService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: MenuService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSubmenuService {
    nzMenuService = inject(MenuService);
    mode$ = this.nzMenuService.mode$.pipe(map(mode => {
        if (mode === 'inline') {
            return 'inline';
            /** if inside another submenu, set the mode to vertical **/
        }
        else if (mode === 'vertical' || this.nzHostSubmenuService) {
            return 'vertical';
        }
        else {
            return 'horizontal';
        }
    }));
    level = 1;
    isMenuInsideDropDown = inject(NzIsMenuInsideDropDownToken);
    isCurrentSubMenuOpen$ = new BehaviorSubject(false);
    isChildSubMenuOpen$ = new BehaviorSubject(false);
    /** submenu title & overlay mouse enter status **/
    isMouseEnterTitleOrOverlay$ = new Subject();
    childMenuItemClick$ = new Subject();
    destroy$ = new Subject();
    nzHostSubmenuService = inject(NzSubmenuService, { optional: true, skipSelf: true });
    /**
     * menu item inside submenu clicked
     *
     * @param menu
     */
    onChildMenuItemClick(menu) {
        this.childMenuItemClick$.next(menu);
    }
    setOpenStateWithoutDebounce(value) {
        this.isCurrentSubMenuOpen$.next(value);
    }
    setMouseEnterTitleOrOverlayState(value) {
        this.isMouseEnterTitleOrOverlay$.next(value);
    }
    constructor() {
        if (this.nzHostSubmenuService) {
            this.level = this.nzHostSubmenuService.level + 1;
        }
        /** close if menu item clicked **/
        const isClosedByMenuItemClick = this.childMenuItemClick$.pipe(mergeMap(() => this.mode$), filter(mode => mode !== 'inline' || this.isMenuInsideDropDown), map(() => false));
        const isCurrentSubmenuOpen$ = merge(this.isMouseEnterTitleOrOverlay$, isClosedByMenuItemClick);
        /** combine the child submenu status with current submenu status to calculate host submenu open **/
        const isSubMenuOpenWithDebounce$ = combineLatest([this.isChildSubMenuOpen$, isCurrentSubmenuOpen$]).pipe(map(([isChildSubMenuOpen, isCurrentSubmenuOpen]) => isChildSubMenuOpen || isCurrentSubmenuOpen), auditTime(150), distinctUntilChanged(), takeUntil(this.destroy$));
        isSubMenuOpenWithDebounce$.pipe(distinctUntilChanged()).subscribe(data => {
            this.setOpenStateWithoutDebounce(data);
            if (this.nzHostSubmenuService) {
                /** set parent submenu's child submenu open status **/
                this.nzHostSubmenuService.isChildSubMenuOpen$.next(data);
            }
            else {
                this.nzMenuService.isChildSubMenuOpen$.next(data);
            }
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMenuItemComponent {
    nzMenuService;
    cdr;
    destroy$ = new Subject();
    nzSubmenuService = inject(NzSubmenuService, { optional: true });
    directionality = inject(Directionality);
    routerLink = inject(RouterLink, { optional: true });
    router = inject(Router, { optional: true });
    isMenuInsideDropDown = inject(NzIsMenuInsideDropDownToken);
    level = this.nzSubmenuService ? this.nzSubmenuService.level + 1 : 1;
    selected$ = new Subject();
    inlinePaddingLeft = null;
    dir = 'ltr';
    nzPaddingLeft;
    nzDisabled = false;
    nzSelected = false;
    nzDanger = false;
    nzMatchRouterExact = false;
    nzMatchRouter = false;
    listOfRouterLink;
    /** clear all item selected status except this */
    clickMenuItem(e) {
        if (this.nzDisabled) {
            e.preventDefault();
            e.stopPropagation();
        }
        else {
            this.nzMenuService.onDescendantMenuItemClick(this);
            if (this.nzSubmenuService) {
                /** menu item inside the submenu **/
                this.nzSubmenuService.onChildMenuItemClick(this);
            }
            else {
                /** menu item inside the root menu **/
                this.nzMenuService.onChildMenuItemClick(this);
            }
        }
    }
    setSelectedState(value) {
        this.nzSelected = value;
        this.selected$.next(value);
    }
    updateRouterActive() {
        if (!this.listOfRouterLink || !this.router || !this.router.navigated || !this.nzMatchRouter) {
            return;
        }
        Promise.resolve().then(() => {
            const hasActiveLinks = this.hasActiveLinks();
            if (this.nzSelected !== hasActiveLinks) {
                this.nzSelected = hasActiveLinks;
                this.setSelectedState(this.nzSelected);
                this.cdr.markForCheck();
            }
        });
    }
    hasActiveLinks() {
        const isActiveCheckFn = this.isLinkActive(this.router);
        return (this.routerLink && isActiveCheckFn(this.routerLink)) || this.listOfRouterLink.some(isActiveCheckFn);
    }
    isLinkActive(router) {
        return (link) => router.isActive(link.urlTree || '', {
            paths: this.nzMatchRouterExact ? 'exact' : 'subset',
            queryParams: this.nzMatchRouterExact ? 'exact' : 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
        });
    }
    constructor(nzMenuService, cdr) {
        this.nzMenuService = nzMenuService;
        this.cdr = cdr;
        if (this.router) {
            this.router.events.pipe(takeUntil(this.destroy$), filter(e => e instanceof NavigationEnd)).subscribe(() => {
                this.updateRouterActive();
            });
        }
    }
    ngOnInit() {
        /** store origin padding in padding */
        combineLatest([this.nzMenuService.mode$, this.nzMenuService.inlineIndent$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([mode, inlineIndent]) => {
            this.inlinePaddingLeft = mode === 'inline' ? this.level * inlineIndent : null;
        });
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngAfterContentInit() {
        this.listOfRouterLink.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateRouterActive());
        this.updateRouterActive();
    }
    ngOnChanges(changes) {
        if (changes.nzSelected) {
            this.setSelectedState(this.nzSelected);
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuItemComponent, deps: [{ token: MenuService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzMenuItemComponent, isStandalone: true, selector: "[nz-menu-item]", inputs: { nzPaddingLeft: ["nzPaddingLeft", "nzPaddingLeft", numberAttributeWithZeroFallback], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzSelected: ["nzSelected", "nzSelected", booleanAttribute], nzDanger: ["nzDanger", "nzDanger", booleanAttribute], nzMatchRouterExact: ["nzMatchRouterExact", "nzMatchRouterExact", booleanAttribute], nzMatchRouter: ["nzMatchRouter", "nzMatchRouter", booleanAttribute] }, host: { listeners: { "click": "clickMenuItem($event)" }, properties: { "class.ant-dropdown-menu-item": "isMenuInsideDropDown", "class.ant-dropdown-menu-item-selected": "isMenuInsideDropDown && nzSelected", "class.ant-dropdown-menu-item-danger": "isMenuInsideDropDown && nzDanger", "class.ant-dropdown-menu-item-disabled": "isMenuInsideDropDown && nzDisabled", "class.ant-menu-item": "!isMenuInsideDropDown", "class.ant-menu-item-selected": "!isMenuInsideDropDown && nzSelected", "class.ant-menu-item-danger": "!isMenuInsideDropDown && nzDanger", "class.ant-menu-item-disabled": "!isMenuInsideDropDown && nzDisabled", "style.paddingLeft.px": "dir === 'rtl' ? null : nzPaddingLeft || inlinePaddingLeft", "style.paddingRight.px": "dir === 'rtl' ? nzPaddingLeft || inlinePaddingLeft : null" } }, queries: [{ propertyName: "listOfRouterLink", predicate: RouterLink, descendants: true }], exportAs: ["nzMenuItem"], usesOnChanges: true, ngImport: i0, template: `
    <span class="ant-menu-title-content">
      <ng-content></ng-content>
    </span>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuItemComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-menu-item]',
                    exportAs: 'nzMenuItem',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    template: `
    <span class="ant-menu-title-content">
      <ng-content></ng-content>
    </span>
  `,
                    host: {
                        '[class.ant-dropdown-menu-item]': `isMenuInsideDropDown`,
                        '[class.ant-dropdown-menu-item-selected]': `isMenuInsideDropDown && nzSelected`,
                        '[class.ant-dropdown-menu-item-danger]': `isMenuInsideDropDown && nzDanger`,
                        '[class.ant-dropdown-menu-item-disabled]': `isMenuInsideDropDown && nzDisabled`,
                        '[class.ant-menu-item]': `!isMenuInsideDropDown`,
                        '[class.ant-menu-item-selected]': `!isMenuInsideDropDown && nzSelected`,
                        '[class.ant-menu-item-danger]': `!isMenuInsideDropDown && nzDanger`,
                        '[class.ant-menu-item-disabled]': `!isMenuInsideDropDown && nzDisabled`,
                        '[style.paddingLeft.px]': `dir === 'rtl' ? null : nzPaddingLeft || inlinePaddingLeft`,
                        '[style.paddingRight.px]': `dir === 'rtl' ? nzPaddingLeft || inlinePaddingLeft : null`,
                        '(click)': 'clickMenuItem($event)'
                    }
                }]
        }], ctorParameters: () => [{ type: MenuService }, { type: i0.ChangeDetectorRef }], propDecorators: { nzPaddingLeft: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelected: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDanger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMatchRouterExact: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMatchRouter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], listOfRouterLink: [{
                type: ContentChildren,
                args: [RouterLink, { descendants: true }]
            }] } });

class NzSubmenuInlineChildComponent {
    elementRef;
    renderer;
    directionality;
    templateOutlet = null;
    menuClass = '';
    mode = 'vertical';
    nzOpen = false;
    listOfCacheClassName = [];
    expandState = 'collapsed';
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(elementRef, renderer, directionality) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.directionality = directionality;
    }
    calcMotionState() {
        if (this.nzOpen) {
            this.expandState = 'expanded';
        }
        else {
            this.expandState = 'collapsed';
        }
    }
    ngOnInit() {
        this.calcMotionState();
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnChanges(changes) {
        const { mode, nzOpen, menuClass } = changes;
        if (mode || nzOpen) {
            this.calcMotionState();
        }
        if (menuClass) {
            if (this.listOfCacheClassName.length) {
                this.listOfCacheClassName
                    .filter(item => !!item)
                    .forEach(className => {
                    this.renderer.removeClass(this.elementRef.nativeElement, className);
                });
            }
            if (this.menuClass) {
                this.listOfCacheClassName = this.menuClass.split(' ');
                this.listOfCacheClassName
                    .filter(item => !!item)
                    .forEach(className => {
                    this.renderer.addClass(this.elementRef.nativeElement, className);
                });
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuInlineChildComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzSubmenuInlineChildComponent, isStandalone: true, selector: "[nz-submenu-inline-child]", inputs: { templateOutlet: "templateOutlet", menuClass: "menuClass", mode: "mode", nzOpen: "nzOpen" }, host: { properties: { "class.ant-menu-rtl": "dir === 'rtl'", "@collapseMotion": "expandState" }, classAttribute: "ant-menu ant-menu-inline ant-menu-sub" }, exportAs: ["nzSubmenuInlineChild"], usesOnChanges: true, ngImport: i0, template: ` <ng-template [ngTemplateOutlet]="templateOutlet"></ng-template> `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], animations: [collapseMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuInlineChildComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-submenu-inline-child]',
                    animations: [collapseMotion],
                    exportAs: 'nzSubmenuInlineChild',
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: ` <ng-template [ngTemplateOutlet]="templateOutlet"></ng-template> `,
                    host: {
                        class: 'ant-menu ant-menu-inline ant-menu-sub',
                        '[class.ant-menu-rtl]': `dir === 'rtl'`,
                        '[@collapseMotion]': 'expandState'
                    },
                    imports: [NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.Directionality }], propDecorators: { templateOutlet: [{
                type: Input
            }], menuClass: [{
                type: Input
            }], mode: [{
                type: Input
            }], nzOpen: [{
                type: Input
            }] } });

class NzSubmenuNoneInlineChildComponent {
    directionality;
    menuClass = '';
    theme = 'light';
    templateOutlet = null;
    isMenuInsideDropDown = false;
    mode = 'vertical';
    nzTriggerSubMenuAction = 'hover';
    position = 'right';
    nzDisabled = false;
    nzOpen = false;
    subMenuMouseState = new EventEmitter();
    constructor(directionality) {
        this.directionality = directionality;
    }
    setMouseState(state) {
        if (!this.nzDisabled && this.nzTriggerSubMenuAction === 'hover') {
            this.subMenuMouseState.next(state);
        }
    }
    expandState = 'collapsed';
    dir = 'ltr';
    destroy$ = new Subject();
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    calcMotionState() {
        if (this.nzOpen) {
            if (this.mode === 'horizontal') {
                this.expandState = 'bottom';
            }
            else if (this.mode === 'vertical') {
                this.expandState = 'active';
            }
        }
        else {
            this.expandState = 'collapsed';
        }
    }
    ngOnInit() {
        this.calcMotionState();
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnChanges(changes) {
        const { mode, nzOpen } = changes;
        if (mode || nzOpen) {
            this.calcMotionState();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuNoneInlineChildComponent, deps: [{ token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzSubmenuNoneInlineChildComponent, isStandalone: true, selector: "[nz-submenu-none-inline-child]", inputs: { menuClass: "menuClass", theme: "theme", templateOutlet: "templateOutlet", isMenuInsideDropDown: "isMenuInsideDropDown", mode: "mode", nzTriggerSubMenuAction: "nzTriggerSubMenuAction", position: "position", nzDisabled: "nzDisabled", nzOpen: "nzOpen" }, outputs: { subMenuMouseState: "subMenuMouseState" }, host: { listeners: { "mouseenter": "setMouseState(true)", "mouseleave": "setMouseState(false)" }, properties: { "class.ant-menu-light": "theme === 'light'", "class.ant-menu-dark": "theme === 'dark'", "class.ant-menu-submenu-placement-bottom": "mode === 'horizontal'", "class.ant-menu-submenu-placement-right": "mode === 'vertical' && position === 'right'", "class.ant-menu-submenu-placement-left": "mode === 'vertical' && position === 'left'", "class.ant-menu-submenu-rtl": "dir ===\"rtl\"", "@slideMotion": "expandState", "@zoomBigMotion": "expandState" }, classAttribute: "ant-menu-submenu ant-menu-submenu-popup" }, exportAs: ["nzSubmenuNoneInlineChild"], usesOnChanges: true, ngImport: i0, template: `
    <div
      [class.ant-dropdown-menu]="isMenuInsideDropDown"
      [class.ant-menu]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-vertical]="isMenuInsideDropDown"
      [class.ant-menu-vertical]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-sub]="isMenuInsideDropDown"
      [class.ant-menu-sub]="!isMenuInsideDropDown"
      [class.ant-menu-rtl]="dir === 'rtl'"
      [class]="menuClass"
    >
      <ng-template [ngTemplateOutlet]="templateOutlet"></ng-template>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], animations: [zoomBigMotion, slideMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubmenuNoneInlineChildComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-submenu-none-inline-child]',
                    exportAs: 'nzSubmenuNoneInlineChild',
                    encapsulation: ViewEncapsulation.None,
                    animations: [zoomBigMotion, slideMotion],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div
      [class.ant-dropdown-menu]="isMenuInsideDropDown"
      [class.ant-menu]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-vertical]="isMenuInsideDropDown"
      [class.ant-menu-vertical]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-sub]="isMenuInsideDropDown"
      [class.ant-menu-sub]="!isMenuInsideDropDown"
      [class.ant-menu-rtl]="dir === 'rtl'"
      [class]="menuClass"
    >
      <ng-template [ngTemplateOutlet]="templateOutlet"></ng-template>
    </div>
  `,
                    host: {
                        class: 'ant-menu-submenu ant-menu-submenu-popup',
                        '[class.ant-menu-light]': "theme === 'light'",
                        '[class.ant-menu-dark]': "theme === 'dark'",
                        '[class.ant-menu-submenu-placement-bottom]': "mode === 'horizontal'",
                        '[class.ant-menu-submenu-placement-right]': "mode === 'vertical' && position === 'right'",
                        '[class.ant-menu-submenu-placement-left]': "mode === 'vertical' && position === 'left'",
                        '[class.ant-menu-submenu-rtl]': 'dir ==="rtl"',
                        '[@slideMotion]': 'expandState',
                        '[@zoomBigMotion]': 'expandState',
                        '(mouseenter)': 'setMouseState(true)',
                        '(mouseleave)': 'setMouseState(false)'
                    },
                    imports: [NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: i1.Directionality }], propDecorators: { menuClass: [{
                type: Input
            }], theme: [{
                type: Input
            }], templateOutlet: [{
                type: Input
            }], isMenuInsideDropDown: [{
                type: Input
            }], mode: [{
                type: Input
            }], nzTriggerSubMenuAction: [{
                type: Input
            }], position: [{
                type: Input
            }], nzDisabled: [{
                type: Input
            }], nzOpen: [{
                type: Input
            }], subMenuMouseState: [{
                type: Output
            }] } });

class NzSubMenuTitleComponent {
    cdr;
    directionality;
    nzIcon = null;
    nzTitle = null;
    isMenuInsideDropDown = false;
    nzDisabled = false;
    paddingLeft = null;
    mode = 'vertical';
    nzTriggerSubMenuAction = 'hover';
    toggleSubMenu = new EventEmitter();
    subMenuMouseState = new EventEmitter();
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(cdr, directionality) {
        this.cdr = cdr;
        this.directionality = directionality;
    }
    ngOnInit() {
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    setMouseState(state) {
        if (!this.nzDisabled && this.nzTriggerSubMenuAction === 'hover') {
            this.subMenuMouseState.next(state);
        }
    }
    clickTitle() {
        if ((this.mode === 'inline' || this.nzTriggerSubMenuAction === 'click') && !this.nzDisabled) {
            this.subMenuMouseState.next(true);
            this.toggleSubMenu.emit();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubMenuTitleComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSubMenuTitleComponent, isStandalone: true, selector: "[nz-submenu-title]", inputs: { nzIcon: "nzIcon", nzTitle: "nzTitle", isMenuInsideDropDown: "isMenuInsideDropDown", nzDisabled: "nzDisabled", paddingLeft: "paddingLeft", mode: "mode", nzTriggerSubMenuAction: "nzTriggerSubMenuAction" }, outputs: { toggleSubMenu: "toggleSubMenu", subMenuMouseState: "subMenuMouseState" }, host: { listeners: { "click": "clickTitle()", "mouseenter": "setMouseState(true)", "mouseleave": "setMouseState(false)" }, properties: { "class.ant-dropdown-menu-submenu-title": "isMenuInsideDropDown", "class.ant-menu-submenu-title": "!isMenuInsideDropDown", "style.paddingLeft.px": "dir === 'rtl' ? null : paddingLeft ", "style.paddingRight.px": "dir === 'rtl' ? paddingLeft : null" } }, exportAs: ["nzSubmenuTitle"], ngImport: i0, template: `
    @if (nzIcon) {
      <nz-icon [nzType]="nzIcon" />
    }
    <ng-container *nzStringTemplateOutlet="nzTitle">
      <span class="ant-menu-title-content">{{ nzTitle }}</span>
    </ng-container>
    <ng-content />
    @if (isMenuInsideDropDown) {
      <span class="ant-dropdown-menu-submenu-expand-icon">
        @switch (dir) {
          @case ('rtl') {
            <nz-icon nzType="left" class="ant-dropdown-menu-submenu-arrow-icon" />
          }
          @default {
            <nz-icon nzType="right" class="ant-dropdown-menu-submenu-arrow-icon" />
          }
        }
      </span>
    } @else {
      <span class="ant-menu-submenu-arrow"></span>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubMenuTitleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-submenu-title]',
                    exportAs: 'nzSubmenuTitle',
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (nzIcon) {
      <nz-icon [nzType]="nzIcon" />
    }
    <ng-container *nzStringTemplateOutlet="nzTitle">
      <span class="ant-menu-title-content">{{ nzTitle }}</span>
    </ng-container>
    <ng-content />
    @if (isMenuInsideDropDown) {
      <span class="ant-dropdown-menu-submenu-expand-icon">
        @switch (dir) {
          @case ('rtl') {
            <nz-icon nzType="left" class="ant-dropdown-menu-submenu-arrow-icon" />
          }
          @default {
            <nz-icon nzType="right" class="ant-dropdown-menu-submenu-arrow-icon" />
          }
        }
      </span>
    } @else {
      <span class="ant-menu-submenu-arrow"></span>
    }
  `,
                    host: {
                        '[class.ant-dropdown-menu-submenu-title]': 'isMenuInsideDropDown',
                        '[class.ant-menu-submenu-title]': '!isMenuInsideDropDown',
                        '[style.paddingLeft.px]': `dir === 'rtl' ? null : paddingLeft `,
                        '[style.paddingRight.px]': `dir === 'rtl' ? paddingLeft : null`,
                        '(click)': 'clickTitle()',
                        '(mouseenter)': 'setMouseState(true)',
                        '(mouseleave)': 'setMouseState(false)'
                    },
                    imports: [NzIconModule, NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.Directionality }], propDecorators: { nzIcon: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], isMenuInsideDropDown: [{
                type: Input
            }], nzDisabled: [{
                type: Input
            }], paddingLeft: [{
                type: Input
            }], mode: [{
                type: Input
            }], nzTriggerSubMenuAction: [{
                type: Input
            }], toggleSubMenu: [{
                type: Output
            }], subMenuMouseState: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const listOfVerticalPositions = [
    POSITION_MAP.rightTop,
    POSITION_MAP.right,
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftTop,
    POSITION_MAP.left,
    POSITION_MAP.leftBottom
];
const listOfHorizontalPositions = [
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.topRight,
    POSITION_MAP.topLeft
];
class NzSubMenuComponent {
    nzMenuService;
    cdr;
    platform;
    nzMenuClassName = '';
    nzPaddingLeft = null;
    nzTitle = null;
    nzIcon = null;
    nzTriggerSubMenuAction = 'hover';
    nzOpen = false;
    nzDisabled = false;
    nzPlacement = 'bottomLeft';
    nzOpenChange = new EventEmitter();
    cdkOverlayOrigin = null;
    // fix errors about circular dependency
    // Can't construct a query for the property ... since the query selector wasn't defined"
    listOfNzSubMenuComponent = null;
    listOfNzMenuItemDirective = null;
    nzSubmenuService = inject(NzSubmenuService);
    level = this.nzSubmenuService.level;
    destroy$ = new Subject();
    position = 'right';
    triggerWidth = null;
    theme = 'light';
    mode = 'vertical';
    inlinePaddingLeft = null;
    overlayPositions = listOfVerticalPositions;
    isSelected = false;
    isActive = false;
    dir = 'ltr';
    isMenuInsideDropDown = inject(NzIsMenuInsideDropDownToken);
    noAnimation = inject(NzNoAnimationDirective, { optional: true, host: true });
    directionality = inject(Directionality);
    /** set the submenu host open status directly **/
    setOpenStateWithoutDebounce(open) {
        this.nzSubmenuService.setOpenStateWithoutDebounce(open);
    }
    toggleSubMenu() {
        this.setOpenStateWithoutDebounce(!this.nzOpen);
    }
    setMouseEnterState(value) {
        this.isActive = value;
        if (this.mode !== 'inline') {
            this.nzSubmenuService.setMouseEnterTitleOrOverlayState(value);
        }
    }
    setTriggerWidth() {
        if (this.mode === 'horizontal' &&
            this.platform.isBrowser &&
            this.cdkOverlayOrigin &&
            this.nzPlacement === 'bottomLeft') {
            /** TODO: fast dom **/
            this.triggerWidth = this.cdkOverlayOrigin.nativeElement.getBoundingClientRect().width;
        }
    }
    onPositionChange(position) {
        const placement = getPlacementName(position);
        if (placement === 'rightTop' || placement === 'rightBottom' || placement === 'right') {
            this.position = 'right';
        }
        else if (placement === 'leftTop' || placement === 'leftBottom' || placement === 'left') {
            this.position = 'left';
        }
    }
    constructor(nzMenuService, cdr, platform) {
        this.nzMenuService = nzMenuService;
        this.cdr = cdr;
        this.platform = platform;
    }
    ngOnInit() {
        /** submenu theme update **/
        this.nzMenuService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
            this.theme = theme;
            this.cdr.markForCheck();
        });
        /** submenu mode update **/
        this.nzSubmenuService.mode$.pipe(takeUntil(this.destroy$)).subscribe(mode => {
            this.mode = mode;
            if (mode === 'horizontal') {
                this.overlayPositions = [POSITION_MAP[this.nzPlacement], ...listOfHorizontalPositions];
            }
            else if (mode === 'vertical') {
                this.overlayPositions = listOfVerticalPositions;
            }
            this.cdr.markForCheck();
        });
        /** inlineIndent update **/
        combineLatest([this.nzSubmenuService.mode$, this.nzMenuService.inlineIndent$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([mode, inlineIndent]) => {
            this.inlinePaddingLeft = mode === 'inline' ? this.level * inlineIndent : null;
            this.cdr.markForCheck();
        });
        /** current submenu open status **/
        this.nzSubmenuService.isCurrentSubMenuOpen$.pipe(takeUntil(this.destroy$)).subscribe(open => {
            this.isActive = open;
            if (open !== this.nzOpen) {
                this.setTriggerWidth();
                this.nzOpen = open;
                this.nzOpenChange.emit(this.nzOpen);
                this.cdr.markForCheck();
            }
        });
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.markForCheck();
        });
    }
    ngAfterContentInit() {
        this.setTriggerWidth();
        const listOfNzMenuItemDirective = this.listOfNzMenuItemDirective;
        const changes = listOfNzMenuItemDirective.changes;
        const mergedObservable = merge(...[changes, ...listOfNzMenuItemDirective.map(menu => menu.selected$)]);
        changes
            .pipe(startWith(listOfNzMenuItemDirective), switchMap(() => mergedObservable), startWith(true), map(() => listOfNzMenuItemDirective.some(e => e.nzSelected)), takeUntil(this.destroy$))
            .subscribe(selected => {
            this.isSelected = selected;
            this.cdr.markForCheck();
        });
    }
    ngOnChanges(changes) {
        const { nzOpen } = changes;
        if (nzOpen) {
            this.nzSubmenuService.setOpenStateWithoutDebounce(this.nzOpen);
            this.setTriggerWidth();
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubMenuComponent, deps: [{ token: MenuService }, { token: i0.ChangeDetectorRef }, { token: i2$1.Platform }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSubMenuComponent, isStandalone: true, selector: "[nz-submenu]", inputs: { nzMenuClassName: "nzMenuClassName", nzPaddingLeft: "nzPaddingLeft", nzTitle: "nzTitle", nzIcon: "nzIcon", nzTriggerSubMenuAction: "nzTriggerSubMenuAction", nzOpen: ["nzOpen", "nzOpen", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzPlacement: "nzPlacement" }, outputs: { nzOpenChange: "nzOpenChange" }, host: { properties: { "class.ant-dropdown-menu-submenu": "isMenuInsideDropDown", "class.ant-dropdown-menu-submenu-disabled": "isMenuInsideDropDown && nzDisabled", "class.ant-dropdown-menu-submenu-open": "isMenuInsideDropDown && nzOpen", "class.ant-dropdown-menu-submenu-selected": "isMenuInsideDropDown && isSelected", "class.ant-dropdown-menu-submenu-vertical": "isMenuInsideDropDown && mode === 'vertical'", "class.ant-dropdown-menu-submenu-horizontal": "isMenuInsideDropDown && mode === 'horizontal'", "class.ant-dropdown-menu-submenu-inline": "isMenuInsideDropDown && mode === 'inline'", "class.ant-dropdown-menu-submenu-active": "isMenuInsideDropDown && isActive", "class.ant-menu-submenu": "!isMenuInsideDropDown", "class.ant-menu-submenu-disabled": "!isMenuInsideDropDown && nzDisabled", "class.ant-menu-submenu-open": "!isMenuInsideDropDown && nzOpen", "class.ant-menu-submenu-selected": "!isMenuInsideDropDown && isSelected", "class.ant-menu-submenu-vertical": "!isMenuInsideDropDown && mode === 'vertical'", "class.ant-menu-submenu-horizontal": "!isMenuInsideDropDown && mode === 'horizontal'", "class.ant-menu-submenu-inline": "!isMenuInsideDropDown && mode === 'inline'", "class.ant-menu-submenu-active": "!isMenuInsideDropDown && isActive", "class.ant-menu-submenu-rtl": "dir === 'rtl'" } }, providers: [NzSubmenuService], queries: [{ propertyName: "listOfNzSubMenuComponent", predicate: i0.forwardRef(() => NzSubMenuComponent), descendants: true }, { propertyName: "listOfNzMenuItemDirective", predicate: NzMenuItemComponent, descendants: true }], viewQueries: [{ propertyName: "cdkOverlayOrigin", first: true, predicate: CdkOverlayOrigin, descendants: true, read: ElementRef, static: true }], exportAs: ["nzSubmenu"], usesOnChanges: true, ngImport: i0, template: `
    <div
      nz-submenu-title
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [nzIcon]="nzIcon"
      [nzTitle]="nzTitle"
      [mode]="mode"
      [nzDisabled]="nzDisabled"
      [isMenuInsideDropDown]="isMenuInsideDropDown"
      [paddingLeft]="nzPaddingLeft || inlinePaddingLeft"
      [nzTriggerSubMenuAction]="nzTriggerSubMenuAction"
      (subMenuMouseState)="setMouseEnterState($event)"
      (toggleSubMenu)="toggleSubMenu()"
    >
      @if (!nzTitle) {
        <ng-content select="[title]" />
      }
    </div>
    @if (mode === 'inline') {
      <div
        nz-submenu-inline-child
        [mode]="mode"
        [nzOpen]="nzOpen"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [menuClass]="nzMenuClassName"
        [templateOutlet]="subMenuTemplate"
      ></div>
    } @else {
      <ng-template
        cdkConnectedOverlay
        (positionChange)="onPositionChange($event)"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayWidth]="triggerWidth!"
        [cdkConnectedOverlayOpen]="nzOpen"
        [cdkConnectedOverlayTransformOriginOn]="'.ant-menu-submenu'"
        (overlayOutsideClick)="setMouseEnterState(false)"
      >
        <div
          nz-submenu-none-inline-child
          [theme]="theme"
          [mode]="mode"
          [nzOpen]="nzOpen"
          [position]="position"
          [nzDisabled]="nzDisabled"
          [isMenuInsideDropDown]="isMenuInsideDropDown"
          [nzTriggerSubMenuAction]="nzTriggerSubMenuAction"
          [templateOutlet]="subMenuTemplate"
          [menuClass]="nzMenuClassName"
          [@.disabled]="!!noAnimation?.nzNoAnimation"
          [nzNoAnimation]="noAnimation?.nzNoAnimation"
          (subMenuMouseState)="setMouseEnterState($event)"
        ></div>
      </ng-template>
    }

    <ng-template #subMenuTemplate>
      <ng-content />
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzSubMenuTitleComponent, selector: "[nz-submenu-title]", inputs: ["nzIcon", "nzTitle", "isMenuInsideDropDown", "nzDisabled", "paddingLeft", "mode", "nzTriggerSubMenuAction"], outputs: ["toggleSubMenu", "subMenuMouseState"], exportAs: ["nzSubmenuTitle"] }, { kind: "component", type: NzSubmenuInlineChildComponent, selector: "[nz-submenu-inline-child]", inputs: ["templateOutlet", "menuClass", "mode", "nzOpen"], exportAs: ["nzSubmenuInlineChild"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "component", type: NzSubmenuNoneInlineChildComponent, selector: "[nz-submenu-none-inline-child]", inputs: ["menuClass", "theme", "templateOutlet", "isMenuInsideDropDown", "mode", "nzTriggerSubMenuAction", "position", "nzDisabled", "nzOpen"], outputs: ["subMenuMouseState"], exportAs: ["nzSubmenuNoneInlineChild"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i3$1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: i3$1.CdkOverlayOrigin, selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]", exportAs: ["cdkOverlayOrigin"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSubMenuComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-submenu]',
                    exportAs: 'nzSubmenu',
                    providers: [NzSubmenuService],
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    template: `
    <div
      nz-submenu-title
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [nzIcon]="nzIcon"
      [nzTitle]="nzTitle"
      [mode]="mode"
      [nzDisabled]="nzDisabled"
      [isMenuInsideDropDown]="isMenuInsideDropDown"
      [paddingLeft]="nzPaddingLeft || inlinePaddingLeft"
      [nzTriggerSubMenuAction]="nzTriggerSubMenuAction"
      (subMenuMouseState)="setMouseEnterState($event)"
      (toggleSubMenu)="toggleSubMenu()"
    >
      @if (!nzTitle) {
        <ng-content select="[title]" />
      }
    </div>
    @if (mode === 'inline') {
      <div
        nz-submenu-inline-child
        [mode]="mode"
        [nzOpen]="nzOpen"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [menuClass]="nzMenuClassName"
        [templateOutlet]="subMenuTemplate"
      ></div>
    } @else {
      <ng-template
        cdkConnectedOverlay
        (positionChange)="onPositionChange($event)"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayWidth]="triggerWidth!"
        [cdkConnectedOverlayOpen]="nzOpen"
        [cdkConnectedOverlayTransformOriginOn]="'.ant-menu-submenu'"
        (overlayOutsideClick)="setMouseEnterState(false)"
      >
        <div
          nz-submenu-none-inline-child
          [theme]="theme"
          [mode]="mode"
          [nzOpen]="nzOpen"
          [position]="position"
          [nzDisabled]="nzDisabled"
          [isMenuInsideDropDown]="isMenuInsideDropDown"
          [nzTriggerSubMenuAction]="nzTriggerSubMenuAction"
          [templateOutlet]="subMenuTemplate"
          [menuClass]="nzMenuClassName"
          [@.disabled]="!!noAnimation?.nzNoAnimation"
          [nzNoAnimation]="noAnimation?.nzNoAnimation"
          (subMenuMouseState)="setMouseEnterState($event)"
        ></div>
      </ng-template>
    }

    <ng-template #subMenuTemplate>
      <ng-content />
    </ng-template>
  `,
                    host: {
                        '[class.ant-dropdown-menu-submenu]': `isMenuInsideDropDown`,
                        '[class.ant-dropdown-menu-submenu-disabled]': `isMenuInsideDropDown && nzDisabled`,
                        '[class.ant-dropdown-menu-submenu-open]': `isMenuInsideDropDown && nzOpen`,
                        '[class.ant-dropdown-menu-submenu-selected]': `isMenuInsideDropDown && isSelected`,
                        '[class.ant-dropdown-menu-submenu-vertical]': `isMenuInsideDropDown && mode === 'vertical'`,
                        '[class.ant-dropdown-menu-submenu-horizontal]': `isMenuInsideDropDown && mode === 'horizontal'`,
                        '[class.ant-dropdown-menu-submenu-inline]': `isMenuInsideDropDown && mode === 'inline'`,
                        '[class.ant-dropdown-menu-submenu-active]': `isMenuInsideDropDown && isActive`,
                        '[class.ant-menu-submenu]': `!isMenuInsideDropDown`,
                        '[class.ant-menu-submenu-disabled]': `!isMenuInsideDropDown && nzDisabled`,
                        '[class.ant-menu-submenu-open]': `!isMenuInsideDropDown && nzOpen`,
                        '[class.ant-menu-submenu-selected]': `!isMenuInsideDropDown && isSelected`,
                        '[class.ant-menu-submenu-vertical]': `!isMenuInsideDropDown && mode === 'vertical'`,
                        '[class.ant-menu-submenu-horizontal]': `!isMenuInsideDropDown && mode === 'horizontal'`,
                        '[class.ant-menu-submenu-inline]': `!isMenuInsideDropDown && mode === 'inline'`,
                        '[class.ant-menu-submenu-active]': `!isMenuInsideDropDown && isActive`,
                        '[class.ant-menu-submenu-rtl]': `dir === 'rtl'`
                    },
                    imports: [
                        NzSubMenuTitleComponent,
                        NzSubmenuInlineChildComponent,
                        NzNoAnimationDirective,
                        NzSubmenuNoneInlineChildComponent,
                        OverlayModule
                    ]
                }]
        }], ctorParameters: () => [{ type: MenuService }, { type: i0.ChangeDetectorRef }, { type: i2$1.Platform }], propDecorators: { nzMenuClassName: [{
                type: Input
            }], nzPaddingLeft: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzTriggerSubMenuAction: [{
                type: Input
            }], nzOpen: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzPlacement: [{
                type: Input
            }], nzOpenChange: [{
                type: Output
            }], cdkOverlayOrigin: [{
                type: ViewChild,
                args: [CdkOverlayOrigin, { static: true, read: ElementRef }]
            }], listOfNzSubMenuComponent: [{
                type: ContentChildren,
                args: [forwardRef(() => NzSubMenuComponent), { descendants: true }]
            }], listOfNzMenuItemDirective: [{
                type: ContentChildren,
                args: [NzMenuItemComponent, { descendants: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function MenuServiceFactory() {
    const serviceInsideDropDown = inject(MenuService, { skipSelf: true, optional: true });
    const serviceOutsideDropDown = inject(NzMenuServiceLocalToken);
    return serviceInsideDropDown ?? serviceOutsideDropDown;
}
function MenuDropDownTokenFactory() {
    const isMenuInsideDropDownToken = inject(NzIsMenuInsideDropDownToken, { skipSelf: true, optional: true });
    return isMenuInsideDropDownToken ?? false;
}
class NzMenuDirective {
    nzMenuService;
    cdr;
    listOfNzMenuItemDirective;
    isMenuInsideDropDown = inject(NzIsMenuInsideDropDownToken);
    listOfNzSubMenuComponent;
    nzInlineIndent = 24;
    nzTheme = 'light';
    nzMode = 'vertical';
    nzInlineCollapsed = false;
    nzSelectable = !this.isMenuInsideDropDown;
    nzClick = new EventEmitter();
    actualMode = 'vertical';
    dir = 'ltr';
    inlineCollapsed$ = new BehaviorSubject(this.nzInlineCollapsed);
    mode$ = new BehaviorSubject(this.nzMode);
    destroy$ = new Subject();
    listOfOpenedNzSubMenuComponent = [];
    directionality = inject(Directionality);
    setInlineCollapsed(inlineCollapsed) {
        this.nzInlineCollapsed = inlineCollapsed;
        this.inlineCollapsed$.next(inlineCollapsed);
    }
    updateInlineCollapse() {
        if (this.listOfNzMenuItemDirective) {
            if (this.nzInlineCollapsed) {
                this.listOfOpenedNzSubMenuComponent = this.listOfNzSubMenuComponent.filter(submenu => submenu.nzOpen);
                this.listOfNzSubMenuComponent.forEach(submenu => submenu.setOpenStateWithoutDebounce(false));
            }
            else {
                this.listOfOpenedNzSubMenuComponent.forEach(submenu => submenu.setOpenStateWithoutDebounce(true));
                this.listOfOpenedNzSubMenuComponent = [];
            }
        }
    }
    constructor(nzMenuService, cdr) {
        this.nzMenuService = nzMenuService;
        this.cdr = cdr;
    }
    ngOnInit() {
        combineLatest([this.inlineCollapsed$, this.mode$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([inlineCollapsed, mode]) => {
            this.actualMode = inlineCollapsed ? 'vertical' : mode;
            this.nzMenuService.setMode(this.actualMode);
            this.cdr.markForCheck();
        });
        this.nzMenuService.descendantMenuItemClick$.pipe(takeUntil(this.destroy$)).subscribe(menu => {
            this.nzClick.emit(menu);
            if (this.nzSelectable && !menu.nzMatchRouter) {
                this.listOfNzMenuItemDirective.forEach(item => item.setSelectedState(item === menu));
            }
        });
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.nzMenuService.setMode(this.actualMode);
            this.cdr.markForCheck();
        });
    }
    ngAfterContentInit() {
        this.inlineCollapsed$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateInlineCollapse();
            this.cdr.markForCheck();
        });
    }
    ngOnChanges(changes) {
        const { nzInlineCollapsed, nzInlineIndent, nzTheme, nzMode } = changes;
        if (nzInlineCollapsed) {
            this.inlineCollapsed$.next(this.nzInlineCollapsed);
        }
        if (nzInlineIndent) {
            this.nzMenuService.setInlineIndent(this.nzInlineIndent);
        }
        if (nzTheme) {
            this.nzMenuService.setTheme(this.nzTheme);
        }
        if (nzMode) {
            this.mode$.next(this.nzMode);
            if (!changes.nzMode.isFirstChange() && this.listOfNzSubMenuComponent) {
                this.listOfNzSubMenuComponent.forEach(submenu => submenu.setOpenStateWithoutDebounce(false));
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuDirective, deps: [{ token: MenuService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzMenuDirective, isStandalone: true, selector: "[nz-menu]", inputs: { nzInlineIndent: "nzInlineIndent", nzTheme: "nzTheme", nzMode: "nzMode", nzInlineCollapsed: ["nzInlineCollapsed", "nzInlineCollapsed", booleanAttribute], nzSelectable: ["nzSelectable", "nzSelectable", booleanAttribute] }, outputs: { nzClick: "nzClick" }, host: { properties: { "class.ant-dropdown-menu": "isMenuInsideDropDown", "class.ant-dropdown-menu-root": "isMenuInsideDropDown", "class.ant-dropdown-menu-light": "isMenuInsideDropDown && nzTheme === 'light'", "class.ant-dropdown-menu-dark": "isMenuInsideDropDown && nzTheme === 'dark'", "class.ant-dropdown-menu-vertical": "isMenuInsideDropDown && actualMode === 'vertical'", "class.ant-dropdown-menu-horizontal": "isMenuInsideDropDown && actualMode === 'horizontal'", "class.ant-dropdown-menu-inline": "isMenuInsideDropDown && actualMode === 'inline'", "class.ant-dropdown-menu-inline-collapsed": "isMenuInsideDropDown && nzInlineCollapsed", "class.ant-menu": "!isMenuInsideDropDown", "class.ant-menu-root": "!isMenuInsideDropDown", "class.ant-menu-light": "!isMenuInsideDropDown && nzTheme === 'light'", "class.ant-menu-dark": "!isMenuInsideDropDown && nzTheme === 'dark'", "class.ant-menu-vertical": "!isMenuInsideDropDown && actualMode === 'vertical'", "class.ant-menu-horizontal": "!isMenuInsideDropDown && actualMode === 'horizontal'", "class.ant-menu-inline": "!isMenuInsideDropDown && actualMode === 'inline'", "class.ant-menu-inline-collapsed": "!isMenuInsideDropDown && nzInlineCollapsed", "class.ant-menu-rtl": "dir === 'rtl'" } }, providers: [
            {
                provide: NzMenuServiceLocalToken,
                useClass: MenuService
            },
            /** use the top level service **/
            {
                provide: MenuService,
                useFactory: MenuServiceFactory
            },
            /** check if menu inside dropdown-menu component **/
            {
                provide: NzIsMenuInsideDropDownToken,
                useFactory: MenuDropDownTokenFactory
            }
        ], queries: [{ propertyName: "listOfNzMenuItemDirective", predicate: NzMenuItemComponent, descendants: true }, { propertyName: "listOfNzSubMenuComponent", predicate: NzSubMenuComponent, descendants: true }], exportAs: ["nzMenu"], usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-menu]',
                    exportAs: 'nzMenu',
                    providers: [
                        {
                            provide: NzMenuServiceLocalToken,
                            useClass: MenuService
                        },
                        /** use the top level service **/
                        {
                            provide: MenuService,
                            useFactory: MenuServiceFactory
                        },
                        /** check if menu inside dropdown-menu component **/
                        {
                            provide: NzIsMenuInsideDropDownToken,
                            useFactory: MenuDropDownTokenFactory
                        }
                    ],
                    host: {
                        '[class.ant-dropdown-menu]': `isMenuInsideDropDown`,
                        '[class.ant-dropdown-menu-root]': `isMenuInsideDropDown`,
                        '[class.ant-dropdown-menu-light]': `isMenuInsideDropDown && nzTheme === 'light'`,
                        '[class.ant-dropdown-menu-dark]': `isMenuInsideDropDown && nzTheme === 'dark'`,
                        '[class.ant-dropdown-menu-vertical]': `isMenuInsideDropDown && actualMode === 'vertical'`,
                        '[class.ant-dropdown-menu-horizontal]': `isMenuInsideDropDown && actualMode === 'horizontal'`,
                        '[class.ant-dropdown-menu-inline]': `isMenuInsideDropDown && actualMode === 'inline'`,
                        '[class.ant-dropdown-menu-inline-collapsed]': `isMenuInsideDropDown && nzInlineCollapsed`,
                        '[class.ant-menu]': `!isMenuInsideDropDown`,
                        '[class.ant-menu-root]': `!isMenuInsideDropDown`,
                        '[class.ant-menu-light]': `!isMenuInsideDropDown && nzTheme === 'light'`,
                        '[class.ant-menu-dark]': `!isMenuInsideDropDown && nzTheme === 'dark'`,
                        '[class.ant-menu-vertical]': `!isMenuInsideDropDown && actualMode === 'vertical'`,
                        '[class.ant-menu-horizontal]': `!isMenuInsideDropDown && actualMode === 'horizontal'`,
                        '[class.ant-menu-inline]': `!isMenuInsideDropDown && actualMode === 'inline'`,
                        '[class.ant-menu-inline-collapsed]': `!isMenuInsideDropDown && nzInlineCollapsed`,
                        '[class.ant-menu-rtl]': `dir === 'rtl'`
                    }
                }]
        }], ctorParameters: () => [{ type: MenuService }, { type: i0.ChangeDetectorRef }], propDecorators: { listOfNzMenuItemDirective: [{
                type: ContentChildren,
                args: [NzMenuItemComponent, { descendants: true }]
            }], listOfNzSubMenuComponent: [{
                type: ContentChildren,
                args: [NzSubMenuComponent, { descendants: true }]
            }], nzInlineIndent: [{
                type: Input
            }], nzTheme: [{
                type: Input
            }], nzMode: [{
                type: Input
            }], nzInlineCollapsed: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelectable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClick: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function MenuGroupFactory() {
    const isMenuInsideDropDownToken = inject(NzIsMenuInsideDropDownToken, { optional: true, skipSelf: true });
    return isMenuInsideDropDownToken ?? false;
}
class NzMenuGroupComponent {
    elementRef;
    renderer;
    nzTitle;
    titleElement;
    isMenuInsideDropDown = inject(NzIsMenuInsideDropDownToken);
    constructor(elementRef, renderer) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        const className = this.isMenuInsideDropDown ? 'ant-dropdown-menu-item-group' : 'ant-menu-item-group';
        this.renderer.addClass(elementRef.nativeElement, className);
    }
    ngAfterViewInit() {
        const ulElement = this.titleElement.nativeElement.nextElementSibling;
        if (ulElement) {
            /** add classname to ul **/
            const className = this.isMenuInsideDropDown ? 'ant-dropdown-menu-item-group-list' : 'ant-menu-item-group-list';
            this.renderer.addClass(ulElement, className);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuGroupComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzMenuGroupComponent, isStandalone: true, selector: "[nz-menu-group]", inputs: { nzTitle: "nzTitle" }, providers: [
            /** check if menu inside dropdown-menu component **/
            {
                provide: NzIsMenuInsideDropDownToken,
                useFactory: MenuGroupFactory
            }
        ], viewQueries: [{ propertyName: "titleElement", first: true, predicate: ["titleElement"], descendants: true }], exportAs: ["nzMenuGroup"], ngImport: i0, template: `
    <div
      [class.ant-menu-item-group-title]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-item-group-title]="isMenuInsideDropDown"
      #titleElement
    >
      <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
      @if (!nzTitle) {
        <ng-content select="[title]" />
      }
    </div>
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-menu-group]',
                    exportAs: 'nzMenuGroup',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        /** check if menu inside dropdown-menu component **/
                        {
                            provide: NzIsMenuInsideDropDownToken,
                            useFactory: MenuGroupFactory
                        }
                    ],
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <div
      [class.ant-menu-item-group-title]="!isMenuInsideDropDown"
      [class.ant-dropdown-menu-item-group-title]="isMenuInsideDropDown"
      #titleElement
    >
      <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
      @if (!nzTitle) {
        <ng-content select="[title]" />
      }
    </div>
    <ng-content></ng-content>
  `,
                    preserveWhitespaces: false,
                    imports: [NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { nzTitle: [{
                type: Input
            }], titleElement: [{
                type: ViewChild,
                args: ['titleElement']
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMenuDividerDirective {
    elementRef;
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuDividerDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzMenuDividerDirective, isStandalone: true, selector: "[nz-menu-divider]", host: { classAttribute: "ant-dropdown-menu-item-divider" }, exportAs: ["nzMenuDivider"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuDividerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-menu-divider]',
                    exportAs: 'nzMenuDivider',
                    host: {
                        class: 'ant-dropdown-menu-item-divider'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMenuModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzMenuModule, imports: [NzMenuDirective,
            NzMenuItemComponent,
            NzSubMenuComponent,
            NzMenuDividerDirective,
            NzMenuGroupComponent,
            NzSubMenuTitleComponent,
            NzSubmenuInlineChildComponent,
            NzSubmenuNoneInlineChildComponent], exports: [NzMenuDirective, NzMenuItemComponent, NzSubMenuComponent, NzMenuDividerDirective, NzMenuGroupComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuModule, imports: [NzSubMenuComponent,
            NzMenuGroupComponent,
            NzSubMenuTitleComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMenuModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzMenuDirective,
                        NzMenuItemComponent,
                        NzSubMenuComponent,
                        NzMenuDividerDirective,
                        NzMenuGroupComponent,
                        NzSubMenuTitleComponent,
                        NzSubmenuInlineChildComponent,
                        NzSubmenuNoneInlineChildComponent
                    ],
                    exports: [NzMenuDirective, NzMenuItemComponent, NzSubMenuComponent, NzMenuDividerDirective, NzMenuGroupComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MenuDropDownTokenFactory, MenuGroupFactory, MenuService, MenuServiceFactory, NzIsMenuInsideDropDownToken, NzMenuDirective, NzMenuDividerDirective, NzMenuGroupComponent, NzMenuItemComponent, NzMenuModule, NzMenuServiceLocalToken, NzSubMenuComponent, NzSubMenuTitleComponent, NzSubmenuInlineChildComponent, NzSubmenuNoneInlineChildComponent, NzSubmenuService };
//# sourceMappingURL=ng-zorro-antd-menu.mjs.map
