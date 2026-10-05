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
exports.TrainingProviderCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const training_pipeline_service_1 = require("../vera-core/training-pipeline.service");
const training_wallet_integration_service_1 = require("../vera-core/training-wallet-integration.service");
const training_provider_certificate_service_1 = require("./training-provider-certificate.service");
const training_provider_compliance_service_1 = require("./training-provider-compliance.service");
const training_standards_compliance_service_1 = require("../training-standards-compliance/training-standards-compliance.service");
const client_2 = require("@prisma/client");
const audit_log_service_1 = require("../../audit/audit-log.service");
const provider_legislation_1 = require("../../training-provider/provider.legislation");
let TrainingProviderCoreService = class TrainingProviderCoreService {
    constructor(prisma, pipeline, compliance, certificates, standardsCompliance, walletIntegration, audit) {
        this.prisma = prisma;
        this.pipeline = pipeline;
        this.compliance = compliance;
        this.certificates = certificates;
        this.standardsCompliance = standardsCompliance;
        this.walletIntegration = walletIntegration;
        this.audit = audit;
    }
    async dashboard(providerId) {
        const provider = await this.requireProvider(providerId);
        const [courseCount, instructorCount, recordCount, latestCompliance] = await Promise.all([
            this.prisma.trainingCourse.count({
                where: { providerId, active: true },
            }),
            this.prisma.trainingInstructor.count({
                where: { providerId, active: true },
            }),
            this.prisma.trainingRecord.count({
                where: { trainingProviderId: providerId },
            }),
            this.compliance.latestCompliance(providerId),
        ]);
        const recentRecords = await this.prisma.trainingRecord.findMany({
            where: { trainingProviderId: providerId },
            orderBy: { issuedAt: 'desc' },
            take: 10,
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
                certification: { select: { id: true, name: true } },
                course: { select: { id: true, name: true, code: true } },
            },
        });
        return {
            provider,
            stats: {
                activeCourses: courseCount,
                activeInstructors: instructorCount,
                trainingRecordsIssued: recordCount,
            },
            compliance: latestCompliance,
            recentRecords,
        };
    }
    listProviders() {
        return this.prisma.trainingProvider.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { courses: true, instructors: true, trainingRecords: true },
                },
            },
        });
    }
    async createProvider(dto) {
        const qrToken = `tp_${(0, crypto_1.randomBytes)(12).toString('hex')}`;
        return this.prisma.trainingProvider.create({
            data: {
                name: dto.name,
                code: dto.code,
                email: dto.email,
                phone: dto.phone,
                website: dto.website,
                address: dto.address,
                qrToken,
            },
        });
    }
    getProvider(id) {
        return this.prisma.trainingProvider.findUnique({
            where: { id },
            include: {
                courses: { where: { active: true }, include: { standards: true } },
                instructors: { where: { active: true } },
                approvals: { orderBy: { createdAt: 'desc' }, take: 5 },
                complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
            },
        });
    }
    async updateProfile(providerId, dto) {
        await this.requireProvider(providerId);
        return this.prisma.trainingProvider.update({
            where: { id: providerId },
            data: dto,
        });
    }
    async approveProvider(providerId, dto, reviewerId) {
        var _a;
        await this.requireProvider(providerId);
        const [approval] = await this.prisma.$transaction([
            this.prisma.providerApproval.create({
                data: {
                    providerId,
                    status: dto.status,
                    reviewedBy: reviewerId,
                    notes: dto.notes,
                },
            }),
            this.prisma.trainingProvider.update({
                where: { id: providerId },
                data: { approvalStatus: dto.status },
            }),
        ]);
        await this.compliance.assessProvider(providerId, `Approval: ${dto.status}`);
        await this.audit.logAudit({ id: reviewerId }, 'provider.approval.update', { type: 'TrainingProvider', id: providerId }, { status: dto.status, notes: (_a = dto.notes) !== null && _a !== void 0 ? _a : null });
        return approval;
    }
    listCourses(providerId) {
        return this.prisma.trainingCourse.findMany({
            where: { providerId },
            include: { standards: true, certification: true, instructors: true },
            orderBy: { name: 'asc' },
        });
    }
    async addCourse(providerId, dto) {
        var _a, _b;
        await this.requireProvider(providerId);
        if (dto.contentText) {
            const assessment = new provider_legislation_1.TrainingLegislationEngine().assessProgram(dto.contentText);
            if (!assessment.passed) {
                throw new common_1.BadRequestException({
                    code: 'COURSE_CONTENT_BELOW_STANDARD',
                    score: assessment.score,
                    missing: assessment.missing,
                });
            }
        }
        return this.prisma.trainingCourse.create({
            data: {
                providerId,
                code: dto.code,
                name: dto.name,
                description: dto.description,
                certificationId: dto.certificationId,
                durationHours: dto.durationHours,
                validityDays: dto.validityDays,
                contentText: dto.contentText,
                standards: ((_a = dto.standards) === null || _a === void 0 ? void 0 : _a.length)
                    ? { create: dto.standards }
                    : undefined,
                instructors: ((_b = dto.instructorIds) === null || _b === void 0 ? void 0 : _b.length)
                    ? { connect: dto.instructorIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: { standards: true, instructors: true, certification: true },
        });
    }
    listInstructors(providerId) {
        return this.prisma.trainingInstructor.findMany({
            where: { providerId },
            include: { courses: true },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        });
    }
    async addInstructor(providerId, dto) {
        var _a, _b;
        await this.requireProvider(providerId);
        const status = dto.qualificationExpiresAt &&
            new Date(dto.qualificationExpiresAt) < new Date()
            ? client_1.InstructorQualificationStatus.EXPIRED
            : client_1.InstructorQualificationStatus.ACTIVE;
        return this.prisma.trainingInstructor.create({
            data: {
                providerId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                licenseNumber: dto.licenseNumber,
                qualifiedCourseCodes: (_a = dto.qualifiedCourseCodes) !== null && _a !== void 0 ? _a : [],
                qualificationExpiresAt: dto.qualificationExpiresAt
                    ? new Date(dto.qualificationExpiresAt)
                    : undefined,
                qualificationStatus: status,
                courses: ((_b = dto.courseIds) === null || _b === void 0 ? void 0 : _b.length)
                    ? { connect: dto.courseIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: { courses: true },
        });
    }
    async validateInstructorQualification(instructorId) {
        const instructor = await this.prisma.trainingInstructor.findUnique({
            where: { id: instructorId },
            include: { courses: true },
        });
        if (!instructor)
            throw new common_1.NotFoundException('Instructor not found');
        let status = instructor.qualificationStatus;
        if (instructor.qualificationExpiresAt &&
            instructor.qualificationExpiresAt < new Date()) {
            status = client_1.InstructorQualificationStatus.EXPIRED;
            await this.prisma.trainingInstructor.update({
                where: { id: instructorId },
                data: { qualificationStatus: status },
            });
        }
        const courseChecks = instructor.courses.map((c) => (Object.assign({ courseId: c.id, courseCode: c.code }, this.compliance.validateInstructorForCourse(instructor, c.code))));
        return {
            instructorId,
            qualificationStatus: status,
            valid: status === client_1.InstructorQualificationStatus.ACTIVE,
            courseChecks,
        };
    }
    async uploadTraining(providerId, dto) {
        var _a;
        const provider = await this.requireProvider(providerId);
        if (provider.approvalStatus !== client_1.ProviderApprovalStatus.APPROVED) {
            throw new common_1.ForbiddenException('Provider must be approved before issuing training');
        }
        const course = await this.prisma.trainingCourse.findFirst({
            where: { id: dto.courseId, providerId },
            include: { certification: true },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found for this provider');
        if (!course.certificationId) {
            throw new common_1.BadRequestException('Course has no linked certification');
        }
        if (dto.instructorId) {
            const instructor = await this.prisma.trainingInstructor.findFirst({
                where: { id: dto.instructorId, providerId },
            });
            if (!instructor)
                throw new common_1.NotFoundException('Instructor not found');
            const check = this.compliance.validateInstructorForCourse(instructor, course.code);
            if (!check.valid) {
                throw new common_1.BadRequestException({
                    code: 'INSTRUCTOR_NOT_QUALIFIED',
                    reason: check.reason,
                });
            }
        }
        const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
        let expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
        if (!expiresAt && course.validityDays) {
            expiresAt = new Date(issuedAt);
            expiresAt.setDate(expiresAt.getDate() + course.validityDays);
        }
        const ingest = await this.pipeline.ingest({
            workerId: dto.workerId,
            certificationId: course.certificationId,
            companyId: dto.companyId,
            equipmentId: dto.equipmentId,
            expiresAt,
            issuedAt,
            certificateNumber: dto.certificateNumber,
            trainingProviderId: providerId,
            courseId: course.id,
            instructorId: dto.instructorId,
            projectId: dto.projectId,
        });
        if (!ingest.ok || !ingest.trainingRecord) {
            throw new common_1.BadRequestException((_a = ingest.error) !== null && _a !== void 0 ? _a : 'INGEST_FAILED');
        }
        const token = this.certificates.newQrToken();
        const record = await this.prisma.trainingRecord.update({
            where: { id: ingest.trainingRecord.id },
            data: {
                trainingProviderId: providerId,
                courseId: course.id,
                instructorId: dto.instructorId,
                companyId: dto.companyId,
                projectId: dto.projectId,
                certificateQrToken: token,
            },
            include: {
                worker: true,
                certification: true,
                course: true,
            },
        });
        const validation = await this.standardsCompliance.validateTraining(record.id, undefined);
        if (validation.outcome === client_2.TrainingValidationOutcome.REJECTED) {
            throw new common_1.BadRequestException({
                code: 'TRAINING_STANDARDS_REJECTED',
                validation,
            });
        }
        const walletTraining = await this.walletIntegration.syncAfterTrainingRecord(record.id, dto.equipmentId);
        return {
            record,
            verificationPath: this.certificates.verificationPath(token),
            validation,
            walletTraining,
        };
    }
    async issueCertificate(providerId, dto, actorId) {
        var _a, _b, _c;
        const record = await this.prisma.trainingRecord.findFirst({
            where: { id: dto.trainingRecordId, trainingProviderId: providerId },
        });
        if (!record)
            throw new common_1.NotFoundException('Training record not found');
        const token = (_a = record.certificateQrToken) !== null && _a !== void 0 ? _a : this.certificates.newQrToken();
        await this.prisma.trainingRecord.update({
            where: { id: record.id },
            data: {
                certificateUrl: dto.certificateUrl,
                certificateQrToken: token,
                completedAt: (_b = record.completedAt) !== null && _b !== void 0 ? _b : new Date(),
            },
        });
        const digital = await this.certificates.buildDigitalCertificate(record.id);
        const qrDataUrl = await this.certificates.generateQrDataUrl(record.id);
        await this.audit.logAudit(actorId != null ? { id: actorId } : null, 'credential.issue', {
            type: 'TrainingRecord',
            id: record.id,
            tenantId: (_c = record.companyId) !== null && _c !== void 0 ? _c : undefined,
        }, { providerId, certificateUrl: dto.certificateUrl ? '[redacted]' : null });
        return { digitalCertificate: digital, qrDataUrl };
    }
    validateCertificate(token) {
        return this.certificates.validateByToken(token);
    }
    async certificateBundle(recordId) {
        const digital = await this.certificates.buildDigitalCertificate(recordId);
        const qrDataUrl = await this.certificates.generateQrDataUrl(recordId);
        return { digitalCertificate: digital, qrDataUrl };
    }
    async attachCertificateUrl(recordId, certificateUrl) {
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: recordId },
        });
        if (!record)
            throw new common_1.NotFoundException('Training record not found');
        if (!record.trainingProviderId) {
            throw new common_1.BadRequestException('Record not linked to a training provider');
        }
        return this.issueCertificate(record.trainingProviderId, {
            trainingRecordId: recordId,
            certificateUrl,
        });
    }
    async assessCompliance(providerId, notes) {
        await this.requireProvider(providerId);
        return this.compliance.assessProvider(providerId, notes);
    }
    getComplianceHistory(providerId) {
        return this.prisma.providerComplianceStatus.findMany({
            where: { providerId },
            orderBy: { assessedAt: 'desc' },
            take: 20,
        });
    }
    trainingHistory(providerId, limit = 50) {
        return this.prisma.trainingRecord.findMany({
            where: { trainingProviderId: providerId },
            take: limit,
            orderBy: { issuedAt: 'desc' },
            include: {
                worker: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                certification: true,
                course: true,
                instructor: true,
                company: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        });
    }
    async assertAccess(user, providerId) {
        if (user.role === client_1.UserRole.SUPER_ADMIN ||
            user.role === client_1.UserRole.ADMIN ||
            user.role === client_1.UserRole.COMPANY_ADMIN) {
            return;
        }
        if ((user.role === client_1.UserRole.TRAINING_PROVIDER_ADMIN ||
            user.role === client_1.UserRole.TRAINING_INSTRUCTOR) &&
            user.trainingProviderId === providerId) {
            return;
        }
        if (user.role === client_1.UserRole.TRAINING_INSTRUCTOR) {
            const instructorProviderId = await this.instructorProviderIdForUser(user);
            if (instructorProviderId === providerId)
                return;
        }
        throw new common_1.ForbiddenException('Not authorized for this training provider');
    }
    async resolveProviderId(user, queryProviderId) {
        if (queryProviderId) {
            await this.assertAccess(user, queryProviderId);
            return queryProviderId;
        }
        if (user.trainingProviderId)
            return user.trainingProviderId;
        const instructorProviderId = await this.instructorProviderIdForUser(user);
        if (instructorProviderId)
            return instructorProviderId;
        if (user.role === client_1.UserRole.SUPER_ADMIN || user.role === client_1.UserRole.ADMIN) {
            const provider = await this.prisma.trainingProvider.findFirst({
                select: { id: true },
                orderBy: { id: 'asc' },
            });
            if (provider)
                return provider.id;
            throw new common_1.BadRequestException('No training providers exist');
        }
        if (user.role === client_1.UserRole.TRAINING_PROVIDER_ADMIN) {
            throw new common_1.BadRequestException('Your account is not linked to a training provider. Complete registration or contact support.');
        }
        throw new common_1.BadRequestException('providerId required');
    }
    async instructorProviderIdForUser(user) {
        var _a;
        if (user.role !== client_1.UserRole.TRAINING_INSTRUCTOR)
            return null;
        const instructor = await this.prisma.trainingInstructor.findFirst({
            where: {
                active: true,
                OR: [
                    ...(user.instructorId ? [{ id: user.instructorId }] : []),
                    { userId: user.id },
                ],
            },
            select: { providerId: true },
        });
        return (_a = instructor === null || instructor === void 0 ? void 0 : instructor.providerId) !== null && _a !== void 0 ? _a : null;
    }
    async requireProvider(id) {
        const p = await this.prisma.trainingProvider.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Training provider not found');
        return p;
    }
};
exports.TrainingProviderCoreService = TrainingProviderCoreService;
exports.TrainingProviderCoreService = TrainingProviderCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_pipeline_service_1.TrainingPipelineService,
        training_provider_compliance_service_1.TrainingProviderComplianceService,
        training_provider_certificate_service_1.TrainingProviderCertificateService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        audit_log_service_1.AuditLogService])
], TrainingProviderCoreService);
//# sourceMappingURL=training-provider-core.service.js.map