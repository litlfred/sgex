import * as i0 from '@angular/core';
import { Directive, NgModule } from '@angular/core';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/**
 * A patch directive to select the element of a component.
 */
class NzElementPatchDirective {
    elementRef;
    get nativeElement() {
        return this.elementRef.nativeElement;
    }
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzElementPatchDirective, isStandalone: true, selector: "[nzElement], [nz-element]", exportAs: ["nzElement"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzElement], [nz-element]',
                    exportAs: 'nzElement'
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzElementPatchModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchModule, imports: [NzElementPatchDirective], exports: [NzElementPatchDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzElementPatchModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzElementPatchDirective],
                    exports: [NzElementPatchDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzElementPatchDirective, NzElementPatchModule };
//# sourceMappingURL=ng-zorro-antd-core-element-patch.mjs.map
