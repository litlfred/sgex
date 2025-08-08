import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { InjectionToken, input, booleanAttribute, inject, ElementRef, signal, ChangeDetectionStrategy, Component, computed, afterNextRender, Directive, TemplateRef, ContentChildren, Input, NgModule } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { __esDecorate, __runInitializers } from 'tslib';
import { NgTemplateOutlet } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzStringTemplateOutletDirective } from 'ng-zorro-antd/core/outlet';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_SPACE_COMPACT_SIZE = new InjectionToken('NZ_SPACE_COMPACT_SIZE');
const NZ_SPACE_COMPACT_ITEMS = new InjectionToken('NZ_SPACE_COMPACT_ITEMS');
const NZ_SPACE_COMPACT_ITEM_TYPE = new InjectionToken('NZ_SPACE_COMPACT_ITEM_TYPE');

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSpaceCompactComponent {
    nzBlock = input(false, { transform: booleanAttribute });
    nzDirection = input('horizontal');
    nzSize = input('default');
    elementRef = inject(ElementRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceCompactComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "19.2.2", type: NzSpaceCompactComponent, isStandalone: true, selector: "nz-space-compact", inputs: { nzBlock: { classPropertyName: "nzBlock", publicName: "nzBlock", isSignal: true, isRequired: false, transformFunction: null }, nzDirection: { classPropertyName: "nzDirection", publicName: "nzDirection", isSignal: true, isRequired: false, transformFunction: null }, nzSize: { classPropertyName: "nzSize", publicName: "nzSize", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.ant-space-compact-block": "nzBlock()", "class.ant-space-compact-vertical": "nzDirection() === 'vertical'" }, classAttribute: "ant-space-compact" }, providers: [
            { provide: NZ_SPACE_COMPACT_SIZE, useFactory: () => inject(NzSpaceCompactComponent).nzSize },
            { provide: NZ_SPACE_COMPACT_ITEMS, useFactory: () => signal([]) }
        ], exportAs: ["nzSpaceCompact"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceCompactComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-space-compact',
                    exportAs: 'nzSpaceCompact',
                    template: `<ng-content></ng-content>`,
                    host: {
                        class: 'ant-space-compact',
                        '[class.ant-space-compact-block]': `nzBlock()`,
                        '[class.ant-space-compact-vertical]': `nzDirection() === 'vertical'`
                    },
                    providers: [
                        { provide: NZ_SPACE_COMPACT_SIZE, useFactory: () => inject(NzSpaceCompactComponent).nzSize },
                        { provide: NZ_SPACE_COMPACT_ITEMS, useFactory: () => signal([]) }
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSpaceCompactItemDirective {
    /**
     * Ancestor component injected from the parent.
     * Note that it is not necessarily the direct parent component.
     */
    spaceCompactCmp = inject(NzSpaceCompactComponent, { host: true, optional: true });
    items = inject(NZ_SPACE_COMPACT_ITEMS, { host: true, optional: true });
    type = inject(NZ_SPACE_COMPACT_ITEM_TYPE);
    elementRef = inject(ElementRef);
    directionality = inject(Directionality);
    dir = toSignal(this.directionality.change, { initialValue: this.directionality.value });
    get parentElement() {
        return this.elementRef.nativeElement?.parentElement;
    }
    class = computed(() => {
        // Only handle when the parent is space compact component
        if (!this.spaceCompactCmp || !this.items)
            return null;
        // Ensure that the injected ancestor component's elements are parent elements
        if (this.parentElement !== this.spaceCompactCmp.elementRef.nativeElement)
            return null;
        const items = this.items();
        const direction = this.spaceCompactCmp.nzDirection();
        const classes = [compactItemClassOf(this.type, direction, this.dir() === 'rtl')];
        const index = items.indexOf(this);
        const firstIndex = items.findIndex(element => element);
        // Array [empty, item]
        // In this case, the index of the first valid element is not 0,
        // so we need to use findIndex to find the index value of the first valid element.
        if (index === firstIndex) {
            classes.push(compactFirstItemClassOf(this.type, direction));
        }
        else if (index === items.length - 1) {
            classes.push(compactLastItemClassOf(this.type, direction));
        }
        return classes;
    });
    constructor() {
        if (!this.spaceCompactCmp || !this.items)
            return;
        afterNextRender(() => {
            // Ensure that the injected ancestor component's elements are parent elements
            if (this.parentElement === this.spaceCompactCmp.elementRef.nativeElement) {
                const index = Array.from(this.parentElement.children).indexOf(this.elementRef.nativeElement);
                this.items.update(value => {
                    const newValue = value.slice();
                    newValue.splice(index, 0, this);
                    return newValue;
                });
            }
        });
    }
    ngOnDestroy() {
        this.items?.update(value => value.filter(o => o !== this));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceCompactItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzSpaceCompactItemDirective, isStandalone: true, host: { properties: { "class": "class()" } }, exportAs: ["nzSpaceCompactItem"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceCompactItemDirective, decorators: [{
            type: Directive,
            args: [{
                    exportAs: 'nzSpaceCompactItem',
                    host: {
                        '[class]': 'class()'
                    }
                }]
        }], ctorParameters: () => [] });
function generateCompactClass(type, direction, position) {
    const directionPrefix = direction === 'vertical' ? 'vertical-' : '';
    return `ant-${type}-compact-${directionPrefix}${position}`;
}
function compactItemClassOf(type, direction, rtl) {
    const rtlSuffix = rtl ? '-rtl' : '';
    return `${generateCompactClass(type, direction, 'item')}${rtlSuffix}`;
}
function compactFirstItemClassOf(type, direction) {
    return generateCompactClass(type, direction, 'first-item');
}
function compactLastItemClassOf(type, direction) {
    return generateCompactClass(type, direction, 'last-item');
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSpaceItemDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzSpaceItemDirective, isStandalone: true, selector: "[nzSpaceItem]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceItemDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzSpaceItem]'
                }]
        }] });

const NZ_CONFIG_MODULE_NAME = 'space';
const SPACE_SIZE = {
    small: 8,
    middle: 16,
    large: 24
};
let NzSpaceComponent = (() => {
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    return class NzSpaceComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzSize_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzDirection = 'horizontal';
        nzAlign;
        nzSplit = null;
        nzWrap = false;
        nzSize = __runInitializers(this, _nzSize_initializers, 'small');
        items = __runInitializers(this, _nzSize_extraInitializers);
        mergedAlign;
        spaceSize = SPACE_SIZE.small;
        destroy$ = new Subject();
        constructor(nzConfigService, cdr) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
        }
        updateSpaceItems() {
            const numberSize = typeof this.nzSize === 'string' ? SPACE_SIZE[this.nzSize] : this.nzSize;
            this.spaceSize = numberSize / (this.nzSplit ? 2 : 1);
            this.cdr.markForCheck();
        }
        ngOnChanges() {
            this.updateSpaceItems();
            this.mergedAlign = this.nzAlign === undefined && this.nzDirection === 'horizontal' ? 'center' : this.nzAlign;
        }
        ngOnDestroy() {
            this.destroy$.next(true);
            this.destroy$.complete();
        }
        ngAfterContentInit() {
            this.updateSpaceItems();
            this.items.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.cdr.markForCheck();
            });
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSpaceComponent, isStandalone: true, selector: "nz-space, [nz-space]", inputs: { nzDirection: "nzDirection", nzAlign: "nzAlign", nzSplit: "nzSplit", nzWrap: ["nzWrap", "nzWrap", booleanAttribute], nzSize: "nzSize" }, host: { properties: { "class.ant-space-horizontal": "nzDirection === \"horizontal\"", "class.ant-space-vertical": "nzDirection === \"vertical\"", "class.ant-space-align-start": "mergedAlign === \"start\"", "class.ant-space-align-end": "mergedAlign === \"end\"", "class.ant-space-align-center": "mergedAlign === \"center\"", "class.ant-space-align-baseline": "mergedAlign === \"baseline\"", "style.flex-wrap": "nzWrap ? \"wrap\" : null" }, classAttribute: "ant-space" }, queries: [{ propertyName: "items", predicate: NzSpaceItemDirective, read: TemplateRef }], exportAs: ["nzSpace"], usesOnChanges: true, ngImport: i0, template: `
    <ng-content></ng-content>
    @for (item of items; track item; let last = $last; let index = $index) {
      <div
        class="ant-space-item"
        [style.margin-block-end.px]="nzDirection === 'vertical' ? (last ? null : spaceSize) : null"
        [style.margin-inline-end.px]="nzDirection === 'horizontal' ? (last ? null : spaceSize) : null"
      >
        <ng-container [ngTemplateOutlet]="item"></ng-container>
      </div>
      @if (nzSplit && !last) {
        <span
          class="ant-space-split"
          [style.margin-block-end.px]="nzDirection === 'vertical' ? (last ? null : spaceSize) : null"
          [style.margin-inline-end.px]="nzDirection === 'horizontal' ? (last ? null : spaceSize) : null"
        >
          <ng-template [nzStringTemplateOutlet]="nzSplit" [nzStringTemplateOutletContext]="{ $implicit: index }">{{
            nzSplit
          }}</ng-template>
        </span>
      }
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-space, [nz-space]',
                    exportAs: 'nzSpace',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <ng-content></ng-content>
    @for (item of items; track item; let last = $last; let index = $index) {
      <div
        class="ant-space-item"
        [style.margin-block-end.px]="nzDirection === 'vertical' ? (last ? null : spaceSize) : null"
        [style.margin-inline-end.px]="nzDirection === 'horizontal' ? (last ? null : spaceSize) : null"
      >
        <ng-container [ngTemplateOutlet]="item"></ng-container>
      </div>
      @if (nzSplit && !last) {
        <span
          class="ant-space-split"
          [style.margin-block-end.px]="nzDirection === 'vertical' ? (last ? null : spaceSize) : null"
          [style.margin-inline-end.px]="nzDirection === 'horizontal' ? (last ? null : spaceSize) : null"
        >
          <ng-template [nzStringTemplateOutlet]="nzSplit" [nzStringTemplateOutletContext]="{ $implicit: index }">{{
            nzSplit
          }}</ng-template>
        </span>
      }
    }
  `,
                    host: {
                        class: 'ant-space',
                        '[class.ant-space-horizontal]': 'nzDirection === "horizontal"',
                        '[class.ant-space-vertical]': 'nzDirection === "vertical"',
                        '[class.ant-space-align-start]': 'mergedAlign === "start"',
                        '[class.ant-space-align-end]': 'mergedAlign === "end"',
                        '[class.ant-space-align-center]': 'mergedAlign === "center"',
                        '[class.ant-space-align-baseline]': 'mergedAlign === "baseline"',
                        '[style.flex-wrap]': 'nzWrap ? "wrap" : null'
                    },
                    imports: [NgTemplateOutlet, NzStringTemplateOutletDirective]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }], propDecorators: { nzDirection: [{
                type: Input
            }], nzAlign: [{
                type: Input
            }], nzSplit: [{
                type: Input
            }], nzWrap: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSize: [{
                type: Input
            }], items: [{
                type: ContentChildren,
                args: [NzSpaceItemDirective, { read: TemplateRef }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSpaceModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceModule, imports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent], exports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSpaceModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent],
                    exports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NZ_SPACE_COMPACT_ITEMS, NZ_SPACE_COMPACT_ITEM_TYPE, NZ_SPACE_COMPACT_SIZE, NzSpaceCompactComponent, NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective, NzSpaceModule };
//# sourceMappingURL=ng-zorro-antd-space.mjs.map
