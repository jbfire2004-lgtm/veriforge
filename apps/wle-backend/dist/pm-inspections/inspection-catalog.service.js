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
exports.InspectionCatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_templates_service_1 = require("./pm-inspection-templates.service");
const pm_inspection_kind_util_1 = require("./pm-inspection-kind.util");
let InspectionCatalogService = class InspectionCatalogService {
    constructor(prisma, pmTemplates) {
        this.prisma = prisma;
        this.pmTemplates = pmTemplates;
    }
    mapTemplate(row) {
        const scoringRules = row.scoringRules && typeof row.scoringRules === 'object'
            ? row.scoringRules
            : {};
        return Object.assign(Object.assign({}, row), { scoringRules, inspectionKind: (0, pm_inspection_kind_util_1.inspectionKind)({ name: row.name, scoringRules }), items: Array.isArray(row.items) ? row.items : [] });
    }
    async ensurePmLibrary(companyId, projectId) {
        return this.pmTemplates.ensureDefaults(companyId, projectId);
    }
    async listPmTemplates(companyId, projectId, options) {
        var _a;
        if ((options === null || options === void 0 ? void 0 : options.autoSeed) !== false) {
            await this.ensurePmLibrary(companyId, projectId);
        }
        const status = (_a = options === null || options === void 0 ? void 0 : options.status) !== null && _a !== void 0 ? _a : 'published';
        const rows = await this.pmTemplates.list({
            companyId,
            projectId,
            status,
        });
        let mapped = rows.map((r) => this.mapTemplate(r));
        if (options === null || options === void 0 ? void 0 : options.kind) {
            mapped = mapped.filter((t) => t.inspectionKind === options.kind);
        }
        const counts = {
            smart_site: mapped.filter((t) => t.inspectionKind === 'smart_site')
                .length,
            focus_audit: mapped.filter((t) => t.inspectionKind === 'focus_audit')
                .length,
            checklist: mapped.filter((t) => t.inspectionKind === 'checklist').length,
        };
        return { templates: mapped, counts };
    }
    async getSmartCatalog(companyId, projectId) {
        var _a;
        const { templates, counts } = await this.listPmTemplates(companyId, projectId);
        const categories = await this.prisma.systemCatalogEntry.findMany({
            where: {
                catalogType: 'smart_inspection_category',
                active: true,
            },
            orderBy: [{ name: 'asc' }],
        });
        const smartSiteTemplate = (_a = templates.find((t) => t.inspectionKind === 'smart_site')) !== null && _a !== void 0 ? _a : null;
        const focusAudits = templates.filter((t) => t.inspectionKind === 'focus_audit');
        return {
            categories: categories.map((c) => (Object.assign({ id: c.id, name: c.name, description: c.description, version: c.version }, c.payload))),
            smartSiteTemplate,
            focusAudits,
            counts,
            photoFirst: true,
        };
    }
    async listUnifiedChecklists(companyId, projectId, filters) {
        const core = await this.prisma.inspectionChecklist.findMany({
            where: {
                inspectionType: filters === null || filters === void 0 ? void 0 : filters.inspectionType,
                category: filters === null || filters === void 0 ? void 0 : filters.category,
                active: (filters === null || filters === void 0 ? void 0 : filters.activeOnly) === false ? undefined : true,
            },
            orderBy: [{ inspectionType: 'asc' }, { name: 'asc' }],
        });
        const pmResult = await this.listPmTemplates(companyId, projectId, {
            kind: 'checklist',
        });
        return {
            core,
            pm: pmResult.templates,
            counts: {
                core: core.length,
                pm: pmResult.templates.length,
            },
        };
    }
};
exports.InspectionCatalogService = InspectionCatalogService;
exports.InspectionCatalogService = InspectionCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_inspection_templates_service_1.PmInspectionTemplatesService])
], InspectionCatalogService);
//# sourceMappingURL=inspection-catalog.service.js.map