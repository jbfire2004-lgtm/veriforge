import { SfShell } from "@/src/components/safety-forms/ui/SfShell";

export default function SafetyIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SfShell>{children}</SfShell>;
}
