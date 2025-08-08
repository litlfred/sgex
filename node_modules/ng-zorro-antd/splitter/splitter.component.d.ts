/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Directionality } from '@angular/cdk/bidi';
import { ElementRef } from '@angular/core';
import { NzResizeObserver } from 'ng-zorro-antd/cdk/resize-observer';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzSplitterPanelComponent } from './splitter-panel.component';
import { NzSplitterCollapseOption, NzSplitterLayout } from './typings';
import * as i0 from "@angular/core";
interface PanelSize {
    size: string | number | undefined;
    postPxSize: number;
    percentage: number;
    min: string | number | undefined;
    max: string | number | undefined;
    postPercentMinSize: number;
    postPercentMaxSize: number;
}
interface ResizableInfo {
    resizable: boolean;
    collapsible: Required<NzSplitterCollapseOption>;
}
export declare class NzSplitterComponent {
    /** ------------------- Props ------------------- */
    readonly nzLayout: import("@angular/core").InputSignal<NzSplitterLayout>;
    readonly nzLazy: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    readonly nzResizeStart: import("@angular/core").OutputEmitterRef<number[]>;
    readonly nzResize: import("@angular/core").OutputEmitterRef<number[]>;
    readonly nzResizeEnd: import("@angular/core").OutputEmitterRef<number[]>;
    protected readonly destroy$: NzDestroyService;
    protected readonly elementRef: ElementRef<HTMLElement>;
    protected readonly directionality: Directionality;
    protected readonly resizeObserver: NzResizeObserver;
    protected readonly document: Document;
    protected readonly dir: import("@angular/core").Signal<import("@angular/cdk/bidi").Direction>;
    /** ------------------- Panels ------------------- */
    protected readonly panels: import("@angular/core").Signal<readonly NzSplitterPanelComponent[]>;
    protected readonly panelProps: import("@angular/core").Signal<{
        defaultSize: string | number | undefined;
        size: string | number | undefined;
        min: string | number | undefined;
        max: string | number | undefined;
        resizable: boolean;
        collapsible: NzSplitterCollapseOption;
        contentTemplate: import("@angular/core").TemplateRef<void>;
    }[]>;
    /** ------------------- Sizes ------------------- */
    /**
     * Observe the size of the container.
     */
    private readonly containerBox;
    /**
     * The size of the container, used to calculate the percentage size and flex basis of each panel.
     */
    protected readonly containerSize: import("@angular/core").Signal<number>;
    /**
     * Derived from defaultSize of each panel.
     * After that it will be updated by the resize event with **real** size in pixels.
     */
    protected readonly innerSizes: import("@angular/core").WritableSignal<(string | number | undefined)[]>;
    /**
     * Calculate the size of each panel based on the container size and the percentage size.
     */
    protected readonly sizes: import("@angular/core").Signal<PanelSize[]>;
    protected readonly ariaInfos: import("@angular/core").Signal<{
        ariaNow: number;
        ariaMin: number;
        ariaMax: number;
    }[]>;
    private getPxSizes;
    /** ------------------ Resize ------------------ */
    /**
     * The index of the panel that is being resized.
     * @note Mark the moving splitter bar as activated to show the dragging effect even if the mouse is outside the
     * splitter container.
     */
    protected readonly movingIndex: import("@angular/core").WritableSignal<{
        index: number;
        confirmed: boolean;
    } | null>;
    /**
     * The offset of preview position (lazy mode) when dragging the splitter bar.
     * Constrained by the min and max size of the target panel.
     */
    protected readonly constrainedOffset: import("@angular/core").WritableSignal<number>;
    /**
     * The resizable information of each splitter bar.
     */
    protected readonly resizableInfos: import("@angular/core").Signal<ResizableInfo[]>;
    /**
     * Handle the resize start event for the specified panel.
     * @param index The index of the panel.
     * @param startPos The start position of the resize event.
     */
    protected startResize(index: number, startPos: [x: number, y: number]): void;
    /**
     * Update the sizes of specified panels based on the move offset.
     * @param index The index of the panel.
     * @param offset The move offset in pixels.
     */
    private updateOffset;
    /** ------------------ Resize ------------------ */
    /**
     * Record the original size of the collapsed panel.
     * Used to restore the size when the panel is expanded back.
     */
    private readonly cacheCollapsedSize;
    /**
     * Collapse the specified panel.
     * @param index The index of the panel to collapse.
     * @param type The type of collapse, either `start` or `end`.
     */
    protected collapse(index: number, type: 'start' | 'end'): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSplitterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSplitterComponent, "nz-splitter", ["nzSplitter"], { "nzLayout": { "alias": "nzLayout"; "required": false; "isSignal": true; }; "nzLazy": { "alias": "nzLazy"; "required": false; "isSignal": true; }; }, { "nzResizeStart": "nzResizeStart"; "nzResize": "nzResize"; "nzResizeEnd": "nzResizeEnd"; }, ["panels"], never, true, never>;
}
export {};
