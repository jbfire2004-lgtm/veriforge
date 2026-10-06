import { VeriAgentRedactionService } from './veri-agent-redaction.service';

describe('VeriAgentRedactionService', () => {
  const svc = new VeriAgentRedactionService();

  it('redacts email and phone', () => {
    const { text, ok } = svc.redactText(
      'Call Jane at 555-123-4567 or jane@acme.com about site 12',
    );
    expect(text).toContain('[REDACTED]');
    expect(text).not.toContain('jane@acme.com');
    expect(text).not.toContain('555-123-4567');
    expect(ok).toBe(true);
  });

  it('strips imageBase64 from JSON context', () => {
    const out = svc.redactJsonContext({
      caption: 'Missing hard hat',
      imageBase64: 'AAAA'.repeat(2000),
      companyId: 9,
    }) as Record<string, unknown>;
    expect(out.imageBase64).toBe('[REDACTED]');
    expect(out.companyId).toBe(9);
    expect(String(out.caption)).toContain('Missing hard hat');
  });

  it('hashes stably for audit', () => {
    const a = svc.hashForAudit('hello');
    const b = svc.hashForAudit('hello');
    expect(a).toBe(b);
    expect(a).toHaveLength(32);
  });
});
