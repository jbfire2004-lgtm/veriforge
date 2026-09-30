"use client";

export function IntegrationButtons({
  disabled,
  onAttachToPlan,
  onAttachToRescue,
  onAttachToERP,
}: {
  disabled: boolean;
  onAttachToPlan?: () => void;
  onAttachToRescue?: () => void;
  onAttachToERP?: () => void;
}) {
  const btnClass =
    "rounded-[3px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        className={btnClass}
        onClick={onAttachToPlan}
      >
        Attach to Fall Protection Plan
      </button>
      <button
        type="button"
        disabled={disabled}
        className={btnClass}
        onClick={onAttachToRescue}
      >
        Attach to Rescue Plan
      </button>
      <button
        type="button"
        disabled={disabled}
        className={btnClass}
        onClick={onAttachToERP}
      >
        Attach to ERP
      </button>
    </div>
  );
}
