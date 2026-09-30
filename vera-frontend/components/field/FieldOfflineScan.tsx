"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  preUseSignoffRedirectPath,
  type SupervisorScanMode,
} from "@/lib/core/field-scan";
import { scanQrOffline } from "@/lib/field/workflows/offline-qr";
import { useFieldMode } from "./FieldModeProvider";
import { Button } from "@/components/ui/button";

export function FieldOfflineScan({ mode = "worker" }: { mode?: SupervisorScanMode }) {
  const router = useRouter();
  const { cache, queue, fieldModeActive, isOnline } = useFieldMode();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onDecode = useCallback(
    async (text: string) => {
      if (!cache || !queue) {
        setError("Field cache not ready");
        return;
      }
      setError(null);
      const match = await scanQrOffline(text, mode, cache, queue);
      if (match.status === "cached") {
        setResult(`${match.kind} #${match.entityId}${match.label ? ` — ${match.label}` : ""}`);
        if (match.kind === "worker") {
          router.push(
            preUseSignoffRedirectPath({ workerId: match.entityId, equipmentId: null }),
          );
        } else {
          router.push(
            preUseSignoffRedirectPath({ workerId: null, equipmentId: match.entityId }),
          );
        }
      } else if (match.status === "cached_credential") {
        setResult(match.label);
        setError(match.verificationHint);
      } else if (match.status === "offline_unknown_credential") {
        setResult(null);
        setError(match.message);
      } else if (match.status === "temp") {
        setResult(`Queued temp scan (${match.tempId}) — will sync when online`);
      } else {
        setError(match.reason);
      }
    },
    [cache, queue, mode, router],
  );

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    let active = true;
    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        await reader.decodeFromVideoDevice(undefined, videoRef.current!, (res) => {
          if (active && res) void onDecode(res.getText());
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera unavailable");
      }
    })();
    return () => {
      active = false;
      void (reader as { reset?: () => void }).reset?.();
    };
  }, [onDecode]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {fieldModeActive || !isOnline
          ? "Offline scan — resolves from encrypted local cache"
          : "Online — scan still uses local cache when available"}
      </p>
      <video ref={videoRef} className="w-full max-w-md rounded-lg border" muted playsInline />
      {result && <p className="text-sm font-medium text-teal-800">{result}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button variant="outline" size="sm" onClick={() => router.push("/field")}>
        Back to field dashboard
      </Button>
    </div>
  );
}
