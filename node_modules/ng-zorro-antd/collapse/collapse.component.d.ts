/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, OnInit } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzCollapsePanelComponent } from './collapse-panel.component';
import * as i0 from "@angular/core";
export declare class NzCollapseComponent implements OnInit {
    nzConfigService: NzConfigService;
    private cdr;
    private directionality;
    private destroy$;
    readonly _nzModuleName: NzConfigKey;
    nzAccordion: boolean;
    nzBordered: boolean;
    nzGhost: boolean;
    nzExpandIconPosition: 'start' | 'end';
    dir: Direction;
    private listOfNzCollapsePanelComponent;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality, destroy$: NzDestroyService);
    ngOnInit(): void;
    addPanel(value: NzCollapsePanelComponent): void;
    removePanel(value: NzCollapsePanelComponent): void;
    click(collapse: NzCollapsePanelComponent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCollapseComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCollapseComponent, "nz-collapse", ["nzCollapse"], { "nzAccordion": { "alias": "nzAccordion"; "required": false; }; "nzBordered": { "alias": "nzBordered"; "required": false; }; "nzGhost": { "alias": "nzGhost"; "required": false; }; "nzExpandIconPosition": { "alias": "nzExpandIconPosition"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzAccordion: unknown;
    static ngAcceptInputType_nzBordered: unknown;
    static ngAcceptInputType_nzGhost: unknown;
}
