import type { HomepagePayload } from "@vera/api-contract";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  CloudSun,
  LayoutGrid,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "@/components/ui";
import { WeatherAlertsSection } from "@/components/hub/sections/WeatherAlertsSection";
import { TrendingTopicsSection } from "@/components/hub/sections/TrendingTopicsSection";
import { JobPostCard } from "@/components/hub/cards/JobPostCard";
import { SafetyArticleCard } from "@/components/hub/cards/SafetyArticleCard";
import {
  canAccessAdminShell,
  canAccessPmWorkspace,
  canAccessSupervisorShell,
} from "@/lib/phase1-roles";

const ECOSYSTEM = [
  {
    id: "hub",
    name: "Vera Hub",
    tagline: "Your daily workforce pulse",
    description:
      "Company feed, safety champions, project updates, and role-aware quick actions — everything specific to your employer lives here after you sign in.",
    href: "/hub",
    icon: LayoutGrid,
    accent: "from-teal-500/20 via-teal-400/10 to-transparent border-teal-500/30",
    cta: "Open Vera Hub",
  },
  {
    id: "core",
    name: "Vera Core",
    tagline: "Records, verification & compliance",
    description:
      "Training ingest, credential verification, workers, equipment, and audit-friendly core workflows for your organization.",
    href: "/core/training-ingest",
    icon: ShieldCheck,
    accent: "from-slate-600/15 via-slate-500/5 to-transparent border-slate-400/30",
    cta: "Open Vera Core",
  },
  {
    id: "pm",
    name: "Vera PM",
    tagline: "Project safety execution",
    description:
      "Safety forms, JHA/FLHA, hazard intelligence, inspections, and corrective actions tied to active projects.",
    href: "/pm",
    icon: ClipboardList,
    accent: "from-amber-500/15 via-amber-400/5 to-transparent border-amber-500/30",
    cta: "Open Vera PM",
  },
] as const;

type Props = {
  userName?: string | null;
  role: string | null;
  snapshot: HomepagePayload;
  apiOffline?: boolean;
};

export function VeraEcosystemLandingPage({
  userName,
  role,
  snapshot,
  apiOffline,
}: Props) {
  const showPm = canAccessPmWorkspace(role);
  const showSupervisor = canAccessSupervisorShell(role);
  const pillars = ECOSYSTEM.filter((p) => p.id !== "pm" || showPm);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-vera-charcoal/10 bg-gradient-to-br from-vera-deep via-[#0f2847] to-vera-teal/40 text-vera-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(45,212,191,0.25) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-vera-4 py-vera-16 sm:px-vera-6 sm:py-vera-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200/90">
            VERA ecosystem
          </p>
          <h1 className="mt-vera-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {userName ? `Welcome back, ${userName.split(" ")[0]}` : "One platform for workforce safety"}
          </h1>
          <p className="mt-vera-4 max-w-2xl text-lg leading-relaxed text-teal-50/90">
            Home is your open industry window — weather, jobs, experts, and safety
            news for everyone. Vera Hub holds company-specific awards and updates
            once you are on your employer&apos;s roster.
          </p>
          <div className="mt-vera-8 flex flex-wrap gap-vera-3">
            <Link href="/hub" className={buttonStyles({ variant: "default", size: "md" })}>
              Vera Hub
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {showSupervisor ? (
              <Link
                href="/supervisor"
                className={buttonStyles({
                  variant: "outline",
                  size: "md",
                  className: "border-white/40 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                Supervisor workspace
              </Link>
            ) : null}
            {showPm ? (
              <Link
                href="/pm"
                className={buttonStyles({
                  variant: "outline",
                  size: "md",
                  className: "border-white/40 bg-white/10 text-white hover:bg-white/20",
                })}
              >
                Vera PM
              </Link>
            ) : null}
            {canAccessAdminShell(role) ? (
              <Link
                href="/admin"
                className={buttonStyles({
                  variant: "ghost",
                  size: "md",
                  className: "text-teal-100 hover:bg-white/10",
                })}
              >
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-vera-12 px-vera-4 py-vera-12 sm:px-vera-6">
        {apiOffline ? (
          <p
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-vera-4 py-vera-3 text-sm text-amber-900"
          >
            Live data is temporarily unavailable. Ecosystem links below still work;
            start the API on port 3001 for weather and job previews.
          </p>
        ) : null}

        <section className="space-y-vera-6">
          <header>
            <h2 className="text-2xl font-semibold tracking-tight text-vera-charcoal">
              Three surfaces, one program
            </h2>
            <p className="mt-vera-2 max-w-2xl text-vera-muted">
              Pick the product that matches your job — Hub for company context, Core
              for records, PM for project safety execution.
            </p>
          </header>
          <div className="grid gap-vera-6 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.id}
                  className={`overflow-hidden border bg-gradient-to-br shadow-md ${p.accent}`}
                >
                  <CardHeader>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-vera-white/80 text-vera-deep shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <CardTitle className="text-xl">{p.name}</CardTitle>
                    <CardDescription className="font-medium text-vera-teal">
                      {p.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-vera-4">
                    <p className="text-sm leading-relaxed text-vera-muted">
                      {p.description}
                    </p>
                    <Link
                      href={p.href}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      {p.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-vera-6">
          <header className="flex flex-wrap items-end justify-between gap-vera-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-vera-charcoal">
                Industry snapshot
              </h2>
              <p className="mt-vera-2 text-vera-muted">
                Open to all signed-in users — not tied to a single employer.
              </p>
            </div>
            <Link
              href="/hub"
              className="text-sm font-medium text-vera-teal hover:underline"
            >
              Company feed & awards in Vera Hub →
            </Link>
          </header>

          <div className="grid gap-vera-4 sm:grid-cols-3">
            <Link
              href="/experts"
              className="group rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-5 shadow-sm transition hover:border-vera-teal/40 hover:shadow-md"
            >
              <MessageCircleQuestion className="h-8 w-8 text-vera-teal" aria-hidden />
              <p className="mt-vera-3 font-semibold text-vera-charcoal group-hover:text-vera-teal">
                Ask an expert
              </p>
              <p className="mt-vera-1 text-sm text-vera-muted">
                Safety questions from the community, answered by verified specialists.
              </p>
            </Link>
            <Link
              href="/jobs"
              className="group rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-5 shadow-sm transition hover:border-vera-teal/40 hover:shadow-md"
            >
              <Briefcase className="h-8 w-8 text-vera-teal" aria-hidden />
              <p className="mt-vera-3 font-semibold text-vera-charcoal group-hover:text-vera-teal">
                Job board
              </p>
              <p className="mt-vera-1 text-sm text-vera-muted">
                Open roles and trades opportunities across the network.
              </p>
            </Link>
            <Link
              href="/safety"
              className="group rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-5 shadow-sm transition hover:border-vera-teal/40 hover:shadow-md"
            >
              <CloudSun className="h-8 w-8 text-vera-teal" aria-hidden />
              <p className="mt-vera-3 font-semibold text-vera-charcoal group-hover:text-vera-teal">
                Safety blog
              </p>
              <p className="mt-vera-1 text-sm text-vera-muted">
                Articles, lessons learned, and field-ready guidance.
              </p>
            </Link>
          </div>

          {snapshot.sections.includes("weather") ? (
            <WeatherAlertsSection weather={snapshot.weather} />
          ) : null}

          {snapshot.sections.includes("trending") &&
          snapshot.trendingTopics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Trending safety topics</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingTopicsSection topics={snapshot.trendingTopics} />
              </CardContent>
            </Card>
          ) : null}

          {snapshot.sections.includes("jobs") && snapshot.jobPreview.length > 0 ? (
            <div className="space-y-vera-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-vera-charcoal">
                  Latest jobs
                </h3>
                <Link href="/jobs" className="text-sm font-medium text-vera-teal hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-vera-4 md:grid-cols-2 lg:grid-cols-3">
                {snapshot.jobPreview.slice(0, 3).map((job) => (
                  <JobPostCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          ) : null}

          {snapshot.sections.includes("safetyBlog") &&
          snapshot.safetyBlogPreview.length > 0 ? (
            <div className="space-y-vera-4">
              <h3 className="text-lg font-semibold text-vera-charcoal">
                From the safety blog
              </h3>
              <div className="grid gap-vera-4 md:grid-cols-2 lg:grid-cols-3">
                {snapshot.safetyBlogPreview.slice(0, 3).map((article) => (
                  <SafetyArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <Card className="border-dashed border-vera-teal/30 bg-teal-50/50">
          <CardContent className="py-vera-6">
            <p className="text-sm leading-relaxed text-vera-charcoal">
              <strong className="font-semibold">Company-specific content</strong>{" "}
              — safety awards, champions, announcements, and project updates — appears
              in{" "}
              <Link href="/hub" className="font-semibold text-vera-teal underline">
                Vera Hub
              </Link>{" "}
              once your employer links your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
