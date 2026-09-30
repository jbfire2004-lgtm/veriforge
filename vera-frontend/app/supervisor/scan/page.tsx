"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter, useSearchParams } from "next/navigation";
import {
  parseSupervisorQrText,
  supervisorScanModeFromSearchParams,
  type SupervisorScanMode,
} from "@/lib/core/field-scan";

/** Authenticated supervisor scanner — not a public API surface. */
function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode: SupervisorScanMode = supervisorScanModeFromSearchParams(
    searchParams ?? null
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const workerIdRef = useRef<string | null>(null);
  const equipmentIdRef = useRef<string | null>(null);
  const modeRef = useRef(mode);

  const [workerId, setWorkerId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  modeRef.current = mode;
  workerIdRef.current = workerId;
  equipmentIdRef.current = equipmentId;

  useEffect(() => {
    const qr = new BrowserQRCodeReader();
    readerRef.current = qr;
    return () => {
      void (qr as { reset?: () => void }).reset?.();
    };
  }, []);

  const navigateCombined = useCallback(
    (w: string, e: string) => {
      router.push(
        `/supervisor/combined-results?worker=${encodeURIComponent(w)}&equipment=${encodeURIComponent(e)}`
      );
    },
    [router]
  );

  const processDecodedText = useCallback(
    (text: string) => {
      const m = modeRef.current;
      setDecodeError(null);

      const wScan = workerIdRef.current;
      const eScan = equipmentIdRef.current;
      if (m === "combined" && wScan && eScan) {
        setDecodeError(
          "Both worker and equipment are already captured. Open a new scan session to reset."
        );
        return;
      }

      const combinedNumericMode =
        m === "combined"
          ? ({
              combinedNumericAs:
                wScan && !eScan ? "equipment" : "worker",
            } as const)
          : {};

      const parsed = parseSupervisorQrText(text, m, combinedNumericMode);

      if (!parsed.ok) {
        setDecodeError(parsed.reason);
        return;
      }

      if (parsed.kind === "combined_pair") {
        navigateCombined(
          String(parsed.workerId),
          String(parsed.equipmentId)
        );
        return;
      }

      if (parsed.kind === "certificate") {
        router.push(`/verify/certificate/${encodeURIComponent(parsed.token)}`);
        return;
      }

      if (parsed.kind === "worker_token") {
        router.push(`/verify/t/${encodeURIComponent(parsed.token)}`);
        return;
      }
      if (parsed.kind === "equipment_token") {
        router.push(`/verify/t/${encodeURIComponent(parsed.token)}`);
        return;
      }

      const idStr = String(parsed.id);

      if (parsed.kind === "worker") {
        setWorkerId(idStr);
        if (m === "worker") {
          router.push(`/supervisor/worker/${idStr}`);
          return;
        }
        const eq = equipmentIdRef.current;
        if (m === "combined" && eq) {
          navigateCombined(idStr, eq);
          return;
        }
        return;
      }

      if (parsed.kind === "equipment") {
        setEquipmentId(idStr);
        if (m === "equipment") {
          router.push(`/supervisor/equipment/${idStr}`);
          return;
        }
        const w = workerIdRef.current;
        if (m === "combined" && w) {
          navigateCombined(w, idStr);
          return;
        }
      }
    },
    [navigateCombined, router]
  );

  useEffect(() => {
    if (!readerRef.current || !videoRef.current) return;

    const reader = readerRef.current;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (!result) return;
      processDecodedText(result.getText());
    });
  }, [mode, processDecodedText]);

  return (
    <div className="p-6 bg-black text-white min-h-screen pb-24">
      <h1 className="text-3xl font-bold text-center mb-6">
        {mode === "worker" && "Scan Worker QR"}
        {mode === "equipment" && "Scan Equipment QR"}
        {mode === "combined" && "Scan Worker or Equipment"}
      </h1>

      <video
        ref={videoRef}
        className="w-full rounded border border-gray-700"
        autoPlay
        muted
      />

      {decodeError && (
        <p className="mt-4 text-center text-amber-300 text-sm" role="alert">
          {decodeError}
        </p>
      )}

      {mode === "combined" && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400">
            Worker:{" "}
            {workerId ? (
              <span className="text-green-400">{workerId}</span>
            ) : (
              "Waiting..."
            )}
          </p>

          <p className="text-gray-400">
            Equipment:{" "}
            {equipmentId ? (
              <span className="text-green-400">{equipmentId}</span>
            ) : (
              "Waiting..."
            )}
          </p>
          <p className="text-gray-500 text-xs">
            Bare numeric QR: first scan = worker ID, second = equipment ID.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 bg-black text-white min-h-screen pb-24">
          <h1 className="text-3xl font-bold text-center mb-6">Loading scanner…</h1>
        </div>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}
