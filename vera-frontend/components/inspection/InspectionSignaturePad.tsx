"use client";

import { SignaturePad } from "@/src/components/safety-forms/components/SignaturePad";

type Props = {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  disabled?: boolean;
  required?: boolean;
};

/** PM inspection signature capture — canvas stroke → PNG data URL (uploaded on save). */
export function InspectionSignaturePad({
  label,
  value,
  onChange,
  disabled,
  required,
}: Props) {
  return (
    <SignaturePad
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    />
  );
}
