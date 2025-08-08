/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, InjectionToken, OnChanges, OnDestroy, SimpleChanges, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { TabTemplateContext } from './interfaces';
import { NzTabLinkDirective, NzTabLinkTemplateDirective } from './tab-link.directive';
import * as i0 from "@angular/core";
/**
 * Used to provide a tab set to a tab without causing a circular dependency.
 */
export declare const NZ_TAB_SET: InjectionToken<any>;
export declare class NzTabComponent implements OnChanges, OnDestroy {
    nzTitle: string | TemplateRef<TabTemplateContext>;
    nzClosable: boolean;
    nzCloseIcon: string | TemplateRef<NzSafeAny>;
    nzDisabled: boolean;
    nzForceRender: boolean;
    readonly nzSelect: EventEmitter<void>;
    readonly nzDeselect: EventEmitter<void>;
    readonly nzClick: EventEmitter<void>;
    readonly nzContextmenu: EventEmitter<MouseEvent>;
    nzTabLinkTemplateDirective: NzTabLinkTemplateDirective;
    template: TemplateRef<void> | null;
    linkDirective: NzTabLinkDirective;
    contentTemplate: TemplateRef<NzSafeAny>;
    isActive: boolean;
    hasBeenActive: boolean;
    position: number | null;
    origin: number | null;
    closestTabSet: any;
    readonly stateChanges: Subject<void>;
    get content(): TemplateRef<NzSafeAny>;
    get label(): string | TemplateRef<NzSafeAny>;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    setActive(active: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTabComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTabComponent, "nz-tab", ["nzTab"], { "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzClosable": { "alias": "nzClosable"; "required": false; }; "nzCloseIcon": { "alias": "nzCloseIcon"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzForceRender": { "alias": "nzForceRender"; "required": false; }; }, { "nzSelect": "nzSelect"; "nzDeselect": "nzDeselect"; "nzClick": "nzClick"; "nzContextmenu": "nzContextmenu"; }, ["nzTabLinkTemplateDirective", "template", "linkDirective"], ["[nz-tab-link]", "*"], true, never>;
    static ngAcceptInputType_nzClosable: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzForceRender: unknown;
}
