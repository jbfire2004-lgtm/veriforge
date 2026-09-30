import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Section header matching PM / home typography. */
export function WorkspaceSection({
  id,
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <section className={cn("space-y-4", className)} aria-labelledby={id}>
      <header>
        <h2
          id={id}
          className="text-lg font-semibold uppercase tracking-[0.06em] text-[#2A2E33]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[#5a6b7c]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
