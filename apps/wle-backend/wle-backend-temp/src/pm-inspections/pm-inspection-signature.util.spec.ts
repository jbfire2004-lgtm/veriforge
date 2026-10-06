import { BadRequestException } from '@nestjs/common';
import {
  assertAllRequiredSignaturesPresent,
  assertEditableInspectionStatus,
  assertSignaturePayload,
  missingRequiredSignatureRoles,
  parseRequiredSignatures,
  signatureHasImage,
} from './pm-inspection-signature.util';
import {
  DEFAULT_SUPERVISOR_SIGNATURE,
  DEFAULT_WORKER_SIGNATURE,
  PM_INSPECTION_SIGNATURE_ROLES,
} from './pm-inspection-signature.constants';

describe('pm-inspection-signature.util', () => {
  const required = [DEFAULT_SUPERVISOR_SIGNATURE, DEFAULT_WORKER_SIGNATURE];

  it('parses required signature defs from template JSON', () => {
    expect(
      parseRequiredSignatures([{ role: 'supervisor', label: 'Sup' }]),
    ).toEqual([{ role: 'supervisor', label: 'Sup' }]);
    expect(parseRequiredSignatures(null)).toEqual([]);
  });

  it('detects missing roles', () => {
    expect(
      missingRequiredSignatureRoles(required, [
        { role: 'supervisor', signatureData: 'x' },
      ]),
    ).toEqual([PM_INSPECTION_SIGNATURE_ROLES.WORKER]);
  });

  it('validates PNG data URL payload', () => {
    const out = assertSignaturePayload(
      {
        role: 'supervisor',
        signatureData: 'data:image/png;base64,abc',
      },
      [DEFAULT_SUPERVISOR_SIGNATURE],
    );
    expect(out.role).toBe('supervisor');
    expect(out.signatureData).toContain('data:image/png');
  });

  it('rejects non-required roles', () => {
    expect(() =>
      assertSignaturePayload(
        { role: 'guest', signatureData: 'data:image/png;base64,x' },
        required,
      ),
    ).toThrow(BadRequestException);
  });

  it('requires image data or core file id', () => {
    expect(() =>
      assertSignaturePayload({ role: 'supervisor' }, required),
    ).toThrow(BadRequestException);
  });

  it('blocks submit when signature row lacks image', () => {
    expect(() =>
      assertAllRequiredSignaturesPresent(required, [
        { role: 'supervisor', signatureData: 'data:image/png;base64,x' },
        { role: 'worker', coreFileId: 1 },
      ]),
    ).not.toThrow();

    expect(() =>
      assertAllRequiredSignaturesPresent(required, [
        { role: 'supervisor', signatureData: 'data:image/png;base64,x' },
        { role: 'worker' },
      ]),
    ).toThrow(/Missing signature image: worker/);
  });

  it('signatureHasImage accepts coreFileId', () => {
    expect(signatureHasImage({ role: 'worker', coreFileId: 9 })).toBe(true);
    expect(signatureHasImage({ role: 'worker' })).toBe(false);
  });

  it('assertEditableInspectionStatus allows draft and in_progress', () => {
    expect(() => assertEditableInspectionStatus('draft')).not.toThrow();
    expect(() => assertEditableInspectionStatus('submitted')).toThrow(
      BadRequestException,
    );
  });
});
