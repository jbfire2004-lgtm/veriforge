"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetchJson } from "@/lib/api-fetch";
import type { SafetyBlogCategory } from "@vera/api-contract";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { buttonStyles } from "@/components/ui";

export default function AdminSafetyBlogCategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<SafetyBlogCategory[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!session) return;
    apiFetchJson<SafetyBlogCategory[]>("/api/v1/admin/safety-blog/categories", { session }).then(
      setCategories,
    );
  }, [session]);

  const add = async () => {
    if (!session || !name.trim()) return;
    await apiFetchJson("/api/v1/admin/safety-blog/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim() }),
      session,
    });
    setName("");
    const next = await apiFetchJson<SafetyBlogCategory[]>(
      "/api/v1/admin/safety-blog/categories",
      { session },
    );
    setCategories(next);
  };

  return (
    <AdminPageShell
      title="Blog categories"
      breadcrumbs={[{ label: "Safety blog", href: "/admin/safety-blog" }, { label: "Categories" }]}
    >
      <div className="flex gap-vera-2 mb-vera-4">
        <input
          className="flex-1 rounded border border-vera-border px-vera-3 py-vera-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
        />
        <button type="button" onClick={add} className={buttonStyles({ variant: "primary", size: "sm" })}>
          Add
        </button>
      </div>
      <ul className="space-y-vera-2 text-sm">
        {categories.map((c) => (
          <li key={c.id} className="rounded border border-vera-border px-vera-3 py-vera-2">
            {c.name} <span className="text-vera-muted">/{c.slug}</span>
          </li>
        ))}
      </ul>
    </AdminPageShell>
  );
}
