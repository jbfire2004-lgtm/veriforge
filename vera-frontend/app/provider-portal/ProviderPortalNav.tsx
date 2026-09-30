"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ProviderPermission,
  hasProviderPermission,
  isTrainingInstructor,
  isTrainingProviderAdmin,
} from "@/lib/training-provider-permissions";

type NavItem = { href: string; label: string; permission?: string };

const ADMIN_NAV: NavItem[] = [
  { href: "/provider-portal", label: "Dashboard" },
  { href: "/provider-portal/profile", label: "Provider profile", permission: ProviderPermission.MANAGE_PROVIDER_PROFILE },
  { href: "/provider-portal/courses", label: "Courses", permission: ProviderPermission.MANAGE_COURSES },
  { href: "/provider-portal/instructors", label: "Instructors", permission: ProviderPermission.MANAGE_INSTRUCTORS },
  { href: "/provider-portal/approval", label: "Approval", permission: ProviderPermission.MANAGE_APPROVAL_STATUS },
  { href: "/provider-portal/compliance", label: "Compliance", permission: ProviderPermission.VIEW_PROVIDER_COMPLIANCE },
  { href: "/provider-portal/history", label: "History", permission: ProviderPermission.VIEW_TRAINING_HISTORY },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { href: "/provider-portal/instructor", label: "Dashboard" },
  { href: "/provider-portal/instructor/profile", label: "My profile", permission: ProviderPermission.VIEW_INSTRUCTOR_PROFILE },
  { href: "/provider-portal/upload", label: "Deliver training", permission: ProviderPermission.DELIVER_TRAINING },
  { href: "/provider-portal/class-lists", label: "Class lists", permission: ProviderPermission.UPLOAD_CLASS_LISTS },
  { href: "/provider-portal/certificates", label: "Certificates", permission: ProviderPermission.ISSUE_CERTIFICATES },
  { href: "/provider-portal/sign", label: "Sign certificates", permission: ProviderPermission.SIGN_CERTIFICATES },
];

const SHARED_NAV: NavItem[] = [
  { href: "/provider-portal/upload", label: "Upload training", permission: ProviderPermission.UPLOAD_TRAINING },
  { href: "/provider-portal/certificates", label: "Certificates", permission: ProviderPermission.ISSUE_CERTIFICATES },
];

export function ProviderPortalNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const isAdmin = isTrainingProviderAdmin(role);
  const isInstructor = isTrainingInstructor(role);

  let items: NavItem[] = [];
  if (isAdmin) items = [...ADMIN_NAV, ...SHARED_NAV.filter((s) => !ADMIN_NAV.some((a) => a.href === s.href))];
  else if (isInstructor) items = INSTRUCTOR_NAV;
  else items = [...ADMIN_NAV, ...INSTRUCTOR_NAV];

  const visible = items.filter(
    (item) => !item.permission || hasProviderPermission(role, item.permission as never)
  );

  const unique = visible.filter(
    (item, idx, arr) => arr.findIndex((x) => x.href === item.href) === idx
  );

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4 text-sm">
      {unique.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-1.5 ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
