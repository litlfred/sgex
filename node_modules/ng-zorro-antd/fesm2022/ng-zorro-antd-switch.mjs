import { __esDecorate, __runInitializers } from 'tslib';
import { LEFT_ARROW, RIGHT_ARROW, SPACE, ENTER } from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import { forwardRef, booleanAttribute, Input, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i6 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i4 from 'ng-zorro-antd/core/wave';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import * as i5 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2 from '@angular/cdk/a11y';
import * as i3 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME = 'switch';
let NzSwitchComponent = (() => {
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    return class NzSwitchComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzSize_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        host;
        ngZone;
        cdr;
        focusMonitor;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        isChecked = false;
        onChange = () => { };
        onTouched = () => { };
        switchElement;
        nzLoading = false;
        nzDisabled = false;
        nzControl = false;
        nzCheckedChildren = null;
        nzUnCheckedChildren = null;
        nzSize = __runInitializers(this, _nzSize_initializers, 'default');
        nzId = (__runInitializers(this, _nzSize_extraInitializers), null);
        dir = 'ltr';
        destroy$ = new Subject();
        isNzDisableFirstChange = true;
        updateValue(value) {
            if (this.isChecked !== value) {
                this.isChecked = value;
                this.onChange(this.isChecked);
            }
        }
        focus() {
            this.focusMonitor.focusVia(this.switchElement.nativeElement, 'keyboard');
        }
        blur() {
            this.switchElement.nativeElement.blur();
        }
        constructor(nzConfigService, host, ngZone, cdr, focusMonitor, directionality) {
            this.nzConfigService = nzConfigService;
            this.host = host;
            this.ngZone = ngZone;
            this.cdr = cdr;
            this.focusMonitor = focusMonitor;
            this.directionality = directionality;
        }
        ngOnInit() {
            this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
            fromEventOutsideAngular(this.host.nativeElement, 'click')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                event.preventDefault();
                if (this.nzControl || this.nzDisabled || this.nzLoading) {
                    return;
                }
                this.ngZone.run(() => {
                    this.updateValue(!this.isChecked);
                    this.cdr.markForCheck();
                });
            });
            fromEventOutsideAngular(this.switchElement.nativeElement, 'keydown')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                if (this.nzControl || this.nzDisabled || this.nzLoading) {
                    return;
                }
                const { keyCode } = event;
                if (keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW && keyCode !== SPACE && keyCode !== ENTER) {
                    return;
                }
                event.preventDefault();
                this.ngZone.run(() => {
                    if (keyCode === LEFT_ARROW) {
                        this.updateValue(false);
                    }
                    else if (keyCode === RIGHT_ARROW) {
                        this.updateValue(true);
                    }
                    else if (keyCode === SPACE || keyCode === ENTER) {
                        this.updateValue(!this.isChecked);
                    }
                    this.cdr.markForCheck();
                });
            });
        }
        ngAfterViewInit() {
            this.focusMonitor
                .monitor(this.switchElement.nativeElement, true)
                .pipe(takeUntil(this.destroy$))
                .subscribe(focusOrigin => {
                if (!focusOrigin) {
                    /** https://github.com/angular/angular/issues/17793 **/
                    Promise.resolve().then(() => this.onTouched());
                }
            });
        }
        ngOnDestroy() {
            this.focusMonitor.stopMonitoring(this.switchElement.nativeElement);
            this.destroy$.next();
            this.destroy$.complete();
        }
        writeValue(value) {
            this.isChecked = value;
            this.cdr.markForCheck();
        }
        registerOnChange(fn) {
            this.onChange = fn;
        }
        registerOnTouched(fn) {
            this.onTouched = fn;
        }
        setDisabledState(disabled) {
            this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || disabled;
            this.isNzDisableFirstChange = false;
            this.cdr.markForCheck();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i2.FocusMonitor }, { token: i3.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSwitchComponent, isStandalone: true, selector: "nz-switch", inputs: { nzLoading: ["nzLoading", "nzLoading", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzControl: ["nzControl", "nzControl", booleanAttribute], nzCheckedChildren: "nzCheckedChildren", nzUnCheckedChildren: "nzUnCheckedChildren", nzSize: "nzSize", nzId: "nzId" }, providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => NzSwitchComponent),
                    multi: true
                }
            ], viewQueries: [{ propertyName: "switchElement", first: true, predicate: ["switchElement"], descendants: true, static: true }], exportAs: ["nzSwitch"], ngImport: i0, template: `
    <button
      nz-wave
      type="button"
      class="ant-switch"
      #switchElement
      [attr.id]="nzId"
      [disabled]="nzDisabled"
      [class.ant-switch-checked]="isChecked"
      [class.ant-switch-loading]="nzLoading"
      [class.ant-switch-disabled]="nzDisabled"
      [class.ant-switch-small]="nzSize === 'small'"
      [class.ant-switch-rtl]="dir === 'rtl'"
      [nzWaveExtraNode]="true"
    >
      <span class="ant-switch-handle">
        @if (nzLoading) {
          <nz-icon nzType="loading" class="ant-switch-loading-icon" />
        }
      </span>
      <span class="ant-switch-inner">
        @if (isChecked) {
          <ng-container *nzStringTemplateOutlet="nzCheckedChildren">{{ nzCheckedChildren }}</ng-container>
        } @else {
          <ng-container *nzStringTemplateOutlet="nzUnCheckedChildren">{{ nzUnCheckedChildren }}</ng-container>
        }
      </span>
      <div class="ant-click-animating-node"></div>
    </button>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzWaveModule }, { kind: "directive", type: i4.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i6.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-switch',
                    exportAs: 'nzSwitch',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzSwitchComponent),
                            multi: true
                        }
                    ],
                    template: `
    <button
      nz-wave
      type="button"
      class="ant-switch"
      #switchElement
      [attr.id]="nzId"
      [disabled]="nzDisabled"
      [class.ant-switch-checked]="isChecked"
      [class.ant-switch-loading]="nzLoading"
      [class.ant-switch-disabled]="nzDisabled"
      [class.ant-switch-small]="nzSize === 'small'"
      [class.ant-switch-rtl]="dir === 'rtl'"
      [nzWaveExtraNode]="true"
    >
      <span class="ant-switch-handle">
        @if (nzLoading) {
          <nz-icon nzType="loading" class="ant-switch-loading-icon" />
        }
      </span>
      <span class="ant-switch-inner">
        @if (isChecked) {
          <ng-container *nzStringTemplateOutlet="nzCheckedChildren">{{ nzCheckedChildren }}</ng-container>
        } @else {
          <ng-container *nzStringTemplateOutlet="nzUnCheckedChildren">{{ nzUnCheckedChildren }}</ng-container>
        }
      </span>
      <div class="ant-click-animating-node"></div>
    </button>
  `,
                    imports: [NzWaveModule, NzIconModule, NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i2.FocusMonitor }, { type: i3.Directionality }], propDecorators: { switchElement: [{
                type: ViewChild,
                args: ['switchElement', { static: true }]
            }], nzLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzControl: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckedChildren: [{
                type: Input
            }], nzUnCheckedChildren: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzId: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSwitchModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchModule, imports: [NzSwitchComponent], exports: [NzSwitchComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchModule, imports: [NzSwitchComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSwitchModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzSwitchComponent],
                    exports: [NzSwitchComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzSwitchComponent, NzSwitchModule };
//# sourceMappingURL=ng-zorro-antd-switch.mjs.map
