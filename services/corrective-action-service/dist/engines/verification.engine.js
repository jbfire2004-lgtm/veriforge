"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationEngine = exports.VerificationEngine = void 0;
const errors_1 = require("../utils/errors");
class VerificationEngine {
    allowedRoles = ['supervisor', 'safety_officer', 'project_manager', 'company_admin', 'admin'];
    assertRole(roles) {
        if (!roles.some((r) => this.allowedRoles.includes(r.toLowerCase()))) {
            throw new errors_1.BadRequestError(`Verifier role must be one of: ${this.allowedRoles.join(', ')}`);
        }
    }
    outcomeToStatus(outcome) {
        return outcome === 'approved' ? 'verified' : 'in_progress';
    }
}
exports.VerificationEngine = VerificationEngine;
exports.verificationEngine = new VerificationEngine();
