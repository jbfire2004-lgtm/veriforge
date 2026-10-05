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
exports.IncidentSifEngineService = void 0;
const common_1 = require("@nestjs/common");
const event_classification_engine_1 = require("./event-classification.engine");
const severity_risk_engine_1 = require("./severity-risk.engine");
const rca_engine_1 = require("./rca.engine");
const pm_safety_events_constants_1 = require("./pm-safety-events.constants");
const SIF_KEYWORDS = [
    'fall',
    'height',
    'electrocut',
    'energized',
    'struck-by',
    'struck by',
    'caught-in',
    'caught in',
    'crush',
    'confined space',
    'asphyx',
    'amputation',
    'fatality',
    'fatal',
    'sif',
    'serious injury',
    'line of fire',
    'overturn',
    'rollover',
    'trench collapse',
    'arc flash',
];
const EVENT_TYPE_TO_INPUT = {
    incident_injury: 'injury',
    near_miss: 'near_miss',
    incident_property: 'property_damage',
    incident_environmental: 'environmental',
    security_event: 'security',
    equipment_failure: 'process_upset',
    incident_equipment: 'property_damage',
    hazard_observation: 'near_miss',
    positive_observation: 'near_miss',
    behavioral_observation: 'near_miss',
    custom: 'process_upset',
};
const INCIDENT_TYPE_MAP = {
    injury: 'incident_injury',
    near_miss: 'near_miss',
    'near miss': 'near_miss',
    property_damage: 'incident_property',
    'property damage': 'incident_property',
    environmental: 'incident_environmental',
    security: 'security_event',
    process_upset: 'equipment_failure',
};
let IncidentSifEngineService = class IncidentSifEngineService {
    constructor(classifier, risk, rca) {
        this.classifier = classifier;
        this.risk = risk;
        this.rca = rca;
    }
    inputFromEvent(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const sifPotential = event.sifEventId ||
            event.sclPotentialSeverity === 'critical' ||
            event.sclPotentialSeverity === 'high'
            ? 'yes'
            : 'unknown';
        return {
            incident_type: (_a = EVENT_TYPE_TO_INPUT[event.eventType]) !== null && _a !== void 0 ? _a : 'process_upset',
            severity: event.severity === 'low' ? 'potential' : 'actual',
            SIF_potential: sifPotential,
            date_time: event.occurredAt.toISOString(),
            location: (_b = event.locationNote) !== null && _b !== void 0 ? _b : undefined,
            people_involved: [
                ...((_d = (_c = event.people) === null || _c === void 0 ? void 0 : _c.map((p) => {
                    var _a, _b;
                    return ({
                        name: (_a = p.name) !== null && _a !== void 0 ? _a : undefined,
                        role: p.role,
                        worker_id: (_b = p.workerId) !== null && _b !== void 0 ? _b : undefined,
                    });
                })) !== null && _d !== void 0 ? _d : []),
                ...((_f = (_e = event.injuries) === null || _e === void 0 ? void 0 : _e.map((i) => {
                    var _a;
                    return ({
                        role: 'injured',
                        worker_id: (_a = i.workerId) !== null && _a !== void 0 ? _a : undefined,
                    });
                })) !== null && _f !== void 0 ? _f : []),
            ],
            description_free_text: (_g = event.description) !== null && _g !== void 0 ? _g : event.title,
            immediate_actions_taken: ((_h = event.investigation) === null || _h === void 0 ? void 0 : _h.immediateActions)
                ? event.investigation.immediateActions
                    .split(/\n|;/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            photos_and_evidence_summaries: (_k = (_j = event.attachments) === null || _j === void 0 ? void 0 : _j.map((a) => { var _a; return (_a = a.fileName) !== null && _a !== void 0 ? _a : 'Attachment'; }).filter(Boolean)) !== null && _k !== void 0 ? _k : [],
            similar_past_incidents: (_m = (_l = event.rootCauses) === null || _l === void 0 ? void 0 : _l.map((rc) => ({ summary: rc.description }))) !== null && _m !== void 0 ? _m : [],
            companyId: event.companyId,
            projectId: event.projectId,
        };
    }
    generate(input) {
        const text = this.fullText(input);
        const eventType = this.resolveEventType(input);
        const classified = this.classifier.classifyType(text, eventType);
        const risk = this.risk.score({
            eventType: classified.eventType,
            description: input.description_free_text,
            hasInjury: input.incident_type === 'injury' || /injur/i.test(text),
            medicalAid: /hospital|medical aid|stitches/i.test(text),
            lostTime: /lost time|lti|days away/i.test(text),
            equipmentFailure: /equipment|failure|breakdown/i.test(text),
        });
        const sif = this.assessSif(input, text, risk.severity);
        const classification = this.buildClassification(input, classified, risk, sif);
        const root_cause_analysis = this.buildRca(input, text, classified.eventType);
        const capa_list = this.buildCapa(input, root_cause_analysis, sif);
        const learning_summary = this.buildLearning(input, classification, capa_list);
        const client_report_summary = this.buildClientReport(input, classification);
        return {
            classification,
            root_cause_analysis,
            capa_list,
            learning_summary,
            client_report_summary,
        };
    }
    fullText(input) {
        var _a, _b, _c, _d, _e;
        return [
            input.description_free_text,
            input.location,
            ...((_a = input.immediate_actions_taken) !== null && _a !== void 0 ? _a : []),
            ...((_b = input.photos_and_evidence_summaries) !== null && _b !== void 0 ? _b : []),
            ...((_c = input.procedures_or_rules_relevant) !== null && _c !== void 0 ? _c : []),
            ...((_e = (_d = input.similar_past_incidents) === null || _d === void 0 ? void 0 : _d.map((i) => { var _a; return (_a = i.summary) !== null && _a !== void 0 ? _a : i.title; })) !== null && _e !== void 0 ? _e : []),
        ]
            .filter(Boolean)
            .join(' ');
    }
    resolveEventType(input) {
        var _a, _b;
        const key = input.incident_type.toLowerCase().replace(/\s+/g, '_');
        return ((_b = (_a = INCIDENT_TYPE_MAP[key]) !== null && _a !== void 0 ? _a : INCIDENT_TYPE_MAP[input.incident_type.toLowerCase()]) !== null && _b !== void 0 ? _b : 'hazard_observation');
    }
    assessSif(input, text, severity) {
        if (input.SIF_potential === 'yes') {
            return { value: 'yes', reasoning: 'Declared SIF potential in intake.' };
        }
        if (input.SIF_potential === 'no') {
            return { value: 'no', reasoning: 'Declared no SIF potential in intake.' };
        }
        const hits = SIF_KEYWORDS.filter((k) => text.toLowerCase().includes(k));
        if (hits.length >= 2 || (hits.length >= 1 && severity === 'critical')) {
            return {
                value: 'yes',
                reasoning: `Life-critical indicators: ${hits.join(', ')}; severity ${severity}.`,
            };
        }
        if (input.incident_type === 'near_miss' && hits.length) {
            return {
                value: 'yes',
                reasoning: `Near miss with SIF precursors: ${hits.join(', ')}.`,
            };
        }
        if (hits.length === 1) {
            return {
                value: 'unknown',
                reasoning: `Possible SIF precursor (${hits[0]}) — verify with investigation lead.`,
            };
        }
        return {
            value: 'no',
            reasoning: 'No strong SIF precursors identified from narrative; continue standard investigation.',
        };
    }
    buildClassification(input, classified, risk, sif) {
        var _a, _b, _c;
        const normalizedType = input.incident_type.replace(/\s/g, '_');
        const people = ['injury', 'near_miss'].includes(normalizedType) ||
            ((_b = (_a = input.people_involved) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
        const narrative = this.buildNarrative(input);
        return {
            narrative,
            event_types: [classified.eventType, input.incident_type],
            sif_potential: sif.value,
            sif_reasoning: sif.reasoning,
            impact: {
                people: Boolean(people) || input.incident_type === 'injury',
                environment: input.incident_type === 'environmental' ||
                    /spill|release/i.test(input.description_free_text),
                asset: input.incident_type === 'property_damage' ||
                    /damage|equipment/i.test(input.description_free_text),
                reputation: /client|public|media|regulator/i.test(input.description_free_text),
                production: /shutdown|delay|outage/i.test(input.description_free_text),
            },
            severity_assessment: `${risk.severity} (risk score ${risk.riskScore})`,
            requires_regulatory_attention: sif.value === 'yes' ||
                risk.severity === 'critical' ||
                ((_c = input.constraints) !== null && _c !== void 0 ? _c : []).some((c) => /legal|regulator|report/i.test(c)),
        };
    }
    buildNarrative(input) {
        var _a, _b, _c;
        const when = input.date_time
            ? new Date(input.date_time).toLocaleString()
            : 'Date/time not recorded';
        const who = ((_a = input.people_involved) === null || _a === void 0 ? void 0 : _a.length)
            ? input.people_involved
                .map((p) => { var _a, _b; return (_b = (_a = p.name) !== null && _a !== void 0 ? _a : p.role) !== null && _b !== void 0 ? _b : 'person'; })
                .join(', ')
            : 'Personnel not listed';
        const immediate = ((_b = input.immediate_actions_taken) === null || _b === void 0 ? void 0 : _b.length)
            ? ` Immediate actions: ${input.immediate_actions_taken.join('; ')}.`
            : '';
        return `On ${when} at ${(_c = input.location) !== null && _c !== void 0 ? _c : 'the worksite'}, involving ${who}: ${input.description_free_text.trim()}.${immediate}`;
    }
    buildRca(input, text, eventType) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const method = (_a = input.org_root_cause_method) !== null && _a !== void 0 ? _a : '5-Why';
        const factors = this.rca.suggestContributingFactors({
            eventType,
            description: text,
        });
        const suggestions = this.rca.suggestRootCauses({
            description: text,
            eventType,
            contributingFactors: factors.map((f) => f.label),
            guidedAnswers: {},
            library: pm_safety_events_constants_1.DEFAULT_ROOT_CAUSES.map((r) => ({
                code: r.code,
                label: r.label,
                category: r.category,
            })),
            historicalCodes: (_b = input.similar_past_incidents) === null || _b === void 0 ? void 0 : _b.map((i) => { var _a; return (_a = i.title) !== null && _a !== void 0 ? _a : ''; }).filter(Boolean),
        });
        const topRoot = (_d = (_c = suggestions[0]) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'Inadequate hazard identification or control';
        const five_whys = this.rca.buildFiveWhyChain(input.description_free_text.slice(0, 200), topRoot);
        const immediate_causes = factors.slice(0, 3).map((f) => ({
            category: mapPathwayToCategory(f.pathway),
            description: f.label,
        }));
        if (!immediate_causes.length) {
            immediate_causes.push({
                category: 'People',
                description: 'Unsafe act or condition at point of incident',
            });
        }
        const underlying_causes = suggestions.slice(0, 3).map((s) => {
            var _a, _b;
            return ({
                category: mapPathwayToCategory((_b = (_a = s.pathway) !== null && _a !== void 0 ? _a : s.category) !== null && _b !== void 0 ? _b : 'process'),
                description: s.label,
            });
        });
        const system_causes = [];
        if (/procedure|permit|jha/i.test(text)) {
            system_causes.push({
                category: 'Procedures',
                description: 'Work planning or procedure gap allowed exposure',
            });
        }
        if (/training|competency|orientation/i.test(text)) {
            system_causes.push({
                category: 'People',
                description: 'Training or competency verification gap',
            });
        }
        if (/supervision|management|oversight/i.test(text) ||
            ((_e = input.procedures_or_rules_relevant) === null || _e === void 0 ? void 0 : _e.length)) {
            system_causes.push({
                category: 'Management',
                description: 'Oversight or management system weakness',
            });
        }
        if (!system_causes.length) {
            system_causes.push({
                category: 'Management',
                description: 'SMS element requiring review — planning, resources, or verification',
            });
        }
        const fishbone = {
            People: [],
            Equipment: [],
            Environment: [],
            Procedures: [],
            Management: [],
            Culture: [],
        };
        for (const f of factors) {
            const cat = mapPathwayToCategory(f.pathway);
            (_f = fishbone[cat]) === null || _f === void 0 ? void 0 : _f.push(f.label);
        }
        for (const s of suggestions.slice(0, 6)) {
            const cat = mapPathwayToCategory((_h = (_g = s.pathway) !== null && _g !== void 0 ? _g : s.category) !== null && _h !== void 0 ? _h : 'process');
            (_j = fishbone[cat]) === null || _j === void 0 ? void 0 : _j.push(s.label);
        }
        for (const proc of (_k = input.procedures_or_rules_relevant) !== null && _k !== void 0 ? _k : []) {
            fishbone.Procedures.push(proc);
        }
        return {
            method,
            five_whys,
            immediate_causes,
            underlying_causes,
            system_causes,
            fishbone,
        };
    }
    buildCapa(input, rca, sif) {
        var _a, _b, _c;
        const capa = [];
        for (const action of (_a = input.immediate_actions_taken) !== null && _a !== void 0 ? _a : []) {
            capa.push({
                type: 'containment',
                action: `Verify completion and effectiveness: ${action}`,
                owner_role: 'Site supervisor',
                priority: 'high',
                linked_cause: 'Immediate stabilization',
                effectiveness_expectation: 'Stops further harm or exposure at scene',
            });
        }
        if (!((_b = input.immediate_actions_taken) === null || _b === void 0 ? void 0 : _b.length)) {
            capa.push({
                type: 'containment',
                action: 'Secure area, preserve evidence, and brief crew on stop-work if needed',
                owner_role: 'Site supervisor',
                priority: 'high',
                linked_cause: 'Scene control',
                effectiveness_expectation: 'Prevents secondary incidents during investigation',
            });
        }
        for (const cause of rca.underlying_causes.slice(0, 3)) {
            capa.push({
                type: 'corrective',
                action: `Address root cause: ${cause.description}`,
                owner_role: ownerForCategory(cause.category),
                priority: sif.value === 'yes' ? 'high' : 'medium',
                linked_cause: cause.description,
                effectiveness_expectation: `Reduces recurrence of ${cause.category.toLowerCase()} failure mode`,
            });
        }
        for (const sys of rca.system_causes.slice(0, 2)) {
            capa.push({
                type: 'preventive',
                action: `SMS improvement: ${sys.description}`,
                owner_role: 'HSE manager',
                priority: 'medium',
                linked_cause: sys.description,
                effectiveness_expectation: 'Strengthens system controls across similar work',
            });
        }
        if ((_c = input.similar_past_incidents) === null || _c === void 0 ? void 0 : _c.length) {
            capa.push({
                type: 'preventive',
                action: 'Review trend with similar past incidents and validate prior CAPA closure',
                owner_role: 'HSE manager',
                priority: 'high',
                linked_cause: 'Recurring pattern',
                effectiveness_expectation: 'Breaks repeat incident chain',
            });
        }
        if (sif.value === 'yes') {
            capa.push({
                type: 'preventive',
                action: 'Conduct SIF learning review with leadership and share across projects',
                owner_role: 'Project director',
                priority: 'high',
                linked_cause: 'SIF potential',
                effectiveness_expectation: 'Elevates organizational learning for life-critical risk',
            });
        }
        return capa.slice(0, 12);
    }
    buildLearning(input, classification, capa) {
        var _a, _b, _c;
        const bullets = [
            `${(_a = classification.event_types[1]) !== null && _a !== void 0 ? _a : 'Event'} at ${(_b = input.location) !== null && _b !== void 0 ? _b : 'site'} — ${classification.severity_assessment}.`,
            `SIF potential: ${classification.sif_potential.toUpperCase()} — ${classification.sif_reasoning}`,
            ...capa
                .filter((c) => c.type === 'corrective' || c.type === 'preventive')
                .slice(0, 2)
                .map((c) => `Action: ${c.action}`),
            ((_c = input.procedures_or_rules_relevant) === null || _c === void 0 ? void 0 : _c.length)
                ? `Relevant rules: ${input.procedures_or_rules_relevant
                    .slice(0, 2)
                    .join('; ')}`
                : 'Review JHA/permits for this task type before restart.',
        ];
        return bullets.filter(Boolean).slice(0, 5);
    }
    buildClientReport(input, classification) {
        var _a;
        const when = input.date_time
            ? new Date(input.date_time).toISOString().slice(0, 10)
            : 'the reported date';
        return [
            `On ${when}, an ${input.incident_type.replace(/_/g, ' ')} occurred at ${(_a = input.location) !== null && _a !== void 0 ? _a : 'the project site'}.`,
            classification.narrative,
            `Immediate actions were taken to secure the area and support affected personnel.`,
            `An investigation is underway. Corrective measures will be implemented in accordance with the project safety management system.`,
            classification.requires_regulatory_attention
                ? `Regulatory reporting requirements are being evaluated per contract and legal obligations.`
                : `No external reporting determination has been made pending investigation completion.`,
        ].join(' ');
    }
};
exports.IncidentSifEngineService = IncidentSifEngineService;
exports.IncidentSifEngineService = IncidentSifEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_classification_engine_1.EventClassificationEngine,
        severity_risk_engine_1.SeverityRiskEngine,
        rca_engine_1.RcaEngine])
], IncidentSifEngineService);
function mapPathwayToCategory(pathway) {
    const p = pathway.toLowerCase();
    if (p.includes('human') || p.includes('people') || p.includes('training'))
        return 'People';
    if (p.includes('equip'))
        return 'Equipment';
    if (p.includes('env'))
        return 'Environment';
    if (p.includes('proc') || p.includes('procedure'))
        return 'Procedures';
    if (p.includes('manage') || p.includes('culture'))
        return 'Management';
    return 'Procedures';
}
function ownerForCategory(category) {
    switch (category) {
        case 'Equipment':
            return 'Maintenance supervisor';
        case 'Environment':
            return 'Site superintendent';
        case 'Procedures':
            return 'HSE coordinator';
        case 'Management':
            return 'Project manager';
        default:
            return 'Supervisor';
    }
}
//# sourceMappingURL=incident-sif-engine.service.js.map