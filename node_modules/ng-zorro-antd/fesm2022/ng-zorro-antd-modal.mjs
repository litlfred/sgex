import * as i1 from '@angular/cdk/overlay';
import { OverlayRef, CdkScrollable, OverlayConfig } from '@angular/cdk/overlay';
import * as i5 from '@angular/cdk/portal';
import { BasePortalOutlet, PortalModule, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { InjectionToken, ChangeDetectionStrategy, Component, EventEmitter, inject, ChangeDetectorRef, NgZone, ElementRef, Renderer2, ANIMATION_MODULE_TYPE, Directive, Output, ViewChild, Input, Injector, TemplateRef, Injectable, booleanAttribute, numberAttribute, ContentChild, NgModule } from '@angular/core';
import { Subject, defer } from 'rxjs';
import { takeUntil, filter, take, startWith } from 'rxjs/operators';
import { warn } from 'ng-zorro-antd/core/logger';
import { overlayZIndexSetter } from 'ng-zorro-antd/core/overlay';
import { getElementOffset, isNotNil, fromEventOutsideAngular, isPromise } from 'ng-zorro-antd/core/util';
import * as i6 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i1$1 from 'ng-zorro-antd/i18n';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2$1 from 'ng-zorro-antd/pipes';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import * as i2$2 from 'ng-zorro-antd/core/config';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { reqAnimFrame } from 'ng-zorro-antd/core/polyfill';
import * as i7 from 'ng-zorro-antd/core/transition-patch';
import * as i8 from 'ng-zorro-antd/core/wave';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import * as i3$1 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const noopFun = () => void 0;
class ModalOptions {
    nzCentered = false;
    nzClosable = true;
    nzOkLoading = false;
    nzOkDisabled = false;
    nzCancelDisabled = false;
    nzCancelLoading = false;
    nzDraggable = false;
    nzNoAnimation = false;
    nzAutofocus = 'auto';
    nzMask;
    nzMaskClosable;
    nzKeyboard = true;
    nzZIndex = 1000;
    nzWidth = 520;
    nzCloseIcon = 'close';
    nzOkType = 'primary';
    nzOkDanger = false;
    nzModalType = 'default';
    nzOnCancel = noopFun;
    nzOnOk = noopFun;
    nzData;
    nzMaskStyle;
    nzBodyStyle;
    nzWrapClassName;
    nzClassName;
    nzStyle;
    nzTitle;
    nzFooter; // Default Modal ONLY
    nzCancelText;
    nzOkText;
    nzContent;
    nzCloseOnNavigation;
    nzViewContainerRef;
    // Template use only
    nzAfterOpen;
    nzAfterClose;
    // Confirm
    nzIconType = 'question-circle';
    nzDirection;
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const ZOOM_CLASS_NAME_MAP = {
    enter: 'ant-zoom-enter',
    enterActive: 'ant-zoom-enter-active',
    leave: 'ant-zoom-leave',
    leaveActive: 'ant-zoom-leave-active'
};
const FADE_CLASS_NAME_MAP = {
    enter: 'ant-fade-enter',
    enterActive: 'ant-fade-enter-active',
    leave: 'ant-fade-leave',
    leaveActive: 'ant-fade-leave-active'
};
const MODAL_MASK_CLASS_NAME = 'ant-modal-mask';
const NZ_CONFIG_MODULE_NAME = 'modal';
const NZ_MODAL_DATA = new InjectionToken('NZ_MODAL_DATA');

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const nzModalAnimations = {
    modalContainer: trigger('modalContainer', [
        state('void, exit', style({})),
        state('enter', style({})),
        transition('* => enter', animate('.24s', style({}))),
        transition('* => void, * => exit', animate('.2s', style({})))
    ])
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalCloseComponent {
    config;
    constructor(config) {
        this.config = config;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalCloseComponent, deps: [{ token: ModalOptions }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzModalCloseComponent, isStandalone: true, selector: "button[nz-modal-close]", host: { attributes: { "aria-label": "Close" }, classAttribute: "ant-modal-close" }, exportAs: ["NzModalCloseBuiltin"], ngImport: i0, template: `
    <span class="ant-modal-close-x">
      <ng-container *nzStringTemplateOutlet="config.nzCloseIcon; let closeIcon">
        <nz-icon [nzType]="closeIcon" class="ant-modal-close-icon" />
      </ng-container>
    </span>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalCloseComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'button[nz-modal-close]',
                    exportAs: 'NzModalCloseBuiltin',
                    template: `
    <span class="ant-modal-close-x">
      <ng-container *nzStringTemplateOutlet="config.nzCloseIcon; let closeIcon">
        <nz-icon [nzType]="closeIcon" class="ant-modal-close-icon" />
      </ng-container>
    </span>
  `,
                    host: {
                        class: 'ant-modal-close',
                        'aria-label': 'Close'
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NzIconModule, NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: ModalOptions }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function applyConfigDefaults(config, defaultOptions) {
    return { ...defaultOptions, ...config };
}
function getValueWithConfig(userValue, configValue, defaultValue) {
    return typeof userValue === 'undefined'
        ? typeof configValue === 'undefined'
            ? defaultValue
            : configValue
        : userValue;
}
function getConfigFromComponent(component) {
    const { nzCentered, nzMask, nzMaskClosable, nzClosable, nzOkLoading, nzOkDisabled, nzCancelDisabled, nzCancelLoading, nzKeyboard, nzNoAnimation, nzDraggable, nzContent, nzFooter, nzZIndex, nzWidth, nzWrapClassName, nzClassName, nzStyle, nzTitle, nzCloseIcon, nzMaskStyle, nzBodyStyle, nzOkText, nzCancelText, nzOkType, nzOkDanger, nzIconType, nzModalType, nzOnOk, nzOnCancel, nzAfterOpen, nzAfterClose, nzCloseOnNavigation, nzAutofocus } = component;
    return {
        nzCentered,
        nzMask,
        nzMaskClosable,
        nzDraggable,
        nzClosable,
        nzOkLoading,
        nzOkDisabled,
        nzCancelDisabled,
        nzCancelLoading,
        nzKeyboard,
        nzNoAnimation,
        nzContent,
        nzFooter,
        nzZIndex,
        nzWidth,
        nzWrapClassName,
        nzClassName,
        nzStyle,
        nzTitle,
        nzCloseIcon,
        nzMaskStyle,
        nzBodyStyle,
        nzOkText,
        nzCancelText,
        nzOkType,
        nzOkDanger,
        nzIconType,
        nzModalType,
        nzOnOk,
        nzOnCancel,
        nzAfterOpen,
        nzAfterClose,
        nzCloseOnNavigation,
        nzAutofocus
    };
}

function throwNzModalContentAlreadyAttachedError() {
    throw Error('Attempting to attach modal content after content is already attached');
}
class BaseModalContainerComponent extends BasePortalOutlet {
    portalOutlet;
    modalElementRef;
    animationStateChanged = new EventEmitter();
    containerClick = new EventEmitter();
    cancelTriggered = new EventEmitter();
    okTriggered = new EventEmitter();
    state = 'enter';
    document = inject(DOCUMENT);
    modalRef;
    isStringContent = false;
    dir = 'ltr';
    elementFocusedBeforeModalWasOpened = null;
    focusTrap;
    mouseDown = false;
    oldMaskStyle = null;
    cdr = inject(ChangeDetectorRef);
    config = inject(ModalOptions);
    destroy$ = new Subject();
    ngZone = inject(NgZone);
    host = inject(ElementRef);
    focusTrapFactory = inject(FocusTrapFactory);
    render = inject(Renderer2);
    overlayRef = inject(OverlayRef);
    nzConfigService = inject(NzConfigService);
    animationType = inject(ANIMATION_MODULE_TYPE, { optional: true });
    get showMask() {
        const defaultConfig = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
        return !!getValueWithConfig(this.config.nzMask, defaultConfig.nzMask, true);
    }
    get maskClosable() {
        const defaultConfig = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
        return !!getValueWithConfig(this.config.nzMaskClosable, defaultConfig.nzMaskClosable, true);
    }
    constructor() {
        super();
        this.dir = this.overlayRef.getDirection();
        this.isStringContent = typeof this.config.nzContent === 'string';
        this.nzConfigService
            .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.updateMaskClassname();
        });
    }
    onContainerClick(e) {
        if (e.target === e.currentTarget && !this.mouseDown && this.showMask && this.maskClosable) {
            this.containerClick.emit();
        }
    }
    onCloseClick() {
        this.cancelTriggered.emit();
    }
    onOkClick() {
        this.okTriggered.emit();
    }
    attachComponentPortal(portal) {
        if (this.portalOutlet.hasAttached()) {
            throwNzModalContentAlreadyAttachedError();
        }
        this.savePreviouslyFocusedElement();
        this.setZIndexForBackdrop();
        return this.portalOutlet.attachComponentPortal(portal);
    }
    attachTemplatePortal(portal) {
        if (this.portalOutlet.hasAttached()) {
            throwNzModalContentAlreadyAttachedError();
        }
        this.savePreviouslyFocusedElement();
        this.setZIndexForBackdrop();
        return this.portalOutlet.attachTemplatePortal(portal);
    }
    attachStringContent() {
        this.savePreviouslyFocusedElement();
        this.setZIndexForBackdrop();
    }
    getNativeElement() {
        return this.host.nativeElement;
    }
    animationDisabled() {
        return this.config.nzNoAnimation || this.animationType === 'NoopAnimations';
    }
    setModalTransformOrigin() {
        const modalElement = this.modalElementRef.nativeElement;
        if (this.elementFocusedBeforeModalWasOpened) {
            const previouslyDOMRect = this.elementFocusedBeforeModalWasOpened.getBoundingClientRect();
            const lastPosition = getElementOffset(this.elementFocusedBeforeModalWasOpened);
            const x = lastPosition.left + previouslyDOMRect.width / 2;
            const y = lastPosition.top + previouslyDOMRect.height / 2;
            const transformOrigin = `${x - modalElement.offsetLeft}px ${y - modalElement.offsetTop}px 0px`;
            this.render.setStyle(modalElement, 'transform-origin', transformOrigin);
        }
    }
    savePreviouslyFocusedElement() {
        if (!this.focusTrap) {
            this.focusTrap = this.focusTrapFactory.create(this.host.nativeElement);
        }
        if (this.document) {
            this.elementFocusedBeforeModalWasOpened = this.document.activeElement;
            if (this.host.nativeElement.focus) {
                this.ngZone.runOutsideAngular(() => reqAnimFrame(() => this.host.nativeElement.focus()));
            }
        }
    }
    trapFocus() {
        const element = this.host.nativeElement;
        if (this.config.nzAutofocus) {
            this.focusTrap.focusInitialElementWhenReady();
        }
        else {
            const activeElement = this.document.activeElement;
            if (activeElement !== element && !element.contains(activeElement)) {
                element.focus();
            }
        }
    }
    restoreFocus() {
        const toFocus = this.elementFocusedBeforeModalWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            const activeElement = this.document.activeElement;
            const element = this.host.nativeElement;
            if (!activeElement ||
                activeElement === this.document.body ||
                activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
        if (this.focusTrap) {
            this.focusTrap.destroy();
        }
    }
    setEnterAnimationClass() {
        if (this.animationDisabled()) {
            return;
        }
        // Make sure to set the `TransformOrigin` style before set the modelElement's class names
        this.setModalTransformOrigin();
        const modalElement = this.modalElementRef.nativeElement;
        const backdropElement = this.overlayRef.backdropElement;
        modalElement.classList.add(ZOOM_CLASS_NAME_MAP.enter);
        modalElement.classList.add(ZOOM_CLASS_NAME_MAP.enterActive);
        if (backdropElement) {
            backdropElement.classList.add(FADE_CLASS_NAME_MAP.enter);
            backdropElement.classList.add(FADE_CLASS_NAME_MAP.enterActive);
        }
    }
    setExitAnimationClass() {
        const modalElement = this.modalElementRef.nativeElement;
        modalElement.classList.add(ZOOM_CLASS_NAME_MAP.leave);
        modalElement.classList.add(ZOOM_CLASS_NAME_MAP.leaveActive);
        this.setMaskExitAnimationClass();
    }
    setMaskExitAnimationClass(force = false) {
        const backdropElement = this.overlayRef.backdropElement;
        if (backdropElement) {
            if (this.animationDisabled() || force) {
                // https://github.com/angular/components/issues/18645
                backdropElement.classList.remove(MODAL_MASK_CLASS_NAME);
                return;
            }
            backdropElement.classList.add(FADE_CLASS_NAME_MAP.leave);
            backdropElement.classList.add(FADE_CLASS_NAME_MAP.leaveActive);
        }
    }
    cleanAnimationClass() {
        if (this.animationDisabled()) {
            return;
        }
        const backdropElement = this.overlayRef.backdropElement;
        const modalElement = this.modalElementRef.nativeElement;
        if (backdropElement) {
            backdropElement.classList.remove(FADE_CLASS_NAME_MAP.enter);
            backdropElement.classList.remove(FADE_CLASS_NAME_MAP.enterActive);
        }
        modalElement.classList.remove(ZOOM_CLASS_NAME_MAP.enter);
        modalElement.classList.remove(ZOOM_CLASS_NAME_MAP.enterActive);
        modalElement.classList.remove(ZOOM_CLASS_NAME_MAP.leave);
        modalElement.classList.remove(ZOOM_CLASS_NAME_MAP.leaveActive);
    }
    setZIndexForBackdrop() {
        const backdropElement = this.overlayRef.backdropElement;
        if (backdropElement) {
            if (isNotNil(this.config.nzZIndex)) {
                this.render.setStyle(backdropElement, 'z-index', this.config.nzZIndex);
            }
        }
    }
    bindBackdropStyle() {
        const backdropElement = this.overlayRef.backdropElement;
        if (backdropElement) {
            if (this.oldMaskStyle) {
                const styles = this.oldMaskStyle;
                Object.keys(styles).forEach(key => {
                    this.render.removeStyle(backdropElement, key);
                });
                this.oldMaskStyle = null;
            }
            this.setZIndexForBackdrop();
            if (typeof this.config.nzMaskStyle === 'object' && Object.keys(this.config.nzMaskStyle).length) {
                const styles = { ...this.config.nzMaskStyle };
                Object.keys(styles).forEach(key => {
                    this.render.setStyle(backdropElement, key, styles[key]);
                });
                this.oldMaskStyle = styles;
            }
        }
    }
    updateMaskClassname() {
        const backdropElement = this.overlayRef.backdropElement;
        if (backdropElement) {
            if (this.showMask) {
                backdropElement.classList.add(MODAL_MASK_CLASS_NAME);
            }
            else {
                backdropElement.classList.remove(MODAL_MASK_CLASS_NAME);
            }
        }
    }
    onAnimationDone(event) {
        if (event.toState === 'enter') {
            this.trapFocus();
        }
        else if (event.toState === 'exit') {
            this.restoreFocus();
        }
        this.cleanAnimationClass();
        this.animationStateChanged.emit(event);
    }
    onAnimationStart(event) {
        if (event.toState === 'enter') {
            this.setEnterAnimationClass();
            this.bindBackdropStyle();
        }
        else if (event.toState === 'exit') {
            this.setExitAnimationClass();
        }
        this.animationStateChanged.emit(event);
    }
    startExitAnimation() {
        this.state = 'exit';
        this.cdr.markForCheck();
    }
    ngOnDestroy() {
        this.setMaskExitAnimationClass(true);
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    setupMouseListeners(modalContainer) {
        fromEventOutsideAngular(this.host.nativeElement, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            if (this.mouseDown) {
                setTimeout(() => {
                    this.mouseDown = false;
                });
            }
        });
        fromEventOutsideAngular(modalContainer.nativeElement, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.mouseDown = true;
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: BaseModalContainerComponent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: BaseModalContainerComponent, isStandalone: true, usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: BaseModalContainerComponent, decorators: [{
            type: Directive
        }], ctorParameters: () => [] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalConfirmContainerComponent extends BaseModalContainerComponent {
    set _portalOutlet(portalOutlet) {
        this.portalOutlet = portalOutlet;
    }
    set _modalElementRef(elementRef) {
        this.modalElementRef = elementRef;
    }
    cancelTriggered = new EventEmitter();
    okTriggered = new EventEmitter();
    locale;
    i18n = inject(NzI18nService);
    constructor() {
        super();
        this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.locale = this.i18n.getLocaleData('Modal');
        });
    }
    ngOnInit() {
        this.setupMouseListeners(this.modalElementRef);
    }
    onCancel() {
        this.cancelTriggered.emit();
    }
    onOk() {
        this.okTriggered.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalConfirmContainerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzModalConfirmContainerComponent, isStandalone: true, selector: "nz-modal-confirm-container", outputs: { cancelTriggered: "cancelTriggered", okTriggered: "okTriggered" }, host: { attributes: { "tabindex": "-1", "role": "dialog" }, listeners: { "@modalContainer.start": "onAnimationStart($event)", "@modalContainer.done": "onAnimationDone($event)", "click": "onContainerClick($event)" }, properties: { "class": "config.nzWrapClassName ? \"ant-modal-wrap \" + config.nzWrapClassName : \"ant-modal-wrap\"", "class.ant-modal-wrap-rtl": "dir === 'rtl'", "class.ant-modal-centered": "config.nzCentered", "style.zIndex": "config.nzZIndex", "@.disabled": "config.nzNoAnimation", "@modalContainer": "state" } }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }, { propertyName: "_modalElementRef", first: true, predicate: ["modalElement"], descendants: true, static: true }], exportAs: ["nzModalConfirmContainer"], usesInheritance: true, hostDirectives: [{ directive: i1.CdkScrollable }], ngImport: i0, template: `
    <div
      #modalElement
      role="document"
      class="ant-modal"
      [class]="config.nzClassName!"
      [style]="config.nzStyle!"
      [style.width]="config?.nzWidth! | nzToCssUnit"
    >
      <div class="ant-modal-content">
        @if (config.nzClosable) {
          <button nz-modal-close (click)="onCloseClick()"></button>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <div class="ant-modal-confirm-body-wrapper">
            <div class="ant-modal-confirm-body">
              <nz-icon [nzType]="config.nzIconType!" />
              <span class="ant-modal-confirm-title">
                <ng-container *nzStringTemplateOutlet="config.nzTitle">
                  <span [innerHTML]="config.nzTitle"></span>
                </ng-container>
              </span>
              <div class="ant-modal-confirm-content">
                <ng-template cdkPortalOutlet></ng-template>
                @if (isStringContent) {
                  <div [innerHTML]="config.nzContent"></div>
                }
              </div>
            </div>
            <div class="ant-modal-confirm-btns">
              @if (config.nzCancelText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'cancel' || null"
                  nz-button
                  (click)="onCancel()"
                  [nzLoading]="config.nzCancelLoading"
                  [disabled]="config.nzCancelDisabled"
                >
                  {{ config.nzCancelText || locale.cancelText }}
                </button>
              }
              @if (config.nzOkText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'ok' || null"
                  nz-button
                  [nzType]="config.nzOkType!"
                  (click)="onOk()"
                  [nzLoading]="config.nzOkLoading"
                  [disabled]="config.nzOkDisabled"
                  [nzDanger]="config.nzOkDanger"
                >
                  {{ config.nzOkText || locale.okText }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzPipesModule }, { kind: "pipe", type: i2$1.NzToCssUnitPipe, name: "nzToCssUnit" }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "component", type: NzModalCloseComponent, selector: "button[nz-modal-close]", exportAs: ["NzModalCloseBuiltin"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: PortalModule }, { kind: "directive", type: i5.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i6.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i7.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i8.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }], animations: [nzModalAnimations.modalContainer], changeDetection: i0.ChangeDetectionStrategy.Default });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalConfirmContainerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-modal-confirm-container',
                    exportAs: 'nzModalConfirmContainer',
                    template: `
    <div
      #modalElement
      role="document"
      class="ant-modal"
      [class]="config.nzClassName!"
      [style]="config.nzStyle!"
      [style.width]="config?.nzWidth! | nzToCssUnit"
    >
      <div class="ant-modal-content">
        @if (config.nzClosable) {
          <button nz-modal-close (click)="onCloseClick()"></button>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <div class="ant-modal-confirm-body-wrapper">
            <div class="ant-modal-confirm-body">
              <nz-icon [nzType]="config.nzIconType!" />
              <span class="ant-modal-confirm-title">
                <ng-container *nzStringTemplateOutlet="config.nzTitle">
                  <span [innerHTML]="config.nzTitle"></span>
                </ng-container>
              </span>
              <div class="ant-modal-confirm-content">
                <ng-template cdkPortalOutlet></ng-template>
                @if (isStringContent) {
                  <div [innerHTML]="config.nzContent"></div>
                }
              </div>
            </div>
            <div class="ant-modal-confirm-btns">
              @if (config.nzCancelText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'cancel' || null"
                  nz-button
                  (click)="onCancel()"
                  [nzLoading]="config.nzCancelLoading"
                  [disabled]="config.nzCancelDisabled"
                >
                  {{ config.nzCancelText || locale.cancelText }}
                </button>
              }
              @if (config.nzOkText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'ok' || null"
                  nz-button
                  [nzType]="config.nzOkType!"
                  (click)="onOk()"
                  [nzLoading]="config.nzOkLoading"
                  [disabled]="config.nzOkDisabled"
                  [nzDanger]="config.nzOkDanger"
                >
                  {{ config.nzOkText || locale.okText }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
                    hostDirectives: [CdkScrollable],
                    animations: [nzModalAnimations.modalContainer],
                    // Using OnPush for modal caused footer can not to detect changes. we can fix it when 8.x.
                    changeDetection: ChangeDetectionStrategy.Default,
                    host: {
                        tabindex: '-1',
                        role: 'dialog',
                        '[class]': 'config.nzWrapClassName ? "ant-modal-wrap " + config.nzWrapClassName : "ant-modal-wrap"',
                        '[class.ant-modal-wrap-rtl]': `dir === 'rtl'`,
                        '[class.ant-modal-centered]': 'config.nzCentered',
                        '[style.zIndex]': 'config.nzZIndex',
                        '[@.disabled]': 'config.nzNoAnimation',
                        '[@modalContainer]': 'state',
                        '(@modalContainer.start)': 'onAnimationStart($event)',
                        '(@modalContainer.done)': 'onAnimationDone($event)',
                        '(click)': 'onContainerClick($event)'
                    },
                    imports: [NzPipesModule, NzIconModule, NzModalCloseComponent, NzOutletModule, PortalModule, NzButtonModule]
                }]
        }], ctorParameters: () => [], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }], _modalElementRef: [{
                type: ViewChild,
                args: ['modalElement', { static: true }]
            }], cancelTriggered: [{
                type: Output
            }], okTriggered: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalFooterComponent {
    i18n;
    config;
    buttonsFooter = false;
    buttons = [];
    locale;
    cancelTriggered = new EventEmitter();
    okTriggered = new EventEmitter();
    modalRef;
    destroy$ = new Subject();
    constructor(i18n, config) {
        this.i18n = i18n;
        this.config = config;
        if (Array.isArray(config.nzFooter)) {
            this.buttonsFooter = true;
            this.buttons = config.nzFooter.map(mergeDefaultOption);
        }
        this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.locale = this.i18n.getLocaleData('Modal');
        });
    }
    onCancel() {
        this.cancelTriggered.emit();
    }
    onOk() {
        this.okTriggered.emit();
    }
    /**
     * Returns the value of the specified key.
     * If it is a function, run and return the return value of the function.
     */
    getButtonCallableProp(options, prop) {
        const value = options[prop];
        const componentInstance = this.modalRef.getContentComponent();
        return typeof value === 'function' ? value.apply(options, componentInstance && [componentInstance]) : value;
    }
    /**
     * Run function based on the type and set its `loading` prop if needed.
     */
    onButtonClick(options) {
        const loading = this.getButtonCallableProp(options, 'loading');
        if (!loading) {
            const result = this.getButtonCallableProp(options, 'onClick');
            if (options.autoLoading && isPromise(result)) {
                options.loading = true;
                result
                    .then(() => (options.loading = false))
                    .catch(e => {
                    options.loading = false;
                    throw e;
                });
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalFooterComponent, deps: [{ token: i1$1.NzI18nService }, { token: ModalOptions }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzModalFooterComponent, isStandalone: true, selector: "div[nz-modal-footer]", inputs: { modalRef: "modalRef" }, outputs: { cancelTriggered: "cancelTriggered", okTriggered: "okTriggered" }, host: { classAttribute: "ant-modal-footer" }, exportAs: ["NzModalFooterBuiltin"], ngImport: i0, template: `
    @if (config.nzFooter) {
      <ng-container
        *nzStringTemplateOutlet="config.nzFooter; context: { $implicit: config.nzData, modalRef: modalRef }"
      >
        @if (buttonsFooter) {
          @for (button of buttons; track button) {
            <button
              nz-button
              (click)="onButtonClick(button)"
              [hidden]="!getButtonCallableProp(button, 'show')"
              [nzLoading]="getButtonCallableProp(button, 'loading')"
              [disabled]="getButtonCallableProp(button, 'disabled')"
              [nzType]="button.type!"
              [nzDanger]="button.danger"
              [nzShape]="button.shape!"
              [nzSize]="button.size!"
              [nzGhost]="button.ghost!"
            >
              {{ button.label }}
            </button>
          }
        } @else {
          <div [innerHTML]="config.nzFooter"></div>
        }
      </ng-container>
    } @else {
      @if (config.nzCancelText !== null) {
        <button
          [attr.cdkFocusInitial]="config.nzAutofocus === 'cancel' || null"
          nz-button
          (click)="onCancel()"
          [nzLoading]="config.nzCancelLoading"
          [disabled]="config.nzCancelDisabled"
        >
          {{ config.nzCancelText || locale.cancelText }}
        </button>
      }
      @if (config.nzOkText !== null) {
        <button
          [attr.cdkFocusInitial]="config.nzAutofocus === 'ok' || null"
          nz-button
          [nzType]="config.nzOkType!"
          [nzDanger]="config.nzOkDanger"
          (click)="onOk()"
          [nzLoading]="config.nzOkLoading"
          [disabled]="config.nzOkDisabled"
        >
          {{ config.nzOkText || locale.okText }}
        </button>
      }
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i6.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i7.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i8.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }], changeDetection: i0.ChangeDetectionStrategy.Default });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalFooterComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'div[nz-modal-footer]',
                    exportAs: 'NzModalFooterBuiltin',
                    template: `
    @if (config.nzFooter) {
      <ng-container
        *nzStringTemplateOutlet="config.nzFooter; context: { $implicit: config.nzData, modalRef: modalRef }"
      >
        @if (buttonsFooter) {
          @for (button of buttons; track button) {
            <button
              nz-button
              (click)="onButtonClick(button)"
              [hidden]="!getButtonCallableProp(button, 'show')"
              [nzLoading]="getButtonCallableProp(button, 'loading')"
              [disabled]="getButtonCallableProp(button, 'disabled')"
              [nzType]="button.type!"
              [nzDanger]="button.danger"
              [nzShape]="button.shape!"
              [nzSize]="button.size!"
              [nzGhost]="button.ghost!"
            >
              {{ button.label }}
            </button>
          }
        } @else {
          <div [innerHTML]="config.nzFooter"></div>
        }
      </ng-container>
    } @else {
      @if (config.nzCancelText !== null) {
        <button
          [attr.cdkFocusInitial]="config.nzAutofocus === 'cancel' || null"
          nz-button
          (click)="onCancel()"
          [nzLoading]="config.nzCancelLoading"
          [disabled]="config.nzCancelDisabled"
        >
          {{ config.nzCancelText || locale.cancelText }}
        </button>
      }
      @if (config.nzOkText !== null) {
        <button
          [attr.cdkFocusInitial]="config.nzAutofocus === 'ok' || null"
          nz-button
          [nzType]="config.nzOkType!"
          [nzDanger]="config.nzOkDanger"
          (click)="onOk()"
          [nzLoading]="config.nzOkLoading"
          [disabled]="config.nzOkDisabled"
        >
          {{ config.nzOkText || locale.okText }}
        </button>
      }
    }
  `,
                    host: {
                        class: 'ant-modal-footer'
                    },
                    changeDetection: ChangeDetectionStrategy.Default,
                    imports: [NzOutletModule, NzButtonModule]
                }]
        }], ctorParameters: () => [{ type: i1$1.NzI18nService }, { type: ModalOptions }], propDecorators: { cancelTriggered: [{
                type: Output
            }], okTriggered: [{
                type: Output
            }], modalRef: [{
                type: Input
            }] } });
function mergeDefaultOption(options) {
    return {
        type: null,
        size: 'default',
        autoLoading: true,
        show: true,
        loading: false,
        disabled: false,
        ...options
    };
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalTitleComponent {
    config;
    constructor(config) {
        this.config = config;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalTitleComponent, deps: [{ token: ModalOptions }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzModalTitleComponent, isStandalone: true, selector: "div[nz-modal-title]", host: { classAttribute: "ant-modal-header" }, exportAs: ["NzModalTitleBuiltin"], ngImport: i0, template: `
    <div class="ant-modal-title">
      <ng-container *nzStringTemplateOutlet="config.nzTitle">
        <div [innerHTML]="config.nzTitle"></div>
      </ng-container>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalTitleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'div[nz-modal-title]',
                    exportAs: 'NzModalTitleBuiltin',
                    template: `
    <div class="ant-modal-title">
      <ng-container *nzStringTemplateOutlet="config.nzTitle">
        <div [innerHTML]="config.nzTitle"></div>
      </ng-container>
    </div>
  `,
                    host: {
                        class: 'ant-modal-header'
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: ModalOptions }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalContainerComponent extends BaseModalContainerComponent {
    set _portalOutlet(portalOutlet) {
        this.portalOutlet = portalOutlet;
    }
    set _modalElementRef(elementRef) {
        this.modalElementRef = elementRef;
    }
    ngOnInit() {
        this.setupMouseListeners(this.modalElementRef);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalContainerComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzModalContainerComponent, isStandalone: true, selector: "nz-modal-container", host: { attributes: { "tabindex": "-1", "role": "dialog" }, listeners: { "@modalContainer.start": "onAnimationStart($event)", "@modalContainer.done": "onAnimationDone($event)", "click": "onContainerClick($event)" }, properties: { "class": "config.nzWrapClassName ? \"ant-modal-wrap \" + config.nzWrapClassName : \"ant-modal-wrap\"", "class.ant-modal-wrap-rtl": "dir === 'rtl'", "class.ant-modal-centered": "config.nzCentered", "style.zIndex": "config.nzZIndex", "@.disabled": "config.nzNoAnimation", "@modalContainer": "state" } }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }, { propertyName: "_modalElementRef", first: true, predicate: ["modalElement"], descendants: true, static: true }], exportAs: ["nzModalContainer"], usesInheritance: true, hostDirectives: [{ directive: i1.CdkScrollable }], ngImport: i0, template: `
    <div
      #modalElement
      cdkDrag
      cdkDragBoundary=".cdk-overlay-container"
      [cdkDragDisabled]="!config.nzDraggable"
      role="document"
      class="ant-modal"
      [class]="config.nzClassName!"
      [style]="config.nzStyle!"
      [style.width]="config?.nzWidth! | nzToCssUnit"
    >
      <div class="ant-modal-content">
        @if (config.nzClosable) {
          <button nz-modal-close (click)="onCloseClick()"></button>
        }
        @if (config.nzTitle) {
          <div nz-modal-title cdkDragHandle [style.cursor]="config.nzDraggable ? 'move' : 'auto'"></div>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <ng-template cdkPortalOutlet />
          @if (isStringContent) {
            <div [innerHTML]="config.nzContent"></div>
          }
        </div>
        @if (config.nzFooter !== null) {
          <div
            nz-modal-footer
            [modalRef]="modalRef"
            (cancelTriggered)="onCloseClick()"
            (okTriggered)="onOkClick()"
          ></div>
        }
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: NzModalCloseComponent, selector: "button[nz-modal-close]", exportAs: ["NzModalCloseBuiltin"] }, { kind: "component", type: NzModalTitleComponent, selector: "div[nz-modal-title]", exportAs: ["NzModalTitleBuiltin"] }, { kind: "ngmodule", type: PortalModule }, { kind: "directive", type: i5.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "component", type: NzModalFooterComponent, selector: "div[nz-modal-footer]", inputs: ["modalRef"], outputs: ["cancelTriggered", "okTriggered"], exportAs: ["NzModalFooterBuiltin"] }, { kind: "ngmodule", type: NzPipesModule }, { kind: "pipe", type: i2$1.NzToCssUnitPipe, name: "nzToCssUnit" }, { kind: "directive", type: CdkDrag, selector: "[cdkDrag]", inputs: ["cdkDragData", "cdkDragLockAxis", "cdkDragRootElement", "cdkDragBoundary", "cdkDragStartDelay", "cdkDragFreeDragPosition", "cdkDragDisabled", "cdkDragConstrainPosition", "cdkDragPreviewClass", "cdkDragPreviewContainer", "cdkDragScale"], outputs: ["cdkDragStarted", "cdkDragReleased", "cdkDragEnded", "cdkDragEntered", "cdkDragExited", "cdkDragDropped", "cdkDragMoved"], exportAs: ["cdkDrag"] }, { kind: "directive", type: CdkDragHandle, selector: "[cdkDragHandle]", inputs: ["cdkDragHandleDisabled"] }], animations: [nzModalAnimations.modalContainer], changeDetection: i0.ChangeDetectionStrategy.Default });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalContainerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-modal-container',
                    exportAs: 'nzModalContainer',
                    hostDirectives: [CdkScrollable],
                    template: `
    <div
      #modalElement
      cdkDrag
      cdkDragBoundary=".cdk-overlay-container"
      [cdkDragDisabled]="!config.nzDraggable"
      role="document"
      class="ant-modal"
      [class]="config.nzClassName!"
      [style]="config.nzStyle!"
      [style.width]="config?.nzWidth! | nzToCssUnit"
    >
      <div class="ant-modal-content">
        @if (config.nzClosable) {
          <button nz-modal-close (click)="onCloseClick()"></button>
        }
        @if (config.nzTitle) {
          <div nz-modal-title cdkDragHandle [style.cursor]="config.nzDraggable ? 'move' : 'auto'"></div>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <ng-template cdkPortalOutlet />
          @if (isStringContent) {
            <div [innerHTML]="config.nzContent"></div>
          }
        </div>
        @if (config.nzFooter !== null) {
          <div
            nz-modal-footer
            [modalRef]="modalRef"
            (cancelTriggered)="onCloseClick()"
            (okTriggered)="onOkClick()"
          ></div>
        }
      </div>
    </div>
  `,
                    animations: [nzModalAnimations.modalContainer],
                    // Using OnPush for modal caused footer can not to detect changes. we can fix it when 8.x.
                    changeDetection: ChangeDetectionStrategy.Default,
                    host: {
                        tabindex: '-1',
                        role: 'dialog',
                        '[class]': 'config.nzWrapClassName ? "ant-modal-wrap " + config.nzWrapClassName : "ant-modal-wrap"',
                        '[class.ant-modal-wrap-rtl]': `dir === 'rtl'`,
                        '[class.ant-modal-centered]': 'config.nzCentered',
                        '[style.zIndex]': 'config.nzZIndex',
                        '[@.disabled]': 'config.nzNoAnimation',
                        '[@modalContainer]': 'state',
                        '(@modalContainer.start)': 'onAnimationStart($event)',
                        '(@modalContainer.done)': 'onAnimationDone($event)',
                        '(click)': 'onContainerClick($event)'
                    },
                    imports: [
                        NzModalCloseComponent,
                        NzModalTitleComponent,
                        PortalModule,
                        NzModalFooterComponent,
                        NzPipesModule,
                        CdkDrag,
                        CdkDragHandle
                    ]
                }]
        }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }], _modalElementRef: [{
                type: ViewChild,
                args: ['modalElement', { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalRef {
    overlayRef;
    config;
    containerInstance;
    componentInstance = null;
    componentRef = null;
    result;
    state = 0 /* NzModalState.OPEN */;
    afterClose = new Subject();
    afterOpen = new Subject();
    closeTimeout;
    destroy$ = new Subject();
    constructor(overlayRef, config, containerInstance) {
        this.overlayRef = overlayRef;
        this.config = config;
        this.containerInstance = containerInstance;
        containerInstance.animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'enter'), take(1))
            .subscribe(() => {
            this.afterOpen.next();
            this.afterOpen.complete();
            if (config.nzAfterOpen instanceof EventEmitter) {
                config.nzAfterOpen.emit();
            }
        });
        containerInstance.animationStateChanged
            .pipe(filter(event => event.phaseName === 'done' && event.toState === 'exit'), take(1))
            .subscribe(() => {
            clearTimeout(this.closeTimeout);
            this._finishDialogClose();
        });
        containerInstance.containerClick.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const cancelable = !this.config.nzCancelLoading && !this.config.nzOkLoading;
            if (cancelable) {
                this.trigger("cancel" /* NzTriggerAction.CANCEL */);
            }
        });
        overlayRef
            .keydownEvents()
            .pipe(filter(event => this.config.nzKeyboard &&
            !this.config.nzCancelLoading &&
            !this.config.nzOkLoading &&
            event.keyCode === ESCAPE &&
            !hasModifierKey(event)))
            .subscribe(event => {
            event.preventDefault();
            this.trigger("cancel" /* NzTriggerAction.CANCEL */);
        });
        containerInstance.cancelTriggered
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.trigger("cancel" /* NzTriggerAction.CANCEL */));
        containerInstance.okTriggered.pipe(takeUntil(this.destroy$)).subscribe(() => this.trigger("ok" /* NzTriggerAction.OK */));
        overlayRef.detachments().subscribe(() => {
            this.afterClose.next(this.result);
            this.afterClose.complete();
            if (config.nzAfterClose instanceof EventEmitter) {
                config.nzAfterClose.emit(this.result);
            }
            this.componentInstance = null;
            this.componentRef = null;
            this.overlayRef.dispose();
        });
    }
    getContentComponent() {
        return this.componentInstance;
    }
    getContentComponentRef() {
        return this.componentRef;
    }
    getElement() {
        return this.containerInstance.getNativeElement();
    }
    destroy(result) {
        this.close(result);
    }
    triggerOk() {
        return this.trigger("ok" /* NzTriggerAction.OK */);
    }
    triggerCancel() {
        return this.trigger("cancel" /* NzTriggerAction.CANCEL */);
    }
    close(result) {
        if (this.state !== 0 /* NzModalState.OPEN */) {
            return;
        }
        this.result = result;
        this.containerInstance.animationStateChanged
            .pipe(filter(event => event.phaseName === 'start'), take(1))
            .subscribe(event => {
            this.overlayRef.detachBackdrop();
            this.closeTimeout = setTimeout(() => {
                this._finishDialogClose();
            }, event.totalTime + 100);
        });
        this.containerInstance.startExitAnimation();
        this.state = 1 /* NzModalState.CLOSING */;
    }
    updateConfig(config) {
        Object.assign(this.config, config);
        this.containerInstance.bindBackdropStyle();
        this.containerInstance.cdr.markForCheck();
    }
    getState() {
        return this.state;
    }
    getConfig() {
        return this.config;
    }
    getBackdropElement() {
        return this.overlayRef.backdropElement;
    }
    async trigger(action) {
        if (this.state === 1 /* NzModalState.CLOSING */) {
            return;
        }
        const trigger = { ok: this.config.nzOnOk, cancel: this.config.nzOnCancel }[action];
        const loadingKey = { ok: 'nzOkLoading', cancel: 'nzCancelLoading' }[action];
        const loading = this.config[loadingKey];
        if (loading) {
            return;
        }
        if (trigger instanceof EventEmitter) {
            trigger.emit(this.getContentComponent());
        }
        else if (typeof trigger === 'function') {
            const result = trigger(this.getContentComponent());
            if (isPromise(result)) {
                this.config[loadingKey] = true;
                let doClose = false;
                try {
                    doClose = (await result);
                }
                finally {
                    this.config[loadingKey] = false;
                    this.closeWhitResult(doClose);
                }
            }
            else {
                this.closeWhitResult(result);
            }
        }
    }
    closeWhitResult(result) {
        if (result !== false) {
            this.close(result);
        }
    }
    _finishDialogClose() {
        this.state = 2 /* NzModalState.CLOSED */;
        this.overlayRef.dispose();
        this.destroy$.next();
    }
}

class NzModalService {
    overlay;
    injector;
    nzConfigService;
    directionality;
    openModalsAtThisLevel = [];
    afterAllClosedAtThisLevel = new Subject();
    get openModals() {
        return this.parentModal ? this.parentModal.openModals : this.openModalsAtThisLevel;
    }
    get _afterAllClosed() {
        const parent = this.parentModal;
        return parent ? parent._afterAllClosed : this.afterAllClosedAtThisLevel;
    }
    afterAllClose = defer(() => this.openModals.length ? this._afterAllClosed : this._afterAllClosed.pipe(startWith(undefined)));
    parentModal = inject(NzModalService, { skipSelf: true, optional: true });
    constructor(overlay, injector, nzConfigService, directionality) {
        this.overlay = overlay;
        this.injector = injector;
        this.nzConfigService = nzConfigService;
        this.directionality = directionality;
    }
    create(config) {
        return this.open(config.nzContent, config);
    }
    closeAll() {
        this.closeModals(this.openModals);
    }
    confirm(options = {}, confirmType = 'confirm') {
        if ('nzFooter' in options) {
            warn(`The Confirm-Modal doesn't support "nzFooter", this property will be ignored.`);
        }
        if (!('nzWidth' in options)) {
            options.nzWidth = 416;
        }
        if (!('nzMaskClosable' in options)) {
            options.nzMaskClosable = false;
        }
        options.nzModalType = 'confirm';
        options.nzClassName = `ant-modal-confirm ant-modal-confirm-${confirmType} ${options.nzClassName || ''}`;
        return this.create(options);
    }
    info(options = {}) {
        return this.confirmFactory(options, 'info');
    }
    success(options = {}) {
        return this.confirmFactory(options, 'success');
    }
    error(options = {}) {
        return this.confirmFactory(options, 'error');
    }
    warning(options = {}) {
        return this.confirmFactory(options, 'warning');
    }
    open(componentOrTemplateRef, config) {
        const configMerged = applyConfigDefaults(config || {}, new ModalOptions());
        const overlayRef = this.createOverlay(configMerged);
        const modalContainer = this.attachModalContainer(overlayRef, configMerged);
        const modalRef = this.attachModalContent(componentOrTemplateRef, modalContainer, overlayRef, configMerged);
        modalContainer.modalRef = modalRef;
        overlayZIndexSetter(overlayRef, config?.nzZIndex);
        this.openModals.push(modalRef);
        modalRef.afterClose.subscribe(() => this.removeOpenModal(modalRef));
        return modalRef;
    }
    removeOpenModal(modalRef) {
        const index = this.openModals.indexOf(modalRef);
        if (index > -1) {
            this.openModals.splice(index, 1);
            if (!this.openModals.length) {
                this._afterAllClosed.next();
            }
        }
    }
    closeModals(dialogs) {
        let i = dialogs.length;
        while (i--) {
            dialogs[i].close();
            if (!this.openModals.length) {
                this._afterAllClosed.next();
            }
        }
    }
    createOverlay(config) {
        const globalConfig = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            backdropClass: getValueWithConfig(config.nzMask, globalConfig.nzMask, true) ? MODAL_MASK_CLASS_NAME : '',
            positionStrategy: this.overlay.position().global(),
            disposeOnNavigation: getValueWithConfig(config.nzCloseOnNavigation, globalConfig.nzCloseOnNavigation, true),
            direction: getValueWithConfig(config.nzDirection, globalConfig.nzDirection, this.directionality.value)
        });
        return this.overlay.create(overlayConfig);
    }
    attachModalContainer(overlayRef, config) {
        const userInjector = config && config.nzViewContainerRef && config.nzViewContainerRef.injector;
        const injector = Injector.create({
            parent: userInjector || this.injector,
            providers: [
                { provide: OverlayRef, useValue: overlayRef },
                { provide: ModalOptions, useValue: config }
            ]
        });
        const ContainerComponent = config.nzModalType === 'confirm'
            ? // If the mode is `confirm`, use `NzModalConfirmContainerComponent`
                NzModalConfirmContainerComponent
            : // If the mode is not `confirm`, use `NzModalContainerComponent`
                NzModalContainerComponent;
        const containerPortal = new ComponentPortal(ContainerComponent, config.nzViewContainerRef, injector);
        const containerRef = overlayRef.attach(containerPortal);
        return containerRef.instance;
    }
    attachModalContent(componentOrTemplateRef, modalContainer, overlayRef, config) {
        const modalRef = new NzModalRef(overlayRef, config, modalContainer);
        if (componentOrTemplateRef instanceof TemplateRef) {
            modalContainer.attachTemplatePortal(new TemplatePortal(componentOrTemplateRef, null, {
                $implicit: config.nzData,
                modalRef
            }));
        }
        else if (isNotNil(componentOrTemplateRef) && typeof componentOrTemplateRef !== 'string') {
            const injector = this.createInjector(modalRef, config);
            const contentRef = modalContainer.attachComponentPortal(new ComponentPortal(componentOrTemplateRef, config.nzViewContainerRef, injector));
            modalRef.componentRef = contentRef;
            modalRef.componentInstance = contentRef.instance;
        }
        else {
            modalContainer.attachStringContent();
        }
        return modalRef;
    }
    createInjector(modalRef, config) {
        const userInjector = config && config.nzViewContainerRef && config.nzViewContainerRef.injector;
        return Injector.create({
            parent: userInjector || this.injector,
            providers: [
                { provide: NzModalRef, useValue: modalRef },
                { provide: NZ_MODAL_DATA, useValue: config.nzData }
            ]
        });
    }
    confirmFactory(options = {}, confirmType) {
        const iconMap = {
            info: 'info-circle',
            success: 'check-circle',
            error: 'close-circle',
            warning: 'exclamation-circle'
        };
        if (!('nzIconType' in options)) {
            options.nzIconType = iconMap[confirmType];
        }
        if (!('nzCancelText' in options)) {
            // Remove the Cancel button if the user not specify a Cancel button
            options.nzCancelText = null;
        }
        return this.confirm(options, confirmType);
    }
    ngOnDestroy() {
        this.closeModals(this.openModalsAtThisLevel);
        this.afterAllClosedAtThisLevel.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalService, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: i2$2.NzConfigService }, { token: i3$1.Directionality }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.Injector }, { type: i2$2.NzConfigService }, { type: i3$1.Directionality }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalContentDirective {
    templateRef;
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalContentDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzModalContentDirective, isStandalone: true, selector: "[nzModalContent]", exportAs: ["nzModalContent"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalContentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzModalContent]',
                    exportAs: 'nzModalContent'
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalFooterDirective {
    templateRef;
    nzModalRef = inject(NzModalRef, { optional: true });
    constructor(templateRef) {
        this.templateRef = templateRef;
        if (this.nzModalRef) {
            this.nzModalRef.updateConfig({
                nzFooter: this.templateRef
            });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalFooterDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzModalFooterDirective, isStandalone: true, selector: "[nzModalFooter]", exportAs: ["nzModalFooter"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalFooterDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzModalFooter]',
                    exportAs: 'nzModalFooter'
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalTitleDirective {
    templateRef;
    nzModalRef = inject(NzModalRef, { optional: true });
    constructor(templateRef) {
        this.templateRef = templateRef;
        if (this.nzModalRef) {
            this.nzModalRef.updateConfig({
                nzTitle: this.templateRef
            });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalTitleDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzModalTitleDirective, isStandalone: true, selector: "[nzModalTitle]", exportAs: ["nzModalTitle"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalTitleDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzModalTitle]',
                    exportAs: 'nzModalTitle'
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalComponent {
    cdr;
    modal;
    viewContainerRef;
    nzMask;
    nzMaskClosable;
    nzCloseOnNavigation;
    nzVisible = false;
    nzClosable = true;
    nzOkLoading = false;
    nzOkDisabled = false;
    nzCancelDisabled = false;
    nzCancelLoading = false;
    nzKeyboard = true;
    nzNoAnimation = false;
    nzCentered = false;
    nzDraggable = false;
    nzContent;
    nzFooter;
    nzZIndex = 1000;
    nzWidth = 520;
    nzWrapClassName;
    nzClassName;
    nzStyle;
    nzTitle;
    nzCloseIcon = 'close';
    nzMaskStyle;
    nzBodyStyle;
    nzOkText;
    nzCancelText;
    nzOkType = 'primary';
    nzOkDanger = false;
    nzIconType = 'question-circle'; // Confirm Modal ONLY
    nzModalType = 'default';
    nzAutofocus = 'auto';
    // TODO(@hsuanxyz) Input will not be supported
    nzOnOk = new EventEmitter();
    // TODO(@hsuanxyz) Input will not be supported
    nzOnCancel = new EventEmitter();
    nzAfterOpen = new EventEmitter();
    nzAfterClose = new EventEmitter();
    nzVisibleChange = new EventEmitter();
    set modalTitle(value) {
        if (value) {
            this.setTitleWithTemplate(value);
        }
    }
    contentFromContentChild;
    set modalFooter(value) {
        if (value) {
            this.setFooterWithTemplate(value);
        }
    }
    modalRef = null;
    destroy$ = new Subject();
    get afterOpen() {
        // Observable alias for nzAfterOpen
        return this.nzAfterOpen.asObservable();
    }
    get afterClose() {
        // Observable alias for nzAfterClose
        return this.nzAfterClose.asObservable();
    }
    constructor(cdr, modal, viewContainerRef) {
        this.cdr = cdr;
        this.modal = modal;
        this.viewContainerRef = viewContainerRef;
    }
    open() {
        if (!this.nzVisible) {
            this.nzVisible = true;
            this.nzVisibleChange.emit(true);
        }
        if (!this.modalRef) {
            const config = this.getConfig();
            this.modalRef = this.modal.create(config);
            // When the modal is implicitly closed (e.g. closeAll) the nzVisible needs to be set to the correct value and emit.
            this.modalRef.afterClose
                .asObservable()
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.close();
            });
        }
    }
    close(result) {
        if (this.nzVisible) {
            this.nzVisible = false;
            this.nzVisibleChange.emit(false);
        }
        if (this.modalRef) {
            this.modalRef.close(result);
            this.modalRef = null;
        }
    }
    destroy(result) {
        this.close(result);
    }
    triggerOk() {
        this.modalRef?.triggerOk();
    }
    triggerCancel() {
        this.modalRef?.triggerCancel();
    }
    getContentComponent() {
        return this.modalRef?.getContentComponent();
    }
    getElement() {
        return this.modalRef?.getElement();
    }
    getModalRef() {
        return this.modalRef;
    }
    setTitleWithTemplate(templateRef) {
        this.nzTitle = templateRef;
        if (this.modalRef) {
            // If modalRef already created, set the title in next tick
            Promise.resolve().then(() => {
                this.modalRef.updateConfig({
                    nzTitle: this.nzTitle
                });
            });
        }
    }
    setFooterWithTemplate(templateRef) {
        this.nzFooter = templateRef;
        if (this.modalRef) {
            // If modalRef already created, set the footer in next tick
            Promise.resolve().then(() => {
                this.modalRef.updateConfig({
                    nzFooter: this.nzFooter
                });
            });
        }
        this.cdr.markForCheck();
    }
    getConfig() {
        const componentConfig = getConfigFromComponent(this);
        componentConfig.nzViewContainerRef = this.viewContainerRef;
        componentConfig.nzContent = this.nzContent || this.contentFromContentChild;
        return componentConfig;
    }
    ngOnChanges(changes) {
        const { nzVisible, ...otherChanges } = changes;
        if (Object.keys(otherChanges).length && this.modalRef) {
            this.modalRef.updateConfig(getConfigFromComponent(this));
        }
        if (nzVisible) {
            if (this.nzVisible) {
                this.open();
            }
            else {
                this.close();
            }
        }
    }
    ngOnDestroy() {
        this.modalRef?._finishDialogClose();
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NzModalService }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzModalComponent, isStandalone: true, selector: "nz-modal", inputs: { nzMask: ["nzMask", "nzMask", booleanAttribute], nzMaskClosable: ["nzMaskClosable", "nzMaskClosable", booleanAttribute], nzCloseOnNavigation: ["nzCloseOnNavigation", "nzCloseOnNavigation", booleanAttribute], nzVisible: ["nzVisible", "nzVisible", booleanAttribute], nzClosable: ["nzClosable", "nzClosable", booleanAttribute], nzOkLoading: ["nzOkLoading", "nzOkLoading", booleanAttribute], nzOkDisabled: ["nzOkDisabled", "nzOkDisabled", booleanAttribute], nzCancelDisabled: ["nzCancelDisabled", "nzCancelDisabled", booleanAttribute], nzCancelLoading: ["nzCancelLoading", "nzCancelLoading", booleanAttribute], nzKeyboard: ["nzKeyboard", "nzKeyboard", booleanAttribute], nzNoAnimation: ["nzNoAnimation", "nzNoAnimation", booleanAttribute], nzCentered: ["nzCentered", "nzCentered", booleanAttribute], nzDraggable: ["nzDraggable", "nzDraggable", booleanAttribute], nzContent: "nzContent", nzFooter: "nzFooter", nzZIndex: ["nzZIndex", "nzZIndex", numberAttribute], nzWidth: "nzWidth", nzWrapClassName: "nzWrapClassName", nzClassName: "nzClassName", nzStyle: "nzStyle", nzTitle: "nzTitle", nzCloseIcon: "nzCloseIcon", nzMaskStyle: "nzMaskStyle", nzBodyStyle: "nzBodyStyle", nzOkText: "nzOkText", nzCancelText: "nzCancelText", nzOkType: "nzOkType", nzOkDanger: ["nzOkDanger", "nzOkDanger", booleanAttribute], nzIconType: "nzIconType", nzModalType: "nzModalType", nzAutofocus: "nzAutofocus", nzOnOk: "nzOnOk", nzOnCancel: "nzOnCancel" }, outputs: { nzOnOk: "nzOnOk", nzOnCancel: "nzOnCancel", nzAfterOpen: "nzAfterOpen", nzAfterClose: "nzAfterClose", nzVisibleChange: "nzVisibleChange" }, queries: [{ propertyName: "modalTitle", first: true, predicate: NzModalTitleDirective, descendants: true, read: TemplateRef, static: true }, { propertyName: "contentFromContentChild", first: true, predicate: NzModalContentDirective, descendants: true, read: TemplateRef, static: true }, { propertyName: "modalFooter", first: true, predicate: NzModalFooterDirective, descendants: true, read: TemplateRef, static: true }], exportAs: ["nzModal"], usesOnChanges: true, ngImport: i0, template: ``, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-modal',
                    exportAs: 'nzModal',
                    template: ``,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NzModalService }, { type: i0.ViewContainerRef }], propDecorators: { nzMask: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMaskClosable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCloseOnNavigation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzVisible: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClosable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOkLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOkDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCancelDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCancelLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzKeyboard: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNoAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCentered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDraggable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzContent: [{
                type: Input
            }], nzFooter: [{
                type: Input
            }], nzZIndex: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzWidth: [{
                type: Input
            }], nzWrapClassName: [{
                type: Input
            }], nzClassName: [{
                type: Input
            }], nzStyle: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzCloseIcon: [{
                type: Input
            }], nzMaskStyle: [{
                type: Input
            }], nzBodyStyle: [{
                type: Input
            }], nzOkText: [{
                type: Input
            }], nzCancelText: [{
                type: Input
            }], nzOkType: [{
                type: Input
            }], nzOkDanger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIconType: [{
                type: Input
            }], nzModalType: [{
                type: Input
            }], nzAutofocus: [{
                type: Input
            }], nzOnOk: [{
                type: Input
            }, {
                type: Output
            }], nzOnCancel: [{
                type: Input
            }, {
                type: Output
            }], nzAfterOpen: [{
                type: Output
            }], nzAfterClose: [{
                type: Output
            }], nzVisibleChange: [{
                type: Output
            }], modalTitle: [{
                type: ContentChild,
                args: [NzModalTitleDirective, { static: true, read: TemplateRef }]
            }], contentFromContentChild: [{
                type: ContentChild,
                args: [NzModalContentDirective, { static: true, read: TemplateRef }]
            }], modalFooter: [{
                type: ContentChild,
                args: [NzModalFooterDirective, { static: true, read: TemplateRef }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzModalModule, imports: [NzModalComponent,
            NzModalFooterDirective,
            NzModalContentDirective,
            NzModalCloseComponent,
            NzModalFooterComponent,
            NzModalTitleComponent,
            NzModalTitleDirective,
            NzModalContainerComponent,
            NzModalConfirmContainerComponent], exports: [NzModalComponent, NzModalFooterDirective, NzModalContentDirective, NzModalTitleDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalModule, providers: [NzModalService], imports: [NzModalCloseComponent,
            NzModalFooterComponent,
            NzModalTitleComponent,
            NzModalContainerComponent,
            NzModalConfirmContainerComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzModalModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzModalComponent,
                        NzModalFooterDirective,
                        NzModalContentDirective,
                        NzModalCloseComponent,
                        NzModalFooterComponent,
                        NzModalTitleComponent,
                        NzModalTitleDirective,
                        NzModalContainerComponent,
                        NzModalConfirmContainerComponent
                    ],
                    exports: [NzModalComponent, NzModalFooterDirective, NzModalContentDirective, NzModalTitleDirective],
                    providers: [NzModalService]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzModalLegacyAPI {
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { BaseModalContainerComponent, FADE_CLASS_NAME_MAP, MODAL_MASK_CLASS_NAME, ModalOptions, NZ_CONFIG_MODULE_NAME, NZ_MODAL_DATA, NzModalCloseComponent, NzModalComponent, NzModalConfirmContainerComponent, NzModalContainerComponent, NzModalContentDirective, NzModalFooterComponent, NzModalFooterDirective, NzModalLegacyAPI, NzModalModule, NzModalRef, NzModalService, NzModalTitleComponent, NzModalTitleDirective, ZOOM_CLASS_NAME_MAP, applyConfigDefaults, getConfigFromComponent, getValueWithConfig, nzModalAnimations, throwNzModalContentAlreadyAttachedError };
//# sourceMappingURL=ng-zorro-antd-modal.mjs.map
