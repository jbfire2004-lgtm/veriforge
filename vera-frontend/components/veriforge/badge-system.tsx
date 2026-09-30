"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type ForgeCheckStatus = "Pass" | "Fail" | "Pending";
export type ComplianceBadgeStatus = "valid" | "expired" | "pending";
export type BadgeValidity = "valid" | "invalid" | "expired";
export type AccessDecision = "ALLOW" | "DENY";

export type DigitalBadgeLocal = {
  badgeId: string;
  userId: number;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  photoInitials: string;
  qrPayload: string;
  trainingPercent: number;
  forgeStatus: ForgeCheckStatus;
  complianceStatus: ComplianceBadgeStatus;
  complianceScore: number;
  accessDecision: AccessDecision;
  validity: BadgeValidity;
  expiresAt: string;
  timestamp: string;
};

export type BadgeAnalyticsSnapshot = {
  totalBadges: number;
  validCount: number;
  invalidCount: number;
  expiredCount: number;
  allowRate: number;
  denyCount: number;
  averageTraining: number;
  expiredCompliance: number;
  timestamp: string;
};

export type BadgeScanLocal = {
  badgeId: string;
  accessDecision: AccessDecision;
  reasons: string[];
  scannedAt: string;
};

const STORAGE_KEY = "veriforge.badge.analytics";

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function evaluateBadge(
  badge: Omit<DigitalBadgeLocal, "accessDecision" | "validity" | "qrPayload"> & {
    qrPayload?: string;
  },
): Pick<DigitalBadgeLocal, "accessDecision" | "validity" | "qrPayload"> {
  const reasons: string[] = [];
  const expired = new Date(badge.expiresAt).getTime() < Date.now();
  if (expired) reasons.push("Badge expired");
  if (badge.trainingPercent < 80) reasons.push("Training below 80%");
  if (badge.forgeStatus !== "Pass") reasons.push(`forgeCheck ${badge.forgeStatus}`);
  if (badge.complianceStatus === "expired") reasons.push("Compliance expired");
  if (badge.complianceStatus === "pending") reasons.push("Compliance pending");
  if (badge.complianceScore < 70) reasons.push("Compliance score below 70");

  const accessDecision: AccessDecision = reasons.length === 0 ? "ALLOW" : "DENY";
  const validity: BadgeValidity = expired
    ? "expired"
    : accessDecision === "ALLOW"
      ? "valid"
      : "invalid";
  const qrPayload =
    badge.qrPayload ||
    `veriforge://badge/${badge.badgeId}?u=${badge.userId}&t=${encodeURIComponent(badge.timestamp)}`;
  return { accessDecision, validity, qrPayload };
}

function withEvaluation(
  partial: Omit<DigitalBadgeLocal, "accessDecision" | "validity" | "qrPayload"> & {
    qrPayload?: string;
  },
): DigitalBadgeLocal {
  return { ...partial, ...evaluateBadge(partial) };
}

export function computeBadgeAnalytics(badges: DigitalBadgeLocal[]): BadgeAnalyticsSnapshot {
  const total = badges.length;
  return {
    totalBadges: total,
    validCount: badges.filter((item) => item.validity === "valid").length,
    invalidCount: badges.filter((item) => item.validity === "invalid").length,
    expiredCount: badges.filter((item) => item.validity === "expired").length,
    allowRate:
      total === 0
        ? 0
        : Math.round(
            (badges.filter((item) => item.accessDecision === "ALLOW").length / total) * 100,
          ),
    denyCount: badges.filter((item) => item.accessDecision === "DENY").length,
    averageTraining:
      total === 0
        ? 0
        : Math.round(badges.reduce((sum, item) => sum + item.trainingPercent, 0) / total),
    expiredCompliance: badges.filter((item) => item.complianceStatus === "expired").length,
    timestamp: new Date().toISOString(),
  };
}

export function persistBadgeAnalytics(snapshot: BadgeAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("veriforge:badge-analytics", { detail: snapshot }));
}

export function readBadgeAnalytics(): BadgeAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BadgeAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useBadgeAnalyticsSync(
  fallback: BadgeAnalyticsSnapshot = {
    totalBadges: 2,
    validCount: 1,
    invalidCount: 0,
    expiredCount: 1,
    allowRate: 50,
    denyCount: 1,
    averageTraining: 73,
    expiredCompliance: 1,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<BadgeAnalyticsSnapshot>(
    () => readBadgeAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as BadgeAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<BadgeAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:badge-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("veriforge:badge-analytics", onCustom as EventListener);
    };
  }, []);

  return { analytics, setAnalytics };
}

function seedBadges(): DigitalBadgeLocal[] {
  const now = new Date().toISOString();
  return [
    withEvaluation({
      badgeId: "VF-BDG-1001",
      userId: 101,
      firstName: "Jordan",
      lastName: "Forge",
      role: "Field Operator",
      company: "Alloy Works",
      photoInitials: "JF",
      trainingPercent: 92,
      forgeStatus: "Pass",
      complianceStatus: "valid",
      complianceScore: 88,
      expiresAt: new Date(Date.now() + 120 * 86400000).toISOString(),
      timestamp: now,
    }),
    withEvaluation({
      badgeId: "VF-BDG-1002",
      userId: 102,
      firstName: "Riley",
      lastName: "Steel",
      role: "Welder",
      company: "ForgeCo Industries",
      photoInitials: "RS",
      trainingPercent: 54,
      forgeStatus: "Fail",
      complianceStatus: "expired",
      complianceScore: 41,
      expiresAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      timestamp: now,
    }),
  ];
}

export function ForgeStatusChip({ status }: { status: ForgeCheckStatus }) {
  const styles = {
    Pass: "border-[#4a654a] bg-[rgba(74,101,74,.2)] text-[#b8e0b8]",
    Fail: "border-[#1E6FB8] bg-[rgba(30, 111, 184,.22)] text-[#ffc9c9] shadow-[0_0_10px_rgba(30, 111, 184,.35)]",
    Pending: "border-[#6a5a2a] bg-[rgba(120,100,40,.2)] text-[#f0e0a8]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

export function AccessDecisionCard({
  decision,
  reasons,
}: {
  decision: AccessDecision;
  reasons: string[];
}) {
  const allow = decision === "ALLOW";
  return (
    <div
      className={cn(
        "border p-4",
        allow
          ? "border-[#4a654a] bg-[linear-gradient(145deg,#1f2b1f_0%,#141914_100%)]"
          : "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#1a1010_100%)] shadow-[0_0_18px_rgba(30, 111, 184,.35)]",
      )}
    >
      <p className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
        Access Decision
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-[var(--vf-font-primary)] tracking-[0.12em]",
          allow ? "text-[#b8e0b8]" : "text-[#ffc9c9]",
        )}
      >
        {decision}
      </p>
      {reasons.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#ffd0d0]">
          {reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-[#b8e0b8]">
          Training, forgeCheck, and compliance gates cleared.
        </p>
      )}
    </div>
  );
}

/** Angular faux-QR using deterministic cell pattern from badgeId */
export function VeriForgeQrMark({
  payload,
  className,
}: {
  payload: string;
  className?: string;
}) {
  const cells = React.useMemo(() => {
    const size = 11;
    const grid: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < payload.length; i += 1) {
      hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
    }
    for (let r = 0; r < size; r += 1) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c += 1) {
        const finder =
          (r < 3 && c < 3) ||
          (r < 3 && c >= size - 3) ||
          (r >= size - 3 && c < 3);
        if (finder) {
          row.push(true);
          continue;
        }
        const bit = (hash >> ((r * size + c) % 24)) & 1;
        row.push(bit === 1 || ((r + c + hash) % 5 === 0));
      }
      grid.push(row);
    }
    return grid;
  }, [payload]);

  return (
    <div
      className={cn(
        "border border-[#1E6FB8] bg-[#0f0f0f] p-2 shadow-[0_0_12px_rgba(30, 111, 184,.25)]",
        className,
      )}
      title={payload}
    >
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((on, c) => (
            <div
              key={`${r}-${c}`}
              className={cn("aspect-square", on ? "bg-[#FAFAFA]" : "bg-[#1A1A1A]")}
            />
          )),
        )}
      </div>
    </div>
  );
}

export function VeriForgeDigitalBadgeCard({
  badge,
  compact = false,
}: {
  badge: DigitalBadgeLocal;
  compact?: boolean;
}) {
  const critical =
    badge.validity !== "valid" ||
    badge.complianceStatus === "expired" ||
    badge.accessDecision === "DENY";

  return (
    <div
      className={cn(
        "border bg-[linear-gradient(155deg,#222_0%,#1A1A1A_45%,#141414_100%)] p-4",
        critical
          ? "border-[#1E6FB8] shadow-[0_0_18px_rgba(30, 111, 184,.3)]"
          : "border-[#424242]",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center border border-[#1E6FB8] bg-[#151515] font-[var(--vf-font-primary)] text-lg text-[#FAFAFA] shadow-[inset_0_0_12px_rgba(30, 111, 184,.2)]">
            {badge.photoInitials}
          </div>
          <div>
            <p className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              {badge.firstName} {badge.lastName}
            </p>
            <p className="text-xs text-[#b0b0b0]">
              {badge.role} · {badge.company}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              {badge.badgeId}
            </p>
          </div>
        </div>
        <VeriForgeQrMark payload={badge.qrPayload} className="w-20" />
      </div>

      <div className="mb-2 h-0.5 w-full bg-[linear-gradient(90deg,#1E6FB8_0%,transparent_100%)]" />

      <div className="space-y-2">
        <VeriForgeProgressBar label="Training" value={badge.trainingPercent} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
            forgeCheck
          </span>
          <ForgeStatusChip status={badge.forgeStatus} />
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
            Compliance
          </span>
          <span
            className={cn(
              "border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
              badge.complianceStatus === "expired"
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9] shadow-[0_0_10px_rgba(30, 111, 184,.35)]"
                : badge.complianceStatus === "valid"
                  ? "border-[#4a654a] text-[#b8e0b8]"
                  : "border-[#6a5a2a] text-[#f0e0a8]",
            )}
          >
            {badge.complianceStatus} · {badge.complianceScore}%
          </span>
        </div>
      </div>

      {!compact ? (
        <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
          timestamp: {badge.timestamp.slice(0, 19)} · userId: {badge.userId} · badgeId:{" "}
          {badge.badgeId}
        </p>
      ) : null}
    </div>
  );
}

export function VeriForgeBadgeSystem() {
  const { push } = useVeriForgeNotifications();
  const [badges, setBadges] = React.useState<DigitalBadgeLocal[]>(() => seedBadges());
  const [selectedId, setSelectedId] = React.useState("VF-BDG-1001");
  const [scanResult, setScanResult] = React.useState<BadgeScanLocal | null>(null);
  const [scanInput, setScanInput] = React.useState("VF-BDG-1001");
  const notified = React.useRef<Set<string>>(new Set(["VF-BDG-1002"]));
  const seq = React.useRef(3);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [role, setRole] = React.useState("Field Operator");
  const [company, setCompany] = React.useState("");
  const [trainingPercent, setTrainingPercent] = React.useState(85);
  const [forgeStatus, setForgeStatus] = React.useState<ForgeCheckStatus>("Pass");
  const [complianceStatus, setComplianceStatus] =
    React.useState<ComplianceBadgeStatus>("valid");
  const [complianceScore, setComplianceScore] = React.useState(80);

  const selected = badges.find((item) => item.badgeId === selectedId) ?? badges[0];
  const analytics = React.useMemo(() => computeBadgeAnalytics(badges), [badges]);

  React.useEffect(() => {
    persistBadgeAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const badge of badges) {
      if (badge.complianceStatus !== "expired" && badge.validity !== "expired") continue;
      if (notified.current.has(badge.badgeId)) continue;
      notified.current.add(badge.badgeId);
      push({
        category: "compliance",
        tone: "critical",
        title: "BADGE COMPLIANCE EXPIRED",
        message: `${badge.firstName} ${badge.lastName} (${badge.badgeId}) requires renewal.`,
        forgeStatus: "failed",
        userId: badge.userId,
        actionLabel: "Open Badges",
      });
    }
  }, [badges, push]);

  const createBadge = () => {
    if (!firstName.trim() || !lastName.trim() || !company.trim()) return;
    const badgeId = `VF-BDG-${1000 + seq.current++}`;
    const now = new Date().toISOString();
    const badge = withEvaluation({
      badgeId,
      userId: 100 + seq.current,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      company: company.trim(),
      photoInitials: initials(firstName.trim(), lastName.trim()),
      trainingPercent,
      forgeStatus,
      complianceStatus,
      complianceScore,
      expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
      timestamp: now,
    });
    setBadges((prev) => [badge, ...prev]);
    setSelectedId(badge.badgeId);
    setScanInput(badge.badgeId);
    setFirstName("");
    setLastName("");
    setCompany("");
  };

  const scanBadge = (badgeId: string) => {
    const badge = badges.find((item) => item.badgeId === badgeId);
    if (!badge) {
      setScanResult({
        badgeId,
        accessDecision: "DENY",
        reasons: ["Badge not found"],
        scannedAt: new Date().toISOString(),
      });
      return;
    }
    const evaluation = evaluateBadge(badge);
    const reasons: string[] = [];
    if (evaluation.validity === "expired") reasons.push("Badge expired");
    if (badge.trainingPercent < 80) reasons.push("Training below 80%");
    if (badge.forgeStatus !== "Pass") reasons.push(`forgeCheck ${badge.forgeStatus}`);
    if (badge.complianceStatus === "expired") reasons.push("Compliance expired");
    if (badge.complianceStatus === "pending") reasons.push("Compliance pending");
    if (badge.complianceScore < 70) reasons.push("Compliance score below 70");

    const result: BadgeScanLocal = {
      badgeId: badge.badgeId,
      accessDecision: evaluation.accessDecision,
      reasons,
      scannedAt: new Date().toISOString(),
    };
    setScanResult(result);
    setSelectedId(badge.badgeId);
    if (result.accessDecision === "DENY") {
      push({
        category: "verification",
        tone: "critical",
        title: "BADGE ACCESS DENIED",
        message: `${badge.firstName} ${badge.lastName}: ${reasons.join("; ")}`,
        forgeStatus: "failed",
        userId: badge.userId,
      });
    }
  };

  const bumpTraining = () => {
    if (!selected) return;
    setBadges((prev) =>
      prev.map((item) =>
        item.badgeId === selected.badgeId
          ? withEvaluation({
              ...item,
              trainingPercent: Math.min(100, item.trainingPercent + 10),
            })
          : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Digital ID + Badge System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Forge industrial badges with QR access, training, verification, and compliance gates.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Badges" value={String(analytics.totalBadges)} />
          <Metric label="Allow Rate" value={`${analytics.allowRate}%`} />
          <Metric
            label="Denied"
            value={String(analytics.denyCount)}
            critical={analytics.denyCount > 0}
          />
          <Metric
            label="Expired Compliance"
            value={String(analytics.expiredCompliance)}
            critical={analytics.expiredCompliance > 0}
          />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar label="Avg Training On Badges" value={analytics.averageTraining} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Digital ID Creation
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <VeriForgeTextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <VeriForgeTextField
                label="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Training %"
                value={String(trainingPercent)}
                onChange={(e) => setTrainingPercent(Number(e.target.value))}
                options={[40, 55, 70, 85, 92, 100].map((n) => ({
                  label: `${n}%`,
                  value: String(n),
                }))}
              />
              <VeriForgeSelect
                label="forgeCheck"
                value={forgeStatus}
                onChange={(e) => setForgeStatus(e.target.value as ForgeCheckStatus)}
                options={[
                  { label: "Pass", value: "Pass" },
                  { label: "Fail", value: "Fail" },
                  { label: "Pending", value: "Pending" },
                ]}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Compliance"
                value={complianceStatus}
                onChange={(e) =>
                  setComplianceStatus(e.target.value as ComplianceBadgeStatus)
                }
                options={[
                  { label: "Valid", value: "valid" },
                  { label: "Expired", value: "expired" },
                  { label: "Pending", value: "pending" },
                ]}
              />
              <VeriForgeSelect
                label="Compliance Score"
                value={String(complianceScore)}
                onChange={(e) => setComplianceScore(Number(e.target.value))}
                options={[40, 55, 70, 80, 90, 100].map((n) => ({
                  label: `${n}%`,
                  value: String(n),
                }))}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={createBadge}>
              Generate Badge ID + QR
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Badge Generation
          </h3>
          <VeriForgeDivider className="my-3" />
          {selected ? (
            <div className="space-y-3">
              <VeriForgeDigitalBadgeCard badge={selected} />
              <VeriForgeButton variant="secondary" className="w-full" onClick={bumpTraining}>
                Sync Training +10%
              </VeriForgeButton>
            </div>
          ) : (
            <p className="text-sm text-[#b8b8b8]">Create a badge to preview the forged layout.</p>
          )}
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ForgeBoltIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              3. Badge Scanning
            </h3>
          </div>
          <div className="space-y-3">
            <VeriForgeTextField
              label="Scan Badge ID / QR Payload"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="VF-BDG-1001"
            />
            <VeriForgeButton className="w-full" onClick={() => scanBadge(scanInput.trim())}>
              Scan → Fetch User Status
            </VeriForgeButton>
            {selected && scanResult?.badgeId === selected.badgeId ? (
              <div
                className={cn(
                  "space-y-3 border p-3",
                  selected.accessDecision === "DENY"
                    ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                    : "border-[#424242]",
                )}
              >
                <p className="text-xs text-[#b8b8b8]">
                  Scanned {scanResult.scannedAt.slice(0, 19)} · {selected.firstName}{" "}
                  {selected.lastName}
                </p>
                <VeriForgeProgressBar label="Training" value={selected.trainingPercent} />
                <div className="flex flex-wrap gap-2">
                  <ForgeStatusChip status={selected.forgeStatus} />
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-[10px] uppercase",
                      selected.complianceStatus === "expired"
                        ? "border-[#1E6FB8] text-[#ffc9c9]"
                        : "border-[#424242] text-[#d0d0d0]",
                    )}
                  >
                    Compliance {selected.complianceStatus}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldGridIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              4. Access Control
            </h3>
          </div>
          {scanResult ? (
            <AccessDecisionCard
              decision={scanResult.accessDecision}
              reasons={scanResult.reasons}
            />
          ) : (
            <p className="text-sm text-[#b8b8b8]">
              Scan a badge to evaluate ALLOW / DENY from training, forgeCheck, and compliance.
            </p>
          )}
        </VeriForgeFrame>
      </div>

      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="mb-3 flex items-center gap-2">
          <HeatEdgeIcon className="text-[#1E6FB8]" />
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Badge Management
          </h3>
        </div>
        <div className="space-y-2">
          {badges.map((badge) => {
            const hot = badge.validity !== "valid" || badge.complianceStatus === "expired";
            return (
              <button
                key={badge.badgeId}
                type="button"
                onClick={() => {
                  setSelectedId(badge.badgeId);
                  setScanInput(badge.badgeId);
                }}
                className={cn(
                  "w-full border px-3 py-2 text-left transition",
                  selectedId === badge.badgeId
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : hot
                      ? "border-[#1E6FB8] bg-[#1f1f1f]"
                      : "border-[#424242] bg-[#1f1f1f] hover:border-[#6a6a6a]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#f0f0f0]">
                      {badge.firstName} {badge.lastName}
                    </p>
                    <p className="text-xs text-[#aaaaaa]">
                      {badge.badgeId} · {badge.company} · {badge.validity}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
                      badge.accessDecision === "ALLOW"
                        ? "border-[#4a654a] text-[#b8e0b8]"
                        : "border-[#1E6FB8] text-[#ffc9c9]",
                    )}
                  >
                    {badge.accessDecision}
                  </span>
                </div>
              </button>
            );
          })}
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
