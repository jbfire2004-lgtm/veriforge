"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionPromotionEngine = exports.VersionPromotionEngine = void 0;
const errors_1 = require("../utils/errors");
const PROMOTE = {
    draft: ['staging'],
    staging: ['production'],
    production: ['retired'],
    retired: [],
};
const ROLLBACK = {
    draft: [],
    staging: ['draft'],
    production: ['staging'],
    retired: ['staging'],
};
class VersionPromotionEngine {
    canPromote(from) {
        return PROMOTE[from][0] ?? null;
    }
    canRollback(from) {
        return ROLLBACK[from][0] ?? null;
    }
    assertPromote(from) {
        if (!this.canPromote(from))
            throw new errors_1.BadRequestError(`Cannot promote from ${from}`);
    }
    assertRollback(from) {
        if (!this.canRollback(from))
            throw new errors_1.BadRequestError(`Cannot rollback from ${from}`);
    }
}
exports.VersionPromotionEngine = VersionPromotionEngine;
exports.versionPromotionEngine = new VersionPromotionEngine();
