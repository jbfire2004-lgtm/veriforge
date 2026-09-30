import { env } from '../config/env';
import { logger } from '../utils/logger';

export class CertificateEngine {
  async register(input: {
    companyId: string;
    workerId: string;
    courseId: string;
    fileName?: string;
    certificatePath?: string;
    dataUrl?: string;
  }): Promise<string | undefined> {
    if (input.certificatePath) return input.certificatePath;

    if (!input.dataUrl) return undefined;

    if (!env.attachmentServiceUrl) {
      return input.dataUrl.length > 500 ? `${input.dataUrl.slice(0, 500)}...` : input.dataUrl;
    }

    try {
      const res = await fetch(env.attachmentServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: input.companyId,
          source_type: 'training_certificate',
          source_id: input.workerId,
          file_name: input.fileName ?? `cert-${input.courseId}`,
          data_url: input.dataUrl,
        }),
      });

      if (!res.ok) {
        logger.warn('certificate upload failed', { status: res.status });
        return input.dataUrl;
      }

      const body = (await res.json()) as { storage_key?: string; path?: string };
      return body.storage_key ?? body.path ?? input.dataUrl;
    } catch (err) {
      logger.warn('attachment service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return input.dataUrl;
    }
  }
}

export const certificateEngine = new CertificateEngine();
