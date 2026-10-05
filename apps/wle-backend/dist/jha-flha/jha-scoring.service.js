"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JhaScoringService = void 0;
const common_1 = require("@nestjs/common");
const jha_flha_constants_1 = require("./jha-flha.constants");
let JhaScoringService = class JhaScoringService {
    computeHazardRisk(severity, likelihood) {
        return Math.min(25, severity * likelihood);
    }
    hazardEnergyTypes(h) {
        const raw = h.energyTypes;
        if (Array.isArray(raw))
            return raw.map(String);
        return [];
    }
    isHighEnergyHazard(h, energySources) {
        const hazardEnergies = this.hazardEnergyTypes(h);
        for (const es of energySources) {
            const def = jha_flha_constants_1.ENERGY_WHEEL.find((e) => e.type === es.energyType);
            if (def && es.exposureLevel >= def.highExposureThreshold) {
                if (hazardEnergies.length === 0 ||
                    hazardEnergies.includes(es.energyType))
                    return true;
            }
        }
        const highRiskEnergies = [
            'electrical',
            'pressure',
            'chemical',
            'radiation',
        ];
        return hazardEnergies.some((e) => highRiskEnergies.includes(e));
    }
    evaluate(input) {
        var _a, _b, _c, _d, _e, _f;
        const missingControls = [];
        const weakControls = [];
        const blockReasons = [];
        const supervisorReviewFlags = [];
        const ppeOnlyHighEnergyHazards = [];
        let maxRisk = 0;
        let sifIndicators = 0;
        for (const h of input.hazards) {
            maxRisk = Math.max(maxRisk, h.riskScore);
            if (h.sifIndicator || h.riskScore >= 20)
                sifIndicators++;
            const hazardControls = input.controls.filter((c) => c.hazardId === h.id);
            if (h.riskScore >= 12 && hazardControls.length === 0) {
                missingControls.push(`No controls for hazard: ${(_a = h.description) !== null && _a !== void 0 ? _a : h.id}`);
            }
            const nonPpe = hazardControls.filter((c) => c.controlType !== 'ppe');
            if (h.riskScore >= 12 && nonPpe.length === 0) {
                missingControls.push(`High-risk hazard needs non-PPE control: ${(_b = h.category) !== null && _b !== void 0 ? _b : 'hazard'}`);
            }
            const highEnergy = this.isHighEnergyHazard(h, input.energySources);
            if (highEnergy && hazardControls.length > 0) {
                const onlyPpe = hazardControls.every((c) => c.controlType === 'ppe');
                if (onlyPpe) {
                    const label = (_d = (_c = h.description) !== null && _c !== void 0 ? _c : h.category) !== null && _d !== void 0 ? _d : h.id;
                    ppeOnlyHighEnergyHazards.push(label);
                    supervisorReviewFlags.push({
                        severity: 'critical',
                        code: 'PPE_ONLY_HIGH_ENERGY',
                        message: `High-energy hazard "${label}" has only PPE controls — engineering or administrative controls required`,
                        hazardId: h.id,
                    });
                }
            }
            for (const c of hazardControls) {
                if (c.adequate === false ||
                    (c.effectivenessScore != null && c.effectivenessScore < 3)) {
                    weakControls.push(`Weak control on ${(_e = h.category) !== null && _e !== void 0 ? _e : 'hazard'}`);
                }
            }
        }
        let highEnergyFlag = false;
        for (const es of input.energySources) {
            const def = jha_flha_constants_1.ENERGY_WHEEL.find((e) => e.type === es.energyType);
            if (def && es.exposureLevel >= def.highExposureThreshold) {
                highEnergyFlag = true;
            }
            const hasRequired = input.controls.some((c) => def === null || def === void 0 ? void 0 : def.requiredControlTypes.includes(c.controlType));
            if (def && es.exposureLevel >= 2 && !hasRequired) {
                missingControls.push(`Missing required controls for ${es.energyType} energy`);
                supervisorReviewFlags.push({
                    severity: 'warning',
                    code: 'MISSING_ENERGY_CONTROLS',
                    message: `Missing ${def.requiredControlTypes.join(' or ')} controls for ${def.label} energy on the wheel`,
                });
            }
        }
        const weather = String((_f = input.environmentalJson.weather) !== null && _f !== void 0 ? _f : '').toLowerCase();
        const highRiskWeather = weather.includes('ice') ||
            weather.includes('storm') ||
            weather.includes('extreme');
        let sifScore = 0;
        sifScore += maxRisk >= 20 ? 25 : 0;
        sifScore += highEnergyFlag ? 20 : 0;
        sifScore += missingControls.length > 0 ? 15 : 0;
        sifScore += input.newWorkerPresent ? 10 : 0;
        sifScore += input.equipmentUnauthorized > 0 ? 15 : 0;
        sifScore += highRiskWeather ? 10 : 0;
        sifScore += ppeOnlyHighEnergyHazards.length > 0 ? 15 : 0;
        sifScore = Math.min(100, sifScore);
        const sifPotential = sifScore >= 40 || sifIndicators > 0;
        const requiresSupervisorReview = sifPotential ||
            highEnergyFlag ||
            input.newWorkerPresent ||
            highRiskWeather ||
            ppeOnlyHighEnergyHazards.length > 0;
        if (sifPotential) {
            supervisorReviewFlags.push({
                severity: 'critical',
                code: 'SIF_POTENTIAL',
                message: 'Serious injury or fatality (SIF) potential identified — supervisor review required',
            });
        }
        if (highEnergyFlag) {
            supervisorReviewFlags.push({
                severity: 'warning',
                code: 'HIGH_ENERGY',
                message: 'High-energy exposure on energy wheel — verify hierarchy of controls',
            });
        }
        if (highRiskWeather) {
            supervisorReviewFlags.push({
                severity: 'info',
                code: 'WEATHER',
                message: 'Extreme weather noted — confirm stop-work criteria and controls',
            });
        }
        if (input.hazards.length === 0) {
            blockReasons.push('At least one hazard is required');
        }
        if (missingControls.length > 0) {
            blockReasons.push('Missing required controls');
        }
        const controlsAdequate = missingControls.length === 0 && weakControls.length === 0;
        const riskScore = input.hazards.reduce((s, h) => s + h.riskScore, 0);
        const taskRiskScore = Math.min(100, Math.round(maxRisk * 2 + input.hazards.length * 2));
        const qualityScore = Math.max(0, 100 -
            missingControls.length * 15 -
            weakControls.length * 10 -
            ppeOnlyHighEnergyHazards.length * 12 -
            (input.hazards.length === 0 ? 50 : 0));
        return {
            riskScore,
            taskRiskScore,
            sifScore,
            sifPotential,
            highEnergyFlag,
            qualityScore,
            requiresSupervisorReview,
            controlsAdequate,
            missingControls,
            weakControls,
            blockSubmission: blockReasons.length > 0,
            blockReasons,
            supervisorReviewFlags,
            ppeOnlyHighEnergyHazards,
        };
    }
};
exports.JhaScoringService = JhaScoringService;
exports.JhaScoringService = JhaScoringService = __decorate([
    (0, common_1.Injectable)()
], JhaScoringService);
//# sourceMappingURL=jha-scoring.service.js.map