/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction, Directionality } from '@angular/cdk/bidi';
import { EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMenuModeType, NzMenuThemeType, NzSubmenuTrigger } from './menu.types';
import * as i0 from "@angular/core";
export declare class NzSubmenuNoneInlineChildComponent implements OnDestroy, OnInit, OnChanges {
    private directionality;
    menuClass: string;
    theme: NzMenuThemeType;
    templateOutlet: TemplateRef<NzSafeAny> | null;
    isMenuInsideDropDown: boolean;
    mode: NzMenuModeType;
    nzTriggerSubMenuAction: NzSubmenuTrigger;
    position: string;
    nzDisabled: boolean;
    nzOpen: boolean;
    readonly subMenuMouseState: EventEmitter<boolean>;
    constructor(directionality: Directionality);
    setMouseState(state: boolean): void;
    expandState: string;
    dir: Direction;
    private destroy$;
    ngOnDestroy(): void;
    calcMotionState(): void;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSubmenuNoneInlineChildComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSubmenuNoneInlineChildComponent, "[nz-submenu-none-inline-child]", ["nzSubmenuNoneInlineChild"], { "menuClass": { "alias": "menuClass"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; "templateOutlet": { "alias": "templateOutlet"; "required": false; }; "isMenuInsideDropDown": { "alias": "isMenuInsideDropDown"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "nzTriggerSubMenuAction": { "alias": "nzTriggerSubMenuAction"; "required": false; }; "position": { "alias": "position"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzOpen": { "alias": "nzOpen"; "required": false; }; }, { "subMenuMouseState": "subMenuMouseState"; }, never, never, true, never>;
}
