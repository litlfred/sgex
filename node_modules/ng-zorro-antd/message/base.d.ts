/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AnimationEvent } from '@angular/animations';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef, EventEmitter, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MessageConfig, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSingletonService } from 'ng-zorro-antd/core/services';
import { NzMessageData, NzMessageDataOptions } from './typings';
import * as i0 from "@angular/core";
export declare abstract class NzMNService<T extends NzMNContainerComponent> {
    protected overlay: Overlay;
    private injector;
    protected abstract componentPrefix: string;
    protected container?: T;
    protected nzSingletonService: NzSingletonService;
    protected constructor(overlay: Overlay, injector: Injector);
    remove(id?: string): void;
    protected getInstanceId(): string;
    protected withContainer(ctor: ComponentType<T>): T;
}
export declare abstract class NzMNContainerComponent<C extends MessageConfig = MessageConfig, D extends NzMessageData = NzMessageData> implements OnInit, OnDestroy {
    config?: Required<C>;
    instances: Array<Required<D>>;
    private readonly _afterAllInstancesRemoved;
    readonly afterAllInstancesRemoved: import("rxjs").Observable<void>;
    protected cdr: ChangeDetectorRef;
    protected nzConfigService: NzConfigService;
    protected readonly destroy$: Subject<void>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    create(data: D): Required<D>;
    remove(id: string, userAction?: boolean): void;
    removeAll(): void;
    protected onCreate(instance: D): Required<D>;
    protected onRemove(instance: Required<D>, userAction: boolean): void;
    private onAllInstancesRemoved;
    protected readyInstances(): void;
    protected abstract subscribeConfigChange(): void;
    protected mergeOptions(options?: D['options']): D['options'];
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMNContainerComponent<any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzMNContainerComponent<any, any>, never, never, {}, {}, never, never, true, never>;
}
export declare abstract class NzMNComponent implements OnInit, OnDestroy {
    abstract instance: Required<NzMessageData>;
    abstract index?: number;
    abstract destroyed: EventEmitter<{
        id: string;
        userAction: boolean;
    }>;
    protected cdr: ChangeDetectorRef;
    readonly animationStateChanged: Subject<AnimationEvent>;
    protected options: Required<NzMessageDataOptions>;
    protected autoClose?: boolean;
    protected closeTimer?: ReturnType<typeof setTimeout>;
    protected userAction: boolean;
    protected eraseTimer?: ReturnType<typeof setTimeout>;
    protected eraseTimingStart?: number;
    protected eraseTTL: number;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onEnter(): void;
    onLeave(): void;
    protected destroy(userAction?: boolean): void;
    private initErase;
    private updateTTL;
    private startEraseTimeout;
    private clearEraseTimeout;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMNComponent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzMNComponent, never, never, {}, {}, never, never, true, never>;
}
