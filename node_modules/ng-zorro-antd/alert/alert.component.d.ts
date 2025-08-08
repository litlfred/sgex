/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzConfigKey, NzConfigService } from 'ng-zorro-antd/core/config';
import * as i0 from "@angular/core";
export declare class NzAlertComponent implements OnChanges, OnDestroy, OnInit {
    nzConfigService: NzConfigService;
    private cdr;
    private directionality;
    readonly _nzModuleName: NzConfigKey;
    nzAction: string | TemplateRef<void> | null;
    nzCloseText: string | TemplateRef<void> | null;
    nzIconType: string | null;
    nzMessage: string | TemplateRef<void> | null;
    nzDescription: string | TemplateRef<void> | null;
    nzType: 'success' | 'info' | 'warning' | 'error';
    nzCloseable: boolean;
    nzShowIcon: boolean;
    nzBanner: boolean;
    nzNoAnimation: boolean;
    nzIcon: string | TemplateRef<void> | null;
    readonly nzOnClose: EventEmitter<boolean>;
    closed: boolean;
    iconTheme: 'outline' | 'fill';
    inferredIconType: string;
    dir: Direction;
    private isTypeSet;
    private isShowIconSet;
    private destroy$;
    constructor(nzConfigService: NzConfigService, cdr: ChangeDetectorRef, directionality: Directionality);
    ngOnInit(): void;
    closeAlert(): void;
    onFadeAnimationDone(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzAlertComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzAlertComponent, "nz-alert", ["nzAlert"], { "nzAction": { "alias": "nzAction"; "required": false; }; "nzCloseText": { "alias": "nzCloseText"; "required": false; }; "nzIconType": { "alias": "nzIconType"; "required": false; }; "nzMessage": { "alias": "nzMessage"; "required": false; }; "nzDescription": { "alias": "nzDescription"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzCloseable": { "alias": "nzCloseable"; "required": false; }; "nzShowIcon": { "alias": "nzShowIcon"; "required": false; }; "nzBanner": { "alias": "nzBanner"; "required": false; }; "nzNoAnimation": { "alias": "nzNoAnimation"; "required": false; }; "nzIcon": { "alias": "nzIcon"; "required": false; }; }, { "nzOnClose": "nzOnClose"; }, never, never, true, never>;
    static ngAcceptInputType_nzCloseable: unknown;
    static ngAcceptInputType_nzShowIcon: unknown;
    static ngAcceptInputType_nzBanner: unknown;
    static ngAcceptInputType_nzNoAnimation: unknown;
}
