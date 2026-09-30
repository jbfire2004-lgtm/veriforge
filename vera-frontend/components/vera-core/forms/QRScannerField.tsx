"use client";

import * as React from "react";
import { QrScanner } from "@/components/verify/QrScanner";
import { Button } from "@/components/ui/button";
import { TextInput } from "./TextInput";

export type QRScannerFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
};

/**
 * QR scan with manual entry fallback (§6).
 */
export function QRScannerField({
  label = "Scan QR code",
  value = "",
  onChange,
  error,
}: QRScannerFieldProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <section className="space-y-3">
      <section className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)}>
          Open scanner
        </Button>
      </section>
      <TextInput
        label={label}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Or paste code manually"
        error={error}
      />
      <QrScanner
        open={open}
        onClose={() => setOpen(false)}
        onDecode={(text) => {
          onChange?.(text);
          setOpen(false);
        }}
      />
    </section>
  );
}
