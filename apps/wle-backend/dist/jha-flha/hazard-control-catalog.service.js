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
exports.HazardControlCatalogService = void 0;
const common_1 = require("@nestjs/common");
const jha_library_service_1 = require("./jha-library.service");
let HazardControlCatalogService = class HazardControlCatalogService {
    constructor(library) {
        this.library = library;
    }
    filterBySearch(rows, search) {
        const q = search === null || search === void 0 ? void 0 : search.trim().toLowerCase();
        if (!q)
            return rows;
        return rows.filter((r) => {
            var _a, _b;
            return r.description.toLowerCase().includes(q) ||
                ((_b = (_a = r.category) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q)) !== null && _b !== void 0 ? _b : false);
        });
    }
    async listHazards(companyId, projectId, options) {
        var _a;
        const rows = await this.library.listHazards(companyId, projectId, options === null || options === void 0 ? void 0 : options.taskCode);
        let mapped = rows.map((h) => this.library.mapHazardRow(h));
        if (options === null || options === void 0 ? void 0 : options.category) {
            mapped = mapped.filter((h) => h.category === options.category);
        }
        mapped = this.filterBySearch(mapped, options === null || options === void 0 ? void 0 : options.search);
        const categories = [...new Set(mapped.map((h) => h.category))].sort();
        const counts = {};
        for (const h of mapped) {
            counts[h.category] = ((_a = counts[h.category]) !== null && _a !== void 0 ? _a : 0) + 1;
        }
        return { hazards: mapped, categories, counts, total: mapped.length };
    }
    async listControls(companyId, projectId, options) {
        var _a, _b, _c, _d;
        const rows = await this.library.listControls(companyId, projectId, options === null || options === void 0 ? void 0 : options.hazardCategory);
        let mapped = rows.map((c) => this.library.mapControlRow(c));
        const hazardCats = (_b = (_a = options === null || options === void 0 ? void 0 : options.hazardCategories) === null || _a === void 0 ? void 0 : _a.filter(Boolean)) !== null && _b !== void 0 ? _b : [];
        if (hazardCats.length > 0 && !(options === null || options === void 0 ? void 0 : options.hazardCategory)) {
            mapped = mapped.filter((c) => {
                var _a;
                if (!((_a = c.hazardCategories) === null || _a === void 0 ? void 0 : _a.length))
                    return true;
                return c.hazardCategories.some((cat) => hazardCats.includes(cat));
            });
        }
        const q = (_c = options === null || options === void 0 ? void 0 : options.search) === null || _c === void 0 ? void 0 : _c.trim().toLowerCase();
        if (q) {
            mapped = mapped.filter((c) => c.description.toLowerCase().includes(q) ||
                c.controlType.toLowerCase().includes(q));
        }
        const controlTypes = [...new Set(mapped.map((c) => c.controlType))].sort();
        const counts = {};
        for (const c of mapped) {
            counts[c.controlType] = ((_d = counts[c.controlType]) !== null && _d !== void 0 ? _d : 0) + 1;
        }
        return { controls: mapped, controlTypes, counts, total: mapped.length };
    }
    async suggestHazardsForTask(companyId, projectId, input) {
        var _a, _b, _c, _d;
        const hazards = await this.library.listHazards(companyId, projectId);
        const controls = await this.library.listControls(companyId, projectId);
        const result = await this.library.suggest({
            taskDescription: input.taskDescription,
            locationNote: input.locationNote,
            weather: input.weather,
            selectedHazardCategories: [],
            selectedEnergyTypes: [],
            existingHazardDescriptions: (_a = input.existingHazardDescriptions) !== null && _a !== void 0 ? _a : [],
            existingControlDescriptions: [],
            hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
            controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
        }, projectId);
        return {
            suggestedHazards: result.suggestedHazards,
            missedHazards: (_b = result.missedHazards) !== null && _b !== void 0 ? _b : [],
            matchedTaskProfiles: (_c = result.matchedTaskProfiles) !== null && _c !== void 0 ? _c : [],
            warnings: (_d = result.warnings) !== null && _d !== void 0 ? _d : [],
        };
    }
    async suggestControlsForHazards(companyId, projectId, input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const hazards = await this.library.listHazards(companyId, projectId);
        const controls = await this.library.listControls(companyId, projectId);
        const result = await this.library.suggest({
            taskDescription: input.taskDescription,
            selectedHazardCategories: (_a = input.hazardCategories) !== null && _a !== void 0 ? _a : [],
            selectedEnergyTypes: (_b = input.energyTypes) !== null && _b !== void 0 ? _b : [],
            existingHazardDescriptions: (_c = input.hazardDescriptions) !== null && _c !== void 0 ? _c : [],
            existingControlDescriptions: (_d = input.existingControlDescriptions) !== null && _d !== void 0 ? _d : [],
            focusedHazardCategory: input.focusedHazardCategory,
            focusedHazardDescription: input.focusedHazardDescription,
            focusedHazardEnergyTypes: input.focusedHazardEnergyTypes,
            hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
            controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
        }, projectId);
        return {
            suggestedControls: result.suggestedControls,
            missedControls: (_e = result.missedControls) !== null && _e !== void 0 ? _e : [],
            warnings: (_f = result.warnings) !== null && _f !== void 0 ? _f : [],
            crewOftenAdds: (_h = (_g = result.crewOftenAdds) === null || _g === void 0 ? void 0 : _g.controls) !== null && _h !== void 0 ? _h : [],
        };
    }
    async aiIdentifyHazards(companyId, projectId, body) {
        var _a;
        const taskText = [
            body.taskDescription,
            body.workScope,
            body.locationNote,
            ...((_a = body.equipment) !== null && _a !== void 0 ? _a : []),
        ]
            .filter(Boolean)
            .join(' ');
        const ruleBased = await this.suggestHazardsForTask(companyId, projectId, {
            taskDescription: taskText,
            locationNote: body.locationNote,
        });
        return {
            source: 'stub',
            model: null,
            message: 'AI hazard identification stub — results use Vera rule engine until vision/LLM is configured.',
            hazards: ruleBased.suggestedHazards.slice(0, 12),
            matchedTaskProfiles: ruleBased.matchedTaskProfiles,
            warnings: ruleBased.warnings,
        };
    }
};
exports.HazardControlCatalogService = HazardControlCatalogService;
exports.HazardControlCatalogService = HazardControlCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jha_library_service_1.JhaLibraryService])
], HazardControlCatalogService);
//# sourceMappingURL=hazard-control-catalog.service.js.map