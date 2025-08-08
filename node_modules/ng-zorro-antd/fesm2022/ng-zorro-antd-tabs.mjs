import * as i0 from '@angular/core';
import { Input, Component, input, inject, TemplateRef, Directive, ChangeDetectionStrategy, ViewEncapsulation, booleanAttribute, EventEmitter, Output, computed, ContentChildren, ViewChild, InjectionToken, ContentChild, QueryList, contentChildren, forwardRef, NgModule } from '@angular/core';
import * as i1 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgTemplateOutlet } from '@angular/common';
import { tabSwitchMotion } from 'ng-zorro-antd/core/animation';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import * as i3$2 from '@angular/cdk/a11y';
import { FocusKeyManager, A11yModule } from '@angular/cdk/a11y';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { hasModifierKey, SPACE, ENTER, DOWN_ARROW, RIGHT_ARROW, UP_ARROW, LEFT_ARROW } from '@angular/cdk/keycodes';
import { fromEvent, Subscription, animationFrameScheduler, asapScheduler, Subject, of, merge } from 'rxjs';
import { takeUntil, auditTime, startWith, first, filter, delay } from 'rxjs/operators';
import { reqAnimFrame } from 'ng-zorro-antd/core/polyfill';
import { NzDropdownMenuComponent, NzDropDownDirective } from 'ng-zorro-antd/dropdown';
import * as i3 from 'ng-zorro-antd/menu';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import * as i1$1 from '@angular/cdk/overlay';
import * as i2$1 from 'ng-zorro-antd/cdk/resize-observer';
import * as i3$1 from '@angular/cdk/bidi';
import { __esDecorate, __runInitializers } from 'tslib';
import * as i1$2 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { PREFIX } from 'ng-zorro-antd/core/logger';
import { wrapIntoObservable } from 'ng-zorro-antd/core/util';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabChangeEvent {
    index;
    tab;
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabAddButtonComponent {
    elementRef;
    addIcon = 'plus';
    element;
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.element = this.elementRef.nativeElement;
    }
    getElementWidth() {
        return this.element?.offsetWidth || 0;
    }
    getElementHeight() {
        return this.element?.offsetHeight || 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabAddButtonComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTabAddButtonComponent, isStandalone: true, selector: "nz-tab-add-button, button[nz-tab-add-button]", inputs: { addIcon: "addIcon" }, host: { attributes: { "aria-label": "Add tab", "type": "button" }, classAttribute: "ant-tabs-nav-add" }, ngImport: i0, template: `
    <ng-container *nzStringTemplateOutlet="addIcon; let icon">
      <nz-icon [nzType]="icon" nzTheme="outline" />
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabAddButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tab-add-button, button[nz-tab-add-button]',
                    template: `
    <ng-container *nzStringTemplateOutlet="addIcon; let icon">
      <nz-icon [nzType]="icon" nzTheme="outline" />
    </ng-container>
  `,
                    host: {
                        class: 'ant-tabs-nav-add',
                        'aria-label': 'Add tab',
                        type: 'button'
                    },
                    imports: [NzOutletModule, NzIconModule]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { addIcon: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabBarExtraContentDirective {
    position = input('end', { alias: 'nzTabBarExtraContent' });
    templateRef = inject(TemplateRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabBarExtraContentDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "19.2.2", type: NzTabBarExtraContentDirective, isStandalone: true, selector: "[nzTabBarExtraContent]:not(nz-tabset)", inputs: { position: { classPropertyName: "position", publicName: "nzTabBarExtraContent", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabBarExtraContentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTabBarExtraContent]:not(nz-tabset)'
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabBodyComponent {
    content = null;
    active = false;
    animated = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabBodyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTabBodyComponent, isStandalone: true, selector: "[nz-tab-body]", inputs: { content: "content", active: "active", animated: "animated" }, host: { properties: { "class.ant-tabs-tabpane-active": "active", "class.ant-tabs-tabpane-hidden": "animated ? null : !active", "attr.tabindex": "active ? 0 : -1", "attr.aria-hidden": "!active", "style.overflow-y": "animated ? active ? null : \"none\" : null", "@tabSwitchMotion": "active ? 'enter' : 'leave'", "@.disabled": "!animated" }, classAttribute: "ant-tabs-tabpane" }, exportAs: ["nzTabBody"], ngImport: i0, template: ` <ng-template [ngTemplateOutlet]="content"></ng-template> `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], animations: [tabSwitchMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabBodyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-tab-body]',
                    exportAs: 'nzTabBody',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: ` <ng-template [ngTemplateOutlet]="content"></ng-template> `,
                    host: {
                        class: 'ant-tabs-tabpane',
                        '[class.ant-tabs-tabpane-active]': 'active',
                        '[class.ant-tabs-tabpane-hidden]': 'animated ? null : !active',
                        '[attr.tabindex]': 'active ? 0 : -1',
                        '[attr.aria-hidden]': '!active',
                        '[style.overflow-y]': 'animated ? active ? null : "none" : null',
                        '[@tabSwitchMotion]': `active ? 'enter' : 'leave'`,
                        '[@.disabled]': `!animated`
                    },
                    imports: [NgTemplateOutlet],
                    animations: [tabSwitchMotion]
                }]
        }], propDecorators: { content: [{
                type: Input
            }], active: [{
                type: Input
            }], animated: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabCloseButtonComponent {
    closeIcon = 'close';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabCloseButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTabCloseButtonComponent, isStandalone: true, selector: "nz-tab-close-button, button[nz-tab-close-button]", inputs: { closeIcon: "closeIcon" }, host: { attributes: { "aria-label": "Close tab", "type": "button" }, classAttribute: "ant-tabs-tab-remove" }, ngImport: i0, template: `
    <ng-container *nzStringTemplateOutlet="closeIcon; let icon">
      <nz-icon [nzType]="icon" nzTheme="outline" />
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabCloseButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tab-close-button, button[nz-tab-close-button]',
                    template: `
    <ng-container *nzStringTemplateOutlet="closeIcon; let icon">
      <nz-icon [nzType]="icon" nzTheme="outline" />
    </ng-container>
  `,
                    host: {
                        class: 'ant-tabs-tab-remove',
                        'aria-label': 'Close tab',
                        type: 'button'
                    },
                    imports: [NzOutletModule, NzIconModule]
                }]
        }], propDecorators: { closeIcon: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * Fix https://github.com/angular/angular/issues/8563
 */
class NzTabLinkTemplateDirective {
    templateRef = inject(TemplateRef, { host: true });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabLinkTemplateDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTabLinkTemplateDirective, isStandalone: true, selector: "ng-template[nzTabLink]", exportAs: ["nzTabLinkTemplate"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabLinkTemplateDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[nzTabLink]',
                    exportAs: 'nzTabLinkTemplate'
                }]
        }] });
/**
 * This component is for catching `routerLink` directive.
 */
class NzTabLinkDirective {
    elementRef;
    routerLink = inject(RouterLink, { self: true, optional: true });
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabLinkDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTabLinkDirective, isStandalone: true, selector: "a[nz-tab-link]", exportAs: ["nzTabLink"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabLinkDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'a[nz-tab-link]',
                    exportAs: 'nzTabLink'
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });

class NzTabNavItemDirective {
    elementRef;
    disabled = false;
    tab;
    active = false;
    el;
    parentElement;
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.el = elementRef.nativeElement;
        this.parentElement = this.el.parentElement;
    }
    focus() {
        this.el.focus();
    }
    get width() {
        return this.parentElement.offsetWidth;
    }
    get height() {
        return this.parentElement.offsetHeight;
    }
    get left() {
        return this.parentElement.offsetLeft;
    }
    get top() {
        return this.parentElement.offsetTop;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavItemDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzTabNavItemDirective, isStandalone: true, selector: "[nzTabNavItem]", inputs: { disabled: ["disabled", "disabled", booleanAttribute], tab: "tab", active: ["active", "active", booleanAttribute] }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavItemDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTabNavItem]'
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tab: [{
                type: Input
            }], active: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabNavOperationComponent {
    cdr;
    elementRef;
    items = [];
    addable = false;
    addIcon = 'plus';
    addClicked = new EventEmitter();
    selected = new EventEmitter();
    closeAnimationWaitTimeoutId;
    menuOpened = false;
    element;
    constructor(cdr, elementRef) {
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.element = this.elementRef.nativeElement;
    }
    onSelect(item) {
        if (!item.disabled) {
            // ignore nzCanDeactivate
            item.tab.nzClick.emit();
            this.selected.emit(item);
        }
    }
    onContextmenu(item, e) {
        if (!item.disabled) {
            item.tab.nzContextmenu.emit(e);
        }
    }
    showItems() {
        clearTimeout(this.closeAnimationWaitTimeoutId);
        this.menuOpened = true;
        this.cdr.markForCheck();
    }
    menuVisChange(visible) {
        if (!visible) {
            this.closeAnimationWaitTimeoutId = setTimeout(() => {
                this.menuOpened = false;
                this.cdr.markForCheck();
            }, 150);
        }
    }
    getElementWidth() {
        return this.element?.offsetWidth || 0;
    }
    getElementHeight() {
        return this.element?.offsetHeight || 0;
    }
    ngOnDestroy() {
        clearTimeout(this.closeAnimationWaitTimeoutId);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavOperationComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTabNavOperationComponent, isStandalone: true, selector: "nz-tab-nav-operation", inputs: { items: "items", addable: ["addable", "addable", booleanAttribute], addIcon: "addIcon" }, outputs: { addClicked: "addClicked", selected: "selected" }, host: { properties: { "class.ant-tabs-nav-operations-hidden": "items.length === 0" }, classAttribute: "ant-tabs-nav-operations" }, exportAs: ["nzTabNavOperation"], ngImport: i0, template: `
    <button
      nz-dropdown
      class="ant-tabs-nav-more"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      nzOverlayClassName="nz-tabs-dropdown"
      #dropdownTrigger="nzDropdown"
      [nzDropdownMenu]="menu"
      [nzOverlayStyle]="{ minWidth: '46px' }"
      [nzMatchWidthElement]="null"
      (nzVisibleChange)="menuVisChange($event)"
      (mouseenter)="showItems()"
    >
      <nz-icon nzType="ellipsis" />
    </button>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      @if (menuOpened) {
        <ul nz-menu>
          @for (item of items; track item) {
            <li
              nz-menu-item
              class="ant-tabs-dropdown-menu-item"
              [class.ant-tabs-dropdown-menu-item-disabled]="item.disabled"
              [nzSelected]="item.active"
              [nzDisabled]="item.disabled"
              (click)="onSelect(item)"
              (contextmenu)="onContextmenu(item, $event)"
            >
              <ng-container *nzStringTemplateOutlet="item.tab.label; context: { visible: false }">
                {{ item.tab.label }}
              </ng-container>
            </li>
          }
        </ul>
      }
    </nz-dropdown-menu>
    @if (addable) {
      <button nz-tab-add-button [addIcon]="addIcon" (click)="addClicked.emit()"></button>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "component", type: NzTabAddButtonComponent, selector: "nz-tab-add-button, button[nz-tab-add-button]", inputs: ["addIcon"] }, { kind: "component", type: NzDropdownMenuComponent, selector: "nz-dropdown-menu", exportAs: ["nzDropdownMenu"] }, { kind: "ngmodule", type: NzMenuModule }, { kind: "directive", type: i3.NzMenuDirective, selector: "[nz-menu]", inputs: ["nzInlineIndent", "nzTheme", "nzMode", "nzInlineCollapsed", "nzSelectable"], outputs: ["nzClick"], exportAs: ["nzMenu"] }, { kind: "component", type: i3.NzMenuItemComponent, selector: "[nz-menu-item]", inputs: ["nzPaddingLeft", "nzDisabled", "nzSelected", "nzDanger", "nzMatchRouterExact", "nzMatchRouter"], exportAs: ["nzMenuItem"] }, { kind: "directive", type: NzDropDownDirective, selector: "[nz-dropdown]", inputs: ["nzDropdownMenu", "nzTrigger", "nzMatchWidthElement", "nzBackdrop", "nzClickHide", "nzDisabled", "nzVisible", "nzOverlayClassName", "nzOverlayStyle", "nzPlacement"], outputs: ["nzVisibleChange"], exportAs: ["nzDropdown"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavOperationComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tab-nav-operation',
                    exportAs: 'nzTabNavOperation',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <button
      nz-dropdown
      class="ant-tabs-nav-more"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      nzOverlayClassName="nz-tabs-dropdown"
      #dropdownTrigger="nzDropdown"
      [nzDropdownMenu]="menu"
      [nzOverlayStyle]="{ minWidth: '46px' }"
      [nzMatchWidthElement]="null"
      (nzVisibleChange)="menuVisChange($event)"
      (mouseenter)="showItems()"
    >
      <nz-icon nzType="ellipsis" />
    </button>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      @if (menuOpened) {
        <ul nz-menu>
          @for (item of items; track item) {
            <li
              nz-menu-item
              class="ant-tabs-dropdown-menu-item"
              [class.ant-tabs-dropdown-menu-item-disabled]="item.disabled"
              [nzSelected]="item.active"
              [nzDisabled]="item.disabled"
              (click)="onSelect(item)"
              (contextmenu)="onContextmenu(item, $event)"
            >
              <ng-container *nzStringTemplateOutlet="item.tab.label; context: { visible: false }">
                {{ item.tab.label }}
              </ng-container>
            </li>
          }
        </ul>
      }
    </nz-dropdown-menu>
    @if (addable) {
      <button nz-tab-add-button [addIcon]="addIcon" (click)="addClicked.emit()"></button>
    }
  `,
                    host: {
                        class: 'ant-tabs-nav-operations',
                        '[class.ant-tabs-nav-operations-hidden]': 'items.length === 0'
                    },
                    imports: [
                        NzIconModule,
                        NzOutletModule,
                        NzTabAddButtonComponent,
                        NzDropdownMenuComponent,
                        NzMenuModule,
                        NzDropDownDirective
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }], propDecorators: { items: [{
                type: Input
            }], addable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], addIcon: [{
                type: Input
            }], addClicked: [{
                type: Output
            }], selected: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const MIN_SWIPE_DISTANCE = 0.1;
const STOP_SWIPE_DISTANCE = 0.01;
const REFRESH_INTERVAL = 20;
const SPEED_OFF_MULTIPLE = 0.995 ** REFRESH_INTERVAL;
class NzTabScrollListDirective {
    ngZone;
    elementRef;
    lastWheelDirection = null;
    lastWheelTimestamp = 0;
    lastTimestamp = 0;
    lastTimeDiff = 0;
    lastMixedWheel = 0;
    lastWheelPrevent = false;
    touchPosition = null;
    lastOffset = null;
    motion = -1;
    unsubscribe = () => void 0;
    offsetChange = new EventEmitter();
    tabScroll = new EventEmitter();
    constructor(ngZone, elementRef) {
        this.ngZone = ngZone;
        this.elementRef = elementRef;
    }
    ngOnInit() {
        this.unsubscribe = this.ngZone.runOutsideAngular(() => {
            const el = this.elementRef.nativeElement;
            const wheel$ = fromEvent(el, 'wheel');
            const touchstart$ = fromEvent(el, 'touchstart');
            const touchmove$ = fromEvent(el, 'touchmove');
            const touchend$ = fromEvent(el, 'touchend');
            const subscription = new Subscription();
            subscription.add(this.subscribeWrap('wheel', wheel$, this.onWheel));
            subscription.add(this.subscribeWrap('touchstart', touchstart$, this.onTouchStart));
            subscription.add(this.subscribeWrap('touchmove', touchmove$, this.onTouchMove));
            subscription.add(this.subscribeWrap('touchend', touchend$, this.onTouchEnd));
            return () => {
                subscription.unsubscribe();
            };
        });
    }
    subscribeWrap(type, observable, handler) {
        return observable.subscribe(event => {
            this.tabScroll.emit({
                type,
                event
            });
            if (!event.defaultPrevented) {
                handler(event);
            }
        });
    }
    onTouchEnd = (e) => {
        if (!this.touchPosition) {
            return;
        }
        const lastOffset = this.lastOffset;
        const lastTimeDiff = this.lastTimeDiff;
        this.lastOffset = this.touchPosition = null;
        if (lastOffset) {
            const distanceX = lastOffset.x / lastTimeDiff;
            const distanceY = lastOffset.y / lastTimeDiff;
            const absX = Math.abs(distanceX);
            const absY = Math.abs(distanceY);
            // Skip swipe if low distance
            if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE) {
                return;
            }
            let currentX = distanceX;
            let currentY = distanceY;
            this.motion = window.setInterval(() => {
                if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
                    window.clearInterval(this.motion);
                    return;
                }
                currentX *= SPEED_OFF_MULTIPLE;
                currentY *= SPEED_OFF_MULTIPLE;
                this.onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL, e);
            }, REFRESH_INTERVAL);
        }
    };
    onTouchMove = (e) => {
        if (!this.touchPosition) {
            return;
        }
        e.preventDefault();
        const { screenX, screenY } = e.touches[0];
        const offsetX = screenX - this.touchPosition.x;
        const offsetY = screenY - this.touchPosition.y;
        this.onOffset(offsetX, offsetY, e);
        const now = Date.now();
        this.lastTimeDiff = now - this.lastTimestamp;
        this.lastTimestamp = now;
        this.lastOffset = { x: offsetX, y: offsetY };
        this.touchPosition = { x: screenX, y: screenY };
    };
    onTouchStart = (e) => {
        const { screenX, screenY } = e.touches[0];
        this.touchPosition = { x: screenX, y: screenY };
        window.clearInterval(this.motion);
    };
    onWheel = (e) => {
        const { deltaX, deltaY } = e;
        let mixed;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX === absY) {
            mixed = this.lastWheelDirection === 'x' ? deltaX : deltaY;
        }
        else if (absX > absY) {
            mixed = deltaX;
            this.lastWheelDirection = 'x';
        }
        else {
            mixed = deltaY;
            this.lastWheelDirection = 'y';
        }
        // Optimize mac touch scroll
        const now = Date.now();
        const absMixed = Math.abs(mixed);
        if (now - this.lastWheelTimestamp > 100 || absMixed - this.lastMixedWheel > 10) {
            this.lastWheelPrevent = false;
        }
        this.onOffset(-mixed, -mixed, e);
        if (e.defaultPrevented || this.lastWheelPrevent) {
            this.lastWheelPrevent = true;
        }
        this.lastWheelTimestamp = now;
        this.lastMixedWheel = absMixed;
    };
    onOffset(x, y, event) {
        this.ngZone.run(() => {
            this.offsetChange.emit({
                x,
                y,
                event
            });
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabScrollListDirective, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTabScrollListDirective, isStandalone: true, selector: "[nzTabScrollList]", outputs: { offsetChange: "offsetChange", tabScroll: "tabScroll" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabScrollListDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTabScrollList]'
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }], propDecorators: { offsetChange: [{
                type: Output
            }], tabScroll: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTabsInkBarDirective {
    elementRef;
    ngZone;
    position = 'horizontal';
    animated = true;
    animationMode = inject(ANIMATION_MODULE_TYPE, { optional: true });
    get _animated() {
        return this.animationMode !== 'NoopAnimations' && this.animated;
    }
    constructor(elementRef, ngZone) {
        this.elementRef = elementRef;
        this.ngZone = ngZone;
    }
    alignToElement(element) {
        this.ngZone.runOutsideAngular(() => {
            reqAnimFrame(() => this.setStyles(element));
        });
    }
    setStyles(element) {
        const inkBar = this.elementRef.nativeElement;
        if (this.position === 'horizontal') {
            inkBar.style.top = '';
            inkBar.style.height = '';
            inkBar.style.left = this.getLeftPosition(element);
            inkBar.style.width = this.getElementWidth(element);
        }
        else {
            inkBar.style.left = '';
            inkBar.style.width = '';
            inkBar.style.top = this.getTopPosition(element);
            inkBar.style.height = this.getElementHeight(element);
        }
    }
    getLeftPosition(element) {
        return element ? `${element.offsetLeft || 0}px` : '0';
    }
    getElementWidth(element) {
        return element ? `${element.offsetWidth || 0}px` : '0';
    }
    getTopPosition(element) {
        return element ? `${element.offsetTop || 0}px` : '0';
    }
    getElementHeight(element) {
        return element ? `${element.offsetHeight || 0}px` : '0';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabsInkBarDirective, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTabsInkBarDirective, isStandalone: true, selector: "nz-tabs-ink-bar, [nz-tabs-ink-bar]", inputs: { position: "position", animated: "animated" }, host: { properties: { "class.ant-tabs-ink-bar-animated": "_animated" }, classAttribute: "ant-tabs-ink-bar" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabsInkBarDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-tabs-ink-bar, [nz-tabs-ink-bar]',
                    host: {
                        class: 'ant-tabs-ink-bar',
                        '[class.ant-tabs-ink-bar-animated]': '_animated'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { position: [{
                type: Input
            }], animated: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const RESIZE_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
const CSS_TRANSFORM_TIME = 150;
class NzTabNavBarComponent {
    cdr;
    ngZone;
    viewportRuler;
    nzResizeObserver;
    dir;
    indexFocused = new EventEmitter();
    selectFocusedIndex = new EventEmitter();
    addClicked = new EventEmitter();
    tabScroll = new EventEmitter();
    position = 'horizontal';
    addable = false;
    hideBar = false;
    addIcon = 'plus';
    inkBarAnimated = true;
    extraTemplate;
    extraContents = input.required();
    startExtraContent = computed(() => this.extraContents().find(item => item.position() === 'start'));
    endExtraContent = computed(() => this.extraContents().find(item => item.position() === 'end'));
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        const newValue = coerceNumberProperty(value);
        if (this._selectedIndex !== newValue) {
            this._selectedIndex = value;
            this.selectedIndexChanged = true;
            if (this.keyManager) {
                this.keyManager.updateActiveItem(value);
            }
        }
    }
    navWarpRef;
    navListRef;
    operationRef;
    addBtnRef;
    inkBar;
    items;
    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex() {
        return this.keyManager ? this.keyManager.activeItemIndex : 0;
    }
    /** When the focus index is set, we must manually send focus to the correct label */
    set focusIndex(value) {
        if (!this.isValidIndex(value) || this.focusIndex === value || !this.keyManager) {
            return;
        }
        this.keyManager.setActiveItem(value);
    }
    get showAddButton() {
        return this.hiddenItems.length === 0 && this.addable;
    }
    translate = null;
    transformX = 0;
    transformY = 0;
    pingLeft = false;
    pingRight = false;
    pingTop = false;
    pingBottom = false;
    hiddenItems = [];
    keyManager;
    destroy$ = new Subject();
    _selectedIndex = 0;
    wrapperWidth = 0;
    wrapperHeight = 0;
    scrollListWidth = 0;
    scrollListHeight = 0;
    operationWidth = 0;
    operationHeight = 0;
    addButtonWidth = 0;
    addButtonHeight = 0;
    selectedIndexChanged = false;
    lockAnimationTimeoutId;
    cssTransformTimeWaitingId;
    constructor(cdr, ngZone, viewportRuler, nzResizeObserver, dir) {
        this.cdr = cdr;
        this.ngZone = ngZone;
        this.viewportRuler = viewportRuler;
        this.nzResizeObserver = nzResizeObserver;
        this.dir = dir;
    }
    ngAfterViewInit() {
        const dirChange = this.dir ? this.dir.change.asObservable() : of(null);
        const resize = this.viewportRuler.change(150);
        const realign = () => {
            this.updateScrollListPosition();
            this.alignInkBarToSelectedTab();
        };
        this.keyManager = new FocusKeyManager(this.items)
            .withHorizontalOrientation(this.getLayoutDirection())
            .withWrap();
        this.keyManager.updateActiveItem(this.selectedIndex);
        reqAnimFrame(realign);
        merge(this.nzResizeObserver.observe(this.navWarpRef), this.nzResizeObserver.observe(this.navListRef))
            .pipe(takeUntil(this.destroy$), auditTime(16, RESIZE_SCHEDULER))
            .subscribe(() => {
            realign();
        });
        merge(dirChange, resize, this.items.changes)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            Promise.resolve().then(realign);
            this.keyManager.withHorizontalOrientation(this.getLayoutDirection());
        });
        this.keyManager.change.pipe(takeUntil(this.destroy$)).subscribe(newFocusIndex => {
            this.indexFocused.emit(newFocusIndex);
            this.setTabFocus(newFocusIndex);
            this.scrollToTab(this.keyManager.activeItem);
        });
    }
    ngAfterContentChecked() {
        if (this.selectedIndexChanged) {
            this.updateScrollListPosition();
            this.alignInkBarToSelectedTab();
            this.selectedIndexChanged = false;
            this.cdr.markForCheck();
        }
    }
    ngOnDestroy() {
        clearTimeout(this.lockAnimationTimeoutId);
        clearTimeout(this.cssTransformTimeWaitingId);
        this.destroy$.next();
        this.destroy$.complete();
    }
    onSelectedFromMenu(tab) {
        const tabIndex = this.items.toArray().findIndex(e => e === tab);
        if (tabIndex !== -1) {
            this.keyManager.updateActiveItem(tabIndex);
            if (this.focusIndex !== this.selectedIndex) {
                this.selectFocusedIndex.emit(this.focusIndex);
                this.scrollToTab(tab);
            }
        }
    }
    onOffsetChange(e) {
        if (this.position === 'horizontal') {
            if (!this.lockAnimationTimeoutId) {
                if (this.transformX >= 0 && e.x > 0) {
                    return;
                }
                if (this.transformX <= this.wrapperWidth - this.scrollListWidth && e.x < 0) {
                    return;
                }
            }
            e.event.preventDefault();
            this.transformX = this.clampTransformX(this.transformX + e.x);
            this.setTransform(this.transformX, 0);
        }
        else {
            if (!this.lockAnimationTimeoutId) {
                if (this.transformY >= 0 && e.y > 0) {
                    return;
                }
                if (this.transformY <= this.wrapperHeight - this.scrollListHeight && e.y < 0) {
                    return;
                }
            }
            e.event.preventDefault();
            this.transformY = this.clampTransformY(this.transformY + e.y);
            this.setTransform(0, this.transformY);
        }
        this.lockAnimation();
        this.setVisibleRange();
        this.setPingStatus();
    }
    handleKeydown(event) {
        const inNavigationList = this.navWarpRef.nativeElement.contains(event.target);
        if (hasModifierKey(event) || !inNavigationList) {
            return;
        }
        switch (event.keyCode) {
            case LEFT_ARROW:
            case UP_ARROW:
            case RIGHT_ARROW:
            case DOWN_ARROW:
                this.lockAnimation();
                this.keyManager.onKeydown(event);
                break;
            case ENTER:
            case SPACE:
                if (this.focusIndex !== this.selectedIndex) {
                    this.selectFocusedIndex.emit(this.focusIndex);
                }
                break;
            default:
                this.keyManager.onKeydown(event);
        }
    }
    isValidIndex(index) {
        if (!this.items) {
            return true;
        }
        const tab = this.items ? this.items.toArray()[index] : null;
        return !!tab && !tab.disabled;
    }
    scrollToTab(tab) {
        if (!this.items.find(e => e === tab)) {
            return;
        }
        const tabs = this.items.toArray();
        if (this.position === 'horizontal') {
            let newTransform = this.transformX;
            if (this.getLayoutDirection() === 'rtl') {
                const right = tabs[0].left + tabs[0].width - tab.left - tab.width;
                if (right < this.transformX) {
                    newTransform = right;
                }
                else if (right + tab.width > this.transformX + this.wrapperWidth) {
                    newTransform = right + tab.width - this.wrapperWidth;
                }
            }
            else if (tab.left < -this.transformX) {
                newTransform = -tab.left;
            }
            else if (tab.left + tab.width > -this.transformX + this.wrapperWidth) {
                newTransform = -(tab.left + tab.width - this.wrapperWidth);
            }
            this.transformX = newTransform;
            this.transformY = 0;
            this.setTransform(newTransform, 0);
        }
        else {
            let newTransform = this.transformY;
            if (tab.top < -this.transformY) {
                newTransform = -tab.top;
            }
            else if (tab.top + tab.height > -this.transformY + this.wrapperHeight) {
                newTransform = -(tab.top + tab.height - this.wrapperHeight);
            }
            this.transformY = newTransform;
            this.transformX = 0;
            this.setTransform(0, newTransform);
        }
        clearTimeout(this.cssTransformTimeWaitingId);
        this.cssTransformTimeWaitingId = setTimeout(() => {
            this.setVisibleRange();
        }, CSS_TRANSFORM_TIME);
    }
    lockAnimation() {
        if (!this.lockAnimationTimeoutId) {
            this.ngZone.runOutsideAngular(() => {
                this.navListRef.nativeElement.style.transition = 'none';
                this.lockAnimationTimeoutId = setTimeout(() => {
                    this.navListRef.nativeElement.style.transition = '';
                    this.lockAnimationTimeoutId = undefined;
                }, CSS_TRANSFORM_TIME);
            });
        }
    }
    setTransform(x, y) {
        this.navListRef.nativeElement.style.transform = `translate(${x}px, ${y}px)`;
    }
    clampTransformX(transform) {
        const scrollWidth = this.wrapperWidth - this.scrollListWidth;
        if (this.getLayoutDirection() === 'rtl') {
            return Math.max(Math.min(scrollWidth, transform), 0);
        }
        else {
            return Math.min(Math.max(scrollWidth, transform), 0);
        }
    }
    clampTransformY(transform) {
        return Math.min(Math.max(this.wrapperHeight - this.scrollListHeight, transform), 0);
    }
    updateScrollListPosition() {
        this.resetSizes();
        this.transformX = this.clampTransformX(this.transformX);
        this.transformY = this.clampTransformY(this.transformY);
        this.setVisibleRange();
        this.setPingStatus();
        if (this.keyManager) {
            this.keyManager.updateActiveItem(this.keyManager.activeItemIndex);
            if (this.keyManager.activeItem) {
                this.scrollToTab(this.keyManager.activeItem);
            }
        }
    }
    resetSizes() {
        this.addButtonWidth = this.addBtnRef ? this.addBtnRef.getElementWidth() : 0;
        this.addButtonHeight = this.addBtnRef ? this.addBtnRef.getElementHeight() : 0;
        this.operationWidth = this.operationRef.getElementWidth();
        this.operationHeight = this.operationRef.getElementHeight();
        this.wrapperWidth = this.navWarpRef.nativeElement.offsetWidth || 0;
        this.wrapperHeight = this.navWarpRef.nativeElement.offsetHeight || 0;
        this.scrollListHeight = this.navListRef.nativeElement.offsetHeight || 0;
        this.scrollListWidth = this.navListRef.nativeElement.offsetWidth || 0;
    }
    alignInkBarToSelectedTab() {
        const selectedItem = this.items && this.items.length ? this.items.toArray()[this.selectedIndex] : null;
        const selectedItemElement = selectedItem ? selectedItem.elementRef.nativeElement : null;
        if (selectedItemElement) {
            /**
             * .ant-tabs-nav-list - Target offset parent element
             *   └──.ant-tabs-tab
             *        └──.ant-tabs-tab-btn - Currently focused element
             */
            this.inkBar.alignToElement(selectedItemElement.parentElement);
        }
    }
    setPingStatus() {
        const ping = {
            top: false,
            right: false,
            bottom: false,
            left: false
        };
        const navWarp = this.navWarpRef.nativeElement;
        if (this.position === 'horizontal') {
            if (this.getLayoutDirection() === 'rtl') {
                ping.right = this.transformX > 0;
                ping.left = this.transformX + this.wrapperWidth < this.scrollListWidth;
            }
            else {
                ping.left = this.transformX < 0;
                ping.right = -this.transformX + this.wrapperWidth < this.scrollListWidth;
            }
        }
        else {
            ping.top = this.transformY < 0;
            ping.bottom = -this.transformY + this.wrapperHeight < this.scrollListHeight;
        }
        Object.keys(ping).forEach(pos => {
            const className = `ant-tabs-nav-wrap-ping-${pos}`;
            if (ping[pos]) {
                navWarp.classList.add(className);
            }
            else {
                navWarp.classList.remove(className);
            }
        });
    }
    setVisibleRange() {
        let unit;
        let position;
        let transformSize;
        let basicSize;
        let tabContentSize;
        let addSize;
        const tabs = this.items.toArray();
        const DEFAULT_SIZE = { width: 0, height: 0, left: 0, top: 0, right: 0 };
        const getOffset = (index) => {
            let offset;
            const size = tabs[index] || DEFAULT_SIZE;
            if (position === 'right') {
                offset = tabs[0].left + tabs[0].width - tabs[index].left - tabs[index].width;
            }
            else {
                offset = size[position];
            }
            return offset;
        };
        if (this.position === 'horizontal') {
            unit = 'width';
            basicSize = this.wrapperWidth;
            tabContentSize = this.scrollListWidth - (this.hiddenItems.length ? this.operationWidth : 0);
            addSize = this.addButtonWidth;
            transformSize = Math.abs(this.transformX);
            if (this.getLayoutDirection() === 'rtl') {
                position = 'right';
                this.pingRight = this.transformX > 0;
                this.pingLeft = this.transformX + this.wrapperWidth < this.scrollListWidth;
            }
            else {
                this.pingLeft = this.transformX < 0;
                this.pingRight = -this.transformX + this.wrapperWidth < this.scrollListWidth;
                position = 'left';
            }
        }
        else {
            unit = 'height';
            basicSize = this.wrapperHeight;
            tabContentSize = this.scrollListHeight - (this.hiddenItems.length ? this.operationHeight : 0);
            addSize = this.addButtonHeight;
            position = 'top';
            transformSize = -this.transformY;
            this.pingTop = this.transformY < 0;
            this.pingBottom = -this.transformY + this.wrapperHeight < this.scrollListHeight;
        }
        let mergedBasicSize = basicSize;
        if (tabContentSize + addSize > basicSize) {
            mergedBasicSize = basicSize - addSize;
        }
        if (!tabs.length) {
            this.hiddenItems = [];
            this.cdr.markForCheck();
            return;
        }
        const len = tabs.length;
        let endIndex = len;
        for (let i = 0; i < len; i += 1) {
            const offset = getOffset(i);
            const size = tabs[i] || DEFAULT_SIZE;
            if (offset + size[unit] > transformSize + mergedBasicSize) {
                endIndex = i - 1;
                break;
            }
        }
        let startIndex = 0;
        for (let i = len - 1; i >= 0; i -= 1) {
            const offset = getOffset(i);
            if (offset < transformSize) {
                startIndex = i + 1;
                break;
            }
        }
        const startHiddenTabs = tabs.slice(0, startIndex);
        const endHiddenTabs = tabs.slice(endIndex + 1);
        this.hiddenItems = [...startHiddenTabs, ...endHiddenTabs];
        this.cdr.markForCheck();
    }
    getLayoutDirection() {
        return this.dir && this.dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    setTabFocus(_tabIndex) { }
    ngOnChanges(changes) {
        const { position } = changes;
        // The first will be aligning in ngAfterViewInit
        if (position && !position.isFirstChange()) {
            this.alignInkBarToSelectedTab();
            this.lockAnimation();
            this.updateScrollListPosition();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavBarComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i1$1.ViewportRuler }, { token: i2$1.NzResizeObserver }, { token: i3$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTabNavBarComponent, isStandalone: true, selector: "nz-tabs-nav", inputs: { position: { classPropertyName: "position", publicName: "position", isSignal: false, isRequired: false, transformFunction: null }, addable: { classPropertyName: "addable", publicName: "addable", isSignal: false, isRequired: false, transformFunction: booleanAttribute }, hideBar: { classPropertyName: "hideBar", publicName: "hideBar", isSignal: false, isRequired: false, transformFunction: booleanAttribute }, addIcon: { classPropertyName: "addIcon", publicName: "addIcon", isSignal: false, isRequired: false, transformFunction: null }, inkBarAnimated: { classPropertyName: "inkBarAnimated", publicName: "inkBarAnimated", isSignal: false, isRequired: false, transformFunction: null }, extraTemplate: { classPropertyName: "extraTemplate", publicName: "extraTemplate", isSignal: false, isRequired: false, transformFunction: null }, extraContents: { classPropertyName: "extraContents", publicName: "extraContents", isSignal: true, isRequired: true, transformFunction: null }, selectedIndex: { classPropertyName: "selectedIndex", publicName: "selectedIndex", isSignal: false, isRequired: false, transformFunction: null } }, outputs: { indexFocused: "indexFocused", selectFocusedIndex: "selectFocusedIndex", addClicked: "addClicked", tabScroll: "tabScroll" }, host: { listeners: { "keydown": "handleKeydown($event)" }, classAttribute: "ant-tabs-nav" }, queries: [{ propertyName: "items", predicate: NzTabNavItemDirective, descendants: true }], viewQueries: [{ propertyName: "navWarpRef", first: true, predicate: ["navWarp"], descendants: true, static: true }, { propertyName: "navListRef", first: true, predicate: ["navList"], descendants: true, static: true }, { propertyName: "operationRef", first: true, predicate: NzTabNavOperationComponent, descendants: true, static: true }, { propertyName: "addBtnRef", first: true, predicate: NzTabAddButtonComponent, descendants: true }, { propertyName: "inkBar", first: true, predicate: NzTabsInkBarDirective, descendants: true, static: true }], exportAs: ["nzTabsNav"], usesOnChanges: true, ngImport: i0, template: `
    @if (startExtraContent()) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="startExtraContent()!.templateRef"></ng-template>
      </div>
    }
    <div
      class="ant-tabs-nav-wrap"
      [class.ant-tabs-nav-wrap-ping-left]="pingLeft"
      [class.ant-tabs-nav-wrap-ping-right]="pingRight"
      [class.ant-tabs-nav-wrap-ping-top]="pingTop"
      [class.ant-tabs-nav-wrap-ping-bottom]="pingBottom"
      #navWarp
    >
      <div
        class="ant-tabs-nav-list"
        #navList
        nzTabScrollList
        (offsetChange)="onOffsetChange($event)"
        (tabScroll)="tabScroll.emit($event)"
        role="tablist"
      >
        <ng-content></ng-content>
        @if (showAddButton) {
          <button
            role="tab"
            [attr.tabindex]="-1"
            nz-tab-add-button
            [addIcon]="addIcon"
            (click)="addClicked.emit()"
          ></button>
        }
        <div nz-tabs-ink-bar [hidden]="hideBar" [position]="position" [animated]="inkBarAnimated"></div>
      </div>
    </div>
    <nz-tab-nav-operation
      (addClicked)="addClicked.emit()"
      (selected)="onSelectedFromMenu($event)"
      [addIcon]="addIcon"
      [addable]="addable"
      [items]="hiddenItems"
    ></nz-tab-nav-operation>
    @if (endExtraContent()) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="endExtraContent()!.templateRef"></ng-template>
      </div>
    } @else if (extraTemplate) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="extraTemplate"></ng-template>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NzTabScrollListDirective, selector: "[nzTabScrollList]", outputs: ["offsetChange", "tabScroll"] }, { kind: "component", type: NzTabAddButtonComponent, selector: "nz-tab-add-button, button[nz-tab-add-button]", inputs: ["addIcon"] }, { kind: "directive", type: NzTabsInkBarDirective, selector: "nz-tabs-ink-bar, [nz-tabs-ink-bar]", inputs: ["position", "animated"] }, { kind: "component", type: NzTabNavOperationComponent, selector: "nz-tab-nav-operation", inputs: ["items", "addable", "addIcon"], outputs: ["addClicked", "selected"], exportAs: ["nzTabNavOperation"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabNavBarComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tabs-nav',
                    exportAs: 'nzTabsNav',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (startExtraContent()) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="startExtraContent()!.templateRef"></ng-template>
      </div>
    }
    <div
      class="ant-tabs-nav-wrap"
      [class.ant-tabs-nav-wrap-ping-left]="pingLeft"
      [class.ant-tabs-nav-wrap-ping-right]="pingRight"
      [class.ant-tabs-nav-wrap-ping-top]="pingTop"
      [class.ant-tabs-nav-wrap-ping-bottom]="pingBottom"
      #navWarp
    >
      <div
        class="ant-tabs-nav-list"
        #navList
        nzTabScrollList
        (offsetChange)="onOffsetChange($event)"
        (tabScroll)="tabScroll.emit($event)"
        role="tablist"
      >
        <ng-content></ng-content>
        @if (showAddButton) {
          <button
            role="tab"
            [attr.tabindex]="-1"
            nz-tab-add-button
            [addIcon]="addIcon"
            (click)="addClicked.emit()"
          ></button>
        }
        <div nz-tabs-ink-bar [hidden]="hideBar" [position]="position" [animated]="inkBarAnimated"></div>
      </div>
    </div>
    <nz-tab-nav-operation
      (addClicked)="addClicked.emit()"
      (selected)="onSelectedFromMenu($event)"
      [addIcon]="addIcon"
      [addable]="addable"
      [items]="hiddenItems"
    ></nz-tab-nav-operation>
    @if (endExtraContent()) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="endExtraContent()!.templateRef"></ng-template>
      </div>
    } @else if (extraTemplate) {
      <div class="ant-tabs-extra-content">
        <ng-template [ngTemplateOutlet]="extraTemplate"></ng-template>
      </div>
    }
  `,
                    host: {
                        class: 'ant-tabs-nav',
                        '(keydown)': 'handleKeydown($event)'
                    },
                    imports: [
                        NzTabScrollListDirective,
                        NzTabAddButtonComponent,
                        NzTabsInkBarDirective,
                        NzTabNavOperationComponent,
                        NgTemplateOutlet
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i1$1.ViewportRuler }, { type: i2$1.NzResizeObserver }, { type: i3$1.Directionality }], propDecorators: { indexFocused: [{
                type: Output
            }], selectFocusedIndex: [{
                type: Output
            }], addClicked: [{
                type: Output
            }], tabScroll: [{
                type: Output
            }], position: [{
                type: Input
            }], addable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hideBar: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], addIcon: [{
                type: Input
            }], inkBarAnimated: [{
                type: Input
            }], extraTemplate: [{
                type: Input
            }], selectedIndex: [{
                type: Input
            }], navWarpRef: [{
                type: ViewChild,
                args: ['navWarp', { static: true }]
            }], navListRef: [{
                type: ViewChild,
                args: ['navList', { static: true }]
            }], operationRef: [{
                type: ViewChild,
                args: [NzTabNavOperationComponent, { static: true }]
            }], addBtnRef: [{
                type: ViewChild,
                args: [NzTabAddButtonComponent, { static: false }]
            }], inkBar: [{
                type: ViewChild,
                args: [NzTabsInkBarDirective, { static: true }]
            }], items: [{
                type: ContentChildren,
                args: [NzTabNavItemDirective, { descendants: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/** Decorates the `ng-template` tags and reads out the template from it. */
class NzTabDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTabDirective, isStandalone: true, selector: "[nz-tab]", exportAs: ["nzTab"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-tab]',
                    exportAs: 'nzTab'
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * Used to provide a tab set to a tab without causing a circular dependency.
 */
const NZ_TAB_SET = new InjectionToken('NZ_TAB_SET');
class NzTabComponent {
    nzTitle = '';
    nzClosable = false;
    nzCloseIcon = 'close';
    nzDisabled = false;
    nzForceRender = false;
    nzSelect = new EventEmitter();
    nzDeselect = new EventEmitter();
    nzClick = new EventEmitter();
    nzContextmenu = new EventEmitter();
    nzTabLinkTemplateDirective;
    template = null;
    linkDirective;
    contentTemplate;
    isActive = false;
    hasBeenActive = false;
    position = null;
    origin = null;
    closestTabSet = inject(NZ_TAB_SET);
    stateChanges = new Subject();
    get content() {
        return this.template || this.contentTemplate;
    }
    get label() {
        return this.nzTitle || this.nzTabLinkTemplateDirective?.templateRef;
    }
    ngOnChanges(changes) {
        const { nzTitle, nzDisabled, nzForceRender } = changes;
        if (nzTitle || nzDisabled || nzForceRender) {
            this.stateChanges.next();
        }
    }
    ngOnDestroy() {
        this.stateChanges.complete();
    }
    setActive(active) {
        this.isActive = active;
        if (active) {
            this.hasBeenActive = true;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTabComponent, isStandalone: true, selector: "nz-tab", inputs: { nzTitle: "nzTitle", nzClosable: ["nzClosable", "nzClosable", booleanAttribute], nzCloseIcon: "nzCloseIcon", nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzForceRender: ["nzForceRender", "nzForceRender", booleanAttribute] }, outputs: { nzSelect: "nzSelect", nzDeselect: "nzDeselect", nzClick: "nzClick", nzContextmenu: "nzContextmenu" }, queries: [{ propertyName: "nzTabLinkTemplateDirective", first: true, predicate: NzTabLinkTemplateDirective, descendants: true }, { propertyName: "template", first: true, predicate: NzTabDirective, descendants: true, read: TemplateRef }, { propertyName: "linkDirective", first: true, predicate: NzTabLinkDirective, descendants: true }], viewQueries: [{ propertyName: "contentTemplate", first: true, predicate: ["contentTemplate"], descendants: true, static: true }], exportAs: ["nzTab"], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #tabLinkTemplate>
      <ng-content select="[nz-tab-link]"></ng-content>
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tab',
                    exportAs: 'nzTab',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <ng-template #tabLinkTemplate>
      <ng-content select="[nz-tab-link]"></ng-content>
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `
                }]
        }], propDecorators: { nzTitle: [{
                type: Input
            }], nzClosable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCloseIcon: [{
                type: Input
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzForceRender: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelect: [{
                type: Output
            }], nzDeselect: [{
                type: Output
            }], nzClick: [{
                type: Output
            }], nzContextmenu: [{
                type: Output
            }], nzTabLinkTemplateDirective: [{
                type: ContentChild,
                args: [NzTabLinkTemplateDirective, { static: false }]
            }], template: [{
                type: ContentChild,
                args: [NzTabDirective, { static: false, read: TemplateRef }]
            }], linkDirective: [{
                type: ContentChild,
                args: [NzTabLinkDirective, { static: false }]
            }], contentTemplate: [{
                type: ViewChild,
                args: ['contentTemplate', { static: true }]
            }] } });

const NZ_CONFIG_MODULE_NAME = 'tabs';
let nextId = 0;
let NzTabSetComponent = (() => {
    let _nzType_decorators;
    let _nzType_initializers = [];
    let _nzType_extraInitializers = [];
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    let _nzAnimated_decorators;
    let _nzAnimated_initializers = [];
    let _nzAnimated_extraInitializers = [];
    let _nzTabBarGutter_decorators;
    let _nzTabBarGutter_initializers = [];
    let _nzTabBarGutter_extraInitializers = [];
    return class NzTabSetComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzType_decorators = [WithConfig()];
            _nzSize_decorators = [WithConfig()];
            _nzAnimated_decorators = [WithConfig()];
            _nzTabBarGutter_decorators = [WithConfig()];
            __esDecorate(null, null, _nzType_decorators, { kind: "field", name: "nzType", static: false, private: false, access: { has: obj => "nzType" in obj, get: obj => obj.nzType, set: (obj, value) => { obj.nzType = value; } }, metadata: _metadata }, _nzType_initializers, _nzType_extraInitializers);
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            __esDecorate(null, null, _nzAnimated_decorators, { kind: "field", name: "nzAnimated", static: false, private: false, access: { has: obj => "nzAnimated" in obj, get: obj => obj.nzAnimated, set: (obj, value) => { obj.nzAnimated = value; } }, metadata: _metadata }, _nzAnimated_initializers, _nzAnimated_extraInitializers);
            __esDecorate(null, null, _nzTabBarGutter_decorators, { kind: "field", name: "nzTabBarGutter", static: false, private: false, access: { has: obj => "nzTabBarGutter" in obj, get: obj => obj.nzTabBarGutter, set: (obj, value) => { obj.nzTabBarGutter = value; } }, metadata: _metadata }, _nzTabBarGutter_initializers, _nzTabBarGutter_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        ngZone;
        cdr;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        get nzSelectedIndex() {
            return this.selectedIndex;
        }
        set nzSelectedIndex(value) {
            this.indexToSelect = coerceNumberProperty(value, null);
        }
        nzTabPosition = 'top';
        nzTabBarExtraContent;
        nzCanDeactivate = null;
        nzAddIcon = 'plus';
        nzTabBarStyle = null;
        nzType = __runInitializers(this, _nzType_initializers, 'line');
        nzSize = (__runInitializers(this, _nzType_extraInitializers), __runInitializers(this, _nzSize_initializers, 'default'));
        nzAnimated = (__runInitializers(this, _nzSize_extraInitializers), __runInitializers(this, _nzAnimated_initializers, true));
        nzTabBarGutter = (__runInitializers(this, _nzAnimated_extraInitializers), __runInitializers(this, _nzTabBarGutter_initializers, undefined));
        nzHideAdd = (__runInitializers(this, _nzTabBarGutter_extraInitializers), false);
        nzCentered = false;
        nzHideAll = false;
        nzLinkRouter = false;
        nzLinkExact = true;
        nzDestroyInactiveTabPane = false;
        nzSelectChange = new EventEmitter(true);
        nzSelectedIndexChange = new EventEmitter();
        nzTabListScroll = new EventEmitter();
        nzClose = new EventEmitter();
        nzAdd = new EventEmitter();
        get position() {
            return ['top', 'bottom'].indexOf(this.nzTabPosition) === -1 ? 'vertical' : 'horizontal';
        }
        get addable() {
            return this.nzType === 'editable-card' && !this.nzHideAdd;
        }
        get closable() {
            return this.nzType === 'editable-card';
        }
        get line() {
            return this.nzType === 'line';
        }
        get inkBarAnimated() {
            return this.line && (typeof this.nzAnimated === 'boolean' ? this.nzAnimated : this.nzAnimated.inkBar);
        }
        get tabPaneAnimated() {
            return typeof this.nzAnimated === 'boolean' ? this.nzAnimated : this.nzAnimated.tabPane;
        }
        // Pick up only direct descendants under ivy rendering engine
        // We filter out only the tabs that belong to this tab set in `tabs`.
        allTabs = new QueryList();
        tabLinks = new QueryList();
        tabNavBarRef;
        // All the direct tabs for this tab set
        tabs = new QueryList();
        extraContents = contentChildren(NzTabBarExtraContentDirective);
        dir = 'ltr';
        tabSetId;
        destroy$ = new Subject();
        indexToSelect = 0;
        selectedIndex = null;
        tabLabelSubscription = Subscription.EMPTY;
        tabsSubscription = Subscription.EMPTY;
        canDeactivateSubscription = Subscription.EMPTY;
        router = inject(Router, { optional: true });
        constructor(nzConfigService, ngZone, cdr, directionality) {
            this.nzConfigService = nzConfigService;
            this.ngZone = ngZone;
            this.cdr = cdr;
            this.directionality = directionality;
            this.tabSetId = nextId++;
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
            this.tabs.destroy();
            this.tabLabelSubscription.unsubscribe();
            this.tabsSubscription.unsubscribe();
            this.canDeactivateSubscription.unsubscribe();
        }
        ngAfterContentInit() {
            this.ngZone.runOutsideAngular(() => {
                Promise.resolve().then(() => this.setUpRouter());
            });
            this.subscribeToTabLabels();
            this.subscribeToAllTabChanges();
            // Subscribe to changes of the number of tabs, to be
            // able to re-render the content as new tabs are added or removed.
            this.tabsSubscription = this.tabs.changes.subscribe(() => {
                const indexToSelect = this.clampTabIndex(this.indexToSelect);
                // Maintain the previously selected tab if a new tab is added or removed, and there is no
                // explicit change that selects a different tab.
                if (indexToSelect === this.selectedIndex) {
                    const tabs = this.tabs.toArray();
                    for (let i = 0; i < tabs.length; i++) {
                        if (tabs[i].isActive) {
                            // Assign both to the `indexToSelect` and `selectedIndex` so we don't fire a changed
                            // event, otherwise the consumer may end up in an infinite loop in some edge cases like
                            // adding a tab within the `nzSelectedIndexChange` event.
                            this.indexToSelect = this.selectedIndex = i;
                            break;
                        }
                    }
                }
                this.subscribeToTabLabels();
                this.cdr.markForCheck();
            });
        }
        ngAfterContentChecked() {
            // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
            // the amount of tabs changes before the actual change detection runs.
            const indexToSelect = (this.indexToSelect = this.clampTabIndex(this.indexToSelect));
            // If there is a change in the selected index, emit a change event. Should not trigger if
            // the selected index has not yet been initialized.
            if (this.selectedIndex !== indexToSelect) {
                const isFirstRun = this.selectedIndex == null;
                if (!isFirstRun) {
                    this.nzSelectChange.emit(this.createChangeEvent(indexToSelect));
                }
                // Changing these values after change detection has run
                // since the checked content may contain references to them.
                Promise.resolve().then(() => {
                    this.tabs.forEach((tab, index) => tab.setActive(index === indexToSelect));
                    if (!isFirstRun) {
                        this.nzSelectedIndexChange.emit(indexToSelect);
                    }
                });
            }
            // Set up the position for each tab and optionally set up an origin on the next selected tab.
            this.tabs.forEach((tab, index) => {
                tab.position = index - indexToSelect;
                // If there is already a selected tab, then set up an origin for the next selected tab
                // if it doesn't have one already.
                if (this.selectedIndex != null && tab.position === 0 && !tab.origin) {
                    tab.origin = indexToSelect - this.selectedIndex;
                }
            });
            if (this.selectedIndex !== indexToSelect) {
                this.selectedIndex = indexToSelect;
                this.cdr.markForCheck();
            }
        }
        onClose(index, e) {
            e.preventDefault();
            e.stopPropagation();
            this.nzClose.emit({ index });
        }
        onAdd() {
            this.nzAdd.emit();
        }
        clampTabIndex(index) {
            return Math.min(this.tabs.length - 1, Math.max(index || 0, 0));
        }
        createChangeEvent(index) {
            const event = new NzTabChangeEvent();
            event.index = index;
            if (this.tabs && this.tabs.length) {
                event.tab = this.tabs.toArray()[index];
                this.tabs.forEach((tab, i) => {
                    if (i !== index) {
                        tab.nzDeselect.emit();
                    }
                });
                event.tab.nzSelect.emit();
            }
            return event;
        }
        subscribeToTabLabels() {
            if (this.tabLabelSubscription) {
                this.tabLabelSubscription.unsubscribe();
            }
            this.tabLabelSubscription = merge(...this.tabs.map(tab => tab.stateChanges)).subscribe(() => this.cdr.markForCheck());
        }
        subscribeToAllTabChanges() {
            this.allTabs.changes.pipe(startWith(this.allTabs)).subscribe((tabs) => {
                this.tabs.reset(tabs.filter(tab => tab.closestTabSet === this));
                this.tabs.notifyOnChanges();
            });
        }
        canDeactivateFun(pre, next) {
            if (typeof this.nzCanDeactivate === 'function') {
                const observable = wrapIntoObservable(this.nzCanDeactivate(pre, next));
                return observable.pipe(first(), takeUntil(this.destroy$));
            }
            else {
                return of(true);
            }
        }
        clickNavItem(tab, index, e) {
            if (!tab.nzDisabled) {
                // ignore nzCanDeactivate
                tab.nzClick.emit();
                if (!this.isRouterLinkClickEvent(index, e)) {
                    this.setSelectedIndex(index);
                }
            }
        }
        isRouterLinkClickEvent(index, event) {
            const target = event.target;
            if (this.nzLinkRouter) {
                return !!this.tabs.toArray()[index]?.linkDirective?.elementRef.nativeElement.contains(target);
            }
            else {
                return false;
            }
        }
        contextmenuNavItem(tab, e) {
            if (!tab.nzDisabled) {
                // ignore nzCanDeactivate
                tab.nzContextmenu.emit(e);
            }
        }
        setSelectedIndex(index) {
            this.canDeactivateSubscription.unsubscribe();
            this.canDeactivateSubscription = this.canDeactivateFun(this.selectedIndex, index).subscribe(can => {
                if (can) {
                    this.nzSelectedIndex = index;
                    this.tabNavBarRef.focusIndex = index;
                    this.cdr.markForCheck();
                }
            });
        }
        getTabIndex(tab, index) {
            if (tab.nzDisabled) {
                return null;
            }
            return this.selectedIndex === index ? 0 : -1;
        }
        getTabContentId(i) {
            return `nz-tabs-${this.tabSetId}-tab-${i}`;
        }
        setUpRouter() {
            if (this.nzLinkRouter) {
                if (!this.router) {
                    throw new Error(`${PREFIX} you should import 'RouterModule' if you want to use 'nzLinkRouter'!`);
                }
                merge(this.router.events.pipe(filter(e => e instanceof NavigationEnd)), this.tabLinks.changes)
                    .pipe(startWith(true), delay(0), takeUntil(this.destroy$))
                    .subscribe(() => {
                    this.updateRouterActive();
                    this.cdr.markForCheck();
                });
            }
        }
        updateRouterActive() {
            if (this.router?.navigated) {
                const index = this.findShouldActiveTabIndex();
                if (index !== this.selectedIndex) {
                    this.setSelectedIndex(index);
                }
                Promise.resolve().then(() => (this.nzHideAll = index === -1));
            }
        }
        findShouldActiveTabIndex() {
            const tabs = this.tabs.toArray();
            const isActive = this.isLinkActive(this.router);
            return tabs.findIndex(tab => {
                const c = tab.linkDirective;
                return c ? isActive(c.routerLink) : false;
            });
        }
        isLinkActive(router) {
            return (link) => link
                ? !!router?.isActive(link.urlTree || '', {
                    paths: this.nzLinkExact ? 'exact' : 'subset',
                    queryParams: this.nzLinkExact ? 'exact' : 'subset',
                    fragment: 'ignored',
                    matrixParams: 'ignored'
                })
                : false;
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabSetComponent, deps: [{ token: i1$2.NzConfigService }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i3$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTabSetComponent, isStandalone: true, selector: "nz-tabset", inputs: { nzSelectedIndex: "nzSelectedIndex", nzTabPosition: "nzTabPosition", nzTabBarExtraContent: "nzTabBarExtraContent", nzCanDeactivate: "nzCanDeactivate", nzAddIcon: "nzAddIcon", nzTabBarStyle: "nzTabBarStyle", nzType: "nzType", nzSize: "nzSize", nzAnimated: "nzAnimated", nzTabBarGutter: "nzTabBarGutter", nzHideAdd: ["nzHideAdd", "nzHideAdd", booleanAttribute], nzCentered: ["nzCentered", "nzCentered", booleanAttribute], nzHideAll: ["nzHideAll", "nzHideAll", booleanAttribute], nzLinkRouter: ["nzLinkRouter", "nzLinkRouter", booleanAttribute], nzLinkExact: ["nzLinkExact", "nzLinkExact", booleanAttribute], nzDestroyInactiveTabPane: ["nzDestroyInactiveTabPane", "nzDestroyInactiveTabPane", booleanAttribute] }, outputs: { nzSelectChange: "nzSelectChange", nzSelectedIndexChange: "nzSelectedIndexChange", nzTabListScroll: "nzTabListScroll", nzClose: "nzClose", nzAdd: "nzAdd" }, host: { properties: { "class.ant-tabs-card": "nzType === 'card' || nzType === 'editable-card'", "class.ant-tabs-editable": "nzType === 'editable-card'", "class.ant-tabs-editable-card": "nzType === 'editable-card'", "class.ant-tabs-centered": "nzCentered", "class.ant-tabs-rtl": "dir === 'rtl'", "class.ant-tabs-top": "nzTabPosition === 'top'", "class.ant-tabs-bottom": "nzTabPosition === 'bottom'", "class.ant-tabs-left": "nzTabPosition === 'left'", "class.ant-tabs-right": "nzTabPosition === 'right'", "class.ant-tabs-default": "nzSize === 'default'", "class.ant-tabs-small": "nzSize === 'small'", "class.ant-tabs-large": "nzSize === 'large'" }, classAttribute: "ant-tabs" }, providers: [
                {
                    provide: NZ_TAB_SET,
                    useExisting: forwardRef(() => NzTabSetComponent)
                }
            ], queries: [{ propertyName: "extraContents", predicate: NzTabBarExtraContentDirective, isSignal: true }, { propertyName: "allTabs", predicate: NzTabComponent, descendants: true }, { propertyName: "tabLinks", predicate: NzTabLinkDirective, descendants: true }], viewQueries: [{ propertyName: "tabNavBarRef", first: true, predicate: NzTabNavBarComponent, descendants: true }], exportAs: ["nzTabset"], ngImport: i0, template: `
    @if (tabs.length || addable) {
      <nz-tabs-nav
        [style]="nzTabBarStyle"
        [selectedIndex]="nzSelectedIndex || 0"
        [inkBarAnimated]="inkBarAnimated"
        [addable]="addable"
        [addIcon]="nzAddIcon"
        [hideBar]="nzHideAll"
        [position]="position"
        [extraTemplate]="nzTabBarExtraContent"
        [extraContents]="extraContents()"
        (tabScroll)="nzTabListScroll.emit($event)"
        (selectFocusedIndex)="setSelectedIndex($event)"
        (addClicked)="onAdd()"
      >
        @for (tab of tabs; track tab; let i = $index) {
          <div
            class="ant-tabs-tab"
            [style.margin-right.px]="position === 'horizontal' ? nzTabBarGutter : null"
            [style.margin-bottom.px]="position === 'vertical' ? nzTabBarGutter : null"
            [class.ant-tabs-tab-active]="nzSelectedIndex === i"
            [class.ant-tabs-tab-disabled]="tab.nzDisabled"
            (click)="clickNavItem(tab, i, $event)"
            (contextmenu)="contextmenuNavItem(tab, $event)"
          >
            <button
              type="button"
              role="tab"
              [id]="getTabContentId(i)"
              [attr.tabIndex]="getTabIndex(tab, i)"
              [attr.aria-disabled]="tab.nzDisabled"
              [attr.aria-selected]="nzSelectedIndex === i && !nzHideAll"
              [attr.aria-controls]="getTabContentId(i)"
              [disabled]="tab.nzDisabled"
              [tab]="tab"
              [active]="nzSelectedIndex === i"
              class="ant-tabs-tab-btn"
              nzTabNavItem
              cdkMonitorElementFocus
            >
              <ng-container *nzStringTemplateOutlet="tab.label; context: { visible: true }">
                {{ tab.label }}
              </ng-container>
              @if (tab.nzClosable && closable && !tab.nzDisabled) {
                <button
                  type="button"
                  nz-tab-close-button
                  [closeIcon]="tab.nzCloseIcon"
                  (click)="onClose(i, $event)"
                ></button>
              }
            </button>
          </div>
        }
      </nz-tabs-nav>
    }
    <div class="ant-tabs-content-holder">
      <div
        class="ant-tabs-content"
        [class.ant-tabs-content-top]="nzTabPosition === 'top'"
        [class.ant-tabs-content-bottom]="nzTabPosition === 'bottom'"
        [class.ant-tabs-content-left]="nzTabPosition === 'left'"
        [class.ant-tabs-content-right]="nzTabPosition === 'right'"
        [class.ant-tabs-content-animated]="tabPaneAnimated"
      >
        @if (!nzHideAll) {
          @for (tab of tabs; track tab; let i = $index) {
            @if (tab.nzForceRender) {
              <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
            } @else if (nzDestroyInactiveTabPane) {
              @if (nzSelectedIndex === i) {
                <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
              }
            } @else {
              @if (nzSelectedIndex === i || tab.hasBeenActive) {
                <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
              }
            }

            <ng-template #tabpaneTmpl>
              <div
                role="tabpanel"
                [id]="getTabContentId(i)"
                [attr.aria-labelledby]="getTabContentId(i)"
                nz-tab-body
                [active]="nzSelectedIndex === i"
                [content]="tab.content"
                [animated]="tabPaneAnimated"
              ></div>
            </ng-template>
          }
        }
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTabNavBarComponent, selector: "nz-tabs-nav", inputs: ["position", "addable", "hideBar", "addIcon", "inkBarAnimated", "extraTemplate", "extraContents", "selectedIndex"], outputs: ["indexFocused", "selectFocusedIndex", "addClicked", "tabScroll"], exportAs: ["nzTabsNav"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NzTabNavItemDirective, selector: "[nzTabNavItem]", inputs: ["disabled", "tab", "active"] }, { kind: "ngmodule", type: A11yModule }, { kind: "directive", type: i3$2.CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "component", type: NzTabCloseButtonComponent, selector: "nz-tab-close-button, button[nz-tab-close-button]", inputs: ["closeIcon"] }, { kind: "component", type: NzTabBodyComponent, selector: "[nz-tab-body]", inputs: ["content", "active", "animated"], exportAs: ["nzTabBody"] }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabSetComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tabset',
                    exportAs: 'nzTabset',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.Default,
                    providers: [
                        {
                            provide: NZ_TAB_SET,
                            useExisting: forwardRef(() => NzTabSetComponent)
                        }
                    ],
                    template: `
    @if (tabs.length || addable) {
      <nz-tabs-nav
        [style]="nzTabBarStyle"
        [selectedIndex]="nzSelectedIndex || 0"
        [inkBarAnimated]="inkBarAnimated"
        [addable]="addable"
        [addIcon]="nzAddIcon"
        [hideBar]="nzHideAll"
        [position]="position"
        [extraTemplate]="nzTabBarExtraContent"
        [extraContents]="extraContents()"
        (tabScroll)="nzTabListScroll.emit($event)"
        (selectFocusedIndex)="setSelectedIndex($event)"
        (addClicked)="onAdd()"
      >
        @for (tab of tabs; track tab; let i = $index) {
          <div
            class="ant-tabs-tab"
            [style.margin-right.px]="position === 'horizontal' ? nzTabBarGutter : null"
            [style.margin-bottom.px]="position === 'vertical' ? nzTabBarGutter : null"
            [class.ant-tabs-tab-active]="nzSelectedIndex === i"
            [class.ant-tabs-tab-disabled]="tab.nzDisabled"
            (click)="clickNavItem(tab, i, $event)"
            (contextmenu)="contextmenuNavItem(tab, $event)"
          >
            <button
              type="button"
              role="tab"
              [id]="getTabContentId(i)"
              [attr.tabIndex]="getTabIndex(tab, i)"
              [attr.aria-disabled]="tab.nzDisabled"
              [attr.aria-selected]="nzSelectedIndex === i && !nzHideAll"
              [attr.aria-controls]="getTabContentId(i)"
              [disabled]="tab.nzDisabled"
              [tab]="tab"
              [active]="nzSelectedIndex === i"
              class="ant-tabs-tab-btn"
              nzTabNavItem
              cdkMonitorElementFocus
            >
              <ng-container *nzStringTemplateOutlet="tab.label; context: { visible: true }">
                {{ tab.label }}
              </ng-container>
              @if (tab.nzClosable && closable && !tab.nzDisabled) {
                <button
                  type="button"
                  nz-tab-close-button
                  [closeIcon]="tab.nzCloseIcon"
                  (click)="onClose(i, $event)"
                ></button>
              }
            </button>
          </div>
        }
      </nz-tabs-nav>
    }
    <div class="ant-tabs-content-holder">
      <div
        class="ant-tabs-content"
        [class.ant-tabs-content-top]="nzTabPosition === 'top'"
        [class.ant-tabs-content-bottom]="nzTabPosition === 'bottom'"
        [class.ant-tabs-content-left]="nzTabPosition === 'left'"
        [class.ant-tabs-content-right]="nzTabPosition === 'right'"
        [class.ant-tabs-content-animated]="tabPaneAnimated"
      >
        @if (!nzHideAll) {
          @for (tab of tabs; track tab; let i = $index) {
            @if (tab.nzForceRender) {
              <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
            } @else if (nzDestroyInactiveTabPane) {
              @if (nzSelectedIndex === i) {
                <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
              }
            } @else {
              @if (nzSelectedIndex === i || tab.hasBeenActive) {
                <ng-template [ngTemplateOutlet]="tabpaneTmpl"></ng-template>
              }
            }

            <ng-template #tabpaneTmpl>
              <div
                role="tabpanel"
                [id]="getTabContentId(i)"
                [attr.aria-labelledby]="getTabContentId(i)"
                nz-tab-body
                [active]="nzSelectedIndex === i"
                [content]="tab.content"
                [animated]="tabPaneAnimated"
              ></div>
            </ng-template>
          }
        }
      </div>
    </div>
  `,
                    host: {
                        class: 'ant-tabs',
                        '[class.ant-tabs-card]': `nzType === 'card' || nzType === 'editable-card'`,
                        '[class.ant-tabs-editable]': `nzType === 'editable-card'`,
                        '[class.ant-tabs-editable-card]': `nzType === 'editable-card'`,
                        '[class.ant-tabs-centered]': `nzCentered`,
                        '[class.ant-tabs-rtl]': `dir === 'rtl'`,
                        '[class.ant-tabs-top]': `nzTabPosition === 'top'`,
                        '[class.ant-tabs-bottom]': `nzTabPosition === 'bottom'`,
                        '[class.ant-tabs-left]': `nzTabPosition === 'left'`,
                        '[class.ant-tabs-right]': `nzTabPosition === 'right'`,
                        '[class.ant-tabs-default]': `nzSize === 'default'`,
                        '[class.ant-tabs-small]': `nzSize === 'small'`,
                        '[class.ant-tabs-large]': `nzSize === 'large'`
                    },
                    imports: [
                        NzTabNavBarComponent,
                        NgTemplateOutlet,
                        NzTabNavItemDirective,
                        A11yModule,
                        NzOutletModule,
                        NzTabCloseButtonComponent,
                        NzTabBodyComponent
                    ]
                }]
        }], ctorParameters: () => [{ type: i1$2.NzConfigService }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i3$1.Directionality }], propDecorators: { nzSelectedIndex: [{
                type: Input
            }], nzTabPosition: [{
                type: Input
            }], nzTabBarExtraContent: [{
                type: Input
            }], nzCanDeactivate: [{
                type: Input
            }], nzAddIcon: [{
                type: Input
            }], nzTabBarStyle: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzAnimated: [{
                type: Input
            }], nzTabBarGutter: [{
                type: Input
            }], nzHideAdd: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCentered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzHideAll: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzLinkRouter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzLinkExact: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDestroyInactiveTabPane: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelectChange: [{
                type: Output
            }], nzSelectedIndexChange: [{
                type: Output
            }], nzTabListScroll: [{
                type: Output
            }], nzClose: [{
                type: Output
            }], nzAdd: [{
                type: Output
            }], allTabs: [{
                type: ContentChildren,
                args: [NzTabComponent, { descendants: true }]
            }], tabLinks: [{
                type: ContentChildren,
                args: [NzTabLinkDirective, { descendants: true }]
            }], tabNavBarRef: [{
                type: ViewChild,
                args: [NzTabNavBarComponent, { static: false }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const DIRECTIVES = [
    NzTabSetComponent,
    NzTabComponent,
    NzTabNavBarComponent,
    NzTabNavItemDirective,
    NzTabsInkBarDirective,
    NzTabScrollListDirective,
    NzTabNavOperationComponent,
    NzTabAddButtonComponent,
    NzTabCloseButtonComponent,
    NzTabDirective,
    NzTabBodyComponent,
    NzTabLinkDirective,
    NzTabLinkTemplateDirective,
    NzTabBarExtraContentDirective
];
class NzTabsModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzTabsModule, imports: [NzTabSetComponent,
            NzTabComponent,
            NzTabNavBarComponent,
            NzTabNavItemDirective,
            NzTabsInkBarDirective,
            NzTabScrollListDirective,
            NzTabNavOperationComponent,
            NzTabAddButtonComponent,
            NzTabCloseButtonComponent,
            NzTabDirective,
            NzTabBodyComponent,
            NzTabLinkDirective,
            NzTabLinkTemplateDirective,
            NzTabBarExtraContentDirective], exports: [NzTabSetComponent,
            NzTabComponent,
            NzTabNavBarComponent,
            NzTabNavItemDirective,
            NzTabsInkBarDirective,
            NzTabScrollListDirective,
            NzTabNavOperationComponent,
            NzTabAddButtonComponent,
            NzTabCloseButtonComponent,
            NzTabDirective,
            NzTabBodyComponent,
            NzTabLinkDirective,
            NzTabLinkTemplateDirective,
            NzTabBarExtraContentDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabsModule, imports: [NzTabSetComponent,
            NzTabNavBarComponent,
            NzTabNavOperationComponent,
            NzTabAddButtonComponent,
            NzTabCloseButtonComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTabsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [DIRECTIVES],
                    exports: [DIRECTIVES]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NZ_TAB_SET, NzTabBarExtraContentDirective, NzTabChangeEvent, NzTabComponent, NzTabDirective, NzTabLinkDirective, NzTabLinkTemplateDirective, NzTabSetComponent, NzTabsModule, NzTabAddButtonComponent as ɵNzTabAddButtonComponent, NzTabBodyComponent as ɵNzTabBodyComponent, NzTabCloseButtonComponent as ɵNzTabCloseButtonComponent, NzTabNavBarComponent as ɵNzTabNavBarComponent, NzTabNavItemDirective as ɵNzTabNavItemDirective, NzTabNavOperationComponent as ɵNzTabNavOperationComponent, NzTabScrollListDirective as ɵNzTabScrollListDirective, NzTabsInkBarDirective as ɵNzTabsInkBarDirective };
//# sourceMappingURL=ng-zorro-antd-tabs.mjs.map
