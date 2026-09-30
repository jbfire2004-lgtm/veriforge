"use client";

/**
 * Lightweight signature capture for field incident reports.
 * Replace with canvas-based capture later if required.
 */
export default function SignaturePad({
  onChange,
  label,
}: {
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <textarea
        className="w-full border border-gray-300 rounded p-2 text-black min-h-[80px]"
        rows={3}
        placeholder="Type name and title, or draw in the field and describe here…"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
