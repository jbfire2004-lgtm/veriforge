"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/admin" },
    { name: "Incidents", href: "/admin/incidents" },
    { name: "Moderation", href: "/admin/moderation" },
    { name: "Documents", href: "/admin/documents/upload" },
    { name: "Analytics", href: "/admin/analytics" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-6 border-r border-gray-700 fixed left-0 top-0">
      <h1 className="text-2xl font-bold mb-8">VERA Admin</h1>

      <div className="space-y-3">
        {nav.map((item) => {
          const active = (pathname ?? "").startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block p-2 rounded ${
                active ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
