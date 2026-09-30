import { apiFetchJson } from "@/lib/api-fetch";
import { messageFromUnknown, statusFromError } from "@/lib/loader-helpers";
import type { LoaderResult } from "@/lib/use-async-resource";
import {
  loadVerificationHistory,
  loadWorkerVerification,
  type CertificationRef,
  type CompanyRef,
  type TrainingRecord,
  type VerificationLogEntry,
  type WorkerProfile,
} from "@/components/wallet/wallet-api";

/** Status reported by `/verify/credential/:id`. Backend currently returns
 * `VALID` or `EXPIRED`; `REVOKED` is forward-compatible. */
export type CredentialApiStatus = "VALID" | "EXPIRED" | "REVOKED";

/** UI status — adds `NOT_FOUND` for 404 responses. */
export type CredentialDisplayStatus = CredentialApiStatus | "NOT_FOUND";

/** Shape returned by `GET /verify/credential/:id`. */
export type CredentialVerificationPayload = {
  type: "credential";
  id: number;
  workerId: number;
  companyId: number | null;
  status: CredentialApiStatus;
  name: string | null;
  value?: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  company: CompanyRef | null;
  certification: CertificationRef | null;
  worker?: WorkerProfile | null;
  relatedTrainingRecords: { id: number }[];
};

/** Hydrated bundle for the credential verification view. */
export type CredentialBundle = {
  credential: CredentialVerificationPayload;
  /** Linked training records pulled from the worker's full verification. */
  relatedTraining: TrainingRecord[];
  /** Verification history (digital sign-offs); `null` if caller lacks rights. */
  history: VerificationLogEntry[] | null;
  historyError: string | null;
};

/** Load a credential's public verification card. Public (no auth required). */
async function loadCredential(
  credentialId: number
): Promise<CredentialVerificationPayload> {
  return apiFetchJson<CredentialVerificationPayload>(
    `/verify/credential/${credentialId}`,
    { requireAuth: false }
  );
}

/**
 * Extract a positive integer credential id from a scanned QR / pasted text.
 * Accepts:
 *   - bare digits: "42"
 *   - URL with `/verify/credential/42` or `/verify/credential?id=42`
 *   - JSON `{"type":"credential","id":42}`
 */
export function extractCredentialIdFromScan(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;

  if (/^\d+$/.test(text)) {
    const n = Number(text);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text) as { type?: unknown; id?: unknown };
      if (data && typeof data === "object" && data.type === "credential") {
        const id =
          typeof data.id === "number"
            ? data.id
            : typeof data.id === "string" && /^\d+$/.test(data.id)
              ? Number(data.id)
              : NaN;
        return Number.isSafeInteger(id) && id > 0 ? (id as number) : null;
      }
    } catch {
      /* fall through */
    }
  }

  const pathMatch = /\/verify\/credential\/(\d+)/.exec(text);
  if (pathMatch) {
    const n = Number(pathMatch[1]);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }

  try {
    const href = text.includes("://") ? text : `https://vera.local${text.startsWith("/") ? "" : "/"}${text}`;
    const url = new URL(href);
    const idParam = url.searchParams.get("id");
    if (idParam && /^\d+$/.test(idParam)) {
      const n = Number(idParam);
      return Number.isSafeInteger(n) && n > 0 ? n : null;
    }
  } catch {
    /* not a URL */
  }

  return null;
}

/** Coerce raw status strings into the closed set the UI knows how to render. */
export function normaliseStatus(raw: string | null | undefined): CredentialApiStatus {
  if (typeof raw !== "string") return "VALID";
  const s = raw.trim().toUpperCase();
  if (s === "EXPIRED") return "EXPIRED";
  if (s === "REVOKED" || s === "INVALID") return "REVOKED";
  return "VALID";
}

/**
 * Load credential + linked training metadata + sign-off history concurrently.
 *
 * - 404 from the credential endpoint maps to `kind: "NOT_FOUND"` so the caller
 *   can render the dedicated empty state.
 * - History (`/verification/logs/worker/:id`) is auth-protected and may 403 for
 *   public viewers; that is reported via `historyError` rather than failing
 *   the whole bundle.
 * - The worker full payload is opportunistic — if it fails we still surface
 *   the credential and just leave `relatedTraining` empty.
 */
export async function loadCredentialBundle(
  credentialId: number
): Promise<LoaderResult<CredentialBundle>> {
  let credential: CredentialVerificationPayload;
  try {
    credential = await loadCredential(credentialId);
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: statusFromError(err),
        message: messageFromUnknown(err, "Verification failed"),
      },
    };
  }

  const [workerResult, historyResult] = await Promise.all([
    loadWorkerVerification(credential.workerId).then(
      (data) => ({ ok: true as const, data }),
      (e: unknown) => ({ ok: false as const, error: e })
    ),
    loadVerificationHistory(credential.workerId).then(
      (rows) => ({ ok: true as const, rows }),
      (e: unknown) => ({
        ok: false as const,
        error: messageFromUnknown(e, "Could not load history."),
      })
    ),
  ]);

  let relatedTraining: TrainingRecord[] = [];
  if (workerResult.ok) {
    const linkedIds = new Set(credential.relatedTrainingRecords.map((r) => r.id));
    const certId = credential.certification?.id ?? null;
    relatedTraining = (workerResult.data.certifications ?? []).filter((tr) => {
      if (linkedIds.has(tr.id)) return true;
      if (certId != null && tr.certification?.id === certId) return true;
      return false;
    });
  }

  return {
    ok: true,
    data: {
      credential,
      relatedTraining,
      history: historyResult.ok ? historyResult.rows : null,
      historyError: historyResult.ok ? null : historyResult.error,
    },
  };
}
