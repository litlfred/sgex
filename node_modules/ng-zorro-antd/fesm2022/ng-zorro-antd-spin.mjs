import { __esDecorate, __runInitializers } from 'tslib';
import { NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { booleanAttribute, numberAttribute, Input, ViewEncapsulation, Component, NgModule } from '@angular/core';
import { Subject, BehaviorSubject, ReplaySubject, timer } from 'rxjs';
import { startWith, distinctUntilChanged, switchMap, debounce, takeUntil } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i2 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME = 'spin';
let NzSpinComponent = (() => {
    let _nzIndicator_decorators;
    let _nzIndicator_initializers = [];
    let _nzIndicator_extraInitializers = [];
    return class NzSpinComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzIndicator_decorators = [WithConfig()];
            __esDecorate(null, null, _nzIndicator_decorators, { kind: "field", name: "nzIndicator", static: false, private: false, access: { has: obj => "nzIndicator" in obj, get: obj => obj.nzIndicator, set: (obj, value) => { obj.nzIndicator = value; } }, metadata: _metadata }, _nzIndicator_initializers, _nzIndicator_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzIndicator = __runInitializers(this, _nzIndicator_initializers, null);
        nzSize = (__runInitializers(this, _nzIndicator_extraInitializers), 'default');
        nzTip = null;
        nzDelay = 0;
        nzSimple = false;
        nzSpinning = true;
        destroy$ = new Subject();
        spinning$ = new BehaviorSubject(this.nzSpinning);
        delay$ = new ReplaySubject(1);
        isLoading = false;
        dir = 'ltr';
        constructor(nzConfigService, cdr, directionality) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.directionality = directionality;
        }
        ngOnInit() {
            const loading$ = this.delay$.pipe(startWith(this.nzDelay), distinctUntilChanged(), switchMap(delay => {
                if (delay === 0) {
                    return this.spinning$;
                }
                return this.spinning$.pipe(debounce(spinning => timer(spinning ? delay : 0)));
            }), takeUntil(this.destroy$));
            loading$.subscribe(loading => {
                this.isLoading = loading;
                this.cdr.markForCheck();
            });
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => this.cdr.markForCheck());
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
        }
        ngOnChanges(changes) {
            const { nzSpinning, nzDelay } = changes;
            if (nzSpinning) {
                this.spinning$.next(this.nzSpinning);
            }
            if (nzDelay) {
                this.delay$.next(this.nzDelay);
            }
        }
        ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpinComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSpinComponent, isStandalone: true, selector: "nz-spin", inputs: { nzIndicator: "nzIndicator", nzSize: "nzSize", nzTip: "nzTip", nzDelay: ["nzDelay", "nzDelay", numberAttribute], nzSimple: ["nzSimple", "nzSimple", booleanAttribute], nzSpinning: ["nzSpinning", "nzSpinning", booleanAttribute] }, host: { properties: { "class.ant-spin-nested-loading": "!nzSimple" } }, exportAs: ["nzSpin"], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #defaultTemplate>
      <span class="ant-spin-dot ant-spin-dot-spin">
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
      </span>
    </ng-template>
    @if (isLoading) {
      <div>
        <div
          class="ant-spin"
          [class.ant-spin-rtl]="dir === 'rtl'"
          [class.ant-spin-spinning]="isLoading"
          [class.ant-spin-lg]="nzSize === 'large'"
          [class.ant-spin-sm]="nzSize === 'small'"
          [class.ant-spin-show-text]="nzTip"
        >
          <ng-template [ngTemplateOutlet]="nzIndicator || defaultTemplate"></ng-template>
          @if (nzTip) {
            <div class="ant-spin-text">{{ nzTip }}</div>
          }
        </div>
      </div>
    }
    @if (!nzSimple) {
      <div class="ant-spin-container" [class.ant-spin-blur]="isLoading">
        <ng-content></ng-content>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpinComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-spin',
                    exportAs: 'nzSpin',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <ng-template #defaultTemplate>
      <span class="ant-spin-dot ant-spin-dot-spin">
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
        <i class="ant-spin-dot-item"></i>
      </span>
    </ng-template>
    @if (isLoading) {
      <div>
        <div
          class="ant-spin"
          [class.ant-spin-rtl]="dir === 'rtl'"
          [class.ant-spin-spinning]="isLoading"
          [class.ant-spin-lg]="nzSize === 'large'"
          [class.ant-spin-sm]="nzSize === 'small'"
          [class.ant-spin-show-text]="nzTip"
        >
          <ng-template [ngTemplateOutlet]="nzIndicator || defaultTemplate"></ng-template>
          @if (nzTip) {
            <div class="ant-spin-text">{{ nzTip }}</div>
          }
        </div>
      </div>
    }
    @if (!nzSimple) {
      <div class="ant-spin-container" [class.ant-spin-blur]="isLoading">
        <ng-content></ng-content>
      </div>
    }
  `,
                    host: {
                        '[class.ant-spin-nested-loading]': '!nzSimple'
                    },
                    imports: [NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality }], propDecorators: { nzIndicator: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzTip: [{
                type: Input
            }], nzDelay: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzSimple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSpinning: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSpinModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpinModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzSpinModule, imports: [NzSpinComponent], exports: [NzSpinComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpinModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpinModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzSpinComponent],
                    exports: [NzSpinComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzSpinComponent, NzSpinModule };
//# sourceMappingURL=ng-zorro-antd-spin.mjs.map
