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
var CoreActionCailBackfillService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreActionCailBackfillService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
let CoreActionCailBackfillService = CoreActionCailBackfillService_1 = class CoreActionCailBackfillService {
    constructor(prisma, emitter) {
        this.prisma = prisma;
        this.emitter = emitter;
        this.logger = new common_1.Logger(CoreActionCailBackfillService_1.name);
    }
    async backfillFromSafetyFormActions(opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const dryRun = (_a = opts === null || opts === void 0 ? void 0 : opts.dryRun) !== null && _a !== void 0 ? _a : false;
        const limit = (_b = opts === null || opts === void 0 ? void 0 : opts.limit) !== null && _b !== void 0 ? _b : 500;
        const skippedReasons = {};
        let created = 0;
        let linked = 0;
        let skipped = 0;
        const actions = await this.prisma.safetyFormAction.findMany({
            where: { coreActionItemId: { not: null } },
            include: {
                form: {
                    include: {
                        formDefinition: {
                            select: { category: true, definition: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        for (const action of actions) {
            const form = action.form;
            if (!form.projectId) {
                skipped++;
                skippedReasons.no_project = ((_c = skippedReasons.no_project) !== null && _c !== void 0 ? _c : 0) + 1;
                continue;
            }
            if (!form.companyId) {
                skipped++;
                skippedReasons.no_company = ((_d = skippedReasons.no_company) !== null && _d !== void 0 ? _d : 0) + 1;
                continue;
            }
            const def = form.formDefinition.definition;
            const sourceType = this.resolveSourceType(def, (_e = form.formData) !== null && _e !== void 0 ? _e : {});
            const existing = await this.prisma.cailEntry.findFirst({
                where: {
                    sourceType,
                    sourceId: action.formId,
                    sourceItemId: action.id,
                },
            });
            if (existing) {
                skipped++;
                skippedReasons.already_migrated =
                    ((_f = skippedReasons.already_migrated) !== null && _f !== void 0 ? _f : 0) + 1;
                continue;
            }
            const coreItem = action.coreActionItemId
                ? await this.prisma.coreActionItem.findUnique({
                    where: { id: action.coreActionItemId },
                })
                : null;
            if (dryRun) {
                created++;
                continue;
            }
            const cail = await this.emitter.emit({
                projectId: form.projectId,
                ownerCompanyId: form.companyId,
                sourceType,
                sourceId: action.formId,
                sourceItemId: action.id,
                title: action.title,
                description: (_h = (_g = action.description) !== null && _g !== void 0 ? _g : coreItem === null || coreItem === void 0 ? void 0 : coreItem.description) !== null && _h !== void 0 ? _h : undefined,
                dueDate: (_k = (_j = action.dueAt) !== null && _j !== void 0 ? _j : coreItem === null || coreItem === void 0 ? void 0 : coreItem.dueAt) !== null && _k !== void 0 ? _k : undefined,
                severity: this.mapSeverity(coreItem === null || coreItem === void 0 ? void 0 : coreItem.priority),
                createdByUserId: (_m = (_l = coreItem === null || coreItem === void 0 ? void 0 : coreItem.createdById) !== null && _l !== void 0 ? _l : form.createdById) !== null && _m !== void 0 ? _m : undefined,
                siteId: (_o = form.siteId) !== null && _o !== void 0 ? _o : undefined,
                equipmentId: (_p = form.equipmentId) !== null && _p !== void 0 ? _p : undefined,
                workerId: (_q = form.workerId) !== null && _q !== void 0 ? _q : undefined,
                tags: [
                    'backfill:core_action_item',
                    `coreActionItem:${action.coreActionItemId}`,
                ],
            });
            const mappedStatus = this.mapStatus(action.status, coreItem === null || coreItem === void 0 ? void 0 : coreItem.status);
            if (mappedStatus && mappedStatus !== client_1.CailStatus.open) {
                await this.prisma.cailEntry.update({
                    where: { id: cail.id },
                    data: { status: mappedStatus },
                });
            }
            await this.emitter.linkSafetyForm(action.formId, cail.id);
            created++;
            linked++;
        }
        this.logger.log(`Backfill complete: scanned=${actions.length} created=${created} skipped=${skipped} dryRun=${dryRun}`);
        return {
            scanned: actions.length,
            created,
            linked,
            skipped,
            skippedReasons,
        };
    }
    resolveSourceType(def, formData) {
        var _a, _b, _c;
        const configured = (_a = def.workflow) === null || _a === void 0 ? void 0 : _a.cailSourceType;
        if (configured)
            return configured;
        if (formData.sifPotential === true || ((_b = def.workflow) === null || _b === void 0 ? void 0 : _b.autoFlagSIF))
            return 'sif';
        if (((_c = def.workflow) === null || _c === void 0 ? void 0 : _c.autoFlagHECA) || def.category === 'heca')
            return 'heca';
        if (def.category === 'flha')
            return 'flha';
        if (def.category === 'jha')
            return 'jha';
        if (def.category === 'training')
            return 'training';
        if (def.category === 'inspection')
            return 'inspection';
        return 'general';
    }
    mapSeverity(priority) {
        const p = (priority !== null && priority !== void 0 ? priority : 'NORMAL').toUpperCase();
        if (p === 'CRITICAL' || p === 'URGENT')
            return 'critical';
        if (p === 'HIGH')
            return 'high';
        if (p === 'LOW')
            return 'low';
        return 'medium';
    }
    mapStatus(actionStatus, coreStatus) {
        const s = (coreStatus !== null && coreStatus !== void 0 ? coreStatus : actionStatus).toUpperCase();
        if (s === 'COMPLETED' ||
            s === 'DONE' ||
            s === 'CLOSED' ||
            s === 'RESOLVED') {
            return 'resolved';
        }
        if (s === 'VERIFIED')
            return 'verified';
        if (s === 'CANCELLED' || s === 'CANCELED')
            return 'cancelled';
        if (s === 'IN_PROGRESS')
            return 'in_progress';
        return undefined;
    }
};
exports.CoreActionCailBackfillService = CoreActionCailBackfillService;
exports.CoreActionCailBackfillService = CoreActionCailBackfillService = CoreActionCailBackfillService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService])
], CoreActionCailBackfillService);
//# sourceMappingURL=core-action-cail-backfill.service.js.map