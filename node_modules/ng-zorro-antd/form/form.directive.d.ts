/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { OnChanges, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ThemeType } from '@ant-design/icons-angular';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { InputObservable } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export type NzFormLayoutType = 'horizontal' | 'vertical' | 'inline';
export type NzLabelAlignType = 'left' | 'right';
export declare const DefaultTooltipIcon: {
    readonly type: "question-circle";
    readonly theme: "outline";
};
export declare class NzFormDirective implements OnChanges, OnDestroy, InputObservable {
    nzConfigService: NzConfigService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzLayout: NzFormLayoutType;
    nzNoColon: boolean;
    nzAutoTips: Record<string, Record<string, string>>;
    nzDisableAutoTips: boolean;
    nzTooltipIcon: string | {
        type: string;
        theme: ThemeType;
    };
    nzLabelAlign: NzLabelAlignType;
    nzLabelWrap: boolean;
    dir: Direction;
    destroy$: Subject<boolean>;
    private inputChanges$;
    getInputObservable<K extends keyof this>(changeType: K): Observable<SimpleChange>;
    constructor(nzConfigService: NzConfigService, directionality: Directionality);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFormDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzFormDirective, "[nz-form]", ["nzForm"], { "nzLayout": { "alias": "nzLayout"; "required": false; }; "nzNoColon": { "alias": "nzNoColon"; "required": false; }; "nzAutoTips": { "alias": "nzAutoTips"; "required": false; }; "nzDisableAutoTips": { "alias": "nzDisableAutoTips"; "required": false; }; "nzTooltipIcon": { "alias": "nzTooltipIcon"; "required": false; }; "nzLabelAlign": { "alias": "nzLabelAlign"; "required": false; }; "nzLabelWrap": { "alias": "nzLabelWrap"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzNoColon: unknown;
    static ngAcceptInputType_nzDisableAutoTips: unknown;
    static ngAcceptInputType_nzLabelWrap: unknown;
}
