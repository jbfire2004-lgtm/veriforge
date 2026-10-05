/**
 * Provider API integration templates — map external LMS payloads to Vera ingest.
 * Configure per provider via ProviderSyncConfig + template key in details JSON.
 */

export type ProviderCompletionRow = {
  workerEmail?: string;
  workerPhone?: string;
  workerExternalId?: string;
  certificationCode?: string;
  certificationName?: string;
  certificateNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
  companyExternalId?: string;
  projectExternalId?: string;
};

export type ProviderApiTemplate = {
  key: string;
  label: string;
  description: string;
  /** Dot-path to array of completion rows in provider JSON response */
  completionsPath: string;
  fieldMap: Record<keyof ProviderCompletionRow, string>;
  pollMethod: 'GET' | 'POST';
  authHeader?: string;
  sinceQueryParam?: string;
};

export const PROVIDER_API_TEMPLATES: ProviderApiTemplate[] = [
  {
    key: 'generic_rest',
    label: 'Generic REST completions',
    description:
      'Standard JSON array at `completions` with email + cert code fields.',
    completionsPath: 'completions',
    fieldMap: {
      workerEmail: 'email',
      workerPhone: 'phone',
      workerExternalId: 'worker_id',
      certificationCode: 'course_code',
      certificationName: 'course_name',
      certificateNumber: 'certificate_number',
      issuedAt: 'issued_at',
      expiresAt: 'expires_at',
      companyExternalId: 'company_id',
      projectExternalId: 'project_id',
    },
    pollMethod: 'GET',
    authHeader: 'Authorization',
    sinceQueryParam: 'since',
  },
  {
    key: 'cornerstone',
    label: 'Cornerstone-style LMS',
    description:
      'Nested `data.records` with learner email and transcript fields.',
    completionsPath: 'data.records',
    fieldMap: {
      workerEmail: 'learner.email',
      workerPhone: 'learner.phone',
      workerExternalId: 'learner.id',
      certificationCode: 'transcript.courseCode',
      certificationName: 'transcript.courseTitle',
      certificateNumber: 'transcript.certificateId',
      issuedAt: 'transcript.completedOn',
      expiresAt: 'transcript.expiresOn',
      companyExternalId: 'organization.id',
      projectExternalId: 'assignment.projectId',
    },
    pollMethod: 'GET',
    authHeader: 'Authorization',
    sinceQueryParam: 'modifiedSince',
  },
  {
    key: 'safety_council_csv_json',
    label: 'Safety council webhook JSON',
    description: 'Webhook body with `trainees` array from class list upload.',
    completionsPath: 'trainees',
    fieldMap: {
      workerEmail: 'email',
      workerPhone: 'phone',
      workerExternalId: 'member_number',
      certificationCode: 'course_code',
      certificationName: 'course_name',
      certificateNumber: 'card_number',
      issuedAt: 'issue_date',
      expiresAt: 'expiry_date',
      companyExternalId: 'employer_id',
      projectExternalId: 'site_id',
    },
    pollMethod: 'POST',
  },
];

export function getProviderTemplate(
  key: string,
): ProviderApiTemplate | undefined {
  return PROVIDER_API_TEMPLATES.find((t) => t.key === key);
}

function readPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

export function mapProviderPayload(
  template: ProviderApiTemplate,
  body: unknown,
): ProviderCompletionRow[] {
  const rows = readPath(body, template.completionsPath);
  if (!Array.isArray(rows)) return [];

  return rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    const mapped: ProviderCompletionRow = {};
    for (const [target, sourcePath] of Object.entries(
      template.fieldMap,
    ) as Array<[keyof ProviderCompletionRow, string]>) {
      const val = readPath(row, sourcePath);
      if (val != null) mapped[target] = String(val);
    }
    return mapped;
  });
}
