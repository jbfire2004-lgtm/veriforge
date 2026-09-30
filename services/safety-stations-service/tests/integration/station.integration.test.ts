import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const workerId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const equipmentId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const jhaId = '11111111-1111-1111-1111-111111111111';
const hardwareId = `HW-${Date.now()}`;

const workerToken = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

const supervisorToken = jwt.sign(
  { sub: 'sup-1', user_id: 'sup-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('safety stations integration', () => {
  let stationId: string;
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
    await prisma.stationOfflineSync.deleteMany({}).catch(() => undefined);
    await prisma.musterCheckin.deleteMany({}).catch(() => undefined);
    await prisma.safetyStationAccessLog.deleteMany({}).catch(() => undefined);
    await prisma.safetyStation.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /station/register registers station', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/station/register')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        station_type: 'gate',
        hardware_id: hardwareId,
        firmware_version: '1.0.0',
        location: 'North Gate',
      });

    expect(res.status).toBe(201);
    stationId = res.body.id;
    expect(res.body.status).toBe('online');
  });

  it('POST /station/heartbeat updates heartbeat', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/heartbeat')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        firmware_version: '1.0.1',
      });

    expect(res.status).toBe(200);
    expect(res.body.lastHeartbeat).toBeTruthy();
    expect(res.body.heartbeatStale).toBe(false);
  });

  it('POST /station/validate/worker grants compliant worker', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/validate/worker')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        worker_id: workerId,
        required_jha_ids: [jhaId],
        worker_context: {
          role: 'electrician',
          safetyScore: 90,
          signedJhaIds: [jhaId],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.granted).toBe(true);
  });

  it('POST /station/validate/equipment denies locked equipment', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/validate/equipment')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        equipment_id: equipmentId,
        equipment_context: {
          activeLockout: true,
          status: 'locked_out',
        },
      });

    expect(res.status).toBe(403);
    expect(res.body.gates).toContain('equipment_lockout');
  });

  it('POST /station/muster/checkin records check-in', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/muster/checkin')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        worker_id: workerId,
        muster_point: 'Assembly Area B',
      });

    expect(res.status).toBe(201);
    expect(res.body.musterPoint).toBe('Assembly Area B');
  });

  it('POST /station/emergency/mode activates lockdown', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/emergency/mode')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        mode: 'lockdown',
      });

    expect(res.status).toBe(200);
    expect(res.body.station.emergencyMode).toBe('lockdown');
  });

  it('POST /station/validate/worker denies during lockdown', async () => {
    if (!dbAvailable || !stationId) return;

    const res = await request(app)
      .post('/station/validate/worker')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        worker_id: workerId,
        worker_context: { signedJhaIds: [jhaId] },
      });

    expect(res.status).toBe(403);
    expect(res.body.gates).toContain('emergency_lockdown');
  });

  it('POST /station/offline/sync replays queued actions', async () => {
    if (!dbAvailable || !stationId) return;

    await request(app)
      .post('/station/emergency/mode')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        mode: 'all_clear',
      });

    const res = await request(app)
      .post('/station/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        station_id: stationId,
        actions: [
          {
            clientSyncId: `sync-${Date.now()}`,
            action: 'heartbeat',
            payload: { firmware_version: '1.0.2' },
          },
          {
            clientSyncId: `sync-muster-${Date.now()}`,
            action: 'muster_checkin',
            payload: {
              worker_id: workerId,
              muster_point: 'Offline Assembly',
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(2);
  });
});
