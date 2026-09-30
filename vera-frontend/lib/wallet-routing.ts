/**
 * Canonical wallet / verify routing for QR scans and deep links.
 *
 * Public (unguessable token): /verify/t/{qrToken}, /verify/{token}
 * Public (legacy numeric): /verify/{id}, /verify/equipment?id=
 * Staff (authenticated): /wallet/{id}, /equipment/{id}/wallet, /supervisor/scan
 */

export type QrRouteAudience = "public" | "staff" | "supervisor";

export type QrScanTarget =
  | { kind: "worker"; id: number }
  | { kind: "worker_token"; token: string }
  | { kind: "equipment"; id: number }
  | { kind: "equipment_token"; token: string }
  | { kind: "certificate"; token: string }
  | { kind: "combined"; workerId: number; equipmentId: number };

export type ScanRouteResult = {
  href: string;
  kind: "worker" | "equipment" | "certificate" | "combined";
};

export function workerVerifyPathByToken(qrToken: string): string {
  return "/verify/t/" + encodeURIComponent(qrToken);
}

/** @deprecated Prefer {@link workerVerifyPathByToken} for new QR prints. */
export function workerVerifyPath(workerId: number): string {
  return "/verify/" + workerId;
}

export function workerStaffWalletPath(workerId: number): string {
  return "/wallet/" + workerId;
}

export function equipmentVerifyPathByToken(qrToken: string): string {
  return "/verify/t/" + encodeURIComponent(qrToken);
}

/** @deprecated Prefer token URLs for new equipment QR. */
export function equipmentVerifyPath(equipmentId: number): string {
  return "/verify/equipment?id=" + encodeURIComponent(String(equipmentId));
}

export function equipmentStaffWalletPath(equipmentId: number): string {
  return "/equipment/" + equipmentId + "/wallet";
}

export function workerDestination(
  workerId: number,
  audience: QrRouteAudience,
): string {
  switch (audience) {
    case "staff":
      return workerStaffWalletPath(workerId);
    case "supervisor":
      return "/supervisor/worker/" + workerId;
    case "public":
    default:
      return workerVerifyPath(workerId);
  }
}

export function equipmentDestination(
  equipmentId: number,
  audience: QrRouteAudience,
): string {
  switch (audience) {
    case "staff":
      return equipmentStaffWalletPath(equipmentId);
    case "supervisor":
      return "/supervisor/equipment/" + equipmentId;
    case "public":
    default:
      return equipmentVerifyPath(equipmentId);
  }
}

export function workerTokenDestination(
  token: string,
  audience: QrRouteAudience,
): string {
  if (audience === "staff" || audience === "supervisor") {
    return workerVerifyPathByToken(token);
  }
  return workerVerifyPathByToken(token);
}

export function equipmentTokenDestination(
  token: string,
  audience: QrRouteAudience,
): string {
  if (audience === "staff") {
    return equipmentVerifyPathByToken(token);
  }
  if (audience === "supervisor") {
    return equipmentVerifyPathByToken(token);
  }
  return equipmentVerifyPathByToken(token);
}

/** Resolve a scanned QR payload to the correct path for the given audience. */
export function routeScanTarget(
  text: string,
  audience: QrRouteAudience = "public",
): ScanRouteResult | null {
  const parsed = parseQrScanText(text);
  if (!parsed) return null;

  if (parsed.kind === "worker") {
    return {
      kind: "worker",
      href: workerDestination(parsed.id, audience),
    };
  }
  if (parsed.kind === "worker_token") {
    return {
      kind: "worker",
      href: workerTokenDestination(parsed.token, audience),
    };
  }
  if (parsed.kind === "equipment") {
    return {
      kind: "equipment",
      href: equipmentDestination(parsed.id, audience),
    };
  }
  if (parsed.kind === "equipment_token") {
    return {
      kind: "equipment",
      href: equipmentTokenDestination(parsed.token, audience),
    };
  }
  if (parsed.kind === "certificate") {
    return {
      kind: "certificate",
      href: `/verify/certificate/${encodeURIComponent(parsed.token)}`,
    };
  }
  if (parsed.kind === "combined") {
    return {
      kind: "combined",
      href: `/supervisor/combined-results?worker=${parsed.workerId}&equipment=${parsed.equipmentId}`,
    };
  }
  return null;
}

function parsePositiveInt(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function parseCertificateToken(text: string): string | null {
  const markers = [
    "/verify/certificate/",
    "/certificates/validate/",
    "/training-providers/certificates/validate/",
  ];
  for (const marker of markers) {
    const i = text.indexOf(marker);
    if (i >= 0) {
      const rest = text.slice(i + marker.length).split(/[/?#]/)[0]?.trim();
      if (rest && rest.length >= 8) return rest;
    }
  }
  if (/^cert_[a-f0-9]+$/i.test(text.trim())) return text.trim();
  return null;
}

function parseWorkerIdFromPath(text: string): number | null {
  const patterns = [
    /\/verify\/(\d+)(?:\/|$|\?|#)/,
    /\/wallet\/(\d+)(?:\/|$|\?|#)/,
    /\/scan\/worker\/(\d+)(?:\/|$|\?|#)/,
    /\/verify\/worker\/(\d+)(?:\/|$|\?|#)/,
    /\/workers\/(\d+)(?:\/|$|\?|#)/,
    /\/supervisor\/worker\/(\d+)(?:\/|$|\?|#)/,
  ];
  for (const re of patterns) {
    const match = re.exec(text);
    const id = match ? parsePositiveInt(match[1]) : null;
    if (id != null) return id;
  }
  return null;
}

function parseEquipmentIdFromPath(text: string): number | null {
  const patterns = [
    /\/scan\/equipment\/(\d+)(?:\/|$|\?|#)/,
    /\/supervisor\/equipment\/(\d+)(?:\/|$|\?|#)/,
    /\/equipment\/(\d+)\/wallet(?:\/|$|\?|#)/,
  ];
  for (const re of patterns) {
    const match = re.exec(text);
    const id = match ? parsePositiveInt(match[1]) : null;
    if (id != null) return id;
  }
  return null;
}

function toAbsoluteHref(raw: string): string {
  if (raw.includes("://")) return raw;
  return "https://vera.local" + (raw.startsWith("/") ? "" : "/") + raw;
}

/** Parse any supported QR / deep-link payload into a scan target. */
export function parseQrScanText(text: string): QrScanTarget | null {
  const raw = text.trim();
  if (!raw) return null;

  const cert = parseCertificateToken(raw);
  if (cert) return { kind: "certificate", token: cert };

  if (raw.startsWith("{")) {
    try {
      const data = JSON.parse(raw) as {
        type?: unknown;
        id?: unknown;
        workerId?: unknown;
      };
      if (data?.type === "worker") {
        const candidate = data.id ?? data.workerId;
        const id =
          typeof candidate === "number"
            ? candidate
            : typeof candidate === "string"
              ? parsePositiveInt(candidate)
              : null;
        if (id != null) return { kind: "worker", id };
      }
      if (data?.type === "equipment") {
        const id =
          typeof data.id === "number"
            ? data.id
            : typeof data.id === "string"
              ? parsePositiveInt(data.id)
              : null;
        if (id != null) return { kind: "equipment", id };
      }
    } catch {
      /* fall through */
    }
  }

  const verifyTokenMatch = /\/verify\/t\/([^/?#]+)/i.exec(raw);
  if (verifyTokenMatch) {
    const token = decodeURIComponent(verifyTokenMatch[1]);
    if (token.startsWith("e-") || token.startsWith("E-")) {
      return { kind: "equipment_token", token };
    }
    return { kind: "worker_token", token };
  }

  try {
    const url = new URL(toAbsoluteHref(raw));

    if (url.pathname.includes("/verify/t/")) {
      const token = decodeURIComponent(url.pathname.split("/verify/t/")[1]?.split(/[/?#]/)[0] ?? "");
      if (token) {
        if (token.startsWith("e-") || token.startsWith("E-")) {
          return { kind: "equipment_token", token };
        }
        return { kind: "worker_token", token };
      }
    }

    if (url.pathname.includes("/verify/equipment")) {
      const id = parsePositiveInt(url.searchParams.get("id"));
      if (id != null) return { kind: "equipment", id };
    }

    const workerParam = parsePositiveInt(
      url.searchParams.get("worker") ?? url.searchParams.get("workerId"),
    );
    const equipmentParam = parsePositiveInt(url.searchParams.get("equipment"));
    if (workerParam != null && equipmentParam != null) {
      return {
        kind: "combined",
        workerId: workerParam,
        equipmentId: equipmentParam,
      };
    }

    const typeParam = url.searchParams.get("type")?.toLowerCase();
    const idParam = parsePositiveInt(url.searchParams.get("id"));
    if (idParam != null) {
      if (typeParam === "equipment") return { kind: "equipment", id: idParam };
      if (typeParam === "worker" || !typeParam) return { kind: "worker", id: idParam };
    }
  } catch {
    /* not a URL */
  }

  const equipmentFromPath = parseEquipmentIdFromPath(raw);
  if (equipmentFromPath != null) return { kind: "equipment", id: equipmentFromPath };

  const workerFromPath = parseWorkerIdFromPath(raw);
  if (workerFromPath != null) return { kind: "worker", id: workerFromPath };

  const bareId = parsePositiveInt(raw);
  if (bareId != null) return { kind: "worker", id: bareId };

  return null;
}

export function extractWorkerIdFromScan(raw: string): number | null {
  const parsed = parseQrScanText(raw);
  return parsed?.kind === "worker" ? parsed.id : null;
}

export function extractEquipmentIdFromScan(raw: string): number | null {
  const parsed = parseQrScanText(raw);
  return parsed?.kind === "equipment" ? parsed.id : null;
}
