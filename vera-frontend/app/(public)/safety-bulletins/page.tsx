import Link from "next/link";
import { PublicIndustryShell } from "@/components/public-safety/PublicIndustryShell";
import {
  SAFETY_BULLETINS,
  STANDARDS_RESOURCE_LINKS,
} from "@/lib/public-safety/bulletins-data";

const CATEGORY_LABEL: Record<string, string> = {
  LEGISLATION: "Legislation",
  CSA_STANDARD: "CSA standard",
  INDUSTRY: "Industry",
  PROVINCIAL: "Provincial",
};

export default function SafetyBulletinsPage() {
  return (
    <PublicIndustryShell title="Safety bulletins">
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-[#2A2E33]">
            Safety bulletins & standards updates
          </h1>
          <p className="mt-3 max-w-2xl text-[#5a6b7c]">
            Legislative changes, CSA/ANSI updates, and industry notices that affect field
            safety programs — including fall protection and SRL requirements.
          </p>
        </header>

        <ul className="space-y-4">
          {SAFETY_BULLETINS.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm"
            >
              <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                {CATEGORY_LABEL[b.category] ?? b.category}
              </span>
              <h2 className="mt-2 text-lg font-semibold text-[#2A2E33]">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6b7c]">{b.summary}</p>
              {b.effectiveDate ? (
                <p className="mt-2 text-xs text-[#5a6b7c]">
                  Effective {new Date(b.effectiveDate).toLocaleDateString()}
                </p>
              ) : null}
              <a
                href={b.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-[#2F8F8C] hover:underline"
              >
                Read on {b.sourceLabel} →
              </a>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="text-lg font-semibold text-[#2A2E33]">
            CSA, ANSI & regulator resources
          </h2>
          <p className="mt-2 text-sm text-[#5a6b7c]">
            Bookmark these sources for authoritative standards text and official guidance.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {STANDARDS_RESOURCE_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-lg border border-[#2A2E33]/10 bg-white p-4 hover:border-[#2F8F8C]/40"
                >
                  <p className="font-medium text-[#2A2E33]">
                    {link.name}{" "}
                    <span className="text-xs font-normal text-[#5a6b7c]">({link.region})</span>
                  </p>
                  <p className="mt-1 text-sm text-[#5a6b7c]">{link.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-[#5a6b7c]">
          Related:{" "}
          <Link href="/safety-recalls" className="font-medium text-[#2F8F8C] hover:underline">
            Safety equipment recalls
          </Link>
          {" · "}
          <Link href="/safety" className="font-medium text-[#2F8F8C] hover:underline">
            Safety blog
          </Link>
        </p>
      </div>
    </PublicIndustryShell>
  );
}
