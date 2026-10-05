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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmInspectionsIngestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_heca_service_1 = require("../sif-heca/sif-heca.service");
let PmInspectionsIngestionService = class PmInspectionsIngestionService {
    constructor(prisma, sifHeca) {
        this.prisma = prisma;
        this.sifHeca = sifHeca;
    }
    async ingestDeficiencyToSif(deficiencyId, actorId) {
        var _a, _b, _c, _d;
        if (!this.sifHeca)
            return null;
        const def = await this.prisma.pmInspectionDeficiency.findUnique({
            where: { id: deficiencyId },
            include: { inspection: { include: { template: true } } },
        });
        if (!def || def.sifEventId)
            return null;
        if (def.severity !== 'high' && def.severity !== 'critical')
            return null;
        const items = def.inspection.template.items;
        const item = items.find((i) => i.id === def.itemId);
        const energyTypes = (item === null || item === void 0 ? void 0 : item.energyType) ? [item.energyType] : [];
        const event = await this.sifHeca.ingest({
            companyId: def.inspection.companyId,
            projectId: def.inspection.projectId,
            siteId: (_a = def.inspection.siteId) !== null && _a !== void 0 ? _a : undefined,
            workerId: (_b = def.inspection.workerId) !== null && _b !== void 0 ? _b : undefined,
            equipmentId: (_c = def.inspection.equipmentId) !== null && _c !== void 0 ? _c : undefined,
            sourceType: 'inspection',
            sourceId: def.inspectionId,
            sourceItemId: def.id,
            title: def.title,
            description: (_d = def.description) !== null && _d !== void 0 ? _d : undefined,
            rawPayload: { deficiency: def },
            scoringInput: {
                hazardSeverity: def.severity === 'critical' ? 5 : def.severity === 'high' ? 4 : 3,
                hazardLikelihood: def.severity === 'critical' ? 4 : 3,
                energyTypes,
                controls: [],
            },
            actorId,
        });
        await this.prisma.pmInspectionDeficiency.update({
            where: { id: deficiencyId },
            data: { sifEventId: event.id },
        });
        return event;
    }
};
exports.PmInspectionsIngestionService = PmInspectionsIngestionService;
exports.PmInspectionsIngestionService = PmInspectionsIngestionService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sif_heca_service_1.SifHecaService])
], PmInspectionsIngestionService);
//# sourceMappingURL=pm-inspections-ingestion.service.js.map