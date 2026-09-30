"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-fetch";
import { parseQrScanText } from "@/lib/wallet-routing";

export default function SafetyStationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "PROCESSING" | "PASS" | "FAIL">("IDLE");
  const [message, setMessage] = useState("Scan Worker or Equipment QR");

  const [workerId, setWorkerId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);

  // ---------------------------------------------
  // Initialize scanner ONCE
  // ---------------------------------------------
  useEffect(() => {
    const qr = new BrowserQRCodeReader();
    readerRef.current = qr;

    return () => (qr as any).reset?.();
  }, []);

  // ---------------------------------------------
  // Start scanning
  // ---------------------------------------------
  useEffect(() => {
    if (!readerRef.current || !videoRef.current) return;

    const reader = readerRef.current;

    setStatus("SCANNING");
    setMessage("Scan Worker or Equipment QR");

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (!result) return;

      const text = result.getText();

      const parsed = parseQrScanText(text);
      if (parsed?.kind === "worker") {
        handleWorkerScan(String(parsed.id));
        return;
      }
      if (parsed?.kind === "equipment") {
        handleEquipmentScan(String(parsed.id));
        return;
      }
    });
  }, []);

  // ---------------------------------------------
  // HANDLERS
  // ---------------------------------------------
  function handleWorkerScan(id: string) {
    setWorkerId(id);
    setStatus("PROCESSING");
    setMessage("Worker scanned…");

    checkCombined(id, equipmentId);
  }

  function handleEquipmentScan(id: string) {
    setEquipmentId(id);
    setStatus("PROCESSING");
    setMessage("Equipment scanned…");

    checkCombined(workerId, id);
  }

  // ---------------------------------------------
  // Combined logic
  // ---------------------------------------------
  async function checkCombined(worker: string | null, equip: string | null) {
    if (!worker || !equip) return;

    setStatus("PROCESSING");
    setMessage("Checking safety…");

    try {
      const res = await fetch(
        `${API_URL}/verification/combined-status?worker=${worker}&equipment=${equip}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const ok = data?.status === "SAFE" || data?.ruleResult?.result === "SAFE";

      if (ok) {
        setStatus("PASS");
        setMessage("SAFE TO PROCEED");

        setTimeout(() => {
          resetStation();
        }, 3000);
      } else {
        setStatus("FAIL");
        setMessage("STOP — UNSAFE");

        setTimeout(() => {
          resetStation();
        }, 5000);
      }
    } catch (err) {
      console.error("Safety check failed", err);
      setStatus("FAIL");
      setMessage("ERROR — CHECK MANUALLY");

      setTimeout(() => {
        resetStation();
      }, 5000);
    }
  }

  // ---------------------------------------------
  // Reset station
  // ---------------------------------------------
  function resetStation() {
    setWorkerId(null);
    setEquipmentId(null);
    setStatus("SCANNING");
    setMessage("Scan Worker or Equipment QR");
  }

  // ---------------------------------------------
  // UI COLORS
  // ---------------------------------------------
  const bgColor =
    status === "PASS"
      ? "bg-green-700"
      : status === "FAIL"
      ? "bg-red-700"
      : "bg-gray-900";

  return (
    <div className={`min-h-screen text-white flex flex-col items-center justify-center ${bgColor} p-6`}>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">Safety Station</h1>

      {/* Camera */}
      <video
        ref={videoRef}
        className="w-full max-w-md rounded border border-gray-700 mb-6"
        autoPlay
        muted
      />

      {/* Status Message */}
      <div className="text-center text-3xl font-bold mb-4">
        {message}
      </div>

      {/* Worker + Equipment IDs */}
      <div className="text-center space-y-2 text-xl">
        <p>
          Worker:{" "}
          {workerId ? (
            <span className="text-green-300">{workerId}</span>
          ) : (
            <span className="text-gray-400">Waiting…</span>
          )}
        </p>

        <p>
          Equipment:{" "}
          {equipmentId ? (
            <span className="text-green-300">{equipmentId}</span>
          ) : (
            <span className="text-gray-400">Waiting…</span>
          )}
        </p>
      </div>

      {/* Supervisor Override */}
      <button
        onClick={() => router.push("/supervisor")}
        className="mt-10 px-6 py-3 bg-gray-700 rounded text-xl font-semibold hover:bg-gray-600"
      >
        Supervisor Mode
      </button>
    </div>
  );
}
