/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NgStyleInterface } from 'ng-zorro-antd/core/types';
import { NzProgressCirclePath, NzProgressFormatter, NzProgressGapPositionType, NzProgressStatusType, NzProgressStepItem, NzProgressStrokeColorType, NzProgressStrokeLinecapType, NzProgressTypeType } from './typings';
import * as i0 from "@angular/core";
export declare class NzProgressComponent implements OnChanges, OnInit, OnDestroy {
    private cdr;
    nzConfigService: NzConfigService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzShowInfo: boolean;
    nzWidth: number;
    nzStrokeColor?: NzProgressStrokeColorType;
    nzSize: 'default' | 'small';
    nzFormat?: NzProgressFormatter;
    nzSuccessPercent?: number;
    nzPercent: number;
    nzStrokeWidth?: number;
    nzGapDegree?: number;
    nzStatus?: NzProgressStatusType;
    nzType: NzProgressTypeType;
    nzGapPosition: NzProgressGapPositionType;
    nzStrokeLinecap: NzProgressStrokeLinecapType;
    nzSteps: number;
    steps: NzProgressStepItem[];
    /** Gradient style when `nzType` is `line`. */
    lineGradient: string | null;
    /** If user uses gradient color. */
    isGradient: boolean;
    /** If the linear progress is a step progress. */
    isSteps: boolean;
    /**
     * Each progress whose `nzType` is circle or dashboard should have unique id to
     * define `<linearGradient>`.
     */
    gradientId: number;
    /** Paths to rendered in the template. */
    progressCirclePath: NzProgressCirclePath[];
    circleGradient?: Array<{
        offset: string;
        color: string;
    }>;
    trailPathStyle: NgStyleInterface | null;
    pathString?: string;
    icon: string;
    dir: Direction;
    get formatter(): NzProgressFormatter;
    get status(): NzProgressStatusType;
    get strokeWidth(): number;
    get isCircleStyle(): boolean;
    private cachedStatus;
    private inferredStatus;
    private destroy$;
    constructor(cdr: ChangeDetectorRef, nzConfigService: NzConfigService, directionality: Directionality);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private updateIcon;
    /**
     * Calculate step render configs.
     */
    private getSteps;
    /**
     * Calculate paths when the type is circle or dashboard.
     */
    private getCirclePaths;
    private setStrokeColor;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzProgressComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzProgressComponent, "nz-progress", ["nzProgress"], { "nzShowInfo": { "alias": "nzShowInfo"; "required": false; }; "nzWidth": { "alias": "nzWidth"; "required": false; }; "nzStrokeColor": { "alias": "nzStrokeColor"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzFormat": { "alias": "nzFormat"; "required": false; }; "nzSuccessPercent": { "alias": "nzSuccessPercent"; "required": false; }; "nzPercent": { "alias": "nzPercent"; "required": false; }; "nzStrokeWidth": { "alias": "nzStrokeWidth"; "required": false; }; "nzGapDegree": { "alias": "nzGapDegree"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzGapPosition": { "alias": "nzGapPosition"; "required": false; }; "nzStrokeLinecap": { "alias": "nzStrokeLinecap"; "required": false; }; "nzSteps": { "alias": "nzSteps"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzSuccessPercent: unknown;
    static ngAcceptInputType_nzPercent: unknown;
    static ngAcceptInputType_nzStrokeWidth: unknown;
    static ngAcceptInputType_nzGapDegree: unknown;
    static ngAcceptInputType_nzSteps: unknown;
}
