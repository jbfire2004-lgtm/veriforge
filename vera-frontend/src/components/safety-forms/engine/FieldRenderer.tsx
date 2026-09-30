"use client";

import type { SafetyFormDefinition } from "@vera/api-contract";
import { SfFloatingInput } from "../ui/SfFloatingInput";
import { SfFloatingTextarea } from "../ui/SfFloatingTextarea";
import { sfCn } from "../theme/cn";
import {
  AtmosphericTesting,
  CorrectiveActionBuilder,
  EnergyWheel,
  EquipmentSelector,
  HazardSelector,
  PhotoUploader,
  ProjectSelector,
  RiskMatrix,
  SignaturePad,
  WorkerSelector,
} from "../components";

type Field = SafetyFormDefinition["fields"][number];

type Props = {
  field: Field;
  value: unknown;
  data: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  disabled?: boolean;
};

function optionList(field: Field): string[] {
  if (!field.options) return [];
  return field.options.map((o) => (typeof o === "string" ? o : o.value));
}

export function FieldRenderer({ field, value, data, onChange, disabled }: Props) {
  const set = (v: unknown) => onChange(field.id, v);
  const req = field.required;

  switch (field.type) {
    case "hazard":
      return (
        <HazardSelector
          label={field.label}
          required={req}
          disabled={disabled}
          value={(value as string[]) ?? []}
          onChange={set}
        />
      );
    case "energy":
      return (
        <EnergyWheel
          label={field.label}
          disabled={disabled}
          value={(value as string[]) ?? []}
          onChange={set}
        />
      );
    case "risk":
      return (
        <RiskMatrix
          label={field.label}
          required={req}
          disabled={disabled}
          value={value as string | undefined}
          onChange={set}
        />
      );
    case "signature":
      return (
        <SignaturePad
          label={field.label}
          required={req}
          disabled={disabled}
          value={value as string | undefined}
          onChange={set}
        />
      );
    case "photo":
      return (
        <PhotoUploader
          label={field.label}
          disabled={disabled}
          value={(value as { name: string; dataUrl: string }[]) ?? []}
          onChange={set}
        />
      );
    case "worker":
      return (
        <WorkerSelector
          label={field.label}
          required={req}
          disabled={disabled}
          value={value as number | undefined}
          displayName={
            field.id === "workerId"
              ? (data.workerName as string | undefined)
              : undefined
          }
          onChange={set}
        />
      );
    case "equipment":
      return (
        <EquipmentSelector
          label={field.label}
          required={req}
          disabled={disabled}
          value={value as number | undefined}
          displayName={data.equipmentName as string | undefined}
          onChange={set}
        />
      );
    case "project":
    case "location":
      return (
        <ProjectSelector
          label={field.label}
          required={req}
          disabled={disabled}
          value={value as number | string | undefined}
          displayName={data.projectName as string | undefined}
          onChange={(id) => set(id ?? value)}
        />
      );
    case "textarea":
      return (
        <SfFloatingTextarea
          label={field.label}
          required={req}
          disabled={disabled}
          value={String(value ?? "")}
          rows={4}
          onChange={(e) => set(e.target.value)}
        />
      );
    case "boolean":
      return (
        <label
          className={sfCn(
            "flex cursor-pointer items-center gap-3 rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] px-4 py-3 transition-colors hover:bg-[var(--sf-surface-hover)]",
            Boolean(value) && "border-[var(--sf-primary)] bg-[var(--sf-primary-muted)]",
          )}
        >
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(value)}
            className="h-4 w-4 accent-[var(--sf-primary)]"
            onChange={(e) => set(e.target.checked)}
          />
          <span className="text-sm font-medium text-[var(--sf-text)]">
            {field.label}
            {req ? <span className="text-[var(--sf-danger)]"> *</span> : null}
          </span>
        </label>
      );
    case "checklist": {
      const items = optionList(field);
      const selected = (value as string[]) ?? [];
      return (
        <fieldset className="space-y-2" disabled={disabled}>
          <legend className="text-sm font-medium">
            {field.label}
            {req ? <span className="text-red-600"> *</span> : null}
          </legend>
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() =>
                  set(
                    selected.includes(item)
                      ? selected.filter((x) => x !== item)
                      : [...selected, item],
                  )
                }
              />
              {item}
            </label>
          ))}
        </fieldset>
      );
    }
    case "select":
    case "multiselect": {
      const opts = optionList(field);
      if (field.type === "multiselect") {
        const selected = (value as string[]) ?? [];
        return (
          <fieldset className="space-y-2" disabled={disabled}>
            <legend className="text-sm font-medium">{field.label}</legend>
            {opts.map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() =>
                    set(
                      selected.includes(o)
                        ? selected.filter((x) => x !== o)
                        : [...selected, o],
                    )
                  }
                />
                {o}
              </label>
            ))}
          </fieldset>
        );
      }
      return (
        <fieldset className="space-y-2" disabled={disabled}>
          <legend className="text-sm font-medium text-[var(--sf-text)]">
            {field.label}
            {req ? <span className="text-[var(--sf-danger)]"> *</span> : null}
          </legend>
          <select
            className="h-11 w-full rounded-[var(--sf-radius-md)] border border-[var(--sf-border-strong)] bg-[var(--sf-surface)] px-3 text-sm transition-all focus:border-[var(--sf-primary)] focus:shadow-[var(--sf-shadow-glow)] focus:outline-none"
            disabled={disabled}
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
          >
            <option value="">Select…</option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </fieldset>
      );
    }
    case "date":
      return (
        <SfFloatingInput
          label={field.label}
          type="date"
          required={req}
          disabled={disabled}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
        />
      );
    case "number":
      return (
        <SfFloatingInput
          label={field.label}
          type="number"
          required={req}
          disabled={disabled}
          value={value != null ? String(value) : ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            set(Number.isFinite(n) ? n : undefined);
          }}
        />
      );
  case "table":
      return (
        <CorrectiveActionBuilder
          label={field.label}
          disabled={disabled}
          value={(value as never) ?? []}
          onChange={set}
        />
      );
    default:
      return (
        <SfFloatingInput
          label={field.label}
          required={req}
          disabled={disabled}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
        />
      );
  }
}
