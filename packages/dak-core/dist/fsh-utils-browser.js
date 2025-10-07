"use strict";
/**
 * Browser-only FSH Utilities
 * This version doesn't import fsh-sushi to avoid Node.js dependencies in browser bundles
 * Re-exports the same functions but with fallback-only behavior
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
__exportStar(require("./fsh-utils"), exports);
// Note: In browser builds, fsh-sushi won't be available, so all FSH parsing
// will use regex fallback patterns. The main fsh-utils module handles this
// automatically with conditional imports.
//# sourceMappingURL=fsh-utils-browser.js.map