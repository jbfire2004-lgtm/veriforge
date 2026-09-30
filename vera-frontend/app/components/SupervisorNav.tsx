"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SupervisorNav() {
  const pathname = usePathname();

  const nav = [
    { name: "Home", href: "/supervisor/home" },
    { name: "Scan", href: "/supervisor/scan" },
    { name: "Incidents", href: "/supervisor/incidents" },
    { name: "Combined", href: "/supervisor/combined" },
    { name: "History", href: "/supervisor/history" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 text-white flex justify-around py-3 z-50">
      {nav.map((item) => {
        const active = (pathname ?? "").startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm ${
              active ? "text-blue-400 font-semibold" : "text-gray-400"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
