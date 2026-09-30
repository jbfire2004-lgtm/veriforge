"use client";

import { cn } from "@/src/lib/utils";

const LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  tl: "Tagalog",
  pa: "ਪੰਜਾਬੀ",
};

type Props = {
  languages: string[];
  value: string;
  onChange: (code: string) => void;
  className?: string;
};

export function OrientationLanguageSwitcher({
  languages,
  value,
  onChange,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Language">
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
            value === code
              ? "bg-gradient-to-br from-[#2A2E33] to-[#2F8F8C]/90 text-white shadow-sm"
              : "border border-[#2A2E33]/15 bg-white text-[#5a6b7c] hover:bg-[#E4F3F2]",
          )}
        >
          {LABELS[code] ?? code}
        </button>
      ))}
    </div>
  );
}
