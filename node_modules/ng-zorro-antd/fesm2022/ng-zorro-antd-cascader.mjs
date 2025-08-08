import { __esDecorate, __runInitializers } from 'tslib';
import { DOWN_ARROW, UP_ARROW, LEFT_ARROW, RIGHT_ARROW, ENTER, BACKSPACE, ESCAPE } from '@angular/cdk/keycodes';
import * as i6 from '@angular/cdk/overlay';
import { OverlayModule, CdkConnectedOverlay } from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { NgTemplateOutlet, SlicePipe } from '@angular/common';
import * as i0 from '@angular/core';
import { EventEmitter, inject, ElementRef, booleanAttribute, numberAttribute, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, Injectable, computed, signal, forwardRef, HostListener, ViewChildren, ViewChild, NgModule } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Subject, from, of, merge } from 'rxjs';
import { finalize, distinctUntilChanged, withLatestFrom, map, takeUntil, startWith, switchMap } from 'rxjs/operators';
import { slideMotion } from 'ng-zorro-antd/core/animation';
import { WithConfig, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzFormStatusService, NzFormNoStatusService, NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i9 from 'ng-zorro-antd/core/overlay';
import { DEFAULT_CASCADER_POSITIONS, POSITION_MAP, getPlacementName, NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import * as i3$1 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzTreeBaseService, NzTreeNode, NzTreeBase } from 'ng-zorro-antd/core/tree';
import { arraysEqual, isNotNil, toArray, getStatusClassNames, fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i8 from 'ng-zorro-antd/empty';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectClearComponent, NzSelectItemComponent, NzSelectPlaceholderComponent, NzSelectSearchComponent } from 'ng-zorro-antd/select';
import * as i5 from 'ng-zorro-antd/space';
import { NZ_SPACE_COMPACT_SIZE, NZ_SPACE_COMPACT_ITEM_TYPE, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import * as i1 from 'ng-zorro-antd/core/highlight';
import { NzHighlightModule } from 'ng-zorro-antd/core/highlight';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i2$1 from 'ng-zorro-antd/i18n';
import * as i4 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function isShowSearchObject(options) {
    return typeof options !== 'boolean';
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function isChildNode(node) {
    return node.isLeaf || !node.children || !node.children.length;
}
function isParentNode(node) {
    return !!node.children && !!node.children.length && !node.isLeaf;
}

class NzCascaderOptionComponent {
    cdr;
    optionTemplate = null;
    node;
    activated = false;
    highlightText;
    nzLabelProperty = 'label';
    columnIndex;
    expandIcon = '';
    dir = 'ltr';
    checkable = false;
    check = new EventEmitter();
    nativeElement = inject(ElementRef).nativeElement;
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnInit() {
        if (this.expandIcon === '' && this.dir === 'rtl') {
            this.expandIcon = 'left';
        }
        else if (this.expandIcon === '') {
            this.expandIcon = 'right';
        }
    }
    get checked() {
        return this.node.isChecked;
    }
    get halfChecked() {
        return this.node.isHalfChecked;
    }
    get disabled() {
        return this.node.isDisabled || this.node.isDisableCheckbox;
    }
    markForCheck() {
        this.cdr.markForCheck();
    }
    onCheckboxClick(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.checkable) {
            return;
        }
        this.check.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderOptionComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCascaderOptionComponent, isStandalone: true, selector: "[nz-cascader-option]", inputs: { optionTemplate: "optionTemplate", node: "node", activated: "activated", highlightText: "highlightText", nzLabelProperty: "nzLabelProperty", columnIndex: ["columnIndex", "columnIndex", numberAttribute], expandIcon: "expandIcon", dir: "dir", checkable: ["checkable", "checkable", booleanAttribute] }, outputs: { check: "check" }, host: { properties: { "attr.title": "node.title", "class.ant-cascader-menu-item-active": "activated", "class.ant-cascader-menu-item-expand": "!node.isLeaf", "class.ant-cascader-menu-item-disabled": "node.isDisabled" }, classAttribute: "ant-cascader-menu-item ant-cascader-menu-item-expanded" }, exportAs: ["nzCascaderOption"], ngImport: i0, template: `
    @if (checkable) {
      <span
        class="ant-cascader-checkbox"
        [class.ant-cascader-checkbox-checked]="checked"
        [class.ant-cascader-checkbox-indeterminate]="halfChecked"
        [class.ant-cascader-checkbox-disabled]="disabled"
        (click)="onCheckboxClick($event)"
      >
        <span class="ant-cascader-checkbox-inner"></span>
      </span>
    }

    @if (optionTemplate) {
      <ng-template
        [ngTemplateOutlet]="optionTemplate"
        [ngTemplateOutletContext]="{ $implicit: node.origin, index: columnIndex }"
      />
    } @else {
      <div
        class="ant-cascader-menu-item-content"
        [innerHTML]="node.title | nzHighlight: highlightText : 'g' : 'ant-cascader-menu-item-keyword'"
      ></div>
    }

    @if (!node.isLeaf || node.children?.length || node.isLoading) {
      <div class="ant-cascader-menu-item-expand-icon">
        @if (node.isLoading) {
          <nz-icon nzType="loading" />
        } @else {
          <ng-container *nzStringTemplateOutlet="expandIcon">
            <nz-icon [nzType]="$any(expandIcon)" />
          </ng-container>
        }
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzHighlightModule }, { kind: "pipe", type: i1.NzHighlightPipe, name: "nzHighlight" }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderOptionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '[nz-cascader-option]',
                    exportAs: 'nzCascaderOption',
                    imports: [NgTemplateOutlet, NzHighlightModule, NzIconModule, NzOutletModule],
                    template: `
    @if (checkable) {
      <span
        class="ant-cascader-checkbox"
        [class.ant-cascader-checkbox-checked]="checked"
        [class.ant-cascader-checkbox-indeterminate]="halfChecked"
        [class.ant-cascader-checkbox-disabled]="disabled"
        (click)="onCheckboxClick($event)"
      >
        <span class="ant-cascader-checkbox-inner"></span>
      </span>
    }

    @if (optionTemplate) {
      <ng-template
        [ngTemplateOutlet]="optionTemplate"
        [ngTemplateOutletContext]="{ $implicit: node.origin, index: columnIndex }"
      />
    } @else {
      <div
        class="ant-cascader-menu-item-content"
        [innerHTML]="node.title | nzHighlight: highlightText : 'g' : 'ant-cascader-menu-item-keyword'"
      ></div>
    }

    @if (!node.isLeaf || node.children?.length || node.isLoading) {
      <div class="ant-cascader-menu-item-expand-icon">
        @if (node.isLoading) {
          <nz-icon nzType="loading" />
        } @else {
          <ng-container *nzStringTemplateOutlet="expandIcon">
            <nz-icon [nzType]="$any(expandIcon)" />
          </ng-container>
        }
      </div>
    }
  `,
                    host: {
                        class: 'ant-cascader-menu-item ant-cascader-menu-item-expanded',
                        '[attr.title]': 'node.title',
                        '[class.ant-cascader-menu-item-active]': 'activated',
                        '[class.ant-cascader-menu-item-expand]': '!node.isLeaf',
                        '[class.ant-cascader-menu-item-disabled]': 'node.isDisabled'
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { optionTemplate: [{
                type: Input
            }], node: [{
                type: Input
            }], activated: [{
                type: Input
            }], highlightText: [{
                type: Input
            }], nzLabelProperty: [{
                type: Input
            }], columnIndex: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], expandIcon: [{
                type: Input
            }], dir: [{
                type: Input
            }], checkable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], check: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCascaderTreeService extends NzTreeBaseService {
    fieldNames = {
        label: 'label',
        value: 'value'
    };
    treeNodePostProcessor = (node) => {
        node.key = this.getOptionValue(node);
        node.title = this.getOptionLabel(node);
    };
    getOptionValue(node) {
        return node.origin[this.fieldNames.value || 'value'];
    }
    getOptionLabel(node) {
        return node.origin[this.fieldNames.label || 'label'];
    }
    get children() {
        return this.rootNodes;
    }
    set children(value) {
        this.rootNodes = value.map(v => (v instanceof NzTreeNode ? v : new NzTreeNode(v, null)));
    }
    constructor() {
        super();
    }
    /**
     * Map list of nodes to list of option
     */
    toOptions(nodes) {
        return nodes.map(node => node.origin);
    }
    getAncestorNodeList(node) {
        if (!node) {
            return [];
        }
        if (node.parentNode) {
            return [...this.getAncestorNodeList(node.parentNode), node];
        }
        return [node];
    }
    /**
     * Render by nzCheckedKeys
     * When keys equals null, just render with checkStrictly
     *
     * @param paths
     * @param checkStrictly
     */
    conductCheckPaths(paths, checkStrictly) {
        this.checkedNodeList = [];
        this.halfCheckedNodeList = [];
        const existsPathList = [];
        const calc = (nodes) => {
            nodes.forEach(node => {
                if (paths === null) {
                    // render tree if no default checked keys found
                    node.isChecked = !!node.origin.checked;
                }
                else {
                    // if node is in checked path
                    const nodePath = this.getAncestorNodeList(node).map(n => this.getOptionValue(n));
                    if (paths.some(keys => arraysEqual(nodePath, keys))) {
                        node.isChecked = true;
                        node.isHalfChecked = false;
                        existsPathList.push(nodePath);
                    }
                    else {
                        node.isChecked = false;
                        node.isHalfChecked = false;
                    }
                }
                if (node.children.length > 0) {
                    calc(node.children);
                }
            });
        };
        calc(this.rootNodes);
        this.refreshCheckState(checkStrictly);
        // handle missing node
        this.handleMissingNodeList(paths, existsPathList);
    }
    conductSelectedPaths(paths) {
        this.selectedNodeList.forEach(node => (node.isSelected = false));
        this.selectedNodeList = [];
        const existsPathList = [];
        const calc = (nodes) => nodes.every(node => {
            // if node is in selected path
            const nodePath = this.getAncestorNodeList(node).map(n => this.getOptionValue(n));
            if (paths.some(keys => arraysEqual(nodePath, keys))) {
                node.isSelected = true;
                this.setSelectedNodeList(node);
                existsPathList.push(nodePath);
                return false;
            }
            else {
                node.isSelected = false;
            }
            if (node.children.length > 0) {
                return calc(node.children);
            }
            return true;
        });
        calc(this.rootNodes);
        this.handleMissingNodeList(paths, existsPathList);
    }
    handleMissingNodeList(paths, existsPathList) {
        const missingNodeList = this.getMissingNodeList(paths, existsPathList);
        missingNodeList.forEach(node => {
            this.setSelectedNodeList(node);
        });
    }
    getMissingNodeList(paths, existsPathList) {
        if (!paths) {
            return [];
        }
        return paths
            .filter(path => !existsPathList.some(keys => arraysEqual(path, keys)))
            .map(path => this.createMissingNode(path))
            .filter(isNotNil);
    }
    createMissingNode(path) {
        if (!path?.length) {
            return null;
        }
        const createOption = (key) => {
            return {
                [this.fieldNames.value || 'value']: key,
                [this.fieldNames.label || 'label']: key
            };
        };
        let node = new NzTreeNode(createOption(path[0]), null, this);
        for (let i = 1; i < path.length; i++) {
            const childNode = new NzTreeNode(createOption(path[i]));
            node.addChildren([childNode]);
            node = childNode;
        }
        if (this.isMultiple) {
            node.isChecked = true;
            node.isHalfChecked = false;
        }
        else {
            node.isSelected = true;
        }
        return node;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderTreeService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderTreeService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderTreeService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * All data is stored and parsed in NzCascaderService.
 */
class NzCascaderService {
    /** Activated options in each column. */
    activatedNodes = [];
    /** An array to store cascader items arranged in different layers. */
    columns = [];
    /** If user has entered searching mode. */
    inSearchingMode = false;
    values = [];
    /**
     * Emit an event when loading state changes.
     * Emit true if nzOptions is loading by `nzLoadData`.
     */
    $loading = new BehaviorSubject(false);
    /**
     * Emit an event to notify cascader it needs to redraw because activated or
     * selected options are changed.
     */
    $redraw = new Subject();
    /**
     * Emit an event when an option gets selected.
     * Emit true if a leaf options is selected.
     */
    $nodeSelected = new Subject();
    /**
     * Emit an event to notify cascader it needs to quit searching mode.
     * Only emit when user do select a searching option.
     */
    $quitSearching = new Subject();
    /** To hold columns before entering searching mode. */
    columnSnapshot = [[]];
    cascaderComponent;
    searchOptionPathMap = new Map();
    /** Return cascader options in the first layer. */
    get nzOptions() {
        return this.cascaderComponent.treeService.toOptions(this.columns[0] || []);
    }
    ngOnDestroy() {
        this.$redraw.complete();
        this.$quitSearching.complete();
        this.$nodeSelected.complete();
        this.$loading.complete();
        this.searchOptionPathMap.clear();
    }
    /**
     * Bind cascader component so this service could use inputs.
     */
    withComponent(cascaderComponent) {
        this.cascaderComponent = cascaderComponent;
    }
    /**
     * Try to set an option as activated.
     *
     * @param node Cascader option node
     * @param columnIndex Of which column this option is in
     * @param performSelect Select
     * @param multiple Multiple mode
     * @param loadingChildren Try to load children asynchronously.
     */
    setNodeActivated(node, columnIndex, performSelect = false, multiple = false, loadingChildren = true) {
        if (node.isDisabled) {
            return;
        }
        this.activatedNodes[columnIndex] = node;
        this.trackAncestorActivatedNodes(columnIndex);
        this.dropBehindActivatedNodes(columnIndex);
        if (isParentNode(node)) {
            // Parent option that has children.
            this.setColumnData(node.children, columnIndex + 1);
        }
        else if (!node.isLeaf && loadingChildren) {
            // Parent option that should try to load children asynchronously.
            this.loadChildren(node, columnIndex);
        }
        else if (node.isLeaf) {
            // Leaf option.
            this.dropBehindColumns(columnIndex);
        }
        // Actually perform selection to make an options not only activated but also selected.
        if (performSelect && node.isSelectable) {
            this.setNodeSelected(node, columnIndex, multiple);
        }
        this.$redraw.next();
    }
    /**
     * Set an option as selected.
     * @param node
     * @param index
     * @param multiple
     */
    setNodeSelected(node, index, multiple = false) {
        const changeOn = this.cascaderComponent.nzChangeOn;
        const shouldPerformSelection = (o, i) => typeof changeOn === 'function' ? changeOn(o, i) : false;
        if (multiple ||
            node.isLeaf ||
            this.cascaderComponent.nzChangeOnSelect ||
            shouldPerformSelection(node.origin, index)) {
            node.isSelected = true;
            this.cascaderComponent.treeService.setSelectedNodeList(node, multiple);
            this.cascaderComponent.updateSelectedNodes();
            this.$redraw.next();
            this.$nodeSelected.next(node);
        }
    }
    setNodeDeactivatedSinceColumn(column) {
        this.dropBehindActivatedNodes(column - 1);
        this.dropBehindColumns(column);
        this.$redraw.next();
    }
    /**
     * Set a searching option as selected, finishing up things.
     *
     * @param node
     * @param multiple
     */
    setSearchOptionSelected(node, multiple = false) {
        this.setNodeSelected(node, node.level, multiple);
        setTimeout(() => {
            // Reset data and tell UI only to remove input and reset dropdown width style.
            this.$quitSearching.next();
            this.$redraw.next();
        }, 200);
    }
    /**
     * Reset node's `title` and `disabled` status and clear `searchOptionPathMap`.
     */
    clearSearchOptions() {
        for (const node of this.searchOptionPathMap.keys()) {
            node.isDisabled = node.origin.disabled || false;
            node.title = this.getOptionLabel(node.origin);
        }
        this.searchOptionPathMap.clear();
    }
    /**
     * Filter cascader options to reset `columns`.
     *
     * @param searchValue The string user wants to search.
     */
    prepareSearchOptions(searchValue) {
        const results = []; // Search results only have one layer.
        const path = [];
        const defaultFilter = (i, p) => p.some(o => {
            const label = this.getOptionLabel(o);
            return !!label && label.indexOf(i) !== -1;
        });
        const showSearch = this.cascaderComponent.nzShowSearch;
        const filter = isShowSearchObject(showSearch) && showSearch.filter ? showSearch.filter : defaultFilter;
        const sorter = isShowSearchObject(showSearch) && showSearch.sorter ? showSearch.sorter : null;
        const loopChild = (node, forceDisabled = false) => {
            path.push(node);
            const cPath = this.cascaderComponent.treeService.toOptions(path);
            if (filter(searchValue, cPath)) {
                this.searchOptionPathMap.set(node, cPath);
                node.isDisabled = forceDisabled || node.isDisabled;
                node.title = cPath.map(p => this.getOptionLabel(p)).join(' / ');
                results.push(node);
            }
            path.pop();
        };
        const loopParent = (node, forceDisabled = false) => {
            const disabled = forceDisabled || node.isDisabled;
            path.push(node);
            node.children.forEach(sNode => {
                if (!sNode.isLeaf) {
                    loopParent(sNode, disabled);
                }
                if (sNode.isLeaf || !sNode.children || !sNode.children.length) {
                    loopChild(sNode, disabled);
                }
            });
            path.pop();
        };
        if (!this.columnSnapshot.length) {
            this.columns = [[]];
            return;
        }
        this.columnSnapshot[0].forEach(o => (isChildNode(o) ? loopChild(o) : loopParent(o)));
        if (sorter) {
            results.sort((a, b) => sorter(this.searchOptionPathMap.get(a), this.searchOptionPathMap.get(b), searchValue));
        }
        this.columns = [results];
        this.$redraw.next(); // Search results may be empty, so should redraw.
    }
    /**
     * Set searching mode by UI. It deals with things not directly related to UI.
     *
     * @param toSearching If this cascader is entering searching mode
     */
    setSearchingMode(toSearching) {
        this.inSearchingMode = toSearching;
        if (toSearching) {
            this.clearSearchOptions(); // if reset nzOptions when searching, should clear searchOptionPathMap
            this.columnSnapshot = [...this.columns];
            this.activatedNodes = [];
        }
        else {
            // User quit searching mode without selecting an option.
            this.clearSearchOptions();
            this.activatedNodes = [];
            setTimeout(() => {
                this.columns = [...this.columnSnapshot];
                if (this.cascaderComponent.selectedNodes.length) {
                    const activatedNode = this.cascaderComponent.selectedNodes[0];
                    const columnIndex = activatedNode.level;
                    this.activatedNodes[columnIndex] = activatedNode;
                    this.trackAncestorActivatedNodes(columnIndex);
                    this.trackAncestorColumnData(columnIndex);
                }
                this.$redraw.next();
            });
        }
        this.$redraw.next();
    }
    /**
     * Clear selected options.
     */
    clear() {
        this.values = [];
        this.activatedNodes = [];
        this.dropBehindColumns(0);
        this.$redraw.next();
        this.$nodeSelected.next(null);
    }
    getOptionLabel(o) {
        return o[this.cascaderComponent.nzLabelProperty || 'label'];
    }
    getOptionValue(o) {
        return o[this.cascaderComponent.nzValueProperty || 'value'];
    }
    /**
     * Try to insert options into a column.
     *
     * @param nodes Options to insert
     * @param columnIndex Position
     */
    setColumnData(nodes, columnIndex) {
        this.columns[columnIndex] = nodes;
        this.dropBehindColumns(columnIndex);
    }
    /**
     * Set all columns data according to activate option's path
     */
    trackAncestorColumnData(startIndex) {
        const node = this.activatedNodes[startIndex];
        if (!node) {
            return;
        }
        this.dropBehindColumns(startIndex);
        for (let i = 0; i < startIndex; i++) {
            this.columns[i + 1] = this.activatedNodes[i].children;
        }
    }
    /**
     * Set all ancestor options as activated.
     */
    trackAncestorActivatedNodes(startIndex) {
        for (let i = startIndex - 1; i >= 0; i--) {
            if (!this.activatedNodes[i]) {
                this.activatedNodes[i] = this.activatedNodes[i + 1].parentNode;
            }
        }
    }
    dropBehindActivatedNodes(lastReserveIndex) {
        this.activatedNodes = this.activatedNodes.splice(0, lastReserveIndex + 1);
    }
    dropBehindColumns(lastReserveIndex) {
        if (lastReserveIndex < this.columns.length - 1) {
            this.columns = this.columns.slice(0, lastReserveIndex + 1);
        }
    }
    /**
     * Load children of an option asynchronously.
     */
    loadChildren(node, columnIndex, onLoaded) {
        const isRoot = columnIndex < 0 || !isNotNil(node);
        const option = node?.origin || {};
        const loadFn = this.cascaderComponent.nzLoadData;
        if (loadFn) {
            // If there isn't any option in columns.
            this.$loading.next(isRoot);
            if (node) {
                node.isLoading = true;
            }
            from(loadFn(option, columnIndex))
                .pipe(finalize(() => {
                node && (node.isLoading = false);
                this.$loading.next(false);
                this.$redraw.next();
            }))
                .subscribe({
                next: () => {
                    if (option.children) {
                        if (!isRoot) {
                            const nodes = option.children.map(o => new NzTreeNode(o, node));
                            node.children = nodes;
                            this.setColumnData(nodes, columnIndex + 1);
                        }
                        else {
                            // If it's root node, we should initialize the tree.
                            const nodes = this.cascaderComponent.coerceTreeNodes(option.children);
                            this.cascaderComponent.treeService.initTree(nodes);
                            this.setColumnData(nodes, 0);
                        }
                        onLoaded?.(option.children);
                    }
                },
                error: () => {
                    node && (node.isLeaf = true);
                }
            });
        }
    }
    isLoaded(index) {
        return !!this.columns[index] && this.columns[index].length > 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderService, decorators: [{
            type: Injectable
        }] });

const NZ_CONFIG_MODULE_NAME = 'cascader';
const defaultDisplayRender = (labels) => labels.join(' / ');
let NzCascaderComponent = (() => {
    let _classSuper = NzTreeBase;
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    let _nzBackdrop_decorators;
    let _nzBackdrop_initializers = [];
    let _nzBackdrop_extraInitializers = [];
    return class NzCascaderComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _nzSize_decorators = [WithConfig()];
            _nzBackdrop_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            __esDecorate(null, null, _nzBackdrop_decorators, { kind: "field", name: "nzBackdrop", static: false, private: false, access: { has: obj => "nzBackdrop" in obj, get: obj => obj.nzBackdrop, set: (obj, value) => { obj.nzBackdrop = value; } }, metadata: _metadata }, _nzBackdrop_initializers, _nzBackdrop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        ngZone;
        cdr;
        i18nService;
        destroy$;
        elementRef;
        renderer;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        selectContainer;
        set input(inputComponent) {
            this.input$.next(inputComponent?.inputElement);
        }
        get input() {
            return this.input$.getValue();
        }
        /** Used to store the native `<input type="search" />` element since it might be set asynchronously. */
        input$ = new BehaviorSubject(undefined);
        menu;
        overlay;
        cascaderItems;
        nzOptionRender = null;
        nzShowInput = true;
        nzShowArrow = true;
        nzAllowClear = true;
        nzAutoFocus = false;
        nzChangeOnSelect = false;
        nzDisabled = false;
        nzColumnClassName;
        nzExpandTrigger = 'click';
        nzValueProperty = 'value';
        nzLabelProperty = 'label';
        nzLabelRender = null;
        nzNotFoundContent;
        nzSize = __runInitializers(this, _nzSize_initializers, 'default');
        nzBackdrop = (__runInitializers(this, _nzSize_extraInitializers), __runInitializers(this, _nzBackdrop_initializers, false));
        nzShowSearch = (__runInitializers(this, _nzBackdrop_extraInitializers), false);
        nzPlaceHolder = '';
        nzMenuClassName;
        nzMenuStyle = null;
        /**
         * Duration in milliseconds before opening the menu when the mouse enters the trigger.
         * @default 150
         */
        nzMouseLeaveDelay = 150;
        /**
         * Duration in milliseconds before closing the menu when the mouse leaves the trigger.
         * @default 150
         */
        nzMouseEnterDelay = 150;
        nzStatus = '';
        nzMultiple = false;
        nzMaxTagCount = Infinity;
        nzPlacement = 'bottomLeft';
        nzTriggerAction = ['click'];
        nzChangeOn;
        nzLoadData;
        nzDisplayWith = (nodes) => {
            return defaultDisplayRender(nodes.map(n => this.cascaderService.getOptionLabel(n)));
        };
        // TODO: RTL
        nzSuffixIcon = 'down';
        nzExpandIcon = '';
        get nzOptions() {
            return this.cascaderService.nzOptions;
        }
        set nzOptions(options) {
            const nodes = this.coerceTreeNodes(options || []);
            this.treeService.initTree(nodes);
            this.cascaderService.columns = [nodes];
            this.updateSelectedNodes(true);
            if (this.inSearchingMode) {
                this.cascaderService.setSearchingMode(this.inSearchingMode);
                this.cascaderService.prepareSearchOptions(this.inputValue);
            }
        }
        get treeService() {
            return this.nzTreeService;
        }
        nzVisibleChange = new EventEmitter();
        nzSelectionChange = new EventEmitter();
        nzRemoved = new EventEmitter();
        nzClear = new EventEmitter();
        prefixCls = 'ant-select';
        statusCls = {};
        status = '';
        hasFeedback = false;
        /**
         * If the dropdown should show the empty content.
         * `true` if there's no options.
         */
        shouldShowEmpty = false;
        el;
        menuVisible = false;
        isLoading = false;
        labelRenderText;
        labelRenderContext = {};
        onChange = Function.prototype;
        onTouched = Function.prototype;
        positions = [...DEFAULT_CASCADER_POSITIONS];
        /**
         * Dropdown width in pixel.
         */
        dropdownWidthStyle;
        dropdownHeightStyle = '';
        dropdownPosition = 'bottomLeft';
        isFocused = false;
        locale;
        dir = 'ltr';
        isComposing = false;
        get overlayOrigin() {
            return this.elementRef;
        }
        finalSize = computed(() => {
            if (this.compactSize) {
                return this.compactSize();
            }
            return this.size();
        });
        size = signal(this.nzSize);
        compactSize = inject(NZ_SPACE_COMPACT_SIZE, { optional: true });
        inputString = '';
        isOpening = false;
        delayMenuTimer;
        delaySelectTimer;
        isNzDisableFirstChange = true;
        selectedNodes = [];
        get inSearchingMode() {
            return this.cascaderService.inSearchingMode;
        }
        set inputValue(inputValue) {
            this.inputString = inputValue;
            this.toggleSearchingMode(!!inputValue);
        }
        get inputValue() {
            return this.inputString;
        }
        get hasInput() {
            return !!this.inputValue;
        }
        get hasValue() {
            return this.cascaderService.values && this.cascaderService.values.length > 0;
        }
        get showLabelRender() {
            return !this.hasInput && !this.nzMultiple && !!this.selectedNodes.length;
        }
        get showPlaceholder() {
            return !(this.hasInput || this.hasValue);
        }
        get clearIconVisible() {
            return this.nzAllowClear && !this.nzDisabled && (this.hasValue || this.hasInput);
        }
        get isLabelRenderTemplate() {
            return !!this.nzLabelRender;
        }
        noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
        nzFormStatusService = inject(NzFormStatusService, { optional: true });
        nzFormNoStatusService = inject(NzFormNoStatusService, { optional: true });
        nzConfigService = inject(NzConfigService);
        cascaderService = inject(NzCascaderService);
        constructor(treeService, ngZone, cdr, i18nService, destroy$, elementRef, renderer, directionality) {
            super(treeService);
            this.ngZone = ngZone;
            this.cdr = cdr;
            this.i18nService = i18nService;
            this.destroy$ = destroy$;
            this.elementRef = elementRef;
            this.renderer = renderer;
            this.directionality = directionality;
            this.el = elementRef.nativeElement;
            this.cascaderService.withComponent(this);
            this.renderer.addClass(this.elementRef.nativeElement, 'ant-select');
            this.renderer.addClass(this.elementRef.nativeElement, 'ant-cascader');
        }
        ngOnInit() {
            this.nzFormStatusService?.formStatusChanges
                .pipe(distinctUntilChanged((pre, cur) => pre.status === cur.status && pre.hasFeedback === cur.hasFeedback), withLatestFrom(this.nzFormNoStatusService ? this.nzFormNoStatusService.noFormStatus : of(false)), map(([{ status, hasFeedback }, noStatus]) => ({ status: noStatus ? '' : status, hasFeedback })), takeUntil(this.destroy$))
                .subscribe(({ status, hasFeedback }) => {
                this.setStatusStyles(status, hasFeedback);
            });
            const srv = this.cascaderService;
            srv.$redraw.pipe(takeUntil(this.destroy$)).subscribe(() => {
                // These operations would not mutate data.
                this.checkChildren();
                this.setDisplayLabel();
                this.cdr.detectChanges();
                this.reposition();
                this.setDropdownStyles();
            });
            srv.$loading.pipe(takeUntil(this.destroy$)).subscribe(loading => {
                this.isLoading = loading;
            });
            srv.$nodeSelected.pipe(takeUntil(this.destroy$)).subscribe(node => {
                if (!node) {
                    this.emitValue([]);
                    this.nzSelectionChange.emit([]);
                }
                else {
                    const shouldClose = 
                    // keep menu opened if multiple mode
                    !this.nzMultiple && (node.isLeaf || (this.nzChangeOnSelect && this.nzExpandTrigger === 'hover'));
                    if (shouldClose) {
                        this.delaySetMenuVisible(false);
                    }
                    this.nzSelectionChange.emit(this.getAncestorOptionList(node));
                    this.cdr.markForCheck();
                }
            });
            srv.$quitSearching.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.inputValue = '';
                this.dropdownWidthStyle = '';
            });
            this.i18nService.localeChange.pipe(startWith(), takeUntil(this.destroy$)).subscribe(() => {
                this.setLocale();
            });
            this.size.set(this.nzSize);
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.size.set(this.nzSize);
                this.cdr.markForCheck();
            });
            this.dir = this.directionality.value;
            this.directionality.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.dir = this.directionality.value;
                srv.$redraw.next();
            });
            this.setupSelectionChangeListener();
            this.setupChangeListener();
            this.setupKeydownListener();
            this.setupFocusListener();
        }
        ngOnChanges(changes) {
            const { nzStatus, nzSize, nzPlacement } = changes;
            if (nzStatus) {
                this.setStatusStyles(this.nzStatus, this.hasFeedback);
            }
            if (nzSize) {
                this.size.set(nzSize.currentValue);
            }
            if (nzPlacement) {
                const { currentValue } = nzPlacement;
                this.dropdownPosition = currentValue;
                const listOfPlacement = ['bottomLeft', 'topLeft', 'bottomRight', 'topRight'];
                if (currentValue && listOfPlacement.includes(currentValue)) {
                    this.positions = [POSITION_MAP[currentValue]];
                }
                else {
                    this.positions = listOfPlacement.map(e => POSITION_MAP[e]);
                }
            }
        }
        ngOnDestroy() {
            this.clearDelayMenuTimer();
            this.clearDelaySelectTimer();
        }
        registerOnChange(fn) {
            this.onChange = fn;
        }
        registerOnTouched(fn) {
            this.onTouched = fn;
        }
        writeValue(value) {
            if (isNotNil(value)) {
                if (this.nzMultiple) {
                    this.cascaderService.values = toArray(value);
                }
                else {
                    this.cascaderService.values = [toArray(value)];
                }
                // need clear selected nodes when user set value before updating
                this.clearSelectedNodes();
                this.updateSelectedNodes(true, false);
            }
            else {
                this.cascaderService.values = [];
                this.clearSelectedNodes();
                this.selectedNodes = [];
                this.cascaderService.$redraw.next();
            }
        }
        setupSelectionChangeListener() {
            merge(this.nzSelectionChange, this.nzRemoved, this.nzClear)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.updateSelectedNodes();
                this.emitValue(this.cascaderService.values);
                this.cascaderService.$redraw.next();
            });
        }
        delaySetMenuVisible(visible, delay = 100, setOpening = false) {
            this.clearDelayMenuTimer();
            if (delay) {
                if (visible && setOpening) {
                    this.isOpening = true;
                }
                this.delayMenuTimer = setTimeout(() => {
                    this.setMenuVisible(visible);
                    this.cdr.detectChanges();
                    this.clearDelayMenuTimer();
                    if (visible) {
                        setTimeout(() => {
                            this.isOpening = false;
                        }, 100);
                    }
                }, delay);
            }
            else {
                this.setMenuVisible(visible);
            }
        }
        setMenuVisible(visible) {
            if (this.nzDisabled || this.menuVisible === visible) {
                return;
            }
            if (visible) {
                this.cascaderService.$redraw.next();
                this.updateSelectedNodes(!!this.nzLoadData);
                this.scrollToActivatedOptions();
            }
            else {
                this.inputValue = '';
            }
            this.menuVisible = visible;
            this.nzVisibleChange.emit(visible);
            this.cdr.detectChanges();
        }
        clearDelayMenuTimer() {
            if (this.delayMenuTimer) {
                clearTimeout(this.delayMenuTimer);
                this.delayMenuTimer = undefined;
            }
        }
        clearSelection(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            this.clearSelectedNodes();
            this.labelRenderText = '';
            this.labelRenderContext = {};
            this.inputValue = '';
            this.setMenuVisible(false);
            this.cascaderService.clear();
            this.nzClear.emit();
        }
        clearSelectedNodes() {
            this.selectedNodes.forEach(node => {
                this.removeSelected(node, false);
            });
        }
        emitValue(values) {
            if (this.nzMultiple) {
                this.onChange(values);
            }
            else {
                this.onChange(values?.length ? values[0] : []);
            }
        }
        /**
         * @internal
         */
        getSubmitValue() {
            if (this.nzMultiple) {
                return this.cascaderService.values;
            }
            else {
                return this.cascaderService.values?.length ? this.cascaderService.values[0] : [];
            }
        }
        focus() {
            if (!this.isFocused) {
                (this.input?.nativeElement || this.el).focus();
                this.isFocused = true;
            }
        }
        blur() {
            if (this.isFocused) {
                (this.input?.nativeElement || this.el).blur();
                this.isFocused = false;
            }
        }
        handleInputBlur() {
            this.menuVisible ? this.focus() : this.blur();
        }
        handleInputFocus() {
            this.focus();
        }
        isComposingChange(isComposing) {
            this.isComposing = isComposing;
        }
        onTriggerClick() {
            if (this.nzDisabled) {
                return;
            }
            if (this.nzShowSearch) {
                this.focus();
            }
            if (this.isActionTrigger('click')) {
                this.delaySetMenuVisible(!this.menuVisible, 100);
            }
            this.onTouched();
        }
        onTriggerMouseEnter() {
            if (this.nzDisabled || !this.isActionTrigger('hover')) {
                return;
            }
            this.delaySetMenuVisible(true, this.nzMouseEnterDelay, true);
        }
        onTriggerMouseLeave(event) {
            if (this.nzDisabled || !this.menuVisible || this.isOpening || !this.isActionTrigger('hover')) {
                event.preventDefault();
                return;
            }
            const mouseTarget = event.relatedTarget;
            const hostEl = this.el;
            const menuEl = this.menu && this.menu.nativeElement;
            if (hostEl.contains(mouseTarget) || (menuEl && menuEl.contains(mouseTarget))) {
                return;
            }
            this.delaySetMenuVisible(false, this.nzMouseLeaveDelay);
        }
        onOptionMouseEnter(node, columnIndex, event) {
            event.preventDefault();
            if (this.nzExpandTrigger === 'hover') {
                if (!node.isLeaf) {
                    this.delaySetOptionActivated(node, columnIndex, false);
                }
                else {
                    this.cascaderService.setNodeDeactivatedSinceColumn(columnIndex);
                }
            }
        }
        onOptionMouseLeave(node, _columnIndex, event) {
            event.preventDefault();
            if (this.nzExpandTrigger === 'hover' && !node.isLeaf) {
                this.clearDelaySelectTimer();
            }
        }
        /**
         * Get ancestor options of a node
         */
        getAncestorOptionList(node) {
            const ancestors = this.treeService.getAncestorNodeList(node);
            return this.treeService.toOptions(ancestors);
        }
        updateSelectedNodes(init = false, updateValue = true) {
            const value = this.cascaderService.values;
            const multiple = this.nzMultiple;
            /**
             * Update selected nodes and emit value
             * @param shouldUpdateValue if false, only update selected nodes
             */
            const updateNodesAndValue = (shouldUpdateValue) => {
                this.selectedNodes = [...(this.nzMultiple ? this.getCheckedNodeList() : this.getSelectedNodeList())].sort((a, b) => {
                    const indexA = value.indexOf(a.key);
                    const indexB = value.indexOf(b.key);
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }
                    if (indexA !== -1) {
                        return -1;
                    }
                    if (indexB !== -1) {
                        return 1;
                    }
                    return 0;
                });
                if (shouldUpdateValue) {
                    this.cascaderService.values = this.selectedNodes.map(node => this.getAncestorOptionList(node).map(o => this.cascaderService.getOptionValue(o)));
                }
                this.cascaderService.$redraw.next();
            };
            if (init) {
                const defaultValue = value[0];
                const lastColumnIndex = defaultValue?.length ? defaultValue.length - 1 : 0;
                this.treeService.fieldNames = {
                    value: this.nzValueProperty,
                    label: this.nzLabelProperty
                };
                this.treeService.isMultiple = multiple;
                this.treeService.isCheckStrictly = false;
                /**
                 * check whether the node is checked or selected according to the value
                 */
                const checkNodeStates = () => {
                    if (multiple) {
                        this.treeService.conductCheckPaths(value, this.treeService.isCheckStrictly);
                    }
                    else {
                        this.treeService.conductSelectedPaths(value);
                    }
                };
                const initColumnWithIndex = (columnIndex = 0) => {
                    const activatedOptionSetter = () => {
                        const currentValue = defaultValue?.[columnIndex];
                        if (!isNotNil(currentValue)) {
                            this.cascaderService.$redraw.next();
                            return;
                        }
                        const node = this.cascaderService.columns[columnIndex].find(n => this.cascaderService.getOptionValue(n.origin) === currentValue) || null;
                        if (isNotNil(node)) {
                            this.cascaderService.setNodeActivated(node, columnIndex, false, multiple, false);
                            // Load next level options till leaf node
                            if (columnIndex < lastColumnIndex) {
                                initColumnWithIndex(columnIndex + 1);
                            }
                        }
                        checkNodeStates();
                        updateNodesAndValue(false);
                    };
                    if (this.cascaderService.isLoaded(columnIndex) || !this.nzLoadData) {
                        activatedOptionSetter();
                    }
                    else {
                        const node = this.cascaderService.activatedNodes[columnIndex - 1];
                        this.cascaderService.loadChildren(node, columnIndex - 1, activatedOptionSetter);
                    }
                };
                // if nzLoadData set, load first level data asynchronously
                if (this.nzLoadData) {
                    initColumnWithIndex();
                }
                else {
                    const nodes = this.coerceTreeNodes(this.nzOptions || []);
                    this.treeService.initTree(nodes);
                    this.cascaderService.setColumnData(nodes, 0);
                    initColumnWithIndex();
                }
            }
            updateNodesAndValue(updateValue);
        }
        onOptionClick(node, columnIndex, event) {
            if (event) {
                event.preventDefault();
            }
            if (node && node.isDisabled) {
                return;
            }
            this.el.focus();
            // for multiple mode, click the leaf node can be seen as check action
            if (this.nzMultiple && node.isLeaf) {
                this.onOptionCheck(node, columnIndex, true);
            }
            else {
                this.inSearchingMode
                    ? this.cascaderService.setSearchOptionSelected(node, this.nzMultiple)
                    : this.cascaderService.setNodeActivated(node, columnIndex, !this.nzMultiple);
            }
        }
        onOptionCheck(node, columnIndex, performActivate = false) {
            if (!this.nzMultiple || node.isDisabled || node.isDisableCheckbox) {
                return;
            }
            node.isChecked = !node.isChecked;
            node.isHalfChecked = false;
            this.treeService.setCheckedNodeList(node);
            this.treeService.conduct(node, this.treeService.isCheckStrictly);
            if (this.inSearchingMode) {
                this.cascaderService.setSearchOptionSelected(node, true);
            }
            else if (performActivate) {
                this.cascaderService.setNodeActivated(node, columnIndex, true, true);
            }
            else {
                // only update selected nodes and not set node activated by default
                this.cascaderService.setNodeSelected(node, columnIndex, true);
            }
        }
        removeSelected(node, emitEvent = true) {
            node.isSelected = false;
            node.isChecked = false;
            if (this.nzMultiple) {
                this.treeService.conduct(node, this.treeService.isCheckStrictly);
            }
            this.treeService.setSelectedNodeList(node, this.nzMultiple);
            if (emitEvent) {
                this.nzRemoved.emit(node.origin);
            }
        }
        onClickOutside(event) {
            const target = _getEventTarget(event);
            if (!this.el.contains(target)) {
                this.closeMenu();
            }
        }
        onPositionChange(position) {
            const placement = getPlacementName(position);
            this.dropdownPosition = placement;
        }
        isActionTrigger(action) {
            return typeof this.nzTriggerAction === 'string'
                ? this.nzTriggerAction === action
                : this.nzTriggerAction.indexOf(action) !== -1;
        }
        onEnter() {
            const columnIndex = Math.max(this.cascaderService.activatedNodes.length - 1, 0);
            const node = this.cascaderService.activatedNodes[columnIndex];
            if (node && !node.isDisabled) {
                this.inSearchingMode
                    ? this.cascaderService.setSearchOptionSelected(node)
                    : this.cascaderService.setNodeActivated(node, columnIndex, true);
            }
        }
        moveUpOrDown(isUp) {
            const columnIndex = Math.max(this.cascaderService.activatedNodes.length - 1, 0);
            const activatedNode = this.cascaderService.activatedNodes[columnIndex];
            const options = this.cascaderService.columns[columnIndex] || [];
            const length = options.length;
            let nextIndex = -1;
            if (!activatedNode) {
                // Not selected options in this column
                nextIndex = isUp ? length : -1;
            }
            else {
                nextIndex = options.indexOf(activatedNode);
            }
            while (true) {
                nextIndex = isUp ? nextIndex - 1 : nextIndex + 1;
                if (nextIndex < 0 || nextIndex >= length) {
                    break;
                }
                const nextOption = options[nextIndex];
                if (!nextOption || nextOption.isDisabled) {
                    continue;
                }
                this.cascaderService.setNodeActivated(nextOption, columnIndex);
                break;
            }
        }
        moveLeft() {
            const options = this.cascaderService.activatedNodes;
            if (options.length) {
                options.pop(); // Remove the last one
                this.cascaderService.setNodeDeactivatedSinceColumn(options.length); // collapse menu
            }
        }
        moveRight() {
            const length = this.cascaderService.activatedNodes.length;
            const options = this.cascaderService.columns[length];
            if (options && options.length) {
                const nextOpt = options.find(o => !o.isDisabled);
                if (nextOpt) {
                    this.cascaderService.setNodeActivated(nextOpt, length);
                }
            }
        }
        clearDelaySelectTimer() {
            if (this.delaySelectTimer) {
                clearTimeout(this.delaySelectTimer);
                this.delaySelectTimer = undefined;
            }
        }
        delaySetOptionActivated(node, columnIndex, performSelect) {
            this.clearDelaySelectTimer();
            this.delaySelectTimer = setTimeout(() => {
                this.cascaderService.setNodeActivated(node, columnIndex, performSelect, this.nzMultiple);
                this.delaySelectTimer = undefined;
            }, 150);
        }
        toggleSearchingMode(toSearching) {
            if (this.inSearchingMode !== toSearching) {
                this.cascaderService.setSearchingMode(toSearching);
            }
            if (this.inSearchingMode) {
                this.cascaderService.prepareSearchOptions(this.inputValue);
            }
        }
        isOptionActivated(node, index) {
            return this.cascaderService.activatedNodes[index] === node;
        }
        setDisabledState(isDisabled) {
            this.nzDisabled = (this.isNzDisableFirstChange && this.nzDisabled) || isDisabled;
            this.isNzDisableFirstChange = false;
            if (this.nzDisabled) {
                this.closeMenu();
            }
        }
        closeMenu() {
            this.blur();
            this.clearDelayMenuTimer();
            this.setMenuVisible(false);
            // if select none, clear previous state
            if (!this.hasValue && this.cascaderService.columns.length) {
                this.cascaderService.dropBehindColumns(0);
            }
        }
        /**
         * Reposition the cascader panel. When a menu opens, the cascader expands
         * and may exceed the boundary of browser's window.
         */
        reposition() {
            if (this.overlay && this.overlay.overlayRef && this.menuVisible) {
                Promise.resolve().then(() => {
                    this.overlay.overlayRef.updatePosition();
                    this.cdr.markForCheck();
                });
            }
        }
        /**
         * When a cascader options is changed, a child needs to know that it should re-render.
         */
        checkChildren() {
            if (this.cascaderItems) {
                this.cascaderItems.forEach(item => item.markForCheck());
            }
        }
        setDisplayLabel() {
            if (this.nzMultiple) {
                return;
            }
            const node = this.selectedNodes.length ? this.selectedNodes[0] : null;
            const selectedOptions = this.getAncestorOptionList(node);
            const labels = selectedOptions.map(o => this.cascaderService.getOptionLabel(o));
            if (this.isLabelRenderTemplate) {
                this.labelRenderContext = { labels, selectedOptions };
            }
            this.labelRenderText = defaultDisplayRender.call(this, labels);
        }
        setDropdownStyles() {
            const firstColumn = this.cascaderService.columns[0];
            this.shouldShowEmpty =
                (this.inSearchingMode && (!firstColumn || !firstColumn.length)) || // Should show empty when there's no searching result
                    (!(this.nzOptions && this.nzOptions.length) && !this.nzLoadData); // Should show when there's no options and developer does not use nzLoadData
            this.dropdownHeightStyle = this.shouldShowEmpty ? 'auto' : '';
            if (this.input) {
                this.dropdownWidthStyle =
                    this.inSearchingMode || this.shouldShowEmpty ? `${this.selectContainer.nativeElement.offsetWidth}px` : '';
            }
        }
        setStatusStyles(status, hasFeedback) {
            // set inner status
            this.status = status;
            this.hasFeedback = hasFeedback;
            this.cdr.markForCheck();
            // render status if nzStatus is set
            this.statusCls = getStatusClassNames(this.prefixCls, status, hasFeedback);
            Object.keys(this.statusCls).forEach(status => {
                if (this.statusCls[status]) {
                    this.renderer.addClass(this.elementRef.nativeElement, status);
                }
                else {
                    this.renderer.removeClass(this.elementRef.nativeElement, status);
                }
            });
        }
        setLocale() {
            this.locale = this.i18nService.getLocaleData('global');
            this.cdr.markForCheck();
        }
        scrollToActivatedOptions() {
            // The `scrollIntoView` is a native DOM API, which doesn't require Angular to run
            // a change detection when a promise microtask is resolved.
            this.ngZone.runOutsideAngular(() => {
                Promise.resolve().then(() => {
                    // scroll only until option menu view is ready
                    this.cascaderItems
                        .toArray()
                        .filter(e => e.activated)
                        .forEach(e => {
                        e.nativeElement.scrollIntoView({ block: 'start', inline: 'nearest' });
                    });
                });
            });
        }
        setupChangeListener() {
            this.input$
                .pipe(switchMap(input => fromEventOutsideAngular(input?.nativeElement, 'change')), takeUntil(this.destroy$))
                .subscribe(event => event.stopPropagation());
        }
        setupFocusListener() {
            this.input$
                .pipe(switchMap(input => fromEventOutsideAngular(input?.nativeElement, 'focus')), takeUntil(this.destroy$))
                .subscribe(() => this.handleInputFocus());
            this.input$
                .pipe(switchMap(input => fromEventOutsideAngular(input?.nativeElement, 'blur')), takeUntil(this.destroy$))
                .subscribe(() => this.handleInputBlur());
        }
        setupKeydownListener() {
            fromEventOutsideAngular(this.el, 'keydown')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                const keyCode = event.keyCode;
                if (keyCode !== DOWN_ARROW &&
                    keyCode !== UP_ARROW &&
                    keyCode !== LEFT_ARROW &&
                    keyCode !== RIGHT_ARROW &&
                    keyCode !== ENTER &&
                    keyCode !== BACKSPACE &&
                    keyCode !== ESCAPE) {
                    return;
                }
                // Press any keys above to reopen menu.
                if (!this.menuVisible && keyCode !== BACKSPACE && keyCode !== ESCAPE) {
                    // The `setMenuVisible` runs `detectChanges()`, so we don't need to run `markForCheck()` additionally.
                    return this.ngZone.run(() => this.setMenuVisible(true));
                }
                // Make these keys work as default in searching mode.
                if (this.inSearchingMode && (keyCode === BACKSPACE || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
                    return;
                }
                if (!this.menuVisible) {
                    return;
                }
                event.preventDefault();
                this.ngZone.run(() => {
                    // Interact with the component.
                    if (keyCode === DOWN_ARROW) {
                        this.moveUpOrDown(false);
                    }
                    else if (keyCode === UP_ARROW) {
                        this.moveUpOrDown(true);
                    }
                    else if (keyCode === LEFT_ARROW) {
                        this.moveLeft();
                    }
                    else if (keyCode === RIGHT_ARROW) {
                        this.moveRight();
                    }
                    else if (keyCode === ENTER) {
                        this.onEnter();
                    }
                    // `@HostListener`s run `markForCheck()` internally before calling the actual handler so
                    // we call `markForCheck()` to be backwards-compatible.
                    this.cdr.markForCheck();
                });
            });
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderComponent, deps: [{ token: NzCascaderTreeService }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i2$1.NzI18nService }, { token: i3$1.NzDestroyService }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i4.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCascaderComponent, isStandalone: true, selector: "nz-cascader, [nz-cascader]", inputs: { nzOptionRender: "nzOptionRender", nzShowInput: ["nzShowInput", "nzShowInput", booleanAttribute], nzShowArrow: ["nzShowArrow", "nzShowArrow", booleanAttribute], nzAllowClear: ["nzAllowClear", "nzAllowClear", booleanAttribute], nzAutoFocus: ["nzAutoFocus", "nzAutoFocus", booleanAttribute], nzChangeOnSelect: ["nzChangeOnSelect", "nzChangeOnSelect", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzColumnClassName: "nzColumnClassName", nzExpandTrigger: "nzExpandTrigger", nzValueProperty: "nzValueProperty", nzLabelProperty: "nzLabelProperty", nzLabelRender: "nzLabelRender", nzNotFoundContent: "nzNotFoundContent", nzSize: "nzSize", nzBackdrop: "nzBackdrop", nzShowSearch: "nzShowSearch", nzPlaceHolder: "nzPlaceHolder", nzMenuClassName: "nzMenuClassName", nzMenuStyle: "nzMenuStyle", nzMouseLeaveDelay: ["nzMouseLeaveDelay", "nzMouseLeaveDelay", numberAttribute], nzMouseEnterDelay: ["nzMouseEnterDelay", "nzMouseEnterDelay", numberAttribute], nzStatus: "nzStatus", nzMultiple: ["nzMultiple", "nzMultiple", booleanAttribute], nzMaxTagCount: "nzMaxTagCount", nzPlacement: "nzPlacement", nzTriggerAction: "nzTriggerAction", nzChangeOn: "nzChangeOn", nzLoadData: "nzLoadData", nzDisplayWith: "nzDisplayWith", nzSuffixIcon: "nzSuffixIcon", nzExpandIcon: "nzExpandIcon", nzOptions: "nzOptions" }, outputs: { nzVisibleChange: "nzVisibleChange", nzSelectionChange: "nzSelectionChange", nzRemoved: "nzRemoved", nzClear: "nzClear" }, host: { listeners: { "click": "onTriggerClick()", "mouseenter": "onTriggerMouseEnter()", "mouseleave": "onTriggerMouseLeave($event)" }, properties: { "attr.tabIndex": "\"0\"", "class.ant-select-in-form-item": "!!nzFormStatusService", "class.ant-select-lg": "finalSize() === \"large\"", "class.ant-select-sm": "finalSize() === \"small\"", "class.ant-select-allow-clear": "nzAllowClear", "class.ant-select-show-arrow": "nzShowArrow", "class.ant-select-show-search": "!!nzShowSearch", "class.ant-select-disabled": "nzDisabled", "class.ant-select-open": "menuVisible", "class.ant-select-focused": "isFocused", "class.ant-select-multiple": "nzMultiple", "class.ant-select-single": "!nzMultiple", "class.ant-select-rtl": "dir === 'rtl'" } }, providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => NzCascaderComponent),
                    multi: true
                },
                { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'select' },
                NzCascaderService,
                NzDestroyService,
                NzCascaderTreeService
            ], viewQueries: [{ propertyName: "selectContainer", first: true, predicate: ["selectContainer"], descendants: true }, { propertyName: "input", first: true, predicate: NzSelectSearchComponent, descendants: true }, { propertyName: "menu", first: true, predicate: ["menu"], descendants: true }, { propertyName: "overlay", first: true, predicate: CdkConnectedOverlay, descendants: true }, { propertyName: "cascaderItems", predicate: NzCascaderOptionComponent, descendants: true }], exportAs: ["nzCascader"], usesInheritance: true, usesOnChanges: true, hostDirectives: [{ directive: i5.NzSpaceCompactItemDirective }], ngImport: i0, template: `
    @if (nzShowInput) {
      <div #selectContainer class="ant-select-selector">
        @if (nzMultiple) {
          @for (node of selectedNodes | slice: 0 : nzMaxTagCount; track node) {
            <nz-select-item
              [deletable]="true"
              [disabled]="nzDisabled"
              [label]="nzDisplayWith(getAncestorOptionList(node))"
              (delete)="removeSelected(node)"
            ></nz-select-item>
          }
          @if (selectedNodes.length > nzMaxTagCount) {
            <nz-select-item
              [deletable]="false"
              [disabled]="false"
              [label]="'+ ' + (selectedNodes.length - nzMaxTagCount) + ' ...'"
            ></nz-select-item>
          }
        }

        <nz-select-search
          [showInput]="!!nzShowSearch"
          (isComposingChange)="isComposingChange($event)"
          [value]="inputValue"
          (valueChange)="inputValue = $event"
          [mirrorSync]="nzMultiple"
          [disabled]="nzDisabled"
          [autofocus]="nzAutoFocus"
          [focusTrigger]="menuVisible"
        ></nz-select-search>

        @if (showPlaceholder) {
          <nz-select-placeholder
            [placeholder]="nzPlaceHolder || locale?.placeholder!"
            [style.display]="inputValue || isComposing ? 'none' : 'block'"
          ></nz-select-placeholder>
        }

        @if (showLabelRender) {
          <nz-select-item
            [deletable]="false"
            [disabled]="nzDisabled"
            [label]="labelRenderText"
            [contentTemplateOutlet]="isLabelRenderTemplate ? nzLabelRender : null"
            [contentTemplateOutletContext]="labelRenderContext"
          ></nz-select-item>
        }
      </div>

      @if (nzShowArrow) {
        <span class="ant-select-arrow" [class.ant-select-arrow-loading]="isLoading">
          @if (!isLoading) {
            <nz-icon [nzType]="$any(nzSuffixIcon)" [class.ant-cascader-picker-arrow-expand]="menuVisible" />
          } @else {
            <nz-icon nzType="loading" />
          }

          @if (hasFeedback && !!status) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
      @if (clearIconVisible) {
        <nz-select-clear (clear)="clearSelection($event)"></nz-select-clear>
      }
    }
    <ng-content></ng-content>

    <ng-template
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="overlayOrigin"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayTransformOriginOn]="'.ant-cascader-dropdown'"
      [cdkConnectedOverlayOpen]="menuVisible"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="closeMenu()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-select-dropdown ant-cascader-dropdown"
        [class.ant-select-dropdown-placement-bottomLeft]="dropdownPosition === 'bottomLeft'"
        [class.ant-select-dropdown-placement-bottomRight]="dropdownPosition === 'bottomRight'"
        [class.ant-select-dropdown-placement-topLeft]="dropdownPosition === 'topLeft'"
        [class.ant-select-dropdown-placement-topRight]="dropdownPosition === 'topRight'"
        [class.ant-cascader-dropdown-rtl]="dir === 'rtl'"
        [@slideMotion]="'enter'"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        (mouseenter)="onTriggerMouseEnter()"
        (mouseleave)="onTriggerMouseLeave($event)"
      >
        <div
          #menu
          class="ant-cascader-menus"
          [class.ant-cascader-rtl]="dir === 'rtl'"
          [class.ant-cascader-menus-hidden]="!menuVisible"
          [class.ant-cascader-menu-empty]="shouldShowEmpty"
          [class]="nzMenuClassName"
          [style]="nzMenuStyle"
        >
          @if (shouldShowEmpty) {
            <ul class="ant-cascader-menu" [style.width]="dropdownWidthStyle" [style.height]="dropdownHeightStyle">
              <li class="ant-cascader-menu-item ant-cascader-menu-item-disabled">
                <nz-embed-empty
                  class="ant-cascader-menu-item-content"
                  [nzComponentName]="'cascader'"
                  [specificContent]="nzNotFoundContent"
                />
              </li>
            </ul>
          } @else {
            @for (options of cascaderService.columns; track options; let i = $index) {
              <ul
                class="ant-cascader-menu"
                role="menuitemcheckbox"
                [class]="nzColumnClassName"
                [style.height]="dropdownHeightStyle"
              >
                @for (option of options; track option) {
                  <li
                    nz-cascader-option
                    [expandIcon]="nzExpandIcon"
                    [columnIndex]="i"
                    [nzLabelProperty]="nzLabelProperty"
                    [optionTemplate]="nzOptionRender"
                    [activated]="isOptionActivated(option, i)"
                    [highlightText]="inSearchingMode ? inputValue : ''"
                    [node]="option"
                    [dir]="dir"
                    [checkable]="nzMultiple"
                    (mouseenter)="onOptionMouseEnter(option, i, $event)"
                    (mouseleave)="onOptionMouseLeave(option, i, $event)"
                    (click)="onOptionClick(option, i, $event)"
                    (check)="onOptionCheck(option, i)"
                  ></li>
                }
              </ul>
            }
          }
        </div>
      </div>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "pipe", type: SlicePipe, name: "slice" }, { kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i6.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: i4.Dir, selector: "[dir]", inputs: ["dir"], outputs: ["dirChange"], exportAs: ["dir"] }, { kind: "ngmodule", type: FormsModule }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzEmptyModule }, { kind: "component", type: i8.NzEmbedEmptyComponent, selector: "nz-embed-empty", inputs: ["nzComponentName", "specificContent"], exportAs: ["nzEmbedEmpty"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }, { kind: "ngmodule", type: NzOverlayModule }, { kind: "directive", type: i9.NzConnectedOverlayDirective, selector: "[cdkConnectedOverlay][nzConnectedOverlay]", inputs: ["nzArrowPointAtCenter"], exportAs: ["nzConnectedOverlay"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "component", type: NzSelectClearComponent, selector: "nz-select-clear", inputs: ["clearIcon"], outputs: ["clear"] }, { kind: "component", type: NzSelectItemComponent, selector: "nz-select-item", inputs: ["disabled", "label", "deletable", "removeIcon", "contentTemplateOutletContext", "contentTemplateOutlet"], outputs: ["delete"] }, { kind: "component", type: NzSelectPlaceholderComponent, selector: "nz-select-placeholder", inputs: ["placeholder"] }, { kind: "component", type: NzSelectSearchComponent, selector: "nz-select-search", inputs: ["nzId", "disabled", "mirrorSync", "showInput", "focusTrigger", "value", "autofocus"], outputs: ["valueChange", "isComposingChange"] }, { kind: "component", type: NzCascaderOptionComponent, selector: "[nz-cascader-option]", inputs: ["optionTemplate", "node", "activated", "highlightText", "nzLabelProperty", "columnIndex", "expandIcon", "dir", "checkable"], outputs: ["check"], exportAs: ["nzCascaderOption"] }], animations: [slideMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-cascader, [nz-cascader]',
                    exportAs: 'nzCascader',
                    preserveWhitespaces: false,
                    template: `
    @if (nzShowInput) {
      <div #selectContainer class="ant-select-selector">
        @if (nzMultiple) {
          @for (node of selectedNodes | slice: 0 : nzMaxTagCount; track node) {
            <nz-select-item
              [deletable]="true"
              [disabled]="nzDisabled"
              [label]="nzDisplayWith(getAncestorOptionList(node))"
              (delete)="removeSelected(node)"
            ></nz-select-item>
          }
          @if (selectedNodes.length > nzMaxTagCount) {
            <nz-select-item
              [deletable]="false"
              [disabled]="false"
              [label]="'+ ' + (selectedNodes.length - nzMaxTagCount) + ' ...'"
            ></nz-select-item>
          }
        }

        <nz-select-search
          [showInput]="!!nzShowSearch"
          (isComposingChange)="isComposingChange($event)"
          [value]="inputValue"
          (valueChange)="inputValue = $event"
          [mirrorSync]="nzMultiple"
          [disabled]="nzDisabled"
          [autofocus]="nzAutoFocus"
          [focusTrigger]="menuVisible"
        ></nz-select-search>

        @if (showPlaceholder) {
          <nz-select-placeholder
            [placeholder]="nzPlaceHolder || locale?.placeholder!"
            [style.display]="inputValue || isComposing ? 'none' : 'block'"
          ></nz-select-placeholder>
        }

        @if (showLabelRender) {
          <nz-select-item
            [deletable]="false"
            [disabled]="nzDisabled"
            [label]="labelRenderText"
            [contentTemplateOutlet]="isLabelRenderTemplate ? nzLabelRender : null"
            [contentTemplateOutletContext]="labelRenderContext"
          ></nz-select-item>
        }
      </div>

      @if (nzShowArrow) {
        <span class="ant-select-arrow" [class.ant-select-arrow-loading]="isLoading">
          @if (!isLoading) {
            <nz-icon [nzType]="$any(nzSuffixIcon)" [class.ant-cascader-picker-arrow-expand]="menuVisible" />
          } @else {
            <nz-icon nzType="loading" />
          }

          @if (hasFeedback && !!status) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </span>
      }
      @if (clearIconVisible) {
        <nz-select-clear (clear)="clearSelection($event)"></nz-select-clear>
      }
    }
    <ng-content></ng-content>

    <ng-template
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayOrigin]="overlayOrigin"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayTransformOriginOn]="'.ant-cascader-dropdown'"
      [cdkConnectedOverlayOpen]="menuVisible"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="closeMenu()"
      (positionChange)="onPositionChange($event)"
    >
      <div
        class="ant-select-dropdown ant-cascader-dropdown"
        [class.ant-select-dropdown-placement-bottomLeft]="dropdownPosition === 'bottomLeft'"
        [class.ant-select-dropdown-placement-bottomRight]="dropdownPosition === 'bottomRight'"
        [class.ant-select-dropdown-placement-topLeft]="dropdownPosition === 'topLeft'"
        [class.ant-select-dropdown-placement-topRight]="dropdownPosition === 'topRight'"
        [class.ant-cascader-dropdown-rtl]="dir === 'rtl'"
        [@slideMotion]="'enter'"
        [@.disabled]="!!noAnimation?.nzNoAnimation"
        [nzNoAnimation]="noAnimation?.nzNoAnimation"
        (mouseenter)="onTriggerMouseEnter()"
        (mouseleave)="onTriggerMouseLeave($event)"
      >
        <div
          #menu
          class="ant-cascader-menus"
          [class.ant-cascader-rtl]="dir === 'rtl'"
          [class.ant-cascader-menus-hidden]="!menuVisible"
          [class.ant-cascader-menu-empty]="shouldShowEmpty"
          [class]="nzMenuClassName"
          [style]="nzMenuStyle"
        >
          @if (shouldShowEmpty) {
            <ul class="ant-cascader-menu" [style.width]="dropdownWidthStyle" [style.height]="dropdownHeightStyle">
              <li class="ant-cascader-menu-item ant-cascader-menu-item-disabled">
                <nz-embed-empty
                  class="ant-cascader-menu-item-content"
                  [nzComponentName]="'cascader'"
                  [specificContent]="nzNotFoundContent"
                />
              </li>
            </ul>
          } @else {
            @for (options of cascaderService.columns; track options; let i = $index) {
              <ul
                class="ant-cascader-menu"
                role="menuitemcheckbox"
                [class]="nzColumnClassName"
                [style.height]="dropdownHeightStyle"
              >
                @for (option of options; track option) {
                  <li
                    nz-cascader-option
                    [expandIcon]="nzExpandIcon"
                    [columnIndex]="i"
                    [nzLabelProperty]="nzLabelProperty"
                    [optionTemplate]="nzOptionRender"
                    [activated]="isOptionActivated(option, i)"
                    [highlightText]="inSearchingMode ? inputValue : ''"
                    [node]="option"
                    [dir]="dir"
                    [checkable]="nzMultiple"
                    (mouseenter)="onOptionMouseEnter(option, i, $event)"
                    (mouseleave)="onOptionMouseLeave(option, i, $event)"
                    (click)="onOptionClick(option, i, $event)"
                    (check)="onOptionCheck(option, i)"
                  ></li>
                }
              </ul>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
                    animations: [slideMotion],
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzCascaderComponent),
                            multi: true
                        },
                        { provide: NZ_SPACE_COMPACT_ITEM_TYPE, useValue: 'select' },
                        NzCascaderService,
                        NzDestroyService,
                        NzCascaderTreeService
                    ],
                    host: {
                        '[attr.tabIndex]': '"0"',
                        '[class.ant-select-in-form-item]': '!!nzFormStatusService',
                        '[class.ant-select-lg]': 'finalSize() === "large"',
                        '[class.ant-select-sm]': 'finalSize() === "small"',
                        '[class.ant-select-allow-clear]': 'nzAllowClear',
                        '[class.ant-select-show-arrow]': 'nzShowArrow',
                        '[class.ant-select-show-search]': '!!nzShowSearch',
                        '[class.ant-select-disabled]': 'nzDisabled',
                        '[class.ant-select-open]': 'menuVisible',
                        '[class.ant-select-focused]': 'isFocused',
                        '[class.ant-select-multiple]': 'nzMultiple',
                        '[class.ant-select-single]': '!nzMultiple',
                        '[class.ant-select-rtl]': `dir === 'rtl'`
                    },
                    hostDirectives: [NzSpaceCompactItemDirective],
                    imports: [
                        SlicePipe,
                        OverlayModule,
                        FormsModule,
                        NzIconModule,
                        NzEmptyModule,
                        NzFormItemFeedbackIconComponent,
                        NzOverlayModule,
                        NzNoAnimationDirective,
                        NzSelectClearComponent,
                        NzSelectItemComponent,
                        NzSelectPlaceholderComponent,
                        NzSelectSearchComponent,
                        NzCascaderOptionComponent
                    ]
                }]
        }], ctorParameters: () => [{ type: NzCascaderTreeService }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i2$1.NzI18nService }, { type: i3$1.NzDestroyService }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i4.Directionality }], propDecorators: { selectContainer: [{
                type: ViewChild,
                args: ['selectContainer', { static: false }]
            }], input: [{
                type: ViewChild,
                args: [NzSelectSearchComponent]
            }], menu: [{
                type: ViewChild,
                args: ['menu', { static: false }]
            }], overlay: [{
                type: ViewChild,
                args: [CdkConnectedOverlay, { static: false }]
            }], cascaderItems: [{
                type: ViewChildren,
                args: [NzCascaderOptionComponent]
            }], nzOptionRender: [{
                type: Input
            }], nzShowInput: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowArrow: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAllowClear: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAutoFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzChangeOnSelect: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzColumnClassName: [{
                type: Input
            }], nzExpandTrigger: [{
                type: Input
            }], nzValueProperty: [{
                type: Input
            }], nzLabelProperty: [{
                type: Input
            }], nzLabelRender: [{
                type: Input
            }], nzNotFoundContent: [{
                type: Input
            }], nzSize: [{
                type: Input
            }], nzBackdrop: [{
                type: Input
            }], nzShowSearch: [{
                type: Input
            }], nzPlaceHolder: [{
                type: Input
            }], nzMenuClassName: [{
                type: Input
            }], nzMenuStyle: [{
                type: Input
            }], nzMouseLeaveDelay: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzMouseEnterDelay: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], nzStatus: [{
                type: Input
            }], nzMultiple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMaxTagCount: [{
                type: Input
            }], nzPlacement: [{
                type: Input
            }], nzTriggerAction: [{
                type: Input
            }], nzChangeOn: [{
                type: Input
            }], nzLoadData: [{
                type: Input
            }], nzDisplayWith: [{
                type: Input
            }], nzSuffixIcon: [{
                type: Input
            }], nzExpandIcon: [{
                type: Input
            }], nzOptions: [{
                type: Input
            }], nzVisibleChange: [{
                type: Output
            }], nzSelectionChange: [{
                type: Output
            }], nzRemoved: [{
                type: Output
            }], nzClear: [{
                type: Output
            }], onTriggerClick: [{
                type: HostListener,
                args: ['click']
            }], onTriggerMouseEnter: [{
                type: HostListener,
                args: ['mouseenter']
            }], onTriggerMouseLeave: [{
                type: HostListener,
                args: ['mouseleave', ['$event']]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCascaderModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderModule, imports: [NzCascaderComponent], exports: [NzCascaderComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderModule, imports: [NzCascaderComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCascaderModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCascaderComponent],
                    exports: [NzCascaderComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzCascaderComponent, NzCascaderModule, NzCascaderOptionComponent, NzCascaderService, isChildNode, isParentNode, isShowSearchObject };
//# sourceMappingURL=ng-zorro-antd-cascader.mjs.map
