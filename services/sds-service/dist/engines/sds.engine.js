"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoneEnforcementEngine = exports.expiryEngine = exports.controlExtractionEngine = exports.hazardExtractionEngine = exports.ZoneEnforcementEngine = exports.ExpiryEngine = exports.ControlExtractionEngine = exports.HazardExtractionEngine = void 0;
const env_1 = require("../config/env");
const WHMIS_PATTERNS = [
    { pattern: /flammab/i, code: 'FLAMMABLE', category: 'physical' },
    { pattern: /oxidiz/i, code: 'OXIDIZER', category: 'physical' },
    { pattern: /corros/i, code: 'CORROSIVE', category: 'health' },
    { pattern: /toxic|poison/i, code: 'TOXIC', category: 'health' },
    { pattern: /carcinogen/i, code: 'CARCINOGEN', category: 'health' },
    { pattern: /irritant/i, code: 'IRRITANT', category: 'health' },
    { pattern: /compressed\s*gas/i, code: 'COMPRESSED_GAS', category: 'physical' },
    { pattern: /environment/i, code: 'ENVIRONMENTAL', category: 'environmental' },
];
class HazardExtractionEngine {
    extract(input) {
        const hazards = [];
        const seen = new Set();
        const add = (code, category, description, source) => {
            const key = `${code}:${description}`;
            if (seen.has(key))
                return;
            seen.add(key);
            hazards.push({ code, category, description, source });
        };
        if (input.whmisClassification) {
            for (const { pattern, code, category } of WHMIS_PATTERNS) {
                if (pattern.test(input.whmisClassification)) {
                    add(code, category, input.whmisClassification, 'whmis_classification');
                }
            }
            if (hazards.length === 0) {
                add('GENERAL', 'health', input.whmisClassification, 'whmis_classification');
            }
        }
        const handlingText = jsonToText(input.handlingStorage);
        for (const { pattern, code, category } of WHMIS_PATTERNS) {
            if (pattern.test(handlingText)) {
                add(code, category, `Detected in handling/storage`, 'handling_storage');
            }
        }
        const firstAidText = jsonToText(input.firstAid);
        if (/eye|skin|inhal/i.test(firstAidText)) {
            add('EXPOSURE_ROUTE', 'health', 'Exposure routes documented in first aid', 'first_aid');
        }
        if (input.casNumber) {
            add('CAS', 'identifier', `CAS ${input.casNumber}`, 'cas_number');
        }
        return hazards;
    }
}
exports.HazardExtractionEngine = HazardExtractionEngine;
class ControlExtractionEngine {
    extract(input) {
        const controls = [];
        const seen = new Set();
        const add = (type, description, source) => {
            const key = `${type}:${description}`;
            if (seen.has(key))
                return;
            seen.add(key);
            controls.push({ type, description, source });
        };
        const ppe = input.ppeRequirements;
        if (Array.isArray(ppe)) {
            for (const item of ppe) {
                if (typeof item === 'string')
                    add('ppe', item, 'ppe_requirements');
                else if (item && typeof item === 'object' && 'type' in item) {
                    const o = item;
                    add('ppe', o.description ?? o.type ?? String(item), 'ppe_requirements');
                }
            }
        }
        else if (ppe && typeof ppe === 'object') {
            for (const [key, value] of Object.entries(ppe)) {
                if (value)
                    add('ppe', `${key}: ${String(value)}`, 'ppe_requirements');
            }
        }
        const handling = input.handlingStorage;
        if (handling && typeof handling === 'object') {
            const h = handling;
            if (h.ventilation)
                add('engineering', `Ventilation: ${String(h.ventilation)}`, 'handling_storage');
            if (h.spill_response)
                add('spill', String(h.spill_response), 'handling_storage');
            if (h.storage)
                add('storage', String(h.storage), 'handling_storage');
            if (h.handling)
                add('handling', String(h.handling), 'handling_storage');
        }
        const handlingText = jsonToText(handling);
        if (/gloves|respirator|eye\s*protection|face\s*shield/i.test(handlingText)) {
            add('ppe', 'PPE referenced in handling instructions', 'handling_storage');
        }
        return controls;
    }
}
exports.ControlExtractionEngine = ControlExtractionEngine;
class ExpiryEngine {
    isExpired(expiryDate, now = new Date()) {
        if (!expiryDate)
            return false;
        return expiryDate.getTime() < now.getTime();
    }
    isExpiringSoon(expiryDate, now = new Date()) {
        if (!expiryDate)
            return false;
        const threshold = now.getTime() + env_1.env.expiryWarningDays * 24 * 60 * 60 * 1000;
        return expiryDate.getTime() <= threshold && expiryDate.getTime() > now.getTime();
    }
}
exports.ExpiryEngine = ExpiryEngine;
class ZoneEnforcementEngine {
    evaluate(input) {
        const missingSds = input.requiredSdsIds.filter((id) => !input.acknowledgedSdsIds.has(id));
        const expiredSds = input.requiredSdsIds.filter((id) => input.expiredSdsIds.has(id));
        return {
            compliant: missingSds.length === 0 && expiredSds.length === 0,
            missingSds,
            expiredSds,
        };
    }
}
exports.ZoneEnforcementEngine = ZoneEnforcementEngine;
function jsonToText(value) {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    return JSON.stringify(value);
}
exports.hazardExtractionEngine = new HazardExtractionEngine();
exports.controlExtractionEngine = new ControlExtractionEngine();
exports.expiryEngine = new ExpiryEngine();
exports.zoneEnforcementEngine = new ZoneEnforcementEngine();
