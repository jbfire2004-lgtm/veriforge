import Link from "next/link";
import { WorkspaceSection } from "@/components/theme/workspace";
import { SAFETY_RECALLS } from "@/lib/public-safety/recalls-data";
import { SAFETY_BULLETINS } from "@/lib/public-safety/bulletins-data";

/** Industry-wide panels on Vera Hub (recalls, bulletins). */
export function HubIndustryPanels() {
  const recalls = SAFETY_RECALLS.slice(0, 2);
  const bulletins = SAFETY_BULLETINS.slice(0, 2);

  return (
    <WorkspaceSection
      title="Industry intelligence"
      description="Recalls, standards updates, and public safety resources beyond your company feed."
      className="border-t border-[#2A2E33]/10 pt-8"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold uppercase tracking-[0.04em] text-[#2A2E33]">
              Safety recalls
            </h3>
            <Link
              href="/safety-recalls"
              className="text-sm font-medium text-[#2F8F8C] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recalls.map((r) => (
              <li key={r.id} className="border-b border-[#2A2E33]/5 pb-3 last:border-0">
                <p className="font-medium text-[#2A2E33]">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#5a6b7c]">{r.summary}</p>
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-[#2F8F8C] hover:underline"
                >
                  {r.sourceLabel}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold uppercase tracking-[0.04em] text-[#2A2E33]">
              Bulletins & legislation
            </h3>
            <Link
              href="/safety-bulletins"
              className="text-sm font-medium text-[#2F8F8C] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {bulletins.map((b) => (
              <li key={b.id} className="border-b border-[#2A2E33]/5 pb-3 last:border-0">
                <p className="font-medium text-[#2A2E33]">{b.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#5a6b7c]">{b.summary}</p>
                <a
                  href={b.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-[#2F8F8C] hover:underline"
                >
                  {b.sourceLabel}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/experts" className="font-semibold text-[#2F8F8C] hover:underline">
          Ask an expert
        </Link>
        <Link href="/jobs" className="font-semibold text-[#2F8F8C] hover:underline">
          Job board
        </Link>
        <Link href="/safety" className="font-semibold text-[#2F8F8C] hover:underline">
          Safety blog
        </Link>
        <Link href="/weather" className="font-semibold text-[#2F8F8C] hover:underline">
          Weather & hazards
        </Link>
      </div>
    </WorkspaceSection>
  );
}
