import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { BriefingGeneratorView } from "@/components/briefing/BriefingGeneratorView";

export const metadata = {
  title: "Daily Safety Briefing — VERA Hub",
  description: "Generate toolbox talks, FLHAs, and crew briefings in seconds.",
};

export default async function BriefingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/briefing");
  }

  return <BriefingGeneratorView />;
}
