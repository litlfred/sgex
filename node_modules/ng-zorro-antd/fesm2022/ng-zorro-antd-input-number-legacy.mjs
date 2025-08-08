import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import { EventEmitter, computed, signal, inject, forwardRef, booleanAttribute, numberAttribute, Input, ViewChild, Output, ViewEncapsulation, ChangeDetectionStrategy, Component, Directive, ContentChildren, NgModule } from '@angular/core';
import * as i6 from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { distinctUntilChanged, takeUntil, startWith, switchMap, mergeMap, map } from 'rxjs/operators';
import { NzFormStatusService, NzFormNoStatusService, NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import * as i3 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { isNotNil, fromEventOutsideAngular, getStatusClassNames } from 'ng-zorro-antd/core/util';
import * as i5 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i4 from 'ng-zorro-antd/space';
import { NZ_SPACE_COMPACT_SIZE, NZ_SPACE_COMPACT_ITEM_TYPE, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import * as i1 from '@angular/cdk/a11y';
import * as i2 from '@angular/cdk/bidi';
import * as i2$1 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgTemplateOutlet } from '@angular/common';

/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
class NzInputNumberLegacyComponent {
    ngZone;
    elementRef;
    cdr;
    focusMonitor;
    renderer;
    directionality;
    destroy$;
    displayValue;
    isFocused = false;
    disabled$ = new Subject();
    disabledUp = false;
    disabledDown = false;
    dir = 'ltr';
    // status
    prefixCls = 'ant-input-number';
    status = '';
    statusCls = {};
    hasFeedback = false;
    onChange = () => { };
    onTouched = () => { };
    nzBlur = new EventEmitter();
    nzFocus = new EventEmitter();
    /** The native `<span class="ant-input-number-handler-up"></span>` element. */
    upHandler;
    /** The native `<span class="ant-input-number-handler-down"></span>` element. */
    downHandler;
    /** The native `<input class="ant-input-number-input" />` element. */
    inputElement;
    nzSize = 'default';
    nzMin = -Infinity;
    nzMax = Infinity;
    nzParser = (value) => value
        .trim()
        .replace(/。/g, '.')
        .replace(/[^\w.-]+/g, '');
    nzPrecision;
    nzPrecisionMode = 'toFixed';
    nzPlaceHolder = '';
    nzStatus = '';
    nzStep = 1;
    nzInputMode = 'decimal';
    nzId = null;
    nzDisabled = false;
    nzReadOnly = false;
    nzAutoFocus = false;
    nzBorderless = false;
    nzFormatter = value => value;
    finalSize = computed(() => {
        if (this.compactSize) {
            return this.compactSize();
        }
        return this.size();
    });
    size = signal(this.nzSize);
    compactSize = inject(NZ_SPACE_COMPACT_SIZE, { optional: true });
    autoStepTimer;
    parsedValue;
    value;
    isNzDisableFirstChange = true;
    onModelChange(value) {
        this.parsedValue = this.nzParser(value);
        this.inputElement.nativeElement.value = `${this.parsedValue}`;
        const validValue = this.getCurrentValidValue(this.parsedValue);
        this.setValue(validValue);
    }
    getCurrentValidValue(value) {
        let val = value;
        if (val === '') {
            val = '';
        }
        else if (!this.isNotCompleteNumber(val)) {
            val = `${this.getValidValue(val)}`;
        }
        else {
            val = this.value;
        }
        return this.toNumber(val);
    }
    // '1.' '1x' 'xx' '' => are not complete numbers
    isNotCompleteNumber(num) {
        return (isNaN(num) ||
            num === '' ||
            num === null ||
            !!(num && num.toString().indexOf('.') === num.toString().length - 1));
    }
    getValidValue(value) {
        let val = parseFloat(value);
        // https://github.com/ant-design/ant-design/issues/7358
        if (isNaN(val)) {
            return value;
        }
        if (val < this.nzMin) {
            val = this.nzMin;
        }
        if (val > this.nzMax) {
            val = this.nzMax;
        }
        return val;
    }
    toNumber(num) {
        if (this.isNotCompleteNumber(num)) {
            return num;
        }
        const numStr = String(num);
        if (numStr.indexOf('.') >= 0 && isNotNil(this.nzPrecision)) {
            if (typeof this.nzPrecisionMode === 'function') {
                return this.nzPrecisionMode(num, this.nzPrecision);
            }
            else if (this.nzPrecisionMode === 'cut') {
                const numSplit = numStr.split('.');
                numSplit[1] = numSplit[1].slice(0, this.nzPrecision);
                return Number(numSplit.join('.'));
            }
            return Number(Number(num).toFixed(this.nzPrecision));
        }
        return Number(num);
    }
    getRatio(e) {
        let ratio = 1;
        if (e.metaKey || e.ctrlKey) {
            ratio = 0.1;
        }
        else if (e.shiftKey) {
            ratio = 10;
        }
        return ratio;
    }
    down(e, ratio) {
        if (!this.isFocused) {
            this.focus();
        }
        this.step('down', e, ratio);
    }
    up(e, ratio) {
        if (!this.isFocused) {
            this.focus();
        }
        this.step('up', e, ratio);
    }
    getPrecision(value) {
        const valueString = value.toString();
        if (valueString.indexOf('e-') >= 0) {
            return parseInt(valueString.slice(valueString.indexOf('e-') + 2), 10);
        }
        let precision = 0;
        if (valueString.indexOf('.') >= 0) {
            precision = valueString.length - valueString.indexOf('.') - 1;
        }
        return precision;
    }
    // step={1.0} value={1.51}
    // press +
    // then value should be 2.51, rather than 2.5
    // if this.props.precision is undefined
    // https://github.com/react-component/input-number/issues/39
    getMaxPrecision(currentValue, ratio) {
        if (isNotNil(this.nzPrecision)) {
            return this.nzPrecision;
        }
        const ratioPrecision = this.getPrecision(ratio);
        const stepPrecision = this.getPrecision(this.nzStep);
        const currentValuePrecision = this.getPrecision(currentValue);
        if (!currentValue) {
            return ratioPrecision + stepPrecision;
        }
        return Math.max(currentValuePrecision, ratioPrecision + stepPrecision);
    }
    getPrecisionFactor(currentValue, ratio) {
        const precision = this.getMaxPrecision(currentValue, ratio);
        return Math.pow(10, precision);
    }
    upStep(val, rat) {
        const precisionFactor = this.getPrecisionFactor(val, rat);
        const precision = Math.abs(this.getMaxPrecision(val, rat));
        let result;
        if (typeof val === 'number') {
            result = ((precisionFactor * val + precisionFactor * this.nzStep * rat) / precisionFactor).toFixed(precision);
        }
        else {
            result = this.nzMin === -Infinity ? this.nzStep : this.nzMin;
        }
        return this.toNumber(result);
    }
    downStep(val, rat) {
        const precisionFactor = this.getPrecisionFactor(val, rat);
        const precision = Math.abs(this.getMaxPrecision(val, rat));
        let result;
        if (typeof val === 'number') {
            result = ((precisionFactor * val - precisionFactor * this.nzStep * rat) / precisionFactor).toFixed(precision);
        }
        else {
            result = this.nzMin === -Infinity ? -this.nzStep : this.nzMin;
        }
        return this.toNumber(result);
    }
    step(type, e, ratio = 1) {
        this.stop();
        e.preventDefault();
        if (this.nzDisabled) {
            return;
        }
        const value = this.getCurrentValidValue(this.parsedValue) || 0;
        let val = 0;
        if (type === 'up') {
            val = this.upStep(value, ratio);
        }
        else if (type === 'down') {
            val = this.downStep(value, ratio);
        }
        const outOfRange = val > this.nzMax || val < this.nzMin;
        if (val > this.nzMax) {
            val = this.nzMax;
        }
        else if (val < this.nzMin) {
            val = this.nzMin;
        }
        this.setValue(val);
        this.updateDisplayValue(val);
        this.isFocused = true;
        if (outOfRange) {
            return;
        }
        this.autoStepTimer = setTimeout(() => {
            this[type](e, ratio);
        }, 300);
    }
    stop() {
        if (this.autoStepTimer) {
            clearTimeout(this.autoStepTimer);
        }
    }
    setValue(value) {
        if (`${this.value}` !== `${value}`) {
            this.onChange(value);
        }
        this.value = value;
        this.parsedValue = value;
        this.disabledUp = this.disabledDown = false;
        if (value || value === 0) {
            const val = Number(value);
            if (val >= this.nzMax) {
                this.disabledUp = true;
            }
            if (val <= this.nzMin) {
                this.disabledDown = true;
            }
        }
    }
    updateDisplayValue(value) {
        const displayValue = isNotNil(this.nzFormatter(value)) ? this.nzFormatter(value) : '';
        this.displayValue = displayValue;
        this.inputElement.nativeElement.value = `${displayValue}`;
    }
    writeValue(value) {
        this.value = value;
        this.setValue(value);
        this.updateDisplayValue(value);
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
        this.disabled$.next(this.nzDisabled);
        this.cdr.markForCheck();
    }
    focus() {
        this.focusMonitor.focusVia(this.inputElement, 'keyboard');
    }
    blur() {
        this.inputElement.nativeElement.blur();
    }
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    nzFormNoStatusService = inject(NzFormNoStatusService, { optional: true });
    constructor(ngZone, elementRef, cdr, focusMonitor, renderer, directionality, destroy$) {
        this.ngZone = ngZone;
        this.elementRef = elementRef;
        this.cdr = cdr;
        this.focusMonitor = focusMonitor;
        this.renderer = renderer;
        this.directionality = directionality;
        this.destroy$ = destroy$;
    }
    ngOnInit() {
        this.nzFormStatusService?.formStatusChanges
            .pipe(distinctUntilChanged((pre, cur) => {
            return pre.status === cur.status && pre.hasFeedback === cur.hasFeedback;
        }), takeUntil(this.destroy$))
            .subscribe(({ status, hasFeedback }) => {
            this.setStatusStyles(status, hasFeedback);
        });
        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(focusOrigin => {
            if (!focusOrigin) {
                this.isFocused = false;
                this.updateDisplayValue(this.value);
                this.nzBlur.emit();
                Promise.resolve().then(() => this.onTouched());
            }
            else {
                this.isFocused = true;
                this.nzFocus.emit();
            }
        });
        this.dir = this.directionality.value;
        this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
        this.setupHandlersListeners();
        fromEventOutsideAngular(this.inputElement.nativeElement, 'keyup')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.stop());
        fromEventOutsideAngular(this.inputElement.nativeElement, 'keydown')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
            const { keyCode } = event;
            if (keyCode !== UP_ARROW && keyCode !== DOWN_ARROW && keyCode !== ENTER) {
                return;
            }
            this.ngZone.run(() => {
                if (keyCode === UP_ARROW) {
                    const ratio = this.getRatio(event);
                    this.up(event, ratio);
                    this.stop();
                }
                else if (keyCode === DOWN_ARROW) {
                    const ratio = this.getRatio(event);
                    this.down(event, ratio);
                    this.stop();
                }
                else {
                    this.updateDisplayValue(this.value);
                }
                this.cdr.markForCheck();
            });
        });
    }
    ngOnChanges({ nzStatus, nzDisabled, nzFormatter, nzSize }) {
        if (nzFormatter && !nzFormatter.isFirstChange()) {
            const validValue = this.getCurrentValidValue(this.parsedValue);
            this.setValue(validValue);
            this.updateDisplayValue(validValue);
        }
        if (nzDisabled) {
            this.disabled$.next(this.nzDisabled);
        }
        if (nzStatus) {
            this.setStatusStyles(this.nzStatus, this.hasFeedback);
        }
        if (nzSize) {
            this.size.set(nzSize.currentValue);
        }
    }
    ngAfterViewInit() {
        if (this.nzAutoFocus) {
            this.focus();
        }
    }
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
    setupHandlersListeners() {
        merge(fromEventOutsideAngular(this.upHandler.nativeElement, 'mouseup'), fromEventOutsideAngular(this.upHandler.nativeElement, 'mouseleave'), fromEventOutsideAngular(this.downHandler.nativeElement, 'mouseup'), fromEventOutsideAngular(this.downHandler.nativeElement, 'mouseleave'))
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.stop());
    }
    setStatusStyles(status, hasFeedback) {
        // set inner status
        this.status = status;
        this.hasFeedback = hasFeedback;
        this.cdr.markForCheck();
        // render status if nzStatus is set
        this.statusCls = getStatusClassNames(this.prefixCls, status, hasFeedback);
        Object.keys(this.statusCls).forEach(status => {
            if (this.statusCls[status]) {
                this.renderer.addClass(this.elementRef.nativeElement, status);
            }
            else {
                this.renderer.removeClass(this.elementRef.nativeElement, status);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyComponent, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.FocusMonitor }, { token: i0.Renderer2 }, { token: i2.Directionality }, { token: i3.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputNumberLegacyComponent, isStandalone: true, selector: "nz-input-number", inputs: { nzSize: "nzSize", nzMin: ["nzMin", "nzMin", numberAttribute], nzMax: ["nzMax", "nzMax", numberAttribute], nzParser: "nzParser", nzPrecision: "nzPrecision", nzPrecisionMode: "nzPrecisionMode", nzPlaceHolder: "nzPlaceHolder", nzStatus: "nzStatus", nzStep: ["nzStep", "nzStep", numberAttribute], nzInputMode: "nzInputMode", nzId: "nzId", nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzReadOnly: ["nzReadOnly", "nzReadOnly", booleanAttribute], nzAutoFocus: ["nzAutoFocus", "nzAutoFocus", booleanAttribute], nzBorderless: ["nzBorderless", "nzBorderless", booleanAttribute], nzFormatter: "nzFormatter" }, outputs: { nzBlur: "nzBlur", nzFocus: "nzFocus" }, host: { properties: { "class.ant-input-number-in-form-item": "!!nzFormStatusService", "class.ant-input-number-focused": "isFocused", "class.ant-input-number-lg": "finalSize() === 'large'", "class.ant-input-number-sm": "finalSize() === 'small'", "class.ant-input-number-disabled": "nzDisabled", "class.ant-input-number-readonly": "nzReadOnly", "class.ant-input-number-rtl": "dir === 'rtl'", "class.ant-input-number-borderless": "nzBorderless" }, classAttribute: "ant-input-number" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzInputNumberLegacyComponent),
                multi: true
            },
            { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' },
            NzDestroyService
        ], viewQueries: [{ propertyName: "upHandler", first: true, predicate: ["upHandler"], descendants: true, static: true }, { propertyName: "downHandler", first: true, predicate: ["downHandler"], descendants: true, static: true }, { propertyName: "inputElement", first: true, predicate: ["inputElement"], descendants: true, static: true }], exportAs: ["nzInputNumber"], usesOnChanges: true, hostDirectives: [{ directive: i4.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    <div class="ant-input-number-handler-wrap">
      <span
        #upHandler
        unselectable="unselectable"
        class="ant-input-number-handler ant-input-number-handler-up"
        (mousedown)="up($event)"
        [class.ant-input-number-handler-up-disabled]="disabledUp"
      >
        <nz-icon nzType="up" class="ant-input-number-handler-up-inner" />
      </span>
      <span
        #downHandler
        unselectable="unselectable"
        class="ant-input-number-handler ant-input-number-handler-down"
        (mousedown)="down($event)"
        [class.ant-input-number-handler-down-disabled]="disabledDown"
      >
        <nz-icon nzType="down" class="ant-input-number-handler-down-inner" />
      </span>
    </div>
    <div class="ant-input-number-input-wrap">
      <input
        #inputElement
        autocomplete="off"
        class="ant-input-number-input"
        [attr.id]="nzId"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [disabled]="nzDisabled"
        [attr.min]="nzMin"
        [attr.max]="nzMax"
        [placeholder]="nzPlaceHolder"
        [attr.step]="nzStep"
        [readOnly]="nzReadOnly"
        [attr.inputmode]="nzInputMode"
        [ngModel]="displayValue"
        (ngModelChange)="onModelChange($event)"
      />
    </div>
    @if (hasFeedback && !!status && !nzFormNoStatusService) {
      <nz-form-item-feedback-icon class="ant-input-number-suffix" [status]="status" />
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i6.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i6.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i6.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-input-number',
                    exportAs: 'nzInputNumber',
                    template: `
    <div class="ant-input-number-handler-wrap">
      <span
        #upHandler
        unselectable="unselectable"
        class="ant-input-number-handler ant-input-number-handler-up"
        (mousedown)="up($event)"
        [class.ant-input-number-handler-up-disabled]="disabledUp"
      >
        <nz-icon nzType="up" class="ant-input-number-handler-up-inner" />
      </span>
      <span
        #downHandler
        unselectable="unselectable"
        class="ant-input-number-handler ant-input-number-handler-down"
        (mousedown)="down($event)"
        [class.ant-input-number-handler-down-disabled]="disabledDown"
      >
        <nz-icon nzType="down" class="ant-input-number-handler-down-inner" />
      </span>
    </div>
    <div class="ant-input-number-input-wrap">
      <input
        #inputElement
        autocomplete="off"
        class="ant-input-number-input"
        [attr.id]="nzId"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [disabled]="nzDisabled"
        [attr.min]="nzMin"
        [attr.max]="nzMax"
        [placeholder]="nzPlaceHolder"
        [attr.step]="nzStep"
        [readOnly]="nzReadOnly"
        [attr.inputmode]="nzInputMode"
        [ngModel]="displayValue"
        (ngModelChange)="onModelChange($event)"
      />
    </div>
    @if (hasFeedback && !!status && !nzFormNoStatusService) {
      <nz-form-item-feedback-icon class="ant-input-number-suffix" [status]="status" />
    }
  `,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzInputNumberLegacyComponent),
                            multi: true
                        },
                        { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' },
                        NzDestroyService
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        class: 'ant-input-number',
                        '[class.ant-input-number-in-form-item]': '!!nzFormStatusService',
                        '[class.ant-input-number-focused]': 'isFocused',
                        '[class.ant-input-number-lg]': `finalSize() === 'large'`,
                        '[class.ant-input-number-sm]': `finalSize() === 'small'`,
                        '[class.ant-input-number-disabled]': 'nzDisabled',
                        '[class.ant-input-number-readonly]': 'nzReadOnly',
                        '[class.ant-input-number-rtl]': `dir === 'rtl'`,
                        '[class.ant-input-number-borderless]': `nzBorderless`
                    },
                    imports: [NzIconModule, FormsModule, NzFormItemFeedbackIconComponent],
                    hostDirectives: [NzSpaceCompactItemDirective]
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.FocusMonitor }, { type: i0.Renderer2 }, { type: i2.Directionality }, { type: i3.NzDestroyService }], propDecorators: { nzBlur: [{
                type: Output
            }], nzFocus: [{
                type: Output
            }], upHandler: [{
                type: ViewChild,
                args: ['upHandler', { static: true }]
            }], downHandler: [{
                type: ViewChild,
                args: ['downHandler', { static: true }]
            }], inputElement: [{
                type: ViewChild,
                args: ['inputElement', { static: true }]
            }], nzSize: [{
                type: Input
            }], nzMin: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzMax: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzParser: [{
                type: Input
            }], nzPrecision: [{
                type: Input
            }], nzPrecisionMode: [{
                type: Input
            }], nzPlaceHolder: [{
                type: Input
            }], nzStatus: [{
                type: Input
            }], nzStep: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzInputMode: [{
                type: Input
            }], nzId: [{
                type: Input
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzReadOnly: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBorderless: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzFormatter: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
class NzInputNumberGroupSlotComponent {
    icon = null;
    type = null;
    template = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupSlotComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputNumberGroupSlotComponent, isStandalone: true, selector: "[nz-input-number-group-slot]", inputs: { icon: "icon", type: "type", template: "template" }, host: { properties: { "class.ant-input-number-group-addon": "type === 'addon'", "class.ant-input-number-prefix": "type === 'prefix'", "class.ant-input-number-suffix": "type === 'suffix'" } }, ngImport: i0, template: `
    @if (icon) {
      <nz-icon [nzType]="icon" />
    }
    <ng-container *nzStringTemplateOutlet="template">{{ template }}</ng-container>
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i2$1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupSlotComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-input-number-group-slot]',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (icon) {
      <nz-icon [nzType]="icon" />
    }
    <ng-container *nzStringTemplateOutlet="template">{{ template }}</ng-container>
    <ng-content></ng-content>
  `,
                    host: {
                        '[class.ant-input-number-group-addon]': `type === 'addon'`,
                        '[class.ant-input-number-prefix]': `type === 'prefix'`,
                        '[class.ant-input-number-suffix]': `type === 'suffix'`
                    },
                    imports: [NzIconModule, NzOutletModule]
                }]
        }], propDecorators: { icon: [{
                type: Input
            }], type: [{
                type: Input
            }], template: [{
                type: Input
            }] } });

/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
class NzInputNumberGroupWhitSuffixOrPrefixDirective {
    elementRef;
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupWhitSuffixOrPrefixDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputNumberGroupWhitSuffixOrPrefixDirective, isStandalone: true, selector: "nz-input-number-group[nzSuffix], nz-input-number-group[nzPrefix]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupWhitSuffixOrPrefixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: `nz-input-number-group[nzSuffix], nz-input-number-group[nzPrefix]`
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
class NzInputNumberGroupComponent {
    focusMonitor;
    elementRef;
    renderer;
    cdr;
    directionality;
    listOfNzInputNumberComponent;
    nzAddOnBeforeIcon = null;
    nzAddOnAfterIcon = null;
    nzPrefixIcon = null;
    nzSuffixIcon = null;
    nzAddOnBefore;
    nzAddOnAfter;
    nzPrefix;
    nzStatus = '';
    nzSuffix;
    nzSize = 'default';
    /**
     * @deprecated Will be removed in v20. Use `NzSpaceCompactComponent` instead.
     */
    nzCompact = false;
    isLarge = false;
    isSmall = false;
    isAffix = false;
    isAddOn = false;
    isFeedback = false;
    focused = false;
    disabled = false;
    dir = 'ltr';
    // status
    prefixCls = 'ant-input-number';
    affixStatusCls = {};
    groupStatusCls = {};
    affixInGroupStatusCls = {};
    status = '';
    hasFeedback = false;
    destroy$ = new Subject();
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    nzFormNoStatusService = inject(NzFormNoStatusService, { optional: true });
    constructor(focusMonitor, elementRef, renderer, cdr, directionality) {
        this.focusMonitor = focusMonitor;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.cdr = cdr;
        this.directionality = directionality;
    }
    updateChildrenInputSize() {
        if (this.listOfNzInputNumberComponent) {
            this.listOfNzInputNumberComponent.forEach(item => item['size'].set(this.nzSize));
        }
    }
    ngOnInit() {
        this.nzFormStatusService?.formStatusChanges
            .pipe(distinctUntilChanged((pre, cur) => {
            return pre.status === cur.status && pre.hasFeedback === cur.hasFeedback;
        }), takeUntil(this.destroy$))
            .subscribe(({ status, hasFeedback }) => {
            this.setStatusStyles(status, hasFeedback);
        });
        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(focusOrigin => {
            this.focused = !!focusOrigin;
            this.cdr.markForCheck();
        });
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngAfterContentInit() {
        this.updateChildrenInputSize();
        const listOfInputChange$ = this.listOfNzInputNumberComponent.changes.pipe(startWith(this.listOfNzInputNumberComponent));
        listOfInputChange$
            .pipe(switchMap(list => merge(...[listOfInputChange$, ...list.map((input) => input.disabled$)])), mergeMap(() => listOfInputChange$), map(list => list.some((input) => input.nzDisabled)), takeUntil(this.destroy$))
            .subscribe(disabled => {
            this.disabled = disabled;
            this.cdr.markForCheck();
        });
    }
    ngOnChanges(changes) {
        const { nzSize, nzSuffix, nzPrefix, nzPrefixIcon, nzSuffixIcon, nzAddOnAfter, nzAddOnBefore, nzAddOnAfterIcon, nzAddOnBeforeIcon, nzStatus } = changes;
        if (nzSize) {
            this.updateChildrenInputSize();
            this.isLarge = this.nzSize === 'large';
            this.isSmall = this.nzSize === 'small';
        }
        if (nzSuffix || nzPrefix || nzPrefixIcon || nzSuffixIcon) {
            this.isAffix = !!(this.nzSuffix || this.nzPrefix || this.nzPrefixIcon || this.nzSuffixIcon);
        }
        if (nzAddOnAfter || nzAddOnBefore || nzAddOnAfterIcon || nzAddOnBeforeIcon) {
            this.isAddOn = !!(this.nzAddOnAfter || this.nzAddOnBefore || this.nzAddOnAfterIcon || this.nzAddOnBeforeIcon);
            this.nzFormNoStatusService?.noFormStatus?.next(this.isAddOn);
        }
        if (nzStatus) {
            this.setStatusStyles(this.nzStatus, this.hasFeedback);
        }
    }
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.destroy$.next();
        this.destroy$.complete();
    }
    setStatusStyles(status, hasFeedback) {
        // set inner status
        this.status = status;
        this.hasFeedback = hasFeedback;
        this.isFeedback = !!status && hasFeedback;
        const baseAffix = !!(this.nzSuffix || this.nzPrefix || this.nzPrefixIcon || this.nzSuffixIcon);
        this.isAffix = baseAffix || (!this.isAddOn && hasFeedback);
        this.affixInGroupStatusCls =
            this.isAffix || this.isFeedback
                ? (this.affixStatusCls = getStatusClassNames(`${this.prefixCls}-affix-wrapper`, status, hasFeedback))
                : {};
        this.cdr.markForCheck();
        // render status if nzStatus is set
        this.affixStatusCls = getStatusClassNames(`${this.prefixCls}-affix-wrapper`, this.isAddOn ? '' : status, this.isAddOn ? false : hasFeedback);
        this.groupStatusCls = getStatusClassNames(`${this.prefixCls}-group-wrapper`, this.isAddOn ? status : '', this.isAddOn ? hasFeedback : false);
        const statusCls = {
            ...this.affixStatusCls,
            ...this.groupStatusCls
        };
        Object.keys(statusCls).forEach(status => {
            if (statusCls[status]) {
                this.renderer.addClass(this.elementRef.nativeElement, status);
            }
            else {
                this.renderer.removeClass(this.elementRef.nativeElement, status);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupComponent, deps: [{ token: i1.FocusMonitor }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputNumberGroupComponent, isStandalone: true, selector: "nz-input-number-group", inputs: { nzAddOnBeforeIcon: "nzAddOnBeforeIcon", nzAddOnAfterIcon: "nzAddOnAfterIcon", nzPrefixIcon: "nzPrefixIcon", nzSuffixIcon: "nzSuffixIcon", nzAddOnBefore: "nzAddOnBefore", nzAddOnAfter: "nzAddOnAfter", nzPrefix: "nzPrefix", nzStatus: "nzStatus", nzSuffix: "nzSuffix", nzSize: "nzSize", nzCompact: ["nzCompact", "nzCompact", booleanAttribute] }, host: { properties: { "class.ant-input-number-group": "nzCompact", "class.ant-input-number-group-compact": "nzCompact", "class.ant-input-number-group-wrapper": "isAddOn", "class.ant-input-number-group-wrapper-rtl": "isAddOn && dir === 'rtl'", "class.ant-input-number-group-wrapper-lg": "isAddOn && isLarge", "class.ant-input-number-group-wrapper-sm": "isAddOn && isSmall", "class.ant-input-number-affix-wrapper": "!isAddOn && isAffix", "class.ant-input-number-affix-wrapper-rtl": "!isAddOn && dir === 'rtl'", "class.ant-input-number-affix-wrapper-focused": "!isAddOn && isAffix && focused", "class.ant-input-number-affix-wrapper-disabled": "!isAddOn && isAffix && disabled", "class.ant-input-number-affix-wrapper-lg": "!isAddOn && isAffix && isLarge", "class.ant-input-number-affix-wrapper-sm": "!isAddOn && isAffix && isSmall" } }, providers: [NzFormNoStatusService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' }], queries: [{ propertyName: "listOfNzInputNumberComponent", predicate: NzInputNumberLegacyComponent, descendants: true }], exportAs: ["nzInputNumberGroup"], usesOnChanges: true, hostDirectives: [{ directive: i4.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    @if (isAddOn) {
      <span class="ant-input-number-wrapper ant-input-number-group">
        @if (nzAddOnBefore || nzAddOnBeforeIcon) {
          <div nz-input-number-group-slot type="addon" [icon]="nzAddOnBeforeIcon" [template]="nzAddOnBefore"></div>
        }

        @if (isAffix || hasFeedback) {
          <div
            class="ant-input-number-affix-wrapper"
            [class.ant-input-number-affix-wrapper-disabled]="disabled"
            [class.ant-input-number-affix-wrapper-sm]="isSmall"
            [class.ant-input-number-affix-wrapper-lg]="isLarge"
            [class.ant-input-number-affix-wrapper-focused]="focused"
            [class]="affixInGroupStatusCls"
          >
            <ng-template [ngTemplateOutlet]="affixTemplate"></ng-template>
          </div>
        } @else {
          <ng-template [ngTemplateOutlet]="contentTemplate" />
        }

        @if (nzAddOnAfter || nzAddOnAfterIcon) {
          <span nz-input-number-group-slot type="addon" [icon]="nzAddOnAfterIcon" [template]="nzAddOnAfter"></span>
        }
      </span>
    } @else {
      @if (isAffix) {
        <ng-template [ngTemplateOutlet]="affixTemplate" />
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate" />
      }
    }

    <!-- Affix Template -->
    <ng-template #affixTemplate>
      @if (nzPrefix || nzPrefixIcon) {
        <span nz-input-number-group-slot type="prefix" [icon]="nzPrefixIcon" [template]="nzPrefix"></span>
      }
      <ng-template [ngTemplateOutlet]="contentTemplate" />
      @if (nzSuffix || nzSuffixIcon || isFeedback) {
        <span nz-input-number-group-slot type="suffix" [icon]="nzSuffixIcon" [template]="nzSuffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>

    <!-- Content Template -->
    <ng-template #contentTemplate>
      <ng-content />
      @if (!isAddOn && !isAffix && isFeedback) {
        <span nz-input-number-group-slot type="suffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzInputNumberGroupSlotComponent, selector: "[nz-input-number-group-slot]", inputs: ["icon", "type", "template"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-input-number-group',
                    exportAs: 'nzInputNumberGroup',
                    imports: [NzInputNumberGroupSlotComponent, NgTemplateOutlet, NzFormItemFeedbackIconComponent],
                    template: `
    @if (isAddOn) {
      <span class="ant-input-number-wrapper ant-input-number-group">
        @if (nzAddOnBefore || nzAddOnBeforeIcon) {
          <div nz-input-number-group-slot type="addon" [icon]="nzAddOnBeforeIcon" [template]="nzAddOnBefore"></div>
        }

        @if (isAffix || hasFeedback) {
          <div
            class="ant-input-number-affix-wrapper"
            [class.ant-input-number-affix-wrapper-disabled]="disabled"
            [class.ant-input-number-affix-wrapper-sm]="isSmall"
            [class.ant-input-number-affix-wrapper-lg]="isLarge"
            [class.ant-input-number-affix-wrapper-focused]="focused"
            [class]="affixInGroupStatusCls"
          >
            <ng-template [ngTemplateOutlet]="affixTemplate"></ng-template>
          </div>
        } @else {
          <ng-template [ngTemplateOutlet]="contentTemplate" />
        }

        @if (nzAddOnAfter || nzAddOnAfterIcon) {
          <span nz-input-number-group-slot type="addon" [icon]="nzAddOnAfterIcon" [template]="nzAddOnAfter"></span>
        }
      </span>
    } @else {
      @if (isAffix) {
        <ng-template [ngTemplateOutlet]="affixTemplate" />
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate" />
      }
    }

    <!-- Affix Template -->
    <ng-template #affixTemplate>
      @if (nzPrefix || nzPrefixIcon) {
        <span nz-input-number-group-slot type="prefix" [icon]="nzPrefixIcon" [template]="nzPrefix"></span>
      }
      <ng-template [ngTemplateOutlet]="contentTemplate" />
      @if (nzSuffix || nzSuffixIcon || isFeedback) {
        <span nz-input-number-group-slot type="suffix" [icon]="nzSuffixIcon" [template]="nzSuffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>

    <!-- Content Template -->
    <ng-template #contentTemplate>
      <ng-content />
      @if (!isAddOn && !isAffix && isFeedback) {
        <span nz-input-number-group-slot type="suffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [NzFormNoStatusService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' }],
                    host: {
                        '[class.ant-input-number-group]': 'nzCompact',
                        '[class.ant-input-number-group-compact]': 'nzCompact',
                        '[class.ant-input-number-group-wrapper]': `isAddOn`,
                        '[class.ant-input-number-group-wrapper-rtl]': `isAddOn && dir === 'rtl'`,
                        '[class.ant-input-number-group-wrapper-lg]': `isAddOn && isLarge`,
                        '[class.ant-input-number-group-wrapper-sm]': `isAddOn && isSmall`,
                        '[class.ant-input-number-affix-wrapper]': `!isAddOn && isAffix`,
                        '[class.ant-input-number-affix-wrapper-rtl]': `!isAddOn && dir === 'rtl'`,
                        '[class.ant-input-number-affix-wrapper-focused]': `!isAddOn && isAffix && focused`,
                        '[class.ant-input-number-affix-wrapper-disabled]': `!isAddOn && isAffix && disabled`,
                        '[class.ant-input-number-affix-wrapper-lg]': `!isAddOn && isAffix && isLarge`,
                        '[class.ant-input-number-affix-wrapper-sm]': `!isAddOn && isAffix && isSmall`
                    },
                    hostDirectives: [NzSpaceCompactItemDirective]
                }]
        }], ctorParameters: () => [{ type: i1.FocusMonitor }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality }], propDecorators: { listOfNzInputNumberComponent: [{
                type: ContentChildren,
                args: [NzInputNumberLegacyComponent, { descendants: true }]
            }], nzAddOnBeforeIcon: [{
                type: Input
            }], nzAddOnAfterIcon: [{
                type: Input
            }], nzPrefixIcon: [{
                type: Input
            }], nzSuffixIcon: [{
                type: Input
            }], nzAddOnBefore: [{
                type: Input
            }], nzAddOnAfter: [{
                type: Input
            }], nzPrefix: [{
                type: Input
            }], nzStatus: [{
                type: Input
            }], nzSuffix: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzCompact: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use the new version `<nz-input-number>`.
 */
class NzInputNumberLegacyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyModule, imports: [NzInputNumberLegacyComponent,
            NzInputNumberGroupComponent,
            NzInputNumberGroupWhitSuffixOrPrefixDirective,
            NzInputNumberGroupSlotComponent], exports: [NzInputNumberLegacyComponent, NzInputNumberGroupComponent, NzInputNumberGroupWhitSuffixOrPrefixDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyModule, imports: [NzInputNumberLegacyComponent,
            NzInputNumberGroupComponent,
            NzInputNumberGroupSlotComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberLegacyModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzInputNumberLegacyComponent,
                        NzInputNumberGroupComponent,
                        NzInputNumberGroupWhitSuffixOrPrefixDirective,
                        NzInputNumberGroupSlotComponent
                    ],
                    exports: [NzInputNumberLegacyComponent, NzInputNumberGroupComponent, NzInputNumberGroupWhitSuffixOrPrefixDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzInputNumberGroupComponent, NzInputNumberGroupSlotComponent, NzInputNumberGroupWhitSuffixOrPrefixDirective, NzInputNumberLegacyComponent, NzInputNumberLegacyModule };
//# sourceMappingURL=ng-zorro-antd-input-number-legacy.mjs.map
