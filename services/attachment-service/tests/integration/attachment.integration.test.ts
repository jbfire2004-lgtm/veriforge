import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = '11111111-1111-1111-1111-111111111111';
const userId = '22222222-2222-2222-2222-222222222222';
const recordId = '33333333-3333-3333-3333-333333333333';

const token = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

// Minimal valid JPEG
const jpegBuffer = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAUGB//EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64',
);

describe('attachment integration', () => {
  let attachmentId: string;
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
    await prisma.attachment.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('uploads file and returns metadata with URLs', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/attachment/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('company_id', companyId)
      .field('module_type', 'pm-hazard')
      .field('module_record_id', recordId)
      .attach('file', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.downloadUrl).toBeDefined();
    attachmentId = res.body.id;
  });

  it('GET attachment by id', async () => {
    if (!dbAvailable || !attachmentId) return;

    const res = await request(app)
      .get(`/attachment/${attachmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.fileType).toBe('image/jpeg');
  });

  it('GET thumbnail', async () => {
    if (!dbAvailable || !attachmentId) return;

    const res = await request(app)
      .get(`/attachment/${attachmentId}/thumbnail`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image');
  });
});
