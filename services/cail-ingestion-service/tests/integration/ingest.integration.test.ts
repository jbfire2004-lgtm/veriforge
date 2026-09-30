import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';
import { registerEventConsumers } from '../../src/consumers';
import { DomainEvent } from '../../src/config/domain-events';

const prisma = new PrismaClient();
registerEventConsumers();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const token = jwt.sign(
  { sub: 'cail-1', user_id: 'cail-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('cail ingestion integration', () => {
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
    await prisma.cailTrainingData.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/ingest/manual stores training data', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/ingest/manual')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        model_id: 'deterministic_rules_v1',
        version: 1,
        dataset_reference: 'test-manual-batch',
        records: [
          {
            module: 'capa',
            id: 'capa-100',
            payload: { severity: 50, status: 'open' },
            labels: { outcome: 'pending' },
          },
          {
            module: 'jha',
            id: 'jha-200',
            payload: { severity: 90, sifPotential: true, status: 'submitted' },
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.stored).toBe(2);
    expect(res.body.modelId).toBe('deterministic_rules_v1');
  });

  it('POST /cail/ingest/events ingests domain event', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/ingest/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        name: DomainEvent.INCIDENT_REPORTED,
        occurred_at: new Date().toISOString(),
        entity_type: 'incident',
        entity_id: 'inc-1',
        data: { severity: 70, sifPotential: false },
      });

    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });

  it('GET /cail/ingest/stats returns aggregates', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get('/cail/ingest/stats')
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalRecords).toBeGreaterThan(0);
    expect(res.body.byModel.length).toBeGreaterThan(0);
    expect(res.body.eventsProcessed[DomainEvent.INCIDENT_REPORTED]).toBeGreaterThan(0);
  });
});
