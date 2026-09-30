import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('audit validators', () => {
  it('rejects non-object event_data', async () => {
    const res = await request(app)
      .post('/audit/event')
      .set('x-audit-service-key', 'test-audit-ingest-key')
      .send({
        company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        module: 'auth',
        event_type: 'user.login',
        actor_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        event_data: 'not-an-object',
      });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/audit/event')
      .set('x-audit-service-key', 'test-audit-ingest-key')
      .send({ company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
    expect(res.status).toBe(400);
  });
});
