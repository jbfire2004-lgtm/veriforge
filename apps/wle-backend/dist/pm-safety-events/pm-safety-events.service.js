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
exports.PmSafetyEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_classification_engine_1 = require("./event-classification.engine");
const severity_risk_engine_1 = require("./severity-risk.engine");
const rca_engine_1 = require("./rca.engine");
const pm_safety_events_cail_service_1 = require("./pm-safety-events-cail.service");
const pm_safety_events_ingestion_service_1 = require("./pm-safety-events-ingestion.service");
const pm_safety_events_equipment_service_1 = require("./pm-safety-events-equipment.service");
const pm_safety_events_library_service_1 = require("./pm-safety-events-library.service");
const pm_investigation_capa_integration_service_1 = require("./pm-investigation-capa-integration.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
const dangerous_occurrence_engine_1 = require("../verisuite-sms/services/dangerous-occurrence.engine");
const eventInclude = {
    injuries: true,
    people: true,
    equipmentLinks: {
        include: { equipment: { select: { id: true, name: true } } },
    },
    witnesses: { include: { statements: true } },
    statements: true,
    attachments: true,
    rootCauses: true,
    contributingFactors: true,
    correctiveActions: true,
    investigation: true,
    createdBy: { select: { id: true, username: true } },
    company: { select: { id: true, name: true } },
    project: { select: { id: true, name: true } },
};
let PmSafetyEventsService = class PmSafetyEventsService {
    constructor(prisma, classifier, riskEngine, rca, cail, ingestion, equipment, library, capaIntegration, auditLog) {
        this.prisma = prisma;
        this.classifier = classifier;
        this.riskEngine = riskEngine;
        this.rca = rca;
        this.cail = cail;
        this.ingestion = ingestion;
        this.equipment = equipment;
        this.library = library;
        this.capaIntegration = capaIntegration;
        this.auditLog = auditLog;
    }
    async audit(eventId, eventType, actorId, payload) {
        await this.prisma.pmSafetyEventAuditLog.create({
            data: {
                eventId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async list(filters) {
        return this.prisma.pmSafetyEvent.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign({ deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.companyId ? { companyId: filters.companyId } : {})), (filters.status ? { status: filters.status } : {})), (filters.eventType ? { eventType: filters.eventType } : {})),
            include: eventInclude,
            orderBy: { occurredAt: 'desc' },
            take: 100,
        });
    }
    async get(id) {
        const row = await this.prisma.pmSafetyEvent.findFirst({
            where: { id, deletedAt: null },
            include: Object.assign(Object.assign({}, eventInclude), { auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 } }),
        });
        if (!row)
            throw new common_1.NotFoundException('Event not found');
        return row;
    }
    async createDraft(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        await this.library.ensureLibraries(input.companyId);
        const classification = this.classifier.classifyType((_a = input.description) !== null && _a !== void 0 ? _a : input.title, input.eventType);
        const risk = this.riskEngine.score({
            eventType: classification.eventType,
            description: input.description,
        });
        const heca = this.classifier.suggestHecaCategory((_b = input.description) !== null && _b !== void 0 ? _b : input.title);
        const project = await this.prisma.project
            .findFirst({
            where: { id: input.projectId, companyId: input.companyId },
            include: { site: true, company: true },
        })
            .catch(() => null);
        const regionCode = input.regionCode ||
            ((_c = project === null || project === void 0 ? void 0 : project.site) === null || _c === void 0 ? void 0 : _c.region) ||
            ((_d = project === null || project === void 0 ? void 0 : project.company) === null || _d === void 0 ? void 0 : _d.province) ||
            'CA-AB';
        const dangerousOccurrence = (0, dangerous_occurrence_engine_1.evaluateDangerousOccurrences)([input.title, input.description, input.locationNote]
            .filter(Boolean)
            .join(' '), regionCode);
        const event = await this.prisma.pmSafetyEvent.create({
            data: {
                companyId: input.companyId,
                projectId: input.projectId,
                siteId: input.siteId,
                createdByUserId: input.createdByUserId,
                eventType: classification.eventType,
                title: input.title,
                description: input.description,
                occurredAt: (_e = input.occurredAt) !== null && _e !== void 0 ? _e : new Date(),
                locationNote: input.locationNote,
                latitude: input.latitude,
                longitude: input.longitude,
                clientSyncId: input.clientSyncId,
                intakeWizardStep: (_f = input.intakeWizardStep) !== null && _f !== void 0 ? _f : 1,
                pmInspectionId: input.pmInspectionId,
                severity: (_g = input.severity) !== null && _g !== void 0 ? _g : risk.severity,
                mandatoryInvestigation: (_h = input.mandatoryInvestigation) !== null && _h !== void 0 ? _h : (risk.requiresSupervisorReview || dangerousOccurrence.mustReportAny),
                likelihood: risk.likelihood,
                riskScore: risk.riskScore,
                requiresSupervisorReview: risk.requiresSupervisorReview ||
                    dangerousOccurrence.supervisorReviewRequired,
                hecaCategoryCode: heca,
                status: 'draft',
                dangerousOccurrenceJson: dangerousOccurrence,
            },
            include: eventInclude,
        });
        await this.audit(event.id, 'created', input.createdByUserId, {
            classification,
            risk,
            dangerousOccurrence: {
                flagged: dangerousOccurrence.flagged,
                codes: dangerousOccurrence.codes,
                mustReportAny: dangerousOccurrence.mustReportAny,
                framework: dangerousOccurrence.framework.frameworkLabel,
            },
        });
        await this.auditLog.logAudit({ id: input.createdByUserId, companyId: input.companyId }, audit_actions_1.AuditAction.INCIDENT_CREATED, {
            type: audit_actions_1.AuditEntityType.PM_SAFETY_EVENT,
            id: event.id,
            tenantId: input.companyId,
        }, {
            eventType: event.eventType,
            severity: event.severity,
            ohsReportingRequired: dangerousOccurrence.mustReportAny,
        });
        return Object.assign(Object.assign({}, event), { dangerousOccurrence });
    }
    async update(id, data, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const existing = await this.get(id);
        if (existing.status === 'closed' || existing.status === 'locked') {
            throw new common_1.BadRequestException('Closed or locked events are not editable');
        }
        const description = (_b = (_a = data.description) !== null && _a !== void 0 ? _a : existing.description) !== null && _b !== void 0 ? _b : '';
        const eventType = (_c = data.eventType) !== null && _c !== void 0 ? _c : existing.eventType;
        const classification = this.classifier.classifyType(description, eventType);
        const injuries = await this.prisma.pmSafetyEventInjury.findMany({
            where: { eventId: id },
        });
        const risk = this.riskEngine.score({
            eventType: classification.eventType,
            description,
            hasInjury: injuries.length > 0,
            medicalAid: injuries.some((i) => i.medicalAid),
            lostTime: injuries.some((i) => i.lostTime),
            equipmentFailure: existing.eventType === 'equipment_failure',
        });
        const project = await this.prisma.project
            .findFirst({
            where: { id: existing.projectId },
            include: { site: true, company: true },
        })
            .catch(() => null);
        const regionCode = ((_d = project === null || project === void 0 ? void 0 : project.site) === null || _d === void 0 ? void 0 : _d.region) || ((_e = project === null || project === void 0 ? void 0 : project.company) === null || _e === void 0 ? void 0 : _e.province) || 'CA-AB';
        const dangerousOccurrence = (0, dangerous_occurrence_engine_1.evaluateDangerousOccurrences)([
            (_f = data.title) !== null && _f !== void 0 ? _f : existing.title,
            description,
            (_g = data.locationNote) !== null && _g !== void 0 ? _g : existing.locationNote,
        ]
            .filter(Boolean)
            .join(' '), regionCode);
        const occurredAt = data.occurredAt == null
            ? undefined
            : data.occurredAt instanceof Date
                ? data.occurredAt
                : new Date(data.occurredAt);
        const updated = await this.prisma.pmSafetyEvent.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.title ? { title: data.title } : {})), (data.description !== undefined
                ? { description: data.description }
                : {})), (data.eventType ? { eventType: data.eventType } : {})), (data.siteId !== undefined ? { siteId: data.siteId } : {})), (data.locationNote !== undefined
                ? { locationNote: data.locationNote }
                : {})), (data.weatherJson
                ? { weatherJson: data.weatherJson }
                : {})), (data.propertyDamageJson
                ? {
                    propertyDamageJson: data.propertyDamageJson,
                }
                : {})), (data.environmentalImpactJson
                ? {
                    environmentalImpactJson: data.environmentalImpactJson,
                }
                : {})), (data.intakeWizardStep !== undefined
                ? { intakeWizardStep: data.intakeWizardStep }
                : {})), (occurredAt && !Number.isNaN(occurredAt.getTime())
                ? { occurredAt }
                : {})), { eventType: classification.eventType, severity: (_h = data.severity) !== null && _h !== void 0 ? _h : risk.severity, likelihood: risk.likelihood, riskScore: risk.riskScore, requiresSupervisorReview: risk.requiresSupervisorReview ||
                    dangerousOccurrence.supervisorReviewRequired, mandatoryInvestigation: existing.mandatoryInvestigation || dangerousOccurrence.mustReportAny, hecaCategoryCode: this.classifier.suggestHecaCategory(description), dangerousOccurrenceJson: dangerousOccurrence }),
            include: eventInclude,
        });
        await this.snapshotVersion(id, actorId);
        return Object.assign(Object.assign({}, updated), { dangerousOccurrence });
    }
    async snapshotVersion(eventId, authorId) {
        var _a;
        const event = await this.get(eventId);
        const last = await this.prisma.pmSafetyEventVersion.findFirst({
            where: { eventId },
            orderBy: { version: 'desc' },
        });
        const version = ((_a = last === null || last === void 0 ? void 0 : last.version) !== null && _a !== void 0 ? _a : 0) + 1;
        await this.prisma.pmSafetyEventVersion.create({
            data: {
                eventId,
                version,
                authorId,
                snapshot: event,
            },
        });
    }
    async addInjury(eventId, data) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventInjury.create({
            data: Object.assign({ eventId }, data),
        });
    }
    async addPerson(eventId, data) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventPerson.create({
            data: Object.assign({ eventId }, data),
        });
    }
    async linkEquipment(eventId, equipmentId, failureNotes, conditionScore) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventEquipment.upsert({
            where: { eventId_equipmentId: { eventId, equipmentId } },
            create: { eventId, equipmentId, failureNotes, conditionScore },
            update: { failureNotes, conditionScore },
        });
    }
    async addWitness(eventId, data, capturedByUserId) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventWitness.create({
            data: Object.assign(Object.assign({ eventId }, data), { capturedByUserId }),
        });
    }
    async addStatement(eventId, data) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventStatement.create({
            data: {
                eventId,
                witnessId: data.witnessId,
                statementText: data.statementText,
                signatureData: data.signatureData,
                signedAt: data.signatureData ? new Date() : undefined,
                clientSyncId: data.clientSyncId,
            },
        });
    }
    async addAttachment(eventId, data) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventAttachment.create({
            data: Object.assign({ eventId }, data),
        });
    }
    async addContributingFactor(eventId, data) {
        await this.get(eventId);
        return this.prisma.pmSafetyEventContributingFactor.create({
            data: Object.assign({ eventId }, data),
        });
    }
    async addRootCause(eventId, data, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const event = await this.get(eventId);
        const method = (_a = data.method) !== null && _a !== void 0 ? _a : (data.pathway ? 'taproot' : 'five_why');
        const pathway = (_b = data.pathway) !== null && _b !== void 0 ? _b : data.category;
        const whyChain = (_c = data.whyChain) !== null && _c !== void 0 ? _c : (method === 'five_why'
            ? this.rca.buildFiveWhyChain((_d = event.description) !== null && _d !== void 0 ? _d : event.title, data.description)
            : []);
        const taprootJson = method === 'taproot' && pathway
            ? this.capaIntegration.buildTaprootJson(pathway, data.description, event.contributingFactors.map((f) => f.label))
            : (_e = data.taprootJson) !== null && _e !== void 0 ? _e : {};
        const rootCause = await this.prisma.pmSafetyEventRootCause.create({
            data: {
                eventId,
                method,
                description: data.description,
                category: (_f = data.category) !== null && _f !== void 0 ? _f : pathway,
                libraryCode: data.libraryCode,
                whyChain: whyChain,
                fishboneJson: ((_g = data.fishboneJson) !== null && _g !== void 0 ? _g : {}),
                taprootJson: taprootJson,
            },
        });
        if (actorId) {
            await this.capaIntegration.createFromRootCause({
                eventId,
                rootCauseId: rootCause.id,
                description: data.description,
                pathway,
                responsibleParty: (_h = data.responsibleParty) !== null && _h !== void 0 ? _h : (pathway === 'equipment_failure' ? 'contractor' : 'supervisor'),
                actorId,
                linkToInspection: (_j = data.dispatchContractor) !== null && _j !== void 0 ? _j : pathway === 'equipment_failure',
            });
        }
        else {
            await this.generateCorrectiveForRootCause(event, rootCause.id, data.description, actorId);
        }
        await this.auditLog.logAudit({ id: actorId !== null && actorId !== void 0 ? actorId : null, companyId: event.companyId }, audit_actions_1.AuditAction.INCIDENT_RCA_ADDED, {
            type: audit_actions_1.AuditEntityType.PM_SAFETY_EVENT,
            id: eventId,
            tenantId: event.companyId,
        }, { rootCauseId: rootCause.id, method });
        return rootCause;
    }
    async suggestRootCauses(eventId) {
        var _a, _b, _c;
        const event = await this.get(eventId);
        const lib = await this.library.rootCauses(event.companyId);
        const factors = event.contributingFactors.map((f) => f.label);
        const historical = await this.prisma.pmSafetyEventRootCause.findMany({
            where: { event: { companyId: event.companyId } },
            select: { libraryCode: true },
            take: 50,
        });
        return this.rca.suggestRootCauses({
            description: (_a = event.description) !== null && _a !== void 0 ? _a : event.title,
            eventType: event.eventType,
            contributingFactors: factors,
            guidedAnswers: ((_c = (_b = event.investigation) === null || _b === void 0 ? void 0 : _b.guidedAnswersJson) !== null && _c !== void 0 ? _c : {}),
            library: lib,
            historicalCodes: historical
                .map((h) => h.libraryCode)
                .filter((c) => !!c),
        });
    }
    async generateCorrectiveForRootCause(event, rootCauseId, description, actorId) {
        var _a;
        const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const capa = await this.prisma.pmSafetyEventCorrectiveAction.create({
            data: {
                eventId: event.id,
                rootCauseId,
                title: `CAPA: ${description.slice(0, 80)}`,
                description,
                dueAt,
                status: 'open',
            },
        });
        const entry = await this.cail.emitFromEvent({
            projectId: event.projectId,
            ownerCompanyId: event.companyId,
            eventId: event.id,
            sourceItemId: capa.id,
            title: capa.title,
            description,
            severity: event.severity,
            createdByUserId: actorId,
            siteId: (_a = event.siteId) !== null && _a !== void 0 ? _a : undefined,
            dueDate: dueAt,
        });
        await this.prisma.pmSafetyEventCorrectiveAction.update({
            where: { id: capa.id },
            data: { cailEntryId: entry.id },
        });
    }
    async addTimelineEntry(eventId, data) {
        var _a, _b;
        await this.get(eventId);
        await this.audit(eventId, 'timeline', data.actorId, {
            timestamp: ((_a = data.timestamp) !== null && _a !== void 0 ? _a : new Date()).toISOString(),
            description: data.description,
        });
        return Object.assign(Object.assign({ eventId }, data), { timestamp: (_b = data.timestamp) !== null && _b !== void 0 ? _b : new Date() });
    }
    async listTimeline(eventId) {
        const logs = await this.prisma.pmSafetyEventAuditLog.findMany({
            where: { eventId, eventType: 'timeline' },
            orderBy: { createdAt: 'asc' },
            include: { actor: { select: { id: true, username: true } } },
        });
        return logs.map((l) => {
            var _a, _b, _c, _d;
            const p = ((_a = l.payload) !== null && _a !== void 0 ? _a : {});
            return {
                id: l.id,
                incidentId: eventId,
                timestamp: (_b = p.timestamp) !== null && _b !== void 0 ? _b : l.createdAt.toISOString(),
                description: (_c = p.description) !== null && _c !== void 0 ? _c : '',
                actorId: l.actorId,
                actorName: (_d = l.actor) === null || _d === void 0 ? void 0 : _d.username,
            };
        });
    }
    async close(id, actorId) {
        const event = await this.get(id);
        if (!['approved', 'locked', 'submitted'].includes(event.status)) {
            throw new common_1.BadRequestException('Event must be approved or submitted before closeout');
        }
        const openCapa = event.correctiveActions.filter((c) => c.status !== 'closed' && c.status !== 'verified');
        const unassigned = openCapa.filter((c) => !c.assignedUserId);
        if (unassigned.length > 0) {
            throw new common_1.BadRequestException('All open corrective actions must be assigned before close');
        }
        if (['medium', 'high', 'critical'].includes(event.severity)) {
            if (event.rootCauses.length === 0) {
                throw new common_1.BadRequestException('RCA required for medium+ severity before close');
            }
        }
        await this.prisma.pmSafetyEvent.update({
            where: { id },
            data: { status: 'closed', closedAt: new Date() },
        });
        await this.audit(id, 'closed', actorId);
        await this.auditLog.logAudit({ id: actorId, companyId: event.companyId }, audit_actions_1.AuditAction.INCIDENT_STATUS_CHANGED, {
            type: audit_actions_1.AuditEntityType.PM_SAFETY_EVENT,
            id,
            tenantId: event.companyId,
        }, { from: event.status, to: 'closed' });
        return this.get(id);
    }
    async submit(id, actorId) {
        var _a, _b;
        const event = await this.get(id);
        if (event.status !== 'draft') {
            throw new common_1.BadRequestException('Only draft events can be submitted');
        }
        if (['medium', 'high', 'critical'].includes(event.severity)) {
            if (event.rootCauses.length === 0) {
                throw new common_1.BadRequestException('Root cause analysis required for medium or higher severity');
            }
        }
        const status = event.requiresSupervisorReview
            ? 'review_required'
            : 'submitted';
        await this.prisma.pmSafetyEvent.update({
            where: { id },
            data: { status, submittedAt: new Date() },
        });
        await this.cail.emitFromEvent({
            projectId: event.projectId,
            ownerCompanyId: event.companyId,
            eventId: id,
            sourceItemId: 'submit',
            title: `Event reported: ${event.title}`,
            description: (_a = event.description) !== null && _a !== void 0 ? _a : undefined,
            severity: event.severity,
            createdByUserId: actorId,
            siteId: (_b = event.siteId) !== null && _b !== void 0 ? _b : undefined,
        });
        await this.ingestion.ingestToSifHeca(id, actorId);
        await this.equipment.applyLockoutsForEvent(id, actorId);
        if (event.severity === 'high' ||
            event.severity === 'critical' ||
            event.injuries.some((i) => i.medicalAid || i.lostTime)) {
            await this.prisma.pmSafetyEventCorrectiveAction.create({
                data: {
                    eventId: id,
                    title: 'Immediate supervisor review and site control verification',
                    description: 'Auto-generated for high-severity or medical/lost-time event',
                    status: 'open',
                    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                },
            });
        }
        await this.audit(id, 'submitted', actorId);
        await this.auditLog.logAudit({ id: actorId, companyId: event.companyId }, audit_actions_1.AuditAction.INCIDENT_STATUS_CHANGED, {
            type: audit_actions_1.AuditEntityType.PM_SAFETY_EVENT,
            id,
            tenantId: event.companyId,
        }, { from: 'draft', to: status });
        return this.get(id);
    }
    async review(id, action, actorId, notes) {
        const event = await this.get(id);
        if (event.status !== 'review_required' && event.status !== 'submitted') {
            throw new common_1.BadRequestException('Event not in review state');
        }
        let status;
        if (action === 'approve')
            status = 'approved';
        else if (action === 'reject')
            status = 'rejected';
        else
            status = 'draft';
        await this.prisma.pmSafetyEvent.update({
            where: { id },
            data: Object.assign({ status: action === 'approve' ? 'locked' : status, reviewNotes: notes, reviewedByUserId: actorId, reviewedAt: new Date() }, (action === 'approve' ? { closedAt: new Date() } : {})),
        });
        await this.audit(id, `review_${action}`, actorId, { notes });
        await this.auditLog.logAudit({ id: actorId, companyId: event.companyId }, audit_actions_1.AuditAction.INCIDENT_STATUS_CHANGED, {
            type: audit_actions_1.AuditEntityType.PM_SAFETY_EVENT,
            id,
            tenantId: event.companyId,
        }, {
            from: event.status,
            to: action === 'approve' ? 'locked' : status,
            action,
        });
        return this.get(id);
    }
    async workerAccessCheck(workerId, projectId) {
        const criticalInvolvement = await this.prisma.pmSafetyEventPerson.count({
            where: {
                workerId,
                event: {
                    projectId,
                    deletedAt: null,
                    severity: 'critical',
                    status: { notIn: ['closed', 'approved', 'locked'] },
                },
            },
        });
        const openCapa = await this.prisma.pmSafetyEventCorrectiveAction.count({
            where: {
                status: 'open',
                event: {
                    projectId,
                    people: { some: { workerId } },
                },
            },
        });
        const allowed = criticalInvolvement === 0 && openCapa === 0;
        return {
            allowed,
            criticalEventsWithoutClearance: criticalInvolvement,
            openCorrectiveActions: openCapa,
        };
    }
    async syncOffline(payload) {
        const existing = await this.prisma.pmSafetyEvent.findUnique({
            where: { clientSyncId: payload.clientSyncId },
        });
        if (existing) {
            if (payload.submitted && existing.status === 'draft') {
                return this.submit(existing.id, payload.createdByUserId);
            }
            return this.get(existing.id);
        }
        const created = await this.createDraft({
            companyId: payload.companyId,
            projectId: payload.projectId,
            createdByUserId: payload.createdByUserId,
            title: payload.title,
            description: payload.description,
            eventType: payload.eventType,
            siteId: payload.siteId,
            clientSyncId: payload.clientSyncId,
            intakeWizardStep: 5,
        });
        if (payload.injuries) {
            for (const inj of payload.injuries) {
                await this.addInjury(created.id, inj);
            }
        }
        if (payload.equipmentIds) {
            for (const eqId of payload.equipmentIds) {
                await this.linkEquipment(created.id, eqId);
            }
        }
        if (payload.submitted) {
            return this.submit(created.id, payload.createdByUserId);
        }
        return this.get(created.id);
    }
};
exports.PmSafetyEventsService = PmSafetyEventsService;
exports.PmSafetyEventsService = PmSafetyEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_classification_engine_1.EventClassificationEngine,
        severity_risk_engine_1.SeverityRiskEngine,
        rca_engine_1.RcaEngine,
        pm_safety_events_cail_service_1.PmSafetyEventsCailService,
        pm_safety_events_ingestion_service_1.PmSafetyEventsIngestionService,
        pm_safety_events_equipment_service_1.PmSafetyEventsEquipmentService,
        pm_safety_events_library_service_1.PmSafetyEventsLibraryService,
        pm_investigation_capa_integration_service_1.PmInvestigationCapaIntegrationService,
        audit_log_service_1.AuditLogService])
], PmSafetyEventsService);
//# sourceMappingURL=pm-safety-events.service.js.map