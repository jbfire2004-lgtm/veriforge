import Link from "next/link";
import { PublicIndustryShell } from "@/components/public-safety/PublicIndustryShell";
import { SubmitRecallForm } from "@/components/public-safety/SubmitRecallForm";
import { SAFETY_RECALLS } from "@/lib/public-safety/recalls-data";
import { STANDARDS_RESOURCE_LINKS } from "@/lib/public-safety/bulletins-data";

export default function SafetyRecallsPage() {
  return (
    <PublicIndustryShell title="Safety recalls">
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-[#2A2E33]">Safety equipment recalls</h1>
          <p className="mt-3 max-w-2xl text-[#5a6b7c]">
            Recent recalls and manufacturer advisories relevant to construction and industrial
            PPE. Always verify on the official regulator or OEM site before acting.
          </p>
        </header>

        <ul className="space-y-4">
          {SAFETY_RECALLS.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-[#2A2E33]">{r.title}</h2>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase text-amber-900">
                  {r.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#5a6b7c]">
                {r.manufacturer} · {r.product}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{r.summary}</p>
              <p className="mt-3 text-xs text-[#5a6b7c]">
                Published {new Date(r.publishedAt).toLocaleDateString()}
              </p>
              <a
                href={r.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-[#2F8F8C] hover:underline"
              >
                View on {r.sourceLabel} →
              </a>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="text-lg font-semibold text-[#2A2E33]">Official recall databases</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {STANDARDS_RESOURCE_LINKS.filter((l) =>
              ["hc-recalls", "cpsc"].includes(l.id),
            ).map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-[#2A2E33]/10 bg-white p-4 hover:border-[#2F8F8C]/40"
                >
                  <p className="font-medium text-[#2A2E33]">{link.name}</p>
                  <p className="mt-1 text-sm text-[#5a6b7c]">{link.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <SubmitRecallForm />

        <p className="text-sm text-[#5a6b7c]">
          Related:{" "}
          <Link href="/safety-bulletins" className="font-medium text-[#2F8F8C] hover:underline">
            Safety bulletins & legislation
          </Link>
        </p>
      </div>
    </PublicIndustryShell>
  );
}
