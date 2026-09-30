import type { HecaAnalysis, SafetyContextInput, SafetyFormInput } from "../types";
import { safetyScore } from "../utils/scoring";

export class HecaIntelligenceEngine {
  analyze(ctx: SafetyContextInput): HecaAnalysis {
    const hecaForms = (ctx.forms ?? []).filter(
      (f) => f.kind === "HECA" || f.kind === "JHA" || f.kind === "FLHA"
    );
    const tasks = hecaForms.map((f, i) => ({
      id: f.id,
      label: f.title || `Task ${i + 1}`,
      risk: this.taskRisk(f, ctx),
    }));

    const deviations: HecaAnalysis["deviations"] = [];
    const violations: HecaAnalysis["violations"] = [];

    for (const f of hecaForms) {
      if (!f.controlMeasures?.trim()) {
        deviations.push({
          code: "MISSING_CONTROLS",
          message: `Missing controls on ${f.title}`,
        });
      }
      if (f.hazardSummary && !f.controlMeasures) {
        violations.push({
          code: "HAZARD_UNCONTROLLED",
          message: `Hazards documented without controls: ${f.title}`,
        });
      }
    }

    if ((ctx.competencyGaps ?? 0) > 0) {
      violations.push({
        code: "COMPETENCY_GAP",
        message: "Worker competency gap for HECA task",
      });
    }

    const avgTaskRisk =
      tasks.length ? tasks.reduce((s, t) => s + t.risk, 0) / tasks.length : 0;

    const riskScore = safetyScore([
      { weight: 40, value: avgTaskRisk },
      { weight: 30, value: Math.min(100, deviations.length * 25) },
      { weight: 30, value: Math.min(100, violations.length * 30) },
    ]);

    const controls = this.recommendControls(deviations, violations, ctx);

    return {
      riskScore,
      tasks,
      deviations,
      violations,
      controls,
      summary: `HECA analysis: ${tasks.length} critical activities, ${deviations.length} deviations, ${violations.length} violations.`,
    };
  }

  private taskRisk(form: SafetyFormInput, ctx: SafetyContextInput): number {
    let risk = 20;
    if (form.hazardSummary && /critical|serious|high/i.test(form.hazardSummary)) risk += 40;
    if (!form.controlMeasures) risk += 25;
    if (ctx.lockedOutEquipment) risk += 15;
    return Math.min(100, risk);
  }

  private recommendControls(
    deviations: HecaAnalysis["deviations"],
    violations: HecaAnalysis["violations"],
    ctx: SafetyContextInput
  ): string[] {
    const c: string[] = [];
    if (deviations.some((d) => d.code === "MISSING_CONTROLS")) {
      c.push("Add engineering and administrative controls to JHA/FLHA");
    }
    if (violations.some((v) => v.code === "COMPETENCY_GAP")) {
      c.push("Restrict task until competency verified");
    }
    if (ctx.lockedOutEquipment) c.push("Clear lockout before HECA task");
    if (!c.length) c.push("HECA controls appear adequate — continue monitoring");
    return c;
  }
}
