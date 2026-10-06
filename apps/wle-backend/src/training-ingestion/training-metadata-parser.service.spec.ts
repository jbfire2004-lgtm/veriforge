import { TrainingMetadataParserService } from './training-metadata-parser.service';

describe('TrainingMetadataParserService', () => {
  const parser = new TrainingMetadataParserService();

  it('tryParseEmbeddedJsonFromText: extracts object from noisy OCR text', () => {
    const row = {
      workerId: 9,
      certificationId: 3,
      issuedAt: '2025-01-01T00:00:00.000Z',
      expiresAt: '2027-01-01T00:00:00.000Z',
    };
    const noise = `HEADER\n[VERA_OCR_STUB]\n${JSON.stringify(row)}\nFOOTER`;
    const payload = parser.tryParseEmbeddedJsonFromText(noise);
    expect(payload?.rows?.length).toBe(1);
    expect(payload?.rows[0].workerId).toBe(9);
  });

  it('tryParseEmbeddedJsonFromText: extracts rows array from embedded JSON', () => {
    const inner = {
      rows: [
        {
          workerId: 1,
          certificationId: 2,
          issuedAt: '2025-06-01T00:00:00.000Z',
          expiresAt: '2027-06-01T00:00:00.000Z',
        },
      ],
    };
    const wrapped = `start\n${JSON.stringify(inner)}\nend`;
    const payload = parser.tryParseEmbeddedJsonFromText(wrapped);
    expect(payload?.rows?.length).toBe(1);
  });

  it('tryParseEmbeddedJsonFromText: returns null when no JSON payload', () => {
    expect(parser.tryParseEmbeddedJsonFromText('no json here')).toBeNull();
  });
});
