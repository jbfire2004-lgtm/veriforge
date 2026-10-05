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
exports.PmInspectionFindingsLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_sharing_types_1 = require("./pm-inspection-sharing.types");
let PmInspectionFindingsLogService = class PmInspectionFindingsLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listProjectLog(projectId, filters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const inspections = await this.prisma.pmInspection.findMany({
            where: {
                projectId,
                deletedAt: null,
                status: { notIn: ['draft'] },
            },
            include: {
                attachments: { orderBy: { createdAt: 'asc' } },
                photoFindings: {
                    include: {
                        correctiveAction: {
                            select: {
                                id: true,
                                status: true,
                                subcontractorCompanyId: true,
                            },
                        },
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
            take: 200,
        });
        const correctionAttachments = await this.prisma.pmInspectionAttachment.findMany({
            where: {
                inspectionId: { in: inspections.map((i) => i.id) },
            },
            select: {
                id: true,
                inspectionId: true,
                dataUrl: true,
                createdAt: true,
                annotationJson: true,
            },
        });
        const correctionByOriginal = new Map();
        for (const att of correctionAttachments) {
            const ann = att.annotationJson;
            if ((ann === null || ann === void 0 ? void 0 : ann.kind) === 'correction_proof' && ann.originalAttachmentId) {
                correctionByOriginal.set(`${att.inspectionId}:${ann.originalAttachmentId}`, att);
            }
        }
        const dispatches = await this.prisma.pmInspectionContractorDispatch.findMany({
            where: {
                correctiveAction: { projectId },
            },
            select: {
                correctiveActionId: true,
                status: true,
                completedAt: true,
            },
        });
        const dispatchByCapa = new Map(dispatches.map((d) => [d.correctiveActionId, d]));
        const companyIds = new Set();
        const entries = [];
        for (const insp of inspections) {
            const sharing = (0, pm_inspection_sharing_types_1.parseInspectionSharing)(insp.sharingJson);
            const photos = insp.attachments.filter((a) => { var _a; return a.dataUrl || ((_a = a.mimeType) === null || _a === void 0 ? void 0 : _a.startsWith('image/')); });
            for (const att of photos) {
                const ann = ((_a = att.annotationJson) !== null && _a !== void 0 ? _a : {});
                if (ann.kind === 'correction_proof')
                    continue;
                const photoNumber = typeof ann.photoNumber === 'number' ? ann.photoNumber : null;
                const safetyStatus = ann.safetyStatus === 'safe' || ann.safetyStatus === 'at_risk'
                    ? ann.safetyStatus
                    : 'unknown';
                const responsibleCompanyId = typeof ann.responsibleCompanyId === 'number'
                    ? ann.responsibleCompanyId
                    : null;
                if (responsibleCompanyId)
                    companyIds.add(responsibleCompanyId);
                const finding = insp.photoFindings.find((f) => f.attachmentId === att.id);
                const capa = (_b = finding === null || finding === void 0 ? void 0 : finding.correctiveAction) !== null && _b !== void 0 ? _b : null;
                const dispatch = capa ? dispatchByCapa.get(capa.id) : undefined;
                const correction = correctionByOriginal.get(`${insp.id}:${att.id}`);
                if ((filters === null || filters === void 0 ? void 0 : filters.companyId) &&
                    responsibleCompanyId !== filters.companyId &&
                    (capa === null || capa === void 0 ? void 0 : capa.subcontractorCompanyId) !== filters.companyId) {
                    continue;
                }
                entries.push({
                    id: `${insp.id}:${att.id}`,
                    inspectionId: insp.id,
                    inspectionTitle: insp.title,
                    inspectionStatus: insp.status,
                    submittedAt: (_d = (_c = insp.submittedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                    attachmentId: att.id,
                    photoNumber,
                    locationDescription: String((_e = ann.locationDescription) !== null && _e !== void 0 ? _e : ''),
                    pictureDescription: String((_f = ann.pictureDescription) !== null && _f !== void 0 ? _f : ''),
                    safetyStatus,
                    responsibleCompanyId,
                    responsibleCompanyName: typeof ann.responsibleCompanyName === 'string'
                        ? ann.responsibleCompanyName
                        : null,
                    correctionPhotoDataUrl: (_g = correction === null || correction === void 0 ? void 0 : correction.dataUrl) !== null && _g !== void 0 ? _g : null,
                    correctionCompletedAt: (_j = (_h = dispatch === null || dispatch === void 0 ? void 0 : dispatch.completedAt) === null || _h === void 0 ? void 0 : _h.toISOString()) !== null && _j !== void 0 ? _j : null,
                    correctiveActionId: (_k = capa === null || capa === void 0 ? void 0 : capa.id) !== null && _k !== void 0 ? _k : null,
                    correctiveActionStatus: (_l = capa === null || capa === void 0 ? void 0 : capa.status) !== null && _l !== void 0 ? _l : null,
                    dispatchStatus: (_m = dispatch === null || dispatch === void 0 ? void 0 : dispatch.status) !== null && _m !== void 0 ? _m : null,
                    loggedAt: att.createdAt.toISOString(),
                });
            }
        }
        if (companyIds.size) {
            const companies = await this.prisma.company.findMany({
                where: { id: { in: [...companyIds] } },
                select: { id: true, name: true },
            });
            const names = new Map(companies.map((c) => [c.id, c.name]));
            for (const e of entries) {
                if (e.responsibleCompanyId && !e.responsibleCompanyName) {
                    e.responsibleCompanyName = (_o = names.get(e.responsibleCompanyId)) !== null && _o !== void 0 ? _o : null;
                }
            }
        }
        return {
            projectId,
            total: entries.length,
            entries: entries.sort((a, b) => {
                var _a, _b;
                const ta = (_a = a.submittedAt) !== null && _a !== void 0 ? _a : a.loggedAt;
                const tb = (_b = b.submittedAt) !== null && _b !== void 0 ? _b : b.loggedAt;
                return tb.localeCompare(ta);
            }),
            sharingNote: 'Project owners control contractor/worker report sharing per inspection.',
        };
    }
};
exports.PmInspectionFindingsLogService = PmInspectionFindingsLogService;
exports.PmInspectionFindingsLogService = PmInspectionFindingsLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmInspectionFindingsLogService);
//# sourceMappingURL=pm-inspection-findings-log.service.js.map