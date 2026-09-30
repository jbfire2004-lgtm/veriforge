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
  { sub: userId, user_id: userId, company_id: companyId, roles: ['company_admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('company-safety integration', () => {
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
    await prisma.companySafetyProfileVersion.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyZoneTemplate.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyEquipmentRule.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyEmergencyPlan.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companySdsLibrary.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyPolicy.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyTrainingMatrix.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyControlLibrary.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companyHazardLibrary.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.companySafetyProfile.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /company/safety/profile creates profile', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        corporate_risk_level: 'high',
        corporate_ppe_standards: [{ item: 'hard_hat', required: true }],
        publish: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.corporateRiskLevel).toBe('high');
    expect(res.body.status).toBe('published');
  });

  it('POST /company/safety/hazards adds hazard with SIF scoring', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/hazards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        title: 'Fall from height',
        severity: 4,
        likelihood: 4,
        required_controls: ['guardrails'],
      });

    expect(res.status).toBe(201);
    expect(res.body.sifPotential).toBe(true);
  });

  it('POST /company/safety/controls adds control', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/controls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        title: 'Guardrails',
        control_strength: 4,
        verification_steps: ['Inspect anchor points'],
      });

    expect(res.status).toBe(201);
    expect(res.body.controlStrength).toBe(4);
  });

  it('POST /company/safety/training upserts matrix row', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/training')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        role: 'worker',
        required_courses: [{ code: 'FALL_PROT', name: 'Fall Protection' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('worker');
  });

  it('POST /company/safety/policy creates policy', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/policy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        policy_type: 'ppe',
        title: 'Corporate PPE Policy',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Corporate PPE Policy');
  });

  it('POST /company/safety/sds creates SDS entry', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/sds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        product_name: 'Acetone',
        cas_number: '67-64-1',
        whmis_classification: 'B2',
      });

    expect(res.status).toBe(201);
    expect(res.body.productName).toBe('Acetone');
  });

  it('POST /company/safety/emergency creates plan', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/emergency')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        plan_type: 'fire',
        title: 'Fire evacuation plan',
      });

    expect(res.status).toBe(201);
    expect(res.body.planType).toBe('fire');
  });

  it('POST /company/safety/equipment upserts rule', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/equipment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        rule_key: 'aerial_lift',
        required_inspections: ['daily_pre_use'],
      });

    expect(res.status).toBe(201);
    expect(res.body.ruleKey).toBe('aerial_lift');
  });

  it('POST /company/safety/zones upserts template', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/company/safety/zones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        template_code: 'CONFINED_SPACE',
        zone_type: 'restricted',
        title: 'Confined space entry',
        requires_jha: true,
        high_risk: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.requiresJha).toBe(true);
  });

  it('GET /company/safety/:company_id returns full bundle', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/company/safety/${companyId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.companyId).toBe(companyId);
    expect(res.body.profile).not.toBeNull();
    expect(res.body.counts.hazards).toBeGreaterThan(0);
    expect(res.body.counts.controls).toBeGreaterThan(0);
    expect(res.body.counts.trainingRoles).toBeGreaterThan(0);
  });
});
