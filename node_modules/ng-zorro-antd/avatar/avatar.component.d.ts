/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef, EventEmitter, OnChanges } from '@angular/core';
import { NzConfigKey } from 'ng-zorro-antd/core/config';
import { NzShapeSCType, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzAvatarComponent implements OnChanges {
    readonly _nzModuleName: NzConfigKey;
    nzShape: NzShapeSCType;
    nzSize: NzSizeLDSType | number;
    nzGap: number;
    nzText?: string;
    nzSrc?: string;
    nzSrcSet?: string;
    nzAlt?: string;
    nzIcon?: string;
    readonly nzError: EventEmitter<Event>;
    hasText: boolean;
    hasSrc: boolean;
    hasIcon: boolean;
    customSize: string | null;
    textEl?: ElementRef<HTMLSpanElement>;
    private el;
    private cdr;
    constructor();
    imgError(event: Event): void;
    ngOnChanges(): void;
    private calcStringSize;
    private setSizeStyle;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzAvatarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzAvatarComponent, "nz-avatar", ["nzAvatar"], { "nzShape": { "alias": "nzShape"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzGap": { "alias": "nzGap"; "required": false; }; "nzText": { "alias": "nzText"; "required": false; }; "nzSrc": { "alias": "nzSrc"; "required": false; }; "nzSrcSet": { "alias": "nzSrcSet"; "required": false; }; "nzAlt": { "alias": "nzAlt"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; }, { "nzError": "nzError"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzGap: unknown;
}
