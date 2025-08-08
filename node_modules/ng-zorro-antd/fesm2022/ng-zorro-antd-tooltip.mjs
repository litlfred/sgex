import * as i1 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import * as i0 from '@angular/core';
import { EventEmitter, inject, ElementRef, ViewContainerRef, Renderer2, PLATFORM_ID, Directive, ChangeDetectorRef, ViewChild, TemplateRef, booleanAttribute, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { isPresetColor } from 'ng-zorro-antd/core/color';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i2 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i3 from 'ng-zorro-antd/core/overlay';
import { POSITION_MAP, DEFAULT_TOOLTIP_POSITIONS, getPlacementName, NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { Directionality } from '@angular/cdk/bidi';
import { _getEventTarget } from '@angular/cdk/platform';
import { isPlatformBrowser } from '@angular/common';
import { Subject, asapScheduler } from 'rxjs';
import { distinctUntilChanged, takeUntil, filter, delay } from 'rxjs/operators';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { toBoolean, isNotNil } from 'ng-zorro-antd/core/util';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTooltipBaseDirective {
    componentType;
    config;
    cdkConnectedOverlayPush;
    visibleChange = new EventEmitter();
    /**
     * This true title that would be used in other parts on this component.
     */
    get _title() {
        return this.title || this.directiveTitle || null;
    }
    get _content() {
        return this.content || this.directiveContent || null;
    }
    get _trigger() {
        return typeof this.trigger !== 'undefined' ? this.trigger : 'hover';
    }
    get _placement() {
        const p = this.placement;
        return Array.isArray(p) && p.length > 0 ? p : typeof p === 'string' && p ? [p] : ['top'];
    }
    get _visible() {
        return (typeof this.visible !== 'undefined' ? this.visible : this.internalVisible) || false;
    }
    get _mouseEnterDelay() {
        return this.mouseEnterDelay || 0.15;
    }
    get _mouseLeaveDelay() {
        return this.mouseLeaveDelay || 0.1;
    }
    get _overlayClassName() {
        return this.overlayClassName || null;
    }
    get _overlayStyle() {
        return this.overlayStyle || null;
    }
    get _overlayClickable() {
        return this.overlayClickable ?? true;
    }
    internalVisible = false;
    getProxyPropertyMap() {
        return {
            noAnimation: ['noAnimation', () => !!this.noAnimation]
        };
    }
    component;
    destroy$ = new Subject();
    triggerDisposables = [];
    delayTimer;
    elementRef = inject(ElementRef);
    hostView = inject(ViewContainerRef);
    renderer = inject(Renderer2);
    noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
    nzConfigService = inject(NzConfigService);
    platformId = inject(PLATFORM_ID);
    constructor(componentType) {
        this.componentType = componentType;
    }
    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.createComponent();
            this.registerTriggers();
        }
    }
    ngOnChanges(changes) {
        const { trigger } = changes;
        if (trigger && !trigger.isFirstChange()) {
            this.registerTriggers();
        }
        if (this.component) {
            this.updatePropertiesByChanges(changes);
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        // Clear toggling timer. Issue #3875 #4317 #4386
        this.clearTogglingTimer();
        this.removeTriggerListeners();
    }
    show() {
        this.component?.show();
    }
    hide() {
        this.component?.hide();
    }
    /**
     * Force the component to update its position.
     */
    updatePosition() {
        if (this.component) {
            this.component.updatePosition();
        }
    }
    /**
     * Create a dynamic tooltip component. This method can be override.
     */
    createComponent() {
        const componentRef = this.hostView.createComponent(this.componentType);
        this.component = componentRef.instance;
        // Remove the component's DOM because it should be in the overlay container.
        this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), componentRef.location.nativeElement);
        this.component.setOverlayOrigin(this.origin || this.elementRef);
        this.initProperties();
        const ngVisibleChange$ = this.component.nzVisibleChange.pipe(distinctUntilChanged());
        ngVisibleChange$.pipe(takeUntil(this.destroy$)).subscribe((visible) => {
            this.internalVisible = visible;
            this.visibleChange.emit(visible);
        });
        // In some cases, the rendering takes into account the height at which the `arrow` is in wrong place,
        // so `cdk` sets the container position incorrectly.
        // To avoid this, after placing the `arrow` in the correct position, we should `re-calculate` the position of the `overlay`.
        ngVisibleChange$
            .pipe(filter((visible) => visible), delay(0, asapScheduler), filter(() => Boolean(this.component?.overlay?.overlayRef)), takeUntil(this.destroy$))
            .subscribe(() => {
            this.component?.updatePosition();
        });
    }
    registerTriggers() {
        // When the method gets invoked, all properties has been synced to the dynamic component.
        // After removing the old API, we can just check the directive's own `nzTrigger`.
        const el = this.elementRef.nativeElement;
        const trigger = this.trigger;
        this.removeTriggerListeners();
        if (trigger === 'hover') {
            let overlayElement;
            this.triggerDisposables.push(this.renderer.listen(el, 'mouseenter', () => {
                this.delayEnterLeave(true, true, this._mouseEnterDelay);
            }));
            this.triggerDisposables.push(this.renderer.listen(el, 'mouseleave', () => {
                this.delayEnterLeave(true, false, this._mouseLeaveDelay);
                if (this.component?.overlay.overlayRef && !overlayElement) {
                    overlayElement = this.component.overlay.overlayRef.overlayElement;
                    this.triggerDisposables.push(this.renderer.listen(overlayElement, 'mouseenter', () => {
                        this.delayEnterLeave(false, true, this._mouseEnterDelay);
                    }));
                    this.triggerDisposables.push(this.renderer.listen(overlayElement, 'mouseleave', () => {
                        this.delayEnterLeave(false, false, this._mouseLeaveDelay);
                    }));
                }
            }));
        }
        else if (trigger === 'focus') {
            this.triggerDisposables.push(this.renderer.listen(el, 'focusin', () => this.show()));
            this.triggerDisposables.push(this.renderer.listen(el, 'focusout', () => this.hide()));
        }
        else if (trigger === 'click') {
            this.triggerDisposables.push(this.renderer.listen(el, 'click', (e) => {
                e.preventDefault();
                this.show();
            }));
        }
        // Else do nothing because user wants to control the visibility programmatically.
    }
    updatePropertiesByChanges(changes) {
        this.updatePropertiesByKeys(Object.keys(changes));
    }
    updatePropertiesByKeys(keys) {
        const mappingProperties = {
            // common mappings
            title: ['nzTitle', () => this._title],
            directiveTitle: ['nzTitle', () => this._title],
            content: ['nzContent', () => this._content],
            directiveContent: ['nzContent', () => this._content],
            trigger: ['nzTrigger', () => this._trigger],
            placement: ['nzPlacement', () => this._placement],
            visible: ['nzVisible', () => this._visible],
            mouseEnterDelay: ['nzMouseEnterDelay', () => this._mouseEnterDelay],
            mouseLeaveDelay: ['nzMouseLeaveDelay', () => this._mouseLeaveDelay],
            overlayClassName: ['nzOverlayClassName', () => this._overlayClassName],
            overlayStyle: ['nzOverlayStyle', () => this._overlayStyle],
            overlayClickable: ['nzOverlayClickable', () => this._overlayClickable],
            arrowPointAtCenter: ['nzArrowPointAtCenter', () => this.arrowPointAtCenter],
            cdkConnectedOverlayPush: ['cdkConnectedOverlayPush', () => this.cdkConnectedOverlayPush],
            ...this.getProxyPropertyMap()
        };
        (keys || Object.keys(mappingProperties).filter(key => !key.startsWith('directive'))).forEach((property) => {
            if (mappingProperties[property]) {
                const [name, valueFn] = mappingProperties[property];
                this.updateComponentValue(name, valueFn());
            }
        });
        this.component?.updateByDirective();
    }
    initProperties() {
        this.updatePropertiesByKeys();
    }
    updateComponentValue(key, value) {
        if (typeof value !== 'undefined') {
            // @ts-ignore
            this.component[key] = value;
        }
    }
    delayEnterLeave(isOrigin, isEnter, delay = -1) {
        if (this.delayTimer) {
            this.clearTogglingTimer();
        }
        else if (delay > 0) {
            this.delayTimer = setTimeout(() => {
                this.delayTimer = undefined;
                isEnter ? this.show() : this.hide();
            }, delay * 1000);
        }
        else {
            // `isOrigin` is used due to the tooltip will not hide immediately
            // (may caused by the fade-out animation).
            isEnter && isOrigin ? this.show() : this.hide();
        }
    }
    removeTriggerListeners() {
        this.triggerDisposables.forEach(dispose => dispose());
        this.triggerDisposables.length = 0;
    }
    clearTogglingTimer() {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = undefined;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipBaseDirective, deps: [{ token: i0.Type }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTooltipBaseDirective, isStandalone: true, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipBaseDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.Type }] });
class NzTooltipBaseComponent {
    overlay;
    noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
    cdr = inject(ChangeDetectorRef);
    directionality = inject(Directionality);
    nzTitle = null;
    nzContent = null;
    nzArrowPointAtCenter = false;
    nzOverlayClassName;
    nzOverlayStyle = {};
    nzOverlayClickable = true;
    nzBackdrop = false;
    nzMouseEnterDelay;
    nzMouseLeaveDelay;
    cdkConnectedOverlayPush = true;
    nzVisibleChange = new Subject();
    set nzVisible(value) {
        const visible = toBoolean(value);
        if (this._visible !== visible) {
            this._visible = visible;
            this.nzVisibleChange.next(visible);
        }
    }
    get nzVisible() {
        return this._visible;
    }
    _visible = false;
    set nzTrigger(value) {
        this._trigger = value;
    }
    get nzTrigger() {
        return this._trigger;
    }
    _trigger = 'hover';
    set nzPlacement(value) {
        const preferredPosition = value.map(placement => POSITION_MAP[placement]);
        this._positions = [...preferredPosition, ...DEFAULT_TOOLTIP_POSITIONS];
    }
    preferredPlacement = 'top';
    origin;
    dir = 'ltr';
    _classMap = {};
    _prefix = 'ant-tooltip';
    _positions = [...DEFAULT_TOOLTIP_POSITIONS];
    destroy$ = new Subject();
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnDestroy() {
        this.nzVisibleChange.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }
    show() {
        if (this.nzVisible) {
            return;
        }
        if (!this.isEmpty()) {
            this.nzVisible = true;
            this.nzVisibleChange.next(true);
            this.cdr.detectChanges();
        }
        // for ltr for overlay to display tooltip in correct placement in rtl direction.
        if (this.origin && this.overlay && this.overlay.overlayRef && this.overlay.overlayRef.getDirection() === 'rtl') {
            this.overlay.overlayRef.setDirection('ltr');
        }
    }
    hide() {
        if (!this.nzVisible) {
            return;
        }
        this.nzVisible = false;
        this.nzVisibleChange.next(false);
        this.cdr.detectChanges();
    }
    updateByDirective() {
        this.updateStyles();
        this.cdr.detectChanges();
        Promise.resolve().then(() => {
            this.updatePosition();
            this.updateVisibilityByTitle();
        });
    }
    /**
     * Force the component to update its position.
     */
    updatePosition() {
        if (this.origin && this.overlay && this.overlay.overlayRef) {
            this.overlay.overlayRef.updatePosition();
        }
    }
    onPositionChange(position) {
        this.preferredPlacement = getPlacementName(position);
        this.updateStyles();
        // We have to trigger immediate change detection or the element would blink.
        this.cdr.detectChanges();
    }
    setOverlayOrigin(origin) {
        this.origin = origin;
        this.cdr.markForCheck();
    }
    onClickOutside(event) {
        if (!this.nzOverlayClickable) {
            return;
        }
        const target = _getEventTarget(event);
        if (!this.origin.nativeElement.contains(target) && this.nzTrigger !== null) {
            this.hide();
        }
    }
    /**
     * Hide the component while the content is empty.
     */
    updateVisibilityByTitle() {
        if (this.isEmpty()) {
            this.hide();
        }
    }
    updateStyles() {
        this._classMap = {
            ...this.transformClassListToMap(this.nzOverlayClassName),
            [`${this._prefix}-placement-${this.preferredPlacement}`]: true
        };
    }
    transformClassListToMap(klass) {
        const result = {};
        /**
         * @see https://github.com/angular/angular/blob/f6e97763cfab9fa2bea6e6b1303b64f1b499c3ef/packages/common/src/directives/ng_class.ts#L92
         */
        const classes = klass !== null ? klass.split(/\s+/) : [];
        classes.forEach(className => (result[className] = true));
        return result;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipBaseComponent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTooltipBaseComponent, isStandalone: true, viewQueries: [{ propertyName: "overlay", first: true, predicate: ["overlay"], descendants: true }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipBaseComponent, decorators: [{
            type: Directive
        }], propDecorators: { overlay: [{
                type: ViewChild,
                args: ['overlay', { static: false }]
            }] } });
function isTooltipEmpty(value) {
    return value instanceof TemplateRef ? false : value === '' || !isNotNil(value);
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTooltipDirective extends NzTooltipBaseDirective {
    /* eslint-disable @angular-eslint/no-input-rename, @angular-eslint/no-output-rename */
    title;
    titleContext = null;
    directiveTitle;
    trigger = 'hover';
    placement = 'top';
    origin;
    visible;
    mouseEnterDelay;
    mouseLeaveDelay;
    overlayClassName;
    overlayStyle;
    arrowPointAtCenter;
    cdkConnectedOverlayPush = true;
    nzTooltipColor;
    directiveContent = null;
    content = null;
    overlayClickable;
    visibleChange = new EventEmitter();
    constructor() {
        super(NzToolTipComponent);
    }
    getProxyPropertyMap() {
        return {
            ...super.getProxyPropertyMap(),
            nzTooltipColor: ['nzColor', () => this.nzTooltipColor],
            titleContext: ['nzTitleContext', () => this.titleContext]
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzTooltipDirective, isStandalone: true, selector: "[nz-tooltip]", inputs: { title: ["nzTooltipTitle", "title"], titleContext: ["nzTooltipTitleContext", "titleContext"], directiveTitle: ["nz-tooltip", "directiveTitle"], trigger: ["nzTooltipTrigger", "trigger"], placement: ["nzTooltipPlacement", "placement"], origin: ["nzTooltipOrigin", "origin"], visible: ["nzTooltipVisible", "visible"], mouseEnterDelay: ["nzTooltipMouseEnterDelay", "mouseEnterDelay"], mouseLeaveDelay: ["nzTooltipMouseLeaveDelay", "mouseLeaveDelay"], overlayClassName: ["nzTooltipOverlayClassName", "overlayClassName"], overlayStyle: ["nzTooltipOverlayStyle", "overlayStyle"], arrowPointAtCenter: ["nzTooltipArrowPointAtCenter", "arrowPointAtCenter", booleanAttribute], cdkConnectedOverlayPush: ["cdkConnectedOverlayPush", "cdkConnectedOverlayPush", booleanAttribute], nzTooltipColor: "nzTooltipColor" }, outputs: { visibleChange: "nzTooltipVisibleChange" }, host: { properties: { "class.ant-tooltip-open": "visible" } }, exportAs: ["nzTooltip"], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTooltipDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-tooltip]',
                    exportAs: 'nzTooltip',
                    host: {
                        '[class.ant-tooltip-open]': 'visible'
                    }
                }]
        }], ctorParameters: () => [], propDecorators: { title: [{
                type: Input,
                args: ['nzTooltipTitle']
            }], titleContext: [{
                type: Input,
                args: ['nzTooltipTitleContext']
            }], directiveTitle: [{
                type: Input,
                args: ['nz-tooltip']
            }], trigger: [{
                type: Input,
                args: ['nzTooltipTrigger']
            }], placement: [{
                type: Input,
                args: ['nzTooltipPlacement']
            }], origin: [{
                type: Input,
                args: ['nzTooltipOrigin']
            }], visible: [{
                type: Input,
                args: ['nzTooltipVisible']
            }], mouseEnterDelay: [{
                type: Input,
                args: ['nzTooltipMouseEnterDelay']
            }], mouseLeaveDelay: [{
                type: Input,
                args: ['nzTooltipMouseLeaveDelay']
            }], overlayClassName: [{
                type: Input,
                args: ['nzTooltipOverlayClassName']
            }], overlayStyle: [{
                type: Input,
                args: ['nzTooltipOverlayStyle']
            }], arrowPointAtCenter: [{
                type: Input,
                args: [{ alias: 'nzTooltipArrowPointAtCenter', transform: booleanAttribute }]
            }], cdkConnectedOverlayPush: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzTooltipColor: [{
                type: Input
            }], visibleChange: [{
                type: Output,
                args: ['nzTooltipVisibleChange']
            }] } });
class NzToolTipComponent extends NzTooltipBaseComponent {
    nzTitle = null;
    nzTitleContext = null;
    nzColor;
    _contentStyleMap = {};
    isEmpty() {
        return isTooltipEmpty(this.nzTitle);
    }
    updateStyles() {
        const isColorPreset = this.nzColor && isPresetColor(this.nzColor);
        this._classMap = {
            ...this.transformClassListToMap(this.nzOverlayClassName),
            [`${this._prefix}-placement-${this.preferredPlacement}`]: true,
            [`${this._prefix}-${this.nzColor}`]: isColorPreset
        };
        this._contentStyleMap = {
            backgroundColor: !!this.nzColor && !isColorPreset ? this.nzColor : null,
            '--antd-arrow-background-color': this.nzColor
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzToolTipComponent, isStandalone: true, selector: "nz-tooltip", exportAs: ["nzTooltipComponent"], usesInheritance: true, ngImport: i0, template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-tooltip"
        [class.ant-tooltip-rtl]="dir === 'rtl'"
        [class]="_classMap"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-tooltip-content">
          <div class="ant-tooltip-arrow">
            <span class="ant-tooltip-arrow-content" [style]="_contentStyleMap"></span>
          </div>
          <div class="ant-tooltip-inner" [style]="_contentStyleMap">
            <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">{{ nzTitle }}</ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i2.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i3.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }], animations: [zoomBigMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tooltip',
                    exportAs: 'nzTooltipComponent',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    animations: [zoomBigMotion],
                    template: `
    <ng-template
      #overlay="cdkConnectedOverlay"
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="_visible"
      [cdkConnectedOverlayPositions]="_positions"
      [cdkConnectedOverlayPush]="cdkConnectedOverlayPush"
      [nzArrowPointAtCenter]="nzArrowPointAtCenter"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="hide()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-tooltip"
        [class.ant-tooltip-rtl]="dir === 'rtl'"
        [class]="_classMap"
        [style]="nzOverlayStyle"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        [@zoomBigMotion]="'active'"
      >
        <div class="ant-tooltip-content">
          <div class="ant-tooltip-arrow">
            <span class="ant-tooltip-arrow-content" [style]="_contentStyleMap"></span>
          </div>
          <div class="ant-tooltip-inner" [style]="_contentStyleMap">
            <ng-container *nzStringTemplateOutlet="nzTitle; context: nzTitleContext">{{ nzTitle }}</ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `,
                    preserveWhitespaces: false,
                    imports: [OverlayModule, NzNoAnimationDirective, NzOutletModule, NzOverlayModule]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzToolTipModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipModule, imports: [NzToolTipComponent, NzTooltipDirective], exports: [NzToolTipComponent, NzTooltipDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipModule, imports: [NzToolTipComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzToolTipModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzToolTipComponent, NzTooltipDirective],
                    exports: [NzToolTipComponent, NzTooltipDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzToolTipComponent, NzToolTipModule, NzTooltipBaseComponent, NzTooltipBaseDirective, NzTooltipDirective, isTooltipEmpty };
//# sourceMappingURL=ng-zorro-antd-tooltip.mjs.map
