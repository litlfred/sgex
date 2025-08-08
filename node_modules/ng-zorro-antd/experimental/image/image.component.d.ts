/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { ImagePreloadService } from 'ng-zorro-antd/core/services';
import { NzImageSrcLoader } from './typings';
import * as i0 from "@angular/core";
export declare const NZ_CONFIG_MODULE_NAME: NzConfigKey;
export declare class NzImageViewComponent implements OnInit, OnChanges, OnDestroy {
    private cdr;
    nzConfigService: NzConfigService;
    private imagePreloadService;
    readonly _nzModuleName: NzConfigKey;
    nzSrc: string;
    nzAlt: string;
    nzWidth: string | number;
    nzHeight: string | number;
    nzSrcLoader: NzImageSrcLoader;
    nzAutoSrcset: boolean;
    nzPriority: boolean;
    nzFallback: string | null;
    nzPlaceholder: string | null;
    nzDisablePreview: boolean;
    imageRef: ElementRef<HTMLImageElement>;
    src: string;
    width: string | number;
    height: string | number;
    srcset: string;
    internalImage: HTMLImageElement;
    private destroy$;
    private reloadDisposeHandler;
    constructor(cdr: ChangeDetectorRef, nzConfigService: NzConfigService, imagePreloadService: ImagePreloadService);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private preload;
    private optimizable;
    private composeImageAttrs;
    private getLoader;
    private convertWidths;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzImageViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzImageViewComponent, "nz-image", ["nzImage"], { "nzSrc": { "alias": "nzSrc"; "required": false; }; "nzAlt": { "alias": "nzAlt"; "required": false; }; "nzWidth": { "alias": "nzWidth"; "required": false; }; "nzHeight": { "alias": "nzHeight"; "required": false; }; "nzSrcLoader": { "alias": "nzSrcLoader"; "required": false; }; "nzAutoSrcset": { "alias": "nzAutoSrcset"; "required": false; }; "nzPriority": { "alias": "nzPriority"; "required": false; }; "nzFallback": { "alias": "nzFallback"; "required": false; }; "nzPlaceholder": { "alias": "nzPlaceholder"; "required": false; }; "nzDisablePreview": { "alias": "nzDisablePreview"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzAutoSrcset: unknown;
    static ngAcceptInputType_nzPriority: unknown;
    static ngAcceptInputType_nzDisablePreview: unknown;
}
