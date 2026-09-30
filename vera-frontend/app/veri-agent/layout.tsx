import type { ReactNode } from "react";
import { ContentContainer, VeraAlwaysOnChrome } from "@/src/components/navigation";

export default function VeriAgentLayout({ children }: { children: ReactNode }) {
  return (
    <VeraAlwaysOnChrome homeHref="/veri-agent">
      <ContentContainer className="py-6">{children}</ContentContainer>
    </VeraAlwaysOnChrome>
  );
}
