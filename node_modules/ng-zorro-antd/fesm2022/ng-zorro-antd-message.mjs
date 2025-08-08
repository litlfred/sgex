import { ComponentPortal } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { inject, ChangeDetectorRef, Directive, EventEmitter, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSingletonService } from 'ng-zorro-antd/core/services';
import { toCssPixel } from 'ng-zorro-antd/core/util';
import { moveUpMotion } from 'ng-zorro-antd/core/animation';
import * as i2 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i1$1 from '@angular/cdk/overlay';

let globalCounter = 0;
class NzMNService {
    overlay;
    injector;
    container;
    nzSingletonService = inject(NzSingletonService);
    constructor(overlay, injector) {
        this.overlay = overlay;
        this.injector = injector;
    }
    remove(id) {
        if (this.container) {
            if (id) {
                this.container.remove(id);
            }
            else {
                this.container.removeAll();
            }
        }
    }
    getInstanceId() {
        return `${this.componentPrefix}-${globalCounter++}`;
    }
    withContainer(ctor) {
        let containerInstance = this.nzSingletonService.getSingletonWithKey(this.componentPrefix);
        if (containerInstance) {
            return containerInstance;
        }
        const overlayRef = this.overlay.create({
            hasBackdrop: false,
            scrollStrategy: this.overlay.scrollStrategies.noop(),
            positionStrategy: this.overlay.position().global()
        });
        const componentPortal = new ComponentPortal(ctor, null, this.injector);
        const componentRef = overlayRef.attach(componentPortal);
        const overlayWrapper = overlayRef.hostElement;
        overlayWrapper.style.zIndex = '1010';
        if (!containerInstance) {
            this.container = containerInstance = componentRef.instance;
            this.nzSingletonService.registerSingletonWithKey(this.componentPrefix, containerInstance);
            this.container.afterAllInstancesRemoved.subscribe(() => {
                this.container = undefined;
                this.nzSingletonService.unregisterSingletonWithKey(this.componentPrefix);
                overlayRef.dispose();
            });
        }
        return containerInstance;
    }
}
class NzMNContainerComponent {
    config;
    instances = [];
    _afterAllInstancesRemoved = new Subject();
    afterAllInstancesRemoved = this._afterAllInstancesRemoved.asObservable();
    cdr = inject(ChangeDetectorRef);
    nzConfigService = inject(NzConfigService);
    destroy$ = new Subject();
    ngOnInit() {
        this.subscribeConfigChange();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    create(data) {
        const instance = this.onCreate(data);
        if (this.instances.length >= this.config.nzMaxStack) {
            this.instances = this.instances.slice(1);
        }
        this.instances = [...this.instances, instance];
        this.readyInstances();
        return instance;
    }
    remove(id, userAction = false) {
        this.instances
            .map((instance, index) => ({ index, instance }))
            .filter(({ instance }) => instance.messageId === id)
            .forEach(({ index, instance }) => {
            this.instances.splice(index, 1);
            this.instances = [...this.instances];
            this.onRemove(instance, userAction);
            this.readyInstances();
        });
        if (!this.instances.length) {
            this.onAllInstancesRemoved();
        }
    }
    removeAll() {
        this.instances.forEach(i => this.onRemove(i, false));
        this.instances = [];
        this.readyInstances();
        this.onAllInstancesRemoved();
    }
    onCreate(instance) {
        instance.options = this.mergeOptions(instance.options);
        instance.onClose = new Subject();
        return instance;
    }
    onRemove(instance, userAction) {
        instance.onClose.next(userAction);
        instance.onClose.complete();
    }
    onAllInstancesRemoved() {
        this._afterAllInstancesRemoved.next();
        this._afterAllInstancesRemoved.complete();
    }
    readyInstances() {
        this.cdr.detectChanges();
    }
    mergeOptions(options) {
        const { nzDuration, nzAnimate, nzPauseOnHover } = this.config;
        return { nzDuration, nzAnimate, nzPauseOnHover, ...options };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMNContainerComponent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzMNContainerComponent, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMNContainerComponent, decorators: [{
            type: Directive
        }] });
class NzMNComponent {
    cdr = inject(ChangeDetectorRef);
    animationStateChanged = new Subject();
    options;
    autoClose;
    closeTimer;
    userAction = false;
    eraseTimer;
    eraseTimingStart;
    eraseTTL;
    ngOnInit() {
        this.options = this.instance.options;
        if (this.options.nzAnimate) {
            this.instance.state = 'enter';
            this.animationStateChanged
                .pipe(filter(event => event.phaseName === 'done' && event.toState === 'leave'), take(1))
                .subscribe(() => {
                clearTimeout(this.closeTimer);
                this.destroyed.next({ id: this.instance.messageId, userAction: this.userAction });
            });
        }
        this.autoClose = this.options.nzDuration > 0;
        if (this.autoClose) {
            this.initErase();
            this.startEraseTimeout();
        }
    }
    ngOnDestroy() {
        if (this.autoClose) {
            this.clearEraseTimeout();
        }
        this.animationStateChanged.complete();
    }
    onEnter() {
        if (this.autoClose && this.options.nzPauseOnHover) {
            this.clearEraseTimeout();
            this.updateTTL();
        }
    }
    onLeave() {
        if (this.autoClose && this.options.nzPauseOnHover) {
            this.startEraseTimeout();
        }
    }
    destroy(userAction = false) {
        this.userAction = userAction;
        if (this.options.nzAnimate) {
            this.instance.state = 'leave';
            this.cdr.detectChanges();
            this.closeTimer = setTimeout(() => {
                this.closeTimer = undefined;
                this.destroyed.next({ id: this.instance.messageId, userAction });
            }, 200);
        }
        else {
            this.destroyed.next({ id: this.instance.messageId, userAction });
        }
    }
    initErase() {
        this.eraseTTL = this.options.nzDuration;
        this.eraseTimingStart = Date.now();
    }
    updateTTL() {
        if (this.autoClose) {
            this.eraseTTL -= Date.now() - this.eraseTimingStart;
        }
    }
    startEraseTimeout() {
        if (this.eraseTTL > 0) {
            this.clearEraseTimeout();
            this.eraseTimer = setTimeout(() => this.destroy(), this.eraseTTL);
            this.eraseTimingStart = Date.now();
        }
        else {
            this.destroy();
        }
    }
    clearEraseTimeout() {
        if (this.eraseTimer !== null) {
            clearTimeout(this.eraseTimer);
            this.eraseTimer = undefined;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMNComponent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzMNComponent, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMNComponent, decorators: [{
            type: Directive
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMessageComponent extends NzMNComponent {
    instance;
    destroyed = new EventEmitter();
    index;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzMessageComponent, isStandalone: true, selector: "nz-message", inputs: { instance: "instance" }, outputs: { destroyed: "destroyed" }, exportAs: ["nzMessage"], usesInheritance: true, ngImport: i0, template: `
    <div
      class="ant-message-notice"
      [@moveUpMotion]="instance.state"
      (@moveUpMotion.done)="animationStateChanged.next($event)"
      (mouseenter)="onEnter()"
      (mouseleave)="onLeave()"
    >
      <div class="ant-message-notice-content">
        <div class="ant-message-custom-content" [class]="'ant-message-' + instance.type">
          @switch (instance.type) {
            @case ('success') {
              <nz-icon nzType="check-circle" />
            }
            @case ('info') {
              <nz-icon nzType="info-circle" />
            }
            @case ('warning') {
              <nz-icon nzType="exclamation-circle" />
            }
            @case ('error') {
              <nz-icon nzType="close-circle" />
            }
            @case ('loading') {
              <nz-icon nzType="loading" />
            }
          }
          <ng-container
            *nzStringTemplateOutlet="instance.content; context: { $implicit: this, data: instance.options?.nzData }"
          >
            <span [innerHTML]="instance.content"></span>
          </ng-container>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i2.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], animations: [moveUpMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-message',
                    exportAs: 'nzMessage',
                    preserveWhitespaces: false,
                    animations: [moveUpMotion],
                    template: `
    <div
      class="ant-message-notice"
      [@moveUpMotion]="instance.state"
      (@moveUpMotion.done)="animationStateChanged.next($event)"
      (mouseenter)="onEnter()"
      (mouseleave)="onLeave()"
    >
      <div class="ant-message-notice-content">
        <div class="ant-message-custom-content" [class]="'ant-message-' + instance.type">
          @switch (instance.type) {
            @case ('success') {
              <nz-icon nzType="check-circle" />
            }
            @case ('info') {
              <nz-icon nzType="info-circle" />
            }
            @case ('warning') {
              <nz-icon nzType="exclamation-circle" />
            }
            @case ('error') {
              <nz-icon nzType="close-circle" />
            }
            @case ('loading') {
              <nz-icon nzType="loading" />
            }
          }
          <ng-container
            *nzStringTemplateOutlet="instance.content; context: { $implicit: this, data: instance.options?.nzData }"
          >
            <span [innerHTML]="instance.content"></span>
          </ng-container>
        </div>
      </div>
    </div>
  `,
                    imports: [NzIconModule, NzOutletModule]
                }]
        }], propDecorators: { instance: [{
                type: Input
            }], destroyed: [{
                type: Output
            }] } });

const NZ_CONFIG_COMPONENT_NAME = 'message';
const NZ_MESSAGE_DEFAULT_CONFIG = {
    nzAnimate: true,
    nzDuration: 3000,
    nzMaxStack: 7,
    nzPauseOnHover: true,
    nzTop: 24,
    nzDirection: 'ltr'
};
class NzMessageContainerComponent extends NzMNContainerComponent {
    dir = this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME)?.nzDirection || 'ltr';
    top;
    constructor() {
        super();
        this.updateConfig();
    }
    subscribeConfigChange() {
        this.nzConfigService
            .getConfigChangeEventForComponent(NZ_CONFIG_COMPONENT_NAME)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.updateConfig();
            this.dir = this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME)?.nzDirection || this.dir;
        });
    }
    updateConfig() {
        this.config = {
            ...NZ_MESSAGE_DEFAULT_CONFIG,
            ...this.config,
            ...this.nzConfigService.getConfigForComponent(NZ_CONFIG_COMPONENT_NAME)
        };
        this.top = toCssPixel(this.config.nzTop);
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageContainerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzMessageContainerComponent, isStandalone: true, selector: "nz-message-container", exportAs: ["nzMessageContainer"], usesInheritance: true, ngImport: i0, template: `
    <div class="ant-message" [class.ant-message-rtl]="dir === 'rtl'" [style.top]="top">
      @for (instance of instances; track instance) {
        <nz-message [instance]="instance" (destroyed)="remove($event.id, $event.userAction)"></nz-message>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: NzMessageComponent, selector: "nz-message", inputs: ["instance"], outputs: ["destroyed"], exportAs: ["nzMessage"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageContainerComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-message-container',
                    exportAs: 'nzMessageContainer',
                    preserveWhitespaces: false,
                    template: `
    <div class="ant-message" [class.ant-message-rtl]="dir === 'rtl'" [style.top]="top">
      @for (instance of instances; track instance) {
        <nz-message [instance]="instance" (destroyed)="remove($event.id, $event.userAction)"></nz-message>
      }
    </div>
  `,
                    imports: [NzMessageComponent]
                }]
        }], ctorParameters: () => [] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * @deprecated This module is no longer needed, will be removed in v20, please remove its import.
 */
class NzMessageModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzMessageModule, imports: [NzMessageContainerComponent, NzMessageComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageModule, imports: [NzMessageContainerComponent, NzMessageComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzMessageContainerComponent, NzMessageComponent]
                }]
        }] });

class NzMessageService extends NzMNService {
    componentPrefix = 'message-';
    constructor(overlay, injector) {
        super(overlay, injector);
    }
    success(content, options) {
        return this.createInstance({ type: 'success', content }, options);
    }
    error(content, options) {
        return this.createInstance({ type: 'error', content }, options);
    }
    info(content, options) {
        return this.createInstance({ type: 'info', content }, options);
    }
    warning(content, options) {
        return this.createInstance({ type: 'warning', content }, options);
    }
    loading(content, options) {
        return this.createInstance({ type: 'loading', content }, options);
    }
    create(type, content, options) {
        return this.createInstance({ type, content }, options);
    }
    createInstance(message, options) {
        this.container = this.withContainer(NzMessageContainerComponent);
        return this.container.create({
            ...message,
            ...{
                createdAt: new Date(),
                messageId: this.getInstanceId(),
                options
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageService, deps: [{ token: i1$1.Overlay }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMessageService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1$1.Overlay }, { type: i0.Injector }] });

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

export { NzMNComponent, NzMNContainerComponent, NzMNService, NzMessageComponent, NzMessageContainerComponent, NzMessageModule, NzMessageService };
//# sourceMappingURL=ng-zorro-antd-message.mjs.map
