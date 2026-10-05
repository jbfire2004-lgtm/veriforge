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
exports.CoreDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const core_file_purposes_1 = require("../core-upload/core-file-purposes");
const document_storage_schema_1 = require("./document-storage.schema");
let CoreDocumentsService = class CoreDocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listDocuments(params) {
        var _a;
        const where = {
            status: client_1.CoreUploadStatus.COMPLETED,
        };
        const purpose = (0, core_file_purposes_1.normalizeCoreFilePurpose)(params.purpose);
        if (purpose)
            where.purpose = purpose;
        if (params.userId)
            where.userId = params.userId;
        if (params.projectId)
            where.projectId = params.projectId;
        if (params.companyId) {
            where.OR = [
                { companyId: params.companyId },
                { companyId: null, user: { companyId: params.companyId } },
                {
                    companyId: null,
                    trainingIngestionRuns: { some: { companyId: params.companyId } },
                },
            ];
        }
        const rows = await this.prisma.coreFile.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Math.min((_a = params.limit) !== null && _a !== void 0 ? _a : 50, 200),
            include: {
                user: { select: { id: true, email: true, companyId: true } },
                company: { select: { id: true, name: true } },
                project: { select: { id: true, name: true, code: true } },
                trainingIngestionRuns: {
                    select: {
                        id: true,
                        status: true,
                        ocrConfidence: true,
                        companyId: true,
                    },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        return rows.map((f) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const ingest = (_a = f.trainingIngestionRuns[0]) !== null && _a !== void 0 ? _a : null;
            const companyId = (_g = (_f = (_d = (_b = f.companyId) !== null && _b !== void 0 ? _b : (_c = f.company) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : (_e = f.user) === null || _e === void 0 ? void 0 : _e.companyId) !== null && _f !== void 0 ? _f : ingest === null || ingest === void 0 ? void 0 : ingest.companyId) !== null && _g !== void 0 ? _g : null;
            const schema = (0, document_storage_schema_1.toDocumentStorageRecord)({
                id: f.id,
                originalName: f.originalName,
                mimeType: f.mimeType,
                purpose: f.purpose,
                projectId: f.projectId,
                createdAt: f.createdAt,
                completedAt: f.completedAt,
                user: f.user,
            });
            return Object.assign(Object.assign({}, schema), { id: f.id, originalName: f.originalName, mimeType: f.mimeType, sizeBytes: f.sizeBytes, publicUrl: f.publicUrl, purpose: f.purpose, companyId, companyName: (_j = (_h = f.company) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : null, projectId: f.projectId, projectName: (_l = (_k = f.project) === null || _k === void 0 ? void 0 : _k.name) !== null && _l !== void 0 ? _l : null, projectCode: (_o = (_m = f.project) === null || _m === void 0 ? void 0 : _m.code) !== null && _o !== void 0 ? _o : null, createdAt: f.createdAt.toISOString(), completedAt: (_q = (_p = f.completedAt) === null || _p === void 0 ? void 0 : _p.toISOString()) !== null && _q !== void 0 ? _q : null, uploadedBy: schema.uploaded_by, ingestionRun: ingest
                    ? {
                        id: ingest.id,
                        status: ingest.status,
                        ocrConfidence: ingest.ocrConfidence,
                    }
                    : null });
        });
    }
};
exports.CoreDocumentsService = CoreDocumentsService;
exports.CoreDocumentsService = CoreDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoreDocumentsService);
//# sourceMappingURL=core-documents.service.js.map