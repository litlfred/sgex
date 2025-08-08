/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { CdkConnectedOverlay, ConnectedOverlayPositionChange, ConnectionPositionPair } from '@angular/cdk/overlay';
import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { NzConfigService, PopConfirmConfig, PopoverConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { POSITION_TYPE } from 'ng-zorro-antd/core/overlay';
import { NgClassInterface, NgStyleInterface, NzSafeAny, NzTSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export interface PropertyMapping {
    [key: string]: [string, () => unknown];
}
export type NzTooltipTrigger = 'click' | 'focus' | 'hover' | null;
export declare abstract class NzTooltipBaseDirective implements AfterViewInit, OnChanges, OnDestroy {
    protected componentType: Type<NzTooltipBaseComponent>;
    config?: Required<PopoverConfig | PopConfirmConfig>;
    abstract arrowPointAtCenter?: boolean;
    abstract directiveTitle?: NzTSType | null;
    abstract directiveContent?: NzTSType | null;
    abstract title?: NzTSType | null;
    abstract content?: NzTSType | null;
    abstract trigger?: NzTooltipTrigger;
    abstract placement?: string | string[];
    abstract origin?: ElementRef<HTMLElement>;
    abstract visible?: boolean;
    abstract mouseEnterDelay?: number;
    abstract mouseLeaveDelay?: number;
    abstract overlayClassName?: string;
    abstract overlayStyle?: NgStyleInterface;
    abstract overlayClickable?: boolean;
    cdkConnectedOverlayPush?: boolean;
    visibleChange: EventEmitter<boolean>;
    /**
     * This true title that would be used in other parts on this component.
     */
    protected get _title(): NzTSType | null;
    protected get _content(): NzTSType | null;
    protected get _trigger(): NzTooltipTrigger;
    protected get _placement(): string[];
    protected get _visible(): boolean;
    protected get _mouseEnterDelay(): number;
    protected get _mouseLeaveDelay(): number;
    protected get _overlayClassName(): string | null;
    protected get _overlayStyle(): NgStyleInterface | null;
    protected get _overlayClickable(): boolean;
    private internalVisible;
    protected getProxyPropertyMap(): PropertyMapping;
    component?: NzTooltipBaseComponent;
    protected readonly destroy$: Subject<void>;
    protected readonly triggerDisposables: Array<() => void>;
    private delayTimer?;
    elementRef: ElementRef<any>;
    protected hostView: ViewContainerRef;
    protected renderer: Renderer2;
    protected noAnimation: NzNoAnimationDirective | null;
    protected nzConfigService: NzConfigService;
    protected platformId: Object;
    constructor(componentType: Type<NzTooltipBaseComponent>);
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    show(): void;
    hide(): void;
    /**
     * Force the component to update its position.
     */
    updatePosition(): void;
    /**
     * Create a dynamic tooltip component. This method can be override.
     */
    protected createComponent(): void;
    protected registerTriggers(): void;
    private updatePropertiesByChanges;
    private updatePropertiesByKeys;
    private initProperties;
    private updateComponentValue;
    private delayEnterLeave;
    private removeTriggerListeners;
    private clearTogglingTimer;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTooltipBaseDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTooltipBaseDirective, never, never, {}, {}, never, never, true, never>;
}
export declare abstract class NzTooltipBaseComponent implements OnDestroy, OnInit {
    overlay: CdkConnectedOverlay;
    noAnimation: NzNoAnimationDirective | null;
    cdr: ChangeDetectorRef;
    private directionality;
    nzTitle: NzTSType | null;
    nzContent: NzTSType | null;
    nzArrowPointAtCenter: boolean;
    nzOverlayClassName: string;
    nzOverlayStyle: NgStyleInterface;
    nzOverlayClickable: boolean;
    nzBackdrop: boolean;
    nzMouseEnterDelay?: number;
    nzMouseLeaveDelay?: number;
    cdkConnectedOverlayPush?: boolean;
    nzVisibleChange: Subject<boolean>;
    set nzVisible(value: boolean);
    get nzVisible(): boolean;
    _visible: boolean;
    set nzTrigger(value: NzTooltipTrigger);
    get nzTrigger(): NzTooltipTrigger;
    protected _trigger: NzTooltipTrigger;
    set nzPlacement(value: POSITION_TYPE[]);
    preferredPlacement: string;
    origin: ElementRef<NzSafeAny>;
    dir: Direction;
    _classMap: NgClassInterface;
    _prefix: string;
    _positions: ConnectionPositionPair[];
    protected destroy$: Subject<void>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    show(): void;
    hide(): void;
    updateByDirective(): void;
    /**
     * Force the component to update its position.
     */
    updatePosition(): void;
    onPositionChange(position: ConnectedOverlayPositionChange): void;
    setOverlayOrigin(origin: ElementRef<HTMLElement>): void;
    onClickOutside(event: MouseEvent): void;
    /**
     * Hide the component while the content is empty.
     */
    private updateVisibilityByTitle;
    protected updateStyles(): void;
    protected transformClassListToMap(klass: string): Record<string, boolean>;
    /**
     * Empty component cannot be opened.
     */
    protected abstract isEmpty(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTooltipBaseComponent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTooltipBaseComponent, never, never, {}, {}, never, never, true, never>;
}
export declare function isTooltipEmpty(value: string | TemplateRef<void> | null): boolean;
