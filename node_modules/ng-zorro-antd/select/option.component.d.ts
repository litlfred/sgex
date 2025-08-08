/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnInit, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzOptionComponent implements OnChanges, OnInit {
    private destroy$;
    changes: Subject<void>;
    groupLabel?: string | number | TemplateRef<NzSafeAny> | null;
    template: TemplateRef<NzSafeAny>;
    nzTitle?: string | number | null;
    nzLabel: string | number | null;
    nzValue: NzSafeAny | null;
    nzKey?: string | number;
    nzDisabled: boolean;
    nzHide: boolean;
    nzCustomContent: boolean;
    private nzOptionGroupComponent;
    constructor(destroy$: NzDestroyService);
    ngOnInit(): void;
    ngOnChanges(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzOptionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzOptionComponent, "nz-option", ["nzOption"], { "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzLabel": { "alias": "nzLabel"; "required": false; }; "nzValue": { "alias": "nzValue"; "required": false; }; "nzKey": { "alias": "nzKey"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzHide": { "alias": "nzHide"; "required": false; }; "nzCustomContent": { "alias": "nzCustomContent"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzHide: unknown;
    static ngAcceptInputType_nzCustomContent: unknown;
}
