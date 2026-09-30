import Link from "next/link";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "VeriAgent — Vera",
  description:
    "Central AI orchestration and privacy firewall. Internal services call VeriAgent; the browser never talks to providers directly.",
};

export default function VeriAgentPage() {
  return (
    <VeraPageLayout
      title="VeriAgent"
      description="AI orchestration and privacy firewall for VeriForge, FieldOS, and Vera PM."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm leading-6 text-[var(--foreground)]">
          VeriAgent is the only approved path from Vera to external AI providers.
          Training, FLHA, GPS, and images are redacted before they leave the
          tenant boundary. This page is the product home — not a chatbot.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--foreground)]">
          <li>Tenant isolation and role-aware access on every request</li>
          <li>Redaction and zero-retention toward LLM / vision providers</li>
          <li>Audit of who, when, and purpose — never raw payloads</li>
        </ul>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/veriforge/assistant"
            className="rounded-[3px] bg-[#1E6FB8] px-3 py-2 font-medium text-[#F4F6F8] no-underline hover:bg-[#1A63A6]"
          >
            Open safety assistant
          </Link>
          <Link
            href="/field/safety-pulse"
            className="rounded-[3px] border border-[#5A6169] px-3 py-2 font-medium no-underline hover:border-[#1E6FB8]"
          >
            FieldOS Safety Pulse
          </Link>
          <Link
            href="/pm"
            className="rounded-[3px] border border-[#5A6169] px-3 py-2 font-medium no-underline hover:border-[#1E6FB8]"
          >
            Vera PM
          </Link>
        </div>
      </div>
    </VeraPageLayout>
  );
}
