import type { ReactNode } from "react";
import { VeriForgeMobileShell } from "@/components/veriforge";

export default function VeriForgeMobileGroupLayout({ children }: { children: ReactNode }) {
  return <VeriForgeMobileShell>{children}</VeriForgeMobileShell>;
}
