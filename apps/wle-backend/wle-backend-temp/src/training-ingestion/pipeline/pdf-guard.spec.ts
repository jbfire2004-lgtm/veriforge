import { assertValidPdfHeader, PdfGuardError, withTimeout } from './pdf-guard';

describe('pdf-guard', () => {
  it('accepts valid PDF header', () => {
    expect(() => assertValidPdfHeader(Buffer.from('%PDF-1.4\n'))).not.toThrow();
  });

  it('rejects malformed PDF', () => {
    expect(() => assertValidPdfHeader(Buffer.from('NOTPDF'))).toThrow(
      PdfGuardError,
    );
  });

  it('times out slow operations', async () => {
    await expect(
      withTimeout(new Promise((r) => setTimeout(r, 200)), 50, 'test-op'),
    ).rejects.toThrow(/timed out/);
  });
});
