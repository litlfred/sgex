"use strict";
/**
 * @sgex/dak-core
 * Core WHO SMART Guidelines DAK business logic and validation
 *
 * This package provides the foundational logic for working with
 * WHO SMART Guidelines Digital Adaptation Kits (DAKs).
 *
 * Key Features:
 * - DAK repository validation
 * - WHO SMART Guidelines schema compliance
 * - Component discovery and validation
 * - Asset management
 * - Shared FSH parsing and generation utilities
 * - Base component classes for all DAK types
 * - No web or MCP service dependencies
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
exports.DAKAssetType = exports.DAKComponentType = exports.decisionTableCore = exports.DecisionTableCore = exports.questionnaireDefinitionCore = exports.QuestionnaireDefinitionCore = exports.actorDefinitionCore = exports.ActorDefinitionCore = exports.DAKValidationService = exports.dakService = exports.DAKService = void 0;
// Core types
__exportStar(require("./types"), exports);
// Core services
var dak_service_1 = require("./dak-service");
Object.defineProperty(exports, "DAKService", { enumerable: true, get: function () { return dak_service_1.DAKService; } });
Object.defineProperty(exports, "dakService", { enumerable: true, get: function () { return dak_service_1.dakService; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "DAKValidationService", { enumerable: true, get: function () { return validation_1.DAKValidationService; } });
var actor_definition_1 = require("./actor-definition");
Object.defineProperty(exports, "ActorDefinitionCore", { enumerable: true, get: function () { return actor_definition_1.ActorDefinitionCore; } });
Object.defineProperty(exports, "actorDefinitionCore", { enumerable: true, get: function () { return actor_definition_1.actorDefinitionCore; } });
var questionnaire_definition_1 = require("./questionnaire-definition");
Object.defineProperty(exports, "QuestionnaireDefinitionCore", { enumerable: true, get: function () { return questionnaire_definition_1.QuestionnaireDefinitionCore; } });
Object.defineProperty(exports, "questionnaireDefinitionCore", { enumerable: true, get: function () { return questionnaire_definition_1.questionnaireDefinitionCore; } });
var decision_table_1 = require("./decision-table");
Object.defineProperty(exports, "DecisionTableCore", { enumerable: true, get: function () { return decision_table_1.DecisionTableCore; } });
Object.defineProperty(exports, "decisionTableCore", { enumerable: true, get: function () { return decision_table_1.decisionTableCore; } });
// Base component classes and utilities
__exportStar(require("./base-component"), exports);
__exportStar(require("./fsh-utils"), exports);
var types_1 = require("./types");
Object.defineProperty(exports, "DAKComponentType", { enumerable: true, get: function () { return types_1.DAKComponentType; } });
Object.defineProperty(exports, "DAKAssetType", { enumerable: true, get: function () { return types_1.DAKAssetType; } });
//# sourceMappingURL=index.js.map