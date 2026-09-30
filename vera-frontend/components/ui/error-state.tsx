import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  /** Alias for `description` (e.g. raw API / network messages). */
  message?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  message,
  className,
  children,
  ...props
}: ErrorStateProps) {
  const body = description ?? message;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/80 px-vera-8 py-vera-8 text-center shadow-md",
        className
      )}
      {...props}
    >
      <div className="mb-vera-5 flex h-14 w-14 items-center justify-center rounded-full bg-vera-white shadow-md ring-1 ring-red-100">
        <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden />
      </div>
      <h2 className="text-lg font-medium leading-tight tracking-tight text-red-900">
        {title}
      </h2>
      {body != null && body !== "" && (
        <p className="mt-vera-3 max-w-md text-sm leading-relaxed text-red-800/90">
          {body}
        </p>
      )}
      {children != null && (
        <div className="mt-vera-6 flex flex-wrap justify-center gap-vera-3">{children}</div>
      )}
    </div>
  );
}
