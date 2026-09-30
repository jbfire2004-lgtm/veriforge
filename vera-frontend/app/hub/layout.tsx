import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { resolveSessionRole } from "@/lib/session-role";
import { HubSiteHeader } from "@/components/hub/HubSiteHeader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vera.app";

export const metadata: Metadata = {
  title: "Vera Hub — Your daily workforce dashboard",
  description:
    "Personalized feed, safety topics, weather alerts, jobs, training, and project updates for workers, supervisors, and union halls.",
  openGraph: {
    title: "Vera Hub",
    description:
      "Your daily dashboard for safety, jobs, training, and team updates.",
    type: "website",
    url: `${siteUrl}/hub`,
    siteName: "VERA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vera Hub",
    description: "Workforce dashboard — safety, jobs, and training in one place.",
  },
  alternates: { canonical: `${siteUrl}/hub` },
};

export default async function HubLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login?callbackUrl=/hub");
  }

  const role = resolveSessionRole(session);

  return (
    <main className="min-h-screen" style={{ background: "var(--shell-bg)" }}>
      <div className="mx-auto max-w-6xl px-vera-4 pb-vera-10 pt-vera-4 sm:px-vera-6">
        <HubSiteHeader
          role={role}
          userName={session.user?.name ?? null}
          userEmail={session.user?.email ?? null}
        />
        <div className="mt-vera-2">{children}</div>
      </div>
    </main>
  );
}
