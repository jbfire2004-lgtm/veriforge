"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { SfButton } from "../ui/SfButton";
import { SfFloatingInput } from "../ui/SfFloatingInput";
import { SfFloatingTextarea } from "../ui/SfFloatingTextarea";
import { sfCn } from "../theme/cn";

export type CorrectiveActionItem = {
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
};

type Props = {
  label: string;
  value?: CorrectiveActionItem[];
  onChange: (items: CorrectiveActionItem[]) => void;
  disabled?: boolean;
};

export function CorrectiveActionBuilder({ label, value = [], onChange, disabled }: Props) {
  function add() {
    onChange([...value, { title: "", description: "", dueDate: "" }]);
  }

  function update(i: number, patch: Partial<CorrectiveActionItem>) {
    onChange(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <header className="flex items-center justify-between">
        <legend className="text-sm font-medium text-[var(--sf-text)]">{label}</legend>
        <SfButton type="button" variant="secondary" size="sm" onClick={add} disabled={disabled}>
          <Plus className="h-4 w-4" />
          Add step
        </SfButton>
      </header>
      <ol className="space-y-3">
        {value.map((item, i) => (
          <li
            key={i}
            className={sfCn(
              "sf-animate-in relative rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-4 shadow-[var(--sf-shadow-sm)] transition-shadow hover:shadow-[var(--sf-shadow-md)]",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sf-primary)] text-xs font-bold text-white">
              {i + 1}
            </span>
            <div className="mb-3 flex items-center justify-end gap-1">
              <button
                type="button"
                className="rounded p-1 text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface-hover)]"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <SfButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(i)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </SfButton>
            </div>
            <div className="space-y-3">
              <SfFloatingInput
                label="Action title"
                value={item.title}
                disabled={disabled}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <SfFloatingTextarea
                label="Description"
                value={item.description ?? ""}
                disabled={disabled}
                rows={2}
                onChange={(e) => update(i, { description: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SfFloatingInput
                  label="Due date"
                  type="date"
                  value={item.dueDate ?? ""}
                  disabled={disabled}
                  onChange={(e) => update(i, { dueDate: e.target.value })}
                />
                <SfFloatingInput
                  label="Assigned to"
                  value={item.assignedTo ?? ""}
                  disabled={disabled}
                  onChange={(e) => update(i, { assignedTo: e.target.value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </fieldset>
  );
}
