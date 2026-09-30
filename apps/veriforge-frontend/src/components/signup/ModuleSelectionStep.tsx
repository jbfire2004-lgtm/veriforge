import type { ModuleCode } from "../../types/api";
import { MODULE_META } from "../../types/api";

const ORDER: ModuleCode[] = ["vericore", "veripm", "verihub"];

interface ModuleSelectionStepProps {
  selected: ModuleCode[];
  onChange: (next: ModuleCode[]) => void;
}

export function ModuleSelectionStep({ selected, onChange }: ModuleSelectionStepProps) {
  const toggle = (code: ModuleCode) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="space-y-4" data-testid="signup-modules-step">
      <div>
        <h2 className="font-display text-2xl font-bold text-forge-ink">Choose your modules</h2>
        <p className="mt-1 text-forge-steel">
          Enable the products your company needs. You can change this later during trial.
        </p>
      </div>

      <div className="space-y-3">
        {ORDER.map((code) => {
          const meta = MODULE_META[code];
          const checked = selected.includes(code);
          return (
            <label
              key={code}
              className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                checked
                  ? "border-forge-moss bg-forge-mist/70"
                  : "border-forge-sand bg-white hover:border-forge-moss/40"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-forge-moss"
                data-testid={`module-checkbox-${code}`}
                checked={checked}
                onChange={() => toggle(code)}
              />
              <span>
                <span className="block font-display text-lg font-semibold text-forge-ink">
                  {meta.label}
                </span>
                <span className="mt-0.5 block text-sm text-forge-steel">{meta.blurb}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
