import {
  VeriAgentRemoteClient,
  isRemoteTransportError,
} from './veri-agent-remote.client';
import { VeriAgentService } from './veri-agent.service';
import { VeriAgentPolicyService } from './veri-agent-policy.service';
import { VeriAgentRedactionService } from './veri-agent-redaction.service';
import type { AuditLogService } from '../audit/audit-log.service';

describe('VeriAgentService dual-path', () => {
  const originalEnv = { ...process.env };
  let audit: { logAudit: jest.Mock };
  let policy: VeriAgentPolicyService;
  let redaction: VeriAgentRedactionService;
  let remote: VeriAgentRemoteClient;
  let svc: VeriAgentService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.VERA_AGENT_REMOTE_URL;
    delete process.env.VERA_AGENT_REMOTE_STRICT;
    process.env.VERA_LLM_ENDPOINT = 'https://llm.example/v1/chat/completions';
    process.env.VERA_LLM_API_KEY = 'test-key';
    process.env.VERA_AGENT_LLM_ENABLED = 'true';

    audit = { logAudit: jest.fn().mockResolvedValue(undefined) };
    policy = new VeriAgentPolicyService();
    redaction = new VeriAgentRedactionService();
    remote = new VeriAgentRemoteClient();
    svc = new VeriAgentService(
      policy,
      redaction,
      audit as unknown as AuditLogService,
      remote,
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('with URL unset, never calls remote VeriAgent fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ok":true,"score":1}' } }],
      }),
    } as Response);

    const result = await svc.completeJson({
      purpose: 'vsi_copilot',
      tenant: { companyId: 12 },
      messages: [
        { role: 'system', content: 'json' },
        { role: 'user', content: 'hello' },
      ],
    });

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const url = String(fetchSpy.mock.calls[0]?.[0] ?? '');
    expect(url).toContain('llm.example');
    expect(url).not.toContain('/v1/invoke');
  });

  it('with URL set and 200, uses remote result', async () => {
    process.env.VERA_AGENT_REMOTE_URL = 'http://veri-agent:3040';
    process.env.JWT_SECRET = 'shared-secret';
    process.env.JWT_ISSUER = 'veriforge';
    process.env.JWT_AUDIENCE_VERI_AGENT = 'veri-agent';

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: { from: 'remote' },
        meta: {
          purpose: 'vsi_copilot',
          companyId: 12,
          redacted: true,
          imageSent: false,
          model: 'remote-model',
        },
      }),
    } as Response);

    const result = await svc.completeJson({
      purpose: 'vsi_copilot',
      tenant: { companyId: 12 },
      messages: [{ role: 'user', content: 'x' }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ from: 'remote' });
      expect(result.meta.model).toBe('remote-model');
    }
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('/v1/invoke');
  });

  it('with URL set, 503, non-strict: falls back in-process', async () => {
    process.env.VERA_AGENT_REMOTE_URL = 'http://veri-agent:3040';
    process.env.JWT_SECRET = 'shared-secret';

    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/v1/invoke')) {
          return { ok: false, status: 503, json: async () => ({}) } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: '{"fallback":true}' } }],
          }),
        } as Response;
      });

    const result = await svc.completeJson({
      purpose: 'vsi_copilot',
      tenant: { companyId: 12 },
      messages: [{ role: 'user', content: 'x' }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ fallback: true });
    }
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('isRemoteTransportError helper', () => {
    expect(isRemoteTransportError({ kind: 'transport', message: 'x' })).toBe(
      true,
    );
    expect(isRemoteTransportError({ ok: false, reason: 'provider_error' })).toBe(
      false,
    );
  });

  it('embed uses provider embeddings endpoint via VeriAgent (no remote URL)', async () => {
    delete process.env.VERA_AGENT_REMOTE_URL;
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.VERA_EMBEDDING_ENDPOINT =
      'https://api.openai.com/v1/embeddings';

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: [0.5, 0.25] }],
      }),
    } as Response);

    const result = await svc.embed({
      purpose: 'lesson_embedding',
      tenant: { companyId: 12 },
      text: 'Scaffold midrail missing near bay 3',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.embedding).toEqual([0.5, 0.25]);
    }
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('/embeddings');
  });
});
