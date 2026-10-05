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
exports.EquipmentBridgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
const cail_copilot_enrichment_service_1 = require("../cail/cail-copilot-enrichment.service");
let EquipmentBridgeService = class EquipmentBridgeService {
    constructor(prisma, emitter, copilotEnrich) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.copilotEnrich = copilotEnrich;
    }
    enrichEquipmentCail(cailId, inspectionId, itemId, title, projectId, ownerCompanyId, equipmentId) {
        this.copilotEnrich.scheduleEquipmentEnrich(cailId, {
            failureMode: title,
            title,
            inspectionId,
            checklistItemId: itemId,
            projectId,
            companyId: ownerCompanyId,
            equipmentId,
        });
    }
    async resolveProjectId(equipmentId, siteId, explicitProjectId) {
        if (explicitProjectId)
            return explicitProjectId;
        const assignment = await this.prisma.equipmentProjectAssignment.findFirst({
            where: { equipmentId, status: 'ACTIVE' },
            orderBy: { assignedAt: 'desc' },
        });
        if (assignment)
            return assignment.projectId;
        if (siteId) {
            const project = await this.prisma.project.findFirst({
                where: { siteId, status: 'ACTIVE' },
            });
            if (project)
                return project.id;
        }
        throw new common_1.NotFoundException('Could not resolve projectId for equipment CAIL emit — pass projectId explicitly');
    }
    itemFailed(value) {
        if (typeof value === 'boolean')
            return !value;
        if (typeof value === 'object' && value !== null && 'passed' in value) {
            return value.passed === false;
        }
        if (value === 'fail' || value === 'no' || value === 'false')
            return true;
        return false;
    }
    itemLabel(itemId, value) {
        if (typeof value === 'object' &&
            value !== null &&
            'notes' in value &&
            value.notes) {
            return `${itemId}: ${value.notes}`;
        }
        return `Failed checklist item: ${itemId}`;
    }
    async emitFromInspection(inspectionId, createdByUserId, projectId) {
        var _a, _b, _c, _d, _e, _f;
        const inspection = await this.prisma.inspection.findUnique({
            where: { id: inspectionId },
            include: { equipment: true },
        });
        if (!(inspection === null || inspection === void 0 ? void 0 : inspection.equipmentId) || !inspection.equipment) {
            throw new common_1.NotFoundException('Inspection or equipment not found');
        }
        const ownerCompanyId = inspection.equipment.companyId;
        if (!ownerCompanyId) {
            throw new common_1.NotFoundException('Equipment has no owning company');
        }
        const resolvedProjectId = await this.resolveProjectId(inspection.equipmentId, inspection.siteId, projectId);
        const checklist = ((_a = inspection.checklist) !== null && _a !== void 0 ? _a : {});
        const emitted = [];
        const shouldScanItems = !inspection.passed;
        if (shouldScanItems) {
            for (const [itemId, value] of Object.entries(checklist)) {
                if (!this.itemFailed(value))
                    continue;
                const cail = await this.emitter.emit({
                    projectId: resolvedProjectId,
                    ownerCompanyId,
                    sourceType: 'equipment',
                    sourceId: String(inspectionId),
                    sourceItemId: itemId,
                    title: this.itemLabel(itemId, value).slice(0, 500),
                    description: (_b = inspection.correctiveActions) !== null && _b !== void 0 ? _b : undefined,
                    severity: 'high',
                    createdByUserId,
                    siteId: (_c = inspection.siteId) !== null && _c !== void 0 ? _c : undefined,
                    equipmentId: inspection.equipmentId,
                });
                await this.emitter.linkEquipmentInspection(inspectionId, itemId, cail.id);
                this.enrichEquipmentCail(cail.id, inspectionId, itemId, cail.title, resolvedProjectId, ownerCompanyId, inspection.equipmentId);
                emitted.push(cail);
            }
        }
        if (!emitted.length && !inspection.passed) {
            const cail = await this.emitter.emit({
                projectId: resolvedProjectId,
                ownerCompanyId,
                sourceType: 'equipment',
                sourceId: String(inspectionId),
                sourceItemId: '_overall',
                title: `Failed equipment inspection #${inspectionId}`,
                description: (_e = (_d = inspection.correctiveActions) !== null && _d !== void 0 ? _d : inspection.notes) !== null && _e !== void 0 ? _e : undefined,
                severity: 'high',
                createdByUserId,
                siteId: (_f = inspection.siteId) !== null && _f !== void 0 ? _f : undefined,
                equipmentId: inspection.equipmentId,
            });
            await this.emitter.linkEquipmentInspection(inspectionId, '_overall', cail.id);
            this.enrichEquipmentCail(cail.id, inspectionId, '_overall', cail.title, resolvedProjectId, ownerCompanyId, inspection.equipmentId);
            emitted.push(cail);
        }
        return { inspectionId, emittedCount: emitted.length, entries: emitted };
    }
    async listForEquipment(equipmentId) {
        return this.prisma.cailEntry.findMany({
            where: { equipmentId, sourceType: 'equipment' },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
};
exports.EquipmentBridgeService = EquipmentBridgeService;
exports.EquipmentBridgeService = EquipmentBridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService])
], EquipmentBridgeService);
//# sourceMappingURL=equipment-bridge.service.js.map