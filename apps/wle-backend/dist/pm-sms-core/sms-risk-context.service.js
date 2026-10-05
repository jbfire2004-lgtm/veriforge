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
exports.SmsRiskContextService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sms_risk_escalation_engine_1 = require("./sms-risk-escalation.engine");
let SmsRiskContextService = class SmsRiskContextService {
    constructor(prisma, escalation) {
        this.prisma = prisma;
        this.escalation = escalation;
    }
    async upsert(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const tagInput = {
            sclState: input.sclState,
            hecaInvolved: input.hecaInvolved,
            hecaType: input.hecaType,
            energyTypes: input.energyTypes,
            energyControlState: input.energyControlState,
            highEnergyFlag: input.highEnergyFlag,
        };
        const evalResult = this.escalation.evaluate('medium', tagInput);
        const data = {
            companyId: input.companyId,
            projectId: input.projectId,
            entityType: input.entityType,
            entityId: input.entityId,
            sclState: (_a = input.sclState) !== null && _a !== void 0 ? _a : undefined,
            sclTriggersJson: (_b = input.sclTriggers) !== null && _b !== void 0 ? _b : [],
            sclPrecursorsJson: (_c = input.sclPrecursors) !== null && _c !== void 0 ? _c : [],
            sclPotentialSeverity: input.sclPotentialSeverity,
            hecaInvolved: (_d = input.hecaInvolved) !== null && _d !== void 0 ? _d : false,
            hecaType: (_e = input.hecaType) !== null && _e !== void 0 ? _e : undefined,
            hecaCategoryCode: input.hecaCategoryCode,
            hecaLibraryEntryId: input.hecaLibraryEntryId,
            energyTypesJson: (_f = input.energyTypes) !== null && _f !== void 0 ? _f : [],
            energyControlState: (_g = input.energyControlState) !== null && _g !== void 0 ? _g : undefined,
            highEnergyFlag: (_h = input.highEnergyFlag) !== null && _h !== void 0 ? _h : false,
            missingControlsJson: (_j = input.missingControls) !== null && _j !== void 0 ? _j : [],
            escalationScore: evalResult.escalationScore,
            requiresInvestigation: (_k = input.requiresInvestigation) !== null && _k !== void 0 ? _k : evalResult.requiresInvestigation,
            metadataJson: ((_l = input.metadata) !== null && _l !== void 0 ? _l : {}),
            clientSyncId: input.clientSyncId,
        };
        return this.prisma.pmSmsRiskContext.upsert({
            where: {
                entityType_entityId: {
                    entityType: input.entityType,
                    entityId: input.entityId,
                },
            },
            create: data,
            update: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
        });
    }
    async getForEntity(entityType, entityId) {
        return this.prisma.pmSmsRiskContext.findUnique({
            where: { entityType_entityId: { entityType, entityId } },
            include: { hecaLibraryEntry: true },
        });
    }
    async listByCompany(companyId, filters) {
        return this.prisma.pmSmsRiskContext.findMany({
            where: {
                companyId,
                projectId: filters === null || filters === void 0 ? void 0 : filters.projectId,
                sclState: filters === null || filters === void 0 ? void 0 : filters.sclState,
                hecaInvolved: (filters === null || filters === void 0 ? void 0 : filters.hecaOnly) ? true : undefined,
                highEnergyFlag: (filters === null || filters === void 0 ? void 0 : filters.highEnergyOnly) ? true : undefined,
                requiresInvestigation: filters === null || filters === void 0 ? void 0 : filters.requiresInvestigation,
            },
            orderBy: { escalationScore: 'desc' },
            take: 200,
        });
    }
};
exports.SmsRiskContextService = SmsRiskContextService;
exports.SmsRiskContextService = SmsRiskContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_risk_escalation_engine_1.SmsRiskEscalationEngine])
], SmsRiskContextService);
//# sourceMappingURL=sms-risk-context.service.js.map