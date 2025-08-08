import * as i0 from '@angular/core';
import { inject, ElementRef, Input, Directive, ChangeDetectionStrategy, ViewEncapsulation, Component, computed, signal, booleanAttribute, ContentChildren, forwardRef, numberAttribute, ViewChildren, isDevMode, ContentChild, NgModule } from '@angular/core';
import { Subject, merge, EMPTY } from 'rxjs';
import { takeUntil, distinctUntilChanged, filter, startWith, switchMap, mergeMap, map, tap } from 'rxjs/operators';
import * as i1 from '@angular/cdk/platform';
import * as i2 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import * as i2$1 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i1$1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgTemplateOutlet } from '@angular/common';
import { NzFormStatusService, NzFormNoStatusService, NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import { getStatusClassNames, isNotNil } from 'ng-zorro-antd/core/util';
import * as i2$2 from 'ng-zorro-antd/space';
import { NZ_SPACE_COMPACT_SIZE, NZ_SPACE_COMPACT_ITEM_TYPE, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import * as i1$4 from '@angular/forms';
import { NgControl, Validators, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as i1$2 from '@angular/cdk/bidi';
import * as i1$3 from '@angular/cdk/a11y';
import { BACKSPACE } from '@angular/cdk/keycodes';

class NzAutosizeDirective {
    ngZone;
    platform;
    resizeService;
    autosize = false;
    el = inject(ElementRef).nativeElement;
    cachedLineHeight;
    previousValue;
    previousMinRows;
    minRows;
    maxRows;
    maxHeight = null;
    minHeight = null;
    destroy$ = new Subject();
    inputGap = 10;
    set nzAutosize(value) {
        const isAutoSizeType = (data) => typeof data !== 'string' && typeof data !== 'boolean' && (!!data.maxRows || !!data.minRows);
        if (typeof value === 'string' || value === true) {
            this.autosize = true;
        }
        else if (isAutoSizeType(value)) {
            this.autosize = true;
            this.minRows = value.minRows;
            this.maxRows = value.maxRows;
            this.maxHeight = this.setMaxHeight();
            this.minHeight = this.setMinHeight();
        }
    }
    resizeToFitContent(force = false) {
        this.cacheTextareaLineHeight();
        // If we haven't determined the line-height yet, we know we're still hidden and there's no point
        // in checking the height of the textarea.
        if (!this.cachedLineHeight) {
            return;
        }
        const textarea = this.el;
        const value = textarea.value;
        // Only resize if the value or minRows have changed since these calculations can be expensive.
        if (!force && this.minRows === this.previousMinRows && value === this.previousValue) {
            return;
        }
        const placeholderText = textarea.placeholder;
        // Reset the textarea height to auto in order to shrink back to its default size.
        // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
        // Long placeholders that are wider than the textarea width may lead to a bigger scrollHeight
        // value. To ensure that the scrollHeight is not bigger than the content, the placeholders
        // need to be removed temporarily.
        textarea.classList.add('nz-textarea-autosize-measuring');
        textarea.placeholder = '';
        let height = Math.round((textarea.scrollHeight - this.inputGap) / this.cachedLineHeight) * this.cachedLineHeight +
            this.inputGap;
        if (this.maxHeight !== null && height > this.maxHeight) {
            height = this.maxHeight;
        }
        if (this.minHeight !== null && height < this.minHeight) {
            height = this.minHeight;
        }
        // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
        textarea.style.height = `${height}px`;
        textarea.classList.remove('nz-textarea-autosize-measuring');
        textarea.placeholder = placeholderText;
        // On Firefox resizing the textarea will prevent it from scrolling to the caret position.
        // We need to re-set the selection in order for it to scroll to the proper position.
        if (typeof requestAnimationFrame !== 'undefined') {
            this.ngZone.runOutsideAngular(() => requestAnimationFrame(() => {
                const { selectionStart, selectionEnd } = textarea;
                // IE will throw an "Unspecified error" if we try to set the selection range after the
                // element has been removed from the DOM. Assert that the directive hasn't been destroyed
                // between the time we requested the animation frame and when it was executed.
                // Also note that we have to assert that the textarea is focused before we set the
                // selection range. Setting the selection range on a non-focused textarea will cause
                // it to receive focus on IE and Edge.
                if (!this.destroy$.isStopped && document.activeElement === textarea) {
                    textarea.setSelectionRange(selectionStart, selectionEnd);
                }
            }));
        }
        this.previousValue = value;
        this.previousMinRows = this.minRows;
    }
    cacheTextareaLineHeight() {
        if (this.cachedLineHeight >= 0 || !this.el.parentNode) {
            return;
        }
        // Use a clone element because we have to override some styles.
        const textareaClone = this.el.cloneNode(false);
        textareaClone.rows = 1;
        // Use `position: absolute` so that this doesn't cause a browser layout and use
        // `visibility: hidden` so that nothing is rendered. Clear any other styles that
        // would affect the height.
        textareaClone.style.position = 'absolute';
        textareaClone.style.visibility = 'hidden';
        textareaClone.style.border = 'none';
        textareaClone.style.padding = '0';
        textareaClone.style.height = '';
        textareaClone.style.minHeight = '';
        textareaClone.style.maxHeight = '';
        // In Firefox it happens that textarea elements are always bigger than the specified amount
        // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
        // As a workaround that removes the extra space for the scrollbar, we can just set overflow
        // to hidden. This ensures that there is no invalid calculation of the line height.
        // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
        textareaClone.style.overflow = 'hidden';
        this.el.parentNode.appendChild(textareaClone);
        this.cachedLineHeight = textareaClone.clientHeight - this.inputGap;
        this.el.parentNode.removeChild(textareaClone);
        // Min and max heights have to be re-calculated if the cached line height changes
        this.maxHeight = this.setMaxHeight();
        this.minHeight = this.setMinHeight();
    }
    setMinHeight() {
        const minHeight = this.minRows && this.cachedLineHeight ? this.minRows * this.cachedLineHeight + this.inputGap : null;
        if (minHeight !== null) {
            this.el.style.minHeight = `${minHeight}px`;
        }
        return minHeight;
    }
    setMaxHeight() {
        const maxHeight = this.maxRows && this.cachedLineHeight ? this.maxRows * this.cachedLineHeight + this.inputGap : null;
        if (maxHeight !== null) {
            this.el.style.maxHeight = `${maxHeight}px`;
        }
        return maxHeight;
    }
    noopInputHandler() {
        // no-op handler that ensures we're running change detection on input events.
    }
    constructor(ngZone, platform, resizeService) {
        this.ngZone = ngZone;
        this.platform = platform;
        this.resizeService = resizeService;
    }
    ngAfterViewInit() {
        if (this.autosize && this.platform.isBrowser) {
            this.resizeToFitContent();
            this.resizeService
                .subscribe()
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => this.resizeToFitContent(true));
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    ngDoCheck() {
        if (this.autosize && this.platform.isBrowser) {
            this.resizeToFitContent();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAutosizeDirective, deps: [{ token: i0.NgZone }, { token: i1.Platform }, { token: i2.NzResizeService }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzAutosizeDirective, isStandalone: true, selector: "textarea[nzAutosize]", inputs: { nzAutosize: "nzAutosize" }, host: { attributes: { "rows": "1" }, listeners: { "input": "noopInputHandler()" } }, exportAs: ["nzAutosize"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAutosizeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'textarea[nzAutosize]',
                    exportAs: 'nzAutosize',
                    host: {
                        // Textarea elements that have the directive applied should have a single row by default.
                        // Browsers normally show two rows by default and therefore this limits the minRows binding.
                        rows: '1',
                        '(input)': 'noopInputHandler()'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i1.Platform }, { type: i2.NzResizeService }], propDecorators: { nzAutosize: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputAddonBeforeDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputAddonBeforeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputAddonBeforeDirective, isStandalone: true, selector: "[nzInputAddonBefore]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputAddonBeforeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzInputAddonBefore]'
                }]
        }] });
class NzInputAddonAfterDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputAddonAfterDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputAddonAfterDirective, isStandalone: true, selector: "[nzInputAddonAfter]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputAddonAfterDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzInputAddonAfter]'
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputPrefixDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputPrefixDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputPrefixDirective, isStandalone: true, selector: "[nzInputPrefix]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputPrefixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzInputPrefix]'
                }]
        }] });
class NzInputSuffixDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputSuffixDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputSuffixDirective, isStandalone: true, selector: "[nzInputSuffix]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputSuffixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzInputSuffix]'
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputGroupSlotComponent {
    icon = null;
    type = null;
    template = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupSlotComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputGroupSlotComponent, isStandalone: true, selector: "[nz-input-group-slot]", inputs: { icon: "icon", type: "type", template: "template" }, host: { properties: { "class.ant-input-group-addon": "type === 'addon'", "class.ant-input-prefix": "type === 'prefix'", "class.ant-input-suffix": "type === 'suffix'" } }, ngImport: i0, template: `
    @if (icon) {
      <nz-icon [nzType]="icon" />
    }
    <ng-container *nzStringTemplateOutlet="template">{{ template }}</ng-container>
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1$1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i2$1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupSlotComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-input-group-slot]',
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
                        '[class.ant-input-group-addon]': `type === 'addon'`,
                        '[class.ant-input-prefix]': `type === 'prefix'`,
                        '[class.ant-input-suffix]': `type === 'suffix'`
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

class NzInputDirective {
    renderer;
    elementRef;
    hostView;
    directionality;
    nzBorderless = false;
    nzSize = 'default';
    nzStepperless = true;
    nzStatus = '';
    get disabled() {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    _disabled = false;
    disabled$ = new Subject();
    dir = 'ltr';
    // status
    prefixCls = 'ant-input';
    status = '';
    statusCls = {};
    hasFeedback = false;
    feedbackRef = null;
    components = [];
    ngControl = inject(NgControl, { self: true, optional: true });
    finalSize = computed(() => {
        if (this.compactSize) {
            return this.compactSize();
        }
        return this.size();
    });
    size = signal(this.nzSize);
    compactSize = inject(NZ_SPACE_COMPACT_SIZE, { optional: true });
    destroy$ = inject(NzDestroyService);
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    nzFormNoStatusService = inject(NzFormNoStatusService, { optional: true });
    constructor(renderer, elementRef, hostView, directionality) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.hostView = hostView;
        this.directionality = directionality;
    }
    ngOnInit() {
        this.nzFormStatusService?.formStatusChanges
            .pipe(distinctUntilChanged((pre, cur) => {
            return pre.status === cur.status && pre.hasFeedback === cur.hasFeedback;
        }), takeUntil(this.destroy$))
            .subscribe(({ status, hasFeedback }) => {
            this.setStatusStyles(status, hasFeedback);
        });
        if (this.ngControl) {
            this.ngControl.statusChanges
                ?.pipe(filter(() => this.ngControl.disabled !== null), takeUntil(this.destroy$))
                .subscribe(() => {
                this.disabled$.next(this.ngControl.disabled);
            });
        }
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnChanges({ disabled, nzStatus, nzSize }) {
        if (disabled) {
            this.disabled$.next(this.disabled);
        }
        if (nzStatus) {
            this.setStatusStyles(this.nzStatus, this.hasFeedback);
        }
        if (nzSize) {
            this.size.set(nzSize.currentValue);
        }
    }
    setStatusStyles(status, hasFeedback) {
        // set inner status
        this.status = status;
        this.hasFeedback = hasFeedback;
        this.renderFeedbackIcon();
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
    renderFeedbackIcon() {
        if (!this.status || !this.hasFeedback || !!this.nzFormNoStatusService) {
            // remove feedback
            this.hostView.clear();
            this.feedbackRef = null;
            return;
        }
        this.feedbackRef = this.feedbackRef || this.hostView.createComponent(NzFormItemFeedbackIconComponent);
        this.feedbackRef.location.nativeElement.classList.add('ant-input-suffix');
        this.feedbackRef.instance.status = this.status;
        this.feedbackRef.instance.updateIcon();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputDirective, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1$2.Directionality }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzInputDirective, isStandalone: true, selector: "input[nz-input],textarea[nz-input]", inputs: { nzBorderless: ["nzBorderless", "nzBorderless", booleanAttribute], nzSize: "nzSize", nzStepperless: ["nzStepperless", "nzStepperless", booleanAttribute], nzStatus: "nzStatus", disabled: ["disabled", "disabled", booleanAttribute] }, host: { properties: { "class.ant-input-disabled": "disabled", "class.ant-input-borderless": "nzBorderless", "class.ant-input-lg": "finalSize() === 'large'", "class.ant-input-sm": "finalSize() === 'small'", "attr.disabled": "disabled || null", "class.ant-input-rtl": "dir=== 'rtl'", "class.ant-input-stepperless": "nzStepperless" }, classAttribute: "ant-input" }, providers: [NzDestroyService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input' }], exportAs: ["nzInput"], usesOnChanges: true, hostDirectives: [{ directive: i2$2.NzSpaceCompactItemDirective }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[nz-input],textarea[nz-input]',
                    exportAs: 'nzInput',
                    host: {
                        class: 'ant-input',
                        '[class.ant-input-disabled]': 'disabled',
                        '[class.ant-input-borderless]': 'nzBorderless',
                        '[class.ant-input-lg]': `finalSize() === 'large'`,
                        '[class.ant-input-sm]': `finalSize() === 'small'`,
                        '[attr.disabled]': 'disabled || null',
                        '[class.ant-input-rtl]': `dir=== 'rtl'`,
                        '[class.ant-input-stepperless]': `nzStepperless`
                    },
                    hostDirectives: [NzSpaceCompactItemDirective],
                    providers: [NzDestroyService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input' }]
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1$2.Directionality }], propDecorators: { nzBorderless: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSize: [{
                type: Input
            }], nzStepperless: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzStatus: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

class NzInputGroupWhitSuffixOrPrefixDirective {
    elementRef;
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupWhitSuffixOrPrefixDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzInputGroupWhitSuffixOrPrefixDirective, isStandalone: true, selector: "nz-input-group[nzSuffix], nz-input-group[nzPrefix]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupWhitSuffixOrPrefixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: `nz-input-group[nzSuffix], nz-input-group[nzPrefix]`
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
class NzInputGroupComponent {
    focusMonitor;
    elementRef;
    renderer;
    cdr;
    directionality;
    listOfNzInputDirective;
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
    nzSearch = false;
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
    prefixCls = 'ant-input';
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
        if (this.listOfNzInputDirective) {
            this.listOfNzInputDirective.forEach(item => item['size'].set(this.nzSize));
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
        const listOfInputChange$ = this.listOfNzInputDirective.changes.pipe(startWith(this.listOfNzInputDirective));
        listOfInputChange$
            .pipe(switchMap(list => merge(...[listOfInputChange$, ...list.map((input) => input.disabled$)])), mergeMap(() => listOfInputChange$), map(list => list.some((input) => input.disabled)), takeUntil(this.destroy$))
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupComponent, deps: [{ token: i1$3.FocusMonitor }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i1$2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputGroupComponent, isStandalone: true, selector: "nz-input-group", inputs: { nzAddOnBeforeIcon: "nzAddOnBeforeIcon", nzAddOnAfterIcon: "nzAddOnAfterIcon", nzPrefixIcon: "nzPrefixIcon", nzSuffixIcon: "nzSuffixIcon", nzAddOnBefore: "nzAddOnBefore", nzAddOnAfter: "nzAddOnAfter", nzPrefix: "nzPrefix", nzStatus: "nzStatus", nzSuffix: "nzSuffix", nzSize: "nzSize", nzSearch: ["nzSearch", "nzSearch", booleanAttribute], nzCompact: ["nzCompact", "nzCompact", booleanAttribute] }, host: { properties: { "class.ant-input-group-compact": "nzCompact", "class.ant-input-search-enter-button": "nzSearch", "class.ant-input-search": "nzSearch", "class.ant-input-search-rtl": "dir === 'rtl'", "class.ant-input-search-sm": "nzSearch && isSmall", "class.ant-input-search-large": "nzSearch && isLarge", "class.ant-input-group-wrapper": "isAddOn", "class.ant-input-group-wrapper-rtl": "dir === 'rtl'", "class.ant-input-group-wrapper-lg": "isAddOn && isLarge", "class.ant-input-group-wrapper-sm": "isAddOn && isSmall", "class.ant-input-affix-wrapper": "isAffix && !isAddOn", "class.ant-input-affix-wrapper-rtl": "dir === 'rtl'", "class.ant-input-affix-wrapper-focused": "isAffix && focused", "class.ant-input-affix-wrapper-disabled": "isAffix && disabled", "class.ant-input-affix-wrapper-lg": "isAffix && !isAddOn && isLarge", "class.ant-input-affix-wrapper-sm": "isAffix && !isAddOn && isSmall", "class.ant-input-group": "!isAffix && !isAddOn", "class.ant-input-group-rtl": "dir === 'rtl'", "class.ant-input-group-lg": "!isAffix && !isAddOn && isLarge", "class.ant-input-group-sm": "!isAffix && !isAddOn && isSmall" } }, providers: [NzFormNoStatusService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input' }], queries: [{ propertyName: "listOfNzInputDirective", predicate: NzInputDirective }], exportAs: ["nzInputGroup"], usesOnChanges: true, hostDirectives: [{ directive: i2$2.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    @if (isAddOn) {
      <span class="ant-input-wrapper ant-input-group">
        @if (nzAddOnBefore || nzAddOnBeforeIcon) {
          <span nz-input-group-slot type="addon" [icon]="nzAddOnBeforeIcon" [template]="nzAddOnBefore"></span>
        }

        @if (isAffix || hasFeedback) {
          <span
            class="ant-input-affix-wrapper"
            [class.ant-input-affix-wrapper-disabled]="disabled"
            [class.ant-input-affix-wrapper-sm]="isSmall"
            [class.ant-input-affix-wrapper-lg]="isLarge"
            [class.ant-input-affix-wrapper-focused]="focused"
            [class]="affixInGroupStatusCls"
          >
            <ng-template [ngTemplateOutlet]="affixTemplate"></ng-template>
          </span>
        } @else {
          <ng-template [ngTemplateOutlet]="contentTemplate" />
        }
        @if (nzAddOnAfter || nzAddOnAfterIcon) {
          <span nz-input-group-slot type="addon" [icon]="nzAddOnAfterIcon" [template]="nzAddOnAfter"></span>
        }
      </span>
    } @else {
      @if (isAffix) {
        <ng-template [ngTemplateOutlet]="affixTemplate" />
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate" />
      }
    }

    <!-- affix template -->
    <ng-template #affixTemplate>
      @if (nzPrefix || nzPrefixIcon) {
        <span nz-input-group-slot type="prefix" [icon]="nzPrefixIcon" [template]="nzPrefix"></span>
      }
      <ng-template [ngTemplateOutlet]="contentTemplate" />
      @if (nzSuffix || nzSuffixIcon || isFeedback) {
        <span nz-input-group-slot type="suffix" [icon]="nzSuffixIcon" [template]="nzSuffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>

    <!-- content template -->
    <ng-template #contentTemplate>
      <ng-content></ng-content>
      @if (!isAddOn && !isAffix && isFeedback) {
        <span nz-input-group-slot type="suffix">
          <nz-form-item-feedback-icon [status]="status" />
        </span>
      }
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzInputGroupSlotComponent, selector: "[nz-input-group-slot]", inputs: ["icon", "type", "template"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-input-group',
                    exportAs: 'nzInputGroup',
                    imports: [NzInputGroupSlotComponent, NgTemplateOutlet, NzFormItemFeedbackIconComponent],
                    encapsulation: ViewEncapsulation.None,
                    providers: [NzFormNoStatusService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'input' }],
                    template: `
    @if (isAddOn) {
      <span class="ant-input-wrapper ant-input-group">
        @if (nzAddOnBefore || nzAddOnBeforeIcon) {
          <span nz-input-group-slot type="addon" [icon]="nzAddOnBeforeIcon" [template]="nzAddOnBefore"></span>
        }

        @if (isAffix || hasFeedback) {
          <span
            class="ant-input-affix-wrapper"
            [class.ant-input-affix-wrapper-disabled]="disabled"
            [class.ant-input-affix-wrapper-sm]="isSmall"
            [class.ant-input-affix-wrapper-lg]="isLarge"
            [class.ant-input-affix-wrapper-focused]="focused"
            [class]="affixInGroupStatusCls"
          >
            <ng-template [ngTemplateOutlet]="affixTemplate"></ng-template>
          </span>
        } @else {
          <ng-template [ngTemplateOutlet]="contentTemplate" />
        }
        @if (nzAddOnAfter || nzAddOnAfterIcon) {
          <span nz-input-group-slot type="addon" [icon]="nzAddOnAfterIcon" [template]="nzAddOnAfter"></span>
        }
      </span>
    } @else {
      @if (isAffix) {
        <ng-template [ngTemplateOutlet]="affixTemplate" />
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate" />
      }
    }

    <!-- affix template -->
    <ng-template #affixTemplate>
      @if (nzPrefix || nzPrefixIcon) {
        <span nz-input-group-slot type="prefix" [icon]="nzPrefixIcon" [template]="nzPrefix"></span>
      }
      <ng-template [ngTemplateOutlet]="contentTemplate" />
      @if (nzSuffix || nzSuffixIcon || isFeedback) {
        <span nz-input-group-slot type="suffix" [icon]="nzSuffixIcon" [template]="nzSuffix">
          @if (isFeedback) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
    </ng-template>

    <!-- content template -->
    <ng-template #contentTemplate>
      <ng-content></ng-content>
      @if (!isAddOn && !isAffix && isFeedback) {
        <span nz-input-group-slot type="suffix">
          <nz-form-item-feedback-icon [status]="status" />
        </span>
      }
    </ng-template>
  `,
                    host: {
                        '[class.ant-input-group-compact]': `nzCompact`,
                        '[class.ant-input-search-enter-button]': `nzSearch`,
                        '[class.ant-input-search]': `nzSearch`,
                        '[class.ant-input-search-rtl]': `dir === 'rtl'`,
                        '[class.ant-input-search-sm]': `nzSearch && isSmall`,
                        '[class.ant-input-search-large]': `nzSearch && isLarge`,
                        '[class.ant-input-group-wrapper]': `isAddOn`,
                        '[class.ant-input-group-wrapper-rtl]': `dir === 'rtl'`,
                        '[class.ant-input-group-wrapper-lg]': `isAddOn && isLarge`,
                        '[class.ant-input-group-wrapper-sm]': `isAddOn && isSmall`,
                        '[class.ant-input-affix-wrapper]': `isAffix && !isAddOn`,
                        '[class.ant-input-affix-wrapper-rtl]': `dir === 'rtl'`,
                        '[class.ant-input-affix-wrapper-focused]': `isAffix && focused`,
                        '[class.ant-input-affix-wrapper-disabled]': `isAffix && disabled`,
                        '[class.ant-input-affix-wrapper-lg]': `isAffix && !isAddOn && isLarge`,
                        '[class.ant-input-affix-wrapper-sm]': `isAffix && !isAddOn && isSmall`,
                        '[class.ant-input-group]': `!isAffix && !isAddOn`,
                        '[class.ant-input-group-rtl]': `dir === 'rtl'`,
                        '[class.ant-input-group-lg]': `!isAffix && !isAddOn && isLarge`,
                        '[class.ant-input-group-sm]': `!isAffix && !isAddOn && isSmall`
                    },
                    hostDirectives: [NzSpaceCompactItemDirective],
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [{ type: i1$3.FocusMonitor }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i1$2.Directionality }], propDecorators: { listOfNzInputDirective: [{
                type: ContentChildren,
                args: [NzInputDirective]
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
            }], nzSearch: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCompact: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputOtpComponent {
    formBuilder;
    nzDestroyService;
    otpInputs;
    nzLength = 6;
    nzSize = 'default';
    disabled = false;
    nzStatus = '';
    nzFormatter = value => value;
    nzMask = null;
    otpArray;
    internalValue = [];
    onChangeCallback;
    onTouched = () => { };
    constructor(formBuilder, nzDestroyService) {
        this.formBuilder = formBuilder;
        this.nzDestroyService = nzDestroyService;
        this.createFormArray();
    }
    ngOnChanges(changes) {
        if (changes['nzLength']?.currentValue) {
            this.createFormArray();
        }
        if (changes['disabled']) {
            this.setDisabledState(this.disabled);
        }
    }
    onInput(index, event) {
        const inputElement = event.target;
        const nextInput = this.otpInputs.toArray()[index + 1];
        if (inputElement.value && nextInput) {
            nextInput.nativeElement.focus();
        }
        else if (!nextInput) {
            this.selectInputBox(index);
        }
    }
    onFocus(event) {
        const inputElement = event.target;
        inputElement.select();
    }
    onKeyDown(index, event) {
        const previousInput = this.otpInputs.toArray()[index - 1];
        if (event.keyCode === BACKSPACE) {
            event.preventDefault();
            this.internalValue[index] = '';
            this.otpArray.at(index).setValue('', { emitEvent: false });
            if (previousInput) {
                this.selectInputBox(index - 1);
            }
            this.emitValue();
        }
    }
    writeValue(value) {
        if (!value) {
            this.otpArray.reset();
            return;
        }
        const controlValues = value.split('');
        this.internalValue = controlValues;
        controlValues.forEach((val, i) => {
            const formattedValue = this.nzFormatter(val);
            const value = this.nzMask ? this.nzMask : formattedValue;
            this.otpArray.at(i).setValue(value, { emitEvent: false });
        });
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        if (isDisabled) {
            this.otpArray.disable();
        }
        else {
            this.otpArray.enable();
        }
    }
    onPaste(index, event) {
        const pastedText = event.clipboardData?.getData('text') || '';
        if (!pastedText)
            return;
        let currentIndex = index;
        for (const char of pastedText.split('')) {
            if (currentIndex < this.nzLength) {
                const formattedChar = this.nzFormatter(char);
                this.internalValue[currentIndex] = char;
                const maskedValue = this.nzMask ? this.nzMask : formattedChar;
                this.otpArray.at(currentIndex).setValue(maskedValue, { emitEvent: false });
                currentIndex++;
            }
            else {
                break;
            }
        }
        event.preventDefault(); // this line is needed, otherwise the last index that is going to be selected will also be filled (in the next line).
        this.selectInputBox(currentIndex);
        this.emitValue();
    }
    createFormArray() {
        this.otpArray = this.formBuilder.array([]);
        this.internalValue = new Array(this.nzLength).fill('');
        for (let i = 0; i < this.nzLength; i++) {
            const control = this.formBuilder.nonNullable.control('', [Validators.required]);
            control.valueChanges
                .pipe(tap(value => {
                const unmaskedValue = this.nzFormatter(value);
                this.internalValue[i] = unmaskedValue;
                control.setValue(this.nzMask ?? unmaskedValue, { emitEvent: false });
                this.emitValue();
            }), takeUntil(this.nzDestroyService))
                .subscribe();
            this.otpArray.push(control);
        }
    }
    emitValue() {
        const result = this.internalValue.join('');
        if (this.onChangeCallback) {
            this.onChangeCallback(result);
        }
    }
    selectInputBox(index) {
        const otpInputArray = this.otpInputs.toArray();
        if (index >= otpInputArray.length)
            index = otpInputArray.length - 1;
        otpInputArray[index].nativeElement.select();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputOtpComponent, deps: [{ token: i1$4.FormBuilder }, { token: i2.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzInputOtpComponent, isStandalone: true, selector: "nz-input-otp", inputs: { nzLength: ["nzLength", "nzLength", numberAttribute], nzSize: "nzSize", disabled: ["disabled", "disabled", booleanAttribute], nzStatus: "nzStatus", nzFormatter: "nzFormatter", nzMask: "nzMask" }, host: { classAttribute: "ant-otp" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzInputOtpComponent),
                multi: true
            },
            NzDestroyService
        ], viewQueries: [{ propertyName: "otpInputs", predicate: ["otpInput"], descendants: true }], exportAs: ["nzInputOtp"], usesOnChanges: true, ngImport: i0, template: `
    @for (item of otpArray.controls; track $index) {
      <input
        nz-input
        class="ant-otp-input"
        type="text"
        maxlength="1"
        size="1"
        [nzSize]="nzSize"
        [formControl]="item"
        [nzStatus]="nzStatus"
        (input)="onInput($index, $event)"
        (focus)="onFocus($event)"
        (keydown)="onKeyDown($index, $event)"
        (paste)="onPaste($index, $event)"
        #otpInput
      />
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NzInputDirective, selector: "input[nz-input],textarea[nz-input]", inputs: ["nzBorderless", "nzSize", "nzStepperless", "nzStatus", "disabled"], exportAs: ["nzInput"] }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1$4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$4.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i1$4.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputOtpComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-input-otp',
                    exportAs: 'nzInputOtp',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @for (item of otpArray.controls; track $index) {
      <input
        nz-input
        class="ant-otp-input"
        type="text"
        maxlength="1"
        size="1"
        [nzSize]="nzSize"
        [formControl]="item"
        [nzStatus]="nzStatus"
        (input)="onInput($index, $event)"
        (focus)="onFocus($event)"
        (keydown)="onKeyDown($index, $event)"
        (paste)="onPaste($index, $event)"
        #otpInput
      />
    }
  `,
                    host: {
                        class: 'ant-otp'
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzInputOtpComponent),
                            multi: true
                        },
                        NzDestroyService
                    ],
                    imports: [NzInputDirective, ReactiveFormsModule]
                }]
        }], ctorParameters: () => [{ type: i1$4.FormBuilder }, { type: i2.NzDestroyService }], propDecorators: { otpInputs: [{
                type: ViewChildren,
                args: ['otpInput']
            }], nzLength: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzSize: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzStatus: [{
                type: Input
            }], nzFormatter: [{
                type: Input
            }], nzMask: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTextareaCountComponent {
    renderer;
    elementRef;
    nzInputDirective;
    nzMaxCharacterCount = 0;
    nzComputeCharacterCount = v => v.length;
    nzFormatter = (c, m) => `${c}${m > 0 ? `/${m}` : ``}`;
    configChange$ = new Subject();
    destroy$ = new Subject();
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    ngAfterContentInit() {
        if (!this.nzInputDirective && isDevMode()) {
            throw new Error('[nz-textarea-count]: Could not find matching textarea[nz-input] child.');
        }
        if (this.nzInputDirective.ngControl) {
            const valueChanges = this.nzInputDirective.ngControl.valueChanges || EMPTY;
            merge(valueChanges, this.configChange$)
                .pipe(takeUntil(this.destroy$), map(() => this.nzInputDirective.ngControl.value), startWith(this.nzInputDirective.ngControl.value))
                .subscribe(value => {
                this.setDataCount(value);
            });
        }
    }
    setDataCount(value) {
        const inputValue = isNotNil(value) ? String(value) : '';
        const currentCount = this.nzComputeCharacterCount(inputValue);
        const dataCount = this.nzFormatter(currentCount, this.nzMaxCharacterCount);
        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-count', dataCount);
    }
    ngOnDestroy() {
        this.configChange$.complete();
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTextareaCountComponent, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTextareaCountComponent, isStandalone: true, selector: "nz-textarea-count", inputs: { nzMaxCharacterCount: ["nzMaxCharacterCount", "nzMaxCharacterCount", numberAttribute], nzComputeCharacterCount: "nzComputeCharacterCount", nzFormatter: "nzFormatter" }, host: { classAttribute: "ant-input-textarea-show-count" }, queries: [{ propertyName: "nzInputDirective", first: true, predicate: NzInputDirective, descendants: true, static: true }], ngImport: i0, template: ` <ng-content select="textarea[nz-input]"></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTextareaCountComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-textarea-count',
                    template: ` <ng-content select="textarea[nz-input]"></ng-content> `,
                    host: {
                        class: 'ant-input-textarea-show-count'
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }], propDecorators: { nzInputDirective: [{
                type: ContentChild,
                args: [NzInputDirective, { static: true }]
            }], nzMaxCharacterCount: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzComputeCharacterCount: [{
                type: Input
            }], nzFormatter: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzInputModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzInputModule, imports: [NzTextareaCountComponent,
            NzInputDirective,
            NzInputGroupComponent,
            NzAutosizeDirective,
            NzInputGroupSlotComponent,
            NzInputGroupWhitSuffixOrPrefixDirective,
            NzInputOtpComponent], exports: [NzTextareaCountComponent,
            NzInputDirective,
            NzInputGroupComponent,
            NzAutosizeDirective,
            NzInputGroupWhitSuffixOrPrefixDirective,
            NzInputOtpComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputModule, imports: [NzInputGroupComponent,
            NzInputGroupSlotComponent,
            NzInputOtpComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzInputModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzTextareaCountComponent,
                        NzInputDirective,
                        NzInputGroupComponent,
                        NzAutosizeDirective,
                        NzInputGroupSlotComponent,
                        NzInputGroupWhitSuffixOrPrefixDirective,
                        NzInputOtpComponent
                    ],
                    exports: [
                        NzTextareaCountComponent,
                        NzInputDirective,
                        NzInputGroupComponent,
                        NzAutosizeDirective,
                        NzInputGroupWhitSuffixOrPrefixDirective,
                        NzInputOtpComponent
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

export { NzAutosizeDirective, NzInputAddonAfterDirective, NzInputAddonBeforeDirective, NzInputDirective, NzInputGroupComponent, NzInputGroupSlotComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputModule, NzInputOtpComponent, NzInputPrefixDirective, NzInputSuffixDirective, NzTextareaCountComponent };
//# sourceMappingURL=ng-zorro-antd-input.mjs.map
