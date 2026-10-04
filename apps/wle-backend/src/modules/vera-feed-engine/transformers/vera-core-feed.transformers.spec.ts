import {
  equipmentStatusToFeed,
  trainingCompletionToFeed,
  trainingExpiryToFeed,
} from './vera-core-feed.transformers';

describe('vera-core-feed.transformers', () => {
  const record = {
    id: 1,
    workerId: 10,
    companyId: 5,
    projectId: null,
    completedAt: new Date('2026-05-01'),
    issuedAt: new Date('2026-04-01'),
    expiresAt: new Date('2026-06-01'),
    certificateNumber: 'C-100',
    certificationId: 2,
    worker: { firstName: 'Alex', lastName: 'Rivera', companyId: 5 },
    certification: { name: 'Fall Protection' },
  };

  it('maps training completion', () => {
    const dto = trainingCompletionToFeed(record);
    expect(dto.source).toBe('VERA_CORE_TRAINING');
    expect(dto.title).toContain('Fall Protection');
  });

  it('maps expiring ticket within horizon', () => {
    const dto = trainingExpiryToFeed(record, new Date('2026-05-15'));
    expect(dto?.source).toBe('TRAINING_EXPIRY');
    expect(dto?.title).toContain('expires');
  });

  it('maps locked equipment', () => {
    const dto = equipmentStatusToFeed({
      id: 9,
      name: 'Crane A',
      companyId: 5,
      safetyStatus: 'OK',
      lockedOutAt: new Date(),
      lockoutReason: 'Hydraulic leak',
      updatedAt: new Date(),
    });
    expect(dto?.title).toContain('locked out');
  });
});
