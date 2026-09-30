import type { ReactNode } from "react";
import { VeriForgeDocsShell } from "@/components/veriforge";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <VeriForgeDocsShell>{children}</VeriForgeDocsShell>;
}

