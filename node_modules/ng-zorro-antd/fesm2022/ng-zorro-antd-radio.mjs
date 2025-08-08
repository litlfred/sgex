import * as i0 from '@angular/core';
import { Injectable, forwardRef, booleanAttribute, Input, ChangeDetectionStrategy, ViewEncapsulation, Component, inject, ViewChild, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as i2 from '@angular/cdk/bidi';
import { Directionality } from '@angular/cdk/bidi';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i1 from '@angular/cdk/a11y';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzRadioService {
    selected$ = new ReplaySubject(1);
    touched$ = new Subject();
    disabled$ = new ReplaySubject(1);
    name$ = new ReplaySubject(1);
    touch() {
        this.touched$.next();
    }
    select(value) {
        this.selected$.next(value);
    }
    setDisabled(value) {
        this.disabled$.next(value);
    }
    setName(value) {
        this.name$.next(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioService, decorators: [{
            type: Injectable
        }] });

class NzRadioGroupComponent {
    cdr;
    nzRadioService;
    directionality;
    value = null;
    destroy$ = new Subject();
    isNzDisableFirstChange = true;
    onChange = () => { };
    onTouched = () => { };
    nzDisabled = false;
    nzButtonStyle = 'outline';
    nzSize = 'default';
    nzName = null;
    dir = 'ltr';
    constructor(cdr, nzRadioService, directionality) {
        this.cdr = cdr;
        this.nzRadioService = nzRadioService;
        this.directionality = directionality;
    }
    ngOnInit() {
        this.nzRadioService.selected$.pipe(takeUntil(this.destroy$)).subscribe(value => {
            if (this.value !== value) {
                this.value = value;
                this.onChange(this.value);
            }
        });
        this.nzRadioService.touched$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            Promise.resolve().then(() => this.onTouched());
        });
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnChanges(changes) {
        const { nzDisabled, nzName } = changes;
        if (nzDisabled) {
            this.nzRadioService.setDisabled(this.nzDisabled);
        }
        if (nzName) {
            this.nzRadioService.setName(this.nzName);
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    writeValue(value) {
        this.value = value;
        this.nzRadioService.select(value);
        this.cdr.markForCheck();
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || isDisabled;
        this.isNzDisableFirstChange = false;
        this.nzRadioService.setDisabled(this.nzDisabled);
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioGroupComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NzRadioService }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzRadioGroupComponent, isStandalone: true, selector: "nz-radio-group", inputs: { nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzButtonStyle: "nzButtonStyle", nzSize: "nzSize", nzName: "nzName" }, host: { properties: { "class.ant-radio-group-large": "nzSize === 'large'", "class.ant-radio-group-small": "nzSize === 'small'", "class.ant-radio-group-solid": "nzButtonStyle === 'solid'", "class.ant-radio-group-rtl": "dir === 'rtl'" }, classAttribute: "ant-radio-group" }, providers: [
            NzRadioService,
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzRadioGroupComponent),
                multi: true
            }
        ], exportAs: ["nzRadioGroup"], usesOnChanges: true, ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-radio-group',
                    exportAs: 'nzRadioGroup',
                    preserveWhitespaces: false,
                    template: ` <ng-content></ng-content> `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        NzRadioService,
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzRadioGroupComponent),
                            multi: true
                        }
                    ],
                    host: {
                        class: 'ant-radio-group',
                        '[class.ant-radio-group-large]': `nzSize === 'large'`,
                        '[class.ant-radio-group-small]': `nzSize === 'small'`,
                        '[class.ant-radio-group-solid]': `nzButtonStyle === 'solid'`,
                        '[class.ant-radio-group-rtl]': `dir === 'rtl'`
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NzRadioService }, { type: i2.Directionality }], propDecorators: { nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzButtonStyle: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzName: [{
                type: Input
            }] } });

class NzRadioComponent {
    ngZone;
    elementRef;
    cdr;
    focusMonitor;
    isNgModel = false;
    destroy$ = new Subject();
    isNzDisableFirstChange = true;
    directionality = inject(Directionality);
    nzRadioService = inject(NzRadioService, { optional: true });
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    isChecked = false;
    name = null;
    onChange = () => { };
    onTouched = () => { };
    inputElement;
    nzValue = null;
    nzDisabled = false;
    nzAutoFocus = false;
    isRadioButton = false;
    dir = 'ltr';
    focus() {
        this.focusMonitor.focusVia(this.inputElement, 'keyboard');
    }
    blur() {
        this.inputElement.nativeElement.blur();
    }
    constructor(ngZone, elementRef, cdr, focusMonitor) {
        this.ngZone = ngZone;
        this.elementRef = elementRef;
        this.cdr = cdr;
        this.focusMonitor = focusMonitor;
    }
    setDisabledState(disabled) {
        this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || disabled;
        this.isNzDisableFirstChange = false;
        this.cdr.markForCheck();
    }
    writeValue(value) {
        this.isChecked = value;
        this.cdr.markForCheck();
    }
    registerOnChange(fn) {
        this.isNgModel = true;
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    ngOnInit() {
        if (this.nzRadioService) {
            this.nzRadioService.name$.pipe(takeUntil(this.destroy$)).subscribe(name => {
                this.name = name;
                this.cdr.markForCheck();
            });
            this.nzRadioService.disabled$.pipe(takeUntil(this.destroy$)).subscribe(disabled => {
                this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || disabled;
                this.isNzDisableFirstChange = false;
                this.cdr.markForCheck();
            });
            this.nzRadioService.selected$.pipe(takeUntil(this.destroy$)).subscribe(value => {
                const isChecked = this.isChecked;
                this.isChecked = this.nzValue === value;
                // We don't have to run `onChange()` on each `nz-radio` button whenever the `selected$` emits.
                // If we have 8 `nz-radio` buttons within the `nz-radio-group` and they're all connected with
                // `ngModel` or `formControl` then `onChange()` will be called 8 times for each `nz-radio` button.
                // We prevent this by checking if `isChecked` has been changed or not.
                if (this.isNgModel &&
                    isChecked !== this.isChecked &&
                    // We're only intereted if `isChecked` has been changed to `false` value to emit `false` to the ascendant form,
                    // since we already emit `true` within the `setupClickListener`.
                    this.isChecked === false) {
                    this.onChange(false);
                }
                this.cdr.markForCheck();
            });
        }
        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(focusOrigin => {
            if (!focusOrigin) {
                Promise.resolve().then(() => this.onTouched());
                if (this.nzRadioService) {
                    this.nzRadioService.touch();
                }
            }
        });
        this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
        this.setupClickListener();
    }
    ngAfterViewInit() {
        if (this.nzAutoFocus) {
            this.focus();
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.focusMonitor.stopMonitoring(this.elementRef);
    }
    setupClickListener() {
        fromEventOutsideAngular(this.elementRef.nativeElement, 'click')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
            /** prevent label click triggered twice. **/
            event.stopPropagation();
            event.preventDefault();
            if (this.nzDisabled || this.isChecked) {
                return;
            }
            this.ngZone.run(() => {
                this.focus();
                this.nzRadioService?.select(this.nzValue);
                if (this.isNgModel) {
                    this.isChecked = true;
                    this.onChange(true);
                }
                this.cdr.markForCheck();
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioComponent, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i1.FocusMonitor }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzRadioComponent, isStandalone: true, selector: "[nz-radio],[nz-radio-button]", inputs: { nzValue: "nzValue", nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzAutoFocus: ["nzAutoFocus", "nzAutoFocus", booleanAttribute], isRadioButton: ["nz-radio-button", "isRadioButton", booleanAttribute] }, host: { properties: { "class.ant-radio-wrapper-in-form-item": "!!nzFormStatusService", "class.ant-radio-wrapper": "!isRadioButton", "class.ant-radio-button-wrapper": "isRadioButton", "class.ant-radio-wrapper-checked": "isChecked && !isRadioButton", "class.ant-radio-button-wrapper-checked": "isChecked && isRadioButton", "class.ant-radio-wrapper-disabled": "nzDisabled && !isRadioButton", "class.ant-radio-button-wrapper-disabled": "nzDisabled && isRadioButton", "class.ant-radio-wrapper-rtl": "!isRadioButton && dir === 'rtl'", "class.ant-radio-button-wrapper-rtl": "isRadioButton && dir === 'rtl'" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzRadioComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "inputElement", first: true, predicate: ["inputElement"], descendants: true, static: true }], exportAs: ["nzRadio"], ngImport: i0, template: `
    <span
      [class.ant-radio]="!isRadioButton"
      [class.ant-radio-checked]="isChecked && !isRadioButton"
      [class.ant-radio-disabled]="nzDisabled && !isRadioButton"
      [class.ant-radio-button]="isRadioButton"
      [class.ant-radio-button-checked]="isChecked && isRadioButton"
      [class.ant-radio-button-disabled]="nzDisabled && isRadioButton"
    >
      <input
        #inputElement
        type="radio"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [class.ant-radio-input]="!isRadioButton"
        [class.ant-radio-button-input]="isRadioButton"
        [disabled]="nzDisabled"
        [checked]="isChecked"
        [attr.name]="name"
      />
      <span [class.ant-radio-inner]="!isRadioButton" [class.ant-radio-button-inner]="isRadioButton"></span>
    </span>
    <span><ng-content></ng-content></span>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-radio],[nz-radio-button]',
                    exportAs: 'nzRadio',
                    preserveWhitespaces: false,
                    template: `
    <span
      [class.ant-radio]="!isRadioButton"
      [class.ant-radio-checked]="isChecked && !isRadioButton"
      [class.ant-radio-disabled]="nzDisabled && !isRadioButton"
      [class.ant-radio-button]="isRadioButton"
      [class.ant-radio-button-checked]="isChecked && isRadioButton"
      [class.ant-radio-button-disabled]="nzDisabled && isRadioButton"
    >
      <input
        #inputElement
        type="radio"
        [attr.autofocus]="nzAutoFocus ? 'autofocus' : null"
        [class.ant-radio-input]="!isRadioButton"
        [class.ant-radio-button-input]="isRadioButton"
        [disabled]="nzDisabled"
        [checked]="isChecked"
        [attr.name]="name"
      />
      <span [class.ant-radio-inner]="!isRadioButton" [class.ant-radio-button-inner]="isRadioButton"></span>
    </span>
    <span><ng-content></ng-content></span>
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzRadioComponent),
                            multi: true
                        }
                    ],
                    host: {
                        '[class.ant-radio-wrapper-in-form-item]': '!!nzFormStatusService',
                        '[class.ant-radio-wrapper]': '!isRadioButton',
                        '[class.ant-radio-button-wrapper]': 'isRadioButton',
                        '[class.ant-radio-wrapper-checked]': 'isChecked && !isRadioButton',
                        '[class.ant-radio-button-wrapper-checked]': 'isChecked && isRadioButton',
                        '[class.ant-radio-wrapper-disabled]': 'nzDisabled && !isRadioButton',
                        '[class.ant-radio-button-wrapper-disabled]': 'nzDisabled && isRadioButton',
                        '[class.ant-radio-wrapper-rtl]': `!isRadioButton && dir === 'rtl'`,
                        '[class.ant-radio-button-wrapper-rtl]': `isRadioButton && dir === 'rtl'`
                    }
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i1.FocusMonitor }], propDecorators: { inputElement: [{
                type: ViewChild,
                args: ['inputElement', { static: true }]
            }], nzValue: [{
                type: Input
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isRadioButton: [{
                type: Input,
                args: [{ alias: 'nz-radio-button', transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzRadioModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzRadioModule, imports: [NzRadioComponent, NzRadioGroupComponent], exports: [NzRadioComponent, NzRadioGroupComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRadioModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzRadioComponent, NzRadioGroupComponent],
                    exports: [NzRadioComponent, NzRadioGroupComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzRadioComponent, NzRadioGroupComponent, NzRadioModule, NzRadioService };
//# sourceMappingURL=ng-zorro-antd-radio.mjs.map
