"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function AcpToggle({ checked, onChange, label, disabled }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      {label ? <span className="text-slate-600 dark:text-slate-400">{label}</span> : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-600"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}
