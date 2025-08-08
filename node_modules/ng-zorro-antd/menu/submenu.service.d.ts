/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { MenuService } from './menu.service';
import { NzMenuModeType } from './menu.types';
import * as i0 from "@angular/core";
export declare class NzSubmenuService implements OnDestroy {
    nzMenuService: MenuService;
    mode$: Observable<NzMenuModeType>;
    level: number;
    isMenuInsideDropDown: boolean;
    isCurrentSubMenuOpen$: BehaviorSubject<boolean>;
    private isChildSubMenuOpen$;
    /** submenu title & overlay mouse enter status **/
    private isMouseEnterTitleOrOverlay$;
    private childMenuItemClick$;
    private destroy$;
    private nzHostSubmenuService;
    /**
     * menu item inside submenu clicked
     *
     * @param menu
     */
    onChildMenuItemClick(menu: NzSafeAny): void;
    setOpenStateWithoutDebounce(value: boolean): void;
    setMouseEnterTitleOrOverlayState(value: boolean): void;
    constructor();
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSubmenuService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzSubmenuService>;
}
