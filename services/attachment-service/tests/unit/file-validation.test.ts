import { describe, it, expect } from 'vitest';
import { fileValidationEngine } from '../../src/engines/file-validation.engine';

describe('file validation', () => {
  it('allows jpeg', () => {
    const r = fileValidationEngine.validate({
      mimeType: 'image/jpeg',
      fileName: 'photo.jpg',
      fileSize: 1024,
    });
    expect(r.ok).toBe(true);
  });

  it('blocks executables', () => {
    const r = fileValidationEngine.validate({
      mimeType: 'application/x-msdownload',
      fileName: 'malware.exe',
      fileSize: 100,
    });
    expect(r.ok).toBe(false);
  });

  it('blocks oversized files', () => {
    const r = fileValidationEngine.validate({
      mimeType: 'image/png',
      fileName: 'big.png',
      fileSize: 30 * 1024 * 1024,
      maxBytes: 25 * 1024 * 1024,
    });
    expect(r.ok).toBe(false);
  });
});
