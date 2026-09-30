import { SfShell } from "@/src/components/safety-forms/ui/SfShell";

export default function SafetyFormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SfShell>{children}</SfShell>;
}
