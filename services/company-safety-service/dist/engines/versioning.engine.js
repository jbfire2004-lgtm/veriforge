"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versioningEngine = exports.VersioningEngine = void 0;
const crypto_1 = require("crypto");
class VersioningEngine {
    nextVersion(current) {
        return current + 1;
    }
    newHazardId() {
        return (0, crypto_1.randomUUID)();
    }
    newControlId() {
        return (0, crypto_1.randomUUID)();
    }
}
exports.VersioningEngine = VersioningEngine;
exports.versioningEngine = new VersioningEngine();
