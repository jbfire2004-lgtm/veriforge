import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Thin top accent rail — safety blue → inspection teal by default */
  accentBar?: string;
  /** Gradient stops for matte surface (used with bg-gradient-to-br) */
  surface?: string;
  /** @deprecated Kept for call-site compatibility; prefer className */
  ring?: string;
  /** Optional ISO-style header icon */
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

/** Shared hub card shell — matte industrial panel with optional ISO header icon. */
export function HubSurfaceCard({
  children,
  className,
  accentBar = "from-[#1E6FB8] to-[#2F8F8C]",
  surface = "from-white via-white to-[#F4F6F8]/90",
  ring,
  icon,
  title,
  description,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[6px] border border-[#2A2E33]/14 bg-gradient-to-br p-5 shadow-none",
        surface,
        ring,
        className,
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", accentBar)}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col pt-1">
        {(icon || title) && (
          <header className="mb-3 flex items-start gap-3 border-b border-[#2A2E33]/10 pb-3">
            {icon ? (
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[#2A2E33]/12 bg-[#E8ECF0] text-[#1E6FB8]"
                aria-hidden
              >
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1 space-y-0.5">
              {title ? (
                <h3 className="text-sm font-semibold tracking-tight text-[#2A2E33]">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p className="text-xs leading-relaxed text-[#5A6169]">{description}</p>
              ) : null}
            </div>
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
