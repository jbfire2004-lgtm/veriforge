import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';
import { sdsRepository } from '../../src/models/sds.repository';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const workerId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const zoneId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const token = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('sds integration', () => {
  let sdsId: string;
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
    await prisma.zoneSdsRule.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.sdsAcknowledgment.deleteMany({}).catch(() => undefined);
    await prisma.sdsDocument.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /sds creates document with extracted hazards and controls', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/sds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        product_name: 'Acetone',
        manufacturer: 'ChemCo',
        cas_number: '67-64-1',
        whmis_classification: 'Flammable liquid Category 2',
        ppe_requirements: ['safety glasses', 'respirator'],
        first_aid: { eye: 'Flush with water 15 minutes' },
        handling_storage: { ventilation: 'Use local exhaust', storage: 'Cool dry place' },
        expiry_date: '2027-12-31T00:00:00.000Z',
        file_path: '/files/acetone-sds.pdf',
        zone_id: zoneId,
        required_for_zone: true,
      });

    expect(res.status).toBe(201);
    sdsId = res.body.id;
    expect(res.body.extractedHazards.length).toBeGreaterThan(0);
    expect(res.body.extractedControls.length).toBeGreaterThan(0);
    expect(res.body.expired).toBe(false);
  });

  it('GET /sds/:id returns document', async () => {
    if (!dbAvailable || !sdsId) return;

    const res = await request(app)
      .get(`/sds/${sdsId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.productName).toBe('Acetone');
  });

  it('POST /sds/:id/acknowledge records worker acknowledgment', async () => {
    if (!dbAvailable || !sdsId) return;

    const res = await request(app)
      .post(`/sds/${sdsId}/acknowledge`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
      });

    expect(res.status).toBe(201);
    expect(res.body.workerId).toBe(workerId);
  });

  it('GET /sds/worker/:id returns zone compliance summary', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/sds/worker/${workerId}`)
      .query({ company_id: companyId, zone_id: zoneId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.compliant).toBe(true);
    expect(res.body.acknowledgedCount).toBeGreaterThan(0);
    expect(res.body.documents.length).toBeGreaterThan(0);
  });

  it('POST /sds/:id/acknowledge rejects expired SDS', async () => {
    if (!dbAvailable) return;

    const expired = await sdsRepository.createDocument({
      companyId,
      productName: 'Expired Chemical',
      expiryDate: new Date('2020-01-01'),
    });

    const res = await request(app)
      .post(`/sds/${expired.id}/acknowledge`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
      });

    expect(res.status).toBe(400);
  });
});
