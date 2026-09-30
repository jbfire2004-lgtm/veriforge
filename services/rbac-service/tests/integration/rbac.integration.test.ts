import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const userId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const adminToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('rbac integration', () => {
  let roleId: string;
  let permissionId: string;
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
    await prisma.userRoleAssignment.deleteMany({ where: { userId } }).catch(() => undefined);
    await prisma.rolePermission.deleteMany({}).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('creates role and permission', async () => {
    if (!dbAvailable) return;

    const roleRes = await request(app)
      .post('/rbac/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ company_id: companyId, name: 'safety_manager' });
    expect(roleRes.status).toBe(201);
    roleId = roleRes.body.id;

    const permRes = await request(app)
      .post('/rbac/permission')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: companyId,
        name: 'Read hazards',
        resource: 'hazard',
        action: 'read',
      });
    expect(permRes.status).toBe(201);
    permissionId = permRes.body.id;
  });

  it('assigns permission to role and role to user', async () => {
    if (!dbAvailable || !roleId || !permissionId) return;

    const link = await request(app)
      .post(`/rbac/role/${roleId}/assign-permission`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ company_id: companyId, permission_id: permissionId });
    expect(link.status).toBe(201);

    const assign = await request(app)
      .post(`/rbac/user/${userId}/assign-role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ company_id: companyId, role_id: roleId });
    expect(assign.status).toBe(201);
  });

  it('GET user permissions', async () => {
    if (!dbAvailable || !roleId) return;
    const res = await request(app)
      .get(`/rbac/user/${userId}/permissions`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.permissions.length).toBeGreaterThan(0);
  });

  it('POST evaluate allow/deny', async () => {
    if (!dbAvailable || !roleId) return;

    const allow = await request(app)
      .post('/rbac/evaluate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        user_id: userId,
        company_id: companyId,
        resource: 'hazard',
        action: 'read',
      });
    expect(allow.status).toBe(200);
    expect(allow.body.allow).toBe(true);

    const deny = await request(app)
      .post('/rbac/evaluate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        user_id: userId,
        company_id: companyId,
        resource: 'hazard',
        action: 'delete',
      });
    expect(deny.status).toBe(200);
    expect(deny.body.allow).toBe(false);
    expect(deny.body.reason).toBeTruthy();
  });
});
