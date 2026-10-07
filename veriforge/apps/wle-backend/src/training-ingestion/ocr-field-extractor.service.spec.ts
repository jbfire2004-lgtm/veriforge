import { OcrFieldExtractorService } from './ocr-field-extractor.service';

describe('OcrFieldExtractorService', () => {
  const extractor = new OcrFieldExtractorService();

  it('extracts worker name, certification, and expiry', () => {
    const text = `
      Training Certificate
      Trainee: Jane Doe
      Course: WHMIS 2015
      Issued: 01/15/2024
      Expiry: 01/15/2027
      Certificate #: WHMIS-ABC-12345
    `;
    const fields = extractor.extract(text);
    expect(fields.workerName).toBe('Jane Doe');
    expect(fields.certificationCode).toBe('WHMIS');
    expect(fields.expiresAt).toBe('01/15/2027');
    expect(fields.issuedAt).toBe('01/15/2024');
    expect(fields.certificateNumber).toBe('WHMIS-ABC-12345');
    expect(fields.confidence).toBeGreaterThan(0.5);
  });

  it('returns low confidence for empty stub text', () => {
    const fields = extractor.extract(
      '[VERA_OCR_STUB]\nmimeType=application/pdf',
    );
    expect(fields.confidence).toBeLessThan(0.2);
  });
});
