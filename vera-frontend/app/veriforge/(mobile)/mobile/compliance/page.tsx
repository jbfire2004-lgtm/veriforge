"use client";

import * as React from "react";
import {
  MobileAngularCard,
  MobileScreenHeader,
  MobileStatusChip,
  VeriForgeButton,
  VeriForgeTextField,
  VeriForgeSelect,
  VeriForgeProgressBar,
  useComplianceScoreSync,
  persistComplianceScore,
  useVeriForgeNotifications,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

type DocStatus = "valid" | "expired" | "missing" | "pending";

type DocRow = {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
};

const SEED: DocRow[] = [
  { id: "d1", name: "OSHA 30 Card", type: "certification", status: "valid" },
  { id: "d2", name: "Trade License", type: "license", status: "expired" },
  { id: "d3", name: "Site Orientation", type: "safety_training", status: "missing" },
  { id: "d4", name: "Insurance COI", type: "certification", status: "pending" },
];

export default function VeriForgeMobileCompliancePage() {
  const { score, setScore } = useComplianceScoreSync(78);
  const { push } = useVeriForgeNotifications();
  const [docs, setDocs] = React.useState<DocRow[]>(SEED);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("certification");
  const notified = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const verifiedDocuments = docs.filter((item) => item.status === "valid").length;
    const pendingDocuments = docs.filter((item) => item.status === "pending").length;
    const failedDocuments = docs.filter(
      (item) => item.status === "expired" || item.status === "missing",
    ).length;
    const nextScore = Math.round((verifiedDocuments / Math.max(docs.length, 1)) * 100);
    const record = {
      score: nextScore,
      totalRequirements: docs.length,
      verifiedDocuments,
      pendingDocuments,
      failedDocuments,
      expiringSoon: docs.filter((item) => item.status === "expired").length,
      timestamp: new Date().toISOString(),
      userId: 1,
      requirementId: null,
    };
    setScore(record);
    persistComplianceScore(record);

    for (const doc of docs) {
      if (doc.status !== "expired") continue;
      if (notified.current.has(doc.id)) continue;
      notified.current.add(doc.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "EXPIRED DOCUMENT",
        message: `${doc.name} requires immediate renewal.`,
        forgeStatus: "failed",
        userId: 1,
      });
    }
  }, [docs, push, setScore]);

  const upload = () => {
    if (!name.trim()) return;
    setDocs((prev) => [
      {
        id: `d-${Date.now()}`,
        name: name.trim(),
        type,
        status: "valid",
      },
      ...prev,
    ]);
    setName("");
  };

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Compliance"
        title="Document Vault"
        description="Red alerts for expired items. Angular upload fields with metallic borders."
      />

      <MobileAngularCard critical={score.score < 70}>
        <VeriForgeProgressBar label="Compliance Score" value={score.score} />
      </MobileAngularCard>

      <div className="space-y-2">
        {docs.map((doc) => (
          <MobileAngularCard
            key={doc.id}
            critical={doc.status === "expired" || doc.status === "missing"}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                  {doc.name}
                </p>
                <p className="mt-1 text-xs text-[#aaaaaa]">{doc.type}</p>
              </div>
              <MobileStatusChip
                label={doc.status}
                tone={
                  doc.status === "valid"
                    ? "pass"
                    : doc.status === "expired" || doc.status === "missing"
                      ? "critical"
                      : "pending"
                }
              />
            </div>
          </MobileAngularCard>
        ))}
      </div>

      <MobileAngularCard className="border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]">
        <p className={cn(veriforgeTypography.heading, "mb-3 text-[11px] text-[#FAFAFA]")}>
          Upload Document
        </p>
        <div className="space-y-3">
          <VeriForgeTextField
            label="Document Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Certification title"
          />
          <VeriForgeSelect
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: "Certification", value: "certification" },
              { label: "License", value: "license" },
              { label: "Safety Training", value: "safety_training" },
            ]}
          />
          <VeriForgeButton className="w-full" onClick={upload}>
            Upload
          </VeriForgeButton>
        </div>
      </MobileAngularCard>
    </div>
  );
}
