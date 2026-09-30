"use client";

import * as React from "react";
import {
  MobileAngularCard,
  MobileScreenHeader,
  MobileStatusChip,
  VeriForgeButton,
  VeriForgeStepRail,
  VeriForgeProgressBar,
  useVeriForgeNotifications,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

type CheckStatus = "Pass" | "Fail" | "Pending" | "Active";

type CheckRow = {
  id: string;
  label: string;
  status: CheckStatus;
};

const STEPS = ["Identity", "Documents", "Training", "forgeCheck", "Seal"];

export default function VeriForgeMobileVerificationPage() {
  const { push } = useVeriForgeNotifications();
  const [step, setStep] = React.useState(2);
  const [checks, setChecks] = React.useState<CheckRow[]>([
    { id: "c1", label: "Identity Match", status: "Pass" },
    { id: "c2", label: "Document Integrity", status: "Active" },
    { id: "c3", label: "Training Gate", status: "Pending" },
    { id: "c4", label: "Site Clearance", status: "Pending" },
  ]);

  const runForgeCheck = () => {
    const next = checks.map((item, index) => {
      if (index === 1) return { ...item, status: "Fail" as const };
      if (index < 2) return { ...item, status: "Pass" as const };
      return { ...item, status: "Pending" as const };
    });
    setChecks(next);
    setStep(3);
    push({
      category: "verification",
      tone: "critical",
      title: "FORGECHECK FAILED",
      message: "Document Integrity failed. Red glow applied to active check.",
      forgeStatus: "failed",
      userId: 1,
    });
  };

  const passAll = () => {
    setChecks((prev) => prev.map((item) => ({ ...item, status: "Pass" })));
    setStep(4);
    push({
      category: "verification",
      tone: "success",
      title: "FORGECHECK PASSED",
      message: "All verification rails sealed.",
      forgeStatus: "verified",
      userId: 1,
    });
  };

  const passCount = checks.filter((item) => item.status === "Pass").length;

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Verification"
        title="forgeCheck"
        description="Angular workflow steps with red glow on active or failed checks."
      />

      <MobileAngularCard>
        <p className={cn(veriforgeTypography.heading, "mb-3 text-[11px] text-[#FAFAFA]")}>
          Workflow Rail
        </p>
        <VeriForgeStepRail steps={STEPS} current={step} />
        <div className="mt-4">
          <VeriForgeProgressBar
            label="Verification Completion"
            value={Math.round((passCount / checks.length) * 100)}
          />
        </div>
      </MobileAngularCard>

      <div className="space-y-2">
        {checks.map((item) => (
          <MobileAngularCard
            key={item.id}
            active={item.status === "Active"}
            critical={item.status === "Fail"}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-[#f0f0f0]">{item.label}</p>
              <MobileStatusChip
                label={item.status}
                tone={
                  item.status === "Pass"
                    ? "pass"
                    : item.status === "Fail"
                      ? "fail"
                      : item.status === "Active"
                        ? "critical"
                        : "pending"
                }
              />
            </div>
          </MobileAngularCard>
        ))}
      </div>

      <div className="grid gap-2">
        <VeriForgeButton className="w-full" onClick={runForgeCheck}>
          Trigger forgeCheck
        </VeriForgeButton>
        <VeriForgeButton className="w-full" variant="secondary" onClick={passAll}>
          Seal All Checks
        </VeriForgeButton>
      </div>
    </div>
  );
}
