/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, EventEmitter, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { NzModeType } from './typings';
import * as i0 from "@angular/core";
export declare class NzHashCodeComponent implements OnChanges {
    private cdr;
    nzValue: string;
    nzTitle: string;
    nzLogo: TemplateRef<void> | string;
    nzMode: NzModeType;
    nzType: 'default' | 'primary';
    readonly nzOnCopy: EventEmitter<string>;
    hashDataList: string[];
    copyHandle(): void;
    constructor(cdr: ChangeDetectorRef);
    ngOnChanges(changes: SimpleChanges): void;
    setData(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzHashCodeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzHashCodeComponent, "nz-hash-code", ["nzHashCode"], { "nzValue": { "alias": "nzValue"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzLogo": { "alias": "nzLogo"; "required": false; }; "nzMode": { "alias": "nzMode"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; }, { "nzOnCopy": "nzOnCopy"; }, never, never, true, never>;
}
