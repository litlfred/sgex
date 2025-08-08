/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnInit } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzTreeNodeCheckboxComponent implements OnInit {
    private ngZone;
    private ref;
    private host;
    private destroy$;
    nzChecked?: boolean;
    nzIndeterminate?: boolean;
    nzDisabled?: boolean;
    readonly nzClick: EventEmitter<MouseEvent>;
    constructor(ngZone: NgZone, ref: ChangeDetectorRef, host: ElementRef<HTMLElement>, destroy$: NzDestroyService);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeCheckboxComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeNodeCheckboxComponent, "nz-tree-node-checkbox:not([builtin])", never, { "nzChecked": { "alias": "nzChecked"; "required": false; }; "nzIndeterminate": { "alias": "nzIndeterminate"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; }, { "nzClick": "nzClick"; }, never, never, true, never>;
    static ngAcceptInputType_nzChecked: unknown;
    static ngAcceptInputType_nzIndeterminate: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
}
