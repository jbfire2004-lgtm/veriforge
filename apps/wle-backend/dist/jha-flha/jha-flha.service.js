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
exports.JhaFlhaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jha_scoring_service_1 = require("./jha-scoring.service");
const jha_cail_bridge_service_1 = require("./jha-cail-bridge.service");
const jha_library_service_1 = require("./jha-library.service");
const jha_flha_constants_1 = require("./jha-flha.constants");
const sif_heca_ingestion_service_1 = require("../sif-heca/sif-heca-ingestion.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const pm_unified_corrective_action_service_1 = require("../pm-unified-corrective-action/pm-unified-corrective-action.service");
const adoption_event_service_1 = require("../modules/adoption-analytics/adoption-event.service");
const adoption_analytics_constants_1 = require("../modules/adoption-analytics/adoption-analytics.constants");
const EDITABLE = ['DRAFT', 'REJECTED'];
let JhaFlhaService = class JhaFlhaService {
    constructor(prisma, scoring, cail, library, sifIngestion, capaAuto, unifiedCapa, adoption) {
        this.prisma = prisma;
        this.scoring = scoring;
        this.cail = cail;
        this.library = library;
        this.sifIngestion = sifIngestion;
        this.capaAuto = capaAuto;
        this.unifiedCapa = unifiedCapa;
        this.adoption = adoption;
    }
    async audit(jhaFlhaId, eventType, actorId, payload) {
        await this.prisma.jhaFlhaAuditLog.create({
            data: {
                jhaFlhaId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    fullInclude() {
        return {
            hazards: { orderBy: { sortOrder: 'asc' } },
            controls: true,
            energySources: true,
            workers: {
                include: {
                    worker: { select: { id: true, firstName: true, lastName: true } },
                },
            },
            equipmentLinks: {
                include: {
                    equipment: { select: { id: true, name: true, assetTag: true } },
                },
            },
            signatures: true,
            attachments: true,
            correctiveActions: true,
            project: { select: { id: true, name: true, companyId: true } },
        };
    }
    async list(filters) {
        return this.prisma.jhaFlha.findMany({
            where: {
                deletedAt: null,
                projectId: filters.projectId,
                companyId: filters.companyId,
                status: filters.status,
                kind: filters.kind,
            },
            include: {
                project: { select: { id: true, name: true } },
                _count: { select: { hazards: true, workers: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 100,
        });
    }
    async getById(id) {
        const row = await this.prisma.jhaFlha.findFirst({
            where: { id, deletedAt: null },
            include: this.fullInclude(),
        });
        if (!row)
            throw new common_1.NotFoundException('JHA/FLHA not found');
        return row;
    }
    async getScore(id) {
        return this.evaluate(id);
    }
    async getProjectAnalytics(projectId) {
        const since90 = new Date(Date.now() - 90 * 86400000);
        const rows = await this.prisma.jhaFlha.findMany({
            where: { projectId, deletedAt: null, createdAt: { gte: since90 } },
            include: {
                _count: { select: { hazards: true, controls: true, workers: true } },
                workers: { select: { signedAt: true } },
            },
        });
        const total = rows.length;
        const approved = rows.filter((r) => r.status === 'APPROVED' || r.status === 'LOCKED').length;
        const sifFlagged = rows.filter((r) => r.sifPotential).length;
        const qualityScores = rows
            .map((r) => { var _a; return (_a = r.qualityScore) !== null && _a !== void 0 ? _a : 0; })
            .filter((s) => s > 0);
        const avgQuality = qualityScores.length > 0
            ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
            : null;
        const hazardCount = rows.reduce((s, r) => s + r._count.hazards, 0);
        const controlCount = rows.reduce((s, r) => s + r._count.controls, 0);
        const hazardCoverage = total > 0
            ? Math.round((rows.filter((r) => r._count.hazards > 0).length / total) * 100)
            : 100;
        const controlEffectiveness = hazardCount > 0
            ? Math.min(100, Math.round((controlCount / hazardCount) * 50))
            : 0;
        let signedWorkers = 0;
        let totalWorkers = 0;
        for (const r of rows) {
            totalWorkers += r.workers.length;
            signedWorkers += r.workers.filter((w) => w.signedAt).length;
        }
        const workerParticipation = totalWorkers > 0 ? Math.round((signedWorkers / totalWorkers) * 100) : 100;
        const projectRiskContribution = rows.reduce((s, r) => { var _a; return s + ((_a = r.taskRiskScore) !== null && _a !== void 0 ? _a : 0); }, 0);
        return {
            projectId,
            windowDays: 90,
            totals: { jhas: total, approved, sifFlagged },
            scores: {
                jhaQualityScore: avgQuality,
                hazardCoverageScore: hazardCoverage,
                controlEffectivenessScore: controlEffectiveness,
                workerParticipationScore: workerParticipation,
                projectRiskContribution: Math.min(100, Math.round(projectRiskContribution / Math.max(1, total))),
            },
            trends: {
                sifRatePct: total > 0 ? Math.round((sifFlagged / total) * 100) : 0,
                approvalRatePct: total > 0 ? Math.round((approved / total) * 100) : 0,
            },
            leadingIndicators: {
                avgHazardsPerJha: total > 0 ? Math.round((hazardCount / total) * 10) / 10 : 0,
                avgControlsPerJha: total > 0 ? Math.round((controlCount / total) * 10) / 10 : 0,
                underReview: rows.filter((r) => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED').length,
            },
            laggingIndicators: {
                rejected: rows.filter((r) => r.status === 'REJECTED').length,
                draftOpen: rows.filter((r) => r.status === 'DRAFT').length,
            },
        };
    }
    async create(input) {
        var _a, _b, _c;
        if (input.clientSyncId) {
            const existing = await this.prisma.jhaFlha.findUnique({
                where: { clientSyncId: input.clientSyncId },
            });
            if (existing)
                return this.getById(existing.id);
        }
        const row = await this.prisma.jhaFlha.create({
            data: {
                kind: (_a = input.kind) !== null && _a !== void 0 ? _a : 'FLHA',
                companyId: input.companyId,
                projectId: input.projectId,
                siteId: input.siteId,
                workPackageId: input.workPackageId,
                taskId: input.taskId,
                taskLibraryId: input.taskLibraryId,
                taskDescription: input.taskDescription,
                workScope: input.workScope,
                locationNote: input.locationNote,
                environmentalJson: ((_b = input.environmentalJson) !== null && _b !== void 0 ? _b : {}),
                createdByUserId: input.createdByUserId,
                clientSyncId: input.clientSyncId,
            },
        });
        await this.audit(row.id, 'created', input.createdByUserId);
        if (this.adoption) {
            const kind = (_c = input.kind) !== null && _c !== void 0 ? _c : 'FLHA';
            this.adoption.track({
                companyId: input.companyId,
                userId: input.createdByUserId,
                event: kind === 'JHA'
                    ? adoption_analytics_constants_1.ADOPTION_EVENT_TYPES.JHA_CREATED
                    : adoption_analytics_constants_1.ADOPTION_EVENT_TYPES.FLHA_CREATED,
                metadata: { jhaFlhaId: row.id },
            });
        }
        return this.getById(row.id);
    }
    async updateDraft(id, data, actorId) {
        const row = await this.getById(id);
        if (!EDITABLE.includes(row.status)) {
            throw new common_1.BadRequestException('Only draft or rejected records can be edited');
        }
        await this.prisma.jhaFlha.update({
            where: { id },
            data: {
                taskDescription: data.taskDescription,
                workScope: data.workScope,
                locationNote: data.locationNote,
                environmentalJson: data.environmentalJson,
                clientVersion: { increment: 1 },
            },
        });
        await this.audit(id, 'draft_updated', actorId);
        return this.getById(id);
    }
    async addHazard(jhaFlhaId, data, actorId) {
        var _a, _b, _c, _d;
        await this.assertEditable(jhaFlhaId);
        const severity = (_a = data.severity) !== null && _a !== void 0 ? _a : 3;
        const likelihood = (_b = data.likelihood) !== null && _b !== void 0 ? _b : 3;
        const riskScore = this.scoring.computeHazardRisk(severity, likelihood);
        const count = await this.prisma.jhaFlhaHazard.count({
            where: { jhaFlhaId },
        });
        const hazard = await this.prisma.jhaFlhaHazard.create({
            data: {
                jhaFlhaId,
                sortOrder: count,
                libraryEntryId: data.libraryEntryId,
                category: data.category,
                subcategory: data.subcategory,
                description: data.description,
                severity,
                likelihood,
                riskScore,
                energyTypes: ((_c = data.energyTypes) !== null && _c !== void 0 ? _c : []),
                sifIndicator: (_d = data.sifIndicator) !== null && _d !== void 0 ? _d : riskScore >= 20,
            },
        });
        await this.recomputeScores(jhaFlhaId);
        await this.syncEnergyFromHazards(jhaFlhaId, actorId);
        await this.audit(jhaFlhaId, 'hazard_added', actorId, {
            hazardId: hazard.id,
        });
        return hazard;
    }
    async syncEnergyFromHazards(jhaFlhaId, actorId) {
        var _a;
        const row = await this.getById(jhaFlhaId);
        const merged = new Map();
        for (const es of row.energySources) {
            merged.set(es.energyType, es.exposureLevel);
        }
        for (const h of row.hazards) {
            const types = (_a = h.energyTypes) !== null && _a !== void 0 ? _a : [];
            for (const t of types) {
                const et = t;
                if (!merged.has(et))
                    merged.set(et, 3);
            }
        }
        if (merged.size === 0)
            return row;
        const sources = Array.from(merged.entries()).map(([energyType, exposureLevel]) => ({
            energyType,
            exposureLevel,
        }));
        await this.setEnergySources(jhaFlhaId, sources, actorId);
    }
    async addControl(jhaFlhaId, data, actorId) {
        var _a;
        await this.assertEditable(jhaFlhaId);
        const control = await this.prisma.jhaFlhaControl.create({
            data: {
                jhaFlhaId,
                hazardId: data.hazardId,
                libraryEntryId: data.libraryEntryId,
                controlType: data.controlType,
                description: data.description,
                adequate: data.adequate,
                ppeRequired: (_a = data.ppeRequired) !== null && _a !== void 0 ? _a : false,
                effectivenessScore: data.adequate === false ? 2 : 4,
            },
        });
        await this.recomputeScores(jhaFlhaId);
        await this.audit(jhaFlhaId, 'control_added', actorId, {
            controlId: control.id,
        });
        return control;
    }
    async setEnergySources(jhaFlhaId, sources, actorId) {
        await this.assertEditable(jhaFlhaId);
        await this.prisma.jhaFlhaEnergySource.deleteMany({ where: { jhaFlhaId } });
        for (const s of sources) {
            await this.prisma.jhaFlhaEnergySource.create({
                data: {
                    jhaFlhaId,
                    energyType: s.energyType,
                    exposureLevel: s.exposureLevel,
                    controlsSummary: s.controlsSummary,
                },
            });
        }
        await this.recomputeScores(jhaFlhaId);
        await this.audit(jhaFlhaId, 'energy_updated', actorId);
        return this.getById(jhaFlhaId);
    }
    async setCrew(jhaFlhaId, workers, actorId) {
        var _a;
        await this.assertEditable(jhaFlhaId);
        await this.prisma.jhaFlhaWorker.deleteMany({ where: { jhaFlhaId } });
        for (const w of workers) {
            await this.prisma.jhaFlhaWorker.create({
                data: { jhaFlhaId, workerId: w.workerId, role: (_a = w.role) !== null && _a !== void 0 ? _a : 'crew' },
            });
        }
        await this.audit(jhaFlhaId, 'crew_updated', actorId);
        return this.getById(jhaFlhaId);
    }
    async setEquipment(jhaFlhaId, items, actorId) {
        var _a;
        await this.assertEditable(jhaFlhaId);
        await this.prisma.jhaFlhaEquipment.deleteMany({ where: { jhaFlhaId } });
        for (const e of items) {
            await this.prisma.jhaFlhaEquipment.create({
                data: {
                    jhaFlhaId,
                    equipmentId: e.equipmentId,
                    authorized: (_a = e.authorized) !== null && _a !== void 0 ? _a : false,
                },
            });
        }
        await this.audit(jhaFlhaId, 'equipment_updated', actorId);
        return this.getById(jhaFlhaId);
    }
    async evaluate(id) {
        const row = await this.getById(id);
        const evaluation = await this.buildEvaluation(row);
        await this.prisma.jhaFlha.update({
            where: { id },
            data: {
                riskScore: evaluation.riskScore,
                taskRiskScore: evaluation.taskRiskScore,
                sifScore: evaluation.sifScore,
                sifPotential: evaluation.sifPotential,
                highEnergyFlag: evaluation.highEnergyFlag,
                qualityScore: evaluation.qualityScore,
                requiresSupervisorReview: evaluation.requiresSupervisorReview,
                controlsAdequate: evaluation.controlsAdequate,
                aiAnalysis: evaluation,
            },
        });
        return Object.assign(Object.assign({}, evaluation), { jhaFlhaId: id });
    }
    async submit(id, actorId) {
        const row = await this.getById(id);
        if (!EDITABLE.includes(row.status)) {
            throw new common_1.BadRequestException('Cannot submit in current status');
        }
        const evaluation = await this.buildEvaluation(row);
        if (evaluation.blockSubmission) {
            throw new common_1.BadRequestException({
                message: 'Submission blocked',
                reasons: evaluation.blockReasons,
                evaluation,
            });
        }
        const status = evaluation.requiresSupervisorReview
            ? 'UNDER_REVIEW'
            : 'SUBMITTED';
        await this.snapshotVersion(id, actorId, 'submit');
        await this.prisma.jhaFlha.update({
            where: { id },
            data: {
                status,
                submittedAt: new Date(),
                riskScore: evaluation.riskScore,
                taskRiskScore: evaluation.taskRiskScore,
                sifScore: evaluation.sifScore,
                sifPotential: evaluation.sifPotential,
                highEnergyFlag: evaluation.highEnergyFlag,
                qualityScore: evaluation.qualityScore,
                requiresSupervisorReview: evaluation.requiresSupervisorReview,
                controlsAdequate: evaluation.controlsAdequate,
            },
        });
        if (!evaluation.controlsAdequate || evaluation.sifPotential) {
            await this.cail.emitFromEvaluation(id, row.projectId, row.companyId, row.kind, evaluation, actorId, row.siteId);
        }
        if (this.sifIngestion) {
            await this.sifIngestion.ingestFromJhaFlha(id, actorId);
        }
        if (this.capaAuto &&
            (!evaluation.controlsAdequate || evaluation.sifPotential)) {
            await this.capaAuto.fromJhaFlha(id, actorId !== null && actorId !== void 0 ? actorId : 0);
        }
        await this.audit(id, 'submitted', actorId, { status });
        return this.getById(id);
    }
    async supervisorReview(id, action, actorId, reviewNotes) {
        const row = await this.getById(id);
        if (row.status !== 'UNDER_REVIEW' && row.status !== 'SUBMITTED') {
            throw new common_1.BadRequestException('Not awaiting supervisor review');
        }
        let status;
        if (action === 'approve') {
            if (this.unifiedCapa) {
                const gate = await this.unifiedCapa.jhaApprovalGate(id);
                if (!gate.allowed) {
                    throw new common_1.BadRequestException(gate.blockers.join('; '));
                }
            }
            const supSig = row.signatures.find((s) => s.role === 'SUPERVISOR');
            if (!supSig && row.requiresSupervisorReview) {
                throw new common_1.BadRequestException('Supervisor signature required before approval');
            }
            const crewSigned = row.workers.filter((w) => w.signedAt).length;
            if (row.workers.length > 0 && crewSigned < row.workers.length) {
                throw new common_1.BadRequestException('All crew members must sign before approval');
            }
            status = 'APPROVED';
            await this.prisma.jhaFlha.update({
                where: { id },
                data: { status, approvedAt: new Date(), reviewNotes, lockedAt: null },
            });
            await this.library.promoteFromApprovedJha(id);
        }
        else if (action === 'reject') {
            status = 'REJECTED';
            await this.prisma.jhaFlha.update({
                where: { id },
                data: { status, reviewNotes },
            });
        }
        else {
            status = 'DRAFT';
            await this.prisma.jhaFlha.update({
                where: { id },
                data: { status, reviewNotes },
            });
        }
        await this.snapshotVersion(id, actorId, action);
        await this.audit(id, `review_${action}`, actorId, { reviewNotes });
        return this.getById(id);
    }
    async lock(id, actorId) {
        await this.prisma.jhaFlha.update({
            where: { id },
            data: { status: 'LOCKED', lockedAt: new Date() },
        });
        await this.audit(id, 'locked', actorId);
        return this.getById(id);
    }
    async sign(id, data) {
        const row = await this.getById(id);
        if (row.status === 'LOCKED') {
            throw new common_1.BadRequestException('Record is locked');
        }
        await this.prisma.jhaFlhaSignature.create({
            data: {
                jhaFlhaId: id,
                role: data.role,
                signatureData: data.signatureData,
                signerName: data.signerName,
                signerUserId: data.signerUserId,
            },
        });
        if (data.role === 'WORKER' && data.workerId) {
            await this.prisma.jhaFlhaWorker.updateMany({
                where: { jhaFlhaId: id, workerId: data.workerId },
                data: { signedAt: new Date(), hazardAcknowledged: true },
            });
        }
        await this.audit(id, 'signed', data.signerUserId, { role: data.role });
        return this.getById(id);
    }
    async addAttachment(id, data) {
        await this.assertEditable(id);
        return this.prisma.jhaFlhaAttachment.create({
            data: Object.assign({ jhaFlhaId: id }, data),
        });
    }
    async getSuggestions(id) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const row = await this.getById(id);
        const taskCode = (_a = row.taskLibraryId) !== null && _a !== void 0 ? _a : undefined;
        const hazards = await this.library.listHazards(row.companyId, row.projectId, taskCode);
        const controls = await this.library.listControls(row.companyId, row.projectId);
        const env = ((_b = row.environmentalJson) !== null && _b !== void 0 ? _b : {});
        const onHazards = ((_c = row.hazards) !== null && _c !== void 0 ? _c : []);
        const onControlsFull = ((_d = row.controls) !== null && _d !== void 0 ? _d : []);
        const energySources = ((_e = row.energySources) !== null && _e !== void 0 ? _e : []);
        const smart = await this.library.suggest({
            taskDescription: (_f = row.taskDescription) !== null && _f !== void 0 ? _f : undefined,
            locationNote: (_g = row.locationNote) !== null && _g !== void 0 ? _g : undefined,
            weather: String((_h = env.weather) !== null && _h !== void 0 ? _h : ''),
            selectedHazardCategories: onHazards
                .map((h) => h.category)
                .filter(Boolean),
            selectedEnergyTypes: energySources.map((e) => e.energyType),
            existingHazardDescriptions: onHazards.map((h) => h.description),
            existingControlDescriptions: onControlsFull.map((c) => c.description),
            hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
            controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
            onFormControls: onControlsFull.map((c) => {
                var _a;
                return ({
                    controlType: c.controlType,
                    description: c.description,
                    controlClass: (_a = jha_flha_constants_1.CONTROL_CLASS_LOOKUP.get(c.description.toLowerCase().trim())) !== null && _a !== void 0 ? _a : 'alternative',
                });
            }),
        }, row.projectId);
        return {
            hazards,
            controls,
            energyWheel: this.library.energyWheel(),
            suggestedHazards: smart.suggestedHazards,
            suggestedControls: smart.suggestedControls,
            warnings: smart.warnings,
            crewOftenAdds: smart.crewOftenAdds,
            missedHazards: smart.missedHazards,
            missedControls: smart.missedControls,
            requiredEnergyTypes: smart.requiredEnergyTypes,
            matchedTaskProfiles: smart.matchedTaskProfiles,
            gapWarnings: smart.gapWarnings,
            hecaNotes: smart.hecaNotes,
        };
    }
    async workerCompliance(workerId, projectId) {
        var _a, _b, _c;
        const approved = await this.prisma.jhaFlha.findFirst({
            where: {
                projectId,
                status: { in: ['APPROVED', 'LOCKED'] },
                workers: { some: { workerId } },
                approvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
            orderBy: { approvedAt: 'desc' },
        });
        return {
            compliant: !!approved,
            jhaFlhaId: (_a = approved === null || approved === void 0 ? void 0 : approved.id) !== null && _a !== void 0 ? _a : null,
            approvedAt: (_c = (_b = approved === null || approved === void 0 ? void 0 : approved.approvedAt) === null || _b === void 0 ? void 0 : _b.toISOString()) !== null && _c !== void 0 ? _c : null,
        };
    }
    async syncOffline(payload) {
        var _a, _b, _c, _d, _e, _f, _g;
        let row = await this.prisma.jhaFlha.findUnique({
            where: { clientSyncId: payload.clientSyncId },
        });
        if (!row) {
            const created = await this.create(Object.assign(Object.assign({}, payload), { createdByUserId: payload.actorId }));
            row = await this.prisma.jhaFlha.findUniqueOrThrow({
                where: { id: created.id },
            });
        }
        if (EDITABLE.includes(row.status)) {
            await this.updateDraft(row.id, {
                taskDescription: payload.taskDescription,
                workScope: payload.workScope,
                locationNote: payload.locationNote,
                environmentalJson: payload.environmentalJson,
            }, payload.actorId);
            if ((_a = payload.hazards) === null || _a === void 0 ? void 0 : _a.length) {
                await this.prisma.jhaFlhaControl.deleteMany({
                    where: { jhaFlhaId: row.id },
                });
                await this.prisma.jhaFlhaHazard.deleteMany({
                    where: { jhaFlhaId: row.id },
                });
                const hazardIds = [];
                for (const h of payload.hazards) {
                    const created = await this.addHazard(row.id, h, payload.actorId);
                    hazardIds.push(created.id);
                }
                for (const c of (_b = payload.controls) !== null && _b !== void 0 ? _b : []) {
                    const hazardId = c.hazardIndex != null && hazardIds[c.hazardIndex]
                        ? hazardIds[c.hazardIndex]
                        : undefined;
                    await this.addControl(row.id, {
                        description: c.description,
                        controlType: (_c = c.controlType) !== null && _c !== void 0 ? _c : 'engineering',
                        hazardId,
                    }, payload.actorId);
                }
            }
            if ((_d = payload.energySources) === null || _d === void 0 ? void 0 : _d.length) {
                await this.setEnergySources(row.id, payload.energySources.map((s) => {
                    var _a;
                    return ({
                        energyType: s.energyType,
                        exposureLevel: (_a = s.exposureLevel) !== null && _a !== void 0 ? _a : 3,
                    });
                }), payload.actorId);
            }
            if ((_e = payload.equipment) === null || _e === void 0 ? void 0 : _e.length) {
                await this.setEquipment(row.id, payload.equipment, payload.actorId);
            }
            if ((_f = payload.workers) === null || _f === void 0 ? void 0 : _f.length) {
                await this.setCrew(row.id, payload.workers, payload.actorId);
            }
        }
        if ((_g = payload.signatures) === null || _g === void 0 ? void 0 : _g.length) {
            for (const sig of payload.signatures) {
                await this.sign(row.id, {
                    role: sig.role,
                    signatureData: sig.signatureData,
                    signerName: sig.signerName,
                    signerUserId: payload.actorId,
                    workerId: sig.workerId,
                });
            }
        }
        if (payload.submit) {
            return this.submit(row.id, payload.actorId);
        }
        return this.getById(row.id);
    }
    async assertEditable(id) {
        const row = await this.prisma.jhaFlha.findUnique({ where: { id } });
        if (!row || !EDITABLE.includes(row.status)) {
            throw new common_1.BadRequestException('JHA/FLHA is not editable');
        }
    }
    async buildEvaluation(row) {
        var _a;
        const env = ((_a = row.environmentalJson) !== null && _a !== void 0 ? _a : {});
        const workersSigned = row.workers.filter((w) => w.signedAt).length;
        const equipmentUnauthorized = row.equipmentLinks.filter((e) => !e.authorized).length;
        return this.scoring.evaluate({
            hazards: row.hazards.map((h) => ({
                id: h.id,
                description: h.description,
                severity: h.severity,
                likelihood: h.likelihood,
                riskScore: h.riskScore,
                energyTypes: h.energyTypes,
                sifIndicator: h.sifIndicator,
                category: h.category,
            })),
            controls: row.controls.map((c) => ({
                id: c.id,
                hazardId: c.hazardId,
                controlType: c.controlType,
                adequate: c.adequate,
                effectivenessScore: c.effectivenessScore,
                ppeRequired: c.ppeRequired,
                verified: c.verified,
            })),
            energySources: row.energySources.map((e) => ({
                energyType: e.energyType,
                exposureLevel: e.exposureLevel,
            })),
            environmentalJson: env,
            workersCount: row.workers.length,
            workersSigned,
            newWorkerPresent: false,
            equipmentUnauthorized,
        });
    }
    async recomputeScores(jhaFlhaId) {
        const row = await this.getById(jhaFlhaId);
        const evaluation = await this.buildEvaluation(row);
        await this.prisma.jhaFlha.update({
            where: { id: jhaFlhaId },
            data: {
                riskScore: evaluation.riskScore,
                taskRiskScore: evaluation.taskRiskScore,
                sifScore: evaluation.sifScore,
                sifPotential: evaluation.sifPotential,
                highEnergyFlag: evaluation.highEnergyFlag,
                qualityScore: evaluation.qualityScore,
                requiresSupervisorReview: evaluation.requiresSupervisorReview,
                controlsAdequate: evaluation.controlsAdequate,
            },
        });
    }
    async snapshotVersion(jhaFlhaId, actorId, changeReason) {
        const row = await this.getById(jhaFlhaId);
        const versionNumber = row.currentVersion;
        await this.prisma.jhaFlhaVersion.create({
            data: {
                jhaFlhaId,
                versionNumber,
                snapshotJson: row,
                changedByUserId: actorId,
                changeReason,
            },
        });
        await this.prisma.jhaFlha.update({
            where: { id: jhaFlhaId },
            data: { currentVersion: versionNumber + 1 },
        });
    }
};
exports.JhaFlhaService = JhaFlhaService;
exports.JhaFlhaService = JhaFlhaService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => sif_heca_ingestion_service_1.SifHecaIngestionService))),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jha_scoring_service_1.JhaScoringService,
        jha_cail_bridge_service_1.JhaCailBridgeService,
        jha_library_service_1.JhaLibraryService,
        sif_heca_ingestion_service_1.SifHecaIngestionService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
        pm_unified_corrective_action_service_1.PmUnifiedCorrectiveActionService,
        adoption_event_service_1.AdoptionEventService])
], JhaFlhaService);
//# sourceMappingURL=jha-flha.service.js.map