import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WorkspaceHero } from "@/components/theme/workspace";
import { cn } from "@/src/lib/utils";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  /** Wider content column for multi-pane tools */
  wide?: boolean;
};

export function CalculatorShell({ title, description, children, wide }: Props) {
  return (
    <div
      className={cn(
        "mx-auto space-y-8 px-4 py-8 sm:px-6",
        wide ? "max-w-6xl" : "max-w-2xl",
      )}
    >
      <Link
        href="/calculators"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#2F8F8C] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All calculators
      </Link>

      <WorkspaceHero
        eyebrow="Safety calculators"
        title={title}
        description={description}
        badges={[{ label: "Field estimate", tone: "teal" }]}
      />

      {children}
    </div>
  );
}
