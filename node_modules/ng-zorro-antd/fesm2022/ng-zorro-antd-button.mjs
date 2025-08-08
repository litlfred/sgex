import { __esDecorate, __runInitializers } from 'tslib';
import * as i0 from '@angular/core';
import { computed, signal, inject, ElementRef, booleanAttribute, Input, ContentChild, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, startWith, filter } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i4 from 'ng-zorro-antd/icon';
import { NzIconModule, NzIconDirective } from 'ng-zorro-antd/icon';
import * as i3 from 'ng-zorro-antd/space';
import { NZ_SPACE_COMPACT_SIZE, NZ_SPACE_COMPACT_ITEM_TYPE, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import * as i2 from '@angular/cdk/bidi';
import { ɵNzTransitionPatchModule as _NzTransitionPatchModule } from 'ng-zorro-antd/core/transition-patch';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';

const NZ_CONFIG_MODULE_NAME = 'button';
let NzButtonComponent = (() => {
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    return class NzButtonComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzSize_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        elementRef;
        cdr;
        renderer;
        nzConfigService;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzIconDirectiveElement;
        nzBlock = false;
        nzGhost = false;
        nzSearch = false;
        nzLoading = false;
        nzDanger = false;
        disabled = false;
        tabIndex = null;
        nzType = null;
        nzShape = null;
        nzSize = __runInitializers(this, _nzSize_initializers, 'default');
        dir = (__runInitializers(this, _nzSize_extraInitializers), 'ltr');
        finalSize = computed(() => {
            if (this.compactSize) {
                return this.compactSize();
            }
            return this.size();
        });
        size = signal(this.nzSize);
        compactSize = inject(NZ_SPACE_COMPACT_SIZE, { optional: true });
        destroy$ = inject(NzDestroyService);
        loading$ = new Subject();
        insertSpan(nodes, renderer) {
            nodes.forEach(node => {
                if (node.nodeName === '#text') {
                    const span = renderer.createElement('span');
                    const parent = renderer.parentNode(node);
                    renderer.insertBefore(parent, span, node);
                    renderer.appendChild(span, node);
                }
            });
        }
        get iconOnly() {
            const listOfNode = Array.from(this.elementRef?.nativeElement?.childNodes || []);
            const noText = listOfNode.every(node => node.nodeName !== '#text');
            // ignore icon and comment
            const noSpan = listOfNode.filter(node => {
                return !(node.nodeName === '#comment' || !!node?.classList?.contains('anticon'));
            }).length == 0;
            return !!this.nzIconDirectiveElement && noSpan && noText;
        }
        constructor(elementRef, cdr, renderer, nzConfigService, directionality) {
            this.elementRef = elementRef;
            this.cdr = cdr;
            this.renderer = renderer;
            this.nzConfigService = nzConfigService;
            this.directionality = directionality;
        }
        ngOnInit() {
            this.size.set(this.nzSize);
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.size.set(this.nzSize);
                this.cdr.markForCheck();
            });
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
            // Caretaker note: this event listener could've been added through `host.click` or `HostListener`.
            // The compiler generates the `ɵɵlistener` instruction which wraps the actual listener internally into the
            // function, which runs `markDirty()` before running the actual listener (the decorated class method).
            // Since we're preventing the default behavior and stopping event propagation this doesn't require Angular to run the change detection.
            fromEventOutsideAngular(this.elementRef.nativeElement, 'click', { capture: true })
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                if ((this.disabled && event.target?.tagName === 'A') || this.nzLoading) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        }
        ngOnChanges({ nzLoading, nzSize }) {
            if (nzLoading) {
                this.loading$.next(this.nzLoading);
            }
            if (nzSize) {
                this.size.set(nzSize.currentValue);
            }
        }
        ngAfterViewInit() {
            this.insertSpan(this.elementRef.nativeElement.childNodes, this.renderer);
        }
        ngAfterContentInit() {
            this.loading$
                .pipe(startWith(this.nzLoading), filter(() => !!this.nzIconDirectiveElement), takeUntil(this.destroy$))
                .subscribe(loading => {
                const nativeElement = this.nzIconDirectiveElement.nativeElement;
                if (loading) {
                    this.renderer.setStyle(nativeElement, 'display', 'none');
                }
                else {
                    this.renderer.removeStyle(nativeElement, 'display');
                }
            });
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.Renderer2 }, { token: i1.NzConfigService }, { token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzButtonComponent, isStandalone: true, selector: "button[nz-button], a[nz-button]", inputs: { nzBlock: ["nzBlock", "nzBlock", booleanAttribute], nzGhost: ["nzGhost", "nzGhost", booleanAttribute], nzSearch: ["nzSearch", "nzSearch", booleanAttribute], nzLoading: ["nzLoading", "nzLoading", booleanAttribute], nzDanger: ["nzDanger", "nzDanger", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], tabIndex: "tabIndex", nzType: "nzType", nzShape: "nzShape", nzSize: "nzSize" }, host: { properties: { "class.ant-btn-default": "nzType === 'default'", "class.ant-btn-primary": "nzType === 'primary'", "class.ant-btn-dashed": "nzType === 'dashed'", "class.ant-btn-link": "nzType === 'link'", "class.ant-btn-text": "nzType === 'text'", "class.ant-btn-circle": "nzShape === 'circle'", "class.ant-btn-round": "nzShape === 'round'", "class.ant-btn-lg": "finalSize() === 'large'", "class.ant-btn-sm": "finalSize() === 'small'", "class.ant-btn-dangerous": "nzDanger", "class.ant-btn-loading": "nzLoading", "class.ant-btn-background-ghost": "nzGhost", "class.ant-btn-block": "nzBlock", "class.ant-input-search-button": "nzSearch", "class.ant-btn-rtl": "dir === 'rtl'", "class.ant-btn-icon-only": "iconOnly", "attr.tabindex": "disabled ? -1 : (tabIndex === null ? null : tabIndex)", "attr.disabled": "disabled || null" }, classAttribute: "ant-btn" }, providers: [NzDestroyService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'btn' }], queries: [{ propertyName: "nzIconDirectiveElement", first: true, predicate: NzIconDirective, descendants: true, read: ElementRef }], exportAs: ["nzButton"], usesOnChanges: true, hostDirectives: [{ directive: i3.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    @if (nzLoading) {
      <nz-icon nzType="loading" />
    }
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i4.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'button[nz-button], a[nz-button]',
                    exportAs: 'nzButton',
                    imports: [NzIconModule],
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (nzLoading) {
      <nz-icon nzType="loading" />
    }
    <ng-content></ng-content>
  `,
                    host: {
                        class: 'ant-btn',
                        '[class.ant-btn-default]': `nzType === 'default'`,
                        '[class.ant-btn-primary]': `nzType === 'primary'`,
                        '[class.ant-btn-dashed]': `nzType === 'dashed'`,
                        '[class.ant-btn-link]': `nzType === 'link'`,
                        '[class.ant-btn-text]': `nzType === 'text'`,
                        '[class.ant-btn-circle]': `nzShape === 'circle'`,
                        '[class.ant-btn-round]': `nzShape === 'round'`,
                        '[class.ant-btn-lg]': `finalSize() === 'large'`,
                        '[class.ant-btn-sm]': `finalSize() === 'small'`,
                        '[class.ant-btn-dangerous]': `nzDanger`,
                        '[class.ant-btn-loading]': `nzLoading`,
                        '[class.ant-btn-background-ghost]': `nzGhost`,
                        '[class.ant-btn-block]': `nzBlock`,
                        '[class.ant-input-search-button]': `nzSearch`,
                        '[class.ant-btn-rtl]': `dir === 'rtl'`,
                        '[class.ant-btn-icon-only]': `iconOnly`,
                        '[attr.tabindex]': 'disabled ? -1 : (tabIndex === null ? null : tabIndex)',
                        '[attr.disabled]': 'disabled || null'
                    },
                    hostDirectives: [NzSpaceCompactItemDirective],
                    providers: [NzDestroyService, { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'btn' }]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.Renderer2 }, { type: i1.NzConfigService }, { type: i2.Directionality }], propDecorators: { nzIconDirectiveElement: [{
                type: ContentChild,
                args: [NzIconDirective, { read: ElementRef }]
            }], nzBlock: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzGhost: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSearch: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDanger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], tabIndex: [{
                type: Input
            }], nzType: [{
                type: Input
            }], nzShape: [{
                type: Input
            }], nzSize: [{
                type: Input
            }] } });

/**
 * @deprecated Will be removed in v20. Use `NzSpaceCompactComponent` instead.
 */
class NzButtonGroupComponent {
    directionality;
    nzSize = 'default';
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(directionality) {
        this.directionality = directionality;
    }
    ngOnInit() {
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonGroupComponent, deps: [{ token: i2.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzButtonGroupComponent, isStandalone: true, selector: "nz-button-group", inputs: { nzSize: "nzSize" }, host: { properties: { "class.ant-btn-group-lg": "nzSize === 'large'", "class.ant-btn-group-sm": "nzSize === 'small'", "class.ant-btn-group-rtl": "dir === 'rtl'" }, classAttribute: "ant-btn-group" }, exportAs: ["nzButtonGroup"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-button-group',
                    exportAs: 'nzButtonGroup',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        class: 'ant-btn-group',
                        '[class.ant-btn-group-lg]': `nzSize === 'large'`,
                        '[class.ant-btn-group-sm]': `nzSize === 'small'`,
                        '[class.ant-btn-group-rtl]': `dir === 'rtl'`
                    },
                    preserveWhitespaces: false,
                    template: `<ng-content></ng-content>`
                }]
        }], ctorParameters: () => [{ type: i2.Directionality }], propDecorators: { nzSize: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzButtonModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzButtonModule, imports: [NzButtonComponent, NzButtonGroupComponent], exports: [NzButtonComponent, NzButtonGroupComponent, _NzTransitionPatchModule, NzWaveModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonModule, imports: [NzButtonComponent, _NzTransitionPatchModule, NzWaveModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzButtonModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzButtonComponent, NzButtonGroupComponent],
                    exports: [NzButtonComponent, NzButtonGroupComponent, _NzTransitionPatchModule, NzWaveModule]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzButtonComponent, NzButtonGroupComponent, NzButtonModule };
//# sourceMappingURL=ng-zorro-antd-button.mjs.map
