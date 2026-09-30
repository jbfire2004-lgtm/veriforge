import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const otherCompanyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const userId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const namespace = 'vera.services';
const key = 'feature.flags';

const workerToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

const adminToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('config integration', () => {
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      console.warn('DB unavailable — skipping integration tests');
    }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    const ns = await prisma.configNamespace.findUnique({ where: { name: namespace } });
    if (ns) {
      await prisma.configEntry.deleteMany({ where: { namespaceId: ns.id } }).catch(() => undefined);
      await prisma.configNamespace.delete({ where: { id: ns.id } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it('PUT /config upserts global entry (admin)', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .put(`/config/${namespace}/${key}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        value: { offlineSync: true, maxBatchSize: 100 },
        namespace_description: 'Vera microservice configuration',
      });

    expect(res.status).toBe(200);
    expect(res.body.namespace).toBe(namespace);
    expect(res.body.key).toBe(key);
    expect(res.body.companyId).toBeNull();
    expect(res.body.version).toBe(1);
    expect(res.body.value).toEqual({ offlineSync: true, maxBatchSize: 100 });
  });

  it('GET /config/:namespace/:key returns global entry', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/config/${namespace}/${key}`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(1);
  });

  it('PUT /config upserts company override and increments version', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .put(`/config/${namespace}/${key}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: companyId,
        value: { offlineSync: false, maxBatchSize: 50 },
      });

    expect(res.status).toBe(200);
    expect(res.body.companyId).toBe(companyId);
    expect(res.body.version).toBe(1);
  });

  it('GET /config/:namespace lists global and company entries for worker', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/config/${namespace}`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.entries.length).toBe(2);
  });

  it('rejects worker upsert without admin role', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .put(`/config/${namespace}/limits.rate`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ value: { rpm: 1000 } });

    expect(res.status).toBe(403);
  });

  it('DELETE /config soft-deletes entry', async () => {
    if (!dbAvailable) return;

    const del = await request(app)
      .delete(`/config/${namespace}/${key}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/config/${namespace}/${key}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(get.status).toBe(404);
  });

  it('admin can upsert for another company', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .put(`/config/${namespace}/service.urls`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: otherCompanyId,
        value: { auth: 'http://auth:3001' },
      });

    expect(res.status).toBe(200);
    expect(res.body.companyId).toBe(otherCompanyId);

    await request(app)
      .delete(`/config/${namespace}/service.urls`)
      .query({ company_id: otherCompanyId })
      .set('Authorization', `Bearer ${adminToken}`);
  });
});
