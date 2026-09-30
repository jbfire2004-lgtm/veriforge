import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { adminFetchPosts } from "@/lib/safety-blog/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { buttonStyles } from "@/components/ui";

export default async function AdminSafetyBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/safety-blog");

  const list = await adminFetchPosts(session).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  }));

  return (
    <AdminPageShell
      title="Safety blog"
      description="Create and manage public safety knowledge articles."
      actions={
        <Link href="/admin/safety-blog/new" className={buttonStyles({ variant: "primary", size: "sm" })}>
          New post
        </Link>
      }
    >
      <div className="flex flex-wrap gap-vera-3 text-sm mb-vera-4">
        <Link href="/admin/safety-blog/categories" className="text-vera-teal hover:underline">
          Categories
        </Link>
        <Link href="/admin/safety-blog/tags" className="text-vera-teal hover:underline">
          Tags
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-vera-border">
        <table className="w-full text-sm">
          <thead className="bg-vera-muted/10 text-left">
            <tr>
              <th className="p-vera-3">Title</th>
              <th className="p-vera-3">Category</th>
              <th className="p-vera-3">Status</th>
              <th className="p-vera-3">Featured</th>
              <th className="p-vera-3" />
            </tr>
          </thead>
          <tbody>
            {list.items.map((post) => (
              <tr key={post.id} className="border-t border-vera-border">
                <td className="p-vera-3 font-medium">{post.title}</td>
                <td className="p-vera-3">{post.category}</td>
                <td className="p-vera-3 capitalize">{post.featured ? "featured" : "—"}</td>
                <td className="p-vera-3">{post.featured ? "Yes" : "No"}</td>
                <td className="p-vera-3 text-right">
                  <Link
                    href={`/admin/safety-blog/${post.id}/edit`}
                    className="text-vera-teal hover:underline"
                  >
                    Edit
                  </Link>
                  {" · "}
                  <Link href={`/safety/${post.slug}`} className="text-vera-muted hover:underline" target="_blank">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
