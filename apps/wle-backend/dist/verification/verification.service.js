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
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const public_token_resolver_1 = require("./public-token.resolver");
const public_response_sanitizer_1 = require("./public-response.sanitizer");
const public_token_util_1 = require("./public-token.util");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const rule_engine_service_1 = require("../rules/rule-engine.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_types_1 = require("../notifications/notification-types");
const regulatory_decision_service_1 = require("../modules/training-standards-compliance/regulatory/regulatory-decision.service");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
const phase1_request_context_storage_1 = require("../common/monitoring/phase1-request-context.storage");
const training_record_checks_1 = require("./training-record-checks");
const training_wallet_integration_service_1 = require("../modules/vera-core/training-wallet-integration.service");
const training_credential_nft_coordinator_service_1 = require("../modules/training-credential-nft/training-credential-nft-coordinator.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
const EXPIRING_SOON_DAYS = 30;
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(prisma, ruleEngine, monitoring, auditLog, publicTokens, walletIntegration, nftCoordinator, regulatoryDecision, events, notifications) {
        this.prisma = prisma;
        this.ruleEngine = ruleEngine;
        this.monitoring = monitoring;
        this.auditLog = auditLog;
        this.publicTokens = publicTokens;
        this.walletIntegration = walletIntegration;
        this.nftCoordinator = nftCoordinator;
        this.regulatoryDecision = regulatoryDecision;
        this.events = events;
        this.notifications = notifications;
        this.logger = new common_1.Logger(VerificationService_1.name);
    }
    async evaluateWorkerCompliance(workerId) {
        var _a;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: { include: { trainingRequirements: true } },
                trainingRecords: {
                    include: {
                        certification: true,
                        trainingProvider: true,
                        instructor: true,
                        course: { include: { standards: true } },
                        company: true,
                        project: { include: { site: true } },
                    },
                    orderBy: { issuedAt: 'desc' },
                },
                documents: { where: { type: 'TRAINING' } },
            },
        });
        if (!worker || !worker.company) {
            return { workerId, isCompliant: false, issues: [] };
        }
        const now = new Date();
        const issues = [];
        for (const req of worker.company.trainingRequirements) {
            const courseName = req.courseName;
            const record = worker.trainingRecords.find((t) => t.certification.name.toLowerCase() === courseName.toLowerCase());
            const doc = worker.documents.find((d) => d.name.toLowerCase().includes(courseName.toLowerCase()));
            if (!record) {
                issues.push({
                    type: 'MISSING',
                    courseName,
                    expiresAt: null,
                });
                if (!doc) {
                    issues.push({
                        type: 'NO_DOCUMENT',
                        courseName,
                        expiresAt: null,
                    });
                }
                continue;
            }
            if (record.expiresAt && record.expiresAt <= now) {
                issues.push({
                    type: 'EXPIRED',
                    courseName,
                    expiresAt: record.expiresAt,
                });
            }
            if (record.expiresAt) {
                const diffDays = (record.expiresAt.getTime() - now.getTime()) / 86400000;
                if (diffDays > 0 && diffDays <= EXPIRING_SOON_DAYS) {
                    issues.push({
                        type: 'EXPIRING_SOON',
                        courseName,
                        expiresAt: record.expiresAt,
                    });
                }
            }
            if (!doc) {
                issues.push({
                    type: 'NO_DOCUMENT',
                    courseName,
                    expiresAt: (_a = record.expiresAt) !== null && _a !== void 0 ? _a : null,
                });
            }
        }
        const blocking = issues.filter((i) => i.type === 'MISSING' ||
            i.type === 'EXPIRED' ||
            i.type === 'NO_DOCUMENT');
        return {
            workerId,
            isCompliant: blocking.length === 0,
            issues,
        };
    }
    async verifyByPublicToken(token) {
        const trimmed = token.trim();
        if (!(0, public_token_util_1.isPublicQrToken)(trimmed)) {
            throw new common_1.NotFoundException('Invalid verification token');
        }
        if (trimmed.startsWith('e-') || trimmed.startsWith('E-')) {
            return this.verifyEquipmentByRef(trimmed);
        }
        return this.verifyWorkerByRef(trimmed);
    }
    async verifyWorker(workerId) {
        return this.verifyWorkerPublic(workerId);
    }
    async verifyWorkerByRef(ref) {
        const resolved = await this.publicTokens.resolveWorkerRef(ref);
        return this.verifyWorkerPublic(resolved.workerId, resolved.qrToken);
    }
    async verifyWorkerFullByRef(ref) {
        const resolved = await this.publicTokens.resolveWorkerRef(ref);
        return this.verifyWorkerFull(resolved.workerId);
    }
    verifyEquipmentMissingRef() {
        throw new common_1.BadRequestException('Equipment verification requires ?ref= (qr token) or legacy ?id=');
    }
    async verifyWorkerPublic(workerId, knownToken) {
        var _a, _b, _c;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: { select: { name: true } },
                trainingRecords: {
                    include: { certification: true },
                    orderBy: { issuedAt: 'desc' },
                    take: 50,
                },
                credentials: { include: { certification: true }, take: 20 },
                equipmentAssignments: {
                    where: { endedAt: null },
                    include: {
                        equipment: { select: { id: true, name: true, safetyStatus: true } },
                    },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const qrToken = (_a = knownToken !== null && knownToken !== void 0 ? knownToken : worker.qrToken) !== null && _a !== void 0 ? _a : (await this.publicTokens.ensureWorkerToken(workerId));
        const compliance = await this.evaluateWorkerCompliance(workerId);
        const certifications = worker.trainingRecords.map((tr) => (0, public_response_sanitizer_1.publicTrainingRecord)({
            id: tr.id,
            expiresAt: tr.expiresAt,
            issuedAt: tr.issuedAt,
            completedAt: tr.completedAt,
            certification: tr.certification,
        }));
        const credentials = worker.credentials.map((c) => (0, public_response_sanitizer_1.publicCredential)(c));
        const equipment = worker.equipmentAssignments
            .map((a) => a.equipment)
            .filter(Boolean)
            .map((eq) => (0, public_response_sanitizer_1.publicEquipmentSummary)(eq));
        const card = (0, public_response_sanitizer_1.publicWorkerCard)({
            qrToken,
            firstName: worker.firstName,
            lastName: worker.lastName,
            photoUrl: worker.photoUrl,
            companyName: (_c = (_b = worker.company) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : null,
            compliance,
            certifications,
            credentials,
            equipment,
        });
        return Object.assign(Object.assign({}, card), { worker: {
                firstName: worker.firstName,
                lastName: worker.lastName,
                photoUrl: worker.photoUrl,
                company: (0, public_response_sanitizer_1.publicCompanyName)(worker.company),
            }, certifications, trainingRecords: certifications, credentials,
            equipment, compliance: {
                isCompliant: compliance.isCompliant,
                issues: compliance.issues.map((i) => ({
                    type: i.type,
                    courseName: i.courseName,
                    expiresAt: i.expiresAt,
                })),
            } });
    }
    async verifyWorkerFull(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: { include: { trainingRequirements: true } },
                trainingRecords: {
                    include: {
                        certification: true,
                        trainingProvider: true,
                        instructor: true,
                        course: { include: { standards: true } },
                        company: true,
                        project: { include: { site: true } },
                    },
                    orderBy: { issuedAt: 'desc' },
                },
                credentials: { include: { certification: true } },
                incidents: true,
                documents: { where: { type: 'TRAINING' } },
                equipmentAssignments: {
                    where: { endedAt: null },
                    include: { equipment: { include: { company: true } } },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const now = new Date();
        const expiredCerts = worker.trainingRecords.filter((t) => t.expiresAt && t.expiresAt <= now);
        const compliance = await this.evaluateWorkerCompliance(workerId);
        const ruleResult = this.ruleEngine.evaluate({
            worker,
            equipment: { incidents: [] },
            requiredCerts: [],
        });
        const certifications = this.walletIntegration
            ? await this.walletIntegration.listWalletTraining(workerId)
            : worker.trainingRecords;
        return {
            worker,
            certifications,
            credentials: worker.credentials,
            expiredCerts,
            activeIncidents: worker.incidents,
            ruleResult,
            compliance,
        };
    }
    mapPublicTraining(tr) {
        var _a, _b, _c;
        return {
            id: tr.id,
            name: (_c = (_a = tr.courseName) !== null && _a !== void 0 ? _a : (_b = tr.certification) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Training',
            courseName: tr.courseName,
            expiresAt: tr.expiresAt,
            issuedAt: tr.issuedAt,
            completedAt: tr.completedAt,
            certification: tr.certification,
            providerName: tr.providerName,
            instructorName: tr.instructorName,
            courseStandards: tr.courseStandards,
            jurisdictionCode: tr.jurisdictionCode,
            jurisdictionValid: tr.jurisdictionValid,
            certificateQrToken: tr.certificateQrToken,
            certificateQrUrl: tr.certificateQrUrl,
            certificateNumber: tr.certificateNumber,
            complianceStatus: tr.complianceStatus,
            companyName: tr.companyName,
            projectName: tr.projectName,
        };
    }
    async verifyEquipment(equipmentId) {
        return this.verifyEquipmentPublic(equipmentId);
    }
    async verifyEquipmentByRef(ref) {
        const resolved = await this.publicTokens.resolveEquipmentRef(ref);
        return this.verifyEquipmentPublic(resolved.equipmentId, resolved.qrToken);
    }
    async verifyEquipmentFullByRef(ref) {
        const resolved = await this.publicTokens.resolveEquipmentRef(ref);
        return this.verifyEquipmentFull(resolved.equipmentId);
    }
    async verifyEquipmentPublic(equipmentId, knownToken) {
        var _a, _b, _c;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                company: { select: { name: true } },
                equipmentAssignments: {
                    where: { endedAt: null },
                    include: {
                        worker: { select: { firstName: true, lastName: true } },
                    },
                    take: 10,
                },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const qrToken = (_a = knownToken !== null && knownToken !== void 0 ? knownToken : equipment.qrToken) !== null && _a !== void 0 ? _a : (await this.publicTokens.ensureEquipmentToken(equipmentId));
        const card = (0, public_response_sanitizer_1.publicEquipmentCard)({
            qrToken,
            name: equipment.name,
            safetyStatus: equipment.safetyStatus,
            photoUrl: equipment.photoUrl,
            companyName: (_c = (_b = equipment.company) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : null,
            assignedWorkers: equipment.equipmentAssignments
                .map((a) => a.worker)
                .filter(Boolean)
                .map((w) => ({
                displayName: `${w.firstName} ${w.lastName}`.trim(),
            })),
        });
        return Object.assign(Object.assign({}, card), { equipment: (0, public_response_sanitizer_1.publicEquipmentSummary)(equipment) });
    }
    async verifyEquipmentFull(equipmentId) {
        var _a;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                equipmentAssignments: {
                    include: {
                        worker: {
                            include: {
                                trainingRecords: true,
                                credentials: true,
                                incidents: true,
                                company: true,
                            },
                        },
                    },
                },
                incidents: true,
                company: true,
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const assignedWorkers = equipment.equipmentAssignments
            .map((a) => a.worker)
            .filter(Boolean);
        const ruleResult = this.ruleEngine.evaluate({
            worker: (_a = assignedWorkers[0]) !== null && _a !== void 0 ? _a : {
                trainingRecords: [],
                credentials: [],
                incidents: [],
            },
            equipment,
            requiredCerts: [],
        });
        return {
            equipment,
            requiredCerts: [],
            assignedWorkers,
            activeIncidents: equipment.incidents,
            ruleResult,
        };
    }
    async verifyCombined(workerId, equipmentId) {
        this.monitoring.processing('verification', 'combined.start', {
            workerId,
            equipmentId,
        });
        const workerFull = await this.verifyWorkerFull(workerId);
        const equipmentFull = await this.verifyEquipmentFull(equipmentId);
        const requiredCertIds = [];
        const ruleResult = this.ruleEngine.evaluate({
            worker: workerFull.worker,
            equipment: equipmentFull.equipment,
            requiredCerts: requiredCertIds,
        });
        return {
            worker: workerFull.worker,
            equipment: equipmentFull.equipment,
            ruleResult,
            missingCertifications: ruleResult.missingCertifications,
            expiredTraining: ruleResult.expiredTraining,
            expiredCredentials: ruleResult.expiredCredentials,
            workerIncidents: ruleResult.workerIncidents,
            equipmentIncidents: ruleResult.equipmentIncidents,
            compliance: workerFull.compliance,
        };
    }
    async verifyCombinedPublic(workerRef, equipmentRef) {
        var _a, _b, _c, _d, _e;
        const worker = await this.verifyWorkerByRef(workerRef);
        const equipment = await this.verifyEquipmentByRef(equipmentRef);
        const safe = ((_b = (_a = worker.compliance) === null || _a === void 0 ? void 0 : _a.isCompliant) !== null && _b !== void 0 ? _b : false) &&
            ((_c = equipment.isSafe) !== null && _c !== void 0 ? _c : equipment.safetyStatus === 'OK');
        return {
            status: safe ? 'SAFE' : 'UNSAFE',
            worker: {
                publicRef: worker.publicRef,
                displayName: worker.displayName,
                company: worker.company,
                isCompliant: (_e = (_d = worker.compliance) === null || _d === void 0 ? void 0 : _d.isCompliant) !== null && _e !== void 0 ? _e : false,
            },
            equipment: {
                publicRef: equipment.publicRef,
                name: equipment.name,
                isSafe: equipment.isSafe,
                safetyStatus: equipment.safetyStatus,
            },
        };
    }
    async verifyCertificationPublic(certificationId) {
        const cert = await this.prisma.certification.findUnique({
            where: { id: certificationId },
            include: {
                _count: { select: { trainingRecords: true, credentials: true } },
            },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certification not found');
        return {
            type: 'cert',
            id: cert.id,
            name: cert.name,
            code: cert.code,
            description: cert.description,
            trainingRecordCount: cert._count.trainingRecords,
            credentialCount: cert._count.credentials,
        };
    }
    async verifyTrainingRecordPublic(trainingRecordId) {
        var _a, _b;
        const tr = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                certification: true,
                worker: { include: { company: true } },
                provider: true,
            },
        });
        if (!tr)
            throw new common_1.NotFoundException('Training record not found');
        const w = tr.worker;
        const record = (0, public_response_sanitizer_1.publicTrainingRecord)({
            id: tr.id,
            expiresAt: tr.expiresAt,
            issuedAt: tr.issuedAt,
            completedAt: tr.completedAt,
            certificateNumber: tr.certificateNumber,
            certification: tr.certification,
        });
        return {
            type: 'training',
            displayName: `${w.firstName} ${w.lastName}`.trim(),
            company: (0, public_response_sanitizer_1.publicCompanyName)(w.company),
            training: record,
            providerName: (_b = (_a = tr.provider) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
        };
    }
    async verifyCredentialPublic(credentialId) {
        const credential = await this.prisma.credential.findUnique({
            where: { id: credentialId },
            include: {
                worker: { include: { company: true } },
                certification: true,
            },
        });
        if (!credential)
            throw new common_1.NotFoundException('Credential not found');
        const now = new Date();
        const valid = !credential.expiresAt || credential.expiresAt.getTime() > now.getTime();
        const status = valid ? 'VALID' : 'EXPIRED';
        const w = credential.worker;
        const relatedTrainingRecords = credential.certificationId != null
            ? await this.prisma.trainingRecord.findMany({
                where: {
                    workerId: w.id,
                    certificationId: credential.certificationId,
                },
                select: { id: true },
                orderBy: { issuedAt: 'desc' },
                take: 5,
            })
            : [];
        return {
            type: 'credential',
            displayName: `${w.firstName} ${w.lastName}`.trim(),
            company: (0, public_response_sanitizer_1.publicCompanyName)(w.company),
            credential: (0, public_response_sanitizer_1.publicCredential)({
                id: credential.id,
                name: credential.name,
                issuedAt: credential.issuedAt,
                expiresAt: credential.expiresAt,
                certification: credential.certification,
            }),
            relatedTrainingCount: relatedTrainingRecords.length,
        };
    }
    async verifyCompanyPublic(companyId) {
        var _a;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                _count: { select: { workers: true, equipment: true } },
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return {
            type: 'company',
            name: company.name,
            logoUrl: (_a = company.logoUrl) !== null && _a !== void 0 ? _a : null,
            workerCount: company._count.workers,
            equipmentCount: company._count.equipment,
        };
    }
    parseWorkerSiteToken(token) {
        const raw = decodeURIComponent(token).trim();
        const parts = raw.split(/[-_/]/).map((p) => parseInt(p, 10));
        if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) {
            throw new common_1.BadRequestException('Invalid site-access id. Use workerId-siteId (e.g. 12-3).');
        }
        return { workerId: parts[0], siteId: parts[1] };
    }
    async verifySiteAccessPublic(token) {
        var _a, _b, _c;
        const { workerId, siteId } = this.parseWorkerSiteToken(token);
        const access = await this.prisma.workerSiteAccess.findUnique({
            where: {
                workerId_siteId: { workerId, siteId },
            },
            include: {
                worker: { include: { company: true } },
                site: true,
            },
        });
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: { company: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const site = await this.prisma.site.findUnique({ where: { id: siteId } });
        if (!site)
            throw new common_1.NotFoundException('Site not found');
        const compliance = await this.evaluateWorkerCompliance(workerId);
        const blocking = compliance.issues.filter((i) => i.type === 'MISSING' ||
            i.type === 'EXPIRED' ||
            i.type === 'NO_DOCUMENT');
        const ruleOk = blocking.length === 0;
        const accessOk = access && access.status === 'ALLOWED' && access.approved && ruleOk;
        return {
            type: 'site-access',
            firstName: worker.firstName,
            lastName: worker.lastName,
            photoUrl: worker.photoUrl,
            company: worker.company,
            siteAccess: {
                isAllowed: accessOk,
                workerId,
                siteId,
                siteName: site.name,
                accessStatus: (_a = access === null || access === void 0 ? void 0 : access.status) !== null && _a !== void 0 ? _a : 'NO_RECORD',
                approved: (_b = access === null || access === void 0 ? void 0 : access.approved) !== null && _b !== void 0 ? _b : false,
                notes: (_c = access === null || access === void 0 ? void 0 : access.notes) !== null && _c !== void 0 ? _c : null,
                complianceOk: ruleOk,
                compliance,
            },
        };
    }
    async validateTrainingRecord(trainingRecordId, options) {
        var _a, _b, _c, _d, _e;
        this.logger.log(JSON.stringify({
            type: 'verification.training.start',
            trainingRecordId,
            options: options !== null && options !== void 0 ? options : null,
        }));
        const tr = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                certification: true,
                worker: {
                    include: {
                        company: true,
                        credentials: { include: { certification: true } },
                    },
                },
                provider: true,
            },
        });
        if (!tr)
            throw new common_1.NotFoundException('Training record not found');
        const expiry = (0, training_record_checks_1.checkExpiry)(tr);
        const provider = (0, training_record_checks_1.checkProvider)(tr);
        const expectedProvider = (0, training_record_checks_1.checkExpectedProvider)(tr, {
            expectedProvider: options === null || options === void 0 ? void 0 : options.expectedProvider,
        });
        const workerIdentity = (0, training_record_checks_1.checkWorkerIdentity)(tr, options);
        const expectedCompany = (0, training_record_checks_1.checkExpectedCompany)(tr, {
            expectedCompanyId: options === null || options === void 0 ? void 0 : options.expectedCompanyId,
        });
        const trainingType = (0, training_record_checks_1.checkTrainingType)(tr.certification, {
            expectedTrainingType: options === null || options === void 0 ? void 0 : options.expectedTrainingType,
        });
        const certificateNumber = (0, training_record_checks_1.checkCertificateNumber)({
            certificateNumber: (_a = tr.certificateNumber) !== null && _a !== void 0 ? _a : null,
        }, {
            expectedCertificateNumber: options === null || options === void 0 ? void 0 : options.expectedCertificateNumber,
        });
        const credentialCoverage = (0, training_record_checks_1.checkCredentialCoverage)(tr.worker.credentials, tr.certificationId, tr.certification.name);
        const completionState = (0, training_record_checks_1.checkCompletionState)(tr);
        const checks = {
            expiry,
            provider,
            expectedProvider,
            workerIdentity,
            expectedCompany,
            trainingType,
            certificateNumber,
            credentialCoverage,
            completionState,
        };
        const overallStatus = (0, training_record_checks_1.aggregateTrainingRecordOverallStatus)(checks);
        const summary = (0, training_record_checks_1.buildTrainingRecordVerificationSummary)(checks);
        const requestActorUserId = (_b = phase1_request_context_storage_1.phase1RequestStore.getStore()) === null || _b === void 0 ? void 0 : _b.userId;
        await this.auditLog.logAudit({ id: requestActorUserId !== null && requestActorUserId !== void 0 ? requestActorUserId : null, companyId: tr.worker.companyId }, audit_actions_1.AuditAction.VERIFICATION_SUCCESS, {
            type: audit_actions_1.AuditEntityType.TRAINING_RECORD,
            id: tr.id,
            tenantId: tr.worker.companyId,
        }, {
            overallStatus,
            options: options !== null && options !== void 0 ? options : null,
            workerId: tr.worker.id,
            certificationId: tr.certificationId,
            checkStatuses: {
                expiry: expiry.status,
                provider: provider.status,
                expectedProvider: expectedProvider.status,
                workerIdentity: workerIdentity.status,
                expectedCompany: expectedCompany.status,
                trainingType: trainingType.status,
                certificateNumber: certificateNumber.status,
                credentialCoverage: credentialCoverage.status,
                completionState: completionState.status,
            },
        });
        this.monitoring.processing('verification', 'training_record.validate', {
            trainingRecordId: tr.id,
            workerId: tr.worker.id,
            overallStatus,
        });
        const verifiedAt = new Date();
        await this.persistVerificationSnapshot(tr.id, overallStatus, checks, verifiedAt);
        if (overallStatus !== 'VERIFIED') {
            void this.notifyVerificationAttention(tr.id, tr.worker.companyId, overallStatus, summary.join(' '));
        }
        return {
            trainingRecordId: tr.id,
            overallStatus,
            certification: {
                id: tr.certification.id,
                name: tr.certification.name,
                code: (_c = tr.certification.code) !== null && _c !== void 0 ? _c : null,
            },
            worker: {
                id: tr.worker.id,
                firstName: tr.worker.firstName,
                lastName: tr.worker.lastName,
                companyId: tr.worker.companyId,
                companyName: (_e = (_d = tr.worker.company) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : null,
            },
            checks,
            summary,
            verifiedAt: verifiedAt.toISOString(),
        };
    }
    async getTrainingVerificationSnapshot(trainingRecordId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const tr = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            include: {
                credentialNft: true,
                nftMintJobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!tr)
            throw new common_1.NotFoundException('Training record not found');
        const snapshot = tr;
        return {
            trainingRecordId: tr.id,
            lastVerificationStatus: (_a = snapshot.lastVerificationStatus) !== null && _a !== void 0 ? _a : null,
            lastVerificationChecks: (_b = snapshot.lastVerificationChecks) !== null && _b !== void 0 ? _b : null,
            verifiedAt: (_d = (_c = snapshot.verifiedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            completedAt: (_f = (_e = tr.completedAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
            credentialNft: tr.credentialNft,
            latestMintJob: (_g = tr.nftMintJobs[0]) !== null && _g !== void 0 ? _g : null,
        };
    }
    async completeTrainingVerification(trainingRecordId, actor) {
        var _a, _b, _c, _d, _e;
        const tr = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            select: {
                id: true,
                workerId: true,
                completedAt: true,
                expiresAt: true,
                worker: { select: { id: true, status: true, companyId: true } },
            },
        });
        if (!tr) {
            throw new common_1.NotFoundException('Training record not found');
        }
        if (!tr.worker) {
            throw new common_1.NotFoundException('Worker not found for training record');
        }
        if (tr.completedAt != null) {
            this.logger.log(JSON.stringify({
                type: 'verification.training.complete.idempotent',
                trainingRecordId: tr.id,
                workerId: tr.workerId,
            }));
            await this.auditLog.logAudit({ id: (_a = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _a !== void 0 ? _a : null, companyId: tr.worker.companyId }, audit_actions_1.AuditAction.VERIFICATION_SUCCESS, {
                type: audit_actions_1.AuditEntityType.TRAINING_RECORD,
                id: tr.id,
                tenantId: tr.worker.companyId,
            }, {
                reason: 'already_completed',
                trainingRecordId: tr.id,
                workerId: tr.workerId,
                completedByUserId: (_b = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _b !== void 0 ? _b : null,
            });
            return { ok: true };
        }
        const statusNorm = tr.worker.status.trim().toUpperCase();
        if (statusNorm !== 'ACTIVE') {
            throw new common_1.BadRequestException(`Cannot complete verification: worker status is ${tr.worker.status} (ACTIVE required)`);
        }
        const now = new Date();
        if (tr.expiresAt != null && tr.expiresAt.getTime() <= now.getTime()) {
            throw new common_1.BadRequestException('Cannot complete verification: training record is expired');
        }
        this.monitoring.processing('verification', 'training_record.complete.start', {
            trainingRecordId: tr.id,
            workerId: tr.workerId,
            completedByUserId: (_c = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _c !== void 0 ? _c : null,
        });
        await this.prisma.$transaction(async (tx) => {
            var _a, _b;
            await tx.trainingRecord.update({
                where: { id: tr.id },
                data: { completedAt: new Date() },
            });
            await tx.trainingAttestation.create({
                data: {
                    trainingRecordId: tr.id,
                    attestedByWorkerId: tr.workerId,
                    role: client_1.TrainingAttestationRole.OTHER,
                    notes: (actor === null || actor === void 0 ? void 0 : actor.userId) != null
                        ? `Core training verification marked complete (signed by user ${actor.userId})`
                        : 'Core training verification marked complete',
                },
            });
            await this.auditLog.logAudit({ id: (_a = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _a !== void 0 ? _a : null, companyId: tr.worker.companyId }, audit_actions_1.AuditAction.VERIFICATION_SUCCESS, {
                type: audit_actions_1.AuditEntityType.TRAINING_RECORD,
                id: tr.id,
                tenantId: tr.worker.companyId,
            }, {
                event: 'training_verification.completed',
                trainingRecordId: tr.id,
                workerId: tr.workerId,
                source: 'core_verification_ui',
                completedByUserId: (_b = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _b !== void 0 ? _b : null,
            }, { tx });
        });
        this.logger.log(JSON.stringify({
            type: 'verification.training.completed',
            trainingRecordId: tr.id,
            workerId: tr.workerId,
            completedByUserId: (_d = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _d !== void 0 ? _d : null,
        }));
        this.monitoring.processing('verification', 'training_record.complete.done', {
            trainingRecordId: tr.id,
            workerId: tr.workerId,
            completedByUserId: (_e = actor === null || actor === void 0 ? void 0 : actor.userId) !== null && _e !== void 0 ? _e : null,
        });
        await this.closeVerificationLoop(tr.id, actor);
        return { ok: true };
    }
    async persistVerificationSnapshot(trainingRecordId, overallStatus, checks, verifiedAt) {
        await this.prisma.trainingRecord.update({
            where: { id: trainingRecordId },
            data: {
                lastVerificationStatus: overallStatus,
                lastVerificationChecks: JSON.parse(JSON.stringify(checks)),
                verifiedAt,
            },
        });
    }
    async closeVerificationLoop(trainingRecordId, actor) {
        var _a, _b, _c, _d, _e;
        const validation = await this.validateTrainingRecord(trainingRecordId);
        if (this.regulatoryDecision) {
            try {
                await this.regulatoryDecision.verifyTrainingAgainstRegulations(trainingRecordId, actor === null || actor === void 0 ? void 0 : actor.userId);
            }
            catch (e) {
                this.logger.warn(`Regulatory verification failed for record ${trainingRecordId}: ${e}`);
            }
        }
        if (this.walletIntegration) {
            try {
                await this.walletIntegration.syncAfterTrainingRecord(trainingRecordId);
            }
            catch (e) {
                this.logger.warn(`Wallet sync failed for record ${trainingRecordId}: ${e}`);
            }
        }
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: trainingRecordId },
            select: {
                companyId: true,
                worker: { select: { companyId: true } },
            },
        });
        const companyId = (_b = (_a = record === null || record === void 0 ? void 0 : record.companyId) !== null && _a !== void 0 ? _a : record === null || record === void 0 ? void 0 : record.worker.companyId) !== null && _b !== void 0 ? _b : undefined;
        const occurredAt = new Date().toISOString();
        (_c = this.events) === null || _c === void 0 ? void 0 : _c.emit({
            name: domain_events_1.DomainEvent.VERIFICATION_COMPLETED,
            occurredAt,
            companyId,
            entityType: 'training_record',
            entityId: trainingRecordId,
            actorId: actor === null || actor === void 0 ? void 0 : actor.userId,
            data: { overallStatus: validation.overallStatus },
        });
        (_d = this.events) === null || _d === void 0 ? void 0 : _d.emit({
            name: domain_events_1.DomainEvent.TRAINING_VALIDATED,
            occurredAt,
            companyId,
            entityType: 'training_record',
            entityId: trainingRecordId,
            actorId: actor === null || actor === void 0 ? void 0 : actor.userId,
            data: { overallStatus: validation.overallStatus },
        });
        void ((_e = this.nftCoordinator) === null || _e === void 0 ? void 0 : _e.scheduleMintIfEligible(trainingRecordId));
    }
    async notifyVerificationAttention(trainingRecordId, companyId, overallStatus, summary) {
        var _a;
        if (!companyId || !this.notifications || overallStatus === 'VERIFIED') {
            return;
        }
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit({
            name: domain_events_1.DomainEvent.TRAINING_VERIFICATION_ATTENTION,
            occurredAt: new Date().toISOString(),
            companyId,
            entityType: 'training_record',
            entityId: trainingRecordId,
            data: { overallStatus, summary },
        });
        await this.notifications.notifyCompanySupervisors(companyId, {
            type: notification_types_1.NOTIFICATION_TYPES.TRAINING_VERIFICATION_ATTENTION,
            title: 'Training verification needs review',
            body: `Record #${trainingRecordId} — ${overallStatus}. ${summary}`,
            payload: { trainingRecordId, overallStatus },
            dedupeKey: `training-verification-attention:${trainingRecordId}:${overallStatus}`,
            companyId,
        });
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => training_wallet_integration_service_1.TrainingWalletIntegrationService))),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __param(8, (0, common_1.Optional)()),
    __param(9, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rule_engine_service_1.RuleEngineService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        audit_log_service_1.AuditLogService,
        public_token_resolver_1.PublicTokenResolver,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        training_credential_nft_coordinator_service_1.TrainingCredentialNftCoordinatorService,
        regulatory_decision_service_1.RegulatoryDecisionService,
        event_bus_service_1.EventBusService,
        notifications_service_1.NotificationsService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map