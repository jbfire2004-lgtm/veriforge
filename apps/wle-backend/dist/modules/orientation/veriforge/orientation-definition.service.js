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
exports.OrientationDefinitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const audit_log_service_1 = require("../../../audit/audit-log.service");
const audit_actions_1 = require("../../../audit/audit-actions");
const orientation_validation_1 = require("./orientation-validation");
let OrientationDefinitionService = class OrientationDefinitionService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!((_a = input.title) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException('title is required');
        }
        const blocks = (0, orientation_validation_1.normalizeAndValidateBlocks)((_b = input.contentBlocks) !== null && _b !== void 0 ? _b : []);
        const row = await this.prisma.orientationDefinition.create({
            data: {
                companyId: input.companyId,
                title: input.title.trim(),
                type: input.type,
                contentMode: (_c = input.contentMode) !== null && _c !== void 0 ? _c : 'native',
                contentBlocks: blocks,
                createdByUserId: input.createdByUserId,
                createdByType: (_d = input.createdByType) !== null && _d !== void 0 ? _d : 'company',
                version: (_e = input.version) !== null && _e !== void 0 ? _e : '1.0',
                isPublished: (_f = input.isPublished) !== null && _f !== void 0 ? _f : false,
                expiryRules: ((_g = input.expiryRules) !== null && _g !== void 0 ? _g : {}),
                metadata: ((_h = input.metadata) !== null && _h !== void 0 ? _h : {}),
                sourceFileKey: input.sourceFileKey,
                sourceCoreFileId: input.sourceCoreFileId,
            },
        });
        await this.auditLog.logAudit({ id: input.createdByUserId, companyId: input.companyId }, audit_actions_1.AuditAction.ORIENTATION_DEFINITION_CREATED, {
            type: audit_actions_1.AuditEntityType.ORIENTATION_DEFINITION,
            id: row.id,
            tenantId: input.companyId,
        }, { type: row.type, contentMode: row.contentMode });
        return row;
    }
    async createFromUpload(input) {
        var _a, _b;
        return this.create({
            companyId: input.companyId,
            title: input.title,
            type: input.type,
            contentMode: 'uploaded',
            contentBlocks: (_a = input.contentBlocks) !== null && _a !== void 0 ? _a : [
                {
                    id: 'upload-1',
                    type: 'slide',
                    title: input.title,
                    body: 'Uploaded orientation material. Review and acknowledge.',
                    order: 0,
                },
            ],
            createdByUserId: input.createdByUserId,
            createdByType: 'company',
            sourceFileKey: input.sourceFileKey,
            sourceCoreFileId: input.sourceCoreFileId,
            metadata: Object.assign(Object.assign({}, ((_b = input.metadata) !== null && _b !== void 0 ? _b : {})), { sourceFileId: input.sourceFileKey }),
        });
    }
    async get(id, opts) {
        const row = await this.prisma.orientationDefinition.findUnique({
            where: { id },
            include: {
                requirements: { where: { isActive: true }, take: 50 },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Orientation definition not found');
        if ((opts === null || opts === void 0 ? void 0 : opts.companyId) != null && row.companyId !== opts.companyId) {
            throw new common_1.ForbiddenException('Cross-tenant orientation access denied');
        }
        return row;
    }
    async list(filters) {
        const where = Object.assign(Object.assign(Object.assign({ companyId: filters.companyId }, (filters.type ? { type: filters.type } : {})), (filters.isPublished != null
            ? { isPublished: filters.isPublished }
            : {})), (filters.projectId
            ? {
                OR: [
                    { type: 'company' },
                    {
                        requirements: {
                            some: {
                                projectId: filters.projectId,
                                isActive: true,
                            },
                        },
                    },
                ],
            }
            : {}));
        return this.prisma.orientationDefinition.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
    }
    async update(id, input, actor) {
        var _a, _b;
        const existing = await this.get(id, {
            companyId: actor.companyId,
        });
        const contentChanged = input.contentBlocks != null;
        const shouldBump = input.bumpVersion === true
            ? true
            : input.bumpVersion === false
                ? false
                : contentChanged;
        const nextVersion = shouldBump
            ? (0, orientation_validation_1.bumpMinorVersion)(existing.version)
            : existing.version;
        const row = await this.prisma.orientationDefinition.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (input.title != null ? { title: input.title.trim() } : {})), (input.type != null ? { type: input.type } : {})), (input.contentMode != null ? { contentMode: input.contentMode } : {})), (input.contentBlocks != null
                ? {
                    contentBlocks: (0, orientation_validation_1.normalizeAndValidateBlocks)(input.contentBlocks),
                }
                : {})), (input.isPublished != null ? { isPublished: input.isPublished } : {})), (input.expiryRules != null
                ? {
                    expiryRules: input.expiryRules,
                }
                : {})), (input.metadata != null
                ? {
                    metadata: Object.assign(Object.assign({}, ((_a = existing.metadata) !== null && _a !== void 0 ? _a : {})), input.metadata),
                }
                : {})), { version: nextVersion }),
        });
        await this.auditLog.logAudit({ id: actor.id, companyId: (_b = actor.companyId) !== null && _b !== void 0 ? _b : existing.companyId }, audit_actions_1.AuditAction.ORIENTATION_DEFINITION_UPDATED, {
            type: audit_actions_1.AuditEntityType.ORIENTATION_DEFINITION,
            id: row.id,
            tenantId: existing.companyId,
        }, {
            version: row.version,
            isPublished: row.isPublished,
            contentChanged,
        });
        return row;
    }
};
exports.OrientationDefinitionService = OrientationDefinitionService;
exports.OrientationDefinitionService = OrientationDefinitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], OrientationDefinitionService);
//# sourceMappingURL=orientation-definition.service.js.map