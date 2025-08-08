/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AnimationEvent } from '@angular/animations';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { CompareWith, NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzAutocompleteOptionComponent } from './autocomplete-option.component';
import * as i0 from "@angular/core";
export interface AutocompleteDataSourceItem {
    value: string;
    label: string;
}
export type AutocompleteDataSource = Array<AutocompleteDataSourceItem | string | number>;
export declare class NzAutocompleteComponent implements AfterContentInit, AfterViewInit, OnDestroy, OnInit, OnChanges {
    private changeDetectorRef;
    private directionality;
    nzWidth?: number;
    nzOverlayClassName: string;
    nzOverlayStyle: Record<string, string>;
    nzDefaultActiveFirstOption: boolean;
    nzBackfill: boolean;
    compareWith: CompareWith;
    nzDataSource?: AutocompleteDataSource;
    readonly selectionChange: EventEmitter<NzAutocompleteOptionComponent>;
    showPanel: boolean;
    isOpen: boolean;
    activeItem: NzAutocompleteOptionComponent | null;
    dir: Direction;
    normalizedDataSource: AutocompleteDataSourceItem[];
    private destroy$;
    animationStateChange: EventEmitter<AnimationEvent>;
    /**
     * Options accessor, its source may be content or dataSource
     */
    get options(): QueryList<NzAutocompleteOptionComponent>;
    /** Provided by content */
    fromContentOptions: QueryList<NzAutocompleteOptionComponent>;
    /** Provided by dataSource */
    fromDataSourceOptions: QueryList<NzAutocompleteOptionComponent>;
    /** cdk-overlay */
    template?: TemplateRef<{}>;
    panel?: ElementRef;
    content?: ElementRef;
    private activeItemIndex;
    private selectionChangeSubscription;
    private optionMouseEnterSubscription;
    private dataSourceChangeSubscription;
    /** Options changes listener */
    private readonly optionSelectionChanges;
    private readonly optionMouseEnter;
    private afterNextRender$;
    noAnimation: NzNoAnimationDirective | null;
    constructor(changeDetectorRef: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    onAnimationEvent(event: AnimationEvent): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    setVisibility(): void;
    setActiveItem(index: number): void;
    setNextItemActive(): void;
    setPreviousItemActive(): void;
    getOptionIndex(value: NzSafeAny): number;
    getOption(value: NzSafeAny): NzAutocompleteOptionComponent | null;
    private optionsInit;
    /**
     * Clear the status of options
     */
    clearSelectedOptions(skip?: NzAutocompleteOptionComponent | null, deselect?: boolean): void;
    private subscribeOptionChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzAutocompleteComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzAutocompleteComponent, "nz-autocomplete", ["nzAutocomplete"], { "nzWidth": { "alias": "nzWidth"; "required": false; }; "nzOverlayClassName": { "alias": "nzOverlayClassName"; "required": false; }; "nzOverlayStyle": { "alias": "nzOverlayStyle"; "required": false; }; "nzDefaultActiveFirstOption": { "alias": "nzDefaultActiveFirstOption"; "required": false; }; "nzBackfill": { "alias": "nzBackfill"; "required": false; }; "compareWith": { "alias": "compareWith"; "required": false; }; "nzDataSource": { "alias": "nzDataSource"; "required": false; }; }, { "selectionChange": "selectionChange"; }, ["fromContentOptions"], ["*"], true, never>;
    static ngAcceptInputType_nzWidth: unknown;
    static ngAcceptInputType_nzDefaultActiveFirstOption: unknown;
    static ngAcceptInputType_nzBackfill: unknown;
}
