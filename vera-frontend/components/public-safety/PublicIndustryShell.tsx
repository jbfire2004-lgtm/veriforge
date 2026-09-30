import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function PublicIndustryShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#2A2E33]">
      <header className="border-b border-[#2A2E33]/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/home" className="text-sm font-medium text-[#2F8F8C] hover:underline">
            ← VERA Home
          </Link>
          <span className="text-sm font-semibold text-[#2A2E33]">{title}</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
