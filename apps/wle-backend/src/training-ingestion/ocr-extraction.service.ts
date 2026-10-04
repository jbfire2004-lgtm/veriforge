import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  OcrFieldExtractorService,
  OcrExtractedFields,
} from './ocr-field-extractor.service';
import {
  assertValidPdfHeader,
  PdfGuardError,
  withTimeout,
} from './pipeline/pdf-guard';

export type OcrExtractionResult = {
  text: string;
  confidence: number;
  engine: 'heuristic' | 'stub';
  fields: OcrExtractedFields;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * OCR provider with retry + heuristic field extraction.
 * Swap `extractFromBuffer` body for Tesseract / Textract when configured.
 */
@Injectable()
export class OcrExtractionService {
  private readonly logger = new Logger(OcrExtractionService.name);

  constructor(private readonly fieldExtractor: OcrFieldExtractorService) {}

  async extractWithRetry(
    buffer: Buffer,
    mimeType: string,
    maxAttempts = 3,
  ): Promise<OcrExtractionResult> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.extractFromBuffer(buffer, mimeType);
      } catch (e) {
        lastError = e;
        this.logger.warn(
          `OCR attempt ${attempt}/${maxAttempts} failed: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
        if (attempt < maxAttempts) await sleep(100 * 2 ** attempt);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(String(lastError ?? 'OCR failed'));
  }

  async extractFromBuffer(
    buffer: Buffer,
    mimeType: string,
  ): Promise<OcrExtractionResult> {
    if (mimeType === 'application/pdf') {
      try {
        assertValidPdfHeader(buffer);
      } catch (e) {
        if (e instanceof PdfGuardError) {
          throw new BadRequestException(e.message);
        }
        throw e;
      }
    }

    const timeoutMs = Number(process.env.TRAINING_OCR_TIMEOUT_MS ?? 30_000);
    const text = await withTimeout(
      this.readTextFromBuffer(buffer, mimeType),
      timeoutMs,
      'OCR extraction',
    );
    const fields = this.fieldExtractor.extract(text);
    return {
      text,
      confidence: fields.confidence,
      engine: text.includes('[VERA_OCR_STUB]') ? 'stub' : 'heuristic',
      fields,
    };
  }

  private async readTextFromBuffer(
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    if (mimeType === 'application/json') {
      return buffer.toString('utf8');
    }

    const head = buffer.subarray(0, Math.min(64, buffer.length));
    return [
      '[VERA_OCR_STUB]',
      `mimeType=${mimeType}`,
      `byteLength=${buffer.length}`,
      `headHex=${head.toString('hex')}`,
      'Trainee: Sample Worker',
      'Course: WHMIS 2015',
      'Issued: 01/01/2024',
      'Expiry: 01/01/2027',
      'Replace OcrExtractionService.readTextFromBuffer with Textract/Tesseract for production scans.',
    ].join('\n');
  }
}
