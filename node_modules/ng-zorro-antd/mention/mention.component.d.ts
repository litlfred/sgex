/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, QueryList, Renderer2, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NgClassInterface, NzSafeAny, NzStatus, NzValidateStatus } from 'ng-zorro-antd/core/types';
import { NzMentionTriggerDirective } from './mention-trigger';
import { NzMentionService } from './mention.service';
import * as i0 from "@angular/core";
export interface MentionOnSearchTypes {
    value: string;
    prefix: string;
}
export interface Mention {
    startPos: number;
    endPos: number;
    mention: string;
}
export type MentionPlacement = 'top' | 'bottom';
export declare class NzMentionComponent implements OnDestroy, OnInit, AfterViewInit, OnChanges {
    private ngZone;
    private directionality;
    private cdr;
    private overlay;
    private viewContainerRef;
    private elementRef;
    private renderer;
    private nzMentionService;
    private destroy$;
    nzValueWith: (value: NzSafeAny) => string;
    nzPrefix: string | string[];
    nzLoading: boolean;
    nzNotFoundContent: string;
    nzPlacement: MentionPlacement;
    nzSuggestions: NzSafeAny[];
    nzStatus: NzStatus;
    readonly nzOnSelect: EventEmitter<any>;
    readonly nzOnSearchChange: EventEmitter<MentionOnSearchTypes>;
    trigger: NzMentionTriggerDirective;
    suggestionsTemp?: TemplateRef<void>;
    items: QueryList<ElementRef>;
    set suggestionChild(value: TemplateRef<{
        $implicit: NzSafeAny;
    }>);
    isOpen: boolean;
    filteredSuggestions: string[];
    suggestionTemplate: TemplateRef<{
        $implicit: NzSafeAny;
    }> | null;
    activeIndex: number;
    dir: Direction;
    prefixCls: string;
    statusCls: NgClassInterface;
    status: NzValidateStatus;
    hasFeedback: boolean;
    private previousValue;
    private cursorMention;
    private cursorMentionStart?;
    private cursorMentionEnd?;
    private overlayRef;
    private portal?;
    private positionStrategy;
    private overlayOutsideClickSubscription;
    private document;
    private get triggerNativeElement();
    private get focusItemElement();
    private nzFormStatusService;
    private nzFormNoStatusService;
    constructor(ngZone: NgZone, directionality: Directionality, cdr: ChangeDetectorRef, overlay: Overlay, viewContainerRef: ViewContainerRef, elementRef: ElementRef, renderer: Renderer2, nzMentionService: NzMentionService, destroy$: NzDestroyService);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    closeDropdown(): void;
    openDropdown(): void;
    getMentions(): string[];
    selectSuggestion(suggestion: string | {}): void;
    private handleInput;
    private handleKeydown;
    private handleClick;
    private bindTriggerEvents;
    private suggestionsFilter;
    private resetDropdown;
    private setNextItemActive;
    private setPreviousItemActive;
    private scrollToFocusItem;
    private canOpen;
    private resetCursorMention;
    private updatePositions;
    private subscribeOverlayOutsideClick;
    private attachOverlay;
    private getOverlayConfig;
    private getOverlayPosition;
    private setStatusStyles;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMentionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzMentionComponent, "nz-mention", ["nzMention"], { "nzValueWith": { "alias": "nzValueWith"; "required": false; }; "nzPrefix": { "alias": "nzPrefix"; "required": false; }; "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzNotFoundContent": { "alias": "nzNotFoundContent"; "required": false; }; "nzPlacement": { "alias": "nzPlacement"; "required": false; }; "nzSuggestions": { "alias": "nzSuggestions"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; }, { "nzOnSelect": "nzOnSelect"; "nzOnSearchChange": "nzOnSearchChange"; }, ["suggestionChild"], ["*"], true, never>;
    static ngAcceptInputType_nzLoading: unknown;
}
