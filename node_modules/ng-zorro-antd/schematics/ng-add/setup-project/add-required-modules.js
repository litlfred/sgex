"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRequiredModules = addRequiredModules;
const schematics_1 = require("@angular-devkit/schematics");
const utility_1 = require("@schematics/angular/utility");
const modulesMap = {
    FormsModule: '@angular/forms'
};
function addRequiredModules(options) {
    const rules = Object.entries(modulesMap).map(([symbolName, moduleName]) => {
        return (0, utility_1.addRootImport)(options.project, ({ code, external }) => {
            return code `${external(symbolName, moduleName)}`;
        });
    });
    return (0, schematics_1.chain)(rules);
}
//# sourceMappingURL=add-required-modules.js.map