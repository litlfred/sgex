"use strict";
/**
 * Common types for storage services
 * Defines minimal interfaces to avoid circular dependencies with dak-core
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKComponentType = void 0;
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
//# sourceMappingURL=types.js.map