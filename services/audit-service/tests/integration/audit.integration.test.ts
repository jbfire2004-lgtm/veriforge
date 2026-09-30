import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const actorId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const userId = actorId;

const token = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('audit integration', () => {
  let eventId: string;
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
    await prisma.auditEvent.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('ingests event via service key', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/audit/event')
      .set('x-audit-service-key', process.env.AUDIT_SERVICE_KEY!)
      .send({
        company_id: companyId,
        module: 'rbac',
        event_type: 'role.assigned',
        actor_id: actorId,
        event_data: { role_id: '11111111-1111-1111-1111-111111111111', target_user_id: userId },
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    eventId = res.body.id;
  });

  it('GET event by id', async () => {
    if (!dbAvailable || !eventId) return;

    const res = await request(app)
      .get(`/audit/event/${eventId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.eventType).toBe('role.assigned');
    expect(res.body.eventData.role_id).toBeDefined();
  });

  it('GET events with filters', async () => {
    if (!dbAvailable || !eventId) return;

    const res = await request(app)
      .get('/audit/events')
      .query({
        company_id: companyId,
        module: 'rbac',
        event_type: 'role.assigned',
        actor_id: actorId,
        limit: 10,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.events.length).toBeGreaterThan(0);
  });

  it('denies cross-company read', async () => {
    if (!dbAvailable) return;

    const otherCompany = '99999999-9999-9999-9999-999999999999';
    const res = await request(app)
      .get('/audit/events')
      .query({ company_id: otherCompany })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
