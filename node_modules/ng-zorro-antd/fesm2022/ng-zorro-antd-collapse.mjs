import { __esDecorate, __runInitializers } from 'tslib';
import * as i0 from '@angular/core';
import { booleanAttribute, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, EventEmitter, inject, ViewChild, Output, NgModule } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { collapseMotion } from 'ng-zorro-antd/core/animation';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i3$1 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i3 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i4 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i2 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME$1 = 'collapse';
let NzCollapseComponent = (() => {
    let _nzAccordion_decorators;
    let _nzAccordion_initializers = [];
    let _nzAccordion_extraInitializers = [];
    let _nzBordered_decorators;
    let _nzBordered_initializers = [];
    let _nzBordered_extraInitializers = [];
    let _nzGhost_decorators;
    let _nzGhost_initializers = [];
    let _nzGhost_extraInitializers = [];
    return class NzCollapseComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzAccordion_decorators = [WithConfig()];
            _nzBordered_decorators = [WithConfig()];
            _nzGhost_decorators = [WithConfig()];
            __esDecorate(null, null, _nzAccordion_decorators, { kind: "field", name: "nzAccordion", static: false, private: false, access: { has: obj => "nzAccordion" in obj, get: obj => obj.nzAccordion, set: (obj, value) => { obj.nzAccordion = value; } }, metadata: _metadata }, _nzAccordion_initializers, _nzAccordion_extraInitializers);
            __esDecorate(null, null, _nzBordered_decorators, { kind: "field", name: "nzBordered", static: false, private: false, access: { has: obj => "nzBordered" in obj, get: obj => obj.nzBordered, set: (obj, value) => { obj.nzBordered = value; } }, metadata: _metadata }, _nzBordered_initializers, _nzBordered_extraInitializers);
            __esDecorate(null, null, _nzGhost_decorators, { kind: "field", name: "nzGhost", static: false, private: false, access: { has: obj => "nzGhost" in obj, get: obj => obj.nzGhost, set: (obj, value) => { obj.nzGhost = value; } }, metadata: _metadata }, _nzGhost_initializers, _nzGhost_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        directionality;
        destroy$;
        _nzModuleName = NZ_CONFIG_MODULE_NAME$1;
        nzAccordion = __runInitializers(this, _nzAccordion_initializers, false);
        nzBordered = (__runInitializers(this, _nzAccordion_extraInitializers), __runInitializers(this, _nzBordered_initializers, true));
        nzGhost = (__runInitializers(this, _nzBordered_extraInitializers), __runInitializers(this, _nzGhost_initializers, false));
        nzExpandIconPosition = (__runInitializers(this, _nzGhost_extraInitializers), 'start');
        dir = 'ltr';
        listOfNzCollapsePanelComponent = [];
        constructor(nzConfigService, cdr, directionality, destroy$) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.directionality = directionality;
            this.destroy$ = destroy$;
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME$1)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.cdr.markForCheck();
            });
        }
        ngOnInit() {
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            this.dir = this.directionality.value;
        }
        addPanel(value) {
            this.listOfNzCollapsePanelComponent.push(value);
        }
        removePanel(value) {
            this.listOfNzCollapsePanelComponent.splice(this.listOfNzCollapsePanelComponent.indexOf(value), 1);
        }
        click(collapse) {
            if (this.nzAccordion && !collapse.nzActive) {
                this.listOfNzCollapsePanelComponent
                    .filter(item => item !== collapse)
                    .forEach(item => {
                    if (item.nzActive) {
                        item.nzActive = false;
                        item.nzActiveChange.emit(item.nzActive);
                        item.markForCheck();
                    }
                });
            }
            collapse.nzActive = !collapse.nzActive;
            collapse.nzActiveChange.emit(collapse.nzActive);
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.Directionality }, { token: i3.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzCollapseComponent, isStandalone: true, selector: "nz-collapse", inputs: { nzAccordion: ["nzAccordion", "nzAccordion", booleanAttribute], nzBordered: ["nzBordered", "nzBordered", booleanAttribute], nzGhost: ["nzGhost", "nzGhost", booleanAttribute], nzExpandIconPosition: "nzExpandIconPosition" }, host: { properties: { "class.ant-collapse-icon-position-start": "nzExpandIconPosition === 'start'", "class.ant-collapse-icon-position-end": "nzExpandIconPosition === 'end'", "class.ant-collapse-ghost": "nzGhost", "class.ant-collapse-borderless": "!nzBordered", "class.ant-collapse-rtl": "dir === 'rtl'" }, classAttribute: "ant-collapse" }, providers: [NzDestroyService], exportAs: ["nzCollapse"], ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-collapse',
                    exportAs: 'nzCollapse',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: ` <ng-content></ng-content> `,
                    host: {
                        class: 'ant-collapse',
                        '[class.ant-collapse-icon-position-start]': `nzExpandIconPosition === 'start'`,
                        '[class.ant-collapse-icon-position-end]': `nzExpandIconPosition === 'end'`,
                        '[class.ant-collapse-ghost]': `nzGhost`,
                        '[class.ant-collapse-borderless]': '!nzBordered',
                        '[class.ant-collapse-rtl]': "dir === 'rtl'"
                    },
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.Directionality }, { type: i3.NzDestroyService }], propDecorators: { nzAccordion: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBordered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzGhost: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandIconPosition: [{
                type: Input
            }] } });

const NZ_CONFIG_MODULE_NAME = 'collapsePanel';
let NzCollapsePanelComponent = (() => {
    let _nzShowArrow_decorators;
    let _nzShowArrow_initializers = [];
    let _nzShowArrow_extraInitializers = [];
    return class NzCollapsePanelComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzShowArrow_decorators = [WithConfig()];
            __esDecorate(null, null, _nzShowArrow_decorators, { kind: "field", name: "nzShowArrow", static: false, private: false, access: { has: obj => "nzShowArrow" in obj, get: obj => obj.nzShowArrow, set: (obj, value) => { obj.nzShowArrow = value; } }, metadata: _metadata }, _nzShowArrow_initializers, _nzShowArrow_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        ngZone;
        cdr;
        destroy$;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzActive = false;
        nzDisabled = false;
        nzShowArrow = __runInitializers(this, _nzShowArrow_initializers, true);
        nzExtra = __runInitializers(this, _nzShowArrow_extraInitializers);
        nzHeader;
        nzExpandedIcon;
        nzActiveChange = new EventEmitter();
        collapseHeader;
        markForCheck() {
            this.cdr.markForCheck();
        }
        nzCollapseComponent = inject(NzCollapseComponent, { host: true });
        noAnimation = inject(NzNoAnimationDirective, { optional: true });
        constructor(nzConfigService, ngZone, cdr, destroy$) {
            this.nzConfigService = nzConfigService;
            this.ngZone = ngZone;
            this.cdr = cdr;
            this.destroy$ = destroy$;
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.cdr.markForCheck();
            });
        }
        ngOnInit() {
            this.nzCollapseComponent.addPanel(this);
            fromEventOutsideAngular(this.collapseHeader.nativeElement, 'click')
                .pipe(filter(() => !this.nzDisabled), takeUntil(this.destroy$))
                .subscribe(() => {
                this.ngZone.run(() => {
                    this.nzCollapseComponent.click(this);
                    this.cdr.markForCheck();
                });
            });
        }
        ngOnDestroy() {
            this.nzCollapseComponent.removePanel(this);
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapsePanelComponent, deps: [{ token: i1.NzConfigService }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i3.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCollapsePanelComponent, isStandalone: true, selector: "nz-collapse-panel", inputs: { nzActive: ["nzActive", "nzActive", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzShowArrow: ["nzShowArrow", "nzShowArrow", booleanAttribute], nzExtra: "nzExtra", nzHeader: "nzHeader", nzExpandedIcon: "nzExpandedIcon" }, outputs: { nzActiveChange: "nzActiveChange" }, host: { properties: { "class.ant-collapse-no-arrow": "!nzShowArrow", "class.ant-collapse-item-active": "nzActive", "class.ant-collapse-item-disabled": "nzDisabled" }, classAttribute: "ant-collapse-item" }, providers: [NzDestroyService], viewQueries: [{ propertyName: "collapseHeader", first: true, predicate: ["collapseHeader"], descendants: true, static: true }], exportAs: ["nzCollapsePanel"], ngImport: i0, template: `
    <div #collapseHeader role="button" [attr.aria-expanded]="nzActive" class="ant-collapse-header">
      @if (nzShowArrow) {
        <div>
          <ng-container *nzStringTemplateOutlet="nzExpandedIcon; let expandedIcon">
            <nz-icon [nzType]="expandedIcon || 'right'" class="ant-collapse-arrow" [nzRotate]="nzActive ? 90 : 0" />
          </ng-container>
        </div>
      }
      <span class="ant-collapse-header-text">
        <ng-container *nzStringTemplateOutlet="nzHeader">{{ nzHeader }}</ng-container>
      </span>
      @if (nzExtra) {
        <div class="ant-collapse-extra">
          <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
        </div>
      }
    </div>
    <div
      class="ant-collapse-content"
      [class.ant-collapse-content-active]="nzActive"
      [@.disabled]="!!noAnimation?.nzNoAnimation"
      [@collapseMotion]="nzActive ? 'expanded' : 'hidden'"
    >
      <div class="ant-collapse-content-box">
        <ng-content></ng-content>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3$1.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i4.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], animations: [collapseMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapsePanelComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-collapse-panel',
                    exportAs: 'nzCollapsePanel',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    animations: [collapseMotion],
                    template: `
    <div #collapseHeader role="button" [attr.aria-expanded]="nzActive" class="ant-collapse-header">
      @if (nzShowArrow) {
        <div>
          <ng-container *nzStringTemplateOutlet="nzExpandedIcon; let expandedIcon">
            <nz-icon [nzType]="expandedIcon || 'right'" class="ant-collapse-arrow" [nzRotate]="nzActive ? 90 : 0" />
          </ng-container>
        </div>
      }
      <span class="ant-collapse-header-text">
        <ng-container *nzStringTemplateOutlet="nzHeader">{{ nzHeader }}</ng-container>
      </span>
      @if (nzExtra) {
        <div class="ant-collapse-extra">
          <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
        </div>
      }
    </div>
    <div
      class="ant-collapse-content"
      [class.ant-collapse-content-active]="nzActive"
      [@.disabled]="!!noAnimation?.nzNoAnimation"
      [@collapseMotion]="nzActive ? 'expanded' : 'hidden'"
    >
      <div class="ant-collapse-content-box">
        <ng-content></ng-content>
      </div>
    </div>
  `,
                    host: {
                        class: 'ant-collapse-item',
                        '[class.ant-collapse-no-arrow]': '!nzShowArrow',
                        '[class.ant-collapse-item-active]': 'nzActive',
                        '[class.ant-collapse-item-disabled]': 'nzDisabled'
                    },
                    providers: [NzDestroyService],
                    imports: [NzOutletModule, NzIconModule]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i3.NzDestroyService }], propDecorators: { nzActive: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowArrow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExtra: [{
                type: Input
            }], nzHeader: [{
                type: Input
            }], nzExpandedIcon: [{
                type: Input
            }], nzActiveChange: [{
                type: Output
            }], collapseHeader: [{
                type: ViewChild,
                args: ['collapseHeader', { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCollapseModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseModule, imports: [NzCollapsePanelComponent, NzCollapseComponent], exports: [NzCollapsePanelComponent, NzCollapseComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseModule, imports: [NzCollapsePanelComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCollapseModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCollapsePanelComponent, NzCollapseComponent],
                    exports: [NzCollapsePanelComponent, NzCollapseComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzCollapseComponent, NzCollapseModule, NzCollapsePanelComponent };
//# sourceMappingURL=ng-zorro-antd-collapse.mjs.map
