import * as i0 from '@angular/core';
import { EventEmitter, ElementRef, booleanAttribute, ViewChild, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, Directive, Injectable, inject, NgZone, ViewChildren, ContentChild, ContentChildren, NgModule } from '@angular/core';
import { __esDecorate, __runInitializers } from 'tslib';
import { takeUntil, map, distinctUntilChanged, debounceTime, skip, filter, switchMap, startWith, delay, mergeMap } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/config';
import { WithConfig } from 'ng-zorro-antd/core/config';
import * as i2 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular, arraysEqual, isNil, measureScrollbar } from 'ng-zorro-antd/core/util';
import * as i4 from 'ng-zorro-antd/dropdown';
import { NzDropDownModule, NzDropDownDirective } from 'ng-zorro-antd/dropdown';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import * as i6 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subject, ReplaySubject, BehaviorSubject, combineLatest, merge, EMPTY, of } from 'rxjs';
import * as i7 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i5 from 'ng-zorro-antd/checkbox';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import * as i2$1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioComponent } from 'ng-zorro-antd/radio';
import * as i1$1 from 'ng-zorro-antd/i18n';
import * as i3 from 'ng-zorro-antd/menu';
import * as i8 from 'ng-zorro-antd/core/transition-patch';
import * as i9 from 'ng-zorro-antd/core/wave';
import * as i3$1 from '@angular/cdk/scrolling';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import * as i1$3 from 'ng-zorro-antd/empty';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import * as i1$2 from 'ng-zorro-antd/cdk/resize-observer';
import * as i1$4 from '@angular/cdk/platform';
import * as i6$1 from 'ng-zorro-antd/pagination';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import * as i1$5 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import * as i5$1 from '@angular/cdk/bidi';

const NZ_CONFIG_MODULE_NAME$2 = 'filterTrigger';
let NzFilterTriggerComponent = (() => {
    let _nzBackdrop_decorators;
    let _nzBackdrop_initializers = [];
    let _nzBackdrop_extraInitializers = [];
    return class NzFilterTriggerComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzBackdrop_decorators = [WithConfig()];
            __esDecorate(null, null, _nzBackdrop_decorators, { kind: "field", name: "nzBackdrop", static: false, private: false, access: { has: obj => "nzBackdrop" in obj, get: obj => obj.nzBackdrop, set: (obj, value) => { obj.nzBackdrop = value; } }, metadata: _metadata }, _nzBackdrop_initializers, _nzBackdrop_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        cdr;
        destroy$;
        _nzModuleName = NZ_CONFIG_MODULE_NAME$2;
        nzActive = false;
        nzDropdownMenu;
        nzVisible = false;
        nzBackdrop = __runInitializers(this, _nzBackdrop_initializers, false);
        nzVisibleChange = (__runInitializers(this, _nzBackdrop_extraInitializers), new EventEmitter());
        nzDropdown;
        onVisibleChange(visible) {
            this.nzVisible = visible;
            this.nzVisibleChange.next(visible);
        }
        hide() {
            this.nzVisible = false;
            this.cdr.markForCheck();
        }
        show() {
            this.nzVisible = true;
            this.cdr.markForCheck();
        }
        constructor(nzConfigService, cdr, destroy$) {
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.destroy$ = destroy$;
        }
        ngOnInit() {
            fromEventOutsideAngular(this.nzDropdown.nativeElement, 'click')
                .pipe(takeUntil(this.destroy$))
                .subscribe(event => {
                event.stopPropagation();
            });
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFilterTriggerComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: i2.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzFilterTriggerComponent, isStandalone: true, selector: "nz-filter-trigger", inputs: { nzActive: "nzActive", nzDropdownMenu: "nzDropdownMenu", nzVisible: "nzVisible", nzBackdrop: ["nzBackdrop", "nzBackdrop", booleanAttribute] }, outputs: { nzVisibleChange: "nzVisibleChange" }, providers: [NzDestroyService], viewQueries: [{ propertyName: "nzDropdown", first: true, predicate: NzDropDownDirective, descendants: true, read: ElementRef, static: true }], exportAs: ["nzFilterTrigger"], ngImport: i0, template: `
    <span
      nz-dropdown
      class="ant-table-filter-trigger"
      nzTrigger="click"
      nzPlacement="bottomRight"
      [nzBackdrop]="nzBackdrop"
      [nzClickHide]="false"
      [nzDropdownMenu]="nzDropdownMenu"
      [class.active]="nzActive"
      [class.ant-table-filter-open]="nzVisible"
      [nzVisible]="nzVisible"
      (nzVisibleChange)="onVisibleChange($event)"
    >
      <ng-content></ng-content>
    </span>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzDropDownModule }, { kind: "directive", type: i4.NzDropDownDirective, selector: "[nz-dropdown]", inputs: ["nzDropdownMenu", "nzTrigger", "nzMatchWidthElement", "nzBackdrop", "nzClickHide", "nzDisabled", "nzVisible", "nzOverlayClassName", "nzOverlayStyle", "nzPlacement"], outputs: ["nzVisibleChange"], exportAs: ["nzDropdown"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFilterTriggerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-filter-trigger',
                    exportAs: `nzFilterTrigger`,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <span
      nz-dropdown
      class="ant-table-filter-trigger"
      nzTrigger="click"
      nzPlacement="bottomRight"
      [nzBackdrop]="nzBackdrop"
      [nzClickHide]="false"
      [nzDropdownMenu]="nzDropdownMenu"
      [class.active]="nzActive"
      [class.ant-table-filter-open]="nzVisible"
      [nzVisible]="nzVisible"
      (nzVisibleChange)="onVisibleChange($event)"
    >
      <ng-content></ng-content>
    </span>
  `,
                    providers: [NzDestroyService],
                    imports: [NzDropDownModule]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: i2.NzDestroyService }], propDecorators: { nzActive: [{
                type: Input
            }], nzDropdownMenu: [{
                type: Input
            }], nzVisible: [{
                type: Input
            }], nzBackdrop: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzVisibleChange: [{
                type: Output
            }], nzDropdown: [{
                type: ViewChild,
                args: [NzDropDownDirective, { static: true, read: ElementRef }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableFilterComponent {
    cdr;
    i18n;
    contentTemplate = null;
    customFilter = false;
    extraTemplate = null;
    filterMultiple = true;
    listOfFilter = [];
    filterChange = new EventEmitter();
    destroy$ = new Subject();
    locale;
    isChecked = false;
    isVisible = false;
    listOfParsedFilter = [];
    listOfChecked = [];
    check(filter) {
        if (this.filterMultiple) {
            this.listOfParsedFilter = this.listOfParsedFilter.map(item => {
                if (item === filter) {
                    return { ...item, checked: !filter.checked };
                }
                else {
                    return item;
                }
            });
            filter.checked = !filter.checked;
        }
        else {
            this.listOfParsedFilter = this.listOfParsedFilter.map(item => ({ ...item, checked: item === filter }));
        }
        this.isChecked = this.getCheckedStatus(this.listOfParsedFilter);
    }
    confirm() {
        this.isVisible = false;
        this.emitFilterData();
    }
    reset() {
        this.isVisible = false;
        this.listOfParsedFilter = this.parseListOfFilter(this.listOfFilter, true);
        this.isChecked = this.getCheckedStatus(this.listOfParsedFilter);
        this.emitFilterData();
    }
    onVisibleChange(value) {
        this.isVisible = value;
        if (!value) {
            this.emitFilterData();
        }
        else {
            this.listOfChecked = this.listOfParsedFilter.filter(item => item.checked).map(item => item.value);
        }
    }
    emitFilterData() {
        const listOfChecked = this.listOfParsedFilter.filter(item => item.checked).map(item => item.value);
        if (!arraysEqual(this.listOfChecked, listOfChecked)) {
            if (this.filterMultiple) {
                this.filterChange.emit(listOfChecked);
            }
            else {
                this.filterChange.emit(listOfChecked.length > 0 ? listOfChecked[0] : null);
            }
        }
    }
    parseListOfFilter(listOfFilter, reset) {
        return listOfFilter.map(item => {
            const checked = reset ? false : !!item.byDefault;
            return { text: item.text, value: item.value, checked };
        });
    }
    getCheckedStatus(listOfParsedFilter) {
        return listOfParsedFilter.some(item => item.checked);
    }
    constructor(cdr, i18n) {
        this.cdr = cdr;
        this.i18n = i18n;
    }
    ngOnInit() {
        this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.locale = this.i18n.getLocaleData('Table');
            this.cdr.markForCheck();
        });
    }
    ngOnChanges(changes) {
        const { listOfFilter } = changes;
        if (listOfFilter && this.listOfFilter && this.listOfFilter.length) {
            this.listOfParsedFilter = this.parseListOfFilter(this.listOfFilter);
            this.isChecked = this.getCheckedStatus(this.listOfParsedFilter);
        }
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableFilterComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1$1.NzI18nService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableFilterComponent, isStandalone: true, selector: "nz-table-filter", inputs: { contentTemplate: "contentTemplate", customFilter: "customFilter", extraTemplate: "extraTemplate", filterMultiple: "filterMultiple", listOfFilter: "listOfFilter" }, outputs: { filterChange: "filterChange" }, host: { classAttribute: "ant-table-filter-column" }, usesOnChanges: true, ngImport: i0, template: `
    <span class="ant-table-column-title">
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    </span>
    @if (!customFilter) {
      <nz-filter-trigger
        [nzVisible]="isVisible"
        [nzActive]="isChecked"
        [nzDropdownMenu]="filterMenu"
        (nzVisibleChange)="onVisibleChange($event)"
      >
        <nz-icon nzType="filter" nzTheme="fill" />
      </nz-filter-trigger>
      <nz-dropdown-menu #filterMenu="nzDropdownMenu">
        <div class="ant-table-filter-dropdown">
          <ul nz-menu>
            @for (f of listOfParsedFilter; track f.value) {
              <li nz-menu-item [nzSelected]="f.checked" (click)="check(f)">
                @if (!filterMultiple) {
                  <label nz-radio [ngModel]="f.checked" (ngModelChange)="check(f)"></label>
                } @else {
                  <label nz-checkbox [ngModel]="f.checked" (ngModelChange)="check(f)"></label>
                }
                <span>{{ f.text }}</span>
              </li>
            }
          </ul>
          <div class="ant-table-filter-dropdown-btns">
            <button nz-button nzType="link" nzSize="small" (click)="reset()" [disabled]="!isChecked">
              {{ locale.filterReset }}
            </button>
            <button nz-button nzType="primary" nzSize="small" (click)="confirm()">{{ locale.filterConfirm }}</button>
          </div>
        </div>
      </nz-dropdown-menu>
    } @else {
      <ng-container [ngTemplateOutlet]="extraTemplate"></ng-container>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzFilterTriggerComponent, selector: "nz-filter-trigger", inputs: ["nzActive", "nzDropdownMenu", "nzVisible", "nzBackdrop"], outputs: ["nzVisibleChange"], exportAs: ["nzFilterTrigger"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2$1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzDropDownModule }, { kind: "directive", type: i3.NzMenuDirective, selector: "[nz-menu]", inputs: ["nzInlineIndent", "nzTheme", "nzMode", "nzInlineCollapsed", "nzSelectable"], outputs: ["nzClick"], exportAs: ["nzMenu"] }, { kind: "component", type: i3.NzMenuItemComponent, selector: "[nz-menu-item]", inputs: ["nzPaddingLeft", "nzDisabled", "nzSelected", "nzDanger", "nzMatchRouterExact", "nzMatchRouter"], exportAs: ["nzMenuItem"] }, { kind: "component", type: i4.NzDropdownMenuComponent, selector: "nz-dropdown-menu", exportAs: ["nzDropdownMenu"] }, { kind: "component", type: NzRadioComponent, selector: "[nz-radio],[nz-radio-button]", inputs: ["nzValue", "nzDisabled", "nzAutoFocus", "nz-radio-button"], exportAs: ["nzRadio"] }, { kind: "ngmodule", type: NzCheckboxModule }, { kind: "component", type: i5.NzCheckboxComponent, selector: "[nz-checkbox]", inputs: ["nzValue", "nzAutoFocus", "nzDisabled", "nzIndeterminate", "nzChecked", "nzId", "nzName"], outputs: ["nzCheckedChange"], exportAs: ["nzCheckbox"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i6.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i6.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i7.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i8.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i9.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableFilterComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-filter',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <span class="ant-table-column-title">
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    </span>
    @if (!customFilter) {
      <nz-filter-trigger
        [nzVisible]="isVisible"
        [nzActive]="isChecked"
        [nzDropdownMenu]="filterMenu"
        (nzVisibleChange)="onVisibleChange($event)"
      >
        <nz-icon nzType="filter" nzTheme="fill" />
      </nz-filter-trigger>
      <nz-dropdown-menu #filterMenu="nzDropdownMenu">
        <div class="ant-table-filter-dropdown">
          <ul nz-menu>
            @for (f of listOfParsedFilter; track f.value) {
              <li nz-menu-item [nzSelected]="f.checked" (click)="check(f)">
                @if (!filterMultiple) {
                  <label nz-radio [ngModel]="f.checked" (ngModelChange)="check(f)"></label>
                } @else {
                  <label nz-checkbox [ngModel]="f.checked" (ngModelChange)="check(f)"></label>
                }
                <span>{{ f.text }}</span>
              </li>
            }
          </ul>
          <div class="ant-table-filter-dropdown-btns">
            <button nz-button nzType="link" nzSize="small" (click)="reset()" [disabled]="!isChecked">
              {{ locale.filterReset }}
            </button>
            <button nz-button nzType="primary" nzSize="small" (click)="confirm()">{{ locale.filterConfirm }}</button>
          </div>
        </div>
      </nz-dropdown-menu>
    } @else {
      <ng-container [ngTemplateOutlet]="extraTemplate"></ng-container>
    }
  `,
                    host: { class: 'ant-table-filter-column' },
                    imports: [
                        NgTemplateOutlet,
                        NzFilterTriggerComponent,
                        NzIconModule,
                        NzDropDownModule,
                        NzRadioComponent,
                        NzCheckboxModule,
                        FormsModule,
                        NzButtonModule
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1$1.NzI18nService }], propDecorators: { contentTemplate: [{
                type: Input
            }], customFilter: [{
                type: Input
            }], extraTemplate: [{
                type: Input
            }], filterMultiple: [{
                type: Input
            }], listOfFilter: [{
                type: Input
            }], filterChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzRowExpandButtonDirective {
    expand = false;
    spaceMode = false;
    expandChange = new EventEmitter();
    onHostClick() {
        if (!this.spaceMode) {
            this.expand = !this.expand;
            this.expandChange.next(this.expand);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRowExpandButtonDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzRowExpandButtonDirective, isStandalone: true, selector: "button[nz-row-expand-button]", inputs: { expand: "expand", spaceMode: "spaceMode" }, outputs: { expandChange: "expandChange" }, host: { listeners: { "click": "onHostClick()" }, properties: { "type": "'button'", "class.ant-table-row-expand-icon-expanded": "!spaceMode && expand === true", "class.ant-table-row-expand-icon-collapsed": "!spaceMode && expand === false", "class.ant-table-row-expand-icon-spaced": "spaceMode" }, classAttribute: "ant-table-row-expand-icon" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRowExpandButtonDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[nz-row-expand-button]',
                    host: {
                        class: 'ant-table-row-expand-icon',
                        '[type]': `'button'`,
                        '[class.ant-table-row-expand-icon-expanded]': `!spaceMode && expand === true`,
                        '[class.ant-table-row-expand-icon-collapsed]': `!spaceMode && expand === false`,
                        '[class.ant-table-row-expand-icon-spaced]': 'spaceMode',
                        '(click)': 'onHostClick()'
                    }
                }]
        }], propDecorators: { expand: [{
                type: Input
            }], spaceMode: [{
                type: Input
            }], expandChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzRowIndentDirective {
    indentSize = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRowIndentDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzRowIndentDirective, isStandalone: true, selector: "nz-row-indent", inputs: { indentSize: "indentSize" }, host: { properties: { "style.padding-left.px": "indentSize" }, classAttribute: "ant-table-row-indent" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzRowIndentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nz-row-indent',
                    host: {
                        class: 'ant-table-row-indent',
                        '[style.padding-left.px]': 'indentSize'
                    }
                }]
        }], propDecorators: { indentSize: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableSelectionComponent {
    listOfSelections = [];
    checked = false;
    disabled = false;
    indeterminate = false;
    label = null;
    showCheckbox = false;
    showRowSelection = false;
    checkedChange = new EventEmitter();
    onCheckedChange(checked) {
        this.checked = checked;
        this.checkedChange.emit(checked);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableSelectionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableSelectionComponent, isStandalone: true, selector: "nz-table-selection", inputs: { listOfSelections: "listOfSelections", checked: "checked", disabled: "disabled", indeterminate: "indeterminate", label: "label", showCheckbox: "showCheckbox", showRowSelection: "showRowSelection" }, outputs: { checkedChange: "checkedChange" }, host: { classAttribute: "ant-table-selection" }, ngImport: i0, template: `
    @if (showCheckbox) {
      <label
        nz-checkbox
        [class.ant-table-selection-select-all-custom]="showRowSelection"
        [ngModel]="checked"
        [nzDisabled]="disabled"
        [nzIndeterminate]="indeterminate"
        [attr.aria-label]="label"
        (ngModelChange)="onCheckedChange($event)"
      ></label>
    }
    @if (showRowSelection) {
      <div class="ant-table-selection-extra">
        <span nz-dropdown class="ant-table-selection-down" nzPlacement="bottomLeft" [nzDropdownMenu]="selectionMenu">
          <nz-icon nzType="down" />
        </span>
        <nz-dropdown-menu #selectionMenu="nzDropdownMenu">
          <ul nz-menu class="ant-table-selection-menu">
            @for (selection of listOfSelections; track selection) {
              <li nz-menu-item (click)="selection.onSelect()">
                {{ selection.text }}
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i6.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i6.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: NzCheckboxModule }, { kind: "component", type: i5.NzCheckboxComponent, selector: "[nz-checkbox]", inputs: ["nzValue", "nzAutoFocus", "nzDisabled", "nzIndeterminate", "nzChecked", "nzId", "nzName"], outputs: ["nzCheckedChange"], exportAs: ["nzCheckbox"] }, { kind: "ngmodule", type: NzDropDownModule }, { kind: "directive", type: i3.NzMenuDirective, selector: "[nz-menu]", inputs: ["nzInlineIndent", "nzTheme", "nzMode", "nzInlineCollapsed", "nzSelectable"], outputs: ["nzClick"], exportAs: ["nzMenu"] }, { kind: "component", type: i3.NzMenuItemComponent, selector: "[nz-menu-item]", inputs: ["nzPaddingLeft", "nzDisabled", "nzSelected", "nzDanger", "nzMatchRouterExact", "nzMatchRouter"], exportAs: ["nzMenuItem"] }, { kind: "directive", type: i4.NzDropDownDirective, selector: "[nz-dropdown]", inputs: ["nzDropdownMenu", "nzTrigger", "nzMatchWidthElement", "nzBackdrop", "nzClickHide", "nzDisabled", "nzVisible", "nzOverlayClassName", "nzOverlayStyle", "nzPlacement"], outputs: ["nzVisibleChange"], exportAs: ["nzDropdown"] }, { kind: "component", type: i4.NzDropdownMenuComponent, selector: "nz-dropdown-menu", exportAs: ["nzDropdownMenu"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2$1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableSelectionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-selection',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (showCheckbox) {
      <label
        nz-checkbox
        [class.ant-table-selection-select-all-custom]="showRowSelection"
        [ngModel]="checked"
        [nzDisabled]="disabled"
        [nzIndeterminate]="indeterminate"
        [attr.aria-label]="label"
        (ngModelChange)="onCheckedChange($event)"
      ></label>
    }
    @if (showRowSelection) {
      <div class="ant-table-selection-extra">
        <span nz-dropdown class="ant-table-selection-down" nzPlacement="bottomLeft" [nzDropdownMenu]="selectionMenu">
          <nz-icon nzType="down" />
        </span>
        <nz-dropdown-menu #selectionMenu="nzDropdownMenu">
          <ul nz-menu class="ant-table-selection-menu">
            @for (selection of listOfSelections; track selection) {
              <li nz-menu-item (click)="selection.onSelect()">
                {{ selection.text }}
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      </div>
    }
  `,
                    host: { class: 'ant-table-selection' },
                    imports: [FormsModule, NzCheckboxModule, NzDropDownModule, NzIconModule]
                }]
        }], propDecorators: { listOfSelections: [{
                type: Input
            }], checked: [{
                type: Input
            }], disabled: [{
                type: Input
            }], indeterminate: [{
                type: Input
            }], label: [{
                type: Input
            }], showCheckbox: [{
                type: Input
            }], showRowSelection: [{
                type: Input
            }], checkedChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableSortersComponent {
    sortDirections = ['ascend', 'descend', null];
    sortOrder = null;
    contentTemplate = null;
    isUp = false;
    isDown = false;
    ngOnChanges(changes) {
        const { sortDirections } = changes;
        if (sortDirections) {
            this.isUp = this.sortDirections.indexOf('ascend') !== -1;
            this.isDown = this.sortDirections.indexOf('descend') !== -1;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableSortersComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableSortersComponent, isStandalone: true, selector: "nz-table-sorters", inputs: { sortDirections: "sortDirections", sortOrder: "sortOrder", contentTemplate: "contentTemplate" }, host: { classAttribute: "ant-table-column-sorters" }, usesOnChanges: true, ngImport: i0, template: `
    <span class="ant-table-column-title"><ng-template [ngTemplateOutlet]="contentTemplate"></ng-template></span>
    <span class="ant-table-column-sorter" [class.ant-table-column-sorter-full]="isDown && isUp">
      <span class="ant-table-column-sorter-inner">
        @if (isUp) {
          <nz-icon nzType="caret-up" class="ant-table-column-sorter-up" [class.active]="sortOrder === 'ascend'" />
        }
        @if (isDown) {
          <nz-icon nzType="caret-down" class="ant-table-column-sorter-down" [class.active]="sortOrder === 'descend'" />
        }
      </span>
    </span>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2$1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableSortersComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-sorters',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <span class="ant-table-column-title"><ng-template [ngTemplateOutlet]="contentTemplate"></ng-template></span>
    <span class="ant-table-column-sorter" [class.ant-table-column-sorter-full]="isDown && isUp">
      <span class="ant-table-column-sorter-inner">
        @if (isUp) {
          <nz-icon nzType="caret-up" class="ant-table-column-sorter-up" [class.active]="sortOrder === 'ascend'" />
        }
        @if (isDown) {
          <nz-icon nzType="caret-down" class="ant-table-column-sorter-down" [class.active]="sortOrder === 'descend'" />
        }
      </span>
    </span>
  `,
                    host: { class: 'ant-table-column-sorters' },
                    imports: [NzIconModule, NgTemplateOutlet]
                }]
        }], propDecorators: { sortDirections: [{
                type: Input
            }], sortOrder: [{
                type: Input
            }], contentTemplate: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCellFixedDirective {
    renderer;
    elementRef;
    nzRight = false;
    nzLeft = false;
    colspan = null;
    colSpan = null;
    changes$ = new Subject();
    isAutoLeft = false;
    isAutoRight = false;
    isFixedLeft = false;
    isFixedRight = false;
    isFixed = false;
    setAutoLeftWidth(autoLeft) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', autoLeft);
    }
    setAutoRightWidth(autoRight) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'right', autoRight);
    }
    setIsFirstRight(isFirstRight) {
        this.setFixClass(isFirstRight, 'ant-table-cell-fix-right-first');
    }
    setIsLastLeft(isLastLeft) {
        this.setFixClass(isLastLeft, 'ant-table-cell-fix-left-last');
    }
    setFixClass(flag, className) {
        // the setFixClass function may call many times, so remove it first.
        this.renderer.removeClass(this.elementRef.nativeElement, className);
        if (flag) {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        }
    }
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    ngOnChanges() {
        this.setIsFirstRight(false);
        this.setIsLastLeft(false);
        this.isAutoLeft = this.nzLeft === '' || this.nzLeft === true;
        this.isAutoRight = this.nzRight === '' || this.nzRight === true;
        this.isFixedLeft = this.nzLeft !== false;
        this.isFixedRight = this.nzRight !== false;
        this.isFixed = this.isFixedLeft || this.isFixedRight;
        const validatePx = (value) => {
            if (typeof value === 'string' && value !== '') {
                return value;
            }
            else {
                return null;
            }
        };
        this.setAutoLeftWidth(validatePx(this.nzLeft));
        this.setAutoRightWidth(validatePx(this.nzRight));
        this.changes$.next();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellFixedDirective, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzCellFixedDirective, isStandalone: true, selector: "td[nzRight],th[nzRight],td[nzLeft],th[nzLeft]", inputs: { nzRight: "nzRight", nzLeft: "nzLeft", colspan: "colspan", colSpan: "colSpan" }, host: { properties: { "class.ant-table-cell-fix-right": "isFixedRight", "class.ant-table-cell-fix-left": "isFixedLeft", "style.position": "isFixed? 'sticky' : null" } }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellFixedDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'td[nzRight],th[nzRight],td[nzLeft],th[nzLeft]',
                    host: {
                        '[class.ant-table-cell-fix-right]': `isFixedRight`,
                        '[class.ant-table-cell-fix-left]': `isFixedLeft`,
                        '[style.position]': `isFixed? 'sticky' : null`
                    }
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }], propDecorators: { nzRight: [{
                type: Input
            }], nzLeft: [{
                type: Input
            }], colspan: [{
                type: Input
            }], colSpan: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableStyleService {
    theadTemplate$ = new ReplaySubject(1);
    tfootTemplate$ = new ReplaySubject(1);
    tfootFixed$ = new ReplaySubject(1);
    hasFixLeft$ = new ReplaySubject(1);
    hasFixRight$ = new ReplaySubject(1);
    hostWidth$ = new ReplaySubject(1);
    columnCount$ = new ReplaySubject(1);
    showEmpty$ = new ReplaySubject(1);
    noResult$ = new ReplaySubject(1);
    listOfThWidthConfigPx$ = new BehaviorSubject([]);
    tableWidthConfigPx$ = new BehaviorSubject([]);
    manualWidthConfigPx$ = combineLatest([this.tableWidthConfigPx$, this.listOfThWidthConfigPx$]).pipe(map(([widthConfig, listOfWidth]) => (widthConfig.length ? widthConfig : listOfWidth)));
    listOfAutoWidthPx$ = new ReplaySubject(1);
    listOfListOfThWidthPx$ = merge(
    /** init with manual width **/
    this.manualWidthConfigPx$, combineLatest([this.listOfAutoWidthPx$, this.manualWidthConfigPx$]).pipe(map(([autoWidth, manualWidth]) => {
        /** use autoWidth until column length match **/
        if (autoWidth.length === manualWidth.length) {
            return autoWidth.map((width, index) => {
                if (width === '0px') {
                    return manualWidth[index] || null;
                }
                else {
                    return manualWidth[index] || width;
                }
            });
        }
        else {
            return manualWidth;
        }
    })));
    listOfMeasureColumn$ = new ReplaySubject(1);
    listOfListOfThWidth$ = this.listOfAutoWidthPx$.pipe(map(list => list.map(width => parseInt(width, 10))));
    enableAutoMeasure$ = new ReplaySubject(1);
    setTheadTemplate(template) {
        this.theadTemplate$.next(template);
    }
    setTfootTemplate(template) {
        this.tfootTemplate$.next(template);
    }
    setTfootFixed(fixed) {
        this.tfootFixed$.next(fixed);
    }
    setHasFixLeft(hasFixLeft) {
        this.hasFixLeft$.next(hasFixLeft);
    }
    setHasFixRight(hasFixRight) {
        this.hasFixRight$.next(hasFixRight);
    }
    setTableWidthConfig(widthConfig) {
        this.tableWidthConfigPx$.next(widthConfig);
    }
    setListOfTh(listOfTh) {
        let columnCount = 0;
        listOfTh.forEach(th => {
            columnCount += (th.colspan && +th.colspan) || (th.colSpan && +th.colSpan) || 1;
        });
        const listOfThPx = listOfTh.map(item => item.nzWidth);
        this.columnCount$.next(columnCount);
        this.listOfThWidthConfigPx$.next(listOfThPx);
    }
    setListOfMeasureColumn(listOfTh) {
        const listOfKeys = [];
        listOfTh.forEach(th => {
            const length = (th.colspan && +th.colspan) || (th.colSpan && +th.colSpan) || 1;
            for (let i = 0; i < length; i++) {
                listOfKeys.push(`measure_key_${i}`);
            }
        });
        this.listOfMeasureColumn$.next(listOfKeys);
    }
    setListOfAutoWidth(listOfAutoWidth) {
        this.listOfAutoWidthPx$.next(listOfAutoWidth.map(width => `${width}px`));
    }
    setShowEmpty(showEmpty) {
        this.showEmpty$.next(showEmpty);
    }
    setNoResult(noResult) {
        this.noResult$.next(noResult);
    }
    setScroll(scrollX, scrollY) {
        const enableAutoMeasure = !!(scrollX || scrollY);
        if (!enableAutoMeasure) {
            this.setListOfAutoWidth([]);
        }
        this.enableAutoMeasure$.next(enableAutoMeasure);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableStyleService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableStyleService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableStyleService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableCellDirective {
    isInsideTable = !!inject(NzTableStyleService, { optional: true });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableCellDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTableCellDirective, isStandalone: true, selector: "th:not(.nz-disable-th):not([mat-cell]), td:not(.nz-disable-td):not([mat-cell])", host: { properties: { "class.ant-table-cell": "isInsideTable" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableCellDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th:not(.nz-disable-th):not([mat-cell]), td:not(.nz-disable-td):not([mat-cell])',
                    host: {
                        '[class.ant-table-cell]': 'isInsideTable'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableDataService {
    destroy$ = new Subject();
    pageIndex$ = new BehaviorSubject(1);
    frontPagination$ = new BehaviorSubject(true);
    pageSize$ = new BehaviorSubject(10);
    listOfData$ = new BehaviorSubject([]);
    listOfCustomColumn$ = new BehaviorSubject([]);
    pageIndexDistinct$ = this.pageIndex$.pipe(distinctUntilChanged());
    pageSizeDistinct$ = this.pageSize$.pipe(distinctUntilChanged());
    listOfCalcOperator$ = new BehaviorSubject([]);
    queryParams$ = combineLatest([
        this.pageIndexDistinct$,
        this.pageSizeDistinct$,
        this.listOfCalcOperator$
    ]).pipe(debounceTime(0), skip(1), map(([pageIndex, pageSize, listOfCalc]) => ({
        pageIndex,
        pageSize,
        sort: listOfCalc
            .filter(item => item.sortFn)
            .map(item => ({
            key: item.key,
            value: item.sortOrder
        })),
        filter: listOfCalc
            .filter(item => item.filterFn)
            .map(item => ({
            key: item.key,
            value: item.filterValue
        }))
    })));
    listOfDataAfterCalc$ = combineLatest([this.listOfData$, this.listOfCalcOperator$]).pipe(map(([listOfData, listOfCalcOperator]) => {
        let listOfDataAfterCalc = [...listOfData];
        const listOfFilterOperator = listOfCalcOperator.filter(item => {
            const { filterValue, filterFn } = item;
            const isReset = filterValue === null ||
                filterValue === undefined ||
                (Array.isArray(filterValue) && filterValue.length === 0);
            return !isReset && typeof filterFn === 'function';
        });
        for (const item of listOfFilterOperator) {
            const { filterFn, filterValue } = item;
            listOfDataAfterCalc = listOfDataAfterCalc.filter(data => filterFn(filterValue, data));
        }
        const listOfSortOperator = listOfCalcOperator
            .filter(item => item.sortOrder !== null && typeof item.sortFn === 'function')
            .sort((a, b) => +b.sortPriority - +a.sortPriority);
        if (listOfCalcOperator.length) {
            listOfDataAfterCalc.sort((record1, record2) => {
                for (const item of listOfSortOperator) {
                    const { sortFn, sortOrder } = item;
                    if (sortFn && sortOrder) {
                        const compareResult = sortFn(record1, record2, sortOrder);
                        if (compareResult !== 0) {
                            return sortOrder === 'ascend' ? compareResult : -compareResult;
                        }
                    }
                }
                return 0;
            });
        }
        return listOfDataAfterCalc;
    }));
    listOfFrontEndCurrentPageData$ = combineLatest([
        this.pageIndexDistinct$,
        this.pageSizeDistinct$,
        this.listOfDataAfterCalc$
    ]).pipe(takeUntil(this.destroy$), filter(value => {
        const [pageIndex, pageSize, listOfData] = value;
        const maxPageIndex = Math.ceil(listOfData.length / pageSize) || 1;
        return pageIndex <= maxPageIndex;
    }), map(([pageIndex, pageSize, listOfData]) => listOfData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)));
    listOfCurrentPageData$ = this.frontPagination$.pipe(switchMap(pagination => (pagination ? this.listOfFrontEndCurrentPageData$ : this.listOfDataAfterCalc$)));
    total$ = this.frontPagination$.pipe(switchMap(pagination => (pagination ? this.listOfDataAfterCalc$ : this.listOfData$)), map(list => list.length), distinctUntilChanged());
    updatePageSize(size) {
        this.pageSize$.next(size);
    }
    updateFrontPagination(pagination) {
        this.frontPagination$.next(pagination);
    }
    updatePageIndex(index) {
        this.pageIndex$.next(index);
    }
    updateListOfData(list) {
        this.listOfData$.next(list);
    }
    updateListOfCustomColumn(list) {
        this.listOfCustomColumn$.next(list);
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableDataService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableDataService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableDataService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCustomColumnDirective {
    el;
    renderer;
    nzTableDataService;
    nzCellControl = null;
    destroy$ = new Subject();
    constructor(el, renderer, nzTableDataService) {
        this.el = el;
        this.renderer = renderer;
        this.nzTableDataService = nzTableDataService;
    }
    ngOnInit() {
        this.nzTableDataService.listOfCustomColumn$.pipe(takeUntil(this.destroy$)).subscribe(item => {
            if (item.length) {
                item.forEach((v, i) => {
                    if (v.value === this.nzCellControl) {
                        if (!v.default) {
                            this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
                        }
                        else {
                            this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
                        }
                        this.renderer.setStyle(this.el.nativeElement, 'order', i);
                        if (!v?.fixWidth) {
                            this.renderer.setStyle(this.el.nativeElement, 'flex', `1 1 ${v.width}px`);
                        }
                        else {
                            this.renderer.setStyle(this.el.nativeElement, 'flex', `1 0 ${v.width}px`);
                        }
                    }
                });
            }
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCustomColumnDirective, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }, { token: NzTableDataService }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzCustomColumnDirective, isStandalone: true, selector: "td[nzCellControl],th[nzCellControl]", inputs: { nzCellControl: "nzCellControl" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCustomColumnDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'td[nzCellControl],th[nzCellControl]'
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: NzTableDataService }], propDecorators: { nzCellControl: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* eslint-disable @angular-eslint/component-selector */
class NzTdAddOnComponent {
    nzChecked = false;
    nzDisabled = false;
    nzIndeterminate = false;
    nzLabel = null;
    nzIndentSize = 0;
    nzShowExpand = false;
    nzShowCheckbox = false;
    nzExpand = false;
    nzExpandIcon = null;
    nzCheckedChange = new EventEmitter();
    nzExpandChange = new EventEmitter();
    isNzShowExpandChanged = false;
    isNzShowCheckboxChanged = false;
    onCheckedChange(checked) {
        this.nzChecked = checked;
        this.nzCheckedChange.emit(checked);
    }
    onExpandChange(expand) {
        this.nzExpand = expand;
        this.nzExpandChange.emit(expand);
    }
    ngOnChanges(changes) {
        const isFirstChange = (value) => value && value.firstChange && value.currentValue !== undefined;
        const { nzExpand, nzChecked, nzShowExpand, nzShowCheckbox } = changes;
        if (nzShowExpand) {
            this.isNzShowExpandChanged = true;
        }
        if (nzShowCheckbox) {
            this.isNzShowCheckboxChanged = true;
        }
        if (isFirstChange(nzExpand) && !this.isNzShowExpandChanged) {
            this.nzShowExpand = true;
        }
        if (isFirstChange(nzChecked) && !this.isNzShowCheckboxChanged) {
            this.nzShowCheckbox = true;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTdAddOnComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTdAddOnComponent, isStandalone: true, selector: "td[nzChecked], td[nzDisabled], td[nzIndeterminate], td[nzIndentSize], td[nzExpand], td[nzShowExpand], td[nzShowCheckbox]", inputs: { nzChecked: "nzChecked", nzDisabled: "nzDisabled", nzIndeterminate: "nzIndeterminate", nzLabel: "nzLabel", nzIndentSize: "nzIndentSize", nzShowExpand: ["nzShowExpand", "nzShowExpand", booleanAttribute], nzShowCheckbox: ["nzShowCheckbox", "nzShowCheckbox", booleanAttribute], nzExpand: ["nzExpand", "nzExpand", booleanAttribute], nzExpandIcon: "nzExpandIcon" }, outputs: { nzCheckedChange: "nzCheckedChange", nzExpandChange: "nzExpandChange" }, host: { properties: { "class.ant-table-cell-with-append": "nzShowExpand || nzIndentSize > 0", "class.ant-table-selection-column": "nzShowCheckbox" } }, usesOnChanges: true, ngImport: i0, template: `
    @if (nzShowExpand || nzIndentSize > 0) {
      <nz-row-indent [indentSize]="nzIndentSize"></nz-row-indent>
      @if (nzExpandIcon) {
        <ng-template [ngTemplateOutlet]="nzExpandIcon"></ng-template>
      } @else {
        <button
          nz-row-expand-button
          [expand]="nzExpand"
          (expandChange)="onExpandChange($event)"
          [spaceMode]="!nzShowExpand"
        ></button>
      }
    }
    @if (nzShowCheckbox) {
      <label
        nz-checkbox
        [nzDisabled]="nzDisabled"
        [ngModel]="nzChecked"
        [nzIndeterminate]="nzIndeterminate"
        [attr.aria-label]="nzLabel"
        (ngModelChange)="onCheckedChange($event)"
      ></label>
    }
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "directive", type: NzRowIndentDirective, selector: "nz-row-indent", inputs: ["indentSize"] }, { kind: "directive", type: NzRowExpandButtonDirective, selector: "button[nz-row-expand-button]", inputs: ["expand", "spaceMode"], outputs: ["expandChange"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzCheckboxModule }, { kind: "component", type: i5.NzCheckboxComponent, selector: "[nz-checkbox]", inputs: ["nzValue", "nzAutoFocus", "nzDisabled", "nzIndeterminate", "nzChecked", "nzId", "nzName"], outputs: ["nzCheckedChange"], exportAs: ["nzCheckbox"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i6.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i6.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTdAddOnComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'td[nzChecked], td[nzDisabled], td[nzIndeterminate], td[nzIndentSize], td[nzExpand], td[nzShowExpand], td[nzShowCheckbox]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (nzShowExpand || nzIndentSize > 0) {
      <nz-row-indent [indentSize]="nzIndentSize"></nz-row-indent>
      @if (nzExpandIcon) {
        <ng-template [ngTemplateOutlet]="nzExpandIcon"></ng-template>
      } @else {
        <button
          nz-row-expand-button
          [expand]="nzExpand"
          (expandChange)="onExpandChange($event)"
          [spaceMode]="!nzShowExpand"
        ></button>
      }
    }
    @if (nzShowCheckbox) {
      <label
        nz-checkbox
        [nzDisabled]="nzDisabled"
        [ngModel]="nzChecked"
        [nzIndeterminate]="nzIndeterminate"
        [attr.aria-label]="nzLabel"
        (ngModelChange)="onCheckedChange($event)"
      ></label>
    }
    <ng-content></ng-content>
  `,
                    host: {
                        '[class.ant-table-cell-with-append]': `nzShowExpand || nzIndentSize > 0`,
                        '[class.ant-table-selection-column]': `nzShowCheckbox`
                    },
                    imports: [NzRowIndentDirective, NzRowExpandButtonDirective, NgTemplateOutlet, NzCheckboxModule, FormsModule]
                }]
        }], propDecorators: { nzChecked: [{
                type: Input
            }], nzDisabled: [{
                type: Input
            }], nzIndeterminate: [{
                type: Input
            }], nzLabel: [{
                type: Input
            }], nzIndentSize: [{
                type: Input
            }], nzShowExpand: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowCheckbox: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpand: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzExpandIcon: [{
                type: Input
            }], nzCheckedChange: [{
                type: Output
            }], nzExpandChange: [{
                type: Output
            }] } });

const NZ_CONFIG_MODULE_NAME$1 = 'table';
let NzThAddOnComponent = (() => {
    let _nzSortDirections_decorators;
    let _nzSortDirections_initializers = [];
    let _nzSortDirections_extraInitializers = [];
    return class NzThAddOnComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzSortDirections_decorators = [WithConfig()];
            __esDecorate(null, null, _nzSortDirections_decorators, { kind: "field", name: "nzSortDirections", static: false, private: false, access: { has: obj => "nzSortDirections" in obj, get: obj => obj.nzSortDirections, set: (obj, value) => { obj.nzSortDirections = value; } }, metadata: _metadata }, _nzSortDirections_initializers, _nzSortDirections_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        nzConfigService;
        host;
        cdr;
        ngZone;
        destroy$;
        _nzModuleName = NZ_CONFIG_MODULE_NAME$1;
        manualClickOrder$ = new Subject();
        calcOperatorChange$ = new Subject();
        nzFilterValue = null;
        sortOrder = null;
        sortDirections = ['ascend', 'descend', null];
        sortOrderChange$ = new Subject();
        isNzShowSortChanged = false;
        isNzShowFilterChanged = false;
        nzColumnKey;
        nzFilterMultiple = true;
        nzSortOrder = null;
        nzSortPriority = false;
        nzSortDirections = __runInitializers(this, _nzSortDirections_initializers, ['ascend', 'descend', null]);
        nzFilters = (__runInitializers(this, _nzSortDirections_extraInitializers), []);
        nzSortFn = null;
        nzFilterFn = null;
        nzShowSort = false;
        nzShowFilter = false;
        nzCustomFilter = false;
        nzCheckedChange = new EventEmitter();
        nzSortOrderChange = new EventEmitter();
        nzFilterChange = new EventEmitter();
        getNextSortDirection(sortDirections, current) {
            const index = sortDirections.indexOf(current);
            if (index === sortDirections.length - 1) {
                return sortDirections[0];
            }
            else {
                return sortDirections[index + 1];
            }
        }
        setSortOrder(order) {
            this.sortOrderChange$.next(order);
        }
        clearSortOrder() {
            if (this.sortOrder !== null) {
                this.setSortOrder(null);
            }
        }
        onFilterValueChange(value) {
            this.nzFilterChange.emit(value);
            this.nzFilterValue = value;
            this.updateCalcOperator();
        }
        updateCalcOperator() {
            this.calcOperatorChange$.next();
        }
        constructor(nzConfigService, host, cdr, ngZone, destroy$) {
            this.nzConfigService = nzConfigService;
            this.host = host;
            this.cdr = cdr;
            this.ngZone = ngZone;
            this.destroy$ = destroy$;
        }
        ngOnInit() {
            fromEventOutsideAngular(this.host.nativeElement, 'click')
                .pipe(filter(() => this.nzShowSort), takeUntil(this.destroy$))
                .subscribe(() => {
                const nextOrder = this.getNextSortDirection(this.sortDirections, this.sortOrder);
                this.ngZone.run(() => {
                    this.setSortOrder(nextOrder);
                    this.manualClickOrder$.next(this);
                });
            });
            this.sortOrderChange$.pipe(takeUntil(this.destroy$)).subscribe(order => {
                if (this.sortOrder !== order) {
                    this.sortOrder = order;
                    this.nzSortOrderChange.emit(order);
                }
                this.updateCalcOperator();
                this.cdr.markForCheck();
            });
        }
        ngOnChanges(changes) {
            const { nzSortDirections, nzFilters, nzSortOrder, nzSortFn, nzFilterFn, nzSortPriority, nzFilterMultiple, nzShowSort, nzShowFilter } = changes;
            if (nzSortDirections) {
                if (this.nzSortDirections && this.nzSortDirections.length) {
                    this.sortDirections = this.nzSortDirections;
                }
            }
            if (nzSortOrder) {
                this.sortOrder = this.nzSortOrder;
                this.setSortOrder(this.nzSortOrder);
            }
            if (nzShowSort) {
                this.isNzShowSortChanged = true;
            }
            if (nzShowFilter) {
                this.isNzShowFilterChanged = true;
            }
            const isFirstChange = (value) => value && value.firstChange && value.currentValue !== undefined;
            if ((isFirstChange(nzSortOrder) || isFirstChange(nzSortFn)) && !this.isNzShowSortChanged) {
                this.nzShowSort = true;
            }
            if (isFirstChange(nzFilters) && !this.isNzShowFilterChanged) {
                this.nzShowFilter = true;
            }
            if ((nzFilters || nzFilterMultiple) && this.nzShowFilter) {
                const listOfValue = this.nzFilters.filter(item => item.byDefault).map(item => item.value);
                this.nzFilterValue = this.nzFilterMultiple ? listOfValue : listOfValue[0] || null;
            }
            if (nzSortFn || nzFilterFn || nzSortPriority || nzFilters) {
                this.updateCalcOperator();
            }
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThAddOnComponent, deps: [{ token: i1.NzConfigService }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.NgZone }, { token: i2.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzThAddOnComponent, isStandalone: true, selector: "th[nzColumnKey], th[nzSortFn], th[nzSortOrder], th[nzFilters], th[nzShowSort], th[nzShowFilter], th[nzCustomFilter]", inputs: { nzColumnKey: "nzColumnKey", nzFilterMultiple: "nzFilterMultiple", nzSortOrder: "nzSortOrder", nzSortPriority: "nzSortPriority", nzSortDirections: "nzSortDirections", nzFilters: "nzFilters", nzSortFn: "nzSortFn", nzFilterFn: "nzFilterFn", nzShowSort: ["nzShowSort", "nzShowSort", booleanAttribute], nzShowFilter: ["nzShowFilter", "nzShowFilter", booleanAttribute], nzCustomFilter: ["nzCustomFilter", "nzCustomFilter", booleanAttribute] }, outputs: { nzCheckedChange: "nzCheckedChange", nzSortOrderChange: "nzSortOrderChange", nzFilterChange: "nzFilterChange" }, host: { properties: { "class.ant-table-column-has-sorters": "nzShowSort", "class.ant-table-column-sort": "sortOrder === 'descend' || sortOrder === 'ascend'" } }, providers: [NzDestroyService], usesOnChanges: true, ngImport: i0, template: `
    @if (nzShowFilter || nzCustomFilter) {
      <nz-table-filter
        [contentTemplate]="notFilterTemplate"
        [extraTemplate]="extraTemplate"
        [customFilter]="nzCustomFilter"
        [filterMultiple]="nzFilterMultiple"
        [listOfFilter]="nzFilters"
        (filterChange)="onFilterValueChange($event)"
      ></nz-table-filter>
    } @else {
      <ng-container [ngTemplateOutlet]="notFilterTemplate"></ng-container>
    }
    <ng-template #notFilterTemplate>
      <ng-template [ngTemplateOutlet]="nzShowSort ? sortTemplate : contentTemplate"></ng-template>
    </ng-template>
    <ng-template #extraTemplate>
      <ng-content select="[nz-th-extra]"></ng-content>
      <ng-content select="nz-filter-trigger"></ng-content>
    </ng-template>
    <ng-template #sortTemplate>
      <nz-table-sorters
        [sortOrder]="sortOrder"
        [sortDirections]="sortDirections"
        [contentTemplate]="contentTemplate"
      ></nz-table-sorters>
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTableFilterComponent, selector: "nz-table-filter", inputs: ["contentTemplate", "customFilter", "extraTemplate", "filterMultiple", "listOfFilter"], outputs: ["filterChange"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzTableSortersComponent, selector: "nz-table-sorters", inputs: ["sortDirections", "sortOrder", "contentTemplate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThAddOnComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'th[nzColumnKey], th[nzSortFn], th[nzSortOrder], th[nzFilters], th[nzShowSort], th[nzShowFilter], th[nzCustomFilter]',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (nzShowFilter || nzCustomFilter) {
      <nz-table-filter
        [contentTemplate]="notFilterTemplate"
        [extraTemplate]="extraTemplate"
        [customFilter]="nzCustomFilter"
        [filterMultiple]="nzFilterMultiple"
        [listOfFilter]="nzFilters"
        (filterChange)="onFilterValueChange($event)"
      ></nz-table-filter>
    } @else {
      <ng-container [ngTemplateOutlet]="notFilterTemplate"></ng-container>
    }
    <ng-template #notFilterTemplate>
      <ng-template [ngTemplateOutlet]="nzShowSort ? sortTemplate : contentTemplate"></ng-template>
    </ng-template>
    <ng-template #extraTemplate>
      <ng-content select="[nz-th-extra]"></ng-content>
      <ng-content select="nz-filter-trigger"></ng-content>
    </ng-template>
    <ng-template #sortTemplate>
      <nz-table-sorters
        [sortOrder]="sortOrder"
        [sortDirections]="sortDirections"
        [contentTemplate]="contentTemplate"
      ></nz-table-sorters>
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `,
                    host: {
                        '[class.ant-table-column-has-sorters]': 'nzShowSort',
                        '[class.ant-table-column-sort]': `sortOrder === 'descend' || sortOrder === 'ascend'`
                    },
                    providers: [NzDestroyService],
                    imports: [NzTableFilterComponent, NgTemplateOutlet, NzTableSortersComponent]
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.NgZone }, { type: i2.NzDestroyService }], propDecorators: { nzColumnKey: [{
                type: Input
            }], nzFilterMultiple: [{
                type: Input
            }], nzSortOrder: [{
                type: Input
            }], nzSortPriority: [{
                type: Input
            }], nzSortDirections: [{
                type: Input
            }], nzFilters: [{
                type: Input
            }], nzSortFn: [{
                type: Input
            }], nzFilterFn: [{
                type: Input
            }], nzShowSort: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCustomFilter: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckedChange: [{
                type: Output
            }], nzSortOrderChange: [{
                type: Output
            }], nzFilterChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzThMeasureDirective {
    renderer;
    elementRef;
    changes$ = new Subject();
    nzWidth = null;
    colspan = null;
    colSpan = null;
    rowspan = null;
    rowSpan = null;
    constructor(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    ngOnChanges(changes) {
        const { nzWidth, colspan, rowspan, colSpan, rowSpan } = changes;
        if (colspan || colSpan) {
            const col = this.colspan || this.colSpan;
            if (!isNil(col)) {
                this.renderer.setAttribute(this.elementRef.nativeElement, 'colspan', `${col}`);
            }
            else {
                this.renderer.removeAttribute(this.elementRef.nativeElement, 'colspan');
            }
        }
        if (rowspan || rowSpan) {
            const row = this.rowspan || this.rowSpan;
            if (!isNil(row)) {
                this.renderer.setAttribute(this.elementRef.nativeElement, 'rowspan', `${row}`);
            }
            else {
                this.renderer.removeAttribute(this.elementRef.nativeElement, 'rowspan');
            }
        }
        if (nzWidth || colspan) {
            this.changes$.next();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThMeasureDirective, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzThMeasureDirective, isStandalone: true, selector: "th", inputs: { nzWidth: "nzWidth", colspan: "colspan", colSpan: "colSpan", rowspan: "rowspan", rowSpan: "rowSpan" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThMeasureDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th'
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }], propDecorators: { nzWidth: [{
                type: Input
            }], colspan: [{
                type: Input
            }], colSpan: [{
                type: Input
            }], rowspan: [{
                type: Input
            }], rowSpan: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* eslint-disable @angular-eslint/component-selector */
class NzThSelectionComponent {
    nzSelections = [];
    nzChecked = false;
    nzDisabled = false;
    nzIndeterminate = false;
    nzLabel = null;
    nzShowCheckbox = false;
    nzShowRowSelection = false;
    nzCheckedChange = new EventEmitter();
    isNzShowExpandChanged = false;
    isNzShowCheckboxChanged = false;
    onCheckedChange(checked) {
        this.nzChecked = checked;
        this.nzCheckedChange.emit(checked);
    }
    ngOnChanges(changes) {
        const isFirstChange = (value) => value && value.firstChange && value.currentValue !== undefined;
        const { nzChecked, nzSelections, nzShowExpand, nzShowCheckbox } = changes;
        if (nzShowExpand) {
            this.isNzShowExpandChanged = true;
        }
        if (nzShowCheckbox) {
            this.isNzShowCheckboxChanged = true;
        }
        if (isFirstChange(nzSelections) && !this.isNzShowExpandChanged) {
            this.nzShowRowSelection = true;
        }
        if (isFirstChange(nzChecked) && !this.isNzShowCheckboxChanged) {
            this.nzShowCheckbox = true;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThSelectionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "19.2.2", type: NzThSelectionComponent, isStandalone: true, selector: "th[nzSelections],th[nzChecked],th[nzShowCheckbox],th[nzShowRowSelection]", inputs: { nzSelections: "nzSelections", nzChecked: ["nzChecked", "nzChecked", booleanAttribute], nzDisabled: ["nzDisabled", "nzDisabled", booleanAttribute], nzIndeterminate: "nzIndeterminate", nzLabel: "nzLabel", nzShowCheckbox: ["nzShowCheckbox", "nzShowCheckbox", booleanAttribute], nzShowRowSelection: ["nzShowRowSelection", "nzShowRowSelection", booleanAttribute] }, outputs: { nzCheckedChange: "nzCheckedChange" }, host: { classAttribute: "ant-table-selection-column" }, usesOnChanges: true, ngImport: i0, template: `
    <nz-table-selection
      [checked]="nzChecked"
      [disabled]="nzDisabled"
      [indeterminate]="nzIndeterminate"
      [label]="nzLabel"
      [listOfSelections]="nzSelections"
      [showCheckbox]="nzShowCheckbox"
      [showRowSelection]="nzShowRowSelection"
      (checkedChange)="onCheckedChange($event)"
    ></nz-table-selection>
    <ng-content></ng-content>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTableSelectionComponent, selector: "nz-table-selection", inputs: ["listOfSelections", "checked", "disabled", "indeterminate", "label", "showCheckbox", "showRowSelection"], outputs: ["checkedChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzThSelectionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'th[nzSelections],th[nzChecked],th[nzShowCheckbox],th[nzShowRowSelection]',
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <nz-table-selection
      [checked]="nzChecked"
      [disabled]="nzDisabled"
      [indeterminate]="nzIndeterminate"
      [label]="nzLabel"
      [listOfSelections]="nzSelections"
      [showCheckbox]="nzShowCheckbox"
      [showRowSelection]="nzShowRowSelection"
      (checkedChange)="onCheckedChange($event)"
    ></nz-table-selection>
    <ng-content></ng-content>
  `,
                    host: { class: 'ant-table-selection-column' },
                    imports: [NzTableSelectionComponent]
                }]
        }], propDecorators: { nzSelections: [{
                type: Input
            }], nzChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzDisabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzIndeterminate: [{
                type: Input
            }], nzLabel: [{
                type: Input
            }], nzShowCheckbox: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowRowSelection: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzCheckedChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCellAlignDirective {
    nzAlign = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellAlignDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzCellAlignDirective, isStandalone: true, selector: "th[nzAlign],td[nzAlign]", inputs: { nzAlign: "nzAlign" }, host: { properties: { "style.text-align": "nzAlign" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellAlignDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[nzAlign],td[nzAlign]',
                    host: {
                        '[style.text-align]': 'nzAlign'
                    }
                }]
        }], propDecorators: { nzAlign: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCellEllipsisDirective {
    nzEllipsis = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellEllipsisDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzCellEllipsisDirective, isStandalone: true, selector: "th[nzEllipsis],td[nzEllipsis]", inputs: { nzEllipsis: ["nzEllipsis", "nzEllipsis", booleanAttribute] }, host: { properties: { "class.ant-table-cell-ellipsis": "nzEllipsis" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellEllipsisDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[nzEllipsis],td[nzEllipsis]',
                    host: {
                        '[class.ant-table-cell-ellipsis]': 'nzEllipsis'
                    }
                }]
        }], propDecorators: { nzEllipsis: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCellBreakWordDirective {
    nzBreakWord = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellBreakWordDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzCellBreakWordDirective, isStandalone: true, selector: "th[nzBreakWord],td[nzBreakWord]", inputs: { nzBreakWord: ["nzBreakWord", "nzBreakWord", booleanAttribute] }, host: { properties: { "style.word-break": "nzBreakWord ? 'break-all' : ''" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCellBreakWordDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[nzBreakWord],td[nzBreakWord]',
                    host: {
                        '[style.word-break]': `nzBreakWord ? 'break-all' : ''`
                    }
                }]
        }], propDecorators: { nzBreakWord: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableContentComponent {
    tableLayout = 'auto';
    theadTemplate = null;
    contentTemplate = null;
    tfootTemplate = null;
    listOfColWidth = [];
    scrollX = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableContentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableContentComponent, isStandalone: true, selector: "table[nz-table-content]", inputs: { tableLayout: "tableLayout", theadTemplate: "theadTemplate", contentTemplate: "contentTemplate", tfootTemplate: "tfootTemplate", listOfColWidth: "listOfColWidth", scrollX: "scrollX" }, host: { properties: { "style.table-layout": "tableLayout", "class.ant-table-fixed": "scrollX", "style.width": "scrollX", "style.min-width": "scrollX ? '100%' : null" } }, ngImport: i0, template: `
    @if (listOfColWidth.length > 0) {
      <colgroup>
        @for (width of listOfColWidth; track $index) {
          <col [style.width]="width" [style.minWidth]="width" />
        }
      </colgroup>
    }
    @if (theadTemplate) {
      <thead class="ant-table-thead">
        <ng-template [ngTemplateOutlet]="theadTemplate"></ng-template>
      </thead>
    }
    <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    <ng-content></ng-content>
    @if (tfootTemplate) {
      <tfoot class="ant-table-summary">
        <ng-template [ngTemplateOutlet]="tfootTemplate"></ng-template>
      </tfoot>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableContentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'table[nz-table-content]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (listOfColWidth.length > 0) {
      <colgroup>
        @for (width of listOfColWidth; track $index) {
          <col [style.width]="width" [style.minWidth]="width" />
        }
      </colgroup>
    }
    @if (theadTemplate) {
      <thead class="ant-table-thead">
        <ng-template [ngTemplateOutlet]="theadTemplate"></ng-template>
      </thead>
    }
    <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    <ng-content></ng-content>
    @if (tfootTemplate) {
      <tfoot class="ant-table-summary">
        <ng-template [ngTemplateOutlet]="tfootTemplate"></ng-template>
      </tfoot>
    }
  `,
                    host: {
                        '[style.table-layout]': 'tableLayout',
                        '[class.ant-table-fixed]': 'scrollX',
                        '[style.width]': 'scrollX',
                        '[style.min-width]': `scrollX ? '100%' : null`
                    },
                    imports: [NgTemplateOutlet]
                }]
        }], propDecorators: { tableLayout: [{
                type: Input
            }], theadTemplate: [{
                type: Input
            }], contentTemplate: [{
                type: Input
            }], tfootTemplate: [{
                type: Input
            }], listOfColWidth: [{
                type: Input
            }], scrollX: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableFixedRowComponent {
    nzTableStyleService;
    renderer;
    tdElement;
    hostWidth$ = new BehaviorSubject(null);
    enableAutoMeasure$ = new BehaviorSubject(false);
    destroy$ = new Subject();
    constructor(nzTableStyleService, renderer) {
        this.nzTableStyleService = nzTableStyleService;
        this.renderer = renderer;
    }
    ngOnInit() {
        if (this.nzTableStyleService) {
            const { enableAutoMeasure$, hostWidth$ } = this.nzTableStyleService;
            enableAutoMeasure$.pipe(takeUntil(this.destroy$)).subscribe(this.enableAutoMeasure$);
            hostWidth$.pipe(takeUntil(this.destroy$)).subscribe(this.hostWidth$);
        }
    }
    ngAfterViewInit() {
        this.nzTableStyleService.columnCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
            this.renderer.setAttribute(this.tdElement.nativeElement, 'colspan', `${count}`);
        });
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableFixedRowComponent, deps: [{ token: NzTableStyleService }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableFixedRowComponent, isStandalone: true, selector: "tr[nz-table-fixed-row], tr[nzExpand]", viewQueries: [{ propertyName: "tdElement", first: true, predicate: ["tdElement"], descendants: true, static: true }], ngImport: i0, template: `
    <td class="nz-disable-td ant-table-cell" #tdElement>
      @if (enableAutoMeasure$ | async) {
        <div
          class="ant-table-expanded-row-fixed"
          style="position: sticky; left: 0; overflow: hidden;"
          [style.width.px]="hostWidth$ | async"
        >
          <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
        </div>
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
      }
    </td>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableFixedRowComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'tr[nz-table-fixed-row], tr[nzExpand]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <td class="nz-disable-td ant-table-cell" #tdElement>
      @if (enableAutoMeasure$ | async) {
        <div
          class="ant-table-expanded-row-fixed"
          style="position: sticky; left: 0; overflow: hidden;"
          [style.width.px]="hostWidth$ | async"
        >
          <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
        </div>
      } @else {
        <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
      }
    </td>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `,
                    imports: [AsyncPipe, NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: NzTableStyleService }, { type: i0.Renderer2 }], propDecorators: { tdElement: [{
                type: ViewChild,
                args: ['tdElement', { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableInnerDefaultComponent {
    tableLayout = 'auto';
    listOfColWidth = [];
    theadTemplate = null;
    contentTemplate = null;
    tfootTemplate = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableInnerDefaultComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTableInnerDefaultComponent, isStandalone: true, selector: "nz-table-inner-default", inputs: { tableLayout: "tableLayout", listOfColWidth: "listOfColWidth", theadTemplate: "theadTemplate", contentTemplate: "contentTemplate", tfootTemplate: "tfootTemplate" }, host: { classAttribute: "ant-table-container" }, ngImport: i0, template: `
    <div class="ant-table-content">
      <table
        nz-table-content
        [contentTemplate]="contentTemplate"
        [tableLayout]="tableLayout"
        [listOfColWidth]="listOfColWidth"
        [theadTemplate]="theadTemplate"
        [tfootTemplate]="tfootTemplate"
      ></table>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: NzTableContentComponent, selector: "table[nz-table-content]", inputs: ["tableLayout", "theadTemplate", "contentTemplate", "tfootTemplate", "listOfColWidth", "scrollX"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableInnerDefaultComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-inner-default',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <div class="ant-table-content">
      <table
        nz-table-content
        [contentTemplate]="contentTemplate"
        [tableLayout]="tableLayout"
        [listOfColWidth]="listOfColWidth"
        [theadTemplate]="theadTemplate"
        [tfootTemplate]="tfootTemplate"
      ></table>
    </div>
  `,
                    host: { class: 'ant-table-container' },
                    imports: [NzTableContentComponent]
                }]
        }], propDecorators: { tableLayout: [{
                type: Input
            }], listOfColWidth: [{
                type: Input
            }], theadTemplate: [{
                type: Input
            }], contentTemplate: [{
                type: Input
            }], tfootTemplate: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTrMeasureComponent {
    nzResizeObserver;
    ngZone;
    listOfMeasureColumn = [];
    listOfAutoWidth = new EventEmitter();
    listOfTdElement;
    destroy$ = new Subject();
    constructor(nzResizeObserver, ngZone) {
        this.nzResizeObserver = nzResizeObserver;
        this.ngZone = ngZone;
    }
    ngAfterViewInit() {
        this.listOfTdElement.changes
            .pipe(startWith(this.listOfTdElement))
            .pipe(switchMap(list => combineLatest(list.toArray().map((item) => this.nzResizeObserver.observe(item).pipe(map(([entry]) => {
            const { width } = entry.target.getBoundingClientRect();
            return Math.floor(width);
        }))))), debounceTime(16), takeUntil(this.destroy$))
            .subscribe(data => {
            // Caretaker note: we don't have to re-enter the Angular zone each time the stream emits.
            // The below check is necessary to be sure that zone is not nooped through `BootstrapOptions`
            // (`bootstrapModule(AppModule, { ngZone: 'noop' }))`. The `ngZone instanceof NgZone` may return
            // `false` if zone is nooped, since `ngZone` will be an instance of the `NoopNgZone`.
            // The `ResizeObserver` might be also patched through `zone.js/dist/zone-patch-resize-observer`,
            // thus calling `ngZone.run` again will cause another change detection.
            if (this.ngZone instanceof NgZone && NgZone.isInAngularZone()) {
                this.listOfAutoWidth.next(data);
            }
            else {
                this.ngZone.run(() => this.listOfAutoWidth.next(data));
            }
        });
    }
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrMeasureComponent, deps: [{ token: i1$2.NzResizeObserver }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTrMeasureComponent, isStandalone: true, selector: "tr[nz-table-measure-row]", inputs: { listOfMeasureColumn: "listOfMeasureColumn" }, outputs: { listOfAutoWidth: "listOfAutoWidth" }, host: { classAttribute: "ant-table-measure-now" }, viewQueries: [{ propertyName: "listOfTdElement", predicate: ["tdElement"], descendants: true }], ngImport: i0, template: `
    @for (th of listOfMeasureColumn; track $index) {
      <td #tdElement class="nz-disable-td" style="padding: 0; border: 0; height: 0;"></td>
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrMeasureComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'tr[nz-table-measure-row]',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @for (th of listOfMeasureColumn; track $index) {
      <td #tdElement class="nz-disable-td" style="padding: 0; border: 0; height: 0;"></td>
    }
  `,
                    host: { class: 'ant-table-measure-now' }
                }]
        }], ctorParameters: () => [{ type: i1$2.NzResizeObserver }, { type: i0.NgZone }], propDecorators: { listOfMeasureColumn: [{
                type: Input
            }], listOfAutoWidth: [{
                type: Output
            }], listOfTdElement: [{
                type: ViewChildren,
                args: ['tdElement']
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* eslint-disable @angular-eslint/component-selector */
class NzTbodyComponent {
    isInsideTable = false;
    showEmpty$ = new BehaviorSubject(false);
    noResult$ = new BehaviorSubject(undefined);
    listOfMeasureColumn$ = new BehaviorSubject([]);
    destroy$ = new Subject();
    nzTableStyleService = inject(NzTableStyleService, { optional: true });
    constructor() {
        this.isInsideTable = !!this.nzTableStyleService;
        if (this.nzTableStyleService) {
            const { showEmpty$, noResult$, listOfMeasureColumn$ } = this.nzTableStyleService;
            noResult$.pipe(takeUntil(this.destroy$)).subscribe(this.noResult$);
            listOfMeasureColumn$.pipe(takeUntil(this.destroy$)).subscribe(this.listOfMeasureColumn$);
            showEmpty$.pipe(takeUntil(this.destroy$)).subscribe(this.showEmpty$);
        }
    }
    onListOfAutoWidthChange(listOfAutoWidth) {
        this.nzTableStyleService?.setListOfAutoWidth(listOfAutoWidth);
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTbodyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTbodyComponent, isStandalone: true, selector: "tbody", host: { properties: { "class.ant-table-tbody": "isInsideTable" } }, ngImport: i0, template: `
    @if (listOfMeasureColumn$ | async; as listOfMeasureColumn) {
      @if (isInsideTable && listOfMeasureColumn.length) {
        <tr
          nz-table-measure-row
          [listOfMeasureColumn]="listOfMeasureColumn"
          (listOfAutoWidth)="onListOfAutoWidthChange($event)"
        ></tr>
      }
    }
    <ng-content></ng-content>
    @if (showEmpty$ | async) {
      <tr class="ant-table-placeholder" nz-table-fixed-row>
        <nz-embed-empty nzComponentName="table" [specificContent]="(noResult$ | async)!"></nz-embed-empty>
      </tr>
    }
  `, isInline: true, dependencies: [{ kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "component", type: NzTrMeasureComponent, selector: "tr[nz-table-measure-row]", inputs: ["listOfMeasureColumn"], outputs: ["listOfAutoWidth"] }, { kind: "component", type: NzTableFixedRowComponent, selector: "tr[nz-table-fixed-row], tr[nzExpand]" }, { kind: "ngmodule", type: NzEmptyModule }, { kind: "component", type: i1$3.NzEmbedEmptyComponent, selector: "nz-embed-empty", inputs: ["nzComponentName", "specificContent"], exportAs: ["nzEmbedEmpty"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTbodyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'tbody',
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (listOfMeasureColumn$ | async; as listOfMeasureColumn) {
      @if (isInsideTable && listOfMeasureColumn.length) {
        <tr
          nz-table-measure-row
          [listOfMeasureColumn]="listOfMeasureColumn"
          (listOfAutoWidth)="onListOfAutoWidthChange($event)"
        ></tr>
      }
    }
    <ng-content></ng-content>
    @if (showEmpty$ | async) {
      <tr class="ant-table-placeholder" nz-table-fixed-row>
        <nz-embed-empty nzComponentName="table" [specificContent]="(noResult$ | async)!"></nz-embed-empty>
      </tr>
    }
  `,
                    host: {
                        '[class.ant-table-tbody]': 'isInsideTable'
                    },
                    imports: [AsyncPipe, NzTrMeasureComponent, NzTableFixedRowComponent, NzEmptyModule]
                }]
        }], ctorParameters: () => [] });

class NzTableInnerScrollComponent {
    renderer;
    ngZone;
    platform;
    resizeService;
    data = [];
    scrollX = null;
    scrollY = null;
    contentTemplate = null;
    widthConfig = [];
    listOfColWidth = [];
    theadTemplate = null;
    tfootTemplate = null;
    tfootFixed = null;
    virtualTemplate = null;
    virtualItemSize = 0;
    virtualMaxBufferPx = 200;
    virtualMinBufferPx = 100;
    tableMainElement;
    virtualForTrackBy = index => index;
    tableHeaderElement;
    tableBodyElement;
    tableFootElement;
    cdkVirtualScrollViewport;
    headerStyleMap = {};
    bodyStyleMap = {};
    verticalScrollBarWidth = 0;
    noDataVirtualHeight = '182px';
    data$ = new Subject();
    scroll$ = new Subject();
    destroy$ = new Subject();
    setScrollPositionClassName(clear = false) {
        const { scrollWidth, scrollLeft, clientWidth } = this.tableBodyElement.nativeElement;
        const leftClassName = 'ant-table-ping-left';
        const rightClassName = 'ant-table-ping-right';
        if ((scrollWidth === clientWidth && scrollWidth !== 0) || clear) {
            this.renderer.removeClass(this.tableMainElement, leftClassName);
            this.renderer.removeClass(this.tableMainElement, rightClassName);
        }
        else if (scrollLeft === 0) {
            this.renderer.removeClass(this.tableMainElement, leftClassName);
            this.renderer.addClass(this.tableMainElement, rightClassName);
        }
        else if (scrollWidth === scrollLeft + clientWidth) {
            this.renderer.removeClass(this.tableMainElement, rightClassName);
            this.renderer.addClass(this.tableMainElement, leftClassName);
        }
        else {
            this.renderer.addClass(this.tableMainElement, leftClassName);
            this.renderer.addClass(this.tableMainElement, rightClassName);
        }
    }
    constructor(renderer, ngZone, platform, resizeService) {
        this.renderer = renderer;
        this.ngZone = ngZone;
        this.platform = platform;
        this.resizeService = resizeService;
    }
    ngOnChanges(changes) {
        const { scrollX, scrollY, data } = changes;
        if (scrollX || scrollY) {
            const hasVerticalScrollBar = this.verticalScrollBarWidth !== 0;
            this.headerStyleMap = {
                overflowX: 'hidden',
                overflowY: this.scrollY && hasVerticalScrollBar ? 'scroll' : 'hidden'
            };
            this.bodyStyleMap = {
                overflowY: this.scrollY ? 'scroll' : 'hidden',
                overflowX: this.scrollX ? 'auto' : null,
                maxHeight: this.scrollY
            };
            // Caretaker note: we have to emit the value outside the Angular zone, thus DOM timer (`delay(0)`) and `scroll`
            // event listener will be also added outside the Angular zone.
            this.ngZone.runOutsideAngular(() => this.scroll$.next());
        }
        if (data) {
            // See the comment above.
            this.ngZone.runOutsideAngular(() => this.data$.next());
        }
    }
    ngAfterViewInit() {
        if (this.platform.isBrowser) {
            this.ngZone.runOutsideAngular(() => {
                const scrollEvent$ = this.scroll$.pipe(startWith(null), delay(0), switchMap(() => fromEventOutsideAngular(this.tableBodyElement.nativeElement, 'scroll').pipe(startWith(true))), takeUntil(this.destroy$));
                const resize$ = this.resizeService.subscribe().pipe(takeUntil(this.destroy$));
                const data$ = this.data$.pipe(takeUntil(this.destroy$));
                const setClassName$ = merge(scrollEvent$, resize$, data$, this.scroll$).pipe(startWith(true), delay(0), takeUntil(this.destroy$));
                setClassName$.subscribe(() => this.setScrollPositionClassName());
                scrollEvent$.pipe(filter(() => !!this.scrollY)).subscribe(() => {
                    this.tableHeaderElement.nativeElement.scrollLeft = this.tableBodyElement.nativeElement.scrollLeft;
                    if (this.tableFootElement) {
                        this.tableFootElement.nativeElement.scrollLeft = this.tableBodyElement.nativeElement.scrollLeft;
                    }
                });
            });
        }
    }
    ngOnDestroy() {
        this.setScrollPositionClassName(true);
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableInnerScrollComponent, deps: [{ token: i0.Renderer2 }, { token: i0.NgZone }, { token: i1$4.Platform }, { token: i2.NzResizeService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableInnerScrollComponent, isStandalone: true, selector: "nz-table-inner-scroll", inputs: { data: "data", scrollX: "scrollX", scrollY: "scrollY", contentTemplate: "contentTemplate", widthConfig: "widthConfig", listOfColWidth: "listOfColWidth", theadTemplate: "theadTemplate", tfootTemplate: "tfootTemplate", tfootFixed: "tfootFixed", virtualTemplate: "virtualTemplate", virtualItemSize: "virtualItemSize", virtualMaxBufferPx: "virtualMaxBufferPx", virtualMinBufferPx: "virtualMinBufferPx", tableMainElement: "tableMainElement", virtualForTrackBy: "virtualForTrackBy", verticalScrollBarWidth: "verticalScrollBarWidth", noDataVirtualHeight: "noDataVirtualHeight" }, host: { classAttribute: "ant-table-container" }, viewQueries: [{ propertyName: "tableHeaderElement", first: true, predicate: ["tableHeaderElement"], descendants: true, read: ElementRef }, { propertyName: "tableBodyElement", first: true, predicate: ["tableBodyElement"], descendants: true, read: ElementRef }, { propertyName: "tableFootElement", first: true, predicate: ["tableFootElement"], descendants: true, read: ElementRef }, { propertyName: "cdkVirtualScrollViewport", first: true, predicate: CdkVirtualScrollViewport, descendants: true, read: CdkVirtualScrollViewport }], usesOnChanges: true, ngImport: i0, template: `
    @if (scrollY) {
      <div #tableHeaderElement [style]="headerStyleMap" class="ant-table-header nz-table-hide-scrollbar">
        <table
          nz-table-content
          tableLayout="fixed"
          [scrollX]="scrollX"
          [listOfColWidth]="listOfColWidth"
          [theadTemplate]="theadTemplate"
          [tfootTemplate]="tfootFixed === 'top' ? tfootTemplate : null"
        ></table>
      </div>
      @if (!virtualTemplate) {
        <div #tableBodyElement class="ant-table-body" [style]="bodyStyleMap">
          <table
            nz-table-content
            tableLayout="fixed"
            [scrollX]="scrollX"
            [listOfColWidth]="listOfColWidth"
            [contentTemplate]="contentTemplate"
          ></table>
        </div>
      } @else {
        <cdk-virtual-scroll-viewport
          #tableBodyElement
          [itemSize]="virtualItemSize"
          [maxBufferPx]="virtualMaxBufferPx"
          [minBufferPx]="virtualMinBufferPx"
          [style.height]="data.length ? scrollY : noDataVirtualHeight"
        >
          <table nz-table-content tableLayout="fixed" [scrollX]="scrollX" [listOfColWidth]="listOfColWidth">
            <tbody>
              <ng-container *cdkVirtualFor="let item of data; let i = index; trackBy: virtualForTrackBy">
                <ng-template
                  [ngTemplateOutlet]="virtualTemplate"
                  [ngTemplateOutletContext]="{ $implicit: item, index: i }"
                ></ng-template>
              </ng-container>
            </tbody>
          </table>
        </cdk-virtual-scroll-viewport>
      }
      @if (tfootFixed === 'bottom') {
        <div #tableFootElement class="ant-table-summary" [style]="headerStyleMap">
          <table
            nz-table-content
            tableLayout="fixed"
            [scrollX]="scrollX"
            [listOfColWidth]="listOfColWidth"
            [tfootTemplate]="tfootTemplate"
          ></table>
        </div>
      }
    } @else {
      <div class="ant-table-content" #tableBodyElement [style]="bodyStyleMap">
        <table
          nz-table-content
          tableLayout="fixed"
          [scrollX]="scrollX"
          [listOfColWidth]="listOfColWidth"
          [theadTemplate]="theadTemplate"
          [contentTemplate]="contentTemplate"
          [tfootTemplate]="tfootTemplate"
        ></table>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: NzTableContentComponent, selector: "table[nz-table-content]", inputs: ["tableLayout", "theadTemplate", "contentTemplate", "tfootTemplate", "listOfColWidth", "scrollX"] }, { kind: "ngmodule", type: ScrollingModule }, { kind: "directive", type: i3$1.CdkFixedSizeVirtualScroll, selector: "cdk-virtual-scroll-viewport[itemSize]", inputs: ["itemSize", "minBufferPx", "maxBufferPx"] }, { kind: "directive", type: i3$1.CdkVirtualForOf, selector: "[cdkVirtualFor][cdkVirtualForOf]", inputs: ["cdkVirtualForOf", "cdkVirtualForTrackBy", "cdkVirtualForTemplate", "cdkVirtualForTemplateCacheSize"] }, { kind: "component", type: i3$1.CdkVirtualScrollViewport, selector: "cdk-virtual-scroll-viewport", inputs: ["orientation", "appendOnly"], outputs: ["scrolledIndexChange"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzTbodyComponent, selector: "tbody" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableInnerScrollComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-inner-scroll',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    @if (scrollY) {
      <div #tableHeaderElement [style]="headerStyleMap" class="ant-table-header nz-table-hide-scrollbar">
        <table
          nz-table-content
          tableLayout="fixed"
          [scrollX]="scrollX"
          [listOfColWidth]="listOfColWidth"
          [theadTemplate]="theadTemplate"
          [tfootTemplate]="tfootFixed === 'top' ? tfootTemplate : null"
        ></table>
      </div>
      @if (!virtualTemplate) {
        <div #tableBodyElement class="ant-table-body" [style]="bodyStyleMap">
          <table
            nz-table-content
            tableLayout="fixed"
            [scrollX]="scrollX"
            [listOfColWidth]="listOfColWidth"
            [contentTemplate]="contentTemplate"
          ></table>
        </div>
      } @else {
        <cdk-virtual-scroll-viewport
          #tableBodyElement
          [itemSize]="virtualItemSize"
          [maxBufferPx]="virtualMaxBufferPx"
          [minBufferPx]="virtualMinBufferPx"
          [style.height]="data.length ? scrollY : noDataVirtualHeight"
        >
          <table nz-table-content tableLayout="fixed" [scrollX]="scrollX" [listOfColWidth]="listOfColWidth">
            <tbody>
              <ng-container *cdkVirtualFor="let item of data; let i = index; trackBy: virtualForTrackBy">
                <ng-template
                  [ngTemplateOutlet]="virtualTemplate"
                  [ngTemplateOutletContext]="{ $implicit: item, index: i }"
                ></ng-template>
              </ng-container>
            </tbody>
          </table>
        </cdk-virtual-scroll-viewport>
      }
      @if (tfootFixed === 'bottom') {
        <div #tableFootElement class="ant-table-summary" [style]="headerStyleMap">
          <table
            nz-table-content
            tableLayout="fixed"
            [scrollX]="scrollX"
            [listOfColWidth]="listOfColWidth"
            [tfootTemplate]="tfootTemplate"
          ></table>
        </div>
      }
    } @else {
      <div class="ant-table-content" #tableBodyElement [style]="bodyStyleMap">
        <table
          nz-table-content
          tableLayout="fixed"
          [scrollX]="scrollX"
          [listOfColWidth]="listOfColWidth"
          [theadTemplate]="theadTemplate"
          [contentTemplate]="contentTemplate"
          [tfootTemplate]="tfootTemplate"
        ></table>
      </div>
    }
  `,
                    host: { class: 'ant-table-container' },
                    imports: [NzTableContentComponent, ScrollingModule, NgTemplateOutlet, NzTbodyComponent]
                }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.NgZone }, { type: i1$4.Platform }, { type: i2.NzResizeService }], propDecorators: { data: [{
                type: Input
            }], scrollX: [{
                type: Input
            }], scrollY: [{
                type: Input
            }], contentTemplate: [{
                type: Input
            }], widthConfig: [{
                type: Input
            }], listOfColWidth: [{
                type: Input
            }], theadTemplate: [{
                type: Input
            }], tfootTemplate: [{
                type: Input
            }], tfootFixed: [{
                type: Input
            }], virtualTemplate: [{
                type: Input
            }], virtualItemSize: [{
                type: Input
            }], virtualMaxBufferPx: [{
                type: Input
            }], virtualMinBufferPx: [{
                type: Input
            }], tableMainElement: [{
                type: Input
            }], virtualForTrackBy: [{
                type: Input
            }], tableHeaderElement: [{
                type: ViewChild,
                args: ['tableHeaderElement', { read: ElementRef }]
            }], tableBodyElement: [{
                type: ViewChild,
                args: ['tableBodyElement', { read: ElementRef }]
            }], tableFootElement: [{
                type: ViewChild,
                args: ['tableFootElement', { read: ElementRef }]
            }], cdkVirtualScrollViewport: [{
                type: ViewChild,
                args: [CdkVirtualScrollViewport, { read: CdkVirtualScrollViewport }]
            }], verticalScrollBarWidth: [{
                type: Input
            }], noDataVirtualHeight: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableVirtualScrollDirective {
    templateRef;
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
    static ngTemplateContextGuard(_dir, _ctx) {
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableVirtualScrollDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTableVirtualScrollDirective, isStandalone: true, selector: "[nz-virtual-scroll]", exportAs: ["nzVirtualScroll"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableVirtualScrollDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nz-virtual-scroll]',
                    exportAs: 'nzVirtualScroll'
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableTitleFooterComponent {
    title = null;
    footer = null;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableTitleFooterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzTableTitleFooterComponent, isStandalone: true, selector: "nz-table-title-footer", inputs: { title: "title", footer: "footer" }, host: { properties: { "class.ant-table-title": "title !== null", "class.ant-table-footer": "footer !== null" } }, ngImport: i0, template: `
    <ng-container *nzStringTemplateOutlet="title">{{ title }}</ng-container>
    <ng-container *nzStringTemplateOutlet="footer">{{ footer }}</ng-container>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i1$5.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableTitleFooterComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table-title-footer',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <ng-container *nzStringTemplateOutlet="title">{{ title }}</ng-container>
    <ng-container *nzStringTemplateOutlet="footer">{{ footer }}</ng-container>
  `,
                    host: {
                        '[class.ant-table-title]': `title !== null`,
                        '[class.ant-table-footer]': `footer !== null`
                    },
                    imports: [NzOutletModule]
                }]
        }], propDecorators: { title: [{
                type: Input
            }], footer: [{
                type: Input
            }] } });

const NZ_CONFIG_MODULE_NAME = 'table';
let NzTableComponent = (() => {
    let _nzLoadingIndicator_decorators;
    let _nzLoadingIndicator_initializers = [];
    let _nzLoadingIndicator_extraInitializers = [];
    let _nzBordered_decorators;
    let _nzBordered_initializers = [];
    let _nzBordered_extraInitializers = [];
    let _nzSize_decorators;
    let _nzSize_initializers = [];
    let _nzSize_extraInitializers = [];
    let _nzShowSizeChanger_decorators;
    let _nzShowSizeChanger_initializers = [];
    let _nzShowSizeChanger_extraInitializers = [];
    let _nzHideOnSinglePage_decorators;
    let _nzHideOnSinglePage_initializers = [];
    let _nzHideOnSinglePage_extraInitializers = [];
    let _nzShowQuickJumper_decorators;
    let _nzShowQuickJumper_initializers = [];
    let _nzShowQuickJumper_extraInitializers = [];
    let _nzSimple_decorators;
    let _nzSimple_initializers = [];
    let _nzSimple_extraInitializers = [];
    return class NzTableComponent {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nzLoadingIndicator_decorators = [WithConfig()];
            _nzBordered_decorators = [WithConfig()];
            _nzSize_decorators = [WithConfig()];
            _nzShowSizeChanger_decorators = [WithConfig()];
            _nzHideOnSinglePage_decorators = [WithConfig()];
            _nzShowQuickJumper_decorators = [WithConfig()];
            _nzSimple_decorators = [WithConfig()];
            __esDecorate(null, null, _nzLoadingIndicator_decorators, { kind: "field", name: "nzLoadingIndicator", static: false, private: false, access: { has: obj => "nzLoadingIndicator" in obj, get: obj => obj.nzLoadingIndicator, set: (obj, value) => { obj.nzLoadingIndicator = value; } }, metadata: _metadata }, _nzLoadingIndicator_initializers, _nzLoadingIndicator_extraInitializers);
            __esDecorate(null, null, _nzBordered_decorators, { kind: "field", name: "nzBordered", static: false, private: false, access: { has: obj => "nzBordered" in obj, get: obj => obj.nzBordered, set: (obj, value) => { obj.nzBordered = value; } }, metadata: _metadata }, _nzBordered_initializers, _nzBordered_extraInitializers);
            __esDecorate(null, null, _nzSize_decorators, { kind: "field", name: "nzSize", static: false, private: false, access: { has: obj => "nzSize" in obj, get: obj => obj.nzSize, set: (obj, value) => { obj.nzSize = value; } }, metadata: _metadata }, _nzSize_initializers, _nzSize_extraInitializers);
            __esDecorate(null, null, _nzShowSizeChanger_decorators, { kind: "field", name: "nzShowSizeChanger", static: false, private: false, access: { has: obj => "nzShowSizeChanger" in obj, get: obj => obj.nzShowSizeChanger, set: (obj, value) => { obj.nzShowSizeChanger = value; } }, metadata: _metadata }, _nzShowSizeChanger_initializers, _nzShowSizeChanger_extraInitializers);
            __esDecorate(null, null, _nzHideOnSinglePage_decorators, { kind: "field", name: "nzHideOnSinglePage", static: false, private: false, access: { has: obj => "nzHideOnSinglePage" in obj, get: obj => obj.nzHideOnSinglePage, set: (obj, value) => { obj.nzHideOnSinglePage = value; } }, metadata: _metadata }, _nzHideOnSinglePage_initializers, _nzHideOnSinglePage_extraInitializers);
            __esDecorate(null, null, _nzShowQuickJumper_decorators, { kind: "field", name: "nzShowQuickJumper", static: false, private: false, access: { has: obj => "nzShowQuickJumper" in obj, get: obj => obj.nzShowQuickJumper, set: (obj, value) => { obj.nzShowQuickJumper = value; } }, metadata: _metadata }, _nzShowQuickJumper_initializers, _nzShowQuickJumper_extraInitializers);
            __esDecorate(null, null, _nzSimple_decorators, { kind: "field", name: "nzSimple", static: false, private: false, access: { has: obj => "nzSimple" in obj, get: obj => obj.nzSimple, set: (obj, value) => { obj.nzSimple = value; } }, metadata: _metadata }, _nzSimple_initializers, _nzSimple_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        elementRef;
        nzResizeObserver;
        nzConfigService;
        cdr;
        nzTableStyleService;
        nzTableDataService;
        directionality;
        _nzModuleName = NZ_CONFIG_MODULE_NAME;
        nzTableLayout = 'auto';
        nzShowTotal = null;
        nzItemRender = null;
        nzTitle = null;
        nzFooter = null;
        nzNoResult = undefined;
        nzPageSizeOptions = [10, 20, 30, 40, 50];
        nzVirtualItemSize = 0;
        nzVirtualMaxBufferPx = 200;
        nzVirtualMinBufferPx = 100;
        nzVirtualForTrackBy = index => index;
        nzLoadingDelay = 0;
        nzPageIndex = 1;
        nzPageSize = 10;
        nzTotal = 0;
        nzWidthConfig = [];
        nzData = [];
        nzCustomColumn = [];
        nzPaginationPosition = 'bottom';
        nzScroll = { x: null, y: null };
        noDataVirtualHeight = '182px';
        nzPaginationType = 'default';
        nzFrontPagination = true;
        nzTemplateMode = false;
        nzShowPagination = true;
        nzLoading = false;
        nzOuterBordered = false;
        nzLoadingIndicator = __runInitializers(this, _nzLoadingIndicator_initializers, null);
        nzBordered = (__runInitializers(this, _nzLoadingIndicator_extraInitializers), __runInitializers(this, _nzBordered_initializers, false));
        nzSize = (__runInitializers(this, _nzBordered_extraInitializers), __runInitializers(this, _nzSize_initializers, 'default'));
        nzShowSizeChanger = (__runInitializers(this, _nzSize_extraInitializers), __runInitializers(this, _nzShowSizeChanger_initializers, false));
        nzHideOnSinglePage = (__runInitializers(this, _nzShowSizeChanger_extraInitializers), __runInitializers(this, _nzHideOnSinglePage_initializers, false));
        nzShowQuickJumper = (__runInitializers(this, _nzHideOnSinglePage_extraInitializers), __runInitializers(this, _nzShowQuickJumper_initializers, false));
        nzSimple = (__runInitializers(this, _nzShowQuickJumper_extraInitializers), __runInitializers(this, _nzSimple_initializers, false));
        nzPageSizeChange = (__runInitializers(this, _nzSimple_extraInitializers), new EventEmitter());
        nzPageIndexChange = new EventEmitter();
        nzQueryParams = new EventEmitter();
        nzCurrentPageDataChange = new EventEmitter();
        nzCustomColumnChange = new EventEmitter();
        /** public data for ngFor tr */
        data = [];
        cdkVirtualScrollViewport;
        scrollX = null;
        scrollY = null;
        theadTemplate = null;
        tfootTemplate = null;
        tfootFixed = null;
        listOfAutoColWidth = [];
        listOfManualColWidth = [];
        hasFixLeft = false;
        hasFixRight = false;
        showPagination = true;
        destroy$ = new Subject();
        templateMode$ = new BehaviorSubject(false);
        dir = 'ltr';
        nzVirtualScrollDirective;
        nzTableInnerScrollComponent;
        verticalScrollBarWidth = 0;
        onPageSizeChange(size) {
            this.nzTableDataService.updatePageSize(size);
        }
        onPageIndexChange(index) {
            this.nzTableDataService.updatePageIndex(index);
        }
        constructor(elementRef, nzResizeObserver, nzConfigService, cdr, nzTableStyleService, nzTableDataService, directionality) {
            this.elementRef = elementRef;
            this.nzResizeObserver = nzResizeObserver;
            this.nzConfigService = nzConfigService;
            this.cdr = cdr;
            this.nzTableStyleService = nzTableStyleService;
            this.nzTableDataService = nzTableDataService;
            this.directionality = directionality;
            this.nzConfigService
                .getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                this.cdr.markForCheck();
            });
        }
        ngOnInit() {
            const { pageIndexDistinct$, pageSizeDistinct$, listOfCurrentPageData$, total$, queryParams$, listOfCustomColumn$ } = this.nzTableDataService;
            const { theadTemplate$, tfootTemplate$, tfootFixed$, hasFixLeft$, hasFixRight$ } = this.nzTableStyleService;
            this.dir = this.directionality.value;
            this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
                this.dir = direction;
                this.cdr.detectChanges();
            });
            queryParams$.pipe(takeUntil(this.destroy$)).subscribe(this.nzQueryParams);
            pageIndexDistinct$.pipe(takeUntil(this.destroy$)).subscribe(pageIndex => {
                if (pageIndex !== this.nzPageIndex) {
                    this.nzPageIndex = pageIndex;
                    this.nzPageIndexChange.next(pageIndex);
                }
            });
            pageSizeDistinct$.pipe(takeUntil(this.destroy$)).subscribe(pageSize => {
                if (pageSize !== this.nzPageSize) {
                    this.nzPageSize = pageSize;
                    this.nzPageSizeChange.next(pageSize);
                }
            });
            total$
                .pipe(takeUntil(this.destroy$), filter(() => this.nzFrontPagination))
                .subscribe(total => {
                if (total !== this.nzTotal) {
                    this.nzTotal = total;
                    this.cdr.markForCheck();
                }
            });
            listOfCurrentPageData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
                this.data = data;
                this.nzCurrentPageDataChange.next(data);
                this.cdr.markForCheck();
            });
            listOfCustomColumn$.pipe(takeUntil(this.destroy$)).subscribe(data => {
                this.nzCustomColumn = data;
                this.nzCustomColumnChange.next(data);
                this.cdr.markForCheck();
            });
            theadTemplate$.pipe(takeUntil(this.destroy$)).subscribe(theadTemplate => {
                this.theadTemplate = theadTemplate;
                this.cdr.markForCheck();
            });
            combineLatest([tfootTemplate$, tfootFixed$])
                .pipe(takeUntil(this.destroy$))
                .subscribe(([tfootTemplate, tfootFixed]) => {
                this.tfootTemplate = tfootTemplate;
                this.tfootFixed = tfootFixed;
                this.cdr.markForCheck();
            });
            hasFixLeft$.pipe(takeUntil(this.destroy$)).subscribe(hasFixLeft => {
                this.hasFixLeft = hasFixLeft;
                this.cdr.markForCheck();
            });
            hasFixRight$.pipe(takeUntil(this.destroy$)).subscribe(hasFixRight => {
                this.hasFixRight = hasFixRight;
                this.cdr.markForCheck();
            });
            combineLatest([total$, this.templateMode$])
                .pipe(map(([total, templateMode]) => total === 0 && !templateMode), takeUntil(this.destroy$))
                .subscribe(empty => {
                this.nzTableStyleService.setShowEmpty(empty);
            });
            this.verticalScrollBarWidth = measureScrollbar('vertical');
            this.nzTableStyleService.listOfListOfThWidthPx$.pipe(takeUntil(this.destroy$)).subscribe(listOfWidth => {
                this.listOfAutoColWidth = listOfWidth;
                this.cdr.markForCheck();
            });
            this.nzTableStyleService.manualWidthConfigPx$.pipe(takeUntil(this.destroy$)).subscribe(listOfWidth => {
                this.listOfManualColWidth = listOfWidth;
                this.cdr.markForCheck();
            });
        }
        ngOnChanges(changes) {
            const { nzScroll, nzPageIndex, nzPageSize, nzFrontPagination, nzData, nzCustomColumn, nzWidthConfig, nzNoResult, nzTemplateMode } = changes;
            if (nzPageIndex) {
                this.nzTableDataService.updatePageIndex(this.nzPageIndex);
            }
            if (nzPageSize) {
                this.nzTableDataService.updatePageSize(this.nzPageSize);
            }
            if (nzData) {
                this.nzData = this.nzData || [];
                this.nzTableDataService.updateListOfData(this.nzData);
            }
            if (nzCustomColumn) {
                this.nzCustomColumn = this.nzCustomColumn || [];
                this.nzTableDataService.updateListOfCustomColumn(this.nzCustomColumn);
            }
            if (nzFrontPagination) {
                this.nzTableDataService.updateFrontPagination(this.nzFrontPagination);
            }
            if (nzScroll) {
                this.setScrollOnChanges();
            }
            if (nzWidthConfig) {
                this.nzTableStyleService.setTableWidthConfig(this.nzWidthConfig);
            }
            if (nzTemplateMode) {
                this.templateMode$.next(this.nzTemplateMode);
            }
            if (nzNoResult) {
                this.nzTableStyleService.setNoResult(this.nzNoResult);
            }
            this.updateShowPagination();
        }
        ngAfterViewInit() {
            this.nzResizeObserver
                .observe(this.elementRef)
                .pipe(map(([entry]) => {
                const { width } = entry.target.getBoundingClientRect();
                const scrollBarWidth = this.scrollY ? this.verticalScrollBarWidth : 0;
                return Math.floor(width - scrollBarWidth);
            }), takeUntil(this.destroy$))
                .subscribe(this.nzTableStyleService.hostWidth$);
            if (this.nzTableInnerScrollComponent && this.nzTableInnerScrollComponent.cdkVirtualScrollViewport) {
                this.cdkVirtualScrollViewport = this.nzTableInnerScrollComponent.cdkVirtualScrollViewport;
            }
        }
        ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
        }
        setScrollOnChanges() {
            this.scrollX = (this.nzScroll && this.nzScroll.x) || null;
            this.scrollY = (this.nzScroll && this.nzScroll.y) || null;
            this.nzTableStyleService.setScroll(this.scrollX, this.scrollY);
        }
        updateShowPagination() {
            this.showPagination =
                (this.nzHideOnSinglePage && this.nzData.length > this.nzPageSize) ||
                    (this.nzData.length > 0 && !this.nzHideOnSinglePage) ||
                    (!this.nzFrontPagination && this.nzTotal > this.nzPageSize);
        }
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableComponent, deps: [{ token: i0.ElementRef }, { token: i1$2.NzResizeObserver }, { token: i1.NzConfigService }, { token: i0.ChangeDetectorRef }, { token: NzTableStyleService }, { token: NzTableDataService }, { token: i5$1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTableComponent, isStandalone: true, selector: "nz-table", inputs: { nzTableLayout: "nzTableLayout", nzShowTotal: "nzShowTotal", nzItemRender: "nzItemRender", nzTitle: "nzTitle", nzFooter: "nzFooter", nzNoResult: "nzNoResult", nzPageSizeOptions: "nzPageSizeOptions", nzVirtualItemSize: "nzVirtualItemSize", nzVirtualMaxBufferPx: "nzVirtualMaxBufferPx", nzVirtualMinBufferPx: "nzVirtualMinBufferPx", nzVirtualForTrackBy: "nzVirtualForTrackBy", nzLoadingDelay: "nzLoadingDelay", nzPageIndex: "nzPageIndex", nzPageSize: "nzPageSize", nzTotal: "nzTotal", nzWidthConfig: "nzWidthConfig", nzData: "nzData", nzCustomColumn: "nzCustomColumn", nzPaginationPosition: "nzPaginationPosition", nzScroll: "nzScroll", noDataVirtualHeight: "noDataVirtualHeight", nzPaginationType: "nzPaginationType", nzFrontPagination: ["nzFrontPagination", "nzFrontPagination", booleanAttribute], nzTemplateMode: ["nzTemplateMode", "nzTemplateMode", booleanAttribute], nzShowPagination: ["nzShowPagination", "nzShowPagination", booleanAttribute], nzLoading: ["nzLoading", "nzLoading", booleanAttribute], nzOuterBordered: ["nzOuterBordered", "nzOuterBordered", booleanAttribute], nzLoadingIndicator: "nzLoadingIndicator", nzBordered: ["nzBordered", "nzBordered", booleanAttribute], nzSize: "nzSize", nzShowSizeChanger: ["nzShowSizeChanger", "nzShowSizeChanger", booleanAttribute], nzHideOnSinglePage: ["nzHideOnSinglePage", "nzHideOnSinglePage", booleanAttribute], nzShowQuickJumper: ["nzShowQuickJumper", "nzShowQuickJumper", booleanAttribute], nzSimple: ["nzSimple", "nzSimple", booleanAttribute] }, outputs: { nzPageSizeChange: "nzPageSizeChange", nzPageIndexChange: "nzPageIndexChange", nzQueryParams: "nzQueryParams", nzCurrentPageDataChange: "nzCurrentPageDataChange", nzCustomColumnChange: "nzCustomColumnChange" }, host: { properties: { "class.ant-table-wrapper-rtl": "dir === \"rtl\"", "class.ant-table-custom-column": "nzCustomColumn.length" }, classAttribute: "ant-table-wrapper" }, providers: [NzTableStyleService, NzTableDataService], queries: [{ propertyName: "nzVirtualScrollDirective", first: true, predicate: NzTableVirtualScrollDirective, descendants: true }], viewQueries: [{ propertyName: "nzTableInnerScrollComponent", first: true, predicate: NzTableInnerScrollComponent, descendants: true }], exportAs: ["nzTable"], usesOnChanges: true, ngImport: i0, template: `
    <nz-spin [nzDelay]="nzLoadingDelay" [nzSpinning]="nzLoading" [nzIndicator]="nzLoadingIndicator">
      @if (nzPaginationPosition === 'both' || nzPaginationPosition === 'top') {
        <ng-template [ngTemplateOutlet]="paginationTemplate"></ng-template>
      }
      <div
        #tableMainElement
        class="ant-table"
        [class.ant-table-rtl]="dir === 'rtl'"
        [class.ant-table-fixed-header]="nzData.length && scrollY"
        [class.ant-table-fixed-column]="scrollX"
        [class.ant-table-has-fix-left]="hasFixLeft"
        [class.ant-table-has-fix-right]="hasFixRight"
        [class.ant-table-bordered]="nzBordered"
        [class.nz-table-out-bordered]="nzOuterBordered && !nzBordered"
        [class.ant-table-middle]="nzSize === 'middle'"
        [class.ant-table-small]="nzSize === 'small'"
      >
        @if (nzTitle) {
          <nz-table-title-footer [title]="nzTitle"></nz-table-title-footer>
        }
        @if (scrollY || scrollX) {
          <nz-table-inner-scroll
            [data]="data"
            [scrollX]="scrollX"
            [scrollY]="scrollY"
            [contentTemplate]="contentTemplate"
            [listOfColWidth]="listOfAutoColWidth"
            [theadTemplate]="theadTemplate"
            [tfootTemplate]="tfootTemplate"
            [tfootFixed]="tfootFixed"
            [verticalScrollBarWidth]="verticalScrollBarWidth"
            [virtualTemplate]="nzVirtualScrollDirective ? nzVirtualScrollDirective.templateRef : null"
            [virtualItemSize]="nzVirtualItemSize"
            [virtualMaxBufferPx]="nzVirtualMaxBufferPx"
            [virtualMinBufferPx]="nzVirtualMinBufferPx"
            [tableMainElement]="tableMainElement"
            [virtualForTrackBy]="nzVirtualForTrackBy"
            [noDataVirtualHeight]="noDataVirtualHeight"
          ></nz-table-inner-scroll>
        } @else {
          <nz-table-inner-default
            [tableLayout]="nzTableLayout"
            [listOfColWidth]="listOfManualColWidth"
            [theadTemplate]="theadTemplate"
            [contentTemplate]="contentTemplate"
            [tfootTemplate]="tfootTemplate"
          ></nz-table-inner-default>
        }
        @if (nzFooter) {
          <nz-table-title-footer [footer]="nzFooter"></nz-table-title-footer>
        }
      </div>
      @if (nzPaginationPosition === 'both' || nzPaginationPosition === 'bottom') {
        <ng-template [ngTemplateOutlet]="paginationTemplate"></ng-template>
      }
    </nz-spin>
    <ng-template #paginationTemplate>
      @if (nzShowPagination && data.length) {
        <nz-pagination
          [hidden]="!showPagination"
          class="ant-table-pagination ant-table-pagination-right"
          [nzShowSizeChanger]="nzShowSizeChanger"
          [nzPageSizeOptions]="nzPageSizeOptions"
          [nzItemRender]="nzItemRender!"
          [nzShowQuickJumper]="nzShowQuickJumper"
          [nzHideOnSinglePage]="nzHideOnSinglePage"
          [nzShowTotal]="nzShowTotal"
          [nzSize]="nzPaginationType === 'small' ? 'small' : nzSize === 'default' ? 'default' : 'small'"
          [nzPageSize]="nzPageSize"
          [nzTotal]="nzTotal"
          [nzSimple]="nzSimple"
          [nzPageIndex]="nzPageIndex"
          (nzPageSizeChange)="onPageSizeChange($event)"
          (nzPageIndexChange)="onPageIndexChange($event)"
        ></nz-pagination>
      }
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "component", type: NzSpinComponent, selector: "nz-spin", inputs: ["nzIndicator", "nzSize", "nzTip", "nzDelay", "nzSimple", "nzSpinning"], exportAs: ["nzSpin"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NzTableTitleFooterComponent, selector: "nz-table-title-footer", inputs: ["title", "footer"] }, { kind: "component", type: NzTableInnerScrollComponent, selector: "nz-table-inner-scroll", inputs: ["data", "scrollX", "scrollY", "contentTemplate", "widthConfig", "listOfColWidth", "theadTemplate", "tfootTemplate", "tfootFixed", "virtualTemplate", "virtualItemSize", "virtualMaxBufferPx", "virtualMinBufferPx", "tableMainElement", "virtualForTrackBy", "verticalScrollBarWidth", "noDataVirtualHeight"] }, { kind: "component", type: NzTableInnerDefaultComponent, selector: "nz-table-inner-default", inputs: ["tableLayout", "listOfColWidth", "theadTemplate", "contentTemplate", "tfootTemplate"] }, { kind: "ngmodule", type: NzPaginationModule }, { kind: "component", type: i6$1.NzPaginationComponent, selector: "nz-pagination", inputs: ["nzShowTotal", "nzItemRender", "nzSize", "nzPageSizeOptions", "nzShowSizeChanger", "nzShowQuickJumper", "nzSimple", "nzDisabled", "nzResponsive", "nzHideOnSinglePage", "nzTotal", "nzPageIndex", "nzPageSize"], outputs: ["nzPageSizeChange", "nzPageIndexChange"], exportAs: ["nzPagination"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
    };
})();
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-table',
                    exportAs: 'nzTable',
                    providers: [NzTableStyleService, NzTableDataService],
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <nz-spin [nzDelay]="nzLoadingDelay" [nzSpinning]="nzLoading" [nzIndicator]="nzLoadingIndicator">
      @if (nzPaginationPosition === 'both' || nzPaginationPosition === 'top') {
        <ng-template [ngTemplateOutlet]="paginationTemplate"></ng-template>
      }
      <div
        #tableMainElement
        class="ant-table"
        [class.ant-table-rtl]="dir === 'rtl'"
        [class.ant-table-fixed-header]="nzData.length && scrollY"
        [class.ant-table-fixed-column]="scrollX"
        [class.ant-table-has-fix-left]="hasFixLeft"
        [class.ant-table-has-fix-right]="hasFixRight"
        [class.ant-table-bordered]="nzBordered"
        [class.nz-table-out-bordered]="nzOuterBordered && !nzBordered"
        [class.ant-table-middle]="nzSize === 'middle'"
        [class.ant-table-small]="nzSize === 'small'"
      >
        @if (nzTitle) {
          <nz-table-title-footer [title]="nzTitle"></nz-table-title-footer>
        }
        @if (scrollY || scrollX) {
          <nz-table-inner-scroll
            [data]="data"
            [scrollX]="scrollX"
            [scrollY]="scrollY"
            [contentTemplate]="contentTemplate"
            [listOfColWidth]="listOfAutoColWidth"
            [theadTemplate]="theadTemplate"
            [tfootTemplate]="tfootTemplate"
            [tfootFixed]="tfootFixed"
            [verticalScrollBarWidth]="verticalScrollBarWidth"
            [virtualTemplate]="nzVirtualScrollDirective ? nzVirtualScrollDirective.templateRef : null"
            [virtualItemSize]="nzVirtualItemSize"
            [virtualMaxBufferPx]="nzVirtualMaxBufferPx"
            [virtualMinBufferPx]="nzVirtualMinBufferPx"
            [tableMainElement]="tableMainElement"
            [virtualForTrackBy]="nzVirtualForTrackBy"
            [noDataVirtualHeight]="noDataVirtualHeight"
          ></nz-table-inner-scroll>
        } @else {
          <nz-table-inner-default
            [tableLayout]="nzTableLayout"
            [listOfColWidth]="listOfManualColWidth"
            [theadTemplate]="theadTemplate"
            [contentTemplate]="contentTemplate"
            [tfootTemplate]="tfootTemplate"
          ></nz-table-inner-default>
        }
        @if (nzFooter) {
          <nz-table-title-footer [footer]="nzFooter"></nz-table-title-footer>
        }
      </div>
      @if (nzPaginationPosition === 'both' || nzPaginationPosition === 'bottom') {
        <ng-template [ngTemplateOutlet]="paginationTemplate"></ng-template>
      }
    </nz-spin>
    <ng-template #paginationTemplate>
      @if (nzShowPagination && data.length) {
        <nz-pagination
          [hidden]="!showPagination"
          class="ant-table-pagination ant-table-pagination-right"
          [nzShowSizeChanger]="nzShowSizeChanger"
          [nzPageSizeOptions]="nzPageSizeOptions"
          [nzItemRender]="nzItemRender!"
          [nzShowQuickJumper]="nzShowQuickJumper"
          [nzHideOnSinglePage]="nzHideOnSinglePage"
          [nzShowTotal]="nzShowTotal"
          [nzSize]="nzPaginationType === 'small' ? 'small' : nzSize === 'default' ? 'default' : 'small'"
          [nzPageSize]="nzPageSize"
          [nzTotal]="nzTotal"
          [nzSimple]="nzSimple"
          [nzPageIndex]="nzPageIndex"
          (nzPageSizeChange)="onPageSizeChange($event)"
          (nzPageIndexChange)="onPageIndexChange($event)"
        ></nz-pagination>
      }
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  `,
                    host: {
                        class: 'ant-table-wrapper',
                        '[class.ant-table-wrapper-rtl]': 'dir === "rtl"',
                        '[class.ant-table-custom-column]': `nzCustomColumn.length`
                    },
                    imports: [
                        NzSpinComponent,
                        NgTemplateOutlet,
                        NzTableTitleFooterComponent,
                        NzTableInnerScrollComponent,
                        NzTableInnerDefaultComponent,
                        NzPaginationModule
                    ]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1$2.NzResizeObserver }, { type: i1.NzConfigService }, { type: i0.ChangeDetectorRef }, { type: NzTableStyleService }, { type: NzTableDataService }, { type: i5$1.Directionality }], propDecorators: { nzTableLayout: [{
                type: Input
            }], nzShowTotal: [{
                type: Input
            }], nzItemRender: [{
                type: Input
            }], nzTitle: [{
                type: Input
            }], nzFooter: [{
                type: Input
            }], nzNoResult: [{
                type: Input
            }], nzPageSizeOptions: [{
                type: Input
            }], nzVirtualItemSize: [{
                type: Input
            }], nzVirtualMaxBufferPx: [{
                type: Input
            }], nzVirtualMinBufferPx: [{
                type: Input
            }], nzVirtualForTrackBy: [{
                type: Input
            }], nzLoadingDelay: [{
                type: Input
            }], nzPageIndex: [{
                type: Input
            }], nzPageSize: [{
                type: Input
            }], nzTotal: [{
                type: Input
            }], nzWidthConfig: [{
                type: Input
            }], nzData: [{
                type: Input
            }], nzCustomColumn: [{
                type: Input
            }], nzPaginationPosition: [{
                type: Input
            }], nzScroll: [{
                type: Input
            }], noDataVirtualHeight: [{
                type: Input
            }], nzPaginationType: [{
                type: Input
            }], nzFrontPagination: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzTemplateMode: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowPagination: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOuterBordered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzLoadingIndicator: [{
                type: Input
            }], nzBordered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSize: [{
                type: Input
            }], nzShowSizeChanger: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzHideOnSinglePage: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzShowQuickJumper: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzSimple: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzPageSizeChange: [{
                type: Output
            }], nzPageIndexChange: [{
                type: Output
            }], nzQueryParams: [{
                type: Output
            }], nzCurrentPageDataChange: [{
                type: Output
            }], nzCustomColumnChange: [{
                type: Output
            }], nzVirtualScrollDirective: [{
                type: ContentChild,
                args: [NzTableVirtualScrollDirective, { static: false }]
            }], nzTableInnerScrollComponent: [{
                type: ViewChild,
                args: [NzTableInnerScrollComponent]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
function fixedAttribute(value) {
    return value === 'top' || value === 'bottom' ? value : booleanAttribute(value) ? 'bottom' : null;
}
/* eslint-disable @angular-eslint/component-selector */
class NzTfootSummaryComponent {
    nzFixed = null;
    templateRef;
    nzTableStyleService = inject(NzTableStyleService, { optional: true });
    isInsideTable = !!this.nzTableStyleService;
    ngOnInit() {
        this.nzTableStyleService?.setTfootTemplate(this.templateRef);
    }
    ngOnChanges(changes) {
        const { nzFixed } = changes;
        this.nzTableStyleService?.setTfootFixed(nzFixed.currentValue);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTfootSummaryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTfootSummaryComponent, isStandalone: true, selector: "tfoot[nzSummary]", inputs: { nzFixed: ["nzFixed", "nzFixed", fixedAttribute] }, host: { properties: { "class.ant-table-summary": "!isInsideTable || !nzFixed" } }, viewQueries: [{ propertyName: "templateRef", first: true, predicate: ["contentTemplate"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
    @if (!isInsideTable || !nzFixed) {
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTfootSummaryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'tfoot[nzSummary]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
    @if (!isInsideTable || !nzFixed) {
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    }
  `,
                    imports: [NgTemplateOutlet],
                    host: {
                        '[class.ant-table-summary]': '!isInsideTable || !nzFixed'
                    }
                }]
        }], propDecorators: { nzFixed: [{
                type: Input,
                args: [{ transform: fixedAttribute }]
            }], templateRef: [{
                type: ViewChild,
                args: ['contentTemplate', { static: true }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTrDirective {
    listOfNzThDirective;
    listOfCellFixedDirective;
    destroy$ = new Subject();
    listOfFixedColumns$ = new ReplaySubject(1);
    listOfColumns$ = new ReplaySubject(1);
    listOfFixedColumnsChanges$ = this.listOfFixedColumns$.pipe(switchMap(list => merge(...[this.listOfFixedColumns$, ...list.map((c) => c.changes$)]).pipe(mergeMap(() => this.listOfFixedColumns$))), takeUntil(this.destroy$));
    listOfFixedLeftColumnChanges$ = this.listOfFixedColumnsChanges$.pipe(map(list => list.filter(item => item.nzLeft !== false)));
    listOfFixedRightColumnChanges$ = this.listOfFixedColumnsChanges$.pipe(map(list => list.filter(item => item.nzRight !== false)));
    listOfColumnsChanges$ = this.listOfColumns$.pipe(switchMap(list => merge(...[this.listOfColumns$, ...list.map((c) => c.changes$)]).pipe(mergeMap(() => this.listOfColumns$))), takeUntil(this.destroy$));
    nzTableStyleService = inject(NzTableStyleService, { optional: true });
    isInsideTable = !!this.nzTableStyleService;
    ngAfterContentInit() {
        if (this.nzTableStyleService) {
            this.listOfCellFixedDirective.changes
                .pipe(startWith(this.listOfCellFixedDirective), takeUntil(this.destroy$))
                .subscribe(this.listOfFixedColumns$);
            this.listOfNzThDirective.changes
                .pipe(startWith(this.listOfNzThDirective), takeUntil(this.destroy$))
                .subscribe(this.listOfColumns$);
            /** set last left and first right **/
            this.listOfFixedLeftColumnChanges$.subscribe(listOfFixedLeft => {
                listOfFixedLeft.forEach(cell => cell.setIsLastLeft(cell === listOfFixedLeft[listOfFixedLeft.length - 1]));
            });
            this.listOfFixedRightColumnChanges$.subscribe(listOfFixedRight => {
                listOfFixedRight.forEach(cell => cell.setIsFirstRight(cell === listOfFixedRight[0]));
            });
            /** calculate fixed nzLeft and nzRight **/
            combineLatest([this.nzTableStyleService.listOfListOfThWidth$, this.listOfFixedLeftColumnChanges$])
                .pipe(takeUntil(this.destroy$))
                .subscribe(([listOfAutoWidth, listOfLeftCell]) => {
                listOfLeftCell.forEach((cell, index) => {
                    if (cell.isAutoLeft) {
                        const currentArray = listOfLeftCell.slice(0, index);
                        const count = currentArray.reduce((pre, cur) => pre + (cur.colspan || cur.colSpan || 1), 0);
                        const width = listOfAutoWidth.slice(0, count).reduce((pre, cur) => pre + cur, 0);
                        cell.setAutoLeftWidth(`${width}px`);
                    }
                });
            });
            combineLatest([this.nzTableStyleService.listOfListOfThWidth$, this.listOfFixedRightColumnChanges$])
                .pipe(takeUntil(this.destroy$))
                .subscribe(([listOfAutoWidth, listOfRightCell]) => {
                listOfRightCell.forEach((_, index) => {
                    const cell = listOfRightCell[listOfRightCell.length - index - 1];
                    if (cell.isAutoRight) {
                        const currentArray = listOfRightCell.slice(listOfRightCell.length - index, listOfRightCell.length);
                        const count = currentArray.reduce((pre, cur) => pre + (cur.colspan || cur.colSpan || 1), 0);
                        const width = listOfAutoWidth
                            .slice(listOfAutoWidth.length - count, listOfAutoWidth.length)
                            .reduce((pre, cur) => pre + cur, 0);
                        cell.setAutoRightWidth(`${width}px`);
                    }
                });
            });
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTrDirective, isStandalone: true, selector: "tr:not([mat-row]):not([mat-header-row]):not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])", host: { properties: { "class.ant-table-row": "isInsideTable" } }, queries: [{ propertyName: "listOfNzThDirective", predicate: NzThMeasureDirective }, { propertyName: "listOfCellFixedDirective", predicate: NzCellFixedDirective }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'tr:not([mat-row]):not([mat-header-row]):not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])',
                    host: {
                        '[class.ant-table-row]': 'isInsideTable'
                    }
                }]
        }], propDecorators: { listOfNzThDirective: [{
                type: ContentChildren,
                args: [NzThMeasureDirective]
            }], listOfCellFixedDirective: [{
                type: ContentChildren,
                args: [NzCellFixedDirective]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* eslint-disable @angular-eslint/component-selector */
class NzTheadComponent {
    elementRef;
    renderer;
    destroy$ = new Subject();
    isInsideTable = false;
    templateRef;
    listOfNzTrDirective;
    listOfNzThAddOnComponent;
    nzSortOrderChange = new EventEmitter();
    nzTableStyleService = inject(NzTableStyleService, { optional: true });
    nzTableDataService = inject(NzTableDataService, { optional: true });
    constructor(elementRef, renderer) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.isInsideTable = !!this.nzTableStyleService;
    }
    ngOnInit() {
        if (this.nzTableStyleService) {
            this.nzTableStyleService.setTheadTemplate(this.templateRef);
        }
    }
    ngAfterContentInit() {
        if (this.nzTableStyleService) {
            const firstTableRow$ = this.listOfNzTrDirective.changes.pipe(startWith(this.listOfNzTrDirective), map(item => item && item.first));
            const listOfColumnsChanges$ = firstTableRow$.pipe(switchMap(firstTableRow => (firstTableRow ? firstTableRow.listOfColumnsChanges$ : EMPTY)), takeUntil(this.destroy$));
            listOfColumnsChanges$.subscribe(data => this.nzTableStyleService.setListOfTh(data));
            /** TODO: need reset the measure row when scrollX change **/
            this.nzTableStyleService.enableAutoMeasure$
                .pipe(switchMap(enable => (enable ? listOfColumnsChanges$ : of([]))))
                .pipe(takeUntil(this.destroy$))
                .subscribe(data => this.nzTableStyleService.setListOfMeasureColumn(data));
            const listOfFixedLeftColumnChanges$ = firstTableRow$.pipe(switchMap(firstTr => (firstTr ? firstTr.listOfFixedLeftColumnChanges$ : EMPTY)), takeUntil(this.destroy$));
            const listOfFixedRightColumnChanges$ = firstTableRow$.pipe(switchMap(firstTr => (firstTr ? firstTr.listOfFixedRightColumnChanges$ : EMPTY)), takeUntil(this.destroy$));
            listOfFixedLeftColumnChanges$.subscribe(listOfFixedLeftColumn => {
                this.nzTableStyleService.setHasFixLeft(listOfFixedLeftColumn.length !== 0);
            });
            listOfFixedRightColumnChanges$.subscribe(listOfFixedRightColumn => {
                this.nzTableStyleService.setHasFixRight(listOfFixedRightColumn.length !== 0);
            });
        }
        if (this.nzTableDataService) {
            const listOfColumn$ = this.listOfNzThAddOnComponent.changes.pipe(startWith(this.listOfNzThAddOnComponent));
            const manualSort$ = listOfColumn$.pipe(switchMap(() => merge(...this.listOfNzThAddOnComponent.map(th => th.manualClickOrder$))), takeUntil(this.destroy$));
            manualSort$.subscribe((data) => {
                const emitValue = { key: data.nzColumnKey, value: data.sortOrder };
                this.nzSortOrderChange.emit(emitValue);
                if (data.nzSortFn && data.nzSortPriority === false) {
                    this.listOfNzThAddOnComponent.filter(th => th !== data).forEach(th => th.clearSortOrder());
                }
            });
            const listOfCalcOperator$ = listOfColumn$.pipe(switchMap(list => merge(...[listOfColumn$, ...list.map((c) => c.calcOperatorChange$)]).pipe(mergeMap(() => listOfColumn$))), map(list => list
                .filter(item => !!item.nzSortFn || !!item.nzFilterFn)
                .map(item => {
                const { nzSortFn, sortOrder, nzFilterFn, nzFilterValue, nzSortPriority, nzColumnKey } = item;
                return {
                    key: nzColumnKey,
                    sortFn: nzSortFn,
                    sortPriority: nzSortPriority,
                    sortOrder: sortOrder,
                    filterFn: nzFilterFn,
                    filterValue: nzFilterValue
                };
            })), 
            // TODO: after checked error here
            delay(0), takeUntil(this.destroy$));
            listOfCalcOperator$.subscribe(list => {
                this.nzTableDataService?.listOfCalcOperator$.next(list);
            });
        }
    }
    ngAfterViewInit() {
        if (this.nzTableStyleService) {
            this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), this.elementRef.nativeElement);
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTheadComponent, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTheadComponent, isStandalone: true, selector: "thead:not(.ant-table-thead)", outputs: { nzSortOrderChange: "nzSortOrderChange" }, queries: [{ propertyName: "listOfNzTrDirective", predicate: NzTrDirective, descendants: true }, { propertyName: "listOfNzThAddOnComponent", predicate: NzThAddOnComponent, descendants: true }], viewQueries: [{ propertyName: "templateRef", first: true, predicate: ["contentTemplate"], descendants: true, static: true }], ngImport: i0, template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
    @if (!isInsideTable) {
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTheadComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'thead:not(.ant-table-thead)',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
    @if (!isInsideTable) {
      <ng-template [ngTemplateOutlet]="contentTemplate"></ng-template>
    }
  `,
                    imports: [NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }], propDecorators: { templateRef: [{
                type: ViewChild,
                args: ['contentTemplate', { static: true }]
            }], listOfNzTrDirective: [{
                type: ContentChildren,
                args: [NzTrDirective, { descendants: true }]
            }], listOfNzThAddOnComponent: [{
                type: ContentChildren,
                args: [NzThAddOnComponent, { descendants: true }]
            }], nzSortOrderChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTrExpandDirective {
    nzExpand = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrExpandDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzTrExpandDirective, isStandalone: true, selector: "tr[nzExpand]", inputs: { nzExpand: "nzExpand" }, host: { properties: { "hidden": "!nzExpand" }, classAttribute: "ant-table-expanded-row" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTrExpandDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'tr[nzExpand]',
                    host: {
                        class: 'ant-table-expanded-row',
                        '[hidden]': `!nzExpand`
                    }
                }]
        }], propDecorators: { nzExpand: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTableModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzTableModule, imports: [NzTableComponent,
            NzThAddOnComponent,
            NzTableCellDirective,
            NzThMeasureDirective,
            NzTdAddOnComponent,
            NzTheadComponent,
            NzTbodyComponent,
            NzTrDirective,
            NzTrExpandDirective,
            NzTfootSummaryComponent,
            NzTableVirtualScrollDirective,
            NzCellFixedDirective,
            NzCustomColumnDirective,
            NzTableContentComponent,
            NzTableTitleFooterComponent,
            NzTableInnerDefaultComponent,
            NzTableInnerScrollComponent,
            NzTrMeasureComponent,
            NzRowIndentDirective,
            NzRowExpandButtonDirective,
            NzCellBreakWordDirective,
            NzCellAlignDirective,
            NzTableSortersComponent,
            NzTableFilterComponent,
            NzTableSelectionComponent,
            NzCellEllipsisDirective,
            NzFilterTriggerComponent,
            NzTableFixedRowComponent,
            NzThSelectionComponent], exports: [NzTableComponent,
            NzThAddOnComponent,
            NzTableCellDirective,
            NzThMeasureDirective,
            NzTdAddOnComponent,
            NzTheadComponent,
            NzTbodyComponent,
            NzTrDirective,
            NzTableVirtualScrollDirective,
            NzCellFixedDirective,
            NzCustomColumnDirective,
            NzFilterTriggerComponent,
            NzTrExpandDirective,
            NzTfootSummaryComponent,
            NzCellBreakWordDirective,
            NzCellAlignDirective,
            NzCellEllipsisDirective,
            NzTableFixedRowComponent,
            NzThSelectionComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableModule, imports: [NzTableComponent,
            NzThAddOnComponent,
            NzTdAddOnComponent,
            NzTbodyComponent,
            NzTableTitleFooterComponent,
            NzTableInnerScrollComponent,
            NzTableSortersComponent,
            NzTableFilterComponent,
            NzTableSelectionComponent,
            NzFilterTriggerComponent,
            NzThSelectionComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTableModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        NzTableComponent,
                        NzThAddOnComponent,
                        NzTableCellDirective,
                        NzThMeasureDirective,
                        NzTdAddOnComponent,
                        NzTheadComponent,
                        NzTbodyComponent,
                        NzTrDirective,
                        NzTrExpandDirective,
                        NzTfootSummaryComponent,
                        NzTableVirtualScrollDirective,
                        NzCellFixedDirective,
                        NzCustomColumnDirective,
                        NzTableContentComponent,
                        NzTableTitleFooterComponent,
                        NzTableInnerDefaultComponent,
                        NzTableInnerScrollComponent,
                        NzTrMeasureComponent,
                        NzRowIndentDirective,
                        NzRowExpandButtonDirective,
                        NzCellBreakWordDirective,
                        NzCellAlignDirective,
                        NzTableSortersComponent,
                        NzTableFilterComponent,
                        NzTableSelectionComponent,
                        NzCellEllipsisDirective,
                        NzFilterTriggerComponent,
                        NzTableFixedRowComponent,
                        NzThSelectionComponent
                    ],
                    exports: [
                        NzTableComponent,
                        NzThAddOnComponent,
                        NzTableCellDirective,
                        NzThMeasureDirective,
                        NzTdAddOnComponent,
                        NzTheadComponent,
                        NzTbodyComponent,
                        NzTrDirective,
                        NzTableVirtualScrollDirective,
                        NzCellFixedDirective,
                        NzCustomColumnDirective,
                        NzFilterTriggerComponent,
                        NzTrExpandDirective,
                        NzTfootSummaryComponent,
                        NzCellBreakWordDirective,
                        NzCellAlignDirective,
                        NzCellEllipsisDirective,
                        NzTableFixedRowComponent,
                        NzThSelectionComponent
                    ]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzCellAlignDirective, NzCellBreakWordDirective, NzCellEllipsisDirective, NzCellFixedDirective, NzCustomColumnDirective, NzFilterTriggerComponent, NzRowExpandButtonDirective, NzRowIndentDirective, NzTableCellDirective, NzTableComponent, NzTableContentComponent, NzTableDataService, NzTableFilterComponent, NzTableFixedRowComponent, NzTableInnerDefaultComponent, NzTableInnerScrollComponent, NzTableModule, NzTableSelectionComponent, NzTableSortersComponent, NzTableStyleService, NzTableTitleFooterComponent, NzTableVirtualScrollDirective, NzTbodyComponent, NzTdAddOnComponent, NzTfootSummaryComponent, NzThAddOnComponent, NzThMeasureDirective, NzThSelectionComponent, NzTheadComponent, NzTrDirective, NzTrExpandDirective, NzTrMeasureComponent };
//# sourceMappingURL=ng-zorro-antd-table.mjs.map
