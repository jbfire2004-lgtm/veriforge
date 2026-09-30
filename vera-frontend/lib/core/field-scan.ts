import type { ReadonlyURLSearchParams } from "next/navigation";
import { parseQrScanText } from "../wallet-routing";

export const SUPERVISOR_SCAN_MODES = ["worker", "equipment", "combined"] as const;

export type SupervisorScanMode = (typeof SUPERVISOR_SCAN_MODES)[number];

/** Strict `mode` query for `/supervisor/scan` (defaults to worker). */
export function supervisorScanModeFromSearchParams(
  params: ReadonlyURLSearchParams | null | undefined
): SupervisorScanMode {
  const raw = params?.get("mode");
  if (
    raw !== undefined &&
    raw !== null &&
    (SUPERVISOR_SCAN_MODES as readonly string[]).includes(raw)
  ) {
    return raw as SupervisorScanMode;
  }
  return "worker";
}

export type ParsedPositiveInt =
  | { ok: true; value: number }
  | { ok: false; reason: string };

/** Single required ID from `?worker=` / `?equipment=` style params. */
export function parseRequiredPositiveIntParam(
  raw: string | null
): ParsedPositiveInt {
  if (raw === null || raw === "") {
    return { ok: false, reason: "Missing id" };
  }
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, reason: "Id must be a positive integer" };
  }
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n < 1) {
    return { ok: false, reason: "Invalid id" };
  }
  if (String(n) !== trimmed) {
    return { ok: false, reason: "Id must be in canonical form (no leading zeros)" };
  }
  return { ok: true, value: n };
}

export type ParsedWorkerEquipmentPair =
  | { ok: true; workerId: number; equipmentId: number }
  | { ok: false; reason: string };

export function parseWorkerEquipmentParams(
  workerRaw: string | null,
  equipmentRaw: string | null
): ParsedWorkerEquipmentPair {
  const w = parseRequiredPositiveIntParam(workerRaw);
  const e = parseRequiredPositiveIntParam(equipmentRaw);
  if (!w.ok) return { ok: false, reason: `worker: ${w.reason}` };
  if (!e.ok) return { ok: false, reason: `equipment: ${e.reason}` };
  return { ok: true, workerId: w.value, equipmentId: e.value };
}

export type QrRouteHint = "worker" | "equipment";

export type ParsedSupervisorQr =
  | { ok: true; kind: "worker"; id: number }
  | { ok: true; kind: "worker_token"; token: string }
  | { ok: true; kind: "equipment"; id: number }
  | { ok: true; kind: "equipment_token"; token: string }
  | {
      ok: true;
      kind: "combined_pair";
      workerId: number;
      equipmentId: number;
    }
  | { ok: true; kind: "certificate"; token: string }
  | { ok: false; reason: string };

function parseCertificateTokenFromText(qr: string): string | null {
  const markers = [
    "/verify/certificate/",
    "/certificates/validate/",
    "/training-providers/certificates/validate/",
  ];
  for (const m of markers) {
    const i = qr.indexOf(m);
    if (i >= 0) {
      const rest = qr.slice(i + m.length).split(/[/?#]/)[0]?.trim();
      if (rest && rest.length >= 8) return rest;
    }
  }
  if (/^cert_[a-f0-9]+$/i.test(qr.trim())) return qr.trim();
  return null;
}

/**
 * Parse scanned/pasted QR for offline routing (before server verify).
 * Matches backend `QrService` conventions where possible.
 */
export function parseSupervisorQrText(
  text: string,
  mode: SupervisorScanMode | QrRouteHint,
  options?: {
    /** In `combined` mode, bare digits are ambiguous — use scan order. */
    combinedNumericAs?: "worker" | "equipment";
  }
): ParsedSupervisorQr {
  const qr = text.trim();
  if (!qr) return { ok: false, reason: "Empty scan" };

  const certToken = parseCertificateTokenFromText(qr);
  if (certToken != null) {
    return { ok: true, kind: "certificate", token: certToken };
  }

  if (/^[we]-[a-f0-9-]{20,}$/i.test(qr)) {
    return qr.startsWith("e-") || qr.startsWith("E-")
      ? { ok: true, kind: "equipment_token", token: qr }
      : { ok: true, kind: "worker_token", token: qr };
  }

  const tokenFromUrl = (() => {
    for (const m of ["/verify/t/", "/verify/token/"]) {
      const i = qr.indexOf(m);
      if (i >= 0) {
        const rest = qr.slice(i + m.length).split(/[/?#]/)[0]?.trim();
        if (rest && /^[we]-/i.test(rest)) return rest;
      }
    }
    return null;
  })();
  if (tokenFromUrl) {
    return tokenFromUrl.startsWith("e-") || tokenFromUrl.startsWith("E-")
      ? { ok: true, kind: "equipment_token", token: tokenFromUrl }
      : { ok: true, kind: "worker_token", token: tokenFromUrl };
  }

  const canonical = parseQrScanText(qr);
  const isBareNumeric = /^\d+$/.test(qr);
  if (canonical?.kind === "combined") {
    return {
      ok: true,
      kind: "combined_pair",
      workerId: canonical.workerId,
      equipmentId: canonical.equipmentId,
    };
  }
  if (canonical?.kind === "certificate") {
    return { ok: true, kind: "certificate", token: canonical.token };
  }
  if (
    canonical?.kind === "worker" &&
    mode !== "equipment" &&
    !(mode === "combined" && isBareNumeric)
  ) {
    return { ok: true, kind: "worker", id: canonical.id };
  }
  if (
    canonical?.kind === "equipment" &&
    mode !== "worker" &&
    !(mode === "combined" && isBareNumeric)
  ) {
    return { ok: true, kind: "equipment", id: canonical.id };
  }

  if (qr.startsWith("{")) {
    let data: unknown;
    try {
      data = JSON.parse(qr);
    } catch {
      return { ok: false, reason: "Malformed JSON QR" };
    }
    if (
      typeof data !== "object" ||
      data === null ||
      !("type" in data) ||
      typeof (data as { type: unknown }).type !== "string"
    ) {
      return { ok: false, reason: "Unknown JSON QR shape" };
    }
    const typeStr = (data as { type: string }).type;
    const tokenRaw = (data as { token?: unknown }).token;
    if (typeof tokenRaw === "string" && /^[we]-[a-f0-9-]{20,}$/i.test(tokenRaw.trim())) {
      const token = tokenRaw.trim();
      if (typeStr === "worker") return { ok: true, kind: "worker_token", token };
      if (typeStr === "equipment") return { ok: true, kind: "equipment_token", token };
    }
    const idRaw = (data as { id?: unknown }).id;
    const id =
      typeof idRaw === "number" && Number.isInteger(idRaw) && idRaw > 0
        ? idRaw
        : typeof idRaw === "string" && /^\d+$/.test(idRaw)
          ? Number(idRaw)
          : NaN;
    if (!(Number.isInteger(id) && id > 0)) {
      return { ok: false, reason: "Invalid token or id in JSON QR" };
    }
    if (typeStr === "worker") {
      return { ok: true, kind: "worker", id };
    }
    if (typeStr === "equipment") {
      return { ok: true, kind: "equipment", id };
    }
    return { ok: false, reason: `Unsupported type: ${typeStr}` };
  }

  const tryWorkerFromUrl = (): number | null => {
    const markers = [
      "/worker/",
      "/public/worker/",
      "/verify/",
      "/wallet/",
      "/scan/worker/",
    ];
    for (const m of markers) {
      const i = qr.indexOf(m);
      if (i >= 0) {
        if (m === "/verify/" && qr.includes("/verify/equipment")) {
          continue;
        }
        const rest = qr.slice(i + m.length).split(/[/?#]/)[0];
        const n = /^(\d+)$/.exec(rest)?.[1];
        if (n) {
          const v = Number(n);
          if (Number.isSafeInteger(v) && v > 0) return v;
        }
      }
    }
    return null;
  };

  const workerFromUrl = tryWorkerFromUrl();
  if (workerFromUrl != null) {
    return { ok: true, kind: "worker", id: workerFromUrl };
  }

  const combined = (() => {
    try {
      const href = qr.includes("://")
        ? qr
        : `https://vera.local${qr.startsWith("/") ? "" : "/"}${qr}`;
      const url = new URL(href);
      const w = url.searchParams.get("worker");
      const e = url.searchParams.get("equipment");
      const wn = w && /^\d+$/.test(w) ? Number(w) : NaN;
      const en = e && /^\d+$/.test(e) ? Number(e) : NaN;
      if (
        Number.isSafeInteger(wn) &&
        wn > 0 &&
        Number.isSafeInteger(en) &&
        en > 0
      ) {
        return { workerId: wn, equipmentId: en };
      }
      return null;
    } catch {
      return null;
    }
  })();

  if (combined !== null) {
    return {
      ok: true,
      kind: "combined_pair",
      workerId: combined.workerId,
      equipmentId: combined.equipmentId,
    };
  }

  if (/^\d+$/.test(qr)) {
    const id = Number(qr);
    if (!Number.isSafeInteger(id) || id < 1) {
      return { ok: false, reason: "Invalid numeric QR" };
    }
    if (mode === "worker") {
      return { ok: true, kind: "worker", id };
    }
    if (mode === "equipment") {
      return { ok: true, kind: "equipment", id };
    }
    const as = options?.combinedNumericAs ?? "worker";
    return {
      ok: true,
      kind: as === "equipment" ? "equipment" : "worker",
      id,
    };
  }

  return { ok: false, reason: "Unrecognized QR format" };
}

export function certificateVerifyPath(token: string): string {
  return `/verify/certificate/${encodeURIComponent(token)}`;
}

export function preUseSignoffRedirectPath(args: {
  workerId: number | null;
  equipmentId: number | null;
}): string {
  const { workerId, equipmentId } = args;
  if (workerId != null && equipmentId != null) {
    return `/supervisor/combined-results?worker=${workerId}&equipment=${equipmentId}`;
  }
  if (workerId != null) return `/supervisor/worker/${workerId}`;
  if (equipmentId != null) return `/supervisor/equipment/${equipmentId}`;
  return "/supervisor";
}
