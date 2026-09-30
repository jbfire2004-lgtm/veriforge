"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  onDecode: (text: string) => void;
};

/**
 * Lightweight camera-based QR reader. The parent owns `open` so it can close
 * the scanner once a valid value is captured.
 */
export function QrScanner({ open, onClose, onDecode }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const onDecodeRef = useRef(onDecode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    if (!open) return;

    const video = videoRef.current;
    if (!video) return;

    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;
    setError(null);

    let cancelled = false;
    void reader
      .decodeFromVideoDevice(undefined, video, (result, decodeErr) => {
        if (cancelled) return;
        if (result) {
          onDecodeRef.current(result.getText());
        }
        if (decodeErr && decodeErr.name !== "NotFoundException") {
          setError(decodeErr.message || "Could not decode QR.");
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : "Could not start the camera. Check browser permissions."
        );
      });

    return () => {
      cancelled = true;
      const r = readerRef.current as
        | (BrowserQRCodeReader & { reset?: () => void })
        | null;
      r?.reset?.();
      readerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="space-y-vera-3 rounded-2xl border border-vera-charcoal/10 bg-vera-charcoal p-vera-4 text-vera-surface shadow-md">
      <div className="flex items-center justify-between gap-vera-3">
        <div className="flex items-center gap-vera-2 text-sm font-semibold">
          <Camera className="h-4 w-4" aria-hidden />
          Aim the camera at the QR code
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-vera-surface hover:text-vera-white"
          onClick={onClose}
          aria-label="Close scanner"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <video
        ref={videoRef}
        className="aspect-square w-full rounded-xl bg-black object-cover"
        autoPlay
        muted
        playsInline
      />

      {error != null ? (
        <p className="text-sm text-amber-300" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-vera-surface/80">
          QR formats: a numeric ID, a credential URL, or a JSON QR.
        </p>
      )}
    </div>
  );
}
