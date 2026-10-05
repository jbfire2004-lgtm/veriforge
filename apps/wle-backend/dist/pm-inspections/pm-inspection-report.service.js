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
exports.PmInspectionReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_sharing_types_1 = require("./pm-inspection-sharing.types");
let PmInspectionReportService = class PmInspectionReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildReport(inspectionId) {
        var _a, _b, _c, _d, _e;
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: inspectionId },
            include: {
                template: true,
                project: { select: { id: true, name: true } },
                inspector: { select: { id: true, username: true, email: true } },
                attachments: { orderBy: { createdAt: 'asc' } },
                photoFindings: {
                    include: {
                        correctiveAction: {
                            select: { id: true, status: true, title: true },
                        },
                    },
                },
            },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        const scoringRules = ((_a = inspection.template.scoringRules) !== null && _a !== void 0 ? _a : {});
        const attachments = inspection.attachments.filter((a) => { var _a; return a.dataUrl || ((_a = a.mimeType) === null || _a === void 0 ? void 0 : _a.startsWith('image/')); });
        const correctionByOriginal = new Map();
        for (const att of attachments) {
            const ann = att.annotationJson;
            if ((ann === null || ann === void 0 ? void 0 : ann.kind) === 'correction_proof' && ann.originalAttachmentId) {
                correctionByOriginal.set(ann.originalAttachmentId, att);
            }
        }
        const walkPhotos = attachments.filter((a) => {
            const ann = a.annotationJson;
            return (ann === null || ann === void 0 ? void 0 : ann.kind) !== 'correction_proof';
        });
        const companyNames = new Map();
        const companyIds = new Set();
        for (const att of attachments) {
            const ann = att.annotationJson;
            if (ann === null || ann === void 0 ? void 0 : ann.responsibleCompanyId)
                companyIds.add(ann.responsibleCompanyId);
        }
        if (companyIds.size) {
            const companies = await this.prisma.company.findMany({
                where: { id: { in: [...companyIds] } },
                select: { id: true, name: true },
            });
            for (const c of companies)
                companyNames.set(c.id, c.name);
        }
        let nextNumber = 1;
        const photos = walkPhotos.map((att) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            const ann = ((_a = att.annotationJson) !== null && _a !== void 0 ? _a : {});
            const photoNumber = (_b = ann.photoNumber) !== null && _b !== void 0 ? _b : nextNumber++;
            if (ann.photoNumber == null)
                nextNumber = Math.max(nextNumber, photoNumber + 1);
            const findingsForPhoto = inspection.photoFindings
                .filter((f) => f.attachmentId === att.id)
                .map((f) => {
                var _a, _b;
                return ({
                    id: f.id,
                    title: f.title,
                    description: f.description,
                    severity: f.severity,
                    category: f.category,
                    correctiveActionId: f.correctiveActionId,
                    correctiveActionStatus: (_b = (_a = f.correctiveAction) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : null,
                });
            });
            const companyId = (_c = ann.responsibleCompanyId) !== null && _c !== void 0 ? _c : null;
            const companyName = (_d = ann.responsibleCompanyName) !== null && _d !== void 0 ? _d : (companyId ? (_e = companyNames.get(companyId)) !== null && _e !== void 0 ? _e : null : null);
            const safetyStatus = (_f = ann.safetyStatus) !== null && _f !== void 0 ? _f : (findingsForPhoto.length > 0 ? 'at_risk' : 'safe');
            return {
                photoNumber,
                attachmentId: att.id,
                fileName: att.fileName,
                dataUrl: att.dataUrl,
                mimeType: att.mimeType,
                locationDescription: (_g = ann.locationDescription) !== null && _g !== void 0 ? _g : '',
                pictureDescription: (_m = (_k = (_h = ann.pictureDescription) !== null && _h !== void 0 ? _h : (_j = findingsForPhoto[0]) === null || _j === void 0 ? void 0 : _j.description) !== null && _k !== void 0 ? _k : (_l = findingsForPhoto[0]) === null || _l === void 0 ? void 0 : _l.title) !== null && _m !== void 0 ? _m : '',
                safetyStatus: safetyStatus,
                responsibleCompanyId: companyId,
                responsibleCompanyName: companyName,
                findings: findingsForPhoto,
                correctionPhotoDataUrl: (_p = (_o = correctionByOriginal.get(att.id)) === null || _o === void 0 ? void 0 : _o.dataUrl) !== null && _p !== void 0 ? _p : null,
            };
        });
        const summarySheet = photos.map((p) => {
            var _a, _b, _c, _d;
            return ({
                photoNumber: p.photoNumber,
                locationDescription: p.locationDescription,
                pictureDescription: p.pictureDescription,
                safetyStatus: p.safetyStatus,
                responsibleCompanyName: p.safetyStatus === 'at_risk' ? p.responsibleCompanyName : null,
                findingTitle: (_b = (_a = p.findings[0]) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : null,
                severity: (_d = (_c = p.findings[0]) === null || _c === void 0 ? void 0 : _c.severity) !== null && _d !== void 0 ? _d : null,
            });
        });
        const atRiskCount = summarySheet.filter((r) => r.safetyStatus === 'at_risk').length;
        const safeCount = summarySheet.length - atRiskCount;
        return {
            inspectionId: inspection.id,
            title: (_b = inspection.title) !== null && _b !== void 0 ? _b : inspection.template.name,
            status: inspection.status,
            submittedAt: inspection.submittedAt,
            project: inspection.project,
            inspector: inspection.inspector,
            template: {
                name: inspection.template.name,
                category: inspection.template.category,
                inspectionKind: (_c = scoringRules.inspectionKind) !== null && _c !== void 0 ? _c : 'checklist',
                industry: (_d = scoringRules.industry) !== null && _d !== void 0 ? _d : null,
                focusArea: (_e = scoringRules.focusArea) !== null && _e !== void 0 ? _e : null,
            },
            siteAnswers: inspection.answers,
            locationNote: inspection.locationNote,
            totals: {
                photoCount: photos.length,
                safeCount,
                atRiskCount,
            },
            photos,
            summarySheet,
            sharing: (0, pm_inspection_sharing_types_1.parseInspectionSharing)(inspection.sharingJson),
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.PmInspectionReportService = PmInspectionReportService;
exports.PmInspectionReportService = PmInspectionReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmInspectionReportService);
//# sourceMappingURL=pm-inspection-report.service.js.map