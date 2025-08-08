/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ThemeType } from '@ant-design/icons-angular';
import { NzTSType } from 'ng-zorro-antd/core/types';
import { NzLabelAlignType } from './form.directive';
import * as i0 from "@angular/core";
export interface NzFormTooltipIcon {
    type: NzTSType;
    theme: ThemeType;
}
export declare class NzFormLabelComponent implements OnDestroy {
    private cdr;
    nzFor?: string;
    nzRequired: boolean;
    set nzNoColon(value: boolean);
    get nzNoColon(): boolean;
    private noColon;
    nzTooltipTitle?: NzTSType;
    set nzTooltipIcon(value: string | NzFormTooltipIcon);
    get tooltipIcon(): NzFormTooltipIcon;
    private _tooltipIcon;
    set nzLabelAlign(value: NzLabelAlignType);
    get nzLabelAlign(): NzLabelAlignType;
    private labelAlign;
    set nzLabelWrap(value: boolean);
    get nzLabelWrap(): boolean;
    private labelWrap;
    private destroy$;
    private nzFormDirective;
    constructor(cdr: ChangeDetectorRef);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFormLabelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzFormLabelComponent, "nz-form-label", ["nzFormLabel"], { "nzFor": { "alias": "nzFor"; "required": false; }; "nzRequired": { "alias": "nzRequired"; "required": false; }; "nzNoColon": { "alias": "nzNoColon"; "required": false; }; "nzTooltipTitle": { "alias": "nzTooltipTitle"; "required": false; }; "nzTooltipIcon": { "alias": "nzTooltipIcon"; "required": false; }; "nzLabelAlign": { "alias": "nzLabelAlign"; "required": false; }; "nzLabelWrap": { "alias": "nzLabelWrap"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzRequired: unknown;
    static ngAcceptInputType_nzNoColon: unknown;
    static ngAcceptInputType_nzLabelWrap: unknown;
}
