"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { apiFetch } from "@/lib/api-fetch";
import { unknownToErrorMessage } from "@/lib/core";
import { parseSupervisorQrText } from "@/lib/core/field-scan";

type Worker = {
  id: number;
  firstName: string;
  lastName: string;
  company?: { name: string } | null;
  trainingRecords?: unknown[];
};

type Equipment = {
  id: number;
  name: string;
  serialNumber?: string | null;
  safetyStatus?: string;
  isSafe?: boolean;
};

type Step = "scan-worker" | "scan-equipment" | "result";

function equipmentIsOperationallySafe(e: Equipment): boolean {
  if (e.safetyStatus === "OK") return true;
  if (typeof e.isSafe === "boolean") return e.isSafe;
  return false;
}

export default function CombinedScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<Step>("scan-worker");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [scanning, setScanning] = useState(true);
  const [manual, setManual] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const codeReader = new BrowserQRCodeReader();

    async function startScanner() {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const deviceId = devices[0]?.deviceId;

        await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          async (result) => {
            if (!active || !result) return;
            if (navigator.vibrate) navigator.vibrate(100);
            setScanning(false);
            setFieldError(null);
            await handleScan(result.getText());
          }
        );
      } catch (e) {
        console.error("Camera error:", e);
        setFieldError("Camera unavailable — use manual entry below.");
      }
    }

    void startScanner();

    return () => {
      active = false;
      const v = videoRef.current;
      const stream = v?.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop());
        if (v) v.srcObject = null;
      }
    };
  }, [step]);

  async function handleScan(text: string) {
    if (step === "scan-worker") {
      const parsed = parseSupervisorQrText(text, "worker");
      if (!parsed.ok || parsed.kind !== "worker") {
        setFieldError(
          parsed.ok
            ? "Expected a worker QR or worker ID."
            : parsed.reason
        );
        setScanning(true);
        return;
      }
      const workerId = parsed.id;

      try {
        const res = await apiFetch(`/workers/${workerId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setFieldError("Worker not found.");
          setScanning(true);
          return;
        }
        const data = (await res.json()) as Worker;
        setWorker(data);
        setStep("scan-equipment");
        setScanning(true);
        setManual("");
      } catch (e) {
        setFieldError(unknownToErrorMessage(e, "Worker lookup failed."));
        setScanning(true);
      }
      return;
    }

    if (step === "scan-equipment") {
      const parsed = parseSupervisorQrText(text, "equipment");
      if (!parsed.ok || parsed.kind !== "equipment") {
        setFieldError(
          parsed.ok
            ? "Expected an equipment QR or equipment ID."
            : parsed.reason
        );
        setScanning(true);
        return;
      }
      const equipmentId = parsed.id;

      try {
        const res = await apiFetch(`/equipment/${equipmentId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setFieldError("Equipment not found.");
          setScanning(true);
          return;
        }
        const data = (await res.json()) as Equipment;
        setEquipment(data);
        setStep("result");
        setScanning(false);
      } catch (e) {
        setFieldError(unknownToErrorMessage(e, "Equipment lookup failed."));
        setScanning(true);
      }
    }
  }

  async function handleManual() {
    if (!manual.trim()) return;
    setFieldError(null);
    await handleScan(manual.trim());
  }

  function resetFlow() {
    setStep("scan-worker");
    setWorker(null);
    setEquipment(null);
    setScanning(true);
    setManual("");
    setFieldError(null);
    window.location.reload();
  }

  const pass =
    worker &&
    equipment &&
    equipmentIsOperationallySafe(equipment) &&
    Array.isArray(worker.trainingRecords) &&
    worker.trainingRecords.length > 0;

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-start p-4">

      <h1 className="text-3xl font-bold mt-4 mb-4 text-center">
        Combined Worker + Equipment Check
      </h1>

      <div className="mb-4 text-center text-sm text-gray-300">
        {step === "scan-worker" && "Step 1 of 3 — Scan Worker"}
        {step === "scan-equipment" && "Step 2 of 3 — Scan Equipment"}
        {step === "result" && "Step 3 of 3 — Result"}
      </div>

      {fieldError && (
        <p className="mb-3 text-center text-amber-300 text-sm px-4" role="alert">
          {fieldError}
        </p>
      )}

      {step !== "result" && (
        <>
          <div className="w-full max-w-md aspect-[3/4] bg-gray-900 rounded overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
            />
          </div>

          <div className="mt-3 text-center text-gray-300 text-sm">
            {scanning ? "Scanning…" : "Processing…"}
          </div>
        </>
      )}

      {step !== "result" && (
        <div className="w-full max-w-md mt-6 space-y-3">
          <input
            className="w-full p-3 text-black rounded text-lg"
            placeholder={
              step === "scan-worker"
                ? "Enter Worker ID"
                : "Enter Equipment ID"
            }
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />

          <button
            type="button"
            onClick={() => void handleManual()}
            className="w-full p-3 bg-blue-600 text-white text-lg rounded"
          >
            Verify Manually
          </button>
        </div>
      )}

      {step === "result" && worker && equipment && (
        <div className="mt-6 w-full max-w-md border rounded-xl bg-gray-900 p-4 space-y-4">
          <div
            className={`text-center text-3xl font-bold py-3 rounded ${
              pass ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {pass ? "PASS" : "FAIL"}
          </div>

          <div className="border rounded p-3">
            <h2 className="text-lg font-semibold mb-1">Worker</h2>
            <p className="text-sm">
              {worker.firstName} {worker.lastName}
            </p>
            {worker.company && (
              <p className="text-xs text-gray-400">
                {worker.company.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Certifications / training records:{" "}
              {worker.trainingRecords?.length ?? 0}
            </p>
          </div>

          <div className="border rounded p-3">
            <h2 className="text-lg font-semibold mb-1">Equipment</h2>
            <p className="text-sm">{equipment.name}</p>
            {equipment.serialNumber && (
              <p className="text-xs text-gray-400">
                Serial: {equipment.serialNumber}
              </p>
            )}
            <p className="text-xs mt-1">
              Status:{" "}
              <span
                className={
                  equipmentIsOperationallySafe(equipment)
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {equipment.safetyStatus ?? (equipment.isSafe ? "SAFE" : "CHECK")}
              </span>
            </p>
          </div>

          <div className="border rounded p-3 text-xs text-gray-300 space-y-1">
            <p className="font-semibold">Rules Applied:</p>
            <p>- Equipment operational status OK.</p>
            <p>- Worker must have at least one training record on file.</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={resetFlow}
        className="mt-6 px-6 py-3 bg-gray-700 text-white rounded text-lg"
      >
        New Check
      </button>

      <div className="absolute bottom-6 text-gray-500 text-sm">
        VERA • Field Verification System
      </div>
    </div>
  );
}
