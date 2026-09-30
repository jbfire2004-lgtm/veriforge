/**
 * Audit & Evaluation client → `/api/audits` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type AuditEvaluationStatus =
  | "draft"
  | "assigned"
  | "in_review"
  | "scored"
  | "closed"
  | "cancelled";

export type AuditQuestionType = "score" | "yes_no" | "text" | "na";

export type AuditTemplateQuestion = {
  id: string;
  prompt: string;
  helpText?: string | null;
  questionType: AuditQuestionType;
  weight: number;
  maxScore: number;
  required: boolean;
  sortOrder: number;
  documentCategoryHint?: string | null;
};

export type AuditTemplateSection = {
  id: string;
  title: string;
  description?: string | null;
  weight: number;
  sortOrder: number;
  questions: AuditTemplateQuestion[];
};

export type AuditTemplate = {
  id: string;
  orgId?: string | null;
  name: string;
  description?: string | null;
  version: number;
  isActive: boolean;
  category: string;
  sections: AuditTemplateSection[];
};

export type AuditResponse = {
  id: string;
  questionId: string;
  scoreValue?: number | null;
  answerText?: string | null;
  isNa: boolean;
};

export type CorrectiveAction = {
  id: string;
  auditId: string;
  findingId?: string | null;
  title: string;
  description?: string | null;
  ownerName?: string | null;
  dueDate?: string | null;
  status: "open" | "in_progress" | "completed" | "waived" | "overdue";
  evidenceUrl?: string | null;
  completedAt?: string | null;
  finding?: { id: string; title: string; severity: string } | null;
  audit?: { id: string; title: string; status: string };
};

export type AuditFinding = {
  id: string;
  title: string;
  description?: string | null;
  severity: "critical" | "major" | "minor" | "observation";
  status: "open" | "addressed" | "accepted" | "waived";
  questionId?: string | null;
  correctiveActions?: CorrectiveAction[];
};

export type EvaluationAudit = {
  id: string;
  contractorId: string;
  templateId: string;
  title: string;
  status: AuditEvaluationStatus;
  score?: number | null;
  sectionScores?: unknown;
  reviewerId?: string | null;
  reviewerName?: string | null;
  assignedAt?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  documentSnapshot?: unknown;
  template?: AuditTemplate | { id: string; name: string; category: string };
  responses?: AuditResponse[];
  findings?: AuditFinding[];
  correctiveActions?: CorrectiveAction[];
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function auditsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/audits${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function listAuditTemplates() {
  return auditsFetch<{ items: AuditTemplate[] }>("/templates");
}

export async function getAuditTemplate(templateId: string) {
  return auditsFetch<AuditTemplate>(`/templates/${templateId}`);
}

export async function createAuditTemplate(body: {
  name: string;
  description?: string;
  category?: string;
  sections: unknown[];
}) {
  return auditsFetch<AuditTemplate>("/templates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cloneAuditTemplate(templateId: string, name?: string) {
  return auditsFetch<AuditTemplate>(`/templates/${templateId}/clone`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function listEvaluationAudits(params?: {
  contractorId?: string;
  status?: AuditEvaluationStatus;
  skip?: number;
  take?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.contractorId) qs.set("contractorId", params.contractorId);
  if (params?.status) qs.set("status", params.status);
  if (params?.skip != null) qs.set("skip", String(params.skip));
  if (params?.take != null) qs.set("take", String(params.take));
  const q = qs.toString();
  return auditsFetch<{ items: EvaluationAudit[]; total: number }>(
    q ? `?${q}` : "",
  );
}

export async function getEvaluationAudit(auditId: string) {
  return auditsFetch<EvaluationAudit>(`/${auditId}`);
}

export async function createEvaluationAudit(body: {
  contractorId: string;
  templateId: string;
  title?: string;
  reviewerId?: string;
  reviewerName?: string;
  dueDate?: string | null;
}) {
  return auditsFetch<EvaluationAudit>("/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function assignAuditReviewer(
  auditId: string,
  body: { reviewerId: string; reviewerName?: string; dueDate?: string | null },
) {
  return auditsFetch<EvaluationAudit>(`/${auditId}/assign`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function startAuditReview(auditId: string) {
  return auditsFetch<EvaluationAudit>(`/${auditId}/start`, {
    method: "POST",
    body: "{}",
  });
}

export async function scoreAudit(
  auditId: string,
  answers: {
    questionId: string;
    scoreValue?: number | null;
    answerText?: string | null;
    isNa?: boolean;
  }[],
  finalize = false,
) {
  return auditsFetch<EvaluationAudit>(`/${auditId}/score`, {
    method: "POST",
    body: JSON.stringify({ answers, finalize }),
  });
}

export async function closeEvaluationAudit(auditId: string) {
  return auditsFetch<EvaluationAudit>(`/${auditId}/close`, {
    method: "POST",
    body: "{}",
  });
}

export async function addAuditFinding(
  auditId: string,
  body: {
    title: string;
    description?: string;
    severity?: string;
    questionId?: string;
  },
) {
  return auditsFetch<AuditFinding>(`/${auditId}/findings`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function addCorrectiveAction(
  auditId: string,
  body: {
    title: string;
    description?: string;
    findingId?: string;
    ownerName?: string;
    dueDate?: string | null;
  },
) {
  return auditsFetch<CorrectiveAction>(`/${auditId}/corrective-actions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listCorrectiveActions(
  contractorId: string,
  status?: string,
) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return auditsFetch<{ items: CorrectiveAction[] }>(
    `/corrective-actions/${contractorId}${qs}`,
  );
}

export async function updateCorrectiveAction(
  actionId: string,
  body: Partial<CorrectiveAction>,
) {
  return auditsFetch<CorrectiveAction>(
    `/corrective-actions/item/${actionId}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}
