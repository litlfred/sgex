import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, QueryList, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzSpaceAlign, NzSpaceDirection, NzSpaceSize } from './types';
import * as i0 from "@angular/core";
export declare class NzSpaceComponent implements OnChanges, OnDestroy, AfterContentInit {
    nzConfigService: NzConfigService;
    private cdr;
    readonly _nzModuleName: NzConfigKey;
    nzDirection: NzSpaceDirection;
    nzAlign?: NzSpaceAlign;
    nzSplit: TemplateRef<{
        $implicit: number;
    }> | string | null;
    nzWrap: boolean;
    nzSize: NzSpaceSize;
    items: QueryList<TemplateRef<NzSafeAny>>;
    mergedAlign?: NzSpaceAlign;
    spaceSize: number;
    private destroy$;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef);
    private updateSpaceItems;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSpaceComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSpaceComponent, "nz-space, [nz-space]", ["nzSpace"], { "nzDirection": { "alias": "nzDirection"; "required": false; }; "nzAlign": { "alias": "nzAlign"; "required": false; }; "nzSplit": { "alias": "nzSplit"; "required": false; }; "nzWrap": { "alias": "nzWrap"; "required": false; }; "nzSize": { "alias": "nzSize"; "required": false; }; }, {}, ["items"], ["*"], true, never>;
    static ngAcceptInputType_nzWrap: unknown;
}
