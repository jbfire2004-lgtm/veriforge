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
exports.TrainingStandardsComplianceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const phase1_monitoring_service_1 = require("../../common/monitoring/phase1-monitoring.service");
const credential_ledger_service_1 = require("../credential-ledger/credential-ledger.service");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
const provider_legislation_1 = require("../../training-provider/provider.legislation");
const standards_matching_engine_1 = require("./engines/standards-matching.engine");
const jurisdiction_matching_engine_1 = require("./engines/jurisdiction-matching.engine");
const expiry_rule_engine_1 = require("./engines/expiry-rule.engine");
const certificate_validation_engine_1 = require("./engines/certificate-validation.engine");
const provider_qualification_validator_1 = require("./validators/provider-qualification.validator");
const instructor_qualification_validator_1 = require("./validators/instructor-qualification.validator");
let TrainingStandardsComplianceService = class TrainingStandardsComplianceService {
    constructor(prisma, monitoring, credentialLedger, standardsEngine, jurisdictionEngine, expiryEngine, certificateEngine, providerValidator, instructorValidator, events) {
        this.prisma = prisma;
        this.monitoring = monitoring;
        this.credentialLedger = credentialLedger;
        this.standardsEngine = standardsEngine;
        this.jurisdictionEngine = jurisdictionEngine;
        this.expiryEngine = expiryEngine;
        this.certificateEngine = certificateEngine;
        this.providerValidator = providerValidator;
        this.instructorValidator = instructorValidator;
        this.events = events;
        this.legislation = new provider_legislation_1.TrainingLegislationEngine();
    }
    async dashboard() {
        const [pending, approved, rejected, needsReview, recent] = await Promise.all([
            this.prisma.trainingValidationResult.count({
                where: { outcome: client_1.TrainingValidationOutcome.PENDING },
            }),
            this.prisma.trainingValidationResult.count({
                where: { outcome: client_1.TrainingValidationOutcome.APPROVED },
            }),
            this.prisma.trainingValidationResult.count({
                where: { outcome: client_1.TrainingValidationOutcome.REJECTED },
            }),
            this.prisma.trainingValidationResult.count({
                where: { outcome: client_1.TrainingValidationOutcome.NEEDS_REVIEW },
            }),
            this.prisma.trainingValidationResult.findMany({
                orderBy: { validatedAt: 'desc' },
                take: 15,
                include: {
                    rejections: { include: { rejectionReason: true } },
                    trainingRecord: {
                        include: { worker: true, certification: true },
                    },
                },
            }),
        ]);
        return { pending, approved, rejected, needsReview, recent };
    }
    async validateTraining(trainingRecordId, jurisdictionCode, validatedBy) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                certification: true,
                course: { include: { standards: true } },
                instructor: true,
                trainingProvider: true,
                project: { include: { site: true } },
                company: true,
            },
        });
        if (!record)
            throw new common_1.NotFoundException('Training record not found');
        const jurisdiction = await this.resolveJurisdiction(jurisdictionCode, (_b = (_a = record.project) === null || _a === void 0 ? void 0 : _a.site) === null || _b === void 0 ? void 0 : _b.region);
        const catalog = await this.prisma.trainingStandard.findMany({
            where: { active: true },
        });
        const courseKeys = (_d = (_c = record.course) === null || _c === void 0 ? void 0 : _c.standards.map((s) => s.standardKey)) !== null && _d !== void 0 ? _d : [];
        const standardsMatch = this.standardsEngine.match({
            courseStandardKeys: courseKeys,
            contentText: (_e = record.course) === null || _e === void 0 ? void 0 : _e.contentText,
            certificationName: record.certification.name,
            catalogStandards: catalog,
        });
        const issues = [];
        for (const code of standardsMatch.missing) {
            issues.push({
                code: 'CSA_STANDARD_MISSING',
                message: `Missing CSA alignment: ${code}`,
            });
        }
        const jurisdictionRows = await this.prisma.jurisdictionRequirement.findMany();
        const jurisdictionMatch = this.jurisdictionEngine.match(jurisdiction, jurisdictionRows, standardsMatch.matched);
        for (const code of jurisdictionMatch.missing) {
            issues.push({
                code: 'JURISDICTION_REQUIREMENT_MISSING',
                message: `Jurisdiction ${jurisdiction} requires ${code}`,
            });
        }
        if ((_f = record.course) === null || _f === void 0 ? void 0 : _f.contentText) {
            const prog = this.legislation.assessProgram(record.course.contentText);
            if (!prog.passed) {
                issues.push({
                    code: 'PROGRAM_CONTENT_INSUFFICIENT',
                    message: `Program score ${prog.score}% below threshold`,
                });
            }
        }
        else if (record.course && courseKeys.length === 0) {
            issues.push({
                code: 'COURSE_STANDARDS_MISSING',
                message: 'Course has no mapped standards',
            });
        }
        const expiry = this.expiryEngine.check({
            issuedAt: record.issuedAt,
            expiresAt: record.expiresAt,
            maxValidityDays: (_g = record.course) === null || _g === void 0 ? void 0 : _g.validityDays,
        });
        if (expiry.expired) {
            issues.push({ code: 'CERTIFICATE_EXPIRED', message: 'Training expired' });
        }
        if (expiry.exceedsMaxValidity) {
            issues.push({
                code: 'EXPIRY_EXCEEDED',
                message: 'Expiry exceeds allowed validity window',
            });
        }
        if (record.trainingProvider) {
            const providerRules = await this.loadProviderRules(record.trainingProviderId);
            const pv = this.providerValidator.validate(record.trainingProvider, providerRules, standardsMatch.matched);
            issues.push(...pv.issues);
        }
        if (record.instructor && record.course) {
            const instructorRules = await this.loadInstructorRules(record.trainingProviderId);
            const iv = this.instructorValidator.validate(record.instructor, record.course.code, instructorRules, standardsMatch.matched);
            issues.push(...iv.issues);
        }
        const certCheck = this.certificateEngine.validate({
            recordExists: true,
            certificateQrToken: record.certificateQrToken,
            certificateNumber: record.certificateNumber,
            issuedAt: record.issuedAt,
            expiresAt: record.expiresAt,
        });
        if (!certCheck.valid && certCheck.reasonCode) {
            issues.push({
                code: certCheck.reasonCode,
                message: 'Certificate validation failed',
            });
        }
        const score = Math.round((standardsMatch.score + jurisdictionMatch.score) / 2);
        const outcome = this.resolveOutcome(issues, score);
        const missing = [
            ...new Set([...standardsMatch.missing, ...jurisdictionMatch.missing]),
        ];
        const saved = await this.persistResult({
            subjectType: client_1.TrainingValidationSubject.TRAINING_RECORD,
            trainingRecordId,
            trainingProviderId: (_h = record.trainingProviderId) !== null && _h !== void 0 ? _h : undefined,
            instructorId: (_j = record.instructorId) !== null && _j !== void 0 ? _j : undefined,
            courseId: (_k = record.courseId) !== null && _k !== void 0 ? _k : undefined,
            certificateQrToken: (_l = record.certificateQrToken) !== null && _l !== void 0 ? _l : undefined,
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: missing,
            issues,
            validatedBy,
            details: { standardsMatch, jurisdictionMatch, expiry, certCheck },
        });
        return {
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: missing,
            issues,
            validationResultId: saved.id,
        };
    }
    async validateProvider(trainingProviderId, jurisdictionCode, validatedBy) {
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: trainingProviderId },
            include: { courses: { include: { standards: true } } },
        });
        if (!provider)
            throw new common_1.NotFoundException('Provider not found');
        const jurisdiction = jurisdictionCode !== null && jurisdictionCode !== void 0 ? jurisdictionCode : this.jurisdictionEngine.normalizeJurisdiction(null);
        const catalog = await this.prisma.trainingStandard.findMany({
            where: { active: true },
        });
        const allKeys = provider.courses.flatMap((c) => c.standards.map((s) => s.standardKey));
        const standardsMatch = this.standardsEngine.match({
            courseStandardKeys: allKeys,
            contentText: provider.courses.map((c) => { var _a; return (_a = c.contentText) !== null && _a !== void 0 ? _a : ''; }).join(' '),
            catalogStandards: catalog,
        });
        const providerRules = await this.loadProviderRules(trainingProviderId);
        const pv = this.providerValidator.validate(provider, providerRules, standardsMatch.matched);
        const jurisdictionRows = await this.prisma.jurisdictionRequirement.findMany();
        const jurisdictionMatch = this.jurisdictionEngine.match(jurisdiction, jurisdictionRows, standardsMatch.matched);
        const issues = [
            ...pv.issues,
            ...jurisdictionMatch.missing.map((code) => ({
                code: 'JURISDICTION_REQUIREMENT_MISSING',
                message: `Missing ${code} for ${jurisdiction}`,
            })),
        ];
        const score = Math.round((standardsMatch.score + jurisdictionMatch.score) / 2);
        const outcome = this.resolveOutcome(issues, score);
        const saved = await this.persistResult({
            subjectType: client_1.TrainingValidationSubject.PROVIDER,
            trainingProviderId,
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: jurisdictionMatch.missing,
            issues,
            validatedBy,
        });
        return {
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: jurisdictionMatch.missing,
            issues,
            validationResultId: saved.id,
        };
    }
    async validateInstructor(instructorId, courseCode, jurisdictionCode, validatedBy) {
        var _a, _b;
        const instructor = await this.prisma.trainingInstructor.findUnique({
            where: { id: instructorId },
            include: { courses: true, provider: true },
        });
        if (!instructor)
            throw new common_1.NotFoundException('Instructor not found');
        const code = (_b = courseCode !== null && courseCode !== void 0 ? courseCode : (_a = instructor.courses[0]) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : '';
        const catalog = await this.prisma.trainingStandard.findMany({
            where: { active: true },
        });
        const courseKeys = instructor.courses.flatMap((c) => [c.code]);
        const standardsMatch = this.standardsEngine.match({
            courseStandardKeys: courseKeys,
            catalogStandards: catalog,
        });
        const instructorRules = await this.loadInstructorRules(instructor.providerId);
        const iv = this.instructorValidator.validate(instructor, code, instructorRules, standardsMatch.matched);
        const jurisdiction = jurisdictionCode !== null && jurisdictionCode !== void 0 ? jurisdictionCode : this.jurisdictionEngine.normalizeJurisdiction(null);
        const issues = [...iv.issues];
        const score = iv.valid ? 100 : Math.max(0, 100 - issues.length * 15);
        const outcome = this.resolveOutcome(issues, score);
        const saved = await this.persistResult({
            subjectType: client_1.TrainingValidationSubject.INSTRUCTOR,
            instructorId,
            trainingProviderId: instructor.providerId,
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: standardsMatch.missing,
            issues,
            validatedBy,
        });
        return {
            outcome,
            score,
            jurisdictionCode: jurisdiction,
            matchedStandardCodes: standardsMatch.matched,
            missingStandardCodes: standardsMatch.missing,
            issues,
            validationResultId: saved.id,
        };
    }
    async validateCertificate(certificateQrToken, trainingRecordId, validatedBy) {
        const record = trainingRecordId
            ? await this.prisma.trainingRecord.findUnique({
                where: { id: trainingRecordId },
            })
            : certificateQrToken
                ? await this.prisma.trainingRecord.findUnique({
                    where: { certificateQrToken },
                })
                : null;
        if (!record) {
            const issues = [
                {
                    code: 'CERTIFICATE_INVALID',
                    message: 'Certificate or record not found',
                },
            ];
            const saved = await this.persistResult({
                subjectType: client_1.TrainingValidationSubject.CERTIFICATE,
                certificateQrToken,
                outcome: client_1.TrainingValidationOutcome.REJECTED,
                score: 0,
                jurisdictionCode: 'ON',
                matchedStandardCodes: [],
                missingStandardCodes: [],
                issues,
                validatedBy,
            });
            return {
                outcome: client_1.TrainingValidationOutcome.REJECTED,
                score: 0,
                jurisdictionCode: 'ON',
                matchedStandardCodes: [],
                missingStandardCodes: [],
                issues,
                validationResultId: saved.id,
            };
        }
        return this.validateTraining(record.id, undefined, validatedBy);
    }
    getValidationResult(id) {
        return this.prisma.trainingValidationResult.findUnique({
            where: { id },
            include: {
                rejections: { include: { rejectionReason: true } },
                trainingRecord: {
                    include: { worker: true, certification: true, course: true },
                },
                trainingProvider: true,
                instructor: true,
                course: true,
            },
        });
    }
    getValidationResults(filters) {
        var _a;
        return this.prisma.trainingValidationResult.findMany({
            where: {
                trainingRecordId: filters.trainingRecordId,
                trainingProviderId: filters.trainingProviderId,
                outcome: filters.outcome,
            },
            orderBy: { validatedAt: 'desc' },
            take: (_a = filters.limit) !== null && _a !== void 0 ? _a : 50,
            include: {
                rejections: { include: { rejectionReason: true } },
                trainingRecord: {
                    include: { worker: true, certification: true },
                },
                trainingProvider: true,
                instructor: true,
                course: true,
            },
        });
    }
    async approveValidation(validationResultId, validatedBy, notes) {
        return this.updateWorkflow(validationResultId, client_1.TrainingValidationOutcome.APPROVED, validatedBy, notes);
    }
    async rejectValidation(validationResultId, rejectionCodes, validatedBy, notes) {
        var _a, _b;
        const result = await this.prisma.trainingValidationResult.findUnique({
            where: { id: validationResultId },
        });
        if (!result)
            throw new common_1.NotFoundException('Validation result not found');
        const reasons = await this.prisma.trainingRejectionReason.findMany({
            where: { code: { in: rejectionCodes } },
        });
        await this.prisma.$transaction([
            this.prisma.trainingValidationResult.update({
                where: { id: validationResultId },
                data: {
                    outcome: client_1.TrainingValidationOutcome.REJECTED,
                    validatedBy,
                    details: Object.assign(Object.assign({}, ((_a = result.details) !== null && _a !== void 0 ? _a : {})), { rejectionNotes: notes }),
                },
            }),
            ...reasons.map((r) => this.prisma.trainingValidationRejection.upsert({
                where: {
                    validationResultId_rejectionReasonId: {
                        validationResultId,
                        rejectionReasonId: r.id,
                    },
                },
                create: {
                    validationResultId,
                    rejectionReasonId: r.id,
                    message: notes,
                },
                update: { message: notes },
            })),
        ]);
        await this.audit('training.validation.reject', validationResultId, validatedBy, {
            rejectionCodes,
            notes,
        });
        if (result.trainingRecordId) {
            const rec = await this.prisma.trainingRecord.findUnique({
                where: { id: result.trainingRecordId },
            });
            if (rec) {
                await this.credentialLedger.recordCredentialRevoked({
                    credentialId: rec.id,
                    workerId: rec.workerId,
                    providerId: (_b = rec.providerId) !== null && _b !== void 0 ? _b : rec.trainingProviderId,
                    companyId: rec.companyId,
                    actorId: validatedBy,
                    actorType: client_1.CredentialLedgerActorType.SUPERVISOR,
                    payload: { rejectionCodes, notes },
                });
            }
        }
        return this.getValidationResult(validationResultId);
    }
    async updateWorkflow(validationResultId, outcome, validatedBy, notes) {
        var _a;
        const before = await this.prisma.trainingValidationResult.findUnique({
            where: { id: validationResultId },
        });
        const updated = await this.prisma.trainingValidationResult.update({
            where: { id: validationResultId },
            data: { outcome, validatedBy, details: { approvalNotes: notes } },
            include: { rejections: { include: { rejectionReason: true } } },
        });
        await this.audit(outcome === client_1.TrainingValidationOutcome.APPROVED
            ? 'training.validation.approve'
            : 'training.validation.update', validationResultId, validatedBy, { outcome, notes });
        if (outcome === client_1.TrainingValidationOutcome.APPROVED &&
            (before === null || before === void 0 ? void 0 : before.trainingRecordId)) {
            const rec = await this.prisma.trainingRecord.findUnique({
                where: { id: before.trainingRecordId },
            });
            if (rec) {
                await this.credentialLedger.recordCredentialVerified({
                    credentialId: rec.id,
                    workerId: rec.workerId,
                    providerId: (_a = rec.providerId) !== null && _a !== void 0 ? _a : rec.trainingProviderId,
                    companyId: rec.companyId,
                    actorId: validatedBy,
                    actorType: client_1.CredentialLedgerActorType.SUPERVISOR,
                    payload: {
                        validationResultId,
                        notes,
                        source: 'standards_compliance',
                    },
                });
            }
        }
        return updated;
    }
    resolveOutcome(issues, score) {
        const errors = issues.filter((i) => [
            'CSA_STANDARD_MISSING',
            'JURISDICTION_REQUIREMENT_MISSING',
            'PROVIDER_NOT_APPROVED',
            'INSTRUCTOR_NOT_QUALIFIED',
            'CERTIFICATE_EXPIRED',
            'CERTIFICATE_INVALID',
        ].includes(i.code));
        if (errors.length > 0)
            return client_1.TrainingValidationOutcome.REJECTED;
        if (issues.length > 0 || score < 70)
            return client_1.TrainingValidationOutcome.NEEDS_REVIEW;
        if (score >= 85)
            return client_1.TrainingValidationOutcome.APPROVED;
        return client_1.TrainingValidationOutcome.NEEDS_REVIEW;
    }
    async resolveJurisdiction(override, siteRegion) {
        if (override)
            return this.jurisdictionEngine.normalizeJurisdiction(override);
        return this.jurisdictionEngine.normalizeJurisdiction(siteRegion);
    }
    async loadProviderRules(trainingProviderId) {
        return this.prisma.providerQualificationRule.findMany({
            where: {
                active: true,
                OR: [{ trainingProviderId }, { trainingProviderId: null }],
            },
        });
    }
    async loadInstructorRules(trainingProviderId) {
        return this.prisma.instructorQualificationRule.findMany({
            where: {
                active: true,
                OR: [{ trainingProviderId }, { trainingProviderId: null }],
            },
        });
    }
    async persistResult(input) {
        var _a, _b, _c, _d;
        const reasonRows = await this.prisma.trainingRejectionReason.findMany({
            where: { code: { in: input.issues.map((i) => i.code) } },
        });
        const reasonByCode = new Map(reasonRows.map((r) => [r.code, r]));
        const result = await this.prisma.trainingValidationResult.create({
            data: {
                subjectType: input.subjectType,
                outcome: input.outcome,
                score: input.score,
                jurisdictionCode: input.jurisdictionCode,
                matchedStandardCodes: input.matchedStandardCodes,
                missingStandardCodes: input.missingStandardCodes,
                details: input.details,
                validatedBy: input.validatedBy,
                trainingRecordId: input.trainingRecordId,
                trainingProviderId: input.trainingProviderId,
                instructorId: input.instructorId,
                courseId: input.courseId,
                certificateQrToken: input.certificateQrToken,
                rejections: {
                    create: input.issues
                        .filter((i) => reasonByCode.has(i.code))
                        .map((i) => ({
                        rejectionReasonId: reasonByCode.get(i.code).id,
                        message: i.message,
                    })),
                },
            },
            include: { rejections: { include: { rejectionReason: true } } },
        });
        await this.audit('training.validation.run', result.id, input.validatedBy, {
            subjectType: input.subjectType,
            outcome: input.outcome,
            score: input.score,
        });
        if (input.trainingRecordId) {
            const record = await this.prisma.trainingRecord.findUnique({
                where: { id: input.trainingRecordId },
                select: { companyId: true, worker: { select: { companyId: true } } },
            });
            (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit({
                name: domain_events_1.DomainEvent.TRAINING_VALIDATED,
                occurredAt: new Date().toISOString(),
                entityType: 'training',
                entityId: input.trainingRecordId,
                companyId: (_d = (_b = record === null || record === void 0 ? void 0 : record.companyId) !== null && _b !== void 0 ? _b : (_c = record === null || record === void 0 ? void 0 : record.worker) === null || _c === void 0 ? void 0 : _c.companyId) !== null && _d !== void 0 ? _d : undefined,
                data: {
                    validationResultId: result.id,
                    outcome: input.outcome,
                },
            });
        }
        return result;
    }
    async audit(action, entityId, userId, metadata) {
        await this.monitoring.persistAudit({
            userId,
            action,
            entity: 'TrainingValidationResult',
            entityId,
            metadata,
        });
    }
};
exports.TrainingStandardsComplianceService = TrainingStandardsComplianceService;
exports.TrainingStandardsComplianceService = TrainingStandardsComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        credential_ledger_service_1.CredentialLedgerService,
        standards_matching_engine_1.StandardsMatchingEngine,
        jurisdiction_matching_engine_1.JurisdictionMatchingEngine,
        expiry_rule_engine_1.ExpiryRuleEngine,
        certificate_validation_engine_1.CertificateValidationEngine,
        provider_qualification_validator_1.ProviderQualificationValidator,
        instructor_qualification_validator_1.InstructorQualificationValidator,
        event_bus_service_1.EventBusService])
], TrainingStandardsComplianceService);
//# sourceMappingURL=training-standards-compliance.service.js.map