import { __esDecorate, __runInitializers } from 'tslib';
import * as i3 from '@angular/cdk/platform';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { EventEmitter, inject, numberAttribute, ViewChild, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { fadeMotion } from 'ng-zorro-antd/core/animation';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i2 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i5 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i4 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME = 'backTop';
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
let NzBackTopComponent = (() => {
    let _nzVisibilityHeight_decorators;
    let _nzVisibilityHeight_initializers = [];
    let _nzVisibilityHeight_extraInitializers = [];
    return class NzBackTopComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzVisibilityHeight_decorators = [WithConfig()];
            __esDecorate(null, null, _nzVisibilityHeight_decorators, { kind: "field", name: "nzVisibilityHeight", static: false, private: false, access: { has: obj => "nzVisibilityHeight" in obj, get: obj => obj.nzVisibilityHeight, set: (obj, value) => { obj.nzVisibilityHeight = value; } }, metadata: _metadata }, _nzVisibilityHeight_initializers, _nzVisibilityHeight_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        scrollSrv;
        platform;
        zone;
        cdr;
        destroy$;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        scrollListenerDestroy$ = new Subject();
        target = null;
        visible = false;
        dir = 'ltr';
        nzTemplate;
        nzVisibilityHeight = __runInitializers(this, _nzVisibilityHeight_initializers, 400);
        nzTarget = __runInitializers(this, _nzVisibilityHeight_extraInitializers);
        nzDuration = 450;
        nzClick = new EventEmitter();
        set backTop(backTop) {
            if (backTop) {
                this.backTopClickSubscription.unsubscribe();
                this.backTopClickSubscription = fromEventOutsideAngular(backTop.nativeElement, 'click')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                    this.scrollSrv.scrollTo(this.getTarget(), 0, { duration: this.nzDuration });
                    if (this.nzClick.observers.length) {
                        this.zone.run(() => this.nzClick.emit(true));
                    }
                });
            }
        }
        backTopClickSubscription = Subscription.EMPTY;
        doc = inject(DOCUMENT);
        constructor(nzConfigService, scrollSrv, platform, zone, cdr, destroy$, directionality) {
            this.nzConfigService = nzConfigService;
            this.scrollSrv = scrollSrv;
            this.platform = platform;
            this.zone = zone;
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
            this.scrollListenerDestroy$.next(true);
            this.handleScroll();
            fromEventOutsideAngular(this.getTarget(), 'scroll', passiveEventListenerOptions)
                .pipe(debounceTime(50), takeUntil(this.scrollListenerDestroy$))
                .subscribe(() => this.handleScroll());
        }
        ngOnDestroy() {
            this.scrollListenerDestroy$.next(true);
            this.scrollListenerDestroy$.complete();
        }
        ngOnChanges(changes) {
            const { nzTarget } = changes;
            if (nzTarget) {
                this.target = typeof this.nzTarget === 'string' ? this.doc.querySelector(this.nzTarget) : this.nzTarget;
                this.registerScrollEvent();
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopComponent, deps: [{ token: i1.NzConfigService }, { token: i2.NzScrollService }, { token: i3.Platform }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i2.NzDestroyService }, { token: i4.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzBackTopComponent, isStandalone: true, selector: "nz-back-top", inputs: { nzTemplate: "nzTemplate", nzVisibilityHeight: ["nzVisibilityHeight", "nzVisibilityHeight", numberAttribute], nzTarget: "nzTarget", nzDuration: ["nzDuration", "nzDuration", numberAttribute] }, outputs: { nzClick: "nzClick" }, providers: [NzDestroyService], viewQueries: [{ propertyName: "backTop", first: true, predicate: ["backTop"], descendants: true }], exportAs: ["nzBackTop"], usesOnChanges: true, ngImport: i0, template: `
    @if (visible) {
      <div #backTop class="ant-back-top" [class.ant-back-top-rtl]="dir === 'rtl'" @fadeMotion>
        <ng-template #defaultContent>
          <div class="ant-back-top-content">
            <div class="ant-back-top-icon">
              <nz-icon nzType="vertical-align-top" />
            </div>
          </div>
        </ng-template>
        <ng-template [ngTemplateOutlet]="nzTemplate || defaultContent"></ng-template>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], animations: [fadeMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-back-top',
                    exportAs: 'nzBackTop',
                    animations: [fadeMotion],
                    imports: [NgTemplateOutlet, NzIconModule],
                    template: `
    @if (visible) {
      <div #backTop class="ant-back-top" [class.ant-back-top-rtl]="dir === 'rtl'" @fadeMotion>
        <ng-template #defaultContent>
          <div class="ant-back-top-content">
            <div class="ant-back-top-icon">
              <nz-icon nzType="vertical-align-top" />
            </div>
          </div>
        </ng-template>
        <ng-template [ngTemplateOutlet]="nzTemplate || defaultContent"></ng-template>
      </div>
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i2.NzScrollService }, { type: i3.Platform }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i2.NzDestroyService }, { type: i4.Directionality }], propDecorators: { nzTemplate: [{
                type: Input
            }], nzVisibilityHeight: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzTarget: [{
                type: Input
            }], nzDuration: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzClick: [{
                type: Output
            }], backTop: [{
                type: ViewChild,
                args: ['backTop', { static: false }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBackTopModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopModule, imports: [NzBackTopComponent], exports: [NzBackTopComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopModule, imports: [NzBackTopComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBackTopModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [NzBackTopComponent],
                    imports: [NzBackTopComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzBackTopComponent, NzBackTopModule };
//# sourceMappingURL=ng-zorro-antd-back-top.mjs.map
