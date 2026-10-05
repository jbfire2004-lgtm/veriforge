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
exports.CailEmitterService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const vsi_event_service_1 = require("../events/vsi-event.service");
let CailEmitterService = class CailEmitterService {
    constructor(prisma, vsiEvents) {
        this.prisma = prisma;
        this.vsiEvents = vsiEvents;
    }
    async emit(input) {
        var _a, _b, _c, _d, _e;
        const sourceItemId = (_a = input.sourceItemId) !== null && _a !== void 0 ? _a : '';
        try {
            const entry = await this.prisma.cailEntry.create({
                data: {
                    projectId: input.projectId,
                    ownerCompanyId: input.ownerCompanyId,
                    sourceType: input.sourceType,
                    sourceId: input.sourceId,
                    sourceItemId,
                    title: input.title,
                    description: input.description,
                    severity: (_b = input.severity) !== null && _b !== void 0 ? _b : 'medium',
                    riskCategory: (_c = input.riskCategory) !== null && _c !== void 0 ? _c : undefined,
                    assignedUserId: input.assignedUserId,
                    createdByUserId: input.createdByUserId,
                    siteId: input.siteId,
                    locationNote: input.locationNote,
                    equipmentId: input.equipmentId,
                    workerId: input.workerId,
                    dueDate: input.dueDate,
                    evidenceBefore: ((_d = input.evidenceBefore) !== null && _d !== void 0 ? _d : []),
                    tags: ((_e = input.tags) !== null && _e !== void 0 ? _e : []),
                    status: 'open',
                },
            });
            this.vsiEvents.cailCreated({
                id: entry.id,
                projectId: entry.projectId,
                ownerCompanyId: entry.ownerCompanyId,
                sourceType: entry.sourceType,
                actorId: input.createdByUserId,
            });
            return entry;
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                const existing = await this.prisma.cailEntry.findFirst({
                    where: {
                        sourceType: input.sourceType,
                        sourceId: input.sourceId,
                        sourceItemId,
                    },
                });
                if (existing)
                    return existing;
            }
            throw e;
        }
    }
    async linkSafetyForm(safetyFormId, cailEntryId, fieldId) {
        return this.prisma.safetyFormCailLink.upsert({
            where: {
                safetyFormId_cailEntryId: { safetyFormId, cailEntryId },
            },
            create: { safetyFormId, cailEntryId, fieldId },
            update: { fieldId },
        });
    }
    async linkEquipmentInspection(inspectionId, checklistItemId, cailEntryId) {
        return this.prisma.equipmentInspectionCailLink.upsert({
            where: {
                inspectionId_checklistItemId: { inspectionId, checklistItemId },
            },
            create: { inspectionId, checklistItemId, cailEntryId },
            update: { cailEntryId },
        });
    }
};
exports.CailEmitterService = CailEmitterService;
exports.CailEmitterService = CailEmitterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vsi_event_service_1.VsiEventService])
], CailEmitterService);
//# sourceMappingURL=cail-emitter.service.js.map