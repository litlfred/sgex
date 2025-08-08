import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { EventEmitter, inject, numberAttribute, booleanAttribute, Output, Input, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, Component, TemplateRef, ContentChild, NgModule } from '@angular/core';
import { __esDecorate, __runInitializers } from 'tslib';
import * as i3 from '@angular/cdk/platform';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { Subject } from 'rxjs';
import { throttleTime, takeUntil } from 'rxjs/operators';
import * as i4 from 'ng-zorro-antd/affix';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { fromEventOutsideAngular, numberAttributeWithZeroFallback } from 'ng-zorro-antd/core/util';
import * as i2 from 'ng-zorro-antd/core/services';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function getOffsetTop(element, container) {
    if (!element || !element.getClientRects().length) {
        return 0;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width || rect.height) {
        if (container === window) {
            const documentElement = element.ownerDocument.documentElement;
            return rect.top - documentElement.clientTop;
        }
        return rect.top - container.getBoundingClientRect().top;
    }
    return rect.top;
}

const VISIBLE_CLASSNAME = 'ant-anchor-ink-ball-visible';
const NZ_CONFIG_MODULE_NAME = 'anchor';
const sharpMatcherRegx = /#([^#]+)$/;
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
let NzAnchorComponent = (() => {
    let _nzShowInkInFixed_decorators;
    let _nzShowInkInFixed_initializers = [];
    let _nzShowInkInFixed_extraInitializers = [];
    let _nzBounds_decorators;
    let _nzBounds_initializers = [];
    let _nzBounds_extraInitializers = [];
    let _nzOffsetTop_decorators;
    let _nzOffsetTop_initializers = [];
    let _nzOffsetTop_extraInitializers = [];
    let _nzTargetOffset_decorators;
    let _nzTargetOffset_initializers = [];
    let _nzTargetOffset_extraInitializers = [];
    return class NzAnchorComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzShowInkInFixed_decorators = [WithConfig()];
            _nzBounds_decorators = [WithConfig()];
            _nzOffsetTop_decorators = [WithConfig()];
            _nzTargetOffset_decorators = [WithConfig()];
            __esDecorate(null, null, _nzShowInkInFixed_decorators, { kind: "field", name: "nzShowInkInFixed", static: false, private: false, access: { has: obj => "nzShowInkInFixed" in obj, get: obj => obj.nzShowInkInFixed, set: (obj, value) => { obj.nzShowInkInFixed = value; } }, metadata: _metadata }, _nzShowInkInFixed_initializers, _nzShowInkInFixed_extraInitializers);
            __esDecorate(null, null, _nzBounds_decorators, { kind: "field", name: "nzBounds", static: false, private: false, access: { has: obj => "nzBounds" in obj, get: obj => obj.nzBounds, set: (obj, value) => { obj.nzBounds = value; } }, metadata: _metadata }, _nzBounds_initializers, _nzBounds_extraInitializers);
            __esDecorate(null, null, _nzOffsetTop_decorators, { kind: "field", name: "nzOffsetTop", static: false, private: false, access: { has: obj => "nzOffsetTop" in obj, get: obj => obj.nzOffsetTop, set: (obj, value) => { obj.nzOffsetTop = value; } }, metadata: _metadata }, _nzOffsetTop_initializers, _nzOffsetTop_extraInitializers);
            __esDecorate(null, null, _nzTargetOffset_decorators, { kind: "field", name: "nzTargetOffset", static: false, private: false, access: { has: obj => "nzTargetOffset" in obj, get: obj => obj.nzTargetOffset, set: (obj, value) => { obj.nzTargetOffset = value; } }, metadata: _metadata }, _nzTargetOffset_initializers, _nzTargetOffset_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        scrollSrv;
        cdr;
        platform;
        renderer;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        ink;
        nzAffix = true;
        nzShowInkInFixed = __runInitializers(this, _nzShowInkInFixed_initializers, false);
        nzBounds = (__runInitializers(this, _nzShowInkInFixed_extraInitializers), __runInitializers(this, _nzBounds_initializers, 5));
        nzOffsetTop = (__runInitializers(this, _nzBounds_extraInitializers), __runInitializers(this, _nzOffsetTop_initializers, undefined));
        nzTargetOffset = (__runInitializers(this, _nzOffsetTop_extraInitializers), __runInitializers(this, _nzTargetOffset_initializers, undefined));
        nzContainer = __runInitializers(this, _nzTargetOffset_extraInitializers);
        nzCurrentAnchor;
        nzDirection = 'vertical';
        nzClick = new EventEmitter();
        nzChange = new EventEmitter();
        nzScroll = new EventEmitter();
        visible = false;
        wrapperStyle = { 'max-height': '100vh' };
        container;
        activeLink;
        links = [];
        animating = false;
        destroy$ = new Subject();
        handleScrollTimeoutID;
        doc = inject(DOCUMENT);
        constructor(nzConfigService, scrollSrv, cdr, platform, renderer) {
            this.nzConfigService = nzConfigService;
            this.scrollSrv = scrollSrv;
            this.cdr = cdr;
            this.platform = platform;
            this.renderer = renderer;
        }
        registerLink(link) {
            this.links.push(link);
        }
        unregisterLink(link) {
            this.links.splice(this.links.indexOf(link), 1);
        }
        getContainer() {
            return this.container || window;
        }
        ngAfterViewInit() {
            this.registerScrollEvent();
        }
        ngOnDestroy() {
            clearTimeout(this.handleScrollTimeoutID);
            this.destroy$.next(true);
            this.destroy$.complete();
        }
        registerScrollEvent() {
            if (!this.platform.isBrowser) {
                return;
            }
            this.destroy$.next(true);
            fromEventOutsideAngular(this.getContainer(), 'scroll', passiveEventListenerOptions)
                .pipe(throttleTime(50), takeUntil(this.destroy$))
                .subscribe(() => this.handleScroll());
            // Browser would maintain the scrolling position when refreshing.
            // So we have to delay calculation in avoid of getting a incorrect result.
            this.handleScrollTimeoutID = setTimeout(() => this.handleScroll());
        }
        handleScroll() {
            if (typeof document === 'undefined' || this.animating) {
                return;
            }
            const sections = [];
            const offsetTop = this.nzTargetOffset ? this.nzTargetOffset : this.nzOffsetTop || 0;
            const scope = offsetTop + this.nzBounds;
            this.links.forEach(comp => {
                const sharpLinkMatch = sharpMatcherRegx.exec(comp.nzHref.toString());
                if (!sharpLinkMatch) {
                    return;
                }
                const target = this.doc.getElementById(sharpLinkMatch[1]);
                if (target) {
                    const top = getOffsetTop(target, this.getContainer());
                    if (top < scope) {
                        sections.push({
                            top,
                            comp
                        });
                    }
                }
            });
            this.visible = !!sections.length;
            if (!this.visible) {
                this.clearActive();
                this.cdr.detectChanges();
            }
            else {
                const maxSection = sections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
                this.handleActive(maxSection.comp);
            }
            this.setVisible();
        }
        clearActive() {
            this.links.forEach(i => {
                i.unsetActive();
            });
        }
        setActive(comp) {
            const originalActiveLink = this.activeLink;
            const targetComp = (this.nzCurrentAnchor && this.links.find(n => n.nzHref === this.nzCurrentAnchor)) || comp;
            if (!targetComp)
                return;
            targetComp.setActive();
            const linkNode = targetComp.getLinkTitleElement();
            if (this.nzDirection === 'vertical') {
                this.ink.nativeElement.style.top = `${linkNode.offsetTop + linkNode.clientHeight / 2 - 4.5}px`;
            }
            else {
                this.ink.nativeElement.style.left = `${linkNode.offsetLeft + linkNode.clientWidth / 2}px`;
            }
            this.activeLink = (comp || targetComp).nzHref;
            if (originalActiveLink !== this.activeLink) {
                this.nzChange.emit(this.activeLink);
            }
        }
        handleActive(comp) {
            this.clearActive();
            this.setActive(comp);
            this.visible = true;
            this.setVisible();
            this.nzScroll.emit(comp);
        }
        setVisible() {
            if (this.ink) {
                const visible = this.visible;
                if (visible) {
                    this.renderer.addClass(this.ink.nativeElement, VISIBLE_CLASSNAME);
                }
                else {
                    this.renderer.removeClass(this.ink.nativeElement, VISIBLE_CLASSNAME);
                }
            }
        }
        handleScrollTo(linkComp) {
            const el = this.doc.querySelector(linkComp.nzHref);
            if (!el) {
                return;
            }
            this.animating = true;
            const containerScrollTop = this.scrollSrv.getScroll(this.getContainer());
            const elOffsetTop = getOffsetTop(el, this.getContainer());
            let targetScrollTop = containerScrollTop + elOffsetTop;
            targetScrollTop -= this.nzTargetOffset !== undefined ? this.nzTargetOffset : this.nzOffsetTop || 0;
            this.scrollSrv.scrollTo(this.getContainer(), targetScrollTop, {
                callback: () => {
                    this.animating = false;
                    this.handleActive(linkComp);
                }
            });
            this.nzClick.emit(linkComp.nzHref);
        }
        ngOnChanges(changes) {
            const { nzOffsetTop, nzContainer, nzCurrentAnchor } = changes;
            if (nzOffsetTop) {
                this.wrapperStyle = {
                    'max-height': `calc(100vh - ${this.nzOffsetTop}px)`
                };
            }
            if (nzContainer) {
                const container = this.nzContainer;
                this.container = typeof container === 'string' ? this.doc.querySelector(container) : container;
                this.registerScrollEvent();
            }
            if (nzCurrentAnchor) {
                this.setActive();
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorComponent, deps: [{ token: i1.NzConfigService }, { token: i2.NzScrollService }, { token: i0.ChangeDetectorRef }, { token: i3.Platform }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzAnchorComponent, isStandalone: true, selector: "nz-anchor", inputs: { nzAffix: ["nzAffix", "nzAffix", booleanAttribute], nzShowInkInFixed: ["nzShowInkInFixed", "nzShowInkInFixed", booleanAttribute], nzBounds: ["nzBounds", "nzBounds", numberAttribute], nzOffsetTop: ["nzOffsetTop", "nzOffsetTop", numberAttributeWithZeroFallback], nzTargetOffset: ["nzTargetOffset", "nzTargetOffset", numberAttributeWithZeroFallback], nzContainer: "nzContainer", nzCurrentAnchor: "nzCurrentAnchor", nzDirection: "nzDirection" }, outputs: { nzClick: "nzClick", nzChange: "nzChange", nzScroll: "nzScroll" }, viewQueries: [{ propertyName: "ink", first: true, predicate: ["ink"], descendants: true }], exportAs: ["nzAnchor"], usesOnChanges: true, ngImport: i0, template: `
    @if (nzAffix) {
      <nz-affix [nzOffsetTop]="nzOffsetTop" [nzTarget]="container">
        <ng-template [ngTemplateOutlet]="content"></ng-template>
      </nz-affix>
    } @else {
      <ng-template [ngTemplateOutlet]="content"></ng-template>
    }

    <ng-template #content>
      <div
        class="ant-anchor-wrapper"
        [class]="{ 'ant-anchor-wrapper-horizontal': nzDirection === 'horizontal' }"
        [style]="wrapperStyle"
      >
        <div class="ant-anchor" [class]="{ 'ant-anchor-fixed': !nzAffix && !nzShowInkInFixed }">
          <div class="ant-anchor-ink">
            <div class="ant-anchor-ink-ball" #ink></div>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzAffixModule }, { kind: "component", type: i4.NzAffixComponent, selector: "nz-affix", inputs: ["nzTarget", "nzOffsetTop", "nzOffsetBottom"], outputs: ["nzChange"], exportAs: ["nzAffix"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-anchor',
                    exportAs: 'nzAnchor',
                    preserveWhitespaces: false,
                    imports: [NgTemplateOutlet, NzAffixModule],
                    template: `
    @if (nzAffix) {
      <nz-affix [nzOffsetTop]="nzOffsetTop" [nzTarget]="container">
        <ng-template [ngTemplateOutlet]="content"></ng-template>
      </nz-affix>
    } @else {
      <ng-template [ngTemplateOutlet]="content"></ng-template>
    }

    <ng-template #content>
      <div
        class="ant-anchor-wrapper"
        [class]="{ 'ant-anchor-wrapper-horizontal': nzDirection === 'horizontal' }"
        [style]="wrapperStyle"
      >
        <div class="ant-anchor" [class]="{ 'ant-anchor-fixed': !nzAffix && !nzShowInkInFixed }">
          <div class="ant-anchor-ink">
            <div class="ant-anchor-ink-ball" #ink></div>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </ng-template>
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i2.NzScrollService }, { type: i0.ChangeDetectorRef }, { type: i3.Platform }, { type: i0.Renderer2 }], propDecorators: { ink: [{
                type: ViewChild,
                args: ['ink', { static: false }]
            }], nzAffix: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowInkInFixed: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBounds: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzOffsetTop: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], nzTargetOffset: [{
                type: Input,
                args: [{ transform: numberAttributeWithZeroFallback }]
            }], nzContainer: [{
                type: Input
            }], nzCurrentAnchor: [{
                type: Input
            }], nzDirection: [{
                type: Input
            }], nzClick: [{
                type: Output
            }], nzChange: [{
                type: Output
            }], nzScroll: [{
                type: Output
            }] } });

class NzAnchorLinkComponent {
    elementRef;
    anchorComp;
    platform;
    renderer;
    nzHref = '#';
    nzTarget;
    titleStr = '';
    titleTpl;
    nzDirection = 'vertical';
    set nzTitle(value) {
        if (value instanceof TemplateRef) {
            this.titleStr = null;
            this.titleTpl = value;
        }
        else {
            this.titleStr = value;
        }
    }
    nzTemplate;
    linkTitle;
    constructor(elementRef, anchorComp, platform, renderer) {
        this.elementRef = elementRef;
        this.anchorComp = anchorComp;
        this.platform = platform;
        this.renderer = renderer;
    }
    ngOnInit() {
        this.anchorComp.registerLink(this);
        this.nzDirection = this.anchorComp.nzDirection;
    }
    getLinkTitleElement() {
        return this.linkTitle.nativeElement;
    }
    setActive() {
        this.renderer.addClass(this.elementRef.nativeElement, 'ant-anchor-link-active');
    }
    unsetActive() {
        this.renderer.removeClass(this.elementRef.nativeElement, 'ant-anchor-link-active');
    }
    goToClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.platform.isBrowser) {
            this.anchorComp.handleScrollTo(this);
        }
    }
    ngOnDestroy() {
        this.anchorComp.unregisterLink(this);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorLinkComponent, deps: [{ token: i0.ElementRef }, { token: NzAnchorComponent }, { token: i3.Platform }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzAnchorLinkComponent, isStandalone: true, selector: "nz-link", inputs: { nzHref: "nzHref", nzTarget: "nzTarget", nzTitle: "nzTitle" }, host: { classAttribute: "ant-anchor-link" }, queries: [{ propertyName: "nzTemplate", first: true, predicate: ["nzTemplate"], descendants: true }], viewQueries: [{ propertyName: "linkTitle", first: true, predicate: ["linkTitle"], descendants: true }], exportAs: ["nzLink"], ngImport: i0, template: `
    <a
      #linkTitle
      class="ant-anchor-link-title"
      [href]="nzHref"
      [attr.title]="titleStr"
      [target]="nzTarget"
      (click)="goToClick($event)"
    >
      @if (titleStr) {
        <span>{{ titleStr }}</span>
      } @else {
        <ng-template [ngTemplateOutlet]="titleTpl || nzTemplate" />
      }
    </a>
    @if (nzDirection === 'vertical') {
      <ng-content></ng-content>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorLinkComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-link',
                    exportAs: 'nzLink',
                    preserveWhitespaces: false,
                    imports: [NgTemplateOutlet],
                    template: `
    <a
      #linkTitle
      class="ant-anchor-link-title"
      [href]="nzHref"
      [attr.title]="titleStr"
      [target]="nzTarget"
      (click)="goToClick($event)"
    >
      @if (titleStr) {
        <span>{{ titleStr }}</span>
      } @else {
        <ng-template [ngTemplateOutlet]="titleTpl || nzTemplate" />
      }
    </a>
    @if (nzDirection === 'vertical') {
      <ng-content></ng-content>
    }
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'ant-anchor-link'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: NzAnchorComponent }, { type: i3.Platform }, { type: i0.Renderer2 }], propDecorators: { nzHref: [{
                type: Input
            }], nzTarget: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzTemplate: [{
                type: ContentChild,
                args: ['nzTemplate', { static: false }]
            }], linkTitle: [{
                type: ViewChild,
                args: ['linkTitle']
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzAnchorModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorModule, imports: [NzAnchorComponent, NzAnchorLinkComponent], exports: [NzAnchorComponent, NzAnchorLinkComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorModule, imports: [NzAnchorComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzAnchorModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [NzAnchorComponent, NzAnchorLinkComponent],
                    imports: [NzAnchorComponent, NzAnchorLinkComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzAnchorComponent, NzAnchorLinkComponent, NzAnchorModule };
//# sourceMappingURL=ng-zorro-antd-anchor.mjs.map
