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
exports.FormCailBridgeService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../cail/cail-emitter.service");
const cail_copilot_enrichment_service_1 = require("../cail/cail-copilot-enrichment.service");
let FormCailBridgeService = class FormCailBridgeService {
    constructor(emitter, copilotEnrich) {
        this.emitter = emitter;
        this.copilotEnrich = copilotEnrich;
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
    shouldEmit(def, formData) {
        var _a, _b, _c, _d;
        if ((_a = def.workflow) === null || _a === void 0 ? void 0 : _a.autoGenerateCail)
            return true;
        if ((_b = def.workflow) === null || _b === void 0 ? void 0 : _b.autoGenerateCorrectiveActions)
            return true;
        const triggers = (_d = (_c = def.workflow) === null || _c === void 0 ? void 0 : _c.cailTriggers) !== null && _d !== void 0 ? _d : [];
        for (const t of triggers) {
            if (formData[t.field] === t.equals)
                return true;
            if (t.notEquals !== undefined && formData[t.field] !== t.notEquals) {
                return true;
            }
        }
        return false;
    }
    collectTitles(def, formData) {
        var _a, _b;
        const titles = [];
        if (formData.controlsAdequate === 'no' || formData.fitForUse === 'no') {
            titles.push('Address inadequate controls / equipment condition');
        }
        if (formData.complianceRating === 'major_issues' ||
            formData.complianceRating === 'stop_work') {
            titles.push('Correct major safety inspection findings');
        }
        if (formData.defectsFound && String(formData.defectsFound).trim()) {
            titles.push(`Correct defects: ${String(formData.defectsFound).slice(0, 80)}`);
        }
        if (formData.correctiveAction && String(formData.correctiveAction).trim()) {
            titles.push(String(formData.correctiveAction).slice(0, 120));
        }
        if (!titles.length && formData.findingDescription) {
            titles.push(String(formData.findingDescription).slice(0, 120));
        }
        if (!titles.length && formData.hazardDescription) {
            titles.push(String(formData.hazardDescription).slice(0, 120));
        }
        for (const t of (_b = (_a = def.workflow) === null || _a === void 0 ? void 0 : _a.cailTriggers) !== null && _b !== void 0 ? _b : []) {
            if (formData[t.field] === t.equals && typeof t.field === 'string') {
                titles.push(`Form trigger: ${t.field}`);
            }
        }
        if (!titles.length) {
            titles.push(`${def.name} — follow-up required`);
        }
        return [...new Set(titles)];
    }
    async emitFromSafetyForm(formId, def, formData, ctx) {
        var _a, _b, _c, _d;
        if (!this.shouldEmit(def, formData))
            return [];
        if (!ctx.projectId)
            return [];
        const ownerCompanyId = ctx.companyId;
        if (!ownerCompanyId)
            return [];
        const sourceType = this.resolveSourceType(def, formData);
        const titles = this.collectTitles(def, formData);
        const created = [];
        for (const title of titles) {
            const cail = await this.emitter.emit({
                projectId: ctx.projectId,
                ownerCompanyId,
                sourceType,
                sourceId: formId,
                sourceItemId: title.slice(0, 64),
                title,
                description: typeof formData.rootCause === 'string'
                    ? formData.rootCause
                    : typeof formData.description === 'string'
                        ? formData.description
                        : undefined,
                createdByUserId: ctx.createdById,
                siteId: (_a = ctx.siteId) !== null && _a !== void 0 ? _a : undefined,
                equipmentId: (_b = ctx.equipmentId) !== null && _b !== void 0 ? _b : undefined,
                workerId: (_c = ctx.workerId) !== null && _c !== void 0 ? _c : undefined,
                dueDate: formData.dueDate
                    ? new Date(String(formData.dueDate))
                    : undefined,
                severity: formData.sifPotential ? 'critical' : undefined,
            });
            await this.emitter.linkSafetyForm(formId, cail.id);
            this.copilotEnrich.scheduleFormHazardEnrich(cail.id, {
                title,
                formName: def.name,
                formCategory: def.category,
                sourceType,
                formData,
                projectId: ctx.projectId,
                companyId: ownerCompanyId,
                missingControls: (_d = formData.missingControls) !== null && _d !== void 0 ? _d : formData.controlsNeeded,
                severity: formData.sifPotential ? 'critical' : 'medium',
            });
            created.push(cail);
        }
        return created;
    }
};
exports.FormCailBridgeService = FormCailBridgeService;
exports.FormCailBridgeService = FormCailBridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cail_emitter_service_1.CailEmitterService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService])
], FormCailBridgeService);
//# sourceMappingURL=form-cail-bridge.service.js.map