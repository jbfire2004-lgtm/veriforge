import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { adminListAutoRules } from "@/lib/moderation/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminModerationRulesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/moderation/rules");

  const rules = await adminListAutoRules(session).catch(() => []);

  return (
    <AdminPageShell
      title="Auto-flag rules"
      description="Keyword and threshold rules that automatically flag content for review."
    >
      <p className="text-sm mb-vera-4">
        <Link href="/admin/moderation" className="text-vera-teal hover:underline">
          ← Moderation queue
        </Link>
      </p>
      <ul className="space-y-vera-3 text-sm">
        {rules.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-vera-border p-vera-4 flex justify-between gap-vera-4"
          >
            <div>
              <p className="font-medium">
                {r.name}{" "}
                <span className={r.enabled ? "text-vera-teal" : "text-vera-muted"}>
                  ({r.enabled ? "enabled" : "disabled"})
                </span>
              </p>
              <p className="text-vera-muted mt-vera-1">
                {r.ruleType} · {r.action} · priority {r.priority}
                {r.targetType ? ` · ${r.targetType}` : ""}
              </p>
              <pre className="mt-vera-2 text-xs bg-vera-muted/10 p-vera-2 rounded overflow-x-auto">
                {JSON.stringify(r.config, null, 2)}
              </pre>
            </div>
          </li>
        ))}
        {rules.length === 0 ? (
          <li className="text-vera-muted">No rules configured.</li>
        ) : null}
      </ul>
    </AdminPageShell>
  );
}
