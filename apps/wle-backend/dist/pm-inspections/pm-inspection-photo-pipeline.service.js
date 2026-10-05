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
var PmInspectionPhotoPipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmInspectionPhotoPipelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const vision_service_1 = require("../modules/vision/vision.service");
const llm_safety_service_1 = require("../safety-intelligence/ai/llm-safety.service");
const pm_inspection_finding_capa_service_1 = require("./pm-inspection-finding-capa.service");
const pm_inspection_contractor_dispatch_service_1 = require("./pm-inspection-contractor-dispatch.service");
const pm_inspection_subcontractor_resolver_service_1 = require("./pm-inspection-subcontractor-resolver.service");
const sms_inspection_integration_service_1 = require("../pm-sms-core/sms-inspection-integration.service");
const pm_inspection_completed_event_types_1 = require("./pm-inspection-completed-event.types");
const ttl_cache_1 = require("../common/ttl-cache");
const prisma_errors_1 = require("../common/prisma-errors");
let PmInspectionPhotoPipelineService = PmInspectionPhotoPipelineService_1 = class PmInspectionPhotoPipelineService {
    constructor(prisma, vision, findingCapa, subcontractorResolver, llm, contractorDispatch, smsInspection) {
        var _a;
        this.prisma = prisma;
        this.vision = vision;
        this.findingCapa = findingCapa;
        this.subcontractorResolver = subcontractorResolver;
        this.llm = llm;
        this.contractorDispatch = contractorDispatch;
        this.smsInspection = smsInspection;
        this.logger = new common_1.Logger(PmInspectionPhotoPipelineService_1.name);
        this.analysisPool = new ttl_cache_1.ConcurrencyPool(Math.max(1, Number((_a = process.env.VERA_PHOTO_ANALYSIS_CONCURRENCY) !== null && _a !== void 0 ? _a : 3)));
    }
    preferAsync(input) {
        if (input.waitForAnalysis === true)
            return false;
        if (input.waitForAnalysis === false)
            return true;
        return process.env.VERA_PHOTO_ANALYSIS_ASYNC !== 'false';
    }
    async captureAndAnalyze(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (input.clientSyncId) {
            const existing = await this.prisma.pmInspectionAttachment.findUnique({
                where: { clientSyncId: input.clientSyncId },
                include: { photoFindings: true },
            });
            if (existing) {
                if (existing.inspectionId !== input.inspectionId) {
                    throw new common_1.ConflictException('clientSyncId already used on another inspection');
                }
                return {
                    attachment: existing,
                    findings: existing.photoFindings,
                    correctiveActions: [],
                    dispatches: [],
                    visionSummary: null,
                    llmSummary: null,
                    analysisEngine: 'idempotent_replay',
                    analysisMode: (_a = existing.analysisStatus) !== null && _a !== void 0 ? _a : 'complete',
                    analysisStatus: (_b = existing.analysisStatus) !== null && _b !== void 0 ? _b : 'complete',
                    visionCapabilities: this.vision.getCapabilities(!!((_c = input.caption) === null || _c === void 0 ? void 0 : _c.trim())),
                };
            }
        }
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: input.inspectionId },
            include: {
                project: { select: { name: true } },
            },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        const photoNumber = await this.nextPhotoNumber(inspection.id);
        const annotation = this.buildAnnotationJson(input, photoNumber);
        let attachment;
        try {
            attachment = await this.prisma.pmInspectionAttachment.create({
                data: {
                    inspectionId: inspection.id,
                    dataUrl: input.dataUrl,
                    coreFileId: input.coreFileId,
                    fileName: (_d = input.fileName) !== null && _d !== void 0 ? _d : 'inspection-photo.jpg',
                    mimeType: (_e = input.mimeType) !== null && _e !== void 0 ? _e : 'image/jpeg',
                    clientSyncId: input.clientSyncId,
                    analysisStatus: 'processing',
                    annotationJson: annotation,
                },
            });
        }
        catch (err) {
            attachment = await (0, prisma_errors_1.replayOrConflict)(err, async () => {
                if (!input.clientSyncId)
                    return null;
                return this.prisma.pmInspectionAttachment.findUnique({
                    where: { clientSyncId: input.clientSyncId },
                    include: { photoFindings: true },
                });
            });
            const findings = 'photoFindings' in attachment && Array.isArray(attachment.photoFindings)
                ? attachment.photoFindings
                : [];
            return {
                attachment,
                findings,
                correctiveActions: [],
                dispatches: [],
                visionSummary: null,
                llmSummary: null,
                analysisEngine: 'idempotent_replay',
                analysisMode: (_f = attachment.analysisStatus) !== null && _f !== void 0 ? _f : 'complete',
                analysisStatus: (_g = attachment.analysisStatus) !== null && _g !== void 0 ? _g : 'complete',
                visionCapabilities: this.vision.getCapabilities(!!((_h = input.caption) === null || _h === void 0 ? void 0 : _h.trim())),
            };
        }
        if (this.preferAsync(input)) {
            void this.analysisPool
                .run(() => this.completeAnalysis(attachment.id, input, inspection))
                .catch((err) => this.logger.warn(`Background photo analysis failed: ${err}`));
            return {
                attachment,
                findings: [],
                correctiveActions: [],
                dispatches: [],
                visionSummary: null,
                llmSummary: null,
                analysisEngine: 'queued',
                analysisMode: 'queued',
                analysisStatus: 'processing',
                visionCapabilities: this.vision.getCapabilities(!!((_j = input.caption) === null || _j === void 0 ? void 0 : _j.trim())),
            };
        }
        return this.completeAnalysis(attachment.id, input, inspection);
    }
    async completeAnalysis(attachmentId, input, inspection) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const imagePayload = parseDataUrl(input.dataUrl);
        let visionResult = null;
        let llmAnalysis = null;
        try {
            const [vision, llm] = await Promise.all([
                this.vision
                    .analyzeInspection({
                    ocrText: (_a = input.caption) !== null && _a !== void 0 ? _a : 'construction safety inspection photo',
                    companyId: inspection.companyId,
                    projectId: inspection.projectId,
                    offline: input.offline,
                    imageHints: {
                        hazards: input.caption ? [input.caption] : undefined,
                    },
                })
                    .catch((err) => {
                    this.logger.warn(`Vision analysis failed: ${err}`);
                    return null;
                }),
                ((_b = this.llm) === null || _b === void 0 ? void 0 : _b.isConfigured())
                    ? this.llm.analyzeInspectionPhotoFindings({
                        caption: input.caption,
                        ocrText: input.caption,
                        imageBase64: imagePayload === null || imagePayload === void 0 ? void 0 : imagePayload.base64,
                        imageMimeType: (_c = imagePayload === null || imagePayload === void 0 ? void 0 : imagePayload.mimeType) !== null && _c !== void 0 ? _c : input.mimeType,
                        companyId: inspection.companyId,
                        projectId: inspection.projectId,
                    })
                    : Promise.resolve(null),
            ]);
            visionResult = vision;
            llmAnalysis = llm;
            if (((_d = this.llm) === null || _d === void 0 ? void 0 : _d.isConfigured()) &&
                visionResult &&
                !((_e = llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.findings) === null || _e === void 0 ? void 0 : _e.length)) {
                llmAnalysis = await this.llm.analyzeInspectionPhotoFindings({
                    caption: input.caption,
                    ocrText: (_f = visionResult.ocr) === null || _f === void 0 ? void 0 : _f.fullText,
                    visionSummary: (_h = (_g = visionResult.summary) === null || _g === void 0 ? void 0 : _g.bullets) === null || _h === void 0 ? void 0 : _h.join('. '),
                    visionHazards: (_j = visionResult.visual) === null || _j === void 0 ? void 0 : _j.hazards,
                    imageBase64: imagePayload === null || imagePayload === void 0 ? void 0 : imagePayload.base64,
                    imageMimeType: (_k = imagePayload === null || imagePayload === void 0 ? void 0 : imagePayload.mimeType) !== null && _k !== void 0 ? _k : input.mimeType,
                    companyId: inspection.companyId,
                    projectId: inspection.projectId,
                });
            }
            await this.prisma.pmInspectionAttachment.update({
                where: { id: attachmentId },
                data: Object.assign({ analysisStatus: 'complete', analysisJson: {
                        vision: visionResult,
                        llm: llmAnalysis,
                    } }, (input.coreFileId ? { dataUrl: null } : {})),
            });
        }
        catch (err) {
            this.logger.warn(`Photo analysis failed: ${err}`);
            await this.prisma.pmInspectionAttachment.update({
                where: { id: attachmentId },
                data: { analysisStatus: 'failed' },
            });
        }
        const ruleFindings = this.extractFindingsFromRules(visionResult, input.caption);
        const llmFindings = this.extractFindingsFromLlm(llmAnalysis);
        const structured = this.mergeFindings(ruleFindings, llmFindings);
        const findings = [];
        const correctiveActions = [];
        const dispatches = [];
        for (const s of structured) {
            if (s.responsibleParty === 'contractor') {
                s.subcontractorCompanyId =
                    await this.subcontractorResolver.resolveForFinding(inspection.projectId, s.category, input.defaultSubcontractorCompanyId);
            }
            const findingRow = await this.prisma.pmInspectionPhotoFinding.create({
                data: {
                    inspectionId: inspection.id,
                    attachmentId,
                    category: s.category,
                    title: s.title,
                    description: s.description,
                    severity: s.severity,
                    confidence: s.confidence,
                    responsibleParty: s.responsibleParty,
                    evidenceRequired: EVIDENCE_FOR(s.category),
                    analysisJson: {
                        source: s.source,
                        llm: llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.hazardSummary,
                    },
                    clientSyncId: input.clientSyncId
                        ? `${input.clientSyncId}-${s.category}-${s.title.slice(0, 12)}`
                        : undefined,
                },
            });
            const capaResult = await this.findingCapa.generateFromFinding({
                inspectionId: inspection.id,
                findingId: findingRow.id,
                actorId: input.actorId,
                structured: s,
                attachmentId,
            });
            if (this.smsInspection) {
                const analysisText = [
                    s.title,
                    s.description,
                    llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.hazardSummary,
                    (_m = (_l = visionResult === null || visionResult === void 0 ? void 0 : visionResult.summary) === null || _l === void 0 ? void 0 : _l.bullets) === null || _m === void 0 ? void 0 : _m.join(' '),
                ]
                    .filter(Boolean)
                    .join(' ');
                await this.smsInspection.autoTagFromAnalysis(findingRow.id, inspection.companyId, inspection.projectId, s.severity, analysisText);
            }
            findings.push(findingRow);
            if (capaResult === null || capaResult === void 0 ? void 0 : capaResult.correctiveAction) {
                correctiveActions.push(capaResult.correctiveAction);
                if (s.responsibleParty === 'contractor' &&
                    s.subcontractorCompanyId &&
                    this.contractorDispatch) {
                    const dispatch = await this.contractorDispatch.dispatchForCorrectiveAction(capaResult.correctiveAction.id, input.actorId, input.clientSyncId);
                    dispatches.push(dispatch);
                }
            }
        }
        await this.prisma.pmInspectionAuditLog.create({
            data: {
                inspectionId: inspection.id,
                eventType: pm_inspection_completed_event_types_1.INSPECTION_PHOTO_CAPTURED_AUDIT_EVENT,
                actorId: input.actorId,
                payload: {
                    attachmentId,
                    findingCount: findings.length,
                    llmFindingCount: llmFindings.length,
                    ruleFindingCount: ruleFindings.length,
                },
            },
        });
        const analysisMode = ((_o = llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.findings) === null || _o === void 0 ? void 0 : _o.length)
            ? 'full'
            : visionResult
                ? 'vision_rules'
                : 'caption_fallback';
        const attachment = await this.prisma.pmInspectionAttachment.findUniqueOrThrow({
            where: { id: attachmentId },
        });
        return {
            attachment,
            findings,
            correctiveActions,
            dispatches,
            visionSummary: (_p = visionResult === null || visionResult === void 0 ? void 0 : visionResult.summary) !== null && _p !== void 0 ? _p : null,
            llmSummary: (_q = llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.hazardSummary) !== null && _q !== void 0 ? _q : null,
            analysisEngine: ((_r = llmAnalysis === null || llmAnalysis === void 0 ? void 0 : llmAnalysis.findings) === null || _r === void 0 ? void 0 : _r.length)
                ? 'vision+llm'
                : 'vision+rules',
            analysisMode,
            analysisStatus: attachment.analysisStatus,
            visionCapabilities: this.vision.getCapabilities(!!((_s = input.caption) === null || _s === void 0 ? void 0 : _s.trim())),
        };
    }
    async savePhotoMetadata(input) {
        var _a, _b, _c;
        const attachment = await this.prisma.pmInspectionAttachment.findFirst({
            where: { id: input.attachmentId, inspectionId: input.inspectionId },
        });
        if (!attachment)
            throw new common_1.BadRequestException('Attachment not found');
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: input.inspectionId },
        });
        if (!inspection)
            throw new common_1.BadRequestException('Inspection not found');
        const existing = ((_a = attachment.annotationJson) !== null && _a !== void 0 ? _a : {});
        const photoNumber = typeof existing.photoNumber === 'number'
            ? existing.photoNumber
            : await this.nextPhotoNumber(input.inspectionId);
        let responsibleCompanyName = null;
        if (input.responsibleCompanyId) {
            const company = await this.prisma.company.findUnique({
                where: { id: input.responsibleCompanyId },
                select: { name: true },
            });
            responsibleCompanyName = (_b = company === null || company === void 0 ? void 0 : company.name) !== null && _b !== void 0 ? _b : null;
        }
        const annotationJson = Object.assign(Object.assign({}, existing), { photoNumber, locationDescription: input.locationDescription.trim(), pictureDescription: input.pictureDescription.trim(), safetyStatus: input.safetyStatus, responsibleCompanyId: (_c = input.responsibleCompanyId) !== null && _c !== void 0 ? _c : null, responsibleCompanyName });
        await this.prisma.pmInspectionAttachment.update({
            where: { id: attachment.id },
            data: { annotationJson: annotationJson },
        });
        if (input.safetyStatus === 'at_risk') {
            await this.ensureFindingForAtRiskPhoto({
                inspectionId: input.inspectionId,
                attachmentId: attachment.id,
                actorId: input.actorId,
                title: input.pictureDescription.trim() || 'At-risk condition documented',
                description: [
                    input.locationDescription.trim(),
                    input.pictureDescription.trim(),
                ]
                    .filter(Boolean)
                    .join(' — '),
                responsibleCompanyId: input.responsibleCompanyId,
                defaultSubcontractorCompanyId: input.responsibleCompanyId,
            });
        }
        return { attachmentId: attachment.id, photoNumber, annotationJson };
    }
    async assertReadyForPhotoFirstSubmit(inspectionId) {
        var _a, _b;
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: inspectionId },
            include: {
                template: true,
                attachments: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!inspection)
            throw new common_1.BadRequestException('Inspection not found');
        const imageAttachments = inspection.attachments.filter((a) => { var _a; return a.dataUrl || ((_a = a.mimeType) === null || _a === void 0 ? void 0 : _a.startsWith('image/')); });
        if (!imageAttachments.length) {
            throw new common_1.BadRequestException('Add at least one field photo before generating the report.');
        }
        const companies = await this.subcontractorResolver.listWithNames(inspection.projectId);
        for (const att of imageAttachments) {
            const ann = att.annotationJson;
            if (!(ann === null || ann === void 0 ? void 0 : ann.safetyStatus)) {
                const num = (_a = ann === null || ann === void 0 ? void 0 : ann.photoNumber) !== null && _a !== void 0 ? _a : '?';
                throw new common_1.BadRequestException(`Photo #${num} needs a safety status (Safe or At risk) before submit.`);
            }
            if (ann.safetyStatus === 'at_risk' &&
                companies.length > 0 &&
                !ann.responsibleCompanyId) {
                const num = (_b = ann.photoNumber) !== null && _b !== void 0 ? _b : '?';
                throw new common_1.BadRequestException(`Photo #${num} is at risk — select the responsible company before submit.`);
            }
        }
    }
    async ensureAtRiskAssignmentsOnSubmit(inspectionId, actorId) {
        var _a;
        const attachments = await this.prisma.pmInspectionAttachment.findMany({
            where: { inspectionId },
            orderBy: { createdAt: 'asc' },
        });
        for (const att of attachments) {
            const ann = att.annotationJson;
            if ((ann === null || ann === void 0 ? void 0 : ann.safetyStatus) !== 'at_risk')
                continue;
            await this.ensureFindingForAtRiskPhoto({
                inspectionId,
                attachmentId: att.id,
                actorId,
                title: ((_a = ann.pictureDescription) === null || _a === void 0 ? void 0 : _a.trim()) || 'At-risk condition documented',
                description: [ann.locationDescription, ann.pictureDescription]
                    .filter(Boolean)
                    .join(' — '),
                responsibleCompanyId: ann.responsibleCompanyId,
                defaultSubcontractorCompanyId: ann.responsibleCompanyId,
            });
        }
    }
    async ensureFindingForAtRiskPhoto(input) {
        const existing = await this.prisma.pmInspectionPhotoFinding.findFirst({
            where: {
                inspectionId: input.inspectionId,
                attachmentId: input.attachmentId,
            },
            include: { correctiveAction: true },
        });
        if ((existing === null || existing === void 0 ? void 0 : existing.correctiveActionId) && this.contractorDispatch) {
            const dispatch = await this.prisma.pmInspectionContractorDispatch.findFirst({
                where: { correctiveActionId: existing.correctiveActionId },
            });
            if (dispatch)
                return existing;
        }
        const inspection = await this.prisma.pmInspection.findUnique({
            where: { id: input.inspectionId },
        });
        if (!inspection)
            return null;
        let subcontractorCompanyId = input.responsibleCompanyId;
        if (!subcontractorCompanyId) {
            subcontractorCompanyId =
                await this.subcontractorResolver.resolveForFinding(inspection.projectId, 'unsafe_condition', input.defaultSubcontractorCompanyId);
        }
        const structured = {
            category: 'unsafe_condition',
            title: input.title,
            description: input.description,
            severity: 'high',
            confidence: 0.9,
            responsibleParty: subcontractorCompanyId ? 'contractor' : 'supervisor',
            subcontractorCompanyId,
            source: 'rules',
        };
        if (existing) {
            await this.prisma.pmInspectionPhotoFinding.update({
                where: { id: existing.id },
                data: {
                    title: structured.title,
                    description: structured.description,
                    responsibleParty: structured.responsibleParty,
                },
            });
            if (existing.correctiveActionId &&
                structured.responsibleParty === 'contractor' &&
                subcontractorCompanyId &&
                this.contractorDispatch) {
                const hasDispatch = await this.prisma.pmInspectionContractorDispatch.findFirst({
                    where: { correctiveActionId: existing.correctiveActionId },
                });
                if (!hasDispatch) {
                    await this.contractorDispatch.dispatchForCorrectiveAction(existing.correctiveActionId, input.actorId);
                }
            }
            return existing;
        }
        const findingRow = await this.prisma.pmInspectionPhotoFinding.create({
            data: {
                inspectionId: input.inspectionId,
                attachmentId: input.attachmentId,
                category: structured.category,
                title: structured.title,
                description: structured.description,
                severity: structured.severity,
                confidence: structured.confidence,
                responsibleParty: structured.responsibleParty,
                evidenceRequired: EVIDENCE_FOR(structured.category),
                analysisJson: { source: 'manual_at_risk' },
            },
        });
        const capaResult = await this.findingCapa.generateFromFinding({
            inspectionId: input.inspectionId,
            findingId: findingRow.id,
            actorId: input.actorId,
            structured,
            attachmentId: input.attachmentId,
        });
        if (structured.responsibleParty === 'contractor' &&
            subcontractorCompanyId &&
            (capaResult === null || capaResult === void 0 ? void 0 : capaResult.correctiveAction) &&
            this.contractorDispatch) {
            await this.contractorDispatch.dispatchForCorrectiveAction(capaResult.correctiveAction.id, input.actorId);
        }
        return findingRow;
    }
    async nextPhotoNumber(inspectionId) {
        var _a;
        const attachments = await this.prisma.pmInspectionAttachment.findMany({
            where: { inspectionId },
            select: { annotationJson: true },
        });
        let max = 0;
        for (const att of attachments) {
            const n = (_a = att.annotationJson) === null || _a === void 0 ? void 0 : _a.photoNumber;
            if (typeof n === 'number' && n > max)
                max = n;
        }
        return max + 1;
    }
    buildAnnotationJson(input, photoNumber) {
        const base = {};
        if (input.checklistItemId)
            base.checklistItemId = input.checklistItemId;
        base.photoNumber = photoNumber;
        if (input.locationDescription)
            base.locationDescription = input.locationDescription;
        if (input.pictureDescription)
            base.pictureDescription = input.pictureDescription;
        if (input.safetyStatus)
            base.safetyStatus = input.safetyStatus;
        if (input.responsibleCompanyId)
            base.responsibleCompanyId = input.responsibleCompanyId;
        return Object.keys(base).length ? base : { photoNumber };
    }
    extractFindingsFromRules(vision, caption) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const results = [];
        const text = [
            caption,
            (_a = vision === null || vision === void 0 ? void 0 : vision.ocr) === null || _a === void 0 ? void 0 : _a.fullText,
            ...((_c = (_b = vision === null || vision === void 0 ? void 0 : vision.visual) === null || _b === void 0 ? void 0 : _b.hazards) !== null && _c !== void 0 ? _c : []),
            ...((_e = (_d = vision === null || vision === void 0 ? void 0 : vision.classification) === null || _d === void 0 ? void 0 : _d.tags) !== null && _e !== void 0 ? _e : []),
        ]
            .filter(Boolean)
            .join('\n')
            .toLowerCase();
        const rules = [
            {
                test: /no hard hat|missing ppe|without harness|no safety glasses|ppe/i,
                category: 'missing_ppe',
                title: 'Missing or inadequate PPE',
                severity: 'high',
                party: 'worker',
            },
            {
                test: /crack|damage|broken|defect|leak|guard missing|equipment/i,
                category: 'equipment_defect',
                title: 'Equipment defect observed',
                severity: 'high',
                party: 'contractor',
            },
            {
                test: /clutter|housekeeping|trip hazard|slip|debris/i,
                category: 'housekeeping',
                title: 'Housekeeping deficiency',
                severity: 'medium',
                party: 'contractor',
            },
            {
                test: /unsafe|hazard|violation|fall risk|electrical|excavat/i,
                category: 'unsafe_condition',
                title: 'Unsafe condition identified',
                severity: (vision === null || vision === void 0 ? void 0 : vision.reviewRequired) ? 'critical' : 'high',
                party: 'supervisor',
            },
            {
                test: /spill|chemical|environment|dust|noise/i,
                category: 'environmental',
                title: 'Environmental concern',
                severity: 'medium',
                party: 'company',
            },
        ];
        for (const rule of rules) {
            if (rule.test.test(text)) {
                results.push({
                    category: rule.category,
                    title: rule.title,
                    description: (_h = (_g = (_f = vision === null || vision === void 0 ? void 0 : vision.summary) === null || _f === void 0 ? void 0 : _f.bullets) === null || _g === void 0 ? void 0 : _g[0]) !== null && _h !== void 0 ? _h : caption,
                    severity: rule.severity,
                    confidence: (_k = (_j = vision === null || vision === void 0 ? void 0 : vision.classification) === null || _j === void 0 ? void 0 : _j.confidence) !== null && _k !== void 0 ? _k : 0.72,
                    responsibleParty: rule.party,
                    source: 'rules',
                });
            }
        }
        if (!results.length &&
            ((vision === null || vision === void 0 ? void 0 : vision.reviewRequired) || ((_m = (_l = vision === null || vision === void 0 ? void 0 : vision.visual) === null || _l === void 0 ? void 0 : _l.hazards) === null || _m === void 0 ? void 0 : _m.length))) {
            results.push({
                category: 'other',
                title: (_q = (_p = (_o = vision === null || vision === void 0 ? void 0 : vision.summary) === null || _o === void 0 ? void 0 : _o.bullets) === null || _p === void 0 ? void 0 : _p[0]) !== null && _q !== void 0 ? _q : 'Condition requires review',
                description: caption,
                severity: 'medium',
                confidence: 0.55,
                responsibleParty: 'supervisor',
                source: 'rules',
            });
        }
        return results;
    }
    extractFindingsFromLlm(analysis) {
        var _a;
        if (!((_a = analysis === null || analysis === void 0 ? void 0 : analysis.findings) === null || _a === void 0 ? void 0 : _a.length))
            return [];
        return analysis.findings.map((f) => {
            var _a, _b;
            return ({
                category: f.category,
                title: f.title,
                description: (_a = f.description) !== null && _a !== void 0 ? _a : analysis.hazardSummary,
                severity: mapLlmSeverity(f.severity),
                confidence: (_b = f.confidence) !== null && _b !== void 0 ? _b : 0.85,
                responsibleParty: f.responsibleParty,
                source: 'llm',
            });
        });
    }
    mergeFindings(rules, llm) {
        const merged = [...llm];
        for (const r of rules) {
            const dup = merged.some((m) => m.category === r.category && similarity(m.title, r.title) > 0.6);
            if (!dup)
                merged.push(r);
        }
        return merged;
    }
};
exports.PmInspectionPhotoPipelineService = PmInspectionPhotoPipelineService;
exports.PmInspectionPhotoPipelineService = PmInspectionPhotoPipelineService = PmInspectionPhotoPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vision_service_1.VisionService,
        pm_inspection_finding_capa_service_1.PmInspectionFindingCapaService,
        pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService,
        llm_safety_service_1.LlmSafetyService,
        pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService,
        sms_inspection_integration_service_1.SmsInspectionIntegrationService])
], PmInspectionPhotoPipelineService);
function mapLlmSeverity(s) {
    if (s === 'critical')
        return 'critical';
    if (s === 'high')
        return 'high';
    if (s === 'low')
        return 'low';
    return 'medium';
}
function similarity(a, b) {
    const ta = new Set(a.toLowerCase().split(/\s+/));
    const tb = new Set(b.toLowerCase().split(/\s+/));
    let inter = 0;
    for (const w of ta)
        if (tb.has(w))
            inter++;
    return inter / Math.max(ta.size, tb.size, 1);
}
function parseDataUrl(dataUrl) {
    if (!(dataUrl === null || dataUrl === void 0 ? void 0 : dataUrl.startsWith('data:')))
        return null;
    const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
    if (!match)
        return null;
    return { mimeType: match[1], base64: match[2] };
}
function EVIDENCE_FOR(category) {
    const map = {
        unsafe_condition: ['photo_after', 'supervisor_signoff'],
        missing_ppe: ['photo_compliance'],
        equipment_defect: ['photo_repair'],
        housekeeping: ['photo_cleared'],
        environmental: ['photo_mitigation'],
        other: ['photo_evidence'],
    };
    return map[category];
}
//# sourceMappingURL=pm-inspection-photo-pipeline.service.js.map