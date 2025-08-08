import { NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { Injectable, inject, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, EventEmitter, viewChildren, contentChildren, effect, forwardRef, booleanAttribute, Output, NgModule } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, switchMap, filter, take, map, bufferCount } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ReplaySubject, Subject } from 'rxjs';
import { __esDecorate, __runInitializers } from 'tslib';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { thumbMotion } from 'ng-zorro-antd/core/animation';
import * as i1$1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from '@angular/cdk/bidi';

class NzSegmentedService {
    selected$ = new ReplaySubject(1);
    activated$ = new ReplaySubject(1);
    change$ = new Subject();
    disabled$ = new ReplaySubject(1);
    animationDone$ = new Subject();
    ngOnDestroy() {
        this.selected$.complete();
        this.activated$.complete();
        this.change$.complete();
        this.disabled$.complete();
        this.animationDone$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSegmentedItemComponent {
    cdr;
    elementRef;
    destroyRef;
    nzIcon;
    nzValue;
    nzDisabled;
    isChecked = false;
    service = inject(NzSegmentedService);
    parentDisabled = toSignal(this.service.disabled$, { initialValue: false });
    constructor(cdr, elementRef, destroyRef) {
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.destroyRef = destroyRef;
    }
    ngOnInit() {
        this.service.selected$
            .pipe(tap(value => {
            this.isChecked = false;
            this.cdr.markForCheck();
            if (value === this.nzValue) {
                this.service.activated$.next(this.elementRef.nativeElement);
            }
        }), switchMap(value => this.service.animationDone$.pipe(filter(event => event.toState === 'to'), take(1), map(() => value))), filter(value => value === this.nzValue), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
            this.isChecked = true;
            this.cdr.markForCheck();
        });
    }
    handleClick() {
        if (!this.nzDisabled && !this.parentDisabled()) {
            this.service.selected$.next(this.nzValue);
            this.service.change$.next(this.nzValue);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.DestroyRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSegmentedItemComponent, isStandalone: true, selector: "label[nz-segmented-item],label[nzSegmentedItem]", inputs: { nzIcon: "nzIcon", nzValue: "nzValue", nzDisabled: "nzDisabled" }, host: { listeners: { "click": "handleClick()" }, properties: { "class.ant-segmented-item-selected": "isChecked", "class.ant-segmented-item-disabled": "nzDisabled || parentDisabled()" }, classAttribute: "ant-segmented-item" }, exportAs: ["nzSegmentedItem"], ngImport: i0, template: `
    <input class="ant-segmented-item-input" type="radio" [checked]="isChecked" (click)="$event.stopPropagation()" />
    <div class="ant-segmented-item-label">
      @if (nzIcon) {
        <span class="ant-segmented-item-icon"><nz-icon [nzType]="nzIcon" /></span>
        <span>
          <ng-template [ngTemplateOutlet]="content" />
        </span>
      } @else {
        <ng-template [ngTemplateOutlet]="content" />
      }
    </div>

    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedItemComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'label[nz-segmented-item],label[nzSegmentedItem]',
                    exportAs: 'nzSegmentedItem',
                    imports: [NzIconModule, NgTemplateOutlet],
                    template: `
    <input class="ant-segmented-item-input" type="radio" [checked]="isChecked" (click)="$event.stopPropagation()" />
    <div class="ant-segmented-item-label">
      @if (nzIcon) {
        <span class="ant-segmented-item-icon"><nz-icon [nzType]="nzIcon" /></span>
        <span>
          <ng-template [ngTemplateOutlet]="content" />
        </span>
      } @else {
        <ng-template [ngTemplateOutlet]="content" />
      }
    </div>

    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
                    host: {
                        class: 'ant-segmented-item',
                        '[class.ant-segmented-item-selected]': 'isChecked',
                        '[class.ant-segmented-item-disabled]': 'nzDisabled || parentDisabled()',
                        '(click)': 'handleClick()'
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.DestroyRef }], propDecorators: { nzIcon: [{
                type: Input
            }], nzValue: [{
                type: Input
            }], nzDisabled: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function normalizeOptions(unnormalized) {
    return unnormalized.map(item => {
        if (typeof item === 'string' || typeof item === 'number') {
            return {
                label: `${item}`,
                value: item
            };
        }
        return item;
    });
}

const NZ_CONFIG_MODULE_NAME = 'segmented';
let NzSegmentedComponent = (() => {
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    return class NzSegmentedComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzSize_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzBlock = false;
        nzDisabled = false;
        nzOptions = [];
        nzSize = __runInitializers(this, _nzSize_initializers, 'default');
        nzValueChange = (__runInitializers(this, _nzSize_extraInitializers), new EventEmitter());
        viewItemCmps = viewChildren(NzSegmentedItemComponent);
        contentItemCmps = contentChildren(NzSegmentedItemComponent);
        dir = 'ltr';
        value;
        animationState = {
            value: 'to',
            params: thumbAnimationParamsOf()
        };
        normalizedOptions = [];
        onChange = () => { };
        onTouched = () => { };
        service = inject(NzSegmentedService);
        constructor(nzConfigService, cdr, directionality) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.directionality = directionality;
            this.directionality.change.pipe(takeUntilDestroyed()).subscribe(direction => {
                this.dir = direction;
                this.cdr.markForCheck();
            });
            this.service.selected$.pipe(takeUntilDestroyed()).subscribe(value => {
                this.value = value;
            });
            this.service.change$.pipe(takeUntilDestroyed()).subscribe(value => {
                this.nzValueChange.emit(value);
                this.onChange(value);
            });
            this.service.activated$.pipe(bufferCount(2, 1), takeUntilDestroyed()).subscribe(elements => {
                this.animationState = {
                    value: 'from',
                    params: thumbAnimationParamsOf(elements[0])
                };
                this.cdr.detectChanges();
                this.animationState = {
                    value: 'to',
                    params: thumbAnimationParamsOf(elements[1])
                };
                this.cdr.detectChanges();
            });
            effect(() => {
                const itemCmps = this.viewItemCmps().concat(this.contentItemCmps());
                if (!itemCmps.length) {
                    return;
                }
                if (this.value === undefined || // If no value is set, select the first item
                    !itemCmps.some(item => item.nzValue === this.value) // handle value not in options
                ) {
                    this.service.selected$.next(itemCmps[0].nzValue);
                }
            });
        }
        ngOnChanges(changes) {
            const { nzOptions, nzDisabled } = changes;
            if (nzOptions) {
                this.normalizedOptions = normalizeOptions(nzOptions.currentValue);
            }
            if (nzDisabled) {
                this.service.disabled$.next(nzDisabled.currentValue);
            }
        }
        handleThumbAnimationDone(event) {
            if (event.toState === 'to') {
                this.animationState = null;
            }
            this.service.animationDone$.next(event);
        }
        writeValue(value) {
            this.service.selected$.next(value);
        }
        registerOnChange(fn) {
            this.onChange = fn;
        }
        registerOnTouched(fn) {
            this.onTouched = fn;
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedComponent, deps: [{ token: i1$1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzSegmentedComponent, isStandalone: true, selector: "nz-segmented", inputs: { nzBlock: ["nzBlock", "nzBlock", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzOptions: "nzOptions", nzSize: "nzSize" }, outputs: { nzValueChange: "nzValueChange" }, host: { properties: { "class.ant-segmented-disabled": "nzDisabled", "class.ant-segmented-rtl": "dir === 'rtl'", "class.ant-segmented-lg": "nzSize === 'large'", "class.ant-segmented-sm": "nzSize === 'small'", "class.ant-segmented-block": "nzBlock" }, classAttribute: "ant-segmented" }, providers: [
                NzSegmentedService,
                { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NzSegmentedComponent), multi: true }
            ], queries: [{ propertyName: "contentItemCmps", predicate: NzSegmentedItemComponent, isSignal: true }], viewQueries: [{ propertyName: "viewItemCmps", predicate: NzSegmentedItemComponent, descendants: true, isSignal: true }], exportAs: ["nzSegmented"], usesOnChanges: true, ngImport: i0, template: `
    <!-- thumb motion div -->
    <div class="ant-segmented-group">
      @if (animationState) {
        <div
          class="ant-segmented-thumb ant-segmented-thumb-motion"
          [@thumbMotion]="animationState"
          (@thumbMotion.done)="handleThumbAnimationDone($event)"
        ></div>
      }

      <ng-content>
        @for (item of normalizedOptions; track item.value) {
          <label nz-segmented-item [nzIcon]="item.icon" [nzValue]="item.value" [nzDisabled]="item.disabled">{{
            item.label
          }}</label>
        }
      </ng-content>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "ngmodule", type: NzOutletModule }, { kind: "component", type: NzSegmentedItemComponent, selector: "label[nz-segmented-item],label[nzSegmentedItem]", inputs: ["nzIcon", "nzValue", "nzDisabled"], exportAs: ["nzSegmentedItem"] }], animations: [thumbMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-segmented',
                    exportAs: 'nzSegmented',
                    template: `
    <!-- thumb motion div -->
    <div class="ant-segmented-group">
      @if (animationState) {
        <div
          class="ant-segmented-thumb ant-segmented-thumb-motion"
          [@thumbMotion]="animationState"
          (@thumbMotion.done)="handleThumbAnimationDone($event)"
        ></div>
      }

      <ng-content>
        @for (item of normalizedOptions; track item.value) {
          <label nz-segmented-item [nzIcon]="item.icon" [nzValue]="item.value" [nzDisabled]="item.disabled">{{
            item.label
          }}</label>
        }
      </ng-content>
    </div>
  `,
                    host: {
                        class: 'ant-segmented',
                        '[class.ant-segmented-disabled]': 'nzDisabled',
                        '[class.ant-segmented-rtl]': `dir === 'rtl'`,
                        '[class.ant-segmented-lg]': `nzSize === 'large'`,
                        '[class.ant-segmented-sm]': `nzSize === 'small'`,
                        '[class.ant-segmented-block]': `nzBlock`
                    },
                    providers: [
                        NzSegmentedService,
                        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NzSegmentedComponent), multi: true }
                    ],
                    animations: [thumbMotion],
                    imports: [NzIconModule, NzOutletModule, NzSegmentedItemComponent]
                }]
        }], ctorParameters: () => [{ type: i1$1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality }], propDecorators: { nzBlock: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOptions: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzValueChange: [{
                type: Output
            }] } });
function thumbAnimationParamsOf(element) {
    return {
        transform: element?.offsetLeft ?? 0,
        width: element?.clientWidth ?? 0
    };
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzSegmentedModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedModule, imports: [NzSegmentedComponent, NzSegmentedItemComponent], exports: [NzSegmentedComponent, NzSegmentedItemComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedModule, imports: [NzSegmentedComponent, NzSegmentedItemComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzSegmentedModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzSegmentedComponent, NzSegmentedItemComponent],
                    exports: [NzSegmentedComponent, NzSegmentedItemComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzSegmentedComponent, NzSegmentedItemComponent, NzSegmentedModule, normalizeOptions };
//# sourceMappingURL=ng-zorro-antd-segmented.mjs.map
