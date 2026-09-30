"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type ContractorRole = "welder" | "electrician" | "rigger" | "safety" | "general";
export type DocumentStatus = "valid" | "missing" | "expired" | "pending";
export type ForgeCheckStatus = "Pass" | "Fail" | "Pending";

export type ContractorDocumentLocal = {
  id: string;
  type: "certification" | "license" | "safety_training";
  name: string;
  status: DocumentStatus;
  expiresAt: string | null;
};

export type ContractorTrainingLocal = {
  moduleId: string;
  title: string;
  progress: number;
  status: "assigned" | "in_progress" | "completed" | "overdue";
};

export type ContractorLocal = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  companyName: string;
  role: ContractorRole;
  certifications: string[];
  documents: ContractorDocumentLocal[];
  training: ContractorTrainingLocal[];
  forgeStatus: ForgeCheckStatus;
  complianceScore: number;
  performanceScore: number;
  incidentCount: number;
  timestamp: string;
  userId: number;
};

export type ContractorAnalyticsSnapshot = {
  totalContractors: number;
  compliantCount: number;
  nonCompliantCount: number;
  averageCompliance: number;
  averagePerformance: number;
  expiredDocuments: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.contractor.analytics";

const ROLE_MODULES: Record<ContractorRole, Array<{ moduleId: string; title: string }>> = {
  welder: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-102", title: "High-Heat Response" },
  ],
  electrician: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-103", title: "Heavy Lift Safety" },
  ],
  rigger: [{ moduleId: "m-103", title: "Heavy Lift Safety" }],
  safety: [
    { moduleId: "m-101", title: "Lockout-Tagout" },
    { moduleId: "m-102", title: "High-Heat Response" },
    { moduleId: "m-103", title: "Heavy Lift Safety" },
  ],
  general: [{ moduleId: "m-101", title: "Lockout-Tagout" }],
};

export function persistContractorAnalytics(snapshot: ContractorAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:contractor-analytics", { detail: snapshot }),
  );
}

export function readContractorAnalytics(): ContractorAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ContractorAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useContractorAnalyticsSync(
  fallback: ContractorAnalyticsSnapshot = {
    totalContractors: 2,
    compliantCount: 1,
    nonCompliantCount: 1,
    averageCompliance: 78,
    averagePerformance: 81,
    expiredDocuments: 1,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<ContractorAnalyticsSnapshot>(
    () => readContractorAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as ContractorAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<ContractorAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:contractor-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:contractor-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function docStatus(expiresAt: string | null): DocumentStatus {
  if (!expiresAt) return "pending";
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return "pending";
  if (expires < Date.now()) return "expired";
  return "valid";
}

function recalculate(contractor: ContractorLocal): ContractorLocal {
  const documents = contractor.documents.map((doc) => ({
    ...doc,
    status: doc.expiresAt ? docStatus(doc.expiresAt) : doc.status,
  }));
  const validDocs = documents.filter((item) => item.status === "valid").length;
  const docScore =
    documents.length === 0 ? 0 : Math.round((validDocs / documents.length) * 100);
  const trainingScore =
    contractor.training.length === 0
      ? 0
      : Math.round(
          contractor.training.reduce((sum, item) => sum + item.progress, 0) /
            contractor.training.length,
        );
  const verificationScore =
    contractor.forgeStatus === "Pass"
      ? 100
      : contractor.forgeStatus === "Pending"
        ? 50
        : 0;
  const complianceScore = Math.round(
    docScore * 0.45 + trainingScore * 0.35 + verificationScore * 0.2,
  );
  const incidentPenalty = Math.min(contractor.incidentCount * 8, 40);
  const performanceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        complianceScore * 0.7 + trainingScore * 0.2 + verificationScore * 0.1 - incidentPenalty,
      ),
    ),
  );
  return { ...contractor, documents, complianceScore, performanceScore };
}

function seedContractors(): ContractorLocal[] {
  return [
    recalculate({
      id: "ctr-1",
      firstName: "Kane",
      lastName: "Voss",
      email: "kane.voss@alloyworks.io",
      companyId: "co-alloy",
      companyName: "Alloy Works",
      role: "welder",
      certifications: ["AWS D1.1", "Hot Work Permit"],
      documents: [
        {
          id: "cdoc-1",
          type: "certification",
          name: "AWS D1.1",
          status: "valid",
          expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cdoc-2",
          type: "license",
          name: "Trade License",
          status: "expired",
          expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cdoc-3",
          type: "safety_training",
          name: "Site Orientation",
          status: "missing",
          expiresAt: null,
        },
      ],
      training: [
        { moduleId: "m-101", title: "Lockout-Tagout", progress: 100, status: "completed" },
        { moduleId: "m-102", title: "High-Heat Response", progress: 40, status: "in_progress" },
      ],
      forgeStatus: "Pending",
      complianceScore: 0,
      performanceScore: 0,
      incidentCount: 1,
      timestamp: new Date().toISOString(),
      userId: 1,
    }),
    recalculate({
      id: "ctr-2",
      firstName: "Nora",
      lastName: "Quill",
      email: "nora.quill@steelpath.io",
      companyId: "co-steelpath",
      companyName: "SteelPath Contractors",
      role: "electrician",
      certifications: ["Electrical Journeyman"],
      documents: [
        {
          id: "cdoc-4",
          type: "certification",
          name: "Electrical Journeyman",
          status: "valid",
          expiresAt: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cdoc-5",
          type: "license",
          name: "Trade License",
          status: "valid",
          expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "cdoc-6",
          type: "safety_training",
          name: "Site Orientation",
          status: "valid",
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      training: [
        { moduleId: "m-101", title: "Lockout-Tagout", progress: 100, status: "completed" },
        { moduleId: "m-103", title: "Heavy Lift Safety", progress: 100, status: "completed" },
      ],
      forgeStatus: "Pass",
      complianceScore: 0,
      performanceScore: 0,
      incidentCount: 0,
      timestamp: new Date().toISOString(),
      userId: 1,
    }),
  ];
}

function computeAnalytics(contractors: ContractorLocal[]): ContractorAnalyticsSnapshot {
  const total = contractors.length;
  const compliantCount = contractors.filter(
    (item) => item.complianceScore >= 80 && item.forgeStatus === "Pass",
  ).length;
  const expiredDocuments = contractors.reduce(
    (sum, item) => sum + item.documents.filter((doc) => doc.status === "expired").length,
    0,
  );
  return {
    totalContractors: total,
    compliantCount,
    nonCompliantCount: total - compliantCount,
    averageCompliance:
      total === 0
        ? 0
        : Math.round(
            contractors.reduce((sum, item) => sum + item.complianceScore, 0) / total,
          ),
    averagePerformance:
      total === 0
        ? 0
        : Math.round(
            contractors.reduce((sum, item) => sum + item.performanceScore, 0) / total,
          ),
    expiredDocuments,
    timestamp: new Date().toISOString(),
  };
}

function ForgeStatusBadge({ status }: { status: ForgeCheckStatus }) {
  if (status === "Pass") {
    return (
      <span className="inline-flex border border-[#1E6FB8] bg-[rgba(30, 111, 184,.18)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffd6d6]">
        Pass
      </span>
    );
  }
  if (status === "Fail") {
    return (
      <span className="inline-flex border border-[#1E6FB8] bg-[rgba(30, 111, 184,.32)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffe0e0] shadow-[0_0_12px_rgba(30, 111, 184,.45)]">
        Fail
      </span>
    );
  }
  return (
    <span className="inline-flex border border-[#424242] bg-[#1f1f1f] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#d0d0d0]">
      Pending
    </span>
  );
}

function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const critical = status === "missing" || status === "expired";
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.22)] text-[#ffe0e0] shadow-[0_0_10px_rgba(30, 111, 184,.35)]"
          : "border-[#424242] bg-[#1f1f1f] text-[#d0d0d0]",
      )}
    >
      {status}
    </span>
  );
}

export function VeriForgeContractorManagement() {
  const { push } = useVeriForgeNotifications();
  const [contractors, setContractors] = React.useState<ContractorLocal[]>(() => seedContractors());
  const [selectedId, setSelectedId] = React.useState("ctr-1");
  const notifiedExpired = React.useRef<Set<string>>(new Set());
  const idSeq = React.useRef(10);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [companyId, setCompanyId] = React.useState("");
  const [role, setRole] = React.useState<ContractorRole>("general");
  const [certifications, setCertifications] = React.useState("");
  const [docName, setDocName] = React.useState("");
  const [docType, setDocType] = React.useState<"certification" | "license" | "safety_training">(
    "certification",
  );
  const [docExpires, setDocExpires] = React.useState("");

  const selected = contractors.find((item) => item.id === selectedId) ?? contractors[0];
  const analytics = React.useMemo(() => computeAnalytics(contractors), [contractors]);

  React.useEffect(() => {
    persistContractorAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const contractor of contractors) {
      for (const doc of contractor.documents) {
        if (doc.status !== "expired") continue;
        const key = `${contractor.id}:${doc.id}`;
        if (notifiedExpired.current.has(key)) continue;
        notifiedExpired.current.add(key);
        push({
          category: "compliance",
          tone: "critical",
          title: "CONTRACTOR DOCUMENT EXPIRED",
          message: `${doc.name} expired for ${contractor.firstName} ${contractor.lastName}.`,
          forgeStatus: "failed",
          userId: contractor.userId,
          actionLabel: "Open Contractors",
        });
      }
    }
  }, [contractors, push]);

  const updateSelected = (mutator: (item: ContractorLocal) => ContractorLocal) => {
    if (!selected) return;
    setContractors((prev) =>
      prev.map((item) => (item.id === selected.id ? recalculate(mutator(item)) : item)),
    );
  };

  const onboard = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !companyName.trim()) return;
    const now = new Date().toISOString();
    const documents: ContractorDocumentLocal[] = [
      { id: `cdoc-${idSeq.current++}`, type: "certification", name: "Primary Certification", status: "missing", expiresAt: null },
      { id: `cdoc-${idSeq.current++}`, type: "license", name: "Trade License", status: "missing", expiresAt: null },
      { id: `cdoc-${idSeq.current++}`, type: "safety_training", name: "Site Orientation", status: "missing", expiresAt: null },
    ];
    if (docName.trim()) {
      documents.unshift({
        id: `cdoc-${idSeq.current++}`,
        type: docType,
        name: docName.trim(),
        status: docStatus(docExpires || null),
        expiresAt: docExpires || null,
      });
    }
    const contractor = recalculate({
      id: `ctr-${idSeq.current++}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      companyId: companyId.trim() || `co-${idSeq.current}`,
      companyName: companyName.trim(),
      role,
      certifications: certifications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      documents,
      training: ROLE_MODULES[role].map((module) => ({
        moduleId: module.moduleId,
        title: module.title,
        progress: 0,
        status: "assigned" as const,
      })),
      forgeStatus: "Pending",
      complianceScore: 0,
      performanceScore: 0,
      incidentCount: 0,
      timestamp: now,
      userId: 1,
    });
    setContractors((prev) => [contractor, ...prev]);
    setSelectedId(contractor.id);
    setFirstName("");
    setLastName("");
    setEmail("");
    setCompanyName("");
    setCompanyId("");
    setCertifications("");
    setDocName("");
    setDocExpires("");
  };

  const uploadDocument = () => {
    if (!docName.trim() || !selected) return;
    updateSelected((item) => ({
      ...item,
      documents: [
        {
          id: `cdoc-${idSeq.current++}`,
          type: docType,
          name: docName.trim(),
          status: docStatus(docExpires || null),
          expiresAt: docExpires || null,
        },
        ...item.documents,
      ],
    }));
    setDocName("");
    setDocExpires("");
  };

  const assignTraining = () => {
    if (!selected) return;
    updateSelected((item) => {
      const nextTraining = [...item.training];
      for (const module of ROLE_MODULES[item.role]) {
        if (!nextTraining.some((row) => row.moduleId === module.moduleId)) {
          nextTraining.push({
            moduleId: module.moduleId,
            title: module.title,
            progress: 0,
            status: "assigned",
          });
        }
      }
      return { ...item, training: nextTraining };
    });
    push({
      category: "training",
      tone: "success",
      title: "TRAINING ASSIGNED",
      message: `Role-based modules assigned to ${selected.firstName} ${selected.lastName}.`,
      forgeStatus: "forged",
      userId: 1,
    });
  };

  const runForgeCheck = () => {
    if (!selected) return;
    const hasGaps = selected.documents.some(
      (item) => item.status === "expired" || item.status === "missing",
    );
    const forgeStatus: ForgeCheckStatus = hasGaps ? "Fail" : "Pass";
    updateSelected((item) => ({ ...item, forgeStatus }));
    push({
      category: "verification",
      tone: forgeStatus === "Fail" ? "critical" : "success",
      title: forgeStatus === "Fail" ? "FORGECHECK FAILED" : "FORGECHECK PASSED",
      message: `${selected.firstName} ${selected.lastName}: forgeStatus ${forgeStatus}.`,
      forgeStatus: forgeStatus === "Fail" ? "failed" : "verified",
      userId: 1,
    });
  };

  const bumpTraining = (moduleId: string) => {
    updateSelected((item) => ({
      ...item,
      training: item.training.map((row) => {
        if (row.moduleId !== moduleId) return row;
        const progress = Math.min(100, row.progress + 25);
        return {
          ...row,
          progress,
          status: progress >= 100 ? "completed" : "in_progress",
        };
      }),
    }));
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Contractor Management
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Onboard, verify, train, and score industrial contractors.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Contractors" value={String(analytics.totalContractors)} />
          <Metric label="Compliant" value={String(analytics.compliantCount)} />
          <Metric
            label="Non-Compliant"
            value={String(analytics.nonCompliantCount)}
            critical={analytics.nonCompliantCount > 0}
          />
          <Metric
            label="Expired Docs"
            value={String(analytics.expiredDocuments)}
            critical={analytics.expiredDocuments > 0}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VeriForgeProgressBar label="Avg Compliance" value={analytics.averageCompliance} />
          <VeriForgeProgressBar label="Avg Performance" value={analytics.averagePerformance} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Contractor Onboarding
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <VeriForgeTextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <VeriForgeTextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <VeriForgeTextField label="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="co-alloy" />
            </div>
            <VeriForgeSelect
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as ContractorRole)}
              options={[
                { label: "Welder", value: "welder" },
                { label: "Electrician", value: "electrician" },
                { label: "Rigger", value: "rigger" },
                { label: "Safety", value: "safety" },
                { label: "General", value: "general" },
              ]}
            />
            <VeriForgeTextField
              label="Certifications"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="Comma-separated"
            />
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[#d0d0d0]">
                Document Upload
              </p>
              <VeriForgeTextField label="Document Name" value={docName} onChange={(e) => setDocName(e.target.value)} />
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <VeriForgeSelect
                  label="Type"
                  value={docType}
                  onChange={(e) =>
                    setDocType(e.target.value as "certification" | "license" | "safety_training")
                  }
                  options={[
                    { label: "Certification", value: "certification" },
                    { label: "License", value: "license" },
                    { label: "Safety Training", value: "safety_training" },
                  ]}
                />
                <VeriForgeTextField
                  label="Expires"
                  type="date"
                  value={docExpires}
                  onChange={(e) => setDocExpires(e.target.value)}
                />
              </div>
            </div>
            <VeriForgeButton className="w-full" onClick={onboard}>
              Onboard Contractor
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Contractor Directory
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-2">
            {contractors.map((item) => {
              const nonCompliant = item.complianceScore < 80 || item.forgeStatus !== "Pass";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full border px-3 py-2 text-left transition",
                    selectedId === item.id
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                      : nonCompliant
                        ? "border-[#1E6FB8] bg-[#1f1f1f]"
                        : "border-[#424242] bg-[#1f1f1f] hover:border-[#6a6a6a]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-[#f0f0f0]">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-xs text-[#aaaaaa]">
                        {item.companyName} · {item.role}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                        timestamp: {item.timestamp.slice(0, 19)} · userId: {item.userId} ·
                        companyId: {item.companyId}
                      </p>
                    </div>
                    <div className="text-right">
                      <ForgeStatusBadge status={item.forgeStatus} />
                      <p className="mt-1 text-xs text-[#ffb8b8]">{item.complianceScore}%</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </VeriForgeFrame>
      </div>

      {selected ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                2. Document Collection · {selected.firstName} {selected.lastName}
              </h3>
              <VeriForgeDivider className="my-3" />
              <div className="space-y-2">
                {selected.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "border bg-[#1f1f1f] px-3 py-2",
                      doc.status === "missing" || doc.status === "expired"
                        ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.28)]"
                        : "border-[#424242]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[#f0f0f0]">{doc.name}</p>
                        <p className="text-xs text-[#aaaaaa]">{doc.type}</p>
                      </div>
                      <DocStatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <VeriForgeButton className="w-full" variant="secondary" onClick={uploadDocument}>
                  Upload Document To Selected
                </VeriForgeButton>
              </div>
            </VeriForgeFrame>

            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                3–4. Training + Verification
              </h3>
              <VeriForgeDivider className="my-3" />
              <div className="mb-3 flex flex-wrap gap-2">
                <VeriForgeButton onClick={assignTraining}>Assign Role Modules</VeriForgeButton>
                <VeriForgeButton variant="secondary" onClick={runForgeCheck}>
                  Trigger forgeCheck
                </VeriForgeButton>
              </div>
              <div className="space-y-2">
                {selected.training.map((row) => (
                  <div
                    key={row.moduleId}
                    className="border border-[#1E6FB8] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[#f0f0f0]">{row.title}</p>
                        <p className="text-xs text-[#aaaaaa]">{row.status}</p>
                      </div>
                      <VeriForgeButton size="sm" variant="secondary" onClick={() => bumpTraining(row.moduleId)}>
                        +25%
                      </VeriForgeButton>
                    </div>
                    <div className="mt-2">
                      <VeriForgeProgressBar label="Progress" value={row.progress} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.12em] text-[#bdbdbd]">
                  forgeStatus
                </span>
                <ForgeStatusBadge status={selected.forgeStatus} />
              </div>
            </VeriForgeFrame>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldGridIcon className="text-[#1E6FB8]" />
                <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                  5. Compliance Tracking
                </h3>
              </div>
              <VeriForgeProgressBar label="Compliance Completion" value={selected.complianceScore} />
              <div className="mt-3 space-y-2">
                {selected.documents
                  .filter((doc) => doc.status === "expired" || doc.status === "missing")
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 border border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] px-3 py-2 text-sm text-[#ffd0d0]"
                    >
                      <HeatEdgeIcon className="h-4 w-4 text-[#1E6FB8]" />
                      Overdue / missing: {doc.name}
                    </div>
                  ))}
                {selected.documents.every(
                  (doc) => doc.status !== "expired" && doc.status !== "missing",
                ) ? (
                  <p className="text-sm text-[#b8b8b8]">No overdue document alerts.</p>
                ) : null}
              </div>
            </VeriForgeFrame>

            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ForgeBoltIcon className="text-[#1E6FB8]" />
                <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                  7. Performance Scoring
                </h3>
              </div>
              <div className="border border-[#1E6FB8] bg-[linear-gradient(145deg,#1f1f1f_0%,#141414_100%)] p-4 shadow-[0_0_18px_rgba(30, 111, 184,.2)]">
                <p className={cn(veriforgeTypography.heading, "text-xs text-[#FAFAFA]")}>
                  Performance Score
                </p>
                <p className="mt-2 text-3xl text-[#FAFAFA]">{selected.performanceScore}%</p>
                <p className="mt-2 text-xs text-[#b8b8b8]">
                  Weighted from training, verification, compliance, and incidents (
                  {selected.incidentCount}).
                </p>
                <div className="mt-3">
                  <VeriForgeProgressBar label="Score Rail" value={selected.performanceScore} />
                </div>
              </div>
            </VeriForgeFrame>
          </div>
        </>
      ) : null}
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
