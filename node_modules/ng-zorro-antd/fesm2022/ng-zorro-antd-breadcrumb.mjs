import { NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy, forwardRef, booleanAttribute, NgModule } from '@angular/core';
import * as i4 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2 from 'ng-zorro-antd/dropdown';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import * as i3 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router, ActivatedRoute, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter, startWith } from 'rxjs/operators';
import { PREFIX } from 'ng-zorro-antd/core/logger';
import * as i1 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBreadCrumbSeparatorComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbSeparatorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzBreadCrumbSeparatorComponent, isStandalone: true, selector: "nz-breadcrumb-separator", host: { classAttribute: "ant-breadcrumb-separator" }, exportAs: ["nzBreadcrumbSeparator"], ngImport: i0, template: `<ng-content></ng-content>`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbSeparatorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-breadcrumb-separator',
                    exportAs: 'nzBreadcrumbSeparator',
                    template: `<ng-content></ng-content>`,
                    host: {
                        class: 'ant-breadcrumb-separator'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * https://angular.io/errors/NG3003
 * An intermediate interface for {@link NzBreadCrumbComponent} & {@link NzBreadCrumbItemComponent}
 */
class NzBreadcrumb {
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBreadCrumbItemComponent {
    nzBreadCrumbComponent;
    /**
     * Dropdown content of a breadcrumb item.
     */
    nzOverlay;
    constructor(nzBreadCrumbComponent) {
        this.nzBreadCrumbComponent = nzBreadCrumbComponent;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbItemComponent, deps: [{ token: NzBreadcrumb }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzBreadCrumbItemComponent, isStandalone: true, selector: "nz-breadcrumb-item", inputs: { nzOverlay: "nzOverlay" }, exportAs: ["nzBreadcrumbItem"], ngImport: i0, template: `
    @if (!!nzOverlay) {
      <span class="ant-breadcrumb-overlay-link" nz-dropdown [nzDropdownMenu]="nzOverlay">
        <ng-template [ngTemplateOutlet]="noMenuTpl"></ng-template>
        <nz-icon nzType="down" />
      </span>
    } @else {
      <ng-template [ngTemplateOutlet]="noMenuTpl" />
    }

    @if (nzBreadCrumbComponent.nzSeparator) {
      <nz-breadcrumb-separator>
        <ng-container *nzStringTemplateOutlet="nzBreadCrumbComponent.nzSeparator">
          {{ nzBreadCrumbComponent.nzSeparator }}
        </ng-container>
      </nz-breadcrumb-separator>
    }

    <ng-template #noMenuTpl>
      <span class="ant-breadcrumb-link">
        <ng-content />
      </span>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzBreadCrumbSeparatorComponent, selector: "nz-breadcrumb-separator", exportAs: ["nzBreadcrumbSeparator"] }, { kind: "ngmodule", type: NzDropDownModule }, { kind: "directive", type: i2.NzDropDownDirective, selector: "[nz-dropdown]", inputs: ["nzDropdownMenu", "nzTrigger", "nzMatchWidthElement", "nzBackdrop", "nzClickHide", "nzDisabled", "nzVisible", "nzOverlayClassName", "nzOverlayStyle", "nzPlacement"], outputs: ["nzVisibleChange"], exportAs: ["nzDropdown"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i3.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i4.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbItemComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-breadcrumb-item',
                    exportAs: 'nzBreadcrumbItem',
                    preserveWhitespaces: false,
                    imports: [NgTemplateOutlet, NzBreadCrumbSeparatorComponent, NzDropDownModule, NzIconModule, NzOutletModule],
                    template: `
    @if (!!nzOverlay) {
      <span class="ant-breadcrumb-overlay-link" nz-dropdown [nzDropdownMenu]="nzOverlay">
        <ng-template [ngTemplateOutlet]="noMenuTpl"></ng-template>
        <nz-icon nzType="down" />
      </span>
    } @else {
      <ng-template [ngTemplateOutlet]="noMenuTpl" />
    }

    @if (nzBreadCrumbComponent.nzSeparator) {
      <nz-breadcrumb-separator>
        <ng-container *nzStringTemplateOutlet="nzBreadCrumbComponent.nzSeparator">
          {{ nzBreadCrumbComponent.nzSeparator }}
        </ng-container>
      </nz-breadcrumb-separator>
    }

    <ng-template #noMenuTpl>
      <span class="ant-breadcrumb-link">
        <ng-content />
      </span>
    </ng-template>
  `
                }]
        }], ctorParameters: () => [{ type: NzBreadcrumb }], propDecorators: { nzOverlay: [{
                type: Input
            }] } });

class NzBreadCrumbComponent {
    injector;
    cdr;
    elementRef;
    renderer;
    directionality;
    nzAutoGenerate = false;
    nzSeparator = '/';
    nzRouteLabel = 'breadcrumb';
    nzRouteLabelFn = label => label;
    nzRouteFn = route => route;
    breadcrumbs = [];
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(injector, cdr, elementRef, renderer, directionality) {
        this.injector = injector;
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.directionality = directionality;
    }
    ngOnInit() {
        if (this.nzAutoGenerate) {
            this.registerRouterChange();
        }
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.prepareComponentForRtl();
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
        this.prepareComponentForRtl();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    navigate(url, e) {
        e.preventDefault();
        this.injector.get(Router).navigateByUrl(url);
    }
    registerRouterChange() {
        try {
            const router = this.injector.get(Router);
            const activatedRoute = this.injector.get(ActivatedRoute);
            router.events
                .pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroy$), startWith(true) // trigger initial render
            )
                .subscribe(() => {
                this.breadcrumbs = this.getBreadcrumbs(activatedRoute.root);
                this.cdr.markForCheck();
            });
        }
        catch {
            throw new Error(`${PREFIX} You should import RouterModule if you want to use 'NzAutoGenerate'.`);
        }
    }
    getBreadcrumbs(route, url = '', breadcrumbs = []) {
        const children = route.children;
        // If there's no sub root, then stop the recurse and returns the generated breadcrumbs.
        if (children.length === 0) {
            return breadcrumbs;
        }
        for (const child of children) {
            if (child.outlet === PRIMARY_OUTLET) {
                // Only parse components in primary router-outlet (in another word, router-outlet without a specific name).
                // Parse this layer and generate a breadcrumb item.
                const routeUrl = child.snapshot.url
                    .map(segment => segment.path)
                    .filter(path => path)
                    .join('/');
                // Do not change nextUrl if routeUrl is falsy. This happens when it's a route lazy loading other modules.
                const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
                const breadcrumbLabel = this.nzRouteLabelFn(child.snapshot.data[this.nzRouteLabel]);
                const shapedUrl = this.nzRouteFn(nextUrl);
                // If have data, go to generate a breadcrumb for it.
                if (routeUrl && breadcrumbLabel) {
                    const breadcrumb = {
                        label: breadcrumbLabel,
                        params: child.snapshot.params,
                        url: shapedUrl
                    };
                    breadcrumbs.push(breadcrumb);
                }
                return this.getBreadcrumbs(child, nextUrl, breadcrumbs);
            }
        }
        return breadcrumbs;
    }
    prepareComponentForRtl() {
        if (this.dir === 'rtl') {
            this.renderer.addClass(this.elementRef.nativeElement, 'ant-breadcrumb-rtl');
        }
        else {
            this.renderer.removeClass(this.elementRef.nativeElement, 'ant-breadcrumb-rtl');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbComponent, deps: [{ token: i0.Injector }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzBreadCrumbComponent, isStandalone: true, selector: "nz-breadcrumb", inputs: { nzAutoGenerate: ["nzAutoGenerate", "nzAutoGenerate", booleanAttribute], nzSeparator: "nzSeparator", nzRouteLabel: "nzRouteLabel", nzRouteLabelFn: "nzRouteLabelFn", nzRouteFn: "nzRouteFn" }, host: { classAttribute: "ant-breadcrumb" }, providers: [{ provide: NzBreadcrumb, useExisting: forwardRef(() => NzBreadCrumbComponent) }], exportAs: ["nzBreadcrumb"], ngImport: i0, template: `
    <ng-content />
    @if (nzAutoGenerate && breadcrumbs.length) {
      @for (breadcrumb of breadcrumbs; track breadcrumb.url) {
        <nz-breadcrumb-item>
          <a [attr.href]="breadcrumb.url" (click)="navigate(breadcrumb.url, $event)">{{ breadcrumb.label }}</a>
        </nz-breadcrumb-item>
      }
    }
  `, isInline: true, dependencies: [{ kind: "component", type: NzBreadCrumbItemComponent, selector: "nz-breadcrumb-item", inputs: ["nzOverlay"], exportAs: ["nzBreadcrumbItem"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-breadcrumb',
                    exportAs: 'nzBreadcrumb',
                    preserveWhitespaces: false,
                    providers: [{ provide: NzBreadcrumb, useExisting: forwardRef(() => NzBreadCrumbComponent) }],
                    imports: [NzBreadCrumbItemComponent],
                    template: `
    <ng-content />
    @if (nzAutoGenerate && breadcrumbs.length) {
      @for (breadcrumb of breadcrumbs; track breadcrumb.url) {
        <nz-breadcrumb-item>
          <a [attr.href]="breadcrumb.url" (click)="navigate(breadcrumb.url, $event)">{{ breadcrumb.label }}</a>
        </nz-breadcrumb-item>
      }
    }
  `,
                    host: {
                        class: 'ant-breadcrumb'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.Injector }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.Directionality }], propDecorators: { nzAutoGenerate: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSeparator: [{
                type: Input
            }], nzRouteLabel: [{
                type: Input
            }], nzRouteLabelFn: [{
                type: Input
            }], nzRouteFn: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzBreadCrumbModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbModule, imports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, NzBreadCrumbSeparatorComponent], exports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, NzBreadCrumbSeparatorComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbModule, imports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzBreadCrumbModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, NzBreadCrumbSeparatorComponent],
                    exports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, NzBreadCrumbSeparatorComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzBreadCrumbComponent, NzBreadCrumbItemComponent, NzBreadCrumbModule, NzBreadCrumbSeparatorComponent };
//# sourceMappingURL=ng-zorro-antd-breadcrumb.mjs.map
