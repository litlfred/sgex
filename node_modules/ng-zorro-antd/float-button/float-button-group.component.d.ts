/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ChangeDetectorRef, EventEmitter, OnInit, QueryList, TemplateRef } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzFloatButtonTopComponent } from './float-button-top.component';
import { NzFloatButtonComponent } from './float-button.component';
import * as i0 from "@angular/core";
export declare class NzFloatButtonGroupComponent implements OnInit, AfterContentInit {
    private destroy$;
    private directionality;
    private cdr;
    nzFloatButtonComponent: QueryList<NzFloatButtonComponent>;
    nzFloatButtonTopComponents: QueryList<NzFloatButtonTopComponent>;
    nzHref: string | null;
    nzTarget: string | null;
    nzType: 'default' | 'primary';
    nzIcon: TemplateRef<void> | null;
    nzDescription: TemplateRef<void> | null;
    nzShape: 'circle' | 'square';
    nzTrigger: 'click' | 'hover' | null;
    nzOpen: boolean | null;
    readonly nzOnOpenChange: EventEmitter<boolean>;
    isOpen: boolean;
    dir: Direction;
    constructor(destroy$: NzDestroyService, directionality: Directionality, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    clickOpenMenu(): void;
    hoverOpenMenu(): void;
    clickCloseMenu(): void;
    hoverCloseMenu(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFloatButtonGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzFloatButtonGroupComponent, "nz-float-button-group", ["nzFloatButtonGroup"], { "nzHref": { "alias": "nzHref"; "required": false; }; "nzTarget": { "alias": "nzTarget"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzDescription": { "alias": "nzDescription"; "required": false; }; "nzShape": { "alias": "nzShape"; "required": false; }; "nzTrigger": { "alias": "nzTrigger"; "required": false; }; "nzOpen": { "alias": "nzOpen"; "required": false; }; }, { "nzOnOpenChange": "nzOnOpenChange"; }, ["nzFloatButtonComponent", "nzFloatButtonTopComponents"], ["*"], true, never>;
}
