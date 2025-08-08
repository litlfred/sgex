/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzCollapsePanelComponent implements OnInit, OnDestroy {
    nzConfigService: NzConfigService;
    private ngZone;
    private cdr;
    private destroy$;
    readonly _nzModuleName: NzConfigKey;
    nzActive: boolean;
    nzDisabled: boolean;
    nzShowArrow: boolean;
    nzExtra?: string | TemplateRef<void>;
    nzHeader?: string | TemplateRef<void>;
    nzExpandedIcon?: string | TemplateRef<void>;
    readonly nzActiveChange: EventEmitter<boolean>;
    collapseHeader: ElementRef<HTMLElement>;
    markForCheck(): void;
    private nzCollapseComponent;
    noAnimation: NzNoAnimationDirective | null;
    constructor(nzConfigService: NzConfigService, ngZone: NgZone, cdr: ChangeDetectorRef, destroy$: NzDestroyService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCollapsePanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCollapsePanelComponent, "nz-collapse-panel", ["nzCollapsePanel"], { "nzActive": { "alias": "nzActive"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzShowArrow": { "alias": "nzShowArrow"; "required": false; }; "nzExtra": { "alias": "nzExtra"; "required": false; }; "nzHeader": { "alias": "nzHeader"; "required": false; }; "nzExpandedIcon": { "alias": "nzExpandedIcon"; "required": false; }; }, { "nzActiveChange": "nzActiveChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzActive: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzShowArrow: unknown;
}
