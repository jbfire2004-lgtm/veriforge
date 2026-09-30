import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, buttonStyles } from "@/components/ui";

const LINKS = [
  { href: "/admin/settings/notifications", label: "Notifications", desc: "Email and in-app alerts" },
  { href: "/admin/companies", label: "Companies", desc: "Organization profiles" },
  { href: "/admin/projects", label: "Projects", desc: "Sites and assignments" },
  { href: "/admin/workers", label: "Users & workers", desc: "Roster and roles" },
  { href: "/admin/training/dashboard", label: "Training operations", desc: "Upload, OCR, verification" },
  { href: "/admin/training-standards", label: "Training standards", desc: "Compliance validation rules" },
];

export default function AdminSettingsHubPage() {
  return (
    <AdminPageShell
      title="System settings"
      description="Company, project, user, and training configuration."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Settings" },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((item) => (
          <Card key={item.href}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <h2 className="font-medium">{item.label}</h2>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              <Link href={item.href} className={buttonStyles({ variant: "outline", size: "sm" })}>
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPageShell>
  );
}
