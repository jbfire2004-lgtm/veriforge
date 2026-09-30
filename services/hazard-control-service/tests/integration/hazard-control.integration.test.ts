import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const userId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

const token = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('hazard-control integration', () => {
  let hazardId: string;
  let controlId: string;
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
    await prisma.hazardControl.deleteMany({}).catch(() => undefined);
    await prisma.hazard.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.control.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /hazard creates hazard with energy wheel', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/hazard')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        hazard_type: 'physical',
        category: 'fall',
        energy_type: 'gravity',
        severity: 4,
        likelihood: 3,
        title: 'Overhead fall hazard',
        description: 'Workers at height near open edge',
      });

    expect(res.status).toBe(201);
    expect(res.body.energyWheel).toBeDefined();
    hazardId = res.body.id;
  });

  it('POST /control creates control', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/control')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        control_type: 'engineering',
        hierarchy_level: 1,
        control_strength: 4,
        title: 'Guardrails and fall arrest',
        verification_steps: ['Inspect anchor points'],
      });

    expect(res.status).toBe(201);
    controlId = res.body.id;
  });

  it('POST /hazard/map-controls links hazard and control', async () => {
    if (!dbAvailable || !hazardId || !controlId) return;

    const res = await request(app)
      .post('/hazard/map-controls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        hazard_id: hazardId,
        control_ids: [controlId],
      });

    expect(res.status).toBe(201);
    expect(res.body.linked).toBe(1);
  });

  it('POST /hazard/sif-heca scores hazard', async () => {
    if (!dbAvailable || !hazardId) return;

    const res = await request(app)
      .post('/hazard/sif-heca')
      .set('Authorization', `Bearer ${token}`)
      .send({ company_id: companyId, hazard_id: hazardId });

    expect(res.status).toBe(200);
    expect(res.body.sifPotential).toBeDefined();
  });

  it('GET /hazard/:id and GET /control/:id', async () => {
    if (!dbAvailable || !hazardId || !controlId) return;

    const hazard = await request(app)
      .get(`/hazard/${hazardId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(hazard.status).toBe(200);
    expect(hazard.body.controls.length).toBeGreaterThan(0);

    const control = await request(app)
      .get(`/control/${controlId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(control.status).toBe(200);
  });
});
