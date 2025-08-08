/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ChangeDetectorRef, ElementRef, EmbeddedViewRef, EventEmitter, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzResizeService } from 'ng-zorro-antd/core/services';
import { NzTSType } from 'ng-zorro-antd/core/types';
import { NzI18nService, NzTextI18nInterface } from 'ng-zorro-antd/i18n';
import { NzTextCopyComponent } from './text-copy.component';
import { NzTextEditComponent } from './text-edit.component';
import * as i0 from "@angular/core";
export declare class NzTypographyComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    nzConfigService: NzConfigService;
    private host;
    private cdr;
    private viewContainerRef;
    private renderer;
    private platform;
    private i18n;
    private resizeService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzCopyable: boolean;
    nzEditable: boolean;
    nzDisabled: boolean;
    nzExpandable: boolean;
    nzEllipsis: boolean;
    nzCopyTooltips?: [NzTSType, NzTSType] | null;
    nzCopyIcons: [NzTSType, NzTSType];
    nzEditTooltip?: null | NzTSType;
    nzEditIcon: NzTSType;
    nzContent?: string;
    nzEllipsisRows: number;
    nzType: 'secondary' | 'warning' | 'danger' | 'success' | undefined;
    nzCopyText: string | undefined;
    nzSuffix: string | undefined;
    readonly nzContentChange: EventEmitter<string>;
    readonly nzCopy: EventEmitter<string>;
    readonly nzExpandChange: EventEmitter<void>;
    readonly nzOnEllipsis: EventEmitter<boolean>;
    textEditRef?: NzTextEditComponent;
    textCopyRef?: NzTextCopyComponent;
    ellipsisContainer?: ElementRef<HTMLSpanElement>;
    expandableBtn?: ElementRef<HTMLSpanElement>;
    contentTemplate?: TemplateRef<{
        content: string;
    }>;
    locale: NzTextI18nInterface;
    private document;
    expandableBtnElementCache: HTMLElement | null;
    editing: boolean;
    ellipsisText: string | undefined;
    cssEllipsis: boolean;
    isEllipsis: boolean;
    expanded: boolean;
    ellipsisStr: string;
    dir: Direction;
    get hasEllipsisObservers(): boolean;
    get canCssEllipsis(): boolean;
    get hasOperationsWithEllipsis(): boolean;
    private viewInit;
    private rfaId;
    private destroy$;
    private windowResizeSubscription;
    get copyText(): string;
    constructor(nzConfigService: NzConfigService, host: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, viewContainerRef: ViewContainerRef, renderer: Renderer2, platform: Platform, i18n: NzI18nService, resizeService: NzResizeService, directionality: Directionality);
    onTextCopy(text: string): void;
    onStartEditing(): void;
    onEndEditing(text: string): void;
    onExpand(): void;
    canUseCSSEllipsis(): boolean;
    renderOnNextFrame(): void;
    getOriginContentViewRef(): {
        viewRef: EmbeddedViewRef<{
            content: string;
        }>;
        removeView(): void;
    };
    syncEllipsis(): void;
    private getExpandableBtnElement;
    private renderAndSubscribeWindowResize;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTypographyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTypographyComponent, "  nz-typography,  [nz-typography],  p[nz-paragraph],  span[nz-text],  h1[nz-title], h2[nz-title], h3[nz-title], h4[nz-title]  ", ["nzTypography"], { "nzCopyable": { "alias": "nzCopyable"; "required": false; }; "nzEditable": { "alias": "nzEditable"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzExpandable": { "alias": "nzExpandable"; "required": false; }; "nzEllipsis": { "alias": "nzEllipsis"; "required": false; }; "nzCopyTooltips": { "alias": "nzCopyTooltips"; "required": false; }; "nzCopyIcons": { "alias": "nzCopyIcons"; "required": false; }; "nzEditTooltip": { "alias": "nzEditTooltip"; "required": false; }; "nzEditIcon": { "alias": "nzEditIcon"; "required": false; }; "nzContent": { "alias": "nzContent"; "required": false; }; "nzEllipsisRows": { "alias": "nzEllipsisRows"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzCopyText": { "alias": "nzCopyText"; "required": false; }; "nzSuffix": { "alias": "nzSuffix"; "required": false; }; }, { "nzContentChange": "nzContentChange"; "nzCopy": "nzCopy"; "nzExpandChange": "nzExpandChange"; "nzOnEllipsis": "nzOnEllipsis"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzCopyable: unknown;
    static ngAcceptInputType_nzEditable: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzExpandable: unknown;
    static ngAcceptInputType_nzEllipsis: unknown;
    static ngAcceptInputType_nzEllipsisRows: unknown;
}
