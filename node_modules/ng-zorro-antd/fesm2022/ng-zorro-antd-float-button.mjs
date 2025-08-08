import * as i0 from '@angular/core';
import { Input, ChangeDetectionStrategy, Component, EventEmitter, Output, inject, numberAttribute, ViewChild, ViewEncapsulation, ContentChildren, NgModule } from '@angular/core';
import { takeUntil, debounceTime } from 'rxjs/operators';
import * as i3 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i2 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NgTemplateOutlet, DOCUMENT } from '@angular/common';
import { NzStringTemplateOutletDirective } from 'ng-zorro-antd/core/outlet';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2$1 from '@angular/cdk/bidi';
import * as i4 from 'ng-zorro-antd/core/transition-patch';
import * as i5 from 'ng-zorro-antd/core/wave';
import { fadeMotion } from 'ng-zorro-antd/core/animation';
import { __esDecorate, __runInitializers } from 'tslib';
import * as i3$1 from '@angular/cdk/platform';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { Subject, Subscription } from 'rxjs';
import * as i1$1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFloatButtonContentComponent {
    nzIcon = null;
    nzDescription = null;
    nzShape = 'circle';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonContentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFloatButtonContentComponent, isStandalone: true, selector: "nz-float-button-content", inputs: { nzIcon: "nzIcon", nzDescription: "nzDescription", nzShape: "nzShape" }, exportAs: ["nzFloatButtonContent"], ngImport: i0, template: `
    <div class="ant-float-btn-body">
      <div class="ant-float-btn-content">
        @if (nzDescription || nzIcon) {
          @if (nzIcon) {
            <div class="ant-float-btn-icon">
              <ng-template [ngTemplateOutlet]="nzIcon"></ng-template>
            </div>
          }
          @if (nzDescription && nzShape === 'square') {
            <div class="ant-float-btn-description">
              <ng-container *nzStringTemplateOutlet="nzDescription">
                {{ nzDescription }}
              </ng-container>
            </div>
          }
        } @else {
          <div class="ant-float-btn-icon">
            <nz-icon nzType="file-text" nzTheme="outline" />
          </div>
        }
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonContentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-float-button-content',
                    exportAs: 'nzFloatButtonContent',
                    imports: [NzIconModule, NgTemplateOutlet, NzStringTemplateOutletDirective],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ant-float-btn-body">
      <div class="ant-float-btn-content">
        @if (nzDescription || nzIcon) {
          @if (nzIcon) {
            <div class="ant-float-btn-icon">
              <ng-template [ngTemplateOutlet]="nzIcon"></ng-template>
            </div>
          }
          @if (nzDescription && nzShape === 'square') {
            <div class="ant-float-btn-description">
              <ng-container *nzStringTemplateOutlet="nzDescription">
                {{ nzDescription }}
              </ng-container>
            </div>
          }
        } @else {
          <div class="ant-float-btn-icon">
            <nz-icon nzType="file-text" nzTheme="outline" />
          </div>
        }
      </div>
    </div>
  `
                }]
        }], propDecorators: { nzIcon: [{
                type: Input
            }], nzDescription: [{
                type: Input
            }], nzShape: [{
                type: Input
            }] } });

class NzFloatButtonComponent {
    destroy$;
    directionality;
    cdr;
    nzHref = null;
    nzTarget = null;
    nzType = 'default';
    nzShape = 'circle';
    nzIcon = null;
    nzDescription = null;
    nzOnClick = new EventEmitter();
    dir = 'ltr';
    constructor(destroy$, directionality, cdr) {
        this.destroy$ = destroy$;
        this.directionality = directionality;
        this.cdr = cdr;
        this.dir = this.directionality.value;
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonComponent, deps: [{ token: i2.NzDestroyService }, { token: i2$1.Directionality }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFloatButtonComponent, isStandalone: true, selector: "nz-float-button", inputs: { nzHref: "nzHref", nzTarget: "nzTarget", nzType: "nzType", nzShape: "nzShape", nzIcon: "nzIcon", nzDescription: "nzDescription" }, outputs: { nzOnClick: "nzOnClick" }, host: { properties: { "class.ant-float-btn-circle": "nzShape === 'circle'", "class.ant-float-btn-square": "nzShape === 'square'", "class.ant-float-btn-rtl": "dir === 'rtl'" }, classAttribute: "ant-float-btn" }, providers: [NzDestroyService], exportAs: ["nzFloatButton"], ngImport: i0, template: `
    @if (!!nzHref) {
      <a
        [target]="nzTarget"
        [href]="nzHref"
        nz-button
        [nzType]="nzType"
        [class.ant-float-btn-default]="nzType === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <nz-float-button-content
          [nzIcon]="nzIcon"
          [nzDescription]="nzDescription"
          [nzShape]="nzShape"
        ></nz-float-button-content>
      </a>
    } @else {
      <button
        nz-button
        [nzType]="nzType"
        [class.ant-float-btn-default]="nzType === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <nz-float-button-content
          [nzIcon]="nzIcon"
          [nzDescription]="nzDescription"
          [nzShape]="nzShape"
        ></nz-float-button-content>
      </button>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i3.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i4.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i5.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "component", type: NzFloatButtonContentComponent, selector: "nz-float-button-content", inputs: ["nzIcon", "nzDescription", "nzShape"], exportAs: ["nzFloatButtonContent"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-float-button',
                    exportAs: 'nzFloatButton',
                    imports: [NzButtonModule, NzFloatButtonContentComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (!!nzHref) {
      <a
        [target]="nzTarget"
        [href]="nzHref"
        nz-button
        [nzType]="nzType"
        [class.ant-float-btn-default]="nzType === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <nz-float-button-content
          [nzIcon]="nzIcon"
          [nzDescription]="nzDescription"
          [nzShape]="nzShape"
        ></nz-float-button-content>
      </a>
    } @else {
      <button
        nz-button
        [nzType]="nzType"
        [class.ant-float-btn-default]="nzType === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <nz-float-button-content
          [nzIcon]="nzIcon"
          [nzDescription]="nzDescription"
          [nzShape]="nzShape"
        ></nz-float-button-content>
      </button>
    }
  `,
                    host: {
                        class: 'ant-float-btn',
                        '[class.ant-float-btn-circle]': `nzShape === 'circle'`,
                        '[class.ant-float-btn-square]': `nzShape === 'square'`,
                        '[class.ant-float-btn-rtl]': `dir === 'rtl'`
                    },
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i2.NzDestroyService }, { type: i2$1.Directionality }, { type: i0.ChangeDetectorRef }], propDecorators: { nzHref: [{
                type: Input
            }], nzTarget: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzShape: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzDescription: [{
                type: Input
            }], nzOnClick: [{
                type: Output
            }] } });

const NZ_CONFIG_MODULE_NAME = 'backTop';
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
let NzFloatButtonTopComponent = (() => {
    let _nzVisibilityHeight_decorators;
    let _nzVisibilityHeight_initializers = [];
    let _nzVisibilityHeight_extraInitializers = [];
    return class NzFloatButtonTopComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzVisibilityHeight_decorators = [WithConfig()];
            __esDecorate(null, null, _nzVisibilityHeight_decorators, { kind: "field", name: "nzVisibilityHeight", static: false, private: false, access: { has: obj => "nzVisibilityHeight" in obj, get: obj => obj.nzVisibilityHeight, set: (obj, value) => { obj.nzVisibilityHeight = value; } }, metadata: _metadata }, _nzVisibilityHeight_initializers, _nzVisibilityHeight_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        scrollSrv;
        platform;
        ngZone;
        cdr;
        destroy$;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        scrollListenerDestroy$ = new Subject();
        target = null;
        visible = false;
        dir = 'ltr';
        nzHref = null;
        nzType = 'default';
        nzShape = 'circle';
        nzIcon = null;
        nzDescription = null;
        nzTemplate;
        nzVisibilityHeight = __runInitializers(this, _nzVisibilityHeight_initializers, 400);
        nzTarget = __runInitializers(this, _nzVisibilityHeight_extraInitializers);
        nzDuration = 450;
        nzOnClick = new EventEmitter();
        set backTop(backTop) {
            if (backTop) {
                this.backTopClickSubscription.unsubscribe();
                this.backTopClickSubscription = fromEventOutsideAngular(backTop.nativeElement, 'click')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                    this.scrollSrv.scrollTo(this.getTarget(), 0, { duration: this.nzDuration });
                    if (this.nzOnClick.observers.length) {
                        this.ngZone.run(() => this.nzOnClick.emit(true));
                    }
                });
            }
        }
        doc = inject(DOCUMENT);
        backTopClickSubscription = Subscription.EMPTY;
        constructor(nzConfigService, scrollSrv, platform, ngZone, cdr, destroy$, directionality) {
            this.nzConfigService = nzConfigService;
            this.scrollSrv = scrollSrv;
            this.platform = platform;
            this.ngZone = ngZone;
            this.cdr = cdr;
            this.destroy$ = destroy$;
            this.directionality = directionality;
            this.dir = this.directionality.value;
        }
        ngOnInit() {
            this.registerScrollEvent();
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
        }
        getTarget() {
            return this.target || window;
        }
        handleScroll() {
            if (this.visible === this.scrollSrv.getScroll(this.getTarget()) > this.nzVisibilityHeight) {
                return;
            }
            this.visible = !this.visible;
            this.cdr.detectChanges();
        }
        registerScrollEvent() {
            if (!this.platform.isBrowser) {
                return;
            }
            this.scrollListenerDestroy$.next();
            this.handleScroll();
            fromEventOutsideAngular(this.getTarget(), 'scroll', passiveEventListenerOptions)
                .pipe(debounceTime(50), takeUntil(this.scrollListenerDestroy$))
                .subscribe(() => this.handleScroll());
        }
        ngOnDestroy() {
            this.scrollListenerDestroy$.next();
            this.scrollListenerDestroy$.complete();
        }
        detectChanges() {
            this.cdr.detectChanges();
        }
        ngOnChanges(changes) {
            const { nzTarget } = changes;
            if (nzTarget) {
                this.target = typeof this.nzTarget === 'string' ? this.doc.querySelector(this.nzTarget) : this.nzTarget;
                this.registerScrollEvent();
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonTopComponent, deps: [{ token: i1$1.NzConfigService }, { token: i2.NzScrollService }, { token: i3$1.Platform }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i2.NzDestroyService }, { token: i2$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzFloatButtonTopComponent, isStandalone: true, selector: "nz-float-button-top", inputs: { nzHref: "nzHref", nzType: "nzType", nzShape: "nzShape", nzIcon: "nzIcon", nzDescription: "nzDescription", nzTemplate: "nzTemplate", nzVisibilityHeight: ["nzVisibilityHeight", "nzVisibilityHeight", numberAttribute], nzTarget: "nzTarget", nzDuration: ["nzDuration", "nzDuration", numberAttribute] }, outputs: { nzOnClick: "nzOnClick" }, host: { properties: { "class.ant-float-btn-circle": "nzShape === 'circle'", "class.ant-float-btn-hidden": "!visible", "class.ant-float-btn-square": "nzShape === 'square'", "class.ant-float-btn-rtl": "dir === 'rtl'" }, classAttribute: "ant-float-btn ant-float-btn-top" }, providers: [NzDestroyService], viewQueries: [{ propertyName: "backTop", first: true, predicate: ["backTop"], descendants: true }], exportAs: ["nzFloatButtonTop"], usesOnChanges: true, ngImport: i0, template: `
    <div #backTop @fadeMotion>
      <nz-float-button
        [nzIcon]="nzIcon || top"
        [nzDescription]="nzDescription"
        [nzHref]="nzHref"
        [nzType]="nzType"
        [nzShape]="nzShape"
      ></nz-float-button>
      <ng-template #top>
        <nz-icon nzType="vertical-align-top" nzTheme="outline" />
      </ng-template>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: NzFloatButtonComponent, selector: "nz-float-button", inputs: ["nzHref", "nzTarget", "nzType", "nzShape", "nzIcon", "nzDescription"], outputs: ["nzOnClick"], exportAs: ["nzFloatButton"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], animations: [fadeMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonTopComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-float-button-top',
                    exportAs: 'nzFloatButtonTop',
                    imports: [NzFloatButtonComponent, NzIconModule],
                    animations: [fadeMotion],
                    template: `
    <div #backTop @fadeMotion>
      <nz-float-button
        [nzIcon]="nzIcon || top"
        [nzDescription]="nzDescription"
        [nzHref]="nzHref"
        [nzType]="nzType"
        [nzShape]="nzShape"
      ></nz-float-button>
      <ng-template #top>
        <nz-icon nzType="vertical-align-top" nzTheme="outline" />
      </ng-template>
    </div>
  `,
                    host: {
                        class: 'ant-float-btn ant-float-btn-top',
                        '[class.ant-float-btn-circle]': `nzShape === 'circle'`,
                        '[class.ant-float-btn-hidden]': `!visible`,
                        '[class.ant-float-btn-square]': `nzShape === 'square'`,
                        '[class.ant-float-btn-rtl]': `dir === 'rtl'`
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i1$1.NzConfigService }, { type: i2.NzScrollService }, { type: i3$1.Platform }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i2.NzDestroyService }, { type: i2$1.Directionality }], propDecorators: { nzHref: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzShape: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzDescription: [{
                type: Input
            }], nzTemplate: [{
                type: Input
            }], nzVisibilityHeight: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzTarget: [{
                type: Input
            }], nzDuration: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzOnClick: [{
                type: Output
            }], backTop: [{
                type: ViewChild,
                args: ['backTop', { static: false }]
            }] } });

class NzFloatButtonGroupComponent {
    destroy$;
    directionality;
    cdr;
    nzFloatButtonComponent;
    nzFloatButtonTopComponents;
    nzHref = null;
    nzTarget = null;
    nzType = 'default';
    nzIcon = null;
    nzDescription = null;
    nzShape = 'circle';
    nzTrigger = null;
    nzOpen = null;
    nzOnOpenChange = new EventEmitter();
    isOpen = false;
    dir = 'ltr';
    constructor(destroy$, directionality, cdr) {
        this.destroy$ = destroy$;
        this.directionality = directionality;
        this.cdr = cdr;
        this.dir = this.directionality.value;
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngAfterContentInit() {
        if (this.nzFloatButtonComponent) {
            this.nzFloatButtonComponent.forEach(item => {
                item.nzShape = this.nzShape;
            });
        }
        if (this.nzFloatButtonTopComponents) {
            this.nzFloatButtonTopComponents.forEach(item => {
                item.nzShape = this.nzShape;
                item.detectChanges();
            });
        }
    }
    clickOpenMenu() {
        if (this.nzTrigger !== 'click' || this.nzOpen !== null) {
            return;
        }
        this.isOpen = true;
        this.nzOnOpenChange.emit(true);
        this.cdr.markForCheck();
    }
    hoverOpenMenu() {
        if (this.nzTrigger !== 'hover' || this.nzOpen !== null) {
            return;
        }
        this.isOpen = true;
        this.nzOnOpenChange.emit(true);
        this.cdr.markForCheck();
    }
    clickCloseMenu() {
        if (this.nzTrigger !== 'click') {
            return;
        }
        this.isOpen = false;
        this.nzOnOpenChange.emit(false);
        this.cdr.markForCheck();
    }
    hoverCloseMenu() {
        if (this.nzTrigger !== 'hover' || typeof this.nzOpen === 'boolean') {
            return;
        }
        this.isOpen = false;
        this.nzOnOpenChange.emit(false);
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonGroupComponent, deps: [{ token: i2.NzDestroyService }, { token: i2$1.Directionality }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFloatButtonGroupComponent, isStandalone: true, selector: "nz-float-button-group", inputs: { nzHref: "nzHref", nzTarget: "nzTarget", nzType: "nzType", nzIcon: "nzIcon", nzDescription: "nzDescription", nzShape: "nzShape", nzTrigger: "nzTrigger", nzOpen: "nzOpen" }, outputs: { nzOnOpenChange: "nzOnOpenChange" }, host: { listeners: { "mouseleave": "hoverCloseMenu()" }, properties: { "class.ant-float-btn-group-circle": "nzShape === 'circle'", "class.ant-float-btn-group-circle-shadow": "nzShape === 'circle'", "class.ant-float-btn-group-square": "nzShape === 'square'", "class.ant-float-btn-group-square-shadow": "nzShape === 'square' && !nzTrigger", "class.ant-float-btn-group-rtl": "dir === 'rtl'" }, classAttribute: "ant-float-btn-group" }, providers: [NzDestroyService], queries: [{ propertyName: "nzFloatButtonComponent", predicate: NzFloatButtonComponent }, { propertyName: "nzFloatButtonTopComponents", predicate: NzFloatButtonTopComponent }], exportAs: ["nzFloatButtonGroup"], ngImport: i0, template: `
    @if (!nzTrigger || isOpen || nzOpen === true) {
      <div [class.ant-float-btn-group-wrap]="!!nzTrigger" @fadeMotion><ng-content></ng-content></div>
    }
    @if (!!nzTrigger) {
      @if (!isOpen && !nzOpen) {
        <nz-float-button
          [nzType]="nzType"
          [nzIcon]="nzIcon"
          [nzShape]="nzShape"
          [nzDescription]="nzDescription"
          (nzOnClick)="clickOpenMenu()"
          (mouseover)="hoverOpenMenu()"
        ></nz-float-button>
      } @else {
        <nz-float-button
          [nzType]="nzType"
          [nzIcon]="close"
          [nzShape]="nzShape"
          (nzOnClick)="clickCloseMenu()"
        ></nz-float-button>
      }
    }
    <ng-template #close>
      <nz-icon nzType="close" nzTheme="outline" />
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzFloatButtonComponent, selector: "nz-float-button", inputs: ["nzHref", "nzTarget", "nzType", "nzShape", "nzIcon", "nzDescription"], outputs: ["nzOnClick"], exportAs: ["nzFloatButton"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], animations: [fadeMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-float-button-group',
                    exportAs: 'nzFloatButtonGroup',
                    imports: [NzFloatButtonComponent, NzIconModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    animations: [fadeMotion],
                    template: `
    @if (!nzTrigger || isOpen || nzOpen === true) {
      <div [class.ant-float-btn-group-wrap]="!!nzTrigger" @fadeMotion><ng-content></ng-content></div>
    }
    @if (!!nzTrigger) {
      @if (!isOpen && !nzOpen) {
        <nz-float-button
          [nzType]="nzType"
          [nzIcon]="nzIcon"
          [nzShape]="nzShape"
          [nzDescription]="nzDescription"
          (nzOnClick)="clickOpenMenu()"
          (mouseover)="hoverOpenMenu()"
        ></nz-float-button>
      } @else {
        <nz-float-button
          [nzType]="nzType"
          [nzIcon]="close"
          [nzShape]="nzShape"
          (nzOnClick)="clickCloseMenu()"
        ></nz-float-button>
      }
    }
    <ng-template #close>
      <nz-icon nzType="close" nzTheme="outline" />
    </ng-template>
  `,
                    host: {
                        class: 'ant-float-btn-group',
                        '(mouseleave)': 'hoverCloseMenu()',
                        '[class.ant-float-btn-group-circle]': `nzShape === 'circle'`,
                        '[class.ant-float-btn-group-circle-shadow]': `nzShape === 'circle'`,
                        '[class.ant-float-btn-group-square]': `nzShape === 'square'`,
                        '[class.ant-float-btn-group-square-shadow]': `nzShape === 'square' && !nzTrigger`,
                        '[class.ant-float-btn-group-rtl]': `dir === 'rtl'`
                    },
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i2.NzDestroyService }, { type: i2$1.Directionality }, { type: i0.ChangeDetectorRef }], propDecorators: { nzFloatButtonComponent: [{
                type: ContentChildren,
                args: [NzFloatButtonComponent]
            }], nzFloatButtonTopComponents: [{
                type: ContentChildren,
                args: [NzFloatButtonTopComponent]
            }], nzHref: [{
                type: Input
            }], nzTarget: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzDescription: [{
                type: Input
            }], nzShape: [{
                type: Input
            }], nzTrigger: [{
                type: Input
            }], nzOpen: [{
                type: Input
            }], nzOnOpenChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFloatButtonModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonModule, imports: [NzFloatButtonComponent,
            NzFloatButtonGroupComponent,
            NzFloatButtonTopComponent,
            NzFloatButtonContentComponent], exports: [NzFloatButtonComponent,
            NzFloatButtonGroupComponent,
            NzFloatButtonTopComponent,
            NzFloatButtonContentComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonModule, imports: [NzFloatButtonComponent,
            NzFloatButtonGroupComponent,
            NzFloatButtonTopComponent,
            NzFloatButtonContentComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFloatButtonModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [
                        NzFloatButtonComponent,
                        NzFloatButtonGroupComponent,
                        NzFloatButtonTopComponent,
                        NzFloatButtonContentComponent
                    ],
                    imports: [
                        NzFloatButtonComponent,
                        NzFloatButtonGroupComponent,
                        NzFloatButtonTopComponent,
                        NzFloatButtonContentComponent
                    ]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzFloatButtonComponent, NzFloatButtonContentComponent, NzFloatButtonGroupComponent, NzFloatButtonModule, NzFloatButtonTopComponent };
//# sourceMappingURL=ng-zorro-antd-float-button.mjs.map
