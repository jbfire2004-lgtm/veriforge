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
exports.JhaFlhaOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const jha_flha_service_1 = require("./jha-flha.service");
let JhaFlhaOrchestratorService = class JhaFlhaOrchestratorService {
    constructor(jha) {
        this.jha = jha;
    }
    async analyze(id) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const row = await this.jha.getById(id);
        const evaluation = (await this.jha.evaluate(id));
        const suggestions = await this.jha.getSuggestions(id);
        const kind = row.kind;
        const hazards = (_a = row.hazards) !== null && _a !== void 0 ? _a : [];
        const controls = (_b = row.controls) !== null && _b !== void 0 ? _b : [];
        const workers = (_c = row.workers) !== null && _c !== void 0 ? _c : [];
        const energySources = (_d = row.energySources) !== null && _d !== void 0 ? _d : [];
        const signedWorkers = workers.filter((w) => w.signedAt).length;
        const facts = [
            `${kind} · status ${row.status} · project #${row.projectId}`,
            `Task: ${row.taskDescription || '—'}`,
            row.locationNote
                ? `Location: ${row.locationNote}`
                : 'Location: not recorded',
            `${hazards.length} hazard(s), ${controls.length} control(s), ${energySources.length} energy source(s)`,
            `Crew: ${workers.length} worker(s), ${signedWorkers} signed`,
            `Risk ${evaluation.riskScore}, quality ${evaluation.qualityScore}, SIF score ${evaluation.sifScore}`,
        ];
        const missing = [];
        if (!((_e = row.taskDescription) === null || _e === void 0 ? void 0 : _e.trim()))
            missing.push('Task description');
        if (hazards.length === 0)
            missing.push('At least one hazard');
        if (controls.length === 0)
            missing.push('At least one control');
        if (energySources.length === 0)
            missing.push('Energy wheel coverage');
        if (workers.length === 0)
            missing.push('Crew assignment');
        if (workers.length > 0 && signedWorkers < workers.length) {
            missing.push(`${workers.length - signedWorkers} crew signature(s)`);
        }
        if (evaluation.missingControls.length) {
            missing.push(...evaluation.missingControls.map((m) => `Control: ${m}`));
        }
        if (missing.length) {
            facts.push(`Missing: ${missing.join('; ')}`);
        }
        const historical = [];
        if ((_f = suggestions.matchedTaskProfiles) === null || _f === void 0 ? void 0 : _f.length) {
            historical.push(`Task profiles matched: ${suggestions.matchedTaskProfiles.join(', ')}`);
        }
        const crewAdds = suggestions.crewOftenAdds;
        const crewAddLines = [
            ...((_h = (_g = crewAdds === null || crewAdds === void 0 ? void 0 : crewAdds.hazards) === null || _g === void 0 ? void 0 : _g.slice(0, 2).map((h) => h.description)) !== null && _h !== void 0 ? _h : []),
            ...((_k = (_j = crewAdds === null || crewAdds === void 0 ? void 0 : crewAdds.controls) === null || _j === void 0 ? void 0 : _j.slice(0, 2).map((c) => c.description)) !== null && _k !== void 0 ? _k : []),
        ];
        if (crewAddLines.length) {
            historical.push(`Crew often adds on this project: ${crewAddLines.join('; ')}`);
        }
        if (historical.length)
            facts.push(...historical);
        const analysis = [];
        if (evaluation.sifPotential) {
            analysis.push('SIF POTENTIAL — treat as life-critical. Stop work if controls are not verified.');
        }
        if (evaluation.highEnergyFlag) {
            analysis.push('High-energy hazard exposure documented. Direct controls required — PPE-only is insufficient.');
        }
        if (!evaluation.controlsAdequate) {
            analysis.push('Control gaps remain. Weak or missing controls increase injury severity.');
        }
        if ((_l = evaluation.ppeOnlyHighEnergyHazards) === null || _l === void 0 ? void 0 : _l.length) {
            analysis.push(`PPE-only on high-energy hazard(s): ${evaluation.ppeOnlyHighEnergyHazards.join('; ')}`);
        }
        if (evaluation.requiresSupervisorReview) {
            analysis.push('Supervisor review required before approval.');
        }
        if ((_m = suggestions.gapWarnings) === null || _m === void 0 ? void 0 : _m.length) {
            analysis.push(...suggestions.gapWarnings.slice(0, 5));
        }
        if ((_o = suggestions.hecaNotes) === null || _o === void 0 ? void 0 : _o.length) {
            analysis.push(...suggestions.hecaNotes.slice(0, 3));
        }
        if ((_p = evaluation.supervisorReviewFlags) === null || _p === void 0 ? void 0 : _p.length) {
            for (const f of evaluation.supervisorReviewFlags) {
                analysis.push(`[${f.severity}] ${f.message}`);
            }
        }
        if (analysis.length === 0) {
            analysis.push('No critical gaps flagged. Verify controls match actual field conditions.');
        }
        const actions = [];
        if (evaluation.blockSubmission) {
            actions.push(`BLOCKED — resolve before submit: ${evaluation.blockReasons.join('; ')}`);
        }
        for (const h of (_r = (_q = suggestions.missedHazards) === null || _q === void 0 ? void 0 : _q.slice(0, 5)) !== null && _r !== void 0 ? _r : []) {
            actions.push(`Add hazard: ${h.description} (${h.reason})`);
        }
        for (const c of (_t = (_s = suggestions.missedControls) === null || _s === void 0 ? void 0 : _s.slice(0, 5)) !== null && _t !== void 0 ? _t : []) {
            actions.push(`Add control: ${c.description} (${c.reason})`);
        }
        for (const e of (_u = suggestions.requiredEnergyTypes) !== null && _u !== void 0 ? _u : []) {
            if (!energySources.some((s) => s.energyType === e)) {
                actions.push(`Document energy source on wheel: ${e}`);
            }
        }
        if ((_v = evaluation.weakControls) === null || _v === void 0 ? void 0 : _v.length) {
            actions.push(`Strengthen controls: ${evaluation.weakControls.join('; ')}`);
        }
        if (workers.length > 0 && signedWorkers < workers.length) {
            actions.push('All crew must sign hazard acknowledgment before work starts.');
        }
        if (row.status === 'UNDER_REVIEW' || row.status === 'SUBMITTED') {
            actions.push('Supervisor: review hazards, controls, and signatures — approve, reject, or request changes.');
        }
        if (row.status === 'APPROVED') {
            actions.push('Lock record after field use to prevent unauthorized edits.');
        }
        actions.push('Verify controls in the field before starting work.');
        actions.push('Escalate to HSE if SIF potential cannot be controlled at the task level.');
        return {
            moduleType: kind === 'FLHA' ? 'FLHA' : 'JHA',
            recordId: id,
            facts,
            analysis,
            actions,
        };
    }
};
exports.JhaFlhaOrchestratorService = JhaFlhaOrchestratorService;
exports.JhaFlhaOrchestratorService = JhaFlhaOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jha_flha_service_1.JhaFlhaService])
], JhaFlhaOrchestratorService);
//# sourceMappingURL=jha-flha-orchestrator.service.js.map