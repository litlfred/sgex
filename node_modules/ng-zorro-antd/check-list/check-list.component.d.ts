/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import { NzCheckListI18nInterface } from 'ng-zorro-antd/i18n';
import { NzItemProps } from './typings';
import * as i0 from "@angular/core";
export declare class NzCheckListComponent {
    nzItems: import("@angular/core").InputSignal<NzItemProps[]>;
    nzVisible: import("@angular/core").InputSignal<boolean>;
    nzIndex: import("@angular/core").InputSignal<number>;
    nzProgress: import("@angular/core").InputSignal<boolean>;
    nzTriggerRender: import("@angular/core").InputSignal<string | TemplateRef<void> | null>;
    nzTitle: import("@angular/core").InputSignal<string | TemplateRef<void> | null>;
    nzFooter: import("@angular/core").InputSignal<string | TemplateRef<void> | null>;
    readonly nzHide: import("@angular/core").OutputEmitterRef<boolean>;
    protected visible: import("@angular/core").WritableSignal<boolean>;
    private i18n;
    locale: import("@angular/core").Signal<NzCheckListI18nInterface>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCheckListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCheckListComponent, "nz-check-list", never, { "nzItems": { "alias": "nzItems"; "required": false; "isSignal": true; }; "nzVisible": { "alias": "nzVisible"; "required": false; "isSignal": true; }; "nzIndex": { "alias": "nzIndex"; "required": false; "isSignal": true; }; "nzProgress": { "alias": "nzProgress"; "required": false; "isSignal": true; }; "nzTriggerRender": { "alias": "nzTriggerRender"; "required": false; "isSignal": true; }; "nzTitle": { "alias": "nzTitle"; "required": false; "isSignal": true; }; "nzFooter": { "alias": "nzFooter"; "required": false; "isSignal": true; }; }, { "nzHide": "nzHide"; }, never, never, true, never>;
}
