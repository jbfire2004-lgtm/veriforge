import type { MetricLabels, ObservabilityConfig } from "./types";

type CounterKey = string;

/**
 * In-process Prometheus-style metrics registry (OTLP-ready stub).
 * Swap `exportPrometheus` / `flushOtlp` with @opentelemetry/sdk-metrics later.
 */
export class MetricsRegistry {
  private readonly counters = new Map<CounterKey, number>();
  private readonly histograms = new Map<CounterKey, number[]>();

  constructor(private readonly config: ObservabilityConfig) {}

  private key(name: string, labels?: MetricLabels): string {
    if (!labels || !Object.keys(labels).length) return name;
    const parts = Object.keys(labels)
      .sort()
      .map((k) => `${k}=${labels[k]}`)
      .join(",");
    return `${name}{${parts}}`;
  }

  incr(name: string, labels?: MetricLabels, by = 1): void {
    if (!this.config.metricsEnabled) return;
    const k = this.key(name, labels);
    this.counters.set(k, (this.counters.get(k) ?? 0) + by);
  }

  observe(name: string, valueSeconds: number, labels?: MetricLabels): void {
    if (!this.config.metricsEnabled) return;
    const k = this.key(name, labels);
    const arr = this.histograms.get(k) ?? [];
    arr.push(valueSeconds);
    if (arr.length > 500) arr.shift();
    this.histograms.set(k, arr);
  }

  /** Record a completed request (latency + outcome). */
  recordRequest(opts: {
    route: string;
    outcome: "success" | "failure" | "denied";
    latencyMs: number;
  }): void {
    this.incr("veriagent_requests_total", {
      route: opts.route,
      outcome: opts.outcome,
    });
    this.observe(
      "veriagent_request_duration_seconds",
      opts.latencyMs / 1000,
      { route: opts.route },
    );
  }

  recordPolicyDecision(allowed: boolean, code?: string): void {
    this.incr("veriagent_policy_decisions_total", {
      allowed: String(allowed),
      code: code ?? "ok",
    });
  }

  recordAiUsage(opts: {
    purpose: string;
    providerId: string;
    fallback: boolean;
    latencyMs: number;
  }): void {
    this.incr("veriagent_ai_usage_total", {
      purpose: opts.purpose,
      provider: opts.providerId,
      fallback: String(opts.fallback),
    });
    this.observe("veriagent_ai_duration_seconds", opts.latencyMs / 1000, {
      purpose: opts.purpose,
    });
  }

  recordRateLimitHit(scope: string): void {
    this.incr("veriagent_rate_limit_hits_total", { scope });
  }

  recordAbuseBlock(signal: string): void {
    this.incr("veriagent_abuse_blocks_total", { signal });
  }

  recordPipelineStage(stage: string, latencyMs: number): void {
    this.observe("veriagent_pipeline_stage_seconds", latencyMs / 1000, {
      stage,
    });
  }

  /** Prometheus text exposition (scrapable at /metrics). */
  exportPrometheus(): string {
    const lines: string[] = [
      `# HELP veriagent_info VeriAgent build info`,
      `# TYPE veriagent_info gauge`,
      `veriagent_info{service="${this.config.serviceName}"} 1`,
    ];
    const counterNames = new Set<string>();
    for (const [k, v] of this.counters) {
      const name = k.split("{")[0]!;
      if (!counterNames.has(name)) {
        lines.push(`# TYPE ${name} counter`);
        counterNames.add(name);
      }
      lines.push(`${k} ${v}`);
    }
    const histNames = new Set<string>();
    for (const [k, samples] of this.histograms) {
      const name = k.split("{")[0]!;
      const labels = k.includes("{") ? k.slice(k.indexOf("{")) : "";
      if (!histNames.has(name)) {
        lines.push(`# TYPE ${name} summary`);
        histNames.add(name);
      }
      const sum = samples.reduce((a, b) => a + b, 0);
      lines.push(`${name}_sum${labels} ${sum}`);
      lines.push(`${name}_count${labels} ${samples.length}`);
      lines.push(`${name}${labels} ${percentile(samples, 0.95)}`);
    }
    return `${lines.join("\n")}\n`;
  }

  /**
   * Flush metrics intent to OTLP collector when endpoint configured.
   * Prometheus /metrics scrape remains the primary path; this posts a
   * lightweight heartbeat so collectors can verify connectivity.
   */
  async flushOtlp(): Promise<{ exported: boolean; endpoint?: string }> {
    if (!this.config.metricsEnabled || !this.config.otlpEndpoint) {
      return { exported: false };
    }
    const endpoint = this.config.otlpEndpoint.replace(/\/$/, "");
    try {
      const res = await fetch(`${endpoint}/v1/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceMetrics: [
            {
              resource: {
                attributes: [
                  {
                    key: "service.name",
                    value: { stringValue: this.config.serviceName },
                  },
                ],
              },
              scopeMetrics: [
                {
                  metrics: [
                    {
                      name: "veriagent_otlp_flush",
                      sum: {
                        dataPoints: [
                          {
                            asInt: "1",
                            timeUnixNano: String(Date.now() * 1e6),
                          },
                        ],
                        aggregationTemporality: 2,
                        isMonotonic: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      });
      return { exported: res.ok, endpoint };
    } catch {
      return { exported: false, endpoint };
    }
  }

  /** Test helper */
  snapshot(): { counters: Record<string, number>; histograms: Record<string, number> } {
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters) counters[k] = v;
    const histograms: Record<string, number> = {};
    for (const [k, samples] of this.histograms) {
      histograms[k] = samples.length;
    }
    return { counters, histograms };
  }

  clear(): void {
    this.counters.clear();
    this.histograms.clear();
  }
}

function percentile(samples: number[], p: number): number {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx] ?? 0;
}
