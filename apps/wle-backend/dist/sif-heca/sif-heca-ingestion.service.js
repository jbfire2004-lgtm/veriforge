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
exports.SifHecaIngestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_heca_service_1 = require("./sif-heca.service");
let SifHecaIngestionService = class SifHecaIngestionService {
    constructor(prisma, sifHeca) {
        this.prisma = prisma;
        this.sifHeca = sifHeca;
    }
    async ingestFromJhaFlha(jhaFlhaId, actorId) {
        var _a;
        const jha = await this.prisma.jhaFlha.findUnique({
            where: { id: jhaFlhaId },
            include: {
                hazards: true,
                controls: true,
                energySources: true,
                workers: true,
            },
        });
        if (!jha)
            return [];
        const events = [];
        for (const hazard of jha.hazards) {
            const energyTypes = Array.isArray(hazard.energyTypes)
                ? hazard.energyTypes
                : [];
            const event = await this.sifHeca.ingest({
                companyId: jha.companyId,
                projectId: jha.projectId,
                siteId: (_a = jha.siteId) !== null && _a !== void 0 ? _a : undefined,
                sourceType: 'jha_flha',
                sourceId: jhaFlhaId,
                sourceItemId: hazard.id,
                title: hazard.description.slice(0, 120),
                description: hazard.description,
                rawPayload: {
                    hazard,
                    controls: jha.controls.filter((c) => c.hazardId === hazard.id),
                    environmentalJson: jha.environmentalJson,
                },
                scoringInput: {
                    hazardSeverity: hazard.severity,
                    hazardLikelihood: hazard.likelihood,
                    energyTypes,
                    controls: jha.controls
                        .filter((c) => c.hazardId === hazard.id)
                        .map((c) => ({
                        controlType: c.controlType,
                        adequate: c.adequate,
                        effectivenessScore: c.effectivenessScore,
                        verified: c.verified,
                        ppeRequired: c.ppeRequired,
                    })),
                },
                actorId,
            });
            events.push(event);
        }
        return events;
    }
    async ingestFromInspectionItem(itemId, projectId, companyId, actorId) {
        var _a, _b, _c, _d;
        const item = await this.prisma.safetyInspectionItem.findUnique({
            where: { id: itemId },
            include: { inspection: true },
        });
        if (!item || item.polarity !== 'at_risk')
            return null;
        return this.sifHeca.ingest({
            companyId,
            projectId,
            siteId: (_a = item.inspection.siteId) !== null && _a !== void 0 ? _a : undefined,
            sourceType: 'inspection',
            sourceId: item.inspectionId,
            sourceItemId: item.id,
            title: ((_b = item.caption) !== null && _b !== void 0 ? _b : 'At-risk inspection finding').slice(0, 120),
            description: (_d = (_c = item.notes) !== null && _c !== void 0 ? _c : item.caption) !== null && _d !== void 0 ? _d : undefined,
            rawPayload: { item },
            scoringInput: {
                hazardSeverity: item.severity === 'critical' ? 5 : item.severity === 'high' ? 4 : 3,
                hazardLikelihood: 4,
                energyTypes: [],
                controls: [],
            },
            actorId,
        });
    }
    async ingestFromSafetyForm(formId, actorId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const form = await this.prisma.safetyForm.findUnique({
            where: { id: formId },
        });
        if (!(form === null || form === void 0 ? void 0 : form.projectId) || !form.companyId)
            return null;
        if (!form.sifFlag && !form.hecaFlag)
            return null;
        const data = form.formData;
        return this.sifHeca.ingest({
            companyId: form.companyId,
            projectId: form.projectId,
            siteId: (_a = form.siteId) !== null && _a !== void 0 ? _a : undefined,
            workerId: (_b = form.workerId) !== null && _b !== void 0 ? _b : undefined,
            equipmentId: (_c = form.equipmentId) !== null && _c !== void 0 ? _c : undefined,
            sourceType: 'safety_form',
            sourceId: formId,
            sourceItemId: '',
            title: String((_e = (_d = data.findingDescription) !== null && _d !== void 0 ? _d : form.title) !== null && _e !== void 0 ? _e : 'Safety form SIF/HECA'),
            description: String((_g = (_f = data.description) !== null && _f !== void 0 ? _f : data.behaviorObserved) !== null && _g !== void 0 ? _g : ''),
            rawPayload: { formData: data, definitionId: form.definitionId },
            scoringInput: {
                hazardSeverity: form.sifFlag ? 5 : 3,
                hazardLikelihood: 4,
                energyTypes: Array.isArray(data.energyTypes)
                    ? data.energyTypes
                    : data.energyType
                        ? [String(data.energyType)]
                        : [],
                controls: [],
            },
            actorId,
        });
    }
    async ingestFromBbo(bboId, actorId) {
        var _a;
        const bbo = await this.prisma.bboObservation.findUnique({
            where: { id: bboId },
            include: { project: { select: { companyId: true } } },
        });
        if (!bbo || bbo.polarity !== 'at_risk')
            return null;
        return this.sifHeca.ingest({
            companyId: (_a = bbo.ownerCompanyId) !== null && _a !== void 0 ? _a : bbo.project.companyId,
            projectId: bbo.projectId,
            sourceType: 'bbo',
            sourceId: bboId,
            sourceItemId: '',
            title: bbo.behaviorDescription.slice(0, 120),
            description: bbo.behaviorDescription,
            rawPayload: { bbo },
            scoringInput: {
                hazardSeverity: 4,
                hazardLikelihood: 3,
                energyTypes: [],
                controls: [],
            },
            actorId,
        });
    }
};
exports.SifHecaIngestionService = SifHecaIngestionService;
exports.SifHecaIngestionService = SifHecaIngestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sif_heca_service_1.SifHecaService])
], SifHecaIngestionService);
//# sourceMappingURL=sif-heca-ingestion.service.js.map