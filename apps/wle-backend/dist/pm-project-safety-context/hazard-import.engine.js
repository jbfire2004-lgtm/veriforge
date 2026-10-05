"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HazardImportEngine = void 0;
const CATEGORY_MAP = {
    energy: 'energy',
    environmental: 'environmental',
    equipment: 'equipment',
    chemical: 'chemical',
    behavioral: 'behavioral',
    site: 'site_specific',
    site_specific: 'site_specific',
};
class HazardImportEngine {
    mapCompanyLibrary(entry) {
        var _a, _b;
        return {
            category: (_a = CATEGORY_MAP[entry.category.toLowerCase()]) !== null && _a !== void 0 ? _a : 'site_specific',
            title: (_b = entry.subcategory) !== null && _b !== void 0 ? _b : entry.category,
            description: entry.description,
            severity: entry.defaultSeverity,
            likelihood: entry.defaultLikelihood,
            sifPotential: entry.defaultSeverity >= 4 && entry.defaultLikelihood >= 4,
            sourceType: 'company_library',
        };
    }
    mapJhaHazard(h) {
        var _a, _b;
        return {
            category: 'energy',
            title: 'JHA hazard',
            description: h.description,
            severity: (_a = h.severity) !== null && _a !== void 0 ? _a : 3,
            likelihood: (_b = h.likelihood) !== null && _b !== void 0 ? _b : 3,
            sifPotential: !!h.sifIndicator,
            sourceType: 'jha_flha',
            sourceId: h.id,
        };
    }
    mapInspectionDeficiency(d) {
        var _a;
        const sev = d.severity === 'critical' ? 5 : d.severity === 'high' ? 4 : 3;
        return {
            category: 'equipment',
            title: d.title,
            description: (_a = d.description) !== null && _a !== void 0 ? _a : d.title,
            severity: sev,
            likelihood: 3,
            sifPotential: sev >= 4,
            sourceType: 'inspection',
            sourceId: d.id,
        };
    }
    mapIncident(i) {
        var _a, _b;
        return {
            category: 'behavioral',
            title: (_a = i.title) !== null && _a !== void 0 ? _a : 'Incident hazard',
            description: (_b = i.description) !== null && _b !== void 0 ? _b : 'Imported from incident',
            severity: 4,
            likelihood: 3,
            sifPotential: true,
            sourceType: 'incident',
            sourceId: i.id,
        };
    }
    mapEquipmentFailure(f) {
        var _a;
        const critical = f.failureType === 'safety_device' || f.failureType === 'structural';
        return {
            category: 'equipment',
            title: f.title,
            description: (_a = f.description) !== null && _a !== void 0 ? _a : f.title,
            severity: critical ? 5 : 4,
            likelihood: 4,
            sifPotential: critical,
            sourceType: 'equipment_failure',
            sourceId: f.id,
        };
    }
    dedupeKey(h) {
        return `${h.sourceType}:${h.title}:${h.description.slice(0, 80)}`;
    }
}
exports.HazardImportEngine = HazardImportEngine;
//# sourceMappingURL=hazard-import.engine.js.map