import * as i0 from '@angular/core';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, Input, EventEmitter, booleanAttribute, Output, ContentChild, ContentChildren, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as i2 from 'ng-zorro-antd/core/services';
import { siderResponsiveMap } from 'ng-zorro-antd/core/services';
import { toCssPixel, inNextTick } from 'ng-zorro-antd/core/util';
import { NzMenuDirective } from 'ng-zorro-antd/menu';
import { NgTemplateOutlet } from '@angular/common';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i1$1 from '@angular/cdk/platform';
import * as i1$2 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzContentComponent {
    elementRef;
    renderer;
    constructor(elementRef, renderer) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.renderer.addClass(this.elementRef.nativeElement, 'ant-layout-content');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContentComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzContentComponent, isStandalone: true, selector: "nz-content", exportAs: ["nzContent"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-content',
                    exportAs: 'nzContent',
                    template: `<ng-content></ng-content>`,
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFooterComponent {
    elementRef;
    renderer;
    constructor(elementRef, renderer) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.renderer.addClass(this.elementRef.nativeElement, 'ant-layout-footer');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFooterComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzFooterComponent, isStandalone: true, selector: "nz-footer", exportAs: ["nzFooter"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFooterComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-footer',
                    exportAs: 'nzFooter',
                    template: `<ng-content></ng-content>`,
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzHeaderComponent {
    elementRef;
    renderer;
    constructor(elementRef, renderer) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.renderer.addClass(this.elementRef.nativeElement, 'ant-layout-header');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzHeaderComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzHeaderComponent, isStandalone: true, selector: "nz-header", exportAs: ["nzHeader"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzHeaderComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-header',
                    exportAs: 'nzHeader',
                    template: `<ng-content></ng-content>`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSiderTriggerComponent {
    nzCollapsed = false;
    nzReverseArrow = false;
    nzZeroTrigger = null;
    nzTrigger = undefined;
    matchBreakPoint = false;
    nzCollapsedWidth = null;
    siderWidth = null;
    nzBreakpoint = null;
    isZeroTrigger = false;
    isNormalTrigger = false;
    updateTriggerType() {
        this.isZeroTrigger =
            this.nzCollapsedWidth === 0 && ((this.nzBreakpoint && this.matchBreakPoint) || !this.nzBreakpoint);
        this.isNormalTrigger = this.nzCollapsedWidth !== 0;
    }
    ngOnInit() {
        this.updateTriggerType();
    }
    ngOnChanges() {
        this.updateTriggerType();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSiderTriggerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSiderTriggerComponent, isStandalone: true, selector: "[nz-sider-trigger]", inputs: { nzCollapsed: "nzCollapsed", nzReverseArrow: "nzReverseArrow", nzZeroTrigger: "nzZeroTrigger", nzTrigger: "nzTrigger", matchBreakPoint: "matchBreakPoint", nzCollapsedWidth: "nzCollapsedWidth", siderWidth: "siderWidth", nzBreakpoint: "nzBreakpoint" }, host: { properties: { "class.ant-layout-sider-trigger": "isNormalTrigger", "style.width": "isNormalTrigger ? siderWidth : null", "class.ant-layout-sider-zero-width-trigger": "isZeroTrigger", "class.ant-layout-sider-zero-width-trigger-right": "isZeroTrigger && nzReverseArrow", "class.ant-layout-sider-zero-width-trigger-left": "isZeroTrigger && !nzReverseArrow" } }, exportAs: ["nzSiderTrigger"], usesOnChanges: true, ngImport: i0, template: `
    @if (isZeroTrigger) {
      <ng-template [ngTemplateOutlet]="nzZeroTrigger || defaultZeroTrigger" />
    }

    @if (isNormalTrigger) {
      <ng-template [ngTemplateOutlet]="nzTrigger || defaultTrigger" />
    }
    <ng-template #defaultTrigger>
      @if (nzReverseArrow) {
        <nz-icon [nzType]="nzCollapsed ? 'left' : 'right'" />
      } @else {
        <nz-icon [nzType]="nzCollapsed ? 'right' : 'left'" />
      }
    </ng-template>
    <ng-template #defaultZeroTrigger>
      <nz-icon nzType="bars" />
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSiderTriggerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-sider-trigger]',
                    exportAs: 'nzSiderTrigger',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (isZeroTrigger) {
      <ng-template [ngTemplateOutlet]="nzZeroTrigger || defaultZeroTrigger" />
    }

    @if (isNormalTrigger) {
      <ng-template [ngTemplateOutlet]="nzTrigger || defaultTrigger" />
    }
    <ng-template #defaultTrigger>
      @if (nzReverseArrow) {
        <nz-icon [nzType]="nzCollapsed ? 'left' : 'right'" />
      } @else {
        <nz-icon [nzType]="nzCollapsed ? 'right' : 'left'" />
      }
    </ng-template>
    <ng-template #defaultZeroTrigger>
      <nz-icon nzType="bars" />
    </ng-template>
  `,
                    host: {
                        '[class.ant-layout-sider-trigger]': 'isNormalTrigger',
                        '[style.width]': 'isNormalTrigger ? siderWidth : null',
                        '[class.ant-layout-sider-zero-width-trigger]': 'isZeroTrigger',
                        '[class.ant-layout-sider-zero-width-trigger-right]': 'isZeroTrigger && nzReverseArrow',
                        '[class.ant-layout-sider-zero-width-trigger-left]': 'isZeroTrigger && !nzReverseArrow'
                    },
                    imports: [NgTemplateOutlet, NzIconModule]
                }]
        }], propDecorators: { nzCollapsed: [{
                type: Input
            }], nzReverseArrow: [{
                type: Input
            }], nzZeroTrigger: [{
                type: Input
            }], nzTrigger: [{
                type: Input
            }], matchBreakPoint: [{
                type: Input
            }], nzCollapsedWidth: [{
                type: Input
            }], siderWidth: [{
                type: Input
            }], nzBreakpoint: [{
                type: Input
            }] } });

class NzSiderComponent {
    platform;
    cdr;
    breakpointService;
    destroy$ = new Subject();
    nzMenuDirective = null;
    nzCollapsedChange = new EventEmitter();
    nzWidth = 200;
    nzTheme = 'dark';
    nzCollapsedWidth = 80;
    nzBreakpoint = null;
    nzZeroTrigger = null;
    nzTrigger = undefined;
    nzReverseArrow = false;
    nzCollapsible = false;
    nzCollapsed = false;
    matchBreakPoint = false;
    flexSetting = null;
    widthSetting = null;
    updateStyleMap() {
        this.widthSetting = this.nzCollapsed ? `${this.nzCollapsedWidth}px` : toCssPixel(this.nzWidth);
        this.flexSetting = `0 0 ${this.widthSetting}`;
        this.cdr.markForCheck();
    }
    updateMenuInlineCollapsed() {
        if (this.nzMenuDirective && this.nzMenuDirective.nzMode === 'inline' && this.nzCollapsedWidth !== 0) {
            this.nzMenuDirective.setInlineCollapsed(this.nzCollapsed);
        }
    }
    setCollapsed(collapsed) {
        if (collapsed !== this.nzCollapsed) {
            this.nzCollapsed = collapsed;
            this.nzCollapsedChange.emit(collapsed);
            this.updateMenuInlineCollapsed();
            this.updateStyleMap();
            this.cdr.markForCheck();
        }
    }
    constructor(platform, cdr, breakpointService) {
        this.platform = platform;
        this.cdr = cdr;
        this.breakpointService = breakpointService;
    }
    ngOnInit() {
        this.updateStyleMap();
        if (this.platform.isBrowser) {
            this.breakpointService
                .subscribe(siderResponsiveMap, true)
                .pipe(takeUntil(this.destroy$))
                .subscribe(map => {
                const breakpoint = this.nzBreakpoint;
                if (breakpoint) {
                    inNextTick().subscribe(() => {
                        this.matchBreakPoint = !map[breakpoint];
                        this.setCollapsed(this.matchBreakPoint);
                        this.cdr.markForCheck();
                    });
                }
            });
        }
    }
    ngOnChanges(changes) {
        const { nzCollapsed, nzCollapsedWidth, nzWidth } = changes;
        if (nzCollapsed || nzCollapsedWidth || nzWidth) {
            this.updateStyleMap();
        }
        if (nzCollapsed) {
            this.updateMenuInlineCollapsed();
        }
    }
    ngAfterContentInit() {
        this.updateMenuInlineCollapsed();
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSiderComponent, deps: [{ token: i1$1.Platform }, { token: i0.ChangeDetectorRef }, { token: i2.NzBreakpointService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSiderComponent, isStandalone: true, selector: "nz-sider", inputs: { nzWidth: "nzWidth", nzTheme: "nzTheme", nzCollapsedWidth: "nzCollapsedWidth", nzBreakpoint: "nzBreakpoint", nzZeroTrigger: "nzZeroTrigger", nzTrigger: "nzTrigger", nzReverseArrow: ["nzReverseArrow", "nzReverseArrow", booleanAttribute], nzCollapsible: ["nzCollapsible", "nzCollapsible", booleanAttribute], nzCollapsed: ["nzCollapsed", "nzCollapsed", booleanAttribute] }, outputs: { nzCollapsedChange: "nzCollapsedChange" }, host: { properties: { "class.ant-layout-sider-zero-width": "nzCollapsed && nzCollapsedWidth === 0", "class.ant-layout-sider-light": "nzTheme === 'light'", "class.ant-layout-sider-dark": "nzTheme === 'dark'", "class.ant-layout-sider-collapsed": "nzCollapsed", "class.ant-layout-sider-has-trigger": "nzCollapsible && nzTrigger !== null", "style.flex": "flexSetting", "style.maxWidth": "widthSetting", "style.minWidth": "widthSetting", "style.width": "widthSetting" }, classAttribute: "ant-layout-sider" }, queries: [{ propertyName: "nzMenuDirective", first: true, predicate: NzMenuDirective, descendants: true }], exportAs: ["nzSider"], usesOnChanges: true, ngImport: i0, template: `
    <div class="ant-layout-sider-children">
      <ng-content></ng-content>
    </div>
    @if (nzCollapsible && nzTrigger !== null) {
      <div
        nz-sider-trigger
        [matchBreakPoint]="matchBreakPoint"
        [nzCollapsedWidth]="nzCollapsedWidth"
        [nzCollapsed]="nzCollapsed"
        [nzBreakpoint]="nzBreakpoint"
        [nzReverseArrow]="nzReverseArrow"
        [nzTrigger]="nzTrigger"
        [nzZeroTrigger]="nzZeroTrigger"
        [siderWidth]="widthSetting"
        (click)="setCollapsed(!nzCollapsed)"
      ></div>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: NzSiderTriggerComponent, selector: "[nz-sider-trigger]", inputs: ["nzCollapsed", "nzReverseArrow", "nzZeroTrigger", "nzTrigger", "matchBreakPoint", "nzCollapsedWidth", "siderWidth", "nzBreakpoint"], exportAs: ["nzSiderTrigger"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSiderComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-sider',
                    exportAs: 'nzSider',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ant-layout-sider-children">
      <ng-content></ng-content>
    </div>
    @if (nzCollapsible && nzTrigger !== null) {
      <div
        nz-sider-trigger
        [matchBreakPoint]="matchBreakPoint"
        [nzCollapsedWidth]="nzCollapsedWidth"
        [nzCollapsed]="nzCollapsed"
        [nzBreakpoint]="nzBreakpoint"
        [nzReverseArrow]="nzReverseArrow"
        [nzTrigger]="nzTrigger"
        [nzZeroTrigger]="nzZeroTrigger"
        [siderWidth]="widthSetting"
        (click)="setCollapsed(!nzCollapsed)"
      ></div>
    }
  `,
                    host: {
                        class: 'ant-layout-sider',
                        '[class.ant-layout-sider-zero-width]': `nzCollapsed && nzCollapsedWidth === 0`,
                        '[class.ant-layout-sider-light]': `nzTheme === 'light'`,
                        '[class.ant-layout-sider-dark]': `nzTheme === 'dark'`,
                        '[class.ant-layout-sider-collapsed]': `nzCollapsed`,
                        '[class.ant-layout-sider-has-trigger]': `nzCollapsible && nzTrigger !== null`,
                        '[style.flex]': 'flexSetting',
                        '[style.maxWidth]': 'widthSetting',
                        '[style.minWidth]': 'widthSetting',
                        '[style.width]': 'widthSetting'
                    },
                    imports: [NzSiderTriggerComponent]
                }]
        }], ctorParameters: () => [{ type: i1$1.Platform }, { type: i0.ChangeDetectorRef }, { type: i2.NzBreakpointService }], propDecorators: { nzMenuDirective: [{
                type: ContentChild,
                args: [NzMenuDirective]
            }], nzCollapsedChange: [{
                type: Output
            }], nzWidth: [{
                type: Input
            }], nzTheme: [{
                type: Input
            }], nzCollapsedWidth: [{
                type: Input
            }], nzBreakpoint: [{
                type: Input
            }], nzZeroTrigger: [{
                type: Input
            }], nzTrigger: [{
                type: Input
            }], nzReverseArrow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCollapsible: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCollapsed: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

class NzLayoutComponent {
    directionality;
    listOfNzSiderComponent;
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(directionality) {
        this.directionality = directionality;
    }
    ngOnInit() {
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutComponent, deps: [{ token: i1$2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzLayoutComponent, isStandalone: true, selector: "nz-layout", host: { properties: { "class.ant-layout-rtl": "dir === 'rtl'", "class.ant-layout-has-sider": "listOfNzSiderComponent.length > 0" }, classAttribute: "ant-layout" }, queries: [{ propertyName: "listOfNzSiderComponent", predicate: NzSiderComponent }], exportAs: ["nzLayout"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-layout',
                    exportAs: 'nzLayout',
                    template: `<ng-content></ng-content>`,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        class: 'ant-layout',
                        '[class.ant-layout-rtl]': `dir === 'rtl'`,
                        '[class.ant-layout-has-sider]': 'listOfNzSiderComponent.length > 0'
                    }
                }]
        }], ctorParameters: () => [{ type: i1$2.Directionality }], propDecorators: { listOfNzSiderComponent: [{
                type: ContentChildren,
                args: [NzSiderComponent]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzLayoutModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutModule, imports: [NzLayoutComponent,
            NzHeaderComponent,
            NzContentComponent,
            NzFooterComponent,
            NzSiderComponent,
            NzSiderTriggerComponent], exports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutModule, imports: [NzSiderComponent,
            NzSiderTriggerComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzLayoutModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzLayoutComponent,
                        NzHeaderComponent,
                        NzContentComponent,
                        NzFooterComponent,
                        NzSiderComponent,
                        NzSiderTriggerComponent
                    ],
                    exports: [NzLayoutComponent, NzHeaderComponent, NzContentComponent, NzFooterComponent, NzSiderComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzContentComponent, NzFooterComponent, NzHeaderComponent, NzLayoutComponent, NzLayoutModule, NzSiderComponent, NzSiderTriggerComponent as ɵNzSiderTriggerComponent };
//# sourceMappingURL=ng-zorro-antd-layout.mjs.map
