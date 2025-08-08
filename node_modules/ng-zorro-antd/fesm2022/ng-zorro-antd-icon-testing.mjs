import * as i0 from '@angular/core';
import { NgModule } from '@angular/core';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NzIconModule, NZ_ICONS, provideNzIcons } from 'ng-zorro-antd/icon';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const antDesignIcons = AllIcons;
const icons = Object.keys(antDesignIcons).map(key => {
    const i = antDesignIcons[key];
    return i;
});
/**
 * @internal
 * @deprecated Internal use only, do not use directly. Will be removed in v20
 * Include this module in every testing spec, except `icon.spec.ts`.
 */
// @dynamic
class NzIconTestModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconTestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzIconTestModule, exports: [NzIconModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconTestModule, providers: [
            {
                provide: NZ_ICONS,
                useValue: icons
            }
        ], imports: [NzIconModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzIconTestModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [NzIconModule],
                    providers: [
                        {
                            provide: NZ_ICONS,
                            useValue: icons
                        }
                    ]
                }]
        }] });
const provideNzIconsTesting = () => provideNzIcons(icons);

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzIconTestModule, provideNzIconsTesting };
//# sourceMappingURL=ng-zorro-antd-icon-testing.mjs.map
