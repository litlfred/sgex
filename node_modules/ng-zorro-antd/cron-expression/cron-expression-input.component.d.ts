/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter } from '@angular/core';
import { CronChangeType, TimeType } from './typings';
import * as i0 from "@angular/core";
export declare class NzCronExpressionInputComponent {
    value: string;
    label: TimeType;
    disabled: boolean;
    readonly focusEffect: EventEmitter<keyof import("./typings").Cron>;
    readonly blurEffect: EventEmitter<void>;
    readonly getValue: EventEmitter<CronChangeType>;
    focusInputEffect(event: FocusEvent): void;
    blurInputEffect(): void;
    setValue(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCronExpressionInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCronExpressionInputComponent, "nz-cron-expression-input", ["nzCronExpressionInput"], { "value": { "alias": "value"; "required": false; }; "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "focusEffect": "focusEffect"; "blurEffect": "blurEffect"; "getValue": "getValue"; }, never, never, true, never>;
    static ngAcceptInputType_disabled: unknown;
}
