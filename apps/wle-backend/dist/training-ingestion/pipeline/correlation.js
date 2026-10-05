"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newIngestionCorrelationId = newIngestionCorrelationId;
const crypto_1 = require("crypto");
function newIngestionCorrelationId() {
    return `ing_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 20)}`;
}
//# sourceMappingURL=correlation.js.map