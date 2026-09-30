import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { EvidenceAttachment } from '../types';

export class AttachmentEngine {
  async registerEvidence(input: {
    correctiveActionId: string;
    companyId: string;
    attachment: EvidenceAttachment;
  }): Promise<{ storageKey?: string; registered: boolean }> {
    if (input.attachment.storageKey) {
      return { storageKey: input.attachment.storageKey, registered: true };
    }

    if (!env.attachmentServiceUrl || !input.attachment.dataUrl) {
      return { registered: false };
    }

    try {
      const res = await fetch(env.attachmentServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: input.companyId,
          source_type: 'corrective_action',
          source_id: input.correctiveActionId,
          file_name: input.attachment.fileName,
          mime_type: input.attachment.mimeType,
          data_url: input.attachment.dataUrl,
          phase: input.attachment.phase ?? 'evidence',
        }),
      });

      if (!res.ok) {
        logger.warn('attachment service registration failed', {
          correctiveActionId: input.correctiveActionId,
          status: res.status,
        });
        return { registered: false };
      }

      const body = (await res.json()) as { storage_key?: string; id?: string };
      return { storageKey: body.storage_key ?? body.id, registered: true };
    } catch (err) {
      logger.warn('attachment service unavailable', {
        correctiveActionId: input.correctiveActionId,
        error: err instanceof Error ? err.message : String(err),
      });
      return { registered: false };
    }
  }
}

export const attachmentEngine = new AttachmentEngine();
