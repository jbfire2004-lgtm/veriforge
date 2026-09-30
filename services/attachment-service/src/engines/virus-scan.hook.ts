import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { VirusScanResult } from '../types';

export async function runVirusScanHook(input: {
  attachmentId: string;
  companyId: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}): Promise<VirusScanResult> {
  if (!env.virusScanUrl) {
    return { clean: true };
  }

  try {
    const res = await fetch(env.virusScanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(env.virusScanTimeoutMs),
    });

    const body = (await res.json()) as { clean?: boolean; infected?: boolean; reason?: string };

    if (!res.ok) {
      logger.warn('virus scan hook error', { status: res.status, attachmentId: input.attachmentId });
      return { clean: true };
    }

    if (body.infected === true || body.clean === false) {
      return { clean: false, reason: body.reason ?? 'File failed virus scan' };
    }

    return { clean: true };
  } catch (err) {
    logger.warn('virus scan hook unreachable', {
      attachmentId: input.attachmentId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { clean: true };
  }
}
