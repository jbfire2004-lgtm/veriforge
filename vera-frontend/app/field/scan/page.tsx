"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supervisorScanModeFromSearchParams } from "@/lib/core/field-scan";
import { FieldOfflineScan } from "@/components/field/FieldOfflineScan";

function ScanContent() {
  const params = useSearchParams();
  const mode = supervisorScanModeFromSearchParams(params);
  return <FieldOfflineScan mode={mode} />;
}

/** Authenticated field scanner — offline-capable; public kiosks use `/qr` instead. */
export default function FieldScanPage() {
  return (
    <div className="mx-auto max-w-lg p-4">
      <Suspense fallback={<p className="text-sm">Loading scanner…</p>}>
        <ScanContent />
      </Suspense>
    </div>
  );
}
