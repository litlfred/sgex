import * as i0 from '@angular/core';
import { EventEmitter, booleanAttribute, Output, Input, ChangeDetectionStrategy, Component, inject, Directive, forwardRef, Renderer2, ChangeDetectorRef, numberAttribute, ViewChild, ViewEncapsulation, NgModule } from '@angular/core';
import { takeUntil, auditTime, filter, take, map } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import { Subject, animationFrameScheduler, asapScheduler, merge, BehaviorSubject } from 'rxjs';
import { CdkTreeNode, CdkTree, CdkTreeNodeToggle, CdkTreeNodeDef, CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet, CdkTreeNodePadding, CdkTreeNodeOutletContext } from '@angular/cdk/tree';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import * as i1$1 from '@angular/cdk/bidi';
import { treeCollapseMotion } from 'ng-zorro-antd/core/animation';
import { CdkVirtualForOf, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';
import { DataSource } from '@angular/cdk/collections';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeCheckboxComponent {
    ngZone;
    ref;
    host;
    destroy$;
    nzChecked;
    nzIndeterminate;
    nzDisabled;
    nzClick = new EventEmitter();
    constructor(ngZone, ref, host, destroy$) {
        this.ngZone = ngZone;
        this.ref = ref;
        this.host = host;
        this.destroy$ = destroy$;
    }
    ngOnInit() {
        fromEventOutsideAngular(this.host.nativeElement, 'click')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event) => {
            if (!this.nzDisabled && this.nzClick.observers.length) {
                this.ngZone.run(() => {
                    this.nzClick.emit(event);
                    this.ref.markForCheck();
                });
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeCheckboxComponent, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i1.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeNodeCheckboxComponent, isStandalone: true, selector: "nz-tree-node-checkbox:not([builtin])", inputs: { nzChecked: ["nzChecked", "nzChecked", booleanAttribute], nzIndeterminate: ["nzIndeterminate", "nzIndeterminate", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute] }, outputs: { nzClick: "nzClick" }, host: { properties: { "class.ant-tree-checkbox-checked": "nzChecked", "class.ant-tree-checkbox-indeterminate": "nzIndeterminate", "class.ant-tree-checkbox-disabled": "nzDisabled" }, classAttribute: "ant-tree-checkbox" }, providers: [NzDestroyService], ngImport: i0, template: ` <span class="ant-tree-checkbox-inner"></span> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeCheckboxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-checkbox:not([builtin])',
                    template: ` <span class="ant-tree-checkbox-inner"></span> `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        class: 'ant-tree-checkbox',
                        '[class.ant-tree-checkbox-checked]': `nzChecked`,
                        '[class.ant-tree-checkbox-indeterminate]': `nzIndeterminate`,
                        '[class.ant-tree-checkbox-disabled]': `nzDisabled`
                    },
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i1.NzDestroyService }], propDecorators: { nzChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIndeterminate: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClick: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const getParent = (nodes, node, getLevel) => {
    let index = nodes.indexOf(node);
    if (index < 0) {
        return null;
    }
    const level = getLevel(node);
    for (index--; index >= 0; index--) {
        const preLevel = getLevel(nodes[index]);
        if (preLevel + 1 === level) {
            return nodes[index];
        }
        if (preLevel + 1 < level) {
            return null;
        }
    }
    return null;
};
const getNextSibling = (nodes, node, getLevel, _index) => {
    let index = typeof _index !== 'undefined' ? _index : nodes.indexOf(node);
    if (index < 0) {
        return null;
    }
    const level = getLevel(node);
    for (index++; index < nodes.length; index++) {
        const nextLevel = getLevel(nodes[index]);
        if (nextLevel < level) {
            return null;
        }
        if (nextLevel === level) {
            return nodes[index];
        }
    }
    return null;
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzNodeBase extends CdkTreeNode {
}

// eslint-disable-next-line @angular-eslint/component-class-suffix
class NzTreeView extends CdkTree {
    differs;
    changeDetectorRef;
    directionality;
    destroy$ = new Subject();
    dir = 'ltr';
    _dataSourceChanged = new Subject();
    // eslint-disable-next-line @angular-eslint/no-input-rename
    treeControl = undefined;
    get dataSource() {
        return super.dataSource;
    }
    set dataSource(dataSource) {
        super.dataSource = dataSource;
    }
    nzDirectoryTree = false;
    nzBlockNode = false;
    noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
    constructor(differs, changeDetectorRef, directionality) {
        super(differs, changeDetectorRef, directionality);
        this.differs = differs;
        this.changeDetectorRef = changeDetectorRef;
        this.directionality = directionality;
    }
    ngOnInit() {
        super.ngOnInit();
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.changeDetectorRef.detectChanges();
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    renderNodeChanges(data, dataDiffer, viewContainer, parentData) {
        super.renderNodeChanges(data, dataDiffer, viewContainer, parentData);
        this._dataSourceChanged.next();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeView, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }, { token: i1$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeView, isStandalone: true, selector: "ng-component", inputs: { treeControl: ["nzTreeControl", "treeControl"], dataSource: ["nzDataSource", "dataSource"], nzDirectoryTree: ["nzDirectoryTree", "nzDirectoryTree", booleanAttribute], nzBlockNode: ["nzBlockNode", "nzBlockNode", booleanAttribute] }, usesInheritance: true, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeView, decorators: [{
            type: Component,
            args: [{
                    template: ''
                }]
        }], ctorParameters: () => [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }, { type: i1$1.Directionality }], propDecorators: { treeControl: [{
                type: Input,
                args: ['nzTreeControl']
            }], dataSource: [{
                type: Input,
                args: ['nzDataSource']
            }], nzDirectoryTree: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBlockNode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * [true, false, false, true] => 1001
 */
function booleanArrayToString(arr) {
    return arr.map(i => (i ? 1 : 0)).join('');
}
const BUILD_INDENTS_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
class NzTreeNodeIndentsComponent {
    indents = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeIndentsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeNodeIndentsComponent, isStandalone: true, selector: "nz-tree-node-indents", inputs: { indents: "indents" }, host: { classAttribute: "ant-tree-indent" }, ngImport: i0, template: `
    @for (isEnd of indents; track isEnd) {
      <span class="ant-tree-indent-unit" [class.ant-tree-indent-unit-end]="!isEnd"></span>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeIndentsComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-indents',
                    template: `
    @for (isEnd of indents; track isEnd) {
      <span class="ant-tree-indent-unit" [class.ant-tree-indent-unit-end]="!isEnd"></span>
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'ant-tree-indent'
                    }
                }]
        }], propDecorators: { indents: [{
                type: Input
            }] } });
class NzTreeNodeIndentLineDirective {
    treeNode;
    tree;
    cdr;
    isLast = 'unset';
    isLeaf = false;
    preNodeRef = null;
    nextNodeRef = null;
    currentIndents = '';
    changeSubscription;
    constructor(treeNode, tree, cdr) {
        this.treeNode = treeNode;
        this.tree = tree;
        this.cdr = cdr;
        this.buildIndents();
        this.checkLast();
        /**
         * The dependent data (TreeControl.dataNodes) can be set after node instantiation,
         * and setting the indents can cause frame rate loss if it is set too often.
         */
        this.changeSubscription = merge(this.treeNode._dataChanges, tree._dataSourceChanged)
            .pipe(auditTime(0, BUILD_INDENTS_SCHEDULER))
            .subscribe(() => {
            this.buildIndents();
            this.checkAdjacent();
            this.cdr.markForCheck();
        });
    }
    getIndents() {
        const indents = [];
        if (!this.tree.treeControl) {
            return indents;
        }
        const nodes = this.tree.treeControl.dataNodes;
        const getLevel = this.tree.treeControl.getLevel;
        let parent = getParent(nodes, this.treeNode.data, getLevel);
        while (parent) {
            const parentNextSibling = getNextSibling(nodes, parent, getLevel);
            if (parentNextSibling) {
                indents.unshift(true);
            }
            else {
                indents.unshift(false);
            }
            parent = getParent(nodes, parent, getLevel);
        }
        return indents;
    }
    buildIndents() {
        if (this.treeNode.data) {
            const indents = this.getIndents();
            const diffString = booleanArrayToString(indents);
            if (diffString !== this.currentIndents) {
                this.treeNode.setIndents(this.getIndents());
                this.currentIndents = diffString;
            }
        }
    }
    /**
     * We need to add an class name for the last child node,
     * this result can also be affected when the adjacent nodes are changed.
     */
    checkAdjacent() {
        const nodes = this.tree.treeControl?.dataNodes || [];
        const index = nodes.indexOf(this.treeNode.data);
        const preNode = nodes[index - 1] || null;
        const nextNode = nodes[index + 1] || null;
        if (this.nextNodeRef !== nextNode || this.preNodeRef !== preNode) {
            this.checkLast(index);
        }
        this.preNodeRef = preNode;
        this.nextNodeRef = nextNode;
    }
    checkLast(index) {
        const nodes = this.tree.treeControl?.dataNodes || [];
        this.isLeaf = this.treeNode.isLeaf;
        this.isLast =
            !!this.tree.treeControl && !getNextSibling(nodes, this.treeNode.data, this.tree.treeControl.getLevel, index);
    }
    ngOnDestroy() {
        this.preNodeRef = null;
        this.nextNodeRef = null;
        this.changeSubscription.unsubscribe();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeIndentLineDirective, deps: [{ token: NzNodeBase }, { token: NzTreeView }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeIndentLineDirective, isStandalone: true, selector: "nz-tree-node[nzTreeNodeIndentLine]", host: { properties: { "class.ant-tree-treenode-leaf-last": "isLast && isLeaf" }, classAttribute: "ant-tree-show-line" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeIndentLineDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-tree-node[nzTreeNodeIndentLine]',
                    host: {
                        class: 'ant-tree-show-line',
                        '[class.ant-tree-treenode-leaf-last]': 'isLast && isLeaf'
                    }
                }]
        }], ctorParameters: () => [{ type: NzNodeBase }, { type: NzTreeView }, { type: i0.ChangeDetectorRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeNoopToggleDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeNoopToggleDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeNoopToggleDirective, isStandalone: true, selector: "nz-tree-node-toggle[nzTreeNodeNoopToggle], [nzTreeNodeNoopToggle]", host: { classAttribute: "ant-tree-switcher ant-tree-switcher-noop" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeNoopToggleDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-tree-node-toggle[nzTreeNodeNoopToggle], [nzTreeNodeNoopToggle]',
                    host: {
                        class: 'ant-tree-switcher ant-tree-switcher-noop'
                    }
                }]
        }] });
class NzTreeNodeToggleDirective extends CdkTreeNodeToggle {
    recursive = false;
    get isExpanded() {
        return this._treeNode.isExpanded;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeNodeToggleDirective, isStandalone: true, selector: "nz-tree-node-toggle:not([nzTreeNodeNoopToggle]), [nzTreeNodeToggle]", inputs: { recursive: ["nzTreeNodeToggleRecursive", "recursive", booleanAttribute] }, host: { properties: { "class.ant-tree-switcher_open": "isExpanded", "class.ant-tree-switcher_close": "!isExpanded" }, classAttribute: "ant-tree-switcher" }, providers: [{ provide: CdkTreeNodeToggle, useExisting: forwardRef(() => NzTreeNodeToggleDirective) }], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-tree-node-toggle:not([nzTreeNodeNoopToggle]), [nzTreeNodeToggle]',
                    providers: [{ provide: CdkTreeNodeToggle, useExisting: forwardRef(() => NzTreeNodeToggleDirective) }],
                    host: {
                        class: 'ant-tree-switcher',
                        '[class.ant-tree-switcher_open]': 'isExpanded',
                        '[class.ant-tree-switcher_close]': '!isExpanded'
                    }
                }]
        }], propDecorators: { recursive: [{
                type: Input,
                args: [{ alias: 'nzTreeNodeToggleRecursive', transform: booleanAttribute }]
            }] } });
class NzTreeNodeToggleRotateIconDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleRotateIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeToggleRotateIconDirective, isStandalone: true, selector: "[nzTreeNodeToggleRotateIcon]", host: { classAttribute: "ant-tree-switcher-icon" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleRotateIconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeNodeToggleRotateIcon]',
                    host: {
                        class: 'ant-tree-switcher-icon'
                    }
                }]
        }] });
class NzTreeNodeToggleActiveIconDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleActiveIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeToggleActiveIconDirective, isStandalone: true, selector: "[nzTreeNodeToggleActiveIcon]", host: { classAttribute: "ant-tree-switcher-loading-icon" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeToggleActiveIconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeNodeToggleActiveIcon]',
                    host: {
                        class: 'ant-tree-switcher-loading-icon'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeComponent extends NzNodeBase {
    elementRef;
    tree;
    indents = [];
    disabled = false;
    selected = false;
    isLeaf = false;
    renderer = inject(Renderer2);
    cdr = inject(ChangeDetectorRef);
    constructor(elementRef, tree) {
        super(elementRef, tree);
        this.elementRef = elementRef;
        this.tree = tree;
        this._elementRef.nativeElement.classList.add('ant-tree-treenode');
    }
    ngOnInit() {
        this.isLeaf = !this.tree.treeControl?.isExpandable(this.data);
    }
    disable() {
        this.disabled = true;
        this.updateDisabledClass();
    }
    enable() {
        this.disabled = false;
        this.updateDisabledClass();
    }
    select() {
        this.selected = true;
        this.updateSelectedClass();
    }
    deselect() {
        this.selected = false;
        this.updateSelectedClass();
    }
    setIndents(indents) {
        this.indents = indents;
        this.cdr.markForCheck();
    }
    updateSelectedClass() {
        if (this.selected) {
            this.renderer.addClass(this.elementRef.nativeElement, 'ant-tree-treenode-selected');
        }
        else {
            this.renderer.removeClass(this.elementRef.nativeElement, 'ant-tree-treenode-selected');
        }
    }
    updateDisabledClass() {
        if (this.disabled) {
            this.renderer.addClass(this.elementRef.nativeElement, 'ant-tree-treenode-disabled');
        }
        else {
            this.renderer.removeClass(this.elementRef.nativeElement, 'ant-tree-treenode-disabled');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeComponent, deps: [{ token: i0.ElementRef }, { token: NzTreeView }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeNodeComponent, isStandalone: true, selector: "nz-tree-node:not([builtin])", host: { properties: { "class.ant-tree-treenode-switcher-open": "isExpanded", "class.ant-tree-treenode-switcher-close": "!isExpanded" } }, providers: [
            { provide: CdkTreeNode, useExisting: forwardRef(() => NzTreeNodeComponent) },
            { provide: NzNodeBase, useExisting: forwardRef(() => NzTreeNodeComponent) }
        ], exportAs: ["nzTreeNode"], usesInheritance: true, ngImport: i0, template: `
    @if (indents.length) {
      <nz-tree-node-indents [indents]="indents"></nz-tree-node-indents>
    }
    <ng-content select="nz-tree-node-toggle, [nz-tree-node-toggle]"></ng-content>
    @if (indents.length && isLeaf) {
      <nz-tree-node-toggle class="nz-tree-leaf-line-icon" nzTreeNodeNoopToggle>
        <span class="ant-tree-switcher-leaf-line"></span>
      </nz-tree-node-toggle>
    }
    <ng-content select="nz-tree-node-checkbox"></ng-content>
    <ng-content select="nz-tree-node-option"></ng-content>
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTreeNodeIndentsComponent, selector: "nz-tree-node-indents", inputs: ["indents"] }, { kind: "directive", type: NzTreeNodeNoopToggleDirective, selector: "nz-tree-node-toggle[nzTreeNodeNoopToggle], [nzTreeNodeNoopToggle]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node:not([builtin])',
                    exportAs: 'nzTreeNode',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        { provide: CdkTreeNode, useExisting: forwardRef(() => NzTreeNodeComponent) },
                        { provide: NzNodeBase, useExisting: forwardRef(() => NzTreeNodeComponent) }
                    ],
                    template: `
    @if (indents.length) {
      <nz-tree-node-indents [indents]="indents"></nz-tree-node-indents>
    }
    <ng-content select="nz-tree-node-toggle, [nz-tree-node-toggle]"></ng-content>
    @if (indents.length && isLeaf) {
      <nz-tree-node-toggle class="nz-tree-leaf-line-icon" nzTreeNodeNoopToggle>
        <span class="ant-tree-switcher-leaf-line"></span>
      </nz-tree-node-toggle>
    }
    <ng-content select="nz-tree-node-checkbox"></ng-content>
    <ng-content select="nz-tree-node-option"></ng-content>
    <ng-content></ng-content>
  `,
                    host: {
                        '[class.ant-tree-treenode-switcher-open]': 'isExpanded',
                        '[class.ant-tree-treenode-switcher-close]': '!isExpanded'
                    },
                    imports: [NzTreeNodeIndentsComponent, NzTreeNodeNoopToggleDirective]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: NzTreeView }] });
class NzTreeNodeDefDirective extends CdkTreeNodeDef {
    when = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeDefDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeDefDirective, isStandalone: true, selector: "[nzTreeNodeDef]", inputs: { when: ["nzTreeNodeDefWhen", "when"] }, providers: [
            {
                provide: CdkTreeNodeDef,
                useExisting: forwardRef(() => NzTreeNodeDefDirective)
            }
        ], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeNodeDef]',
                    providers: [
                        {
                            provide: CdkTreeNodeDef,
                            useExisting: forwardRef(() => NzTreeNodeDefDirective)
                        }
                    ]
                }]
        }], propDecorators: { when: [{
                type: Input,
                args: ['nzTreeNodeDefWhen']
            }] } });
class NzTreeVirtualScrollNodeOutletDirective {
    _viewContainerRef;
    _viewRef = null;
    data;
    compareBy;
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    ngOnChanges(changes) {
        const recreateView = this.shouldRecreateView(changes);
        if (recreateView) {
            const viewContainerRef = this._viewContainerRef;
            if (this._viewRef) {
                viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
            }
            this._viewRef = this.data
                ? viewContainerRef.createEmbeddedView(this.data.nodeDef.template, this.data.context)
                : null;
            if (CdkTreeNode.mostRecentTreeNode && this._viewRef) {
                CdkTreeNode.mostRecentTreeNode.data = this.data.data;
            }
        }
        else if (this._viewRef && this.data.context) {
            this.updateExistingContext(this.data.context);
        }
    }
    shouldRecreateView(changes) {
        const ctxChange = changes.data;
        return ctxChange && this.hasContextShapeChanged(ctxChange);
    }
    hasContextShapeChanged(ctxChange) {
        const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        const currCtxKeys = Object.keys(ctxChange.currentValue || {});
        if (prevCtxKeys.length === currCtxKeys.length) {
            for (const propName of currCtxKeys) {
                if (prevCtxKeys.indexOf(propName) === -1) {
                    return true;
                }
            }
            return (this.innerCompareBy(ctxChange.previousValue?.data ?? null) !==
                this.innerCompareBy(ctxChange.currentValue?.data ?? null));
        }
        return true;
    }
    get innerCompareBy() {
        return value => {
            if (value === null)
                return value;
            if (this.compareBy)
                return this.compareBy(value);
            return value;
        };
    }
    updateExistingContext(ctx) {
        for (const propName of Object.keys(ctx)) {
            this._viewRef.context[propName] = this.data.context[propName];
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeVirtualScrollNodeOutletDirective, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeVirtualScrollNodeOutletDirective, isStandalone: true, selector: "[nzTreeVirtualScrollNodeOutlet]", inputs: { data: "data", compareBy: "compareBy" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeVirtualScrollNodeOutletDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeVirtualScrollNodeOutlet]'
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }], propDecorators: { data: [{
                type: Input
            }], compareBy: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeOptionComponent {
    ngZone;
    host;
    destroy$;
    treeNode;
    nzSelected = false;
    nzDisabled = false;
    nzClick = new EventEmitter();
    constructor(ngZone, host, destroy$, treeNode) {
        this.ngZone = ngZone;
        this.host = host;
        this.destroy$ = destroy$;
        this.treeNode = treeNode;
    }
    get isExpanded() {
        return this.treeNode.isExpanded;
    }
    ngOnChanges(changes) {
        const { nzDisabled, nzSelected } = changes;
        if (nzDisabled) {
            if (nzDisabled.currentValue) {
                this.treeNode.disable();
            }
            else {
                this.treeNode.enable();
            }
        }
        if (nzSelected) {
            if (nzSelected.currentValue) {
                this.treeNode.select();
            }
            else {
                this.treeNode.deselect();
            }
        }
    }
    ngOnInit() {
        fromEventOutsideAngular(this.host.nativeElement, 'click')
            .pipe(filter(() => !this.nzDisabled && this.nzClick.observers.length > 0), takeUntil(this.destroy$))
            .subscribe(event => {
            this.ngZone.run(() => this.nzClick.emit(event));
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeOptionComponent, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i1.NzDestroyService }, { token: NzTreeNodeComponent }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeNodeOptionComponent, isStandalone: true, selector: "nz-tree-node-option", inputs: { nzSelected: ["nzSelected", "nzSelected", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute] }, outputs: { nzClick: "nzClick" }, host: { properties: { "class.ant-tree-node-content-wrapper-open": "isExpanded", "class.ant-tree-node-selected": "nzSelected" }, classAttribute: "ant-tree-node-content-wrapper" }, providers: [NzDestroyService], usesOnChanges: true, ngImport: i0, template: ` <span class="ant-tree-title"><ng-content></ng-content></span> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeOptionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-option',
                    template: ` <span class="ant-tree-title"><ng-content></ng-content></span> `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'ant-tree-node-content-wrapper',
                        '[class.ant-tree-node-content-wrapper-open]': 'isExpanded',
                        '[class.ant-tree-node-selected]': 'nzSelected'
                    },
                    providers: [NzDestroyService]
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i1.NzDestroyService }, { type: NzTreeNodeComponent }], propDecorators: { nzSelected: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClick: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeOutletDirective {
    viewContainer;
    _node = inject(CDK_TREE_NODE_OUTLET_NODE, { optional: true });
    constructor(viewContainer) {
        this.viewContainer = viewContainer;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeOutletDirective, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeNodeOutletDirective, isStandalone: true, selector: "[nzTreeNodeOutlet]", providers: [
            {
                provide: CdkTreeNodeOutlet,
                useExisting: forwardRef(() => NzTreeNodeOutletDirective)
            }
        ], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeOutletDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeNodeOutlet]',
                    providers: [
                        {
                            provide: CdkTreeNodeOutlet,
                            useExisting: forwardRef(() => NzTreeNodeOutletDirective)
                        }
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodePaddingDirective extends CdkTreeNodePadding {
    _indent = 24;
    get level() {
        return this._level;
    }
    set level(value) {
        this._setLevelInput(value);
    }
    get indent() {
        return this._indent;
    }
    set indent(indent) {
        this._setIndentInput(indent);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodePaddingDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeNodePaddingDirective, isStandalone: true, selector: "[nzTreeNodePadding]", inputs: { level: ["nzTreeNodePadding", "level", numberAttribute], indent: ["nzTreeNodePaddingIndent", "indent"] }, providers: [{ provide: CdkTreeNodePadding, useExisting: forwardRef(() => NzTreeNodePaddingDirective) }], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodePaddingDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzTreeNodePadding]',
                    providers: [{ provide: CdkTreeNodePadding, useExisting: forwardRef(() => NzTreeNodePaddingDirective) }]
                }]
        }], propDecorators: { level: [{
                type: Input,
                args: [{ alias: 'nzTreeNodePadding', transform: numberAttribute }]
            }], indent: [{
                type: Input,
                args: ['nzTreeNodePaddingIndent']
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeViewComponent extends NzTreeView {
    nodeOutlet;
    _afterViewInit = false;
    ngAfterViewInit() {
        Promise.resolve().then(() => {
            this._afterViewInit = true;
            this.changeDetectorRef.markForCheck();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeViewComponent, isStandalone: true, selector: "nz-tree-view", host: { properties: { "class.ant-tree-block-node": "nzDirectoryTree || nzBlockNode", "class.ant-tree-directory": "nzDirectoryTree", "class.ant-tree-rtl": "dir === 'rtl'" }, classAttribute: "ant-tree" }, providers: [
            { provide: CdkTree, useExisting: forwardRef(() => NzTreeViewComponent) },
            { provide: NzTreeView, useExisting: forwardRef(() => NzTreeViewComponent) }
        ], viewQueries: [{ propertyName: "nodeOutlet", first: true, predicate: NzTreeNodeOutletDirective, descendants: true, static: true }], exportAs: ["nzTreeView"], usesInheritance: true, ngImport: i0, template: `
    <div class="ant-tree-list-holder">
      <div
        [@.disabled]="!_afterViewInit || !!noAnimation?.nzNoAnimation"
        [@treeCollapseMotion]="_nodeOutlet.viewContainer.length"
        class="ant-tree-list-holder-inner"
      >
        <ng-container nzTreeNodeOutlet></ng-container>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NzTreeNodeOutletDirective, selector: "[nzTreeNodeOutlet]" }], animations: [treeCollapseMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-view',
                    exportAs: 'nzTreeView',
                    template: `
    <div class="ant-tree-list-holder">
      <div
        [@.disabled]="!_afterViewInit || !!noAnimation?.nzNoAnimation"
        [@treeCollapseMotion]="_nodeOutlet.viewContainer.length"
        class="ant-tree-list-holder-inner"
      >
        <ng-container nzTreeNodeOutlet></ng-container>
      </div>
    </div>
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        { provide: CdkTree, useExisting: forwardRef(() => NzTreeViewComponent) },
                        { provide: NzTreeView, useExisting: forwardRef(() => NzTreeViewComponent) }
                    ],
                    host: {
                        class: 'ant-tree',
                        '[class.ant-tree-block-node]': 'nzDirectoryTree || nzBlockNode',
                        '[class.ant-tree-directory]': 'nzDirectoryTree',
                        '[class.ant-tree-rtl]': `dir === 'rtl'`
                    },
                    animations: [treeCollapseMotion],
                    imports: [NzTreeNodeOutletDirective]
                }]
        }], propDecorators: { nodeOutlet: [{
                type: ViewChild,
                args: [NzTreeNodeOutletDirective, { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const DEFAULT_SIZE = 28;
class NzTreeVirtualScrollViewComponent extends NzTreeView {
    nodeOutlet;
    virtualScrollViewport;
    nzItemSize = DEFAULT_SIZE;
    nzMinBufferPx = DEFAULT_SIZE * 5;
    nzMaxBufferPx = DEFAULT_SIZE * 10;
    trackBy = null;
    nodes = [];
    innerTrackBy = i => i;
    ngOnChanges({ trackBy }) {
        if (trackBy) {
            if (typeof trackBy.currentValue === 'function') {
                this.innerTrackBy = (index, n) => this.trackBy(index, n.data);
            }
            else {
                this.innerTrackBy = i => i;
            }
        }
    }
    get compareBy() {
        const baseTreeControl = this.treeControl;
        if (baseTreeControl.trackBy) {
            return baseTreeControl.trackBy;
        }
        return null;
    }
    renderNodeChanges(data) {
        this.nodes = new Array(...data).map((n, i) => this.createNode(n, i));
        this._dataSourceChanged.next();
        this.changeDetectorRef.markForCheck();
    }
    /**
     * @note
     * angular/cdk v18.2.0 breaking changes: https://github.com/angular/components/pull/29062
     * Temporary workaround: revert to old method of getting level
     * TODO: refactor tree-view, remove #treeControl and adopt #levelAccessor and #childrenAccessor
     * */
    _getLevel(nodeData) {
        if (this.treeControl?.getLevel) {
            return this.treeControl.getLevel(nodeData);
        }
        return;
    }
    createNode(nodeData, index) {
        const node = this._getNodeDef(nodeData, index);
        const context = new CdkTreeNodeOutletContext(nodeData);
        if (this.treeControl?.getLevel) {
            context.level = this.treeControl.getLevel(nodeData);
        }
        else {
            context.level = 0;
        }
        return {
            data: nodeData,
            context,
            nodeDef: node
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeVirtualScrollViewComponent, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTreeVirtualScrollViewComponent, isStandalone: true, selector: "nz-tree-virtual-scroll-view", inputs: { nzItemSize: "nzItemSize", nzMinBufferPx: "nzMinBufferPx", nzMaxBufferPx: "nzMaxBufferPx", trackBy: "trackBy" }, host: { properties: { "class.ant-tree-block-node": "nzDirectoryTree || nzBlockNode", "class.ant-tree-directory": "nzDirectoryTree", "class.ant-tree-rtl": "dir === 'rtl'" }, classAttribute: "ant-tree" }, providers: [
            { provide: NzTreeView, useExisting: forwardRef(() => NzTreeVirtualScrollViewComponent) },
            { provide: CdkTree, useExisting: forwardRef(() => NzTreeVirtualScrollViewComponent) }
        ], viewQueries: [{ propertyName: "nodeOutlet", first: true, predicate: NzTreeNodeOutletDirective, descendants: true, static: true }, { propertyName: "virtualScrollViewport", first: true, predicate: CdkVirtualScrollViewport, descendants: true, static: true }], exportAs: ["nzTreeVirtualScrollView"], usesInheritance: true, usesOnChanges: true, ngImport: i0, template: `
    <div class="ant-tree-list">
      <cdk-virtual-scroll-viewport
        class="ant-tree-list-holder"
        [itemSize]="nzItemSize"
        [minBufferPx]="nzMinBufferPx"
        [maxBufferPx]="nzMaxBufferPx"
      >
        <ng-container *cdkVirtualFor="let item of nodes; let i = index; trackBy: innerTrackBy">
          <ng-template nzTreeVirtualScrollNodeOutlet [data]="item" [compareBy]="compareBy"></ng-template>
        </ng-container>
      </cdk-virtual-scroll-viewport>
    </div>
    <ng-container nzTreeNodeOutlet></ng-container>
  `, isInline: true, dependencies: [{ kind: "directive", type: NzTreeVirtualScrollNodeOutletDirective, selector: "[nzTreeVirtualScrollNodeOutlet]", inputs: ["data", "compareBy"] }, { kind: "directive", type: CdkVirtualForOf, selector: "[cdkVirtualFor][cdkVirtualForOf]", inputs: ["cdkVirtualForOf", "cdkVirtualForTrackBy", "cdkVirtualForTemplate", "cdkVirtualForTemplateCacheSize"] }, { kind: "directive", type: NzTreeNodeOutletDirective, selector: "[nzTreeNodeOutlet]" }, { kind: "component", type: CdkVirtualScrollViewport, selector: "cdk-virtual-scroll-viewport", inputs: ["orientation", "appendOnly"], outputs: ["scrolledIndexChange"] }, { kind: "directive", type: CdkFixedSizeVirtualScroll, selector: "cdk-virtual-scroll-viewport[itemSize]", inputs: ["itemSize", "minBufferPx", "maxBufferPx"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeVirtualScrollViewComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-virtual-scroll-view',
                    exportAs: 'nzTreeVirtualScrollView',
                    template: `
    <div class="ant-tree-list">
      <cdk-virtual-scroll-viewport
        class="ant-tree-list-holder"
        [itemSize]="nzItemSize"
        [minBufferPx]="nzMinBufferPx"
        [maxBufferPx]="nzMaxBufferPx"
      >
        <ng-container *cdkVirtualFor="let item of nodes; let i = index; trackBy: innerTrackBy">
          <ng-template nzTreeVirtualScrollNodeOutlet [data]="item" [compareBy]="compareBy"></ng-template>
        </ng-container>
      </cdk-virtual-scroll-viewport>
    </div>
    <ng-container nzTreeNodeOutlet></ng-container>
  `,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        { provide: NzTreeView, useExisting: forwardRef(() => NzTreeVirtualScrollViewComponent) },
                        { provide: CdkTree, useExisting: forwardRef(() => NzTreeVirtualScrollViewComponent) }
                    ],
                    host: {
                        class: 'ant-tree',
                        '[class.ant-tree-block-node]': 'nzDirectoryTree || nzBlockNode',
                        '[class.ant-tree-directory]': 'nzDirectoryTree',
                        '[class.ant-tree-rtl]': `dir === 'rtl'`
                    },
                    imports: [
                        NzTreeVirtualScrollNodeOutletDirective,
                        CdkVirtualForOf,
                        NzTreeNodeOutletDirective,
                        CdkVirtualScrollViewport,
                        CdkFixedSizeVirtualScroll
                    ]
                }]
        }], propDecorators: { nodeOutlet: [{
                type: ViewChild,
                args: [NzTreeNodeOutletDirective, { static: true }]
            }], virtualScrollViewport: [{
                type: ViewChild,
                args: [CdkVirtualScrollViewport, { static: true }]
            }], nzItemSize: [{
                type: Input
            }], nzMinBufferPx: [{
                type: Input
            }], nzMaxBufferPx: [{
                type: Input
            }], trackBy: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const treeWithControlComponents = [
    NzTreeView,
    NzTreeNodeOutletDirective,
    NzTreeViewComponent,
    NzTreeNodeDefDirective,
    NzTreeNodeComponent,
    NzTreeNodeToggleDirective,
    NzTreeNodePaddingDirective,
    NzTreeNodeToggleRotateIconDirective,
    NzTreeNodeToggleActiveIconDirective,
    NzTreeNodeOptionComponent,
    NzTreeNodeNoopToggleDirective,
    NzTreeNodeCheckboxComponent,
    NzTreeNodeIndentsComponent,
    NzTreeVirtualScrollViewComponent,
    NzTreeVirtualScrollNodeOutletDirective,
    NzTreeNodeIndentLineDirective
];
class NzTreeViewModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewModule, imports: [NzTreeView,
            NzTreeNodeOutletDirective,
            NzTreeViewComponent,
            NzTreeNodeDefDirective,
            NzTreeNodeComponent,
            NzTreeNodeToggleDirective,
            NzTreeNodePaddingDirective,
            NzTreeNodeToggleRotateIconDirective,
            NzTreeNodeToggleActiveIconDirective,
            NzTreeNodeOptionComponent,
            NzTreeNodeNoopToggleDirective,
            NzTreeNodeCheckboxComponent,
            NzTreeNodeIndentsComponent,
            NzTreeVirtualScrollViewComponent,
            NzTreeVirtualScrollNodeOutletDirective,
            NzTreeNodeIndentLineDirective], exports: [NzTreeView,
            NzTreeNodeOutletDirective,
            NzTreeViewComponent,
            NzTreeNodeDefDirective,
            NzTreeNodeComponent,
            NzTreeNodeToggleDirective,
            NzTreeNodePaddingDirective,
            NzTreeNodeToggleRotateIconDirective,
            NzTreeNodeToggleActiveIconDirective,
            NzTreeNodeOptionComponent,
            NzTreeNodeNoopToggleDirective,
            NzTreeNodeCheckboxComponent,
            NzTreeNodeIndentsComponent,
            NzTreeVirtualScrollViewComponent,
            NzTreeVirtualScrollNodeOutletDirective,
            NzTreeNodeIndentLineDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewModule, imports: [NzTreeVirtualScrollViewComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeViewModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [treeWithControlComponents],
                    exports: [treeWithControlComponents]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeFlattener {
    transformFunction;
    getLevel;
    isExpandable;
    getChildren;
    constructor(transformFunction, getLevel, isExpandable, getChildren) {
        this.transformFunction = transformFunction;
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.getChildren = getChildren;
    }
    flattenNode(node, level, resultNodes, parentMap) {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);
        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);
            if (childrenNodes) {
                if (Array.isArray(childrenNodes)) {
                    this.flattenChildren(childrenNodes, level, resultNodes, parentMap);
                }
                else {
                    childrenNodes.pipe(take(1)).subscribe(children => {
                        this.flattenChildren(children, level, resultNodes, parentMap);
                    });
                }
            }
        }
        return resultNodes;
    }
    flattenChildren(children, level, resultNodes, parentMap) {
        children.forEach((child, index) => {
            const childParentMap = parentMap.slice();
            childParentMap.push(index !== children.length - 1);
            this.flattenNode(child, level + 1, resultNodes, childParentMap);
        });
    }
    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData) {
        const resultNodes = [];
        structuredData.forEach(node => this.flattenNode(node, 0, resultNodes, []));
        return resultNodes;
    }
    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes, treeControl) {
        const results = [];
        const currentExpand = [];
        currentExpand[0] = true;
        nodes.forEach(node => {
            let expand = true;
            for (let i = 0; i <= this.getLevel(node); i++) {
                expand = expand && currentExpand[i];
            }
            if (expand) {
                results.push(node);
            }
            if (this.isExpandable(node)) {
                currentExpand[this.getLevel(node) + 1] = treeControl.isExpanded(node);
            }
        });
        return results;
    }
}
class NzTreeFlatDataSource extends DataSource {
    _treeControl;
    _treeFlattener;
    _flattenedData = new BehaviorSubject([]);
    _expandedData = new BehaviorSubject([]);
    _data;
    constructor(_treeControl, _treeFlattener, initialData = []) {
        super();
        this._treeControl = _treeControl;
        this._treeFlattener = _treeFlattener;
        this._data = new BehaviorSubject(initialData);
        this.flatNodes();
    }
    setData(value) {
        this._data.next(value);
        this.flatNodes();
    }
    getData() {
        return this._data.getValue();
    }
    connect(collectionViewer) {
        const changes = [
            collectionViewer.viewChange,
            this._treeControl.expansionModel.changed.asObservable(),
            this._flattenedData.asObservable()
        ];
        return merge(...changes).pipe(map(() => {
            this._expandedData.next(this._treeFlattener.expandFlattenedNodes(this._flattenedData.value, this._treeControl));
            return this._expandedData.value;
        }));
    }
    disconnect() {
        // no op
    }
    flatNodes() {
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.getData()));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
}

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzTreeFlatDataSource, NzTreeFlattener, NzTreeNodeCheckboxComponent, NzTreeNodeComponent, NzTreeNodeDefDirective, NzTreeNodeIndentLineDirective, NzTreeNodeIndentsComponent, NzTreeNodeNoopToggleDirective, NzTreeNodeOptionComponent, NzTreeNodeOutletDirective, NzTreeNodePaddingDirective, NzTreeNodeToggleActiveIconDirective, NzTreeNodeToggleDirective, NzTreeNodeToggleRotateIconDirective, NzTreeView, NzTreeViewComponent, NzTreeViewModule, NzTreeVirtualScrollNodeOutletDirective, NzTreeVirtualScrollViewComponent, getNextSibling, getParent };
//# sourceMappingURL=ng-zorro-antd-tree-view.mjs.map
