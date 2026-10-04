import {
  assertOrientationUploadFile,
  buildSecureOrientationObjectKey,
  bumpMinorVersion,
  computeExpiresOn,
  isNearExpiry,
  normalizeAndValidateBlocks,
  ORIENTATION_UPLOAD_MAX_BYTES,
} from '../orientation-validation';

describe('orientation-validation', () => {
  describe('bumpMinorVersion', () => {
    it('bumps 1.0 → 1.1', () => {
      expect(bumpMinorVersion('1.0')).toBe('1.1');
    });

    it('bumps 2.9 → 2.10', () => {
      expect(bumpMinorVersion('2.9')).toBe('2.10');
    });
  });

  describe('computeExpiresOn', () => {
    it('adds durationDays in UTC', () => {
      const completed = new Date('2026-01-01T00:00:00.000Z');
      expect(computeExpiresOn(completed, { durationDays: 365 })?.toISOString()).toBe(
        '2027-01-01T00:00:00.000Z',
      );
    });

    it('returns null when duration missing', () => {
      expect(computeExpiresOn(new Date(), {})).toBeNull();
    });
  });

  describe('isNearExpiry', () => {
    it('warns within window', () => {
      const now = new Date('2026-06-01T00:00:00.000Z');
      const expires = new Date('2026-06-15T00:00:00.000Z');
      expect(isNearExpiry(expires, now, 30)).toBe(true);
    });

    it('does not warn when far out', () => {
      const now = new Date('2026-06-01T00:00:00.000Z');
      const expires = new Date('2026-12-01T00:00:00.000Z');
      expect(isNearExpiry(expires, now, 30)).toBe(false);
    });

    it('does not warn when already expired', () => {
      const now = new Date('2026-06-01T00:00:00.000Z');
      const expires = new Date('2026-05-01T00:00:00.000Z');
      expect(isNearExpiry(expires, now, 30)).toBe(false);
    });
  });

  describe('normalizeAndValidateBlocks', () => {
    it('accepts valid text and quiz blocks', () => {
      const blocks = normalizeAndValidateBlocks([
        { type: 'text', title: 'PPE', body: 'Wear a hard hat', order: 0 },
        {
          type: 'quiz',
          quiz: {
            prompt: 'What first?',
            choices: ['Stop', 'Continue'],
            answerIndex: 0,
          },
          order: 1,
        },
      ]);
      expect(blocks).toHaveLength(2);
      expect(blocks[0]!.id).toMatch(/^block-/);
      expect(blocks[1]!.quiz?.answerIndex).toBe(0);
    });

    it('rejects non-array payload', () => {
      expect(() => normalizeAndValidateBlocks({} as never)).toThrow(
        /must be an array/,
      );
    });

    it('rejects invalid block type', () => {
      expect(() =>
        normalizeAndValidateBlocks([{ type: 'markdown', order: 0 }]),
      ).toThrow(/type must be one of/);
    });

    it('rejects quiz without choices', () => {
      expect(() =>
        normalizeAndValidateBlocks([
          { type: 'quiz', quiz: { prompt: 'Q?', choices: ['only'] } },
        ]),
      ).toThrow(/at least 2/);
    });

    it('rejects out-of-range answerIndex', () => {
      expect(() =>
        normalizeAndValidateBlocks([
          {
            type: 'quiz',
            quiz: {
              prompt: 'Q?',
              choices: ['a', 'b'],
              answerIndex: 9,
            },
          },
        ]),
      ).toThrow(/answerIndex/);
    });
  });

  describe('assertOrientationUploadFile', () => {
    it('accepts pdf under size limit', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/pdf',
          size: 1024,
          originalname: 'site.pdf',
        }),
      ).not.toThrow();
    });

    it('rejects unsupported mime', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/x-msdownload',
          size: 10,
          originalname: 'evil.exe',
        }),
      ).toThrow(/unsupported file type/);
    });

    it('rejects oversized file', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/pdf',
          size: ORIENTATION_UPLOAD_MAX_BYTES + 1,
          originalname: 'big.pdf',
        }),
      ).toThrow(/maximum size/);
    });
  });

  describe('buildSecureOrientationObjectKey', () => {
    it('scopes key to company and sanitizes name', () => {
      const key = buildSecureOrientationObjectKey({
        companyId: 42,
        originalName: '../../secret.pdf',
        now: new Date('2026-07-28T12:00:00.000Z'),
      });
      expect(key.startsWith('orientation/42/')).toBe(true);
      expect(key.includes('..')).toBe(false);
      expect(key).toContain('secret.pdf');
    });
  });
});
