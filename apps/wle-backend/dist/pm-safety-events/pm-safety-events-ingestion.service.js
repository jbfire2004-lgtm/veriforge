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
exports.PmSafetyEventsIngestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_heca_service_1 = require("../sif-heca/sif-heca.service");
const event_classification_engine_1 = require("./event-classification.engine");
let PmSafetyEventsIngestionService = class PmSafetyEventsIngestionService {
    constructor(prisma, classifier, sifHeca) {
        this.prisma = prisma;
        this.classifier = classifier;
        this.sifHeca = sifHeca;
    }
    async ingestToSifHeca(eventId, actorId) {
        var _a, _b, _c, _d, _e, _f;
        if (!this.sifHeca)
            return null;
        const event = await this.prisma.pmSafetyEvent.findUnique({
            where: { id: eventId },
            include: { injuries: true, equipmentLinks: true },
        });
        if (!event || event.sifEventId)
            return null;
        if (event.severity !== 'high' && event.severity !== 'critical') {
            if (event.eventType !== 'incident_injury' &&
                event.eventType !== 'near_miss') {
                return null;
            }
        }
        const energyTypes = [
            this.classifier.suggestHecaCategory((_a = event.description) !== null && _a !== void 0 ? _a : event.title, (_b = event.hecaCategoryCode) !== null && _b !== void 0 ? _b : undefined),
        ];
        const hasMedical = event.injuries.some((i) => i.medicalAid || i.lostTime);
        const result = await this.sifHeca.ingest({
            companyId: event.companyId,
            projectId: event.projectId,
            siteId: (_c = event.siteId) !== null && _c !== void 0 ? _c : undefined,
            sourceType: 'incident',
            sourceId: eventId,
            sourceItemId: '',
            title: event.title,
            description: (_d = event.description) !== null && _d !== void 0 ? _d : undefined,
            rawPayload: { event },
            scoringInput: {
                hazardSeverity: event.severity === 'critical' ? 5 : event.severity === 'high' ? 4 : 3,
                hazardLikelihood: hasMedical ? 5 : event.likelihood,
                energyTypes,
                controls: [],
            },
            actorId,
        });
        await this.prisma.pmSafetyEvent.update({
            where: { id: eventId },
            data: {
                sifEventId: result.id,
                hecaCategoryCode: (_f = (_e = result.hecaScore) === null || _e === void 0 ? void 0 : _e.hecaCategoryCode) !== null && _f !== void 0 ? _f : event.hecaCategoryCode,
            },
        });
        return result;
    }
};
exports.PmSafetyEventsIngestionService = PmSafetyEventsIngestionService;
exports.PmSafetyEventsIngestionService = PmSafetyEventsIngestionService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_classification_engine_1.EventClassificationEngine,
        sif_heca_service_1.SifHecaService])
], PmSafetyEventsIngestionService);
//# sourceMappingURL=pm-safety-events-ingestion.service.js.map