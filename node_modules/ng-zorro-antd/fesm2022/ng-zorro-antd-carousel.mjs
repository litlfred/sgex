import * as i0 from '@angular/core';
import { Directive, InjectionToken, EventEmitter, inject, numberAttribute, booleanAttribute, Output, Input, ViewChild, ContentChildren, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { __esDecorate, __runInitializers } from 'tslib';
import { Directionality } from '@angular/cdk/bidi';
import { LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { NgTemplateOutlet } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i2 from '@angular/cdk/platform';
import * as i3 from 'ng-zorro-antd/core/services';
import * as i4 from 'ng-zorro-antd/cdk/resize-observer';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselContentDirective {
    renderer;
    el;
    set isActive(value) {
        this._active = value;
        if (this.isActive) {
            this.renderer.addClass(this.el, 'slick-active');
        }
        else {
            this.renderer.removeClass(this.el, 'slick-active');
        }
    }
    get isActive() {
        return this._active;
    }
    _active = false;
    constructor(elementRef, renderer) {
        this.renderer = renderer;
        this.el = elementRef.nativeElement;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselContentDirective, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzCarouselContentDirective, isStandalone: true, selector: "[nz-carousel-content]", host: { classAttribute: "slick-slide" }, exportAs: ["nzCarouselContent"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselContentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-carousel-content]',
                    exportAs: 'nzCarouselContent',
                    host: {
                        class: 'slick-slide'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselBaseStrategy {
    cdr;
    renderer;
    platform;
    options;
    // Properties that strategies may want to use.
    carouselComponent;
    contents;
    slickListEl;
    slickTrackEl;
    length;
    unitWidth;
    unitHeight;
    get maxIndex() {
        return this.length - 1;
    }
    get firstEl() {
        return this.contents[0].el;
    }
    get lastEl() {
        return this.contents[this.maxIndex].el;
    }
    constructor(carouselComponent, cdr, renderer, platform, options) {
        this.cdr = cdr;
        this.renderer = renderer;
        this.platform = platform;
        this.options = options;
        this.carouselComponent = carouselComponent;
    }
    /**
     * Initialize dragging sequences.
     *
     * @param contents
     */
    withCarouselContents(contents) {
        const carousel = this.carouselComponent;
        this.slickListEl = carousel.slickListEl;
        this.slickTrackEl = carousel.slickTrackEl;
        this.contents = contents?.toArray() || [];
        this.length = this.contents.length;
        if (this.platform.isBrowser) {
            const rect = carousel.el.getBoundingClientRect();
            this.unitWidth = rect.width;
            this.unitHeight = rect.height;
        }
        else {
            // Since we cannot call getBoundingClientRect in server, we just hide all items except for the first one.
            contents?.forEach((content, index) => {
                if (index === 0) {
                    this.renderer.setStyle(content.el, 'width', '100%');
                }
                else {
                    this.renderer.setStyle(content.el, 'display', 'none');
                }
            });
        }
    }
    /**
     * When user drag the carousel component.
     *
     * @optional
     */
    dragging(_vector) { }
    /**
     * Destroy a scroll strategy.
     */
    dispose() { }
    getFromToInBoundary(f, t) {
        const length = this.maxIndex + 1;
        return { from: (f + length) % length, to: (t + length) % length };
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselOpacityStrategy extends NzCarouselBaseStrategy {
    withCarouselContents(contents) {
        super.withCarouselContents(contents);
        if (this.contents) {
            this.slickTrackEl.style.width = `${this.length * this.unitWidth}px`;
            this.contents.forEach((content, i) => {
                this.renderer.setStyle(content.el, 'opacity', this.carouselComponent.activeIndex === i ? '1' : '0');
                this.renderer.setStyle(content.el, 'position', 'relative');
                this.renderer.setStyle(content.el, 'width', `${this.unitWidth}px`);
                this.renderer.setStyle(content.el, 'left', `${-this.unitWidth * i}px`);
                this.renderer.setStyle(content.el, 'transition', ['opacity 500ms ease 0s', 'visibility 500ms ease 0s']);
            });
        }
    }
    switch(_f, _t) {
        const { to: t } = this.getFromToInBoundary(_f, _t);
        const complete$ = new Subject();
        this.contents.forEach((content, i) => {
            this.renderer.setStyle(content.el, 'opacity', t === i ? '1' : '0');
        });
        setTimeout(() => {
            complete$.next();
            complete$.complete();
        }, this.carouselComponent.nzTransitionSpeed);
        return complete$;
    }
    dispose() {
        this.contents.forEach((content) => {
            this.renderer.setStyle(content.el, 'transition', null);
            this.renderer.setStyle(content.el, 'opacity', null);
            this.renderer.setStyle(content.el, 'width', null);
            this.renderer.setStyle(content.el, 'left', null);
        });
        super.dispose();
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselTransformStrategy extends NzCarouselBaseStrategy {
    isDragging = false;
    isTransitioning = false;
    get vertical() {
        return this.carouselComponent.vertical;
    }
    constructor(carouselComponent, cdr, renderer, platform, options) {
        super(carouselComponent, cdr, renderer, platform, options);
    }
    dispose() {
        super.dispose();
        this.renderer.setStyle(this.slickTrackEl, 'transform', null);
    }
    withCarouselContents(contents) {
        super.withCarouselContents(contents);
        const carousel = this.carouselComponent;
        const activeIndex = carousel.activeIndex;
        // We only do when we are in browser.
        if (this.platform.isBrowser && this.contents.length) {
            this.renderer.setStyle(this.slickListEl, 'height', `${this.unitHeight}px`);
            if (this.vertical) {
                this.renderer.setStyle(this.slickTrackEl, 'width', `${this.unitWidth}px`);
                this.renderer.setStyle(this.slickTrackEl, 'height', `${this.length * this.unitHeight}px`);
                this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-activeIndex * this.unitHeight}px, 0)`);
            }
            else {
                this.renderer.setStyle(this.slickTrackEl, 'height', `${this.unitHeight}px`);
                this.renderer.setStyle(this.slickTrackEl, 'width', `${this.length * this.unitWidth}px`);
                this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-activeIndex * this.unitWidth}px, 0, 0)`);
            }
            this.contents.forEach((content) => {
                this.renderer.setStyle(content.el, 'position', 'relative');
                this.renderer.setStyle(content.el, 'width', `${this.unitWidth}px`);
                this.renderer.setStyle(content.el, 'height', `${this.unitHeight}px`);
            });
        }
    }
    switch(_f, _t) {
        const { to: t } = this.getFromToInBoundary(_f, _t);
        const complete$ = new Subject();
        this.renderer.setStyle(this.slickTrackEl, 'transition', `transform ${this.carouselComponent.nzTransitionSpeed}ms ease`);
        if (this.vertical) {
            this.verticalTransform(_f, _t);
        }
        else {
            this.horizontalTransform(_f, _t);
        }
        this.isTransitioning = true;
        this.isDragging = false;
        // TODO: use transitionEnd event instead of setTimeout
        setTimeout(() => {
            this.renderer.setStyle(this.slickTrackEl, 'transition', null);
            this.contents.forEach((content) => {
                this.renderer.setStyle(content.el, this.vertical ? 'top' : 'left', null);
            });
            if (this.vertical) {
                this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-t * this.unitHeight}px, 0)`);
            }
            else {
                this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-t * this.unitWidth}px, 0, 0)`);
            }
            this.isTransitioning = false;
            complete$.next();
            complete$.complete();
        }, this.carouselComponent.nzTransitionSpeed);
        return complete$.asObservable();
    }
    dragging(_vector) {
        if (this.isTransitioning) {
            return;
        }
        const activeIndex = this.carouselComponent.activeIndex;
        if (this.carouselComponent.vertical) {
            if (!this.isDragging && this.length > 2) {
                if (activeIndex === this.maxIndex) {
                    this.prepareVerticalContext(true);
                }
                else if (activeIndex === 0) {
                    this.prepareVerticalContext(false);
                }
            }
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-activeIndex * this.unitHeight + _vector.x}px, 0)`);
        }
        else {
            if (!this.isDragging && this.length > 2) {
                if (activeIndex === this.maxIndex) {
                    this.prepareHorizontalContext(true);
                }
                else if (activeIndex === 0) {
                    this.prepareHorizontalContext(false);
                }
            }
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-activeIndex * this.unitWidth + _vector.x}px, 0, 0)`);
        }
        this.isDragging = true;
    }
    verticalTransform(_f, _t) {
        const { from: f, to: t } = this.getFromToInBoundary(_f, _t);
        const needToAdjust = this.length > 2 && _t !== t;
        if (needToAdjust) {
            this.prepareVerticalContext(t < f);
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-_t * this.unitHeight}px, 0)`);
        }
        else {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-t * this.unitHeight}px, 0`);
        }
    }
    horizontalTransform(_f, _t) {
        const { from: f, to: t } = this.getFromToInBoundary(_f, _t);
        const needToAdjust = this.length > 2 && _t !== t;
        if (needToAdjust) {
            this.prepareHorizontalContext(t < f);
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-_t * this.unitWidth}px, 0, 0)`);
        }
        else {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-t * this.unitWidth}px, 0, 0`);
        }
    }
    prepareVerticalContext(lastToFirst) {
        if (lastToFirst) {
            this.renderer.setStyle(this.firstEl, 'top', `${this.length * this.unitHeight}px`);
            this.renderer.setStyle(this.lastEl, 'top', null);
        }
        else {
            this.renderer.setStyle(this.firstEl, 'top', null);
            this.renderer.setStyle(this.lastEl, 'top', `${-this.unitHeight * this.length}px`);
        }
    }
    prepareHorizontalContext(lastToFirst) {
        if (lastToFirst) {
            this.renderer.setStyle(this.firstEl, 'left', `${this.length * this.unitWidth}px`);
            this.renderer.setStyle(this.lastEl, 'left', null);
        }
        else {
            this.renderer.setStyle(this.firstEl, 'left', null);
            this.renderer.setStyle(this.lastEl, 'left', `${-this.unitWidth * this.length}px`);
        }
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_CAROUSEL_CUSTOM_STRATEGIES = new InjectionToken('nz-carousel-custom-strategies');

const NZ_CONFIG_MODULE_NAME = 'carousel';
let NzCarouselComponent = (() => {
    let _instanceExtraInitializers = [];
    let _nzEffect_decorators;
    let _nzEffect_initializers = [];
    let _nzEffect_extraInitializers = [];
    let _nzEnableSwipe_decorators;
    let _nzEnableSwipe_initializers = [];
    let _nzEnableSwipe_extraInitializers = [];
    let _nzDots_decorators;
    let _nzDots_initializers = [];
    let _nzDots_extraInitializers = [];
    let _nzAutoPlay_decorators;
    let _nzAutoPlay_initializers = [];
    let _nzAutoPlay_extraInitializers = [];
    let _nzAutoPlaySpeed_decorators;
    let _nzAutoPlaySpeed_initializers = [];
    let _nzAutoPlaySpeed_extraInitializers = [];
    let _nzLoop_decorators;
    let _nzLoop_initializers = [];
    let _nzLoop_extraInitializers = [];
    let _set_nzDotPosition_decorators;
    return class NzCarouselComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzEffect_decorators = [WithConfig()];
            _nzEnableSwipe_decorators = [WithConfig()];
            _nzDots_decorators = [WithConfig()];
            _nzAutoPlay_decorators = [WithConfig()];
            _nzAutoPlaySpeed_decorators = [WithConfig()];
            _nzLoop_decorators = [WithConfig()];
            _set_nzDotPosition_decorators = [WithConfig()];
            __esDecorate(this, null, _set_nzDotPosition_decorators, { kind: "setter", name: "nzDotPosition", static: false, private: false, access: { has: obj => "nzDotPosition" in obj, set: (obj, value) => { obj.nzDotPosition = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _nzEffect_decorators, { kind: "field", name: "nzEffect", static: false, private: false, access: { has: obj => "nzEffect" in obj, get: obj => obj.nzEffect, set: (obj, value) => { obj.nzEffect = value; } }, metadata: _metadata }, _nzEffect_initializers, _nzEffect_extraInitializers);
            __esDecorate(null, null, _nzEnableSwipe_decorators, { kind: "field", name: "nzEnableSwipe", static: false, private: false, access: { has: obj => "nzEnableSwipe" in obj, get: obj => obj.nzEnableSwipe, set: (obj, value) => { obj.nzEnableSwipe = value; } }, metadata: _metadata }, _nzEnableSwipe_initializers, _nzEnableSwipe_extraInitializers);
            __esDecorate(null, null, _nzDots_decorators, { kind: "field", name: "nzDots", static: false, private: false, access: { has: obj => "nzDots" in obj, get: obj => obj.nzDots, set: (obj, value) => { obj.nzDots = value; } }, metadata: _metadata }, _nzDots_initializers, _nzDots_extraInitializers);
            __esDecorate(null, null, _nzAutoPlay_decorators, { kind: "field", name: "nzAutoPlay", static: false, private: false, access: { has: obj => "nzAutoPlay" in obj, get: obj => obj.nzAutoPlay, set: (obj, value) => { obj.nzAutoPlay = value; } }, metadata: _metadata }, _nzAutoPlay_initializers, _nzAutoPlay_extraInitializers);
            __esDecorate(null, null, _nzAutoPlaySpeed_decorators, { kind: "field", name: "nzAutoPlaySpeed", static: false, private: false, access: { has: obj => "nzAutoPlaySpeed" in obj, get: obj => obj.nzAutoPlaySpeed, set: (obj, value) => { obj.nzAutoPlaySpeed = value; } }, metadata: _metadata }, _nzAutoPlaySpeed_initializers, _nzAutoPlaySpeed_extraInitializers);
            __esDecorate(null, null, _nzLoop_decorators, { kind: "field", name: "nzLoop", static: false, private: false, access: { has: obj => "nzLoop" in obj, get: obj => obj.nzLoop, set: (obj, value) => { obj.nzLoop = value; } }, metadata: _metadata }, _nzLoop_initializers, _nzLoop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService = __runInitializers(this, _instanceExtraInitializers);
        ngZone;
        renderer;
        cdr;
        platform;
        resizeService;
        nzDragService;
        nzResizeObserver;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        carouselContents;
        slickList;
        slickTrack;
        nzDotRender;
        nzEffect = __runInitializers(this, _nzEffect_initializers, 'scrollx');
        nzEnableSwipe = (__runInitializers(this, _nzEffect_extraInitializers), __runInitializers(this, _nzEnableSwipe_initializers, true));
        nzDots = (__runInitializers(this, _nzEnableSwipe_extraInitializers), __runInitializers(this, _nzDots_initializers, true));
        nzAutoPlay = (__runInitializers(this, _nzDots_extraInitializers), __runInitializers(this, _nzAutoPlay_initializers, false));
        nzAutoPlaySpeed = (__runInitializers(this, _nzAutoPlay_extraInitializers), __runInitializers(this, _nzAutoPlaySpeed_initializers, 3000));
        nzTransitionSpeed = (__runInitializers(this, _nzAutoPlaySpeed_extraInitializers), 500);
        nzLoop = __runInitializers(this, _nzLoop_initializers, true);
        /**
         * this property is passed directly to an NzCarouselBaseStrategy
         */
        nzStrategyOptions = (__runInitializers(this, _nzLoop_extraInitializers), undefined);
        set nzDotPosition(value) {
            this._dotPosition = value;
            this.vertical = value === 'left' || value === 'right';
        }
        get nzDotPosition() {
            return this._dotPosition;
        }
        _dotPosition = 'bottom';
        nzBeforeChange = new EventEmitter();
        nzAfterChange = new EventEmitter();
        activeIndex = 0;
        el;
        slickListEl;
        slickTrackEl;
        strategy;
        vertical = false;
        transitionInProgress;
        dir = 'ltr';
        destroy$ = new Subject();
        gestureRect = null;
        pointerDelta = null;
        isTransiting = false;
        isDragging = false;
        directionality = inject(Directionality);
        customStrategies = inject(NZ_CAROUSEL_CUSTOM_STRATEGIES, { optional: true });
        constructor(elementRef, nzConfigService, ngZone, renderer, cdr, platform, resizeService, nzDragService, nzResizeObserver) {
            this.nzConfigService = nzConfigService;
            this.ngZone = ngZone;
            this.renderer = renderer;
            this.cdr = cdr;
            this.platform = platform;
            this.resizeService = resizeService;
            this.nzDragService = nzDragService;
            this.nzResizeObserver = nzResizeObserver;
            this.nzDotPosition = 'bottom';
            this.el = elementRef.nativeElement;
        }
        ngOnInit() {
            this.slickListEl = this.slickList.nativeElement;
            this.slickTrackEl = this.slickTrack.nativeElement;
            this.dir = this.directionality.value;
            this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.markContentActive(this.activeIndex);
                this.cdr.detectChanges();
            });
            fromEventOutsideAngular(this.slickListEl, 'keydown')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                const { keyCode } = event;
                if (keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) {
                    return;
                }
                event.preventDefault();
                this.ngZone.run(() => {
                    if (keyCode === LEFT_ARROW) {
                        this.pre();
                    }
                    else {
                        this.next();
                    }
                    this.cdr.markForCheck();
                });
            });
            this.nzResizeObserver
                .observe(this.el)
                .pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this.destroy$))
                .subscribe(() => {
                this.layout();
            });
        }
        ngAfterContentInit() {
            this.markContentActive(0);
        }
        ngAfterViewInit() {
            this.carouselContents.changes.subscribe(() => {
                this.markContentActive(0);
                this.layout();
            });
            this.resizeService
                .subscribe()
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.layout();
            });
            this.switchStrategy();
            this.markContentActive(0);
            this.layout();
            // If embedded in an entry component, it may do initial render at an inappropriate time.
            // ngZone.onStable won't do this trick
            // TODO: need to change this.
            Promise.resolve().then(() => {
                this.layout();
            });
        }
        ngOnChanges(changes) {
            const { nzEffect, nzDotPosition } = changes;
            if (nzEffect && !nzEffect.isFirstChange()) {
                this.switchStrategy();
                this.markContentActive(0);
                this.layout();
            }
            if (nzDotPosition && !nzDotPosition.isFirstChange()) {
                this.switchStrategy();
                this.markContentActive(0);
                this.layout();
            }
            if (!this.nzAutoPlay || !this.nzAutoPlaySpeed) {
                this.clearScheduledTransition();
            }
            else {
                this.scheduleNextTransition();
            }
        }
        ngOnDestroy() {
            this.clearScheduledTransition();
            if (this.strategy) {
                this.strategy.dispose();
            }
            this.destroy$.next();
            this.destroy$.complete();
        }
        next() {
            this.goTo(this.activeIndex + 1);
        }
        pre() {
            this.goTo(this.activeIndex - 1);
        }
        goTo(index) {
            if (this.carouselContents &&
                this.carouselContents.length &&
                !this.isTransiting &&
                (this.nzLoop || (index >= 0 && index < this.carouselContents.length))) {
                const length = this.carouselContents.length;
                const from = this.activeIndex;
                const to = (index + length) % length;
                this.isTransiting = true;
                this.nzBeforeChange.emit({ from, to });
                this.strategy.switch(this.activeIndex, index).subscribe(() => {
                    this.scheduleNextTransition();
                    this.nzAfterChange.emit(to);
                    this.isTransiting = false;
                });
                this.markContentActive(to);
                this.cdr.markForCheck();
            }
        }
        switchStrategy() {
            if (this.strategy) {
                this.strategy.dispose();
            }
            // Load custom strategies first.
            const customStrategy = this.customStrategies ? this.customStrategies.find(s => s.name === this.nzEffect) : null;
            if (customStrategy) {
                this.strategy = new customStrategy.strategy(this, this.cdr, this.renderer, this.platform);
                return;
            }
            this.strategy =
                this.nzEffect === 'scrollx'
                    ? new NzCarouselTransformStrategy(this, this.cdr, this.renderer, this.platform)
                    : new NzCarouselOpacityStrategy(this, this.cdr, this.renderer, this.platform);
        }
        scheduleNextTransition() {
            this.clearScheduledTransition();
            if (this.nzAutoPlay && this.nzAutoPlaySpeed > 0 && this.platform.isBrowser) {
                this.transitionInProgress = setTimeout(() => {
                    this.goTo(this.activeIndex + 1);
                }, this.nzAutoPlaySpeed);
            }
        }
        clearScheduledTransition() {
            if (this.transitionInProgress) {
                clearTimeout(this.transitionInProgress);
                this.transitionInProgress = undefined;
            }
        }
        markContentActive(index) {
            this.activeIndex = index;
            if (this.carouselContents) {
                this.carouselContents.forEach((slide, i) => {
                    slide.isActive = index === i;
                });
            }
            this.cdr.markForCheck();
        }
        /**
         * Drag carousel.
         */
        pointerDown = (event) => {
            if (!this.isDragging && !this.isTransiting && this.nzEnableSwipe) {
                this.clearScheduledTransition();
                this.gestureRect = this.slickListEl.getBoundingClientRect();
                this.nzDragService.requestDraggingSequence(event).subscribe(delta => {
                    this.pointerDelta = delta;
                    this.isDragging = true;
                    this.strategy?.dragging(this.pointerDelta);
                }, () => { }, () => {
                    if (this.nzEnableSwipe && this.isDragging) {
                        const xDelta = this.pointerDelta ? this.pointerDelta.x : 0;
                        // Switch to another slide if delta is bigger than third of the width.
                        if (Math.abs(xDelta) > this.gestureRect.width / 3 &&
                            (this.nzLoop ||
                                (xDelta <= 0 && this.activeIndex + 1 < this.carouselContents.length) ||
                                (xDelta > 0 && this.activeIndex > 0))) {
                            this.goTo(xDelta > 0 ? this.activeIndex - 1 : this.activeIndex + 1);
                        }
                        else {
                            this.goTo(this.activeIndex);
                        }
                        this.gestureRect = null;
                        this.pointerDelta = null;
                    }
                    this.isDragging = false;
                });
            }
        };
        layout() {
            if (this.strategy) {
                this.strategy.withCarouselContents(this.carouselContents);
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselComponent, deps: [{ token: i0.ElementRef }, { token: i1.NzConfigService }, { token: i0.NgZone }, { token: i0.Renderer2 }, { token: i0.ChangeDetectorRef }, { token: i2.Platform }, { token: i3.NzResizeService }, { token: i3.NzDragService }, { token: i4.NzResizeObserver }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCarouselComponent, isStandalone: true, selector: "nz-carousel", inputs: { nzDotRender: "nzDotRender", nzEffect: "nzEffect", nzEnableSwipe: ["nzEnableSwipe", "nzEnableSwipe", booleanAttribute], nzDots: ["nzDots", "nzDots", booleanAttribute], nzAutoPlay: ["nzAutoPlay", "nzAutoPlay", booleanAttribute], nzAutoPlaySpeed: ["nzAutoPlaySpeed", "nzAutoPlaySpeed", numberAttribute], nzTransitionSpeed: ["nzTransitionSpeed", "nzTransitionSpeed", numberAttribute], nzLoop: "nzLoop", nzStrategyOptions: "nzStrategyOptions", nzDotPosition: "nzDotPosition" }, outputs: { nzBeforeChange: "nzBeforeChange", nzAfterChange: "nzAfterChange" }, host: { properties: { "class.ant-carousel-vertical": "vertical", "class.ant-carousel-rtl": "dir === 'rtl'" }, classAttribute: "ant-carousel" }, queries: [{ propertyName: "carouselContents", predicate: NzCarouselContentDirective }], viewQueries: [{ propertyName: "slickList", first: true, predicate: ["slickList"], descendants: true, static: true }, { propertyName: "slickTrack", first: true, predicate: ["slickTrack"], descendants: true, static: true }], exportAs: ["nzCarousel"], usesOnChanges: true, ngImport: i0, template: `
    <div
      class="slick-initialized slick-slider"
      [class.slick-vertical]="nzDotPosition === 'left' || nzDotPosition === 'right'"
      [dir]="'ltr'"
    >
      <div
        #slickList
        class="slick-list"
        tabindex="-1"
        (mousedown)="pointerDown($event)"
        (touchstart)="pointerDown($event)"
      >
        <!-- Render carousel items. -->
        <div class="slick-track" #slickTrack>
          <ng-content></ng-content>
        </div>
      </div>
      <!-- Render dots. -->
      @if (nzDots) {
        <ul
          class="slick-dots"
          [class.slick-dots-top]="nzDotPosition === 'top'"
          [class.slick-dots-bottom]="nzDotPosition === 'bottom'"
          [class.slick-dots-left]="nzDotPosition === 'left'"
          [class.slick-dots-right]="nzDotPosition === 'right'"
        >
          @for (content of carouselContents; track content) {
            <li [class.slick-active]="$index === activeIndex" (click)="goTo($index)">
              <ng-template
                [ngTemplateOutlet]="nzDotRender || renderDotTemplate"
                [ngTemplateOutletContext]="{ $implicit: $index }"
              ></ng-template>
            </li>
          }
        </ul>
      }
    </div>

    <ng-template #renderDotTemplate let-index>
      <button>{{ index + 1 }}</button>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-carousel',
                    exportAs: 'nzCarousel',
                    preserveWhitespaces: false,
                    template: `
    <div
      class="slick-initialized slick-slider"
      [class.slick-vertical]="nzDotPosition === 'left' || nzDotPosition === 'right'"
      [dir]="'ltr'"
    >
      <div
        #slickList
        class="slick-list"
        tabindex="-1"
        (mousedown)="pointerDown($event)"
        (touchstart)="pointerDown($event)"
      >
        <!-- Render carousel items. -->
        <div class="slick-track" #slickTrack>
          <ng-content></ng-content>
        </div>
      </div>
      <!-- Render dots. -->
      @if (nzDots) {
        <ul
          class="slick-dots"
          [class.slick-dots-top]="nzDotPosition === 'top'"
          [class.slick-dots-bottom]="nzDotPosition === 'bottom'"
          [class.slick-dots-left]="nzDotPosition === 'left'"
          [class.slick-dots-right]="nzDotPosition === 'right'"
        >
          @for (content of carouselContents; track content) {
            <li [class.slick-active]="$index === activeIndex" (click)="goTo($index)">
              <ng-template
                [ngTemplateOutlet]="nzDotRender || renderDotTemplate"
                [ngTemplateOutletContext]="{ $implicit: $index }"
              ></ng-template>
            </li>
          }
        </ul>
      }
    </div>

    <ng-template #renderDotTemplate let-index>
      <button>{{ index + 1 }}</button>
    </ng-template>
  `,
                    host: {
                        class: 'ant-carousel',
                        '[class.ant-carousel-vertical]': 'vertical',
                        '[class.ant-carousel-rtl]': `dir === 'rtl'`
                    },
                    imports: [NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NzConfigService }, { type: i0.NgZone }, { type: i0.Renderer2 }, { type: i0.ChangeDetectorRef }, { type: i2.Platform }, { type: i3.NzResizeService }, { type: i3.NzDragService }, { type: i4.NzResizeObserver }], propDecorators: { carouselContents: [{
                type: ContentChildren,
                args: [NzCarouselContentDirective]
            }], slickList: [{
                type: ViewChild,
                args: ['slickList', { static: true }]
            }], slickTrack: [{
                type: ViewChild,
                args: ['slickTrack', { static: true }]
            }], nzDotRender: [{
                type: Input
            }], nzEffect: [{
                type: Input
            }], nzEnableSwipe: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDots: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoPlay: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoPlaySpeed: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzTransitionSpeed: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzLoop: [{
                type: Input
            }], nzStrategyOptions: [{
                type: Input
            }], nzDotPosition: [{
                type: Input
            }], nzBeforeChange: [{
                type: Output
            }], nzAfterChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselModule, imports: [NzCarouselComponent, NzCarouselContentDirective], exports: [NzCarouselComponent, NzCarouselContentDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCarouselModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCarouselComponent, NzCarouselContentDirective],
                    exports: [NzCarouselComponent, NzCarouselContentDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * this strategy is very much like NzCarouselTransformStrategy, but it doesn't loop between the first and the last one
 */
class NzCarouselTransformNoLoopStrategy extends NzCarouselBaseStrategy {
    isTransitioning = false;
    get vertical() {
        return this.carouselComponent.vertical;
    }
    constructor(carouselComponent, cdr, renderer, platform, options) {
        super(carouselComponent, cdr, renderer, platform, options);
    }
    dispose() {
        this.renderer.setStyle(this.slickTrackEl, 'transform', null);
        super.dispose();
    }
    withCarouselContents(contents) {
        super.withCarouselContents(contents);
        const carousel = this.carouselComponent;
        const activeIndex = carousel.activeIndex;
        if (this.platform.isBrowser && this.contents.length) {
            this.renderer.setStyle(this.slickListEl, 'height', `${this.unitHeight}px`);
            if (this.platform.isBrowser && this.contents.length) {
                this.renderer.setStyle(this.slickListEl, 'height', `${this.unitHeight}px`);
                if (this.vertical) {
                    this.renderer.setStyle(this.slickTrackEl, 'width', `${this.unitWidth}px`);
                    this.renderer.setStyle(this.slickTrackEl, 'height', `${this.length * this.unitHeight}px`);
                    this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-activeIndex * this.unitHeight}px, 0)`);
                }
                else {
                    this.renderer.setStyle(this.slickTrackEl, 'height', `${this.unitHeight}px`);
                    this.renderer.setStyle(this.slickTrackEl, 'width', `${this.length * this.unitWidth}px`);
                    this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-activeIndex * this.unitWidth}px, 0, 0)`);
                }
                this.contents.forEach((content) => {
                    this.renderer.setStyle(content.el, 'position', 'relative');
                    this.renderer.setStyle(content.el, 'width', `${this.unitWidth}px`);
                    this.renderer.setStyle(content.el, 'height', `${this.unitHeight}px`);
                });
            }
        }
    }
    switch(_f, _t) {
        const to = (_t + this.length) % this.length;
        const transitionSpeed = this.carouselComponent.nzTransitionSpeed;
        const complete$ = new Subject();
        this.renderer.setStyle(this.slickTrackEl, 'transition', `transform ${transitionSpeed}ms ease`);
        if (this.vertical) {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-to * this.unitHeight}px, 0)`);
        }
        else {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-to * this.unitWidth}px, 0, 0)`);
        }
        this.isTransitioning = true;
        setTimeout(() => {
            // this strategy don't need to do a following adjust
            this.isTransitioning = false;
            complete$.next();
            complete$.complete();
        }, transitionSpeed);
        return complete$.asObservable();
    }
    dragging(vector) {
        if (this.isTransitioning) {
            return;
        }
        const activeIndex = this.carouselComponent.activeIndex;
        if (this.vertical) {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(0, ${-activeIndex * this.unitHeight + vector.x}px, 0)`);
        }
        else {
            this.renderer.setStyle(this.slickTrackEl, 'transform', `translate3d(${-activeIndex * this.unitWidth + vector.x}px, 0, 0)`);
        }
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCarouselFlipStrategy extends NzCarouselBaseStrategy {
    withCarouselContents(contents) {
        super.withCarouselContents(contents);
        if (this.contents) {
            this.renderer.setStyle(this.slickListEl, 'width', `${this.unitWidth}px`);
            this.renderer.setStyle(this.slickTrackEl, 'width', `${this.length * this.unitWidth}px`);
            this.contents.forEach((content, i) => {
                const cur = this.carouselComponent.activeIndex === i;
                this.renderer.setStyle(content.el, 'transform', cur ? 'rotateY(0deg)' : 'rotateY(180deg)');
                this.renderer.setStyle(content.el, 'position', 'relative');
                this.renderer.setStyle(content.el, 'width', `${this.unitWidth}px`);
                this.renderer.setStyle(content.el, 'left', `${-this.unitWidth * i}px`);
                this.renderer.setStyle(content.el, 'transform-style', 'preserve-3d');
                this.renderer.setStyle(content.el, 'backface-visibility', 'hidden');
            });
            const { carouselComponent } = this;
            carouselComponent.ngZone.runOutsideAngular(() => {
                timer(carouselComponent.nzTransitionSpeed).subscribe(() => {
                    this.contents.forEach(c => this.renderer.setStyle(c.el, 'transition', ['transform 500ms ease 0s']));
                });
            });
        }
    }
    switch(rawF, rawT) {
        const { from, to } = this.getFromToInBoundary(rawF, rawT);
        const complete$ = new Subject();
        const speed = this.carouselComponent.nzTransitionSpeed;
        timer(speed).subscribe(() => {
            complete$.next();
            complete$.complete();
        });
        if (rawF === rawT) {
            return complete$;
        }
        this.contents.forEach((content, i) => {
            if (i === from) {
                this.renderer.setStyle(content.el, 'transform', 'rotateY(180deg)');
            }
            else if (i === to) {
                this.renderer.setStyle(content.el, 'transform', 'rotateY(0deg)');
            }
        });
        return complete$.asObservable();
    }
    dispose() {
        this.contents.forEach((content) => {
            this.renderer.setStyle(content.el, 'transition', null);
            this.renderer.setStyle(content.el, 'transform', null);
            this.renderer.setStyle(content.el, 'width', null);
            this.renderer.setStyle(content.el, 'left', null);
            this.renderer.setStyle(content.el, 'transform-style', null);
            this.renderer.setStyle(content.el, 'backface-visibility', null);
        });
        super.dispose();
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NZ_CAROUSEL_CUSTOM_STRATEGIES, NzCarouselBaseStrategy, NzCarouselComponent, NzCarouselContentDirective, NzCarouselFlipStrategy, NzCarouselModule, NzCarouselOpacityStrategy, NzCarouselTransformNoLoopStrategy, NzCarouselTransformStrategy };
//# sourceMappingURL=ng-zorro-antd-carousel.mjs.map
