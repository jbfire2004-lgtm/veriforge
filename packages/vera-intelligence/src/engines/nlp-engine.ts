import type { IntelligenceBundle, NlpIntent, NlpQuery, NlpResponse, ScoreResult } from "../types";

const INTENT_PATTERNS: { intent: NlpIntent; patterns: RegExp[] }[] = [
  { intent: "worker.query", patterns: [/worker/i, /roster/i, /who is/i] },
  { intent: "training.query", patterns: [/training/i, /certificate/i, /expir/i] },
  { intent: "compliance.query", patterns: [/compliance/i, /compliant/i, /non-?compliant/i] },
  { intent: "project.readiness", patterns: [/project/i, /readiness/i, /ready for/i] },
  { intent: "equipment.query", patterns: [/equipment/i, /inspection/i, /lockout/i] },
  { intent: "report.summary", patterns: [/summary/i, /report/i, /overview/i] },
  { intent: "recommendations", patterns: [/recommend/i, /suggest/i, /what should/i] },
];

function score(obj: unknown): ScoreResult | undefined {
  return obj as ScoreResult | undefined;
}

function record(obj: unknown): Record<string, unknown> | undefined {
  return obj as Record<string, unknown> | undefined;
}

export class NaturalLanguageEngine {
  parse(text: string): NlpQuery {
    const trimmed = text.trim();
    let intent: NlpIntent = "unknown";
    for (const row of INTENT_PATTERNS) {
      if (row.patterns.some((p) => p.test(trimmed))) {
        intent = row.intent;
        break;
      }
    }
    const entities: Record<string, string> = {};
    const projectMatch = trimmed.match(/project\s+["']?([^"']+)["']?/i);
    if (projectMatch) entities.project = projectMatch[1]!.trim();
    const workerMatch = trimmed.match(/worker\s+["']?([^"']+)["']?/i);
    if (workerMatch) entities.worker = workerMatch[1]!.trim();
    return { text: trimmed, intent, entities };
  }

  answer(query: NlpQuery, bundle?: IntelligenceBundle): NlpResponse {
    const b = bundle;
    switch (query.intent) {
      case "compliance.query": {
        const cs = score(record(b?.company)?.complianceScore);
        return {
          intent: query.intent,
          answer: cs
            ? `Company compliance risk score is ${cs.score}/100 (${cs.level}). ${b?.anomalies.length ?? 0} anomalies flagged.`
            : "Compliance data is not loaded. Open the dashboard or specify a company.",
          data: b?.compliance,
          followUps: ["Show expiring training", "List high-risk workers"],
        };
      }
      case "project.readiness": {
        const r = score(record(b?.project)?.readiness);
        const gaps = record(record(b?.project)?.staffingGaps);
        return {
          intent: query.intent,
          answer: r
            ? `Project readiness is ${r.score}/100. Missing: ${gaps?.workers ?? 0} workers, ${gaps?.equipment ?? 0} equipment.`
            : "No project intelligence in context. Select a project first.",
          data: b?.project,
          followUps: ["Suggest staffing plan", "Show compliance risks"],
        };
      }
      case "recommendations": {
        const recs = b?.recommendations?.slice(0, 5) ?? [];
        return {
          intent: query.intent,
          answer: recs.length
            ? `Top recommendations: ${recs.map((r) => r.title).join("; ")}`
            : "No recommendations at this time.",
          data: recs,
        };
      }
      case "training.query": {
        const t = record(b?.training);
        const gaps = Array.isArray(t?.gapDetection) ? t!.gapDetection.length : 0;
        const fraud = score(t?.fraudRisk);
        return {
          intent: query.intent,
          answer: t
            ? `Training intelligence: ${gaps} gaps, fraud signals: ${fraud?.level ?? "unknown"}.`
            : "Ask about a specific worker or upload training data for analysis.",
          followUps: ["What training expires this month?"],
        };
      }
      case "worker.query": {
        const w = record(b?.worker);
        const readiness = score(w?.readiness);
        const risk = score(w?.complianceRisk);
        return {
          intent: query.intent,
          answer: w
            ? `Worker readiness ${readiness?.score ?? "—"}/100. Risk: ${risk?.level ?? "unknown"}.`
            : "Specify a worker ID or open a worker profile.",
        };
      }
      case "equipment.query": {
        const e = record(b?.equipment);
        const readiness = score(e?.readiness);
        const lockout = score(e?.lockoutRisk);
        return {
          intent: query.intent,
          answer: e
            ? `Equipment readiness ${readiness?.score ?? "—"}/100. Lockout risk: ${lockout?.level ?? "unknown"}.`
            : "Specify equipment or scan QR in field mode.",
        };
      }
      case "report.summary":
        return {
          intent: query.intent,
          answer: b?.dashboard?.summary?.text ?? "Run intelligence refresh from the dashboard.",
          data: b?.dashboard,
        };
      default:
        return {
          intent: "unknown",
          answer:
            'Try: "What is our compliance status?", "Is project X ready?", "Recommend actions", or "Training expiring soon".',
          followUps: [
            "What is our compliance status?",
            "Show recommendations",
            "Project readiness",
          ],
        };
    }
  }
}
