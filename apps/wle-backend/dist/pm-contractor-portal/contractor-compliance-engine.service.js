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
exports.ContractorComplianceEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_ORG_REQUIREMENTS = [
    {
        code: 'safety_policy',
        label: 'Corporate safety policy',
        category: 'policy',
        required: true,
    },
    {
        code: 'hse_program',
        label: 'HSE management program (COR, ISO 45001, or equivalent)',
        category: 'certification',
        required: true,
    },
    {
        code: 'wcb',
        label: 'Workers compensation / WCB clearance',
        category: 'insurance',
        required: true,
    },
    {
        code: 'liability_insurance',
        label: 'Commercial liability insurance',
        category: 'insurance',
        required: true,
    },
    {
        code: 'training_records',
        label: 'Worker training and competency records',
        category: 'training',
        required: true,
    },
    {
        code: 'incident_reporting',
        label: 'Incident reporting and investigation procedure',
        category: 'procedure',
        required: true,
    },
    {
        code: 'emergency_response',
        label: 'Emergency response plan',
        category: 'procedure',
        required: true,
    },
    {
        code: 'subcontractor_mgmt',
        label: 'Subcontractor management procedure',
        category: 'procedure',
        required: false,
    },
];
const REQUIREMENT_KEYWORDS = {
    safety_policy: [
        'safety policy',
        'hse policy',
        'health and safety policy',
        'policy',
    ],
    hse_program: [
        'cor',
        'iso 45001',
        'iso45001',
        'safety program',
        'sms',
        'management system',
    ],
    wcb: ['wcb', 'workers comp', 'workers compensation', 'worksafe'],
    liability_insurance: [
        'insurance',
        'liability',
        'coi',
        'certificate of insurance',
    ],
    training_records: [
        'training',
        'competency',
        'orientation',
        'certification record',
    ],
    incident_reporting: ['incident', 'investigation', 'reporting procedure'],
    emergency_response: ['emergency', 'erp', 'spill response', 'evacuation'],
    subcontractor_mgmt: ['subcontractor', 'vendor', 'prequalification'],
};
const HIGH_RISK_SCOPE_KEYWORDS = [
    'height',
    'scaffold',
    'roof',
    'confined space',
    'excavation',
    'trench',
    'energized',
    'electrical',
    'hot work',
    'welding',
    'lifting',
    'rigging',
    'crane',
    'demolition',
    'hazmat',
    'asbestos',
    'lead',
    'pressure',
    'pipeline',
    'night shift',
    'remote',
];
let ContractorComplianceEngineService = class ContractorComplianceEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generate(input) {
        var _a, _b;
        const risk_profile = this.assessRiskProfile(input.work_scope);
        const compliance_gaps = this.findComplianceGaps(input);
        const performance_assessment = this.assessPerformance(input.safety_stats, (_a = input.incident_history) !== null && _a !== void 0 ? _a : [], (_b = input.audit_results) !== null && _b !== void 0 ? _b : []);
        const approval_status = this.decideApproval(risk_profile, compliance_gaps, performance_assessment);
        const conditions = this.buildConditions(risk_profile, compliance_gaps, performance_assessment, approval_status);
        const contractor_feedback = this.buildContractorFeedback(compliance_gaps, conditions, approval_status);
        const internal_summary = this.buildInternalSummary(input, risk_profile, compliance_gaps, performance_assessment, approval_status);
        return {
            risk_profile,
            compliance_gaps,
            performance_assessment,
            approval_status,
            conditions,
            contractor_feedback,
            internal_summary,
        };
    }
    async buildInputFromMembership(membershipId, workScope) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const membership = await this.prisma.pmContractorPortalMembership.findUnique({
            where: { id: membershipId },
            include: {
                contractorCompany: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        });
        if (!membership)
            throw new common_1.NotFoundException('Membership not found');
        const contractorCompanyId = membership.contractorCompanyId;
        const workerIds = (await this.prisma.worker.findMany({
            where: { companyId: contractorCompanyId },
            select: { id: true },
            take: 500,
        })).map((w) => w.id);
        const now = new Date();
        const [profile, trainingRecords, credentials, deficiencies, safetyEvents, equipmentAudits,] = await Promise.all([
            this.prisma.pmCompanySafetyProfile.findUnique({
                where: { companyId: contractorCompanyId },
            }),
            this.prisma.trainingRecord.findMany({
                where: { workerId: { in: workerIds.length ? workerIds : [-1] } },
                include: { certification: { select: { name: true } } },
                take: 100,
            }),
            this.prisma.credential.findMany({
                where: { workerId: { in: workerIds.length ? workerIds : [-1] } },
                include: { certification: { select: { name: true } } },
                take: 100,
            }),
            this.prisma.pmInspectionDeficiency.findMany({
                where: Object.assign({ subcontractorCompanyId: contractorCompanyId }, (membership.projectId
                    ? { inspection: { projectId: membership.projectId } }
                    : {})),
                include: { inspection: { select: { submittedAt: true } } },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
            this.prisma.pmSafetyEvent.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { companyId: contractorCompanyId },
                        ...(membership.projectId
                            ? [{ projectId: membership.projectId }]
                            : []),
                    ],
                },
                orderBy: { occurredAt: 'desc' },
                take: 30,
            }),
            this.prisma.companyEquipmentAuditView.findMany({
                where: { companyId: contractorCompanyId },
                take: 50,
            }),
        ]);
        const submitted_documents = [];
        if ((profile === null || profile === void 0 ? void 0 : profile.status) === 'published') {
            submitted_documents.push({
                type: 'policy',
                name: 'Company safety profile (published)',
                status: 'current',
            });
        }
        for (const t of trainingRecords.slice(0, 20)) {
            submitted_documents.push({
                type: 'training',
                name: (_b = (_a = t.certification) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Training record',
                status: t.expiresAt && t.expiresAt < now ? 'expired' : 'current',
                expires_at: (_c = t.expiresAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
            });
        }
        for (const c of credentials.slice(0, 20)) {
            submitted_documents.push({
                type: 'certification',
                name: (_e = (_d = c.certification) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : 'Credential',
                status: c.expiresAt && c.expiresAt < now ? 'expired' : 'current',
                expires_at: (_f = c.expiresAt) === null || _f === void 0 ? void 0 : _f.toISOString(),
            });
        }
        for (const e of equipmentAudits.filter((x) => !x.preUseCompliant7d || !x.formalCompliant)) {
            submitted_documents.push({
                type: 'equipment',
                name: `Equipment audit gap #${e.equipmentId}`,
                status: 'partial',
            });
        }
        const certifications_and_programs = [];
        if ((profile === null || profile === void 0 ? void 0 : profile.status) === 'published')
            certifications_and_programs.push('Published company safety profile');
        if (profile === null || profile === void 0 ? void 0 : profile.corporateRiskLevel) {
            certifications_and_programs.push(`Corporate risk level: ${profile.corporateRiskLevel}`);
        }
        const audit_results = deficiencies.map((d) => {
            var _a, _b, _c;
            return ({
                date: (_b = (_a = d.inspection) === null || _a === void 0 ? void 0 : _a.submittedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                score: d.severity === 'critical' ? 40 : d.severity === 'high' ? 55 : 70,
                findings: [d.title, (_c = d.description) !== null && _c !== void 0 ? _c : ''].filter(Boolean),
            });
        });
        const incident_history = safetyEvents.map((e) => ({
            date: e.occurredAt.toISOString(),
            type: e.eventType,
            severity: e.severity,
            summary: e.title,
        }));
        const client_specific_requirements = [];
        if (membership.projectId) {
            const projectProfile = await this.prisma.pmProjectSafetyProfile.findFirst({
                where: { projectId: membership.projectId },
            });
            if ((projectProfile === null || projectProfile === void 0 ? void 0 : projectProfile.riskLevel) === 'high' ||
                (projectProfile === null || projectProfile === void 0 ? void 0 : projectProfile.riskLevel) === 'critical') {
                client_specific_requirements.push('Enhanced HSE oversight for high-risk project');
            }
            const requiredTraining = projectProfile === null || projectProfile === void 0 ? void 0 : projectProfile.requiredTraining;
            if (requiredTraining === null || requiredTraining === void 0 ? void 0 : requiredTraining.length) {
                client_specific_requirements.push(`Project-required training: ${requiredTraining
                    .slice(0, 5)
                    .join(', ')}`);
            }
        }
        return {
            contractor_profile: {
                name: membership.contractorCompany.name,
                size: workerIds.length > 100
                    ? 'large'
                    : workerIds.length > 25
                        ? 'medium'
                        : 'small',
            },
            safety_stats: {
                TRIF: this.estimateTrif(safetyEvents.length, workerIds.length),
                recordable_rate: safetyEvents.length,
                year: now.getFullYear(),
            },
            certifications_and_programs,
            submitted_documents,
            audit_results,
            incident_history,
            client_specific_requirements,
            work_scope: workScope !== null && workScope !== void 0 ? workScope : {
                tasks: ['General construction / maintenance'],
                risk_profile: (_g = profile === null || profile === void 0 ? void 0 : profile.corporateRiskLevel) !== null && _g !== void 0 ? _g : 'medium',
                location: (_h = membership.project) === null || _h === void 0 ? void 0 : _h.name,
                duration: 'Project duration',
            },
            primeCompanyId: membership.primeCompanyId,
            contractorCompanyId,
            projectId: (_j = membership.projectId) !== null && _j !== void 0 ? _j : undefined,
        };
    }
    estimateTrif(incidents, workers) {
        if (!workers)
            return undefined;
        const hours = workers * 2000;
        if (!hours)
            return undefined;
        return Math.round((incidents / hours) * 200000 * 10) / 10;
    }
    assessRiskProfile(workScope) {
        var _a, _b, _c, _d, _e, _f;
        const text = [
            ...((_a = workScope.tasks) !== null && _a !== void 0 ? _a : []),
            workScope.risk_profile,
            workScope.location,
            workScope.duration,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const risk_factors = HIGH_RISK_SCOPE_KEYWORDS.filter((k) => text.includes(k));
        let risk_score = 20;
        if ((_b = workScope.risk_profile) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('high'))
            risk_score += 25;
        if ((_c = workScope.risk_profile) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('critical'))
            risk_score += 40;
        risk_score += Math.min(risk_factors.length * 12, 48);
        if (((_e = (_d = workScope.tasks) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 5)
            risk_score += 8;
        let inherent_risk_level = 'low';
        if (risk_score >= 75)
            inherent_risk_level = 'critical';
        else if (risk_score >= 55)
            inherent_risk_level = 'high';
        else if (risk_score >= 35)
            inherent_risk_level = 'medium';
        const sif_exposure = risk_factors.some((f) => [
            'height',
            'scaffold',
            'confined space',
            'lifting',
            'crane',
            'energized',
            'electrical',
            'excavation',
        ].includes(f));
        return {
            inherent_risk_level,
            risk_score: Math.min(risk_score, 100),
            risk_factors: risk_factors.length
                ? risk_factors
                : [
                    'Standard construction/maintenance scope — verify task-level hazards',
                ],
            sif_exposure,
            work_scope_summary: [
                ((_f = workScope.tasks) === null || _f === void 0 ? void 0 : _f.length) ? `Tasks: ${workScope.tasks.join('; ')}` : null,
                workScope.location ? `Location: ${workScope.location}` : null,
                workScope.duration ? `Duration: ${workScope.duration}` : null,
            ]
                .filter(Boolean)
                .join(' · '),
        };
    }
    findComplianceGaps(input) {
        var _a, _b, _c, _d, _e, _f;
        const gaps = [];
        const orgReqs = ((_a = input.org_minimum_requirements) === null || _a === void 0 ? void 0 : _a.length)
            ? input.org_minimum_requirements
            : DEFAULT_ORG_REQUIREMENTS;
        const docs = (_b = input.submitted_documents) !== null && _b !== void 0 ? _b : [];
        const certs = ((_c = input.certifications_and_programs) !== null && _c !== void 0 ? _c : []).map((c) => c.toLowerCase());
        for (const req of orgReqs) {
            const match = this.matchRequirement(req, docs, certs);
            if (!match.found) {
                gaps.push({
                    requirement: req.label,
                    status: 'missing',
                    category: (_d = req.category) !== null && _d !== void 0 ? _d : 'general',
                    priority: req.required === false ? 'medium' : 'high',
                    remediation: `Submit ${req.label.toLowerCase()} before mobilization.`,
                });
            }
            else if (match.weak) {
                gaps.push({
                    requirement: req.label,
                    status: match.expired
                        ? 'expired'
                        : match.partial
                            ? 'partial'
                            : 'weak',
                    category: (_e = req.category) !== null && _e !== void 0 ? _e : 'general',
                    priority: req.required === false ? 'low' : 'high',
                    remediation: match.expired
                        ? `Renew or replace expired ${req.label.toLowerCase()}.`
                        : `Strengthen documentation for ${req.label.toLowerCase()}.`,
                });
            }
        }
        for (const clientReq of (_f = input.client_specific_requirements) !== null && _f !== void 0 ? _f : []) {
            const covered = this.textCoveredByDocuments(clientReq, docs, certs);
            if (!covered) {
                gaps.push({
                    requirement: clientReq,
                    status: 'missing',
                    category: 'client',
                    priority: 'high',
                    remediation: `Address client requirement: ${clientReq}`,
                });
            }
        }
        return gaps;
    }
    matchRequirement(req, docs, certs) {
        var _a;
        const keywords = (_a = REQUIREMENT_KEYWORDS[req.code]) !== null && _a !== void 0 ? _a : [
            req.label.toLowerCase(),
        ];
        const hits = docs.filter((d) => {
            var _a, _b;
            const text = `${d.type} ${(_a = d.name) !== null && _a !== void 0 ? _a : ''} ${(_b = d.notes) !== null && _b !== void 0 ? _b : ''}`.toLowerCase();
            return keywords.some((k) => text.includes(k));
        });
        const certHit = certs.some((c) => keywords.some((k) => c.includes(k)));
        if (!hits.length && !certHit) {
            return { found: false, weak: false, expired: false, partial: false };
        }
        const expired = hits.some((h) => h.status === 'expired');
        const partial = hits.some((h) => h.status === 'partial' || h.status === 'draft');
        const weak = expired || partial || hits.every((h) => h.status === 'draft');
        return { found: true, weak, expired, partial };
    }
    textCoveredByDocuments(requirement, docs, certs) {
        const needle = requirement.toLowerCase();
        const inDocs = docs.some((d) => {
            var _a;
            return `${d.type} ${(_a = d.name) !== null && _a !== void 0 ? _a : ''}`
                .toLowerCase()
                .includes(needle.slice(0, Math.min(needle.length, 12)));
        });
        const inCerts = certs.some((c) => c.includes(needle.slice(0, Math.min(needle.length, 12))));
        return inDocs || inCerts;
    }
    assessPerformance(stats, incidents, audits) {
        const stats_rating = this.rateStats(stats);
        const incident_trend = this.rateIncidentTrend(incidents);
        const audit_rating = this.rateAudits(audits);
        const ratings = [
            stats_rating,
            incident_trend === 'deteriorating' ? 'concerning' : stats_rating,
            audit_rating,
        ];
        let overall_performance = 'acceptable';
        if (ratings.includes('concerning') || incident_trend === 'deteriorating') {
            overall_performance = 'concerning';
        }
        else if (ratings.every((r) => r === 'strong' || r === 'unknown') &&
            incident_trend === 'improving') {
            overall_performance = 'strong';
        }
        return {
            stats_rating,
            stats_notes: this.statsNotes(stats, stats_rating),
            incident_trend,
            incident_notes: this.incidentNotes(incidents, incident_trend),
            audit_rating,
            audit_notes: this.auditNotes(audits, audit_rating),
            overall_performance,
        };
    }
    rateStats(stats) {
        var _a, _b;
        if (!stats ||
            (stats.TRIF == null && stats.LTIF == null && stats.DART == null)) {
            return 'unknown';
        }
        const trif = (_a = stats.TRIF) !== null && _a !== void 0 ? _a : 0;
        const ltif = (_b = stats.LTIF) !== null && _b !== void 0 ? _b : 0;
        if (trif > 3 || ltif > 1.5)
            return 'concerning';
        if (trif <= 1 && ltif <= 0.5)
            return 'strong';
        return 'acceptable';
    }
    statsNotes(stats, rating) {
        if (!stats)
            return 'No lagging indicators supplied — request TRIF/LTIF/DART for benchmark comparison.';
        const parts = [];
        if (stats.TRIF != null)
            parts.push(`TRIF ${stats.TRIF}`);
        if (stats.LTIF != null)
            parts.push(`LTIF ${stats.LTIF}`);
        if (stats.DART != null)
            parts.push(`DART ${stats.DART}`);
        return `${parts.join(', ')} — qualitative rating: ${rating} vs typical construction benchmarks.`;
    }
    rateIncidentTrend(incidents) {
        if (incidents.length < 2)
            return incidents.length ? 'stable' : 'unknown';
        const sorted = [...incidents].sort((a, b) => { var _a, _b; return new Date((_a = b.date) !== null && _a !== void 0 ? _a : 0).getTime() - new Date((_b = a.date) !== null && _b !== void 0 ? _b : 0).getTime(); });
        const recent = sorted.slice(0, Math.ceil(sorted.length / 2));
        const older = sorted.slice(Math.ceil(sorted.length / 2));
        const severityWeight = (s) => s === 'critical' ? 4 : s === 'high' ? 3 : s === 'medium' ? 2 : 1;
        const recentScore = recent.reduce((n, i) => n + severityWeight(i.severity), 0);
        const olderScore = older.reduce((n, i) => n + severityWeight(i.severity), 0);
        if (recentScore > olderScore * 1.25)
            return 'deteriorating';
        if (recentScore < olderScore * 0.75)
            return 'improving';
        return 'stable';
    }
    incidentNotes(incidents, trend) {
        if (!incidents.length)
            return 'No incident history provided.';
        const high = incidents.filter((i) => i.severity === 'high' || i.severity === 'critical').length;
        return `${incidents.length} recorded event(s); ${high} high/critical. Trend: ${trend}.`;
    }
    rateAudits(audits) {
        if (!audits.length)
            return 'unknown';
        const avg = audits.reduce((n, a) => { var _a; return n + ((_a = a.score) !== null && _a !== void 0 ? _a : 70); }, 0) / audits.length;
        if (avg < 60)
            return 'concerning';
        if (avg >= 85)
            return 'strong';
        return 'acceptable';
    }
    auditNotes(audits, rating) {
        if (!audits.length)
            return 'No audit or inspection findings on file.';
        const openFindings = audits.flatMap((a) => { var _a; return (_a = a.findings) !== null && _a !== void 0 ? _a : []; }).length;
        return `${audits.length} audit/inspection record(s); ${openFindings} finding reference(s). Rating: ${rating}.`;
    }
    decideApproval(risk, gaps, performance) {
        const highGaps = gaps.filter((g) => g.priority === 'high').length;
        const missingRequired = gaps.filter((g) => g.status === 'missing' && g.priority === 'high').length;
        if (missingRequired >= 3 ||
            (risk.inherent_risk_level === 'critical' && highGaps >= 2) ||
            (performance.overall_performance === 'concerning' && highGaps >= 2)) {
            return 'reject';
        }
        if (highGaps > 0 ||
            risk.inherent_risk_level === 'high' ||
            risk.inherent_risk_level === 'critical' ||
            performance.overall_performance === 'concerning' ||
            performance.incident_trend === 'deteriorating') {
            return 'conditional';
        }
        return 'approve';
    }
    buildConditions(risk, gaps, performance, approval) {
        const conditions = [];
        for (const gap of gaps.filter((g) => g.priority === 'high').slice(0, 5)) {
            conditions.push({
                type: 'documentation',
                description: gap.remediation,
                priority: 'high',
            });
        }
        if (risk.sif_exposure || risk.inherent_risk_level === 'critical') {
            conditions.push({
                type: 'supervision',
                description: 'Dedicated HSE oversight and daily pre-task briefings for SIF-prone work',
                priority: 'high',
            });
        }
        if (risk.inherent_risk_level === 'high' ||
            risk.inherent_risk_level === 'critical') {
            conditions.push({
                type: 'limited_scope',
                description: 'Phase mobilization — limit to approved work packages until gap closure verified',
                priority: 'medium',
            });
        }
        if (performance.incident_trend === 'deteriorating' ||
            performance.overall_performance === 'concerning') {
            conditions.push({
                type: 'audit',
                description: 'Targeted safety audit within 30 days of mobilization',
                priority: 'high',
            });
            conditions.push({
                type: 'training',
                description: 'Refresher training for supervisors and crews on hazard controls for assigned scope',
                priority: 'medium',
            });
        }
        if (approval === 'approve' && !conditions.length) {
            conditions.push({
                type: 'monitoring',
                description: 'Standard quarterly compliance review and incident reporting',
                priority: 'low',
            });
        }
        return conditions.slice(0, 8);
    }
    buildContractorFeedback(gaps, conditions, approval) {
        const statusLine = approval === 'approve'
            ? 'Your submission meets minimum requirements for approval.'
            : approval === 'conditional'
                ? 'Conditional approval is recommended pending the actions below.'
                : 'Approval is not recommended until significant gaps are addressed.';
        const gapLines = gaps.length > 0
            ? `Gaps identified: ${gaps
                .slice(0, 5)
                .map((g) => `${g.requirement} (${g.status})`)
                .join('; ')}.`
            : 'No major documentation gaps identified.';
        const actionLines = conditions.length > 0
            ? `Required actions: ${conditions
                .slice(0, 5)
                .map((c) => c.description)
                .join(' ')}`
            : '';
        return [statusLine, gapLines, actionLines].filter(Boolean).join(' ');
    }
    buildInternalSummary(input, risk, gaps, performance, approval) {
        var _a, _b;
        const name = (_a = input.contractor_profile.name) !== null && _a !== void 0 ? _a : 'Contractor';
        return [
            `${name}: ${approval.toUpperCase()} — inherent risk ${risk.inherent_risk_level} (score ${risk.risk_score}).`,
            `${gaps.length} compliance gap(s); performance ${performance.overall_performance}; incident trend ${performance.incident_trend}.`,
            risk.sif_exposure
                ? 'SIF exposure flagged — enforce enhanced controls.'
                : null,
            ((_b = input.work_scope.tasks) === null || _b === void 0 ? void 0 : _b.length)
                ? `Scope: ${input.work_scope.tasks.slice(0, 3).join(', ')}.`
                : null,
        ]
            .filter(Boolean)
            .join(' ');
    }
};
exports.ContractorComplianceEngineService = ContractorComplianceEngineService;
exports.ContractorComplianceEngineService = ContractorComplianceEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractorComplianceEngineService);
//# sourceMappingURL=contractor-compliance-engine.service.js.map