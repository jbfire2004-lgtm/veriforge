"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  VeriForgeButton,
  VeriForgeContentBlock,
  VeriForgeLogo,
  VeriForgeSelect,
  VeriForgeStepRail,
  VeriForgeProgressBar,
  VeriForgeTextField,
  VeriForgeWarningCard,
} from "@/components/veriforge";

type OnboardingIdentity = {
  name: string;
  email: string;
  role: string;
};

const STEP_LABELS = [
  "Welcome",
  "Identity",
  "Training",
  "Verification",
  "Compliance",
  "Review",
  "Dashboard",
];

const REQUIRED_COMPLIANCE = [
  "Government-issued photo ID",
  "Trade certification proof",
  "Emergency response acknowledgement",
];

function modulesForRole(role: string) {
  const shared = ["Lockout-Tagout", "High-Heat Response"];
  if (role === "supervisor") return [...shared, "Supervisor Incident Control"];
  if (role === "trainer") return [...shared, "Instructional Safety Leadership"];
  return [...shared, "Field Operations Safety Core"];
}

export default function VeriForgeOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [identity, setIdentity] = React.useState<OnboardingIdentity>({
    name: "",
    email: "",
    role: "worker",
  });
  const [forgeProgress, setForgeProgress] = React.useState(0);
  const [verificationStarted, setVerificationStarted] = React.useState(false);
  const [uploadedDocs, setUploadedDocs] = React.useState<string[]>([]);
  const [completing, setCompleting] = React.useState(false);

  const trainingModules = React.useMemo(
    () => modulesForRole(identity.role),
    [identity.role],
  );

  React.useEffect(() => {
    if (!verificationStarted || forgeProgress >= 100) return;
    const timer = window.setTimeout(
      () => setForgeProgress((value) => Math.min(100, value + 20)),
      420,
    );
    return () => window.clearTimeout(timer);
  }, [verificationStarted, forgeProgress]);

  React.useEffect(() => {
    if (step !== 6 || !completing) return;
    const timer = window.setTimeout(() => {
      router.push("/veriforge/dashboard");
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [step, completing, router]);

  const canContinueIdentity =
    identity.name.trim().length > 1 &&
    identity.email.includes("@") &&
    identity.role.length > 0;

  function next() {
    setStep((value) => Math.min(6, value + 1));
  }

  function back() {
    setStep((value) => Math.max(0, value - 1));
  }

  return (
    <div className="space-y-[var(--vf-spacing-lg)]">
      <VeriForgeStepRail steps={STEP_LABELS} current={step} />

      {step === 0 ? (
        <section className="border border-[var(--vf-color-steel-grey)] bg-[var(--vf-effect-metallic-gradient)] px-[var(--vf-spacing-lg)] py-16 text-center">
          <div className="mx-auto mb-[var(--vf-spacing-md)] flex w-fit items-center justify-center rounded-none border border-[var(--vf-color-forge-red)] bg-[#1a1a1a] p-4 shadow-[var(--vf-effect-glow-primary)]">
            <VeriForgeLogo />
          </div>
          <h1 className="mb-[var(--vf-spacing-md)] font-[var(--vf-font-primary)] text-4xl font-bold uppercase tracking-[0.14em] text-[var(--vf-color-safety-white)]">
            Forged for Absolute Safety
          </h1>
          <p className="mx-auto mb-[var(--vf-spacing-lg)] max-w-2xl text-sm text-[#d2d2d2]">
            Engineered onboarding for identity assurance, training assignment, verification checks,
            and compliance readiness.
          </p>
          <VeriForgeButton size="lg" onClick={next}>
            Begin Onboarding
          </VeriForgeButton>
        </section>
      ) : null}

      {step === 1 ? (
        <VeriForgeContentBlock
          title="Identity Verification"
          description="Collect core identity fields inside steel-grey bordered panels."
        >
          <div className="space-y-[var(--vf-spacing-md)]">
            <VeriForgeTextField
              label="Full Name"
              value={identity.name}
              onChange={(event) =>
                setIdentity((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Maya Ironwood"
            />
            <VeriForgeTextField
              label="Email"
              type="email"
              value={identity.email}
              onChange={(event) =>
                setIdentity((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="maya.ironwood@veriforge.io"
            />
            <VeriForgeSelect
              label="Role"
              value={identity.role}
              onChange={(event) =>
                setIdentity((prev) => ({ ...prev, role: event.target.value }))
              }
              options={[
                { label: "Worker", value: "worker" },
                { label: "Supervisor", value: "supervisor" },
                { label: "Trainer", value: "trainer" },
              ]}
            />
          </div>
          <div className="mt-[var(--vf-spacing-md)] flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton variant="ghost" onClick={back}>
              Back
            </VeriForgeButton>
            <VeriForgeButton onClick={next} disabled={!canContinueIdentity}>
              Continue
            </VeriForgeButton>
          </div>
        </VeriForgeContentBlock>
      ) : null}

      {step === 2 ? (
        <VeriForgeContentBlock
          title="Safety Training Assignment"
          description="Required modules auto-assigned by role."
        >
          <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-2">
            {trainingModules.map((module) => (
              <div
                key={module}
                className="border border-[var(--vf-color-forge-red)] bg-[#232323] p-[var(--vf-spacing-md)] shadow-[0_0_0_1px_rgba(30, 111, 184,.22)]"
              >
                <p className="font-[var(--vf-font-primary)] text-xs uppercase tracking-[0.1em] text-[#ffd3d3]">
                  Assigned Module
                </p>
                <p className="mt-2 text-sm text-[var(--vf-color-safety-white)]">{module}</p>
              </div>
            ))}
          </div>
          <div className="mt-[var(--vf-spacing-md)] flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton variant="ghost" onClick={back}>
              Back
            </VeriForgeButton>
            <VeriForgeButton onClick={next}>Continue</VeriForgeButton>
          </div>
        </VeriForgeContentBlock>
      ) : null}

      {step === 3 ? (
        <VeriForgeContentBlock
          title="Verification Checks"
          description="Trigger forgeCheck workflow and monitor angular progress bars."
        >
          <div className="space-y-[var(--vf-spacing-md)]">
            <VeriForgeButton
              onClick={() => {
                setVerificationStarted(true);
                setForgeProgress(20);
              }}
              disabled={verificationStarted && forgeProgress < 100}
            >
              {verificationStarted ? "forgeCheck Running" : "Start forgeCheck"}
            </VeriForgeButton>
            <VeriForgeProgressBar label="Forge Verify Sequence" value={forgeProgress} />
            <VeriForgeProgressBar
              label="Workflow Integrity"
              value={Math.max(0, forgeProgress - 10)}
            />
            {forgeProgress >= 100 ? (
              <VeriForgeWarningCard
                title="Verification Complete"
                message="All check rails validated. Forge status set to VERIFIED."
              />
            ) : null}
          </div>
          <div className="mt-[var(--vf-spacing-md)] flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton variant="ghost" onClick={back}>
              Back
            </VeriForgeButton>
            <VeriForgeButton onClick={next} disabled={forgeProgress < 100}>
              Continue
            </VeriForgeButton>
          </div>
        </VeriForgeContentBlock>
      ) : null}

      {step === 4 ? (
        <VeriForgeContentBlock
          title="Compliance Requirements"
          description="Upload required documentation in metallic angular fields."
        >
          <div className="space-y-[var(--vf-spacing-md)]">
            {REQUIRED_COMPLIANCE.map((requirement) => (
              <label
                key={requirement}
                className="block border border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] p-[var(--vf-spacing-md)]"
              >
                <p className="mb-2 text-sm text-[#d7d7d7]">{requirement}</p>
                <input
                  type="file"
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name;
                    if (!fileName) return;
                    setUploadedDocs((prev) =>
                      prev.includes(fileName) ? prev : [...prev, fileName],
                    );
                  }}
                  className="block w-full border border-[var(--vf-color-steel-grey)] bg-[#151515] px-3 py-2 text-xs text-[#c8c8c8] file:mr-3 file:border file:border-[var(--vf-color-forge-red)] file:bg-[rgba(30, 111, 184,.18)] file:px-2 file:py-1 file:text-xs file:text-[#ffd6d6]"
                />
              </label>
            ))}
          </div>
          <div className="mt-[var(--vf-spacing-md)] flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton variant="ghost" onClick={back}>
              Back
            </VeriForgeButton>
            <VeriForgeButton onClick={next}>Continue</VeriForgeButton>
          </div>
        </VeriForgeContentBlock>
      ) : null}

      {step === 5 ? (
        <VeriForgeContentBlock
          title="Final Review"
          description="Engineered summary of identity, training, verification, and compliance."
        >
          <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-2">
            <div className="border border-[var(--vf-color-steel-grey)] bg-[#1e1e1e] p-[var(--vf-spacing-md)]">
              <p className="font-[var(--vf-font-primary)] text-xs uppercase tracking-[0.1em] text-[#d7d7d7]">
                Identity
              </p>
              <p className="mt-2 text-sm">{identity.name || "N/A"}</p>
              <p className="text-sm text-[#bdbdbd]">{identity.email || "N/A"}</p>
              <p className="text-sm text-[#bdbdbd]">Role: {identity.role}</p>
            </div>
            <div className="border border-[var(--vf-color-steel-grey)] bg-[#1e1e1e] p-[var(--vf-spacing-md)]">
              <p className="font-[var(--vf-font-primary)] text-xs uppercase tracking-[0.1em] text-[#d7d7d7]">
                Completion Summary
              </p>
              <p className="mt-2 text-sm text-[#d4d4d4]">Training modules: {trainingModules.length}</p>
              <p className="text-sm text-[#d4d4d4]">Verification: {forgeProgress >= 100 ? "Done" : "Pending"}</p>
              <p className="text-sm text-[#d4d4d4]">Uploaded docs: {uploadedDocs.length}</p>
            </div>
          </div>
          <div className="mt-[var(--vf-spacing-md)] flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton variant="ghost" onClick={back}>
              Back
            </VeriForgeButton>
            <VeriForgeButton
              onClick={() => {
                next();
                setCompleting(true);
              }}
            >
              Complete Onboarding
            </VeriForgeButton>
          </div>
        </VeriForgeContentBlock>
      ) : null}

      {step === 6 ? (
        <section className="grid place-items-center border border-[var(--vf-color-forge-red)] bg-[radial-gradient(circle_at_center,rgba(30, 111, 184,.28),transparent_62%),#111] px-[var(--vf-spacing-lg)] py-20 text-center">
          <div className="mb-[var(--vf-spacing-md)] animate-pulse rounded-none border border-[var(--vf-color-forge-red)] bg-[#1a1a1a] p-5 shadow-[var(--vf-effect-glow-primary)]">
            <VeriForgeLogo compact />
          </div>
          <h2 className="mb-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.14em]">
            Entering Dashboard
          </h2>
          <p className="text-sm text-[#d0d0d0]">
            Forged identity verified. Initializing industrial command surface.
          </p>
          <div className="mt-[var(--vf-spacing-md)]">
            <VeriForgeButton variant="secondary" onClick={() => router.push("/veriforge/dashboard")}>
              Enter Now
            </VeriForgeButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}

