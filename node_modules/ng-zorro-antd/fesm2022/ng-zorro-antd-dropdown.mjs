import { __esDecorate, __runInitializers } from 'tslib';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import * as i1$2 from '@angular/cdk/overlay';
import { Overlay, ConnectionPositionPair } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { inject, ElementRef, EventEmitter, booleanAttribute, Output, Input, Directive, NgModule, TemplateRef, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, Component, Injectable } from '@angular/core';
import { Subject, BehaviorSubject, merge, fromEvent, EMPTY, combineLatest, Subscription } from 'rxjs';
import { map, switchMap, filter, auditTime, distinctUntilChanged, takeUntil, first } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import { POSITION_MAP } from 'ng-zorro-antd/core/overlay';
import * as i2 from '@angular/cdk/platform';
import { MenuService, NzIsMenuInsideDropDownToken, NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonGroupComponent } from 'ng-zorro-antd/button';
import { slideMotion } from 'ng-zorro-antd/core/animation';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i1$1 from '@angular/cdk/bidi';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';

const NZ_CONFIG_MODULE_NAME = 'dropDown';
const listOfPositions = [
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.topRight,
    POSITION_MAP.topLeft
];
let NzDropDownDirective = (() => {
    let _nzBackdrop_decorators;
    let _nzBackdrop_initializers = [];
    let _nzBackdrop_extraInitializers = [];
    return class NzDropDownDirective {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzBackdrop_decorators = [WithConfig()];
            __esDecorate(null, null, _nzBackdrop_decorators, { kind: "field", name: "nzBackdrop", static: false, private: false, access: { has: obj => "nzBackdrop" in obj, get: obj => obj.nzBackdrop, set: (obj, value) => { obj.nzBackdrop = value; } }, metadata: _metadata }, _nzBackdrop_initializers, _nzBackdrop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        renderer;
        viewContainerRef;
        platform;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        elementRef = inject(ElementRef);
        overlay = inject(Overlay);
        portal;
        overlayRef = null;
        destroy$ = new Subject();
        positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef.nativeElement)
            .withLockedPosition()
            .withTransformOriginOn('.ant-dropdown');
        inputVisible$ = new BehaviorSubject(false);
        nzTrigger$ = new BehaviorSubject('hover');
        overlayClose$ = new Subject();
        nzDropdownMenu = null;
        nzTrigger = 'hover';
        nzMatchWidthElement = null;
        nzBackdrop = __runInitializers(this, _nzBackdrop_initializers, false);
        nzClickHide = (__runInitializers(this, _nzBackdrop_extraInitializers), true);
        nzDisabled = false;
        nzVisible = false;
        nzOverlayClassName = '';
        nzOverlayStyle = {};
        nzPlacement = 'bottomLeft';
        nzVisibleChange = new EventEmitter();
        setDropdownMenuValue(key, value) {
            if (this.nzDropdownMenu) {
                this.nzDropdownMenu.setValue(key, value);
            }
        }
        constructor(nzConfigService, renderer, viewContainerRef, platform) {
            this.nzConfigService = nzConfigService;
            this.renderer = renderer;
            this.viewContainerRef = viewContainerRef;
            this.platform = platform;
        }
        ngAfterViewInit() {
            if (this.nzDropdownMenu) {
                const nativeElement = this.elementRef.nativeElement;
                /** host mouse state **/
                const hostMouseState$ = merge(fromEvent(nativeElement, 'mouseenter').pipe(map(() => true)), fromEvent(nativeElement, 'mouseleave').pipe(map(() => false)));
                /** menu mouse state **/
                const menuMouseState$ = this.nzDropdownMenu.mouseState$;
                /** merged mouse state **/
                const mergedMouseState$ = merge(menuMouseState$, hostMouseState$);
                /** host click state **/
                const hostClickState$ = fromEvent(nativeElement, 'click').pipe(map(() => !this.nzVisible));
                /** visible state switch by nzTrigger **/
                const visibleStateByTrigger$ = this.nzTrigger$.pipe(switchMap(trigger => {
                    if (trigger === 'hover') {
                        return mergedMouseState$;
                    }
                    else if (trigger === 'click') {
                        return hostClickState$;
                    }
                    else {
                        return EMPTY;
                    }
                }));
                const descendantMenuItemClick$ = this.nzDropdownMenu.descendantMenuItemClick$.pipe(filter(() => this.nzClickHide), map(() => false));
                const domTriggerVisible$ = merge(visibleStateByTrigger$, descendantMenuItemClick$, this.overlayClose$).pipe(filter(() => !this.nzDisabled));
                const visible$ = merge(this.inputVisible$, domTriggerVisible$);
                combineLatest([visible$, this.nzDropdownMenu.isChildSubMenuOpen$])
                    .pipe(map(([visible, sub]) => visible || sub), auditTime(150), distinctUntilChanged(), filter(() => this.platform.isBrowser), takeUntil(this.destroy$))
                    .subscribe((visible) => {
                    const element = this.nzMatchWidthElement ? this.nzMatchWidthElement.nativeElement : nativeElement;
                    const triggerWidth = element.getBoundingClientRect().width;
                    if (this.nzVisible !== visible) {
                        this.nzVisibleChange.emit(visible);
                    }
                    this.nzVisible = visible;
                    if (visible) {
                        /** set up overlayRef **/
                        if (!this.overlayRef) {
                            /** new overlay **/
                            this.overlayRef = this.overlay.create({
                                positionStrategy: this.positionStrategy,
                                minWidth: triggerWidth,
                                disposeOnNavigation: true,
                                hasBackdrop: this.nzBackdrop && this.nzTrigger === 'click',
                                scrollStrategy: this.overlay.scrollStrategies.reposition()
                            });
                            merge(this.overlayRef.backdropClick(), this.overlayRef.detachments(), this.overlayRef
                                .outsidePointerEvents()
                                .pipe(filter((e) => !this.elementRef.nativeElement.contains(e.target))), this.overlayRef.keydownEvents().pipe(filter(e => e.keyCode === ESCAPE && !hasModifierKey(e))))
                                .pipe(takeUntil(this.destroy$))
                                .subscribe(() => {
                                this.overlayClose$.next(false);
                            });
                        }
                        else {
                            /** update overlay config **/
                            const overlayConfig = this.overlayRef.getConfig();
                            overlayConfig.minWidth = triggerWidth;
                        }
                        /** open dropdown with animation **/
                        this.positionStrategy.withPositions([POSITION_MAP[this.nzPlacement], ...listOfPositions]);
                        /** reset portal if needed **/
                        if (!this.portal || this.portal.templateRef !== this.nzDropdownMenu.templateRef) {
                            this.portal = new TemplatePortal(this.nzDropdownMenu.templateRef, this.viewContainerRef);
                        }
                        this.overlayRef.attach(this.portal);
                    }
                    else {
                        /** detach overlayRef if needed **/
                        if (this.overlayRef) {
                            this.overlayRef.detach();
                        }
                    }
                });
                this.nzDropdownMenu.animationStateChange$.pipe(takeUntil(this.destroy$)).subscribe(event => {
                    if (event.toState === 'void') {
                        if (this.overlayRef) {
                            this.overlayRef.dispose();
                        }
                        this.overlayRef = null;
                    }
                });
            }
        }
        ngOnDestroy() {
            this.destroy$.next(true);
            this.destroy$.complete();
            if (this.overlayRef) {
                this.overlayRef.dispose();
                this.overlayRef = null;
            }
        }
        ngOnChanges(changes) {
            const { nzVisible, nzDisabled, nzOverlayClassName, nzOverlayStyle, nzTrigger } = changes;
            if (nzTrigger) {
                this.nzTrigger$.next(this.nzTrigger);
            }
            if (nzVisible) {
                this.inputVisible$.next(this.nzVisible);
            }
            if (nzDisabled) {
                const nativeElement = this.elementRef.nativeElement;
                if (this.nzDisabled) {
                    this.renderer.setAttribute(nativeElement, 'disabled', '');
                    this.inputVisible$.next(false);
                }
                else {
                    this.renderer.removeAttribute(nativeElement, 'disabled');
                }
            }
            if (nzOverlayClassName) {
                this.setDropdownMenuValue('nzOverlayClassName', this.nzOverlayClassName);
            }
            if (nzOverlayStyle) {
                this.setDropdownMenuValue('nzOverlayStyle', this.nzOverlayStyle);
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownDirective, deps: [{ token: i1.NzConfigService }, { token: i0.Renderer2 }, { token: i0.ViewContainerRef }, { token: i2.Platform }], target: i0.ɵɵFactoryTarget.Directive });
        static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzDropDownDirective, isStandalone: true, selector: "[nz-dropdown]", inputs: { nzDropdownMenu: "nzDropdownMenu", nzTrigger: "nzTrigger", nzMatchWidthElement: "nzMatchWidthElement", nzBackdrop: ["nzBackdrop", "nzBackdrop", booleanAttribute], nzClickHide: ["nzClickHide", "nzClickHide", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzVisible: ["nzVisible", "nzVisible", booleanAttribute], nzOverlayClassName: "nzOverlayClassName", nzOverlayStyle: "nzOverlayStyle", nzPlacement: "nzPlacement" }, outputs: { nzVisibleChange: "nzVisibleChange" }, host: { classAttribute: "ant-dropdown-trigger" }, exportAs: ["nzDropdown"], usesOnChanges: true, ngImport: i0 });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-dropdown]',
                    exportAs: 'nzDropdown',
                    host: {
                        class: 'ant-dropdown-trigger'
                    }
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.Renderer2 }, { type: i0.ViewContainerRef }, { type: i2.Platform }], propDecorators: { nzDropdownMenu: [{
                type: Input
            }], nzTrigger: [{
                type: Input
            }], nzMatchWidthElement: [{
                type: Input
            }], nzBackdrop: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClickHide: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzVisible: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOverlayClassName: [{
                type: Input
            }], nzOverlayStyle: [{
                type: Input
            }], nzPlacement: [{
                type: Input
            }], nzVisibleChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzContextMenuServiceModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuServiceModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuServiceModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuServiceModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuServiceModule, decorators: [{
            type: NgModule
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDropDownADirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownADirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzDropDownADirective, isStandalone: true, selector: "a[nz-dropdown]", host: { classAttribute: "ant-dropdown-link" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownADirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'a[nz-dropdown]',
                    host: {
                        class: 'ant-dropdown-link'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDropdownButtonDirective {
    renderer;
    elementRef;
    nzButtonGroupComponent = inject(NzButtonGroupComponent, { host: true, optional: true });
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    ngAfterViewInit() {
        const parentElement = this.renderer.parentNode(this.elementRef.nativeElement);
        if (this.nzButtonGroupComponent && parentElement) {
            this.renderer.addClass(parentElement, 'ant-dropdown-button');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropdownButtonDirective, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzDropdownButtonDirective, isStandalone: true, selector: "[nz-button][nz-dropdown]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropdownButtonDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-button][nz-dropdown]'
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }] });

class NzDropdownMenuComponent {
    cdr;
    elementRef;
    renderer;
    viewContainerRef;
    directionality;
    mouseState$ = new BehaviorSubject(false);
    nzMenuService = inject(MenuService);
    isChildSubMenuOpen$ = this.nzMenuService.isChildSubMenuOpen$;
    descendantMenuItemClick$ = this.nzMenuService.descendantMenuItemClick$;
    animationStateChange$ = new EventEmitter();
    nzOverlayClassName = '';
    nzOverlayStyle = {};
    templateRef;
    dir = 'ltr';
    destroy$ = new Subject();
    onAnimationEvent(event) {
        this.animationStateChange$.emit(event);
    }
    setMouseState(visible) {
        this.mouseState$.next(visible);
    }
    setValue(key, value) {
        this[key] = value;
        this.cdr.markForCheck();
    }
    noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
    constructor(cdr, elementRef, renderer, viewContainerRef, directionality) {
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.viewContainerRef = viewContainerRef;
        this.directionality = directionality;
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngAfterContentInit() {
        this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), this.elementRef.nativeElement);
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropdownMenuComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.ViewContainerRef }, { token: i1$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzDropdownMenuComponent, isStandalone: true, selector: "nz-dropdown-menu", providers: [
            MenuService,
            /** menu is inside dropdown-menu component **/
            {
                provide: NzIsMenuInsideDropDownToken,
                useValue: true
            }
        ], viewQueries: [{ propertyName: "templateRef", first: true, predicate: TemplateRef, descendants: true, static: true }], exportAs: ["nzDropdownMenu"], ngImport: i0, template: `
    <ng-template>
      <div
        class="ant-dropdown"
        [class.ant-dropdown-rtl]="dir === 'rtl'"
        [class]="nzOverlayClassName"
        [style]="nzOverlayStyle"
        @slideMotion
        (@slideMotion.done)="onAnimationEvent($event)"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        (mouseenter)="setMouseState(true)"
        (mouseleave)="setMouseState(false)"
      >
        <ng-content></ng-content>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }], animations: [slideMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropdownMenuComponent, decorators: [{
            type: Component,
            args: [{
                    selector: `nz-dropdown-menu`,
                    exportAs: `nzDropdownMenu`,
                    animations: [slideMotion],
                    providers: [
                        MenuService,
                        /** menu is inside dropdown-menu component **/
                        {
                            provide: NzIsMenuInsideDropDownToken,
                            useValue: true
                        }
                    ],
                    template: `
    <ng-template>
      <div
        class="ant-dropdown"
        [class.ant-dropdown-rtl]="dir === 'rtl'"
        [class]="nzOverlayClassName"
        [style]="nzOverlayStyle"
        @slideMotion
        (@slideMotion.done)="onAnimationEvent($event)"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        (mouseenter)="setMouseState(true)"
        (mouseleave)="setMouseState(false)"
      >
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NzNoAnimationDirective]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.ViewContainerRef }, { type: i1$1.Directionality }], propDecorators: { templateRef: [{
                type: ViewChild,
                args: [TemplateRef, { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzDropDownModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownModule, imports: [NzDropDownDirective,
            NzDropDownADirective,
            NzDropdownMenuComponent,
            NzDropdownButtonDirective,
            NzContextMenuServiceModule], exports: [NzMenuModule, NzDropDownDirective, NzDropDownADirective, NzDropdownMenuComponent, NzDropdownButtonDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownModule, imports: [NzContextMenuServiceModule, NzMenuModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzDropDownModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzDropDownDirective,
                        NzDropDownADirective,
                        NzDropdownMenuComponent,
                        NzDropdownButtonDirective,
                        NzContextMenuServiceModule
                    ],
                    exports: [NzMenuModule, NzDropDownDirective, NzDropDownADirective, NzDropdownMenuComponent, NzDropdownButtonDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const LIST_OF_POSITIONS = [
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'top' }),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'end', overlayY: 'bottom' }),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'end', overlayY: 'top' })
];
class NzContextMenuService {
    ngZone;
    overlay;
    overlayRef = null;
    closeSubscription = Subscription.EMPTY;
    constructor(ngZone, overlay) {
        this.ngZone = ngZone;
        this.overlay = overlay;
    }
    create($event, nzDropdownMenuComponent) {
        this.close(true);
        const { x, y } = $event;
        if ($event instanceof MouseEvent) {
            $event.preventDefault();
        }
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo({ x, y })
            .withPositions(LIST_OF_POSITIONS)
            .withTransformOriginOn('.ant-dropdown');
        this.overlayRef = this.overlay.create({
            positionStrategy,
            disposeOnNavigation: true,
            scrollStrategy: this.overlay.scrollStrategies.close()
        });
        this.closeSubscription = new Subscription();
        this.closeSubscription.add(nzDropdownMenuComponent.descendantMenuItemClick$.subscribe(() => this.close()));
        this.closeSubscription.add(merge(fromEventOutsideAngular(document, 'click').pipe(filter(event => !!this.overlayRef && !this.overlayRef.overlayElement.contains(event.target)), 
        /** handle firefox contextmenu event **/
        filter(event => event.button !== 2)), fromEventOutsideAngular(document, 'keydown').pipe(filter(event => event.key === 'Escape')))
            .pipe(first())
            .subscribe(() => this.ngZone.run(() => this.close())));
        return this.overlayRef.attach(new TemplatePortal(nzDropdownMenuComponent.templateRef, nzDropdownMenuComponent.viewContainerRef));
    }
    close(clear = false) {
        if (this.overlayRef) {
            this.overlayRef.detach();
            if (clear) {
                this.overlayRef.dispose();
            }
            this.overlayRef = null;
            this.closeSubscription.unsubscribe();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuService, deps: [{ token: i0.NgZone }, { token: i1$2.Overlay }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuService, providedIn: NzContextMenuServiceModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzContextMenuService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: NzContextMenuServiceModule
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i1$2.Overlay }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzContextMenuService, NzContextMenuServiceModule, NzDropDownADirective, NzDropDownDirective, NzDropDownModule, NzDropdownButtonDirective, NzDropdownMenuComponent };
//# sourceMappingURL=ng-zorro-antd-dropdown.mjs.map
