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
exports.TrainingProviderComplianceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const provider_legislation_1 = require("../../training-provider/provider.legislation");
let TrainingProviderComplianceService = class TrainingProviderComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.legislation = new provider_legislation_1.TrainingLegislationEngine();
    }
    async assessProvider(providerId, notes) {
        var _a;
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: providerId },
            include: {
                courses: { include: { standards: true } },
                instructors: true,
                approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        if (!provider)
            return null;
        const gaps = [];
        let score = 100;
        if (provider.approvalStatus !== client_1.ProviderApprovalStatus.APPROVED) {
            gaps.push('Provider not approved');
            score -= 30;
        }
        const expiredInstructors = provider.instructors.filter((i) => i.qualificationStatus === client_1.InstructorQualificationStatus.EXPIRED ||
            (i.qualificationExpiresAt && i.qualificationExpiresAt < new Date()));
        if (expiredInstructors.length > 0) {
            gaps.push(`${expiredInstructors.length} instructor(s) with expired qualifications`);
            score -= 15;
        }
        const coursesWithoutStandards = provider.courses.filter((c) => c.active && c.standards.length === 0);
        if (coursesWithoutStandards.length > 0) {
            gaps.push(`${coursesWithoutStandards.length} active course(s) missing standards`);
            score -= 10;
        }
        for (const course of provider.courses) {
            if (!((_a = course.contentText) === null || _a === void 0 ? void 0 : _a.trim()))
                continue;
            const assessment = this.legislation.assessProgram(course.contentText);
            if (!assessment.passed) {
                gaps.push(`Course ${course.code} content below standards threshold (${assessment.score}%)`);
                score -= 5;
            }
        }
        score = Math.max(0, Math.min(100, score));
        const status = score >= 85 && gaps.length === 0
            ? client_1.ProviderComplianceLevel.COMPLIANT
            : score >= 60
                ? client_1.ProviderComplianceLevel.NEEDS_ATTENTION
                : client_1.ProviderComplianceLevel.NON_COMPLIANT;
        const row = await this.prisma.providerComplianceStatus.create({
            data: {
                providerId,
                status,
                score,
                gaps: gaps,
                notes,
            },
        });
        return Object.assign(Object.assign({}, row), { gaps });
    }
    async latestCompliance(providerId) {
        return this.prisma.providerComplianceStatus.findFirst({
            where: { providerId },
            orderBy: { assessedAt: 'desc' },
        });
    }
    validateInstructorForCourse(instructor, courseCode) {
        if (!instructor.active) {
            return { valid: false, reason: 'INSTRUCTOR_INACTIVE' };
        }
        if (instructor.qualificationStatus === client_1.InstructorQualificationStatus.SUSPENDED) {
            return { valid: false, reason: 'INSTRUCTOR_SUSPENDED' };
        }
        if (instructor.qualificationExpiresAt &&
            instructor.qualificationExpiresAt < new Date()) {
            return { valid: false, reason: 'QUALIFICATION_EXPIRED' };
        }
        if (instructor.qualifiedCourseCodes.length > 0 &&
            !instructor.qualifiedCourseCodes.includes(courseCode)) {
            return { valid: false, reason: 'NOT_QUALIFIED_FOR_COURSE' };
        }
        return { valid: true };
    }
};
exports.TrainingProviderComplianceService = TrainingProviderComplianceService;
exports.TrainingProviderComplianceService = TrainingProviderComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingProviderComplianceService);
//# sourceMappingURL=training-provider-compliance.service.js.map