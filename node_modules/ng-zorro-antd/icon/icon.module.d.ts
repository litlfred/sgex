/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ModuleWithProviders } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';
import * as i0 from "@angular/core";
import * as i1 from "./icon.directive";
export declare class NzIconModule {
    static forRoot(icons: IconDefinition[]): ModuleWithProviders<NzIconModule>;
    static forChild(icons: IconDefinition[]): ModuleWithProviders<NzIconModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzIconModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NzIconModule, never, [typeof i1.NzIconDirective], [typeof i1.NzIconDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NzIconModule>;
}
