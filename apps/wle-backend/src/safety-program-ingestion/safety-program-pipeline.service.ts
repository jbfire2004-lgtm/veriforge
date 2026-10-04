import { Injectable } from '@nestjs/common';
import { SafetyProgramExtractService } from './safety-program-extract.service';
import { SafetyProgramMergeService } from './safety-program-merge.service';
import { SafetyProgramNormalizeService } from './safety-program-normalize.service';
import type { SafetyProgramExtract } from './schema/safety-program-extract.schema';

const DEFAULT_CHUNK_CHARS = 3500;
const OVERLAP_CHARS = 200;

@Injectable()
export class SafetyProgramPipelineService {
  constructor(
    private readonly extract: SafetyProgramExtractService,
    private readonly merge: SafetyProgramMergeService,
    private readonly normalize: SafetyProgramNormalizeService,
  ) {}

  /** Split → extract each chunk → merge → normalize. */
  processDocumentText(input: {
    text: string;
    sourceReference?: string | null;
    fileName?: string | null;
    chunkChars?: number;
  }): {
    extract: SafetyProgramExtract;
    confidence: number;
    chunkCount: number;
  } {
    const text = input.text.trim();
    const chunks = splitText(text, input.chunkChars ?? DEFAULT_CHUNK_CHARS);
    const extracts = chunks.map((chunk, i) => {
      const { extract } = this.extract.extractFromText({
        text: chunk,
        sourceReference: input.sourceReference ?? null,
        fileName: input.fileName
          ? `${input.fileName}#chunk-${i + 1}`
          : `chunk-${i + 1}`,
      });
      return extract;
    });
    const merged = this.merge.merge(extracts);
    if (!merged.meta.source_reference) {
      merged.meta.source_reference =
        input.sourceReference ?? input.fileName ?? null;
    }
    const normalized = this.normalize.normalize(merged);
    const confidence = scorePipeline(normalized, extracts.length);
    return { extract: normalized, confidence, chunkCount: chunks.length };
  }
}

export function splitText(text: string, chunkChars: number): string[] {
  if (!text) return [''];
  if (text.length <= chunkChars) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + chunkChars, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf('\n\n'),
        slice.lastIndexOf('\n'),
        slice.lastIndexOf('. '),
      );
      if (breakAt > chunkChars * 0.4) {
        end = start + breakAt + 1;
      }
    }
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = Math.max(0, end - OVERLAP_CHARS);
  }
  return chunks.filter(Boolean);
}

function scorePipeline(
  extract: SafetyProgramExtract,
  chunkCount: number,
): number {
  if (!extract.meta.is_safety_document) return 0.85;
  let score = 0.4;
  if (extract.hazards.length) score += 0.15;
  if (extract.controls.length) score += 0.15;
  if (extract.meta.regulatory_frameworks.length) score += 0.1;
  if (chunkCount > 1) score += 0.05;
  return Math.min(0.95, Math.round(score * 100) / 100);
}
