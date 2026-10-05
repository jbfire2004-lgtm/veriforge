"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferControlClass = inferControlClass;
exports.controlClassLabel = controlClassLabel;
exports.isDirectControlType = isDirectControlType;
function inferControlClass(controlType, energyTypes, hazardCategories) {
    if (controlType === 'elimination' || controlType === 'substitution')
        return 'direct';
    if (controlType === 'engineering') {
        if ((energyTypes === null || energyTypes === void 0 ? void 0 : energyTypes.length) ||
            (hazardCategories === null || hazardCategories === void 0 ? void 0 : hazardCategories.some((c) => [
                'Electrical',
                'Pressure',
                'Fall',
                'Confined space',
                'Lifting',
                'Excavation',
            ].includes(c)))) {
            return 'direct';
        }
        return 'direct';
    }
    return 'alternative';
}
function controlClassLabel(cls) {
    return cls === 'direct' ? 'Direct control' : 'Alternative control';
}
function isDirectControlType(controlType, energyTypes) {
    return inferControlClass(controlType, energyTypes) === 'direct';
}
//# sourceMappingURL=jha-control-class.js.map