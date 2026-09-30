"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import {
  VERIFORGE_UI_PERMISSIONS,
  VeriForgeCan,
} from "./rbac";
import {
  AnvilIcon,
  ForgeBoltIcon,
  HeatEdgeIcon,
  ShieldGridIcon,
  IconTrainingCertification,
  IconForgeCheck,
  IconComplianceDocument,
  IconIncidentSeverity,
  IconEquipmentInspection,
  IconRiskHazard,
  IconAuditEvidence,
} from "./icons";

export type BlockType =
  | "training"
  | "verification"
  | "compliance"
  | "incident"
  | "equipment"
  | "risk"
  | "audit";

export type ContractTrigger =
  | "verificationWorkflow"
  | "complianceExpiry"
  | "criticalIncident"
  | "equipmentSchedule";

export type LedgerBlockLocal = {
  id: string;
  index: number;
  type: BlockType;
  title: string;
  summary: string;
  payload: Record<string, string | number | boolean>;
  critical: boolean;
  tenantId: string;
  prevHash: string;
  hash: string;
  signature: string;
  timestamp: string;
  userId: number;
};

export type SmartContractLocal = {
  id: string;
  name: string;
  trigger: ContractTrigger;
  description: string;
  active: boolean;
  lastFiredAt: string | null;
  fireCount: number;
};

export type LedgerAnalyticsSnapshot = {
  totalBlocks: number;
  criticalBlocks: number;
  typeCounts: Record<BlockType, number>;
  chainIntegrity: boolean;
  activeContracts: number;
  contractFires: number;
  ledgerHealthScore: number;
  latestHash: string;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.ledger.analytics";
const TENANT_ID = "tenant-forge-global";
const GENESIS =
  "000000000000000000000000000000000000000000000000000000000000forge";

const TYPES: BlockType[] = [
  "training",
  "verification",
  "compliance",
  "incident",
  "equipment",
  "risk",
  "audit",
];

const TYPE_LABEL: Record<BlockType, string> = {
  training: "Training",
  verification: "Verification",
  compliance: "Compliance",
  incident: "Incident",
  equipment: "Equipment",
  risk: "Risk",
  audit: "Audit",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Lightweight browser hash for demo chain (not crypto-secure; mirrors API shape). */
async function forgeHash(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return `forge${Math.abs(h).toString(16).padStart(8, "0")}${"0".repeat(52)}`.slice(0, 64);
}

function signHashSync(hash: string, tenantId: string): string {
  let h = 0;
  const s = `sign:${tenantId}:${hash}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `sig${Math.abs(h).toString(16)}${hash.slice(0, 24)}`.slice(0, 32);
}

function seedBlocks(): LedgerBlockLocal[] {
  const now = new Date().toISOString();
  const rows: Array<{
    type: BlockType;
    title: string;
    summary: string;
    payload: Record<string, string | number | boolean>;
    critical: boolean;
  }> = [
    {
      type: "training",
      title: "Training · Hot Work Module",
      summary: "Module completed with passing score",
      payload: { moduleId: "mod-hotwork", score: 92, passed: true },
      critical: false,
    },
    {
      type: "verification",
      title: "forgeCheck · Cell B",
      summary: "Workflow verified · all steps forged",
      payload: { forgeStatus: "verified", steps: 5, pass: true },
      critical: false,
    },
    {
      type: "compliance",
      title: "Compliance · COR Pack",
      summary: "Document hashed and validated",
      payload: { docHash: "doc-cor-01", expiryDays: 120, valid: true },
      critical: false,
    },
    {
      type: "incident",
      title: "Incident · Atmosphere Excursion",
      summary: "Critical incident chain-of-custody opened",
      payload: { severity: "critical", evidenceHash: "ev-atm-01", steps: 3 },
      critical: true,
    },
    {
      type: "equipment",
      title: "Equipment · Crane-04 Inspection",
      summary: "Defect recorded · certification watch",
      payload: { assetId: "crane-04", defects: 2, certValid: false },
      critical: true,
    },
    {
      type: "risk",
      title: "Risk · Crane Path Matrix",
      summary: "Hazard density scored with controls",
      payload: { hazard: "struck-by", controls: 2, riskScore: 78 },
      critical: true,
    },
    {
      type: "audit",
      title: "Audit · Q Shift Evidence",
      summary: "Evidence pack hashed and scored",
      payload: { evidenceHash: "aud-q1", score: 84, findings: 2 },
      critical: false,
    },
  ];

  let prev = GENESIS;
  return rows.map((row, index) => {
    const id = `blk-${index + 1}`;
    const body = JSON.stringify({
      id,
      index,
      type: row.type,
      title: row.title,
      summary: row.summary,
      payload: row.payload,
      critical: row.critical,
      tenantId: TENANT_ID,
      prevHash: prev,
      timestamp: now,
      userId: 1,
    });
    let h = 0;
    for (let i = 0; i < body.length; i++) h = (Math.imul(31, h) + body.charCodeAt(i)) | 0;
    const hash = `forge${Math.abs(h).toString(16).padStart(8, "0")}${id}${"0".repeat(40)}`.slice(0, 64);
    const signature = signHashSync(hash, TENANT_ID);
    const block: LedgerBlockLocal = {
      id,
      index,
      type: row.type,
      title: row.title,
      summary: row.summary,
      payload: row.payload,
      critical: row.critical,
      tenantId: TENANT_ID,
      prevHash: prev,
      hash,
      signature,
      timestamp: now,
      userId: 1,
    };
    prev = hash;
    return block;
  });
}

const SEED_CONTRACTS: SmartContractLocal[] = [
  {
    id: "sc-verify",
    name: "Auto Verification Workflow",
    trigger: "verificationWorkflow",
    description: "Auto-trigger forgeCheck workflows on training completion",
    active: true,
    lastFiredAt: null,
    fireCount: 2,
  },
  {
    id: "sc-expiry",
    name: "Compliance Auto-Expire",
    trigger: "complianceExpiry",
    description: "Auto-expire compliance documents past validity",
    active: true,
    lastFiredAt: null,
    fireCount: 1,
  },
  {
    id: "sc-incident",
    name: "Critical Incident Notify",
    trigger: "criticalIncident",
    description: "Auto-notify on critical incident block commit",
    active: true,
    lastFiredAt: null,
    fireCount: 3,
  },
  {
    id: "sc-equip",
    name: "Inspection Schedule Update",
    trigger: "equipmentSchedule",
    description: "Auto-update equipment inspection schedules",
    active: true,
    lastFiredAt: null,
    fireCount: 1,
  },
];

export function computeLedgerAnalytics(
  blocks: LedgerBlockLocal[],
  contracts: SmartContractLocal[],
): LedgerAnalyticsSnapshot {
  const typeCounts = Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<
    BlockType,
    number
  >;
  for (const b of blocks) typeCounts[b.type] += 1;
  const criticalBlocks = blocks.filter((b) => b.critical).length;
  let chainIntegrity = true;
  let prev = GENESIS;
  for (const b of blocks) {
    if (b.prevHash !== prev) {
      chainIntegrity = false;
      break;
    }
    prev = b.hash;
  }
  const activeContracts = contracts.filter((c) => c.active).length;
  const contractFires = contracts.reduce((s, c) => s + c.fireCount, 0);
  const ledgerHealthScore = clamp(
    (chainIntegrity ? 70 : 20) +
      Math.min(blocks.length, 20) -
      criticalBlocks * 4 +
      activeContracts * 2,
  );
  return {
    totalBlocks: blocks.length,
    criticalBlocks,
    typeCounts,
    chainIntegrity,
    activeContracts,
    contractFires,
    ledgerHealthScore,
    latestHash: blocks.length === 0 ? GENESIS : blocks[blocks.length - 1].hash,
    timestamp: new Date().toISOString(),
  };
}

export function persistLedgerAnalytics(snapshot: LedgerAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:ledger-analytics", { detail: snapshot }),
  );
}

export function readLedgerAnalytics(): LedgerAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LedgerAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useLedgerAnalyticsSync(
  fallback: LedgerAnalyticsSnapshot = computeLedgerAnalytics(
    seedBlocks(),
    SEED_CONTRACTS,
  ),
) {
  const [analytics, setAnalytics] = React.useState<LedgerAnalyticsSnapshot>(
    () => readLedgerAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as LedgerAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<LedgerAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:ledger-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:ledger-analytics",
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

function TypeIcon({ type, critical }: { type: BlockType; critical?: boolean }) {
  const props = { size: 18, tone: (critical ? "critical" : "neutral") as "critical" | "neutral" };
  switch (type) {
    case "training":
      return <IconTrainingCertification {...props} />;
    case "verification":
      return <IconForgeCheck {...props} />;
    case "compliance":
      return <IconComplianceDocument {...props} />;
    case "incident":
      return <IconIncidentSeverity {...props} />;
    case "equipment":
      return <IconEquipmentInspection {...props} />;
    case "risk":
      return <IconRiskHazard {...props} />;
    case "audit":
      return <IconAuditEvidence {...props} />;
    default:
      return <ForgeBoltIcon />;
  }
}

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function VeriForgeSafetyBlockchainLedger() {
  const { push } = useVeriForgeNotifications();
  const [blocks, setBlocks] = React.useState<LedgerBlockLocal[]>(() => seedBlocks());
  const [contracts, setContracts] = React.useState(SEED_CONTRACTS);
  const [filter, setFilter] = React.useState<BlockType | "all">("all");
  const [commitType, setCommitType] = React.useState<BlockType>("training");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [proofMsg, setProofMsg] = React.useState<string | null>(null);
  const seq = React.useRef(20);
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () => computeLedgerAnalytics(blocks, contracts),
    [blocks, contracts],
  );

  React.useEffect(() => {
    persistLedgerAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const b of blocks) {
      if (!b.critical) continue;
      if (notified.current.has(b.id)) continue;
      notified.current.add(b.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL LEDGER BLOCK",
        message: `${b.title} · ${shortHash(b.hash)} · tenant ${b.tenantId}`,
        forgeStatus: "failed",
        userId: b.userId,
        actionLabel: "Open Ledger",
      });
    }
  }, [blocks, push]);

  React.useEffect(() => {
    if (!selectedId && blocks.length) setSelectedId(blocks[blocks.length - 1].id);
  }, [blocks, selectedId]);

  const filtered =
    filter === "all" ? [...blocks].reverse() : [...blocks].filter((b) => b.type === filter).reverse();
  const selected = blocks.find((b) => b.id === selectedId) ?? blocks[blocks.length - 1];

  const appendBlock = async (type: BlockType, contractId?: string) => {
    const prevHash = blocks.length === 0 ? GENESIS : blocks[blocks.length - 1].hash;
    const index = blocks.length;
    const id = `blk-${seq.current++}`;
    const timestamp = new Date().toISOString();
    const critical =
      type === "incident" || type === "risk" || type === "equipment";
    const title = contractId
      ? `Smart Contract · ${type}`
      : `${TYPE_LABEL[type]} · forged ${seq.current}`;
    const summary = contractId
      ? `Auto-fired contract ${contractId}`
      : `Committed ${type} block to tenant ledger`;
    const payload: Record<string, string | number | boolean> =
      type === "training"
        ? { moduleId: `mod-${seq.current}`, score: 70 + (seq.current % 25), passed: true }
        : type === "verification"
          ? { forgeStatus: "verified", steps: 4, pass: true }
          : type === "compliance"
            ? { docHash: `doc-${seq.current}`, expiryDays: 30, valid: !critical }
            : type === "incident"
              ? { severity: "critical", evidenceHash: `ev-${seq.current}`, steps: 2 }
              : type === "equipment"
                ? { assetId: `asset-${seq.current}`, defects: 1, certValid: false }
                : type === "risk"
                  ? { hazard: "field", controls: 1, riskScore: 74 }
                  : { evidenceHash: `aud-${seq.current}`, score: 80, findings: 1 };

    if (contractId) payload.contractId = contractId;

    const body = JSON.stringify({
      id,
      index,
      type,
      title,
      summary,
      payload,
      critical,
      tenantId: TENANT_ID,
      prevHash,
      timestamp,
      userId: 1,
    });
    const hash = await forgeHash(body);
    const signature = signHashSync(hash, TENANT_ID);
    const block: LedgerBlockLocal = {
      id,
      index,
      type,
      title,
      summary,
      payload,
      critical,
      tenantId: TENANT_ID,
      prevHash,
      hash,
      signature,
      timestamp,
      userId: 1,
    };
    setBlocks((prev) => [...prev, block]);
    setSelectedId(id);
    setProofMsg(`Proof · hash ${shortHash(hash)} · sig ${signature.slice(0, 10)}…`);

    setContracts((prev) =>
      prev.map((c) => {
        const fire =
          (contractId && c.id === contractId) ||
          (c.trigger === "verificationWorkflow" &&
            (type === "training" || type === "verification")) ||
          (c.trigger === "complianceExpiry" && type === "compliance" && critical) ||
          (c.trigger === "criticalIncident" && type === "incident" && critical) ||
          (c.trigger === "equipmentSchedule" && type === "equipment");
        if (!fire || !c.active) return c;
        return {
          ...c,
          lastFiredAt: timestamp,
          fireCount: c.fireCount + 1,
        };
      }),
    );
  };

  const commitBlock = () => void appendBlock(commitType);

  const fireContract = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract?.active) return;
    const typeMap: Record<ContractTrigger, BlockType> = {
      verificationWorkflow: "verification",
      complianceExpiry: "compliance",
      criticalIncident: "incident",
      equipmentSchedule: "equipment",
    };
    void appendBlock(typeMap[contract.trigger], contractId);
  };

  const verifySelected = () => {
    if (!selected) return;
    const idx = blocks.findIndex((b) => b.id === selected.id);
    const expectedPrev = idx === 0 ? GENESIS : blocks[idx - 1].hash;
    const linkOk = selected.prevHash === expectedPrev;
    setProofMsg(
      linkOk
        ? `Verified · ${shortHash(selected.hash)} · chain link OK · sig ${selected.signature.slice(0, 8)}…`
        : `FAILED · prevHash mismatch for ${selected.id}`,
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Safety Blockchain Ledger
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Immutable blocks · hashing & signing · smart safety contracts · tenant{" "}
              {TENANT_ID}
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
          <Metric label="Blocks" value={String(analytics.totalBlocks)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalBlocks)}
            critical={analytics.criticalBlocks > 0}
          />
          <Metric
            label="Integrity"
            value={analytics.chainIntegrity ? "OK" : "BROKEN"}
            critical={!analytics.chainIntegrity}
          />
          <Metric label="Health" value={`${analytics.ledgerHealthScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Ledger health · contracts ${analytics.activeContracts} · fires ${analytics.contractFires}`}
            value={analytics.ledgerHealthScore}
          />
        </div>
        <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
          tip {shortHash(analytics.latestHash)} · tenant {TENANT_ID}
        </p>
      </VeriForgeFrame>

      <div className="flex flex-wrap items-end gap-3 border border-[#424242] bg-[#151515] p-3">
        <VeriForgeCan permission={VERIFORGE_UI_PERMISSIONS.AUDIT_WRITE}>
          <div className="min-w-[180px] flex-1">
            <VeriForgeSelect
              label="Commit block type"
              value={commitType}
              onChange={(e) => setCommitType(e.target.value as BlockType)}
              options={TYPES.map((t) => ({ label: TYPE_LABEL[t], value: t }))}
            />
          </div>
          <VeriForgeButton onClick={() => void commitBlock()}>
            Commit block
          </VeriForgeButton>
        </VeriForgeCan>
        <VeriForgeButton variant="secondary" onClick={verifySelected}>
          Verify selected
        </VeriForgeButton>
      </div>
      {proofMsg ? (
        <p className="border border-[#424242] bg-[#1A1A1A] px-3 py-2 text-xs text-[#cfcfcf]">
          {proofMsg}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
            filter === "all"
              ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
              : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
          )}
        >
          Explorer
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              filter === t
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Ledger explorer chain */}
      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Ledger Explorer
        </p>
        <div className="mt-4 flex gap-0 overflow-x-auto pb-2">
          <div className="flex shrink-0 flex-col items-center">
            <div className="border border-[#424242] bg-[#151515] px-3 py-4 text-[9px] uppercase tracking-[0.1em] text-[#8a8a8a]">
              Genesis
            </div>
          </div>
          {filtered.map((b) => (
            <React.Fragment key={b.id}>
              <div
                className={cn(
                  "mx-1 h-0.5 w-8 self-center",
                  b.critical
                    ? "bg-[#1E6FB8] shadow-[0_0_8px_rgba(30, 111, 184,.6)]"
                    : "bg-[#424242]",
                )}
              />
              <button
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={cn(
                  "relative w-44 shrink-0 border p-3 text-left",
                  "bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_55%,#1A1A1A_100%)]",
                  selectedId === b.id || b.critical
                    ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242]",
                  b.critical && "vf-anim-red-glow-pulse",
                )}
                style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}
              >
                <div className="flex items-center justify-between gap-1">
                  <TypeIcon type={b.type} critical={b.critical} />
                  <span className="text-[9px] uppercase text-[#8a8a8a]">#{b.index}</span>
                </div>
                <p className="mt-2 font-[var(--vf-font-primary)] text-[10px] uppercase tracking-[0.1em] text-[#FAFAFA]">
                  {TYPE_LABEL[b.type]}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] text-[#b8b8b8]">{b.title}</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.08em] text-[#6f6f6f]">
                  {shortHash(b.hash)}
                </p>
              </button>
            </React.Fragment>
          ))}
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedId(b.id)}
              className={cn(
                "w-full border p-4 text-left",
                "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_50%,#242424_100%)]",
                selectedId === b.id || b.critical
                  ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                  : "border-[#424242]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TypeIcon type={b.type} critical={b.critical} />
                  <div>
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                      {b.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#8a8a8a]">
                      {TYPE_LABEL[b.type]} · block #{b.index}
                    </p>
                  </div>
                </div>
                {b.critical ? (
                  <span className="border border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] px-2 py-0.5 text-[9px] uppercase text-[#ffc9c9]">
                    critical
                  </span>
                ) : (
                  <span className="border border-[#424242] px-2 py-0.5 text-[9px] uppercase text-[#9f9f9f]">
                    sealed
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[#b8b8b8]">{b.summary}</p>
              {b.type === "risk" ? (
                <div className="mt-3 grid grid-cols-3 gap-1">
                  {[40, 58, Number(b.payload.riskScore) || 70].map((score, i) => (
                    <div
                      key={i}
                      className={cn(
                        "border p-2 text-center text-[10px]",
                        score >= 70
                          ? "border-[#1E6FB8] text-[#ffc9c9]"
                          : "border-[#424242] text-[#9f9f9f]",
                      )}
                    >
                      {score}
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
                hash {shortHash(b.hash)} · prev {shortHash(b.prevHash)} · tenant{" "}
                {b.tenantId} · {b.timestamp.slice(0, 19)}Z
              </p>
            </button>
          ))}
        </div>

        <aside className="space-y-4">
          {selected ? (
            <div
              className={cn(
                "border bg-[#1A1A1A] p-4",
                selected.critical
                  ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                  : "border-[#424242]",
              )}
            >
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
                Block proof
              </p>
              <p className="mt-2 font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#FAFAFA]">
                {selected.title}
              </p>
              <div className="mt-3 space-y-1 break-all text-[10px] uppercase tracking-[0.08em] text-[#8a8a8a]">
                <p>hash · {selected.hash}</p>
                <p>sig · {selected.signature}</p>
                <p>prev · {selected.prevHash}</p>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-[#b8b8b8]">
                {Object.entries(selected.payload).map(([k, v]) => (
                  <li key={k}>
                    {k}: {String(v)}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <VeriForgeButton size="sm" onClick={verifySelected}>
                  Verify proof
                </VeriForgeButton>
              </div>
            </div>
          ) : null}

          <div className="border border-[#424242] bg-[#1A1A1A] p-4">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              Smart Safety Contracts
            </p>
            <div className="mt-3 space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="border border-[#424242] bg-[#151515] p-3">
                  <p className="font-[var(--vf-font-primary)] text-[10px] uppercase text-[#FAFAFA]">
                    {c.name}
                  </p>
                  <p className="mt-1 text-[10px] text-[#9f9f9f]">{c.description}</p>
                  <p className="mt-1 text-[9px] uppercase text-[#6f6f6f]">
                    fires {c.fireCount}
                    {c.lastFiredAt ? ` · last ${c.lastFiredAt.slice(0, 16)}` : ""}
                  </p>
                  <div className="mt-2">
                    <VeriForgeCan permission={VERIFORGE_UI_PERMISSIONS.AUDIT_WRITE}>
                      <VeriForgeButton
                        size="sm"
                        variant="secondary"
                        onClick={() => void fireContract(c.id)}
                      >
                        Fire contract
                      </VeriForgeButton>
                    </VeriForgeCan>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Block types
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <span
              key={t}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              {TYPE_LABEL[t]} · {analytics.typeCounts[t]}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Features: block creation · hashing & signing · immutable storage · cross-tenant
          isolation · verification proofs · ledger explorer · smart safety contracts · sync{" "}
          <code className="text-[#cfcfcf]">veriforge.ledger.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
