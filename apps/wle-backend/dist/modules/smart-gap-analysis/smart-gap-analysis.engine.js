"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSmartGapAnalysis = evaluateSmartGapAnalysis;
const CATEGORY_WEIGHTS = {
    Policy: 0.25,
    Procedure: 0.25,
    Training: 0.25,
    FieldPractice: 0.15,
    Records: 0.1,
};
const EVIDENCE_LIMITED_SCORE = 60;
const PRIORITY_RANK = {
    High: 0,
    Medium: 1,
    Low: 2,
};
function overallStatusFromGapScore(score) {
    if (score >= 85)
        return 'Acceptable';
    if (score >= 70)
        return 'ConditionallyAcceptable';
    return 'NotAcceptable';
}
function average(nums) {
    if (nums.length === 0)
        return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
function policyScoreFromSpce(results) {
    const scores = results.filter((r) => r.type === 'Policy').map((r) => r.score);
    const avg = average(scores);
    if (avg == null) {
        return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
    }
    return { score: avg };
}
function procedureScoreFromSpce(results) {
    const scores = results
        .filter((r) => r.type === 'Procedure')
        .map((r) => r.score);
    const avg = average(scores);
    if (avg == null) {
        return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
    }
    return { score: avg };
}
function recordsScoreFromSpce(results, field) {
    var _a;
    const scores = results
        .filter((r) => r.type === 'Recordkeeping')
        .map((r) => r.score);
    let base = average(scores);
    if (base == null) {
        base = EVIDENCE_LIMITED_SCORE;
    }
    const overdue = (_a = field === null || field === void 0 ? void 0 : field.overdueCorrectiveActions) !== null && _a !== void 0 ? _a : 0;
    let adjusted = base;
    if (overdue >= 5)
        adjusted = Math.max(0, base - 20);
    else if (overdue >= 2)
        adjusted = Math.max(0, base - 10);
    const note = scores.length === 0
        ? 'EvidenceLimited'
        : overdue > 0
            ? `Adjusted down for ${overdue} overdue corrective action(s)`
            : undefined;
    return { score: adjusted, note };
}
function trainingScoreFromTae(taeResults) {
    if (taeResults.length === 0) {
        return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
    }
    const avg = average(taeResults.map((t) => t.overallScore));
    return { score: avg !== null && avg !== void 0 ? avg : EVIDENCE_LIMITED_SCORE };
}
function fieldPracticeScoreFromSummary(field) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!field) {
        return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
    }
    let score = 100;
    const notes = [];
    const jha = (_a = field.jhaCountLast90Days) !== null && _a !== void 0 ? _a : 0;
    const flha = (_b = field.flhaCountLast90Days) !== null && _b !== void 0 ? _b : 0;
    const inspections = (_c = field.inspectionCountLast90Days) !== null && _c !== void 0 ? _c : 0;
    const activityTotal = jha + flha + inspections;
    const expected = (_d = field.expectedJhaPer90Days) !== null && _d !== void 0 ? _d : (field.workerCount != null ? Math.max(10, field.workerCount * 2) : null);
    if (expected != null && activityTotal < expected * 0.5) {
        score -= 15;
        notes.push('Low proactive field activity vs expected benchmark');
    }
    else if (activityTotal === 0) {
        score -= 25;
        notes.push('No JHA/FLHA/inspection activity reported');
    }
    const incidents = (_e = field.incidentCountLast90Days) !== null && _e !== void 0 ? _e : 0;
    if (incidents >= 5) {
        score -= 20;
        notes.push('Elevated incident rate (90d)');
    }
    else if (incidents >= 2) {
        score -= 8;
        notes.push('Moderate incident count (90d)');
    }
    const highSev = (_f = field.highSeverityIncidentsLast12Months) !== null && _f !== void 0 ? _f : 0;
    if (highSev >= 2) {
        score -= 25;
        notes.push('Multiple high-severity incidents (12mo)');
    }
    else if (highSev >= 1) {
        score -= 12;
        notes.push('High-severity incident in last 12 months');
    }
    const overdue = (_g = field.overdueCorrectiveActions) !== null && _g !== void 0 ? _g : 0;
    if (overdue >= 5) {
        score -= 20;
        notes.push('Many overdue corrective actions');
    }
    else if (overdue >= 1) {
        score -= 5 * overdue;
        notes.push(`${overdue} overdue corrective action(s)`);
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    return {
        score,
        note: notes.length ? notes.join('; ') : undefined,
    };
}
function legislativeCompliance(spceResults, taeResults) {
    const spceReferenced = spceResults.filter((r) => r.legislationStatus === 'Referenced').length;
    const spceNotRef = spceResults.filter((r) => r.legislationStatus === 'NotReferenced').length;
    const taeLeg = taeResults.flatMap((t) => t.requirementResults.filter((r) => r.requirementType === 'Legislative'));
    const taeMet = taeLeg.filter((r) => r.status === 'Met').length;
    const taeNotMet = taeLeg.filter((r) => r.status === 'NotMet').length;
    let assessment = 'Moderate';
    if (spceNotRef === 0 && taeNotMet === 0 && spceReferenced + taeMet > 0) {
        assessment = 'Strong';
    }
    else if (spceNotRef + taeNotMet > spceReferenced + taeMet ||
        taeNotMet >= 2) {
        assessment = 'Weak';
    }
    const notes = [
        `SPCE: ${spceReferenced} referenced, ${spceNotRef} not referenced legislative items`,
        `TAE: ${taeMet}/${taeLeg.length} legislative requirements met`,
    ].join('. ');
    return { assessment, notes };
}
function hiringClientCompliance(spceOverall, spceStatus, taeResults) {
    var _a;
    const taeAvg = (_a = average(taeResults.map((t) => t.overallScore))) !== null && _a !== void 0 ? _a : EVIDENCE_LIMITED_SCORE;
    const taeNonCompliant = taeResults.filter((t) => t.overallStatus === 'NonCompliant').length;
    let assessment = 'Moderate';
    if (spceOverall >= 85 && taeAvg >= 85 && taeNonCompliant === 0) {
        assessment = 'Strong';
    }
    else if (spceOverall < 70 || taeAvg < 70 || taeNonCompliant > 0) {
        assessment = 'Weak';
    }
    const notes = `SPCE program score ${spceOverall} (${spceStatus}); TAE worker average ${taeAvg} (${taeResults.length} worker(s) assessed).`;
    return { assessment, notes };
}
function mapSpceCategory(type) {
    switch (type) {
        case 'Policy':
            return 'Policy';
        case 'Procedure':
            return 'Procedure';
        case 'Recordkeeping':
            return 'Records';
        case 'Form':
        case 'TrainingConfig':
            return 'Procedure';
        default:
            return 'Policy';
    }
}
function buildRoadmap(input) {
    const items = [];
    let idx = 0;
    for (const ca of input.spceResults.correctiveActions) {
        items.push({
            id: `CAR-SPCE-${idx++}`,
            sourceEngine: 'SPCE',
            category: mapSpceCategory(ca.category),
            description: ca.description,
            priority: ca.priority,
            recommendedDueDays: ca.recommendedDueDays,
            blockingForOnboarding: ca.blockingForPrequalification,
        });
    }
    for (const tae of input.taeResults) {
        for (const ca of tae.correctiveActions) {
            items.push({
                id: `CAR-TAE-${idx++}`,
                sourceEngine: 'TAE',
                category: 'Training',
                description: ca.description,
                priority: ca.priority,
                recommendedDueDays: ca.recommendedDueDays,
                blockingForOnboarding: ca.blockingForSiteAccess,
            });
        }
    }
    items.sort((a, b) => {
        var _a, _b;
        const pr = ((_a = PRIORITY_RANK[a.priority]) !== null && _a !== void 0 ? _a : 9) - ((_b = PRIORITY_RANK[b.priority]) !== null && _b !== void 0 ? _b : 9);
        if (pr !== 0)
            return pr;
        if (a.blockingForOnboarding === b.blockingForOnboarding)
            return 0;
        return a.blockingForOnboarding ? -1 : 1;
    });
    return items;
}
function evaluateSmartGapAnalysis(input) {
    const spceReqs = input.spceResults.requirementResults;
    const policy = policyScoreFromSpce(spceReqs);
    const procedure = procedureScoreFromSpce(spceReqs);
    const training = trainingScoreFromTae(input.taeResults);
    const fieldPractice = fieldPracticeScoreFromSummary(input.fieldDataSummary);
    const records = recordsScoreFromSpce(spceReqs, input.fieldDataSummary);
    const categoryScores = {
        Policy: policy.score,
        Procedure: procedure.score,
        Training: training.score,
        FieldPractice: fieldPractice.score,
        Records: records.score,
    };
    const overallGapScore = Math.round(categoryScores.Policy * CATEGORY_WEIGHTS.Policy +
        categoryScores.Procedure * CATEGORY_WEIGHTS.Procedure +
        categoryScores.Training * CATEGORY_WEIGHTS.Training +
        categoryScores.FieldPractice * CATEGORY_WEIGHTS.FieldPractice +
        categoryScores.Records * CATEGORY_WEIGHTS.Records);
    const categoryNotes = {};
    if (policy.note)
        categoryNotes.Policy = policy.note;
    if (procedure.note)
        categoryNotes.Procedure = procedure.note;
    if (training.note)
        categoryNotes.Training = training.note;
    if (fieldPractice.note)
        categoryNotes.FieldPractice = fieldPractice.note;
    if (records.note)
        categoryNotes.Records = records.note;
    return {
        companyId: input.company.id,
        hiringClientId: input.hiringClient.id,
        overallGapScore,
        overallStatus: overallStatusFromGapScore(overallGapScore),
        categoryScores,
        categoryNotes,
        legislativeCompliance: legislativeCompliance(spceReqs, input.taeResults),
        hiringClientCompliance: hiringClientCompliance(input.spceResults.overallScore, input.spceResults.overallStatus, input.taeResults),
        correctiveActionRoadmap: buildRoadmap(input),
    };
}
//# sourceMappingURL=smart-gap-analysis.engine.js.map