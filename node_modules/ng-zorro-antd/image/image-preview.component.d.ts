/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AnimationEvent } from '@angular/animations';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzImage, NzImagePreviewOptions } from './image-preview-options';
import { NzImagePreviewRef } from './image-preview-ref';
import { NzImageScaleStep, NzImageUrl } from './image.directive';
import * as i0 from "@angular/core";
export interface NzImageContainerOperation {
    icon: string;
    type: string;
    rotate?: number;
    onClick(): void;
}
export declare const NZ_DEFAULT_SCALE_STEP = 0.5;
export declare class NzImagePreviewComponent implements OnInit {
    private ngZone;
    private cdr;
    nzConfigService: NzConfigService;
    config: NzImagePreviewOptions;
    private destroy$;
    private sanitizer;
    readonly _defaultNzZoom = 1;
    readonly _defaultNzScaleStep = 0.5;
    readonly _defaultNzRotate = 0;
    images: NzImage[];
    index: number;
    isDragging: boolean;
    visible: boolean;
    animationStateChanged: EventEmitter<AnimationEvent>;
    scaleStepMap: Map<NzImageUrl, NzImageScaleStep>;
    previewImageTransform: string;
    previewImageWrapperTransform: string;
    operations: NzImageContainerOperation[];
    zoomOutDisabled: boolean;
    position: {
        x: number;
        y: number;
    };
    previewRef: NzImagePreviewRef;
    closeClick: EventEmitter<void>;
    imageRef: ElementRef<HTMLImageElement>;
    imagePreviewWrapper: ElementRef<HTMLElement>;
    private document;
    private zoom;
    private rotate;
    private scaleStep;
    private flipHorizontally;
    private flipVertically;
    get animationDisabled(): boolean;
    get maskClosable(): boolean;
    constructor(ngZone: NgZone, cdr: ChangeDetectorRef, nzConfigService: NzConfigService, config: NzImagePreviewOptions, destroy$: NzDestroyService, sanitizer: DomSanitizer);
    ngOnInit(): void;
    setImages(images: NzImage[], scaleStepMap?: Map<string, number>): void;
    switchTo(index: number): void;
    next(): void;
    prev(): void;
    markForCheck(): void;
    onClose(): void;
    onZoomIn(): void;
    onZoomOut(): void;
    onRotateRight(): void;
    onRotateLeft(): void;
    onSwitchLeft(event: MouseEvent): void;
    onSwitchRight(event: MouseEvent): void;
    onHorizontalFlip(): void;
    onVerticalFlip(): void;
    wheelZoomEventHandler(event: WheelEvent): void;
    onAnimationStart(event: AnimationEvent): void;
    onAnimationDone(event: AnimationEvent): void;
    onDragEnd(event: CdkDragEnd): void;
    sanitizerResourceUrl(url: string): SafeResourceUrl;
    private updatePreviewImageTransform;
    private updatePreviewImageWrapperTransform;
    private updateZoomOutDisabled;
    private handlerImageTransformationWhileZoomingWithMouse;
    private handleImageScaleWhileZoomingWithMouse;
    private isZoomedInWithMouseWheel;
    private reset;
    private reCenterImage;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzImagePreviewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzImagePreviewComponent, "nz-image-preview", ["nzImagePreview"], {}, {}, never, never, true, never>;
}
