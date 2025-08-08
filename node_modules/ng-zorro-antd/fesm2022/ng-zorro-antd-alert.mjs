import { __esDecorate, __runInitializers } from 'tslib';
import * as i0 from '@angular/core';
import { EventEmitter, booleanAttribute, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { slideAlertMotion } from 'ng-zorro-antd/core/animation';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i4 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i3 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME = 'alert';
let NzAlertComponent = (() => {
    let _nzCloseable_decorators;
    let _nzCloseable_initializers = [];
    let _nzCloseable_extraInitializers = [];
    let _nzShowIcon_decorators;
    let _nzShowIcon_initializers = [];
    let _nzShowIcon_extraInitializers = [];
    return class NzAlertComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzCloseable_decorators = [WithConfig()];
            _nzShowIcon_decorators = [WithConfig()];
            __esDecorate(null, null, _nzCloseable_decorators, { kind: "field", name: "nzCloseable", static: false, private: false, access: { has: obj => "nzCloseable" in obj, get: obj => obj.nzCloseable, set: (obj, value) => { obj.nzCloseable = value; } }, metadata: _metadata }, _nzCloseable_initializers, _nzCloseable_extraInitializers);
            __esDecorate(null, null, _nzShowIcon_decorators, { kind: "field", name: "nzShowIcon", static: false, private: false, access: { has: obj => "nzShowIcon" in obj, get: obj => obj.nzShowIcon, set: (obj, value) => { obj.nzShowIcon = value; } }, metadata: _metadata }, _nzShowIcon_initializers, _nzShowIcon_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzAction = null;
        nzCloseText = null;
        nzIconType = null;
        nzMessage = null;
        nzDescription = null;
        nzType = 'info';
        nzCloseable = __runInitializers(this, _nzCloseable_initializers, false);
        nzShowIcon = (__runInitializers(this, _nzCloseable_extraInitializers), __runInitializers(this, _nzShowIcon_initializers, false));
        nzBanner = (__runInitializers(this, _nzShowIcon_extraInitializers), false);
        nzNoAnimation = false;
        nzIcon = null;
        nzOnClose = new EventEmitter();
        closed = false;
        iconTheme = 'fill';
        inferredIconType = 'info-circle';
        dir = 'ltr';
        isTypeSet = false;
        isShowIconSet = false;
        destroy$ = new Subject();
        constructor(nzConfigService, cdr, directionality) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.directionality = directionality;
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.cdr.markForCheck();
            });
        }
        ngOnInit() {
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
        }
        closeAlert() {
            this.closed = true;
        }
        onFadeAnimationDone() {
            if (this.closed) {
                this.nzOnClose.emit(true);
            }
        }
        ngOnChanges(changes) {
            const { nzShowIcon, nzDescription, nzType, nzBanner } = changes;
            if (nzShowIcon) {
                this.isShowIconSet = true;
            }
            if (nzType) {
                this.isTypeSet = true;
                switch (this.nzType) {
                    case 'error':
                        this.inferredIconType = 'close-circle';
                        break;
                    case 'success':
                        this.inferredIconType = 'check-circle';
                        break;
                    case 'info':
                        this.inferredIconType = 'info-circle';
                        break;
                    case 'warning':
                        this.inferredIconType = 'exclamation-circle';
                        break;
                }
            }
            if (nzDescription) {
                this.iconTheme = this.nzDescription ? 'outline' : 'fill';
            }
            if (nzBanner) {
                if (!this.isTypeSet) {
                    this.nzType = 'warning';
                }
                if (!this.isShowIconSet) {
                    this.nzShowIcon = true;
                }
            }
        }
        ngOnDestroy() {
            this.destroy$.next(true);
            this.destroy$.complete();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAlertComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzAlertComponent, isStandalone: true, selector: "nz-alert", inputs: { nzAction: "nzAction", nzCloseText: "nzCloseText", nzIconType: "nzIconType", nzMessage: "nzMessage", nzDescription: "nzDescription", nzType: "nzType", nzCloseable: ["nzCloseable", "nzCloseable", booleanAttribute], nzShowIcon: ["nzShowIcon", "nzShowIcon", booleanAttribute], nzBanner: ["nzBanner", "nzBanner", booleanAttribute], nzNoAnimation: ["nzNoAnimation", "nzNoAnimation", booleanAttribute], nzIcon: "nzIcon" }, outputs: { nzOnClose: "nzOnClose" }, exportAs: ["nzAlert"], usesOnChanges: true, ngImport: i0, template: `
    @if (!closed) {
      <div
        class="ant-alert"
        [class.ant-alert-rtl]="dir === 'rtl'"
        [class.ant-alert-success]="nzType === 'success'"
        [class.ant-alert-info]="nzType === 'info'"
        [class.ant-alert-warning]="nzType === 'warning'"
        [class.ant-alert-error]="nzType === 'error'"
        [class.ant-alert-no-icon]="!nzShowIcon"
        [class.ant-alert-banner]="nzBanner"
        [class.ant-alert-closable]="nzCloseable"
        [class.ant-alert-with-description]="!!nzDescription"
        [@.disabled]="nzNoAnimation"
        [@slideAlertMotion]
        (@slideAlertMotion.done)="onFadeAnimationDone()"
      >
        @if (nzShowIcon) {
          <div class="ant-alert-icon">
            @if (nzIcon) {
              <ng-container *nzStringTemplateOutlet="nzIcon"></ng-container>
            } @else {
              <nz-icon [nzType]="nzIconType || inferredIconType" [nzTheme]="iconTheme" />
            }
          </div>
        }

        @if (nzMessage || nzDescription) {
          <div class="ant-alert-content">
            @if (nzMessage) {
              <span class="ant-alert-message">
                <ng-container *nzStringTemplateOutlet="nzMessage">{{ nzMessage }}</ng-container>
              </span>
            }
            @if (nzDescription) {
              <span class="ant-alert-description">
                <ng-container *nzStringTemplateOutlet="nzDescription">{{ nzDescription }}</ng-container>
              </span>
            }
          </div>
        }

        @if (nzAction) {
          <div class="ant-alert-action">
            <ng-container *nzStringTemplateOutlet="nzAction">{{ nzAction }}</ng-container>
          </div>
        }

        @if (nzCloseable || nzCloseText) {
          <button type="button" tabindex="0" class="ant-alert-close-icon" (click)="closeAlert()">
            @if (nzCloseText) {
              <ng-container *nzStringTemplateOutlet="nzCloseText">
                <span class="ant-alert-close-text">{{ nzCloseText }}</span>
              </ng-container>
            } @else {
              <nz-icon nzType="close" />
            }
          </button>
        }
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i3.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i4.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [slideAlertMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAlertComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-alert',
                    exportAs: 'nzAlert',
                    animations: [slideAlertMotion],
                    imports: [NzIconModule, NzOutletModule],
                    template: `
    @if (!closed) {
      <div
        class="ant-alert"
        [class.ant-alert-rtl]="dir === 'rtl'"
        [class.ant-alert-success]="nzType === 'success'"
        [class.ant-alert-info]="nzType === 'info'"
        [class.ant-alert-warning]="nzType === 'warning'"
        [class.ant-alert-error]="nzType === 'error'"
        [class.ant-alert-no-icon]="!nzShowIcon"
        [class.ant-alert-banner]="nzBanner"
        [class.ant-alert-closable]="nzCloseable"
        [class.ant-alert-with-description]="!!nzDescription"
        [@.disabled]="nzNoAnimation"
        [@slideAlertMotion]
        (@slideAlertMotion.done)="onFadeAnimationDone()"
      >
        @if (nzShowIcon) {
          <div class="ant-alert-icon">
            @if (nzIcon) {
              <ng-container *nzStringTemplateOutlet="nzIcon"></ng-container>
            } @else {
              <nz-icon [nzType]="nzIconType || inferredIconType" [nzTheme]="iconTheme" />
            }
          </div>
        }

        @if (nzMessage || nzDescription) {
          <div class="ant-alert-content">
            @if (nzMessage) {
              <span class="ant-alert-message">
                <ng-container *nzStringTemplateOutlet="nzMessage">{{ nzMessage }}</ng-container>
              </span>
            }
            @if (nzDescription) {
              <span class="ant-alert-description">
                <ng-container *nzStringTemplateOutlet="nzDescription">{{ nzDescription }}</ng-container>
              </span>
            }
          </div>
        }

        @if (nzAction) {
          <div class="ant-alert-action">
            <ng-container *nzStringTemplateOutlet="nzAction">{{ nzAction }}</ng-container>
          </div>
        }

        @if (nzCloseable || nzCloseText) {
          <button type="button" tabindex="0" class="ant-alert-close-icon" (click)="closeAlert()">
            @if (nzCloseText) {
              <ng-container *nzStringTemplateOutlet="nzCloseText">
                <span class="ant-alert-close-text">{{ nzCloseText }}</span>
              </ng-container>
            } @else {
              <nz-icon nzType="close" />
            }
          </button>
        }
      </div>
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality }], propDecorators: { nzAction: [{
                type: Input
            }], nzCloseText: [{
                type: Input
            }], nzIconType: [{
                type: Input
            }], nzMessage: [{
                type: Input
            }], nzDescription: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzCloseable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowIcon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBanner: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNoAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIcon: [{
                type: Input
            }], nzOnClose: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzAlertModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAlertModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzAlertModule, imports: [NzAlertComponent], exports: [NzAlertComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAlertModule, imports: [NzAlertComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAlertModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [NzAlertComponent],
                    imports: [NzAlertComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzAlertComponent, NzAlertModule };
//# sourceMappingURL=ng-zorro-antd-alert.mjs.map
