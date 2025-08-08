import { __esDecorate, __runInitializers } from 'tslib';
import * as i1 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import * as i0 from '@angular/core';
import { EventEmitter, booleanAttribute, Output, Input, Directive, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from 'ng-zorro-antd/core/overlay';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { NzTooltipBaseDirective, NzToolTipComponent, isTooltipEmpty } from 'ng-zorro-antd/tooltip';

const NZ_CONFIG_MODULE_NAME = 'popover';
let NzPopoverDirective = (() => {
    let _classSuper = NzTooltipBaseDirective;
    let _nzPopoverBackdrop_decorators;
    let _nzPopoverBackdrop_initializers = [];
    let _nzPopoverBackdrop_extraInitializers = [];
    return class NzPopoverDirective extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _nzPopoverBackdrop_decorators = [WithConfig()];
            __esDecorate(null, null, _nzPopoverBackdrop_decorators, { kind: "field", name: "nzPopoverBackdrop", static: false, private: false, access: { has: obj => "nzPopoverBackdrop" in obj, get: obj => obj.nzPopoverBackdrop, set: (obj, value) => { obj.nzPopoverBackdrop = value; } }, metadata: _metadata }, _nzPopoverBackdrop_initializers, _nzPopoverBackdrop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        /* eslint-disable @angular-eslint/no-input-rename, @angular-eslint/no-output-rename */
        arrowPointAtCenter;
        title;
        content;
        directiveTitle;
        trigger = 'hover';
        placement = 'top';
        origin;
        visible;
        mouseEnterDelay;
        mouseLeaveDelay;
        overlayClassName;
        overlayStyle;
        overlayClickable;
        directiveContent = null;
        nzPopoverBackdrop = __runInitializers(this, _nzPopoverBackdrop_initializers, false);
        visibleChange = (__runInitializers(this, _nzPopoverBackdrop_extraInitializers), new EventEmitter());
        getProxyPropertyMap() {
            return {
                nzPopoverBackdrop: ['nzBackdrop', () => this.nzPopoverBackdrop],
                ...super.getProxyPropertyMap()
            };
        }
        constructor() {
            super(NzPopoverComponent);
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
        static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzPopoverDirective, isStandalone: true, selector: "[nz-popover]", inputs: { arrowPointAtCenter: ["nzPopoverArrowPointAtCenter", "arrowPointAtCenter", booleanAttribute], title: ["nzPopoverTitle", "title"], content: ["nzPopoverContent", "content"], directiveTitle: ["nz-popover", "directiveTitle"], trigger: ["nzPopoverTrigger", "trigger"], placement: ["nzPopoverPlacement", "placement"], origin: ["nzPopoverOrigin", "origin"], visible: ["nzPopoverVisible", "visible"], mouseEnterDelay: ["nzPopoverMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzPopoverMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzPopoverOverlayClassName", "overlayClassName"], overlayStyle: ["nzPopoverOverlayStyle", "overlayStyle"], overlayClickable: ["nzPopoverOverlayClickable", "overlayClickable"], nzPopoverBackdrop: "nzPopoverBackdrop" }, outputs: { visibleChange: "nzPopoverVisibleChange" }, host: { properties: { "class.ant-popover-open": "visible" } }, exportAs: ["nzPopover"], usesInheritance: true, ngImport: i0 });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-popover]',
                    exportAs: 'nzPopover',
                    host: {
                        '[class.ant-popover-open]': 'visible'
                    }
                }]
        }], ctorParameters: () => [], propDecorators: { arrowPointAtCenter: [{
                type: Input,
                args: [{ alias: 'nzPopoverArrowPointAtCenter', transform: booleanAttribute }]
            }], title: [{
                type: Input,
                args: ['nzPopoverTitle']
            }], content: [{
                type: Input,
                args: ['nzPopoverContent']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-popover']
            }], trigger: [{
                type: Input,
                args: ['nzPopoverTrigger']
            }], placement: [{
                type: Input,
                args: ['nzPopoverPlacement']
            }], origin: [{
                type: Input,
                args: ['nzPopoverOrigin']
            }], visible: [{
                type: Input,
                args: ['nzPopoverVisible']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzPopoverMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzPopoverMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzPopoverOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzPopoverOverlayStyle']
            }], overlayClickable: [{
                type: Input,
                args: ['nzPopoverOverlayClickable']
            }], nzPopoverBackdrop: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzPopoverVisibleChange']
            }] } });
class NzPopoverComponent extends NzToolTipComponent {
    _prefix = 'ant-popover';
    get hasBackdrop() {
        return this.nzTrigger === 'click' ? this.nzBackdrop : false;
    }
    isEmpty() {
        return isTooltipEmpty(this.nzTitle) && isTooltipEmpty(this.nzContent);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzPopoverComponent, isStandalone: true, selector: "nz-popover", exportAs: ["nzPopoverComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-popover"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [class]="_classMap"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          <div class="ant-popover-arrow">
            <span class="ant-popover-arrow-content"></span>
          </div>
          <div class="ant-popover-inner" role="tooltip">
            <div>
              @if (nzTitle) {
                <div class="ant-popover-title">
                  <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                </div>
              }
              <div class="ant-popover-inner-content">
                <ng-container *nzStringTemplateOutlet="nzContent">{{ nzContent }}</ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i2.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-popover',
                    exportAs: 'nzPopoverComponent',
                    animations: [zoomBigMotion],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-popover"
        [class.ant-popover-rtl]="dir === 'rtl'"
        [class]="_classMap"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-popover-content">
          <div class="ant-popover-arrow">
            <span class="ant-popover-arrow-content"></span>
          </div>
          <div class="ant-popover-inner" role="tooltip">
            <div>
              @if (nzTitle) {
                <div class="ant-popover-title">
                  <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                </div>
              }
              <div class="ant-popover-inner-content">
                <ng-container *nzStringTemplateOutlet="nzContent">{{ nzContent }}</ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    imports: [OverlayModule, NzOverlayModule, NzNoAnimationDirective, NzOutletModule]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzPopoverModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverModule, imports: [NzPopoverDirective, NzPopoverComponent], exports: [NzPopoverDirective, NzPopoverComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverModule, imports: [NzPopoverComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzPopoverModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzPopoverDirective, NzPopoverComponent],
                    exports: [NzPopoverDirective, NzPopoverComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzPopoverComponent, NzPopoverDirective, NzPopoverModule };
//# sourceMappingURL=ng-zorro-antd-popover.mjs.map
