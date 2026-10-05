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
exports.SafetyInspectionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const vsi_attachments_service_1 = require("../attachments/vsi-attachments.service");
const safety_intelligence_ai_service_1 = require("../ai/safety-intelligence-ai.service");
const cail_copilot_enrichment_service_1 = require("../cail/cail-copilot-enrichment.service");
const ocr_extraction_service_1 = require("../../training-ingestion/ocr-extraction.service");
let SafetyInspectionsService = class SafetyInspectionsService {
    constructor(prisma, emitter, scope, attachments, ai, ocr, copilotEnrich) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.scope = scope;
        this.attachments = attachments;
        this.ai = ai;
        this.ocr = ocr;
        this.copilotEnrich = copilotEnrich;
    }
    async list(actor, projectId) {
        const where = {};
        if (projectId)
            where.projectId = projectId;
        if (!this.scope.isPrime(actor) && actor.companyId) {
            where.companyId = actor.companyId;
        }
        return this.prisma.safetyInspection.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                inspector: { select: { id: true, username: true } },
                _count: { select: { items: true } },
            },
            orderBy: { startedAt: 'desc' },
            take: 100,
        });
    }
    async getById(id, actor) {
        const row = await this.prisma.safetyInspection.findUnique({
            where: { id },
            include: {
                project: { select: { id: true, name: true } },
                inspector: { select: { id: true, username: true } },
                site: { select: { id: true, name: true } },
                items: {
                    include: {
                        ownerCompany: { select: { id: true, name: true } },
                        cailEntry: { select: { id: true, status: true, title: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Inspection not found');
        if (!this.scope.isPrime(actor) &&
            actor.companyId &&
            row.companyId !== actor.companyId) {
            throw new common_1.NotFoundException('Inspection not found');
        }
        const items = await this.mapItemsWithPreviews(row.items);
        return Object.assign(Object.assign({}, row), { items });
    }
    async create(dto, actor) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.safetyInspection.create({
            data: {
                projectId: dto.projectId,
                inspectorUserId: actor.id,
                companyId: (_a = actor.companyId) !== null && _a !== void 0 ? _a : project.companyId,
                title: dto.title,
                siteId: dto.siteId,
                locationNote: dto.locationNote,
            },
            include: {
                project: { select: { id: true, name: true } },
            },
        });
    }
    async addItem(inspectionId, dto, actor) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const inspection = await this.getById(inspectionId, actor);
        if (inspection.status === 'completed') {
            throw new common_1.BadRequestException('Inspection is already completed');
        }
        if (dto.polarity === client_1.ObservationPolarity.at_risk && !dto.ownerCompanyId) {
            throw new common_1.BadRequestException('ownerCompanyId is required for at-risk items');
        }
        let photoStorageKey = dto.photoStorageKey;
        let photoDataUrl = dto.photoDataUrl;
        let aiSuggestions;
        let inspectionCopilotRun;
        if (dto.coreFileId) {
            const photo = await this.attachments.resolvePhotoEvidence(dto.coreFileId);
            photoStorageKey = photo.storageKey;
            photoDataUrl = (_a = photo.publicUrl) !== null && _a !== void 0 ? _a : undefined;
        }
        if (dto.caption || photoDataUrl || dto.ocrText) {
            const classification = await this.ai.classifyInspectionPhotoFull({
                caption: dto.caption,
                ocrText: dto.ocrText,
                imageUrl: photoDataUrl,
                companyId: (_b = inspection.companyId) !== null && _b !== void 0 ? _b : undefined,
                projectId: inspection.projectId,
            });
            aiSuggestions = classification;
            if (classification.cailEnvelope) {
                inspectionCopilotRun = {
                    module: 'inspection',
                    engine: classification.engines,
                    output: (_c = classification.copilot) !== null && _c !== void 0 ? _c : classification,
                    cailEnvelope: classification.cailEnvelope,
                    generatedAt: new Date().toISOString(),
                };
            }
        }
        const item = await this.prisma.safetyInspectionItem.create({
            data: {
                inspectionId,
                polarity: dto.polarity,
                photoStorageKey,
                photoDataUrl,
                coreFileId: dto.coreFileId,
                caption: dto.caption,
                aiSuggestions: aiSuggestions,
                ownerCompanyId: dto.ownerCompanyId,
                assignedUserId: dto.assignedUserId,
                equipmentId: dto.equipmentId,
                riskCategory: dto.riskCategory,
                severity: dto.severity,
                notes: dto.notes,
            },
        });
        if (dto.polarity === client_1.ObservationPolarity.at_risk && dto.ownerCompanyId) {
            const cail = await this.emitter.emit({
                projectId: inspection.projectId,
                ownerCompanyId: dto.ownerCompanyId,
                sourceType: 'inspection',
                sourceId: inspectionId,
                sourceItemId: item.id,
                title: (_e = (_d = dto.caption) === null || _d === void 0 ? void 0 : _d.slice(0, 500)) !== null && _e !== void 0 ? _e : 'Walk-around at-risk finding',
                description: (_f = dto.notes) !== null && _f !== void 0 ? _f : dto.caption,
                severity: dto.severity,
                riskCategory: dto.riskCategory,
                assignedUserId: dto.assignedUserId,
                createdByUserId: actor.id,
                siteId: (_g = inspection.siteId) !== null && _g !== void 0 ? _g : undefined,
                locationNote: (_h = inspection.locationNote) !== null && _h !== void 0 ? _h : undefined,
                equipmentId: dto.equipmentId,
                evidenceBefore: photoDataUrl
                    ? [
                        {
                            dataUrl: photoDataUrl,
                            storageKey: photoStorageKey,
                            coreFileId: dto.coreFileId,
                            caption: dto.caption,
                        },
                    ]
                    : [],
            });
            await this.prisma.safetyInspectionItem.update({
                where: { id: item.id },
                data: { cailEntryId: cail.id },
            });
            if (inspectionCopilotRun) {
                this.copilotEnrich.persistInspectionRun(cail.id, inspectionCopilotRun);
            }
            else {
                this.copilotEnrich.scheduleInspectionEnrich(cail.id, {
                    caption: dto.caption,
                    ocrText: dto.ocrText,
                    imageUrl: photoDataUrl,
                    projectId: inspection.projectId,
                    companyId: (_j = inspection.companyId) !== null && _j !== void 0 ? _j : undefined,
                });
            }
            const row = await this.prisma.safetyInspectionItem.findUnique({
                where: { id: item.id },
                include: {
                    cailEntry: { select: { id: true, status: true, title: true } },
                },
            });
            if (!row)
                return item;
            return Object.assign(Object.assign({}, row), { photoPreviewUrl: await this.itemPreviewUrl(row) });
        }
        return Object.assign(Object.assign({}, item), { photoPreviewUrl: await this.itemPreviewUrl(item) });
    }
    async classifyPhoto(input) {
        var _a;
        let imageUrl = input.imageUrl;
        let ocrText = input.ocrText;
        let imageBase64;
        let imageMimeType;
        if (input.coreFileId) {
            const asset = await this.attachments.resolvePhotoForClassification(input.coreFileId);
            imageUrl = (_a = imageUrl !== null && imageUrl !== void 0 ? imageUrl : asset.publicUrl) !== null && _a !== void 0 ? _a : undefined;
            imageBase64 = asset.imageBase64;
            imageMimeType = asset.mimeType;
            if (!ocrText) {
                try {
                    const extracted = await this.ocr.extractFromBuffer(asset.buffer, asset.mimeType);
                    ocrText = extracted.text;
                }
                catch (_b) {
                }
            }
        }
        return this.ai.classifyInspectionPhotoFull(Object.assign(Object.assign({}, input), { imageUrl,
            ocrText,
            imageBase64,
            imageMimeType }));
    }
    async itemPreviewUrl(item) {
        var _a, _b, _c;
        if ((_a = item.photoDataUrl) === null || _a === void 0 ? void 0 : _a.startsWith('data:'))
            return item.photoDataUrl;
        if ((_b = item.photoDataUrl) === null || _b === void 0 ? void 0 : _b.startsWith('http'))
            return item.photoDataUrl;
        if (item.coreFileId) {
            try {
                const file = await this.attachments.resolvePhotoEvidence(item.coreFileId);
                return (_c = file.publicUrl) !== null && _c !== void 0 ? _c : null;
            }
            catch (_d) {
                return null;
            }
        }
        return null;
    }
    async mapItemsWithPreviews(items) {
        return Promise.all(items.map(async (item) => (Object.assign(Object.assign({}, item), { photoPreviewUrl: await this.itemPreviewUrl(item) }))));
    }
    async complete(inspectionId, actor) {
        await this.getById(inspectionId, actor);
        return this.prisma.safetyInspection.update({
            where: { id: inspectionId },
            data: { status: 'completed', completedAt: new Date() },
            include: {
                items: {
                    include: { cailEntry: { select: { id: true, status: true } } },
                },
            },
        });
    }
};
exports.SafetyInspectionsService = SafetyInspectionsService;
exports.SafetyInspectionsService = SafetyInspectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService,
        cail_scope_service_1.CailScopeService,
        vsi_attachments_service_1.VsiAttachmentsService,
        safety_intelligence_ai_service_1.SafetyIntelligenceAiService,
        ocr_extraction_service_1.OcrExtractionService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService])
], SafetyInspectionsService);
//# sourceMappingURL=inspections.service.js.map