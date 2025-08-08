/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDestroyService, NzScrollService } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzBackTopComponent implements OnInit, OnDestroy, OnChanges {
    nzConfigService: NzConfigService;
    private scrollSrv;
    private platform;
    private zone;
    private cdr;
    private destroy$;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    private scrollListenerDestroy$;
    private target;
    visible: boolean;
    dir: Direction;
    nzTemplate?: TemplateRef<void>;
    nzVisibilityHeight: number;
    nzTarget?: string | HTMLElement;
    nzDuration: number;
    readonly nzClick: EventEmitter<boolean>;
    set backTop(backTop: ElementRef<HTMLElement> | undefined);
    private backTopClickSubscription;
    private doc;
    constructor(nzConfigService: NzConfigService, scrollSrv: NzScrollService, platform: Platform, zone: NgZone, cdr: ChangeDetectorRef, destroy$: NzDestroyService, directionality: Directionality);
    ngOnInit(): void;
    private getTarget;
    private handleScroll;
    private registerScrollEvent;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzBackTopComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzBackTopComponent, "nz-back-top", ["nzBackTop"], { "nzTemplate": { "alias": "nzTemplate"; "required": false; }; "nzVisibilityHeight": { "alias": "nzVisibilityHeight"; "required": false; }; "nzTarget": { "alias": "nzTarget"; "required": false; }; "nzDuration": { "alias": "nzDuration"; "required": false; }; }, { "nzClick": "nzClick"; }, never, never, true, never>;
    static ngAcceptInputType_nzVisibilityHeight: unknown;
    static ngAcceptInputType_nzDuration: unknown;
}
