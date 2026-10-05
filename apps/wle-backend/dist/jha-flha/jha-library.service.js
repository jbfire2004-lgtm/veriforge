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
exports.JhaLibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jha_flha_constants_1 = require("./jha-flha.constants");
const jha_library_catalog_1 = require("./jha-library-catalog");
const jha_control_class_1 = require("./jha-control-class");
const jha_industry_packs_1 = require("./jha-industry-packs");
const jha_library_learning_service_1 = require("./jha-library-learning.service");
const jha_suggestion_engine_1 = require("./jha-suggestion.engine");
let JhaLibraryService = class JhaLibraryService {
    constructor(prisma, learning) {
        this.prisma = prisma;
        this.learning = learning;
    }
    energyWheel() {
        return jha_flha_constants_1.ENERGY_WHEEL;
    }
    async resolveCompanyPacks(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { industry: true },
        });
        return (0, jha_industry_packs_1.resolveIndustryPacks)(company === null || company === void 0 ? void 0 : company.industry);
    }
    async ensureSeed(companyId, projectId) {
        var _a, _b, _c, _d, _e;
        const { hazards, controls } = (0, jha_library_catalog_1.getCompleteCatalog)();
        for (const h of hazards) {
            const exists = await this.prisma.hazardLibraryEntry.findFirst({
                where: {
                    companyId,
                    projectId: projectId !== null && projectId !== void 0 ? projectId : null,
                    description: h.description,
                },
            });
            if (!exists) {
                await this.prisma.hazardLibraryEntry.create({
                    data: {
                        companyId,
                        projectId,
                        category: h.category,
                        subcategory: h.subcategory,
                        description: h.description,
                        defaultSeverity: (_a = h.defaultSeverity) !== null && _a !== void 0 ? _a : 3,
                        defaultLikelihood: (_b = h.defaultLikelihood) !== null && _b !== void 0 ? _b : 3,
                        defaultEnergyTypes: h.defaultEnergyTypes,
                        taskTypes: ((_c = h.taskTypes) !== null && _c !== void 0 ? _c : []),
                    },
                });
            }
        }
        for (const c of controls) {
            const exists = await this.prisma.controlLibraryEntry.findFirst({
                where: {
                    companyId,
                    projectId: projectId !== null && projectId !== void 0 ? projectId : null,
                    description: c.description,
                },
            });
            if (!exists) {
                await this.prisma.controlLibraryEntry.create({
                    data: {
                        companyId,
                        projectId,
                        controlType: c.controlType,
                        description: c.description,
                        hazardCategories: c.hazardCategories,
                        energyTypes: ((_d = c.energyTypes) !== null && _d !== void 0 ? _d : []),
                        ppeRequired: (_e = c.ppeRequired) !== null && _e !== void 0 ? _e : false,
                    },
                });
            }
        }
    }
    mapHazardRow(h) {
        var _a, _b;
        return {
            id: h.id,
            category: h.category,
            subcategory: (_a = h.subcategory) !== null && _a !== void 0 ? _a : undefined,
            description: h.description,
            defaultSeverity: h.defaultSeverity,
            defaultLikelihood: h.defaultLikelihood,
            defaultEnergyTypes: (_b = h.defaultEnergyTypes) !== null && _b !== void 0 ? _b : [],
            keywords: jha_flha_constants_1.HAZARD_KEYWORD_LOOKUP.get(h.description.toLowerCase().trim()),
        };
    }
    mapControlRow(c) {
        var _a, _b, _c;
        const hazardCategories = (_a = c.hazardCategories) !== null && _a !== void 0 ? _a : [];
        const energyTypes = (_b = c.energyTypes) !== null && _b !== void 0 ? _b : [];
        const controlClass = (_c = jha_flha_constants_1.CONTROL_CLASS_LOOKUP.get(c.description.toLowerCase().trim())) !== null && _c !== void 0 ? _c : (0, jha_control_class_1.inferControlClass)(c.controlType, energyTypes, hazardCategories);
        return {
            id: c.id,
            controlType: c.controlType,
            description: c.description,
            hazardCategories,
            energyTypes,
            ppeRequired: c.ppeRequired,
            controlClass,
        };
    }
    async listHazards(companyId, projectId, taskCode) {
        await this.ensureSeed(companyId, projectId);
        const rows = await this.prisma.hazardLibraryEntry.findMany({
            where: {
                active: true,
                OR: [
                    { companyId, projectId: null },
                    { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : undefined },
                ],
            },
            orderBy: [{ category: 'asc' }, { description: 'asc' }],
            take: 2000,
        });
        if (!taskCode)
            return rows;
        return rows.filter((r) => {
            const types = r.taskTypes;
            return !(types === null || types === void 0 ? void 0 : types.length) || types.includes(taskCode);
        });
    }
    async listControls(companyId, projectId, category) {
        await this.ensureSeed(companyId, projectId);
        const rows = await this.prisma.controlLibraryEntry.findMany({
            where: {
                active: true,
                OR: [
                    { companyId, projectId: null },
                    { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : undefined },
                ],
            },
            orderBy: [{ controlType: 'asc' }, { description: 'asc' }],
            take: 2000,
        });
        if (!category)
            return rows;
        return rows.filter((r) => {
            const cats = r.hazardCategories;
            return !(cats === null || cats === void 0 ? void 0 : cats.length) || cats.includes(category);
        });
    }
    async createHazard(data) {
        var _a, _b, _c;
        return this.prisma.hazardLibraryEntry.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                category: data.category,
                subcategory: data.subcategory,
                description: data.description,
                defaultSeverity: (_a = data.defaultSeverity) !== null && _a !== void 0 ? _a : 3,
                defaultLikelihood: (_b = data.defaultLikelihood) !== null && _b !== void 0 ? _b : 3,
                defaultEnergyTypes: ((_c = data.defaultEnergyTypes) !== null && _c !== void 0 ? _c : []),
            },
        });
    }
    async createControl(data) {
        var _a, _b;
        return this.prisma.controlLibraryEntry.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                controlType: data.controlType,
                description: data.description,
                hazardCategories: ((_a = data.hazardCategories) !== null && _a !== void 0 ? _a : []),
                ppeRequired: (_b = data.ppeRequired) !== null && _b !== void 0 ? _b : false,
            },
        });
    }
    async getProjectLearnings(projectId) {
        return this.learning.getProjectLearnings(projectId);
    }
    async promoteFromApprovedJha(jhaFlhaId) {
        return this.learning.promoteFromApprovedJha(jhaFlhaId);
    }
    async suggest(input, projectId) {
        const learnings = projectId
            ? await this.learning.getProjectLearnings(projectId)
            : { hazards: [], controls: [], approvedFormCount: 0 };
        return (0, jha_suggestion_engine_1.suggestJhaLibrary)(Object.assign(Object.assign({}, input), { projectLearnings: learnings }));
    }
    async listTasks(companyId, projectId) {
        return this.prisma.jhaTaskLibraryEntry.findMany({
            where: {
                active: true,
                OR: [
                    { companyId, projectId: null },
                    { companyId, projectId: projectId !== null && projectId !== void 0 ? projectId : undefined },
                ],
            },
            orderBy: { title: 'asc' },
            take: 100,
        });
    }
    async createTask(data) {
        return this.prisma.jhaTaskLibraryEntry.create({ data });
    }
};
exports.JhaLibraryService = JhaLibraryService;
exports.JhaLibraryService = JhaLibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jha_library_learning_service_1.JhaLibraryLearningService])
], JhaLibraryService);
//# sourceMappingURL=jha-library.service.js.map