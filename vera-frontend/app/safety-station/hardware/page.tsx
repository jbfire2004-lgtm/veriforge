"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { openDB } from "idb";
import { API_URL } from "@/lib/api-fetch";
import { parseQrScanText } from "@/lib/wallet-routing";

export default function SafetyStationHardware() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "PROCESSING" | "PASS" | "FAIL">("IDLE");
  const [message, setMessage] = useState("Scan Worker or Equipment QR");

  const [workerId, setWorkerId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);

  const [db, setDb] = useState<any>(null);

  // ---------------------------------------------
  // INIT INDEXEDDB
  // ---------------------------------------------
  useEffect(() => {
    async function initDB() {
      const database = await openDB("vera-safety-cache", 1, {
        upgrade(db) {
          db.createObjectStore("workers", { keyPath: "id" });
          db.createObjectStore("equipment", { keyPath: "id" });
          db.createObjectStore("training", { keyPath: "id" });
          db.createObjectStore("requirements", { keyPath: "id" });
        },
      });

      setDb(database);
    }

    initDB();
  }, []);

  // ---------------------------------------------
  // BACKGROUND SYNC (every 60 seconds)
  // ---------------------------------------------
  useEffect(() => {
    if (!db) return;

    async function sync() {
      try {
        const [workers, equipment, training, requirements] = await Promise.all([
          fetch(`${API_URL}/cache/workers`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${API_URL}/cache/equipment`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${API_URL}/cache/training`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${API_URL}/cache/requirements`, { credentials: "include" }).then((r) => r.json()),
        ]);

        const tx = db.transaction(
          ["workers", "equipment", "training", "requirements"],
          "readwrite"
        );

        workers.forEach((w: any) => tx.objectStore("workers").put(w));
        equipment.forEach((e: any) => tx.objectStore("equipment").put(e));
        training.forEach((t: any) => tx.objectStore("training").put(t));
        requirements.forEach((r: any) => tx.objectStore("requirements").put(r));

        await tx.done;
      } catch (err) {
        console.warn("Offline — using cached data only");
      }
    }

    sync();
    const interval = setInterval(sync, 60000);
    return () => clearInterval(interval);
  }, [db]);

  // ---------------------------------------------
  // INIT SCANNER
  // ---------------------------------------------
  useEffect(() => {
    const qr = new BrowserQRCodeReader();
    readerRef.current = qr;

    return () => (qr as any).reset?.();
  }, []);

  // ---------------------------------------------
  // START SCANNING
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
  // OFFLINE-FIRST COMBINED CHECK
  // ---------------------------------------------
  async function checkCombined(worker: string | null, equip: string | null) {
    if (!worker || !equip || !db) return;

    setStatus("PROCESSING");
    setMessage("Checking safety…");

    try {
      // Try ONLINE first
      const res = await fetch(
        `${API_URL}/verification/combined-status?worker=${worker}&equipment=${equip}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        const r = data?.status ?? data?.ruleResult?.result;
        return showResult(r === "SAFE" ? "SAFE" : "UNSAFE");
      }
    } catch (_) {
      console.warn("Online check failed — using offline cache");
    }

    // OFFLINE FALLBACK
    const workerData = await db.get("workers", Number(worker));
    const equipData = await db.get("equipment", Number(equip));
    const trainingData = (await db.getAll("training")).filter(
      (t: any) => t.workerId === Number(worker)
    );
    const reqData = (await db.getAll("requirements")).filter(
      (r: any) => r.equipmentId === Number(equip)
    );

    const hasAllCerts = reqData.every((req: any) =>
      trainingData.some((t: any) => t.certificationId === req.certificationId)
    );

    const equipOk =
      equipData &&
      (equipData.isSafe === true || equipData.safetyStatus === "OK");

    const safe = workerData && equipData && equipOk && hasAllCerts;

    showResult(safe ? "SAFE" : "UNSAFE");
  }

  // ---------------------------------------------
  // SHOW RESULT
  // ---------------------------------------------
  function showResult(result: "SAFE" | "UNSAFE") {
    if (result === "SAFE") {
      setStatus("PASS");
      setMessage("SAFE TO PROCEED");

      setTimeout(resetStation, 3000);
    } else {
      setStatus("FAIL");
      setMessage("STOP — UNSAFE");

      setTimeout(resetStation, 5000);
    }
  }

  // ---------------------------------------------
  // RESET
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

      <h1 className="text-4xl font-bold mb-6">Safety Station (Offline Mode)</h1>

      <video
        ref={videoRef}
        className="w-full max-w-md rounded border border-gray-700 mb-6"
        autoPlay
        muted
      />

      <div className="text-center text-3xl font-bold mb-4">
        {message}
      </div>

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
    </div>
  );
}
