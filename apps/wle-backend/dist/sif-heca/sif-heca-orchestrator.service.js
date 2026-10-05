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
exports.SifHecaOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const sif_heca_service_1 = require("./sif-heca.service");
let SifHecaOrchestratorService = class SifHecaOrchestratorService {
    constructor(sifHeca) {
        this.sifHeca = sifHeca;
    }
    async analyzeEvent(eventId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const event = await this.sifHeca.getEvent(eventId);
        const raw = ((_a = event.rawPayload) !== null && _a !== void 0 ? _a : {});
        const sif = event.sifScore;
        const heca = event.hecaScore;
        const capa = (_b = event.correctiveActions) !== null && _b !== void 0 ? _b : [];
        const facts = [
            `SIF/HECA event · ${event.status} · project #${event.projectId}`,
            `Title: ${event.title}`,
            event.description
                ? `Description: ${event.description}`
                : 'Description: not recorded',
            `Source: ${event.sourceType} / ${event.sourceId}`,
            raw.source === 'field_offline'
                ? 'Captured via field offline sync'
                : 'Captured via PM workflow',
        ];
        if (raw.locationNote)
            facts.push(`Location: ${raw.locationNote}`);
        if ((_c = raw.hazards) === null || _c === void 0 ? void 0 : _c.length) {
            facts.push(`${raw.hazards.length} hazard(s) documented in payload`);
        }
        else {
            facts.push('Hazards: not structured in payload — scope text only');
        }
        const missing = [];
        if (!((_d = event.description) === null || _d === void 0 ? void 0 : _d.trim()))
            missing.push('Work description');
        if (!sif)
            missing.push('SIF score not computed');
        if (!heca)
            missing.push('HECA classification not computed');
        if (missing.length)
            facts.push(`Missing: ${missing.join('; ')}`);
        const analysis = [];
        if (sif) {
            analysis.push(`SIF score ${sif.sifScore} — category ${sif.sifCategory}${sif.requiresSupervisorReview ? ' · SUPERVISOR REVIEW REQUIRED' : ''}`);
            if (sif.sifCategory === 'critical' || sif.sifCategory === 'high') {
                analysis.push('SIF POTENTIAL — life-critical risk profile. Stop work until controls verified.');
            }
            const explain = (_e = sif.explainability) !== null && _e !== void 0 ? _e : [];
            for (const row of explain.slice(0, 5)) {
                analysis.push(row.detail);
            }
            const requiredControls = (_f = sif.requiredControls) !== null && _f !== void 0 ? _f : [];
            if (requiredControls.length) {
                analysis.push(`Required controls: ${requiredControls.join('; ')}`);
            }
        }
        if (heca) {
            analysis.push(`HECA: ${heca.hecaCategoryLabel} — risk ${heca.hecaRiskScore}${heca.highEnergyFlag ? ' · HIGH ENERGY' : ''}`);
            if (heca.highEnergyFlag) {
                analysis.push('High-energy hazard — direct controls and isolation required; PPE-only is insufficient.');
            }
            const requiredCorrective = (_g = heca.requiredCorrective) !== null && _g !== void 0 ? _g : [];
            if (requiredCorrective.length) {
                analysis.push(`HECA corrective needs: ${requiredCorrective.join('; ')}`);
            }
        }
        if (analysis.length === 0) {
            analysis.push('Event ingested but not fully scored — re-run evaluation from PM or re-sync from field.');
        }
        const actions = [];
        if (event.status === 'review_required') {
            actions.push('Supervisor/HSE: review SIF score and HECA classification — approve, reject, or request changes.');
        }
        if (sif === null || sif === void 0 ? void 0 : sif.requiresSupervisorReview) {
            actions.push('Do not authorize work until supervisor approval is recorded.');
        }
        if (capa.length) {
            actions.push(`${capa.length} corrective action(s) linked — verify closure and evidence.`);
        }
        for (const c of capa.slice(0, 3)) {
            actions.push(`CAPA: ${c.title} (${c.status})`);
        }
        actions.push('Verify energy isolation and direct controls in the field before work.');
        actions.push('Escalate to HSE if SIF category is high or critical and controls cannot be verified.');
        const moduleType = raw.assessmentKind === 'HECA'
            ? 'HECA'
            : raw.assessmentKind === 'SIF'
                ? 'SIF'
                : 'SIF/HECA';
        return {
            moduleType,
            recordId: eventId,
            facts,
            analysis,
            actions,
        };
    }
};
exports.SifHecaOrchestratorService = SifHecaOrchestratorService;
exports.SifHecaOrchestratorService = SifHecaOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sif_heca_service_1.SifHecaService])
], SifHecaOrchestratorService);
//# sourceMappingURL=sif-heca-orchestrator.service.js.map