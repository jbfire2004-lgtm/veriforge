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
var FieldSyncBatchProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSyncBatchProcessor = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const company_links_service_1 = require("../vera-core/company-links.service");
const projects_service_1 = require("../vera-core/projects.service");
const equipment_links_service_1 = require("../vera-core/equipment-links.service");
const training_records_service_1 = require("../../training-records/training-records.service");
const pm_safety_workflow_service_1 = require("../../pm-safety-workflow/pm-safety-workflow.service");
const submissions_service_1 = require("../../forms/submissions/submissions.service");
const training_wallet_integration_service_1 = require("../vera-core/training-wallet-integration.service");
let FieldSyncBatchProcessor = FieldSyncBatchProcessor_1 = class FieldSyncBatchProcessor {
    constructor(prisma, companyLinks, projects, equipmentLinks, trainingRecords, pmSafety, safetyForms, walletIntegration) {
        this.prisma = prisma;
        this.companyLinks = companyLinks;
        this.projects = projects;
        this.equipmentLinks = equipmentLinks;
        this.trainingRecords = trainingRecords;
        this.pmSafety = pmSafety;
        this.safetyForms = safetyForms;
        this.walletIntegration = walletIntegration;
        this.logger = new common_1.Logger(FieldSyncBatchProcessor_1.name);
    }
    async processOne(action, actorUserId) {
        try {
            switch (action.type) {
                case 'worker.link':
                    return await this.workerLink(action.payload);
                case 'equipment.link':
                    return await this.equipmentLink(action.payload);
                case 'project.assignWorker':
                    return await this.assignWorker(action.payload, actorUserId);
                case 'project.assignEquipment':
                    return await this.assignEquipment(action.payload);
                case 'inspection.submit':
                    return await this.inspectionSubmit(action.payload, actorUserId);
                case 'training.upload':
                    return await this.trainingUpload(action.payload);
                case 'qr.tempRecord':
                    return this.qrTemp(action.payload);
                case 'safetyForm.submit':
                    return await this.safetyFormSubmit(action.payload, actorUserId);
                case 'safetyFormV2.submit':
                    return await this.safetyFormV2Submit(action.payload, actorUserId);
                default:
                    return {
                        type: action.type,
                        ok: false,
                        error: `Unsupported sync action: ${action.type}`,
                    };
            }
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.warn(`Batch action ${action.type} failed: ${msg}`);
            return { type: action.type, ok: false, error: msg };
        }
    }
    async workerLink(p) {
        const workerId = Number(p.workerId);
        const companyId = Number(p.companyId);
        if (!Number.isFinite(workerId) || !Number.isFinite(companyId)) {
            throw new common_1.BadRequestException('workerId and companyId required');
        }
        await this.companyLinks.linkWorker(workerId, companyId, {
            role: p.role,
            trade: p.trade,
        });
        return {
            type: 'worker.link',
            ok: true,
            serverState: { workerActive: true },
            entityId: workerId,
        };
    }
    async equipmentLink(p) {
        const equipmentId = Number(p.equipmentId);
        const companyId = Number(p.companyId);
        if (!Number.isFinite(equipmentId) || !Number.isFinite(companyId)) {
            throw new common_1.BadRequestException('equipmentId and companyId required');
        }
        await this.equipmentLinks.linkEquipment(equipmentId, companyId);
        return {
            type: 'equipment.link',
            ok: true,
            serverState: { lockedOut: false },
            entityId: equipmentId,
        };
    }
    async assignWorker(p, actorUserId) {
        const projectId = Number(p.projectId);
        const workerId = Number(p.workerId);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        await this.projects.assignWorker(projectId, workerId, actorUserId);
        return {
            type: 'project.assignWorker',
            ok: true,
            serverState: { projectStatus: project.status },
            entityId: projectId,
        };
    }
    async assignEquipment(p) {
        const projectId = Number(p.projectId);
        const equipmentId = Number(p.equipmentId);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        await this.projects.assignEquipment(projectId, equipmentId);
        return {
            type: 'project.assignEquipment',
            ok: true,
            serverState: { projectStatus: project.status },
            entityId: projectId,
        };
    }
    async inspectionSubmit(p, actorUserId) {
        var _a;
        const equipmentId = Number(p.equipmentId);
        const row = await this.prisma.inspection.create({
            data: {
                equipmentId,
                workerId: p.workerId != null ? Number(p.workerId) : null,
                supervisorId: actorUserId,
                inspectionType: (_a = p.inspectionType) !== null && _a !== void 0 ? _a : client_1.InspectionType.PRE_USE,
                checklist: p.checklist,
                passed: p.passed === true,
                notes: p.notes,
                correctiveActions: p.correctiveActions,
                photos: p.photoRefs,
                completedAt: new Date(),
                status: 'COMPLETED',
            },
        });
        return {
            type: 'inspection.submit',
            ok: true,
            entityId: row.id,
            serverState: { lockedOut: row.lockoutTriggered },
        };
    }
    async trainingUpload(p) {
        const record = p.record;
        if (!(record === null || record === void 0 ? void 0 : record.workerId) || !(record === null || record === void 0 ? void 0 : record.certificationId)) {
            throw new common_1.BadRequestException('training.upload requires record payload');
        }
        const created = await this.trainingRecords.create(record);
        await this.prisma.trainingValidationResult.create({
            data: {
                subjectType: client_1.TrainingValidationSubject.TRAINING_RECORD,
                outcome: client_1.TrainingValidationOutcome.PENDING,
                trainingRecordId: created.id,
                details: { source: 'field_sync' },
            },
        });
        if (this.walletIntegration) {
            await this.walletIntegration
                .syncAfterTrainingRecord(created.id)
                .catch((e) => this.logger.warn(`Field sync wallet pipeline failed: ${e}`));
        }
        return {
            type: 'training.upload',
            ok: true,
            entityId: created.id,
            serverState: { workerId: created.workerId, trainingRecordId: created.id },
        };
    }
    qrTemp(p) {
        var _a;
        this.logger.log(`QR temp record: ${JSON.stringify(p).slice(0, 200)}`);
        return {
            type: 'qr.tempRecord',
            ok: true,
            entityId: String((_a = p.tempId) !== null && _a !== void 0 ? _a : ''),
        };
    }
    async safetyFormSubmit(p, actorUserId) {
        var _a, _b;
        const kind = String((_a = p.kind) !== null && _a !== void 0 ? _a : 'JHA');
        const dto = {
            title: String((_b = p.title) !== null && _b !== void 0 ? _b : `${kind} (offline)`),
            kind,
            companyId: p.companyId != null ? Number(p.companyId) : undefined,
            siteId: p.siteId != null ? Number(p.siteId) : undefined,
            workDescription: p.workDescription,
            hazardSummary: p.hazardSummary,
            controlMeasures: p.controlMeasures,
            jobLocation: p.jobLocation,
            taskStepsJson: p.taskStepsJson,
        };
        const row = await this.pmSafety.create(dto);
        if (p.submit === true) {
            await this.pmSafety.transition(row.id, 'submit', { userId: actorUserId, role: client_1.UserRole.SUPERVISOR }, 'Submitted from field offline sync');
        }
        return {
            type: 'safetyForm.submit',
            ok: true,
            entityId: row.id,
            serverState: {
                serverUpdatedAt: row.updatedAt.toISOString(),
                status: row.status,
            },
        };
    }
    async safetyFormV2Submit(p, actorUserId) {
        var _a, _b, _c, _d;
        const clientSyncId = String((_b = (_a = p.clientSyncId) !== null && _a !== void 0 ? _a : p.draftId) !== null && _b !== void 0 ? _b : '');
        const definitionId = String((_c = p.definitionId) !== null && _c !== void 0 ? _c : '');
        if (!clientSyncId || !definitionId) {
            throw new common_1.BadRequestException('clientSyncId and definitionId required');
        }
        const row = await this.safetyForms.syncOffline({
            clientSyncId,
            definitionId,
            formData: (_d = p.formData) !== null && _d !== void 0 ? _d : {},
            submit: p.submit === true,
            companyId: p.companyId != null ? Number(p.companyId) : undefined,
            projectId: p.projectId != null ? Number(p.projectId) : undefined,
            siteId: p.siteId != null ? Number(p.siteId) : undefined,
            workerId: p.workerId != null ? Number(p.workerId) : undefined,
            actorId: actorUserId,
            signatures: p.signatures,
        });
        return {
            type: 'safetyFormV2.submit',
            ok: true,
            entityId: row.id,
            serverState: {
                serverUpdatedAt: row.updatedAt.toISOString(),
                status: row.status,
            },
        };
    }
};
exports.FieldSyncBatchProcessor = FieldSyncBatchProcessor;
exports.FieldSyncBatchProcessor = FieldSyncBatchProcessor = FieldSyncBatchProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, common_1.Optional)()),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => training_wallet_integration_service_1.TrainingWalletIntegrationService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        company_links_service_1.CompanyLinksService,
        projects_service_1.ProjectsService,
        equipment_links_service_1.EquipmentLinksService,
        training_records_service_1.TrainingRecordsService,
        pm_safety_workflow_service_1.PmSafetyWorkflowService,
        submissions_service_1.SafetyFormSubmissionsService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService])
], FieldSyncBatchProcessor);
//# sourceMappingURL=field-sync-batch.processor.js.map