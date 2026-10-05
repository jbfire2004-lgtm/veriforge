"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSafetyKnowledge = evaluateSafetyKnowledge;
function domainStatus(score) {
    if (score >= 85)
        return 'Proficient';
    if (score >= 65)
        return 'Developing';
    return 'Deficient';
}
function overallStatus(score) {
    if (score >= 85)
        return 'Proficient';
    if (score >= 65)
        return 'Developing';
    return 'Deficient';
}
function trainingDomainScore(required, records) {
    if (required.length === 0) {
        return { score: 75, gaps: ['No company training requirements configured'] };
    }
    const gaps = [];
    let earned = 0;
    for (const req of required) {
        const match = records.find((r) => r.courseCode.toUpperCase() === req.code.toUpperCase());
        if (!match) {
            gaps.push(`Missing knowledge evidence: ${req.name}`);
            continue;
        }
        if (match.expired) {
            gaps.push(`Expired: ${req.name}`);
            continue;
        }
        if (!match.verified) {
            gaps.push(`Unverified: ${req.name}`);
            earned += 0.5;
            continue;
        }
        if (match.expiringSoon) {
            gaps.push(`Expiring soon: ${req.name}`);
            earned += 0.85;
            continue;
        }
        earned += 1;
    }
    return {
        score: Math.round((earned / required.length) * 100),
        gaps,
    };
}
function evaluateSafetyKnowledge(input) {
    var _a;
    const training = trainingDomainScore(input.requiredCourses, input.trainingRecords);
    const orientationScore = input.orientationComplete ? 100 : 40;
    const orientationGaps = input.orientationComplete
        ? []
        : ['Site orientation not completed or not recorded'];
    const policyScore = input.policyAcknowledgments.required === 0
        ? 80
        : Math.round((input.policyAcknowledgments.completed /
            input.policyAcknowledgments.required) *
            100);
    const policyGaps = policyScore >= 100
        ? []
        : [
            `${input.policyAcknowledgments.required -
                input.policyAcknowledgments.completed} policy acknowledgment(s) outstanding`,
        ];
    const fieldTotal = input.fieldActivity.flhaCount90d +
        input.fieldActivity.bboCount90d +
        input.fieldActivity.inspections90d;
    let fieldScore = 50;
    const fieldGaps = [];
    if (fieldTotal >= 10)
        fieldScore = 95;
    else if (fieldTotal >= 3)
        fieldScore = 75;
    else if (fieldTotal >= 1)
        fieldScore = 60;
    else
        fieldGaps.push('No FLHA, BBO, or inspection activity in last 90 days');
    const domains = [
        {
            domain: 'CompanyTraining',
            score: training.score,
            status: domainStatus(training.score),
            gaps: training.gaps.slice(0, 8),
        },
        {
            domain: 'SiteOrientation',
            score: orientationScore,
            status: domainStatus(orientationScore),
            gaps: orientationGaps,
        },
        {
            domain: 'PolicyAcknowledgment',
            score: policyScore,
            status: domainStatus(policyScore),
            gaps: policyGaps,
        },
        {
            domain: 'FieldSafetyPractice',
            score: fieldScore,
            status: domainStatus(fieldScore),
            gaps: fieldGaps,
        },
    ];
    const overallScore = Math.round(domains.reduce((s, d) => s + d.score, 0) / domains.length);
    const recommendations = [];
    for (const d of domains) {
        if (d.status === 'Deficient') {
            recommendations.push(`Address ${d.domain}: ${(_a = d.gaps[0]) !== null && _a !== void 0 ? _a : 'close knowledge gaps'}`);
        }
    }
    return {
        workerId: input.worker.id,
        overallScore,
        overallStatus: overallStatus(overallScore),
        domains,
        recommendations,
    };
}
//# sourceMappingURL=safety-knowledge.engine.js.map