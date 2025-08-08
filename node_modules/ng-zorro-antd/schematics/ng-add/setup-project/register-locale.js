"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLocale = registerLocale;
const schematics_1 = require("@angular/cdk/schematics");
const schematics_2 = require("@angular-devkit/schematics");
const utility_1 = require("@schematics/angular/utility");
const change_1 = require("@schematics/angular/utility/change");
const app_config_1 = require("@schematics/angular/utility/standalone/app_config");
const util_1 = require("@schematics/angular/utility/standalone/util");
const workspace_1 = require("@schematics/angular/utility/workspace");
const chalk_1 = require("chalk");
const ts = require("typescript");
const apply_changes_1 = require("../../utils/apply-changes");
function registerLocale(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_1.getProjectFromWorkspace)(workspace, options.project);
        const mainFile = (0, schematics_1.getProjectMainFile)(project);
        if ((0, schematics_1.isStandaloneApp)(host, mainFile)) {
            return registerLocaleInStandaloneApp(mainFile, options);
        }
        else {
            return registerLocaleInAppModule(mainFile, options);
        }
    });
}
function registerLocaleInAppModule(mainFile, options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const appModulePath = (0, schematics_1.getAppModulePath)(host, mainFile);
        const moduleSource = (0, schematics_1.parseSourceFile)(host, appModulePath);
        const locale = options.locale || 'en_US';
        const localePrefix = locale.split('_')[0];
        (0, apply_changes_1.applyChangesToFile)(host, appModulePath, [
            (0, schematics_1.insertImport)(moduleSource, appModulePath, 'provideNzI18n', 'ng-zorro-antd/i18n'),
            (0, schematics_1.insertImport)(moduleSource, appModulePath, locale, 'ng-zorro-antd/i18n'),
            (0, schematics_1.insertImport)(moduleSource, appModulePath, 'registerLocaleData', '@angular/common'),
            (0, schematics_1.insertImport)(moduleSource, appModulePath, localePrefix, `@angular/common/locales/${localePrefix}`, true),
            registerLocaleData(moduleSource, appModulePath, localePrefix),
            ...insertI18nTokenProvide(moduleSource, appModulePath, locale)
        ]);
    });
}
function registerLocaleInStandaloneApp(mainFile, options) {
    const locale = options.locale || 'en_US';
    return (0, schematics_2.chain)([
        (host) => __awaiter(this, void 0, void 0, function* () {
            const bootstrapCall = (0, util_1.findBootstrapApplicationCall)(host, mainFile);
            const appConfig = (0, app_config_1.findAppConfig)(bootstrapCall, host, mainFile);
            const appConfigFile = appConfig.filePath;
            const appConfigSource = (0, schematics_1.parseSourceFile)(host, appConfig.filePath);
            const localePrefix = locale.split('_')[0];
            (0, apply_changes_1.applyChangesToFile)(host, appConfigFile, [
                (0, schematics_1.insertImport)(appConfigSource, appConfigFile, locale, 'ng-zorro-antd/i18n'),
                (0, schematics_1.insertImport)(appConfigSource, appConfigFile, 'registerLocaleData', '@angular/common'),
                (0, schematics_1.insertImport)(appConfigSource, appConfigFile, localePrefix, `@angular/common/locales/${localePrefix}`, true),
                registerLocaleData(appConfigSource, appConfigFile, localePrefix)
            ]);
        }),
        (0, utility_1.addRootProvider)(options.project, ({ code, external }) => {
            return code `${external('provideNzI18n', 'ng-zorro-antd/i18n')}(${locale})`;
        })
    ]);
}
function registerLocaleData(moduleSource, modulePath, locale) {
    const allImports = (0, schematics_1.findNodes)(moduleSource, ts.SyntaxKind.ImportDeclaration);
    const allFun = (0, schematics_1.findNodes)(moduleSource, ts.SyntaxKind.ExpressionStatement);
    const registerLocaleDataFun = allFun.filter(node => {
        var _a;
        const fun = node.getChildren();
        return ((_a = fun[0].getChildren()[0]) === null || _a === void 0 ? void 0 : _a.getText()) === 'registerLocaleData';
    });
    if (registerLocaleDataFun.length === 0) {
        return (0, schematics_1.insertAfterLastOccurrence)(allImports, `\n\nregisterLocaleData(${locale});`, modulePath, 0);
    }
    else {
        console.log();
        console.log((0, chalk_1.yellow)(`Could not add the registerLocaleData to file (${(0, chalk_1.blue)(modulePath)}).` +
            `because there is already a registerLocaleData function.`));
        console.log((0, chalk_1.yellow)(`Please manually add the following code:`));
        console.log((0, chalk_1.cyan)(`registerLocaleData(${locale});`));
        return new change_1.NoopChange();
    }
}
function insertI18nTokenProvide(moduleSource, modulePath, locale) {
    const metadataField = 'providers';
    const nodes = (0, schematics_1.getDecoratorMetadata)(moduleSource, 'NgModule', '@angular/core');
    const addProvide = (0, schematics_1.addSymbolToNgModuleMetadata)(moduleSource, modulePath, 'providers', `provideNzI18n(${locale})`, null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = nodes[0];
    if (!node) {
        return [];
    }
    const matchingProperties = node.properties
        .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(moduleSource) === metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text === metadataField;
        }
        return false;
    });
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length) {
        const assignment = matchingProperties[0];
        if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            return [];
        }
        const arrLiteral = assignment.initializer;
        if (arrLiteral.elements.length === 0) {
            return addProvide;
        }
        else {
            const provideWithToken = arrLiteral.elements.some(e => { var _a; return (_a = e.getText) === null || _a === void 0 ? void 0 : _a.call(e).includes('NZ_I18N'); });
            const provideWithFunc = arrLiteral.elements.some(e => { var _a; return (_a = e.getText) === null || _a === void 0 ? void 0 : _a.call(e).includes('provideNzI18n'); });
            if (!provideWithFunc && !provideWithToken) {
                return addProvide;
            }
            console.log();
            console.log((0, chalk_1.yellow)(`Could not provide the locale token to file (${(0, chalk_1.blue)(modulePath)}), because there is already a locale token in providers.`));
            if (provideWithToken) {
                console.log((0, chalk_1.yellow)(`Please manually add the following code to your providers:`));
                console.log((0, chalk_1.cyan)(`provideNzI18n(${locale})`));
            }
            return [];
        }
    }
    else {
        return addProvide;
    }
}
//# sourceMappingURL=register-locale.js.map