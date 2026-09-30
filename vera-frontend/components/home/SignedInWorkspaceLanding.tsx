import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  buildQuickTools,
  buildSubscribedSurfaces,
  roleDisplayLabel,
} from "@/lib/navigation/workspace-surfaces";
import { buttonStyles } from "@/components/ui";
import {
  WorkspaceHero,
  SurfaceCardGrid,
  ModuleLinkGrid,
} from "@/components/theme/workspace";
type Props = {
  userName?: string | null;
  userEmail?: string | null;
  role: string | null;
};

export function SignedInWorkspaceLanding({ userName, userEmail, role }: Props) {
  const firstName = userName?.trim().split(/\s+/)[0] ?? userEmail?.split("@")[0] ?? "there";
  const surfaces = buildSubscribedSurfaces(role);
  const quickTools = buildQuickTools(role);
  const roleLabel = roleDisplayLabel(role);

  const quickModules = quickTools.map((t) => ({
    href: t.href,
    title: t.label,
    description: t.description,
  }));

  return (
    <div className="space-y-10 pb-16">
      <WorkspaceHero
        variant="welcome"
        eyebrow={`Signed in · ${roleLabel}`}
        title={`Welcome back, ${firstName}`}
        description={
          <>
            Choose where to work today. Your subscribed VERA surfaces are below — Hub
            for company context, Core for records, and PM when you run project safety.
            {userEmail ? (
              <span className="mt-2 block text-sm text-teal-200/80">{userEmail}</span>
            ) : null}
          </>
        }
        badges={[{ label: "VERA workspace", tone: "teal" }]}
      />

      <SurfaceCardGrid surfaces={surfaces} />

      <section className="rounded-xl border border-[#2A2E33]/10 bg-white px-5 py-5 shadow-sm">
        <p className="text-sm font-semibold text-[#2A2E33]">Subscriptions</p>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Compare Hub, Core, and PM plans — upgrade tiers and add-ons for your organization.
        </p>
        <Link
          href="/subscriptions"
          className={buttonStyles({
            variant: "primary",
            size: "sm",
            className: "mt-4 inline-flex bg-teal-600 hover:bg-teal-700",
          })}
        >
          View plans & pricing
        </Link>
      </section>

      {quickModules.length > 0 ? (
        <ModuleLinkGrid
          modules={quickModules}
          sectionId="role-tools"
          sectionTitle="Role tools"
          sectionDescription="Shortcuts for your day-to-day work outside the main three surfaces."
          columns="three"
        />
      ) : null}

      <section className="rounded-xl border border-dashed border-[#2F8F8C]/30 bg-[#E4F3F2]/60 px-5 py-5">
        <p className="text-sm leading-relaxed text-[#374151]">
          <span className="font-semibold text-[#2A2E33]">Industry home</span> — weather,
          jobs, experts, and public safety updates are open to everyone on{" "}
          <Link href="/home" className="font-semibold text-[#2F8F8C] underline hover:text-[#247A78]">
            VERA Home
          </Link>
          . Your employer-specific feed and awards stay in Vera Hub.
        </p>
        <Link
          href="/home"
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            className: "mt-4 inline-flex gap-2 border-[#2F8F8C]/30",
          })}
        >
          Browse industry home
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
