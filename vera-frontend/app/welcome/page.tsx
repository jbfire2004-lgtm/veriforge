import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { resolveSessionRole } from "@/lib/session-role";
import { SignedInWorkspaceLanding } from "@/components/home/SignedInWorkspaceLanding";

export const metadata = {
  title: "My workspace — VERA",
  description: "Your subscribed VERA surfaces — Hub, Core, and PM.",
};

export default async function WelcomePage() {
  const session = await getServerSession(authOptions);
  const role = resolveSessionRole(session);

  return (
    <SignedInWorkspaceLanding
      role={role}
      userName={session?.user?.name ?? null}
      userEmail={session?.user?.email ?? null}
    />
  );
}
