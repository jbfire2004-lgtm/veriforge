"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import {
  AnvilIcon,
  ForgeBoltIcon,
  HeatEdgeIcon,
  ShieldGridIcon,
  VERIFORGE_ICON_CATALOG,
  VERIFORGE_ICON_CATEGORIES,
  ICON_COMPONENT_MAP,
  type IconCategory,
  type IconSpec,
  type IconTone,
} from "./icons";

export type IconographyAnalyticsSnapshot = {
  totalIcons: number;
  categoryCounts: Record<IconCategory, number>;
  viewCount: number;
  criticalSelections: number;
  iconCoverageScore: number;
  selectedId: string | null;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.iconography.analytics";

function emptyCategoryCounts(): Record<IconCategory, number> {
  return VERIFORGE_ICON_CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = 0;
      return acc;
    },
    {} as Record<IconCategory, number>,
  );
}

export function computeIconographyAnalytics(
  viewCount: number,
  criticalSelections: number,
  selectedId: string | null = null,
): IconographyAnalyticsSnapshot {
  const categoryCounts = emptyCategoryCounts();
  for (const icon of VERIFORGE_ICON_CATALOG) {
    categoryCounts[icon.category] += 1;
  }
  const totalIcons = VERIFORGE_ICON_CATALOG.length;
  const coveredCategories = VERIFORGE_ICON_CATEGORIES.filter(
    (c) => categoryCounts[c] > 0,
  ).length;
  const iconCoverageScore = Math.min(
    100,
    Math.round(
      (coveredCategories / VERIFORGE_ICON_CATEGORIES.length) * 70 +
        Math.min(viewCount, 30),
    ),
  );
  return {
    totalIcons,
    categoryCounts,
    viewCount,
    criticalSelections,
    iconCoverageScore,
    selectedId,
    timestamp: new Date().toISOString(),
  };
}

export function persistIconographyAnalytics(snapshot: IconographyAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:iconography-analytics", { detail: snapshot }),
  );
}

export function readIconographyAnalytics(): IconographyAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IconographyAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useIconographyAnalyticsSync(
  fallback: IconographyAnalyticsSnapshot = computeIconographyAnalytics(0, 0),
) {
  const [analytics, setAnalytics] = React.useState<IconographyAnalyticsSnapshot>(
    () => readIconographyAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as IconographyAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<IconographyAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:iconography-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:iconography-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function Metric({
  label,
  value,
  critical,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border px-3 py-2",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
          : "border-[#424242] bg-[#1f1f1f]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">{label}</p>
      <p className="mt-1 font-[var(--vf-font-primary)] text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

function ToneChip({ tone }: { tone: IconTone }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        tone === "critical" || tone === "active"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
          : tone === "contrast"
            ? "border-[#FAFAFA] bg-[#1f1f1f] text-[#FAFAFA]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {tone}
    </span>
  );
}

const SIZES = [16, 24, 32, 48, 64, 128] as const;

export function VeriForgeIndustrialIconographySystem() {
  const { push } = useVeriForgeNotifications();
  const [category, setCategory] = React.useState<IconCategory | "all">("all");
  const [tone, setTone] = React.useState<IconTone>("neutral");
  const [size, setSize] = React.useState<(typeof SIZES)[number]>(32);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    VERIFORGE_ICON_CATALOG[0]?.id ?? null,
  );
  const [viewCount, setViewCount] = React.useState(0);
  const [criticalSelections, setCriticalSelections] = React.useState(0);

  const filtered = React.useMemo(
    () =>
      category === "all"
        ? VERIFORGE_ICON_CATALOG
        : VERIFORGE_ICON_CATALOG.filter((i) => i.category === category),
    [category],
  );

  const selected: IconSpec | undefined = VERIFORGE_ICON_CATALOG.find(
    (i) => i.id === selectedId,
  );
  const SelectedComp = selected
    ? ICON_COMPONENT_MAP[selected.component]
    : undefined;

  const analytics = React.useMemo(
    () => computeIconographyAnalytics(viewCount, criticalSelections, selectedId),
    [viewCount, criticalSelections, selectedId],
  );

  React.useEffect(() => {
    persistIconographyAnalytics(analytics);
  }, [analytics]);

  const selectIcon = (spec: IconSpec) => {
    setSelectedId(spec.id);
    setViewCount((n) => n + 1);
    if (tone === "critical") {
      setCriticalSelections((n) => n + 1);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL ICON STATE",
        message: `${spec.name} rendered with critical tone (alerts only).`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Iconography",
      });
    }
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]")}>
              Industrial iconography
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#A8B0B8]">
              Geometric line icons on muted plates · safety-blue active · teal accents ·
              controlled red for critical alerts only · scales 16–128px
            </p>
          </div>
          <div className="flex gap-2 text-[#1E6FB8]">
            <AnvilIcon />
            <ForgeBoltIcon />
            <ShieldGridIcon />
            <HeatEdgeIcon />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Icons" value={String(analytics.totalIcons)} />
          <Metric label="Views" value={String(analytics.viewCount)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalSelections)}
            critical={analytics.criticalSelections > 0}
          />
          <Metric label="Coverage" value={`${analytics.iconCoverageScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label="Iconography coverage"
            value={analytics.iconCoverageScore}
          />
        </div>
      </VeriForgeFrame>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
            category === "all"
              ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
              : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
          )}
        >
          All
        </button>
        {VERIFORGE_ICON_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              category === c
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-[#424242] bg-[#151515] p-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">Tone</p>
        {(["neutral", "active", "critical", "contrast"] as IconTone[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTone(t)}
            className={cn(
              "border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
              tone === t
                ? "border-[#1E6FB8] text-[#ffc9c9]"
                : "border-[#424242] text-[#9f9f9f]",
            )}
          >
            {t}
          </button>
        ))}
        <VeriForgeDivider className="mx-1 hidden h-6 w-px sm:block" />
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">Size</p>
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={cn(
              "border px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
              size === s
                ? "border-[#1E6FB8] text-[#ffc9c9]"
                : "border-[#424242] text-[#9f9f9f]",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((spec) => {
            const Comp = ICON_COMPONENT_MAP[spec.component];
            if (!Comp) return null;
            const isSelected = selectedId === spec.id;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => selectIcon(spec)}
                className={cn(
                  "vf-icon-tile text-center",
                  isSelected && "is-selected",
                )}
              >
                <Comp tone={tone} size={Math.min(size, 48)} />
                <span className="line-clamp-2 font-[var(--vf-font-primary)] text-[9px] uppercase tracking-[0.1em] text-[#cfcfcf]">
                  {spec.name}
                </span>
              </button>
            );
          })}
        </div>

        <aside className="border border-[#424242] bg-[#1A1A1A] p-4">
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
            Icon Detail
          </p>
          {selected && SelectedComp ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-center border border-[#424242] bg-[#121212] p-6">
                <SelectedComp tone={tone} size={size} />
              </div>
              <div>
                <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#FAFAFA]">
                  {selected.name}
                </p>
                <p className="mt-1 text-xs text-[#9f9f9f]">{selected.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToneChip tone={tone} />
                <span className="border border-[#424242] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                  {selected.category}
                </span>
                <span className="border border-[#424242] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                  {size}px
                </span>
              </div>
              <p className="text-xs text-[#b8b8b8]">
                <span className="text-[#9f9f9f]">Component · </span>
                {selected.component}
              </p>
              <p className="text-xs text-[#b8b8b8]">
                <span className="text-[#9f9f9f]">Usage · </span>
                {selected.usage}
              </p>
              <div className="space-y-1 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                <p>Base · angular geometry</p>
                <p>Fill · metallic gradient</p>
                <p>Outline · steel-grey #424242</p>
                <p>Accent · inspection teal #2F8F8C · active #1E6FB8</p>
                <p>Shadow · industrial drop</p>
              </div>
              <VeriForgeButton
                onClick={() => {
                  setTone("critical");
                  setCriticalSelections((n) => n + 1);
                  setViewCount((n) => n + 1);
                  push({
                    category: "compliance",
                    tone: "critical",
                    title: "ICON CRITICAL ACCENT",
                    message: `${selected.name} forced to critical alert tone.`,
                    forgeStatus: "failed",
                    userId: 1,
                    actionLabel: "Open Iconography",
                  });
                }}
              >
                Force critical accent
              </VeriForgeButton>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#9f9f9f]">Select an icon from the grid.</p>
          )}
        </aside>
      </div>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Scale proof · 16 → 128
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-6">
          {SIZES.map((s) =>
            SelectedComp ? (
              <div key={s} className="flex flex-col items-center gap-2">
                <SelectedComp tone={tone} size={s} />
                <span className="text-[9px] uppercase tracking-[0.1em] text-[#7a7a7a]">
                  {s}px
                </span>
              </div>
            ) : null,
          )}
        </div>
      </VeriForgeFrame>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Usage rules
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#b8b8b8]">
          <li>
            <span className="text-[#1E6FB8]">Red</span> = active, critical, or selected
          </li>
          <li>
            <span className="text-[#8a8a8a]">Steel-grey</span> = neutral
          </li>
          <li>
            <span className="text-[#FAFAFA]">White</span> = high contrast on black
          </li>
          <li>Line icons on muted plates · teal/blue accents · critical red for alerts only</li>
        </ul>
      </VeriForgeFrame>
    </div>
  );
}
