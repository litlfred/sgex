/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { AbstractControl, FormControlDirective, FormControlName, NgModel } from '@angular/forms';
import { NzFormStatusService } from 'ng-zorro-antd/core/form';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { NzFormControlStatusType } from './form-item.component';
import * as i0 from "@angular/core";
export declare class NzFormControlComponent implements OnChanges, OnDestroy, OnInit, AfterContentInit, OnDestroy {
    private cdr;
    private nzFormStatusService;
    private _hasFeedback;
    private validateChanges;
    private validateString;
    private destroyed$;
    private localeId;
    private autoErrorTip?;
    private get disableAutoTips();
    status: NzFormControlStatusType;
    validateControl: AbstractControl | NgModel | null;
    innerTip: string | TemplateRef<{
        $implicit: AbstractControl | NgModel;
    }> | null;
    defaultValidateControl?: FormControlName | FormControlDirective;
    nzSuccessTip?: string | TemplateRef<{
        $implicit: AbstractControl | NgModel;
    }>;
    nzWarningTip?: string | TemplateRef<{
        $implicit: AbstractControl | NgModel;
    }>;
    nzErrorTip?: string | TemplateRef<{
        $implicit: AbstractControl | NgModel;
    }>;
    nzValidatingTip?: string | TemplateRef<{
        $implicit: AbstractControl | NgModel;
    }>;
    nzExtra?: string | TemplateRef<void>;
    nzAutoTips: Record<string, Record<string, string>>;
    nzDisableAutoTips?: boolean;
    set nzHasFeedback(value: boolean);
    get nzHasFeedback(): boolean;
    set nzValidateStatus(value: string | AbstractControl | FormControlName | NgModel);
    private watchControl;
    private setStatus;
    private getControlStatus;
    private validateControlStatus;
    private getInnerTip;
    private updateAutoErrorTip;
    private subscribeAutoTips;
    private nzFormItemComponent;
    private nzFormDirective;
    constructor(cdr: ChangeDetectorRef, i18n: NzI18nService, nzFormStatusService: NzFormStatusService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFormControlComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzFormControlComponent, "nz-form-control", ["nzFormControl"], { "nzSuccessTip": { "alias": "nzSuccessTip"; "required": false; }; "nzWarningTip": { "alias": "nzWarningTip"; "required": false; }; "nzErrorTip": { "alias": "nzErrorTip"; "required": false; }; "nzValidatingTip": { "alias": "nzValidatingTip"; "required": false; }; "nzExtra": { "alias": "nzExtra"; "required": false; }; "nzAutoTips": { "alias": "nzAutoTips"; "required": false; }; "nzDisableAutoTips": { "alias": "nzDisableAutoTips"; "required": false; }; "nzHasFeedback": { "alias": "nzHasFeedback"; "required": false; }; "nzValidateStatus": { "alias": "nzValidateStatus"; "required": false; }; }, {}, ["defaultValidateControl"], ["*"], true, never>;
    static ngAcceptInputType_nzDisableAutoTips: unknown;
    static ngAcceptInputType_nzHasFeedback: unknown;
}
