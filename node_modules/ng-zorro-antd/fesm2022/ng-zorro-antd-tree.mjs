import * as i0 from '@angular/core';
import { numberAttribute, Input, ChangeDetectionStrategy, Component, booleanAttribute, EventEmitter, inject, Output, Injectable, forwardRef, ViewChild, ContentChild, NgModule } from '@angular/core';
import * as i2 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgTemplateOutlet } from '@angular/common';
import * as i2$1 from 'ng-zorro-antd/core/highlight';
import { NzHighlightModule } from 'ng-zorro-antd/core/highlight';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import * as i1$1 from 'ng-zorro-antd/core/tree';
import { NzTreeBaseService, NzTreeHigherOrderServiceToken, NzTreeBase, flattenTreeData } from 'ng-zorro-antd/core/tree';
export { NzTreeNode } from 'ng-zorro-antd/core/tree';
import { __esDecorate, __runInitializers } from 'tslib';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { treeCollapseMotion } from 'ng-zorro-antd/core/animation';
import * as i2$2 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i3 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeDropIndicatorComponent {
    cdr;
    dropPosition;
    level = 1;
    direction = 'ltr';
    style = {};
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnChanges(_changes) {
        this.renderIndicator(this.dropPosition, this.direction);
    }
    renderIndicator(dropPosition, direction = 'ltr') {
        const offset = 4;
        const startPosition = direction === 'ltr' ? 'left' : 'right';
        const endPosition = direction === 'ltr' ? 'right' : 'left';
        const style = {
            [startPosition]: `${offset}px`,
            [endPosition]: '0px'
        };
        switch (dropPosition) {
            case -1:
                style.top = `${-3}px`;
                break;
            case 1:
                style.bottom = `${-3}px`;
                break;
            case 0:
                // dropPosition === 0
                style.bottom = `${-3}px`;
                style[startPosition] = `${offset + 24}px`;
                break;
            default:
                style.display = 'none';
                break;
        }
        this.style = style;
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeDropIndicatorComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeDropIndicatorComponent, isStandalone: true, selector: "nz-tree-drop-indicator", inputs: { dropPosition: "dropPosition", level: ["level", "level", numberAttribute], direction: "direction" }, host: { properties: { "class.ant-tree-drop-indicator": "true", "style": "style" } }, exportAs: ["NzTreeDropIndicator"], usesOnChanges: true, ngImport: i0, template: ``, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeDropIndicatorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-drop-indicator',
                    exportAs: 'NzTreeDropIndicator',
                    template: ``,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[class.ant-tree-drop-indicator]': 'true',
                        '[style]': 'style'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { dropPosition: [{
                type: Input
            }], level: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], direction: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeIndentComponent {
    nzTreeLevel = 0;
    nzIsStart = [];
    nzIsEnd = [];
    nzSelectMode = false;
    listOfUnit = [];
    ngOnChanges(changes) {
        const { nzTreeLevel } = changes;
        if (nzTreeLevel) {
            this.listOfUnit = [...new Array(nzTreeLevel.currentValue || 0)];
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeIndentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeIndentComponent, isStandalone: true, selector: "nz-tree-indent", inputs: { nzTreeLevel: "nzTreeLevel", nzIsStart: "nzIsStart", nzIsEnd: "nzIsEnd", nzSelectMode: "nzSelectMode" }, host: { properties: { "attr.aria-hidden": "true", "class.ant-tree-indent": "!nzSelectMode", "class.ant-select-tree-indent": "nzSelectMode" } }, exportAs: ["nzTreeIndent"], usesOnChanges: true, ngImport: i0, template: `
    @for (_ of listOfUnit; track i; let i = $index) {
      <span
        [class.ant-tree-indent-unit]="!nzSelectMode"
        [class.ant-select-tree-indent-unit]="nzSelectMode"
        [class.ant-select-tree-indent-unit-start]="nzSelectMode && nzIsStart[i]"
        [class.ant-tree-indent-unit-start]="!nzSelectMode && nzIsStart[i]"
        [class.ant-select-tree-indent-unit-end]="nzSelectMode && nzIsEnd[i]"
        [class.ant-tree-indent-unit-end]="!nzSelectMode && nzIsEnd[i]"
      ></span>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeIndentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-indent',
                    exportAs: 'nzTreeIndent',
                    template: `
    @for (_ of listOfUnit; track i; let i = $index) {
      <span
        [class.ant-tree-indent-unit]="!nzSelectMode"
        [class.ant-select-tree-indent-unit]="nzSelectMode"
        [class.ant-select-tree-indent-unit-start]="nzSelectMode && nzIsStart[i]"
        [class.ant-tree-indent-unit-start]="!nzSelectMode && nzIsStart[i]"
        [class.ant-select-tree-indent-unit-end]="nzSelectMode && nzIsEnd[i]"
        [class.ant-tree-indent-unit-end]="!nzSelectMode && nzIsEnd[i]"
      ></span>
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[attr.aria-hidden]': 'true',
                        '[class.ant-tree-indent]': '!nzSelectMode',
                        '[class.ant-select-tree-indent]': 'nzSelectMode'
                    }
                }]
        }], propDecorators: { nzTreeLevel: [{
                type: Input
            }], nzIsStart: [{
                type: Input
            }], nzIsEnd: [{
                type: Input
            }], nzSelectMode: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeBuiltinCheckboxComponent {
    nzSelectMode = false;
    isChecked;
    isHalfChecked;
    isDisabled;
    isDisableCheckbox;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeBuiltinCheckboxComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzTreeNodeBuiltinCheckboxComponent, isStandalone: true, selector: "nz-tree-node-checkbox[builtin]", inputs: { nzSelectMode: "nzSelectMode", isChecked: ["isChecked", "isChecked", booleanAttribute], isHalfChecked: ["isHalfChecked", "isHalfChecked", booleanAttribute], isDisabled: ["isDisabled", "isDisabled", booleanAttribute], isDisableCheckbox: ["isDisableCheckbox", "isDisableCheckbox", booleanAttribute] }, host: { properties: { "class.ant-select-tree-checkbox": "nzSelectMode", "class.ant-select-tree-checkbox-checked": "nzSelectMode && isChecked", "class.ant-select-tree-checkbox-indeterminate": "nzSelectMode && isHalfChecked", "class.ant-select-tree-checkbox-disabled": "nzSelectMode && (isDisabled || isDisableCheckbox)", "class.ant-tree-checkbox": "!nzSelectMode", "class.ant-tree-checkbox-checked": "!nzSelectMode && isChecked", "class.ant-tree-checkbox-indeterminate": "!nzSelectMode && isHalfChecked", "class.ant-tree-checkbox-disabled": "!nzSelectMode && (isDisabled || isDisableCheckbox)" } }, ngImport: i0, template: `
    <span [class.ant-tree-checkbox-inner]="!nzSelectMode" [class.ant-select-tree-checkbox-inner]="nzSelectMode"></span>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeBuiltinCheckboxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-checkbox[builtin]',
                    template: `
    <span [class.ant-tree-checkbox-inner]="!nzSelectMode" [class.ant-select-tree-checkbox-inner]="nzSelectMode"></span>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[class.ant-select-tree-checkbox]': `nzSelectMode`,
                        '[class.ant-select-tree-checkbox-checked]': `nzSelectMode && isChecked`,
                        '[class.ant-select-tree-checkbox-indeterminate]': `nzSelectMode && isHalfChecked`,
                        '[class.ant-select-tree-checkbox-disabled]': `nzSelectMode && (isDisabled || isDisableCheckbox)`,
                        '[class.ant-tree-checkbox]': `!nzSelectMode`,
                        '[class.ant-tree-checkbox-checked]': `!nzSelectMode && isChecked`,
                        '[class.ant-tree-checkbox-indeterminate]': `!nzSelectMode && isHalfChecked`,
                        '[class.ant-tree-checkbox-disabled]': `!nzSelectMode && (isDisabled || isDisableCheckbox)`
                    }
                }]
        }], propDecorators: { nzSelectMode: [{
                type: Input
            }], isChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isHalfChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isDisableCheckbox: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeSwitcherComponent {
    nzShowExpand;
    nzShowLine;
    nzExpandedIcon;
    nzSelectMode = false;
    context;
    isLeaf;
    isLoading;
    isExpanded;
    get isShowLineIcon() {
        return !this.isLeaf && !!this.nzShowLine;
    }
    get isShowSwitchIcon() {
        return !this.isLeaf && !this.nzShowLine;
    }
    get isSwitcherOpen() {
        return !!this.isExpanded && !this.isLeaf;
    }
    get isSwitcherClose() {
        return !this.isExpanded && !this.isLeaf;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeSwitcherComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeNodeSwitcherComponent, isStandalone: true, selector: "nz-tree-node-switcher", inputs: { nzShowExpand: ["nzShowExpand", "nzShowExpand", booleanAttribute], nzShowLine: ["nzShowLine", "nzShowLine", booleanAttribute], nzExpandedIcon: "nzExpandedIcon", nzSelectMode: "nzSelectMode", context: "context", isLeaf: ["isLeaf", "isLeaf", booleanAttribute], isLoading: ["isLoading", "isLoading", booleanAttribute], isExpanded: ["isExpanded", "isExpanded", booleanAttribute] }, host: { properties: { "class.ant-select-tree-switcher": "nzSelectMode", "class.ant-select-tree-switcher-noop": "nzSelectMode && isLeaf", "class.ant-select-tree-switcher_open": "nzSelectMode && isSwitcherOpen", "class.ant-select-tree-switcher_close": "nzSelectMode && isSwitcherClose", "class.ant-tree-switcher": "!nzSelectMode", "class.ant-tree-switcher-noop": "!nzSelectMode && isLeaf", "class.ant-tree-switcher_open": "!nzSelectMode && isSwitcherOpen", "class.ant-tree-switcher_close": "!nzSelectMode && isSwitcherClose" } }, ngImport: i0, template: `
    @if (isShowSwitchIcon) {
      @if (!isLoading) {
        <ng-container *nzStringTemplateOutlet="nzExpandedIcon; context: { $implicit: context, origin: context.origin }">
          <nz-icon
            nzType="caret-down"
            [class.ant-select-tree-switcher-icon]="nzSelectMode"
            [class.ant-tree-switcher-icon]="!nzSelectMode"
          />
        </ng-container>
      } @else {
        <nz-icon nzType="loading" [nzSpin]="true" class="ant-tree-switcher-loading-icon" />
      }
    }
    @if (nzShowLine) {
      @if (!isLoading) {
        <ng-container *nzStringTemplateOutlet="nzExpandedIcon; context: { $implicit: context, origin: context.origin }">
          @if (isShowLineIcon) {
            <nz-icon [nzType]="isSwitcherOpen ? 'minus-square' : 'plus-square'" class="ant-tree-switcher-line-icon" />
          } @else {
            <nz-icon nzType="file" class="ant-tree-switcher-line-icon" />
          }
        </ng-container>
      } @else {
        <nz-icon nzType="loading" [nzSpin]="true" class="ant-tree-switcher-loading-icon" />
      }
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i2.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeSwitcherComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-switcher',
                    template: `
    @if (isShowSwitchIcon) {
      @if (!isLoading) {
        <ng-container *nzStringTemplateOutlet="nzExpandedIcon; context: { $implicit: context, origin: context.origin }">
          <nz-icon
            nzType="caret-down"
            [class.ant-select-tree-switcher-icon]="nzSelectMode"
            [class.ant-tree-switcher-icon]="!nzSelectMode"
          />
        </ng-container>
      } @else {
        <nz-icon nzType="loading" [nzSpin]="true" class="ant-tree-switcher-loading-icon" />
      }
    }
    @if (nzShowLine) {
      @if (!isLoading) {
        <ng-container *nzStringTemplateOutlet="nzExpandedIcon; context: { $implicit: context, origin: context.origin }">
          @if (isShowLineIcon) {
            <nz-icon [nzType]="isSwitcherOpen ? 'minus-square' : 'plus-square'" class="ant-tree-switcher-line-icon" />
          } @else {
            <nz-icon nzType="file" class="ant-tree-switcher-line-icon" />
          }
        </ng-container>
      } @else {
        <nz-icon nzType="loading" [nzSpin]="true" class="ant-tree-switcher-loading-icon" />
      }
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[class.ant-select-tree-switcher]': 'nzSelectMode',
                        '[class.ant-select-tree-switcher-noop]': 'nzSelectMode && isLeaf',
                        '[class.ant-select-tree-switcher_open]': 'nzSelectMode && isSwitcherOpen',
                        '[class.ant-select-tree-switcher_close]': 'nzSelectMode && isSwitcherClose',
                        '[class.ant-tree-switcher]': '!nzSelectMode',
                        '[class.ant-tree-switcher-noop]': '!nzSelectMode && isLeaf',
                        '[class.ant-tree-switcher_open]': '!nzSelectMode && isSwitcherOpen',
                        '[class.ant-tree-switcher_close]': '!nzSelectMode && isSwitcherClose'
                    },
                    imports: [NzIconModule, NzOutletModule]
                }]
        }], propDecorators: { nzShowExpand: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowLine: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandedIcon: [{
                type: Input
            }], nzSelectMode: [{
                type: Input
            }], context: [{
                type: Input
            }], isLeaf: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isExpanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeTitleComponent {
    cdr;
    searchValue;
    treeTemplate = null;
    draggable;
    showIcon;
    selectMode = false;
    context;
    icon;
    title;
    isLoading;
    isSelected;
    isDisabled;
    isMatched;
    isExpanded;
    isLeaf;
    // Drag indicator
    showIndicator = true;
    dragPosition;
    get canDraggable() {
        return this.draggable && !this.isDisabled ? true : null;
    }
    get matchedValue() {
        return this.isMatched ? this.searchValue : '';
    }
    get isSwitcherOpen() {
        return this.isExpanded && !this.isLeaf;
    }
    get isSwitcherClose() {
        return !this.isExpanded && !this.isLeaf;
    }
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngOnChanges(changes) {
        const { showIndicator, dragPosition } = changes;
        if (showIndicator || dragPosition) {
            this.cdr.markForCheck();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeTitleComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeNodeTitleComponent, isStandalone: true, selector: "nz-tree-node-title", inputs: { searchValue: "searchValue", treeTemplate: "treeTemplate", draggable: ["draggable", "draggable", booleanAttribute], showIcon: ["showIcon", "showIcon", booleanAttribute], selectMode: "selectMode", context: "context", icon: "icon", title: "title", isLoading: ["isLoading", "isLoading", booleanAttribute], isSelected: ["isSelected", "isSelected", booleanAttribute], isDisabled: ["isDisabled", "isDisabled", booleanAttribute], isMatched: ["isMatched", "isMatched", booleanAttribute], isExpanded: ["isExpanded", "isExpanded", booleanAttribute], isLeaf: ["isLeaf", "isLeaf", booleanAttribute], showIndicator: "showIndicator", dragPosition: "dragPosition" }, host: { properties: { "attr.title": "title", "attr.draggable": "canDraggable", "attr.aria-grabbed": "canDraggable", "class.draggable": "canDraggable", "class.ant-select-tree-node-content-wrapper": "selectMode", "class.ant-select-tree-node-content-wrapper-open": "selectMode && isSwitcherOpen", "class.ant-select-tree-node-content-wrapper-close": "selectMode && isSwitcherClose", "class.ant-select-tree-node-selected": "selectMode && isSelected", "class.ant-tree-node-content-wrapper": "!selectMode", "class.ant-tree-node-content-wrapper-open": "!selectMode && isSwitcherOpen", "class.ant-tree-node-content-wrapper-close": "!selectMode && isSwitcherClose", "class.ant-tree-node-selected": "!selectMode && isSelected" } }, usesOnChanges: true, ngImport: i0, template: `
    <ng-template
      [ngTemplateOutlet]="treeTemplate"
      [ngTemplateOutletContext]="{ $implicit: context, origin: context.origin }"
    ></ng-template>
    @if (!treeTemplate) {
      @if (icon && showIcon) {
        <span
          [class.ant-tree-icon__open]="isSwitcherOpen"
          [class.ant-tree-icon__close]="isSwitcherClose"
          [class.ant-tree-icon_loading]="isLoading"
          [class.ant-select-tree-iconEle]="selectMode"
          [class.ant-tree-iconEle]="!selectMode"
        >
          <span
            [class.ant-select-tree-iconEle]="selectMode"
            [class.ant-select-tree-icon__customize]="selectMode"
            [class.ant-tree-iconEle]="!selectMode"
            [class.ant-tree-icon__customize]="!selectMode"
          >
            <nz-icon [nzType]="icon" />
          </span>
        </span>
      }
      <span class="ant-tree-title" [innerHTML]="title | nzHighlight: matchedValue : 'i' : 'font-highlight'"></span>
    }
    @if (showIndicator) {
      <nz-tree-drop-indicator [dropPosition]="dragPosition" [level]="context.level"></nz-tree-drop-indicator>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzHighlightModule }, { kind: "pipe", type: i2$1.NzHighlightPipe, name: "nzHighlight" }, { kind: "component", type: NzTreeDropIndicatorComponent, selector: "nz-tree-drop-indicator", inputs: ["dropPosition", "level", "direction"], exportAs: ["NzTreeDropIndicator"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeTitleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node-title',
                    template: `
    <ng-template
      [ngTemplateOutlet]="treeTemplate"
      [ngTemplateOutletContext]="{ $implicit: context, origin: context.origin }"
    ></ng-template>
    @if (!treeTemplate) {
      @if (icon && showIcon) {
        <span
          [class.ant-tree-icon__open]="isSwitcherOpen"
          [class.ant-tree-icon__close]="isSwitcherClose"
          [class.ant-tree-icon_loading]="isLoading"
          [class.ant-select-tree-iconEle]="selectMode"
          [class.ant-tree-iconEle]="!selectMode"
        >
          <span
            [class.ant-select-tree-iconEle]="selectMode"
            [class.ant-select-tree-icon__customize]="selectMode"
            [class.ant-tree-iconEle]="!selectMode"
            [class.ant-tree-icon__customize]="!selectMode"
          >
            <nz-icon [nzType]="icon" />
          </span>
        </span>
      }
      <span class="ant-tree-title" [innerHTML]="title | nzHighlight: matchedValue : 'i' : 'font-highlight'"></span>
    }
    @if (showIndicator) {
      <nz-tree-drop-indicator [dropPosition]="dragPosition" [level]="context.level"></nz-tree-drop-indicator>
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[attr.title]': 'title',
                        '[attr.draggable]': 'canDraggable',
                        '[attr.aria-grabbed]': 'canDraggable',
                        '[class.draggable]': 'canDraggable',
                        '[class.ant-select-tree-node-content-wrapper]': `selectMode`,
                        '[class.ant-select-tree-node-content-wrapper-open]': `selectMode && isSwitcherOpen`,
                        '[class.ant-select-tree-node-content-wrapper-close]': `selectMode && isSwitcherClose`,
                        '[class.ant-select-tree-node-selected]': `selectMode && isSelected`,
                        '[class.ant-tree-node-content-wrapper]': `!selectMode`,
                        '[class.ant-tree-node-content-wrapper-open]': `!selectMode && isSwitcherOpen`,
                        '[class.ant-tree-node-content-wrapper-close]': `!selectMode && isSwitcherClose`,
                        '[class.ant-tree-node-selected]': `!selectMode && isSelected`
                    },
                    imports: [NgTemplateOutlet, NzIconModule, NzHighlightModule, NzTreeDropIndicatorComponent]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { searchValue: [{
                type: Input
            }], treeTemplate: [{
                type: Input
            }], draggable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showIcon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], selectMode: [{
                type: Input
            }], context: [{
                type: Input
            }], icon: [{
                type: Input
            }], title: [{
                type: Input
            }], isLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isSelected: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isMatched: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isExpanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isLeaf: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showIndicator: [{
                type: Input
            }], dragPosition: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeNodeBuiltinComponent {
    nzTreeService;
    ngZone;
    renderer;
    elementRef;
    cdr;
    /**
     * for global property
     */
    icon = '';
    title = '';
    isLoading = false;
    isSelected = false;
    isDisabled = false;
    isMatched = false;
    isExpanded;
    isLeaf;
    isChecked;
    isHalfChecked;
    isDisableCheckbox;
    isSelectable;
    canHide;
    isStart = [];
    isEnd = [];
    nzTreeNode;
    nzShowLine;
    nzShowExpand;
    nzCheckable;
    nzAsyncData;
    nzHideUnMatched = false;
    nzNoAnimation = false;
    nzSelectMode = false;
    nzShowIcon = false;
    nzExpandedIcon;
    nzTreeTemplate = null;
    nzBeforeDrop;
    nzSearchValue = '';
    nzDraggable = false;
    nzClick = new EventEmitter();
    nzDblClick = new EventEmitter();
    nzContextMenu = new EventEmitter();
    nzCheckboxChange = new EventEmitter();
    nzExpandChange = new EventEmitter();
    nzOnDragStart = new EventEmitter();
    nzOnDragEnter = new EventEmitter();
    nzOnDragOver = new EventEmitter();
    nzOnDragLeave = new EventEmitter();
    nzOnDrop = new EventEmitter();
    nzOnDragEnd = new EventEmitter();
    /**
     * drag var
     */
    destroy$ = new Subject();
    dragPos = 2;
    dragPosClass = {
        0: 'drag-over',
        1: 'drag-over-gap-bottom',
        '-1': 'drag-over-gap-top'
    };
    draggingKey = null;
    showIndicator = false;
    /**
     * default set
     */
    get displayStyle() {
        // to hide unmatched nodes
        return this.nzSearchValue && this.nzHideUnMatched && !this.isMatched && !this.isExpanded && this.canHide
            ? 'none'
            : '';
    }
    get isSwitcherOpen() {
        return this.isExpanded && !this.isLeaf;
    }
    get isSwitcherClose() {
        return !this.isExpanded && !this.isLeaf;
    }
    /**
     * collapse node
     *
     * @param event
     */
    clickExpand(event) {
        event.preventDefault();
        if (!this.isLoading && !this.isLeaf) {
            // set async state
            if (this.nzAsyncData && this.nzTreeNode.children.length === 0 && !this.isExpanded) {
                this.nzTreeNode.isLoading = true;
            }
            this.nzTreeNode.setExpanded(!this.isExpanded);
        }
        this.nzTreeService.setExpandedNodeList(this.nzTreeNode);
        const eventNext = this.nzTreeService.formatEvent('expand', this.nzTreeNode, event);
        this.nzExpandChange.emit(eventNext);
    }
    clickSelect(event) {
        event.preventDefault();
        if (this.isSelectable && !this.isDisabled) {
            this.nzTreeNode.isSelected = !this.nzTreeNode.isSelected;
        }
        this.nzTreeService.setSelectedNodeList(this.nzTreeNode);
        const eventNext = this.nzTreeService.formatEvent('click', this.nzTreeNode, event);
        this.nzClick.emit(eventNext);
    }
    dblClick(event) {
        event.preventDefault();
        const eventNext = this.nzTreeService.formatEvent('dblclick', this.nzTreeNode, event);
        this.nzDblClick.emit(eventNext);
    }
    contextMenu(event) {
        event.preventDefault();
        const eventNext = this.nzTreeService.formatEvent('contextmenu', this.nzTreeNode, event);
        this.nzContextMenu.emit(eventNext);
    }
    /**
     * check node
     *
     * @param event
     */
    clickCheckbox(event) {
        event.preventDefault();
        // return if node is disabled
        if (this.isDisabled || this.isDisableCheckbox) {
            return;
        }
        this.nzTreeNode.isChecked = !this.nzTreeNode.isChecked;
        this.nzTreeNode.isHalfChecked = false;
        this.nzTreeService.setCheckedNodeList(this.nzTreeNode);
        const eventNext = this.nzTreeService.formatEvent('check', this.nzTreeNode, event);
        this.nzCheckboxChange.emit(eventNext);
    }
    clearDragClass() {
        const dragClass = ['drag-over-gap-top', 'drag-over-gap-bottom', 'drag-over', 'drop-target'];
        dragClass.forEach(e => {
            this.renderer.removeClass(this.elementRef.nativeElement, e);
        });
    }
    /**
     * drag event
     *
     * @param e
     */
    handleDragStart(e) {
        try {
            // ie throw error
            // firefox-need-it
            e.dataTransfer.setData('text/plain', this.nzTreeNode.key);
        }
        catch {
            // noop
        }
        this.nzTreeService.setSelectedNode(this.nzTreeNode);
        this.draggingKey = this.nzTreeNode.key;
        const eventNext = this.nzTreeService.formatEvent('dragstart', this.nzTreeNode, e);
        this.nzOnDragStart.emit(eventNext);
    }
    handleDragEnter(e) {
        e.preventDefault();
        // reset position
        this.showIndicator = this.nzTreeNode.key !== this.nzTreeService.getSelectedNode()?.key;
        this.renderIndicator(2);
        this.ngZone.run(() => {
            const eventNext = this.nzTreeService.formatEvent('dragenter', this.nzTreeNode, e);
            this.nzOnDragEnter.emit(eventNext);
        });
    }
    handleDragOver(e) {
        e.preventDefault();
        const dropPosition = this.nzTreeService.calcDropPosition(e);
        if (this.dragPos !== dropPosition) {
            this.clearDragClass();
            this.renderIndicator(dropPosition);
            // leaf node will pass
            if (!(this.dragPos === 0 && this.isLeaf)) {
                this.renderer.addClass(this.elementRef.nativeElement, this.dragPosClass[this.dragPos]);
                this.renderer.addClass(this.elementRef.nativeElement, 'drop-target');
            }
        }
        const eventNext = this.nzTreeService.formatEvent('dragover', this.nzTreeNode, e);
        this.nzOnDragOver.emit(eventNext);
    }
    handleDragLeave(e) {
        e.preventDefault();
        this.renderIndicator(2);
        this.clearDragClass();
        const eventNext = this.nzTreeService.formatEvent('dragleave', this.nzTreeNode, e);
        this.nzOnDragLeave.emit(eventNext);
    }
    handleDragDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.ngZone.run(() => {
            this.showIndicator = false;
            this.clearDragClass();
            const node = this.nzTreeService.getSelectedNode();
            if (!node || (node && node.key === this.nzTreeNode.key) || (this.dragPos === 0 && this.isLeaf)) {
                return;
            }
            // pass if node is leafNo
            const dropEvent = this.nzTreeService.formatEvent('drop', this.nzTreeNode, e);
            const dragEndEvent = this.nzTreeService.formatEvent('dragend', this.nzTreeNode, e);
            if (this.nzBeforeDrop) {
                this.nzBeforeDrop({
                    dragNode: this.nzTreeService.getSelectedNode(),
                    node: this.nzTreeNode,
                    pos: this.dragPos
                }).subscribe((canDrop) => {
                    if (canDrop) {
                        this.nzTreeService.dropAndApply(this.nzTreeNode, this.dragPos);
                    }
                    this.nzOnDrop.emit(dropEvent);
                    this.nzOnDragEnd.emit(dragEndEvent);
                });
            }
            else if (this.nzTreeNode) {
                this.nzTreeService.dropAndApply(this.nzTreeNode, this.dragPos);
                this.nzOnDrop.emit(dropEvent);
            }
        });
    }
    handleDragEnd(e) {
        e.preventDefault();
        this.ngZone.run(() => {
            // if user do not custom beforeDrop
            if (!this.nzBeforeDrop) {
                // clear dragging state
                this.draggingKey = null;
                const eventNext = this.nzTreeService.formatEvent('dragend', this.nzTreeNode, e);
                this.nzOnDragEnd.emit(eventNext);
            }
            else {
                // clear dragging state
                this.draggingKey = null;
                this.markForCheck();
            }
        });
    }
    /**
     * Listening to dragging events.
     */
    handDragEvent() {
        if (this.nzDraggable) {
            const nativeElement = this.elementRef.nativeElement;
            this.destroy$ = new Subject();
            fromEventOutsideAngular(nativeElement, 'dragstart')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragStart(e));
            fromEventOutsideAngular(nativeElement, 'dragenter')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragEnter(e));
            fromEventOutsideAngular(nativeElement, 'dragover')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragOver(e));
            fromEventOutsideAngular(nativeElement, 'dragleave')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragLeave(e));
            fromEventOutsideAngular(nativeElement, 'drop')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragDrop(e));
            fromEventOutsideAngular(nativeElement, 'dragend')
                .pipe(takeUntil(this.destroy$))
                .subscribe((e) => this.handleDragEnd(e));
        }
        else {
            this.destroy$.next(true);
            this.destroy$.complete();
        }
    }
    markForCheck() {
        this.cdr.markForCheck();
    }
    noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
    constructor(nzTreeService, ngZone, renderer, elementRef, cdr) {
        this.nzTreeService = nzTreeService;
        this.ngZone = ngZone;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.cdr = cdr;
    }
    ngOnInit() {
        this.nzTreeNode.component = this;
        fromEventOutsideAngular(this.elementRef.nativeElement, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
            if (this.nzSelectMode) {
                event.preventDefault();
            }
        });
    }
    ngOnChanges(changes) {
        const { nzDraggable } = changes;
        if (nzDraggable) {
            this.handDragEvent();
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    renderIndicator(dropPosition) {
        this.ngZone.run(() => {
            this.showIndicator = dropPosition !== 2;
            if (this.nzTreeNode.key === this.nzTreeService.getSelectedNode()?.key || (dropPosition === 0 && this.isLeaf)) {
                return;
            }
            this.dragPos = dropPosition;
            this.cdr.markForCheck();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeBuiltinComponent, deps: [{ token: i1$1.NzTreeBaseService }, { token: i0.NgZone }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeNodeBuiltinComponent, isStandalone: true, selector: "nz-tree-node[builtin]", inputs: { icon: "icon", title: "title", isLoading: ["isLoading", "isLoading", booleanAttribute], isSelected: ["isSelected", "isSelected", booleanAttribute], isDisabled: ["isDisabled", "isDisabled", booleanAttribute], isMatched: ["isMatched", "isMatched", booleanAttribute], isExpanded: ["isExpanded", "isExpanded", booleanAttribute], isLeaf: ["isLeaf", "isLeaf", booleanAttribute], isChecked: ["isChecked", "isChecked", booleanAttribute], isHalfChecked: ["isHalfChecked", "isHalfChecked", booleanAttribute], isDisableCheckbox: ["isDisableCheckbox", "isDisableCheckbox", booleanAttribute], isSelectable: ["isSelectable", "isSelectable", booleanAttribute], canHide: ["canHide", "canHide", booleanAttribute], isStart: "isStart", isEnd: "isEnd", nzTreeNode: "nzTreeNode", nzShowLine: ["nzShowLine", "nzShowLine", booleanAttribute], nzShowExpand: ["nzShowExpand", "nzShowExpand", booleanAttribute], nzCheckable: ["nzCheckable", "nzCheckable", booleanAttribute], nzAsyncData: ["nzAsyncData", "nzAsyncData", booleanAttribute], nzHideUnMatched: ["nzHideUnMatched", "nzHideUnMatched", booleanAttribute], nzNoAnimation: ["nzNoAnimation", "nzNoAnimation", booleanAttribute], nzSelectMode: ["nzSelectMode", "nzSelectMode", booleanAttribute], nzShowIcon: ["nzShowIcon", "nzShowIcon", booleanAttribute], nzExpandedIcon: "nzExpandedIcon", nzTreeTemplate: "nzTreeTemplate", nzBeforeDrop: "nzBeforeDrop", nzSearchValue: "nzSearchValue", nzDraggable: ["nzDraggable", "nzDraggable", booleanAttribute] }, outputs: { nzClick: "nzClick", nzDblClick: "nzDblClick", nzContextMenu: "nzContextMenu", nzCheckboxChange: "nzCheckboxChange", nzExpandChange: "nzExpandChange", nzOnDragStart: "nzOnDragStart", nzOnDragEnter: "nzOnDragEnter", nzOnDragOver: "nzOnDragOver", nzOnDragLeave: "nzOnDragLeave", nzOnDrop: "nzOnDrop", nzOnDragEnd: "nzOnDragEnd" }, host: { properties: { "class.ant-select-tree-treenode": "nzSelectMode", "class.ant-select-tree-treenode-disabled": "nzSelectMode && isDisabled", "class.ant-select-tree-treenode-switcher-open": "nzSelectMode && isSwitcherOpen", "class.ant-select-tree-treenode-switcher-close": "nzSelectMode && isSwitcherClose", "class.ant-select-tree-treenode-checkbox-checked": "nzSelectMode && isChecked", "class.ant-select-tree-treenode-checkbox-indeterminate": "nzSelectMode && isHalfChecked", "class.ant-select-tree-treenode-selected": "nzSelectMode && isSelected", "class.ant-select-tree-treenode-loading": "nzSelectMode && isLoading", "class.ant-tree-treenode": "!nzSelectMode", "class.ant-tree-treenode-disabled": "!nzSelectMode && isDisabled", "class.ant-tree-treenode-switcher-open": "!nzSelectMode && isSwitcherOpen", "class.ant-tree-treenode-switcher-close": "!nzSelectMode && isSwitcherClose", "class.ant-tree-treenode-checkbox-checked": "!nzSelectMode && isChecked", "class.ant-tree-treenode-checkbox-indeterminate": "!nzSelectMode && isHalfChecked", "class.ant-tree-treenode-selected": "!nzSelectMode && isSelected", "class.ant-tree-treenode-loading": "!nzSelectMode && isLoading", "class.dragging": "draggingKey === nzTreeNode.key", "style.display": "displayStyle" } }, exportAs: ["nzTreeBuiltinNode"], usesOnChanges: true, ngImport: i0, template: `
    <nz-tree-indent
      [nzTreeLevel]="nzTreeNode.level"
      [nzSelectMode]="nzSelectMode"
      [nzIsStart]="isStart"
      [nzIsEnd]="isEnd"
    ></nz-tree-indent>
    @if (nzShowExpand) {
      <nz-tree-node-switcher
        [nzShowExpand]="nzShowExpand"
        [nzShowLine]="nzShowLine"
        [nzExpandedIcon]="nzExpandedIcon"
        [nzSelectMode]="nzSelectMode"
        [context]="nzTreeNode"
        [isLeaf]="isLeaf"
        [isExpanded]="isExpanded"
        [isLoading]="isLoading"
        (click)="clickExpand($event)"
      ></nz-tree-node-switcher>
    }
    @if (nzCheckable) {
      <nz-tree-node-checkbox
        builtin
        (click)="clickCheckbox($event)"
        [nzSelectMode]="nzSelectMode"
        [isChecked]="isChecked"
        [isHalfChecked]="isHalfChecked"
        [isDisabled]="isDisabled"
        [isDisableCheckbox]="isDisableCheckbox"
      ></nz-tree-node-checkbox>
    }
    <nz-tree-node-title
      [icon]="icon"
      [title]="title"
      [isLoading]="isLoading"
      [isSelected]="isSelected"
      [isDisabled]="isDisabled"
      [isMatched]="isMatched"
      [isExpanded]="isExpanded"
      [isLeaf]="isLeaf"
      [searchValue]="nzSearchValue"
      [treeTemplate]="nzTreeTemplate"
      [draggable]="nzDraggable"
      [showIcon]="nzShowIcon"
      [selectMode]="nzSelectMode"
      [context]="nzTreeNode"
      [showIndicator]="showIndicator"
      [dragPosition]="dragPos"
      (dblclick)="dblClick($event)"
      (click)="clickSelect($event)"
      (contextmenu)="contextMenu($event)"
    ></nz-tree-node-title>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTreeIndentComponent, selector: "nz-tree-indent", inputs: ["nzTreeLevel", "nzIsStart", "nzIsEnd", "nzSelectMode"], exportAs: ["nzTreeIndent"] }, { kind: "component", type: NzTreeNodeSwitcherComponent, selector: "nz-tree-node-switcher", inputs: ["nzShowExpand", "nzShowLine", "nzExpandedIcon", "nzSelectMode", "context", "isLeaf", "isLoading", "isExpanded"] }, { kind: "component", type: NzTreeNodeBuiltinCheckboxComponent, selector: "nz-tree-node-checkbox[builtin]", inputs: ["nzSelectMode", "isChecked", "isHalfChecked", "isDisabled", "isDisableCheckbox"] }, { kind: "component", type: NzTreeNodeTitleComponent, selector: "nz-tree-node-title", inputs: ["searchValue", "treeTemplate", "draggable", "showIcon", "selectMode", "context", "icon", "title", "isLoading", "isSelected", "isDisabled", "isMatched", "isExpanded", "isLeaf", "showIndicator", "dragPosition"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeNodeBuiltinComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree-node[builtin]',
                    exportAs: 'nzTreeBuiltinNode',
                    template: `
    <nz-tree-indent
      [nzTreeLevel]="nzTreeNode.level"
      [nzSelectMode]="nzSelectMode"
      [nzIsStart]="isStart"
      [nzIsEnd]="isEnd"
    ></nz-tree-indent>
    @if (nzShowExpand) {
      <nz-tree-node-switcher
        [nzShowExpand]="nzShowExpand"
        [nzShowLine]="nzShowLine"
        [nzExpandedIcon]="nzExpandedIcon"
        [nzSelectMode]="nzSelectMode"
        [context]="nzTreeNode"
        [isLeaf]="isLeaf"
        [isExpanded]="isExpanded"
        [isLoading]="isLoading"
        (click)="clickExpand($event)"
      ></nz-tree-node-switcher>
    }
    @if (nzCheckable) {
      <nz-tree-node-checkbox
        builtin
        (click)="clickCheckbox($event)"
        [nzSelectMode]="nzSelectMode"
        [isChecked]="isChecked"
        [isHalfChecked]="isHalfChecked"
        [isDisabled]="isDisabled"
        [isDisableCheckbox]="isDisableCheckbox"
      ></nz-tree-node-checkbox>
    }
    <nz-tree-node-title
      [icon]="icon"
      [title]="title"
      [isLoading]="isLoading"
      [isSelected]="isSelected"
      [isDisabled]="isDisabled"
      [isMatched]="isMatched"
      [isExpanded]="isExpanded"
      [isLeaf]="isLeaf"
      [searchValue]="nzSearchValue"
      [treeTemplate]="nzTreeTemplate"
      [draggable]="nzDraggable"
      [showIcon]="nzShowIcon"
      [selectMode]="nzSelectMode"
      [context]="nzTreeNode"
      [showIndicator]="showIndicator"
      [dragPosition]="dragPos"
      (dblclick)="dblClick($event)"
      (click)="clickSelect($event)"
      (contextmenu)="contextMenu($event)"
    ></nz-tree-node-title>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    host: {
                        '[class.ant-select-tree-treenode]': `nzSelectMode`,
                        '[class.ant-select-tree-treenode-disabled]': `nzSelectMode && isDisabled`,
                        '[class.ant-select-tree-treenode-switcher-open]': `nzSelectMode && isSwitcherOpen`,
                        '[class.ant-select-tree-treenode-switcher-close]': `nzSelectMode && isSwitcherClose`,
                        '[class.ant-select-tree-treenode-checkbox-checked]': `nzSelectMode && isChecked`,
                        '[class.ant-select-tree-treenode-checkbox-indeterminate]': `nzSelectMode && isHalfChecked`,
                        '[class.ant-select-tree-treenode-selected]': `nzSelectMode && isSelected`,
                        '[class.ant-select-tree-treenode-loading]': `nzSelectMode && isLoading`,
                        '[class.ant-tree-treenode]': `!nzSelectMode`,
                        '[class.ant-tree-treenode-disabled]': `!nzSelectMode && isDisabled`,
                        '[class.ant-tree-treenode-switcher-open]': `!nzSelectMode && isSwitcherOpen`,
                        '[class.ant-tree-treenode-switcher-close]': `!nzSelectMode && isSwitcherClose`,
                        '[class.ant-tree-treenode-checkbox-checked]': `!nzSelectMode && isChecked`,
                        '[class.ant-tree-treenode-checkbox-indeterminate]': `!nzSelectMode && isHalfChecked`,
                        '[class.ant-tree-treenode-selected]': `!nzSelectMode && isSelected`,
                        '[class.ant-tree-treenode-loading]': `!nzSelectMode && isLoading`,
                        '[class.dragging]': `draggingKey === nzTreeNode.key`,
                        '[style.display]': 'displayStyle'
                    },
                    imports: [
                        NzTreeIndentComponent,
                        NzTreeNodeSwitcherComponent,
                        NzTreeNodeBuiltinCheckboxComponent,
                        NzTreeNodeTitleComponent
                    ]
                }]
        }], ctorParameters: () => [{ type: i1$1.NzTreeBaseService }, { type: i0.NgZone }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { icon: [{
                type: Input
            }], title: [{
                type: Input
            }], isLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isSelected: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isMatched: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isExpanded: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isLeaf: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isHalfChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isDisableCheckbox: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isSelectable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], canHide: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], isStart: [{
                type: Input
            }], isEnd: [{
                type: Input
            }], nzTreeNode: [{
                type: Input
            }], nzShowLine: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowExpand: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAsyncData: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzHideUnMatched: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNoAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelectMode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowIcon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandedIcon: [{
                type: Input
            }], nzTreeTemplate: [{
                type: Input
            }], nzBeforeDrop: [{
                type: Input
            }], nzSearchValue: [{
                type: Input
            }], nzDraggable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzClick: [{
                type: Output
            }], nzDblClick: [{
                type: Output
            }], nzContextMenu: [{
                type: Output
            }], nzCheckboxChange: [{
                type: Output
            }], nzExpandChange: [{
                type: Output
            }], nzOnDragStart: [{
                type: Output
            }], nzOnDragEnter: [{
                type: Output
            }], nzOnDragOver: [{
                type: Output
            }], nzOnDragLeave: [{
                type: Output
            }], nzOnDrop: [{
                type: Output
            }], nzOnDragEnd: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeService extends NzTreeBaseService {
    constructor() {
        super();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

function NzTreeServiceFactory() {
    const higherOrderService = inject(NzTreeHigherOrderServiceToken, { skipSelf: true, optional: true });
    const treeService = inject(NzTreeService);
    return higherOrderService ?? treeService;
}
const NZ_CONFIG_MODULE_NAME = 'tree';
let NzTreeComponent = (() => {
    let _classSuper = NzTreeBase;
    let _nzShowIcon_decorators;
    let _nzShowIcon_initializers = [];
    let _nzShowIcon_extraInitializers = [];
    let _nzHideUnMatched_decorators;
    let _nzHideUnMatched_initializers = [];
    let _nzHideUnMatched_extraInitializers = [];
    let _nzBlockNode_decorators;
    let _nzBlockNode_initializers = [];
    let _nzBlockNode_extraInitializers = [];
    return class NzTreeComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _nzShowIcon_decorators = [WithConfig()];
            _nzHideUnMatched_decorators = [WithConfig()];
            _nzBlockNode_decorators = [WithConfig()];
            __esDecorate(null, null, _nzShowIcon_decorators, { kind: "field", name: "nzShowIcon", static: false, private: false, access: { has: obj => "nzShowIcon" in obj, get: obj => obj.nzShowIcon, set: (obj, value) => { obj.nzShowIcon = value; } }, metadata: _metadata }, _nzShowIcon_initializers, _nzShowIcon_extraInitializers);
            __esDecorate(null, null, _nzHideUnMatched_decorators, { kind: "field", name: "nzHideUnMatched", static: false, private: false, access: { has: obj => "nzHideUnMatched" in obj, get: obj => obj.nzHideUnMatched, set: (obj, value) => { obj.nzHideUnMatched = value; } }, metadata: _metadata }, _nzHideUnMatched_initializers, _nzHideUnMatched_extraInitializers);
            __esDecorate(null, null, _nzBlockNode_decorators, { kind: "field", name: "nzBlockNode", static: false, private: false, access: { has: obj => "nzBlockNode" in obj, get: obj => obj.nzBlockNode, set: (obj, value) => { obj.nzBlockNode = value; } }, metadata: _metadata }, _nzBlockNode_initializers, _nzBlockNode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzShowIcon = __runInitializers(this, _nzShowIcon_initializers, false);
        nzHideUnMatched = (__runInitializers(this, _nzShowIcon_extraInitializers), __runInitializers(this, _nzHideUnMatched_initializers, false));
        nzBlockNode = (__runInitializers(this, _nzHideUnMatched_extraInitializers), __runInitializers(this, _nzBlockNode_initializers, false));
        nzExpandAll = (__runInitializers(this, _nzBlockNode_extraInitializers), false);
        nzSelectMode = false;
        nzCheckStrictly = false;
        nzShowExpand = true;
        nzShowLine = false;
        nzCheckable = false;
        nzAsyncData = false;
        nzDraggable = false;
        nzMultiple = false;
        nzExpandedIcon;
        nzVirtualItemSize = 28;
        nzVirtualMaxBufferPx = 500;
        nzVirtualMinBufferPx = 28;
        nzVirtualHeight = null;
        nzTreeTemplate;
        nzBeforeDrop;
        nzData = [];
        nzExpandedKeys = [];
        nzSelectedKeys = [];
        nzCheckedKeys = [];
        nzSearchValue = '';
        nzSearchFunc;
        nzTreeTemplateChild;
        cdkVirtualScrollViewport;
        nzFlattenNodes = [];
        beforeInit = true;
        dir = 'ltr';
        nzExpandedKeysChange = new EventEmitter();
        nzSelectedKeysChange = new EventEmitter();
        nzCheckedKeysChange = new EventEmitter();
        nzSearchValueChange = new EventEmitter();
        nzClick = new EventEmitter();
        nzDblClick = new EventEmitter();
        nzContextMenu = new EventEmitter();
        nzCheckboxChange = new EventEmitter();
        nzExpandChange = new EventEmitter();
        nzOnDragStart = new EventEmitter();
        nzOnDragEnter = new EventEmitter();
        nzOnDragOver = new EventEmitter();
        nzOnDragLeave = new EventEmitter();
        nzOnDrop = new EventEmitter();
        nzOnDragEnd = new EventEmitter();
        HIDDEN_STYLE = {
            width: 0,
            height: 0,
            display: 'flex',
            overflow: 'hidden',
            opacity: 0,
            border: 0,
            padding: 0,
            margin: 0
        };
        HIDDEN_NODE_STYLE = {
            position: 'absolute',
            pointerEvents: 'none',
            visibility: 'hidden',
            height: 0,
            overflow: 'hidden'
        };
        destroy$ = new Subject();
        onChange = () => null;
        onTouched = () => null;
        writeValue(value) {
            this.handleNzData(value);
        }
        registerOnChange(fn) {
            this.onChange = fn;
        }
        registerOnTouched(fn) {
            this.onTouched = fn;
        }
        /**
         * Render all properties of nzTree
         *
         * @param changes all changes from @Input
         */
        renderTreeProperties(changes) {
            let useDefaultExpandedKeys = false;
            let expandAll = false;
            const { nzData, nzExpandedKeys, nzSelectedKeys, nzCheckedKeys, nzCheckStrictly, nzExpandAll, nzMultiple, nzSearchValue } = changes;
            if (nzExpandAll) {
                useDefaultExpandedKeys = true;
                expandAll = this.nzExpandAll;
            }
            if (nzMultiple) {
                this.nzTreeService.isMultiple = this.nzMultiple;
            }
            if (nzCheckStrictly) {
                this.nzTreeService.isCheckStrictly = this.nzCheckStrictly;
            }
            if (nzData) {
                this.handleNzData(this.nzData);
            }
            if (nzCheckedKeys) {
                this.handleCheckedKeys(this.nzCheckedKeys);
            }
            if (nzCheckStrictly) {
                this.handleCheckedKeys(null);
            }
            if (nzExpandedKeys || nzExpandAll) {
                useDefaultExpandedKeys = true;
                this.handleExpandedKeys(expandAll || this.nzExpandedKeys);
            }
            if (nzSelectedKeys) {
                this.handleSelectedKeys(this.nzSelectedKeys, this.nzMultiple);
            }
            if (nzSearchValue) {
                if (!(nzSearchValue.firstChange && !this.nzSearchValue)) {
                    useDefaultExpandedKeys = false;
                    this.handleSearchValue(nzSearchValue.currentValue, this.nzSearchFunc);
                    this.nzSearchValueChange.emit(this.nzTreeService.formatEvent('search', null, null));
                }
            }
            // flatten data
            const currentExpandedKeys = this.getExpandedNodeList().map(v => v.key);
            const newExpandedKeys = useDefaultExpandedKeys ? expandAll || this.nzExpandedKeys : currentExpandedKeys;
            this.handleFlattenNodes(this.nzTreeService.rootNodes, newExpandedKeys);
        }
        trackByFlattenNode(_, node) {
            return node.key;
        }
        // Deal with properties
        /**
         * nzData
         *
         * @param value
         */
        handleNzData(value) {
            if (Array.isArray(value)) {
                const data = this.coerceTreeNodes(value);
                this.nzTreeService.initTree(data);
            }
        }
        handleFlattenNodes(data, expandKeys = []) {
            this.nzTreeService.flattenTreeData(data, expandKeys);
        }
        handleCheckedKeys(keys) {
            this.nzTreeService.conductCheck(keys, this.nzCheckStrictly);
        }
        handleExpandedKeys(keys = []) {
            this.nzTreeService.conductExpandedKeys(keys);
        }
        handleSelectedKeys(keys, isMulti) {
            this.nzTreeService.conductSelectedKeys(keys, isMulti);
        }
        handleSearchValue(value, searchFunc) {
            const dataList = flattenTreeData(this.nzTreeService.rootNodes, true).map(v => v.data);
            const checkIfMatched = (node) => {
                if (searchFunc) {
                    return searchFunc(node.origin);
                }
                return !!value && node.title.toLowerCase().includes(value.toLowerCase());
            };
            dataList.forEach(v => {
                v.isMatched = checkIfMatched(v);
                v.canHide = !v.isMatched;
                if (!v.isMatched) {
                    v.setExpanded(false);
                    this.nzTreeService.setExpandedNodeList(v);
                }
                else {
                    // expand
                    this.nzTreeService.expandNodeAllParentBySearch(v);
                }
                this.nzTreeService.setMatchedNodeList(v);
            });
        }
        /**
         * Handle emit event
         *
         * @param event
         * handle each event
         */
        eventTriggerChanged(event) {
            const node = event.node;
            switch (event.eventName) {
                case 'expand':
                    this.renderTree();
                    this.nzExpandChange.emit(event);
                    break;
                case 'click':
                    this.nzClick.emit(event);
                    break;
                case 'dblclick':
                    this.nzDblClick.emit(event);
                    break;
                case 'contextmenu':
                    this.nzContextMenu.emit(event);
                    break;
                case 'check': {
                    // Render checked state with nodes' property `isChecked`
                    this.nzTreeService.setCheckedNodeList(node);
                    if (!this.nzCheckStrictly) {
                        this.nzTreeService.conduct(node);
                    }
                    // Cause check method will rerender list, so we need recover it and next the new event to user
                    const eventNext = this.nzTreeService.formatEvent('check', node, event.event);
                    this.nzCheckboxChange.emit(eventNext);
                    const checkedKeys = this.nzTreeService.getCheckedNodeKeys();
                    this.nzCheckedKeysChange.emit(checkedKeys);
                    break;
                }
                case 'dragstart':
                    // if node is expanded
                    if (node.isExpanded) {
                        node.setExpanded(!node.isExpanded);
                        this.renderTree();
                    }
                    this.nzOnDragStart.emit(event);
                    break;
                case 'dragenter': {
                    const selectedNode = this.nzTreeService.getSelectedNode();
                    if (selectedNode && selectedNode.key !== node.key && !node.isExpanded && !node.isLeaf) {
                        node.setExpanded(true);
                        this.renderTree();
                    }
                    this.nzOnDragEnter.emit(event);
                    break;
                }
                case 'dragover':
                    this.nzOnDragOver.emit(event);
                    break;
                case 'dragleave':
                    this.nzOnDragLeave.emit(event);
                    break;
                case 'dragend':
                    this.nzOnDragEnd.emit(event);
                    break;
                case 'drop':
                    this.renderTree();
                    this.nzOnDrop.emit(event);
                    break;
            }
        }
        /**
         * Click expand icon
         */
        renderTree() {
            this.handleFlattenNodes(this.nzTreeService.rootNodes, this.getExpandedNodeList().map(v => v.key));
            this.cdr.markForCheck();
        }
        // Handle emit event end
        noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });
        constructor(nzTreeService, nzConfigService, cdr, directionality) {
            super(nzTreeService);
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.directionality = directionality;
        }
        ngOnInit() {
            this.nzTreeService.flattenNodes$.pipe(takeUntil(this.destroy$)).subscribe(data => {
                this.nzFlattenNodes =
                    !!this.nzVirtualHeight && this.nzHideUnMatched && this.nzSearchValue?.length > 0
                        ? data.filter(d => !d.canHide)
                        : data;
                this.cdr.markForCheck();
            });
            this.dir = this.directionality.value;
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
        }
        ngOnChanges(changes) {
            this.renderTreeProperties(changes);
        }
        ngAfterViewInit() {
            this.beforeInit = false;
        }
        ngOnDestroy() {
            this.destroy$.next(true);
            this.destroy$.complete();
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeComponent, deps: [{ token: i1$1.NzTreeBaseService }, { token: i2$2.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i3.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTreeComponent, isStandalone: true, selector: "nz-tree", inputs: { nzShowIcon: ["nzShowIcon", "nzShowIcon", booleanAttribute], nzHideUnMatched: ["nzHideUnMatched", "nzHideUnMatched", booleanAttribute], nzBlockNode: ["nzBlockNode", "nzBlockNode", booleanAttribute], nzExpandAll: ["nzExpandAll", "nzExpandAll", booleanAttribute], nzSelectMode: ["nzSelectMode", "nzSelectMode", booleanAttribute], nzCheckStrictly: ["nzCheckStrictly", "nzCheckStrictly", booleanAttribute], nzShowExpand: ["nzShowExpand", "nzShowExpand", booleanAttribute], nzShowLine: ["nzShowLine", "nzShowLine", booleanAttribute], nzCheckable: ["nzCheckable", "nzCheckable", booleanAttribute], nzAsyncData: ["nzAsyncData", "nzAsyncData", booleanAttribute], nzDraggable: ["nzDraggable", "nzDraggable", booleanAttribute], nzMultiple: ["nzMultiple", "nzMultiple", booleanAttribute], nzExpandedIcon: "nzExpandedIcon", nzVirtualItemSize: "nzVirtualItemSize", nzVirtualMaxBufferPx: "nzVirtualMaxBufferPx", nzVirtualMinBufferPx: "nzVirtualMinBufferPx", nzVirtualHeight: "nzVirtualHeight", nzTreeTemplate: "nzTreeTemplate", nzBeforeDrop: "nzBeforeDrop", nzData: "nzData", nzExpandedKeys: "nzExpandedKeys", nzSelectedKeys: "nzSelectedKeys", nzCheckedKeys: "nzCheckedKeys", nzSearchValue: "nzSearchValue", nzSearchFunc: "nzSearchFunc" }, outputs: { nzExpandedKeysChange: "nzExpandedKeysChange", nzSelectedKeysChange: "nzSelectedKeysChange", nzCheckedKeysChange: "nzCheckedKeysChange", nzSearchValueChange: "nzSearchValueChange", nzClick: "nzClick", nzDblClick: "nzDblClick", nzContextMenu: "nzContextMenu", nzCheckboxChange: "nzCheckboxChange", nzExpandChange: "nzExpandChange", nzOnDragStart: "nzOnDragStart", nzOnDragEnter: "nzOnDragEnter", nzOnDragOver: "nzOnDragOver", nzOnDragLeave: "nzOnDragLeave", nzOnDrop: "nzOnDrop", nzOnDragEnd: "nzOnDragEnd" }, host: { properties: { "class.ant-select-tree": "nzSelectMode", "class.ant-select-tree-show-line": "nzSelectMode && nzShowLine", "class.ant-select-tree-icon-hide": "nzSelectMode && !nzShowIcon", "class.ant-select-tree-block-node": "nzSelectMode && nzBlockNode", "class.ant-tree": "!nzSelectMode", "class.ant-tree-rtl": "dir === 'rtl'", "class.ant-tree-show-line": "!nzSelectMode && nzShowLine", "class.ant-tree-icon-hide": "!nzSelectMode && !nzShowIcon", "class.ant-tree-block-node": "!nzSelectMode && nzBlockNode", "class.draggable-tree": "nzDraggable" } }, providers: [
                NzTreeService,
                {
                    provide: NzTreeBaseService,
                    useFactory: NzTreeServiceFactory
                },
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(() => NzTreeComponent),
                    multi: true
                }
            ], queries: [{ propertyName: "nzTreeTemplateChild", first: true, predicate: ["nzTreeTemplate"], descendants: true, static: true }], viewQueries: [{ propertyName: "cdkVirtualScrollViewport", first: true, predicate: CdkVirtualScrollViewport, descendants: true, read: CdkVirtualScrollViewport }], exportAs: ["nzTree"], usesInheritance: true, usesOnChanges: true, ngImport: i0, template: `
    <div>
      <input [style]="HIDDEN_STYLE" />
    </div>
    <div class="ant-tree-treenode" [style]="HIDDEN_NODE_STYLE">
      <div class="ant-tree-indent">
        <div class="ant-tree-indent-unit"></div>
      </div>
    </div>
    <div class="ant-tree-list" [class.ant-select-tree-list]="nzSelectMode" style="position: relative">
      @if (nzVirtualHeight) {
        <cdk-virtual-scroll-viewport
          [class.ant-select-tree-list-holder-inner]="nzSelectMode"
          [class.ant-tree-list-holder-inner]="!nzSelectMode"
          [itemSize]="nzVirtualItemSize"
          [minBufferPx]="nzVirtualMinBufferPx"
          [maxBufferPx]="nzVirtualMaxBufferPx"
          [style.height]="nzVirtualHeight"
        >
          <ng-container *cdkVirtualFor="let node of nzFlattenNodes; trackBy: trackByFlattenNode">
            <ng-template
              [ngTemplateOutlet]="nodeTemplate"
              [ngTemplateOutletContext]="{ $implicit: node }"
            ></ng-template>
          </ng-container>
        </cdk-virtual-scroll-viewport>
      } @else {
        <div
          [class.ant-select-tree-list-holder-inner]="nzSelectMode"
          [class.ant-tree-list-holder-inner]="!nzSelectMode"
          [@.disabled]="beforeInit || !!noAnimation?.nzNoAnimation"
          [nzNoAnimation]="noAnimation?.nzNoAnimation"
          [@treeCollapseMotion]="nzFlattenNodes.length"
        >
          @for (node of nzFlattenNodes; track trackByFlattenNode($index, node)) {
            <ng-template
              [ngTemplateOutlet]="nodeTemplate"
              [ngTemplateOutletContext]="{ $implicit: node }"
            ></ng-template>
          }
        </div>
      }
    </div>
    <ng-template #nodeTemplate let-treeNode>
      <nz-tree-node
        builtin
        [icon]="treeNode.icon"
        [title]="treeNode.title"
        [isLoading]="treeNode.isLoading"
        [isSelected]="treeNode.isSelected"
        [isDisabled]="treeNode.isDisabled"
        [isMatched]="treeNode.isMatched"
        [isExpanded]="treeNode.isExpanded"
        [isLeaf]="treeNode.isLeaf"
        [isStart]="treeNode.isStart"
        [isEnd]="treeNode.isEnd"
        [isChecked]="treeNode.isChecked"
        [isHalfChecked]="treeNode.isHalfChecked"
        [isDisableCheckbox]="treeNode.isDisableCheckbox"
        [isSelectable]="treeNode.isSelectable"
        [canHide]="treeNode.canHide"
        [nzTreeNode]="treeNode"
        [nzSelectMode]="nzSelectMode"
        [nzShowLine]="nzShowLine"
        [nzExpandedIcon]="nzExpandedIcon"
        [nzDraggable]="nzDraggable"
        [nzCheckable]="nzCheckable"
        [nzShowExpand]="nzShowExpand"
        [nzAsyncData]="nzAsyncData"
        [nzSearchValue]="nzSearchValue"
        [nzHideUnMatched]="nzHideUnMatched"
        [nzBeforeDrop]="nzBeforeDrop"
        [nzShowIcon]="nzShowIcon"
        [nzTreeTemplate]="nzTreeTemplate || nzTreeTemplateChild"
        (nzExpandChange)="eventTriggerChanged($event)"
        (nzClick)="eventTriggerChanged($event)"
        (nzDblClick)="eventTriggerChanged($event)"
        (nzContextMenu)="eventTriggerChanged($event)"
        (nzCheckboxChange)="eventTriggerChanged($event)"
        (nzOnDragStart)="eventTriggerChanged($event)"
        (nzOnDragEnter)="eventTriggerChanged($event)"
        (nzOnDragOver)="eventTriggerChanged($event)"
        (nzOnDragLeave)="eventTriggerChanged($event)"
        (nzOnDragEnd)="eventTriggerChanged($event)"
        (nzOnDrop)="eventTriggerChanged($event)"
      ></nz-tree-node>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: CdkVirtualScrollViewport, selector: "cdk-virtual-scroll-viewport", inputs: ["orientation", "appendOnly"], outputs: ["scrolledIndexChange"] }, { kind: "directive", type: CdkFixedSizeVirtualScroll, selector: "cdk-virtual-scroll-viewport[itemSize]", inputs: ["itemSize", "minBufferPx", "maxBufferPx"] }, { kind: "directive", type: CdkVirtualForOf, selector: "[cdkVirtualFor][cdkVirtualForOf]", inputs: ["cdkVirtualForOf", "cdkVirtualForTrackBy", "cdkVirtualForTemplate", "cdkVirtualForTemplateCacheSize"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NzNoAnimationDirective, selector: "[nzNoAnimation]", inputs: ["nzNoAnimation"], exportAs: ["nzNoAnimation"] }, { kind: "component", type: NzTreeNodeBuiltinComponent, selector: "nz-tree-node[builtin]", inputs: ["icon", "title", "isLoading", "isSelected", "isDisabled", "isMatched", "isExpanded", "isLeaf", "isChecked", "isHalfChecked", "isDisableCheckbox", "isSelectable", "canHide", "isStart", "isEnd", "nzTreeNode", "nzShowLine", "nzShowExpand", "nzCheckable", "nzAsyncData", "nzHideUnMatched", "nzNoAnimation", "nzSelectMode", "nzShowIcon", "nzExpandedIcon", "nzTreeTemplate", "nzBeforeDrop", "nzSearchValue", "nzDraggable"], outputs: ["nzClick", "nzDblClick", "nzContextMenu", "nzCheckboxChange", "nzExpandChange", "nzOnDragStart", "nzOnDragEnter", "nzOnDragOver", "nzOnDragLeave", "nzOnDrop", "nzOnDragEnd"], exportAs: ["nzTreeBuiltinNode"] }], animations: [treeCollapseMotion], changeDetection: i0.ChangeDetectionStrategy.OnPush });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tree',
                    exportAs: 'nzTree',
                    animations: [treeCollapseMotion],
                    template: `
    <div>
      <input [style]="HIDDEN_STYLE" />
    </div>
    <div class="ant-tree-treenode" [style]="HIDDEN_NODE_STYLE">
      <div class="ant-tree-indent">
        <div class="ant-tree-indent-unit"></div>
      </div>
    </div>
    <div class="ant-tree-list" [class.ant-select-tree-list]="nzSelectMode" style="position: relative">
      @if (nzVirtualHeight) {
        <cdk-virtual-scroll-viewport
          [class.ant-select-tree-list-holder-inner]="nzSelectMode"
          [class.ant-tree-list-holder-inner]="!nzSelectMode"
          [itemSize]="nzVirtualItemSize"
          [minBufferPx]="nzVirtualMinBufferPx"
          [maxBufferPx]="nzVirtualMaxBufferPx"
          [style.height]="nzVirtualHeight"
        >
          <ng-container *cdkVirtualFor="let node of nzFlattenNodes; trackBy: trackByFlattenNode">
            <ng-template
              [ngTemplateOutlet]="nodeTemplate"
              [ngTemplateOutletContext]="{ $implicit: node }"
            ></ng-template>
          </ng-container>
        </cdk-virtual-scroll-viewport>
      } @else {
        <div
          [class.ant-select-tree-list-holder-inner]="nzSelectMode"
          [class.ant-tree-list-holder-inner]="!nzSelectMode"
          [@.disabled]="beforeInit || !!noAnimation?.nzNoAnimation"
          [nzNoAnimation]="noAnimation?.nzNoAnimation"
          [@treeCollapseMotion]="nzFlattenNodes.length"
        >
          @for (node of nzFlattenNodes; track trackByFlattenNode($index, node)) {
            <ng-template
              [ngTemplateOutlet]="nodeTemplate"
              [ngTemplateOutletContext]="{ $implicit: node }"
            ></ng-template>
          }
        </div>
      }
    </div>
    <ng-template #nodeTemplate let-treeNode>
      <nz-tree-node
        builtin
        [icon]="treeNode.icon"
        [title]="treeNode.title"
        [isLoading]="treeNode.isLoading"
        [isSelected]="treeNode.isSelected"
        [isDisabled]="treeNode.isDisabled"
        [isMatched]="treeNode.isMatched"
        [isExpanded]="treeNode.isExpanded"
        [isLeaf]="treeNode.isLeaf"
        [isStart]="treeNode.isStart"
        [isEnd]="treeNode.isEnd"
        [isChecked]="treeNode.isChecked"
        [isHalfChecked]="treeNode.isHalfChecked"
        [isDisableCheckbox]="treeNode.isDisableCheckbox"
        [isSelectable]="treeNode.isSelectable"
        [canHide]="treeNode.canHide"
        [nzTreeNode]="treeNode"
        [nzSelectMode]="nzSelectMode"
        [nzShowLine]="nzShowLine"
        [nzExpandedIcon]="nzExpandedIcon"
        [nzDraggable]="nzDraggable"
        [nzCheckable]="nzCheckable"
        [nzShowExpand]="nzShowExpand"
        [nzAsyncData]="nzAsyncData"
        [nzSearchValue]="nzSearchValue"
        [nzHideUnMatched]="nzHideUnMatched"
        [nzBeforeDrop]="nzBeforeDrop"
        [nzShowIcon]="nzShowIcon"
        [nzTreeTemplate]="nzTreeTemplate || nzTreeTemplateChild"
        (nzExpandChange)="eventTriggerChanged($event)"
        (nzClick)="eventTriggerChanged($event)"
        (nzDblClick)="eventTriggerChanged($event)"
        (nzContextMenu)="eventTriggerChanged($event)"
        (nzCheckboxChange)="eventTriggerChanged($event)"
        (nzOnDragStart)="eventTriggerChanged($event)"
        (nzOnDragEnter)="eventTriggerChanged($event)"
        (nzOnDragOver)="eventTriggerChanged($event)"
        (nzOnDragLeave)="eventTriggerChanged($event)"
        (nzOnDragEnd)="eventTriggerChanged($event)"
        (nzOnDrop)="eventTriggerChanged($event)"
      ></nz-tree-node>
    </ng-template>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        NzTreeService,
                        {
                            provide: NzTreeBaseService,
                            useFactory: NzTreeServiceFactory
                        },
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzTreeComponent),
                            multi: true
                        }
                    ],
                    host: {
                        '[class.ant-select-tree]': `nzSelectMode`,
                        '[class.ant-select-tree-show-line]': `nzSelectMode && nzShowLine`,
                        '[class.ant-select-tree-icon-hide]': `nzSelectMode && !nzShowIcon`,
                        '[class.ant-select-tree-block-node]': `nzSelectMode && nzBlockNode`,
                        '[class.ant-tree]': `!nzSelectMode`,
                        '[class.ant-tree-rtl]': `dir === 'rtl'`,
                        '[class.ant-tree-show-line]': `!nzSelectMode && nzShowLine`,
                        '[class.ant-tree-icon-hide]': `!nzSelectMode && !nzShowIcon`,
                        '[class.ant-tree-block-node]': `!nzSelectMode && nzBlockNode`,
                        '[class.draggable-tree]': `nzDraggable`
                    },
                    imports: [
                        CdkVirtualScrollViewport,
                        CdkFixedSizeVirtualScroll,
                        CdkVirtualForOf,
                        NgTemplateOutlet,
                        NzNoAnimationDirective,
                        NzTreeNodeBuiltinComponent
                    ]
                }]
        }], ctorParameters: () => [{ type: i1$1.NzTreeBaseService }, { type: i2$2.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i3.Directionality }], propDecorators: { nzShowIcon: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzHideUnMatched: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBlockNode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandAll: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSelectMode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckStrictly: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowExpand: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowLine: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzAsyncData: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDraggable: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzMultiple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandedIcon: [{
                type: Input
            }], nzVirtualItemSize: [{
                type: Input
            }], nzVirtualMaxBufferPx: [{
                type: Input
            }], nzVirtualMinBufferPx: [{
                type: Input
            }], nzVirtualHeight: [{
                type: Input
            }], nzTreeTemplate: [{
                type: Input
            }], nzBeforeDrop: [{
                type: Input
            }], nzData: [{
                type: Input
            }], nzExpandedKeys: [{
                type: Input
            }], nzSelectedKeys: [{
                type: Input
            }], nzCheckedKeys: [{
                type: Input
            }], nzSearchValue: [{
                type: Input
            }], nzSearchFunc: [{
                type: Input
            }], nzTreeTemplateChild: [{
                type: ContentChild,
                args: ['nzTreeTemplate', { static: true }]
            }], cdkVirtualScrollViewport: [{
                type: ViewChild,
                args: [CdkVirtualScrollViewport, { read: CdkVirtualScrollViewport }]
            }], nzExpandedKeysChange: [{
                type: Output
            }], nzSelectedKeysChange: [{
                type: Output
            }], nzCheckedKeysChange: [{
                type: Output
            }], nzSearchValueChange: [{
                type: Output
            }], nzClick: [{
                type: Output
            }], nzDblClick: [{
                type: Output
            }], nzContextMenu: [{
                type: Output
            }], nzCheckboxChange: [{
                type: Output
            }], nzExpandChange: [{
                type: Output
            }], nzOnDragStart: [{
                type: Output
            }], nzOnDragEnter: [{
                type: Output
            }], nzOnDragOver: [{
                type: Output
            }], nzOnDragLeave: [{
                type: Output
            }], nzOnDrop: [{
                type: Output
            }], nzOnDragEnd: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTreeModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzTreeModule, imports: [NzTreeComponent,
            NzTreeNodeBuiltinComponent,
            NzTreeIndentComponent,
            NzTreeNodeSwitcherComponent,
            NzTreeNodeBuiltinCheckboxComponent,
            NzTreeNodeTitleComponent,
            NzTreeDropIndicatorComponent], exports: [NzTreeComponent, NzTreeNodeBuiltinComponent, NzTreeIndentComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeModule, imports: [NzTreeComponent,
            NzTreeNodeBuiltinComponent,
            NzTreeNodeSwitcherComponent,
            NzTreeNodeTitleComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTreeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzTreeComponent,
                        NzTreeNodeBuiltinComponent,
                        NzTreeIndentComponent,
                        NzTreeNodeSwitcherComponent,
                        NzTreeNodeBuiltinCheckboxComponent,
                        NzTreeNodeTitleComponent,
                        NzTreeDropIndicatorComponent
                    ],
                    exports: [NzTreeComponent, NzTreeNodeBuiltinComponent, NzTreeIndentComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzTreeComponent, NzTreeIndentComponent, NzTreeModule, NzTreeNodeBuiltinCheckboxComponent, NzTreeNodeBuiltinComponent, NzTreeNodeSwitcherComponent, NzTreeNodeTitleComponent, NzTreeService, NzTreeServiceFactory };
//# sourceMappingURL=ng-zorro-antd-tree.mjs.map
