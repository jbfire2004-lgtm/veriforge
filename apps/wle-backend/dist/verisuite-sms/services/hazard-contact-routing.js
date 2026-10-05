"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAZARD_LABEL = void 0;
exports.hazardsFromOccurrences = hazardsFromOccurrences;
exports.hazardsFromText = hazardsFromText;
exports.routeHazardContacts = routeHazardContacts;
const erp_ohs_utility_catalog_1 = require("./erp-ohs-utility.catalog");
const OHS_ROUTE_META = {
    'CA-SK': {
        frameworkLabel: 'Saskatchewan OHS',
        regulator: 'Saskatchewan Ministry of Labour Relations and Workplace Safety — OHS',
        reportingHint: 'Confirm current reporting method with Saskatchewan OHS (ministry channels).',
    },
    'CA-AB': {
        frameworkLabel: 'Alberta OHS',
        regulator: 'Alberta Occupational Health and Safety',
        reportingHint: 'Confirm current Alberta OHS reporting method (OHS Contact Centre / online as applicable).',
    },
    'CA-BC': {
        frameworkLabel: 'WorkSafeBC',
        regulator: 'WorkSafeBC',
        reportingHint: 'Confirm current WorkSafeBC immediate-reporting channels for the event type.',
    },
    'CA-MB': {
        frameworkLabel: 'Manitoba Workplace Safety and Health',
        regulator: 'Manitoba Workplace Safety and Health',
        reportingHint: 'Confirm current Manitoba WSH reporting methods.',
    },
    'CA-ON': {
        frameworkLabel: 'Ontario OHSA',
        regulator: 'Ontario Ministry of Labour, Immigration, Training and Skills Development',
        reportingHint: 'Confirm current Ontario MOL notification requirements.',
    },
};
function getOhsMeta(region) {
    var _a;
    return ((_a = OHS_ROUTE_META[region]) !== null && _a !== void 0 ? _a : {
        frameworkLabel: `${region} OHS`,
        regulator: `${region} OHS authority`,
        reportingHint: 'Confirm current regulator reporting channels.',
    });
}
const HAZARD_FROM_OCCURRENCE = {
    gas_line_strike: 'gas_line_strike',
    electrical_contact: 'electrical_strike',
    chemical_release: 'hazardous_release',
};
const HAZARD_LABEL = {
    gas_line_strike: 'Gas line strike',
    electrical_strike: 'Electrical strike',
    hazardous_release: 'Hazardous release',
};
exports.HAZARD_LABEL = HAZARD_LABEL;
function regionUtilities(region) {
    return erp_ohs_utility_catalog_1.UTILITY_CONTACT_CATALOG.filter((c) => c.region === region ||
        region.startsWith(String(c.region)) ||
        String(c.region).startsWith(region.slice(0, 5)));
}
function pickUtility(region, agency, preferredIds) {
    const list = regionUtilities(region).filter((c) => c.agency === agency);
    if (preferredIds === null || preferredIds === void 0 ? void 0 : preferredIds.length) {
        for (const id of preferredIds) {
            const hit = list.find((c) => c.id === id);
            if (hit)
                return hit;
        }
    }
    return list[0];
}
function routeGasLineStrike(region) {
    const preferred = region === 'CA-SK'
        ? ['util-sk-saskenergy']
        : region === 'CA-AB'
            ? ['util-ab-atco-gas']
            : region === 'CA-BC'
                ? ['util-bc-fortis']
                : region === 'CA-ON'
                    ? ['util-on-enbridge']
                    : undefined;
    const gas = pickUtility(region, 'gas', preferred);
    const out = [];
    if (gas) {
        out.push({
            id: `route-gas-${gas.id}`,
            hazard: 'gas_line_strike',
            role: 'primary_utility',
            priority: 1,
            name: gas.name,
            phone: gas.phone,
            dialHint: `Dial ${gas.phone}`,
            reason: region === 'CA-SK'
                ? 'Gas line strike → SaskEnergy emergency line'
                : `Gas line strike → ${gas.name}`,
            region,
            verified: true,
            source: 'utility_catalog',
        });
    }
    out.push({
        id: 'route-gas-911',
        hazard: 'gas_line_strike',
        role: 'public_safety_911',
        priority: 2,
        name: 'Emergency services (911)',
        phone: '911',
        dialHint: 'Dial 911 if fire, injury, or uncontrolled release',
        reason: 'Life safety / uncontrolled gas release backup',
        region,
        verified: true,
        source: 'public_safety',
    });
    return out;
}
function routeElectricalStrike(region) {
    const preferred = region === 'CA-SK'
        ? ['util-sk-saskpower']
        : region === 'CA-AB'
            ? ['util-ab-atco-electric']
            : region === 'CA-BC'
                ? ['util-bc-bchydro']
                : undefined;
    const electric = pickUtility(region, 'electric', preferred);
    const out = [];
    if (electric) {
        out.push({
            id: `route-elec-${electric.id}`,
            hazard: 'electrical_strike',
            role: 'electric_utility',
            priority: 1,
            name: electric.name,
            phone: electric.phone,
            dialHint: `Dial ${electric.phone}`,
            reason: region === 'CA-SK'
                ? 'Electrical strike → SaskPower emergency line'
                : region === 'CA-AB'
                    ? 'Electrical strike → ATCO Electric emergency line'
                    : `Electrical strike → ${electric.name}`,
            region,
            verified: true,
            source: 'utility_catalog',
        });
    }
    if (region === 'CA-SK') {
        const atco = erp_ohs_utility_catalog_1.UTILITY_CONTACT_CATALOG.find((c) => c.id === 'util-ab-atco-electric');
        if (atco) {
            out.push({
                id: `route-elec-ref-${atco.id}`,
                hazard: 'electrical_strike',
                role: 'electric_utility',
                priority: 3,
                name: `${atco.name} (Alberta reference)`,
                phone: atco.phone,
                dialHint: `If work crosses into Alberta ATCO territory: ${atco.phone}`,
                reason: 'Electrical strike reference — ATCO Electric (AB)',
                region: 'CA-AB',
                verified: true,
                source: 'utility_catalog',
            });
        }
    }
    out.push({
        id: 'route-elec-911',
        hazard: 'electrical_strike',
        role: 'public_safety_911',
        priority: 2,
        name: 'Emergency services (911)',
        phone: '911',
        dialHint: 'Dial 911 for injury / arc flash / downed line public hazard',
        reason: 'Life safety backup for electrical contact',
        region,
        verified: true,
        source: 'public_safety',
    });
    return out.sort((a, b) => a.priority - b.priority);
}
function routeHazardousRelease(region) {
    const ohs = getOhsMeta(region);
    return [
        {
            id: `route-haz-ohs-${region}`,
            hazard: 'hazardous_release',
            role: 'provincial_ohs',
            priority: 1,
            name: ohs.regulator,
            phone: null,
            dialHint: ohs.reportingHint,
            reason: `Hazardous release → ${ohs.frameworkLabel} required reporting`,
            region,
            verified: true,
            source: 'ohs_profile',
        },
        {
            id: 'route-haz-fire',
            hazard: 'hazardous_release',
            role: 'local_fire',
            priority: 2,
            name: 'Local fire / HAZMAT (via 911)',
            phone: '911',
            dialHint: 'Dial 911 — request fire department / HAZMAT',
            reason: 'Hazardous release → local fire / HAZMAT response',
            region,
            verified: true,
            source: 'public_safety',
        },
        {
            id: 'route-haz-911-ems',
            hazard: 'hazardous_release',
            role: 'public_safety_911',
            priority: 3,
            name: 'Emergency services (911)',
            phone: '911',
            dialHint: 'Dial 911 for exposures / injuries',
            reason: 'Medical / public safety concurrent with fire notify',
            region,
            verified: true,
            source: 'public_safety',
        },
    ];
}
function hazardsFromOccurrences(occurrences) {
    const set = new Set();
    for (const code of occurrences) {
        const mapped = HAZARD_FROM_OCCURRENCE[code];
        if (mapped)
            set.add(mapped);
    }
    return [...set];
}
function hazardsFromText(text) {
    const lower = (text || '').toLowerCase();
    const hits = [];
    if (/gas line|gas strike|natural gas|pipeline strike|saskenergy|hit gas|gas odor|gas odour|line strike/.test(lower)) {
        hits.push('gas_line_strike');
    }
    if (/electrical strike|electrical contact|arc flash|power line|electric shock|electrocution|energized|saskpower|atco electric/.test(lower)) {
        hits.push('electrical_strike');
    }
    if (/hazardous release|chemical spill|chemical release|hazmat|toxic release|product release|acid spill/.test(lower)) {
        hits.push('hazardous_release');
    }
    return hits;
}
function routeHazardContacts(input) {
    var _a;
    const region = (0, erp_ohs_utility_catalog_1.normalizeRegion)(input.regionCode);
    const fromOcc = input.occurrences
        ? hazardsFromOccurrences(input.occurrences)
        : [];
    const fromText = input.text ? hazardsFromText(input.text) : [];
    const hazards = [
        ...new Set([...((_a = input.hazards) !== null && _a !== void 0 ? _a : []), ...fromOcc, ...fromText]),
    ];
    const contacts = [];
    for (const hazard of hazards) {
        if (hazard === 'gas_line_strike')
            contacts.push(...routeGasLineStrike(region));
        if (hazard === 'electrical_strike')
            contacts.push(...routeElectricalStrike(region));
        if (hazard === 'hazardous_release')
            contacts.push(...routeHazardousRelease(region));
    }
    const byId = new Map();
    for (const c of contacts) {
        const prev = byId.get(c.id);
        if (!prev || c.priority < prev.priority)
            byId.set(c.id, c);
    }
    const deduped = [...byId.values()].sort((a, b) => {
        if (a.hazard !== b.hazard) {
            return a.hazard.localeCompare(b.hazard);
        }
        return a.priority - b.priority;
    });
    const summary = hazards.map((h) => {
        const primary = deduped.find((c) => c.hazard === h && c.priority === 1);
        return primary
            ? `${HAZARD_LABEL[h]} → ${primary.name}${primary.phone ? ` (${primary.phone})` : ''}`
            : `${HAZARD_LABEL[h]} → confirm local ERP contacts`;
    });
    return { region, hazards, contacts: deduped, summary };
}
//# sourceMappingURL=hazard-contact-routing.js.map