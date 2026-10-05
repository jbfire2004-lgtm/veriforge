"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChemicalCompatibilityEngine = void 0;
const INCOMPATIBLE = {
    oxidizer: ['flammable', 'combustible', 'organic'],
    flammable: ['oxidizer', 'corrosive_acid', 'corrosive_base'],
    corrosive_acid: ['corrosive_base', 'flammable', 'cyanide'],
    corrosive_base: ['corrosive_acid', 'flammable'],
    organic: ['oxidizer'],
    cyanide: ['corrosive_acid', 'oxidizer'],
};
class ChemicalCompatibilityEngine {
    evaluateSiteInventory(items) {
        var _a, _b;
        const issues = [];
        const byLocation = new Map();
        for (const item of items) {
            const loc = ((_a = item.locationNote) !== null && _a !== void 0 ? _a : 'default').toLowerCase().trim();
            const bucket = (_b = byLocation.get(loc)) !== null && _b !== void 0 ? _b : [];
            bucket.push(item);
            byLocation.set(loc, bucket);
        }
        for (const [, group] of byLocation) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const a = group[i];
                    const b = group[j];
                    const conflict = this.pairConflict(a, b);
                    if (conflict) {
                        issues.push({
                            itemId: a.id,
                            otherItemId: b.id,
                            reason: conflict,
                            severity: 'high',
                        });
                    }
                }
            }
        }
        return issues;
    }
    pairConflict(a, b) {
        var _a, _b, _c, _d;
        const aClass = ((_a = a.storageClass) !== null && _a !== void 0 ? _a : '').toLowerCase();
        const bClass = ((_b = b.storageClass) !== null && _b !== void 0 ? _b : '').toLowerCase();
        if (!aClass || !bClass)
            return null;
        const aExtra = Array.isArray(a.incompatibleWith)
            ? a.incompatibleWith.map((x) => x.toLowerCase())
            : [];
        const bExtra = Array.isArray(b.incompatibleWith)
            ? b.incompatibleWith.map((x) => x.toLowerCase())
            : [];
        if (aExtra.includes(bClass) || bExtra.includes(aClass)) {
            return `Declared incompatible storage: ${aClass} with ${bClass}`;
        }
        const aBad = (_c = INCOMPATIBLE[aClass]) !== null && _c !== void 0 ? _c : [];
        if (aBad.includes(bClass)) {
            return `Incompatible storage classes ${aClass} and ${bClass} in same location`;
        }
        const bBad = (_d = INCOMPATIBLE[bClass]) !== null && _d !== void 0 ? _d : [];
        if (bBad.includes(aClass)) {
            return `Incompatible storage classes ${bClass} and ${aClass} in same location`;
        }
        return null;
    }
}
exports.ChemicalCompatibilityEngine = ChemicalCompatibilityEngine;
//# sourceMappingURL=chemical-compatibility.engine.js.map