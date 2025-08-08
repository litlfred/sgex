import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ENTER, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { input, numberAttribute, booleanAttribute, output, inject, viewChild, ElementRef, Injector, signal, linkedSignal, contentChild, computed, DestroyRef, afterNextRender, untracked, forwardRef, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzFormStatusService, NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import { isNotNil, getStatusClassNames, isNil } from 'ng-zorro-antd/core/util';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputPrefixDirective, NzInputSuffixDirective, NzInputAddonBeforeDirective, NzInputAddonAfterDirective } from 'ng-zorro-antd/input';
import * as i1 from 'ng-zorro-antd/space';
import { NZ_SPACE_COMPACT_SIZE, NZ_SPACE_COMPACT_ITEM_TYPE, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputNumberComponent {
    nzId = input(null);
    nzSize = input('default');
    nzPlaceHolder = input(null);
    nzStatus = input('');
    nzStep = input(1, { transform: numberAttribute });
    nzMin = input(Number.MIN_SAFE_INTEGER, { transform: numberAttribute });
    nzMax = input(Number.MAX_SAFE_INTEGER, { transform: numberAttribute });
    nzPrecision = input(null);
    nzParser = input();
    nzFormatter = input();
    nzDisabled = input(false, { transform: booleanAttribute });
    nzReadOnly = input(false, { transform: booleanAttribute });
    nzAutoFocus = input(false, { transform: booleanAttribute });
    nzBordered = input(true, { transform: booleanAttribute });
    nzKeyboard = input(true, { transform: booleanAttribute });
    nzControls = input(true, { transform: booleanAttribute });
    nzBlur = output();
    nzFocus = output();
    nzOnStep = output();
    onChange = () => { };
    onTouched = () => { };
    isDisabledFirstChange = true;
    compactSize = inject(NZ_SPACE_COMPACT_SIZE, { optional: true });
    inputRef = viewChild.required('input');
    hostRef = viewChild('inputNumberHost');
    elementRef = inject(ElementRef);
    injector = inject(Injector);
    focusMonitor = inject(FocusMonitor);
    directionality = inject(Directionality);
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    autoStepTimer = null;
    defaultFormater = (value) => {
        const precision = this.nzPrecision();
        if (isNotNil(precision)) {
            return value.toFixed(precision);
        }
        return value.toString();
    };
    value = signal(null);
    displayValue = signal('');
    dir = toSignal(this.directionality.change, { initialValue: this.directionality.value });
    focused = signal(false);
    hasFeedback = signal(false);
    finalStatus = linkedSignal(() => this.nzStatus());
    finalDisabled = linkedSignal(() => this.nzDisabled());
    prefix = contentChild(NzInputPrefixDirective);
    suffix = contentChild(NzInputSuffixDirective);
    addonBefore = contentChild(NzInputAddonBeforeDirective);
    addonAfter = contentChild(NzInputAddonAfterDirective);
    hasAffix = computed(() => !!this.prefix() || !!this.suffix() || this.hasFeedback());
    hasAddon = computed(() => !!this.addonBefore() || !!this.addonAfter());
    class = computed(() => {
        if (this.hasAddon()) {
            return this.groupWrapperClass();
        }
        if (this.hasAffix()) {
            return this.affixWrapperClass();
        }
        return this.inputNumberClass();
    });
    inputNumberClass = computed(() => {
        return {
            'ant-input-number': true,
            'ant-input-number-lg': this.finalSize() === 'large',
            'ant-input-number-sm': this.finalSize() === 'small',
            'ant-input-number-disabled': this.finalDisabled(),
            'ant-input-number-readonly': this.nzReadOnly(),
            'ant-input-number-borderless': !this.nzBordered(),
            'ant-input-number-focused': this.focused(),
            'ant-input-number-rtl': this.dir() === 'rtl',
            'ant-input-number-in-form-item': !!this.nzFormStatusService,
            'ant-input-number-out-of-range': this.value() !== null && !isInRange(this.value(), this.nzMin(), this.nzMax()),
            ...getStatusClassNames('ant-input-number', this.finalStatus(), this.hasFeedback())
        };
    });
    affixWrapperClass = computed(() => {
        return {
            'ant-input-number-affix-wrapper': true,
            'ant-input-number-affix-wrapper-disabled': this.finalDisabled(),
            'ant-input-number-affix-wrapper-readonly': this.nzReadOnly(),
            'ant-input-number-affix-wrapper-borderless': !this.nzBordered(),
            'ant-input-number-affix-wrapper-focused': this.focused(),
            'ant-input-number-affix-wrapper-rtl': this.dir() === 'rtl',
            ...getStatusClassNames('ant-input-number-affix-wrapper', this.finalStatus(), this.hasFeedback())
        };
    });
    groupWrapperClass = computed(() => {
        return {
            'ant-input-number-group-wrapper': true,
            'ant-input-number-group-wrapper-rtl': this.dir() === 'rtl',
            ...getStatusClassNames('ant-input-number-group-wrapper', this.finalStatus(), this.hasFeedback())
        };
    });
    finalSize = computed(() => {
        if (this.compactSize) {
            return this.compactSize();
        }
        return this.nzSize();
    });
    upDisabled = computed(() => {
        return !isNil(this.value()) && this.value() >= this.nzMax();
    });
    downDisabled = computed(() => {
        return !isNil(this.value()) && this.value() <= this.nzMin();
    });
    constructor() {
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            const hostRef = this.hostRef();
            const element = hostRef ? hostRef : this.elementRef;
            this.focusMonitor
                .monitor(element, true)
                .pipe(takeUntilDestroyed(destroyRef))
                .subscribe(origin => {
                this.focused.set(!!origin);
                if (origin) {
                    this.nzFocus.emit();
                }
                else {
                    this.fixValue();
                    this.onTouched();
                    this.nzBlur.emit();
                }
            });
            destroyRef.onDestroy(() => {
                this.focusMonitor.stopMonitoring(element);
            });
        });
        this.nzFormStatusService?.formStatusChanges.pipe(takeUntilDestroyed()).subscribe(({ status, hasFeedback }) => {
            this.finalStatus.set(status);
            this.hasFeedback.set(hasFeedback);
        });
    }
    ngOnInit() {
        if (this.nzAutoFocus()) {
            afterNextRender(() => this.focus(), { injector: this.injector });
        }
    }
    writeValue(value) {
        untracked(() => {
            this.value.set(value);
            this.setValue(value);
        });
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(disabled) {
        untracked(() => {
            this.finalDisabled.set((this.isDisabledFirstChange && this.nzDisabled()) || disabled);
        });
        this.isDisabledFirstChange = false;
    }
    focus() {
        this.inputRef().nativeElement.focus();
    }
    blur() {
        this.inputRef().nativeElement.blur();
    }
    step(event, up) {
        // Ignore step since out of range
        if ((up && this.upDisabled()) || (!up && this.downDisabled())) {
            return;
        }
        // When hold the shift key, the step is 10 times
        let step = event.shiftKey ? this.nzStep() * 10 : this.nzStep();
        if (!up) {
            step = -step;
        }
        const places = getDecimalPlaces(step);
        const multiple = 10 ** places;
        const nextValue = getRangeValue(
        // Convert floating point numbers to integers to avoid floating point math errors
        (Math.round((this.value() || 0) * multiple) + Math.round(step * multiple)) / multiple, this.nzMin(), this.nzMax(), this.nzPrecision());
        this.setValue(nextValue);
        this.nzOnStep.emit({
            type: up ? 'up' : 'down',
            value: this.value(),
            offset: this.nzStep()
        });
        this.focus();
    }
    setValue(value) {
        const formatter = this.nzFormatter() ?? this.defaultFormater;
        const precision = this.nzPrecision();
        if (isNotNil(precision)) {
            value &&= +value.toFixed(precision);
        }
        const formatedValue = value === null ? '' : formatter(value);
        this.displayValue.set(formatedValue);
        this.updateValue(value);
    }
    setValueByTyping(value) {
        if (value === '') {
            this.displayValue.set('');
            this.updateValue(null);
            return;
        }
        const parser = this.nzParser() ?? defaultParser;
        const parsedValue = parser(value);
        if (isNotCompleteNumber(value) || Number.isNaN(parsedValue)) {
            this.displayValue.set(value);
            return;
        }
        const formattedValue = this.nzFormatter()?.(parsedValue) ?? parsedValue.toString();
        this.displayValue.set(formattedValue);
        if (!isInRange(parsedValue, this.nzMin(), this.nzMax())) {
            return;
        }
        this.updateValue(parsedValue);
    }
    updateValue(value) {
        if (this.value() !== value) {
            this.value.set(value);
            this.onChange(value);
        }
    }
    fixValue() {
        const displayValue = this.displayValue();
        if (displayValue === '') {
            return;
        }
        const parser = this.nzParser() ?? defaultParser;
        let fixedValue = parser(displayValue);
        // If parsing fails, revert to the previous value
        if (Number.isNaN(fixedValue)) {
            fixedValue = this.value();
        }
        else {
            const precision = this.nzPrecision();
            // fix precision
            if (isNotNil(precision) && getDecimalPlaces(fixedValue) !== precision) {
                fixedValue = +fixedValue.toFixed(precision);
            }
            // fix range
            if (!isInRange(fixedValue, this.nzMin(), this.nzMax())) {
                fixedValue = getRangeValue(fixedValue, this.nzMin(), this.nzMax(), precision);
            }
        }
        this.setValue(fixedValue);
    }
    stopAutoStep() {
        if (this.autoStepTimer !== null) {
            clearTimeout(this.autoStepTimer);
            this.autoStepTimer = null;
        }
    }
    onStepMouseDown(event, up) {
        event.preventDefault();
        this.stopAutoStep();
        this.step(event, up);
        // Loop step for interval
        const loopStep = () => {
            this.step(event, up);
            this.autoStepTimer = setTimeout(loopStep, STEP_INTERVAL);
        };
        // First time press will wait some time to trigger loop step update
        this.autoStepTimer = setTimeout(loopStep, STEP_DELAY);
    }
    onKeyDown(event) {
        switch (event.keyCode) {
            case UP_ARROW:
                event.preventDefault();
                this.nzKeyboard() && this.step(event, true);
                break;
            case DOWN_ARROW:
                event.preventDefault();
                this.nzKeyboard() && this.step(event, false);
                break;
            case ENTER:
                this.fixValue();
                break;
        }
    }
    onInput(value) {
        this.setValueByTyping(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputNumberComponent, isStandalone: true, selector: "nz-input-number", inputs: { nzId: { classPropertyName: "nzId", publicName: "nzId", isSignal: true, isRequired: false, transformFunction: null }, nzSize: { classPropertyName: "nzSize", publicName: "nzSize", isSignal: true, isRequired: false, transformFunction: null }, nzPlaceHolder: { classPropertyName: "nzPlaceHolder", publicName: "nzPlaceHolder", isSignal: true, isRequired: false, transformFunction: null }, nzStatus: { classPropertyName: "nzStatus", publicName: "nzStatus", isSignal: true, isRequired: false, transformFunction: null }, nzStep: { classPropertyName: "nzStep", publicName: "nzStep", isSignal: true, isRequired: false, transformFunction: null }, nzMin: { classPropertyName: "nzMin", publicName: "nzMin", isSignal: true, isRequired: false, transformFunction: null }, nzMax: { classPropertyName: "nzMax", publicName: "nzMax", isSignal: true, isRequired: false, transformFunction: null }, nzPrecision: { classPropertyName: "nzPrecision", publicName: "nzPrecision", isSignal: true, isRequired: false, transformFunction: null }, nzParser: { classPropertyName: "nzParser", publicName: "nzParser", isSignal: true, isRequired: false, transformFunction: null }, nzFormatter: { classPropertyName: "nzFormatter", publicName: "nzFormatter", isSignal: true, isRequired: false, transformFunction: null }, nzDisabled: { classPropertyName: "nzDisabled", publicName: "nzDisabled", isSignal: true, isRequired: false, transformFunction: null }, nzReadOnly: { classPropertyName: "nzReadOnly", publicName: "nzReadOnly", isSignal: true, isRequired: false, transformFunction: null }, nzAutoFocus: { classPropertyName: "nzAutoFocus", publicName: "nzAutoFocus", isSignal: true, isRequired: false, transformFunction: null }, nzBordered: { classPropertyName: "nzBordered", publicName: "nzBordered", isSignal: true, isRequired: false, transformFunction: null }, nzKeyboard: { classPropertyName: "nzKeyboard", publicName: "nzKeyboard", isSignal: true, isRequired: false, transformFunction: null }, nzControls: { classPropertyName: "nzControls", publicName: "nzControls", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { nzBlur: "nzBlur", nzFocus: "nzFocus", nzOnStep: "nzOnStep" }, host: { listeners: { "keydown": "onKeyDown($event)" }, properties: { "class": "class()" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzInputNumberComponent),
                multi: true
            },
            { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' }
        ], queries: [{ propertyName: "prefix", first: true, predicate: NzInputPrefixDirective, descendants: true, isSignal: true }, { propertyName: "suffix", first: true, predicate: NzInputSuffixDirective, descendants: true, isSignal: true }, { propertyName: "addonBefore", first: true, predicate: NzInputAddonBeforeDirective, descendants: true, isSignal: true }, { propertyName: "addonAfter", first: true, predicate: NzInputAddonAfterDirective, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["input"], descendants: true, isSignal: true }, { propertyName: "hostRef", first: true, predicate: ["inputNumberHost"], descendants: true, isSignal: true }], exportAs: ["nzInputNumber"], hostDirectives: [{ directive: i1.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    @if (hasAddon()) {
      <ng-template [ngTemplateOutlet]="inputNumberWithAddonInner" />
    } @else if (hasAffix()) {
      <ng-template [ngTemplateOutlet]="inputNumberWithAffixInner" />
    } @else {
      <ng-template [ngTemplateOutlet]="inputNumberInner" />
    }

    <ng-template #inputNumberWithAddonInner>
      <div class="ant-input-number-wrapper ant-input-number-group">
        @if (addonBefore()) {
          <div class="ant-input-number-group-addon">
            <ng-content select="[nzInputAddonBefore]"></ng-content>
          </div>
        }

        @if (hasAffix()) {
          <ng-template [ngTemplateOutlet]="inputNumberWithAffix" />
        } @else {
          <ng-template [ngTemplateOutlet]="inputNumber" />
        }

        @if (addonAfter()) {
          <div class="ant-input-number-group-addon">
            <ng-content select="[nzInputAddonAfter]"></ng-content>
          </div>
        }
      </div>
    </ng-template>

    <ng-template #inputNumberWithAffix>
      <div [class]="affixWrapperClass()">
        <ng-template [ngTemplateOutlet]="inputNumberWithAffixInner" />
      </div>
    </ng-template>

    <ng-template #inputNumberWithAffixInner>
      @if (prefix()) {
        <span class="ant-input-number-prefix">
          <ng-content select="[nzInputPrefix]"></ng-content>
        </span>
      }
      <ng-template [ngTemplateOutlet]="inputNumber" />
      @if (suffix() || hasFeedback()) {
        <span class="ant-input-number-suffix">
          <ng-content select="[nzInputSuffix]"></ng-content>
          @if (hasFeedback() && finalStatus()) {
            <nz-form-item-feedback-icon [status]="finalStatus()" />
          }
        </span>
      }
    </ng-template>

    <ng-template #inputNumber>
      <div #inputNumberHost [class]="inputNumberClass()">
        <ng-template [ngTemplateOutlet]="inputNumberInner" />
      </div>
    </ng-template>

    <ng-template #inputNumberInner>
      @if (nzControls()) {
        <div #handlers class="ant-input-number-handler-wrap" (mouseup)="stopAutoStep()" (mouseleave)="stopAutoStep()">
          <span
            role="button"
            unselectable="on"
            class="ant-input-number-handler ant-input-number-handler-up"
            [class.ant-input-number-handler-up-disabled]="upDisabled()"
            [attr.aria-disabled]="upDisabled()"
            (mousedown)="onStepMouseDown($event, true)"
          >
            <ng-content select="[nzInputNumberUpIcon]">
              <nz-icon nzType="up" class="ant-input-number-handler-up-inner" />
            </ng-content>
          </span>
          <span
            role="button"
            unselectable="on"
            class="ant-input-number-handler ant-input-number-handler-down"
            [class.ant-input-number-handler-down-disabled]="downDisabled()"
            [attr.aria-disabled]="downDisabled()"
            (mousedown)="onStepMouseDown($event, false)"
          >
            <ng-content select="[nzInputNumberDownIcon]">
              <nz-icon nzType="down" class="ant-input-number-handler-down-inner" />
            </ng-content>
          </span>
        </div>
      }

      <div class="ant-input-number-input-wrap">
        <input
          #input
          autocomplete="off"
          role="spinbutton"
          class="ant-input-number-input"
          [attr.aria-valuemin]="nzMin()"
          [attr.aria-valuemax]="nzMax()"
          [attr.id]="nzId()"
          [attr.step]="nzStep()"
          [attr.value]="displayValue()"
          [value]="displayValue()"
          [placeholder]="nzPlaceHolder() ?? ''"
          [disabled]="finalDisabled()"
          [readOnly]="nzReadOnly()"
          (input)="onInput(input.value)"
        />
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-input-number',
                    exportAs: 'nzInputNumber',
                    imports: [NzIconModule, NzFormItemFeedbackIconComponent, NgTemplateOutlet],
                    template: `
    @if (hasAddon()) {
      <ng-template [ngTemplateOutlet]="inputNumberWithAddonInner" />
    } @else if (hasAffix()) {
      <ng-template [ngTemplateOutlet]="inputNumberWithAffixInner" />
    } @else {
      <ng-template [ngTemplateOutlet]="inputNumberInner" />
    }

    <ng-template #inputNumberWithAddonInner>
      <div class="ant-input-number-wrapper ant-input-number-group">
        @if (addonBefore()) {
          <div class="ant-input-number-group-addon">
            <ng-content select="[nzInputAddonBefore]"></ng-content>
          </div>
        }

        @if (hasAffix()) {
          <ng-template [ngTemplateOutlet]="inputNumberWithAffix" />
        } @else {
          <ng-template [ngTemplateOutlet]="inputNumber" />
        }

        @if (addonAfter()) {
          <div class="ant-input-number-group-addon">
            <ng-content select="[nzInputAddonAfter]"></ng-content>
          </div>
        }
      </div>
    </ng-template>

    <ng-template #inputNumberWithAffix>
      <div [class]="affixWrapperClass()">
        <ng-template [ngTemplateOutlet]="inputNumberWithAffixInner" />
      </div>
    </ng-template>

    <ng-template #inputNumberWithAffixInner>
      @if (prefix()) {
        <span class="ant-input-number-prefix">
          <ng-content select="[nzInputPrefix]"></ng-content>
        </span>
      }
      <ng-template [ngTemplateOutlet]="inputNumber" />
      @if (suffix() || hasFeedback()) {
        <span class="ant-input-number-suffix">
          <ng-content select="[nzInputSuffix]"></ng-content>
          @if (hasFeedback() && finalStatus()) {
            <nz-form-item-feedback-icon [status]="finalStatus()" />
          }
        </span>
      }
    </ng-template>

    <ng-template #inputNumber>
      <div #inputNumberHost [class]="inputNumberClass()">
        <ng-template [ngTemplateOutlet]="inputNumberInner" />
      </div>
    </ng-template>

    <ng-template #inputNumberInner>
      @if (nzControls()) {
        <div #handlers class="ant-input-number-handler-wrap" (mouseup)="stopAutoStep()" (mouseleave)="stopAutoStep()">
          <span
            role="button"
            unselectable="on"
            class="ant-input-number-handler ant-input-number-handler-up"
            [class.ant-input-number-handler-up-disabled]="upDisabled()"
            [attr.aria-disabled]="upDisabled()"
            (mousedown)="onStepMouseDown($event, true)"
          >
            <ng-content select="[nzInputNumberUpIcon]">
              <nz-icon nzType="up" class="ant-input-number-handler-up-inner" />
            </ng-content>
          </span>
          <span
            role="button"
            unselectable="on"
            class="ant-input-number-handler ant-input-number-handler-down"
            [class.ant-input-number-handler-down-disabled]="downDisabled()"
            [attr.aria-disabled]="downDisabled()"
            (mousedown)="onStepMouseDown($event, false)"
          >
            <ng-content select="[nzInputNumberDownIcon]">
              <nz-icon nzType="down" class="ant-input-number-handler-down-inner" />
            </ng-content>
          </span>
        </div>
      }

      <div class="ant-input-number-input-wrap">
        <input
          #input
          autocomplete="off"
          role="spinbutton"
          class="ant-input-number-input"
          [attr.aria-valuemin]="nzMin()"
          [attr.aria-valuemax]="nzMax()"
          [attr.id]="nzId()"
          [attr.step]="nzStep()"
          [attr.value]="displayValue()"
          [value]="displayValue()"
          [placeholder]="nzPlaceHolder() ?? ''"
          [disabled]="finalDisabled()"
          [readOnly]="nzReadOnly()"
          (input)="onInput(input.value)"
        />
      </div>
    </ng-template>
  `,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzInputNumberComponent),
                            multi: true
                        },
                        { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input-number' }
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        '[class]': 'class()',
                        '(keydown)': 'onKeyDown($event)'
                    },
                    hostDirectives: [NzSpaceCompactItemDirective]
                }]
        }], ctorParameters: () => [] });
/**
 * When click and hold on a button - the speed of auto changing the value.
 */
const STEP_INTERVAL = 200;
/**
 * When click and hold on a button - the delay before auto changing the value.
 */
const STEP_DELAY = 600;
function defaultParser(value) {
    return +value.trim().replace(/。/g, '.');
}
function isInRange(value, min, max) {
    return value >= min && value <= max;
}
/**
 * if max > 0, round down with precision. Example: input= 3.5, max= 3.5, precision=0; output= 3
 * if max < 0, round up   with precision. Example: input=-3.5, max=-3.5, precision=0; output=-4
 * if min > 0, round up   with precision. Example: input= 3.5, min= 3.5, precision=0; output= 4
 * if min < 0, round down with precision. Example: input=-3.5, min=-3.5, precision=0; output=-3
 */
function getRangeValue(value, min, max, precision = null) {
    if (precision === null) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }
    const fixedValue = +value.toFixed(precision);
    const multiple = Math.pow(10, precision);
    if (fixedValue < min) {
        return Math.ceil(min * multiple) / multiple;
    }
    if (fixedValue > max) {
        return Math.floor(max * multiple) / multiple;
    }
    return fixedValue;
}
function getDecimalPlaces(num) {
    return num.toString().split('.')[1]?.length || 0;
}
function isNotCompleteNumber(value) {
    return /[.。](\d*0)?$/.test(value.toString());
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputNumberModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberModule, imports: [NzInputNumberComponent,
            NzInputAddonBeforeDirective,
            NzInputAddonAfterDirective,
            NzInputPrefixDirective,
            NzInputSuffixDirective], exports: [NzInputNumberComponent,
            NzInputAddonBeforeDirective,
            NzInputAddonAfterDirective,
            NzInputPrefixDirective,
            NzInputSuffixDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberModule, imports: [NzInputNumberComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputNumberModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzInputNumberComponent,
                        NzInputAddonBeforeDirective,
                        NzInputAddonAfterDirective,
                        NzInputPrefixDirective,
                        NzInputSuffixDirective
                    ],
                    exports: [
                        NzInputNumberComponent,
                        NzInputAddonBeforeDirective,
                        NzInputAddonAfterDirective,
                        NzInputPrefixDirective,
                        NzInputSuffixDirective
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

export { NzInputNumberComponent, NzInputNumberModule };
//# sourceMappingURL=ng-zorro-antd-input-number.mjs.map
