"use strict";
/**
 * @sgex/storage-services
 * Storage and caching services for SGEX with DAK-aware functionality
 *
 * This package provides storage, caching, and data persistence services
 * with integration to the DAK core business logic.
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
// Export types
__exportStar(require("./types"), exports);
// Storage services
__exportStar(require("./bookmark-service"), exports);
__exportStar(require("./cache-management"), exports);
__exportStar(require("./repository-cache"), exports);
//# sourceMappingURL=index.js.map