"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";
import { VeriForgeBrandMark } from "./brand-story";

export type SubBrandId =
  | "training"
  | "verification"
  | "compliance"
  | "incidents"
  | "fieldops"
  | "risk"
  | "audit"
  | "contractor"
  | "culture";

export type CampaignStatus = "draft" | "active" | "archived";
export type GovernanceSeverity = "required" | "recommended" | "forbidden";
export type AssetKind = "icon" | "background" | "accent" | "template" | "logo";

export type SubBrandLocal = {
  id: SubBrandId;
  name: string;
  productLine: string;
  accentName: string;
  accentColor: string;
  emblem: string;
  messaging: string;
  active: boolean;
  timestamp: string;
  userId: number;
};

export type ProductLineLocal = {
  id: string;
  subBrandId: SubBrandId;
  name: string;
  code: string;
  logoMark: string;
  gradient: string;
  timestamp: string;
  userId: number;
};

export type BrandCampaignLocal = {
  id: string;
  title: string;
  subBrandId: SubBrandId | "core";
  heroLine: string;
  cta: string;
  status: CampaignStatus;
  reachScore: number;
  timestamp: string;
  userId: number;
};

export type GovernanceRuleLocal = {
  id: string;
  domain: "logo" | "color" | "typography" | "motion";
  rule: string;
  severity: GovernanceSeverity;
  timestamp: string;
  userId: number;
};

export type BrandAssetLocal = {
  id: string;
  kind: AssetKind;
  name: string;
  subBrandId: SubBrandId | "core";
  description: string;
  timestamp: string;
  userId: number;
};

export type BrandExpansionAnalyticsSnapshot = {
  subBrandCount: number;
  activeSubBrands: number;
  productLineCount: number;
  activeCampaigns: number;
  governanceRules: number;
  assetCount: number;
  brandConsistencyScore: number;
  expansionReadiness: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.brand-expansion.analytics";

const CORE_COLORS = {
  forgeRed: "#1E6FB8",
  safetyBlue: "#1E6FB8",
  ironBlack: "#1C1F24",
  steelGrey: "#5A6169",
  safetyWhite: "#F4F6F8",
} as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeBrandExpansionAnalytics(input: {
  subBrands: SubBrandLocal[];
  products: ProductLineLocal[];
  campaigns: BrandCampaignLocal[];
  rules: GovernanceRuleLocal[];
  assets: BrandAssetLocal[];
}): BrandExpansionAnalyticsSnapshot {
  const activeSubBrands = input.subBrands.filter((s) => s.active).length;
  const activeCampaigns = input.campaigns.filter((c) => c.status === "active").length;
  const requiredRules = input.rules.filter((r) => r.severity === "required").length;
  const brandConsistencyScore = clamp(
    (activeSubBrands / Math.max(1, input.subBrands.length)) * 35 +
      (input.products.length / Math.max(1, input.subBrands.length)) * 20 +
      (activeCampaigns > 0 ? 15 : 5) +
      (requiredRules / Math.max(1, input.rules.length)) * 20 +
      (input.assets.length >= 8 ? 10 : 5),
  );
  return {
    subBrandCount: input.subBrands.length,
    activeSubBrands,
    productLineCount: input.products.length,
    activeCampaigns,
    governanceRules: input.rules.length,
    assetCount: input.assets.length,
    brandConsistencyScore,
    expansionReadiness: brandConsistencyScore,
    timestamp: new Date().toISOString(),
  };
}

export function persistBrandExpansionAnalytics(snapshot: BrandExpansionAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:brand-expansion-analytics", { detail: snapshot }),
  );
}

export function readBrandExpansionAnalytics(): BrandExpansionAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BrandExpansionAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useBrandExpansionAnalyticsSync(
  fallback: BrandExpansionAnalyticsSnapshot = {
    subBrandCount: 9,
    activeSubBrands: 9,
    productLineCount: 9,
    activeCampaigns: 2,
    governanceRules: 12,
    assetCount: 11,
    brandConsistencyScore: 94,
    expansionReadiness: 94,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<BrandExpansionAnalyticsSnapshot>(
    () => readBrandExpansionAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as BrandExpansionAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<BrandExpansionAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:brand-expansion-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:brand-expansion-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seed() {
  const now = new Date().toISOString();
  const userId = 1;
  const subBrands: SubBrandLocal[] = [
    {
      id: "training",
      name: "VeriForge Training",
      productLine: "ForgeTrain",
      accentName: "steel-blue",
      accentColor: "#4A6FA5",
      emblem: "Forged V + bolt",
      messaging: "Train with industrial precision.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "verification",
      name: "VeriForge Verification",
      productLine: "ForgeCheck",
      accentName: "ember-orange",
      accentColor: "#E65100",
      emblem: "Forged V + check rail",
      messaging: "Verify what was forged.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "compliance",
      name: "VeriForge Compliance",
      productLine: "ForgeSeal",
      accentName: "slate-teal",
      accentColor: "#2F6F6A",
      emblem: "Forged V + seal",
      messaging: "Compliance engineered to hold.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "incidents",
      name: "VeriForge Incidents",
      productLine: "ForgeSignal",
      accentName: "hazard-yellow",
      accentColor: "#F9A825",
      emblem: "Forged V + alert edge",
      messaging: "Capture. Investigate. Close.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "fieldops",
      name: "VeriForge FieldOps",
      productLine: "ForgeField",
      accentName: "oxide-green",
      accentColor: "#558B2F",
      emblem: "Forged V + map pin",
      messaging: "Field command, forged in place.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "risk",
      name: "VeriForge Risk",
      productLine: "ForgeRisk",
      accentName: "crimson-steel",
      accentColor: "#8E2430",
      emblem: "Forged V + heat edge",
      messaging: "Risk scored before it spreads.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "audit",
      name: "VeriForge Audit",
      productLine: "ForgeLedger",
      accentName: "graphite-silver",
      accentColor: "#9E9E9E",
      emblem: "Forged V + ledger",
      messaging: "Audits with metallic clarity.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "contractor",
      name: "VeriForge Contractor",
      productLine: "ForgeGate",
      accentName: "bronze",
      accentColor: "#A67C52",
      emblem: "Forged V + gate",
      messaging: "Contractors cleared to enter.",
      active: true,
      timestamp: now,
      userId,
    },
    {
      id: "culture",
      name: "VeriForge Culture",
      productLine: "ForgePulse",
      accentName: "violet-steel",
      accentColor: "#6A5ACD",
      emblem: "Forged V + pulse",
      messaging: "Culture measured in behavior.",
      active: true,
      timestamp: now,
      userId,
    },
  ];

  const products: ProductLineLocal[] = subBrands.map((sb, i) => ({
    id: `pl-${i + 1}`,
    subBrandId: sb.id,
    name: `${sb.productLine} Suite`,
    code: `VF-${sb.id.toUpperCase().slice(0, 3)}-01`,
    logoMark: `Angular ${sb.productLine} mark`,
    gradient: `linear-gradient(145deg, #1A1A1A 0%, #424242 55%, ${sb.accentColor}33 100%)`,
    timestamp: now,
    userId,
  }));

  const campaigns: BrandCampaignLocal[] = [
    {
      id: "cmp-1",
      title: "Absolute Safety Launch",
      subBrandId: "core",
      heroLine: "Forged for Absolute Safety",
      cta: "Enter the Forge",
      status: "active",
      reachScore: 92,
      timestamp: now,
      userId,
    },
    {
      id: "cmp-2",
      title: "ForgeCheck Precision Drive",
      subBrandId: "verification",
      heroLine: "Verification engineered with precision.",
      cta: "Run forgeCheck",
      status: "active",
      reachScore: 84,
      timestamp: now,
      userId,
    },
    {
      id: "cmp-3",
      title: "FieldOps Command Push",
      subBrandId: "fieldops",
      heroLine: "Field command, forged in place.",
      cta: "Open Field Ops",
      status: "draft",
      reachScore: 61,
      timestamp: now,
      userId,
    },
  ];

  const rules: GovernanceRuleLocal[] = [
    {
      id: "gr-1",
      domain: "logo",
      rule: "Always use the forged V emblem; never round or soft-edge the mark.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-2",
      domain: "logo",
      rule: "Minimum clear space = height of the V stem on all sides.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-3",
      domain: "color",
      rule: "Core palette locked: #1E6FB8, #2F8F8C, #2A2E33, #3B3F45, #F4F6F8.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-4",
      domain: "color",
      rule: "Sub-brand accents are secondary only; safety blue remains primary CTA. Critical red is alerts-only.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-5",
      domain: "color",
      rule: "Forbidden: purple-on-white defaults, cream terracotta stacks, soft pastels.",
      severity: "forbidden",
      timestamp: now,
      userId,
    },
    {
      id: "gr-6",
      domain: "typography",
      rule: "Headings: Orbitron/Exo 2, uppercase, bold geometric tracking.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-7",
      domain: "typography",
      rule: "Do not use Inter, Roboto, Arial, or system UI as brand display fonts.",
      severity: "forbidden",
      timestamp: now,
      userId,
    },
    {
      id: "gr-8",
      domain: "motion",
      rule: "Motion must reinforce hierarchy: heat glow, edge wipe, metallic rise.",
      severity: "recommended",
      timestamp: now,
      userId,
    },
    {
      id: "gr-9",
      domain: "motion",
      rule: "No bounce, confetti, or playful easing on industrial surfaces.",
      severity: "forbidden",
      timestamp: now,
      userId,
    },
    {
      id: "gr-10",
      domain: "logo",
      rule: "Do not place logo on busy photography without steel panel backing.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-11",
      domain: "color",
      rule: "Critical alerts use muted critical (#B54A4A) only; never for primary actions.",
      severity: "required",
      timestamp: now,
      userId,
    },
    {
      id: "gr-12",
      domain: "typography",
      rule: "Body copy may use Exo 2 regular; keep industrial density.",
      severity: "recommended",
      timestamp: now,
      userId,
    },
  ];

  const assets: BrandAssetLocal[] = [
    {
      id: "ba-1",
      kind: "logo",
      name: "Forged V Core Mark",
      subBrandId: "core",
      description: "Primary angular emblem with red metallic fill",
      timestamp: now,
      userId,
    },
    {
      id: "ba-2",
      kind: "icon",
      name: "Anvil Icon Set",
      subBrandId: "core",
      description: "Angular industrial icons",
      timestamp: now,
      userId,
    },
    {
      id: "ba-3",
      kind: "icon",
      name: "ForgeBolt Icon",
      subBrandId: "verification",
      description: "Verification bolt mark",
      timestamp: now,
      userId,
    },
    {
      id: "ba-4",
      kind: "background",
      name: "Iron Plate Gradient",
      subBrandId: "core",
      description: "linear-gradient(145deg, #1A1A1A, #424242)",
      timestamp: now,
      userId,
    },
    {
      id: "ba-5",
      kind: "accent",
      name: "Red Accent Line",
      subBrandId: "core",
      description: "0.5–2px forge-red rule with glow",
      timestamp: now,
      userId,
    },
    {
      id: "ba-6",
      kind: "template",
      name: "Campaign Hero Template",
      subBrandId: "core",
      description: "Angular hero + red metallic CTA",
      timestamp: now,
      userId,
    },
    {
      id: "ba-7",
      kind: "template",
      name: "Sub-Brand Card Template",
      subBrandId: "training",
      description: "Accent stripe + forged V lockup",
      timestamp: now,
      userId,
    },
    {
      id: "ba-8",
      kind: "background",
      name: "Hazard Field Mesh",
      subBrandId: "incidents",
      description: "Steel grid with hazard-yellow edge",
      timestamp: now,
      userId,
    },
    {
      id: "ba-9",
      kind: "logo",
      name: "ForgeCheck Product Mark",
      subBrandId: "verification",
      description: "Angular product logo",
      timestamp: now,
      userId,
    },
    {
      id: "ba-10",
      kind: "icon",
      name: "Shield Grid Icon",
      subBrandId: "compliance",
      description: "Compliance shield grid",
      timestamp: now,
      userId,
    },
    {
      id: "ba-11",
      kind: "accent",
      name: "Sub-Brand Accent Rails",
      subBrandId: "fieldops",
      description: "Secondary accent left rail",
      timestamp: now,
      userId,
    },
  ];

  return { subBrands, products, campaigns, rules, assets };
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

function ForgedVMini({ accent }: { accent?: string }) {
  return (
    <div
      className="relative grid h-10 w-10 place-items-center border border-[#1E6FB8] bg-[linear-gradient(150deg,#3a1010_0%,#1E6FB8_45%,#174F86_100%)]"
      style={accent ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
    >
      <svg viewBox="0 0 48 48" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M8 10h12l4 8 4-8h12L28 38l-4-8-4 8L8 10Z"
          stroke="#FAFAFA"
          strokeWidth="2.2"
          fill="rgba(250,250,250,.08)"
        />
      </svg>
    </div>
  );
}

export function VeriForgeBrandExpansionSystem() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [subBrands, setSubBrands] = React.useState(initial.subBrands);
  const [products, setProducts] = React.useState(initial.products);
  const [campaigns, setCampaigns] = React.useState(initial.campaigns);
  const [rules, setRules] = React.useState(initial.rules);
  const [assets, setAssets] = React.useState(initial.assets);
  const [selected, setSelected] = React.useState<SubBrandId>("training");
  const notified = React.useRef<Set<string>>(new Set());
  const seq = React.useRef(40);

  const [productName, setProductName] = React.useState("");
  const [campaignTitle, setCampaignTitle] = React.useState("");
  const [ruleText, setRuleText] = React.useState("");
  const [ruleDomain, setRuleDomain] = React.useState<"logo" | "color" | "typography" | "motion">(
    "logo",
  );
  const [assetName, setAssetName] = React.useState("");
  const [assetKind, setAssetKind] = React.useState<AssetKind>("icon");

  const active = subBrands.find((s) => s.id === selected) ?? subBrands[0];

  const analytics = React.useMemo(
    () =>
      computeBrandExpansionAnalytics({
        subBrands,
        products,
        campaigns,
        rules,
        assets,
      }),
    [subBrands, products, campaigns, rules, assets],
  );

  React.useEffect(() => {
    persistBrandExpansionAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const sb of subBrands) {
      if (sb.active) continue;
      if (notified.current.has(sb.id)) continue;
      notified.current.add(sb.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "SUB-BRAND DEACTIVATED",
        message: `${sb.name} deactivated in brand expansion registry.`,
        forgeStatus: "failed",
        userId: sb.userId,
        actionLabel: "Open Brand Expansion",
      });
    }
  }, [subBrands, push]);

  const toggleSubBrand = (id: SubBrandId) => {
    setSubBrands((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              active: !s.active,
              timestamp: new Date().toISOString(),
              userId: 1,
            }
          : s,
      ),
    );
    if (subBrands.find((s) => s.id === id)?.active) {
      notified.current.delete(id);
    }
  };

  const createProduct = () => {
    if (!productName.trim() || !active) return;
    setProducts((prev) => [
      {
        id: `pl-${seq.current++}`,
        subBrandId: active.id,
        name: productName.trim(),
        code: `VF-${active.id.toUpperCase().slice(0, 3)}-${String(seq.current).padStart(2, "0")}`,
        logoMark: `Angular ${productName.trim()} mark`,
        gradient: `linear-gradient(145deg, #1A1A1A 0%, #424242 55%, ${active.accentColor}33 100%)`,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setProductName("");
  };

  const createCampaign = () => {
    if (!campaignTitle.trim()) return;
    setCampaigns((prev) => [
      {
        id: `cmp-${seq.current++}`,
        title: campaignTitle.trim(),
        subBrandId: selected,
        heroLine: "Forged for Absolute Safety",
        cta: "Enter the Forge",
        status: "draft",
        reachScore: 50,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setCampaignTitle("");
  };

  const activateCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "active",
              reachScore: clamp(c.reachScore + 15),
              timestamp: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const addRule = () => {
    if (!ruleText.trim()) return;
    setRules((prev) => [
      {
        id: `gr-${seq.current++}`,
        domain: ruleDomain,
        rule: ruleText.trim(),
        severity: "required",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setRuleText("");
  };

  const addAsset = () => {
    if (!assetName.trim()) return;
    setAssets((prev) => [
      {
        id: `ba-${seq.current++}`,
        kind: assetKind,
        name: assetName.trim(),
        subBrandId: selected,
        description: `Industrial ${assetKind} asset`,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setAssetName("");
  };

  return (
    <div className="space-y-4">
      {/* 1. Core Brand Identity */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <VeriForgeBrandMark className="h-20 w-20" />
            <div>
              <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
                Brand Expansion System
              </h2>
              <p className="mt-1 text-sm text-[#c7c7c7]">
                Core identity · sub-brands · product lines · campaigns · governance · assets
              </p>
              <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
              <p className="mt-3 font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.14em] text-[#ffc9c9]">
                Forged for Absolute Safety
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {Object.entries(CORE_COLORS).map(([name, hex]) => (
              <div key={name} className="text-center">
                <div
                  className="h-10 w-10 border border-[#424242]"
                  style={{ background: hex }}
                  title={name}
                />
                <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-[#8f8f8f]">
                  {hex}
                </p>
              </div>
            ))}
          </div>
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Sub-brands" value={String(analytics.subBrandCount)} />
          <Metric
            label="Active"
            value={String(analytics.activeSubBrands)}
            critical={analytics.activeSubBrands < analytics.subBrandCount}
          />
          <Metric label="Campaigns" value={String(analytics.activeCampaigns)} />
          <Metric label="Assets" value={String(analytics.assetCount)} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar
            label="Brand Consistency Score"
            value={analytics.brandConsistencyScore}
          />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
          Angular geometry · metallic gradients · Orbitron/Exo 2 · forged V emblem
        </p>
      </VeriForgeFrame>

      {/* 2–3. Sub-brand structure + visual rules */}
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
          2–3. Sub-Brand Structure & Visual Rules
        </h3>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {subBrands.map((sb) => (
            <button
              key={sb.id}
              type="button"
              onClick={() => setSelected(sb.id)}
              className={cn(
                "border px-3 py-3 text-left",
                selected === sb.id
                  ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                  : !sb.active
                    ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
              )}
              style={{ boxShadow: selected === sb.id ? undefined : `inset 3px 0 0 ${sb.accentColor}` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <ForgedVMini accent={sb.accentColor} />
                <div>
                  <p className="text-sm text-[#FAFAFA]">{sb.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                    {sb.productLine} · {sb.accentName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#aaaaaa]">{sb.messaging}</p>
              <p className="mt-1 text-[10px] text-[#8f8f8f]">{sb.emblem}</p>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className="inline-block h-3 w-8 border border-[#424242]"
                  style={{ background: sb.accentColor }}
                />
                <VeriForgeButton
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubBrand(sb.id);
                  }}
                >
                  {sb.active ? "Deactivate" : "Activate"}
                </VeriForgeButton>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#ffc9c9]">
          Rule: forged V on every sub-brand · accent is secondary rail only · safety blue stays CTA
        </p>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 4. Product lines */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Product Line Expansion
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {products
              .filter((p) => p.subBrandId === selected)
              .map((p) => (
                <div
                  key={p.id}
                  className="border border-[#424242] p-3"
                  style={{ background: p.gradient }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <ForgedVMini
                      accent={subBrands.find((s) => s.id === p.subBrandId)?.accentColor}
                    />
                    <div>
                      <p className="text-sm text-[#FAFAFA]">{p.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                        {p.code} · {p.logoMark}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <VeriForgeTextField
                label={`New ${active?.productLine ?? "product"} line`}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <VeriForgeButton onClick={createProduct}>Add Product</VeriForgeButton>
            </div>
          </div>
        </VeriForgeFrame>

        {/* 5. Campaigns */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Campaign System
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="relative overflow-hidden border border-[#424242] bg-[linear-gradient(160deg,#1f1f1f_0%,#141414_55%,#1a1212_100%)] p-4"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#1E6FB8,transparent)]" />
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#ffc9c9]">
                  {c.subBrandId} · {c.status}
                </p>
                <p className={cn(veriforgeTypography.heading, "mt-2 text-base text-[#FAFAFA]")}>
                  {c.heroLine}
                </p>
                <div className="mt-2 h-0.5 w-20 bg-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.5)]" />
                <p className="mt-2 text-xs text-[#aaaaaa]">{c.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-[3px] border border-[#1F2328] bg-[#2A2E33] px-4 py-2 font-[var(--vf-font-primary)] text-[12px] font-medium tracking-[0.02em] text-[#F4F6F8] transition hover:-translate-y-px hover:bg-[#3B3F45]"
                  >
                    {c.cta}
                  </button>
                  {c.status !== "active" ? (
                    <VeriForgeButton size="sm" onClick={() => activateCampaign(c.id)}>
                      Activate
                    </VeriForgeButton>
                  ) : null}
                </div>
                <div className="mt-2">
                  <VeriForgeProgressBar label="Reach" value={c.reachScore} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <VeriForgeTextField
                label="Campaign title"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <VeriForgeButton onClick={createCampaign}>Create Campaign</VeriForgeButton>
            </div>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 6. Governance */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Brand Governance
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 max-h-72 space-y-2 overflow-y-auto">
            {rules.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "border px-3 py-2",
                  r.severity === "forbidden"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                  {r.domain} · {r.severity}
                </p>
                <p className="mt-1 text-sm text-[#f0f0f0]">{r.rule}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeSelect
              label="Domain"
              value={ruleDomain}
              onChange={(e) =>
                setRuleDomain(e.target.value as "logo" | "color" | "typography" | "motion")
              }
              options={[
                { label: "Logo", value: "logo" },
                { label: "Color", value: "color" },
                { label: "Typography", value: "typography" },
                { label: "Motion", value: "motion" },
              ]}
            />
            <VeriForgeTextField
              label="Rule"
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={addRule}>
              Add Governance Rule
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 7. Asset library */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. Brand Asset Library
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 flex gap-3 text-[#1E6FB8]">
            <AnvilIcon />
            <ForgeBoltIcon />
            <ShieldGridIcon />
            <HeatEdgeIcon />
          </div>
          <div className="mb-3 grid gap-2 md:grid-cols-2">
            {assets.map((a) => (
              <div key={a.id} className="border border-[#424242] bg-[#1f1f1f] px-3 py-2">
                <div className="mb-1 h-0.5 w-10 bg-[#1E6FB8]" />
                <p className="text-sm text-[#f0f0f0]">{a.name}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  {a.kind} · {a.subBrandId}
                </p>
                <p className="mt-1 text-xs text-[#aaaaaa]">{a.description}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeSelect
              label="Kind"
              value={assetKind}
              onChange={(e) => setAssetKind(e.target.value as AssetKind)}
              options={[
                { label: "Icon", value: "icon" },
                { label: "Background", value: "background" },
                { label: "Accent", value: "accent" },
                { label: "Template", value: "template" },
                { label: "Logo", value: "logo" },
              ]}
            />
            <VeriForgeTextField
              label="Asset name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={addAsset}>
              Add Asset
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      {active ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Active sub-brand · {active.name} · accent {active.accentColor} · timestamp:{" "}
          {active.timestamp.slice(0, 19)} · userId: {active.userId}
        </p>
      ) : null}
    </div>
  );
}
