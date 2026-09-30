import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('api gateway', () => {
  it('GET /health/live', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('api-gateway');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown/path');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('returns 401 for protected route without token', async () => {
    const res = await request(app).get('/rbac/role');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});
