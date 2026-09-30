import { apiFetchJson } from "@/lib/api-fetch";
import { messageFromUnknown, statusFromError } from "@/lib/loader-helpers";
import type { LoaderResult } from "@/lib/use-async-resource";
import {
  loadWorkerVerification,
  type CertificationRef,
  type CompanyRef,
  type Credential,
  type WorkerProfile,
} from "@/components/wallet/wallet-api";

/** Inner training-record block returned by `verifyTrainingRecordPublic`. */
export type TrainingRecordDetail = {
  id: number;
  courseName: string | null;
  expiresAt: string | null;
  issuedAt: string | null;
  completedAt: string | null;
  certificateNumber: string | null;
  certification: CertificationRef | null;
};

/** Provider summary returned by the public endpoint. */
export type TrainingProviderRef = {
  id?: number;
  name?: string | null;
  contactEmail?: string | null;
};

/** Shape returned by `GET /verify/training/:id`. */
export type TrainingVerificationPayload = {
  type: "training";
  id: number;
  workerId: number;
  companyId: number | null;
  certificationId: number | null;
  certificateNumber: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  company: CompanyRef | null;
  trainingRecords: TrainingRecordDetail[];
  certifications?: unknown[];
  provider: TrainingProviderRef | null;
};

/** Worker document row (subset; matches Prisma `Document`). */
export type WorkerDocument = {
  id: number;
  type: string;
  name: string;
  url: string;
  description?: string | null;
  workerId?: number | null;
  companyId?: number | null;
  tags?: string[];
  createdAt?: string;
};

/** Hydrated bundle for the training viewer. */
export type TrainingBundle = {
  training: TrainingVerificationPayload;
  /** Single training record extracted from `trainingRecords[0]`. */
  record: TrainingRecordDetail;
  worker: WorkerProfile;
  /** Best-match credential issued for the same certification, if any. */
  credential: Credential | null;
  /** Other credentials linked to this worker (excluding `credential`). */
  otherCredentials: Credential[];
  /** Worker documents matching this training (best-effort, may be `null` when restricted). */
  documents: WorkerDocument[] | null;
  documentsError: string | null;
};

/** Public verification card for a training record. */
async function loadTrainingRecord(
  id: number
): Promise<TrainingVerificationPayload> {
  return apiFetchJson<TrainingVerificationPayload>(`/verify/training/${id}`, {
    requireAuth: false,
  });
}

/** Worker documents (auth-required; admins/supervisors/PMs/the worker themself). */
async function loadWorkerDocuments(
  workerId: number
): Promise<WorkerDocument[]> {
  return apiFetchJson<WorkerDocument[]>(`/documents/worker/${workerId}`, {
    cache: "no-store",
  });
}

const PREVIEWABLE_TRAINING_DOC_TYPES = new Set([
  "TRAINING",
  "CERTIFICATE",
  "CERT",
]);

/**
 * Pick the most relevant document for this training record.
 * Heuristic: prefer docs tagged with the certification name or matching the
 * certificate number, then fall back to the most recent TRAINING document.
 */
export function pickRelatedDocument(
  documents: WorkerDocument[],
  context: {
    certificationName?: string | null;
    certificateNumber?: string | null;
  }
): WorkerDocument | null {
  if (documents.length === 0) return null;

  const certName = context.certificationName?.trim().toLowerCase();
  const certNumber = context.certificateNumber?.trim().toLowerCase();

  const scored = documents.map((doc) => {
    let score = 0;
    const haystack =
      `${doc.name ?? ""} ${doc.description ?? ""} ${(doc.tags ?? []).join(" ")}`.toLowerCase();
    if (certNumber && haystack.includes(certNumber)) score += 5;
    if (certName && haystack.includes(certName)) score += 3;
    if (PREVIEWABLE_TRAINING_DOC_TYPES.has(doc.type?.toUpperCase() ?? "")) score += 1;
    return { doc, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const at = a.doc.createdAt ? Date.parse(a.doc.createdAt) : 0;
    const bt = b.doc.createdAt ? Date.parse(b.doc.createdAt) : 0;
    return bt - at;
  });

  const top = scored[0];
  return top.score > 0 ? top.doc : (scored[0]?.doc ?? null);
}

/**
 * Loads the training record + worker bundle + (best-effort) documents.
 *
 * - 404 on training → `{ ok: false, error: { kind: "NOT_FOUND" } }`.
 * - Worker full payload: opportunistic; failures result in no linked credential.
 * - Documents endpoint requires auth; failure is reported via `documentsError`
 *   so the rest of the viewer still renders.
 */
export async function loadTrainingBundle(
  trainingId: number
): Promise<LoaderResult<TrainingBundle>> {
  let training: TrainingVerificationPayload;
  try {
    training = await loadTrainingRecord(trainingId);
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: statusFromError(err),
        message: messageFromUnknown(err, "Could not load training record."),
      },
    };
  }

  const record =
    training.trainingRecords[0] ??
    ({
      id: training.id,
      courseName: null,
      expiresAt: null,
      issuedAt: null,
      completedAt: null,
      certificateNumber: training.certificateNumber,
      certification: null,
    } satisfies TrainingRecordDetail);

  const [workerResult, docsResult] = await Promise.all([
    loadWorkerVerification(training.workerId).then(
      (data) => ({ ok: true as const, data }),
      (e: unknown) => ({ ok: false as const, error: e })
    ),
    loadWorkerDocuments(training.workerId).then(
      (rows) => ({ ok: true as const, rows }),
      (e: unknown) => ({
        ok: false as const,
        error: messageFromUnknown(e, "Documents are restricted."),
      })
    ),
  ]);

  let credential: Credential | null = null;
  let otherCredentials: Credential[] = [];
  if (workerResult.ok) {
    const all = workerResult.data.credentials ?? [];
    if (training.certificationId != null) {
      const matches = all.filter(
        (c) => c.certification?.id === training.certificationId
      );
      credential = matches[0] ?? null;
      otherCredentials = all.filter((c) => c.id !== credential?.id);
    } else {
      credential = all[0] ?? null;
      otherCredentials = all.slice(1);
    }
  }

  const worker: WorkerProfile = workerResult.ok
    ? workerResult.data.worker
    : {
        id: training.workerId,
        firstName: training.firstName ?? null,
        lastName: training.lastName ?? null,
        photoUrl: training.photoUrl ?? null,
        company: training.company,
      };

  return {
    ok: true,
    data: {
      training,
      record,
      worker,
      credential,
      otherCredentials,
      documents: docsResult.ok ? docsResult.rows : null,
      documentsError: docsResult.ok ? null : docsResult.error,
    },
  };
}

/** Mime classifier for the file preview component. */
export function classifyDocumentMime(name: string, url: string): "pdf" | "image" | "other" {
  const lower = `${name} ${url}`.toLowerCase();
  if (lower.endsWith(".pdf") || /\.pdf(\?|#|$)/i.test(url)) return "pdf";
  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(url)) return "image";
  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/.test(name.toLowerCase())) return "image";
  return "other";
}
