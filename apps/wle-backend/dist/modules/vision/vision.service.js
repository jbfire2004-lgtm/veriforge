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
exports.VisionService = void 0;
const common_1 = require("@nestjs/common");
const vision_1 = require("@vera/vision");
const prisma_service_1 = require("../../prisma/prisma.service");
const ttl_cache_1 = require("../../common/ttl-cache");
const vision_capabilities_1 = require("./vision-capabilities");
let VisionService = class VisionService {
    constructor(prisma) {
        var _a;
        this.prisma = prisma;
        this.vve = new vision_1.VeraVisionEngine();
        this.recentByCompany = new Map();
        this.candidatesCache = new ttl_cache_1.TtlCache(Number((_a = process.env.VERA_VISION_CANDIDATES_TTL_MS) !== null && _a !== void 0 ? _a : 60000), 200);
    }
    getCapabilities(ocrTextProvided = false) {
        var _a, _b, _c, _d;
        return (0, vision_capabilities_1.resolveVisionCapabilities)({
            ocrTextProvided,
            llmConfigured: Boolean(((_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.trim()) ||
                ((_b = process.env.VERA_LLM_API_KEY) === null || _b === void 0 ? void 0 : _b.trim()) ||
                ((_c = process.env.ANTHROPIC_API_KEY) === null || _c === void 0 ? void 0 : _c.trim())),
            ocrDisabledByEnv: process.env.VERA_VISION_OCR_ENABLED === 'false',
            externalOcrUrl: (_d = process.env.VERA_OCR_SERVICE_URL) !== null && _d !== void 0 ? _d : null,
        });
    }
    async analyze(dto) {
        var _a, _b, _c, _d, _e;
        const capabilities = this.getCapabilities(!!((_a = dto.ocrText) === null || _a === void 0 ? void 0 : _a.trim()));
        const candidates = await this.loadCandidates(dto.companyId);
        const fallbackText = ((_b = dto.ocrText) === null || _b === void 0 ? void 0 : _b.trim()) ||
            ((_d = (_c = dto.imageHints) === null || _c === void 0 ? void 0 : _c.hazards) === null || _d === void 0 ? void 0 : _d.join('. ')) ||
            'Document image — enable OCR text or LLM for richer extraction.';
        const result = await this.vve.analyze({
            documentType: dto.documentType,
            ocrText: capabilities.ocrEnabled ? fallbackText : fallbackText,
            ocrBlocks: dto.ocrBlocks,
            imageHints: dto.imageHints,
            candidates,
            offline: dto.offline,
        });
        const withMeta = (0, vision_capabilities_1.attachAnalysisMeta)(result, capabilities.recommendedMode, capabilities);
        if (dto.companyId) {
            const list = (_e = this.recentByCompany.get(dto.companyId)) !== null && _e !== void 0 ? _e : [];
            list.unshift(withMeta);
            this.recentByCompany.set(dto.companyId, list.slice(0, 50));
        }
        return withMeta;
    }
    async analyzeCertificate(dto) {
        return this.analyze(Object.assign(Object.assign({}, dto), { documentType: 'training_certificate' }));
    }
    async analyzeInspection(dto) {
        return this.analyze(Object.assign(Object.assign({}, dto), { documentType: 'inspection_form' }));
    }
    async analyzeEquipmentPlate(dto) {
        return this.analyze(Object.assign(Object.assign({}, dto), { documentType: 'equipment_plate' }));
    }
    getDashboard(companyId) {
        var _a;
        const recent = companyId ? (_a = this.recentByCompany.get(companyId)) !== null && _a !== void 0 ? _a : [] : [];
        return this.vve.buildDashboard(recent);
    }
    async loadCandidates(companyId) {
        const cacheKey = `candidates:${companyId !== null && companyId !== void 0 ? companyId : 'global'}`;
        return this.candidatesCache.getOrSet(cacheKey, async () => {
            const workers = await this.prisma.worker.findMany({
                where: companyId ? { companyId } : {},
                take: 100,
                select: { id: true, firstName: true, lastName: true },
            });
            const equipment = await this.prisma.equipment.findMany({
                where: companyId ? { companyId } : {},
                take: 100,
                select: { id: true, name: true, serialNumber: true, assetTag: true },
            });
            const providers = await this.prisma.provider.findMany({
                take: 50,
                select: { id: true, name: true },
            });
            const projects = companyId
                ? await this.prisma.project.findMany({
                    where: { companyId },
                    take: 30,
                    select: { id: true, name: true },
                })
                : [];
            const certifications = await this.prisma.certification.findMany({
                take: 80,
                select: { id: true, name: true },
            });
            return {
                workers: workers.map((w) => ({
                    id: String(w.id),
                    name: `${w.firstName} ${w.lastName}`.trim(),
                })),
                equipment: equipment.map((e) => {
                    var _a, _b;
                    return ({
                        id: String(e.id),
                        name: e.name,
                        serial: (_b = (_a = e.serialNumber) !== null && _a !== void 0 ? _a : e.assetTag) !== null && _b !== void 0 ? _b : undefined,
                    });
                }),
                providers: providers.map((p) => ({ id: String(p.id), name: p.name })),
                projects: projects.map((p) => ({ id: String(p.id), name: p.name })),
                courses: certifications.map((c) => ({
                    id: String(c.id),
                    name: c.name,
                })),
                companies: companyId
                    ? [{ id: String(companyId), name: `Company ${companyId}` }]
                    : [],
            };
        });
    }
};
exports.VisionService = VisionService;
exports.VisionService = VisionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VisionService);
//# sourceMappingURL=vision.service.js.map