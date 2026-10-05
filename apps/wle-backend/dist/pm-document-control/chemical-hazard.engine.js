"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChemicalHazardEngine = void 0;
const common_1 = require("@nestjs/common");
let ChemicalHazardEngine = class ChemicalHazardEngine {
    extract(doc) {
        var _a, _b, _c, _d, _e, _f, _g;
        const meta = ((_a = doc.metadataJson) !== null && _a !== void 0 ? _a : {});
        const whmis = ((_b = doc.whmisJson) !== null && _b !== void 0 ? _b : {});
        const hazardClasses = Array.isArray(doc.hazardClasses)
            ? doc.hazardClasses
            : [];
        const metaHazards = Array.isArray(meta.hazards)
            ? meta.hazards
            : Array.isArray(meta.hazardClasses)
                ? meta.hazardClasses
                : [];
        const hazards = [...new Set([...hazardClasses, ...metaHazards])];
        const controls = Array.isArray(meta.controls)
            ? meta.controls
            : Array.isArray(meta.requiredControls)
                ? meta.requiredControls
                : typeof meta.handling_storage === 'object' && meta.handling_storage
                    ? Object.keys(meta.handling_storage)
                    : [];
        const ppeRequirements = Array.isArray(meta.ppeRequirements)
            ? meta.ppeRequirements
            : Array.isArray(meta.ppe)
                ? meta.ppe
                : [];
        const firstAid = (_d = (_c = meta.firstAid) !== null && _c !== void 0 ? _c : meta.first_aid) !== null && _d !== void 0 ? _d : {};
        const handlingStorage = (_g = (_f = (_e = meta.handlingStorage) !== null && _e !== void 0 ? _e : meta.handling_storage) !== null && _f !== void 0 ? _f : meta.handling) !== null && _g !== void 0 ? _g : {};
        const highEnergy = hazards.some((h) => /flamm|oxid|corros|toxic|reactive|explos/i.test(h)) ||
            /class [bcd]/i.test(JSON.stringify(whmis));
        const chemicalRiskScore = Math.min(100, hazards.length * 12 + ppeRequirements.length * 5 + (highEnergy ? 25 : 0));
        return {
            hazards,
            controls,
            ppeRequirements,
            firstAid,
            handlingStorage,
            whmisClassification: whmis,
            chemicalRiskScore,
        };
    }
    suggestedControls(hazards) {
        const suggestions = [];
        for (const h of hazards) {
            if (/flamm/i.test(h)) {
                suggestions.push('Eliminate ignition sources', 'Ground/bond containers');
            }
            if (/corros/i.test(h))
                suggestions.push('Acid/base PPE', 'Eyewash within 10s');
            if (/toxic|health/i.test(h))
                suggestions.push('Respiratory protection per SDS');
        }
        if (suggestions.length === 0 && hazards.length > 0) {
            suggestions.push('Review SDS Section 8 PPE', 'Implement spill kit');
        }
        return [...new Set(suggestions)];
    }
};
exports.ChemicalHazardEngine = ChemicalHazardEngine;
exports.ChemicalHazardEngine = ChemicalHazardEngine = __decorate([
    (0, common_1.Injectable)()
], ChemicalHazardEngine);
//# sourceMappingURL=chemical-hazard.engine.js.map