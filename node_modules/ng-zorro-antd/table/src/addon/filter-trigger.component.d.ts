/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef, ElementRef, EventEmitter, OnInit } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import * as i0 from "@angular/core";
export declare class NzFilterTriggerComponent implements OnInit {
    readonly nzConfigService: NzConfigService;
    private cdr;
    private destroy$;
    readonly _nzModuleName: NzConfigKey;
    nzActive: boolean;
    nzDropdownMenu: NzDropdownMenuComponent;
    nzVisible: boolean;
    nzBackdrop: boolean;
    readonly nzVisibleChange: EventEmitter<boolean>;
    nzDropdown: ElementRef<HTMLElement>;
    onVisibleChange(visible: boolean): void;
    hide(): void;
    show(): void;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, destroy$: NzDestroyService);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFilterTriggerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzFilterTriggerComponent, "nz-filter-trigger", ["nzFilterTrigger"], { "nzActive": { "alias": "nzActive"; "required": false; }; "nzDropdownMenu": { "alias": "nzDropdownMenu"; "required": false; }; "nzVisible": { "alias": "nzVisible"; "required": false; }; "nzBackdrop": { "alias": "nzBackdrop"; "required": false; }; }, { "nzVisibleChange": "nzVisibleChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzBackdrop: unknown;
}
