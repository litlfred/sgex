import { __esDecorate, __runInitializers } from 'tslib';
import * as i3 from '@angular/cdk/a11y';
import { A11yModule } from '@angular/cdk/a11y';
import * as i1 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import * as i0 from '@angular/core';
import { EventEmitter, booleanAttribute, Output, Input, Directive, inject, ElementRef, ViewChildren, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, first, finalize } from 'rxjs/operators';
import * as i6 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i4 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from 'ng-zorro-antd/core/overlay';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { wrapIntoObservable } from 'ng-zorro-antd/core/util';
import * as i9 from 'ng-zorro-antd/i18n';
import { NzI18nModule } from 'ng-zorro-antd/i18n';
import * as i5 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipBaseDirective, NzToolTipComponent } from 'ng-zorro-antd/tooltip';
import * as i7 from 'ng-zorro-antd/core/transition-patch';
import * as i8 from 'ng-zorro-antd/core/wave';

const NZ_CONFIG_MODULE_NAME = 'popconfirm';
let NzPopconfirmDirective = (() => {
    let _classSuper = NzTooltipBaseDirective;
    let _nzPopconfirmBackdrop_decorators;
    let _nzPopconfirmBackdrop_initializers = [];
    let _nzPopconfirmBackdrop_extraInitializers = [];
    let _nzAutofocus_decorators;
    let _nzAutofocus_initializers = [];
    let _nzAutofocus_extraInitializers = [];
    return class NzPopconfirmDirective extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _nzPopconfirmBackdrop_decorators = [WithConfig()];
            _nzAutofocus_decorators = [WithConfig()];
            __esDecorate(null, null, _nzPopconfirmBackdrop_decorators, { kind: "field", name: "nzPopconfirmBackdrop", static: false, private: false, access: { has: obj => "nzPopconfirmBackdrop" in obj, get: obj => obj.nzPopconfirmBackdrop, set: (obj, value) => { obj.nzPopconfirmBackdrop = value; } }, metadata: _metadata }, _nzPopconfirmBackdrop_initializers, _nzPopconfirmBackdrop_extraInitializers);
            __esDecorate(null, null, _nzAutofocus_decorators, { kind: "field", name: "nzAutofocus", static: false, private: false, access: { has: obj => "nzAutofocus" in obj, get: obj => obj.nzAutofocus, set: (obj, value) => { obj.nzAutofocus = value; } }, metadata: _metadata }, _nzAutofocus_initializers, _nzAutofocus_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        /* eslint-disable @angular-eslint/no-input-rename, @angular-eslint/no-output-rename */
        arrowPointAtCenter;
        title;
        titleContext = null;
        directiveTitle;
        trigger = 'click';
        placement = 'top';
        origin;
        mouseEnterDelay;
        mouseLeaveDelay;
        overlayClassName;
        overlayStyle;
        visible;
        nzOkText;
        nzOkType;
        nzOkDisabled;
        nzOkDanger;
        nzCancelText;
        nzBeforeConfirm;
        nzIcon;
        nzCondition = false;
        nzPopconfirmShowArrow = true;
        nzPopconfirmBackdrop = __runInitializers(this, _nzPopconfirmBackdrop_initializers, false);
        nzAutofocus = (__runInitializers(this, _nzPopconfirmBackdrop_extraInitializers), __runInitializers(this, _nzAutofocus_initializers, null));
        directiveContent = (__runInitializers(this, _nzAutofocus_extraInitializers), null);
        content = null;
        overlayClickable;
        visibleChange = new EventEmitter();
        nzOnCancel = new EventEmitter();
        nzOnConfirm = new EventEmitter();
        getProxyPropertyMap() {
            return {
                nzOkText: ['nzOkText', () => this.nzOkText],
                nzOkType: ['nzOkType', () => this.nzOkType],
                nzOkDanger: ['nzOkDanger', () => this.nzOkDanger],
                nzOkDisabled: ['nzOkDisabled', () => this.nzOkDisabled],
                nzCancelText: ['nzCancelText', () => this.nzCancelText],
                nzBeforeConfirm: ['nzBeforeConfirm', () => this.nzBeforeConfirm],
                nzCondition: ['nzCondition', () => this.nzCondition],
                nzIcon: ['nzIcon', () => this.nzIcon],
                nzPopconfirmShowArrow: ['nzPopconfirmShowArrow', () => this.nzPopconfirmShowArrow],
                nzPopconfirmBackdrop: ['nzBackdrop', () => this.nzPopconfirmBackdrop],
                nzPopconfirmContext: ['nzTitleContext', () => this.titleContext],
                nzAutoFocus: ['nzAutoFocus', () => this.nzAutofocus],
                ...super.getProxyPropertyMap()
            };
        }
        constructor() {
            super(NzPopconfirmComponent);
        }
        /**
         * @override
         */
        createComponent() {
            super.createComponent();
            this.component.nzOnCancel.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.nzOnCancel.emit();
            });
            this.component.nzOnConfirm.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.nzOnConfirm.emit();
            });
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
        static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzPopconfirmDirective, isStandalone: true, selector: "[nz-popconfirm]", inputs: { arrowPointAtCenter: ["nzPopconfirmArrowPointAtCenter", "arrowPointAtCenter", booleanAttribute], title: ["nzPopconfirmTitle", "title"], titleContext: ["nzPopconfirmTitleContext", "titleContext"], directiveTitle: ["nz-popconfirm", "directiveTitle"], trigger: ["nzPopconfirmTrigger", "trigger"], placement: ["nzPopconfirmPlacement", "placement"], origin: ["nzPopconfirmOrigin", "origin"], mouseEnterDelay: ["nzPopconfirmMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzPopconfirmMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzPopconfirmOverlayClassName", "overlayClassName"], overlayStyle: ["nzPopconfirmOverlayStyle", "overlayStyle"], visible: ["nzPopconfirmVisible", "visible"], nzOkText: "nzOkText", nzOkType: "nzOkType", nzOkDisabled: ["nzOkDisabled", "nzOkDisabled", booleanAttribute], nzOkDanger: ["nzOkDanger", "nzOkDanger", booleanAttribute], nzCancelText: "nzCancelText", nzBeforeConfirm: "nzBeforeConfirm", nzIcon: "nzIcon", nzCondition: ["nzCondition", "nzCondition", booleanAttribute], nzPopconfirmShowArrow: ["nzPopconfirmShowArrow", "nzPopconfirmShowArrow", booleanAttribute], nzPopconfirmBackdrop: "nzPopconfirmBackdrop", nzAutofocus: "nzAutofocus" }, outputs: { visibleChange: "nzPopconfirmVisibleChange", nzOnCancel: "nzOnCancel", nzOnConfirm: "nzOnConfirm" }, host: { properties: { "class.ant-popover-open": "visible" } }, exportAs: ["nzPopconfirm"], usesInheritance: true, ngImport: i0 });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-popconfirm]',
                    exportAs: 'nzPopconfirm',
                    host: {
                        '[class.ant-popover-open]': 'visible'
                    }
                }]
        }], ctorParameters: () => [], propDecorators: { arrowPointAtCenter: [{
                type: Input,
                args: [{ alias: 'nzPopconfirmArrowPointAtCenter', transform: booleanAttribute }]
            }], title: [{
                type: Input,
                args: ['nzPopconfirmTitle']
            }], titleContext: [{
                type: Input,
                args: ['nzPopconfirmTitleContext']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-popconfirm']
            }], trigger: [{
                type: Input,
                args: ['nzPopconfirmTrigger']
            }], placement: [{
                type: Input,
                args: ['nzPopconfirmPlacement']
            }], origin: [{
                type: Input,
                args: ['nzPopconfirmOrigin']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzPopconfirmMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzPopconfirmMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzPopconfirmOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzPopconfirmOverlayStyle']
            }], visible: [{
                type: Input,
                args: ['nzPopconfirmVisible']
            }], nzOkText: [{
                type: Input
            }], nzOkType: [{
                type: Input
            }], nzOkDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOkDanger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCancelText: [{
                type: Input
            }], nzBeforeConfirm: [{
                type: Input
            }], nzIcon: [{
                type: Input
            }], nzCondition: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzPopconfirmShowArrow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzPopconfirmBackdrop: [{
                type: Input
            }], nzAutofocus: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzPopconfirmVisibleChange']
            }], nzOnCancel: [{
                type: Output
            }], nzOnConfirm: [{
                type: Output
            }] } });
class NzPopconfirmComponent extends NzToolTipComponent {
    elementRef;
    okBtn;
    cancelBtn;
    nzCancelText;
    nzCondition = false;
    nzPopconfirmShowArrow = true;
    nzIcon;
    nzOkText;
    nzOkType = 'primary';
    nzOkDanger = false;
    nzOkDisabled = false;
    nzAutoFocus = null;
    nzBeforeConfirm = null;
    nzOnCancel = new Subject();
    nzOnConfirm = new Subject();
    _trigger = 'click';
    elementFocusedBeforeModalWasOpened = null;
    document = inject(DOCUMENT);
    _prefix = 'ant-popover';
    confirmLoading = false;
    constructor(elementRef) {
        super();
        this.elementRef = elementRef;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.nzOnCancel.complete();
        this.nzOnConfirm.complete();
    }
    /**
     * @override
     */
    show() {
        if (!this.nzCondition) {
            this.capturePreviouslyFocusedElement();
            super.show();
        }
        else {
            this.onConfirm();
        }
    }
    hide() {
        super.hide();
        this.restoreFocus();
    }
    handleConfirm() {
        this.nzOnConfirm.next();
        super.hide();
    }
    onCancel() {
        this.nzOnCancel.next();
        super.hide();
    }
    onConfirm() {
        if (this.nzBeforeConfirm) {
            const observable = wrapIntoObservable(this.nzBeforeConfirm()).pipe(first());
            this.confirmLoading = true;
            observable
                .pipe(finalize(() => {
                this.confirmLoading = false;
                this.cdr.markForCheck();
            }), takeUntil(this.nzVisibleChange), takeUntil(this.destroy$))
                .subscribe(value => {
                if (value) {
                    this.handleConfirm();
                }
            });
        }
        else {
            this.handleConfirm();
        }
    }
    capturePreviouslyFocusedElement() {
        if (this.document) {
            this.elementFocusedBeforeModalWasOpened = this.document.activeElement;
        }
    }
    restoreFocus() {
        const toFocus = this.elementFocusedBeforeModalWasOpened;
        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            const activeElement = this.document.activeElement;
            const element = this.elementRef.nativeElement;
            if (!activeElement ||
                activeElement === this.document.body ||
                activeElement === element ||
                element.contains(activeElement)) {
                toFocus.focus();
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzPopconfirmComponent, isStandalone: true, selector: "nz-popconfirm", viewQueries: [{ propertyName: "okBtn", predicate: ["okBtn"], descendants: true, read: ElementRef }, { propertyName: "cancelBtn", predicate: ["cancelBtn"], descendants: true, read: ElementRef }], exportAs: ["nzPopconfirmComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
    >
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="nzAutoFocus !== null"
        class="ant-popover"
        [class]="_classMap"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          @if (nzPopconfirmShowArrow) {
            <div class="ant-popover-arrow">
              <span class="ant-popover-arrow-content"></span>
            </div>
          }
          <div class="ant-popover-inner">
            <div>
              <div class="ant-popover-inner-content">
                <div class="ant-popover-message">
                  <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">
                    <ng-container *nzStringTemplateOutlet="nzIcon; let icon">
                      <span class="ant-popover-message-icon">
                        <nz-icon [nzType]="icon || 'exclamation-circle'" nzTheme="fill" />
                      </span>
                    </ng-container>
                    <div class="ant-popover-message-title">{{ nzTitle }}</div>
                  </ng-container>
                </div>
                <div class="ant-popover-buttons">
                  <button
                    nz-button
                    #cancelBtn
                    [nzSize]="'small'"
                    (click)="onCancel()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'cancel' || null"
                  >
                    @if (nzCancelText) {
                      {{ nzCancelText }}
                    } @else {
                      {{ 'Modal.cancelText' | nzI18n }}
                    }
                  </button>
                  <button
                    nz-button
                    #okBtn
                    [nzSize]="'small'"
                    [nzType]="nzOkType !== 'danger' ? nzOkType : 'primary'"
                    [nzDanger]="nzOkDanger || nzOkType === 'danger'"
                    [nzLoading]="confirmLoading"
                    [disabled]="nzOkDisabled"
                    (click)="onConfirm()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'ok' || null"
                  >
                    @if (nzOkText) {
                      {{ nzOkText }}
                    } @else {
                      {{ 'Modal.okText' | nzI18n }}
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i2.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }, { kind: "ngmodule", type: A11yModule }, { kind: "directive", type: i3.CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i4.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i6.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i7.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i8.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzI18nModule }, { kind: "pipe", type: i9.NzI18nPipe, name: "nzI18n" }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-popconfirm',
                    exportAs: 'nzPopconfirmComponent',
                    preserveWhitespaces: false,
                    animations: [zoomBigMotion],
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
    >
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="nzAutoFocus !== null"
        class="ant-popover"
        [class]="_classMap"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          @if (nzPopconfirmShowArrow) {
            <div class="ant-popover-arrow">
              <span class="ant-popover-arrow-content"></span>
            </div>
          }
          <div class="ant-popover-inner">
            <div>
              <div class="ant-popover-inner-content">
                <div class="ant-popover-message">
                  <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">
                    <ng-container *nzStringTemplateOutlet="nzIcon; let icon">
                      <span class="ant-popover-message-icon">
                        <nz-icon [nzType]="icon || 'exclamation-circle'" nzTheme="fill" />
                      </span>
                    </ng-container>
                    <div class="ant-popover-message-title">{{ nzTitle }}</div>
                  </ng-container>
                </div>
                <div class="ant-popover-buttons">
                  <button
                    nz-button
                    #cancelBtn
                    [nzSize]="'small'"
                    (click)="onCancel()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'cancel' || null"
                  >
                    @if (nzCancelText) {
                      {{ nzCancelText }}
                    } @else {
                      {{ 'Modal.cancelText' | nzI18n }}
                    }
                  </button>
                  <button
                    nz-button
                    #okBtn
                    [nzSize]="'small'"
                    [nzType]="nzOkType !== 'danger' ? nzOkType : 'primary'"
                    [nzDanger]="nzOkDanger || nzOkType === 'danger'"
                    [nzLoading]="confirmLoading"
                    [disabled]="nzOkDisabled"
                    (click)="onConfirm()"
                    [attr.cdkFocusInitial]="nzAutoFocus === 'ok' || null"
                  >
                    @if (nzOkText) {
                      {{ nzOkText }}
                    } @else {
                      {{ 'Modal.okText' | nzI18n }}
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    imports: [
                        OverlayModule,
                        NzOverlayModule,
                        A11yModule,
                        NzNoAnimationDirective,
                        NzOutletModule,
                        NzIconModule,
                        NzButtonModule,
                        NzI18nModule
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { okBtn: [{
                type: ViewChildren,
                args: ['okBtn', { read: ElementRef }]
            }], cancelBtn: [{
                type: ViewChildren,
                args: ['cancelBtn', { read: ElementRef }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzPopconfirmModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmModule, imports: [NzPopconfirmComponent, NzPopconfirmDirective], exports: [NzPopconfirmComponent, NzPopconfirmDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmModule, imports: [NzPopconfirmComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopconfirmModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzPopconfirmComponent, NzPopconfirmDirective],
                    exports: [NzPopconfirmComponent, NzPopconfirmDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzPopconfirmComponent, NzPopconfirmDirective, NzPopconfirmModule };
//# sourceMappingURL=ng-zorro-antd-popconfirm.mjs.map
