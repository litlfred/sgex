import * as i0 from '@angular/core';
import { InjectionToken, inject, Injectable, numberAttribute, booleanAttribute, Input, Directive, makeEnvironmentProviders, NgModule } from '@angular/core';
import { Subject, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { warn } from 'ng-zorro-antd/core/logger';
import { DOCUMENT } from '@angular/common';
import { HttpBackend } from '@angular/common/http';
import { BarsOutline, CalendarOutline, CaretUpFill, CaretUpOutline, CaretDownFill, CaretDownOutline, CheckCircleFill, CheckCircleOutline, CheckOutline, ClockCircleOutline, CloseCircleOutline, CloseCircleFill, CloseOutline, CopyOutline, DeleteOutline, DoubleLeftOutline, DoubleRightOutline, DownOutline, EditOutline, EllipsisOutline, ExclamationCircleFill, ExclamationCircleOutline, EyeOutline, FileFill, FileOutline, FilterFill, InfoCircleFill, InfoCircleOutline, LeftOutline, LoadingOutline, PaperClipOutline, QuestionCircleOutline, RightOutline, RotateRightOutline, RotateLeftOutline, StarFill, SearchOutline, UploadOutline, VerticalAlignTopOutline, UpOutline, SwapOutline, SwapRightOutline, ZoomInOutline, ZoomOutOutline } from '@ant-design/icons-angular/icons';
import * as i1 from '@angular/platform-browser';
import * as i2 from 'ng-zorro-antd/core/config';
import * as i3 from '@angular/cdk/platform';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_ICONS_USED_BY_ZORRO = [
    BarsOutline,
    CalendarOutline,
    CaretUpFill,
    CaretUpOutline,
    CaretDownFill,
    CaretDownOutline,
    CheckCircleFill,
    CheckCircleOutline,
    CheckOutline,
    ClockCircleOutline,
    CloseCircleOutline,
    CloseCircleFill,
    CloseOutline,
    CopyOutline,
    DeleteOutline,
    DoubleLeftOutline,
    DoubleRightOutline,
    DownOutline,
    EditOutline,
    EllipsisOutline,
    ExclamationCircleFill,
    ExclamationCircleOutline,
    EyeOutline,
    FileFill,
    FileOutline,
    FilterFill,
    InfoCircleFill,
    InfoCircleOutline,
    LeftOutline,
    LoadingOutline,
    PaperClipOutline,
    QuestionCircleOutline,
    RightOutline,
    RotateRightOutline,
    RotateLeftOutline,
    StarFill,
    SearchOutline,
    StarFill,
    UploadOutline,
    VerticalAlignTopOutline,
    UpOutline,
    SwapOutline,
    SwapRightOutline,
    ZoomInOutline,
    ZoomOutOutline
];

const NZ_ICONS = new InjectionToken('nz_icons');
const NZ_ICON_DEFAULT_TWOTONE_COLOR = new InjectionToken('nz_icon_default_twotone_color');
const DEFAULT_TWOTONE_COLOR = '#1890ff';
/**
 * It should be a global singleton, otherwise registered icons could not be found.
 */
class NzIconService extends IconService {
    nzConfigService;
    platform;
    configUpdated$ = new Subject();
    get _disableDynamicLoading() {
        return !this.platform.isBrowser;
    }
    iconfontCache = new Set();
    subscription = null;
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
    normalizeSvgElement(svg) {
        if (!svg.getAttribute('viewBox')) {
            this._renderer.setAttribute(svg, 'viewBox', '0 0 1024 1024');
        }
        if (!svg.getAttribute('width') || !svg.getAttribute('height')) {
            this._renderer.setAttribute(svg, 'width', '1em');
            this._renderer.setAttribute(svg, 'height', '1em');
        }
        if (!svg.getAttribute('fill')) {
            this._renderer.setAttribute(svg, 'fill', 'currentColor');
        }
    }
    fetchFromIconfont(opt) {
        const { scriptUrl } = opt;
        if (this._document && !this.iconfontCache.has(scriptUrl)) {
            const script = this._renderer.createElement('script');
            this._renderer.setAttribute(script, 'src', scriptUrl);
            this._renderer.setAttribute(script, 'data-namespace', scriptUrl.replace(/^(https?|http):/g, ''));
            this._renderer.appendChild(this._document.body, script);
            this.iconfontCache.add(scriptUrl);
        }
    }
    createIconfontIcon(type) {
        return this._createSVGElementFromString(`<svg><use xlink:href="${type}"></svg>`);
    }
    constructor(rendererFactory, sanitizer, nzConfigService, platform) {
        super(rendererFactory, inject(HttpBackend, { optional: true }), // TODO: fix the type
        inject(DOCUMENT), sanitizer, [...NZ_ICONS_USED_BY_ZORRO, ...(inject(NZ_ICONS, { optional: true }) || [])]);
        this.nzConfigService = nzConfigService;
        this.platform = platform;
        this.onConfigChange();
        this.configDefaultTwotoneColor();
        this.configDefaultTheme();
    }
    onConfigChange() {
        this.subscription = this.nzConfigService.getConfigChangeEventForComponent('icon').subscribe(() => {
            this.configDefaultTwotoneColor();
            this.configDefaultTheme();
            this.configUpdated$.next();
        });
    }
    configDefaultTheme() {
        const iconConfig = this.getConfig();
        this.defaultTheme = iconConfig.nzTheme || 'outline';
    }
    configDefaultTwotoneColor() {
        const iconConfig = this.getConfig();
        const defaultTwotoneColor = iconConfig.nzTwotoneColor || DEFAULT_TWOTONE_COLOR;
        let primaryColor = DEFAULT_TWOTONE_COLOR;
        if (defaultTwotoneColor) {
            if (defaultTwotoneColor.startsWith('#')) {
                primaryColor = defaultTwotoneColor;
            }
            else {
                warn('Twotone color must be a hex color!');
            }
        }
        this.twoToneColor = { primaryColor };
    }
    getConfig() {
        return this.nzConfigService.getConfigForComponent('icon') || {};
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconService, deps: [{ token: i0.RendererFactory2 }, { token: i1.DomSanitizer }, { token: i2.NzConfigService }, { token: i3.Platform }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: i1.DomSanitizer }, { type: i2.NzConfigService }, { type: i3.Platform }] });
const NZ_ICONS_PATCH = new InjectionToken('nz_icons_patch');
class NzIconPatchService {
    rootIconService;
    patched = false;
    extraIcons = inject(NZ_ICONS_PATCH, { self: true });
    constructor(rootIconService) {
        this.rootIconService = rootIconService;
    }
    doPatch() {
        if (this.patched) {
            return;
        }
        this.extraIcons.forEach(iconDefinition => this.rootIconService.addIcon(iconDefinition));
        this.patched = true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconPatchService, deps: [{ token: NzIconService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconPatchService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconPatchService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: NzIconService }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzIconDirective extends IconDirective {
    ngZone;
    changeDetectorRef;
    iconService;
    renderer;
    cacheClassName = null;
    set nzSpin(value) {
        this.spin = value;
    }
    nzRotate = 0;
    set nzType(value) {
        this.type = value;
    }
    set nzTheme(value) {
        this.theme = value;
    }
    set nzTwotoneColor(value) {
        this.twoToneColor = value;
    }
    set nzIconfont(value) {
        this.iconfont = value;
    }
    hostClass;
    el;
    iconfont;
    spin = false;
    destroy$ = new Subject();
    constructor(ngZone, changeDetectorRef, iconService, renderer) {
        super(iconService);
        this.ngZone = ngZone;
        this.changeDetectorRef = changeDetectorRef;
        this.iconService = iconService;
        this.renderer = renderer;
        const iconPatch = inject(NzIconPatchService, { optional: true });
        if (iconPatch) {
            iconPatch.doPatch();
        }
        this.el = this._elementRef.nativeElement;
    }
    ngOnChanges(changes) {
        const { nzType, nzTwotoneColor, nzSpin, nzTheme, nzRotate } = changes;
        if (nzType || nzTwotoneColor || nzSpin || nzTheme) {
            this.changeIcon2();
        }
        else if (nzRotate) {
            this.handleRotate(this.el.firstChild);
        }
        else {
            this._setSVGElement(this.iconService.createIconfontIcon(`#${this.iconfont}`));
        }
    }
    /**
     * If custom content is provided, try to normalize SVG elements.
     */
    ngAfterContentChecked() {
        if (!this.type) {
            const children = this.el.children;
            let length = children.length;
            if (!this.type && children.length) {
                while (length--) {
                    const child = children[length];
                    if (child.tagName.toLowerCase() === 'svg') {
                        this.iconService.normalizeSvgElement(child);
                    }
                }
            }
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
    /**
     * Replacement of `changeIcon` for more modifications.
     */
    changeIcon2() {
        this.setClassName();
        // The Angular zone is left deliberately before the SVG is set
        // since `_changeIcon` spawns asynchronous tasks as promise and
        // HTTP calls. This is used to reduce the number of change detections
        // while the icon is being loaded dynamically.
        this.ngZone.runOutsideAngular(() => {
            from(this._changeIcon())
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                next: svgOrRemove => {
                    // Get back into the Angular zone after completing all the tasks.
                    // Since we manually run change detection locally, we have to re-enter
                    // the zone because the change detection might also be run on other local
                    // components, leading them to handle template functions outside of the Angular zone.
                    this.ngZone.run(() => {
                        // The _changeIcon method would call Renderer to remove the element of the old icon,
                        // which would call `markElementAsRemoved` eventually,
                        // so we should call `detectChanges` to tell Angular remove the DOM node.
                        // #7186
                        this.changeDetectorRef.detectChanges();
                        if (svgOrRemove) {
                            this.setSVGData(svgOrRemove);
                            this.handleSpin(svgOrRemove);
                            this.handleRotate(svgOrRemove);
                        }
                    });
                },
                error: warn
            });
        });
    }
    handleSpin(svg) {
        if (this.spin || this.type === 'loading') {
            this.renderer.addClass(svg, 'anticon-spin');
        }
        else {
            this.renderer.removeClass(svg, 'anticon-spin');
        }
    }
    handleRotate(svg) {
        if (this.nzRotate) {
            this.renderer.setAttribute(svg, 'style', `transform: rotate(${this.nzRotate}deg)`);
        }
        else {
            this.renderer.removeAttribute(svg, 'style');
        }
    }
    setClassName() {
        if (this.cacheClassName) {
            this.renderer.removeClass(this.el, this.cacheClassName);
        }
        this.cacheClassName = `anticon-${this.type}`;
        this.renderer.addClass(this.el, this.cacheClassName);
    }
    setSVGData(svg) {
        this.renderer.setAttribute(svg, 'data-icon', this.type);
        this.renderer.setAttribute(svg, 'aria-hidden', 'true');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconDirective, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: NzIconService }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzIconDirective, isStandalone: true, selector: "nz-icon,[nz-icon]", inputs: { nzSpin: ["nzSpin", "nzSpin", booleanAttribute], nzRotate: ["nzRotate", "nzRotate", numberAttribute], nzType: "nzType", nzTheme: "nzTheme", nzTwotoneColor: "nzTwotoneColor", nzIconfont: "nzIconfont" }, host: { classAttribute: "anticon" }, exportAs: ["nzIcon"], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-icon,[nz-icon]',
                    exportAs: 'nzIcon',
                    host: {
                        class: 'anticon'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: NzIconService }, { type: i0.Renderer2 }], propDecorators: { nzSpin: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzRotate: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzType: [{
                type: Input
            }], nzTheme: [{
                type: Input
            }], nzTwotoneColor: [{
                type: Input
            }], nzIconfont: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * Provide icon definitions for NzIcon in root
 *
 * @param icons Icon definitions
 */
const provideNzIcons = (icons) => {
    return makeEnvironmentProviders([
        {
            provide: NZ_ICONS,
            useValue: icons
        }
    ]);
};
/**
 * Provide icon definitions for NzIcon in feature module or standalone component
 *
 * @param icons Icon definitions
 */
const provideNzIconsPatch = (icons) => {
    return [
        NzIconPatchService,
        {
            provide: NZ_ICONS_PATCH,
            useValue: icons
        }
    ];
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzIconModule {
    static forRoot(icons) {
        return {
            ngModule: NzIconModule,
            providers: [provideNzIcons(icons)]
        };
    }
    static forChild(icons) {
        return {
            ngModule: NzIconModule,
            providers: [provideNzIconsPatch(icons)]
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzIconModule, imports: [NzIconDirective], exports: [NzIconDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzIconDirective],
                    exports: [NzIconDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { DEFAULT_TWOTONE_COLOR, NZ_ICONS, NZ_ICONS_PATCH, NZ_ICONS_USED_BY_ZORRO, NZ_ICON_DEFAULT_TWOTONE_COLOR, NzIconDirective, NzIconModule, NzIconPatchService, NzIconService, provideNzIcons, provideNzIconsPatch };
//# sourceMappingURL=ng-zorro-antd-icon.mjs.map
