"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRequiredProviders = addRequiredProviders;
const schematics_1 = require("@angular-devkit/schematics");
const utility_1 = require("@schematics/angular/utility");
function addRequiredProviders(options) {
    return (0, schematics_1.chain)([
        addAnimations(options),
        addHttpClient(options)
    ]);
}
function addAnimations(options) {
    return (0, utility_1.addRootProvider)(options.project, ({ code, external }) => {
        return code `${external('provideAnimationsAsync', '@angular/platform-browser/animations/async')}(${options.animations ? '' : `'noop'`})`;
    });
}
function addHttpClient(options) {
    return (0, utility_1.addRootProvider)(options.project, ({ code, external }) => {
        return code `${external('provideHttpClient', '@angular/common/http')}()`;
    });
}
//# sourceMappingURL=add-required-providers.js.map