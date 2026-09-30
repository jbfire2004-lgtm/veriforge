import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { apiFetchJson } from "@/lib/api-fetch";
import type { SafetyBlogPostDetail } from "@vera/api-contract";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SafetyBlogEditor } from "@/components/safety-blog/admin/SafetyBlogEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditSafetyPostPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  let post: SafetyBlogPostDetail;
  try {
    post = await apiFetchJson<SafetyBlogPostDetail>(
      `/api/v1/admin/safety-blog/posts/${id}`,
      { session },
    );
  } catch {
    notFound();
  }

  return (
    <AdminPageShell
      title="Edit article"
      breadcrumbs={[
        { label: "Safety blog", href: "/admin/safety-blog" },
        { label: post.title },
      ]}
    >
      <SafetyBlogEditor session={session} post={post} />
    </AdminPageShell>
  );
}
