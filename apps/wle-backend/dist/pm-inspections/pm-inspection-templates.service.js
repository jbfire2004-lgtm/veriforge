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
exports.PmInspectionTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_checklist_library_constants_1 = require("./pm-inspection-checklist-library.constants");
const pm_inspection_focus_audits_constants_1 = require("./pm-inspection-focus-audits.constants");
const pm_inspection_focus_audits_extra_constants_1 = require("./pm-inspection-focus-audits-extra.constants");
const ALL_FOCUS_AUDIT_TEMPLATES = [
    ...pm_inspection_focus_audits_constants_1.FOCUS_AUDIT_TEMPLATES,
    ...pm_inspection_focus_audits_extra_constants_1.EXPANDED_FOCUS_AUDIT_TEMPLATES,
];
const ALL_SYSTEM_TEMPLATES = [
    ...pm_inspection_checklist_library_constants_1.CHECKLIST_LIBRARY_TEMPLATES,
    pm_inspection_focus_audits_constants_1.SMART_SITE_TEMPLATE,
    ...ALL_FOCUS_AUDIT_TEMPLATES,
];
const pm_inspection_template_validation_1 = require("./pm-inspection-template.validation");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
let PmInspectionTemplatesService = class PmInspectionTemplatesService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async ensureDefaults(companyId, _projectId) {
        var _a, _b;
        let created = 0;
        let updated = 0;
        for (const tpl of ALL_SYSTEM_TEMPLATES) {
            let exists = await this.prisma.pmInspectionTemplate.findFirst({
                where: {
                    companyId,
                    projectId: null,
                    name: tpl.name,
                    deletedAt: null,
                },
            });
            if (!exists) {
                const legacy = await this.prisma.pmInspectionTemplate.findFirst({
                    where: {
                        companyId,
                        name: tpl.name,
                        deletedAt: null,
                        projectId: { not: null },
                    },
                });
                if (legacy) {
                    exists = await this.prisma.pmInspectionTemplate.update({
                        where: { id: legacy.id },
                        data: { projectId: null },
                    });
                }
            }
            if (!exists) {
                await this.prisma.pmInspectionTemplate.create({
                    data: {
                        companyId,
                        projectId: null,
                        name: tpl.name,
                        description: tpl.description,
                        category: tpl.category,
                        scoringMode: tpl.scoringMode,
                        status: 'published',
                        publishedAt: new Date(),
                        items: tpl.items,
                        scoringRules: ((_a = tpl.scoringRules) !== null && _a !== void 0 ? _a : {}),
                        equipmentTypeKeys: ((_b = tpl.equipmentTypeKeys) !== null && _b !== void 0 ? _b : []),
                    },
                });
                created += 1;
                continue;
            }
            const existingRules = exists.scoringRules && typeof exists.scoringRules === 'object'
                ? exists.scoringRules
                : {};
            const needsRules = tpl.scoringRules &&
                (!existingRules.inspectionKind ||
                    JSON.stringify(existingRules) !== JSON.stringify(tpl.scoringRules));
            if (needsRules || (!exists.description && tpl.description)) {
                await this.prisma.pmInspectionTemplate.update({
                    where: { id: exists.id },
                    data: Object.assign(Object.assign({}, (needsRules
                        ? { scoringRules: tpl.scoringRules }
                        : {})), (tpl.description && !exists.description
                        ? { description: tpl.description }
                        : {})),
                });
                updated += 1;
            }
        }
        return {
            created,
            updated,
            total: ALL_SYSTEM_TEMPLATES.length,
            checklistCount: pm_inspection_checklist_library_constants_1.CHECKLIST_LIBRARY_TEMPLATES.length,
            focusAuditCount: ALL_FOCUS_AUDIT_TEMPLATES.length,
        };
    }
    list(filters) {
        return this.prisma.pmInspectionTemplate.findMany({
            where: Object.assign(Object.assign(Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId != null
                ? { OR: [{ projectId: null }, { projectId: filters.projectId }] }
                : {})), (filters.category ? { category: filters.category } : {})), (filters.status ? { status: filters.status } : {})),
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    async get(id) {
        const row = await this.prisma.pmInspectionTemplate.findFirst({
            where: { id, deletedAt: null },
        });
        if (!row)
            throw new common_1.NotFoundException('Template not found');
        return row;
    }
    prepareTemplatePayload(data) {
        const items = (0, pm_inspection_template_validation_1.normalizeChecklistItems)(data.items);
        (0, pm_inspection_template_validation_1.validateChecklistItems)(items);
        const scoringRules = (0, pm_inspection_template_validation_1.validateScoringRules)(data.scoringRules);
        const requiredSignatures = (0, pm_inspection_template_validation_1.validateRequiredSignatures)(data.requiredSignatures);
        return { items, scoringRules, requiredSignatures };
    }
    async create(data) {
        var _a, _b, _c;
        const prepared = this.prepareTemplatePayload(data);
        const row = await this.prisma.pmInspectionTemplate.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                name: data.name.trim(),
                category: data.category,
                description: data.description,
                scoringMode: ((_a = data.scoringMode) !== null && _a !== void 0 ? _a : 'pass_fail'),
                items: prepared.items,
                scoringRules: prepared.scoringRules,
                requiredAttachments: ((_b = data.requiredAttachments) !== null && _b !== void 0 ? _b : []),
                requiredSignatures: prepared.requiredSignatures,
                equipmentTypeKeys: ((_c = data.equipmentTypeKeys) !== null && _c !== void 0 ? _c : []),
                clientSyncId: data.clientSyncId,
                status: 'draft',
            },
        });
        await this.auditLog.logAudit(null, audit_actions_1.AuditAction.TEMPLATE_CREATED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION_TEMPLATE,
            id: row.id,
            tenantId: data.companyId,
        }, { name: row.name, category: row.category });
        return row;
    }
    async update(id, data) {
        var _a, _b, _c, _d;
        const tpl = await this.get(id);
        if (tpl.status === 'published') {
            throw new common_1.BadRequestException('Published templates are immutable; create a new version');
        }
        let items = tpl.items;
        let scoringRules = tpl.scoringRules;
        let requiredSignatures = tpl.requiredSignatures;
        if (data.items) {
            const prepared = this.prepareTemplatePayload({
                items: data.items,
                scoringRules: (_a = data.scoringRules) !== null && _a !== void 0 ? _a : scoringRules,
                requiredSignatures: (_b = data.requiredSignatures) !== null && _b !== void 0 ? _b : requiredSignatures,
            });
            items = prepared.items;
            scoringRules = prepared.scoringRules;
            requiredSignatures =
                prepared.requiredSignatures;
        }
        else if (data.scoringRules || data.requiredSignatures) {
            const prepared = this.prepareTemplatePayload({
                items,
                scoringRules: (_c = data.scoringRules) !== null && _c !== void 0 ? _c : scoringRules,
                requiredSignatures: (_d = data.requiredSignatures) !== null && _d !== void 0 ? _d : requiredSignatures,
            });
            scoringRules = prepared.scoringRules;
            requiredSignatures =
                prepared.requiredSignatures;
        }
        const updated = await this.prisma.pmInspectionTemplate.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name ? { name: data.name.trim() } : {})), (data.description !== undefined
                ? { description: data.description }
                : {})), (data.scoringMode ? { scoringMode: data.scoringMode } : {})), (data.items || data.scoringRules || data.requiredSignatures
                ? {
                    items: items,
                    scoringRules: scoringRules,
                    requiredSignatures: requiredSignatures,
                }
                : {})), (data.requiredAttachments
                ? {
                    requiredAttachments: data.requiredAttachments,
                }
                : {})),
        });
        await this.auditLog.logAudit(null, audit_actions_1.AuditAction.TEMPLATE_UPDATED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION_TEMPLATE,
            id,
            tenantId: tpl.companyId,
        }, { fields: Object.keys(data) });
        return updated;
    }
    async publish(id, userId) {
        const tpl = await this.get(id);
        const items = tpl.items;
        this.prepareTemplatePayload({
            items,
            scoringRules: tpl.scoringRules,
            requiredSignatures: tpl.requiredSignatures,
        });
        const published = await this.prisma.pmInspectionTemplate.update({
            where: { id },
            data: {
                status: 'published',
                publishedAt: new Date(),
                publishedByUserId: userId,
            },
        });
        await this.auditLog.logAudit({ id: userId, companyId: tpl.companyId }, audit_actions_1.AuditAction.TEMPLATE_PUBLISHED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION_TEMPLATE,
            id,
            tenantId: tpl.companyId,
        }, { version: tpl.version });
        return published;
    }
    async newVersion(id) {
        const parent = await this.get(id);
        return this.prisma.pmInspectionTemplate.create({
            data: {
                companyId: parent.companyId,
                projectId: parent.projectId,
                name: parent.name,
                category: parent.category,
                description: parent.description,
                version: parent.version + 1,
                scoringMode: parent.scoringMode,
                items: parent.items,
                scoringRules: parent.scoringRules,
                requiredAttachments: parent.requiredAttachments,
                requiredSignatures: parent.requiredSignatures,
                equipmentTypeKeys: parent.equipmentTypeKeys,
                parentTemplateId: parent.id,
                status: 'draft',
            },
        });
    }
    async archive(id) {
        const tpl = await this.get(id);
        if (tpl.status === 'archived') {
            throw new common_1.BadRequestException('Template is already archived');
        }
        const archived = await this.prisma.pmInspectionTemplate.update({
            where: { id },
            data: { status: 'archived', deletedAt: new Date() },
        });
        await this.auditLog.logAudit(null, audit_actions_1.AuditAction.TEMPLATE_ARCHIVED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION_TEMPLATE,
            id,
            tenantId: tpl.companyId,
        }, {});
        return archived;
    }
};
exports.PmInspectionTemplatesService = PmInspectionTemplatesService;
exports.PmInspectionTemplatesService = PmInspectionTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], PmInspectionTemplatesService);
//# sourceMappingURL=pm-inspection-templates.service.js.map