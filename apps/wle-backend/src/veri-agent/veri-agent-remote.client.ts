import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type {
  VeriAgentCompleteRequest,
  VeriAgentCompleteResult,
  VeriAgentEmbedRequest,
  VeriAgentEmbedResult,
  VeriAgentMultimodalRequest,
} from './veri-agent.types';

type RemoteTransportError = {
  kind: 'transport';
  status?: number;
  message: string;
};

/**
 * HTTP client for services/veri-agent-service.
 * Only used when VERA_AGENT_REMOTE_URL is set.
 */
@Injectable()
export class VeriAgentRemoteClient {
  private readonly logger = new Logger(VeriAgentRemoteClient.name);

  isEnabled(): boolean {
    return Boolean(this.baseUrl());
  }

  isStrict(): boolean {
    const v = (process.env.VERA_AGENT_REMOTE_STRICT ?? '').toLowerCase();
    return v === '1' || v === 'true' || v === 'on';
  }

  async completeJson<T extends Record<string, unknown>>(
    req: VeriAgentCompleteRequest,
  ): Promise<VeriAgentCompleteResult<T> | RemoteTransportError> {
    return this.postComplete<T>('/v1/invoke', {
      purpose: req.purpose,
      tenant: req.tenant,
      actor: req.actor
        ? {
            userId: req.actor.userId,
            role: req.actor.role,
            companyId: req.actor.companyId,
          }
        : undefined,
      messages: req.messages,
      temperature: req.temperature,
      model: req.model,
      requireCleanRedaction: req.requireCleanRedaction,
    });
  }

  async completeMultimodalJson<T extends Record<string, unknown>>(
    req: VeriAgentMultimodalRequest,
  ): Promise<VeriAgentCompleteResult<T> | RemoteTransportError> {
    return this.postComplete<T>('/v1/invoke/multimodal', {
      purpose: req.purpose,
      tenant: req.tenant,
      actor: req.actor
        ? {
            userId: req.actor.userId,
            role: req.actor.role,
            companyId: req.actor.companyId,
          }
        : undefined,
      system: req.system,
      userText: req.userText,
      imageBase64: req.imageBase64,
      imageMimeType: req.imageMimeType,
      temperature: req.temperature,
      model: req.model,
      requireCleanRedaction: req.requireCleanRedaction,
    });
  }

  async embed(
    req: VeriAgentEmbedRequest,
  ): Promise<VeriAgentEmbedResult | RemoteTransportError> {
    const base = this.baseUrl();
    if (!base) {
      return { kind: 'transport', message: 'remote_url_unset' };
    }
    const token = this.serviceToken(req.tenant.companyId);
    if (!token) {
      return { kind: 'transport', message: 'missing_service_token' };
    }
    try {
      const res = await fetch(`${base}/v1/embed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: req.purpose,
          tenant: req.tenant,
          actor: req.actor,
          text: req.text,
          model: req.model,
          requireCleanRedaction: req.requireCleanRedaction,
        }),
      });
      if (res.status >= 500 || res.status === 429) {
        return {
          kind: 'transport',
          status: res.status,
          message: `remote_http_${res.status}`,
        };
      }
      if (res.status === 401 || res.status === 403) {
        return {
          kind: 'transport',
          status: res.status,
          message: `remote_auth_${res.status}`,
        };
      }
      const json = (await res.json()) as VeriAgentEmbedResult;
      if (json && typeof json === 'object' && typeof json.ok === 'boolean') {
        return json;
      }
      return { kind: 'transport', message: 'remote_unexpected_shape' };
    } catch (e) {
      return {
        kind: 'transport',
        message: e instanceof Error ? e.message : 'fetch_failed',
      };
    }
  }

  private baseUrl(): string {
    return (process.env.VERA_AGENT_REMOTE_URL ?? '').replace(/\/$/, '');
  }

  private serviceToken(companyId?: number): string | null {
    const secret =
      process.env.VERA_AGENT_JWT_SECRET?.trim() ||
      process.env.JWT_SECRET?.trim();
    const isProd = process.env.NODE_ENV === 'production';

    // Prefer short-lived tenant JWTs. Static Bearer is forbidden in production
    // (no companyId claim → would skip tenant bind).
    if (secret && companyId != null && Number.isFinite(companyId)) {
      const issuer =
        process.env.VERA_AGENT_JWT_ISSUER || process.env.JWT_ISSUER || 'veriforge';
      const audience =
        process.env.VERA_AGENT_JWT_AUDIENCE ||
        process.env.JWT_AUDIENCE_VERI_AGENT ||
        'veri-agent';

      return jwt.sign(
        {
          sub: 'nest-veri-agent',
          companyId,
        },
        secret,
        {
          algorithm: 'HS256',
          issuer,
          audience,
          expiresIn: '5m',
        },
      );
    }

    const staticToken = process.env.VERA_AGENT_SERVICE_TOKEN?.trim();
    if (staticToken && !isProd) {
      return staticToken;
    }

    return null;
  }

  private async postComplete<T extends Record<string, unknown>>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<VeriAgentCompleteResult<T> | RemoteTransportError> {
    const base = this.baseUrl();
    if (!base) {
      return { kind: 'transport', message: 'remote_url_unset' };
    }

    const tenant = body.tenant as { companyId?: number } | undefined;
    const token = this.serviceToken(tenant?.companyId);
    if (!token) {
      this.logger.warn(
        'VeriAgent remote enabled but no VERA_AGENT_SERVICE_TOKEN / JWT_SECRET',
      );
      return { kind: 'transport', message: 'missing_service_token' };
    }

    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.status >= 500 || res.status === 429) {
        return {
          kind: 'transport',
          status: res.status,
          message: `remote_http_${res.status}`,
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          kind: 'transport',
          status: res.status,
          message: `remote_auth_${res.status}`,
        };
      }

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        return {
          kind: 'transport',
          status: res.status,
          message: 'remote_invalid_json',
        };
      }

      if (
        json &&
        typeof json === 'object' &&
        'ok' in json &&
        typeof (json as { ok: unknown }).ok === 'boolean'
      ) {
        return json as VeriAgentCompleteResult<T>;
      }

      return {
        kind: 'transport',
        status: res.status,
        message: 'remote_unexpected_shape',
      };
    } catch (e) {
      return {
        kind: 'transport',
        message: e instanceof Error ? e.message : 'fetch_failed',
      };
    }
  }
}

export function isRemoteTransportError(
  v: unknown,
): v is RemoteTransportError {
  return (
    !!v &&
    typeof v === 'object' &&
    (v as RemoteTransportError).kind === 'transport'
  );
}
