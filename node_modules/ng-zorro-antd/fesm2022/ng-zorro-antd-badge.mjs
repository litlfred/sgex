import { __esDecorate, __runInitializers } from 'tslib';
import * as i0 from '@angular/core';
import { numberAttribute, Input, ChangeDetectionStrategy, ViewEncapsulation, Component, inject, booleanAttribute, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { zoomBadgeMotion } from 'ng-zorro-antd/core/animation';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBadgeSupComponent {
    nzOffset;
    nzTitle;
    nzStyle = null;
    nzDot = false;
    nzOverflowCount = 99;
    disableAnimation = false;
    nzCount;
    noAnimation = false;
    nzSize = 'default';
    maxNumberArray = [];
    countArray = [];
    count = 0;
    countSingleArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    generateMaxNumberArray() {
        this.maxNumberArray = this.nzOverflowCount
            .toString()
            .split('')
            .map((value, index) => `${value}-${index}`);
    }
    ngOnInit() {
        this.generateMaxNumberArray();
    }
    ngOnChanges(changes) {
        const { nzOverflowCount, nzCount } = changes;
        if (nzCount && typeof nzCount.currentValue === 'number') {
            this.count = Math.max(0, nzCount.currentValue);
            this.countArray = this.count
                .toString()
                .split('')
                .map(item => +item);
        }
        if (nzOverflowCount) {
            this.generateMaxNumberArray();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeSupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzBadgeSupComponent, isStandalone: true, selector: "nz-badge-sup", inputs: { nzOffset: "nzOffset", nzTitle: "nzTitle", nzStyle: "nzStyle", nzDot: "nzDot", nzOverflowCount: ["nzOverflowCount", "nzOverflowCount", numberAttribute], disableAnimation: "disableAnimation", nzCount: "nzCount", noAnimation: "noAnimation", nzSize: "nzSize" }, host: { properties: { "@.disabled": "disableAnimation", "@zoomBadgeMotion": "", "attr.title": "nzTitle === null ? '' : nzTitle || nzCount", "style": "nzStyle", "style.right.px": "nzOffset && nzOffset[0] ? -nzOffset[0] : null", "style.margin-top.px": "nzOffset && nzOffset[1] ? nzOffset[1] : null", "class.ant-badge-count": "!nzDot", "class.ant-badge-count-sm": "nzSize === 'small'", "class.ant-badge-dot": "nzDot", "class.ant-badge-multiple-words": "countArray.length >= 2" }, classAttribute: "ant-scroll-number" }, exportAs: ["nzBadgeSup"], usesOnChanges: true, ngImport: i0, template: `
    @if (count <= nzOverflowCount) {
      @for (n of maxNumberArray; track n; let i = $index) {
        <span
          [nzNoAnimation]="noAnimation"
          class="ant-scroll-number-only"
          [style.transform]="'translateY(' + -countArray[i] * 100 + '%)'"
        >
          @if (!nzDot && countArray[i] !== undefined) {
            @for (p of countSingleArray; track p) {
              <p class="ant-scroll-number-only-unit" [class.current]="p === countArray[i]">
                {{ p }}
              </p>
            }
          }
        </span>
      }
    } @else {
      {{ nzOverflowCount }}+
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }], animations: [zoomBadgeMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeSupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-badge-sup',
                    exportAs: 'nzBadgeSup',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    animations: [zoomBadgeMotion],
                    imports: [NzNoAnimationDirective],
                    template: `
    @if (count <= nzOverflowCount) {
      @for (n of maxNumberArray; track n; let i = $index) {
        <span
          [nzNoAnimation]="noAnimation"
          class="ant-scroll-number-only"
          [style.transform]="'translateY(' + -countArray[i] * 100 + '%)'"
        >
          @if (!nzDot && countArray[i] !== undefined) {
            @for (p of countSingleArray; track p) {
              <p class="ant-scroll-number-only-unit" [class.current]="p === countArray[i]">
                {{ p }}
              </p>
            }
          }
        </span>
      }
    } @else {
      {{ nzOverflowCount }}+
    }
  `,
                    host: {
                        class: 'ant-scroll-number',
                        '[@.disabled]': `disableAnimation`,
                        '[@zoomBadgeMotion]': '',
                        '[attr.title]': `nzTitle === null ? '' : nzTitle || nzCount`,
                        '[style]': `nzStyle`,
                        '[style.right.px]': `nzOffset && nzOffset[0] ? -nzOffset[0] : null`,
                        '[style.margin-top.px]': `nzOffset && nzOffset[1] ? nzOffset[1] : null`,
                        '[class.ant-badge-count]': `!nzDot`,
                        '[class.ant-badge-count-sm]': `nzSize === 'small'`,
                        '[class.ant-badge-dot]': `nzDot`,
                        '[class.ant-badge-multiple-words]': `countArray.length >= 2`
                    }
                }]
        }], propDecorators: { nzOffset: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzStyle: [{
                type: Input
            }], nzDot: [{
                type: Input
            }], nzOverflowCount: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], disableAnimation: [{
                type: Input
            }], nzCount: [{
                type: Input
            }], noAnimation: [{
                type: Input
            }], nzSize: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const badgePresetColors = [
    'pink',
    'red',
    'yellow',
    'orange',
    'cyan',
    'green',
    'blue',
    'purple',
    'geekblue',
    'magenta',
    'volcano',
    'gold',
    'lime'
];

const NZ_CONFIG_MODULE_NAME = 'badge';
let NzBadgeComponent = (() => {
    let _nzOverflowCount_decorators;
    let _nzOverflowCount_initializers = [];
    let _nzOverflowCount_extraInitializers = [];
    let _nzColor_decorators;
    let _nzColor_initializers = [];
    let _nzColor_extraInitializers = [];
    return class NzBadgeComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzOverflowCount_decorators = [WithConfig()];
            _nzColor_decorators = [WithConfig()];
            __esDecorate(null, null, _nzOverflowCount_decorators, { kind: "field", name: "nzOverflowCount", static: false, private: false, access: { has: obj => "nzOverflowCount" in obj, get: obj => obj.nzOverflowCount, set: (obj, value) => { obj.nzOverflowCount = value; } }, metadata: _metadata }, _nzOverflowCount_initializers, _nzOverflowCount_extraInitializers);
            __esDecorate(null, null, _nzColor_decorators, { kind: "field", name: "nzColor", static: false, private: false, access: { has: obj => "nzColor" in obj, get: obj => obj.nzColor, set: (obj, value) => { obj.nzColor = value; } }, metadata: _metadata }, _nzColor_initializers, _nzColor_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        renderer;
        cdr;
        elementRef;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        showSup = false;
        presetColor = null;
        dir = 'ltr';
        destroy$ = new Subject();
        nzShowZero = false;
        nzShowDot = true;
        nzStandalone = false;
        nzDot = false;
        nzOverflowCount = __runInitializers(this, _nzOverflowCount_initializers, 99);
        nzColor = (__runInitializers(this, _nzOverflowCount_extraInitializers), __runInitializers(this, _nzColor_initializers, undefined));
        nzStyle = (__runInitializers(this, _nzColor_extraInitializers), null);
        nzText = null;
        nzTitle;
        nzStatus;
        nzCount;
        nzOffset;
        nzSize = 'default';
        noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
        constructor(nzConfigService, renderer, cdr, elementRef, directionality) {
            this.nzConfigService = nzConfigService;
            this.renderer = renderer;
            this.cdr = cdr;
            this.elementRef = elementRef;
            this.directionality = directionality;
        }
        ngOnInit() {
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.prepareBadgeForRtl();
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
            this.prepareBadgeForRtl();
        }
        ngOnChanges(changes) {
            const { nzColor, nzShowDot, nzDot, nzCount, nzShowZero } = changes;
            if (nzColor) {
                this.presetColor = this.nzColor && badgePresetColors.indexOf(this.nzColor) !== -1 ? this.nzColor : null;
            }
            if (nzShowDot || nzDot || nzCount || nzShowZero) {
                this.showSup =
                    (this.nzShowDot && this.nzDot) ||
                        (typeof this.nzCount === 'number' && this.nzCount > 0) ||
                        (typeof this.nzCount === 'number' && this.nzCount <= 0 && this.nzShowZero);
            }
        }
        prepareBadgeForRtl() {
            if (this.isRtlLayout) {
                this.renderer.addClass(this.elementRef.nativeElement, 'ant-badge-rtl');
            }
            else {
                this.renderer.removeClass(this.elementRef.nativeElement, 'ant-badge-rtl');
            }
        }
        get isRtlLayout() {
            return this.dir === 'rtl';
        }
        ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeComponent, deps: [{ token: i1.NzConfigService }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzBadgeComponent, isStandalone: true, selector: "nz-badge", inputs: { nzShowZero: ["nzShowZero", "nzShowZero", booleanAttribute], nzShowDot: ["nzShowDot", "nzShowDot", booleanAttribute], nzStandalone: ["nzStandalone", "nzStandalone", booleanAttribute], nzDot: ["nzDot", "nzDot", booleanAttribute], nzOverflowCount: "nzOverflowCount", nzColor: "nzColor", nzStyle: "nzStyle", nzText: "nzText", nzTitle: "nzTitle", nzStatus: "nzStatus", nzCount: "nzCount", nzOffset: "nzOffset", nzSize: "nzSize" }, host: { properties: { "class.ant-badge-status": "nzStatus", "class.ant-badge-not-a-wrapper": "!!(nzStandalone || nzStatus || nzColor)" }, classAttribute: "ant-badge" }, exportAs: ["nzBadge"], usesOnChanges: true, ngImport: i0, template: `
    @if (nzStatus || nzColor) {
      <span
        class="ant-badge-status-dot ant-badge-status-{{ nzStatus || presetColor }}"
        [style.background]="!presetColor && nzColor"
        [style]="nzStyle"
      ></span>
      <span class="ant-badge-status-text">
        <ng-container *nzStringTemplateOutlet="nzText">{{ nzText }}</ng-container>
      </span>
    }
    <ng-content />
    <ng-container *nzStringTemplateOutlet="nzCount">
      @if (showSup) {
        <nz-badge-sup
          [nzOffset]="nzOffset"
          [nzSize]="nzSize"
          [nzTitle]="nzTitle"
          [nzStyle]="nzStyle"
          [nzDot]="nzDot"
          [nzOverflowCount]="nzOverflowCount"
          [disableAnimation]="!!(nzStandalone || nzStatus || nzColor || noAnimation?.nzNoAnimation)"
          [nzCount]="nzCount"
          [noAnimation]="!!noAnimation?.nzNoAnimation"
        />
      }
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "component", type: NzBadgeSupComponent, selector: "nz-badge-sup", inputs: ["nzOffset", "nzTitle", "nzStyle", "nzDot", "nzOverflowCount", "disableAnimation", "nzCount", "noAnimation", "nzSize"], exportAs: ["nzBadgeSup"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [zoomBadgeMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-badge',
                    exportAs: 'nzBadge',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    animations: [zoomBadgeMotion],
                    imports: [NzBadgeSupComponent, NzOutletModule],
                    template: `
    @if (nzStatus || nzColor) {
      <span
        class="ant-badge-status-dot ant-badge-status-{{ nzStatus || presetColor }}"
        [style.background]="!presetColor && nzColor"
        [style]="nzStyle"
      ></span>
      <span class="ant-badge-status-text">
        <ng-container *nzStringTemplateOutlet="nzText">{{ nzText }}</ng-container>
      </span>
    }
    <ng-content />
    <ng-container *nzStringTemplateOutlet="nzCount">
      @if (showSup) {
        <nz-badge-sup
          [nzOffset]="nzOffset"
          [nzSize]="nzSize"
          [nzTitle]="nzTitle"
          [nzStyle]="nzStyle"
          [nzDot]="nzDot"
          [nzOverflowCount]="nzOverflowCount"
          [disableAnimation]="!!(nzStandalone || nzStatus || nzColor || noAnimation?.nzNoAnimation)"
          [nzCount]="nzCount"
          [noAnimation]="!!noAnimation?.nzNoAnimation"
        />
      }
    </ng-container>
  `,
                    host: {
                        class: 'ant-badge',
                        '[class.ant-badge-status]': 'nzStatus',
                        '[class.ant-badge-not-a-wrapper]': '!!(nzStandalone || nzStatus || nzColor)'
                    }
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i2.Directionality }], propDecorators: { nzShowZero: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowDot: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzStandalone: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDot: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOverflowCount: [{
                type: Input
            }], nzColor: [{
                type: Input
            }], nzStyle: [{
                type: Input
            }], nzText: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzStatus: [{
                type: Input
            }], nzCount: [{
                type: Input
            }], nzOffset: [{
                type: Input
            }], nzSize: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzRibbonComponent {
    nzColor;
    nzPlacement = 'end';
    nzText = null;
    presetColor = null;
    ngOnChanges(changes) {
        const { nzColor } = changes;
        if (nzColor) {
            this.presetColor = this.nzColor && badgePresetColors.indexOf(this.nzColor) !== -1 ? this.nzColor : null;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRibbonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzRibbonComponent, isStandalone: true, selector: "nz-ribbon", inputs: { nzColor: "nzColor", nzPlacement: "nzPlacement", nzText: "nzText" }, host: { classAttribute: "ant-ribbon-wrapper" }, exportAs: ["nzRibbon"], usesOnChanges: true, ngImport: i0, template: `
    <ng-content></ng-content>
    <div
      class="ant-ribbon"
      [class]="presetColor && 'ant-ribbon-color-' + presetColor"
      [class.ant-ribbon-placement-end]="nzPlacement === 'end'"
      [class.ant-ribbon-placement-start]="nzPlacement === 'start'"
      [style.background-color]="!presetColor && nzColor"
    >
      <ng-container *nzStringTemplateOutlet="nzText">
        <span class="ant-ribbon-text">{{ nzText }}</span>
      </ng-container>
      <div class="ant-ribbon-corner" [style.color]="!presetColor && nzColor"></div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRibbonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-ribbon',
                    exportAs: 'nzRibbon',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NzOutletModule],
                    template: `
    <ng-content></ng-content>
    <div
      class="ant-ribbon"
      [class]="presetColor && 'ant-ribbon-color-' + presetColor"
      [class.ant-ribbon-placement-end]="nzPlacement === 'end'"
      [class.ant-ribbon-placement-start]="nzPlacement === 'start'"
      [style.background-color]="!presetColor && nzColor"
    >
      <ng-container *nzStringTemplateOutlet="nzText">
        <span class="ant-ribbon-text">{{ nzText }}</span>
      </ng-container>
      <div class="ant-ribbon-corner" [style.color]="!presetColor && nzColor"></div>
    </div>
  `,
                    host: { class: 'ant-ribbon-wrapper' }
                }]
        }], propDecorators: { nzColor: [{
                type: Input
            }], nzPlacement: [{
                type: Input
            }], nzText: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBadgeModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeModule, imports: [NzBadgeComponent, NzRibbonComponent], exports: [NzBadgeComponent, NzRibbonComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeModule, imports: [NzBadgeComponent, NzRibbonComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBadgeModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [NzBadgeComponent, NzRibbonComponent],
                    imports: [NzBadgeComponent, NzRibbonComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzBadgeComponent, NzBadgeModule, NzRibbonComponent };
//# sourceMappingURL=ng-zorro-antd-badge.mjs.map
