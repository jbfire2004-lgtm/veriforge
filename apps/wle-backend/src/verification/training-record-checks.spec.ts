import {
  TRAINING_RECORD_EXPIRING_SOON_DAYS,
  aggregateTrainingRecordOverallStatus,
  checkCertificateNumber,
  checkCompletionState,
  checkCredentialCoverage,
  checkExpectedCompany,
  checkExpectedProvider,
  checkExpiry,
  checkProvider,
  checkTrainingType,
  checkWorkerIdentity,
} from './training-record-checks';

function workerFixture(
  overrides: Partial<Parameters<typeof checkWorkerIdentity>[0]['worker']> = {},
) {
  return {
    id: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    status: 'ACTIVE',
    companyId: 10,
    company: { id: 10, name: 'Acme' },
    ...overrides,
  };
}

describe('training-record-checks', () => {
  const now = new Date('2026-06-01T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkExpiry', () => {
    it('PASS when expiry is well in the future', () => {
      const r = checkExpiry({
        issuedAt: new Date('2025-01-01'),
        expiresAt: new Date('2027-01-01'),
      });
      expect(r.status).toBe('PASS');
      expect(r.daysUntilExpiry).toBeGreaterThan(
        TRAINING_RECORD_EXPIRING_SOON_DAYS,
      );
    });

    it('FAIL when expired', () => {
      const r = checkExpiry({
        issuedAt: new Date('2020-01-01'),
        expiresAt: new Date('2025-01-01'),
      });
      expect(r.status).toBe('FAIL');
      expect(r.daysUntilExpiry).toBeLessThan(0);
    });

    it('WARN when no expiry', () => {
      const r = checkExpiry({
        issuedAt: new Date('2025-01-01'),
        expiresAt: null,
      });
      expect(r.status).toBe('WARN');
    });
  });

  describe('checkProvider', () => {
    it('PASS when provider linked', () => {
      const r = checkProvider({
        providerId: 5,
        provider: { id: 5, name: 'Safety Co' },
      });
      expect(r.status).toBe('PASS');
    });

    it('FAIL when id set but row missing', () => {
      const r = checkProvider({
        providerId: 5,
        provider: null,
      });
      expect(r.status).toBe('FAIL');
    });

    it('WARN when no provider', () => {
      const r = checkProvider({ providerId: null, provider: null });
      expect(r.status).toBe('WARN');
    });
  });

  describe('checkExpectedProvider', () => {
    const linked = {
      providerId: 5,
      provider: { id: 5, name: 'Safety Training Inc' },
    };

    it('PASS when expected not supplied', () => {
      const r = checkExpectedProvider(linked);
      expect(r.status).toBe('PASS');
      expect(r.recordProviderName).toBe('Safety Training Inc');
    });

    it('PASS when expected matches name case-insensitively', () => {
      const r = checkExpectedProvider(linked, {
        expectedProvider: 'safety  training   inc',
      });
      expect(r.status).toBe('PASS');
    });

    it('FAIL when expected mismatches', () => {
      const r = checkExpectedProvider(linked, {
        expectedProvider: 'Other Co',
      });
      expect(r.status).toBe('FAIL');
    });

    it('FAIL when expected set but no provider on record', () => {
      const r = checkExpectedProvider(
        { providerId: null, provider: null },
        { expectedProvider: 'Anyone' },
      );
      expect(r.status).toBe('FAIL');
    });
  });

  describe('checkWorkerIdentity', () => {
    it('PASS for active worker with company', () => {
      const r = checkWorkerIdentity({
        workerId: 1,
        worker: workerFixture(),
      });
      expect(r.status).toBe('PASS');
    });

    it('FAIL when expectedWorkerId mismatches', () => {
      const r = checkWorkerIdentity(
        { workerId: 1, worker: workerFixture() },
        { expectedWorkerId: 99 },
      );
      expect(r.status).toBe('FAIL');
    });

    it('FAIL when worker not active', () => {
      const r = checkWorkerIdentity({
        workerId: 1,
        worker: workerFixture({ status: 'INACTIVE' }),
      });
      expect(r.status).toBe('FAIL');
    });

    it('WARN when no company', () => {
      const r = checkWorkerIdentity({
        workerId: 1,
        worker: workerFixture({
          companyId: null,
          company: null,
        }),
      });
      expect(r.status).toBe('WARN');
    });
  });

  describe('checkTrainingType', () => {
    it('PASS when no expected value', () => {
      const r = checkTrainingType({
        name: 'Fall Protection',
        code: 'FP-101',
      });
      expect(r.status).toBe('PASS');
    });

    it('PASS when expected matches code', () => {
      const r = checkTrainingType(
        { name: 'Fall Protection', code: 'FP-101' },
        { expectedTrainingType: 'fp-101' },
      );
      expect(r.status).toBe('PASS');
    });

    it('FAIL when expected mismatches', () => {
      const r = checkTrainingType(
        { name: 'Fall Protection', code: 'FP-101' },
        { expectedTrainingType: 'Wrong' },
      );
      expect(r.status).toBe('FAIL');
    });
  });

  describe('checkCertificateNumber', () => {
    it('WARN when missing and no expected', () => {
      const r = checkCertificateNumber({ certificateNumber: null });
      expect(r.status).toBe('WARN');
    });

    it('FAIL when expected but missing stored', () => {
      const r = checkCertificateNumber(
        { certificateNumber: null },
        { expectedCertificateNumber: 'CERT-1' },
      );
      expect(r.status).toBe('FAIL');
    });

    it('PASS when valid stored', () => {
      const r = checkCertificateNumber({
        certificateNumber: 'AB-12345',
      });
      expect(r.status).toBe('PASS');
    });
  });

  describe('checkExpectedCompany', () => {
    it('PASS when expected not supplied', () => {
      const r = checkExpectedCompany({ worker: { companyId: 5 } });
      expect(r.status).toBe('PASS');
    });

    it('FAIL when mismatch', () => {
      const r = checkExpectedCompany(
        { worker: { companyId: 5 } },
        { expectedCompanyId: 9 },
      );
      expect(r.status).toBe('FAIL');
    });
  });

  describe('checkCredentialCoverage', () => {
    const cred = {
      id: 1,
      certificationId: 10,
      name: 'X',
      expiresAt: new Date('2028-01-01'),
      issuedAt: new Date('2025-01-01'),
      certification: { id: 10, name: 'OSHA 10' },
    };

    it('PASS when a non-expired credential matches certification id', () => {
      const r = checkCredentialCoverage([cred], 10, 'OSHA 10');
      expect(r.status).toBe('PASS');
    });

    it('WARN when no matching credential', () => {
      const r = checkCredentialCoverage([], 10, 'OSHA 10');
      expect(r.status).toBe('WARN');
    });
  });

  describe('checkCompletionState', () => {
    it('PASS when not completed', () => {
      expect(checkCompletionState({ completedAt: null }).status).toBe('PASS');
    });

    it('WARN when already completed', () => {
      expect(
        checkCompletionState({ completedAt: new Date('2026-01-01') }).status,
      ).toBe('WARN');
    });
  });

  describe('aggregateTrainingRecordOverallStatus', () => {
    const cert = { name: 'Course', code: 'C1' };
    const trWithProvider = {
      providerId: 1,
      provider: { id: 1, name: 'P' },
    };

    const basePass = (wf: ReturnType<typeof workerFixture>) => ({
      expiry: checkExpiry({
        issuedAt: new Date('2025-01-01'),
        expiresAt: new Date('2027-01-01'),
      }),
      provider: checkProvider(trWithProvider),
      expectedProvider: checkExpectedProvider(trWithProvider),
      workerIdentity: checkWorkerIdentity({
        workerId: 1,
        worker: wf,
      }),
      expectedCompany: checkExpectedCompany({
        worker: { companyId: wf.companyId },
      }),
      trainingType: checkTrainingType(cert),
      certificateNumber: checkCertificateNumber({ certificateNumber: 'XX-1' }),
      credentialCoverage: checkCredentialCoverage(
        [
          {
            id: 1,
            certificationId: 1,
            name: 'Course',
            expiresAt: new Date('2028-01-01'),
            issuedAt: new Date('2025-01-01'),
            certification: { id: 1, name: 'Course' },
          },
        ],
        1,
        cert.name,
      ),
      completionState: checkCompletionState({ completedAt: null }),
    });

    it('INVALID if any FAIL', () => {
      const checks = {
        ...basePass(workerFixture()),
        workerIdentity: checkWorkerIdentity({
          workerId: 1,
          worker: workerFixture({ status: 'LEFT' }),
        }),
      };
      expect(aggregateTrainingRecordOverallStatus(checks)).toBe('INVALID');
    });

    it('VERIFIED when all PASS', () => {
      const checks = basePass(workerFixture());
      expect(aggregateTrainingRecordOverallStatus(checks)).toBe('VERIFIED');
    });
  });
});
