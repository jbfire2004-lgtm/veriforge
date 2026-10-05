"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaAssignmentEngine = void 0;
const common_1 = require("@nestjs/common");
let CapaAssignmentEngine = class CapaAssignmentEngine {
    suggest(input) {
        const out = [];
        if (input.assignedUserId) {
            out.push({
                userId: input.assignedUserId,
                role: 'primary',
                reason: 'Explicit assignee',
            });
        }
        if (input.sourceModule === 'equipment' && input.equipmentOwnerUserId) {
            out.push({
                userId: input.equipmentOwnerUserId,
                role: 'primary',
                reason: 'Equipment owner',
            });
        }
        if ((input.severity === 'high' ||
            input.severity === 'critical' ||
            input.sifLinked) &&
            input.projectSafetyLeadId) {
            out.push({
                userId: input.projectSafetyLeadId,
                role: 'secondary',
                reason: 'Safety team oversight',
            });
        }
        if (out.length === 0 && input.projectSafetyLeadId) {
            out.push({
                userId: input.projectSafetyLeadId,
                role: 'primary',
                reason: 'Default project safety lead',
            });
        }
        return out;
    }
};
exports.CapaAssignmentEngine = CapaAssignmentEngine;
exports.CapaAssignmentEngine = CapaAssignmentEngine = __decorate([
    (0, common_1.Injectable)()
], CapaAssignmentEngine);
//# sourceMappingURL=capa-assignment.engine.js.map