"use client";

import * as React from "react";
import {
  VeriForgeButton,
  VeriForgeDivider,
  VeriForgeLogo,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

type Tier = {
  name: "Core" | "Pro" | "Enterprise";
  price: string;
  description: string;
  features: string[];
  cardClassName: string;
};

const tiers: Tier[] = [
  {
    name: "Core",
    price: "$49/mo",
    description: "Start with foundational forge safety controls.",
    features: [
      "Basic training",
      "Basic verification",
      "Standard compliance tools",
    ],
    cardClassName:
      "border-[var(--vf-color-forge-red)] bg-[linear-gradient(160deg,#2a2a2a_0%,#1e1e1e_100%)]",
  },
  {
    name: "Pro",
    price: "$149/mo",
    description: "Precision workflows for high-tempo operations.",
    features: [
      "Advanced training modules",
      "Full verification workflows",
      "Compliance automation",
    ],
    cardClassName:
      "border-[var(--vf-color-forge-red)] bg-[linear-gradient(160deg,#1a1a1a_0%,#0f0f0f_65%,#2a2a2a_100%)] shadow-[var(--vf-effect-glow-primary)]",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Engineered governance for complex industrial programs.",
    features: [
      "Custom workflows",
      "Dedicated support",
      "Full audit suite",
    ],
    cardClassName:
      "border-[var(--vf-color-forge-red)] bg-[linear-gradient(155deg,#171717_0%,#101010_55%,#292929_100%)] shadow-[0_0_0_1px_rgba(30, 111, 184,.5),0_0_30px_rgba(30, 111, 184,.46)] before:pointer-events-none before:absolute before:inset-[2px] before:border before:border-white/10",
  },
];

const comparisonRows = [
  { feature: "Training depth", core: "Basic", pro: "Advanced", enterprise: "Custom" },
  { feature: "Verification workflows", core: "Basic", pro: "Full", enterprise: "Custom + Dedicated" },
  { feature: "Compliance automation", core: "Standard", pro: "Automated", enterprise: "Fully Orchestrated" },
  { feature: "Audit suite", core: "Essential logs", pro: "Expanded logs", enterprise: "Full audit suite" },
  { feature: "Support", core: "Community", pro: "Priority", enterprise: "Dedicated team" },
];

const faqs = [
  {
    question: "Can we migrate from another safety platform?",
    answer:
      "Yes. VeriForge provides structured migration playbooks for training, verification, and compliance records.",
  },
  {
    question: "How quickly can we launch Enterprise?",
    answer:
      "Typical Enterprise rollout starts in 2-4 weeks depending on workflow complexity and integration scope.",
  },
  {
    question: "Do tiers support regulatory audit trails?",
    answer:
      "All tiers include auditability, with Enterprise delivering full-chain forensic reporting and custom controls.",
  },
];

export default function VeriForgePricingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <div className="space-y-[var(--vf-spacing-xl)]">
      <section className="relative overflow-hidden border border-[var(--vf-color-steel-grey)] bg-[linear-gradient(150deg,#1a1a1a_0%,#101010_52%,#2a2a2a_100%)] px-[var(--vf-spacing-xl)] py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(30, 111, 184,.2)_50%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-[12%] w-px bg-[var(--vf-color-forge-red)] opacity-70" />
        <div className="pointer-events-none absolute inset-y-0 right-[18%] w-px bg-[var(--vf-color-forge-red)] opacity-45" />
        <div className="relative z-10 text-center">
          <div className="mb-[var(--vf-spacing-md)] flex justify-center">
            <VeriForgeLogo />
          </div>
          <p className="mb-[var(--vf-spacing-sm)] font-[var(--vf-font-primary)] text-xs uppercase tracking-[0.14em] text-[#ffc3c3]">
            Forged-Metal SaaS Pricing
          </p>
          <h1 className="mx-auto mb-[var(--vf-spacing-md)] max-w-4xl font-[var(--vf-font-primary)] text-4xl font-bold uppercase tracking-[0.14em] text-[var(--vf-color-safety-white)]">
            Forged for Absolute Safety
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[#d0d0d0]">
            Select the VeriForge tier engineered for your operational intensity, compliance rigor,
            and verification velocity.
          </p>
        </div>
      </section>

      <section className="grid gap-[var(--vf-spacing-md)] lg:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={cn(
              "relative overflow-hidden border p-[var(--vf-spacing-md)] transition hover:shadow-[var(--vf-effect-glow-primary)]",
              tier.cardClassName,
            )}
          >
            <div className="mb-[var(--vf-spacing-sm)] flex items-center justify-between">
              <h2 className={cn(veriforgeTypography.heading, "text-lg text-[var(--vf-color-safety-white)]")}>
                {tier.name}
              </h2>
              <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.1em] text-[#ffb8b8]">
                {tier.price}
              </p>
            </div>
            <p className="mb-[var(--vf-spacing-md)] text-sm text-[#c9c9c9]">{tier.description}</p>
            <ul className="space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[var(--vf-color-safety-white)]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[var(--vf-color-forge-red)] shadow-[var(--vf-effect-glow-primary)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-[var(--vf-spacing-md)]">
              <VeriForgeButton className="w-full">Select {tier.name}</VeriForgeButton>
            </div>
          </article>
        ))}
      </section>

      <section className="border border-[var(--vf-color-steel-grey)] bg-[#171717] p-[var(--vf-spacing-md)]">
        <h3 className={cn(veriforgeTypography.heading, "mb-[var(--vf-spacing-sm)] text-sm text-[var(--vf-color-safety-white)]")}>
          Tier Comparison
        </h3>
        <div className="overflow-auto border border-[var(--vf-color-steel-grey)]">
          <table className="min-w-full border-collapse text-sm text-[var(--vf-color-safety-white)]">
            <thead className="bg-[linear-gradient(180deg,#2a2a2a_0%,#1f1f1f_100%)]">
              <tr>
                <th className="border-b border-[var(--vf-color-steel-grey)] px-3 py-2 text-left">Feature</th>
                <th className="border-b border-[var(--vf-color-steel-grey)] px-3 py-2 text-left">Core</th>
                <th className="border-b border-[var(--vf-color-steel-grey)] px-3 py-2 text-left">Pro</th>
                <th className="border-b border-[var(--vf-color-steel-grey)] px-3 py-2 text-left">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] transition hover:bg-[rgba(30, 111, 184,.16)]"
                >
                  <td className="px-3 py-2 text-[#d9d9d9]">{row.feature}</td>
                  <td className="px-3 py-2">{row.core}</td>
                  <td className="px-3 py-2">{row.pro}</td>
                  <td className="px-3 py-2">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-[var(--vf-color-steel-grey)] bg-[#141414] p-[var(--vf-spacing-md)]">
        <h3 className={cn(veriforgeTypography.heading, "mb-[var(--vf-spacing-sm)] text-sm text-[var(--vf-color-safety-white)]")}>
          FAQ
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div
                key={faq.question}
                className="border border-[var(--vf-color-steel-grey)] bg-[#1b1b1b]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between border-l-2 border-l-[var(--vf-color-forge-red)] px-3 py-2 text-left transition hover:bg-[rgba(30, 111, 184,.12)]"
                  onClick={() => setOpenFaq(open ? null : index)}
                >
                  <span className="text-sm text-[var(--vf-color-safety-white)]">{faq.question}</span>
                  <span className="text-[#ffb8b8]">{open ? "-" : "+"}</span>
                </button>
                {open ? (
                  <div className="px-3 pb-3 pt-1 text-sm text-[#c9c9c9]">{faq.answer}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border border-[var(--vf-color-steel-grey)] bg-[#111] p-[var(--vf-spacing-md)]">
        <div className="mb-[var(--vf-spacing-sm)] flex items-center justify-between">
          <VeriForgeLogo />
          <p className="text-xs text-[#c7c7c7]">VeriForge SaaS</p>
        </div>
        <VeriForgeDivider className="mb-[var(--vf-spacing-sm)]" />
        <div className="h-0.5 w-full bg-[var(--vf-color-forge-red)] shadow-[var(--vf-effect-glow-primary)]" />
      </footer>
    </div>
  );
}

