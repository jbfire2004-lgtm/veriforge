import Link from "next/link";
import {
  AnvilIcon,
  ShieldGridIcon,
  VeriForgeBrandStoryTeaser,
  VeriForgeButton,
  VeriForgeCard,
  VeriForgeCTA,
  VeriForgeFeatureCard,
  VeriForgeInfoCard,
  VeriForgeProgressBar,
  VeriForgeStepRail,
  VeriForgeTable,
  VeriForgeWarningCard,
} from "@/components/veriforge";

type ComparisonRow = {
  capability: string;
  core: string;
  pro: string;
  enterprise: string;
};

const comparisonRows: ComparisonRow[] = [
  {
    capability: "Training Modules",
    core: "Basic",
    pro: "Advanced",
    enterprise: "Custom library",
  },
  {
    capability: "Verification Workflows",
    core: "Standard",
    pro: "Full workflow rail",
    enterprise: "Dedicated orchestration",
  },
  {
    capability: "Compliance Automation",
    core: "Manual assist",
    pro: "Policy templates",
    enterprise: "Automated governance",
  },
  {
    capability: "Support",
    core: "Community",
    pro: "Priority",
    enterprise: "Dedicated advisor",
  },
];

const emailSequence = [
  {
    subject: "Forge Sequence 01: Safety Baseline",
    body: "Position VeriForge as the command center for training, verification, and compliance reliability.",
  },
  {
    subject: "Forge Sequence 02: Proof in Production",
    body: "Share case study metrics with forgeStatus outcomes, completion uplift, and reduced compliance lag.",
  },
  {
    subject: "Forge Sequence 03: Conversion Push",
    body: "Drive Book a Demo CTA with trust badges, compliance icons, and role-based workflow proof.",
  },
];

const awarenessAds = [
  "Forged for Absolute Safety",
  "Precision Workflows. Industrial Reliability.",
  "From module assignment to forgeCheck closure",
];

const onboardingSteps = [
  "WELCOME",
  "IDENTITY",
  "TRAINING",
  "VERIFICATION",
  "COMPLIANCE",
  "REVIEW",
  "LIVE",
];

export default function VeriForgeMarketingFunnelPage() {
  return (
    <section className="veriforge-theme space-y-6 bg-[var(--vf-color-iron-black)] p-4 text-[var(--vf-color-safety-white)] md:p-6">
      <header className="border border-[var(--vf-color-steel-grey)] bg-[linear-gradient(145deg,#1f1f1f_0%,#151515_100%)] p-5">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Marketing Funnel
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#fafafa] md:text-3xl">
          Strength-Driven Growth Rail
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Complete awareness-to-retention funnel with forged-metal visuals, angular geometry, and
          conversion-ready CTA architecture — grounded in the VeriForge brand story and manifesto.
        </p>
      </header>

      <VeriForgeBrandStoryTeaser />

      <div className="grid gap-4 lg:grid-cols-2">
        <VeriForgeCard
          tone="feature"
          title="1. Awareness"
          description="Ads with forged-metal visuals, angular geometry, and red metallic CTA rail."
        >
          <div className="space-y-2">
            {awarenessAds.map((line) => (
              <div
                key={line}
                className="flex items-center gap-2 border border-[var(--vf-color-steel-grey)] bg-[#1c1c1c] px-3 py-2 text-sm text-[#e2e2e2]"
              >
                <span className="h-1.5 w-1.5 bg-[#1E6FB8] shadow-[0_0_8px_rgba(30, 111, 184,.6)]" />
                {line}
              </div>
            ))}
            <VeriForgeButton className="mt-2 w-full" size="lg">
              Launch Awareness Campaign
            </VeriForgeButton>
          </div>
        </VeriForgeCard>

        <VeriForgeCard
          tone="feature"
          title="2. Engagement"
          description="Landing experience with black backgrounds, steel structure panels, and interactive demos."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <VeriForgeFeatureCard
              title="Feature Rail"
              summary="Angular cards with red border accents for capability highlights."
            />
            <VeriForgeFeatureCard
              title="Interactive Demo"
              summary="Metallic UI controls to preview workflows, modules, and forgeStatus outputs."
            />
          </div>
        </VeriForgeCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <VeriForgeCard
          tone="info"
          title="3. Consideration"
          description="Case studies, comparison charts, and conversion-tuned email sequences."
          className="xl:col-span-2"
        >
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <VeriForgeStat title="Deployment Time" value="3.2 weeks" />
              <VeriForgeStat title="Training Completion" value="+34%" />
              <VeriForgeStat title="Verification Throughput" value="+41%" />
            </div>

            <VeriForgeTable
              rowKey={(row) => row.capability}
              columns={[
                { key: "capability", header: "Capability" },
                { key: "core", header: "Core" },
                { key: "pro", header: "Pro" },
                { key: "enterprise", header: "Enterprise" },
              ]}
              rows={comparisonRows}
            />

            <div className="space-y-2">
              {emailSequence.map((email) => (
                <div
                  key={email.subject}
                  className="border border-[var(--vf-color-steel-grey)] bg-[#202020] p-3"
                >
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#ffcccc]">
                    {email.subject}
                  </p>
                  <p className="mt-1 text-sm text-[#d4d4d4]">{email.body}</p>
                </div>
              ))}
            </div>
          </div>
        </VeriForgeCard>

        <VeriForgeCard
          tone="warning"
          title="4. Conversion"
          description="Pricing + trust signals + industrial CTA pressure."
        >
          <div className="space-y-3">
            <VeriForgeWarningCard
              title="Conversion Trigger"
              message="Book a Demo CTA remains persistent across tier and case-study zones."
            />
            <div className="grid grid-cols-2 gap-2">
              <TrustBadge label="SOC 2 Ready" />
              <TrustBadge label="ISO 27001 Path" />
              <TrustBadge label="Audit Trail" />
              <TrustBadge label="Field Verified" />
            </div>
            <div className="grid gap-2">
              <Link href="/veriforge/pricing">
                <VeriForgeButton className="w-full" size="lg">
                  Book a Demo
                </VeriForgeButton>
              </Link>
              <VeriForgeButton variant="secondary" className="w-full">
                Download Buyer Brief
              </VeriForgeButton>
            </div>
          </div>
        </VeriForgeCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeCard
          tone="stat"
          title="5. Onboarding"
          description="Guided onboarding rail with red-glow active stages and angular progress feedback."
        >
          <div className="space-y-4">
            <VeriForgeStepRail steps={onboardingSteps} current={3} />
            <VeriForgeProgressBar label="Onboarding Completion" value={62} />
            <p className="text-sm text-[#d0d0d0]">
              Each stage confirms identity, modules, forgeCheck, and compliance before live dashboard entry.
            </p>
          </div>
        </VeriForgeCard>

        <VeriForgeCard
          tone="stat"
          title="6. Retention"
          description="Training updates, verification insights, and compliance reminders with metallic notification rails."
        >
          <div className="space-y-3">
            <VeriForgeInfoCard
              title="Training Updates"
              detail="Module assignments, completions, and overdue reminders are grouped by priority."
            />
            <VeriForgeInfoCard
              title="Verification Insights"
              detail="Dashboard tracks forgeStatus by workflow lane and escalation threshold."
            />
            <VeriForgeInfoCard
              title="Compliance Reminders"
              detail="Red accent reminder cards surface deadline risk before policy breach."
            />
            <Link href="/veriforge/notifications">
              <VeriForgeButton variant="secondary" className="w-full">
                Open Notification Center
              </VeriForgeButton>
            </Link>
          </div>
        </VeriForgeCard>
      </div>

      <VeriForgeCTA
        kicker="Conversion Command"
        title="Forge the Entire Revenue Lifecycle"
        description="Deploy a full industrial marketing funnel from awareness ads to retention intelligence with one unified VeriForge identity system."
        actionLabel="Book a Demo"
      />
    </section>
  );
}

function VeriForgeStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-[var(--vf-color-steel-grey)] bg-[#1d1d1d] p-3">
      <p className="font-[var(--vf-font-primary)] text-[10px] uppercase tracking-[0.12em] text-[#d2d2d2]">
        {title}
      </p>
      <p className="mt-1 text-lg text-[#fafafa]">{value}</p>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border border-[var(--vf-color-steel-grey)] bg-[#1d1d1d] px-2 py-2 text-xs text-[#dddddd]">
      <ShieldGridIcon className="h-4 w-4 text-[#1E6FB8]" />
      <span>{label}</span>
      <AnvilIcon className="ml-auto h-3 w-3 text-[#888]" />
    </div>
  );
}

