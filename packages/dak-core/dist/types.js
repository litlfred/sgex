"use strict";
/**
 * WHO SMART Guidelines Digital Adaptation Kit (DAK) TypeScript Types
 * Based on the WHO SMART Guidelines DAK logical model
 * https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKAssetType = exports.DAKComponentType = void 0;
/**
 * DAK Component Types
 * Enumeration of the 9 DAK components
 */
var DAKComponentType;
(function (DAKComponentType) {
    DAKComponentType["HEALTH_INTERVENTIONS"] = "healthInterventions";
    DAKComponentType["PERSONAS"] = "personas";
    DAKComponentType["USER_SCENARIOS"] = "userScenarios";
    DAKComponentType["BUSINESS_PROCESSES"] = "businessProcesses";
    DAKComponentType["DATA_ELEMENTS"] = "dataElements";
    DAKComponentType["DECISION_LOGIC"] = "decisionLogic";
    DAKComponentType["INDICATORS"] = "indicators";
    DAKComponentType["REQUIREMENTS"] = "requirements";
    DAKComponentType["TEST_SCENARIOS"] = "testScenarios";
})(DAKComponentType || (exports.DAKComponentType = DAKComponentType = {}));
/**
 * DAK Asset Types
 * Common asset types found in DAK repositories
 */
var DAKAssetType;
(function (DAKAssetType) {
    DAKAssetType["BPMN"] = "bpmn";
    DAKAssetType["DMN"] = "dmn";
    DAKAssetType["FHIR_PROFILE"] = "fhir-profile";
    DAKAssetType["FHIR_EXTENSION"] = "fhir-extension";
    DAKAssetType["VALUE_SET"] = "value-set";
    DAKAssetType["CODE_SYSTEM"] = "code-system";
    DAKAssetType["QUESTIONNAIRE"] = "questionnaire";
    DAKAssetType["MEASURE"] = "measure";
    DAKAssetType["ACTOR_DEFINITION"] = "actor-definition";
})(DAKAssetType || (exports.DAKAssetType = DAKAssetType = {}));
//# sourceMappingURL=types.js.map