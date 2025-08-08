/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { CdkConnectedOverlay, ConnectedOverlayPositionChange, ConnectionPositionPair } from '@angular/cdk/overlay';
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, QueryList, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';
import { NzConfigKey } from 'ng-zorro-antd/core/config';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzTreeBase, NzTreeNode } from 'ng-zorro-antd/core/tree';
import { NgClassInterface, NgStyleInterface, NzSafeAny, NzSizeLDSType, NzStatus, NzValidateStatus } from 'ng-zorro-antd/core/types';
import { NzCascaderI18nInterface, NzI18nService } from 'ng-zorro-antd/i18n';
import { NzSelectSearchComponent } from 'ng-zorro-antd/select';
import { NzCascaderOptionComponent } from './cascader-option.component';
import { NzCascaderTreeService } from './cascader-tree.service';
import { NzCascaderService } from './cascader.service';
import { NzCascaderComponentAsSource, NzCascaderExpandTrigger, NzCascaderOption, NzCascaderPlacement, NzCascaderSize, NzCascaderTriggerType, NzShowSearchOptions } from './typings';
import * as i0 from "@angular/core";
import * as i1 from "ng-zorro-antd/space";
export declare class NzCascaderComponent extends NzTreeBase implements NzCascaderComponentAsSource, OnInit, OnDestroy, OnChanges, ControlValueAccessor {
    private ngZone;
    private cdr;
    private i18nService;
    private destroy$;
    private elementRef;
    private renderer;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    selectContainer: ElementRef;
    set input(inputComponent: NzSelectSearchComponent | undefined);
    get input(): ElementRef<HTMLInputElement> | undefined;
    /** Used to store the native `<input type="search" />` element since it might be set asynchronously. */
    private input$;
    menu: ElementRef;
    overlay: CdkConnectedOverlay;
    cascaderItems: QueryList<NzCascaderOptionComponent>;
    nzOptionRender: TemplateRef<{
        $implicit: NzCascaderOption;
        index: number;
    }> | null;
    nzShowInput: boolean;
    nzShowArrow: boolean;
    nzAllowClear: boolean;
    nzAutoFocus: boolean;
    nzChangeOnSelect: boolean;
    nzDisabled: boolean;
    nzColumnClassName?: string;
    nzExpandTrigger: NzCascaderExpandTrigger;
    nzValueProperty: string;
    nzLabelProperty: string;
    nzLabelRender: TemplateRef<typeof this.labelRenderContext> | null;
    nzNotFoundContent?: string | TemplateRef<void>;
    nzSize: NzCascaderSize;
    nzBackdrop: boolean;
    nzShowSearch: boolean | NzShowSearchOptions;
    nzPlaceHolder: string;
    nzMenuClassName?: string;
    nzMenuStyle: NgStyleInterface | null;
    /**
     * Duration in milliseconds before opening the menu when the mouse enters the trigger.
     * @default 150
     */
    nzMouseLeaveDelay: number;
    /**
     * Duration in milliseconds before closing the menu when the mouse leaves the trigger.
     * @default 150
     */
    nzMouseEnterDelay: number;
    nzStatus: NzStatus;
    nzMultiple: boolean;
    nzMaxTagCount: number;
    nzPlacement: NzCascaderPlacement;
    nzTriggerAction: NzCascaderTriggerType | NzCascaderTriggerType[];
    nzChangeOn?: (option: NzCascaderOption, level: number) => boolean;
    nzLoadData?: (node: NzCascaderOption, index: number) => PromiseLike<NzSafeAny> | Observable<NzSafeAny>;
    nzDisplayWith: (nodes: NzCascaderOption[]) => string | undefined;
    nzSuffixIcon: string | TemplateRef<void>;
    nzExpandIcon: string | TemplateRef<void>;
    get nzOptions(): NzCascaderOption[] | null;
    set nzOptions(options: NzCascaderOption[] | null);
    get treeService(): NzCascaderTreeService;
    readonly nzVisibleChange: EventEmitter<boolean>;
    readonly nzSelectionChange: EventEmitter<NzCascaderOption[]>;
    readonly nzRemoved: EventEmitter<NzCascaderOption>;
    readonly nzClear: EventEmitter<void>;
    prefixCls: string;
    statusCls: NgClassInterface;
    status: NzValidateStatus;
    hasFeedback: boolean;
    /**
     * If the dropdown should show the empty content.
     * `true` if there's no options.
     */
    shouldShowEmpty: boolean;
    el: HTMLElement;
    menuVisible: boolean;
    isLoading: boolean;
    labelRenderText?: string;
    labelRenderContext: {};
    onChange: Function;
    onTouched: Function;
    positions: ConnectionPositionPair[];
    /**
     * Dropdown width in pixel.
     */
    dropdownWidthStyle?: string;
    dropdownHeightStyle: 'auto' | '';
    dropdownPosition: NzCascaderPlacement;
    isFocused: boolean;
    locale: NzCascaderI18nInterface;
    dir: Direction;
    isComposing: boolean;
    protected get overlayOrigin(): ElementRef;
    protected finalSize: import("@angular/core").Signal<NzSizeLDSType>;
    private size;
    private compactSize;
    private inputString;
    private isOpening;
    private delayMenuTimer?;
    private delaySelectTimer?;
    private isNzDisableFirstChange;
    selectedNodes: NzTreeNode[];
    get inSearchingMode(): boolean;
    set inputValue(inputValue: string);
    get inputValue(): string;
    private get hasInput();
    private get hasValue();
    get showLabelRender(): boolean;
    get showPlaceholder(): boolean;
    get clearIconVisible(): boolean;
    get isLabelRenderTemplate(): boolean;
    noAnimation: NzNoAnimationDirective | null;
    nzFormStatusService: NzFormStatusService | null;
    private nzFormNoStatusService;
    private nzConfigService;
    cascaderService: NzCascaderService;
    constructor(treeService: NzCascaderTreeService, ngZone: NgZone, cdr: ChangeDetectorRef, i18nService: NzI18nService, destroy$: NzDestroyService, elementRef: ElementRef, renderer: Renderer2, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    registerOnChange(fn: () => {}): void;
    registerOnTouched(fn: () => {}): void;
    writeValue(value: NzSafeAny): void;
    private setupSelectionChangeListener;
    delaySetMenuVisible(visible: boolean, delay?: number, setOpening?: boolean): void;
    setMenuVisible(visible: boolean): void;
    private clearDelayMenuTimer;
    clearSelection(event?: Event): void;
    clearSelectedNodes(): void;
    emitValue(values: NzSafeAny[] | null): void;
    focus(): void;
    blur(): void;
    handleInputBlur(): void;
    handleInputFocus(): void;
    isComposingChange(isComposing: boolean): void;
    onTriggerClick(): void;
    onTriggerMouseEnter(): void;
    onTriggerMouseLeave(event: MouseEvent): void;
    onOptionMouseEnter(node: NzTreeNode, columnIndex: number, event: Event): void;
    onOptionMouseLeave(node: NzTreeNode, _columnIndex: number, event: Event): void;
    /**
     * Get ancestor options of a node
     */
    protected getAncestorOptionList(node: NzTreeNode | null): NzCascaderOption[];
    updateSelectedNodes(init?: boolean, updateValue?: boolean): void;
    onOptionClick(node: NzTreeNode, columnIndex: number, event: Event): void;
    onOptionCheck(node: NzTreeNode, columnIndex: number, performActivate?: boolean): void;
    removeSelected(node: NzTreeNode, emitEvent?: boolean): void;
    onClickOutside(event: MouseEvent): void;
    onPositionChange(position: ConnectedOverlayPositionChange): void;
    private isActionTrigger;
    private onEnter;
    private moveUpOrDown;
    private moveLeft;
    private moveRight;
    private clearDelaySelectTimer;
    private delaySetOptionActivated;
    private toggleSearchingMode;
    isOptionActivated(node: NzTreeNode, index: number): boolean;
    setDisabledState(isDisabled: boolean): void;
    closeMenu(): void;
    /**
     * Reposition the cascader panel. When a menu opens, the cascader expands
     * and may exceed the boundary of browser's window.
     */
    private reposition;
    /**
     * When a cascader options is changed, a child needs to know that it should re-render.
     */
    private checkChildren;
    private setDisplayLabel;
    private setDropdownStyles;
    private setStatusStyles;
    private setLocale;
    private scrollToActivatedOptions;
    private setupChangeListener;
    private setupFocusListener;
    private setupKeydownListener;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCascaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCascaderComponent, "nz-cascader, [nz-cascader]", ["nzCascader"], { "nzOptionRender": { "alias": "nzOptionRender"; "required": false; }; "nzShowInput": { "alias": "nzShowInput"; "required": false; }; "nzShowArrow": { "alias": "nzShowArrow"; "required": false; }; "nzAllowClear": { "alias": "nzAllowClear"; "required": false; }; "nzAutoFocus": { "alias": "nzAutoFocus"; "required": false; }; "nzChangeOnSelect": { "alias": "nzChangeOnSelect"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzColumnClassName": { "alias": "nzColumnClassName"; "required": false; }; "nzExpandTrigger": { "alias": "nzExpandTrigger"; "required": false; }; "nzValueProperty": { "alias": "nzValueProperty"; "required": false; }; "nzLabelProperty": { "alias": "nzLabelProperty"; "required": false; }; "nzLabelRender": { "alias": "nzLabelRender"; "required": false; }; "nzNotFoundContent": { "alias": "nzNotFoundContent"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzBackdrop": { "alias": "nzBackdrop"; "required": false; }; "nzShowSearch": { "alias": "nzShowSearch"; "required": false; }; "nzPlaceHolder": { "alias": "nzPlaceHolder"; "required": false; }; "nzMenuClassName": { "alias": "nzMenuClassName"; "required": false; }; "nzMenuStyle": { "alias": "nzMenuStyle"; "required": false; }; "nzMouseLeaveDelay": { "alias": "nzMouseLeaveDelay"; "required": false; }; "nzMouseEnterDelay": { "alias": "nzMouseEnterDelay"; "required": false; }; "nzStatus": { "alias": "nzStatus"; "required": false; }; "nzMultiple": { "alias": "nzMultiple"; "required": false; }; "nzMaxTagCount": { "alias": "nzMaxTagCount"; "required": false; }; "nzPlacement": { "alias": "nzPlacement"; "required": false; }; "nzTriggerAction": { "alias": "nzTriggerAction"; "required": false; }; "nzChangeOn": { "alias": "nzChangeOn"; "required": false; }; "nzLoadData": { "alias": "nzLoadData"; "required": false; }; "nzDisplayWith": { "alias": "nzDisplayWith"; "required": false; }; "nzSuffixIcon": { "alias": "nzSuffixIcon"; "required": false; }; "nzExpandIcon": { "alias": "nzExpandIcon"; "required": false; }; "nzOptions": { "alias": "nzOptions"; "required": false; }; }, { "nzVisibleChange": "nzVisibleChange"; "nzSelectionChange": "nzSelectionChange"; "nzRemoved": "nzRemoved"; "nzClear": "nzClear"; }, never, ["*"], true, [{ directive: typeof i1.NzSpaceCompactItemDirective; inputs: {}; outputs: {}; }]>;
    static ngAcceptInputType_nzShowInput: unknown;
    static ngAcceptInputType_nzShowArrow: unknown;
    static ngAcceptInputType_nzAllowClear: unknown;
    static ngAcceptInputType_nzAutoFocus: unknown;
    static ngAcceptInputType_nzChangeOnSelect: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzMouseLeaveDelay: unknown;
    static ngAcceptInputType_nzMouseEnterDelay: unknown;
    static ngAcceptInputType_nzMultiple: unknown;
}
