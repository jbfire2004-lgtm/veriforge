"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTROL_CLASS_LOOKUP = exports.HAZARD_KEYWORD_LOOKUP = exports.DEFAULT_CONTROL_SEED = exports.DEFAULT_HAZARD_SEED = exports.ENERGY_WHEEL = void 0;
exports.industryPackSeeds = industryPackSeeds;
const jha_library_catalog_1 = require("./jha-library-catalog");
Object.defineProperty(exports, "CONTROL_CLASS_LOOKUP", { enumerable: true, get: function () { return jha_library_catalog_1.CONTROL_CLASS_LOOKUP; } });
exports.ENERGY_WHEEL = [
    {
        type: 'gravity',
        label: 'Gravity / falling',
        requiredControlTypes: ['engineering', 'administrative'],
        highExposureThreshold: 3,
    },
    {
        type: 'mechanical',
        label: 'Mechanical / moving parts',
        requiredControlTypes: ['engineering', 'administrative'],
        highExposureThreshold: 3,
    },
    {
        type: 'electrical',
        label: 'Electrical',
        requiredControlTypes: ['engineering', 'administrative'],
        highExposureThreshold: 2,
    },
    {
        type: 'pressure',
        label: 'Pressure / pneumatic',
        requiredControlTypes: ['engineering'],
        highExposureThreshold: 2,
    },
    {
        type: 'thermal',
        label: 'Thermal',
        requiredControlTypes: ['ppe', 'administrative'],
        highExposureThreshold: 3,
    },
    {
        type: 'chemical',
        label: 'Chemical',
        requiredControlTypes: ['substitution', 'engineering', 'ppe'],
        highExposureThreshold: 2,
    },
    {
        type: 'radiation',
        label: 'Radiation',
        requiredControlTypes: ['engineering', 'administrative'],
        highExposureThreshold: 2,
    },
    {
        type: 'biological',
        label: 'Biological',
        requiredControlTypes: ['ppe', 'administrative'],
        highExposureThreshold: 2,
    },
    {
        type: 'motion',
        label: 'Motion / ergonomics',
        requiredControlTypes: ['administrative', 'ppe'],
        highExposureThreshold: 3,
    },
];
const catalog = (0, jha_library_catalog_1.getCompleteCatalog)();
exports.DEFAULT_HAZARD_SEED = catalog.hazards;
exports.DEFAULT_CONTROL_SEED = catalog.controls;
exports.HAZARD_KEYWORD_LOOKUP = (() => {
    var _a;
    const map = new Map();
    for (const h of catalog.hazards) {
        if ((_a = h.keywords) === null || _a === void 0 ? void 0 : _a.length)
            map.set(h.description.toLowerCase().trim(), h.keywords);
    }
    return map;
})();
function industryPackSeeds(_packIds) {
    return (0, jha_library_catalog_1.getCompleteCatalog)();
}
//# sourceMappingURL=jha-flha.constants.js.map