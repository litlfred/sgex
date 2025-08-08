/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzFloatButtonComponent implements OnInit, OnDestroy {
    private destroy$;
    private directionality;
    private cdr;
    nzHref: string | null;
    nzTarget: string | null;
    nzType: 'default' | 'primary';
    nzShape: 'circle' | 'square';
    nzIcon: TemplateRef<void> | null;
    nzDescription: TemplateRef<void> | string | null;
    readonly nzOnClick: EventEmitter<boolean>;
    dir: Direction;
    constructor(destroy$: NzDestroyService, directionality: Directionality, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFloatButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzFloatButtonComponent, "nz-float-button", ["nzFloatButton"], { "nzHref": { "alias": "nzHref"; "required": false; }; "nzTarget": { "alias": "nzTarget"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzShape": { "alias": "nzShape"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzDescription": { "alias": "nzDescription"; "required": false; }; }, { "nzOnClick": "nzOnClick"; }, never, never, true, never>;
}
