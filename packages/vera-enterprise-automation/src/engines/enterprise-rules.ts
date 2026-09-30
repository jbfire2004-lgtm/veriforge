import type { EnterpriseContextInput, EnterpriseRulesResult } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

const BASE_RULES = [
  { id: "rule-safety-001", name: "SIF precursor lockout", domain: "safety", version: "1.0.0", check: (c: EnterpriseContextInput) => (c.inspectionFailures ?? 0) > 0 },
  { id: "rule-compliance-001", name: "Training expiry restrict", domain: "compliance", version: "1.0.0", check: (c: EnterpriseContextInput) => (c.expiringTraining ?? 0) > 0 },
  { id: "rule-dispatch-001", name: "Union dispatch priority", domain: "dispatch", version: "1.0.0", check: (c: EnterpriseContextInput) => !!c.unionHallId },
  { id: "rule-scheduling-001", name: "Staffing shortage", domain: "scheduling", version: "1.0.0", check: (c: EnterpriseContextInput) => (c.schedulingShortages?.length ?? 0) > 0 },
  { id: "rule-project-001", name: "Project readiness", domain: "project", version: "1.0.0", check: (c: EnterpriseContextInput) => (c.nonCompliantWorkers ?? 0) > 2 },
];

export class EnterpriseRulesEngine {
  run(ctx: EnterpriseContextInput): EnterpriseRulesResult {
    const rules = BASE_RULES.map((r) => ({
      id: r.id,
      name: r.name,
      domain: r.domain,
      version: r.version,
      triggered: r.check(ctx),
    }));

    const triggered = rules.filter((r) => r.triggered);
    const actions = triggered.map((r) =>
      enterpriseAction({
        module: "rules",
        type: `rule.${r.id}`,
        title: r.name,
        reason: `Rule ${r.id} v${r.version} triggered`,
        entityType: "company",
        entityId: ctx.companyId ?? "0",
        priority: priorityScore({
          safety: r.domain === "safety" ? 90 : 0,
          compliance: r.domain === "compliance" ? 90 : 0,
          operational: r.domain === "dispatch" ? 80 : 0,
        }),
        overrideable: true,
        rollbackable: true,
        metadata: { ruleVersion: r.version, auditable: true },
      })
    );

    return {
      evaluated: rules.length,
      triggered: triggered.length,
      rules,
      actions,
    };
  }
}
