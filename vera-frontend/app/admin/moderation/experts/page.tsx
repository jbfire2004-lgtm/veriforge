import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { adminListExpertVerification } from "@/lib/moderation/api";
import { ExpertVerificationQueue } from "@/components/moderation/ExpertVerificationQueue";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminExpertVerificationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/moderation/experts");

  const pending = await adminListExpertVerification(session).catch(() => []);

  return (
    <AdminPageShell
      title="Expert verification"
      description="Review applications for verified expert status."
    >
      <p className="text-sm mb-vera-4">
        <Link href="/admin/moderation" className="text-vera-teal hover:underline">
          ← Moderation queue
        </Link>
      </p>
      <ExpertVerificationQueue initial={pending} />
    </AdminPageShell>
  );
}
