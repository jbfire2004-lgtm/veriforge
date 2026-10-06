import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

const PII_PATTERNS: RegExp[] = [
  /\b[\w.+-]+@[\w.-]+\.\w{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  /\b\d{1,5}\s+(?:[A-Za-z0-9.'-]+\s+){0,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b\.?/gi,
  /\b(?:lat(?:itude)?|lon(?:gitude)?|gps)\s*[:=]?\s*-?\d{1,3}\.\d+\b/gi,
  /\b-?\d{1,2}\.\d{3,},\s*-?\d{1,3}\.\d{3,}\b/g,
];

/** Keys that must never leave the tenant in JSON context dumps. */
const SENSITIVE_JSON_KEYS = new Set([
  'imagebase64',
  'image_base64',
  'photoBase64',
  'photobase64',
  'ssn',
  'sin',
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'email',
  'phone',
  'phonenumber',
  'mobile',
  'address',
  'homeaddress',
  'gps',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'geolocation',
]);

@Injectable()
export class VeriAgentRedactionService {
  /**
   * Strip PII from free text before LLM egress.
   * ok=false when residual phone/email patterns remain.
   */
  redactText(text: string): { text: string; ok: boolean } {
    let out = text ?? '';
    for (const re of PII_PATTERNS) {
      out = out.replace(re, '[REDACTED]');
    }
    out = out.replace(
      /\b(witness|employee|worker|operator|supervisor)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g,
      '$1 [ROLE]',
    );
    const stillLooksLikePhone = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(out);
    const stillEmail = /@/.test(out) && /\.\w{2,}/.test(out);
    return { text: out, ok: !stillLooksLikePhone && !stillEmail };
  }

  /**
   * Deep-clone JSON context for copilot prompts: drop media/PII keys,
   * redact string leaves.
   */
  redactJsonContext(value: unknown, depth = 0): unknown {
    if (depth > 8) return '[TRUNCATED]';
    if (value == null) return value;
    if (typeof value === 'string') {
      return this.redactText(value).text.slice(0, 4000);
    }
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value.slice(0, 50).map((v) => this.redactJsonContext(v, depth + 1));
    }
    if (typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_JSON_KEYS.has(k.toLowerCase())) {
          out[k] = '[REDACTED]';
          continue;
        }
        if (
          typeof v === 'string' &&
          v.length > 200 &&
          /^[A-Za-z0-9+/=\s]+$/.test(v.slice(0, 80)) &&
          v.length > 5000
        ) {
          // Likely base64 blob under an unexpected key
          out[k] = '[REDACTED_MEDIA]';
          continue;
        }
        out[k] = this.redactJsonContext(v, depth + 1);
      }
      return out;
    }
    return String(value);
  }

  hashForAudit(text: string): string {
    return createHash('sha256').update(text).digest('hex').slice(0, 32);
  }

  /**
   * Remove common PII-looking fields from inbound model JSON before persistence.
   */
  sanitizeModelJson<T extends Record<string, unknown>>(data: T): T {
    const walk = (node: unknown, depth: number): unknown => {
      if (depth > 8 || node == null) return node;
      if (typeof node === 'string') return this.redactText(node).text;
      if (Array.isArray(node)) return node.map((x) => walk(x, depth + 1));
      if (typeof node === 'object') {
        const o: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
          if (SENSITIVE_JSON_KEYS.has(k.toLowerCase())) continue;
          o[k] = walk(v, depth + 1);
        }
        return o;
      }
      return node;
    };
    return walk(data, 0) as T;
  }
}
