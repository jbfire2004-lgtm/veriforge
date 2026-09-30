"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type OnboardingRole =
  | "welder"
  | "electrician"
  | "rigger"
  | "safety"
  | "general";

export type DocKind = "certification" | "license" | "insurance" | "training_record";
export type DocStatus = "valid" | "missing" | "expired" | "pending";
export type TrainingStatus = "assigned" | "in_progress" | "completed" | "overdue";
export type ForgeCheckStatus = "Pass" | "Fail" | "Pending";
export type AccessDecision = "allow" | "deny";
export type OnboardingStage =
  | "identity"
  | "company"
  | "documents"
  | "training"
  | "verification"
  | "compliance"
  | "badge"
  | "access"
  | "complete";

export type OnboardingCompanyLocal = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  safetyOfficer: string;
  industry: string;
  missingComplianceDocs: boolean;
  timestamp: string;
  userId: number;
};

export type OnboardingDocumentLocal = {
  id: string;
  companyId: string;
  contractorId: string | null;
  kind: DocKind;
  name: string;
  status: DocStatus;
  expiresAt: string | null;
  timestamp: string;
  userId: number;
};

export type OnboardingTrainingLocal = {
  id: string;
  companyId: string;
  contractorId: string;
  moduleId: string;
  title: string;
  progress: number;
  status: TrainingStatus;
  timestamp: string;
  userId: number;
};

export type OnboardingBadgeLocal = {
  id: string;
  companyId: string;
  contractorId: string;
  qrPayload: string;
  trainingStatus: string;
  verificationStatus: ForgeCheckStatus;
  issuedAt: string;
  timestamp: string;
  userId: number;
};

export type OnboardingRecordLocal = {
  id: string;
  companyId: string;
  name: string;
  role: OnboardingRole;
  companyName: string;
  contact: string;
  certifications: string[];
  forgeStatus: ForgeCheckStatus;
  complianceScore: number;
  trainingScore: number;
  onboardingScore: number;
  completionPercent: number;
  stage: OnboardingStage;
  access: AccessDecision;
  accessReason: string;
  badgeId: string | null;
  startedAt: string;
  completedAt: string | null;
  onboardingHours: number;
  timestamp: string;
  userId: number;
};

export type ContractorOnboardingAnalyticsSnapshot = {
  totalOnboardings: number;
  inProgress: number;
  completed: number;
  averageOnboardingHours: number;
  averageOnboardingScore: number;
  complianceGaps: number;
  verificationPassRate: number;
  accessAllowed: number;
  accessDenied: number;
  overdueTraining: number;
  expiredDocuments: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.contractor-onboarding.analytics";

const ROLE_MODULES: Record<
  OnboardingRole,
  Array<{ moduleId: string; title: string }>
> = {
  welder: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-102", title: "High-Heat Response" },
    { moduleId: "m-104", title: "Hot Work Controls" },
  ],
  electrician: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-105", title: "Electrical Safety" },
    { moduleId: "m-103", title: "Heavy Lift Safety" },
  ],
  rigger: [
    { moduleId: "m-103", title: "Heavy Lift Safety" },
    { moduleId: "m-106", title: "Rigging Fundamentals" },
  ],
  safety: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-102", title: "High-Heat Response" },
    { moduleId: "m-103", title: "Heavy Lift Safety" },
    { moduleId: "m-107", title: "Site Safety Leadership" },
  ],
  general: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-108", title: "Site Orientation" },
  ],
};

const REQUIRED_DOCS: Array<{ kind: DocKind; name: string }> = [
  { kind: "certification", name: "Trade Certification" },
  { kind: "license", name: "Trade License" },
  { kind: "insurance", name: "Liability Insurance" },
  { kind: "training_record", name: "Prior Training Record" },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeContractorOnboardingAnalytics(input: {
  contractors: OnboardingRecordLocal[];
  documents: OnboardingDocumentLocal[];
  training: OnboardingTrainingLocal[];
}): ContractorOnboardingAnalyticsSnapshot {
  const completed = input.contractors.filter((c) => c.stage === "complete");
  const passed = input.contractors.filter((c) => c.forgeStatus === "Pass").length;
  return {
    totalOnboardings: input.contractors.length,
    inProgress: input.contractors.filter((c) => c.stage !== "complete").length,
    completed: completed.length,
    averageOnboardingHours:
      input.contractors.length === 0
        ? 0
        : Math.round(
            (input.contractors.reduce((s, c) => s + c.onboardingHours, 0) /
              input.contractors.length) *
              10,
          ) / 10,
    averageOnboardingScore:
      input.contractors.length === 0
        ? 0
        : clamp(
            input.contractors.reduce((s, c) => s + c.onboardingScore, 0) /
              input.contractors.length,
          ),
    complianceGaps: input.documents.filter(
      (d) => d.status === "missing" || d.status === "expired",
    ).length,
    verificationPassRate:
      input.contractors.length === 0
        ? 0
        : clamp((passed / input.contractors.length) * 100),
    accessAllowed: input.contractors.filter((c) => c.access === "allow").length,
    accessDenied: input.contractors.filter((c) => c.access === "deny").length,
    overdueTraining: input.training.filter((t) => t.status === "overdue").length,
    expiredDocuments: input.documents.filter((d) => d.status === "expired").length,
    timestamp: new Date().toISOString(),
  };
}

export function persistContractorOnboardingAnalytics(
  snapshot: ContractorOnboardingAnalyticsSnapshot,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:contractor-onboarding-analytics", { detail: snapshot }),
  );
}

export function readContractorOnboardingAnalytics(): ContractorOnboardingAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ContractorOnboardingAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useContractorOnboardingAnalyticsSync(
  fallback: ContractorOnboardingAnalyticsSnapshot = {
    totalOnboardings: 2,
    inProgress: 2,
    completed: 0,
    averageOnboardingHours: 9,
    averageOnboardingScore: 44,
    complianceGaps: 5,
    verificationPassRate: 0,
    accessAllowed: 0,
    accessDenied: 2,
    overdueTraining: 2,
    expiredDocuments: 1,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<ContractorOnboardingAnalyticsSnapshot>(
    () => readContractorOnboardingAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as ContractorOnboardingAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<ContractorOnboardingAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:contractor-onboarding-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:contractor-onboarding-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function recomputeRecord(
  record: OnboardingRecordLocal,
  documents: OnboardingDocumentLocal[],
  training: OnboardingTrainingLocal[],
): OnboardingRecordLocal {
  const docs = documents.filter((d) => d.contractorId === record.id);
  const train = training.filter((t) => t.contractorId === record.id);
  const validDocs = docs.filter((d) => d.status === "valid").length;
  const complianceScore =
    docs.length === 0 ? 0 : clamp((validDocs / docs.length) * 100);
  const trainingScore =
    train.length === 0
      ? 0
      : clamp(train.reduce((s, t) => s + t.progress, 0) / train.length);
  const verifyScore =
    record.forgeStatus === "Pass" ? 100 : record.forgeStatus === "Fail" ? 0 : 40;
  const hasBadge = Boolean(record.badgeId);
  const gaps = docs.filter((d) => d.status === "missing" || d.status === "expired").length;
  const overdue = train.filter((t) => t.status === "overdue").length;
  const accessAllow =
    complianceScore >= 80 &&
    trainingScore >= 100 &&
    record.forgeStatus === "Pass" &&
    gaps === 0 &&
    overdue === 0;
  const reasons: string[] = [];
  if (complianceScore < 80 || gaps > 0) reasons.push("Compliance gaps");
  if (trainingScore < 100 || overdue > 0) reasons.push("Training incomplete");
  if (record.forgeStatus !== "Pass") reasons.push("Verification not passed");

  let stage: OnboardingStage = "documents";
  if (accessAllow && hasBadge) stage = "complete";
  else if (hasBadge) stage = "access";
  else if (record.forgeStatus === "Pass") stage = "badge";
  else if (trainingScore >= 50) stage = "verification";
  else if (validDocs > 0) stage = "training";
  else stage = "documents";

  return {
    ...record,
    complianceScore,
    trainingScore,
    onboardingScore: clamp(complianceScore * 0.35 + trainingScore * 0.35 + verifyScore * 0.3),
    completionPercent: clamp(
      (docs.length > 0 ? 20 : 0) +
        (validDocs === docs.length && docs.length > 0 ? 15 : validDocs > 0 ? 8 : 0) +
        (train.length > 0 ? 15 : 0) +
        (trainingScore >= 100 ? 15 : Math.round(trainingScore * 0.1)) +
        (record.forgeStatus !== "Pending" ? 10 : 0) +
        (record.forgeStatus === "Pass" ? 10 : 0) +
        (hasBadge ? 10 : 0) +
        (accessAllow ? 5 : 0),
    ),
    stage,
    access: accessAllow ? "allow" : "deny",
    accessReason: accessAllow
      ? "Training, verification, and compliance cleared"
      : reasons.join(" · ") || "Onboarding incomplete",
    completedAt: accessAllow && hasBadge ? record.completedAt ?? new Date().toISOString() : null,
    timestamp: new Date().toISOString(),
  };
}

function seed() {
  const now = new Date().toISOString();
  return {
    companies: [
      {
        id: "co-1",
        companyId: "co-1",
        name: "Alloy Works",
        address: "1200 Forge Ave",
        safetyOfficer: "R. Hale",
        industry: "Fabrication",
        missingComplianceDocs: false,
        timestamp: now,
        userId: 1,
      },
      {
        id: "co-2",
        companyId: "co-2",
        name: "VoltLine Services",
        address: "88 Current Rd",
        safetyOfficer: "T. Ng",
        industry: "Electrical",
        missingComplianceDocs: true,
        timestamp: now,
        userId: 1,
      },
    ] as OnboardingCompanyLocal[],
    contractors: [
      {
        id: "ob-1",
        companyId: "co-1",
        name: "Kane Voss",
        role: "welder" as const,
        companyName: "Alloy Works",
        contact: "kane.voss@alloyworks.io",
        certifications: ["AWS D1.1", "Hot Work"],
        forgeStatus: "Pending" as const,
        complianceScore: 62,
        trainingScore: 40,
        onboardingScore: 55,
        completionPercent: 58,
        stage: "training" as const,
        access: "deny" as const,
        accessReason: "Training incomplete · Verification pending",
        badgeId: null,
        startedAt: now,
        completedAt: null,
        onboardingHours: 6,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ob-2",
        companyId: "co-2",
        name: "Lina Ortiz",
        role: "electrician" as const,
        companyName: "VoltLine Services",
        contact: "lina.ortiz@voltline.io",
        certifications: ["Journeyman Electrician"],
        forgeStatus: "Fail" as const,
        complianceScore: 38,
        trainingScore: 25,
        onboardingScore: 34,
        completionPercent: 42,
        stage: "documents" as const,
        access: "deny" as const,
        accessReason: "Compliance gaps · Failed forgeCheck",
        badgeId: null,
        startedAt: now,
        completedAt: null,
        onboardingHours: 12,
        timestamp: now,
        userId: 1,
      },
    ] as OnboardingRecordLocal[],
    documents: [
      {
        id: "od-1",
        companyId: "co-1",
        contractorId: "ob-1",
        kind: "certification" as const,
        name: "Trade Certification",
        status: "valid" as const,
        expiresAt: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-2",
        companyId: "co-1",
        contractorId: "ob-1",
        kind: "license" as const,
        name: "Trade License",
        status: "valid" as const,
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-3",
        companyId: "co-1",
        contractorId: "ob-1",
        kind: "insurance" as const,
        name: "Liability Insurance",
        status: "pending" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-4",
        companyId: "co-1",
        contractorId: "ob-1",
        kind: "training_record" as const,
        name: "Prior Training Record",
        status: "missing" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-5",
        companyId: "co-2",
        contractorId: "ob-2",
        kind: "certification" as const,
        name: "Trade Certification",
        status: "expired" as const,
        expiresAt: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-6",
        companyId: "co-2",
        contractorId: "ob-2",
        kind: "license" as const,
        name: "Trade License",
        status: "missing" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-7",
        companyId: "co-2",
        contractorId: "ob-2",
        kind: "insurance" as const,
        name: "Liability Insurance",
        status: "missing" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-8",
        companyId: "co-2",
        contractorId: "ob-2",
        kind: "training_record" as const,
        name: "Prior Training Record",
        status: "pending" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: "od-9",
        companyId: "co-2",
        contractorId: null,
        kind: "insurance" as const,
        name: "Company COI",
        status: "missing" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
    ] as OnboardingDocumentLocal[],
    training: [
      {
        id: "ot-1",
        companyId: "co-1",
        contractorId: "ob-1",
        moduleId: "m-101",
        title: "Lockout-Tagout",
        progress: 100,
        status: "completed" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ot-2",
        companyId: "co-1",
        contractorId: "ob-1",
        moduleId: "m-102",
        title: "High-Heat Response",
        progress: 40,
        status: "in_progress" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ot-3",
        companyId: "co-1",
        contractorId: "ob-1",
        moduleId: "m-104",
        title: "Hot Work Controls",
        progress: 0,
        status: "overdue" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ot-4",
        companyId: "co-2",
        contractorId: "ob-2",
        moduleId: "m-101",
        title: "Lockout-Tagout",
        progress: 20,
        status: "overdue" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ot-5",
        companyId: "co-2",
        contractorId: "ob-2",
        moduleId: "m-105",
        title: "Electrical Safety",
        progress: 0,
        status: "assigned" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ot-6",
        companyId: "co-2",
        contractorId: "ob-2",
        moduleId: "m-103",
        title: "Heavy Lift Safety",
        progress: 0,
        status: "assigned" as const,
        timestamp: now,
        userId: 1,
      },
    ] as OnboardingTrainingLocal[],
    badges: [] as OnboardingBadgeLocal[],
  };
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

function StatusChip({ status }: { status: ForgeCheckStatus }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        status === "Pass"
          ? "border-[#424242] bg-[#1f1f1f] text-[#b8e0b8]"
          : status === "Fail"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9] shadow-[0_0_8px_rgba(30, 111, 184,.35)]"
            : "border-[#424242] bg-[#151515] text-[#cfcfcf]",
      )}
    >
      {status}
    </span>
  );
}

export function VeriForgeContractorOnboardingMegaSuite() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [companies, setCompanies] = React.useState(initial.companies);
  const [contractors, setContractors] = React.useState(initial.contractors);
  const [documents, setDocuments] = React.useState(initial.documents);
  const [training, setTraining] = React.useState(initial.training);
  const [badges, setBadges] = React.useState(initial.badges);
  const [selectedId, setSelectedId] = React.useState("ob-1");
  const notified = React.useRef<Set<string>>(new Set(["od-4", "od-5", "od-6", "od-7", "od-9"]));
  const seq = React.useRef(50);

  const [idName, setIdName] = React.useState("");
  const [idRole, setIdRole] = React.useState<OnboardingRole>("welder");
  const [idCompany, setIdCompany] = React.useState("co-1");
  const [idContact, setIdContact] = React.useState("");
  const [idCerts, setIdCerts] = React.useState("");
  const [coName, setCoName] = React.useState("");
  const [coAddress, setCoAddress] = React.useState("");
  const [coOfficer, setCoOfficer] = React.useState("");
  const [coIndustry, setCoIndustry] = React.useState("");

  const active = contractors.find((c) => c.id === selectedId) ?? contractors[0];
  const activeDocs = documents.filter((d) => d.contractorId === active?.id);
  const activeTrain = training.filter((t) => t.contractorId === active?.id);
  const activeBadge = badges.find((b) => b.id === active?.badgeId);
  const companyDocs = documents.filter(
    (d) => d.companyId === active?.companyId && d.contractorId === null,
  );

  React.useEffect(() => {
    setContractors((prev) =>
      prev.map((row) => recomputeRecord(row, documents, training)),
    );
  }, [documents, training]);

  const analytics = React.useMemo(
    () =>
      computeContractorOnboardingAnalytics({
        contractors,
        documents,
        training,
      }),
    [contractors, documents, training],
  );

  React.useEffect(() => {
    persistContractorOnboardingAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const doc of documents) {
      if (doc.status !== "missing" && doc.status !== "expired") continue;
      if (notified.current.has(doc.id)) continue;
      notified.current.add(doc.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL COMPLIANCE GAP",
        message: `${doc.name} is ${doc.status} (companyId: ${doc.companyId}).`,
        forgeStatus: "failed",
        userId: doc.userId,
        actionLabel: "Open Onboarding",
      });
    }
  }, [documents, push]);

  const registerCompany = () => {
    if (!coName.trim() || !coAddress.trim()) return;
    const id = `co-${seq.current++}`;
    setCompanies((prev) => [
      {
        id,
        companyId: id,
        name: coName.trim(),
        address: coAddress.trim(),
        safetyOfficer: coOfficer.trim() || "TBD",
        industry: coIndustry.trim() || "Industrial",
        missingComplianceDocs: true,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setDocuments((prev) => [
      {
        id: `od-${seq.current++}`,
        companyId: id,
        contractorId: null,
        kind: "insurance",
        name: "Company COI",
        status: "missing",
        expiresAt: null,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setIdCompany(id);
    setCoName("");
    setCoAddress("");
    setCoOfficer("");
    setCoIndustry("");
  };

  const captureIdentity = () => {
    if (!idName.trim() || !idContact.trim()) return;
    const company = companies.find((c) => c.companyId === idCompany);
    if (!company) return;
    const id = `ob-${seq.current++}`;
    const now = new Date().toISOString();
    const record: OnboardingRecordLocal = {
      id,
      companyId: company.companyId,
      name: idName.trim(),
      role: idRole,
      companyName: company.name,
      contact: idContact.trim(),
      certifications: idCerts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      forgeStatus: "Pending",
      complianceScore: 0,
      trainingScore: 0,
      onboardingScore: 0,
      completionPercent: 10,
      stage: "documents",
      access: "deny",
      accessReason: "Onboarding incomplete",
      badgeId: null,
      startedAt: now,
      completedAt: null,
      onboardingHours: 1,
      timestamp: now,
      userId: 1,
    };
    setContractors((prev) => [record, ...prev]);
    setDocuments((prev) => [
      ...REQUIRED_DOCS.map((req) => ({
        id: `od-${seq.current++}`,
        companyId: company.companyId,
        contractorId: id,
        kind: req.kind,
        name: req.name,
        status: "missing" as const,
        expiresAt: null,
        timestamp: now,
        userId: 1,
      })),
      ...prev,
    ]);
    setTraining((prev) => [
      ...ROLE_MODULES[idRole].map((mod) => ({
        id: `ot-${seq.current++}`,
        companyId: company.companyId,
        contractorId: id,
        moduleId: mod.moduleId,
        title: mod.title,
        progress: 0,
        status: "assigned" as const,
        timestamp: now,
        userId: 1,
      })),
      ...prev,
    ]);
    setSelectedId(id);
    setIdName("");
    setIdContact("");
    setIdCerts("");
  };

  const markDocValid = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: "valid",
              expiresAt:
                d.expiresAt ??
                new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
              timestamp: new Date().toISOString(),
            }
          : d,
      ),
    );
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.companyId !== active?.companyId) return c;
        const remaining = documents.filter(
          (d) =>
            d.companyId === c.companyId &&
            d.contractorId === null &&
            d.id !== docId &&
            (d.status === "missing" || d.status === "expired"),
        );
        return { ...c, missingComplianceDocs: remaining.length > 0 };
      }),
    );
  };

  const bumpTrain = (trainId: string) => {
    setTraining((prev) =>
      prev.map((t) => {
        if (t.id !== trainId) return t;
        const progress = clamp(t.progress + 25);
        return {
          ...t,
          progress,
          status:
            progress >= 100
              ? "completed"
              : progress > 0
                ? "in_progress"
                : t.status,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  const runForgeCheck = () => {
    if (!active) return;
    const docs = documents.filter((d) => d.contractorId === active.id);
    const train = training.filter((t) => t.contractorId === active.id);
    const docOk = docs.every((d) => d.status === "valid");
    const trainOk = train.every((t) => t.status === "completed");
    const forgeStatus: ForgeCheckStatus =
      docOk && trainOk
        ? "Pass"
        : docs.some((d) => d.status === "expired") ||
            train.some((t) => t.status === "overdue")
          ? "Fail"
          : "Pending";
    setContractors((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? recomputeRecord({ ...c, forgeStatus }, documents, training)
          : c,
      ),
    );
    if (forgeStatus === "Fail") {
      push({
        category: "compliance",
        tone: "critical",
        title: "FORGECHECK FAILED",
        message: `${active.name} failed verification checks.`,
        forgeStatus: "failed",
        userId: 1,
      });
    }
  };

  const generateBadge = () => {
    if (!active) return;
    const id = `bdg-${seq.current++}`;
    const badge: OnboardingBadgeLocal = {
      id,
      companyId: active.companyId,
      contractorId: active.id,
      qrPayload: `VF|${active.id}|${active.companyId}|${Date.now()}`,
      trainingStatus:
        active.trainingScore >= 100 ? "complete" : `${active.trainingScore}%`,
      verificationStatus: active.forgeStatus,
      issuedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      userId: 1,
    };
    setBadges((prev) => [badge, ...prev]);
    setContractors((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? recomputeRecord({ ...c, badgeId: id }, documents, training)
          : c,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Contractor Onboarding Mega-Suite
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Identity, company, documents, training, forgeCheck, compliance, badges, access.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Onboardings" value={String(analytics.totalOnboardings)} />
          <Metric
            label="Compliance Gaps"
            value={String(analytics.complianceGaps)}
            critical={analytics.complianceGaps > 0}
          />
          <Metric
            label="Access Denied"
            value={String(analytics.accessDenied)}
            critical={analytics.accessDenied > 0}
          />
          <Metric
            label="Verify Pass Rate"
            value={`${analytics.verificationPassRate}%`}
            critical={analytics.verificationPassRate < 70}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar
            label="Avg Onboarding Score"
            value={analytics.averageOnboardingScore}
          />
          <VeriForgeProgressBar
            label={active ? `${active.name} completion` : "Completion"}
            value={active?.completionPercent ?? 0}
          />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Identity Capture */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Contractor Identity Capture
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {contractors.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left",
                  selectedId === row.id
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : row.access === "deny"
                      ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_10px_rgba(30, 111, 184,.2)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{row.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {row.role} · {row.companyName} · {row.stage}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  companyId: {row.companyId} · userId: {row.userId} ·{" "}
                  {row.timestamp.slice(0, 19)}
                </p>
              </button>
            ))}
          </div>
          <div className="space-y-2 border border-[#1E6FB8] bg-[linear-gradient(145deg,#2a1717_0%,#171717_100%)] p-3 shadow-[0_0_12px_rgba(30, 111, 184,.2)]">
            <VeriForgeTextField
              label="Name"
              value={idName}
              onChange={(e) => setIdName(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Role"
                value={idRole}
                onChange={(e) => setIdRole(e.target.value as OnboardingRole)}
                options={[
                  { label: "Welder", value: "welder" },
                  { label: "Electrician", value: "electrician" },
                  { label: "Rigger", value: "rigger" },
                  { label: "Safety", value: "safety" },
                  { label: "General", value: "general" },
                ]}
              />
              <VeriForgeSelect
                label="Company"
                value={idCompany}
                onChange={(e) => setIdCompany(e.target.value)}
                options={companies.map((c) => ({
                  label: c.name,
                  value: c.companyId,
                }))}
              />
            </div>
            <VeriForgeTextField
              label="Contact"
              value={idContact}
              onChange={(e) => setIdContact(e.target.value)}
            />
            <VeriForgeTextField
              label="Certifications (comma-separated)"
              value={idCerts}
              onChange={(e) => setIdCerts(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={captureIdentity}>
              Capture Identity
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* 2. Company Registration */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Company Registration
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {companies.map((co) => (
              <div
                key={co.id}
                className={cn(
                  "border px-3 py-2",
                  co.missingComplianceDocs
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{co.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {co.address} · {co.industry} · SO: {co.safetyOfficer}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  companyId: {co.companyId}
                  {co.missingComplianceDocs ? " · missing compliance docs" : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField
              label="Company name"
              value={coName}
              onChange={(e) => setCoName(e.target.value)}
            />
            <VeriForgeTextField
              label="Address"
              value={coAddress}
              onChange={(e) => setCoAddress(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField
                label="Safety officer"
                value={coOfficer}
                onChange={(e) => setCoOfficer(e.target.value)}
              />
              <VeriForgeTextField
                label="Industry"
                value={coIndustry}
                onChange={(e) => setCoIndustry(e.target.value)}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={registerCompany}>
              Register Company
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 3. Document Collection */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Document Collection
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {[...activeDocs, ...companyDocs].map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center justify-between gap-2 border px-3 py-2",
                  doc.status === "missing" || doc.status === "expired"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <div>
                  <p className="text-sm text-[#f0f0f0]">{doc.name}</p>
                  <p className="text-xs text-[#aaaaaa]">
                    {doc.kind.replaceAll("_", " ")} · {doc.status}
                    {doc.expiresAt ? ` · exp ${doc.expiresAt}` : ""}
                  </p>
                </div>
                {doc.status !== "valid" ? (
                  <VeriForgeButton size="sm" onClick={() => markDocValid(doc.id)}>
                    Mark Valid
                  </VeriForgeButton>
                ) : null}
              </div>
            ))}
          </div>
        </VeriForgeFrame>

        {/* 4. Training Assignment */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Training Assignment
          </h3>
          <p className="mt-1 text-xs text-[#aaaaaa]">
            Auto-assigned from role: {active?.role ?? "—"}
          </p>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {activeTrain.map((mod) => (
              <div
                key={mod.id}
                className={cn(
                  "border p-3",
                  mod.status === "overdue"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm text-[#f0f0f0]">{mod.title}</p>
                  <VeriForgeButton size="sm" variant="secondary" onClick={() => bumpTrain(mod.id)}>
                    +25%
                  </VeriForgeButton>
                </div>
                <VeriForgeProgressBar label={mod.status} value={mod.progress} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 5. Verification + 6. Compliance */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Verification Checks · 6. Compliance
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <StatusChip status={active?.forgeStatus ?? "Pending"} />
            <VeriForgeButton onClick={runForgeCheck}>Run forgeCheck</VeriForgeButton>
          </div>
          <div
            className={cn(
              "border p-3",
              (active?.complianceScore ?? 0) < 70
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)]"
                : "border-[#424242] bg-[#1f1f1f]",
            )}
          >
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#9f9f9f]">
              Compliance dashboard
            </p>
            <VeriForgeProgressBar
              label="Compliance score"
              value={active?.complianceScore ?? 0}
            />
            <div className="mt-2">
              <VeriForgeProgressBar
                label="Training score"
                value={active?.trainingScore ?? 0}
              />
            </div>
            <div className="mt-2">
              <VeriForgeProgressBar
                label="Onboarding score"
                value={active?.onboardingScore ?? 0}
              />
            </div>
            {(active?.complianceScore ?? 0) < 70 ? (
              <p className="mt-2 text-xs text-[#ffc9c9]">
                Red alert: compliance gaps remain for this contractor.
              </p>
            ) : null}
          </div>
        </VeriForgeFrame>

        {/* 7. Badge Generation */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. Badge Generation
          </h3>
          <VeriForgeDivider className="my-3" />
          {activeBadge ? (
            <div className="border border-[#6a6a6a] bg-[linear-gradient(145deg,#262626_0%,#141414_100%)] p-4 shadow-[inset_0_0_0_1px_rgba(30, 111, 184,.35)]">
              <div className="mb-2 h-0.5 w-16 bg-[#1E6FB8]" />
              <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.14em] text-[#FAFAFA]">
                {active?.name}
              </p>
              <p className="mt-1 text-xs text-[#aaaaaa]">
                {active?.role} · {active?.companyName}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-16 w-16 grid-cols-4 grid-rows-4 gap-0.5 border border-[#424242] bg-[#0f0f0f] p-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-full w-full",
                        activeBadge.qrPayload.charCodeAt(i % activeBadge.qrPayload.length) % 2 === 0
                          ? "bg-[#1E6FB8]"
                          : "bg-[#424242]",
                      )}
                    />
                  ))}
                </div>
                <div className="space-y-1 text-xs text-[#cfcfcf]">
                  <p>Training: {activeBadge.trainingStatus}</p>
                  <p>
                    Verification: <StatusChip status={activeBadge.verificationStatus} />
                  </p>
                  <p className="break-all text-[10px] text-[#8f8f8f]">{activeBadge.qrPayload}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-sm text-[#aaaaaa]">No badge issued yet.</p>
          )}
          <VeriForgeButton className="mt-3 w-full" onClick={generateBadge}>
            Generate Digital Badge
          </VeriForgeButton>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 8. Access Control */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            8. Access Control
          </h3>
          <VeriForgeDivider className="my-3" />
          <div
            className={cn(
              "border p-4",
              active?.access === "deny"
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_14px_rgba(30, 111, 184,.3)]"
                : "border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
            )}
          >
            <p className="font-[var(--vf-font-primary)] text-xl uppercase tracking-[0.14em] text-[#FAFAFA]">
              {active?.access === "allow" ? "ALLOW" : "DENY"}
            </p>
            <div className="mt-2 h-0.5 w-20 bg-[#1E6FB8]" />
            <p className="mt-3 text-sm text-[#cfcfcf]">{active?.accessReason}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              Based on training · verification · compliance
            </p>
          </div>
        </VeriForgeFrame>

        {/* 9. Analytics */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              9. Onboarding Analytics
            </h3>
            <HeatEdgeIcon className="text-[#1E6FB8]" />
          </div>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                <span>Onboarding time</span>
                <span className="text-[#ffc9c9]">{analytics.averageOnboardingHours}h avg</span>
              </div>
              <div className="h-2 border border-[#424242] bg-[#151515]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#424242_0%,#1E6FB8_100%)]"
                  style={{
                    width: `${Math.min(100, analytics.averageOnboardingHours * 6)}%`,
                  }}
                />
              </div>
            </div>
            <VeriForgeProgressBar
              label="Verification pass rate"
              value={analytics.verificationPassRate}
            />
            <VeriForgeProgressBar
              label="Avg onboarding score"
              value={analytics.averageOnboardingScore}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <Metric
                label="Compliance gaps"
                value={String(analytics.complianceGaps)}
                critical={analytics.complianceGaps > 0}
              />
              <Metric
                label="Overdue training"
                value={String(analytics.overdueTraining)}
                critical={analytics.overdueTraining > 0}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              Synced · {analytics.timestamp.slice(0, 19)} · dashboard + mobile
            </p>
          </div>
        </VeriForgeFrame>
      </div>

      {active ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Active record metadata · timestamp: {active.timestamp.slice(0, 19)} · userId:{" "}
          {active.userId} · companyId: {active.companyId}
        </p>
      ) : null}
      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
      </div>
    </div>
  );
}
