"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSafetyProgramCompliance = evaluateSafetyProgramCompliance;
const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
const DIM_WEIGHTS = {
    existence: 0.25,
    currency: 0.2,
    structure: 0.25,
    legislation: 0.15,
    alignment: 0.15,
};
function parseDate(iso) {
    return new Date(iso);
}
function statusFromScore(score) {
    if (score >= 90)
        return 'Accepted';
    if (score >= 70)
        return 'ConditionallyAccepted';
    return 'Rejected';
}
function impliesTrainingOrField(type) {
    return type === 'TrainingConfig' || type === 'Form' || type === 'Procedure';
}
function submissionsForRequirement(req, submissions) {
    return submissions.filter((s) => s.requirementId === req.id);
}
function latestRevisionDate(docs) {
    let latest = null;
    for (const d of docs) {
        if (!d.revisionDate)
            continue;
        const dt = parseDate(d.revisionDate);
        if (!latest || dt > latest)
            latest = dt;
    }
    return latest;
}
function collectParsedSections(submissions) {
    var _a, _b;
    const set = new Set();
    for (const sub of submissions) {
        for (const doc of (_a = sub.documents) !== null && _a !== void 0 ? _a : []) {
            for (const s of (_b = doc.parsedSections) !== null && _b !== void 0 ? _b : []) {
                set.add(s.trim());
            }
        }
    }
    return [...set];
}
function legislationReferenced(req, submissions) {
    var _a, _b, _c, _d;
    const links = (_a = req.linkedLegislation) !== null && _a !== void 0 ? _a : [];
    if (links.length === 0)
        return false;
    const norm = links.map((l) => l.trim().toUpperCase());
    for (const sub of submissions) {
        for (const doc of (_b = sub.documents) !== null && _b !== void 0 ? _b : []) {
            for (const ref of (_c = doc.legislationRefs) !== null && _c !== void 0 ? _c : []) {
                if (norm.includes(ref.trim().toUpperCase()))
                    return true;
            }
            const summary = ((_d = doc.contentSummary) !== null && _d !== void 0 ? _d : '').toUpperCase();
            for (const code of norm) {
                if (summary.includes(code))
                    return true;
            }
        }
    }
    return false;
}
function evaluateExistence(submissions) {
    const has = submissions.length > 0 &&
        submissions.some((s) => {
            var _a, _b, _c, _d, _e, _f;
            return ((_b = (_a = s.documents) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 ||
                ((_d = (_c = s.linkedTrainingConfigs) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 ||
                ((_f = (_e = s.linkedForms) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) > 0;
        });
    return has
        ? { existenceStatus: 'Present', existenceScore: 1 }
        : { existenceStatus: 'Missing', existenceScore: 0 };
}
function evaluateCurrency(req, submissions, now) {
    if (submissions.length === 0) {
        return { currencyStatus: 'NotConfigured', currencyScore: 0 };
    }
    if (req.type === 'Policy' || req.type === 'Procedure') {
        const docs = submissions.flatMap((s) => { var _a; return (_a = s.documents) !== null && _a !== void 0 ? _a : []; });
        if (docs.length === 0) {
            return { currencyStatus: 'NotConfigured', currencyScore: 0 };
        }
        const rev = latestRevisionDate(docs);
        if (!rev) {
            return { currencyStatus: 'NotConfigured', currencyScore: 0 };
        }
        if (now.getTime() - rev.getTime() > THREE_YEARS_MS) {
            return { currencyStatus: 'Outdated', currencyScore: 0.4 };
        }
        return { currencyStatus: 'Current', currencyScore: 1 };
    }
    if (req.type === 'Form' || req.type === 'TrainingConfig') {
        const hasConfig = submissions.some((s) => {
            var _a, _b, _c, _d, _e, _f;
            return ((_b = (_a = s.linkedForms) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 ||
                ((_d = (_c = s.linkedTrainingConfigs) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 ||
                ((_f = (_e = s.documents) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) > 0;
        });
        return hasConfig
            ? { currencyStatus: 'Current', currencyScore: 1 }
            : { currencyStatus: 'NotConfigured', currencyScore: 0 };
    }
    const rev = latestRevisionDate(submissions.flatMap((s) => { var _a; return (_a = s.documents) !== null && _a !== void 0 ? _a : []; }));
    if (!rev) {
        return { currencyStatus: 'NotConfigured', currencyScore: 0 };
    }
    if (now.getTime() - rev.getTime() > THREE_YEARS_MS) {
        return { currencyStatus: 'Outdated', currencyScore: 0.4 };
    }
    return { currencyStatus: 'Current', currencyScore: 1 };
}
function evaluateStructure(req, submissions) {
    var _a;
    const required = (_a = req.requiredSections) !== null && _a !== void 0 ? _a : [];
    if (required.length === 0) {
        return { structureStatus: 'Complete', structureScore: 1 };
    }
    const parsed = collectParsedSections(submissions);
    if (parsed.length === 0) {
        return { structureStatus: 'Partial', structureScore: 0.5 };
    }
    const parsedNorm = parsed.map((p) => p.toLowerCase());
    const missing = required.filter((r) => !parsedNorm.some((p) => p.includes(r.trim().toLowerCase())));
    if (missing.length === 0) {
        return { structureStatus: 'Complete', structureScore: 1 };
    }
    if (missing.length < required.length) {
        return { structureStatus: 'Partial', structureScore: 0.5 };
    }
    return { structureStatus: 'Missing', structureScore: 0 };
}
function evaluateLegislation(req, submissions) {
    var _a;
    const links = (_a = req.linkedLegislation) !== null && _a !== void 0 ? _a : [];
    if (links.length === 0) {
        return { legislationStatus: 'NotApplicable', legislationScore: 1 };
    }
    if (legislationReferenced(req, submissions)) {
        return { legislationStatus: 'Referenced', legislationScore: 1 };
    }
    return { legislationStatus: 'NotReferenced', legislationScore: 0.3 };
}
function evaluateAlignment(req, submissions) {
    const trainingNeeded = impliesTrainingOrField(req.type) || req.type === 'Policy';
    const fieldNeeded = impliesTrainingOrField(req.type) || req.type === 'Policy';
    const hasTraining = submissions.some((s) => { var _a, _b; return ((_b = (_a = s.linkedTrainingConfigs) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0; });
    const hasForms = submissions.some((s) => { var _a, _b; return ((_b = (_a = s.linkedForms) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0; });
    const trainingStatus = !trainingNeeded ? 'NotConfigured' : hasTraining ? 'Aligned' : 'NotAligned';
    const fieldStatus = !fieldNeeded ? 'NotConfigured' : hasForms ? 'Aligned' : 'NotAligned';
    if (!trainingNeeded && !fieldNeeded) {
        return {
            trainingAlignmentStatus: 'NotConfigured',
            fieldAlignmentStatus: 'NotConfigured',
            alignmentScore: 1,
        };
    }
    const trainAligned = trainingStatus === 'Aligned';
    const fieldAligned = fieldStatus === 'Aligned';
    if (trainAligned && fieldAligned) {
        return {
            trainingAlignmentStatus: trainingStatus,
            fieldAlignmentStatus: fieldStatus,
            alignmentScore: 1,
        };
    }
    if (trainAligned || fieldAligned) {
        return {
            trainingAlignmentStatus: trainingStatus,
            fieldAlignmentStatus: fieldStatus,
            alignmentScore: 0.6,
        };
    }
    return {
        trainingAlignmentStatus: trainingStatus,
        fieldAlignmentStatus: fieldStatus,
        alignmentScore: 0,
    };
}
function requirementScore(existenceScore, currencyScore, structureScore, legislationScore, alignmentScore) {
    const raw = DIM_WEIGHTS.existence * existenceScore +
        DIM_WEIGHTS.currency * currencyScore +
        DIM_WEIGHTS.structure * structureScore +
        DIM_WEIGHTS.legislation * legislationScore +
        DIM_WEIGHTS.alignment * alignmentScore;
    return Math.round(100 * raw);
}
function buildCorrectiveAction(req, result, companyId, index) {
    var _a, _b;
    if (result.score >= 90)
        return null;
    const priority = result.score < 70 ? 'High' : 'Medium';
    const recommendedDueDays = result.score < 70 ? 14 : 30;
    const parts = [];
    if (result.existenceStatus === 'Missing') {
        parts.push(`Provide submission for: ${req.description}`);
    }
    if (result.currencyStatus === 'Outdated') {
        parts.push('Update document revision to within the last 3 years.');
    }
    if (result.currencyStatus === 'NotConfigured') {
        parts.push('Configure and attach required program artifacts.');
    }
    if (result.structureStatus === 'Partial' ||
        result.structureStatus === 'Missing') {
        parts.push(`Include required sections: ${((_a = req.requiredSections) !== null && _a !== void 0 ? _a : []).join(', ') || 'see requirement'}.`);
    }
    if (result.legislationStatus === 'NotReferenced') {
        parts.push(`Reference legislation: ${((_b = req.linkedLegislation) !== null && _b !== void 0 ? _b : []).join(', ')}.`);
    }
    if (result.trainingAlignmentStatus === 'NotAligned' ||
        result.trainingAlignmentStatus === 'NotConfigured') {
        parts.push('Link training configuration to this program requirement.');
    }
    if (result.fieldAlignmentStatus === 'NotAligned' ||
        result.fieldAlignmentStatus === 'NotConfigured') {
        parts.push('Link field forms (e.g. inspections) to this program requirement.');
    }
    return {
        id: `CA-${req.id}-${index}`,
        requirementId: req.id,
        companyId,
        category: req.type,
        description: parts.join(' ') || `Improve ${req.category} program element.`,
        priority,
        recommendedDueDays,
        blockingForPrequalification: result.score < 70,
    };
}
function evaluateRequirement(req, submissions, companyId, now, caIndex) {
    const subs = submissionsForRequirement(req, submissions);
    const { existenceStatus, existenceScore } = evaluateExistence(subs);
    const { currencyStatus, currencyScore } = evaluateCurrency(req, subs, now);
    const { structureStatus, structureScore } = evaluateStructure(req, subs);
    const { legislationStatus, legislationScore } = evaluateLegislation(req, subs);
    const { trainingAlignmentStatus, fieldAlignmentStatus, alignmentScore } = evaluateAlignment(req, subs);
    const score = requirementScore(existenceScore, currencyScore, structureScore, legislationScore, alignmentScore);
    const result = {
        requirementId: req.id,
        category: req.category,
        type: req.type,
        score,
        status: statusFromScore(score),
        existenceStatus,
        currencyStatus,
        structureStatus,
        legislationStatus,
        trainingAlignmentStatus,
        fieldAlignmentStatus,
        submissionIds: subs.map((s) => s.id),
    };
    const action = buildCorrectiveAction(req, result, companyId, caIndex);
    return { result, actions: action ? [action] : [] };
}
function evaluateSafetyProgramCompliance(input) {
    var _a, _b, _c, _d;
    const now = parseDate(input.context.dateNow);
    const companyId = (_d = (_b = (_a = input.companySubmissions[0]) === null || _a === void 0 ? void 0 : _a.companyId) !== null && _b !== void 0 ? _b : (_c = input.hiringClientProgramRequirements[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : 'unknown';
    const requirementResults = [];
    const correctiveActions = [];
    let caIndex = 0;
    for (const req of input.hiringClientProgramRequirements) {
        const { result, actions } = evaluateRequirement(req, input.companySubmissions, companyId, now, caIndex);
        requirementResults.push(result);
        correctiveActions.push(...actions);
        caIndex += actions.length;
    }
    const totalWeight = input.hiringClientProgramRequirements.reduce((s, r) => s + (r.weight > 0 ? r.weight : 0), 0);
    const overallScore = totalWeight > 0
        ? Math.round(requirementResults.reduce((sum, r, i) => {
            var _a, _b;
            const w = (_b = (_a = input.hiringClientProgramRequirements[i]) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
            return sum + r.score * w;
        }, 0) / totalWeight)
        : requirementResults.length > 0
            ? Math.round(requirementResults.reduce((s, r) => s + r.score, 0) /
                requirementResults.length)
            : 0;
    return {
        companyId,
        overallScore,
        overallStatus: statusFromScore(overallScore),
        requirementResults,
        correctiveActions,
    };
}
//# sourceMappingURL=safety-program-compliance.engine.js.map