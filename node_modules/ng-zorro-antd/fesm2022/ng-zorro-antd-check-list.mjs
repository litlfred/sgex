import * as i0 from '@angular/core';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, input, output, signal, computed, linkedSignal, inject, NgModule } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import * as i3 from 'ng-zorro-antd/core/outlet';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i1$1 from 'ng-zorro-antd/popover';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { DecimalPipe } from '@angular/common';
import * as i8 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import * as i5 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i4 from 'ng-zorro-antd/checkbox';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import * as i2 from 'ng-zorro-antd/progress';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import * as i6 from 'ng-zorro-antd/core/transition-patch';
import * as i7 from 'ng-zorro-antd/core/wave';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckListButtonComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.2", type: NzCheckListButtonComponent, isStandalone: true, selector: "nz-check-list-button", host: { classAttribute: "ant-btn ant-btn-primary ant-check-list-button" }, ngImport: i0, template: `<ng-content></ng-content>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-check-list-button',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    template: `<ng-content></ng-content>`,
                    host: {
                        class: 'ant-btn ant-btn-primary ant-check-list-button'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckListContentComponent {
    locale = input.required();
    items = input([]);
    index = input(0);
    progress = input(true);
    title = input(null);
    footer = input(null);
    closePopover = output();
    hide = output();
    checked = false;
    visible = signal(true);
    progressPercent = computed(() => {
        const index = Math.min(Math.max(this.index() - 1, 0), this.items().length);
        return (index / this.items().length) * 100;
    });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListContentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCheckListContentComponent, isStandalone: true, selector: "nz-check-list-content", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: true, transformFunction: null }, items: { classPropertyName: "items", publicName: "items", isSignal: true, isRequired: false, transformFunction: null }, index: { classPropertyName: "index", publicName: "index", isSignal: true, isRequired: false, transformFunction: null }, progress: { classPropertyName: "progress", publicName: "progress", isSignal: true, isRequired: false, transformFunction: null }, title: { classPropertyName: "title", publicName: "title", isSignal: true, isRequired: false, transformFunction: null }, footer: { classPropertyName: "footer", publicName: "footer", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { closePopover: "closePopover", hide: "hide" }, host: { classAttribute: "ant-check-list-content" }, ngImport: i0, template: `
    @let i18n = locale();
    @if (visible()) {
      @if (progressPercent() === 100) {
        <div class="ant-check-list-header-finish">
          <nz-icon nzType="check-circle" nzTheme="outline" class="ant-check-list-header-finish-icon" />
          <h3 class="ant-check-list-header-finish-title">{{ i18n.checkListFinish }}</h3>
          <button nz-button nzType="primary" [style.margin.px]="24" (click)="closePopover.emit(false)">
            {{ i18n.checkListClose }}
          </button>
        </div>
      } @else {
        <div class="ant-check-list-header">
          <div class="ant-check-list-header-title">
            @if (!!title()) {
              <ng-container *nzStringTemplateOutlet="title()">{{ title() }}</ng-container>
            } @else {
              {{ i18n.checkList }}
            }
          </div>
          <div class="ant-check-list-header-extra">
            <nz-icon nzType="down" nzTheme="outline" (click)="closePopover.emit(false)" />
          </div>
        </div>
        @if (progress()) {
          <div class="ant-check-list-progressBar">
            <div class="ant-check-list-progressBar-progress">
              <nz-progress [nzPercent]="progressPercent() | number: '1.0-0'"></nz-progress>
            </div>
          </div>
        }
      }
      <div class="ant-check-list-steps-content">
        @for (item of items(); track item.key || item.description; let i = $index) {
          @let itemHighlight = index() === i + 1;
          @let itemChecked = index() > i + 1;
          <div
            class="ant-check-list-steps"
            [class.ant-check-list-highlight]="itemHighlight"
            [class.ant-check-list-checked]="itemChecked"
          >
            <div class="ant-check-list-steps-item">
              <div class="ant-check-list-steps-item-circle">
                @if (itemChecked) {
                  <nz-icon nzType="check" nzTheme="outline" class="ant-check-list-steps-checkoutlined" />
                } @else {
                  <div class="ant-check-list-steps-number">{{ i + 1 }}</div>
                }
              </div>
              <div class="ant-check-list-steps-item-description">{{ item.description }}</div>
            </div>
            @if (itemHighlight && !!item.onClick) {
              <nz-icon
                nzType="arrow-right"
                nzTheme="outline"
                class="ant-check-list-steps-item-arrows"
                (click)="item.onClick()"
              />
            }
          </div>
        }
      </div>
      <div class="ant-check-list-footer" (click)="visible.set(false)">
        @if (!!footer()) {
          <ng-container *nzStringTemplateOutlet="footer()">{{ footer() }}</ng-container>
        } @else {
          {{ i18n.checkListFooter }}
        }
      </div>
    } @else {
      <div class="ant-check-list-close-check">
        <div class="ant-check-list-close-check-title">{{ i18n.checkListCheck }}</div>
        <div class="ant-check-list-close-check-action">
          <button nz-button nzType="primary" (click)="visible.set(false); hide.emit(checked)">{{ i18n.ok }}</button>
          <button nz-button (click)="visible.set(true)">{{ i18n.cancel }}</button>
        </div>
        <div class="ant-check-list-close-check-other">
          <label nz-checkbox [(ngModel)]="checked">{{ i18n.checkListCheckOther }}</label>
        </div>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzProgressModule }, { kind: "component", type: i2.NzProgressComponent, selector: "nz-progress", inputs: ["nzShowInfo", "nzWidth", "nzStrokeColor", "nzSize", "nzFormat", "nzSuccessPercent", "nzPercent", "nzStrokeWidth", "nzGapDegree", "nzStatus", "nzType", "nzGapPosition", "nzStrokeLinecap", "nzSteps"], exportAs: ["nzProgress"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "ngmodule", type: NzCheckboxModule }, { kind: "component", type: i4.NzCheckboxComponent, selector: "[nz-checkbox]", inputs: ["nzValue", "nzAutoFocus", "nzDisabled", "nzIndeterminate", "nzChecked", "nzId", "nzName"], outputs: ["nzCheckedChange"], exportAs: ["nzCheckbox"] }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i5.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i6.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i7.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i8.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i8.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "pipe", type: DecimalPipe, name: "number" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListContentComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-check-list-content',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    imports: [NzIconModule, NzProgressModule, NzOutletModule, NzCheckboxModule, NzButtonModule, FormsModule, DecimalPipe],
                    template: `
    @let i18n = locale();
    @if (visible()) {
      @if (progressPercent() === 100) {
        <div class="ant-check-list-header-finish">
          <nz-icon nzType="check-circle" nzTheme="outline" class="ant-check-list-header-finish-icon" />
          <h3 class="ant-check-list-header-finish-title">{{ i18n.checkListFinish }}</h3>
          <button nz-button nzType="primary" [style.margin.px]="24" (click)="closePopover.emit(false)">
            {{ i18n.checkListClose }}
          </button>
        </div>
      } @else {
        <div class="ant-check-list-header">
          <div class="ant-check-list-header-title">
            @if (!!title()) {
              <ng-container *nzStringTemplateOutlet="title()">{{ title() }}</ng-container>
            } @else {
              {{ i18n.checkList }}
            }
          </div>
          <div class="ant-check-list-header-extra">
            <nz-icon nzType="down" nzTheme="outline" (click)="closePopover.emit(false)" />
          </div>
        </div>
        @if (progress()) {
          <div class="ant-check-list-progressBar">
            <div class="ant-check-list-progressBar-progress">
              <nz-progress [nzPercent]="progressPercent() | number: '1.0-0'"></nz-progress>
            </div>
          </div>
        }
      }
      <div class="ant-check-list-steps-content">
        @for (item of items(); track item.key || item.description; let i = $index) {
          @let itemHighlight = index() === i + 1;
          @let itemChecked = index() > i + 1;
          <div
            class="ant-check-list-steps"
            [class.ant-check-list-highlight]="itemHighlight"
            [class.ant-check-list-checked]="itemChecked"
          >
            <div class="ant-check-list-steps-item">
              <div class="ant-check-list-steps-item-circle">
                @if (itemChecked) {
                  <nz-icon nzType="check" nzTheme="outline" class="ant-check-list-steps-checkoutlined" />
                } @else {
                  <div class="ant-check-list-steps-number">{{ i + 1 }}</div>
                }
              </div>
              <div class="ant-check-list-steps-item-description">{{ item.description }}</div>
            </div>
            @if (itemHighlight && !!item.onClick) {
              <nz-icon
                nzType="arrow-right"
                nzTheme="outline"
                class="ant-check-list-steps-item-arrows"
                (click)="item.onClick()"
              />
            }
          </div>
        }
      </div>
      <div class="ant-check-list-footer" (click)="visible.set(false)">
        @if (!!footer()) {
          <ng-container *nzStringTemplateOutlet="footer()">{{ footer() }}</ng-container>
        } @else {
          {{ i18n.checkListFooter }}
        }
      </div>
    } @else {
      <div class="ant-check-list-close-check">
        <div class="ant-check-list-close-check-title">{{ i18n.checkListCheck }}</div>
        <div class="ant-check-list-close-check-action">
          <button nz-button nzType="primary" (click)="visible.set(false); hide.emit(checked)">{{ i18n.ok }}</button>
          <button nz-button (click)="visible.set(true)">{{ i18n.cancel }}</button>
        </div>
        <div class="ant-check-list-close-check-other">
          <label nz-checkbox [(ngModel)]="checked">{{ i18n.checkListCheckOther }}</label>
        </div>
      </div>
    }
  `,
                    host: {
                        class: 'ant-check-list-content'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckListComponent {
    nzItems = input([]);
    nzVisible = input(false);
    nzIndex = input(1);
    nzProgress = input(true);
    nzTriggerRender = input(null);
    nzTitle = input(null);
    nzFooter = input(null);
    nzHide = output();
    visible = linkedSignal(this.nzVisible);
    i18n = inject(NzI18nService);
    locale = toSignal(this.i18n.localeChange.pipe(map(() => this.i18n.getLocaleData('CheckList'))), { requireSync: true });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCheckListComponent, isStandalone: true, selector: "nz-check-list", inputs: { nzItems: { classPropertyName: "nzItems", publicName: "nzItems", isSignal: true, isRequired: false, transformFunction: null }, nzVisible: { classPropertyName: "nzVisible", publicName: "nzVisible", isSignal: true, isRequired: false, transformFunction: null }, nzIndex: { classPropertyName: "nzIndex", publicName: "nzIndex", isSignal: true, isRequired: false, transformFunction: null }, nzProgress: { classPropertyName: "nzProgress", publicName: "nzProgress", isSignal: true, isRequired: false, transformFunction: null }, nzTriggerRender: { classPropertyName: "nzTriggerRender", publicName: "nzTriggerRender", isSignal: true, isRequired: false, transformFunction: null }, nzTitle: { classPropertyName: "nzTitle", publicName: "nzTitle", isSignal: true, isRequired: false, transformFunction: null }, nzFooter: { classPropertyName: "nzFooter", publicName: "nzFooter", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { nzHide: "nzHide" }, host: { classAttribute: "ant-check-list" }, ngImport: i0, template: `
    <nz-check-list-button
      nz-popover
      [nzPopoverContent]="checklistTemplate"
      nzPopoverTrigger="click"
      nzPopoverPlacement="topRight"
      [nzPopoverOverlayClickable]="false"
      [nzPopoverVisible]="visible()"
      (nzPopoverVisibleChange)="visible.set($event)"
    >
      @if (!!nzTriggerRender()) {
        <ng-container *nzStringTemplateOutlet="nzTriggerRender()">{{ nzTriggerRender() }}</ng-container>
      } @else {
        <nz-icon nzType="check-circle" nzTheme="outline" class="ant-check-list-icon" />
        <div class="ant-check-list-description">{{ locale().checkList }}</div>
      }
    </nz-check-list-button>
    <ng-template #checklistTemplate>
      <nz-check-list-content
        [locale]="locale()"
        [items]="nzItems()"
        [index]="nzIndex()"
        [title]="nzTitle()"
        [progress]="nzProgress()"
        [footer]="nzFooter()"
        (closePopover)="visible.set($event)"
        (hide)="visible.set($event); nzHide.emit($event)"
      ></nz-check-list-content>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzPopoverModule }, { kind: "directive", type: i1$1.NzPopoverDirective, selector: "[nz-popover]", inputs: ["nzPopoverArrowPointAtCenter", "nzPopoverTitle", "nzPopoverContent", "nz-popover", "nzPopoverTrigger", "nzPopoverPlacement", "nzPopoverOrigin", "nzPopoverVisible", "nzPopoverMouseEnterDelay", "nzPopoverMouseLeaveDelay", "nzPopoverOverlayClassName", "nzPopoverOverlayStyle", "nzPopoverOverlayClickable", "nzPopoverBackdrop"], outputs: ["nzPopoverVisibleChange"], exportAs: ["nzPopover"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzOutletModule }, { kind: "directive", type: i3.NzStringTemplateOutletDirective, selector: "[nzStringTemplateOutlet]", inputs: ["nzStringTemplateOutletContext", "nzStringTemplateOutlet"], exportAs: ["nzStringTemplateOutlet"] }, { kind: "component", type: NzCheckListButtonComponent, selector: "nz-check-list-button" }, { kind: "component", type: NzCheckListContentComponent, selector: "nz-check-list-content", inputs: ["locale", "items", "index", "progress", "title", "footer"], outputs: ["closePopover", "hide"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-check-list',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    imports: [NzPopoverModule, NzIconModule, NzOutletModule, NzCheckListButtonComponent, NzCheckListContentComponent],
                    template: `
    <nz-check-list-button
      nz-popover
      [nzPopoverContent]="checklistTemplate"
      nzPopoverTrigger="click"
      nzPopoverPlacement="topRight"
      [nzPopoverOverlayClickable]="false"
      [nzPopoverVisible]="visible()"
      (nzPopoverVisibleChange)="visible.set($event)"
    >
      @if (!!nzTriggerRender()) {
        <ng-container *nzStringTemplateOutlet="nzTriggerRender()">{{ nzTriggerRender() }}</ng-container>
      } @else {
        <nz-icon nzType="check-circle" nzTheme="outline" class="ant-check-list-icon" />
        <div class="ant-check-list-description">{{ locale().checkList }}</div>
      }
    </nz-check-list-button>
    <ng-template #checklistTemplate>
      <nz-check-list-content
        [locale]="locale()"
        [items]="nzItems()"
        [index]="nzIndex()"
        [title]="nzTitle()"
        [progress]="nzProgress()"
        [footer]="nzFooter()"
        (closePopover)="visible.set($event)"
        (hide)="visible.set($event); nzHide.emit($event)"
      ></nz-check-list-content>
    </ng-template>
  `,
                    host: {
                        class: 'ant-check-list'
                    }
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCheckListModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListModule, imports: [NzCheckListComponent], exports: [NzCheckListComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListModule, imports: [NzCheckListComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCheckListModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCheckListComponent],
                    exports: [NzCheckListComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzCheckListComponent, NzCheckListModule };
//# sourceMappingURL=ng-zorro-antd-check-list.mjs.map
