import Link from "next/link";
import { WorkspaceHero } from "@/components/theme/workspace";
import { PublicWeatherPanel } from "@/components/public-safety/PublicWeatherPanel";
import { SAFETY_RECALLS } from "@/lib/public-safety/recalls-data";
import { SAFETY_BULLETINS } from "@/lib/public-safety/bulletins-data";

const ECOSYSTEM_PILLARS = [
  {
    id: "hub",
    name: "Vera Hub",
    tagline: "Your daily workforce pulse",
    description:
      "Company feed, safety champions, project updates, and role-aware actions — everything specific to your employer.",
    href: "/hub",
    cta: "Open Vera Hub",
    accent: "from-[#2F8F8C] to-[#2dd4bf]",
    surface: "from-[#E4F3F2]/80 via-[#E4F3F2] to-white",
    ring: "ring-[#2F8F8C]/20",
    taglineColor: "text-[#247A78]",
    ctaClass:
      "bg-[#2A2E33] text-white hover:bg-[#1e4a7a] shadow-sm",
  },
  {
    id: "core",
    name: "Vera Core",
    tagline: "Records, verification & compliance",
    description:
      "Training ingest, credential verification, workers, equipment, and audit-friendly core workflows.",
    href: "/auth/login?callbackUrl=/welcome",
    cta: "Open Vera Core",
    accent: "from-[#1e4a7a] to-[#2A2E33]",
    surface: "from-[#dbeafe]/70 via-[#f0f6fc] to-white",
    ring: "ring-[#1e4a7a]/20",
    taglineColor: "text-[#174F86]",
    ctaClass:
      "border border-[#1e4a7a]/30 bg-white text-[#2A2E33] hover:bg-[#f0f6fc]",
  },
  {
    id: "pm",
    name: "Vera PM",
    tagline: "Project safety execution",
    description:
      "Safety forms, JHA/FLHA, hazard intelligence, inspections, and corrective actions tied to active projects.",
    href: "/auth/login?callbackUrl=/welcome",
    cta: "Open Vera PM",
    accent: "from-[#d97706] to-[#C89F3D]",
    surface: "from-[#fef3c7]/80 via-[#fffbeb] to-white",
    ring: "ring-amber-400/25",
    taglineColor: "text-amber-800",
    ctaClass:
      "border border-amber-500/40 bg-amber-50 text-amber-950 hover:bg-amber-100",
  },
] as const;

/** Shared heading styles — titles & subtitles in capitals. */
const TITLE_LG = "uppercase tracking-[0.06em]";
const TITLE_MD = "uppercase tracking-[0.08em]";
const SUBTITLE = "uppercase tracking-[0.14em] font-semibold";

const INDUSTRY_LINKS = [
  {
    href: "/experts",
    title: "Ask an expert",
    description: "Safety questions answered by verified specialists.",
  },
  {
    href: "/jobs",
    title: "Job board",
    description: "Open roles and trades opportunities.",
  },
  {
    href: "/safety",
    title: "Safety blog",
    description: "Articles and field-ready guidance.",
  },
  {
    href: "/safety-recalls",
    title: "Safety recalls",
    description: "Equipment recalls and OEM advisories.",
  },
  {
    href: "/safety-bulletins",
    title: "Bulletins & legislation",
    description: "CSA, ANSI, and regulatory updates.",
  },
] as const;

type Props = {
  /** When true, show workspace links instead of sign-in (signed-in industry home). */
  signedIn?: boolean;
};

/**
 * Public VERA Home — server-only markup (no client components).
 * Renders visible HTML without waiting for JavaScript hydration.
 */
export function PublicHomeStatic({ signedIn = false }: Props) {
  const recallPreview = SAFETY_RECALLS.slice(0, 2);
  const bulletinPreview = SAFETY_BULLETINS.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#2A2E33]">
      <header className="sticky top-0 z-40 border-b border-[#2A2E33]/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/home" className="text-lg font-semibold text-[#2A2E33] hover:text-[#2F8F8C]">
            VERA
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {signedIn ? (
              <>
                <Link
                  href="/welcome"
                  className={`inline-flex h-9 items-center rounded-lg border border-[#2F8F8C]/30 px-3 text-xs font-bold text-[#247A78] hover:bg-[#E4F3F2] ${SUBTITLE}`}
                >
                  My workspace
                </Link>
                <Link
                  href="/hub"
                  className={`inline-flex h-9 items-center rounded-lg bg-[#2A2E33] px-4 text-xs font-bold text-white hover:bg-[#1e4a7a] ${SUBTITLE}`}
                >
                  Vera Hub
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login?callbackUrl=/welcome"
                className={`inline-flex h-9 items-center rounded-lg bg-[#2A2E33] px-4 text-xs font-bold text-white hover:bg-[#1e4a7a] ${SUBTITLE}`}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="border-b border-[#2A2E33]/10">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <WorkspaceHero
            eyebrow="VERA ecosystem"
            title="One platform for workforce safety"
            description="Your open industry window for weather, jobs, experts, recalls, and safety news. Company awards and champions live in Vera Hub after you join your employer."
          >
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/safety-recalls"
                className={`inline-flex h-10 items-center rounded-lg border border-white/40 px-5 text-xs font-semibold text-white hover:bg-white/10 sm:text-sm ${SUBTITLE}`}
              >
                Safety recalls
              </Link>
              <Link
                href="/safety-bulletins"
                className={`inline-flex h-10 items-center rounded-lg border border-white/40 px-5 text-xs font-semibold text-white hover:bg-white/10 sm:text-sm ${SUBTITLE}`}
              >
                Bulletins
              </Link>
            </div>
          </WorkspaceHero>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6">
        <section className="-mt-2">
          <header className="mb-8">
            <h2
              className={`text-2xl font-bold text-[#2A2E33] sm:text-3xl ${TITLE_LG}`}
            >
              Three surfaces, one program
            </h2>
            <p className={`mt-3 max-w-2xl text-xs text-[#5a6b7c] sm:text-sm ${SUBTITLE}`}>
              Pick the VERA product that matches your role — each surface shares the same
              safety data model, tuned for how you work.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {ECOSYSTEM_PILLARS.map((p) => (
              <article
                key={p.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b p-6 shadow-lg ring-1 transition hover:-translate-y-0.5 hover:shadow-xl ${p.surface} ${p.ring}`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.accent}`}
                  aria-hidden
                />
                <span
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-md ${p.accent}`}
                  aria-hidden
                >
                  {p.name.split(" ")[1]?.charAt(0) ?? "V"}
                </span>
                <h3 className={`text-xl font-bold text-[#2A2E33] ${TITLE_MD}`}>{p.name}</h3>
                <p className={`mt-2 text-xs ${p.taglineColor} ${SUBTITLE}`}>{p.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#5a6b7c]">
                  {p.description}
                </p>
                <Link
                  href={p.href}
                  className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-xs font-bold transition sm:text-sm ${SUBTITLE} ${p.ctaClass}`}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <PublicWeatherPanel />

        <section>
          <h2 className={`text-2xl font-bold text-[#2A2E33] ${TITLE_LG}`}>
            Explore the network
          </h2>
          <p className={`mt-3 text-xs text-[#5a6b7c] sm:text-sm ${SUBTITLE}`}>
            Open to everyone — not tied to one employer.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm transition hover:border-[#2F8F8C]/40 hover:shadow-md"
              >
                <p className={`font-bold text-[#2A2E33] ${TITLE_MD}`}>{item.title}</p>
                <p className="mt-1 text-sm text-[#5a6b7c]">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold text-[#2A2E33] ${TITLE_MD}`}>
                Recent safety recalls
              </h2>
              <Link
                href="/safety-recalls"
                className={`text-xs font-semibold text-[#2F8F8C] hover:underline ${SUBTITLE}`}
              >
                All recalls
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {recallPreview.map((r) => (
                <li key={r.id}>
                  <p className="font-medium text-[#2A2E33]">{r.title}</p>
                  <p className="mt-1 text-sm text-[#5a6b7c] line-clamp-2">{r.summary}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold text-[#2A2E33] ${TITLE_MD}`}>
                Standards & legislation
              </h2>
              <Link
                href="/safety-bulletins"
                className={`text-xs font-semibold text-[#2F8F8C] hover:underline ${SUBTITLE}`}
              >
                All bulletins
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {bulletinPreview.map((b) => (
                <li key={b.id}>
                  <p className="font-medium text-[#2A2E33]">{b.title}</p>
                  <p className="mt-1 text-sm text-[#5a6b7c] line-clamp-2">{b.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-xl border border-dashed border-[#2F8F8C]/40 bg-teal-50/80 p-6 text-sm leading-relaxed">
          <strong>Company-specific content</strong> — awards, champions, announcements — appears in{" "}
          <Link href="/hub" className="font-semibold text-[#2F8F8C] underline">
            Vera Hub
          </Link>{" "}
          once your employer links your account.
        </section>
      </main>
    </div>
  );
}
