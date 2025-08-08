/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, QueryList, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { NzResizeObserver } from 'ng-zorro-antd/cdk/resize-observer';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDragService, NzResizeService } from 'ng-zorro-antd/core/services';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzCarouselContentDirective } from './carousel-content.directive';
import { NzCarouselBaseStrategy } from './strategies/base-strategy';
import { FromToInterface, NzCarouselDotPosition, NzCarouselEffects } from './typings';
import * as i0 from "@angular/core";
export declare class NzCarouselComponent implements AfterContentInit, AfterViewInit, OnDestroy, OnChanges, OnInit {
    readonly nzConfigService: NzConfigService;
    readonly ngZone: NgZone;
    private readonly renderer;
    private readonly cdr;
    private readonly platform;
    private readonly resizeService;
    private readonly nzDragService;
    private nzResizeObserver;
    readonly _nzModuleName: NzConfigKey;
    carouselContents: QueryList<NzCarouselContentDirective>;
    slickList: ElementRef<HTMLElement>;
    slickTrack: ElementRef<HTMLElement>;
    nzDotRender?: TemplateRef<{
        $implicit: number;
    }>;
    nzEffect: NzCarouselEffects;
    nzEnableSwipe: boolean;
    nzDots: boolean;
    nzAutoPlay: boolean;
    nzAutoPlaySpeed: number;
    nzTransitionSpeed: number;
    nzLoop: boolean;
    /**
     * this property is passed directly to an NzCarouselBaseStrategy
     */
    nzStrategyOptions: NzSafeAny;
    set nzDotPosition(value: NzCarouselDotPosition);
    get nzDotPosition(): NzCarouselDotPosition;
    private _dotPosition;
    readonly nzBeforeChange: EventEmitter<FromToInterface>;
    readonly nzAfterChange: EventEmitter<number>;
    activeIndex: number;
    el: HTMLElement;
    slickListEl: HTMLElement;
    slickTrackEl: HTMLElement;
    strategy?: NzCarouselBaseStrategy;
    vertical: boolean;
    transitionInProgress?: ReturnType<typeof setTimeout>;
    dir: Direction;
    private destroy$;
    private gestureRect;
    private pointerDelta;
    private isTransiting;
    private isDragging;
    private directionality;
    private customStrategies;
    constructor(elementRef: ElementRef, nzConfigService: NzConfigService, ngZone: NgZone, renderer: Renderer2, cdr: ChangeDetectorRef, platform: Platform, resizeService: NzResizeService, nzDragService: NzDragService, nzResizeObserver: NzResizeObserver);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    next(): void;
    pre(): void;
    goTo(index: number): void;
    private switchStrategy;
    private scheduleNextTransition;
    private clearScheduledTransition;
    private markContentActive;
    /**
     * Drag carousel.
     */
    pointerDown: (event: TouchEvent | MouseEvent) => void;
    layout(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCarouselComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCarouselComponent, "nz-carousel", ["nzCarousel"], { "nzDotRender": { "alias": "nzDotRender"; "required": false; }; "nzEffect": { "alias": "nzEffect"; "required": false; }; "nzEnableSwipe": { "alias": "nzEnableSwipe"; "required": false; }; "nzDots": { "alias": "nzDots"; "required": false; }; "nzAutoPlay": { "alias": "nzAutoPlay"; "required": false; }; "nzAutoPlaySpeed": { "alias": "nzAutoPlaySpeed"; "required": false; }; "nzTransitionSpeed": { "alias": "nzTransitionSpeed"; "required": false; }; "nzLoop": { "alias": "nzLoop"; "required": false; }; "nzStrategyOptions": { "alias": "nzStrategyOptions"; "required": false; }; "nzDotPosition": { "alias": "nzDotPosition"; "required": false; }; }, { "nzBeforeChange": "nzBeforeChange"; "nzAfterChange": "nzAfterChange"; }, ["carouselContents"], ["*"], true, never>;
    static ngAcceptInputType_nzEnableSwipe: unknown;
    static ngAcceptInputType_nzDots: unknown;
    static ngAcceptInputType_nzAutoPlay: unknown;
    static ngAcceptInputType_nzAutoPlaySpeed: unknown;
    static ngAcceptInputType_nzTransitionSpeed: unknown;
}
