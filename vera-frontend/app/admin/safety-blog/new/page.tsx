import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SafetyBlogEditor } from "@/components/safety-blog/admin/SafetyBlogEditor";

export default async function AdminNewSafetyPostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/safety-blog/new");

  return (
    <AdminPageShell title="New safety article" breadcrumbs={[{ label: "Safety blog", href: "/admin/safety-blog" }, { label: "New" }]}>
      <SafetyBlogEditor session={session} />
    </AdminPageShell>
  );
}
