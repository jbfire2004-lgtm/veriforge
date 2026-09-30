type Props = {
  label: string;
  value: string;
  formula: string;
  note?: string;
};

export function CalculatorResult({ label, value, formula, note }: Props) {
  return (
    <div className="rounded-xl border border-[#2F8F8C]/25 bg-gradient-to-br from-[#E4F3F2] to-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[#2A2E33]">
        {value}
      </p>
      {note ? <p className="mt-2 text-sm text-[#5a6b7c]">{note}</p> : null}
      <p className="mt-4 border-t border-[#2A2E33]/10 pt-3 text-xs leading-relaxed text-[#64748b]">
        <span className="font-semibold text-[#475569]">Formula: </span>
        {formula}
      </p>
    </div>
  );
}
