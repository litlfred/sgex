import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { EventEmitter, Output, Input, Component, inject, booleanAttribute, ViewChild, NgModule, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import * as i1 from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NzStringTemplateOutletDirective } from 'ng-zorro-antd/core/outlet';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { TinyColor } from '@ctrl/tinycolor';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import * as i2 from 'ng-zorro-antd/select';
import { NzSelectModule } from 'ng-zorro-antd/select';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const getRoundNumber = (value) => Math.round(Number(value || 0));
const convertHsb2Hsv = (color) => {
    if (color && typeof color === 'object' && 'h' in color && 'b' in color) {
        const { b, ...resets } = color;
        return {
            ...resets,
            v: b
        };
    }
    if (typeof color === 'string' && /hsb/.test(color)) {
        return color.replace(/hsb/, 'hsv');
    }
    return color;
};
class Color extends TinyColor {
    constructor(color) {
        super(convertHsb2Hsv(color));
    }
    toHsbString() {
        const hsb = this.toHsb();
        const saturation = getRoundNumber(hsb.s * 100);
        const lightness = getRoundNumber(hsb.b * 100);
        const hue = getRoundNumber(hsb.h);
        const alpha = hsb.a;
        const hsbString = `hsb(${hue}, ${saturation}%, ${lightness}%)`;
        const hsbaString = `hsba(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(alpha === 0 ? 0 : 2)})`;
        return alpha === 1 ? hsbString : hsbaString;
    }
    toHsb() {
        let hsv = this.toHsv();
        if (typeof this.originalInput === 'object' && this.originalInput) {
            if ('h' in this.originalInput) {
                hsv = this.originalInput;
            }
        }
        const { v: _, ...resets } = hsv;
        return {
            ...resets,
            b: hsv.v
        };
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const generateColor = (color) => {
    if (color instanceof Color) {
        return color;
    }
    return new Color(color);
};
const defaultColor = generateColor('#1677ff');
function calculateColor(offset, containerRef, targetRef, color, type) {
    const { width, height } = containerRef.getBoundingClientRect();
    const { width: targetWidth, height: targetHeight } = targetRef.getBoundingClientRect();
    const centerOffsetX = targetWidth / 2;
    const centerOffsetY = targetHeight / 2;
    const saturation = (offset.x + centerOffsetX) / width;
    const bright = 1 - (offset.y + centerOffsetY) / height;
    const hsb = color?.toHsb() || { a: 0, h: 0, s: 0, b: 0 };
    const alphaOffset = saturation;
    const hueOffset = ((offset.x + centerOffsetX) / width) * 360;
    if (type) {
        switch (type) {
            case 'hue':
                return generateColor({
                    ...hsb,
                    h: hueOffset <= 0 ? 0 : hueOffset
                });
            case 'alpha':
                return generateColor({
                    ...hsb,
                    a: alphaOffset <= 0 ? 0 : alphaOffset
                });
        }
    }
    return generateColor({
        h: hsb.h,
        s: saturation <= 0 ? 0 : saturation,
        b: bright >= 1 ? 1 : bright,
        a: hsb.a
    });
}
const calculateOffset = (containerRef, targetRef, color, type) => {
    const { width, height } = containerRef.getBoundingClientRect();
    const { width: targetWidth, height: targetHeight } = targetRef.getBoundingClientRect();
    const centerOffsetX = targetWidth / 2;
    const centerOffsetY = targetHeight / 2;
    const hsb = color?.toHsb() || { a: 0, h: 0, s: 0, b: 0 };
    // Exclusion of boundary cases
    if ((targetWidth === 0 && targetHeight === 0) || targetWidth !== targetHeight) {
        return null;
    }
    if (type) {
        switch (type) {
            case 'hue':
                return {
                    x: (hsb.h / 360) * width - centerOffsetX,
                    y: -centerOffsetY / 3
                };
            case 'alpha':
                return {
                    x: hsb.a * width - centerOffsetX,
                    y: -centerOffsetY / 3
                };
        }
    }
    return {
        x: hsb.s * width - centerOffsetX,
        y: (1 - hsb.b) * height - centerOffsetY
    };
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NgAntdColorBlockComponent {
    color = defaultColor.toHsbString();
    nzOnClick = new EventEmitter();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorBlockComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NgAntdColorBlockComponent, isStandalone: true, selector: "ng-antd-color-block", inputs: { color: "color" }, outputs: { nzOnClick: "nzOnClick" }, ngImport: i0, template: `
    <div class="ant-color-picker-color-block" (click)="nzOnClick.emit(true)">
      <div class="ant-color-picker-color-block-inner" [style.background-color]="color"></div>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorBlockComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'ng-antd-color-block',
                    template: `
    <div class="ant-color-picker-color-block" (click)="nzOnClick.emit(true)">
      <div class="ant-color-picker-color-block-inner" [style.background-color]="color"></div>
    </div>
  `
                }]
        }], propDecorators: { color: [{
                type: Input
            }], nzOnClick: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class HandlerComponent {
    color = null;
    size = 'default';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: HandlerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: HandlerComponent, isStandalone: true, selector: "color-handler", inputs: { color: "color", size: "size" }, ngImport: i0, template: `
    <div
      class="ant-color-picker-handler"
      [style.background-color]="color"
      [class.ant-color-picker-handler-sm]="size === 'small'"
    ></div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: HandlerComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'color-handler',
                    template: `
    <div
      class="ant-color-picker-handler"
      [style.background-color]="color"
      [class.ant-color-picker-handler-sm]="size === 'small'"
    ></div>
  `
                }]
        }], propDecorators: { color: [{
                type: Input
            }], size: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class PaletteComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: PaletteComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: PaletteComponent, isStandalone: true, selector: "color-palette", ngImport: i0, template: `
    <div class="ant-color-picker-palette">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: PaletteComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'color-palette',
                    template: `
    <div class="ant-color-picker-palette">
      <ng-content></ng-content>
    </div>
  `
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function getPosition$1(e) {
    const obj = 'touches' in e ? e.touches[0] : e;
    const scrollXOffset = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
    const scrollYOffset = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
    return { pageX: obj.pageX - scrollXOffset, pageY: obj.pageY - scrollYOffset };
}
class PickerComponent {
    cdr;
    containerRef;
    transformRef;
    color = null;
    nzOnChange = new EventEmitter();
    nzOnChangeComplete = new EventEmitter();
    disabled = false;
    offsetValue = { x: 0, y: 0 };
    dragRef = false;
    document = inject(DOCUMENT);
    mouseMoveRef = () => null;
    mouseUpRef = () => null;
    toRgbString() {
        return this.color?.toRgbString();
    }
    toHsb() {
        return `hsl(${this.color?.toHsb().h},100%, 50%)`;
    }
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnInit() {
        this.document.removeEventListener('mousemove', this.mouseMoveRef);
        this.document.removeEventListener('mouseup', this.mouseUpRef);
        this.document.removeEventListener('touchmove', this.mouseMoveRef);
        this.document.removeEventListener('touchend', this.mouseUpRef);
        this.mouseMoveRef = () => null;
        this.mouseUpRef = () => null;
    }
    ngOnChanges(changes) {
        const { color } = changes;
        if (color) {
            if (!this.dragRef && this.containerRef && this.transformRef) {
                const calcOffset = calculateOffset(this.containerRef.nativeElement, this.transformRef.nativeElement, this.color);
                if (calcOffset) {
                    this.offsetValue = calcOffset;
                    this.cdr.detectChanges();
                }
            }
        }
    }
    ngAfterViewInit() {
        if (!this.dragRef && this.containerRef && this.transformRef) {
            const calcOffset = calculateOffset(this.containerRef.nativeElement, this.transformRef.nativeElement, this.color);
            if (calcOffset) {
                this.offsetValue = calcOffset;
                this.cdr.detectChanges();
            }
        }
    }
    dragStartHandle(e) {
        this.onDragStart(e);
    }
    updateOffset = (e, direction = 'y') => {
        const { pageX, pageY } = getPosition$1(e);
        const { x: rectX, y: rectY, width, height } = this.containerRef?.nativeElement?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 };
        const { width: targetWidth, height: targetHeight } = this.transformRef?.nativeElement?.getBoundingClientRect() || {
            width: 0,
            height: 0
        };
        const centerOffsetX = targetWidth / 2;
        const centerOffsetY = targetHeight / 2;
        const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
        const offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;
        const calcOffset = {
            x: offsetX,
            y: direction === 'x' ? this.offsetValue.y : offsetY
        };
        // Exclusion of boundary cases
        if ((targetWidth === 0 && targetHeight === 0) || targetWidth !== targetHeight) {
            return;
        }
        this.offsetValue = calcOffset;
        this.nzOnChange.emit(calculateColor(calcOffset, this.containerRef.nativeElement, this.transformRef.nativeElement, this.color));
        this.cdr.detectChanges();
    };
    onDragMove = (e) => {
        e.preventDefault();
        this.updateOffset(e);
    };
    onDragStop = (e) => {
        e.preventDefault();
        this.dragRef = false;
        this.document.removeEventListener('mousemove', this.onDragMove);
        this.document.removeEventListener('mouseup', this.mouseUpRef);
        this.document.removeEventListener('touchmove', this.mouseMoveRef);
        this.document.removeEventListener('touchend', this.mouseUpRef);
        this.mouseMoveRef = () => null;
        this.mouseUpRef = () => null;
        this.nzOnChangeComplete?.emit();
    };
    onDragStart = (e) => {
        if (this.disabled) {
            return;
        }
        this.updateOffset(e);
        this.dragRef = true;
        this.document.addEventListener('mousemove', this.onDragMove);
        this.document.addEventListener('mouseup', this.onDragStop);
        this.document.addEventListener('touchmove', this.onDragMove);
        this.document.addEventListener('touchend', this.onDragStop);
        this.mouseMoveRef = this.onDragMove;
        this.mouseUpRef = this.onDragStop;
        this.cdr.markForCheck();
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: PickerComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: PickerComponent, isStandalone: true, selector: "color-picker", inputs: { color: "color", disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { nzOnChange: "nzOnChange", nzOnChangeComplete: "nzOnChangeComplete" }, viewQueries: [{ propertyName: "containerRef", first: true, predicate: ["slider"], descendants: true }, { propertyName: "transformRef", first: true, predicate: ["transform"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div
      #slider
      class="ant-color-picker-select"
      (mousedown)="dragStartHandle($event)"
      (touchstart)="dragStartHandle($event)"
    >
      <color-palette>
        <div
          #transform
          class="ant-color-picker-transform"
          [style.left]="offsetValue.x + 'px'"
          [style.top]="offsetValue.y + 'px'"
        >
          <color-handler [color]="toRgbString()" />
        </div>
        <div class="ant-color-picker-saturation" [style.background-color]="toHsb()"></div>
      </color-palette>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: HandlerComponent, selector: "color-handler", inputs: ["color", "size"] }, { kind: "component", type: PaletteComponent, selector: "color-palette" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: PickerComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'color-picker',
                    imports: [HandlerComponent, PaletteComponent],
                    template: `
    <div
      #slider
      class="ant-color-picker-select"
      (mousedown)="dragStartHandle($event)"
      (touchstart)="dragStartHandle($event)"
    >
      <color-palette>
        <div
          #transform
          class="ant-color-picker-transform"
          [style.left]="offsetValue.x + 'px'"
          [style.top]="offsetValue.y + 'px'"
        >
          <color-handler [color]="toRgbString()" />
        </div>
        <div class="ant-color-picker-saturation" [style.background-color]="toHsb()"></div>
      </color-palette>
    </div>
  `
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { containerRef: [{
                type: ViewChild,
                args: ['slider', { static: false }]
            }], transformRef: [{
                type: ViewChild,
                args: ['transform', { static: false }]
            }], color: [{
                type: Input
            }], nzOnChange: [{
                type: Output
            }], nzOnChangeComplete: [{
                type: Output
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class GradientComponent {
    colors = [];
    direction = 'to right';
    type = 'hue';
    gradientColors = '';
    ngOnInit() {
        this.useMemo();
    }
    ngOnChanges(changes) {
        const { colors, type } = changes;
        if (colors || type) {
            this.useMemo();
        }
    }
    useMemo() {
        this.gradientColors = this.colors
            .map((color, idx) => {
            const result = generateColor(color);
            if (this.type === 'alpha' && idx === this.colors.length - 1) {
                result.setAlpha(1);
            }
            return result.toRgbString();
        })
            .join(',');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: GradientComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: GradientComponent, isStandalone: true, selector: "color-gradient", inputs: { colors: "colors", direction: "direction", type: "type" }, usesOnChanges: true, ngImport: i0, template: `
    <div
      class="ant-color-picker-gradient"
      [style.background]="'linear-gradient(' + direction + ', ' + gradientColors + ')'"
    >
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: GradientComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'color-gradient',
                    template: `
    <div
      class="ant-color-picker-gradient"
      [style.background]="'linear-gradient(' + direction + ', ' + gradientColors + ')'"
    >
      <ng-content></ng-content>
    </div>
  `
                }]
        }], propDecorators: { colors: [{
                type: Input
            }], direction: [{
                type: Input
            }], type: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function getPosition(e) {
    const obj = 'touches' in e ? e.touches[0] : e;
    const scrollXOffset = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
    const scrollYOffset = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
    return { pageX: obj.pageX - scrollXOffset, pageY: obj.pageY - scrollYOffset };
}
class SliderComponent {
    cdr;
    containerRef;
    transformRef;
    gradientColors = [];
    direction = 'to right';
    type = 'hue';
    color = null;
    value = null;
    disabled = false;
    nzOnChange = new EventEmitter();
    nzOnChangeComplete = new EventEmitter();
    offsetValue = { x: 0, y: 0 };
    dragRef = false;
    mouseMoveRef = () => null;
    mouseUpRef = () => null;
    document = inject(DOCUMENT);
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnInit() {
        this.document.removeEventListener('mousemove', this.mouseMoveRef);
        this.document.removeEventListener('mouseup', this.mouseUpRef);
        this.document.removeEventListener('touchmove', this.mouseMoveRef);
        this.document.removeEventListener('touchend', this.mouseUpRef);
        this.mouseMoveRef = () => null;
        this.mouseUpRef = () => null;
    }
    ngOnChanges(changes) {
        const { color } = changes;
        if (color) {
            if (!this.dragRef && this.containerRef && this.transformRef) {
                const calcOffset = calculateOffset(this.containerRef.nativeElement, this.transformRef.nativeElement, this.color, this.type);
                if (calcOffset) {
                    this.offsetValue = calcOffset;
                    this.cdr.detectChanges();
                }
            }
        }
    }
    ngAfterViewInit() {
        if (!this.dragRef && this.containerRef && this.transformRef) {
            const calcOffset = calculateOffset(this.containerRef.nativeElement, this.transformRef.nativeElement, this.color, this.type);
            if (calcOffset) {
                this.offsetValue = calcOffset;
                this.cdr.detectChanges();
            }
        }
    }
    dragStartHandle(e) {
        this.onDragStart(e);
    }
    updateOffset = (e, direction = 'x') => {
        const { pageX, pageY } = getPosition(e);
        const { x: rectX, y: rectY, width, height } = this.containerRef?.nativeElement?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 };
        const { width: targetWidth, height: targetHeight } = this.transformRef?.nativeElement?.getBoundingClientRect() || {
            width: 0,
            height: 0
        };
        const centerOffsetX = targetWidth / 2;
        const centerOffsetY = targetHeight / 2;
        const offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
        const offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;
        const calcOffset = {
            x: offsetX,
            y: direction === 'x' ? this.offsetValue.y : offsetY
        };
        // Exclusion of boundary cases
        if ((targetWidth === 0 && targetHeight === 0) || targetWidth !== targetHeight) {
            return;
        }
        this.offsetValue = calcOffset;
        this.nzOnChange.emit(calculateColor(calcOffset, this.containerRef.nativeElement, this.transformRef.nativeElement, this.color, this.type));
        this.cdr.detectChanges();
    };
    onDragMove = (e) => {
        e.preventDefault();
        this.updateOffset(e);
    };
    onDragStop = (e) => {
        e.preventDefault();
        this.dragRef = false;
        this.document.removeEventListener('mousemove', this.onDragMove);
        this.document.removeEventListener('mouseup', this.mouseUpRef);
        this.document.removeEventListener('touchmove', this.mouseMoveRef);
        this.document.removeEventListener('touchend', this.mouseUpRef);
        this.mouseMoveRef = () => null;
        this.mouseUpRef = () => null;
        this.nzOnChangeComplete?.emit(this.type);
    };
    onDragStart = (e) => {
        if (this.disabled) {
            return;
        }
        this.updateOffset(e);
        this.dragRef = true;
        this.document.addEventListener('mousemove', this.onDragMove);
        this.document.addEventListener('mouseup', this.onDragStop);
        this.document.addEventListener('touchmove', this.onDragMove);
        this.document.addEventListener('touchend', this.onDragStop);
        this.mouseMoveRef = this.onDragMove;
        this.mouseUpRef = this.onDragStop;
        this.cdr.markForCheck();
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: SliderComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: SliderComponent, isStandalone: true, selector: "color-slider", inputs: { gradientColors: "gradientColors", direction: "direction", type: "type", color: "color", value: "value", disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { nzOnChange: "nzOnChange", nzOnChangeComplete: "nzOnChangeComplete" }, viewQueries: [{ propertyName: "containerRef", first: true, predicate: ["slider"], descendants: true }, { propertyName: "transformRef", first: true, predicate: ["transform"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div
      #slider
      (mousedown)="dragStartHandle($event)"
      (touchstart)="dragStartHandle($event)"
      class="ant-color-picker-slider"
      [class]="'ant-color-picker-slider-' + type"
    >
      <color-palette>
        <div
          #transform
          class="ant-color-picker-transform"
          [style.left]="offsetValue.x + 'px'"
          [style.top]="offsetValue.y + 'px'"
        >
          <color-handler size="small" [color]="value"></color-handler>
        </div>
        <color-gradient [colors]="gradientColors" [direction]="direction" [type]="type"></color-gradient>
      </color-palette>
    </div>
  `, isInline: true, styles: [":host{display:block;width:100%}\n"], dependencies: [{ kind: "component", type: PaletteComponent, selector: "color-palette" }, { kind: "component", type: GradientComponent, selector: "color-gradient", inputs: ["colors", "direction", "type"] }, { kind: "component", type: HandlerComponent, selector: "color-handler", inputs: ["color", "size"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: SliderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'color-slider', imports: [PaletteComponent, GradientComponent, HandlerComponent], template: `
    <div
      #slider
      (mousedown)="dragStartHandle($event)"
      (touchstart)="dragStartHandle($event)"
      class="ant-color-picker-slider"
      [class]="'ant-color-picker-slider-' + type"
    >
      <color-palette>
        <div
          #transform
          class="ant-color-picker-transform"
          [style.left]="offsetValue.x + 'px'"
          [style.top]="offsetValue.y + 'px'"
        >
          <color-handler size="small" [color]="value"></color-handler>
        </div>
        <color-gradient [colors]="gradientColors" [direction]="direction" [type]="type"></color-gradient>
      </color-palette>
    </div>
  `, styles: [":host{display:block;width:100%}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { containerRef: [{
                type: ViewChild,
                args: ['slider', { static: false }]
            }], transformRef: [{
                type: ViewChild,
                args: ['transform', { static: false }]
            }], gradientColors: [{
                type: Input
            }], direction: [{
                type: Input
            }], type: [{
                type: Input
            }], color: [{
                type: Input
            }], value: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOnChange: [{
                type: Output
            }], nzOnChangeComplete: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NgAntdColorPickerComponent {
    cdr;
    value;
    defaultValue;
    nzOnChange = new EventEmitter();
    nzOnChangeComplete = new EventEmitter();
    panelRenderHeader = null;
    panelRenderFooter = null;
    disabledAlpha = false;
    disabled = false;
    colorValue = null;
    alphaColor = '';
    hueColor = [
        'rgb(255, 0, 0) 0%',
        'rgb(255, 255, 0) 17%',
        'rgb(0, 255, 0) 33%',
        'rgb(0, 255, 255) 50%',
        'rgb(0, 0, 255) 67%',
        'rgb(255, 0, 255) 83%',
        'rgb(255, 0, 0) 100%'
    ];
    gradientColors = ['rgba(255, 0, 4, 0) 0%', this.alphaColor];
    toRgbString = this.colorValue?.toRgbString() || '';
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnInit() {
        this.setColorValue(this.value);
    }
    ngOnChanges(changes) {
        const { value, defaultValue } = changes;
        if (value || defaultValue) {
            this.setColorValue(this.value);
        }
    }
    hasValue(value) {
        return !!value;
    }
    setColorValue(color) {
        let mergeState;
        if (this.hasValue(color)) {
            mergeState = color;
        }
        else if (this.hasValue(this.defaultValue)) {
            mergeState = this.defaultValue;
        }
        else {
            mergeState = defaultColor;
        }
        this.colorValue = generateColor(mergeState);
        this.setAlphaColor(this.colorValue);
        this.toRgbString = this.colorValue?.toRgbString() || '';
        this.cdr.detectChanges();
    }
    setAlphaColor(colorValue) {
        const rgb = generateColor(colorValue.toRgbString());
        this.alphaColor = rgb.toRgbString();
        this.gradientColors = ['rgba(255, 0, 4, 0) 0%', this.alphaColor];
        this.cdr.markForCheck();
    }
    handleChange(color, type) {
        this.setColorValue(color);
        this.nzOnChange.emit({ color, type });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NgAntdColorPickerComponent, isStandalone: true, selector: "ng-antd-color-picker", inputs: { value: "value", defaultValue: "defaultValue", panelRenderHeader: "panelRenderHeader", panelRenderFooter: "panelRenderFooter", disabledAlpha: ["disabledAlpha", "disabledAlpha", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { nzOnChange: "nzOnChange", nzOnChangeComplete: "nzOnChangeComplete" }, usesOnChanges: true, ngImport: i0, template: `
    <div class="ant-color-picker-panel" [class.ant-color-picker-panel-disabled]="disabled">
      @if (panelRenderHeader) {
        <ng-template [ngTemplateOutlet]="panelRenderHeader"></ng-template>
      }
      <color-picker
        [color]="colorValue"
        (nzOnChange)="handleChange($event)"
        [disabled]="disabled"
        (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
      ></color-picker>
      <div class="ant-color-picker-slider-container">
        <div class="ant-color-picker-slider-group" [class.ant-color-picker-slider-group-disabled-alpha]="disabledAlpha">
          <color-slider
            [color]="colorValue"
            [value]="'hsl(' + colorValue?.toHsb()?.h + ',100%, 50%)'"
            [gradientColors]="hueColor"
            (nzOnChange)="handleChange($event, 'hue')"
            [disabled]="disabled"
            (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
          ></color-slider>
          @if (!disabledAlpha) {
            <color-slider
              type="alpha"
              [color]="colorValue"
              [value]="toRgbString"
              [gradientColors]="gradientColors"
              (nzOnChange)="handleChange($event, 'alpha')"
              [disabled]="disabled"
              (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
            ></color-slider>
          }
        </div>
        <ng-antd-color-block [color]="toRgbString"></ng-antd-color-block>
      </div>
      @if (panelRenderFooter) {
        <ng-template [ngTemplateOutlet]="panelRenderFooter"></ng-template>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: PickerComponent, selector: "color-picker", inputs: ["color", "disabled"], outputs: ["nzOnChange", "nzOnChangeComplete"] }, { kind: "component", type: SliderComponent, selector: "color-slider", inputs: ["gradientColors", "direction", "type", "color", "value", "disabled"], outputs: ["nzOnChange", "nzOnChangeComplete"] }, { kind: "component", type: NgAntdColorBlockComponent, selector: "ng-antd-color-block", inputs: ["color"], outputs: ["nzOnClick"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerComponent, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'ng-antd-color-picker',
                    imports: [PickerComponent, SliderComponent, NgAntdColorBlockComponent, NgTemplateOutlet],
                    template: `
    <div class="ant-color-picker-panel" [class.ant-color-picker-panel-disabled]="disabled">
      @if (panelRenderHeader) {
        <ng-template [ngTemplateOutlet]="panelRenderHeader"></ng-template>
      }
      <color-picker
        [color]="colorValue"
        (nzOnChange)="handleChange($event)"
        [disabled]="disabled"
        (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
      ></color-picker>
      <div class="ant-color-picker-slider-container">
        <div class="ant-color-picker-slider-group" [class.ant-color-picker-slider-group-disabled-alpha]="disabledAlpha">
          <color-slider
            [color]="colorValue"
            [value]="'hsl(' + colorValue?.toHsb()?.h + ',100%, 50%)'"
            [gradientColors]="hueColor"
            (nzOnChange)="handleChange($event, 'hue')"
            [disabled]="disabled"
            (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
          ></color-slider>
          @if (!disabledAlpha) {
            <color-slider
              type="alpha"
              [color]="colorValue"
              [value]="toRgbString"
              [gradientColors]="gradientColors"
              (nzOnChange)="handleChange($event, 'alpha')"
              [disabled]="disabled"
              (nzOnChangeComplete)="nzOnChangeComplete.emit($event)"
            ></color-slider>
          }
        </div>
        <ng-antd-color-block [color]="toRgbString"></ng-antd-color-block>
      </div>
      @if (panelRenderFooter) {
        <ng-template [ngTemplateOutlet]="panelRenderFooter"></ng-template>
      }
    </div>
  `
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { value: [{
                type: Input
            }], defaultValue: [{
                type: Input
            }], nzOnChange: [{
                type: Output
            }], nzOnChangeComplete: [{
                type: Output
            }], panelRenderHeader: [{
                type: Input
            }], panelRenderFooter: [{
                type: Input
            }], disabledAlpha: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NgAntdColorPickerModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerModule, imports: [NgAntdColorPickerComponent, NgAntdColorBlockComponent], exports: [NgAntdColorPickerComponent, NgAntdColorBlockComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NgAntdColorPickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NgAntdColorPickerComponent, NgAntdColorBlockComponent],
                    exports: [NgAntdColorPickerComponent, NgAntdColorBlockComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzColorBlockComponent {
    nzColor = defaultColor.toHexString();
    nzSize = 'default';
    nzOnClick = new EventEmitter();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorBlockComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzColorBlockComponent, isStandalone: true, selector: "nz-color-block", inputs: { nzColor: "nzColor", nzSize: "nzSize" }, outputs: { nzOnClick: "nzOnClick" }, host: { properties: { "class.ant-color-picker-inline-sm": "nzSize === 'small'", "class.ant-color-picker-inline-lg": "nzSize === 'large'" }, classAttribute: "ant-color-picker-inline" }, exportAs: ["NzColorBlock"], ngImport: i0, template: ` <ng-antd-color-block [color]="nzColor" (nzOnClick)="nzOnClick.emit($event)"></ng-antd-color-block> `, isInline: true, dependencies: [{ kind: "ngmodule", type: NgAntdColorPickerModule }, { kind: "component", type: NgAntdColorBlockComponent, selector: "ng-antd-color-block", inputs: ["color"], outputs: ["nzOnClick"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorBlockComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-color-block',
                    exportAs: 'NzColorBlock',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NgAntdColorPickerModule],
                    template: ` <ng-antd-color-block [color]="nzColor" (nzOnClick)="nzOnClick.emit($event)"></ng-antd-color-block> `,
                    host: {
                        class: 'ant-color-picker-inline',
                        '[class.ant-color-picker-inline-sm]': `nzSize === 'small'`,
                        '[class.ant-color-picker-inline-lg]': `nzSize === 'large'`
                    }
                }]
        }], propDecorators: { nzColor: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzOnClick: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzColorFormatComponent {
    formBuilder;
    format = null;
    colorValue = '';
    clearColor = false;
    nzDisabledAlpha = false;
    formatChange = new EventEmitter();
    nzOnFormatChange = new EventEmitter();
    destroy$ = new Subject();
    validatorFn() {
        return (control) => {
            const REGEXP = /^[0-9a-fA-F]{6}$/;
            if (!control.value) {
                return { error: true };
            }
            else if (!REGEXP.test(control.value)) {
                return { error: true };
            }
            return null;
        };
    }
    validateForm;
    formatterPercent = (value) => `${value} %`;
    parserPercent = (value) => +value.replace(' %', '');
    constructor(formBuilder) {
        this.formBuilder = formBuilder;
        this.validateForm = this.formBuilder.nonNullable.group({
            isFormat: this.formBuilder.control('hex'),
            hex: this.formBuilder.control('1677FF', this.validatorFn()),
            hsbH: 215,
            hsbS: 91,
            hsbB: 100,
            rgbR: 22,
            rgbG: 119,
            rgbB: 255,
            roundA: 100
        });
    }
    ngOnInit() {
        this.validateForm.valueChanges
            .pipe(filter(() => this.validateForm.valid), debounceTime(200), distinctUntilChanged((prev, current) => Object.keys(prev).every(key => prev[key] === current[key])), takeUntil(this.destroy$))
            .subscribe(value => {
            let color = '';
            switch (value.isFormat) {
                case 'hsb':
                    color = generateColor({
                        h: Number(value.hsbH),
                        s: Number(value.hsbS) / 100,
                        b: Number(value.hsbB) / 100,
                        a: Number(value.roundA) / 100
                    }).toHsbString();
                    break;
                case 'rgb':
                    color = generateColor({
                        r: Number(value.rgbR),
                        g: Number(value.rgbG),
                        b: Number(value.rgbB),
                        a: Number(value.roundA) / 100
                    }).toRgbString();
                    break;
                default: {
                    const hex = generateColor(value.hex);
                    const hexColor = generateColor({
                        r: hex.r,
                        g: hex.g,
                        b: hex.b,
                        a: Number(value.roundA) / 100
                    });
                    color = hexColor.getAlpha() < 1 ? hexColor.toHex8String() : hexColor.toHexString();
                    break;
                }
            }
            this.formatChange.emit({ color, format: value.isFormat || this.format || 'hex' });
        });
        this.validateForm
            .get('isFormat')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
            this.nzOnFormatChange.emit(value);
        });
    }
    ngOnChanges(changes) {
        const { colorValue, format, clearColor } = changes;
        if (colorValue) {
            const colorValue = {
                hex: generateColor(this.colorValue).toHex(),
                hsbH: Math.round(generateColor(this.colorValue).toHsb().h),
                hsbS: Math.round(generateColor(this.colorValue).toHsb().s * 100),
                hsbB: Math.round(generateColor(this.colorValue).toHsb().b * 100),
                rgbR: Math.round(generateColor(this.colorValue).r),
                rgbG: Math.round(generateColor(this.colorValue).g),
                rgbB: Math.round(generateColor(this.colorValue).b),
                roundA: Math.round(generateColor(this.colorValue).roundA * 100)
            };
            this.validateForm.patchValue(colorValue);
        }
        if (format && this.format) {
            this.validateForm.get('isFormat')?.patchValue(this.format);
        }
        if (clearColor && this.clearColor) {
            this.validateForm.get('roundA')?.patchValue(0);
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorFormatComponent, deps: [{ token: i1.FormBuilder }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzColorFormatComponent, isStandalone: true, selector: "nz-color-format", inputs: { format: "format", colorValue: "colorValue", clearColor: ["clearColor", "clearColor", booleanAttribute], nzDisabledAlpha: ["nzDisabledAlpha", "nzDisabledAlpha", booleanAttribute] }, outputs: { formatChange: "formatChange", nzOnFormatChange: "nzOnFormatChange" }, exportAs: ["NzColorFormat"], usesOnChanges: true, ngImport: i0, template: `
    <div [formGroup]="validateForm" class="ant-color-picker-input-container">
      <div class="ant-color-picker-format-select">
        <nz-select formControlName="isFormat" nzBorderless nzSize="small">
          <nz-option nzValue="hex" nzLabel="HEX" />
          <nz-option nzValue="hsb" nzLabel="HSB" />
          <nz-option nzValue="rgb" nzLabel="RGB" />
        </nz-select>
      </div>

      <div class="ant-color-picker-input">
        @switch (validateForm.controls.isFormat.value) {
          @case ('hex') {
            <div class="ant-color-picker-hex-input">
              <nz-input-group nzPrefix="#" nzSize="small">
                <input nz-input nzSize="small" formControlName="hex" />
              </nz-input-group>
            </div>
          }
          @case ('hsb') {
            <div class="ant-color-picker-hsb-input">
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbH"
                  [nzMin]="0"
                  [nzMax]="360"
                  [nzStep]="1"
                  [nzPrecision]="0"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbS"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbB"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
            </div>
          }
          @default {
            <div class="ant-color-picker-rgb-input">
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbR" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbG" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbB" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
            </div>
          }
        }
      </div>

      @if (!nzDisabledAlpha) {
        <div class="ant-color-picker-steppers ant-color-picker-alpha-input">
          <nz-input-number
            formControlName="roundA"
            [nzMin]="0"
            [nzMax]="100"
            [nzStep]="1"
            [nzFormatter]="formatterPercent"
            [nzParser]="parserPercent"
            nzSize="small"
          />
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i1.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i1.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }, { kind: "ngmodule", type: NzSelectModule }, { kind: "component", type: i2.NzOptionComponent, selector: "nz-option", inputs: ["nzTitle", "nzLabel", "nzValue", "nzKey", "nzDisabled", "nzHide", "nzCustomContent"], exportAs: ["nzOption"] }, { kind: "component", type: i2.NzSelectComponent, selector: "nz-select", inputs: ["nzId", "nzSize", "nzStatus", "nzOptionHeightPx", "nzOptionOverflowSize", "nzDropdownClassName", "nzDropdownMatchSelectWidth", "nzDropdownStyle", "nzNotFoundContent", "nzPlaceHolder", "nzPlacement", "nzMaxTagCount", "nzDropdownRender", "nzCustomTemplate", "nzSuffixIcon", "nzClearIcon", "nzRemoveIcon", "nzMenuItemSelectedIcon", "nzTokenSeparators", "nzMaxTagPlaceholder", "nzMaxMultipleCount", "nzMode", "nzFilterOption", "compareWith", "nzAllowClear", "nzBorderless", "nzShowSearch", "nzLoading", "nzAutoFocus", "nzAutoClearSearchValue", "nzServerSearch", "nzDisabled", "nzOpen", "nzSelectOnTab", "nzBackdrop", "nzOptions", "nzShowArrow"], outputs: ["nzOnSearch", "nzScrollToBottom", "nzOpenChange", "nzBlur", "nzFocus"], exportAs: ["nzSelect"] }, { kind: "directive", type: NzInputDirective, selector: "input[nz-input],textarea[nz-input]", inputs: ["nzBorderless", "nzSize", "nzStepperless", "nzStatus", "disabled"], exportAs: ["nzInput"] }, { kind: "component", type: NzInputGroupComponent, selector: "nz-input-group", inputs: ["nzAddOnBeforeIcon", "nzAddOnAfterIcon", "nzPrefixIcon", "nzSuffixIcon", "nzAddOnBefore", "nzAddOnAfter", "nzPrefix", "nzStatus", "nzSuffix", "nzSize", "nzSearch", "nzCompact"], exportAs: ["nzInputGroup"] }, { kind: "component", type: NzInputNumberComponent, selector: "nz-input-number", inputs: ["nzId", "nzSize", "nzPlaceHolder", "nzStatus", "nzStep", "nzMin", "nzMax", "nzPrecision", "nzParser", "nzFormatter", "nzDisabled", "nzReadOnly", "nzAutoFocus", "nzBordered", "nzKeyboard", "nzControls"], outputs: ["nzBlur", "nzFocus", "nzOnStep"], exportAs: ["nzInputNumber"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorFormatComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-color-format',
                    exportAs: 'NzColorFormat',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [ReactiveFormsModule, NzSelectModule, NzInputDirective, NzInputGroupComponent, NzInputNumberComponent],
                    template: `
    <div [formGroup]="validateForm" class="ant-color-picker-input-container">
      <div class="ant-color-picker-format-select">
        <nz-select formControlName="isFormat" nzBorderless nzSize="small">
          <nz-option nzValue="hex" nzLabel="HEX" />
          <nz-option nzValue="hsb" nzLabel="HSB" />
          <nz-option nzValue="rgb" nzLabel="RGB" />
        </nz-select>
      </div>

      <div class="ant-color-picker-input">
        @switch (validateForm.controls.isFormat.value) {
          @case ('hex') {
            <div class="ant-color-picker-hex-input">
              <nz-input-group nzPrefix="#" nzSize="small">
                <input nz-input nzSize="small" formControlName="hex" />
              </nz-input-group>
            </div>
          }
          @case ('hsb') {
            <div class="ant-color-picker-hsb-input">
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbH"
                  [nzMin]="0"
                  [nzMax]="360"
                  [nzStep]="1"
                  [nzPrecision]="0"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbS"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-hsb-input">
                <nz-input-number
                  formControlName="hsbB"
                  [nzMin]="0"
                  [nzMax]="100"
                  [nzStep]="1"
                  [nzFormatter]="formatterPercent"
                  [nzParser]="parserPercent"
                  nzSize="small"
                />
              </div>
            </div>
          }
          @default {
            <div class="ant-color-picker-rgb-input">
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbR" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbG" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
              <div class="ant-color-picker-steppers ant-color-picker-rgb-input">
                <nz-input-number formControlName="rgbB" [nzMin]="0" [nzMax]="255" [nzStep]="1" nzSize="small" />
              </div>
            </div>
          }
        }
      </div>

      @if (!nzDisabledAlpha) {
        <div class="ant-color-picker-steppers ant-color-picker-alpha-input">
          <nz-input-number
            formControlName="roundA"
            [nzMin]="0"
            [nzMax]="100"
            [nzStep]="1"
            [nzFormatter]="formatterPercent"
            [nzParser]="parserPercent"
            nzSize="small"
          />
        </div>
      }
    </div>
  `
                }]
        }], ctorParameters: () => [{ type: i1.FormBuilder }], propDecorators: { format: [{
                type: Input
            }], colorValue: [{
                type: Input
            }], clearColor: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabledAlpha: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], formatChange: [{
                type: Output
            }], nzOnFormatChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzColorPickerComponent {
    cdr;
    nzFormat = null;
    nzValue = '';
    nzSize = 'default';
    nzDefaultValue = '';
    nzTrigger = 'click';
    nzTitle = '';
    nzFlipFlop = null;
    nzShowText = false;
    nzOpen = false;
    nzAllowClear = false;
    nzDisabled = false;
    nzDisabledAlpha = false;
    nzOnChange = new EventEmitter();
    nzOnFormatChange = new EventEmitter();
    nzOnClear = new EventEmitter();
    nzOnOpenChange = new EventEmitter();
    formBuilder = inject(FormBuilder);
    destroy$ = new Subject();
    isNzDisableFirstChange = true;
    blockColor = '';
    clearColor = false;
    showText = defaultColor.toHexString();
    constructor(cdr) {
        this.cdr = cdr;
    }
    formControl = this.formBuilder.control('');
    onChange = () => { };
    writeValue(value) {
        this.nzValue = value;
        this.getBlockColor();
        this.formControl.patchValue(value);
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched() { }
    setDisabledState(isDisabled) {
        this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || isDisabled;
        this.isNzDisableFirstChange = false;
        this.cdr.markForCheck();
    }
    ngOnInit() {
        this.getBlockColor();
        this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
            if (value) {
                let color = value;
                if (this.nzFormat === 'hex') {
                    color =
                        generateColor(value).getAlpha() < 1
                            ? generateColor(value).toHex8String()
                            : generateColor(value).toHexString();
                }
                else if (this.nzFormat === 'hsb') {
                    color = generateColor(value).toHsbString();
                }
                else if (this.nzFormat === 'rgb') {
                    color = generateColor(value).toRgbString();
                }
                this.showText = color;
                this.onChange(color);
                this.cdr.markForCheck();
            }
        });
    }
    ngOnChanges(changes) {
        const { nzValue, nzDefaultValue } = changes;
        if (nzValue || nzDefaultValue) {
            this.getBlockColor();
        }
    }
    clearColorHandle() {
        this.clearColor = true;
        this.nzOnClear.emit(true);
        this.cdr.markForCheck();
    }
    getBlockColor() {
        if (this.nzValue) {
            this.blockColor = generateColor(this.nzValue).toRgbString();
        }
        else if (this.nzDefaultValue) {
            this.blockColor = generateColor(this.nzDefaultValue).toRgbString();
        }
        else {
            this.blockColor = defaultColor.toHexString();
        }
    }
    colorChange(value) {
        this.blockColor = value.color.getAlpha() < 1 ? value.color.toHex8String() : value.color.toHexString();
        this.clearColor = false;
        this.cdr.markForCheck();
    }
    formatChange(value) {
        this.nzValue = value.color;
        this.clearColor = false;
        this.getBlockColor();
        this.nzOnChange.emit({ color: generateColor(value.color), format: value.format });
        this.formControl.patchValue(value.color);
        this.cdr.markForCheck();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzColorPickerComponent, isStandalone: true, selector: "nz-color-picker", inputs: { nzFormat: "nzFormat", nzValue: "nzValue", nzSize: "nzSize", nzDefaultValue: "nzDefaultValue", nzTrigger: "nzTrigger", nzTitle: "nzTitle", nzFlipFlop: "nzFlipFlop", nzShowText: ["nzShowText", "nzShowText", booleanAttribute], nzOpen: ["nzOpen", "nzOpen", booleanAttribute], nzAllowClear: ["nzAllowClear", "nzAllowClear", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzDisabledAlpha: ["nzDisabledAlpha", "nzDisabledAlpha", booleanAttribute] }, outputs: { nzOnChange: "nzOnChange", nzOnFormatChange: "nzOnFormatChange", nzOnClear: "nzOnClear", nzOnOpenChange: "nzOnOpenChange" }, host: { properties: { "class.ant-color-picker-disabled": "nzDisabled" }, classAttribute: "ant-color-picker-inline" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzColorPickerComponent),
                multi: true
            }
        ], exportAs: ["NzColorPicker"], usesOnChanges: true, ngImport: i0, template: `
    <div
      [class.ant-color-picker-trigger]="!nzFlipFlop"
      [class.ant-color-picker-sm]="nzSize === 'small'"
      [class.ant-color-picker-lg]="nzSize === 'large'"
      nz-popover
      [nzPopoverContent]="colorPicker"
      [nzPopoverTrigger]="!nzDisabled ? nzTrigger : null"
      [nzPopoverVisible]="nzOpen"
      (nzPopoverVisibleChange)="nzOnOpenChange.emit($event)"
    >
      @if (!nzFlipFlop) {
        <nz-color-block [nzColor]="blockColor" [nzSize]="nzSize" />
      } @else {
        <ng-template [ngTemplateOutlet]="nzFlipFlop" />
      }
      @if (nzShowText && !!showText && !nzFlipFlop) {
        <div class="ant-color-picker-trigger-text">
          {{ showText }}
        </div>
      }
    </div>
    <ng-template #colorPicker>
      <ng-antd-color-picker
        [value]="nzValue"
        [defaultValue]="nzDefaultValue"
        [disabled]="nzDisabled"
        [panelRenderHeader]="nzPanelRenderHeader"
        [panelRenderFooter]="nzPanelRenderFooter"
        [disabledAlpha]="nzDisabledAlpha"
        (nzOnChange)="colorChange($event)"
      />
    </ng-template>
    <ng-template #nzPanelRenderHeader>
      @if (nzTitle || nzAllowClear) {
        <div class="ant-color-picker-title">
          <div class="ant-color-picker-title-content">
            <ng-template [nzStringTemplateOutlet]="nzTitle">{{ nzTitle }}</ng-template>
          </div>
          @if (nzAllowClear) {
            <div class="ant-color-picker-clear" (click)="clearColorHandle()"></div>
          }
        </div>
      }
    </ng-template>
    <ng-template #nzPanelRenderFooter>
      <nz-color-format
        [colorValue]="blockColor"
        [clearColor]="clearColor"
        [format]="nzFormat"
        [nzDisabledAlpha]="nzDisabledAlpha"
        (formatChange)="formatChange($event)"
        (nzOnFormatChange)="nzOnFormatChange.emit($event)"
      />
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NgAntdColorPickerModule }, { kind: "component", type: NgAntdColorPickerComponent, selector: "ng-antd-color-picker", inputs: ["value", "defaultValue", "panelRenderHeader", "panelRenderFooter", "disabledAlpha", "disabled"], outputs: ["nzOnChange", "nzOnChangeComplete"] }, { kind: "directive", type: NzPopoverDirective, selector: "[nz-popover]", inputs: ["nzPopoverArrowPointAtCenter", "nzPopoverTitle", "nzPopoverContent", "nz-popover", "nzPopoverTrigger", "nzPopoverPlacement", "nzPopoverOrigin", "nzPopoverVisible", "nzPopoverMouseEnterDelay", "nzPopoverMouseLeaveDelay", "nzPopoverOverlayClassName", "nzPopoverOverlayStyle", "nzPopoverOverlayClickable", "nzPopoverBackdrop"], outputs: ["nzPopoverVisibleChange"], exportAs: ["nzPopover"] }, { kind: "component", type: NzColorBlockComponent, selector: "nz-color-block", inputs: ["nzColor", "nzSize"], outputs: ["nzOnClick"], exportAs: ["NzColorBlock"] }, { kind: "component", type: NzColorFormatComponent, selector: "nz-color-format", inputs: ["format", "colorValue", "clearColor", "nzDisabledAlpha"], outputs: ["formatChange", "nzOnFormatChange"], exportAs: ["NzColorFormat"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-color-picker',
                    exportAs: 'NzColorPicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [
                        NgAntdColorPickerModule,
                        NzPopoverDirective,
                        NzColorBlockComponent,
                        NzColorFormatComponent,
                        NgTemplateOutlet,
                        NzStringTemplateOutletDirective
                    ],
                    template: `
    <div
      [class.ant-color-picker-trigger]="!nzFlipFlop"
      [class.ant-color-picker-sm]="nzSize === 'small'"
      [class.ant-color-picker-lg]="nzSize === 'large'"
      nz-popover
      [nzPopoverContent]="colorPicker"
      [nzPopoverTrigger]="!nzDisabled ? nzTrigger : null"
      [nzPopoverVisible]="nzOpen"
      (nzPopoverVisibleChange)="nzOnOpenChange.emit($event)"
    >
      @if (!nzFlipFlop) {
        <nz-color-block [nzColor]="blockColor" [nzSize]="nzSize" />
      } @else {
        <ng-template [ngTemplateOutlet]="nzFlipFlop" />
      }
      @if (nzShowText && !!showText && !nzFlipFlop) {
        <div class="ant-color-picker-trigger-text">
          {{ showText }}
        </div>
      }
    </div>
    <ng-template #colorPicker>
      <ng-antd-color-picker
        [value]="nzValue"
        [defaultValue]="nzDefaultValue"
        [disabled]="nzDisabled"
        [panelRenderHeader]="nzPanelRenderHeader"
        [panelRenderFooter]="nzPanelRenderFooter"
        [disabledAlpha]="nzDisabledAlpha"
        (nzOnChange)="colorChange($event)"
      />
    </ng-template>
    <ng-template #nzPanelRenderHeader>
      @if (nzTitle || nzAllowClear) {
        <div class="ant-color-picker-title">
          <div class="ant-color-picker-title-content">
            <ng-template [nzStringTemplateOutlet]="nzTitle">{{ nzTitle }}</ng-template>
          </div>
          @if (nzAllowClear) {
            <div class="ant-color-picker-clear" (click)="clearColorHandle()"></div>
          }
        </div>
      }
    </ng-template>
    <ng-template #nzPanelRenderFooter>
      <nz-color-format
        [colorValue]="blockColor"
        [clearColor]="clearColor"
        [format]="nzFormat"
        [nzDisabledAlpha]="nzDisabledAlpha"
        (formatChange)="formatChange($event)"
        (nzOnFormatChange)="nzOnFormatChange.emit($event)"
      />
    </ng-template>
  `,
                    host: {
                        class: 'ant-color-picker-inline',
                        '[class.ant-color-picker-disabled]': `nzDisabled`
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzColorPickerComponent),
                            multi: true
                        }
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { nzFormat: [{
                type: Input
            }], nzValue: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzDefaultValue: [{
                type: Input
            }], nzTrigger: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzFlipFlop: [{
                type: Input
            }], nzShowText: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOpen: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAllowClear: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabledAlpha: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOnChange: [{
                type: Output
            }], nzOnFormatChange: [{
                type: Output
            }], nzOnClear: [{
                type: Output
            }], nzOnOpenChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzColorPickerModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerModule, imports: [NzColorPickerComponent, NzColorBlockComponent, NzColorFormatComponent], exports: [NzColorPickerComponent, NzColorBlockComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerModule, imports: [NzColorPickerComponent, NzColorFormatComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzColorPickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzColorPickerComponent, NzColorBlockComponent, NzColorFormatComponent],
                    exports: [NzColorPickerComponent, NzColorBlockComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzColorBlockComponent, NzColorPickerComponent, NzColorPickerModule };
//# sourceMappingURL=ng-zorro-antd-color-picker.mjs.map
