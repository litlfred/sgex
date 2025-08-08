/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzSafeAny, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { NzBadgeStatusType } from './types';
import * as i0 from "@angular/core";
export declare class NzBadgeComponent implements OnChanges, OnDestroy, OnInit {
    nzConfigService: NzConfigService;
    private renderer;
    private cdr;
    private elementRef;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    showSup: boolean;
    presetColor: string | null;
    dir: Direction;
    private destroy$;
    nzShowZero: boolean;
    nzShowDot: boolean;
    nzStandalone: boolean;
    nzDot: boolean;
    nzOverflowCount: number;
    nzColor?: string;
    nzStyle: Record<string, string> | null;
    nzText?: string | TemplateRef<void> | null;
    nzTitle?: string | null | undefined;
    nzStatus?: NzBadgeStatusType | string;
    nzCount?: number | TemplateRef<NzSafeAny>;
    nzOffset?: [number, number];
    nzSize: NzSizeDSType;
    noAnimation: NzNoAnimationDirective | null;
    constructor(nzConfigService: NzConfigService, renderer: Renderer2, cdr: ChangeDetectorRef, elementRef: ElementRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private prepareBadgeForRtl;
    get isRtlLayout(): boolean;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzBadgeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzBadgeComponent, "nz-badge", ["nzBadge"], { "nzShowZero": { "alias": "nzShowZero"; "required": false; }; "nzShowDot": { "alias": "nzShowDot"; "required": false; }; "nzStandalone": { "alias": "nzStandalone"; "required": false; }; "nzDot": { "alias": "nzDot"; "required": false; }; "nzOverflowCount": { "alias": "nzOverflowCount"; "required": false; }; "nzColor": { "alias": "nzColor"; "required": false; }; "nzStyle": { "alias": "nzStyle"; "required": false; }; "nzText": { "alias": "nzText"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzCount": { "alias": "nzCount"; "required": false; }; "nzOffset": { "alias": "nzOffset"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzShowZero: unknown;
    static ngAcceptInputType_nzShowDot: unknown;
    static ngAcceptInputType_nzStandalone: unknown;
    static ngAcceptInputType_nzDot: unknown;
}
