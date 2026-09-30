import type { ReactNode } from "react";
import { VeriForgeDocsShell } from "@/src/docs/VeriForgeDocsShell";

export default function VeriForgeDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VeriForgeDocsShell>{children}</VeriForgeDocsShell>;
}
