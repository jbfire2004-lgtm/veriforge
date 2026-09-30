import { BadRequestException } from '@nestjs/common';
import type { OrientationContentBlock } from './orientation.types';

export const ORIENTATION_BLOCK_TYPES = [
  'slide',
  'text',
  'video',
  'quiz',
  'policy_ack',
] as const;

export const ORIENTATION_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

export const ORIENTATION_UPLOAD_ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

/** Days before expiresOn when profile gating upgrades to warning. */
export const ORIENTATION_NEAR_EXPIRY_DAYS = 30;

export function bumpMinorVersion(version: string): string {
  const [majorRaw, minorRaw] = version.split('.');
  const major = Number(majorRaw) || 1;
  const minor = Number(minorRaw) || 0;
  return `${major}.${minor + 1}`;
}

export function computeExpiresOn(
  completedOn: Date,
  rules: { durationDays?: number } | null | undefined,
): Date | null {
  const days = rules?.durationDays;
  if (days == null || days <= 0) return null;
  const expires = new Date(completedOn);
  expires.setUTCDate(expires.getUTCDate() + days);
  return expires;
}

export function isNearExpiry(
  expiresOn: Date | null | undefined,
  now = new Date(),
  withinDays = ORIENTATION_NEAR_EXPIRY_DAYS,
): boolean {
  if (!expiresOn) return false;
  const ms = expiresOn.getTime() - now.getTime();
  if (ms < 0) return false;
  return ms <= withinDays * 24 * 60 * 60 * 1000;
}

/**
 * Normalize + validate contentBlocks. Rejects malformed payloads.
 */
export function normalizeAndValidateBlocks(
  blocks: unknown,
): OrientationContentBlock[] {
  if (blocks == null) return [];
  if (!Array.isArray(blocks)) {
    throw new BadRequestException('contentBlocks must be an array');
  }
  if (blocks.length > 200) {
    throw new BadRequestException('contentBlocks exceeds maximum of 200');
  }

  return blocks.map((raw, i) => {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadRequestException(
        `contentBlocks[${i}] must be an object`,
      );
    }
    const b = raw as Record<string, unknown>;
    const type = String(b.type ?? '');
    if (
      !ORIENTATION_BLOCK_TYPES.includes(
        type as (typeof ORIENTATION_BLOCK_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        `contentBlocks[${i}].type must be one of: ${ORIENTATION_BLOCK_TYPES.join(', ')}`,
      );
    }

    let quiz: OrientationContentBlock['quiz'];
    if (type === 'quiz') {
      const q = b.quiz;
      if (q == null || typeof q !== 'object' || Array.isArray(q)) {
        throw new BadRequestException(
          `contentBlocks[${i}].quiz is required for quiz blocks`,
        );
      }
      const quizObj = q as Record<string, unknown>;
      const prompt = String(quizObj.prompt ?? '').trim();
      const choices = quizObj.choices;
      if (!prompt) {
        throw new BadRequestException(
          `contentBlocks[${i}].quiz.prompt is required`,
        );
      }
      if (!Array.isArray(choices) || choices.length < 2) {
        throw new BadRequestException(
          `contentBlocks[${i}].quiz.choices must have at least 2 items`,
        );
      }
      const answerIndex = Number(quizObj.answerIndex);
      if (
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 ||
        answerIndex >= choices.length
      ) {
        throw new BadRequestException(
          `contentBlocks[${i}].quiz.answerIndex is out of range`,
        );
      }
      quiz = {
        prompt,
        choices: choices.map((c) => String(c)),
        answerIndex,
      };
    }

    return {
      id: String(b.id || `block-${i + 1}`),
      type: type as OrientationContentBlock['type'],
      title: b.title != null ? String(b.title) : undefined,
      body: b.body != null ? String(b.body) : undefined,
      mediaUrl: b.mediaUrl != null ? String(b.mediaUrl) : undefined,
      quiz,
      policyId: b.policyId != null ? String(b.policyId) : undefined,
      order: typeof b.order === 'number' ? b.order : i,
      meta:
        b.meta != null && typeof b.meta === 'object' && !Array.isArray(b.meta)
          ? (b.meta as Record<string, unknown>)
          : undefined,
    };
  });
}

export function assertOrientationUploadFile(file: {
  mimetype?: string;
  size?: number;
  originalname?: string;
}): void {
  if (!file) {
    throw new BadRequestException('file is required');
  }
  const size = file.size ?? 0;
  if (size <= 0) {
    throw new BadRequestException('file is empty');
  }
  if (size > ORIENTATION_UPLOAD_MAX_BYTES) {
    throw new BadRequestException(
      `file exceeds maximum size of ${ORIENTATION_UPLOAD_MAX_BYTES} bytes`,
    );
  }
  const mime = (file.mimetype || '').toLowerCase();
  if (!ORIENTATION_UPLOAD_ALLOWED_MIME.has(mime)) {
    throw new BadRequestException(
      `unsupported file type: ${mime || 'unknown'}`,
    );
  }
}

export function buildSecureOrientationObjectKey(input: {
  companyId: number;
  originalName: string;
  now?: Date;
}): string {
  const safeName = (input.originalName || 'upload.bin')
    .replace(/[/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 120);
  const stamp = (input.now ?? new Date()).toISOString().replace(/[:.]/g, '-');
  return `orientation/${input.companyId}/${stamp}-${safeName}`;
}
