/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef, EventEmitter, NgZone, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzTreeNodeComponent } from './node';
import * as i0 from "@angular/core";
export declare class NzTreeNodeOptionComponent<T> implements OnChanges, OnInit {
    private ngZone;
    private host;
    private destroy$;
    private treeNode;
    nzSelected: boolean;
    nzDisabled: boolean;
    readonly nzClick: EventEmitter<MouseEvent>;
    constructor(ngZone: NgZone, host: ElementRef<HTMLElement>, destroy$: NzDestroyService, treeNode: NzTreeNodeComponent<T>);
    get isExpanded(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTreeNodeOptionComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTreeNodeOptionComponent<any>, "nz-tree-node-option", never, { "nzSelected": { "alias": "nzSelected"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; }, { "nzClick": "nzClick"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzSelected: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
}
