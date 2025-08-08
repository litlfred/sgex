/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, OnDestroy, OnInit, QueryList, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NgStyleInterface, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { NzCardGridDirective } from './card-grid.directive';
import { NzCardTabComponent } from './card-tab.component';
import * as i0 from "@angular/core";
export declare class NzCardComponent implements OnDestroy, OnInit {
    nzConfigService: NzConfigService;
    private cdr;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzBordered: boolean;
    nzLoading: boolean;
    nzHoverable: boolean;
    nzBodyStyle: NgStyleInterface | null;
    nzCover?: TemplateRef<void>;
    nzActions: Array<TemplateRef<void>>;
    nzType: string | 'inner' | null;
    nzSize: NzSizeDSType;
    nzTitle?: string | TemplateRef<void>;
    nzExtra?: string | TemplateRef<void>;
    listOfNzCardTabComponent?: NzCardTabComponent;
    listOfNzCardGridDirective: QueryList<NzCardGridDirective>;
    dir: Direction;
    private destroy$;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCardComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCardComponent, "nz-card", ["nzCard"], { "nzBordered": { "alias": "nzBordered"; "required": false; }; "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzHoverable": { "alias": "nzHoverable"; "required": false; }; "nzBodyStyle": { "alias": "nzBodyStyle"; "required": false; }; "nzCover": { "alias": "nzCover"; "required": false; }; "nzActions": { "alias": "nzActions"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzExtra": { "alias": "nzExtra"; "required": false; }; }, {}, ["listOfNzCardTabComponent", "listOfNzCardGridDirective"], ["*"], true, never>;
    static ngAcceptInputType_nzBordered: unknown;
    static ngAcceptInputType_nzLoading: unknown;
    static ngAcceptInputType_nzHoverable: unknown;
}
