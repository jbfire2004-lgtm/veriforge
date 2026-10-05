"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleAppliesToWorker = ruleAppliesToWorker;
exports.credentialStatus = credentialStatus;
exports.evaluateWorkerCompliance = evaluateWorkerCompliance;
exports.aggregateProjectCompliance = aggregateProjectCompliance;
const project_compliance_types_1 = require("./project-compliance.types");
function normalizeToken(value) {
    return value.trim().toLowerCase();
}
function metadataList(metadata, key) {
    const raw = metadata[key];
    if (!Array.isArray(raw))
        return [];
    return raw.map((v) => normalizeToken(String(v))).filter(Boolean);
}
function ruleAppliesToWorker(rule, worker) {
    var _a, _b;
    switch (rule.ruleType) {
        case 'ALL_WORKERS':
            return true;
        case 'ROLE': {
            const roles = metadataList(rule.metadata, 'roles');
            if (!roles.length)
                return false;
            const workerRole = normalizeToken((_a = worker.role) !== null && _a !== void 0 ? _a : '');
            return roles.some((r) => workerRole.includes(r) || r.includes(workerRole));
        }
        case 'TRADE': {
            const trades = metadataList(rule.metadata, 'trades');
            if (!trades.length)
                return false;
            const workerTrade = normalizeToken((_b = worker.trade) !== null && _b !== void 0 ? _b : '');
            return trades.some((t) => workerTrade.includes(t) || t.includes(workerTrade));
        }
        default:
            return false;
    }
}
function credentialStatus(record, now, expiringCutoff) {
    if (!record)
        return 'missing';
    if (record.expiresAt && record.expiresAt <= now)
        return 'expired';
    if (record.expiresAt && record.expiresAt <= expiringCutoff) {
        return 'expiring_soon';
    }
    return 'valid';
}
function gapReason(status, certName) {
    switch (status) {
        case 'missing':
            return `Missing required credential: ${certName}`;
        case 'expired':
            return `Expired credential: ${certName}`;
        case 'expiring_soon':
            return `Credential expiring soon: ${certName}`;
        default:
            return `Non-compliant: ${certName}`;
    }
}
function evaluateWorkerCompliance(worker, rules, credentials, now = new Date()) {
    var _a, _b, _c, _d, _e, _f, _g;
    const expiringCutoff = new Date(now.getTime() + project_compliance_types_1.EXPIRING_SOON_DAYS * 86400000);
    const credByCert = new Map();
    for (const c of credentials) {
        const existing = credByCert.get(c.certificationId);
        if (!existing) {
            credByCert.set(c.certificationId, c);
            continue;
        }
        const existingStatus = credentialStatus(existing, now, expiringCutoff);
        const nextStatus = credentialStatus(c, now, expiringCutoff);
        if (nextStatus === 'valid' && existingStatus !== 'valid') {
            credByCert.set(c.certificationId, c);
        }
        else if (nextStatus === existingStatus &&
            ((_b = (_a = c.expiresAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0) > ((_d = (_c = existing.expiresAt) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : 0)) {
            credByCert.set(c.certificationId, c);
        }
    }
    const gaps = [];
    const expiringSoon = [];
    for (const rule of rules) {
        if (!ruleAppliesToWorker(rule, worker))
            continue;
        const record = credByCert.get(rule.requiredCredentialTypeId);
        const status = credentialStatus(record, now, expiringCutoff);
        const gap = {
            ruleId: rule.id,
            ruleType: rule.ruleType,
            certificationId: rule.requiredCredentialTypeId,
            certificationCode: rule.certificationCode,
            certificationName: rule.certificationName,
            status,
            credentialId: (_e = record === null || record === void 0 ? void 0 : record.id) !== null && _e !== void 0 ? _e : null,
            expiresAt: (_g = (_f = record === null || record === void 0 ? void 0 : record.expiresAt) === null || _f === void 0 ? void 0 : _f.toISOString()) !== null && _g !== void 0 ? _g : null,
            reason: gapReason(status, rule.certificationName),
        };
        if (status === 'valid')
            continue;
        if (status === 'expiring_soon') {
            expiringSoon.push(gap);
        }
        else {
            gaps.push(gap);
        }
    }
    return {
        workerId: worker.id,
        workerName: `${worker.firstName} ${worker.lastName}`.trim(),
        role: worker.role,
        trade: worker.trade,
        isCompliant: gaps.length === 0,
        gaps,
        expiringSoon,
    };
}
function aggregateProjectCompliance(projectId, projectName, companyId, client, workers) {
    const compliantWorkers = workers.filter((w) => w.isCompliant);
    const nonCompliantWorkers = workers.filter((w) => !w.isCompliant);
    const missingOrExpiring = workers.flatMap((w) => [
        ...w.gaps,
        ...w.expiringSoon,
    ]);
    const compliancePercentage = workers.length > 0
        ? Math.round((compliantWorkers.length / workers.length) * 100)
        : 100;
    return {
        compliancePercentage,
        compliantWorkers,
        nonCompliantWorkers,
        missingOrExpiring,
    };
}
//# sourceMappingURL=project-compliance-evaluator.js.map