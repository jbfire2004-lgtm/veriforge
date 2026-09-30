import type { ReactNode } from "react";
import { VeriForgeTenantShell } from "@/components/veriforge";

export default function VeriForgeTenantGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VeriForgeTenantShell>{children}</VeriForgeTenantShell>;
}
