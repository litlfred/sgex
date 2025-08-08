import * as i0 from '@angular/core';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, booleanAttribute, Input, Directive, inject, ContentChild, NgModule } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AbstractControl, NgModel, FormControlName, FormControlDirective, NgControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil, startWith, tap } from 'rxjs/operators';
import { helpMotion } from 'ng-zorro-antd/core/animation';
import * as i2$1 from 'ng-zorro-antd/core/form';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { toBoolean } from 'ng-zorro-antd/core/util';
import { __esDecorate, __runInitializers } from 'tslib';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i2 from '@angular/cdk/bidi';
import * as i1$1 from 'ng-zorro-antd/i18n';
import * as i2$2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/** should add nz-row directive to host, track https://github.com/angular/angular/issues/8785 **/
class NzFormItemComponent {
    cdr;
    status = '';
    hasFeedback = false;
    withHelpClass = false;
    destroy$ = new Subject();
    setWithHelpViaTips(value) {
        this.withHelpClass = value;
        this.cdr.markForCheck();
    }
    setStatus(status) {
        this.status = status;
        this.cdr.markForCheck();
    }
    setHasFeedback(hasFeedback) {
        this.hasFeedback = hasFeedback;
        this.cdr.markForCheck();
    }
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormItemComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzFormItemComponent, isStandalone: true, selector: "nz-form-item", host: { properties: { "class.ant-form-item-has-success": "status === \"success\"", "class.ant-form-item-has-warning": "status === \"warning\"", "class.ant-form-item-has-error": "status === \"error\"", "class.ant-form-item-is-validating": "status === \"validating\"", "class.ant-form-item-has-feedback": "hasFeedback && status", "class.ant-form-item-with-help": "withHelpClass" }, classAttribute: "ant-form-item" }, exportAs: ["nzFormItem"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormItemComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-item',
                    exportAs: 'nzFormItem',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        class: 'ant-form-item',
                        '[class.ant-form-item-has-success]': 'status === "success"',
                        '[class.ant-form-item-has-warning]': 'status === "warning"',
                        '[class.ant-form-item-has-error]': 'status === "error"',
                        '[class.ant-form-item-is-validating]': 'status === "validating"',
                        '[class.ant-form-item-has-feedback]': 'hasFeedback && status',
                        '[class.ant-form-item-with-help]': 'withHelpClass'
                    },
                    template: `<ng-content></ng-content>`
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });

const NZ_CONFIG_MODULE_NAME = 'form';
const DefaultTooltipIcon = {
    type: 'question-circle',
    theme: 'outline'
};
let NzFormDirective = (() => {
    let _nzNoColon_decorators;
    let _nzNoColon_initializers = [];
    let _nzNoColon_extraInitializers = [];
    let _nzAutoTips_decorators;
    let _nzAutoTips_initializers = [];
    let _nzAutoTips_extraInitializers = [];
    let _nzTooltipIcon_decorators;
    let _nzTooltipIcon_initializers = [];
    let _nzTooltipIcon_extraInitializers = [];
    let _nzLabelWrap_decorators;
    let _nzLabelWrap_initializers = [];
    let _nzLabelWrap_extraInitializers = [];
    return class NzFormDirective {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzNoColon_decorators = [WithConfig()];
            _nzAutoTips_decorators = [WithConfig()];
            _nzTooltipIcon_decorators = [WithConfig()];
            _nzLabelWrap_decorators = [WithConfig()];
            __esDecorate(null, null, _nzNoColon_decorators, { kind: "field", name: "nzNoColon", static: false, private: false, access: { has: obj => "nzNoColon" in obj, get: obj => obj.nzNoColon, set: (obj, value) => { obj.nzNoColon = value; } }, metadata: _metadata }, _nzNoColon_initializers, _nzNoColon_extraInitializers);
            __esDecorate(null, null, _nzAutoTips_decorators, { kind: "field", name: "nzAutoTips", static: false, private: false, access: { has: obj => "nzAutoTips" in obj, get: obj => obj.nzAutoTips, set: (obj, value) => { obj.nzAutoTips = value; } }, metadata: _metadata }, _nzAutoTips_initializers, _nzAutoTips_extraInitializers);
            __esDecorate(null, null, _nzTooltipIcon_decorators, { kind: "field", name: "nzTooltipIcon", static: false, private: false, access: { has: obj => "nzTooltipIcon" in obj, get: obj => obj.nzTooltipIcon, set: (obj, value) => { obj.nzTooltipIcon = value; } }, metadata: _metadata }, _nzTooltipIcon_initializers, _nzTooltipIcon_extraInitializers);
            __esDecorate(null, null, _nzLabelWrap_decorators, { kind: "field", name: "nzLabelWrap", static: false, private: false, access: { has: obj => "nzLabelWrap" in obj, get: obj => obj.nzLabelWrap, set: (obj, value) => { obj.nzLabelWrap = value; } }, metadata: _metadata }, _nzLabelWrap_initializers, _nzLabelWrap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzLayout = 'horizontal';
        nzNoColon = __runInitializers(this, _nzNoColon_initializers, false);
        nzAutoTips = (__runInitializers(this, _nzNoColon_extraInitializers), __runInitializers(this, _nzAutoTips_initializers, {}));
        nzDisableAutoTips = (__runInitializers(this, _nzAutoTips_extraInitializers), false);
        nzTooltipIcon = __runInitializers(this, _nzTooltipIcon_initializers, DefaultTooltipIcon);
        nzLabelAlign = (__runInitializers(this, _nzTooltipIcon_extraInitializers), 'right');
        nzLabelWrap = __runInitializers(this, _nzLabelWrap_initializers, false);
        dir = (__runInitializers(this, _nzLabelWrap_extraInitializers), 'ltr');
        destroy$ = new Subject();
        inputChanges$ = new Subject();
        getInputObservable(changeType) {
            return this.inputChanges$.pipe(filter(changes => changeType in changes), map(value => value[changeType]));
        }
        constructor(nzConfigService, directionality) {
            this.nzConfigService = nzConfigService;
            this.directionality = directionality;
            this.dir = this.directionality.value;
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
            });
        }
        ngOnChanges(changes) {
            this.inputChanges$.next(changes);
        }
        ngOnDestroy() {
            this.inputChanges$.complete();
            this.destroy$.next(true);
            this.destroy$.complete();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormDirective, deps: [{ token: i1.NzConfigService }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Directive });
        static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzFormDirective, isStandalone: true, selector: "[nz-form]", inputs: { nzLayout: "nzLayout", nzNoColon: ["nzNoColon", "nzNoColon", booleanAttribute], nzAutoTips: "nzAutoTips", nzDisableAutoTips: ["nzDisableAutoTips", "nzDisableAutoTips", booleanAttribute], nzTooltipIcon: "nzTooltipIcon", nzLabelAlign: "nzLabelAlign", nzLabelWrap: ["nzLabelWrap", "nzLabelWrap", booleanAttribute] }, host: { properties: { "class.ant-form-horizontal": "nzLayout === 'horizontal'", "class.ant-form-vertical": "nzLayout === 'vertical'", "class.ant-form-inline": "nzLayout === 'inline'", "class.ant-form-rtl": "dir === 'rtl'" }, classAttribute: "ant-form" }, exportAs: ["nzForm"], usesOnChanges: true, ngImport: i0 });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-form]',
                    exportAs: 'nzForm',
                    host: {
                        class: 'ant-form',
                        '[class.ant-form-horizontal]': `nzLayout === 'horizontal'`,
                        '[class.ant-form-vertical]': `nzLayout === 'vertical'`,
                        '[class.ant-form-inline]': `nzLayout === 'inline'`,
                        '[class.ant-form-rtl]': `dir === 'rtl'`
                    }
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i2.Directionality }], propDecorators: { nzLayout: [{
                type: Input
            }], nzNoColon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoTips: [{
                type: Input
            }], nzDisableAutoTips: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzTooltipIcon: [{
                type: Input
            }], nzLabelAlign: [{
                type: Input
            }], nzLabelWrap: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFormControlComponent {
    cdr;
    nzFormStatusService;
    _hasFeedback = false;
    validateChanges = Subscription.EMPTY;
    validateString = null;
    destroyed$ = new Subject();
    localeId;
    autoErrorTip;
    get disableAutoTips() {
        return this.nzDisableAutoTips !== undefined
            ? toBoolean(this.nzDisableAutoTips)
            : !!this.nzFormDirective?.nzDisableAutoTips;
    }
    status = '';
    validateControl = null;
    innerTip = null;
    defaultValidateControl;
    nzSuccessTip;
    nzWarningTip;
    nzErrorTip;
    nzValidatingTip;
    nzExtra;
    nzAutoTips = {};
    nzDisableAutoTips;
    set nzHasFeedback(value) {
        this._hasFeedback = value;
        this.nzFormStatusService.formStatusChanges.next({ status: this.status, hasFeedback: this._hasFeedback });
        if (this.nzFormItemComponent) {
            this.nzFormItemComponent.setHasFeedback(this._hasFeedback);
        }
    }
    get nzHasFeedback() {
        return this._hasFeedback;
    }
    set nzValidateStatus(value) {
        if (value instanceof AbstractControl || value instanceof NgModel) {
            this.validateControl = value;
            this.validateString = null;
            this.watchControl();
        }
        else if (value instanceof FormControlName) {
            this.validateControl = value.control;
            this.validateString = null;
            this.watchControl();
        }
        else {
            this.validateString = value;
            this.validateControl = null;
            this.setStatus();
        }
    }
    watchControl() {
        this.validateChanges.unsubscribe();
        /** miss detect https://github.com/angular/angular/issues/10887 **/
        if (this.validateControl && this.validateControl.statusChanges) {
            this.validateChanges = this.validateControl.statusChanges
                .pipe(startWith(null), takeUntil(this.destroyed$))
                .subscribe(() => {
                if (!this.disableAutoTips) {
                    this.updateAutoErrorTip();
                }
                this.setStatus();
                this.cdr.markForCheck();
            });
        }
    }
    setStatus() {
        this.status = this.getControlStatus(this.validateString);
        this.innerTip = this.getInnerTip(this.status);
        this.nzFormStatusService.formStatusChanges.next({ status: this.status, hasFeedback: this.nzHasFeedback });
        if (this.nzFormItemComponent) {
            this.nzFormItemComponent.setWithHelpViaTips(!!this.innerTip);
            this.nzFormItemComponent.setStatus(this.status);
        }
    }
    getControlStatus(validateString) {
        let status;
        if (validateString === 'warning' || this.validateControlStatus('INVALID', 'warning')) {
            status = 'warning';
        }
        else if (validateString === 'error' || this.validateControlStatus('INVALID')) {
            status = 'error';
        }
        else if (validateString === 'validating' ||
            validateString === 'pending' ||
            this.validateControlStatus('PENDING')) {
            status = 'validating';
        }
        else if (validateString === 'success' || this.validateControlStatus('VALID')) {
            status = 'success';
        }
        else {
            status = '';
        }
        return status;
    }
    validateControlStatus(validStatus, statusType) {
        if (!this.validateControl) {
            return false;
        }
        else {
            const { dirty, touched, status } = this.validateControl;
            return ((!!dirty || !!touched) && (statusType ? this.validateControl.hasError(statusType) : status === validStatus));
        }
    }
    getInnerTip(status) {
        switch (status) {
            case 'error':
                return (!this.disableAutoTips && this.autoErrorTip) || this.nzErrorTip || null;
            case 'validating':
                return this.nzValidatingTip || null;
            case 'success':
                return this.nzSuccessTip || null;
            case 'warning':
                return this.nzWarningTip || null;
            default:
                return null;
        }
    }
    updateAutoErrorTip() {
        if (this.validateControl) {
            const errors = this.validateControl.errors || {};
            let autoErrorTip = '';
            for (const key in errors) {
                if (errors.hasOwnProperty(key)) {
                    autoErrorTip =
                        errors[key]?.[this.localeId] ??
                            this.nzAutoTips?.[this.localeId]?.[key] ??
                            this.nzAutoTips.default?.[key] ??
                            this.nzFormDirective?.nzAutoTips?.[this.localeId]?.[key] ??
                            this.nzFormDirective?.nzAutoTips.default?.[key];
                }
                if (autoErrorTip) {
                    break;
                }
            }
            this.autoErrorTip = autoErrorTip;
        }
    }
    subscribeAutoTips(observable) {
        observable?.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            if (!this.disableAutoTips) {
                this.updateAutoErrorTip();
                this.setStatus();
                this.cdr.markForCheck();
            }
        });
    }
    nzFormItemComponent = inject(NzFormItemComponent, { host: true, optional: true });
    nzFormDirective = inject(NzFormDirective, { optional: true });
    constructor(cdr, i18n, nzFormStatusService) {
        this.cdr = cdr;
        this.nzFormStatusService = nzFormStatusService;
        this.subscribeAutoTips(i18n.localeChange.pipe(tap(locale => (this.localeId = locale.locale))));
        this.subscribeAutoTips(this.nzFormDirective?.getInputObservable('nzAutoTips'));
        this.subscribeAutoTips(this.nzFormDirective
            ?.getInputObservable('nzDisableAutoTips')
            .pipe(filter(() => this.nzDisableAutoTips === undefined)));
    }
    ngOnChanges(changes) {
        const { nzDisableAutoTips, nzAutoTips, nzSuccessTip, nzWarningTip, nzErrorTip, nzValidatingTip } = changes;
        if (nzDisableAutoTips || nzAutoTips) {
            this.updateAutoErrorTip();
            this.setStatus();
        }
        else if (nzSuccessTip || nzWarningTip || nzErrorTip || nzValidatingTip) {
            this.setStatus();
        }
    }
    ngOnInit() {
        this.setStatus();
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    ngAfterContentInit() {
        if (!this.validateControl && !this.validateString) {
            if (this.defaultValidateControl instanceof FormControlDirective) {
                this.nzValidateStatus = this.defaultValidateControl.control;
            }
            else {
                this.nzValidateStatus = this.defaultValidateControl;
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormControlComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1$1.NzI18nService }, { token: i2$1.NzFormStatusService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFormControlComponent, isStandalone: true, selector: "nz-form-control", inputs: { nzSuccessTip: "nzSuccessTip", nzWarningTip: "nzWarningTip", nzErrorTip: "nzErrorTip", nzValidatingTip: "nzValidatingTip", nzExtra: "nzExtra", nzAutoTips: "nzAutoTips", nzDisableAutoTips: ["nzDisableAutoTips", "nzDisableAutoTips", booleanAttribute], nzHasFeedback: ["nzHasFeedback", "nzHasFeedback", booleanAttribute], nzValidateStatus: "nzValidateStatus" }, host: { classAttribute: "ant-form-item-control" }, providers: [NzFormStatusService], queries: [{ propertyName: "defaultValidateControl", first: true, predicate: NgControl, descendants: true }], exportAs: ["nzFormControl"], usesOnChanges: true, ngImport: i0, template: `
    <div class="ant-form-item-control-input">
      <div class="ant-form-item-control-input-content">
        <ng-content></ng-content>
      </div>
    </div>
    @if (innerTip) {
      <div @helpMotion class="ant-form-item-explain ant-form-item-explain-connected">
        <div role="alert" [class]="['ant-form-item-explain-' + status]">
          <ng-container *nzStringTemplateOutlet="innerTip; context: { $implicit: validateControl }">{{
            innerTip
          }}</ng-container>
        </div>
      </div>
    }

    @if (nzExtra) {
      <div class="ant-form-item-extra">
        <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [helpMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormControlComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-control',
                    exportAs: 'nzFormControl',
                    preserveWhitespaces: false,
                    animations: [helpMotion],
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ant-form-item-control-input">
      <div class="ant-form-item-control-input-content">
        <ng-content></ng-content>
      </div>
    </div>
    @if (innerTip) {
      <div @helpMotion class="ant-form-item-explain ant-form-item-explain-connected">
        <div role="alert" [class]="['ant-form-item-explain-' + status]">
          <ng-container *nzStringTemplateOutlet="innerTip; context: { $implicit: validateControl }">{{
            innerTip
          }}</ng-container>
        </div>
      </div>
    }

    @if (nzExtra) {
      <div class="ant-form-item-extra">
        <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
      </div>
    }
  `,
                    providers: [NzFormStatusService],
                    host: {
                        class: 'ant-form-item-control'
                    },
                    imports: [NzOutletModule]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1$1.NzI18nService }, { type: i2$1.NzFormStatusService }], propDecorators: { defaultValidateControl: [{
                type: ContentChild,
                args: [NgControl, { static: false }]
            }], nzSuccessTip: [{
                type: Input
            }], nzWarningTip: [{
                type: Input
            }], nzErrorTip: [{
                type: Input
            }], nzValidatingTip: [{
                type: Input
            }], nzExtra: [{
                type: Input
            }], nzAutoTips: [{
                type: Input
            }], nzDisableAutoTips: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzHasFeedback: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzValidateStatus: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function toTooltipIcon(value) {
    const icon = typeof value === 'string' ? { type: value } : value;
    return { ...DefaultTooltipIcon, ...icon };
}
class NzFormLabelComponent {
    cdr;
    nzFor;
    nzRequired = false;
    set nzNoColon(value) {
        this.noColon = value;
    }
    get nzNoColon() {
        return this.noColon !== 'default' ? this.noColon : !!this.nzFormDirective?.nzNoColon;
    }
    noColon = 'default';
    nzTooltipTitle;
    set nzTooltipIcon(value) {
        this._tooltipIcon = toTooltipIcon(value);
    }
    // due to 'get' and 'set' accessor must have the same type, so it was renamed to `tooltipIcon`
    get tooltipIcon() {
        return this._tooltipIcon !== 'default'
            ? this._tooltipIcon
            : toTooltipIcon(this.nzFormDirective?.nzTooltipIcon || DefaultTooltipIcon);
    }
    _tooltipIcon = 'default';
    set nzLabelAlign(value) {
        this.labelAlign = value;
    }
    get nzLabelAlign() {
        return this.labelAlign !== 'default' ? this.labelAlign : this.nzFormDirective?.nzLabelAlign || 'right';
    }
    labelAlign = 'default';
    set nzLabelWrap(value) {
        this.labelWrap = value;
    }
    get nzLabelWrap() {
        return this.labelWrap !== 'default' ? this.labelWrap : !!this.nzFormDirective?.nzLabelWrap;
    }
    labelWrap = 'default';
    destroy$ = new Subject();
    nzFormDirective = inject(NzFormDirective, { skipSelf: true, optional: true });
    constructor(cdr) {
        this.cdr = cdr;
        if (this.nzFormDirective) {
            this.nzFormDirective
                .getInputObservable('nzNoColon')
                .pipe(filter(() => this.noColon === 'default'), takeUntil(this.destroy$))
                .subscribe(() => this.cdr.markForCheck());
            this.nzFormDirective
                .getInputObservable('nzTooltipIcon')
                .pipe(filter(() => this._tooltipIcon === 'default'), takeUntil(this.destroy$))
                .subscribe(() => this.cdr.markForCheck());
            this.nzFormDirective
                .getInputObservable('nzLabelAlign')
                .pipe(filter(() => this.labelAlign === 'default'), takeUntil(this.destroy$))
                .subscribe(() => this.cdr.markForCheck());
            this.nzFormDirective
                .getInputObservable('nzLabelWrap')
                .pipe(filter(() => this.labelWrap === 'default'), takeUntil(this.destroy$))
                .subscribe(() => this.cdr.markForCheck());
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormLabelComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFormLabelComponent, isStandalone: true, selector: "nz-form-label", inputs: { nzFor: "nzFor", nzRequired: ["nzRequired", "nzRequired", booleanAttribute], nzNoColon: ["nzNoColon", "nzNoColon", booleanAttribute], nzTooltipTitle: "nzTooltipTitle", nzTooltipIcon: "nzTooltipIcon", nzLabelAlign: "nzLabelAlign", nzLabelWrap: ["nzLabelWrap", "nzLabelWrap", booleanAttribute] }, host: { properties: { "class.ant-form-item-label-left": "nzLabelAlign === 'left'", "class.ant-form-item-label-wrap": "nzLabelWrap" }, classAttribute: "ant-form-item-label" }, exportAs: ["nzFormLabel"], ngImport: i0, template: `
    <label [attr.for]="nzFor" [class.ant-form-item-no-colon]="nzNoColon" [class.ant-form-item-required]="nzRequired">
      <ng-content></ng-content>
      @if (nzTooltipTitle) {
        <span class="ant-form-item-tooltip" nz-tooltip [nzTooltipTitle]="nzTooltipTitle">
          <ng-container *nzStringTemplateOutlet="tooltipIcon.type; let tooltipIconType">
            <nz-icon [nzType]="tooltipIconType" [nzTheme]="tooltipIcon.theme" />
          </ng-container>
        </span>
      }
    </label>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "directive", type: NzTooltipDirective, selector: "[nz-tooltip]", inputs: ["nzTooltipTitle", "nzTooltipTitleContext", "nz-tooltip", "nzTooltipTrigger", "nzTooltipPlacement", "nzTooltipOrigin", "nzTooltipVisible", "nzTooltipMouseEnterDelay", "nzTooltipMouseLeaveDelay", "nzTooltipOverlayClassName", "nzTooltipOverlayStyle", "nzTooltipArrowPointAtCenter", "cdkConnectedOverlayPush", "nzTooltipColor"], outputs: ["nzTooltipVisibleChange"], exportAs: ["nzTooltip"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2$2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormLabelComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-label',
                    exportAs: 'nzFormLabel',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <label [attr.for]="nzFor" [class.ant-form-item-no-colon]="nzNoColon" [class.ant-form-item-required]="nzRequired">
      <ng-content></ng-content>
      @if (nzTooltipTitle) {
        <span class="ant-form-item-tooltip" nz-tooltip [nzTooltipTitle]="nzTooltipTitle">
          <ng-container *nzStringTemplateOutlet="tooltipIcon.type; let tooltipIconType">
            <nz-icon [nzType]="tooltipIconType" [nzTheme]="tooltipIcon.theme" />
          </ng-container>
        </span>
      }
    </label>
  `,
                    host: {
                        class: 'ant-form-item-label',
                        '[class.ant-form-item-label-left]': `nzLabelAlign === 'left'`,
                        '[class.ant-form-item-label-wrap]': `nzLabelWrap`
                    },
                    imports: [NzOutletModule, NzTooltipDirective, NzIconModule]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { nzFor: [{
                type: Input
            }], nzRequired: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNoColon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzTooltipTitle: [{
                type: Input
            }], nzTooltipIcon: [{
                type: Input
            }], nzLabelAlign: [{
                type: Input
            }], nzLabelWrap: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFormSplitComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormSplitComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzFormSplitComponent, isStandalone: true, selector: "nz-form-split", host: { classAttribute: "ant-form-split" }, exportAs: ["nzFormSplit"], ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormSplitComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-split',
                    exportAs: 'nzFormSplit',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: ` <ng-content></ng-content> `,
                    host: {
                        class: 'ant-form-split'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFormTextComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormTextComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzFormTextComponent, isStandalone: true, selector: "nz-form-text", host: { classAttribute: "ant-form-text" }, exportAs: ["nzFormText"], ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormTextComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-text',
                    exportAs: 'nzFormText',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: ` <ng-content></ng-content> `,
                    host: {
                        class: 'ant-form-text'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFormModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzFormModule, imports: [NzFormDirective,
            NzFormItemComponent,
            NzFormLabelComponent,
            NzFormControlComponent,
            NzFormTextComponent,
            NzFormSplitComponent], exports: [NzGridModule,
            NzFormDirective,
            NzFormItemComponent,
            NzFormLabelComponent,
            NzFormControlComponent,
            NzFormTextComponent,
            NzFormSplitComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormModule, imports: [NzFormLabelComponent,
            NzFormControlComponent, NzGridModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzFormDirective,
                        NzFormItemComponent,
                        NzFormLabelComponent,
                        NzFormControlComponent,
                        NzFormTextComponent,
                        NzFormSplitComponent
                    ],
                    exports: [
                        NzGridModule,
                        NzFormDirective,
                        NzFormItemComponent,
                        NzFormLabelComponent,
                        NzFormControlComponent,
                        NzFormTextComponent,
                        NzFormSplitComponent
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

export { DefaultTooltipIcon, NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzFormModule, NzFormSplitComponent, NzFormTextComponent };
//# sourceMappingURL=ng-zorro-antd-form.mjs.map
