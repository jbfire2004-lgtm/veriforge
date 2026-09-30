"use client";

import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type PmLoadingStateProps = {
  message?: string;
  className?: string;
};

export function PmLoadingState({
  message = "Loading…",
  className,
}: PmLoadingStateProps) {
  return (
    <p className={`text-sm text-[var(--sf-text-muted)] ${className ?? ""}`.trim()} role="status">
      {message}
    </p>
  );
}

type PmEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PmEmptyState({ title, description, action, className }: PmEmptyStateProps) {
  return (
    <SfCard className={`space-y-3 p-6 text-center ${className ?? ""}`.trim()}>
      <h2 className="text-base font-semibold text-[var(--sf-text)]">{title}</h2>
      {description ? (
        <p className="text-sm text-[var(--sf-text-muted)]">{description}</p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </SfCard>
  );
}

type PmErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function PmErrorState({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: PmErrorStateProps) {
  return (
    <div role="alert">
      <SfCard className={`space-y-3 border border-red-200 bg-red-50 p-5 ${className ?? ""}`.trim()}>
        <p className="text-sm font-medium text-red-700">{message}</p>
        {onRetry ? (
          <SfButton type="button" size="sm" onClick={onRetry}>
            {retryLabel}
          </SfButton>
        ) : null}
      </SfCard>
    </div>
  );
}
