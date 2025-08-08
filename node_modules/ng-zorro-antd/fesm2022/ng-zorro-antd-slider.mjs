import { RIGHT_ARROW, UP_ARROW, LEFT_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import { Injectable, booleanAttribute, Input, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, Component, numberAttribute, EventEmitter, forwardRef, Output, ViewChildren, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, fromEvent, merge } from 'rxjs';
import { takeUntil, filter, tap, map, distinctUntilChanged } from 'rxjs/operators';
import { numberAttributeWithZeroFallback, ensureNumberInRange, silentEvent, getPrecision, getPercent, getElementOffset, isNil, arraysEqual } from 'ng-zorro-antd/core/util';
import * as i2 from 'ng-zorro-antd/tooltip';
import { NzToolTipModule, NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import * as i2$1 from '@angular/cdk/platform';
import * as i3 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSliderService {
    isDragging = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderService, decorators: [{
            type: Injectable
        }] });

class NzSliderHandleComponent {
    sliderService;
    cdr;
    handleEl;
    tooltip;
    vertical;
    reverse;
    offset;
    value;
    tooltipVisible = 'default';
    tooltipPlacement;
    tooltipFormatter;
    active = false;
    dir = 'ltr';
    tooltipTitle;
    style = {};
    constructor(sliderService, cdr) {
        this.sliderService = sliderService;
        this.cdr = cdr;
    }
    ngOnChanges(changes) {
        const { offset, value, active, tooltipVisible, reverse, dir } = changes;
        if (offset || reverse || dir) {
            this.updateStyle();
        }
        if (value) {
            this.updateTooltipTitle();
            this.updateTooltipPosition();
        }
        if (active) {
            if (active.currentValue) {
                this.toggleTooltip(true);
            }
            else {
                this.toggleTooltip(false);
            }
        }
        if (tooltipVisible?.currentValue === 'always') {
            Promise.resolve().then(() => this.toggleTooltip(true, true));
        }
    }
    enterHandle = () => {
        if (!this.sliderService.isDragging) {
            this.toggleTooltip(true);
            this.updateTooltipPosition();
            this.cdr.detectChanges();
        }
    };
    leaveHandle = () => {
        if (!this.sliderService.isDragging) {
            this.toggleTooltip(false);
            this.cdr.detectChanges();
        }
    };
    focus() {
        this.handleEl?.nativeElement.focus();
    }
    toggleTooltip(show, force = false) {
        if (!force && (this.tooltipVisible !== 'default' || !this.tooltip)) {
            return;
        }
        if (show) {
            this.tooltip?.show();
        }
        else {
            this.tooltip?.hide();
        }
    }
    updateTooltipTitle() {
        if (this.tooltipFormatter) {
            this.tooltipTitle =
                typeof this.tooltipFormatter === 'function' ? this.tooltipFormatter(this.value) : this.tooltipFormatter;
        }
        else {
            this.tooltipTitle = `${this.value}`;
        }
    }
    updateTooltipPosition() {
        if (this.tooltip) {
            Promise.resolve().then(() => this.tooltip?.updatePosition());
        }
    }
    updateStyle() {
        const vertical = this.vertical;
        const reverse = this.reverse;
        const offset = this.offset;
        const positionStyle = vertical
            ? {
                [reverse ? 'top' : 'bottom']: `${offset}%`,
                [reverse ? 'bottom' : 'top']: 'auto',
                transform: reverse ? null : `translateY(+50%)`
            }
            : {
                ...this.getHorizontalStylePosition(),
                transform: `translateX(${reverse ? (this.dir === 'rtl' ? '-' : '+') : this.dir === 'rtl' ? '+' : '-'}50%)`
            };
        this.style = positionStyle;
        this.cdr.markForCheck();
    }
    getHorizontalStylePosition() {
        let left = this.reverse ? 'auto' : `${this.offset}%`;
        let right = this.reverse ? `${this.offset}%` : 'auto';
        if (this.dir === 'rtl') {
            const tmp = left;
            left = right;
            right = tmp;
        }
        return { left, right };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderHandleComponent, deps: [{ token: NzSliderService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzSliderHandleComponent, isStandalone: true, selector: "nz-slider-handle", inputs: { vertical: ["vertical", "vertical", booleanAttribute], reverse: ["reverse", "reverse", booleanAttribute], offset: ["offset", "offset", numberAttributeWithZeroFallback], value: ["value", "value", numberAttributeWithZeroFallback], tooltipVisible: "tooltipVisible", tooltipPlacement: "tooltipPlacement", tooltipFormatter: "tooltipFormatter", active: ["active", "active", booleanAttribute], dir: "dir" }, host: { listeners: { "mouseenter": "enterHandle()", "mouseleave": "leaveHandle()" } }, viewQueries: [{ propertyName: "handleEl", first: true, predicate: ["handle"], descendants: true }, { propertyName: "tooltip", first: true, predicate: NzTooltipDirective, descendants: true }], exportAs: ["nzSliderHandle"], usesOnChanges: true, ngImport: i0, template: `
    <div
      #handle
      class="ant-slider-handle"
      tabindex="0"
      nz-tooltip
      [style]="style"
      [nzTooltipTitle]="tooltipFormatter === null || tooltipVisible === 'never' ? null : tooltipTitle"
      [nzTooltipTitleContext]="{ $implicit: value }"
      [nzTooltipTrigger]="null"
      [nzTooltipPlacement]="tooltipPlacement"
    ></div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzToolTipModule }, { kind: "directive", type: i2.NzTooltipDirective, selector: "[nz-tooltip]", inputs: ["nzTooltipTitle", "nzTooltipTitleContext", "nz-tooltip", "nzTooltipTrigger", "nzTooltipPlacement", "nzTooltipOrigin", "nzTooltipVisible", "nzTooltipMouseEnterDelay", "nzTooltipMouseLeaveDelay", "nzTooltipOverlayClassName", "nzTooltipOverlayStyle", "nzTooltipArrowPointAtCenter", "cdkConnectedOverlayPush", "nzTooltipColor"], outputs: ["nzTooltipVisibleChange"], exportAs: ["nzTooltip"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderHandleComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-slider-handle',
                    exportAs: 'nzSliderHandle',
                    preserveWhitespaces: false,
                    template: `
    <div
      #handle
      class="ant-slider-handle"
      tabindex="0"
      nz-tooltip
      [style]="style"
      [nzTooltipTitle]="tooltipFormatter === null || tooltipVisible === 'never' ? null : tooltipTitle"
      [nzTooltipTitleContext]="{ $implicit: value }"
      [nzTooltipTrigger]="null"
      [nzTooltipPlacement]="tooltipPlacement"
    ></div>
  `,
                    host: {
                        '(mouseenter)': 'enterHandle()',
                        '(mouseleave)': 'leaveHandle()'
                    },
                    imports: [NzToolTipModule]
                }]
        }], ctorParameters: () => [{ type: NzSliderService }, { type: i0.ChangeDetectorRef }], propDecorators: { handleEl: [{
                type: ViewChild,
                args: ['handle', { static: false }]
            }], tooltip: [{
                type: ViewChild,
                args: [NzTooltipDirective, { static: false }]
            }], vertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], reverse: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], offset: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], value: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], tooltipVisible: [{
                type: Input
            }], tooltipPlacement: [{
                type: Input
            }], tooltipFormatter: [{
                type: Input
            }], active: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], dir: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSliderMarksComponent {
    lowerBound = null;
    upperBound = null;
    marksArray = [];
    min;
    max;
    vertical = false;
    included = false;
    reverse;
    marks = [];
    ngOnChanges(changes) {
        const { marksArray, lowerBound, upperBound, reverse } = changes;
        if (marksArray || reverse) {
            this.buildMarks();
        }
        if (marksArray || lowerBound || upperBound || reverse) {
            this.togglePointActive();
        }
    }
    buildMarks() {
        const range = this.max - this.min;
        this.marks = this.marksArray.map(mark => {
            const { value, offset, config } = mark;
            const style = this.getMarkStyles(value, range, config);
            const label = isConfigObject(config) ? config.label : config;
            return {
                label,
                offset,
                style,
                value,
                config,
                active: false
            };
        });
    }
    getMarkStyles(value, range, config) {
        let style;
        const markValue = this.reverse ? this.max + this.min - value : value;
        if (this.vertical) {
            style = {
                marginBottom: '-50%',
                bottom: `${((markValue - this.min) / range) * 100}%`
            };
        }
        else {
            style = {
                transform: `translate3d(-50%, 0, 0)`,
                left: `${((markValue - this.min) / range) * 100}%`
            };
        }
        if (isConfigObject(config) && config.style) {
            style = { ...style, ...config.style };
        }
        return style;
    }
    togglePointActive() {
        if (this.marks && this.lowerBound !== null && this.upperBound !== null) {
            this.marks.forEach(mark => {
                const value = mark.value;
                const isActive = (!this.included && value === this.upperBound) ||
                    (this.included && value <= this.upperBound && value >= this.lowerBound);
                mark.active = isActive;
            });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderMarksComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSliderMarksComponent, isStandalone: true, selector: "nz-slider-marks", inputs: { lowerBound: "lowerBound", upperBound: "upperBound", marksArray: "marksArray", min: ["min", "min", numberAttribute], max: ["max", "max", numberAttribute], vertical: ["vertical", "vertical", booleanAttribute], included: ["included", "included", booleanAttribute], reverse: ["reverse", "reverse", booleanAttribute] }, host: { classAttribute: "ant-slider-mark" }, exportAs: ["nzSliderMarks"], usesOnChanges: true, ngImport: i0, template: `
    @for (attr of marks; track attr.value) {
      <span
        class="ant-slider-mark-text"
        [class.ant-slider-mark-active]="attr.active"
        [style]="attr.style"
        [innerHTML]="attr.label"
      ></span>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderMarksComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    preserveWhitespaces: false,
                    selector: 'nz-slider-marks',
                    exportAs: 'nzSliderMarks',
                    template: `
    @for (attr of marks; track attr.value) {
      <span
        class="ant-slider-mark-text"
        [class.ant-slider-mark-active]="attr.active"
        [style]="attr.style"
        [innerHTML]="attr.label"
      ></span>
    }
  `,
                    host: {
                        class: 'ant-slider-mark'
                    }
                }]
        }], propDecorators: { lowerBound: [{
                type: Input
            }], upperBound: [{
                type: Input
            }], marksArray: [{
                type: Input
            }], min: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], max: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], vertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], included: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], reverse: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
function isConfigObject(config) {
    return typeof config !== 'string';
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSliderStepComponent {
    lowerBound = null;
    upperBound = null;
    marksArray = [];
    min;
    max;
    vertical = false;
    included = false;
    reverse;
    steps = [];
    ngOnChanges(changes) {
        const { marksArray, lowerBound, upperBound, reverse } = changes;
        if (marksArray || reverse) {
            this.buildSteps();
        }
        if (marksArray || lowerBound || upperBound || reverse) {
            this.togglePointActive();
        }
    }
    buildSteps() {
        const orient = this.vertical ? 'bottom' : 'left';
        this.steps = this.marksArray.map(mark => {
            const { value, config } = mark;
            let offset = mark.offset;
            const range = this.max - this.min;
            if (this.reverse) {
                offset = ((this.max - value) / range) * 100;
            }
            return {
                value,
                offset,
                config,
                active: false,
                style: {
                    [orient]: `${offset}%`,
                    transform: this.vertical ? 'translateY(50%)' : 'translateX(-50%)'
                }
            };
        });
    }
    togglePointActive() {
        if (this.steps && this.lowerBound !== null && this.upperBound !== null) {
            this.steps.forEach(step => {
                const value = step.value;
                const isActive = (!this.included && value === this.upperBound) ||
                    (this.included && value <= this.upperBound && value >= this.lowerBound);
                step.active = isActive;
            });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderStepComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSliderStepComponent, isStandalone: true, selector: "nz-slider-step", inputs: { lowerBound: "lowerBound", upperBound: "upperBound", marksArray: "marksArray", min: ["min", "min", numberAttribute], max: ["max", "max", numberAttribute], vertical: ["vertical", "vertical", booleanAttribute], included: ["included", "included", booleanAttribute], reverse: ["reverse", "reverse", booleanAttribute] }, host: { classAttribute: "ant-slider-step" }, exportAs: ["nzSliderStep"], usesOnChanges: true, ngImport: i0, template: `
    @for (step of steps; track step.value) {
      <span class="ant-slider-dot" [class.ant-slider-dot-active]="step.active" [style]="step.style!"></span>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderStepComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-slider-step',
                    exportAs: 'nzSliderStep',
                    preserveWhitespaces: false,
                    template: `
    @for (step of steps; track step.value) {
      <span class="ant-slider-dot" [class.ant-slider-dot-active]="step.active" [style]="step.style!"></span>
    }
  `,
                    host: {
                        class: 'ant-slider-step'
                    }
                }]
        }], propDecorators: { lowerBound: [{
                type: Input
            }], upperBound: [{
                type: Input
            }], marksArray: [{
                type: Input
            }], min: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], max: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], vertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], included: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], reverse: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

class NzSliderTrackComponent {
    offset = 0;
    reverse = false;
    dir = 'ltr';
    length = 0;
    vertical = false;
    included = false;
    style = {};
    ngOnChanges() {
        const vertical = this.vertical;
        const reverse = this.reverse;
        const visibility = this.included ? 'visible' : 'hidden';
        const offset = this.offset;
        const length = this.length;
        const positonStyle = vertical
            ? {
                [reverse ? 'top' : 'bottom']: `${offset}%`,
                [reverse ? 'bottom' : 'top']: 'auto',
                height: `${length}%`,
                visibility
            }
            : {
                ...this.getHorizontalStylePosition(),
                width: `${length}%`,
                visibility
            };
        this.style = positonStyle;
    }
    getHorizontalStylePosition() {
        let left = this.reverse ? 'auto' : `${this.offset}%`;
        let right = this.reverse ? `${this.offset}%` : 'auto';
        if (this.dir === 'rtl') {
            const tmp = left;
            left = right;
            right = tmp;
        }
        return { left, right };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderTrackComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzSliderTrackComponent, isStandalone: true, selector: "nz-slider-track", inputs: { offset: ["offset", "offset", numberAttribute], reverse: ["reverse", "reverse", booleanAttribute], dir: "dir", length: ["length", "length", numberAttribute], vertical: ["vertical", "vertical", booleanAttribute], included: ["included", "included", booleanAttribute] }, exportAs: ["nzSliderTrack"], usesOnChanges: true, ngImport: i0, template: `<div class="ant-slider-track" [style]="style"></div>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderTrackComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-slider-track',
                    exportAs: 'nzSliderTrack',
                    template: `<div class="ant-slider-track" [style]="style"></div>`,
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], propDecorators: { offset: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], reverse: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], dir: [{
                type: Input
            }], length: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], vertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], included: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

class NzSliderComponent {
    slider;
    sliderService;
    cdr;
    platform;
    directionality;
    handlerComponents;
    nzDisabled = false;
    nzDots = false;
    nzIncluded = true;
    nzRange = false;
    nzVertical = false;
    nzReverse = false;
    nzDefaultValue;
    nzMarks = null;
    nzMax = 100;
    nzMin = 0;
    nzStep = 1;
    nzTooltipVisible = 'default';
    nzTooltipPlacement = 'top';
    nzTipFormatter;
    nzOnAfterChange = new EventEmitter();
    value = null;
    cacheSliderStart = null;
    cacheSliderLength = null;
    activeValueIndex = undefined; // Current activated handle's index ONLY for range=true
    track = { offset: null, length: null }; // Track's offset and length
    handles = []; // Handles' offset
    marksArray = null; // "steps" in array type with more data & FILTER out the invalid mark
    bounds = { lower: null, upper: null }; // now for nz-slider-step
    dir = 'ltr';
    dragStart$;
    dragMove$;
    dragEnd$;
    dragStart_;
    dragMove_;
    dragEnd_;
    destroy$ = new Subject();
    isNzDisableFirstChange = true;
    constructor(slider, sliderService, cdr, platform, directionality) {
        this.slider = slider;
        this.sliderService = sliderService;
        this.cdr = cdr;
        this.platform = platform;
        this.directionality = directionality;
    }
    ngOnInit() {
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
            this.updateTrackAndHandles();
            this.onValueChange(this.getValue(true));
        });
        this.handles = generateHandlers(this.nzRange ? 2 : 1);
        this.marksArray = this.nzMarks ? this.generateMarkItems(this.nzMarks) : null;
        this.bindDraggingHandlers();
        this.toggleDragDisabled(this.nzDisabled);
        if (this.getValue() === null) {
            this.setValue(this.formatValue(null));
        }
    }
    ngOnChanges(changes) {
        const { nzDisabled, nzMarks, nzRange } = changes;
        if (nzDisabled && !nzDisabled.firstChange) {
            this.toggleDragDisabled(nzDisabled.currentValue);
        }
        else if (nzMarks && !nzMarks.firstChange) {
            this.marksArray = this.nzMarks ? this.generateMarkItems(this.nzMarks) : null;
        }
        else if (nzRange && !nzRange.firstChange) {
            this.handles = generateHandlers(nzRange.currentValue ? 2 : 1);
            this.setValue(this.formatValue(null));
        }
    }
    ngOnDestroy() {
        this.unsubscribeDrag();
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    writeValue(val) {
        this.setValue(val, true);
    }
    onValueChange(_value) { }
    onTouched() { }
    registerOnChange(fn) {
        this.onValueChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || isDisabled;
        this.isNzDisableFirstChange = false;
        this.toggleDragDisabled(this.nzDisabled);
        this.cdr.markForCheck();
    }
    /**
     * Event handler is only triggered when a slider handler is focused.
     */
    onKeyDown(e) {
        if (this.nzDisabled) {
            return;
        }
        const code = e.keyCode;
        const isIncrease = code === RIGHT_ARROW || code === UP_ARROW;
        const isDecrease = code === LEFT_ARROW || code === DOWN_ARROW;
        if (!(isIncrease || isDecrease)) {
            return;
        }
        e.preventDefault();
        let step = (isDecrease ? -this.nzStep : this.nzStep) * (this.nzReverse ? -1 : 1);
        step = this.dir === 'rtl' ? step * -1 : step;
        const newVal = this.nzRange
            ? this.value[this.activeValueIndex] + step
            : this.value + step;
        this.setActiveValue(ensureNumberInRange(newVal, this.nzMin, this.nzMax));
        this.nzOnAfterChange.emit(this.getValue(true));
    }
    onHandleFocusIn(index) {
        this.activeValueIndex = index;
    }
    setValue(value, isWriteValue = false) {
        if (isWriteValue) {
            this.value = this.formatValue(value);
            this.updateTrackAndHandles();
        }
        else if (!valuesEqual(this.value, value)) {
            this.value = value;
            this.updateTrackAndHandles();
            this.onValueChange(this.getValue(true));
        }
    }
    getValue(cloneAndSort = false) {
        if (cloneAndSort && this.value && isValueRange(this.value)) {
            return [...this.value].sort((a, b) => a - b);
        }
        return this.value;
    }
    /**
     * Clone & sort current value and convert them to offsets, then return the new one.
     */
    getValueToOffset(value) {
        let normalizedValue = value;
        if (typeof normalizedValue === 'undefined') {
            normalizedValue = this.getValue(true);
        }
        return isValueRange(normalizedValue)
            ? normalizedValue.map(val => this.valueToOffset(val))
            : this.valueToOffset(normalizedValue);
    }
    /**
     * Find the closest value to be activated.
     */
    setActiveValueIndex(pointerValue) {
        const value = this.getValue();
        if (isValueRange(value)) {
            let minimal = null;
            let gap;
            let activeIndex = -1;
            value.forEach((val, index) => {
                gap = Math.abs(pointerValue - val);
                if (minimal === null || gap < minimal) {
                    minimal = gap;
                    activeIndex = index;
                }
            });
            this.activeValueIndex = activeIndex;
            this.handlerComponents.toArray()[activeIndex].focus();
        }
        else {
            this.handlerComponents.toArray()[0].focus();
        }
    }
    setActiveValue(pointerValue) {
        if (isValueRange(this.value)) {
            const newValue = [...this.value];
            newValue[this.activeValueIndex] = pointerValue;
            this.setValue(newValue);
        }
        else {
            this.setValue(pointerValue);
        }
    }
    /**
     * Update track and handles' position and length.
     */
    updateTrackAndHandles() {
        const value = this.getValue();
        const offset = this.getValueToOffset(value);
        const valueSorted = this.getValue(true);
        const offsetSorted = this.getValueToOffset(valueSorted);
        const boundParts = isValueRange(valueSorted) ? valueSorted : [0, valueSorted];
        const trackParts = isValueRange(offsetSorted)
            ? [offsetSorted[0], offsetSorted[1] - offsetSorted[0]]
            : [0, offsetSorted];
        this.handles.forEach((handle, index) => {
            handle.offset = isValueRange(offset) ? offset[index] : offset;
            handle.value = isValueRange(value) ? value[index] : value || 0;
        });
        [this.bounds.lower, this.bounds.upper] = boundParts;
        [this.track.offset, this.track.length] = trackParts;
        this.cdr.markForCheck();
    }
    onDragStart(value) {
        this.toggleDragMoving(true);
        this.cacheSliderProperty();
        this.setActiveValueIndex(this.getLogicalValue(value));
        this.setActiveValue(this.getLogicalValue(value));
        this.showHandleTooltip(this.nzRange ? this.activeValueIndex : 0);
    }
    onDragMove(value) {
        this.setActiveValue(this.getLogicalValue(value));
        this.cdr.markForCheck();
    }
    getLogicalValue(value) {
        if (this.nzReverse) {
            if (!this.nzVertical && this.dir === 'rtl') {
                return value;
            }
            return this.nzMax - value + this.nzMin;
        }
        if (!this.nzVertical && this.dir === 'rtl') {
            return this.nzMax - value + this.nzMin;
        }
        return value;
    }
    onDragEnd() {
        this.nzOnAfterChange.emit(this.getValue(true));
        this.toggleDragMoving(false);
        this.cacheSliderProperty(true);
        this.hideAllHandleTooltip();
        this.cdr.markForCheck();
    }
    /**
     * Create user interactions handles.
     */
    bindDraggingHandlers() {
        if (!this.platform.isBrowser) {
            return;
        }
        const pluckFunc = keys => (event) => keys.reduce((acc, key) => acc[key] || acc, event);
        const sliderDOM = this.slider.nativeElement;
        const orientField = this.nzVertical ? 'pageY' : 'pageX';
        const mouse = {
            start: 'mousedown',
            move: 'mousemove',
            end: 'mouseup',
            pluckKey: [orientField]
        };
        const touch = {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend',
            pluckKey: ['touches', '0', orientField],
            filter: (e) => e instanceof TouchEvent
        };
        [mouse, touch].forEach(source => {
            const { start, move, end, pluckKey, filter: filterFunc = () => true } = source;
            source.startPlucked$ = fromEvent(sliderDOM, start).pipe(filter(filterFunc), tap(silentEvent), map(pluckFunc(pluckKey)), map((position) => this.findClosestValue(position)));
            source.end$ = fromEvent(document, end);
            source.moveResolved$ = fromEvent(document, move).pipe(filter(filterFunc), tap(silentEvent), map(pluckFunc(pluckKey)), distinctUntilChanged(), map((position) => this.findClosestValue(position)), distinctUntilChanged(), takeUntil(source.end$));
        });
        this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
        this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
        this.dragEnd$ = merge(mouse.end$, touch.end$);
    }
    subscribeDrag(periods = ['start', 'move', 'end']) {
        if (periods.indexOf('start') !== -1 && this.dragStart$ && !this.dragStart_) {
            this.dragStart_ = this.dragStart$.subscribe(this.onDragStart.bind(this));
        }
        if (periods.indexOf('move') !== -1 && this.dragMove$ && !this.dragMove_) {
            this.dragMove_ = this.dragMove$.subscribe(this.onDragMove.bind(this));
        }
        if (periods.indexOf('end') !== -1 && this.dragEnd$ && !this.dragEnd_) {
            this.dragEnd_ = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
        }
    }
    unsubscribeDrag(periods = ['start', 'move', 'end']) {
        if (periods.indexOf('start') !== -1 && this.dragStart_) {
            this.dragStart_.unsubscribe();
            this.dragStart_ = null;
        }
        if (periods.indexOf('move') !== -1 && this.dragMove_) {
            this.dragMove_.unsubscribe();
            this.dragMove_ = null;
        }
        if (periods.indexOf('end') !== -1 && this.dragEnd_) {
            this.dragEnd_.unsubscribe();
            this.dragEnd_ = null;
        }
    }
    toggleDragMoving(movable) {
        const periods = ['move', 'end'];
        if (movable) {
            this.sliderService.isDragging = true;
            this.subscribeDrag(periods);
        }
        else {
            this.sliderService.isDragging = false;
            this.unsubscribeDrag(periods);
        }
    }
    toggleDragDisabled(disabled) {
        if (disabled) {
            this.unsubscribeDrag();
        }
        else {
            this.subscribeDrag(['start']);
        }
    }
    findClosestValue(position) {
        const sliderStart = this.getSliderStartPosition();
        const sliderLength = this.getSliderLength();
        const ratio = ensureNumberInRange((position - sliderStart) / sliderLength, 0, 1);
        const val = (this.nzMax - this.nzMin) * (this.nzVertical ? 1 - ratio : ratio) + this.nzMin;
        const points = this.nzMarks === null
            ? []
            : Object.keys(this.nzMarks)
                .map(parseFloat)
                .sort((a, b) => a - b);
        if (this.nzStep !== 0 && !this.nzDots) {
            const closestOne = Math.round(val / this.nzStep) * this.nzStep;
            points.push(closestOne);
        }
        const gaps = points.map(point => Math.abs(val - point));
        const closest = points[gaps.indexOf(Math.min(...gaps))];
        // return parseFloat(closest.toFixed(getPrecision(this.nzStep)));
        return this.nzStep === 0 ? closest : parseFloat(closest.toFixed(getPrecision(this.nzStep)));
    }
    valueToOffset(value) {
        return getPercent(this.nzMin, this.nzMax, value);
    }
    getSliderStartPosition() {
        if (this.cacheSliderStart !== null) {
            return this.cacheSliderStart;
        }
        const offset = getElementOffset(this.slider.nativeElement);
        return this.nzVertical ? offset.top : offset.left;
    }
    getSliderLength() {
        if (this.cacheSliderLength !== null) {
            return this.cacheSliderLength;
        }
        const sliderDOM = this.slider.nativeElement;
        return this.nzVertical ? sliderDOM.clientHeight : sliderDOM.clientWidth;
    }
    /**
     * Cache DOM layout/reflow operations for performance (may not necessary?)
     */
    cacheSliderProperty(remove = false) {
        this.cacheSliderStart = remove ? null : this.getSliderStartPosition();
        this.cacheSliderLength = remove ? null : this.getSliderLength();
    }
    formatValue(value) {
        if (isNil(value)) {
            return this.nzRange ? [this.nzMin, this.nzMax] : this.nzMin;
        }
        else if (assertValueValid(value, this.nzRange)) {
            return isValueRange(value)
                ? value.map(val => ensureNumberInRange(val, this.nzMin, this.nzMax))
                : ensureNumberInRange(value, this.nzMin, this.nzMax);
        }
        else {
            return this.nzDefaultValue ? this.nzDefaultValue : this.nzRange ? [this.nzMin, this.nzMax] : this.nzMin;
        }
    }
    /**
     * Show one handle's tooltip and hide others'.
     */
    showHandleTooltip(handleIndex = 0) {
        this.handles.forEach((handle, index) => {
            handle.active = index === handleIndex;
        });
    }
    hideAllHandleTooltip() {
        this.handles.forEach(handle => (handle.active = false));
    }
    generateMarkItems(marks) {
        const marksArray = [];
        for (const key in marks) {
            if (marks.hasOwnProperty(key)) {
                const mark = marks[key];
                const val = typeof key === 'number' ? key : parseFloat(key);
                if (val >= this.nzMin && val <= this.nzMax) {
                    marksArray.push({ value: val, offset: this.valueToOffset(val), config: mark });
                }
            }
        }
        return marksArray.length ? marksArray : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderComponent, deps: [{ token: i0.ElementRef }, { token: NzSliderService }, { token: i0.ChangeDetectorRef }, { token: i2$1.Platform }, { token: i3.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSliderComponent, isStandalone: true, selector: "nz-slider", inputs: { nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzDots: ["nzDots", "nzDots", booleanAttribute], nzIncluded: ["nzIncluded", "nzIncluded", booleanAttribute], nzRange: ["nzRange", "nzRange", booleanAttribute], nzVertical: ["nzVertical", "nzVertical", booleanAttribute], nzReverse: ["nzReverse", "nzReverse", booleanAttribute], nzDefaultValue: "nzDefaultValue", nzMarks: "nzMarks", nzMax: ["nzMax", "nzMax", numberAttribute], nzMin: ["nzMin", "nzMin", numberAttribute], nzStep: ["nzStep", "nzStep", numberAttributeWithZeroFallback], nzTooltipVisible: "nzTooltipVisible", nzTooltipPlacement: "nzTooltipPlacement", nzTipFormatter: "nzTipFormatter" }, outputs: { nzOnAfterChange: "nzOnAfterChange" }, host: { listeners: { "keydown": "onKeyDown($event)" }, properties: { "class.ant-slider-rtl": "dir === 'rtl'", "class.ant-slider-disabled": "nzDisabled", "class.ant-slider-vertical": "nzVertical", "class.ant-slider-with-marks": "marksArray" }, classAttribute: "ant-slider" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzSliderComponent),
                multi: true
            },
            NzSliderService
        ], viewQueries: [{ propertyName: "handlerComponents", predicate: NzSliderHandleComponent, descendants: true }], exportAs: ["nzSlider"], usesOnChanges: true, ngImport: i0, template: `
    <div class="ant-slider-rail"></div>
    <nz-slider-track
      [vertical]="nzVertical"
      [included]="nzIncluded"
      [offset]="track.offset!"
      [length]="track.length!"
      [reverse]="nzReverse"
      [dir]="dir"
    ></nz-slider-track>
    @if (marksArray) {
      <nz-slider-step
        [vertical]="nzVertical"
        [min]="nzMin"
        [max]="nzMax"
        [lowerBound]="$any(bounds.lower)"
        [upperBound]="$any(bounds.upper)"
        [marksArray]="marksArray"
        [included]="nzIncluded"
        [reverse]="nzReverse"
      ></nz-slider-step>
    }
    @for (handle of handles; track handle.value; let handleIndex = $index) {
      <nz-slider-handle
        [vertical]="nzVertical"
        [reverse]="nzReverse"
        [offset]="handle.offset!"
        [value]="handle.value!"
        [active]="handle.active"
        [tooltipFormatter]="nzTipFormatter"
        [tooltipVisible]="nzTooltipVisible"
        [tooltipPlacement]="nzTooltipPlacement"
        [dir]="dir"
        (focusin)="onHandleFocusIn(handleIndex)"
      ></nz-slider-handle>
    }
    @if (marksArray) {
      <nz-slider-marks
        [vertical]="nzVertical"
        [min]="nzMin"
        [max]="nzMax"
        [lowerBound]="$any(bounds.lower)"
        [upperBound]="$any(bounds.upper)"
        [marksArray]="marksArray"
        [included]="nzIncluded"
        [reverse]="nzReverse"
      ></nz-slider-marks>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: NzSliderTrackComponent, selector: "nz-slider-track", inputs: ["offset", "reverse", "dir", "length", "vertical", "included"], exportAs: ["nzSliderTrack"] }, { kind: "component", type: NzSliderStepComponent, selector: "nz-slider-step", inputs: ["lowerBound", "upperBound", "marksArray", "min", "max", "vertical", "included", "reverse"], exportAs: ["nzSliderStep"] }, { kind: "component", type: NzSliderHandleComponent, selector: "nz-slider-handle", inputs: ["vertical", "reverse", "offset", "value", "tooltipVisible", "tooltipPlacement", "tooltipFormatter", "active", "dir"], exportAs: ["nzSliderHandle"] }, { kind: "component", type: NzSliderMarksComponent, selector: "nz-slider-marks", inputs: ["lowerBound", "upperBound", "marksArray", "min", "max", "vertical", "included", "reverse"], exportAs: ["nzSliderMarks"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-slider',
                    exportAs: 'nzSlider',
                    preserveWhitespaces: false,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzSliderComponent),
                            multi: true
                        },
                        NzSliderService
                    ],
                    template: `
    <div class="ant-slider-rail"></div>
    <nz-slider-track
      [vertical]="nzVertical"
      [included]="nzIncluded"
      [offset]="track.offset!"
      [length]="track.length!"
      [reverse]="nzReverse"
      [dir]="dir"
    ></nz-slider-track>
    @if (marksArray) {
      <nz-slider-step
        [vertical]="nzVertical"
        [min]="nzMin"
        [max]="nzMax"
        [lowerBound]="$any(bounds.lower)"
        [upperBound]="$any(bounds.upper)"
        [marksArray]="marksArray"
        [included]="nzIncluded"
        [reverse]="nzReverse"
      ></nz-slider-step>
    }
    @for (handle of handles; track handle.value; let handleIndex = $index) {
      <nz-slider-handle
        [vertical]="nzVertical"
        [reverse]="nzReverse"
        [offset]="handle.offset!"
        [value]="handle.value!"
        [active]="handle.active"
        [tooltipFormatter]="nzTipFormatter"
        [tooltipVisible]="nzTooltipVisible"
        [tooltipPlacement]="nzTooltipPlacement"
        [dir]="dir"
        (focusin)="onHandleFocusIn(handleIndex)"
      ></nz-slider-handle>
    }
    @if (marksArray) {
      <nz-slider-marks
        [vertical]="nzVertical"
        [min]="nzMin"
        [max]="nzMax"
        [lowerBound]="$any(bounds.lower)"
        [upperBound]="$any(bounds.upper)"
        [marksArray]="marksArray"
        [included]="nzIncluded"
        [reverse]="nzReverse"
      ></nz-slider-marks>
    }
  `,
                    imports: [NzSliderTrackComponent, NzSliderStepComponent, NzSliderHandleComponent, NzSliderMarksComponent],
                    host: {
                        class: 'ant-slider',
                        '[class.ant-slider-rtl]': `dir === 'rtl'`,
                        '[class.ant-slider-disabled]': 'nzDisabled',
                        '[class.ant-slider-vertical]': 'nzVertical',
                        '[class.ant-slider-with-marks]': 'marksArray',
                        '(keydown)': 'onKeyDown($event)'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: NzSliderService }, { type: i0.ChangeDetectorRef }, { type: i2$1.Platform }, { type: i3.Directionality }], propDecorators: { handlerComponents: [{
                type: ViewChildren,
                args: [NzSliderHandleComponent]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDots: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIncluded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzRange: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzVertical: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzReverse: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDefaultValue: [{
                type: Input
            }], nzMarks: [{
                type: Input
            }], nzMax: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzMin: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzStep: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], nzTooltipVisible: [{
                type: Input
            }], nzTooltipPlacement: [{
                type: Input
            }], nzTipFormatter: [{
                type: Input
            }], nzOnAfterChange: [{
                type: Output
            }] } });
function getValueTypeNotMatchError() {
    return new Error(`The "nzRange" can't match the "ngModel"'s type, please check these properties: "nzRange", "ngModel", "nzDefaultValue".`);
}
function isValueRange(value) {
    if (value instanceof Array) {
        return value.length === 2;
    }
    else {
        return false;
    }
}
function generateHandlers(amount) {
    return Array(amount)
        .fill(0)
        .map(() => ({ offset: null, value: null, active: false }));
}
/**
 * Check if value is valid and throw error if value-type/range not match.
 */
function assertValueValid(value, isRange) {
    if ((!isValueRange(value) && isNaN(value)) || (isValueRange(value) && value.some(v => isNaN(v)))) {
        return false;
    }
    return assertValueTypeMatch(value, isRange);
}
/**
 * Assert that if `this.nzRange` is `true`, value is also a range, vice versa.
 */
function assertValueTypeMatch(value, isRange = false) {
    if (isValueRange(value) !== isRange) {
        throw getValueTypeNotMatchError();
    }
    return true;
}
function valuesEqual(valA, valB) {
    if (typeof valA !== typeof valB) {
        return false;
    }
    return isValueRange(valA) && isValueRange(valB) ? arraysEqual(valA, valB) : valA === valB;
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSliderModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzSliderModule, imports: [NzSliderComponent,
            NzSliderTrackComponent,
            NzSliderHandleComponent,
            NzSliderStepComponent,
            NzSliderMarksComponent], exports: [NzSliderComponent,
            NzSliderTrackComponent,
            NzSliderHandleComponent,
            NzSliderStepComponent,
            NzSliderMarksComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderModule, imports: [NzSliderComponent,
            NzSliderHandleComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSliderModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzSliderComponent,
                        NzSliderTrackComponent,
                        NzSliderHandleComponent,
                        NzSliderStepComponent,
                        NzSliderMarksComponent
                    ],
                    exports: [
                        NzSliderComponent,
                        NzSliderTrackComponent,
                        NzSliderHandleComponent,
                        NzSliderStepComponent,
                        NzSliderMarksComponent
                    ]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMarks {
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzMarks, NzSliderComponent, NzSliderModule, NzSliderHandleComponent as ɵNzSliderHandleComponent, NzSliderMarksComponent as ɵNzSliderMarksComponent, NzSliderService as ɵNzSliderService, NzSliderStepComponent as ɵNzSliderStepComponent, NzSliderTrackComponent as ɵNzSliderTrackComponent };
//# sourceMappingURL=ng-zorro-antd-slider.mjs.map
