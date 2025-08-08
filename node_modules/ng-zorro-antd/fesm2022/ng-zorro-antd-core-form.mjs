import * as i0 from '@angular/core';
import { Injectable, Input, ChangeDetectionStrategy, ViewEncapsulation, Component, NgModule } from '@angular/core';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import * as i1 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzFormStatusService {
    formStatusChanges = new ReplaySubject(1);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormStatusService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormStatusService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormStatusService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Used in input-group/input-number-group to make sure components in addon work well
class NzFormNoStatusService {
    noFormStatus = new BehaviorSubject(false);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormNoStatusService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormNoStatusService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormNoStatusService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const iconTypeMap = {
    error: 'close-circle-fill',
    validating: 'loading',
    success: 'check-circle-fill',
    warning: 'exclamation-circle-fill'
};
class NzFormItemFeedbackIconComponent {
    cdr;
    status = '';
    constructor(cdr) {
        this.cdr = cdr;
    }
    iconType = null;
    ngOnChanges(_changes) {
        this.updateIcon();
    }
    updateIcon() {
        this.iconType = this.status ? iconTypeMap[this.status] : null;
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormItemFeedbackIconComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzFormItemFeedbackIconComponent, isStandalone: true, selector: "nz-form-item-feedback-icon", inputs: { status: "status" }, host: { properties: { "class.ant-form-item-feedback-icon-error": "status===\"error\"", "class.ant-form-item-feedback-icon-warning": "status===\"warning\"", "class.ant-form-item-feedback-icon-success": "status===\"success\"", "class.ant-form-item-feedback-icon-validating": "status===\"validating\"" }, classAttribute: "ant-form-item-feedback-icon" }, exportAs: ["nzFormFeedbackIcon"], usesOnChanges: true, ngImport: i0, template: `
    @if (iconType) {
      <nz-icon [nzType]="iconType" />
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i1.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormItemFeedbackIconComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-form-item-feedback-icon',
                    exportAs: 'nzFormFeedbackIcon',
                    imports: [NzIconModule],
                    preserveWhitespaces: false,
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (iconType) {
      <nz-icon [nzType]="iconType" />
    }
  `,
                    host: {
                        class: 'ant-form-item-feedback-icon',
                        '[class.ant-form-item-feedback-icon-error]': 'status==="error"',
                        '[class.ant-form-item-feedback-icon-warning]': 'status==="warning"',
                        '[class.ant-form-item-feedback-icon-success]': 'status==="success"',
                        '[class.ant-form-item-feedback-icon-validating]': 'status==="validating"'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { status: [{
                type: Input
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * @deprecated Will be removed in v20. Use `NzFormItemFeedbackIconComponent` directly
 */
class NzFormPatchModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormPatchModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzFormPatchModule, imports: [NzFormItemFeedbackIconComponent], exports: [NzFormItemFeedbackIconComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormPatchModule, imports: [NzFormItemFeedbackIconComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzFormPatchModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzFormItemFeedbackIconComponent],
                    exports: [NzFormItemFeedbackIconComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzFormItemFeedbackIconComponent, NzFormNoStatusService, NzFormPatchModule, NzFormStatusService };
//# sourceMappingURL=ng-zorro-antd-core-form.mjs.map
