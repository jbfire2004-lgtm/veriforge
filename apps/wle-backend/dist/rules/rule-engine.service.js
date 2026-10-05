"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngineService = void 0;
const common_1 = require("@nestjs/common");
let RuleEngineService = class RuleEngineService {
    evaluate({ worker, equipment, requiredCerts, }) {
        const now = new Date();
        const reasons = [];
        const workerCertIds = (worker.trainingRecords || []).map((t) => t.certificationId);
        const missingCertifications = requiredCerts.filter((req) => !workerCertIds.includes(req));
        if (missingCertifications.length > 0) {
            reasons.push('Worker missing required certifications');
        }
        const expiredTraining = (worker.trainingRecords || []).filter((t) => t.expiresAt && t.expiresAt <= now);
        if (expiredTraining.length > 0) {
            reasons.push('Worker has expired training');
        }
        const expiredCredentials = (worker.credentials || []).filter((c) => c.expiresAt && c.expiresAt <= now);
        if (expiredCredentials.length > 0) {
            reasons.push('Worker has expired credentials');
        }
        const workerIncidents = worker.incidents || [];
        if (workerIncidents.length > 0) {
            reasons.push('Worker involved in incidents');
        }
        const equipmentIncidents = equipment.incidents || [];
        if (equipmentIncidents.length > 0) {
            reasons.push('Equipment has active incidents');
        }
        const result = reasons.length === 0 ? 'SAFE' : 'UNSAFE';
        return {
            result,
            reasons,
            missingCertifications,
            expiredTraining,
            expiredCredentials,
            workerIncidents,
            equipmentIncidents,
        };
    }
};
exports.RuleEngineService = RuleEngineService;
exports.RuleEngineService = RuleEngineService = __decorate([
    (0, common_1.Injectable)()
], RuleEngineService);
//# sourceMappingURL=rule-engine.service.js.map