/**
 * Alert rule definitions (Prometheus-compatible) for operators.
 * Deployed via deploy/k8s/prometheus-alerts.yaml.
 */
export const ALERT_RULES = [
  {
    id: "VeriAgentHighErrorRate",
    expression:
      'sum(rate(veriagent_requests_total{outcome="failure"}[5m])) / clamp_min(sum(rate(veriagent_requests_total[5m])), 0.001) > 0.05',
    for: "10m",
    severity: "warning",
    summary: "VeriAgent error rate > 5%",
  },
  {
    id: "VeriAgentPolicyViolationSpike",
    expression:
      'sum(rate(veriagent_policy_decisions_total{allowed="false"}[5m])) > 1',
    for: "5m",
    severity: "warning",
    summary: "VeriAgent policy denials spiking",
  },
  {
    id: "VeriAgentRateLimitHits",
    expression: "sum(rate(veriagent_rate_limit_hits_total[5m])) > 0.5",
    for: "5m",
    severity: "info",
    summary: "VeriAgent rate-limit hits elevated",
  },
  {
    id: "VeriAgentHighLatency",
    expression:
      "histogram_quantile(0.95, sum(rate(veriagent_request_duration_seconds_bucket[5m])) by (le)) > 5",
    for: "10m",
    severity: "warning",
    summary: "VeriAgent p95 latency > 5s",
  },
  {
    id: "VeriAgentAbuseBlocks",
    expression: "sum(rate(veriagent_abuse_blocks_total[5m])) > 0.2",
    for: "5m",
    severity: "critical",
    summary: "VeriAgent abuse blocks firing",
  },
] as const;

export type AlertRuleId = (typeof ALERT_RULES)[number]["id"];
