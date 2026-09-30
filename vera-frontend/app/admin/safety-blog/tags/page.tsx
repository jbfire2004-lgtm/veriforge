"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetchJson } from "@/lib/api-fetch";
import type { SafetyBlogTag } from "@vera/api-contract";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { buttonStyles } from "@/components/ui";

export default function AdminSafetyBlogTagsPage() {
  const { data: session } = useSession();
  const [tags, setTags] = useState<SafetyBlogTag[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!session) return;
    apiFetchJson<SafetyBlogTag[]>("/api/v1/admin/safety-blog/tags", { session }).then(setTags);
  }, [session]);

  const add = async () => {
    if (!session || !name.trim()) return;
    await apiFetchJson("/api/v1/admin/safety-blog/tags", {
      method: "POST",
      body: JSON.stringify({ name: name.trim() }),
      session,
    });
    setName("");
    const next = await apiFetchJson<SafetyBlogTag[]>("/api/v1/admin/safety-blog/tags", { session });
    setTags(next);
  };

  return (
    <AdminPageShell title="Blog tags" breadcrumbs={[{ label: "Safety blog", href: "/admin/safety-blog" }, { label: "Tags" }]}>
      <div className="flex gap-vera-2 mb-vera-4">
        <input
          className="flex-1 rounded border border-vera-border px-vera-3 py-vera-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
        />
        <button type="button" onClick={add} className={buttonStyles({ variant: "primary", size: "sm" })}>
          Add
        </button>
      </div>
      <ul className="space-y-vera-2 text-sm">
        {tags.map((t) => (
          <li key={t.id} className="rounded border border-vera-border px-vera-3 py-vera-2">
            {t.name} <span className="text-vera-muted">/{t.slug}</span>
          </li>
        ))}
      </ul>
    </AdminPageShell>
  );
}
