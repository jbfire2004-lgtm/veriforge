import type { ExtractedField } from "../types";
import { CERT_FIELD_PATTERNS, DATE_PATTERNS, STANDARD_PATTERNS } from "../utils/patterns";

export class CertificateStructureAnalyzer {
  extractFields(fullText: string): ExtractedField[] {
    const fields: ExtractedField[] = [];

    for (const [key, patterns] of Object.entries(CERT_FIELD_PATTERNS)) {
      for (const re of patterns) {
        const m = fullText.match(re);
        if (m?.[1]) {
          fields.push({
            key,
            value: m[1].trim().slice(0, 200),
            confidence: 0.8,
            source: "regex",
          });
          break;
        }
      }
    }

    const dates = extractDates(fullText);
    if (dates.issue) {
      fields.push({ key: "issueDate", value: dates.issue, confidence: 0.75, source: "date-heuristic" });
    }
    if (dates.expiry) {
      fields.push({ key: "expiryDate", value: dates.expiry, confidence: 0.75, source: "date-heuristic" });
    }

    for (const std of STANDARD_PATTERNS) {
      if (std.re.test(fullText)) {
        fields.push({
          key: "standard",
          value: std.code,
          confidence: 0.85,
          source: "standard-pattern",
        });
      }
    }

    if (/signed|signature/i.test(fullText)) {
      fields.push({ key: "hasSignature", value: "true", confidence: 0.7, source: "text" });
    }

    return dedupeFields(fields);
  }
}

function extractDates(text: string): { issue?: string; expiry?: string } {
  const found: string[] = [];
  for (const p of DATE_PATTERNS) {
    const re = new RegExp(p.source, p.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      found.push(m[1]!);
    }
  }
  if (found.length === 0) return {};
  if (found.length === 1) return { issue: found[0] };
  return { issue: found[0], expiry: found[found.length - 1] };
}

function dedupeFields(fields: ExtractedField[]): ExtractedField[] {
  const map = new Map<string, ExtractedField>();
  for (const f of fields) {
    const existing = map.get(f.key);
    if (!existing || f.confidence > existing.confidence) map.set(f.key, f);
  }
  return [...map.values()];
}
