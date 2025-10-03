"use strict";
/**
 * @sgex/dak-core/browser
 * Browser-compatible exports for WHO SMART Guidelines DAK utilities
 *
 * This entry point excludes Node.js-specific modules (DAKService, DAKValidationService)
 * and only exports browser-safe utilities for FSH parsing and component management.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionTableCore = exports.DecisionTableCore = exports.questionnaireDefinitionCore = exports.QuestionnaireDefinitionCore = exports.actorDefinitionCore = exports.ActorDefinitionCore = void 0;
// Base component classes and utilities (browser-safe)
__exportStar(require("./base-component"), exports);
__exportStar(require("./fsh-utils"), exports);
// Component classes (browser-safe)
var actor_definition_1 = require("./actor-definition");
Object.defineProperty(exports, "ActorDefinitionCore", { enumerable: true, get: function () { return actor_definition_1.ActorDefinitionCore; } });
Object.defineProperty(exports, "actorDefinitionCore", { enumerable: true, get: function () { return actor_definition_1.actorDefinitionCore; } });
var questionnaire_definition_1 = require("./questionnaire-definition");
Object.defineProperty(exports, "QuestionnaireDefinitionCore", { enumerable: true, get: function () { return questionnaire_definition_1.QuestionnaireDefinitionCore; } });
Object.defineProperty(exports, "questionnaireDefinitionCore", { enumerable: true, get: function () { return questionnaire_definition_1.questionnaireDefinitionCore; } });
var decision_table_1 = require("./decision-table");
Object.defineProperty(exports, "DecisionTableCore", { enumerable: true, get: function () { return decision_table_1.DecisionTableCore; } });
Object.defineProperty(exports, "decisionTableCore", { enumerable: true, get: function () { return decision_table_1.decisionTableCore; } });
//# sourceMappingURL=browser.js.map