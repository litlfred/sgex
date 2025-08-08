/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzImageService } from './image.service';
import * as i0 from "@angular/core";
export type ImageStatusType = 'error' | 'loading' | 'normal';
export type NzImageUrl = string;
export type NzImageScaleStep = number;
export declare class NzImageDirective implements OnInit, OnChanges, OnDestroy {
    nzConfigService: NzConfigService;
    private elementRef;
    private nzImageService;
    protected cdr: ChangeDetectorRef;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzSrc: string;
    nzSrcset: string;
    nzDisablePreview: boolean;
    nzFallback: string | null;
    nzPlaceholder: string | null;
    nzScaleStep: number | null;
    dir?: Direction;
    backLoadImage: HTMLImageElement;
    status: ImageStatusType;
    private backLoadDestroy$;
    private destroy$;
    private document;
    private parentGroup;
    get previewable(): boolean;
    constructor(nzConfigService: NzConfigService, elementRef: ElementRef, nzImageService: NzImageService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnDestroy(): void;
    onPreview(): void;
    getElement(): ElementRef<HTMLImageElement>;
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * use internal Image object handle fallback & placeholder
     *
     * @private
     */
    private backLoad;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzImageDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzImageDirective, "img[nz-image]", ["nzImage"], { "nzSrc": { "alias": "nzSrc"; "required": false; }; "nzSrcset": { "alias": "nzSrcset"; "required": false; }; "nzDisablePreview": { "alias": "nzDisablePreview"; "required": false; }; "nzFallback": { "alias": "nzFallback"; "required": false; }; "nzPlaceholder": { "alias": "nzPlaceholder"; "required": false; }; "nzScaleStep": { "alias": "nzScaleStep"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzDisablePreview: unknown;
}
