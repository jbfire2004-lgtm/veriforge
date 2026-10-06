import { BadRequestException } from '@nestjs/common';
import type { RequiredSignatureDef } from './pm-inspection-signature.constants';

export type SignatureRecord = {
  role: string;
  signatureData?: string | null;
  coreFileId?: number | null;
};

export function parseRequiredSignatures(raw: unknown): RequiredSignatureDef[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is RequiredSignatureDef =>
      row != null &&
      typeof row === 'object' &&
      typeof (row as RequiredSignatureDef).role === 'string',
  );
}

export function missingRequiredSignatureRoles(
  required: RequiredSignatureDef[],
  existing: SignatureRecord[],
): string[] {
  const signed = new Set(existing.map((s) => s.role));
  return required.filter((r) => !signed.has(r.role)).map((r) => r.role);
}

export function signatureHasImage(data: SignatureRecord): boolean {
  if (data.coreFileId != null) return true;
  const value = data.signatureData?.trim();
  return Boolean(value && value.length > 8);
}

export function assertEditableInspectionStatus(status: string): void {
  if (!['draft', 'in_progress'].includes(status)) {
    throw new BadRequestException('Inspection is not editable');
  }
}

export function assertSignatureRoleAllowed(
  role: string,
  required: RequiredSignatureDef[],
): void {
  if (!required.some((r) => r.role === role)) {
    throw new BadRequestException(`Signature role not required: ${role}`);
  }
}

export function assertSignaturePayload(
  data: {
    role?: string;
    signatureData?: string;
    coreFileId?: number;
  },
  required: RequiredSignatureDef[],
): { role: string; signatureData?: string; coreFileId?: number } {
  const role = data.role?.trim();
  if (!role) {
    throw new BadRequestException('Signature role is required');
  }
  assertSignatureRoleAllowed(role, required);

  const hasDataUrl =
    typeof data.signatureData === 'string' &&
    data.signatureData.trim().length > 0;
  const hasCoreFile = data.coreFileId != null;

  if (!hasDataUrl && !hasCoreFile) {
    throw new BadRequestException('Signature image is required');
  }

  if (
    hasDataUrl &&
    data.signatureData!.startsWith('data:') &&
    !/^data:image\/png;base64,/i.test(data.signatureData!)
  ) {
    throw new BadRequestException('Signature must be a PNG image');
  }

  return {
    role,
    signatureData: hasDataUrl ? data.signatureData!.trim() : undefined,
    coreFileId: hasCoreFile ? data.coreFileId : undefined,
  };
}

export function assertAllRequiredSignaturesPresent(
  required: RequiredSignatureDef[],
  existing: SignatureRecord[],
): void {
  const missing = missingRequiredSignatureRoles(required, existing);
  if (missing.length) {
    throw new BadRequestException(`Missing signature: ${missing[0]}`);
  }

  for (const req of required) {
    const row = existing.find((s) => s.role === req.role);
    if (!row || !signatureHasImage(row)) {
      throw new BadRequestException(`Missing signature image: ${req.role}`);
    }
  }
}
