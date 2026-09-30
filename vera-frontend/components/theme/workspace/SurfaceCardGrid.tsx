import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { WorkspaceSurface } from "@/lib/navigation/workspace-surfaces";

type Props = {
  surfaces: WorkspaceSurface[];
  sectionTitle?: string;
  sectionDescription?: string;
  featuredLabel?: string;
};

export function SurfaceCardGrid({
  surfaces,
  sectionTitle = "Your VERA surfaces",
  sectionDescription,
  featuredLabel = "Start here",
}: Props) {
  const description =
    sectionDescription ??
    `Based on your role, you have access to ${surfaces.length} ${
      surfaces.length === 1 ? "product" : "products"
    }.`;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#247A78]">
          {sectionTitle}
        </h2>
        <p className="mt-2 text-sm text-[#4b5563]">{description}</p>
      </header>

      <div
        className={`grid gap-5 ${
          surfaces.length === 1
            ? "max-w-md"
            : surfaces.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
        }`}
      >
        {surfaces.map((surface, index) => {
          const Icon = surface.icon;
          const featured = index === 0;
          return (
            <Link
              key={surface.id}
              href={surface.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-md ring-1 transition hover:-translate-y-0.5 hover:shadow-lg ${surface.surface} ${surface.ring} ${
                featured ? "md:min-h-[220px]" : ""
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${surface.iconGradient}`}
                aria-hidden
              />
              {featured ? (
                <span className="absolute right-4 top-4 rounded-full bg-[#2F8F8C]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#247A78]">
                  {featuredLabel}
                </span>
              ) : null}
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${surface.iconGradient}`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-bold uppercase tracking-[0.04em] text-[#2A2E33]">
                {surface.name}
              </h3>
              <p
                className={`mt-1 text-sm font-semibold uppercase tracking-[0.08em] ${
                  featured ? "text-[#247A78]" : "text-[#64748b]"
                }`}
              >
                {surface.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4b5563]">
                {surface.description}
              </p>
              <span
                className={`mt-5 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition group-hover:gap-3 ${
                  featured
                    ? "bg-[#2A2E33] text-white"
                    : "border border-[#2A2E33]/15 bg-white/80 text-[#2A2E33]"
                }`}
              >
                {surface.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export type { LucideIcon };
