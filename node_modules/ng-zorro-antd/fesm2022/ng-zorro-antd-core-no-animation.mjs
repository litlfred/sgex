import * as i0 from '@angular/core';
import { inject, booleanAttribute, Input, Directive, NgModule } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzNoAnimationDirective {
    animationType = inject(ANIMATION_MODULE_TYPE, { optional: true });
    nzNoAnimation = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "19.2.2", type: NzNoAnimationDirective, isStandalone: true, selector: "[nzNoAnimation]", inputs: { nzNoAnimation: ["nzNoAnimation", "nzNoAnimation", booleanAttribute] }, host: { properties: { "class.nz-animate-disabled": "nzNoAnimation || animationType === 'NoopAnimations'" } }, exportAs: ["nzNoAnimation"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzNoAnimation]',
                    exportAs: 'nzNoAnimation',
                    host: {
                        '[class.nz-animate-disabled]': `nzNoAnimation || animationType === 'NoopAnimations'`
                    }
                }]
        }], propDecorators: { nzNoAnimation: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzNoAnimationModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationModule, imports: [NzNoAnimationDirective], exports: [NzNoAnimationDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzNoAnimationModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzNoAnimationDirective],
                    exports: [NzNoAnimationDirective]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzNoAnimationDirective, NzNoAnimationModule };
//# sourceMappingURL=ng-zorro-antd-core-no-animation.mjs.map
