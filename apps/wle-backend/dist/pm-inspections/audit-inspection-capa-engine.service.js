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
exports.AuditInspectionCapaEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const deficiency_scoring_engine_1 = require("./deficiency-scoring.engine");
const DEFAULT_ORG_STANDARDS = [
    'Life-saving rules — work with a valid permit when required',
    'Life-saving rules — verify zero energy before work',
    'Life-saving rules — protect yourself against a fall when working at height',
    'Critical control — barricade line of fire',
    'Critical control — confined space entry procedure',
];
const SIF_KEYWORDS = [
    'fall',
    'height',
    'confined',
    'energized',
    'lockout',
    'loto',
    'crane',
    'rigging',
    'line of fire',
    'excavation',
    'trench',
    'pressure',
    'crush',
];
let AuditInspectionCapaEngineService = class AuditInspectionCapaEngineService {
    constructor(prisma, deficiencyScoring) {
        this.prisma = prisma;
        this.deficiencyScoring = deficiencyScoring;
    }
    generate(input) {
        var _a;
        const items = this.normalizeItems(input);
        const findings = this.buildFindings(input, items);
        const capa_list = this.buildCapa(findings, input);
        const trends = this.analyzeTrends(findings, (_a = input.previous_audits) !== null && _a !== void 0 ? _a : []);
        const executive_summary = this.buildExecutiveSummary(input, findings, capa_list, trends);
        const field_brief = this.buildFieldBrief(findings, capa_list);
        return { findings, capa_list, executive_summary, field_brief, trends };
    }
    async buildInputFromInspection(inspectionId) {
        var _a, _b, _c, _d, _e;
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            include: {
                template: true,
                attachments: { select: { fileName: true, annotationJson: true } },
                deficiencies: { select: { title: true, itemId: true } },
            },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        const items = (_a = inspection.template.items) !== null && _a !== void 0 ? _a : [];
        const answers = (_b = inspection.answers) !== null && _b !== void 0 ? _b : {};
        const responses = items.map((item) => {
            const answer = answers[item.id];
            const status = this.answerToStatus(item, answer);
            const photoSummaries = inspection.attachments
                .filter((a) => {
                const ann = a.annotationJson;
                return (ann === null || ann === void 0 ? void 0 : ann.itemId) === item.id;
            })
                .map((a) => { var _a; return (_a = a.fileName) !== null && _a !== void 0 ? _a : 'Photo evidence'; });
            return {
                item_id: item.id,
                status,
                comments: typeof answer === 'object' &&
                    answer &&
                    'comment' in answer
                    ? String(answer.comment)
                    : typeof answer === 'string' && item.type === 'text'
                        ? answer
                        : undefined,
                photos_summaries: photoSummaries.length ? photoSummaries : undefined,
            };
        });
        const previous = await this.prisma.pmInspection.findMany({
            where: {
                projectId: inspection.projectId,
                templateId: inspection.templateId,
                deletedAt: null,
                id: { not: inspectionId },
                submittedAt: { not: null },
            },
            orderBy: { submittedAt: 'desc' },
            take: 5,
            select: { submittedAt: true, answers: true, passed: true, title: true },
        });
        const projectProfile = await this.prisma.pmProjectSafetyProfile.findFirst({
            where: { projectId: inspection.projectId },
        });
        const companyProfile = await this.prisma.pmCompanySafetyProfile.findFirst({
            where: { companyId: inspection.companyId },
        });
        const org_standards = [
            ...DEFAULT_ORG_STANDARDS,
            ...((_c = companyProfile === null || companyProfile === void 0 ? void 0 : companyProfile.policiesJson) !== null && _c !== void 0 ? _c : []).slice(0, 5),
        ];
        return {
            checklist_template: {
                items: items.map((i) => ({
                    id: i.id,
                    label: i.label,
                    category: inspection.template.category,
                    type: i.type,
                    required: i.required,
                    weight: i.weight,
                    critical: i.critical,
                    energyType: i.energyType,
                })),
                categories: [inspection.template.category],
                scoring_rules: (_d = inspection.template.scoringRules) !== null && _d !== void 0 ? _d : {},
            },
            responses,
            site_risk_profile: (_e = projectProfile === null || projectProfile === void 0 ? void 0 : projectProfile.riskLevel) !== null && _e !== void 0 ? _e : 'medium',
            previous_audits: previous.map((p) => {
                var _a, _b, _c;
                return ({
                    date: (_a = p.submittedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                    failed_items: this.failedItemIdsFromAnswers(items, (_b = p.answers) !== null && _b !== void 0 ? _b : {}),
                    summary: (_c = p.title) !== null && _c !== void 0 ? _c : (p.passed ? 'Passed' : 'Failed'),
                });
            }),
            org_standards,
            inspectionId,
            projectId: inspection.projectId,
            companyId: inspection.companyId,
        };
    }
    normalizeItems(input) {
        var _a, _b;
        const map = new Map();
        for (const item of (_a = input.checklist_template.items) !== null && _a !== void 0 ? _a : []) {
            map.set(item.id, {
                id: item.id,
                label: item.label,
                type: (_b = item.type) !== null && _b !== void 0 ? _b : 'pass_fail',
                required: item.required,
                weight: item.weight,
                critical: item.critical,
                energyType: item.energyType,
                category: item.category,
            });
        }
        return map;
    }
    buildFindings(input, items) {
        var _a, _b, _c, _d, _e;
        const findings = [];
        const standards = ((_a = input.org_standards) === null || _a === void 0 ? void 0 : _a.length)
            ? input.org_standards
            : DEFAULT_ORG_STANDARDS;
        const siteRisk = ((_b = input.site_risk_profile) !== null && _b !== void 0 ? _b : 'medium').toLowerCase();
        for (const response of input.responses) {
            if (!this.isNonCompliant(response))
                continue;
            const item = items.get(response.item_id);
            const label = (_c = item === null || item === void 0 ? void 0 : item.label) !== null && _c !== void 0 ? _c : response.item_id;
            const category = (_d = item === null || item === void 0 ? void 0 : item.category) !== null && _d !== void 0 ? _d : 'general';
            const description = [
                `${label} — ${response.status}`,
                response.comments ? `Comment: ${response.comments}` : null,
                ((_e = response.photos_summaries) === null || _e === void 0 ? void 0 : _e.length)
                    ? `Evidence: ${response.photos_summaries.join('; ')}`
                    : null,
            ]
                .filter(Boolean)
                .join('. ');
            const related_standard = this.matchStandard(label, standards);
            const likelihood = this.likelihoodFor(response, item, siteRisk);
            const consequence = this.consequenceFor(item, siteRisk);
            const score = likelihood * consequence;
            const level = this.riskLevel(score);
            const sif_relevance = this.isSifRelevant(item, label) ? 'yes' : 'no';
            findings.push({
                item_id: response.item_id,
                description,
                related_standard,
                risk_rating: { likelihood, consequence, score, level },
                sif_relevance,
                category,
            });
        }
        return findings.sort((a, b) => b.risk_rating.score - a.risk_rating.score);
    }
    buildCapa(findings, input) {
        const systemicCategories = this.systemicCategories(findings);
        return findings.map((f) => {
            var _a, _b;
            const severity = f.risk_rating.level === 'critical'
                ? 'critical'
                : f.risk_rating.level === 'high'
                    ? 'high'
                    : f.risk_rating.level === 'medium'
                        ? 'medium'
                        : 'low';
            const due_date_priority = severity === 'critical' || f.sif_relevance === 'yes'
                ? 'high'
                : severity === 'high'
                    ? 'medium'
                    : 'low';
            const preventive = systemicCategories.has((_a = f.category) !== null && _a !== void 0 ? _a : '') ||
                findings.filter((x) => x.category === f.category).length > 1
                ? `Review SMS procedure for ${(_b = f.category) !== null && _b !== void 0 ? _b : 'this hazard class'} and verify controls across site.`
                : undefined;
            return {
                finding_ref: f.item_id,
                corrective_action: `Correct ${f.description.split(' — ')[0]} and verify closure with evidence.`,
                preventive_action: preventive,
                responsible_role: this.ownerFor(f),
                due_date_priority,
            };
        });
    }
    analyzeTrends(findings, previous) {
        var _a, _b, _c;
        if (!(previous === null || previous === void 0 ? void 0 : previous.length))
            return [];
        const currentIds = new Set(findings.map((f) => f.item_id));
        const counts = new Map();
        for (const audit of previous) {
            for (const itemId of (_a = audit.failed_items) !== null && _a !== void 0 ? _a : []) {
                if (currentIds.has(itemId)) {
                    counts.set(itemId, ((_b = counts.get(itemId)) !== null && _b !== void 0 ? _b : 0) + 1);
                }
            }
        }
        const trends = [];
        for (const [itemId, count] of counts) {
            const finding = findings.find((f) => f.item_id === itemId);
            trends.push({
                issue: (_c = finding === null || finding === void 0 ? void 0 : finding.description.split(' — ')[0]) !== null && _c !== void 0 ? _c : itemId,
                recurrence_count: count + 1,
                note: `Recurring on ${count + 1} of ${previous.length + 1} recent audits — escalate CAPA verification.`,
            });
        }
        return trends.sort((a, b) => b.recurrence_count - a.recurrence_count);
    }
    buildExecutiveSummary(input, findings, capa, trends) {
        var _a;
        const total = input.responses.length;
        const failed = input.responses.filter((r) => this.isNonCompliant(r)).length;
        const sif = findings.filter((f) => f.sif_relevance === 'yes').length;
        const critical = findings.filter((f) => f.risk_rating.level === 'critical').length;
        const bullets = [
            `Audit completed: ${failed} of ${total} item(s) non-compliant or concerning.`,
            `Site risk profile: ${(_a = input.site_risk_profile) !== null && _a !== void 0 ? _a : 'not specified'}.`,
            `${findings.length} finding(s) generated; ${critical} critical, ${sif} with SIF relevance.`,
            `${capa.length} corrective action(s) proposed; ${capa.filter((c) => c.due_date_priority === 'high').length} high priority.`,
        ];
        if (trends.length) {
            bullets.push(`Recurring issues: ${trends
                .slice(0, 2)
                .map((t) => t.issue)
                .join('; ')}.`);
        }
        if (findings[0]) {
            bullets.push(`Top finding: ${findings[0].description.slice(0, 120)}.`);
        }
        bullets.push('Supervisor review and evidence upload required before close-out.');
        return bullets.slice(0, 10);
    }
    buildFieldBrief(findings, capa) {
        const brief = [
            findings.length
                ? `Today's audit flagged ${findings.length} item(s) — discuss controls before restart.`
                : 'No significant findings — confirm standards still understood by crew.',
        ];
        for (const f of findings
            .filter((x) => x.sif_relevance === 'yes')
            .slice(0, 2)) {
            brief.push(`SIF focus: ${f.description.split(' — ')[0]}.`);
        }
        for (const c of capa
            .filter((x) => x.due_date_priority === 'high')
            .slice(0, 2)) {
            brief.push(`Action: ${c.corrective_action}`);
        }
        brief.push('Verify permits, PPE, and barricades match the work plan.');
        return brief.slice(0, 5);
    }
    isNonCompliant(response) {
        const s = response.status.toLowerCase();
        return s === 'fail' || s === 'concern' || s === 'no' || s === 'false';
    }
    answerToStatus(item, answer) {
        var _a;
        if (item.type === 'pass_fail') {
            if (answer === false || answer === 'fail' || answer === 'no')
                return 'fail';
            if (answer === true || answer === 'pass' || answer === 'yes')
                return 'pass';
            return 'concern';
        }
        if (item.type === 'numeric' &&
            typeof answer === 'number' &&
            ((_a = item.failValues) === null || _a === void 0 ? void 0 : _a.includes(answer))) {
            return 'fail';
        }
        return 'pass';
    }
    failedItemIdsFromAnswers(items, answers) {
        return items
            .filter((item) => {
            const status = this.answerToStatus(item, answers[item.id]);
            return this.isNonCompliant({ item_id: item.id, status });
        })
            .map((i) => i.id);
    }
    matchStandard(label, standards) {
        var _a;
        const lower = label.toLowerCase();
        for (const std of standards) {
            const tokens = std
                .toLowerCase()
                .split(/\s+/)
                .filter((t) => t.length > 4);
            if (tokens.some((t) => lower.includes(t)))
                return std;
        }
        return (_a = standards[0]) !== null && _a !== void 0 ? _a : 'Organizational safety standard';
    }
    likelihoodFor(response, item, siteRisk) {
        let l = response.status === 'fail' ? 4 : 3;
        if (item === null || item === void 0 ? void 0 : item.required)
            l += 1;
        if (siteRisk === 'high' || siteRisk === 'critical')
            l += 1;
        return Math.min(l, 5);
    }
    consequenceFor(item, siteRisk) {
        var _a;
        if (!item)
            return 3;
        const templateCategory = (_a = item.category) !== null && _a !== void 0 ? _a : 'general';
        const severity = this.deficiencyScoring.severityForFailedItem(item, templateCategory);
        const base = severity === 'critical'
            ? 5
            : severity === 'high'
                ? 4
                : severity === 'medium'
                    ? 3
                    : 2;
        if (siteRisk === 'critical')
            return Math.min(base + 1, 5);
        return base;
    }
    riskLevel(score) {
        if (score >= 20)
            return 'critical';
        if (score >= 12)
            return 'high';
        if (score >= 6)
            return 'medium';
        return 'low';
    }
    isSifRelevant(item, label) {
        var _a;
        if ((item === null || item === void 0 ? void 0 : item.critical) || (item === null || item === void 0 ? void 0 : item.energyType))
            return true;
        const text = `${label} ${(_a = item === null || item === void 0 ? void 0 : item.energyType) !== null && _a !== void 0 ? _a : ''}`.toLowerCase();
        return SIF_KEYWORDS.some((k) => text.includes(k));
    }
    systemicCategories(findings) {
        var _a, _b;
        const counts = new Map();
        for (const f of findings) {
            const c = (_a = f.category) !== null && _a !== void 0 ? _a : 'general';
            counts.set(c, ((_b = counts.get(c)) !== null && _b !== void 0 ? _b : 0) + 1);
        }
        return new Set([...counts.entries()].filter(([, n]) => n >= 2).map(([c]) => c));
    }
    ownerFor(finding) {
        if (finding.sif_relevance === 'yes')
            return 'Site superintendent';
        if (finding.risk_rating.level === 'critical' ||
            finding.risk_rating.level === 'high') {
            return 'HSE coordinator';
        }
        if (finding.category === 'HOUSEKEEPING')
            return 'Supervisor';
        return 'Assigned owner';
    }
};
exports.AuditInspectionCapaEngineService = AuditInspectionCapaEngineService;
exports.AuditInspectionCapaEngineService = AuditInspectionCapaEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        deficiency_scoring_engine_1.DeficiencyScoringEngine])
], AuditInspectionCapaEngineService);
//# sourceMappingURL=audit-inspection-capa-engine.service.js.map