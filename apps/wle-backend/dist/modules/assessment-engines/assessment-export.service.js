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
exports.AssessmentExportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const build_text_pdf_1 = require("../../common/pdf/build-text-pdf");
let AssessmentExportService = class AssessmentExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trainingPdf(workerId) {
        const run = await this.prisma.veraAssessmentRun.findFirst({
            where: { workerId, engine: client_1.VeraAssessmentEngine.TRAINING_ASSESSMENT },
            orderBy: { evaluatedAt: 'desc' },
        });
        if (!run)
            throw new common_1.NotFoundException('No training assessment on file');
        const result = run.resultJson;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { firstName: true, lastName: true },
        });
        const lines = [
            `Worker: ${worker ? `${worker.firstName} ${worker.lastName}` : workerId}`,
            `Status: ${result.overallStatus} · Score ${result.overallScore}/100`,
            `Evaluated: ${run.evaluatedAt.toISOString()}`,
            '',
            'Requirements:',
            ...result.requirementResults.map((r) => `- ${r.name}: ${r.status} (${r.score}) [${r.validityStatus}, ${r.competencyStatus}]`),
            '',
            'Corrective actions:',
            ...(result.correctiveActions.length
                ? result.correctiveActions.map((c) => `- [${c.priority}] ${c.description}`)
                : ['- None']),
        ];
        return (0, build_text_pdf_1.buildTextPdfBuffer)({
            title: 'VERA Training Assessment Report',
            subtitle: `Run ${run.id}`,
            lines,
        });
    }
    async spcePdf(companyId) {
        var _a;
        const run = await this.prisma.veraAssessmentRun.findFirst({
            where: {
                companyId,
                engine: client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
            },
            orderBy: { evaluatedAt: 'desc' },
        });
        if (!run)
            throw new common_1.NotFoundException('No SPCE assessment on file');
        const result = run.resultJson;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true },
        });
        const lines = [
            `Company: ${(_a = company === null || company === void 0 ? void 0 : company.name) !== null && _a !== void 0 ? _a : companyId}`,
            `Status: ${result.overallStatus} · Score ${result.overallScore}/100`,
            '',
            ...result.requirementResults
                .slice(0, 40)
                .map((r) => `- ${r.type} ${r.category}: ${r.status} (${r.score})`),
        ];
        return (0, build_text_pdf_1.buildTextPdfBuffer)({
            title: 'VERA Safety Program Compliance Report',
            lines,
        });
    }
    async smartGapPdf(companyId, projectId) {
        const run = await this.prisma.veraAssessmentRun.findFirst({
            where: {
                companyId,
                projectId: projectId !== null && projectId !== void 0 ? projectId : undefined,
                engine: client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS,
            },
            orderBy: { evaluatedAt: 'desc' },
        });
        if (!run)
            throw new common_1.NotFoundException('No smart gap assessment on file');
        const result = run.resultJson;
        const lines = [
            `Gap score: ${result.overallGapScore} · ${result.overallStatus}`,
            '',
            'Category scores:',
            ...Object.entries(result.categoryScores).map(([k, v]) => `- ${k}: ${v}${result.categoryNotes[k]
                ? ` (${result.categoryNotes[k]})`
                : ''}`),
            '',
            'Roadmap:',
            ...result.correctiveActionRoadmap
                .slice(0, 15)
                .map((i) => `- [${i.priority}] ${i.description}`),
        ];
        return (0, build_text_pdf_1.buildTextPdfBuffer)({
            title: 'VERA Smart Gap Analysis Report',
            lines,
        });
    }
};
exports.AssessmentExportService = AssessmentExportService;
exports.AssessmentExportService = AssessmentExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssessmentExportService);
//# sourceMappingURL=assessment-export.service.js.map