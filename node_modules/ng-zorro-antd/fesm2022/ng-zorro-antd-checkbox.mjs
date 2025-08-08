import * as i1 from '@angular/cdk/a11y';
import { FocusMonitor } from '@angular/cdk/a11y';
import * as i2 from '@angular/cdk/bidi';
import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { EventEmitter, Output, ViewEncapsulation, ChangeDetectionStrategy, Component, InjectionToken, inject, effect, forwardRef, booleanAttribute, Input, ViewChild, input, signal, linkedSignal, computed, ElementRef, DestroyRef, afterNextRender, untracked, NgModule } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as i3 from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * @deprecated Deprecated in v19.0.0. It is recommended to use `<nz-checkbox-group>`.
 */
class NzCheckboxWrapperComponent {
    nzOnChange = new EventEmitter();
    checkboxList = [];
    addCheckbox(value) {
        this.checkboxList.push(value);
    }
    removeCheckbox(value) {
        this.checkboxList.splice(this.checkboxList.indexOf(value), 1);
    }
    onChange() {
        const listOfCheckedValue = this.checkboxList.filter(item => item.nzChecked).map(item => item.nzValue);
        this.nzOnChange.emit(listOfCheckedValue);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxWrapperComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzCheckboxWrapperComponent, isStandalone: true, selector: "nz-checkbox-wrapper", outputs: { nzOnChange: "nzOnChange" }, host: { classAttribute: "ant-checkbox-group" }, exportAs: ["nzCheckboxWrapper"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxWrapperComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-checkbox-wrapper',
                    exportAs: 'nzCheckboxWrapper',
                    template: `<ng-content></ng-content>`,
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        class: 'ant-checkbox-group'
                    }
                }]
        }], propDecorators: { nzOnChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_CHECKBOX_GROUP = new InjectionToken('NZ_CHECKBOX_GROUP');

class NzCheckboxComponent {
    ngZone;
    elementRef;
    cdr;
    focusMonitor;
    directionality;
    dir = 'ltr';
    destroy$ = new Subject();
    isNzDisableFirstChange = true;
    onChange = () => { };
    onTouched = () => { };
    inputElement;
    nzCheckedChange = new EventEmitter();
    nzValue = null;
    nzAutoFocus = false;
    nzDisabled = false;
    nzIndeterminate = false;
    nzChecked = false;
    nzId = null;
    nzName = null;
    innerCheckedChange(checked) {
        if (!this.nzDisabled && !this.checkboxGroupComponent?.finalDisabled()) {
            this.setValue(checked);
            this.nzCheckboxWrapperComponent?.onChange();
            this.checkboxGroupComponent?.onCheckedChange(this.nzValue, checked);
        }
    }
    writeValue(value) {
        this.nzChecked = value;
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
    focus() {
        this.focusMonitor.focusVia(this.inputElement, 'keyboard');
    }
    blur() {
        this.inputElement.nativeElement.blur();
    }
    /** @deprecated */
    nzCheckboxWrapperComponent = inject(NzCheckboxWrapperComponent, { optional: true });
    checkboxGroupComponent = inject(NZ_CHECKBOX_GROUP, { optional: true });
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    constructor(ngZone, elementRef, cdr, focusMonitor, directionality) {
        this.ngZone = ngZone;
        this.elementRef = elementRef;
        this.cdr = cdr;
        this.focusMonitor = focusMonitor;
        this.directionality = directionality;
        if (this.checkboxGroupComponent) {
            effect(() => {
                const values = this.checkboxGroupComponent.value() || [];
                this.setValue(values.includes(this.nzValue));
                this.cdr.markForCheck();
            });
        }
    }
    ngOnInit() {
        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(focusOrigin => {
            if (!focusOrigin) {
                Promise.resolve().then(() => this.onTouched());
            }
        });
        this.nzCheckboxWrapperComponent?.addCheckbox(this);
        this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
        fromEventOutsideAngular(this.elementRef.nativeElement, 'click')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
            event.preventDefault();
            this.focus();
            if (this.nzDisabled) {
                return;
            }
            this.ngZone.run(() => {
                this.innerCheckedChange(!this.nzChecked);
                this.cdr.markForCheck();
            });
        });
        fromEventOutsideAngular(this.inputElement.nativeElement, 'click')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => event.stopPropagation());
    }
    ngAfterViewInit() {
        if (this.nzAutoFocus) {
            this.focus();
        }
    }
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.nzCheckboxWrapperComponent?.removeCheckbox(this);
        this.destroy$.next();
        this.destroy$.complete();
    }
    setValue(value) {
        this.nzChecked = value;
        this.onChange(value);
        this.nzCheckedChange.emit(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxComponent, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.FocusMonitor }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzCheckboxComponent, isStandalone: true, selector: "[nz-checkbox]", inputs: { nzValue: "nzValue", nzAutoFocus: ["nzAutoFocus", "nzAutoFocus", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzIndeterminate: ["nzIndeterminate", "nzIndeterminate", booleanAttribute], nzChecked: ["nzChecked", "nzChecked", booleanAttribute], nzId: "nzId", nzName: "nzName" }, outputs: { nzCheckedChange: "nzCheckedChange" }, host: { properties: { "class.ant-checkbox-group-item": "!!checkboxGroupComponent", "class.ant-checkbox-wrapper-in-form-item": "!!nzFormStatusService", "class.ant-checkbox-wrapper-checked": "nzChecked", "class.ant-checkbox-wrapper-disabled": "nzDisabled || checkboxGroupComponent?.finalDisabled()", "class.ant-checkbox-rtl": "dir === 'rtl'" }, classAttribute: "ant-checkbox-wrapper" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzCheckboxComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "inputElement", first: true, predicate: ["inputElement"], descendants: true, static: true }], exportAs: ["nzCheckbox"], ngImport: i0, template: `
    <span
      class="ant-checkbox"
      [class.ant-checkbox-checked]="nzChecked && !nzIndeterminate"
      [class.ant-checkbox-disabled]="nzDisabled || checkboxGroupComponent?.finalDisabled()"
      [class.ant-checkbox-indeterminate]="nzIndeterminate"
    >
      <input
        #inputElement
        type="checkbox"
        class="ant-checkbox-input"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [attr.id]="nzId"
        [attr.name]="nzName || checkboxGroupComponent?.nzName()"
        [checked]="nzChecked"
        [ngModel]="nzChecked"
        [disabled]="nzDisabled || (checkboxGroupComponent?.finalDisabled() ?? false)"
        (ngModelChange)="innerCheckedChange($event)"
      />
      <span class="ant-checkbox-inner"></span>
    </span>
    <span><ng-content></ng-content></span>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i3.CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-checkbox]',
                    exportAs: 'nzCheckbox',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <span
      class="ant-checkbox"
      [class.ant-checkbox-checked]="nzChecked && !nzIndeterminate"
      [class.ant-checkbox-disabled]="nzDisabled || checkboxGroupComponent?.finalDisabled()"
      [class.ant-checkbox-indeterminate]="nzIndeterminate"
    >
      <input
        #inputElement
        type="checkbox"
        class="ant-checkbox-input"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [attr.id]="nzId"
        [attr.name]="nzName || checkboxGroupComponent?.nzName()"
        [checked]="nzChecked"
        [ngModel]="nzChecked"
        [disabled]="nzDisabled || (checkboxGroupComponent?.finalDisabled() ?? false)"
        (ngModelChange)="innerCheckedChange($event)"
      />
      <span class="ant-checkbox-inner"></span>
    </span>
    <span><ng-content></ng-content></span>
  `,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzCheckboxComponent),
                            multi: true
                        }
                    ],
                    host: {
                        class: 'ant-checkbox-wrapper',
                        '[class.ant-checkbox-group-item]': '!!checkboxGroupComponent',
                        '[class.ant-checkbox-wrapper-in-form-item]': '!!nzFormStatusService',
                        '[class.ant-checkbox-wrapper-checked]': 'nzChecked',
                        '[class.ant-checkbox-wrapper-disabled]': 'nzDisabled || checkboxGroupComponent?.finalDisabled()',
                        '[class.ant-checkbox-rtl]': `dir === 'rtl'`
                    },
                    imports: [FormsModule]
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.FocusMonitor }, { type: i2.Directionality }], propDecorators: { inputElement: [{
                type: ViewChild,
                args: ['inputElement', { static: true }]
            }], nzCheckedChange: [{
                type: Output
            }], nzValue: [{
                type: Input
            }], nzAutoFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIndeterminate: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzId: [{
                type: Input
            }], nzName: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckboxGroupComponent {
    onChange = () => { };
    onTouched = () => { };
    isDisabledFirstChange = true;
    directionality = inject(Directionality);
    nzName = input(null);
    nzDisabled = input(false, { transform: booleanAttribute });
    nzOptions = input([]);
    value = signal(null);
    finalDisabled = linkedSignal(() => this.nzDisabled());
    dir = toSignal(this.directionality.change, { initialValue: this.directionality.value });
    normalizedOptions = computed(() => normalizeOptions(this.nzOptions()));
    constructor() {
        const elementRef = inject(ElementRef);
        const focusMonitor = inject(FocusMonitor);
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            focusMonitor
                .monitor(elementRef, true)
                .pipe(takeUntilDestroyed(destroyRef))
                .subscribe(focusOrigin => {
                if (!focusOrigin) {
                    this.onTouched();
                }
            });
            destroyRef.onDestroy(() => {
                focusMonitor.stopMonitoring(elementRef);
            });
        });
    }
    writeValue(value) {
        untracked(() => {
            this.value.set(value);
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
    onCheckedChange(optionValue, checked) {
        if (this.finalDisabled())
            return;
        this.value.update(value => {
            if (checked) {
                return value?.concat(optionValue) || [optionValue];
            }
            else {
                return value?.filter(val => val !== optionValue) || [];
            }
        });
        this.onChange(this.value());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxGroupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCheckboxGroupComponent, isStandalone: true, selector: "nz-checkbox-group", inputs: { nzName: { classPropertyName: "nzName", publicName: "nzName", isSignal: true, isRequired: false, transformFunction: null }, nzDisabled: { classPropertyName: "nzDisabled", publicName: "nzDisabled", isSignal: true, isRequired: false, transformFunction: null }, nzOptions: { classPropertyName: "nzOptions", publicName: "nzOptions", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.ant-checkbox-group-rtl": "dir() === 'rtl'" }, classAttribute: "ant-checkbox-group" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzCheckboxGroupComponent),
                multi: true
            },
            {
                provide: NZ_CHECKBOX_GROUP,
                useExisting: forwardRef(() => NzCheckboxGroupComponent)
            }
        ], exportAs: ["nzCheckboxGroup"], ngImport: i0, template: `
    <ng-content>
      @for (option of normalizedOptions(); track option.value) {
        <label
          nz-checkbox
          [nzValue]="option.value"
          [nzName]="nzName()"
          [nzDisabled]="option.disabled || finalDisabled()"
        >
          {{ option.label }}
        </label>
      }
    </ng-content>
  `, isInline: true, dependencies: [{ kind: "component", type: NzCheckboxComponent, selector: "[nz-checkbox]", inputs: ["nzValue", "nzAutoFocus", "nzDisabled", "nzIndeterminate", "nzChecked", "nzId", "nzName"], outputs: ["nzCheckedChange"], exportAs: ["nzCheckbox"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-checkbox-group',
                    exportAs: 'nzCheckboxGroup',
                    imports: [NzCheckboxComponent],
                    template: `
    <ng-content>
      @for (option of normalizedOptions(); track option.value) {
        <label
          nz-checkbox
          [nzValue]="option.value"
          [nzName]="nzName()"
          [nzDisabled]="option.disabled || finalDisabled()"
        >
          {{ option.label }}
        </label>
      }
    </ng-content>
  `,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzCheckboxGroupComponent),
                            multi: true
                        },
                        {
                            provide: NZ_CHECKBOX_GROUP,
                            useExisting: forwardRef(() => NzCheckboxGroupComponent)
                        }
                    ],
                    host: {
                        class: 'ant-checkbox-group',
                        '[class.ant-checkbox-group-rtl]': `dir() === 'rtl'`
                    },
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [] });
function normalizeOptions(value) {
    return value.map(item => {
        if (typeof item === 'string' || typeof item === 'number') {
            return {
                label: `${item}`,
                value: item
            };
        }
        return item;
    });
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckboxModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxModule, imports: [NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxWrapperComponent], exports: [NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxWrapperComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxModule, imports: [NzCheckboxComponent, NzCheckboxGroupComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckboxModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxWrapperComponent],
                    exports: [NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxWrapperComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NZ_CHECKBOX_GROUP, NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxModule, NzCheckboxWrapperComponent };
//# sourceMappingURL=ng-zorro-antd-checkbox.mjs.map
