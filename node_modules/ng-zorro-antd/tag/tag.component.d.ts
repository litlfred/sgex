/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { NzPresetColor, NzStatusColor } from 'ng-zorro-antd/core/color';
import * as i0 from "@angular/core";
export declare class NzTagComponent implements OnChanges, OnDestroy, OnInit {
    private cdr;
    private renderer;
    private elementRef;
    private directionality;
    isPresetColor: boolean;
    nzMode: 'default' | 'closeable' | 'checkable';
    nzColor?: string | NzStatusColor | NzPresetColor;
    nzChecked: boolean;
    nzBordered: boolean;
    readonly nzOnClose: EventEmitter<MouseEvent>;
    readonly nzCheckedChange: EventEmitter<boolean>;
    dir: Direction;
    private destroy$;
    constructor(cdr: ChangeDetectorRef, renderer: Renderer2, elementRef: ElementRef, directionality: Directionality);
    updateCheckedStatus(): void;
    closeTag(e: MouseEvent): void;
    private clearPresetColor;
    private setPresetColor;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTagComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTagComponent, "nz-tag", ["nzTag"], { "nzMode": { "alias": "nzMode"; "required": false; }; "nzColor": { "alias": "nzColor"; "required": false; }; "nzChecked": { "alias": "nzChecked"; "required": false; }; "nzBordered": { "alias": "nzBordered"; "required": false; }; }, { "nzOnClose": "nzOnClose"; "nzCheckedChange": "nzCheckedChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzChecked: unknown;
    static ngAcceptInputType_nzBordered: unknown;
}
