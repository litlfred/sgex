/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnInit, TemplateRef } from '@angular/core';
import { NzTreeNode } from 'ng-zorro-antd/core/tree';
import { NzCascaderOption } from './typings';
import * as i0 from "@angular/core";
export declare class NzCascaderOptionComponent implements OnInit {
    private cdr;
    optionTemplate: TemplateRef<NzCascaderOption> | null;
    node: NzTreeNode;
    activated: boolean;
    highlightText: string;
    nzLabelProperty: string;
    columnIndex: number;
    expandIcon: string | TemplateRef<void>;
    dir: Direction;
    checkable?: boolean;
    readonly check: EventEmitter<void>;
    readonly nativeElement: HTMLElement;
    constructor(cdr: ChangeDetectorRef);
    ngOnInit(): void;
    get checked(): boolean;
    get halfChecked(): boolean;
    get disabled(): boolean;
    markForCheck(): void;
    onCheckboxClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCascaderOptionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCascaderOptionComponent, "[nz-cascader-option]", ["nzCascaderOption"], { "optionTemplate": { "alias": "optionTemplate"; "required": false; }; "node": { "alias": "node"; "required": false; }; "activated": { "alias": "activated"; "required": false; }; "highlightText": { "alias": "highlightText"; "required": false; }; "nzLabelProperty": { "alias": "nzLabelProperty"; "required": false; }; "columnIndex": { "alias": "columnIndex"; "required": false; }; "expandIcon": { "alias": "expandIcon"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "checkable": { "alias": "checkable"; "required": false; }; }, { "check": "check"; }, never, never, true, never>;
    static ngAcceptInputType_columnIndex: unknown;
    static ngAcceptInputType_checkable: unknown;
}
