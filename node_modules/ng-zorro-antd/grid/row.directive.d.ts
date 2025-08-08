/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { MediaMatcher } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ElementRef, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { IndexableObject } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export type NzJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
export type NzAlign = 'top' | 'middle' | 'bottom';
export declare class NzRowDirective implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    elementRef: ElementRef;
    renderer: Renderer2;
    mediaMatcher: MediaMatcher;
    ngZone: NgZone;
    platform: Platform;
    private breakpointService;
    private directionality;
    nzAlign: NzAlign | null;
    nzJustify: NzJustify | null;
    nzGutter: string | number | IndexableObject | [number, number] | [IndexableObject, IndexableObject] | null;
    readonly actualGutter$: ReplaySubject<[number | null, number | null]>;
    dir: Direction;
    private readonly destroy$;
    getGutter(): [number | null, number | null];
    setGutterStyle(): void;
    constructor(elementRef: ElementRef, renderer: Renderer2, mediaMatcher: MediaMatcher, ngZone: NgZone, platform: Platform, breakpointService: NzBreakpointService, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzRowDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzRowDirective, "[nz-row],nz-row,nz-form-item", ["nzRow"], { "nzAlign": { "alias": "nzAlign"; "required": false; }; "nzJustify": { "alias": "nzJustify"; "required": false; }; "nzGutter": { "alias": "nzGutter"; "required": false; }; }, {}, never, never, true, never>;
}
