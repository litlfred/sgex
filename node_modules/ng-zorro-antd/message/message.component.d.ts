/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { NzMNComponent } from './base';
import { NzMessageData } from './typings';
import * as i0 from "@angular/core";
export declare class NzMessageComponent extends NzMNComponent implements OnInit, OnDestroy {
    instance: Required<NzMessageData>;
    readonly destroyed: EventEmitter<{
        id: string;
        userAction: boolean;
    }>;
    index?: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMessageComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzMessageComponent, "nz-message", ["nzMessage"], { "instance": { "alias": "instance"; "required": false; }; }, { "destroyed": "destroyed"; }, never, never, true, never>;
}
