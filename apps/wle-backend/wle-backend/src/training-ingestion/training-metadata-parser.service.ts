import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { TrainingIngestRowDto } from './dto/ingest-training-rows.dto';

export type ParsedIngestPayload = {
  rows: TrainingIngestRowDto[];
};

function formatValidationErrors(errors: ValidationError[]): string[] {
  const out: string[] = [];
  for (const e of errors) {
    if (e.constraints) {
      out.push(...Object.values(e.constraints));
    }
    if (e.children?.length) {
      out.push(...formatValidationErrors(e.children));
    }
  }
  return out;
}

@Injectable()
export class TrainingMetadataParserService {
  /**
   * Parse optional JSON from multipart `metadata` field.
   * Shape: one row object, or `{ "rows": [ ... ] }`, or a top-level array.
   */
  parseFormMetadataString(
    json: string | undefined,
  ): ParsedIngestPayload | null {
    if (json == null || json.trim() === '') return null;
    let raw: unknown;
    try {
      raw = JSON.parse(json) as unknown;
    } catch {
      throw new BadRequestException('metadata must be valid JSON');
    }
    return this.normalizePayload(raw);
  }

  /** Parse uploaded `.json` file body */
  parseJsonFileContent(utf8: string): ParsedIngestPayload {
    let raw: unknown;
    try {
      raw = JSON.parse(utf8) as unknown;
    } catch {
      throw new BadRequestException('JSON file is not valid JSON');
    }
    return this.normalizePayload(raw);
  }

  normalizePayload(raw: unknown): ParsedIngestPayload {
    if (raw == null) {
      throw new BadRequestException('JSON payload is empty');
    }
    if (Array.isArray(raw)) {
      return { rows: raw.map((r) => this.coerceRow(r)) };
    }
    if (typeof raw === 'object' && raw !== null && 'rows' in raw) {
      const rowsVal = (raw as { rows?: unknown }).rows;
      if (!Array.isArray(rowsVal)) {
        throw new BadRequestException('rows must be an array');
      }
      return { rows: rowsVal.map((r) => this.coerceRow(r)) };
    }
    return { rows: [this.coerceRow(raw)] };
  }

  /**
   * Best-effort: pull JSON objects/arrays out of OCR/plain text (e.g. embedded
   * `{"rows":[...]}` or a single row). Returns null if nothing parses to a payload.
   * Does not throw — used for non-JSON uploads where OCR quality varies.
   */
  tryParseEmbeddedJsonFromText(
    text: string | null | undefined,
  ): ParsedIngestPayload | null {
    if (text == null || text.trim() === '') return null;
    const trimmed = text.trim();
    const candidates = this.collectBalancedJsonSlices(trimmed);
    for (const slice of candidates) {
      let raw: unknown;
      try {
        raw = JSON.parse(slice) as unknown;
      } catch {
        continue;
      }
      try {
        return this.normalizePayload(raw);
      } catch {
        continue;
      }
    }
    return null;
  }

  private collectBalancedJsonSlices(text: string): string[] {
    const out = new Set<string>();
    out.add(text);
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{' || ch === '[') {
        const end = this.findMatchingJsonBracketEnd(text, i);
        if (end !== -1) out.add(text.slice(i, end + 1));
      }
    }
    return [...out];
  }

  /** Match a top-level `{`…`}` or `[`…`]` slice, respecting strings and escapes. */
  private findMatchingJsonBracketEnd(s: string, start: number): number {
    const open = s[start];
    if (open !== '{' && open !== '[') return -1;
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  private coerceRow(obj: unknown): TrainingIngestRowDto {
    if (typeof obj !== 'object' || obj === null) {
      throw new BadRequestException('Each row must be an object');
    }
    const row = plainToInstance(TrainingIngestRowDto, obj);
    return row;
  }

  async validateRows(rows: TrainingIngestRowDto[]): Promise<string[]> {
    const messages: string[] = [];
    let index = 0;
    for (const r of rows) {
      index++;
      const errs = await validate(r);
      if (errs.length) {
        messages.push(
          `Row ${index}: ${formatValidationErrors(errs).join('; ')}`,
        );
      }
    }
    return messages;
  }

  /**
   * Merge: form metadata defines rows if present; otherwise use file-only rows.
   * If both provide rows, form rows win (typical override pattern).
   */
  mergePayloads(
    filePayload: ParsedIngestPayload | null,
    formPayload: ParsedIngestPayload | null,
  ): TrainingIngestRowDto[] {
    if (formPayload?.rows?.length) return formPayload.rows;
    if (filePayload?.rows?.length) return filePayload.rows;
    return [];
  }
}
