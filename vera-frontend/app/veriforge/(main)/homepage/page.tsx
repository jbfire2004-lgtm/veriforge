import {
  VeriForgeBrandStoryTeaser,
  VeriForgeButton,
  VeriForgeContentBlock,
  VeriForgeCTA,
  VeriForgeDivider,
  VeriForgeLogo,
  VeriForgeManifestoPanel,
} from "@/components/veriforge";
import Link from "next/link";

export default function VeriForgeHomepage() {
  return (
    <div className="space-y-[var(--vf-spacing-lg)]">
      <section className="border border-[var(--vf-color-steel-grey)] bg-[var(--vf-effect-metallic-gradient)] px-[var(--vf-spacing-lg)] py-16 text-center">
        <div className="mb-[var(--vf-spacing-md)] flex justify-center">
          <VeriForgeLogo />
        </div>
        <p className="mb-[var(--vf-spacing-sm)] font-[var(--vf-font-primary)] text-xs uppercase tracking-[0.14em] text-[#ffb3b3]">
          Engineered Industrial Platform
        </p>
        <h1 className="mx-auto mb-[var(--vf-spacing-md)] max-w-3xl font-[var(--vf-font-primary)] text-4xl font-bold uppercase tracking-[0.14em] text-[var(--vf-color-safety-white)]">
          Forged for Absolute Safety
        </h1>
        <p className="mx-auto mb-[var(--vf-spacing-lg)] max-w-2xl text-sm text-[#d2d2d2]">
          Safety should be engineered, not improvised. VeriForge unifies training, verification,
          compliance, and incident management into a foundation forged for absolute safety.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[var(--vf-spacing-sm)]">
          <Link href="/veriforge/dashboard">
            <VeriForgeButton size="lg">Open Dashboard</VeriForgeButton>
          </Link>
          <Link href="/veriforge/brand">
            <VeriForgeButton size="lg" variant="secondary">
              Brand Story
            </VeriForgeButton>
          </Link>
        </div>
      </section>

      <VeriForgeBrandStoryTeaser />

      <VeriForgeDivider />

      <VeriForgeContentBlock
        title="Industrial Section Architecture"
        description="Angular geometry, metallic gradients, and red-accent interaction cues."
      >
        <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-3">
          {["Strength", "Precision", "Reliability"].map((pillar) => (
            <div
              key={pillar}
              className="border border-[var(--vf-color-steel-grey)] bg-[#202020] p-[var(--vf-spacing-md)]"
            >
              <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.1em] text-[var(--vf-color-safety-white)]">
                {pillar}
              </p>
              <p className="mt-[var(--vf-spacing-sm)] text-sm text-[#c3c3c3]">
                Purpose-built workflows engineered for high-consequence environments.
              </p>
            </div>
          ))}
        </div>
      </VeriForgeContentBlock>

      <VeriForgeManifestoPanel compact />

      <VeriForgeCTA
        kicker="DEPLOYMENT CHANNEL"
        title="ACTIVATE VERIFORGE STACK"
        description="Initialize dashboard, auth, users, training, verification, settings, and mobile modules."
        actionLabel="Start Build Flow"
      />
    </div>
  );
}
