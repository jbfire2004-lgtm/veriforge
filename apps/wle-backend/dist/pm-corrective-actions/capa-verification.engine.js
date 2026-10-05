"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaVerificationEngine = void 0;
const common_1 = require("@nestjs/common");
let CapaVerificationEngine = class CapaVerificationEngine {
    constructor() {
        this.allowedRoles = [
            'supervisor',
            'safety_officer',
            'project_manager',
        ];
    }
    assertRole(role) {
        if (!this.allowedRoles.includes(role)) {
            throw new common_1.BadRequestException(`Verifier role must be one of: ${this.allowedRoles.join(', ')}`);
        }
    }
    nextStatus(outcome) {
        return outcome === 'approve' ? 'verified' : 'in_progress';
    }
};
exports.CapaVerificationEngine = CapaVerificationEngine;
exports.CapaVerificationEngine = CapaVerificationEngine = __decorate([
    (0, common_1.Injectable)()
], CapaVerificationEngine);
//# sourceMappingURL=capa-verification.engine.js.map