"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HazardIngestionEngine = void 0;
const CATEGORY_MAP = {
    energy: 'energy',
    environmental: 'environmental',
    equipment: 'equipment',
    chemical: 'chemical',
    behavioral: 'behavioral',
    site: 'site_specific',
    site_specific: 'site_specific',
};
class HazardIngestionEngine {
    normalizeKey(title, description) {
        return `${title.toLowerCase().trim()}|${description
            .toLowerCase()
            .slice(0, 80)
            .trim()}`;
    }
    isDuplicate(keyA, keyB) {
        if (keyA === keyB)
            return true;
        const [ta] = keyA.split('|');
        const [tb] = keyB.split('|');
        return ta === tb;
    }
    fromJhaHazard(h, ctx) {
        var _a, _b, _c, _d;
        return {
            title: 'JHA hazard',
            description: h.description,
            category: (_b = CATEGORY_MAP[((_a = h.category) !== null && _a !== void 0 ? _a : 'energy').toLowerCase()]) !== null && _b !== void 0 ? _b : 'energy',
            hazardType: 'physical',
            severity: (_c = h.severity) !== null && _c !== void 0 ? _c : 3,
            likelihood: (_d = h.likelihood) !== null && _d !== void 0 ? _d : 3,
            sourceType: 'jha_flha',
            sourceId: h.id,
            scopeLevel: 'project',
            projectId: ctx.projectId,
        };
    }
    fromCompanyLibrary(h, companyId) {
        var _a, _b;
        return {
            title: h.title,
            description: h.description,
            category: (_a = CATEGORY_MAP[h.category.toLowerCase()]) !== null && _a !== void 0 ? _a : 'site_specific',
            hazardType: h.category === 'chemical' ? 'chemical' : 'physical',
            subcategory: (_b = h.subcategory) !== null && _b !== void 0 ? _b : undefined,
            severity: h.severity,
            likelihood: h.likelihood,
            sourceType: 'company_library',
            sourceId: h.id,
            scopeLevel: 'company',
            legacyCompanyHazardId: h.id,
        };
    }
    fromProjectLibrary(h, ctx) {
        var _a;
        return {
            title: h.title,
            description: h.description,
            category: (_a = CATEGORY_MAP[h.category.toLowerCase()]) !== null && _a !== void 0 ? _a : 'site_specific',
            hazardType: 'environmental',
            severity: h.severity,
            likelihood: h.likelihood,
            sourceType: 'project_library',
            sourceId: h.id,
            scopeLevel: 'project',
            projectId: ctx.projectId,
            legacyProjectHazardId: h.id,
        };
    }
    fromInspectionDeficiency(d, ctx) {
        var _a, _b;
        const sevRaw = String((_a = d.severity) !== null && _a !== void 0 ? _a : 'medium').toLowerCase();
        const sev = sevRaw === 'critical' ? 5 : sevRaw === 'high' ? 4 : 3;
        return {
            title: d.title,
            description: (_b = d.description) !== null && _b !== void 0 ? _b : d.title,
            category: 'equipment',
            hazardType: 'equipment',
            severity: sev,
            likelihood: 3,
            sourceType: 'inspection',
            sourceId: d.id,
            scopeLevel: 'project',
            projectId: ctx.projectId,
        };
    }
    fromPmTask(t, ctx) {
        var _a;
        return {
            title: `Task hazard: ${t.title}`,
            description: (_a = t.blockedReason) !== null && _a !== void 0 ? _a : `Safety-gated task ${t.title}`,
            category: 'behavioral',
            hazardType: 'procedural',
            severity: 4,
            likelihood: 3,
            sourceType: 'pm_task',
            sourceId: t.id,
            scopeLevel: 'task',
            projectId: ctx.projectId,
            taskId: t.id,
        };
    }
    fromIncident(e, ctx) {
        var _a, _b;
        const sevRaw = String((_a = e.severity) !== null && _a !== void 0 ? _a : 'medium').toLowerCase();
        const sev = sevRaw === 'critical' ? 5 : sevRaw === 'high' ? 4 : 3;
        return {
            title: e.title,
            description: (_b = e.description) !== null && _b !== void 0 ? _b : e.title,
            category: 'site_specific',
            hazardType: 'physical',
            severity: sev,
            likelihood: 4,
            sourceType: 'incident',
            sourceId: e.id,
            scopeLevel: ctx.projectId ? 'project' : 'company',
            projectId: ctx.projectId,
        };
    }
}
exports.HazardIngestionEngine = HazardIngestionEngine;
//# sourceMappingURL=hazard-ingestion.engine.js.map