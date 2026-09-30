"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type CulturePillar =
  | "leadership"
  | "empowerment"
  | "training"
  | "verification"
  | "transparency"
  | "improvement";

export type BehaviorTone = "positive" | "at_risk";
export type CampaignStatus = "planned" | "active" | "completed";
export type SuggestionStatus = "open" | "reviewing" | "implemented" | "declined";

export type CultureBehaviorLocal = {
  id: string;
  title: string;
  description: string;
  tone: BehaviorTone;
  location: string;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type CultureCampaignLocal = {
  id: string;
  title: string;
  description: string;
  status: CampaignStatus;
  participation: number;
  completion: number;
  impact: number;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type LeadershipActionLocal = {
  id: string;
  title: string;
  coach: string;
  feedback: string;
  priority: boolean;
  status: "open" | "in_progress" | "done";
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type WorkerSuggestionLocal = {
  id: string;
  title: string;
  detail: string;
  anonymous: boolean;
  status: SuggestionStatus;
  implementationPercent: number;
  category: CulturePillar;
  timestamp: string;
  userId: number | null;
};

export type ImprovementItemLocal = {
  id: string;
  title: string;
  detail: string;
  priority: "normal" | "priority";
  progress: number;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type CultureAnalyticsSnapshot = {
  cultureScore: number;
  leadershipEngagement: number;
  workerEmpowerment: number;
  trainingExcellence: number;
  verificationDiscipline: number;
  incidentTransparency: number;
  continuousImprovement: number;
  positiveBehaviors: number;
  atRiskBehaviors: number;
  activeCampaigns: number;
  openSuggestions: number;
  priorityGaps: number;
  correctiveActionClosure: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.culture.analytics";

const PILLARS: Array<{ id: CulturePillar; label: string }> = [
  { id: "leadership", label: "Leadership Engagement" },
  { id: "empowerment", label: "Worker Empowerment" },
  { id: "training", label: "Training Excellence" },
  { id: "verification", label: "Verification Discipline" },
  { id: "transparency", label: "Incident Transparency" },
  { id: "improvement", label: "Continuous Improvement" },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function avg(values: number[], fallback: number) {
  if (values.length === 0) return fallback;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function computeCultureAnalytics(input: {
  behaviors: CultureBehaviorLocal[];
  campaigns: CultureCampaignLocal[];
  leadership: LeadershipActionLocal[];
  suggestions: WorkerSuggestionLocal[];
  improvements: ImprovementItemLocal[];
}): CultureAnalyticsSnapshot {
  const positiveBehaviors = input.behaviors.filter((b) => b.tone === "positive").length;
  const atRiskBehaviors = input.behaviors.filter((b) => b.tone === "at_risk").length;
  const activeCampaigns = input.campaigns.filter((c) => c.status === "active").length;
  const openSuggestions = input.suggestions.filter(
    (s) => s.status === "open" || s.status === "reviewing",
  ).length;
  const priorityGaps =
    input.leadership.filter((a) => a.priority && a.status !== "done").length +
    input.improvements.filter((i) => i.priority === "priority" && i.progress < 80).length +
    atRiskBehaviors;

  const leadershipEngagement = avg(
    input.leadership.map((a) => (a.status === "done" ? 100 : a.priority ? 40 : 65)),
    62,
  );
  const workerEmpowerment = avg(
    input.suggestions.map((s) => s.implementationPercent),
    55,
  );
  const trainingExcellence = 84;
  const verificationDiscipline = avg(
    input.campaigns.filter((c) => c.category === "verification").map((c) => c.completion),
    70,
  );
  const incidentTransparency = 78;
  const continuousImprovement = avg(
    input.improvements.map((i) => i.progress),
    50,
  );
  const cultureScore = Math.round(
    (leadershipEngagement +
      workerEmpowerment +
      trainingExcellence +
      verificationDiscipline +
      incidentTransparency +
      continuousImprovement) /
      6,
  );

  return {
    cultureScore,
    leadershipEngagement,
    workerEmpowerment,
    trainingExcellence,
    verificationDiscipline,
    incidentTransparency,
    continuousImprovement,
    positiveBehaviors,
    atRiskBehaviors,
    activeCampaigns,
    openSuggestions,
    priorityGaps,
    correctiveActionClosure: continuousImprovement,
    timestamp: new Date().toISOString(),
  };
}

export function persistCultureAnalytics(snapshot: CultureAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("veriforge:culture-analytics", { detail: snapshot }));
}

export function readCultureAnalytics(): CultureAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CultureAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useCultureAnalyticsSync(
  fallback: CultureAnalyticsSnapshot = {
    cultureScore: 72,
    leadershipEngagement: 62,
    workerEmpowerment: 55,
    trainingExcellence: 84,
    verificationDiscipline: 70,
    incidentTransparency: 78,
    continuousImprovement: 48,
    positiveBehaviors: 1,
    atRiskBehaviors: 1,
    activeCampaigns: 1,
    openSuggestions: 1,
    priorityGaps: 3,
    correctiveActionClosure: 48,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<CultureAnalyticsSnapshot>(
    () => readCultureAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as CultureAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<CultureAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:culture-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veriforge:culture-analytics", onCustom as EventListener);
    };
  }, []);

  return { analytics, setAnalytics };
}

function seedState() {
  const now = new Date().toISOString();
  return {
    behaviors: [
      {
        id: "beh-1",
        title: "Pre-task brief completed",
        description: "Crew ran full LOTO brief before hot work.",
        tone: "positive" as const,
        location: "Bay 4",
        category: "verification" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "beh-2",
        title: "PPE shortcut observed",
        description: "Operator entered cell without FR sleeves.",
        tone: "at_risk" as const,
        location: "Weld Cell",
        category: "training" as const,
        timestamp: now,
        userId: 1,
      },
    ] as CultureBehaviorLocal[],
    campaigns: [
      {
        id: "cmp-1",
        title: "Forge Eyes On",
        description: "Peer observation campaign for verification discipline.",
        status: "active" as const,
        participation: 72,
        completion: 58,
        impact: 64,
        category: "verification" as const,
        timestamp: now,
        userId: 1,
      },
    ] as CultureCampaignLocal[],
    leadership: [
      {
        id: "lead-1",
        title: "Coach night-shift supervisors",
        coach: "A. Mercer",
        feedback: "Reinforce stop-work authority language on floor walks.",
        priority: true,
        status: "open" as const,
        category: "leadership" as const,
        timestamp: now,
        userId: 1,
      },
    ] as LeadershipActionLocal[],
    suggestions: [
      {
        id: "sug-1",
        title: "Add spark screen checklist",
        detail: "Anonymous request for visual checklist at hot-work stations.",
        anonymous: true,
        status: "reviewing" as const,
        implementationPercent: 35,
        category: "empowerment" as const,
        timestamp: now,
        userId: null,
      },
    ] as WorkerSuggestionLocal[],
    improvements: [
      {
        id: "imp-1",
        title: "Close overdue corrective actions",
        detail: "Drive closure rate above 85% this quarter.",
        priority: "priority" as const,
        progress: 48,
        category: "improvement" as const,
        timestamp: now,
        userId: 1,
      },
    ] as ImprovementItemLocal[],
  };
}

export function VeriForgeSafetyCultureProgram() {
  const { push } = useVeriForgeNotifications();
  const seed = React.useMemo(() => seedState(), []);
  const [behaviors, setBehaviors] = React.useState(seed.behaviors);
  const [campaigns, setCampaigns] = React.useState(seed.campaigns);
  const [leadership, setLeadership] = React.useState(seed.leadership);
  const [suggestions, setSuggestions] = React.useState(seed.suggestions);
  const [improvements, setImprovements] = React.useState(seed.improvements);
  const notified = React.useRef(false);
  const seq = React.useRef(10);

  const [behTitle, setBehTitle] = React.useState("");
  const [behDesc, setBehDesc] = React.useState("");
  const [behTone, setBehTone] = React.useState<BehaviorTone>("positive");
  const [behLocation, setBehLocation] = React.useState("");
  const [behCategory, setBehCategory] = React.useState<CulturePillar>("verification");

  const [campTitle, setCampTitle] = React.useState("");
  const [campDesc, setCampDesc] = React.useState("");
  const [campCategory, setCampCategory] = React.useState<CulturePillar>("verification");

  const [leadTitle, setLeadTitle] = React.useState("");
  const [leadCoach, setLeadCoach] = React.useState("");
  const [leadFeedback, setLeadFeedback] = React.useState("");
  const [leadPriority, setLeadPriority] = React.useState("true");

  const [sugTitle, setSugTitle] = React.useState("");
  const [sugDetail, setSugDetail] = React.useState("");

  const [impTitle, setImpTitle] = React.useState("");
  const [impDetail, setImpDetail] = React.useState("");
  const [impPriority, setImpPriority] = React.useState<"normal" | "priority">("priority");

  const analytics = React.useMemo(
    () =>
      computeCultureAnalytics({
        behaviors,
        campaigns,
        leadership,
        suggestions,
        improvements,
      }),
    [behaviors, campaigns, leadership, suggestions, improvements],
  );

  React.useEffect(() => {
    persistCultureAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    if (analytics.priorityGaps <= 0 && analytics.cultureScore >= 70) return;
    if (notified.current) return;
    notified.current = true;
    push({
      category: "compliance",
      tone: "critical",
      title: "CULTURE GAP ALERT",
      message: `Culture score ${analytics.cultureScore}% with ${analytics.priorityGaps} priority gaps.`,
      forgeStatus: "failed",
      userId: 1,
      actionLabel: "Open Culture Program",
    });
  }, [analytics, push]);

  const pillarScores: Record<CulturePillar, number> = {
    leadership: analytics.leadershipEngagement,
    empowerment: analytics.workerEmpowerment,
    training: analytics.trainingExcellence,
    verification: analytics.verificationDiscipline,
    transparency: analytics.incidentTransparency,
    improvement: analytics.continuousImprovement,
  };

  const logBehavior = () => {
    if (!behTitle.trim() || !behDesc.trim()) return;
    setBehaviors((prev) => [
      {
        id: `beh-${seq.current++}`,
        title: behTitle.trim(),
        description: behDesc.trim(),
        tone: behTone,
        location: behLocation.trim() || "Field",
        category: behCategory,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setBehTitle("");
    setBehDesc("");
    setBehLocation("");
    if (behTone === "at_risk") notified.current = false;
  };

  const createCampaign = () => {
    if (!campTitle.trim()) return;
    setCampaigns((prev) => [
      {
        id: `cmp-${seq.current++}`,
        title: campTitle.trim(),
        description: campDesc.trim() || "Engagement campaign",
        status: "active",
        participation: 10,
        completion: 5,
        impact: 8,
        category: campCategory,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setCampTitle("");
    setCampDesc("");
  };

  const bumpCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              participation: clamp(item.participation + 8),
              completion: clamp(item.completion + 6),
              impact: clamp(item.impact + 5),
            }
          : item,
      ),
    );
  };

  const createLeadership = () => {
    if (!leadTitle.trim() || !leadCoach.trim()) return;
    setLeadership((prev) => [
      {
        id: `lead-${seq.current++}`,
        title: leadTitle.trim(),
        coach: leadCoach.trim(),
        feedback: leadFeedback.trim() || "Coaching note pending.",
        priority: leadPriority === "true",
        status: "open",
        category: "leadership",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setLeadTitle("");
    setLeadCoach("");
    setLeadFeedback("");
    if (leadPriority === "true") notified.current = false;
  };

  const submitSuggestion = () => {
    if (!sugTitle.trim() || !sugDetail.trim()) return;
    setSuggestions((prev) => [
      {
        id: `sug-${seq.current++}`,
        title: sugTitle.trim(),
        detail: sugDetail.trim(),
        anonymous: true,
        status: "open",
        implementationPercent: 0,
        category: "empowerment",
        timestamp: new Date().toISOString(),
        userId: null,
      },
      ...prev,
    ]);
    setSugTitle("");
    setSugDetail("");
  };

  const advanceSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const implementationPercent = clamp(item.implementationPercent + 25);
        return {
          ...item,
          implementationPercent,
          status:
            implementationPercent >= 100
              ? "implemented"
              : implementationPercent > 0
                ? "reviewing"
                : "open",
        };
      }),
    );
  };

  const createImprovement = () => {
    if (!impTitle.trim()) return;
    setImprovements((prev) => [
      {
        id: `imp-${seq.current++}`,
        title: impTitle.trim(),
        detail: impDetail.trim() || "Continuous improvement item.",
        priority: impPriority,
        progress: 0,
        category: "improvement",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setImpTitle("");
    setImpDetail("");
    if (impPriority === "priority") notified.current = false;
  };

  return (
    <div className="space-y-4">
      {/* 1. Dashboard */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Safety Culture Dashboard
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Six pillars forged for leadership, empowerment, and industrial performance.
            </p>
          </div>
          <ShieldGridIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric
            label="Culture Score"
            value={`${analytics.cultureScore}%`}
            critical={analytics.cultureScore < 70}
          />
          <Metric
            label="Priority Gaps"
            value={String(analytics.priorityGaps)}
            critical={analytics.priorityGaps > 0}
          />
          <Metric label="Active Campaigns" value={String(analytics.activeCampaigns)} />
          <Metric label="At-Risk Behaviors" value={String(analytics.atRiskBehaviors)} critical={analytics.atRiskBehaviors > 0} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar label="Overall Engagement" value={analytics.cultureScore} />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className={cn(
                "border bg-[#1f1f1f] p-3",
                pillarScores[pillar.id] < 60
                  ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.28)]"
                  : "border-[#424242]",
              )}
            >
              <p className={cn(veriforgeTypography.heading, "text-[10px] text-[#FAFAFA]")}>
                {pillar.label}
              </p>
              <div className="mt-2">
                <VeriForgeProgressBar label="Engagement" value={pillarScores[pillar.id]} />
              </div>
            </div>
          ))}
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 2. Behavior Tracking */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Behavior Tracking
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {behaviors.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border bg-[#1f1f1f] px-3 py-2",
                  item.tone === "at_risk"
                    ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{item.title}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {item.location} · {item.category}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                      timestamp: {item.timestamp.slice(0, 19)} · userId: {item.userId} ·
                      category: {item.category}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-[10px] uppercase",
                      item.tone === "at_risk"
                        ? "border-[#1E6FB8] text-[#ffc9c9]"
                        : "border-[#424242] text-[#d0d0d0]",
                    )}
                  >
                    {item.tone === "at_risk" ? "At-Risk" : "Positive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField label="Behavior" value={behTitle} onChange={(e) => setBehTitle(e.target.value)} />
            <VeriForgeTextField label="Description" value={behDesc} onChange={(e) => setBehDesc(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-3">
              <VeriForgeSelect
                label="Tone"
                value={behTone}
                onChange={(e) => setBehTone(e.target.value as BehaviorTone)}
                options={[
                  { label: "Positive", value: "positive" },
                  { label: "At-Risk", value: "at_risk" },
                ]}
              />
              <VeriForgeTextField label="Location" value={behLocation} onChange={(e) => setBehLocation(e.target.value)} />
              <VeriForgeSelect
                label="Category"
                value={behCategory}
                onChange={(e) => setBehCategory(e.target.value as CulturePillar)}
                options={PILLARS.map((p) => ({ label: p.label, value: p.id }))}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={logBehavior}>
              Log Behavior
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 3. Engagement Campaigns */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Engagement Campaigns
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {campaigns.map((item) => (
              <div
                key={item.id}
                className="border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[#b0b0b0]">{item.description}</p>
                  </div>
                  <VeriForgeButton size="sm" onClick={() => bumpCampaign(item.id)}>
                    Drive Impact
                  </VeriForgeButton>
                </div>
                <div className="mt-3 space-y-2">
                  <VeriForgeProgressBar label="Participation" value={item.participation} />
                  <VeriForgeProgressBar label="Completion" value={item.completion} />
                  <VeriForgeProgressBar label="Impact" value={item.impact} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Campaign Title" value={campTitle} onChange={(e) => setCampTitle(e.target.value)} />
            <VeriForgeTextField label="Description" value={campDesc} onChange={(e) => setCampDesc(e.target.value)} />
            <VeriForgeSelect
              label="Pillar"
              value={campCategory}
              onChange={(e) => setCampCategory(e.target.value as CulturePillar)}
              options={PILLARS.map((p) => ({ label: p.label, value: p.id }))}
            />
            <VeriForgeButton className="w-full" onClick={createCampaign}>
              Launch Campaign
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 4. Leadership Tools */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <AnvilIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              4. Leadership Tools
            </h3>
          </div>
          <div className="mb-3 space-y-2">
            {leadership.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border bg-[#1f1f1f] px-3 py-2",
                  item.priority
                    ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{item.title}</p>
                <p className="text-xs text-[#aaaaaa]">
                  Coach: {item.coach} · {item.status}
                </p>
                <p className="mt-1 text-xs text-[#d0d0d0]">{item.feedback}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[#1f1f1f] p-3">
            <VeriForgeTextField label="Coaching Action" value={leadTitle} onChange={(e) => setLeadTitle(e.target.value)} />
            <VeriForgeTextField label="Coach" value={leadCoach} onChange={(e) => setLeadCoach(e.target.value)} />
            <VeriForgeTextField label="Feedback" value={leadFeedback} onChange={(e) => setLeadFeedback(e.target.value)} />
            <VeriForgeSelect
              label="Priority"
              value={leadPriority}
              onChange={(e) => setLeadPriority(e.target.value)}
              options={[
                { label: "Priority", value: "true" },
                { label: "Normal", value: "false" },
              ]}
            />
            <VeriForgeButton className="w-full" onClick={createLeadership}>
              Add Coaching Card
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 5. Worker Empowerment */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ForgeBoltIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              5. Worker Empowerment
            </h3>
          </div>
          <div className="mb-3 space-y-2">
            {suggestions.map((item) => (
              <div key={item.id} className="border border-[#424242] bg-[#1f1f1f] px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">{item.title}</p>
                    <p className="text-xs text-[#aaaaaa]">
                      {item.anonymous ? "Anonymous" : `userId ${item.userId}`} · {item.status}
                    </p>
                    <p className="mt-1 text-xs text-[#d0d0d0]">{item.detail}</p>
                  </div>
                  <VeriForgeButton size="sm" variant="secondary" onClick={() => advanceSuggestion(item.id)}>
                    +25%
                  </VeriForgeButton>
                </div>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Implementation" value={item.implementationPercent} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Anonymous Suggestion" value={sugTitle} onChange={(e) => setSugTitle(e.target.value)} />
            <VeriForgeTextField label="Detail" value={sugDetail} onChange={(e) => setSugDetail(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={submitSuggestion}>
              Submit Anonymous Report
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      {/* 6. Culture Metrics */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex items-center gap-2">
          <HeatEdgeIcon className="text-[#1E6FB8]" />
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Culture Metrics
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Training Completion", value: analytics.trainingExcellence },
            { label: "Verification Discipline", value: analytics.verificationDiscipline },
            { label: "Incident Transparency", value: analytics.incidentTransparency },
            { label: "Corrective Action Closure", value: analytics.correctiveActionClosure },
          ].map((row) => (
            <div
              key={row.label}
              className={cn(
                "border bg-[#1f1f1f] p-3",
                row.value < 60 ? "border-[#1E6FB8]" : "border-[#424242]",
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{row.label}</p>
              <p className="mt-1 text-lg text-[#FAFAFA]">{row.value}%</p>
              <div className="mt-2 h-2 border border-[#424242] bg-[#121212]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#174F86_0%,#1E6FB8_100%)]"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </VeriForgeFrame>

      {/* 7. Continuous Improvement */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
          7. Continuous Improvement
        </h3>
        <VeriForgeDivider className="my-3" />
        <div className="mb-3 grid gap-2 md:grid-cols-2">
          {improvements.map((item) => (
            <div
              key={item.id}
              className={cn(
                "border bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3",
                item.priority === "priority"
                  ? "border-[#1E6FB8] shadow-[inset_3px_0_0_#1E6FB8]"
                  : "border-[#424242]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-[#f0f0f0]">{item.title}</p>
                  <p className="text-xs text-[#aaaaaa]">{item.detail}</p>
                </div>
                <VeriForgeButton
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setImprovements((prev) =>
                      prev.map((row) =>
                        row.id === item.id
                          ? { ...row, progress: clamp(row.progress + 10) }
                          : row,
                      ),
                    )
                  }
                >
                  +10%
                </VeriForgeButton>
              </div>
              <div className="mt-2">
                <VeriForgeProgressBar label="Progress" value={item.progress} />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <VeriForgeTextField label="Improvement" value={impTitle} onChange={(e) => setImpTitle(e.target.value)} />
          <VeriForgeTextField label="Detail" value={impDetail} onChange={(e) => setImpDetail(e.target.value)} />
          <div className="flex items-end gap-2">
            <VeriForgeSelect
              label="Priority"
              value={impPriority}
              onChange={(e) => setImpPriority(e.target.value as "normal" | "priority")}
              options={[
                { label: "Priority", value: "priority" },
                { label: "Normal", value: "normal" },
              ]}
            />
            <VeriForgeButton onClick={createImprovement}>Add</VeriForgeButton>
          </div>
        </div>
      </VeriForgeFrame>
    </div>
  );
}

function Metric({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-[#424242] bg-[#1f1f1f] px-3 py-2",
        critical && "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{label}</p>
      <p className="mt-1 text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}
