/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzBreakpointEnum, NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzDescriptionsItemComponent } from './descriptions-item.component';
import { NzDescriptionsItemRenderProps, NzDescriptionsLayout, NzDescriptionsSize } from './typings';
import * as i0 from "@angular/core";
export declare class NzDescriptionsComponent implements OnChanges, OnDestroy, AfterContentInit, OnInit {
    nzConfigService: NzConfigService;
    private cdr;
    private breakpointService;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    items: QueryList<NzDescriptionsItemComponent>;
    nzBordered: boolean;
    nzLayout: NzDescriptionsLayout;
    nzColumn: number | Record<NzBreakpointEnum, number>;
    nzSize: NzDescriptionsSize;
    nzTitle: string | TemplateRef<void>;
    nzExtra?: string | TemplateRef<void>;
    nzColon: boolean;
    itemMatrix: NzDescriptionsItemRenderProps[][];
    realColumn: number;
    dir: Direction;
    private breakpoint;
    private destroy$;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, breakpointService: NzBreakpointService, directionality: Directionality);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /**
     * Prepare the render matrix according to description items' spans.
     */
    private prepareMatrix;
    private getColumn;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzDescriptionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzDescriptionsComponent, "nz-descriptions", ["nzDescriptions"], { "nzBordered": { "alias": "nzBordered"; "required": false; }; "nzLayout": { "alias": "nzLayout"; "required": false; }; "nzColumn": { "alias": "nzColumn"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzExtra": { "alias": "nzExtra"; "required": false; }; "nzColon": { "alias": "nzColon"; "required": false; }; }, {}, ["items"], never, true, never>;
    static ngAcceptInputType_nzBordered: unknown;
    static ngAcceptInputType_nzColon: unknown;
}
