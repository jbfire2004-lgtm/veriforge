"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseRulesEngine = void 0;
const actions_1 = require("../utils/actions");
const BASE_RULES = [
    { id: "rule-safety-001", name: "SIF precursor lockout", domain: "safety", version: "1.0.0", check: (c) => (c.inspectionFailures ?? 0) > 0 },
    { id: "rule-compliance-001", name: "Training expiry restrict", domain: "compliance", version: "1.0.0", check: (c) => (c.expiringTraining ?? 0) > 0 },
    { id: "rule-dispatch-001", name: "Union dispatch priority", domain: "dispatch", version: "1.0.0", check: (c) => !!c.unionHallId },
    { id: "rule-scheduling-001", name: "Staffing shortage", domain: "scheduling", version: "1.0.0", check: (c) => (c.schedulingShortages?.length ?? 0) > 0 },
    { id: "rule-project-001", name: "Project readiness", domain: "project", version: "1.0.0", check: (c) => (c.nonCompliantWorkers ?? 0) > 2 },
];
class EnterpriseRulesEngine {
    run(ctx) {
        const rules = BASE_RULES.map((r) => ({
            id: r.id,
            name: r.name,
            domain: r.domain,
            version: r.version,
            triggered: r.check(ctx),
        }));
        const triggered = rules.filter((r) => r.triggered);
        const actions = triggered.map((r) => (0, actions_1.enterpriseAction)({
            module: "rules",
            type: `rule.${r.id}`,
            title: r.name,
            reason: `Rule ${r.id} v${r.version} triggered`,
            entityType: "company",
            entityId: ctx.companyId ?? "0",
            priority: (0, actions_1.priorityScore)({
                safety: r.domain === "safety" ? 90 : 0,
                compliance: r.domain === "compliance" ? 90 : 0,
                operational: r.domain === "dispatch" ? 80 : 0,
            }),
            overrideable: true,
            rollbackable: true,
            metadata: { ruleVersion: r.version, auditable: true },
        }));
        return {
            evaluated: rules.length,
            triggered: triggered.length,
            rules,
            actions,
        };
    }
}
exports.EnterpriseRulesEngine = EnterpriseRulesEngine;
//# sourceMappingURL=enterprise-rules.js.map