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
exports.CombinedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rule_engine_service_1 = require("../rules/rule-engine.service");
const public_token_resolver_1 = require("../verification/public-token.resolver");
let CombinedService = class CombinedService {
    constructor(prisma, ruleEngine, publicTokens) {
        this.prisma = prisma;
        this.ruleEngine = ruleEngine;
        this.publicTokens = publicTokens;
    }
    async loadWorker(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: true,
                trainingRecords: { include: { certification: true } },
                credentials: { include: { certification: true } },
                incidents: true,
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        return worker;
    }
    async loadEquipment(equipmentId) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                company: true,
                trainingRequirements: {
                    include: { certification: true },
                },
                incidents: true,
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        return equipment;
    }
    async verifyCombined(workerId, equipmentId) {
        const worker = await this.loadWorker(workerId);
        const equipment = await this.loadEquipment(equipmentId);
        const requiredCerts = equipment.trainingRequirements.map((r) => r.certificationId);
        const evaluation = this.ruleEngine.evaluate({
            worker,
            equipment,
            requiredCerts,
        });
        return Object.assign({ worker,
            equipment,
            requiredCerts }, evaluation);
    }
    async verifyCombinedByRef(workerRef, equipmentRef) {
        const worker = await this.publicTokens.resolveWorkerRef(workerRef);
        const equipment = await this.publicTokens.resolveEquipmentRef(equipmentRef);
        return this.verifyCombined(worker.workerId, equipment.equipmentId);
    }
    async getCombinedResultViewByRef(workerRef, equipmentRef) {
        const worker = await this.publicTokens.resolveWorkerRef(workerRef);
        const equipment = await this.publicTokens.resolveEquipmentRef(equipmentRef);
        return this.getCombinedResultView(worker.workerId, equipment.equipmentId);
    }
    async getCombinedResultView(workerId, equipmentId) {
        var _a, _b, _c, _d, _e, _f;
        const result = await this.verifyCombined(workerId, equipmentId);
        const worker = result.worker;
        const equipment = result.equipment;
        return {
            status: result.result,
            reasons: result.reasons,
            workerSummary: {
                id: worker.id,
                firstName: worker.firstName,
                lastName: worker.lastName,
                fullName: `${worker.firstName} ${worker.lastName}`,
                companyName: (_b = (_a = worker.company) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
                photoUrl: (_c = worker.photoUrl) !== null && _c !== void 0 ? _c : null,
            },
            equipmentSummary: {
                id: equipment.id,
                name: equipment.name,
                serialNumber: (_d = equipment.serialNumber) !== null && _d !== void 0 ? _d : null,
                companyName: (_f = (_e = equipment.company) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
            },
            badges: {
                missingCertsCount: result.missingCertifications.length,
                expiredTrainingCount: result.expiredTraining.length,
                expiredCredentialsCount: result.expiredCredentials.length,
                workerIncidentsCount: result.workerIncidents.length,
                equipmentIncidentsCount: result.equipmentIncidents.length,
            },
        };
    }
};
exports.CombinedService = CombinedService;
exports.CombinedService = CombinedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rule_engine_service_1.RuleEngineService,
        public_token_resolver_1.PublicTokenResolver])
], CombinedService);
//# sourceMappingURL=combined.service.js.map