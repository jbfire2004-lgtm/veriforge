/** Strip internal tenant identifiers from public verification payloads. */

export type PublicCompanyRef = { name: string | null };

export function publicCompanyName(
  company: { id?: number; name?: string | null } | null | undefined,
): PublicCompanyRef | null {
  if (!company?.name) return null;
  return { name: company.name };
}

export function publicTrainingRecord(tr: {
  id: number;
  expiresAt?: Date | null;
  issuedAt?: Date;
  completedAt?: Date | null;
  certificateNumber?: string | null;
  certification?: { name?: string; code?: string | null } | null;
  courseName?: string | null;
  providerName?: string | null;
}) {
  return {
    courseName: tr.courseName ?? tr.certification?.name ?? 'Training',
    certificationCode: tr.certification?.code ?? null,
    expiresAt: tr.expiresAt ?? null,
    issuedAt: tr.issuedAt ?? null,
    completedAt: tr.completedAt ?? null,
    status: tr.expiresAt && tr.expiresAt <= new Date() ? 'EXPIRED' : 'ACTIVE',
  };
}

export function publicCredential(c: {
  id: number;
  name?: string | null;
  issuedAt?: Date;
  expiresAt?: Date | null;
  certification?: { name?: string; code?: string | null } | null;
}) {
  const valid = !c.expiresAt || c.expiresAt.getTime() > Date.now();
  return {
    name: c.name ?? c.certification?.name ?? 'Credential',
    status: valid ? 'VALID' : 'EXPIRED',
    issuedOn: c.issuedAt ?? null,
    expiresOn: c.expiresAt ?? null,
    certificationName: c.certification?.name ?? null,
  };
}

export function publicEquipmentSummary(eq: {
  id: number;
  name: string;
  safetyStatus?: string;
}) {
  return {
    name: eq.name,
    safetyStatus: eq.safetyStatus ?? 'OK',
    isSafe: (eq.safetyStatus ?? 'OK') === 'OK',
  };
}

export function publicWorkerCard(input: {
  qrToken: string | null;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  companyName?: string | null;
  compliance?: { isCompliant?: boolean; issues?: unknown[] };
  certifications?: ReturnType<typeof publicTrainingRecord>[];
  credentials?: ReturnType<typeof publicCredential>[];
  equipment?: ReturnType<typeof publicEquipmentSummary>[];
}) {
  return {
    type: 'worker' as const,
    publicRef: input.qrToken,
    displayName: `${input.firstName} ${input.lastName}`.trim(),
    photoUrl: input.photoUrl ?? null,
    company: input.companyName ? { name: input.companyName } : null,
    compliance: input.compliance
      ? {
          isCompliant: input.compliance.isCompliant ?? false,
          issueCount: input.compliance.issues?.length ?? 0,
        }
      : undefined,
    training: input.certifications ?? [],
    credentials: input.credentials ?? [],
    equipment: input.equipment ?? [],
  };
}

export function publicEquipmentCard(input: {
  qrToken: string | null;
  name: string;
  safetyStatus?: string;
  photoUrl?: string | null;
  companyName?: string | null;
  assignedWorkers?: { displayName: string }[];
}) {
  return {
    type: 'equipment' as const,
    publicRef: input.qrToken,
    name: input.name,
    safetyStatus: input.safetyStatus ?? 'OK',
    isSafe: (input.safetyStatus ?? 'OK') === 'OK',
    photoUrl: input.photoUrl ?? null,
    company: input.companyName ? { name: input.companyName } : null,
    assignedWorkers: input.assignedWorkers ?? [],
  };
}
