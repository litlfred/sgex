import * as i0 from '@angular/core';
import { Directive, InjectionToken, EventEmitter, inject, Type, Injector, TemplateRef, booleanAttribute, ContentChild, ViewChild, Output, Input, ChangeDetectionStrategy, Component, Injectable, NgModule } from '@angular/core';
import { __esDecorate, __runInitializers } from 'tslib';
import { ESCAPE } from '@angular/cdk/keycodes';
import * as i2 from '@angular/cdk/overlay';
import { OverlayConfig, CdkScrollable } from '@angular/cdk/overlay';
import * as i7 from '@angular/cdk/portal';
import { ComponentPortal, TemplatePortal, PortalModule, CdkPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { drawerMaskMotion } from 'ng-zorro-antd/core/animation';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i5 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { overlayZIndexSetter } from 'ng-zorro-antd/core/overlay';
import { isTemplateRef, toCssPixel } from 'ng-zorro-antd/core/util';
import * as i6 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i3 from '@angular/cdk/a11y';
import * as i4 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDrawerContentDirective {
    templateRef;
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerContentDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzDrawerContentDirective, isStandalone: true, selector: "[nzDrawerContent]", exportAs: ["nzDrawerContent"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerContentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzDrawerContent]',
                    exportAs: 'nzDrawerContent'
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const DRAWER_DEFAULT_SIZE = 378;
const DRAWER_LARGE_SIZE = 736;
const NZ_DRAWER_DATA = new InjectionToken('NZ_DRAWER_DATA');

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDrawerRef {
}

const DRAWER_ANIMATE_DURATION = 300;
const NZ_CONFIG_MODULE_NAME = 'drawer';
let NzDrawerComponent = (() => {
    let _classSuper = NzDrawerRef;
    let _nzMaskClosable_decorators;
    let _nzMaskClosable_initializers = [];
    let _nzMaskClosable_extraInitializers = [];
    let _nzMask_decorators;
    let _nzMask_initializers = [];
    let _nzMask_extraInitializers = [];
    let _nzCloseOnNavigation_decorators;
    let _nzCloseOnNavigation_initializers = [];
    let _nzCloseOnNavigation_extraInitializers = [];
    let _nzDirection_decorators;
    let _nzDirection_initializers = [];
    let _nzDirection_extraInitializers = [];
    return class NzDrawerComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _nzMaskClosable_decorators = [WithConfig()];
            _nzMask_decorators = [WithConfig()];
            _nzCloseOnNavigation_decorators = [WithConfig()];
            _nzDirection_decorators = [WithConfig()];
            __esDecorate(null, null, _nzMaskClosable_decorators, { kind: "field", name: "nzMaskClosable", static: false, private: false, access: { has: obj => "nzMaskClosable" in obj, get: obj => obj.nzMaskClosable, set: (obj, value) => { obj.nzMaskClosable = value; } }, metadata: _metadata }, _nzMaskClosable_initializers, _nzMaskClosable_extraInitializers);
            __esDecorate(null, null, _nzMask_decorators, { kind: "field", name: "nzMask", static: false, private: false, access: { has: obj => "nzMask" in obj, get: obj => obj.nzMask, set: (obj, value) => { obj.nzMask = value; } }, metadata: _metadata }, _nzMask_initializers, _nzMask_extraInitializers);
            __esDecorate(null, null, _nzCloseOnNavigation_decorators, { kind: "field", name: "nzCloseOnNavigation", static: false, private: false, access: { has: obj => "nzCloseOnNavigation" in obj, get: obj => obj.nzCloseOnNavigation, set: (obj, value) => { obj.nzCloseOnNavigation = value; } }, metadata: _metadata }, _nzCloseOnNavigation_initializers, _nzCloseOnNavigation_extraInitializers);
            __esDecorate(null, null, _nzDirection_decorators, { kind: "field", name: "nzDirection", static: false, private: false, access: { has: obj => "nzDirection" in obj, get: obj => obj.nzDirection, set: (obj, value) => { obj.nzDirection = value; } }, metadata: _metadata }, _nzDirection_initializers, _nzDirection_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        cdr;
        nzConfigService;
        renderer;
        overlay;
        injector;
        changeDetectorRef;
        focusTrapFactory;
        viewContainerRef;
        overlayKeyboardDispatcher;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzContent;
        nzCloseIcon = 'close';
        nzClosable = true;
        nzMaskClosable = __runInitializers(this, _nzMaskClosable_initializers, true);
        nzMask = (__runInitializers(this, _nzMaskClosable_extraInitializers), __runInitializers(this, _nzMask_initializers, true));
        nzCloseOnNavigation = (__runInitializers(this, _nzMask_extraInitializers), __runInitializers(this, _nzCloseOnNavigation_initializers, true));
        nzNoAnimation = (__runInitializers(this, _nzCloseOnNavigation_extraInitializers), false);
        nzKeyboard = true;
        nzTitle;
        nzExtra;
        nzFooter;
        nzPlacement = 'right';
        nzSize = 'default';
        nzMaskStyle = {};
        nzBodyStyle = {};
        nzWrapClassName;
        nzWidth;
        nzHeight;
        nzZIndex = 1000;
        nzOffsetX = 0;
        nzOffsetY = 0;
        componentInstance = null;
        componentRef = null;
        set nzVisible(value) {
            this.isOpen = value;
        }
        get nzVisible() {
            return this.isOpen;
        }
        nzOnViewInit = new EventEmitter();
        nzOnClose = new EventEmitter();
        nzVisibleChange = new EventEmitter();
        drawerTemplate;
        bodyPortalOutlet;
        contentFromContentChild;
        destroy$ = new Subject();
        previouslyFocusedElement;
        placementChanging = false;
        placementChangeTimeoutId;
        nzContentParams; // only service
        nzData;
        overlayRef;
        portal;
        focusTrap;
        isOpen = false;
        inAnimation = false;
        templateContext = {
            $implicit: undefined,
            drawerRef: this
        };
        isTemplateRef = isTemplateRef;
        get offsetTransform() {
            if (!this.isOpen || this.nzOffsetX + this.nzOffsetY === 0) {
                return null;
            }
            switch (this.nzPlacement) {
                case 'left':
                    return `translateX(${this.nzOffsetX}px)`;
                case 'right':
                    return `translateX(-${this.nzOffsetX}px)`;
                case 'top':
                    return `translateY(${this.nzOffsetY}px)`;
                case 'bottom':
                    return `translateY(-${this.nzOffsetY}px)`;
            }
        }
        get transform() {
            if (this.isOpen) {
                return null;
            }
            switch (this.nzPlacement) {
                case 'left':
                    return `translateX(-100%)`;
                case 'right':
                    return `translateX(100%)`;
                case 'top':
                    return `translateY(-100%)`;
                case 'bottom':
                    return `translateY(100%)`;
            }
        }
        get width() {
            if (this.isLeftOrRight) {
                const defaultWidth = this.nzSize === 'large' ? DRAWER_LARGE_SIZE : DRAWER_DEFAULT_SIZE;
                return this.nzWidth === undefined ? toCssPixel(defaultWidth) : toCssPixel(this.nzWidth);
            }
            return null;
        }
        get height() {
            if (!this.isLeftOrRight) {
                const defaultHeight = this.nzSize === 'large' ? DRAWER_LARGE_SIZE : DRAWER_DEFAULT_SIZE;
                return this.nzHeight === undefined ? toCssPixel(defaultHeight) : toCssPixel(this.nzHeight);
            }
            return null;
        }
        get isLeftOrRight() {
            return this.nzPlacement === 'left' || this.nzPlacement === 'right';
        }
        nzAfterOpen = new Subject();
        nzAfterClose = new Subject();
        get afterOpen() {
            return this.nzAfterOpen.asObservable();
        }
        get afterClose() {
            return this.nzAfterClose.asObservable();
        }
        get isNzContentTemplateRef() {
            return isTemplateRef(this.nzContent);
        }
        // from service config
        nzDirection = __runInitializers(this, _nzDirection_initializers, undefined);
        dir = (__runInitializers(this, _nzDirection_extraInitializers), 'ltr');
        document = inject(DOCUMENT);
        constructor(cdr, nzConfigService, renderer, overlay, injector, changeDetectorRef, focusTrapFactory, viewContainerRef, overlayKeyboardDispatcher, directionality) {
            super();
            this.cdr = cdr;
            this.nzConfigService = nzConfigService;
            this.renderer = renderer;
            this.overlay = overlay;
            this.injector = injector;
            this.changeDetectorRef = changeDetectorRef;
            this.focusTrapFactory = focusTrapFactory;
            this.viewContainerRef = viewContainerRef;
            this.overlayKeyboardDispatcher = overlayKeyboardDispatcher;
            this.directionality = directionality;
        }
        ngOnInit() {
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.nzDirection || this.directionality.value;
            this.attachOverlay();
            this.updateOverlayStyle();
            this.updateBodyOverflow();
            this.templateContext = { $implicit: this.nzData || this.nzContentParams, drawerRef: this };
            this.changeDetectorRef.detectChanges();
        }
        ngAfterViewInit() {
            this.attachBodyContent();
            // The `setTimeout` triggers change detection. There's no sense to schedule the DOM timer if anyone is
            // listening to the `nzOnViewInit` event inside the template, for instance `<nz-drawer (nzOnViewInit)="...">`.
            if (this.nzOnViewInit.observers.length) {
                setTimeout(() => {
                    this.nzOnViewInit.emit();
                });
            }
        }
        ngOnChanges(changes) {
            const { nzPlacement, nzVisible } = changes;
            if (nzVisible) {
                const value = changes.nzVisible.currentValue;
                if (value) {
                    this.open();
                }
                else {
                    this.close();
                }
            }
            if (nzPlacement && !nzPlacement.isFirstChange()) {
                this.triggerPlacementChangeCycleOnce();
            }
        }
        ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
            clearTimeout(this.placementChangeTimeoutId);
            this.disposeOverlay();
        }
        getAnimationDuration() {
            return this.nzNoAnimation ? 0 : DRAWER_ANIMATE_DURATION;
        }
        // Disable the transition animation temporarily when the placement changing
        triggerPlacementChangeCycleOnce() {
            if (!this.nzNoAnimation) {
                this.placementChanging = true;
                this.changeDetectorRef.markForCheck();
                clearTimeout(this.placementChangeTimeoutId);
                this.placementChangeTimeoutId = setTimeout(() => {
                    this.placementChanging = false;
                    this.changeDetectorRef.markForCheck();
                }, this.getAnimationDuration());
            }
        }
        close(result) {
            this.isOpen = false;
            this.inAnimation = true;
            this.nzVisibleChange.emit(false);
            this.updateOverlayStyle();
            this.overlayKeyboardDispatcher.remove(this.overlayRef);
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
                this.updateBodyOverflow();
                this.restoreFocus();
                this.inAnimation = false;
                this.nzAfterClose.next(result);
                this.nzAfterClose.complete();
                this.componentInstance = null;
                this.componentRef = null;
            }, this.getAnimationDuration());
        }
        open() {
            this.attachOverlay();
            this.isOpen = true;
            this.inAnimation = true;
            this.nzVisibleChange.emit(true);
            this.overlayKeyboardDispatcher.add(this.overlayRef);
            this.updateOverlayStyle();
            this.updateBodyOverflow();
            this.savePreviouslyFocusedElement();
            this.trapFocus();
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
                this.inAnimation = false;
                this.changeDetectorRef.detectChanges();
                this.nzAfterOpen.next();
            }, this.getAnimationDuration());
        }
        getContentComponent() {
            return this.componentInstance;
        }
        getContentComponentRef() {
            return this.componentRef;
        }
        closeClick() {
            this.nzOnClose.emit();
        }
        maskClick() {
            if (this.nzMaskClosable && this.nzMask) {
                this.nzOnClose.emit();
            }
        }
        attachBodyContent() {
            this.bodyPortalOutlet.dispose();
            if (this.nzContent instanceof Type) {
                const childInjector = Injector.create({
                    parent: this.injector,
                    providers: [
                        { provide: NzDrawerRef, useValue: this },
                        { provide: NZ_DRAWER_DATA, useValue: this.nzData }
                    ]
                });
                const componentPortal = new ComponentPortal(this.nzContent, null, childInjector);
                this.componentRef = this.bodyPortalOutlet.attachComponentPortal(componentPortal);
                this.componentInstance = this.componentRef.instance;
                /**TODO
                 * When nzContentParam will be remove in the next major version, we have to remove the following line
                 * **/
                Object.assign(this.componentRef.instance, this.nzData || this.nzContentParams);
                this.componentRef.changeDetectorRef.detectChanges();
            }
        }
        attachOverlay() {
            if (!this.overlayRef) {
                this.portal = new TemplatePortal(this.drawerTemplate, this.viewContainerRef);
                this.overlayRef = this.overlay.create(this.getOverlayConfig());
                overlayZIndexSetter(this.overlayRef, this.nzZIndex);
            }
            if (this.overlayRef && !this.overlayRef.hasAttached()) {
                this.overlayRef.attach(this.portal);
                this.overlayRef.keydownEvents()
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((event) => {
                    if (event.keyCode === ESCAPE && this.isOpen && this.nzKeyboard) {
                        this.nzOnClose.emit();
                    }
                });
                this.overlayRef
                    .detachments()
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                    this.close();
                    this.disposeOverlay();
                });
            }
        }
        disposeOverlay() {
            this.overlayRef?.dispose();
            this.overlayRef = null;
        }
        getOverlayConfig() {
            return new OverlayConfig({
                disposeOnNavigation: this.nzCloseOnNavigation,
                positionStrategy: this.overlay.position().global(),
                scrollStrategy: this.overlay.scrollStrategies.block()
            });
        }
        updateOverlayStyle() {
            if (this.overlayRef && this.overlayRef.overlayElement) {
                this.renderer.setStyle(this.overlayRef.overlayElement, 'pointer-events', this.isOpen ? 'auto' : 'none');
            }
        }
        updateBodyOverflow() {
            if (this.overlayRef) {
                if (this.isOpen) {
                    this.overlayRef.getConfig().scrollStrategy.enable();
                }
                else {
                    this.overlayRef.getConfig().scrollStrategy.disable();
                }
            }
        }
        savePreviouslyFocusedElement() {
            if (this.document && !this.previouslyFocusedElement) {
                this.previouslyFocusedElement = this.document.activeElement;
                // We need the extra check, because IE's svg element has no blur method.
                if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.blur === 'function') {
                    this.previouslyFocusedElement.blur();
                }
            }
        }
        trapFocus() {
            if (!this.focusTrap && this.overlayRef && this.overlayRef.overlayElement) {
                this.focusTrap = this.focusTrapFactory.create(this.overlayRef.overlayElement);
                this.focusTrap.focusInitialElement();
            }
        }
        restoreFocus() {
            // We need the extra check, because IE can set the `activeElement` to null in some cases.
            if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
                this.previouslyFocusedElement.focus();
                this.previouslyFocusedElement = undefined;
            }
            if (this.focusTrap) {
                this.focusTrap.destroy();
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NzConfigService }, { token: i0.Renderer2 }, { token: i2.Overlay }, { token: i0.Injector }, { token: i0.ChangeDetectorRef }, { token: i3.FocusTrapFactory }, { token: i0.ViewContainerRef }, { token: i2.OverlayKeyboardDispatcher }, { token: i4.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzDrawerComponent, isStandalone: true, selector: "nz-drawer", inputs: { nzContent: "nzContent", nzCloseIcon: "nzCloseIcon", nzClosable: ["nzClosable", "nzClosable", booleanAttribute], nzMaskClosable: ["nzMaskClosable", "nzMaskClosable", booleanAttribute], nzMask: ["nzMask", "nzMask", booleanAttribute], nzCloseOnNavigation: ["nzCloseOnNavigation", "nzCloseOnNavigation", booleanAttribute], nzNoAnimation: ["nzNoAnimation", "nzNoAnimation", booleanAttribute], nzKeyboard: ["nzKeyboard", "nzKeyboard", booleanAttribute], nzTitle: "nzTitle", nzExtra: "nzExtra", nzFooter: "nzFooter", nzPlacement: "nzPlacement", nzSize: "nzSize", nzMaskStyle: "nzMaskStyle", nzBodyStyle: "nzBodyStyle", nzWrapClassName: "nzWrapClassName", nzWidth: "nzWidth", nzHeight: "nzHeight", nzZIndex: "nzZIndex", nzOffsetX: "nzOffsetX", nzOffsetY: "nzOffsetY", nzVisible: ["nzVisible", "nzVisible", booleanAttribute] }, outputs: { nzOnViewInit: "nzOnViewInit", nzOnClose: "nzOnClose", nzVisibleChange: "nzVisibleChange" }, queries: [{ propertyName: "contentFromContentChild", first: true, predicate: NzDrawerContentDirective, descendants: true, read: TemplateRef, static: true }], viewQueries: [{ propertyName: "drawerTemplate", first: true, predicate: ["drawerTemplate"], descendants: true, static: true }, { propertyName: "bodyPortalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true }], exportAs: ["nzDrawer"], usesInheritance: true, usesOnChanges: true, ngImport: i0, template: `
    <ng-template #drawerTemplate>
      <div
        class="ant-drawer"
        [nzNoAnimation]="nzNoAnimation"
        [class.ant-drawer-rtl]="dir === 'rtl'"
        [class.ant-drawer-open]="isOpen"
        [class.no-mask]="!nzMask"
        [class.ant-drawer-top]="nzPlacement === 'top'"
        [class.ant-drawer-bottom]="nzPlacement === 'bottom'"
        [class.ant-drawer-right]="nzPlacement === 'right'"
        [class.ant-drawer-left]="nzPlacement === 'left'"
        [style.transform]="offsetTransform"
        [style.transition]="placementChanging ? 'none' : null"
        [style.zIndex]="nzZIndex"
      >
        @if (nzMask && isOpen) {
          <div @drawerMaskMotion class="ant-drawer-mask" (click)="maskClick()" [style]="nzMaskStyle"></div>
        }
        <div
          class="ant-drawer-content-wrapper {{ nzWrapClassName }}"
          [style.width]="width"
          [style.height]="height"
          [style.transform]="transform"
          [style.transition]="placementChanging ? 'none' : null"
        >
          <div class="ant-drawer-content">
            <div class="ant-drawer-wrapper-body" [style.height]="isLeftOrRight ? '100%' : null">
              @if (nzTitle || nzClosable) {
                <div class="ant-drawer-header" [class.ant-drawer-header-close-only]="!nzTitle">
                  <div class="ant-drawer-header-title">
                    @if (nzClosable) {
                      <button (click)="closeClick()" aria-label="Close" class="ant-drawer-close">
                        <ng-container *nzStringTemplateOutlet="nzCloseIcon; let closeIcon">
                          <nz-icon [nzType]="closeIcon" />
                        </ng-container>
                      </button>
                    }

                    @if (nzTitle) {
                      <div class="ant-drawer-title">
                        <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                      </div>
                    }
                  </div>
                  @if (nzExtra) {
                    <div class="ant-drawer-extra">
                      <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
                    </div>
                  }
                </div>
              }
              <div class="ant-drawer-body" [style]="nzBodyStyle" cdkScrollable>
                <ng-template cdkPortalOutlet />
                @if (nzContent) {
                  @if (isTemplateRef(nzContent)) {
                    <ng-container *ngTemplateOutlet="nzContent; context: templateContext" />
                  }
                } @else {
                  @if (contentFromContentChild && (isOpen || inAnimation)) {
                    <ng-template [ngTemplateOutlet]="contentFromContentChild" />
                  }
                }
              </div>
              @if (nzFooter) {
                <div class="ant-drawer-footer">
                  <ng-container *nzStringTemplateOutlet="nzFooter">{{ nzFooter }}</ng-container>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i5.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i6.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: PortalModule }, { kind: "directive", type: i7.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: CdkScrollable, selector: "[cdk-scrollable], [cdkScrollable]" }], animations: [drawerMaskMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-drawer',
                    exportAs: 'nzDrawer',
                    template: `
    <ng-template #drawerTemplate>
      <div
        class="ant-drawer"
        [nzNoAnimation]="nzNoAnimation"
        [class.ant-drawer-rtl]="dir === 'rtl'"
        [class.ant-drawer-open]="isOpen"
        [class.no-mask]="!nzMask"
        [class.ant-drawer-top]="nzPlacement === 'top'"
        [class.ant-drawer-bottom]="nzPlacement === 'bottom'"
        [class.ant-drawer-right]="nzPlacement === 'right'"
        [class.ant-drawer-left]="nzPlacement === 'left'"
        [style.transform]="offsetTransform"
        [style.transition]="placementChanging ? 'none' : null"
        [style.zIndex]="nzZIndex"
      >
        @if (nzMask && isOpen) {
          <div @drawerMaskMotion class="ant-drawer-mask" (click)="maskClick()" [style]="nzMaskStyle"></div>
        }
        <div
          class="ant-drawer-content-wrapper {{ nzWrapClassName }}"
          [style.width]="width"
          [style.height]="height"
          [style.transform]="transform"
          [style.transition]="placementChanging ? 'none' : null"
        >
          <div class="ant-drawer-content">
            <div class="ant-drawer-wrapper-body" [style.height]="isLeftOrRight ? '100%' : null">
              @if (nzTitle || nzClosable) {
                <div class="ant-drawer-header" [class.ant-drawer-header-close-only]="!nzTitle">
                  <div class="ant-drawer-header-title">
                    @if (nzClosable) {
                      <button (click)="closeClick()" aria-label="Close" class="ant-drawer-close">
                        <ng-container *nzStringTemplateOutlet="nzCloseIcon; let closeIcon">
                          <nz-icon [nzType]="closeIcon" />
                        </ng-container>
                      </button>
                    }

                    @if (nzTitle) {
                      <div class="ant-drawer-title">
                        <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                      </div>
                    }
                  </div>
                  @if (nzExtra) {
                    <div class="ant-drawer-extra">
                      <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
                    </div>
                  }
                </div>
              }
              <div class="ant-drawer-body" [style]="nzBodyStyle" cdkScrollable>
                <ng-template cdkPortalOutlet />
                @if (nzContent) {
                  @if (isTemplateRef(nzContent)) {
                    <ng-container *ngTemplateOutlet="nzContent; context: templateContext" />
                  }
                } @else {
                  @if (contentFromContentChild && (isOpen || inAnimation)) {
                    <ng-template [ngTemplateOutlet]="contentFromContentChild" />
                  }
                }
              </div>
              @if (nzFooter) {
                <div class="ant-drawer-footer">
                  <ng-container *nzStringTemplateOutlet="nzFooter">{{ nzFooter }}</ng-container>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    animations: [drawerMaskMotion],
                    imports: [NzNoAnimationDirective, NzOutletModule, NzIconModule, PortalModule, NgTemplateOutlet, CdkScrollable]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NzConfigService }, { type: i0.Renderer2 }, { type: i2.Overlay }, { type: i0.Injector }, { type: i0.ChangeDetectorRef }, { type: i3.FocusTrapFactory }, { type: i0.ViewContainerRef }, { type: i2.OverlayKeyboardDispatcher }, { type: i4.Directionality }], propDecorators: { nzContent: [{
                type: Input
            }], nzCloseIcon: [{
                type: Input
            }], nzClosable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMaskClosable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMask: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCloseOnNavigation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNoAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzKeyboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzTitle: [{
                type: Input
            }], nzExtra: [{
                type: Input
            }], nzFooter: [{
                type: Input
            }], nzPlacement: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzMaskStyle: [{
                type: Input
            }], nzBodyStyle: [{
                type: Input
            }], nzWrapClassName: [{
                type: Input
            }], nzWidth: [{
                type: Input
            }], nzHeight: [{
                type: Input
            }], nzZIndex: [{
                type: Input
            }], nzOffsetX: [{
                type: Input
            }], nzOffsetY: [{
                type: Input
            }], nzVisible: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOnViewInit: [{
                type: Output
            }], nzOnClose: [{
                type: Output
            }], nzVisibleChange: [{
                type: Output
            }], drawerTemplate: [{
                type: ViewChild,
                args: ['drawerTemplate', { static: true }]
            }], bodyPortalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: false }]
            }], contentFromContentChild: [{
                type: ContentChild,
                args: [NzDrawerContentDirective, { static: true, read: TemplateRef }]
            }], nzDirection: [] } });

class DrawerBuilderForService {
    overlay;
    options;
    drawerRef;
    overlayRef;
    unsubscribe$ = new Subject();
    constructor(overlay, options) {
        this.overlay = overlay;
        this.options = options;
        /** pick {@link NzDrawerOptions.nzOnCancel} and omit this option */
        const { nzOnCancel, ...componentOption } = this.options;
        this.overlayRef = this.overlay.create();
        this.drawerRef = this.overlayRef.attach(new ComponentPortal(NzDrawerComponent)).instance;
        this.updateOptions(componentOption);
        // Prevent repeatedly open drawer when tap focus element.
        this.drawerRef.savePreviouslyFocusedElement();
        this.drawerRef.nzOnViewInit.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.drawerRef.open();
        });
        this.drawerRef.nzOnClose.subscribe(() => {
            if (nzOnCancel) {
                nzOnCancel().then(canClose => {
                    if (canClose !== false) {
                        this.drawerRef.close();
                    }
                });
            }
            else {
                this.drawerRef.close();
            }
        });
        this.drawerRef.afterClose.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.overlayRef.dispose();
            this.drawerRef = null;
            this.unsubscribe$.next();
            this.unsubscribe$.complete();
        });
    }
    getInstance() {
        return this.drawerRef;
    }
    updateOptions(options) {
        Object.assign(this.drawerRef, options);
    }
}
class NzDrawerService {
    overlay;
    constructor(overlay) {
        this.overlay = overlay;
    }
    create(options) {
        return new DrawerBuilderForService(this.overlay, options).getInstance();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerService, deps: [{ token: i2.Overlay }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i2.Overlay }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDrawerModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerModule, imports: [NzDrawerComponent, NzDrawerContentDirective], exports: [NzDrawerComponent, NzDrawerContentDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerModule, providers: [NzDrawerService], imports: [NzDrawerComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDrawerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzDrawerComponent, NzDrawerContentDirective],
                    providers: [NzDrawerService],
                    exports: [NzDrawerComponent, NzDrawerContentDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { DRAWER_ANIMATE_DURATION, DRAWER_DEFAULT_SIZE, DRAWER_LARGE_SIZE, DrawerBuilderForService, NZ_DRAWER_DATA, NzDrawerComponent, NzDrawerContentDirective, NzDrawerModule, NzDrawerRef, NzDrawerService };
//# sourceMappingURL=ng-zorro-antd-drawer.mjs.map
