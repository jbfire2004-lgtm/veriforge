"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JhaCailBridgeService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
let JhaCailBridgeService = class JhaCailBridgeService {
    constructor(emitter) {
        this.emitter = emitter;
    }
    async emitFromEvaluation(jhaId, projectId, ownerCompanyId, kind, evaluation, createdByUserId, siteId) {
        const sourceType = kind === 'FLHA' ? 'flha' : 'jha';
        const entries = [];
        for (const reason of evaluation.missingControls) {
            const entry = await this.emitter.emit({
                projectId,
                ownerCompanyId,
                sourceType,
                sourceId: jhaId,
                sourceItemId: `missing-${reason.slice(0, 40)}`,
                title: `JHA: ${reason.slice(0, 100)}`,
                description: reason,
                severity: evaluation.sifPotential ? 'critical' : 'high',
                createdByUserId,
                siteId: siteId !== null && siteId !== void 0 ? siteId : undefined,
            });
            entries.push(entry);
        }
        if (evaluation.sifPotential) {
            const entry = await this.emitter.emit({
                projectId,
                ownerCompanyId,
                sourceType: 'sif',
                sourceId: jhaId,
                sourceItemId: 'sif-flag',
                title: 'SIF potential — JHA review required',
                description: `SIF score ${evaluation.sifScore}. Supervisor review mandatory.`,
                severity: 'critical',
                createdByUserId,
                siteId: siteId !== null && siteId !== void 0 ? siteId : undefined,
            });
            entries.push(entry);
        }
        return entries;
    }
};
exports.JhaCailBridgeService = JhaCailBridgeService;
exports.JhaCailBridgeService = JhaCailBridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cail_emitter_service_1.CailEmitterService])
], JhaCailBridgeService);
//# sourceMappingURL=jha-cail-bridge.service.js.map