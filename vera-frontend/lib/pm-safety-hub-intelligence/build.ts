import type {
  SafetyHubIntelligenceDashboard,
  SafetyHubDomainCard,
  TrendPoint,
} from "./types";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(
  seed: string,
  months: number,
  base: number,
  drift: number,
  noise: number,
): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = (hash(`${seed}:${period}`) % 1000) / 1000;
    const t = months - i;
    const value = Math.max(
      0,
      Math.min(100, base + drift * (t / months) + (n - 0.5) * noise),
    );
    out.push({ period, value: Math.round(value * 10) / 10 });
  }
  return out;
}

function num(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return fallback;
}

function qs(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

const DOMAIN_LABELS: Record<string, string> = {
  inspection: "Inspections",
  investigation: "Investigations",
  corrective_action: "Action Management",
  predictive: "Predictive risk",
  contractor: "Contractors",
  substance_testing: "Substance testing",
  competency: "Competency",
  equipment: "Equipment",
};

type LiveBundle = {
  sif?: Record<string, unknown> | null;
  leading?: {
    sclDistribution?: Record<string, number>;
    hecaHighEnergyConditionalLoss?: number;
    energyControlGaps?: Record<string, number>;
  } | null;
  training?: Record<string, unknown> | null;
  hub?: {
    summary?: {
      alertScore?: number;
      openCapa?: number;
      openCail?: number;
      evidenceIndexed?: number;
      domainsNeedingAttention?: number;
    };
    domains?: Record<
      string,
      Record<string, number | string | null> & { href?: string }
    >;
    capaQueue?: Array<{
      id: string;
      title: string;
      status: string;
      severityLevel?: string;
      dueAt?: string;
      sourceModule?: string;
    }>;
  } | null;
  emergency?: { quality?: { drillReadiness?: number } } | null;
  smsHome?: {
    kpis?: Array<{ id: string; value: number; unit?: string }>;
  } | null;
};

function domainAlertCount(
  domain: Record<string, number | string | null>,
): number {
  return Object.entries(domain)
    .filter(([k]) => k !== "href")
    .reduce((sum, [, v]) => sum + (typeof v === "number" ? v : 0), 0);
}

export function buildSafetyHubIntelligence(input: {
  projectId: number;
  companyId: number;
  live?: LiveBundle;
}): SafetyHubIntelligenceDashboard {
  const { projectId, companyId, live } = input;
  const seed = `sh-intel:${companyId}:${projectId}`;
  const h = hash(seed);
  const q = qs(projectId, companyId);
  const sources: string[] = [];

  const sif = live?.sif ?? null;
  const leading = live?.leading ?? null;
  const training = live?.training ?? null;
  const hub = live?.hub ?? null;
  const emergency = live?.emergency ?? null;
  const smsHome = live?.smsHome ?? null;

  if (sif) sources.push("sif-heca");
  if (leading) sources.push("sms-leading");
  if (training) sources.push("training");
  if (hub) sources.push("safety-hub");
  if (emergency) sources.push("erp");
  if (smsHome) sources.push("verisuite-sms");
  if (sources.length === 0) sources.push("demo");

  const sifRateLive = num(
    (sif?.leadingIndicators as { sifRatePct?: number } | undefined)?.sifRatePct,
    NaN,
  );
  const highEnergyLive = num(
    (sif?.leadingIndicators as { highEnergyRatePct?: number } | undefined)
      ?.highEnergyRatePct,
    NaN,
  );
  const sifExposures = num(sif?.sifHighCount ?? sif?.events90d, 8 + (h % 12));

  const trainingLive = num(
    training?.trainingCompliancePct ?? training?.compliancePct,
    NaN,
  );
  const erpLive = num(
    emergency?.quality?.drillReadiness ??
      smsHome?.kpis?.find((k) => k.id.includes("erp") || k.id.includes("drill"))
        ?.value,
    NaN,
  );

  const hecaHighEnergyLoss = num(leading?.hecaHighEnergyConditionalLoss, NaN);
  const scl = leading?.sclDistribution ?? {
    safe: 48 + (h % 20),
    conditional: 28 + (h % 12),
    loss: 8 + (h % 8),
    untagged: 4 + (h % 5),
  };
  const sclTotal =
    Object.values(scl).reduce((a, b) => a + Number(b || 0), 0) || 1;
  const sclSafePct = Math.round((Number(scl.safe ?? 0) / sclTotal) * 1000) / 10;

  // Demo baselines when live missing
  const hecaVerificationRate = Number.isFinite(
    num(
      (sif as { projectSifScore?: number } | null)?.projectSifScore,
      NaN,
    ),
  )
    ? Math.min(
        98,
        Math.max(
          55,
          100 -
            num(
              (sif?.leadingIndicators as { sifRatePct?: number } | undefined)
                ?.sifRatePct,
              12,
            ) *
              1.2 +
            (h % 8),
        ),
      )
    : 72 + (h % 18);

  // Prefer a more explicit synthetic HECA verification when SIF doesn't expose it;
  // bump when live high-energy is low (controls holding).
  const hecaVerificationFinal = Number.isFinite(highEnergyLive)
    ? Math.round(
        Math.min(98, Math.max(50, 88 - highEnergyLive * 0.6 + (h % 5))),
      )
    : Math.round(hecaVerificationRate);

  const sifTrendIndex = Number.isFinite(sifRateLive)
    ? Math.round(sifRateLive * 10) / 10
    : Math.round((6 + (h % 14) + sifExposures * 0.35) * 10) / 10;

  const trainingCompliancePct = Number.isFinite(trainingLive)
    ? Math.round(trainingLive * 10) / 10
    : 78 + (h % 16);

  const erpReadinessPct = Number.isFinite(erpLive)
    ? Math.round(erpLive * 10) / 10
    : 68 + (h % 22);

  const highEnergyExposureRate = Number.isFinite(highEnergyLive)
    ? Math.round(highEnergyLive * 10) / 10
    : Number.isFinite(hecaHighEnergyLoss)
      ? Math.min(40, Math.round(hecaHighEnergyLoss * 10) / 10)
      : 14 + (h % 16);

  const leadingIndicatorScore = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        sclSafePct * 0.35 +
          (100 - highEnergyExposureRate) * 0.25 +
          hecaVerificationFinal * 0.2 +
          trainingCompliancePct * 0.2,
      ),
    ) * 10,
  ) / 10;

  const sifTrend = series(seed + ":sif", 8, sifTrendIndex + 4, -3, 6);
  const hecaVerificationTrend = series(
    seed + ":heca",
    8,
    hecaVerificationFinal - 6,
    8,
    5,
  );
  const trainingTrend = series(
    seed + ":train",
    8,
    trainingCompliancePct - 5,
    6,
    4,
  );
  const erpReadinessTrend = series(
    seed + ":erp",
    8,
    erpReadinessPct - 8,
    10,
    6,
  );
  const highEnergyTrend = series(
    seed + ":he",
    8,
    highEnergyExposureRate + 3,
    -2,
    5,
  );

  // Align last points to live KPI values
  if (sifTrend.length) sifTrend[sifTrend.length - 1]!.value = sifTrendIndex;
  if (hecaVerificationTrend.length) {
    hecaVerificationTrend[hecaVerificationTrend.length - 1]!.value =
      hecaVerificationFinal;
  }
  if (trainingTrend.length) {
    trainingTrend[trainingTrend.length - 1]!.value = trainingCompliancePct;
  }
  if (erpReadinessTrend.length) {
    erpReadinessTrend[erpReadinessTrend.length - 1]!.value = erpReadinessPct;
  }
  if (highEnergyTrend.length) {
    highEnergyTrend[highEnergyTrend.length - 1]!.value = highEnergyExposureRate;
  }

  const heatRows = ["Safe", "Conditional", "Loss", "High-energy"];
  const heatCols = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const leadingHeatmap = {
    rows: heatRows,
    cols: heatCols,
    cells: heatRows.flatMap((row, ri) =>
      heatCols.map((col, ci) => {
        const value = Math.round(
          ((hash(`${seed}:heat:${ri}:${ci}`) % 100) / 100) *
            (ri === 0 ? 40 : ri === 3 ? 70 : 55),
        );
        return {
          row,
          col,
          value,
          intensity: Math.min(1, value / 70),
        };
      }),
    ),
  };

  const energyKeys = [
    { key: "gravity", label: "Gravity", highEnergy: true },
    { key: "motion", label: "Motion", highEnergy: false },
    { key: "electrical", label: "Electrical", highEnergy: true },
    { key: "pressure", label: "Pressure", highEnergy: true },
    { key: "chemical", label: "Chemical", highEnergy: false },
    { key: "thermal", label: "Thermal", highEnergy: false },
    { key: "radiation", label: "Radiation", highEnergy: false },
  ];
  const gaps = leading?.energyControlGaps ?? {};
  const energyBreakdown = energyKeys.map((e, i) => {
    const n = (hash(`${seed}:e:${e.key}`) % 1000) / 1000;
    const gap = num(gaps[e.key], 0);
    return {
      key: e.key,
      label: e.label,
      exposurePct: Math.round(Math.max(4, (18 - i) * (0.8 + n * 0.4)) * 10) / 10,
      controlScore: Math.round(
        Math.max(
          40,
          Math.min(98, 78 - gap * 4 + (n - 0.4) * 20 - (e.highEnergy ? 6 : 0)),
        ),
      ),
      highEnergy: e.highEnergy,
    };
  });

  const domainCards: SafetyHubDomainCard[] = hub?.domains
    ? Object.entries(hub.domains).map(([id, d]) => ({
        id,
        label: DOMAIN_LABELS[id] ?? id,
        href: String(d.href ?? `/pm`),
        alertCount: domainAlertCount(d),
      }))
    : Object.entries(DOMAIN_LABELS).map(([id, label], i) => ({
        id,
        label,
        href: `/pm?${q}`,
        alertCount: (h + i * 3) % 7,
      }));

  const capaQueue = (hub?.capaQueue ?? []).slice(0, 6).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    severityLevel: c.severityLevel,
    dueAt: c.dueAt,
    href: `/pm/action-management?${q}`,
  }));

  const insights = [
    {
      id: "sif",
      tone:
        sifTrendIndex > 15
          ? ("alert" as const)
          : sifTrendIndex > 8
            ? ("caution" as const)
            : ("positive" as const),
      headline:
        sifTrendIndex > 15
          ? `SIF rate elevated at ${sifTrendIndex}% — review HECA assessments`
          : `SIF trend index ${sifTrendIndex}% over the rolling window`,
      href: `/pm/sif-heca?${q}`,
    },
    {
      id: "heca",
      tone:
        hecaVerificationFinal >= 80
          ? ("positive" as const)
          : ("caution" as const),
      headline: `HECA critical-control verification at ${hecaVerificationFinal}%`,
      href: `/pm/sif-heca?${q}`,
    },
    {
      id: "train",
      tone:
        trainingCompliancePct >= 85
          ? ("positive" as const)
          : ("caution" as const),
      headline: `Training compliance ${trainingCompliancePct}%`,
      href: `/pm/training?${q}`,
    },
    {
      id: "erp",
      tone: erpReadinessPct >= 75 ? ("positive" as const) : ("caution" as const),
      headline: `ERP drill readiness ${erpReadinessPct}%`,
      href: `/pm/emergency-response?${q}`,
    },
    {
      id: "he",
      tone:
        highEnergyExposureRate > 20
          ? ("alert" as const)
          : ("caution" as const),
      headline: `High-energy exposure rate ${highEnergyExposureRate}%`,
      detail: "Focus gravity / electrical / pressure controls",
      href: `/pm/sms?${q}`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    revision: (h % 9000) + 1000,
    scopeLabel: `Company #${companyId} · Project #${projectId}`,
    projectId,
    companyId,
    periodLabel: "Last 8 months",
    sources,
    kpis: {
      sifTrendIndex,
      hecaVerificationRate: hecaVerificationFinal,
      trainingCompliancePct,
      erpReadinessPct,
      leadingIndicatorScore,
      highEnergyExposureRate,
      deltas: {
        sifTrendIndex: -0.8 + (h % 20) / 10,
        hecaVerificationRate: 1.2 + (h % 15) / 10,
        trainingCompliancePct: 0.6 + (h % 10) / 10,
        erpReadinessPct: 1.5 + (h % 12) / 10,
        leadingIndicatorScore: 0.4 + (h % 8) / 10,
        highEnergyExposureRate: -0.5 + (h % 10) / 10,
      },
    },
    sifTrend,
    hecaVerificationTrend,
    trainingTrend,
    erpReadinessTrend,
    highEnergyTrend,
    leadingHeatmap,
    energyBreakdown,
    sclDistribution: scl,
    insights,
    hubSummary: hub?.summary
      ? {
          alertScore: num(hub.summary.alertScore, 0),
          openCapa: num(hub.summary.openCapa, 0),
          openCail: num(hub.summary.openCail, 0),
          evidenceIndexed: num(hub.summary.evidenceIndexed, 0),
          domainsNeedingAttention: num(hub.summary.domainsNeedingAttention, 0),
        }
      : {
          alertScore: 3 + (h % 6),
          openCapa: 5 + (h % 8),
          openCail: 2 + (h % 4),
          evidenceIndexed: 40 + (h % 30),
          domainsNeedingAttention: 2 + (h % 3),
        },
    domainCards,
    capaQueue,
    links: {
      sifHeca: `/pm/sif-heca?${q}`,
      sms: `/pm/sms?${q}`,
      training: `/pm/training?${q}`,
      erp: `/pm/emergency-response?${q}`,
      actionManagement: `/pm/action-management?${q}`,
      projectSafety: `/pm/project-safety?${q}`,
      fieldOps: `/field/operations?${q}`,
    },
  };
}
